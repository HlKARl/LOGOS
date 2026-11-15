# LOGOS 3.0 · Concurso bíblico offline

**660 preguntas · 66 libros de la Biblia · 15 rondas · 4 modos · música híbrida.**

## Actualización en GitHub Pages

1. Descomprime `Logos_PWA_Offline_v3.zip`.
2. Copia **el contenido** del ZIP a la raíz de tu repositorio publicado, reemplazando `index.html`, `app.js`, `styles.css`, `sw.js`, `manifest.webmanifest` y los archivos que hayan cambiado. No subas el ZIP sin descomprimir.
3. **Conserva tus archivos MP3 y tu `music/catalog.json` actual** si ya habías personalizado la biblioteca. El catálogo del ZIP está vacío y no debes sobrescribir el personalizado.
4. GitHub Pages: `Settings → Pages → Deploy from a branch → main → /(root)`.
5. Una vez publicada la versión, vuelve a cargar la página; si la aplicación instalada muestra la anterior, ciérrala y vuelve a abrirla o recarga la página para que se active el nuevo Service Worker. No necesitas reinstalarla.

## Pantallas rediseñadas

- **Inicio:** presentación de aventura con un portal luminoso, identidad simple, nombre del concursante, botón principal y accesos al desafío y resultados.
- **Concurso:** composición reorganizada con pregunta destacada, respuestas 2×2, barra de progreso, comodines y botón de confirmación. La escalera de premios se ve a la derecha en escritorio y se abre en una capa superpuesta en móvil.
- Se ha probado en resoluciones de **320×568, 360×640, 390×844, 412×915, 800×600, 1280×800 y 1440×900** sin desplazamiento vertical en el concurso. Las opciones de configuración sí tienen desplazamiento interno si la pantalla es pequeña.

## Configuración → Partida

| Modo | Tiempo por pregunta | Comodines |
| --- | --- | --- |
| **Fácil** | Sin límite | Sí |
| **Medio** | 30 segundos | Sí |
| **Difícil** | 15 segundos | Sí |
| **Sagrado** | 15 segundos | **No** |

El modo se elige antes de iniciar una partida; al cambiar el modo durante una partida guardada, se aplicará a la **próxima**, no al concurso en curso. La dificultad de las preguntas continúa aumentando por ronda en todos los modos. Los tres comodines siguen combinables salvo en Sagrado. En Partida también se activan o desactivan los efectos de sonido.

## Configuración → Música

**Instrumental:** ambiente sintetizado en la app, disponible offline, con intensidad creciente según la ronda.

**Mi dispositivo:** selecciona música desde el celular o PC mediante `+ CARPETA` o `+ CANCIONES`. Las canciones se copian al almacenamiento local del navegador (IndexedDB). Puedes asignarlas a una etapa al importarlas, o usar subcarpetas `inicio`, `suave`, `media`, `intensa` y `victoria`. Si Android/tu navegador no permite elegir carpetas completas, usa el selector de varias canciones. La aplicación **no lee automáticamente cambios posteriores** en tu carpeta: debes importar las canciones nuevas.

**GitHub:** conserva o rellena estas carpetas:

```text
music/
├── inicio/                (pantalla principal)
├── juego/
│   ├── suave/            (rondas 1–5)
│   ├── media/            (rondas 6–10)
│   └── intensa/          (rondas 11–15)
├── victoria/             (victoria final)
└── catalog.json          (lista de archivos)
```

El repositorio **no** genera listas automáticas de música. Cada pista debe aparecer en `music/catalog.json`:

```json
{
  "inicio": ["inicio/bienvenida.mp3"],
  "suave": ["juego/suave/ambiente1.mp3", "juego/suave/ambiente2.mp3"],
  "media": ["juego/media/tension.mp3"],
  "intensa": ["juego/intensa/final.mp3"],
  "victoria": ["victoria/celebracion.mp3"]
}
```

Usa los nombres exactos de los archivos y evita espacios y tildes si es posible. Puedes poner varias pistas por categoría. En la PWA publicada, pulsa **Descargar para jugar offline** en la pestaña de música mientras estás conectado; así se guardarán en caché. Vuelve a hacerlo cuando agregues pistas. La música requiere que pulses el botón con la nota musical (los navegadores restringen la reproducción automática).

## Archivo único: Logos_Offline_v3.html

Puedes abrir este HTML directamente para jugar sin conexión. Incluye preguntas, estilos y música sintetizada. La importación de pistas locales puede depender del navegador y sus permisos. Para utilizar la biblioteca de música alojada en GitHub necesitas la **PWA publicada**: desde `file://` no se puede confiar en que el navegador permita acceder a `music/catalog.json`.

## Reglas que se conservan

- 660 preguntas disponibles offline, todas de respuesta múltiple con cuatro opciones.
- Premios ficticios de 100 a 1.000.000 de puntos en 15 rondas, metas garantizadas en 5 (1.000) y 10 (32.000).
- Comodines 50/50, cambio de pregunta de la misma dificultad y doble oportunidad. Cada uno se usa como máximo una vez por partida (salvo Sagrado).
- Opción de plantarse; historial local de resultados; partidas guardadas automáticamente.
- Sin APIs de terceros para el juego; después de la primera carga de GitHub Pages, la PWA funciona sin internet.

**Privacidad:** la música que importas del dispositivo queda almacenada localmente. Las canciones que subes a GitHub en un repositorio público se vuelven accesibles a otros; comparte solo música que puedas publicar legalmente.
