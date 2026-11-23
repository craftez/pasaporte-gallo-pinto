/*
 * ui.js: funciones que crean y actualizan elementos del DOM.
 * No guardan estado: reciben datos y los pintan. Todo se crea con
 * createElement y textContent, así el texto del usuario nunca se lee como HTML.
 * Uso de IA (Claude, de Anthropic): apoyo para organizar las funciones de pintado.
 */
"use strict";

function crearElemento(etiqueta, clase, texto) {
    const elemento = document.createElement(etiqueta);
    if (clase) {
        elemento.className = clase;
    }
    if (texto !== undefined) {
        elemento.textContent = texto;
    }
    return elemento;
}

// ---------- Compas de viaje ----------

function llenarCompas(select, nombres) {
    const opciones = ["Fui solo", ...nombres].map((nombre) => {
        const opcion = crearElemento("option", "", nombre);
        opcion.value = nombre;
        return opcion;
    });
    select.replaceChildren(...opciones);
    select.disabled = false;
}

function mostrarAviso(elemento, texto) {
    elemento.textContent = texto;
    elemento.hidden = false;
}

// ---------- Errores de validación ----------

// Pone (o quita, si mensaje es "") el error junto al campo.
function mostrarError(nombreCampo, mensaje) {
    const error = document.querySelector(`#error-${nombreCampo}`);
    const campo = error.closest(".campo");
    error.textContent = mensaje;
    campo.classList.toggle("campo--invalido", mensaje !== "");
    campo.querySelectorAll("input, select").forEach((control) => {
        if (mensaje) {
            control.setAttribute("aria-invalid", "true");
        } else {
            control.removeAttribute("aria-invalid");
        }
    });
}

// ---------- Tarjetas ----------

function formatearFecha(fechaISO) {
    const [anio, mes, dia] = fechaISO.split("-").map(Number);
    return new Date(anio, mes - 1, dia).toLocaleDateString("es-CR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

// Crea un <svg> que reutiliza un ícono del sprite de index.html.
function crearIcono(nombre, clase) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", clase ? `icono ${clase}` : "icono");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    const uso = document.createElementNS("http://www.w3.org/2000/svg", "use");
    uso.setAttribute("href", `#icono-${nombre}`);
    svg.append(uso);
    return svg;
}

// Cinco estrellas (llenas hasta la nota) y el texto "4/5", que es lo que lee el lector de pantalla.
function crearNota(calificacion) {
    const nota = crearElemento("span", "nota");
    for (let i = 1; i <= 5; i++) {
        nota.append(crearIcono("estrella", i <= calificacion ? "estrella" : "estrella estrella--vacia"));
    }
    nota.append(crearElemento("span", "nota__texto", `${calificacion}/5`));
    return nota;
}

function crearDato(termino, valor, clase) {
    const dato = crearElemento("div", clase ? `dato ${clase}` : "dato");
    const descripcion = crearElemento("dd");
    descripcion.append(valor);
    dato.append(crearElemento("dt", "", termino), descripcion);
    return dato;
}

function crearBoton(texto, accion, clase) {
    const boton = crearElemento("button", `boton ${clase}`);
    boton.type = "button";
    boton.dataset.accion = accion;
    boton.append(texto);
    return boton;
}

function crearTarjeta(visita) {
    const tarjeta = crearElemento("li", "tarjeta");
    tarjeta.dataset.id = visita.id;
    tarjeta.classList.toggle("tarjeta--favorita", visita.favorita);

    const datos = crearElemento("dl", "tarjeta__datos");
    datos.append(
        crearDato("Plato", visita.plato, "dato--ancho"),
        crearDato("Nota", crearNota(visita.calificacion), "dato--ancho"),
        crearDato("Compa de viaje", visita.compa),
        crearDato("¿Volvería?", visita.volveria ? "Sí" : "No"),
    );

    const botonFavorita = crearBoton("Favorita", "favorita", "boton--secundario boton--favorita");
    botonFavorita.prepend(crearIcono("estrella"));
    botonFavorita.setAttribute("aria-pressed", String(visita.favorita));

    const acciones = crearElemento("div", "tarjeta__acciones");
    acciones.append(botonFavorita, crearBoton("Borrar", "borrar", "boton--secundario boton--peligro"));

    tarjeta.append(
        crearElemento("h4", "tarjeta__nombre", visita.nombre),
        crearElemento("p", "tarjeta__meta", `${visita.provincia} · ${formatearFecha(visita.fecha)}`),
        datos,
        acciones,
    );
    return tarjeta;
}

function pintarVisitas(lista, mensajeVacio, visitas, textoVacio) {
    lista.replaceChildren(...visitas.map(crearTarjeta));
    mensajeVacio.textContent = textoVacio;
    mensajeVacio.hidden = visitas.length > 0;
}

// ---------- Resumen del pasaporte ----------

function crearSello(provincia, puesto) {
    const sello = crearElemento("li", puesto ? "sello sello--puesto" : "sello");
    const estado = crearElemento("span", "sello__estado", puesto ? "Sellada" : "Pendiente");
    if (puesto) {
        estado.prepend(crearIcono("check"));
    }
    sello.append(crearElemento("span", "sello__nombre", provincia), estado);
    return sello;
}

function pintarResumen(resumen, provincias) {
    const faltan = provincias.length - resumen.selladas.size;
    document.querySelector("#total-visitas").textContent = resumen.total;
    document.querySelector("#promedio").textContent = resumen.total ? resumen.promedio.toFixed(1) : "—";
    document.querySelector("#provincias-selladas").textContent = `${resumen.selladas.size} de ${provincias.length}`;
    document.querySelector("#pasaporte-completo").hidden = faltan > 0;

    const textoFaltan = document.querySelector("#faltan");
    textoFaltan.hidden = faltan === 0;
    textoFaltan.textContent = faltan === 1
        ? "Falta 1 provincia para completar el pasaporte."
        : `Faltan ${faltan} provincias para completar el pasaporte.`;

    document.querySelector("#sellos").replaceChildren(
        ...provincias.map((provincia) => crearSello(provincia, resumen.selladas.has(provincia))),
    );
}
