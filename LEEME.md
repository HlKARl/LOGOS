# LOGOS 2.0 · concurso bíblico offline

**660 preguntas, 66 libros, 15 rondas, 3 comodines combinables.**

## Cómo actualizar la aplicación en GitHub Pages

1. Descomprime `Logos_PWA_Offline_v2.zip`.
2. Sube **el contenido** del ZIP (incluidas las carpetas `music` e `icons`) a la raíz de tu repositorio en GitHub. Sobrescribe los archivos antiguos.
3. Comprueba en **Settings → Pages** que se publica desde `main` y `/(root)`.
4. Abre la URL publicada, actualiza. Si ves todavía la versión antigua, cierra/reabre la PWA o recarga tras la actualización del Service Worker.

**Conserva la carpeta `music/` al actualizar**: si ya tienes canciones ahí, no las borres. Solo reemplaza archivos del programa; conserva el contenido de `music/catalog.json` que hayas personalizado.

## Sin desplazarse durante el concurso

La pantalla principal, respuestas, tres comodines y botón de confirmar están integrados en **una sola pantalla** en móvil y PC. El panel de premios en móvil se abre como superposición; la ventana de Configuración puede desplazarse porque contiene todas las opciones. En dispositivos extremadamente pequeños, la legibilidad depende de la resolución disponible.

## Fuentes de música (Configuración → Origen musical)

**1. Instrumental LOGOS:** se genera sin archivos mediante Web Audio; cambia la atmósfera en las rondas 1–5 (suave), 6–10 (media) y 11–15 (intensa). La música está desactivada hasta que pulses la nota musical.

**2. Mi música del celular/PC:** usa «IMPORTAR CARPETA» para elegir una carpeta con subcarpetas. Si tu navegador móvil no admite esa opción, usa «ELEGIR CANCIONES» para seleccionar varios archivos. Se guardan copias en el almacenamiento local del navegador (IndexedDB), sujetas al espacio disponible. **Las carpetas web no pueden vigilarse automáticamente**: al añadir archivos a tu celular, deberás importarlos nuevamente. Para asignar canciones a etapas, puedes elegir **«Usar canciones en»** antes de importarlas, o crear subcarpetas llamadas `inicio`, `suave`, `media`, `intensa`, `victoria` y dejar seleccionada la opción automática. Con una carpeta plana y asignación automática se utiliza la misma lista durante las preguntas. Los nombres de carpeta solo se reconocen si el selector incluye las rutas.

**3. Música de GitHub:** pon los archivos en estas subcarpetas (ya creadas en el ZIP):

```
music/
├── inicio/                 ← menú principal
├── juego/
│   ├── suave/             ← preguntas 1–5
│   ├── media/             ← preguntas 6–10
│   └── intensa/           ← preguntas 11–15
├── victoria/              ← si ganas la ronda 15
└── catalog.json            ← nombres de los audios
```

**IMPORTANTE:** GitHub Pages no ofrece un índice automático de carpetas. Después de subir las canciones, abre `music/catalog.json` y agrega sus nombres **exactos**, por ejemplo:

```json
{
  "inicio": ["inicio/intro.mp3", "inicio/otra.mp3"],
  "suave": ["juego/suave/paz.mp3"],
  "media": ["juego/media/suspenso.mp3"],
  "intensa": ["juego/intensa/final.mp3"],
  "victoria": ["victoria/celebracion.mp3"]
}
```

El reproductor alterna pistas sin repetir la última en la misma etapa. Si una categoría está vacía usa la instrumental original en esa etapa. Conviene evitar espacios y tildes en los nombres de archivos; si los usas, deben coincidir exactamente con el catálogo.

**Música offline de GitHub:** estando conectado, entra a Configuración y pulsa «DESCARGAR MÚSICA DE GITHUB PARA OFFLINE». El programa guardará las canciones configuradas en Cache Storage, disponibles sin internet para esta instalación. Repite la descarga cuando agregues o modifiques canciones. No elimines los datos del sitio o la caché si deseas conservarlas. Las pistas que se reproduzcan con conexión también quedan almacenadas en caché.

El volumen, la fuente musical y el tiempo por pregunta se guardan entre visitas. La música no se reproduce automáticamente por restricciones del navegador: primero pulsa el botón de nota musical.

## Archivo HTML independiente

`Logos_Offline_v2.html` funciona sin internet y contiene el juego completo, la música sintetizada y el selector de canciones locales. **La opción «GitHub» requiere la PWA publicada** para poder descargar la carpeta `music/` mediante HTTP(S); en un archivo `file://` no suele ser posible acceder a ese catálogo. Para canciones locales persistentes, se recomienda la PWA instalada.

## Características que se conservan

- Escalera de 15 premios hasta un millón de puntos ficticios (sin dinero real).
- Premios asegurados de 1.000 en la pregunta 5 y de 32.000 en la 10.
- 50/50, cambiar pregunta en la misma dificultad, doble oportunidad; **todos combinables** una vez por concurso.
- Guardado automático de partida y récords, selección A–D con teclado, tiempo por pregunta opcional.
- 660 preguntas en `questions.js`, sin APIs externas, guardadas en caché para jugar offline después de la primera visita.

**Nota:** utiliza música que tengas derecho a compartir. En un repositorio público de GitHub, el audio publicado es accesible a otras personas.
