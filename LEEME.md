# LOGOS 3.5 — Música predeterminada y actualización sin borrar datos

Esta actualización conserva las 660 preguntas, el diseño, los modos, las partidas y resultados guardados,
la opción de importar música del celular y la biblioteca opcional de GitHub.

## Qué se corrigió

- El navegador consulta versiones recientes de HTML, JS y CSS al volver a abrir LOGOS con internet.
- Se renueva el Service Worker v3.5, conservando cachés de canciones y datos de partidas.
- Los MP3 servidos por peticiones parciales (HTTP Range / 206) se reproducen con normalidad.
- Si se habían descargado los MP3 completos, pueden servirse sin conexión con respuesta parcial correcta.
- La música comienza **tras la primera interacción del usuario** por la política de navegadores.
- Si un MP3 no puede abrirse, se notifica el error y sigue el instrumental de respaldo.

## Actualizar GitHub Pages

1. Descomprime `LOGOS_3_5_GitHub.zip` y sube **los archivos de dentro** a la raíz de tu repositorio LOGOS,
   reemplazando los existentes. No borres la carpeta `music/base/` que ya tienes en GitHub.
2. Mantén los seis MP3 en `music/base/` con estos nombres exactos:
   - `Logos - Inicio.mp3`
   - `Logos - Facil.mp3`
   - `Logos - Medio.mp3`
   - `Logos - Intensa.mp3`
   - `Victoria - Mario Bross.mp3`
   - `Game over.mp3`
3. Una vez publicada la actualización, **usuarios que aún vean LOGOS 3.4** pueden abrir una sola vez
   la URL de LOGOS con `?actualizar=3.5` al final (por ejemplo,
   `https://USUARIO.github.io/LOGOS/?actualizar=3.5`); después pueden abrir la URL habitual.
   Esto evita la versión de HTML guardada por el Service Worker antiguo.
4. No selecciones «Borrar datos del sitio»: eso sí eliminaría partidas, récords y preferencias.

## Música de GitHub

El catálogo descargable sigue en `music/catalog.json`; las canciones de `base/` son independientes.
Puedes añadir pistas en las subcarpetas `music/inicio/`, `music/juego/suave/`,
`music/juego/media/`, `music/juego/intensa/`, `music/victoria/` y `music/derrota/`,
y añadir su ruta relativa al catálogo. La opción «Mi dispositivo» no se ha modificado.

**Importante:** este ZIP NO incluye los seis MP3 reales (no se habían adjuntado). La web usará
los que ya subiste al repositorio. Para escuchar las canciones offline, deberán descargarse
correctamente una primera vez con internet y disponer de espacio de almacenamiento.

Al publicar canciones comerciales necesitas los permisos pertinentes.
