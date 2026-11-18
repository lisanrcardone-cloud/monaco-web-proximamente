# Cómo crear un post nuevo

Los posts son archivos Markdown en `blog/posts/`. El HTML de `/blog` se genera solo con `node tools/build-tienda.mjs`. Nunca se edita a mano.

## En 5 pasos

1. Copia `blog/posts/_plantilla-producto.md` a `blog/posts/<slug>.md`. La plantilla viene con `estado: borrador`, así que no se publica mientras no lo cambies.
2. Rellena los campos de la cabecera y el texto. Cada hueco `[Pendiente: ...]` hay que sustituirlo o quitarlo.
3. Si hay vídeo, pon una línea `[[video]]` donde quieras que salga y rellena los campos `video_*`.
4. Pon `estado: aprobado` solo con el OK del usuario por escrito. Anota quién aprueba y cuándo en `aprobado_por` y `fecha_aprobacion`.
5. Ejecuta `node tools/build-tienda.mjs`, abre una rama y un PR.

## Campos de la cabecera

Va entre dos líneas `---`, una línea por campo, con el formato `campo: valor`.

| Campo | Obligatorio | Qué es |
|---|---|---|
| `titulo` | sí | H1 del post y título de la tarjeta |
| `slug` | sí | URL: `/blog/<slug>`. Minúsculas, números y guiones |
| `meta_title` | sí | Título para Google |
| `meta_description` | sí | Descripción para Google |
| `busqueda_principal` | no | Lo que busca la gente (solo para el equipo) |
| `tipo` | sí | `historia` o `producto` |
| `categoria` | sí | Etiqueta de arriba, por ejemplo "Nuestra historia" |
| `resumen` | sí | Entradilla y texto de la tarjeta del índice |
| `producto` | solo si `tipo: producto` | Slug de la ficha principal (existe en `tienda/productos.json`) |
| `secundarios` | no | Slugs de otras fichas, separados por coma |
| `autor` | sí | `Felipe Denti` o `Equipo de Mónaco Barbershop` |
| `estado` | sí | `aprobado` publica. Cualquier otro valor (`borrador`, `revisar`) se salta |
| `aprobado_por` | sí | Quién lo aprobó |
| `fecha_aprobacion` | sí | AAAA-MM-DD |
| `fecha_publicacion` | sí | AAAA-MM-DD |
| `video_src`, `video_poster`, `video_titulo`, `video_fecha`, `video_duracion` | solo con vídeo | Ruta del mp4, ruta del póster, título, fecha AAAA-MM-DD y duración ISO 8601 (por ejemplo `PT1M16S`). Van todos o ninguno |

## Markdown que entiende

`##`, `###`, párrafos, `**negrita**`, `[texto](url)`, listas con `- `, línea `---` y `[[video]]`. Los enlaces solo pueden empezar por `/` o `https://`. El H1 no se escribe: sale de `titulo`.

## Qué hace el build

- La caja de llamada a la acción sale detrás del 2.º H2 (necesita al menos 2).
- "Sigue leyendo" sale solo si hay más de un post.
- En `tipo: producto`, las preguntas de `## Preguntas frecuentes` (`### Pregunta` y su respuesta debajo) van al schema `FAQPage`.
- Con `producto` o `secundarios`, el post sale en "Del blog" de esas fichas.
- Si dejas de aprobar un post, el build borra su carpeta de `blog/`.

## Qué hace fallar el build

Un post aprobado con:

- un hueco `[Pendiente...]`;
- un campo obligatorio vacío o un slug repetido;
- un enlace a una ficha que no existe (`/tienda/producto/<x>`);
- un enlace a otro post que no está aprobado (`/blog/<x>`);
- `[[video]]` sin `video_src`;
- un `producto` o `secundarios` que no existen.

## Vídeo

Verticales, 720×1280, H.264, máximo 10 MB, en `assets/blog/`. Ejemplo:
`systemd-run --scope -q -p MemoryMax=1800M -- nice ffmpeg -i origen.mp4 -vf scale=720:1280 -c:v libx264 -profile:v high -crf 30 -preset slow -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart assets/blog/<slug>.mp4`.
El póster es un fotograma en `.jpg` de 720×1280.
