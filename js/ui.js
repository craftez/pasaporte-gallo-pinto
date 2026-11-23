/*
 * ui.js: funciones que crean y actualizan elementos del DOM.
 * No guardan estado: reciben datos y los pintan. Todo con createElement y
 * textContent; nunca innerHTML con lo que escribió el usuario.
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

function estrellas(calificacion) {
    return "★".repeat(calificacion) + "☆".repeat(5 - calificacion);
}

function agregarDato(lista, termino, valor, claseValor) {
    lista.append(crearElemento("dt", "", termino), crearElemento("dd", claseValor, valor));
}

function crearTarjeta(visita) {
    const tarjeta = crearElemento("li", "tarjeta");
    tarjeta.dataset.id = visita.id;
    tarjeta.classList.toggle("tarjeta--favorita", visita.favorita);

    const datos = crearElemento("dl", "tarjeta__datos");
    agregarDato(datos, "Plato", visita.plato);
    agregarDato(datos, "Nota", `${estrellas(visita.calificacion)} ${visita.calificacion}/5`, "tarjeta__estrellas");
    agregarDato(datos, "Fecha", formatearFecha(visita.fecha));
    agregarDato(datos, "Compa", visita.compa);
    agregarDato(datos, "¿Volvería?", visita.volveria ? "Sí, sin pensarlo" : "No");

    const botonFavorita = crearElemento("button", "tarjeta__boton", visita.favorita ? "★ Favorita" : "☆ Favorita");
    botonFavorita.type = "button";
    botonFavorita.dataset.accion = "favorita";
    botonFavorita.setAttribute("aria-pressed", String(visita.favorita));

    const botonBorrar = crearElemento("button", "tarjeta__boton tarjeta__boton--borrar", "Borrar");
    botonBorrar.type = "button";
    botonBorrar.dataset.accion = "borrar";

    const acciones = crearElemento("div", "tarjeta__acciones");
    acciones.append(botonFavorita, botonBorrar);

    tarjeta.append(
        crearElemento("span", "tarjeta__provincia", visita.provincia),
        crearElemento("h4", "", visita.nombre),
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

function pintarResumen(resumen, provincias) {
    document.querySelector("#total-visitas").textContent = resumen.total;
    document.querySelector("#promedio").textContent = resumen.total ? resumen.promedio.toFixed(1) : "—";
    document.querySelector("#provincias-selladas").textContent = `${resumen.selladas.size} de ${provincias.length}`;
    document.querySelector("#pasaporte-completo").hidden = resumen.selladas.size < provincias.length;

    const sellos = provincias.map((provincia) => {
        const puesto = resumen.selladas.has(provincia);
        const sello = crearElemento("li", puesto ? "sello sello--puesto" : "sello", puesto ? `✓ ${provincia}` : provincia);
        return sello;
    });
    document.querySelector("#sellos").replaceChildren(...sellos);
}
