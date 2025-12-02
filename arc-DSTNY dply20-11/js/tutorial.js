// js/tutorial.js
export class Tutorial {
  constructor(uiController) {
    this.ui = uiController;
    this.active = true;
    this.step = 0;
  }

  startIfFirstTurn() {
    if (!this.active) return;
    // Aquí luego vas cambiando this.step y
    // aplicando clases CSS tipo .highlight a los elementos
  }

  advance() {
    this.step += 1;
    // actualizar resaltados según paso
  }
}
