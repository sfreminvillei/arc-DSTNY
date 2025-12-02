# arc/DSTNY

Interfaz web experimental para simular tiradas de un duelo de cartas inspirado en arcanos, espíritus y deidades. El tablero muestra puntos de vida de ambos jugadores, los arcanos revelados, opciones de destino, duelo espiritual y un registro narrativo del Oráculo.

## ¿Qué incluye?
- **`index.html`**: estructura principal de la arena de batalla y el modal de configuración inicial.
- **`css/styles.css`**: estilos para el tablero, panel del Oráculo, controles y barras de vida.
- **`js/ui.js`**: control de interfaz y sincronización con el estado de partida.
- **`js/engine.js`**: motor de reglas y resolución de tiradas.
- **`js/cards.js`**: definiciones de arcanos, destinos, deidades y efectos elementales.
- **`js/tutorial.js`**: flujo de tutorial contextual.
- **`js/main.js`**: punto de entrada que inicializa la UI y el tutorial.

## Cómo probar
1. Abre `index.html` en tu navegador favorito.
2. Completa el modal de configuración: nombre del jugador, modo de LP, efecto elemental y avatar.
3. Usa los botones inferiores para elegir atributos, activar destino o deidades y resolver cada tirada. El registro del Oráculo mostrará el resumen.

## Notas de optimización
- La inicialización de avatares se realiza una sola vez por partida, evitando trabajo duplicado al aplicar clases CSS.
- Los recursos están organizados en módulos ES6, por lo que basta servir la carpeta con un servidor estático si se desea ejecutar sobre HTTP.
