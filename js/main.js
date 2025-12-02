// js/main.js
import { UIController } from "./ui.js";
import { Tutorial } from "./tutorial.js";

const ui = new UIController();
const tutorial = new Tutorial(ui);

// Por ejemplo, iniciar tutorial en la primera tirada:
tutorial.startIfFirstTurn();

// Más adelante podés conectar eventos del UI con tutorial.advance()
