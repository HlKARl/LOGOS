# LOGOS 3.4 — Tus seis canciones por defecto

La app mantiene **exactamente** las funciones y la interfaz de LOGOS 3.3. La única actualización es la banda sonora:

- **Por defecto**: usa siempre las seis canciones especificadas, una por etapa, en `music/base/`.
- **GitHub**: `music/catalog.json` empieza con esas **mismas seis** canciones. Podrás cambiarlo después para agregar variedades sin alterar la lista fija por defecto.
- **Mi dispositivo**: permite importar carpetas o canciones desde el teléfono, igual que antes.
- **Sin conexión**: en GitHub Pages, las seis canciones se intentan guardar automáticamente en la caché durante la primera visita con internet. El botón «Descargar para jugar offline» continúa disponible en la fuente GitHub.
- Si falta algún MP3, la aplicación usa su instrumental de respaldo para esa etapa y no deja de funcionar.

## Archivos que debes aportar

**No estaban adjuntos los MP3 reales**, así que este ZIP no puede incluir su sonido. Debes subir estos seis archivos a `music/base/` con exactamente estos nombres:

1. `Logos - Inicio.mp3`
2. `Logos - Facil.mp3`
3. `Logos - Medio.mp3`
4. `Logos - Intensa.mp3`
5. `Victoria - Mario Bross.mp3`
6. `Game over.mp3`

La música predeterminada se sirve desde los archivos de tu repositorio, no desde el generador de música integrada. Hasta subirlos escucharás el sonido de respaldo. La reproducción con sonido requiere una interacción inicial, por las reglas del navegador.

Al actualizar GitHub Pages, sube todo el contenido de este ZIP y conserva tus archivos de música propios. Si ya tienes un `music/catalog.json` modificado y quieres conservarlo, decide si prefieres el nuevo catálogo inicial o el tuyo.

Los MP3 de obras comerciales están protegidos por derechos de autor; para distribuirlos públicamente desde GitHub se requieren permisos adecuados.
