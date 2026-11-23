/*
 * app.js: estado, validación, eventos y arranque. Se carga de último.
 * Usa cargarVisitas/guardarVisitas (storage.js), obtenerCompas (api.js)
 * y las funciones de pintado de ui.js.
 * Uso de IA (Claude, de Anthropic): apoyo para estructurar la validación,
 * la delegación de eventos y el resumen del pasaporte.
 */
"use strict";

const PROVINCIAS = ["San José", "Alajuela", "Cartago", "Heredia", "Guanacaste", "Puntarenas", "Limón"];

const form = document.querySelector("#form-visita");
const selectCompa = document.querySelector("#compa");
const avisoCompas = document.querySelector("#aviso-compas");
const filtro = document.querySelector("#filtro");
const lista = document.querySelector("#lista-visitas");
const listaVacia = document.querySelector("#lista-vacia");

// ---------- Estado ----------

let visitas = cargarVisitas();

function crearId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Fecha local de hoy como "AAAA-MM-DD", el mismo formato que da <input type="date">.
function hoyISO() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    return `${hoy.getFullYear()}-${mes}-${dia}`;
}

function calcularResumen() {
    const total = visitas.length;
    const suma = visitas.reduce((acumulado, visita) => acumulado + visita.calificacion, 0);
    return {
        total,
        promedio: total ? suma / total : 0,
        selladas: new Set(visitas.map((visita) => visita.provincia)),
    };
}

function pintar() {
    const provincia = filtro.value;
    const visibles = provincia ? visitas.filter((visita) => visita.provincia === provincia) : visitas;
    const textoVacio = visitas.length === 0
        ? "Todavía no hay visitas. Registrá la primera soda para estrenar el pasaporte."
        : `No hay visitas en ${provincia} todavía.`;
    pintarVisitas(lista, listaVacia, visibles, textoVacio);
    pintarResumen(calcularResumen(), PROVINCIAS);
}

function guardarYPintar() {
    guardarVisitas(visitas);
    pintar();
}

// ---------- Validación ----------

// Cada regla recibe el FormData y devuelve el mensaje de error, o "" si está bien.
const reglas = {
    nombre(datos) {
        const nombre = datos.get("nombre").trim();
        if (nombre === "") {
            return "Escribí el nombre de la soda.";
        }
        if (nombre.length < 3 || nombre.length > 40) {
            return "El nombre debe tener entre 3 y 40 caracteres.";
        }
        return "";
    },
    provincia(datos) {
        return datos.get("provincia") ? "" : "Elegí una provincia.";
    },
    plato(datos) {
        const plato = datos.get("plato").trim();
        if (plato === "") {
            return "Escribí qué plato pidió.";
        }
        return plato.length < 3 ? "El plato debe tener al menos 3 caracteres." : "";
    },
    calificacion(datos) {
        const nota = Number(datos.get("calificacion"));
        return Number.isInteger(nota) && nota >= 1 && nota <= 5 ? "" : "Elegí una calificación de 1 a 5 estrellas.";
    },
    fecha(datos) {
        const fecha = datos.get("fecha");
        if (!fecha) {
            return "Indicá la fecha de la visita.";
        }
        // Las fechas AAAA-MM-DD se pueden comparar como texto.
        return fecha > hoyISO() ? "La fecha no puede ser futura: Trueno es lento, pero no viaja en el tiempo." : "";
    },
};

function validarCampo(nombre, datos) {
    const mensaje = reglas[nombre](datos);
    mostrarError(nombre, mensaje);
    return mensaje === "";
}

function validarFormulario(datos) {
    // map (y no every) para que se muestren todos los errores, no solo el primero.
    return Object.keys(reglas).map((nombre) => validarCampo(nombre, datos)).every(Boolean);
}

// ---------- Eventos ----------

// Si un campo ya muestra error, se revalida mientras se corrige para que el mensaje desaparezca.
function revalidarSiTieneError(evento) {
    const nombre = evento.target.name;
    if (nombre in reglas && document.querySelector(`#error-${nombre}`).textContent !== "") {
        validarCampo(nombre, new FormData(form));
    }
}

form.addEventListener("input", revalidarSiTieneError);
form.addEventListener("change", revalidarSiTieneError);

form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const datos = new FormData(form);
    if (!validarFormulario(datos)) {
        form.querySelector('[aria-invalid="true"]').focus();
        return;
    }

    visitas.unshift({
        id: crearId(),
        nombre: datos.get("nombre").trim(),
        provincia: datos.get("provincia"),
        plato: datos.get("plato").trim(),
        calificacion: Number(datos.get("calificacion")),
        fecha: datos.get("fecha"),
        compa: datos.get("compa") || "Fui solo",
        volveria: datos.has("volveria"),
        favorita: false,
    });
    guardarYPintar();
    form.reset();
    form.elements.nombre.focus();
});

// Delegación: un solo listener para los botones de todas las tarjetas.
lista.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button[data-accion]");
    if (!boton) {
        return;
    }
    const id = boton.closest(".tarjeta").dataset.id;
    const visita = visitas.find((item) => item.id === id);

    if (boton.dataset.accion === "favorita") {
        visita.favorita = !visita.favorita;
        guardarYPintar();
        lista.querySelector(`[data-id="${id}"] [data-accion="favorita"]`).focus();
    } else if (boton.dataset.accion === "borrar") {
        if (confirm(`¿Borrar la visita a ${visita.nombre}? Esta acción no se puede deshacer.`)) {
            visitas = visitas.filter((item) => item.id !== id);
            guardarYPintar();
        }
    }
});

filtro.addEventListener("change", pintar);

// ---------- Arranque ----------

async function cargarCompas() {
    try {
        llenarCompas(selectCompa, await obtenerCompas());
    } catch (error) {
        console.warn("Falló la carga de compas:", error);
        llenarCompas(selectCompa, []);
        mostrarAviso(avisoCompas, "No se pudieron cargar los compas; podés registrar la visita como 'Fui solo'.");
    }
}

form.elements.fecha.max = hoyISO();
pintar();
cargarCompas();
