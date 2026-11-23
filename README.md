# Pasaporte Gallo Pinto · Práctica 12 · Eduardo Zamora

Trueno, el perezoso más rápido de Costa Rica, va a recorrer las siete provincias comiendo en sodas. Esta app web es su pasaporte: registra cada soda visitada (con quién fue, qué comió y qué nota le puso), la muestra como tarjeta y le dice cuántas provincias lleva selladas. Todo queda guardado en el navegador.

- **Sitio publicado:** https://craftez.github.io/pasaporte-gallo-pinto/
- **Repositorio:** https://github.com/craftez/pasaporte-gallo-pinto

## Cómo usar la app

1. Abrí el sitio publicado (o `index.html` con `css/` y `js/` al lado). Necesita internet para cargar los compas de viaje.
2. Llená **Registrar visita**: nombre de la soda, provincia, plato, calificación (1 a 5 ★), fecha, compa de viaje y si volvería. Tocá **Sellar visita**.
3. Si falta algo, el error aparece junto al campo y se quita apenas lo corregís.
4. La visita aparece como tarjeta en **Mi pasaporte**. En cada tarjeta:
   - **Favorita** la marca o desmarca (la tarjeta cambia a color ámbar).
   - **Borrar** pide confirmación y la elimina.
5. **Filtrar por provincia** muestra solo las tarjetas de esa provincia. Si no hay ninguna, aparece un mensaje.
6. Arriba del pasaporte hay un sello por provincia (sellada o pendiente) y cuántas faltan. El resumen muestra el total de sodas, la calificación promedio (un decimal) y las provincias selladas («X de 7»). Con las 7 aparece el mensaje de pasaporte completo.
7. Al recargar la página, las visitas, las favoritas y el resumen siguen ahí.

## Estructura de archivos

```
pasaporte-gallo-pinto/
├── index.html        Estructura semántica: header, main con dos section (registro y pasaporte), footer
├── README.md
├── css/
│   └── estilos.css   Reset, paleta en :root, Grid/Flexbox y 3 breakpoints (700, 1000, 1440 px)
└── js/
    ├── storage.js    Único archivo que usa localStorage: clave en constante, lectura con try...catch y [] por defecto
    ├── api.js        Único archivo que usa fetch: pide los usuarios y revisa respuesta.ok
    ├── ui.js         Funciones que crean y actualizan el DOM (tarjetas, errores, resumen, select de compas)
    └── app.js        Estado (array de visitas), validación, eventos y arranque
```

Los cuatro scripts se cargan en el `<head>` con `defer` en este orden: `storage.js`, `api.js`, `ui.js` y `app.js` de último. Todos los eventos se registran con `addEventListener`; el HTML no tiene atributos de evento.

## Detalles de la implementación

- **Validación** (`app.js`): el formulario usa `novalidate` y el `submit` hace `preventDefault()`. Cada regla devuelve un mensaje o `""`:
  - Nombre: obligatorio, de 3 a 40 caracteres sin contar espacios al inicio o al final (`trim()`).
  - Provincia: obligatoria.
  - Plato: obligatorio, mínimo 3 caracteres.
  - Calificación: entero de 1 a 5.
  - Fecha: obligatoria y no futura (se compara con la fecha local de hoy; el `max` del input también la limita).
  - Se muestran todos los errores a la vez y el foco va al primero. Cuando un campo tiene error, se revalida al escribir o cambiarlo, y el mensaje desaparece al corregirlo.
- **Tarjetas** (`ui.js`): se crean desde el array con `createElement` y `textContent`, nunca con HTML armado con texto del usuario. Cada visita es un objeto con `id` único, `nombre`, `provincia`, `plato`, `calificacion`, `fecha`, `compa`, `volveria` y `favorita`.
- **Delegación de eventos**: un solo `addEventListener("click")` en `#lista-visitas` atiende los botones Favorita y Borrar de todas las tarjetas (`closest("button[data-accion]")`).
- **Resumen**: total, promedio con `toFixed(1)`, provincias distintas con un `Set`, un sello por provincia y cuántas faltan.
- **Estilos**: la misma línea visual de las prácticas 9 a 11 (paleta azul, Arial, esquinas de 4 px y paneles con borde superior). Los íconos (estrella y check) son un solo sprite SVG en `index.html` que `ui.js` reutiliza con `<use>`.
- **Persistencia** (`storage.js`): las visitas se guardan en `localStorage` bajo `pasaporteGalloPinto.visitas` después de cada cambio. Si el contenido está dañado o no es un array, se usa `[]`.

## API usada

[JSONPlaceholder](https://jsonplaceholder.typicode.com), endpoint `GET https://jsonplaceholder.typicode.com/users`. No necesita llave.

- Mientras carga, el select «Compa de viaje» dice «Cargando compas...» y está deshabilitado.
- Si responde bien, se llena con el `name` de cada usuario más la opción fija «Fui solo».
- Si falla (sin conexión o código distinto de 2xx), aparece el mensaje «No se pudieron cargar los compas; podés registrar la visita como 'Fui solo'» y el formulario sigue funcionando con esa opción.

## Pruebas realizadas

- Formulario vacío: aparecen los 5 errores y el foco va al nombre. Nombre de 2 y de 41 caracteres, plato de 2 y fecha futura: cada uno muestra su mensaje. Al corregir, los mensajes desaparecen.
- Tres visitas en provincias distintas, una favorita, filtro por San José y por Limón (mensaje de lista vacía), recarga: todo se restauró.
- Siete provincias: «7 de 7» y mensaje de pasaporte completo. Al borrar una, vuelve a «6 de 7». Cancelar la confirmación no borra nada.
- Nombre con etiquetas HTML (`Soda <b>El Puerto</b>`): se muestra como texto.
- Fallo de red y respuesta 500: aviso visible y solo «Fui solo»; la visita se registró igual.
- `localStorage` dañado: la app arranca con `[]` sin errores.
- 400, 700, 1000 y 1440 px sin scroll horizontal: una columna en 400; campos y tarjetas en 2 columnas en 700; formulario y pasaporte lado a lado desde 1000; tarjetas en 3 columnas en 1440.
- Validador del W3C: sin errores ni advertencias.

## Declaración de uso de IA

Usé Claude (de Anthropic) como apoyo para organizar el proyecto en cuatro archivos JS, escribir la validación, la delegación de eventos y la persistencia, armar la paleta y los breakpoints, y probar la app en distintos tamaños y casos de error. También me ayudó a redactar este README. Revisé y probé el código para poder explicarlo y modificarlo en clase. La declaración también aparece al inicio de cada archivo JS y de `css/estilos.css`.
