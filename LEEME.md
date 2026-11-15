# LOGOS — El gran desafío bíblico

**Versión 1.0 · concurso para un participante · 660 preguntas / 66 libros**

LOGOS está inspirado en la mecánica de concursos de preguntas con escalera de premios, pero utiliza una identidad visual, efectos y música instrumental propios. **No entrega dinero real.**

## Dos formas de jugar

### A) Abrir inmediatamente, sin internet

Utiliza el archivo **`Logos_Offline.html`** incluido por separado en la entrega. Haz doble clic (PC), o ábrelo con tu navegador (Android). El juego completo y las 660 preguntas están dentro de ese archivo. **No hace falta instalar nada ni conectarse.** Si el navegador impide abrir archivos HTML desde el administrador de archivos, usa el método PWA.

### B) Instalar como aplicación web (PWA)

1. Descomprime **`Logos_PWA_Offline.zip`**.
2. Publica todos los archivos y la carpeta `icons` en una web con **HTTPS**, por ejemplo GitHub Pages.
3. Abre la dirección publicada una primera vez **con internet**.
4. En Chrome/Brave, usa **Instalar aplicación** o **Añadir a la pantalla de inicio**.
5. Cuando termine la instalación y la carga inicial, podrás abrirla y jugar **sin internet**. La música interna, preguntas, estilos e iconos se guardan en la caché local.

> En una PC también puedes abrir el `index.html` de la carpeta descomprimida para jugar offline; sin embargo, la instalación como PWA desde `file://` no funciona. Se requiere HTTPS o `localhost`.

## Reglas

- 15 rondas, dificultad creciente (cinco niveles, tres rondas por nivel).
- La escalera termina en **1.000.000 de puntos ficticios**.
- Al acertar la pregunta **5**, aseguras **1.000 puntos**; al acertar la **10**, aseguras **32.000 puntos**.
- Puedes **plantarte** antes de responder y conservar **todo lo ganado hasta la última pregunta acertada**. Si fallas, conservas solo el último premio asegurado.
- Debes **seleccionar una opción** y después **confirmar**; el juego revela la respuesta correcta junto con su referencia bíblica.
- Los tres comodines pueden combinarse, una vez cada uno por partida:
  - **50/50**: elimina dos opciones equivocadas (o las necesarias para dejar la correcta y una alternativa si ya hubo un intento fallido).
  - **Cambiar**: reemplaza la pregunta con otra del **mismo nivel de dificultad**. Nunca repite la que cambiaste.
  - **Doble**: te da un segundo intento si fallas el primero.
- Si aplicas 50/50 o Doble antes de cambiar la pregunta, **esos efectos se mantienen** sobre la pregunta nueva. Al cambiar se reinicia el conteo de intentos.
- El **reloj está desactivado por defecto**. Puedes activarlo en Configuración (30, 45, 60 o 90 segundos por pregunta). El cambio se aplica desde la siguiente pregunta.

## Música

- Pulsa el **icono de nota musical** para iniciar/pausar una base instrumental LOGOS, generada en el navegador sin internet.
- En **Configuración**, selecciona **Mi canción** y carga MP3, WAV u otro formato compatible del dispositivo. El archivo nunca se envía a un servidor.
- Con **Guardar mi canción para escucharla offline** activado, intenta guardar una copia local mediante IndexedDB (hasta 45 MB, sujeto al espacio disponible y permisos del navegador). Si no puede guardarla, aún puedes escucharla durante esa sesión.
- Puedes ajustar el volumen y activar/desactivar efectos del concurso. Los navegadores requieren una interacción del usuario para comenzar a reproducir sonido.

## Guardado y privacidad

- El progreso se guarda automáticamente en `localStorage` de este navegador.
- Se guarda el nombre del participante, récords y últimas preguntas para evitar repeticiones cercanas.
- Las preguntas y el audio elegido se mantienen en tu propio dispositivo; **no hay cuentas, anuncios, analíticas, servidores ni llamadas a servicios externos**.
- Si borras los datos del sitio o cambias de origen (por ejemplo, del archivo local a GitHub Pages), el progreso no se sincroniza.

## Preguntas y dificultad

- Las **660 preguntas** fueron extraídas del documento Word del usuario, con cuatro alternativas, una respuesta correcta y referencias bíblicas.
- La clasificación en cinco niveles de dificultad es **aproximada**, calculada a partir de la posición de la pregunta, la familiaridad del libro y su formulación. No equivale a una validación psicométrica.
- El código fuente es transparente y editable: `questions.js` (contenido), `app.js` (reglas), `styles.css` (diseño), `index.html` (interfaz), `sw.js` (modo offline) y `manifest.webmanifest` (instalación).

## Atajos de teclado

**A–D**: seleccionar respuesta · **Intro**: confirmar / siguiente · **Esc**: cerrar ventanas · **L**: desplegar los premios.

Diseñado para Android, PC, pantalla táctil y proyectores. El juego se usa localmente y no necesita servicios de terceros.
