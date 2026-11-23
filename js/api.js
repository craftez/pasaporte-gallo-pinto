/*
 * api.js: el único archivo que usa fetch.
 * Uso de IA (Claude, de Anthropic): apoyo para revisar respuesta.ok.
 */
"use strict";

const URL_COMPAS = "https://jsonplaceholder.typicode.com/users";

// Devuelve los nombres de los usuarios de JSONPlaceholder.
// Lanza un error si no hay red o si el servidor no responde 2xx.
async function obtenerCompas() {
    const respuesta = await fetch(URL_COMPAS);
    if (!respuesta.ok) {
        throw new Error(`GET ${URL_COMPAS} respondió ${respuesta.status}`);
    }
    const usuarios = await respuesta.json();
    return usuarios.map((usuario) => usuario.name);
}
