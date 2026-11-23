/*
 * storage.js: el único archivo que usa localStorage.
 * Uso de IA (Claude, de Anthropic): apoyo para la lectura segura con try...catch.
 */
"use strict";

const CLAVE_VISITAS = "pasaporteGalloPinto.visitas";

// Devuelve el array guardado o [] si no hay nada, si el JSON está dañado
// o si el navegador bloquea localStorage.
function cargarVisitas() {
    try {
        const texto = localStorage.getItem(CLAVE_VISITAS);
        if (texto === null) {
            return [];
        }
        const datos = JSON.parse(texto);
        return Array.isArray(datos) ? datos : [];
    } catch (error) {
        console.warn("No se pudieron leer las visitas guardadas:", error);
        return [];
    }
}

function guardarVisitas(visitas) {
    try {
        localStorage.setItem(CLAVE_VISITAS, JSON.stringify(visitas));
    } catch (error) {
        console.warn("No se pudieron guardar las visitas:", error);
    }
}
