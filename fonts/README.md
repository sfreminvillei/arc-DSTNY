# Emoji webfont

Este proyecto puede usar un set de emojis estable similar a iOS a través de un webfont. Para evitar depender de las fuentes instaladas en cada sistema, agrega el archivo `twemoji-mozilla.woff2` dentro de este directorio y el CSS lo tomará como fallback de color.

## Cómo obtener la fuente

1. Descarga el archivo `twemoji-mozilla.woff2` del repositorio de [Twemoji Mozilla](https://github.com/mozilla/twemoji-colr) o de un mirror que distribuyan las releases oficiales.
2. Copia el archivo descargado a `fonts/twemoji-mozilla.woff2` en este repositorio.
3. (Opcional) Si cambias la fuente por otra, ajusta el nombre del archivo y la regla `@font-face` en `css/styles.css`.

## Consideraciones

- La fuente es opcional: si no está presente, los navegadores usarán las fuentes de emojis nativas.
- Twemoji Mozilla tiene licencia SIL Open Font License. Asegúrate de incluir el archivo de licencia si publicas el paquete junto con la fuente.
- El CSS ya declara la familia `Twemoji Mozilla` como fallback para que los emojis se vean consistentes en todos los dispositivos.
