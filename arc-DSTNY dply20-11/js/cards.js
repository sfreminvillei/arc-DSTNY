// js/cards.js
// ===========================
// Núcleo de datos de arc/DSTNY
// ===========================

// 22 casillas del Tarot Mayor (solo nombres)
export const ARCANA_SLOTS_NAMES = [
  "El Loco",        // 0
  "El Mago",        // 1
  "La Sacerdotisa", // 2
  "La Emperatriz",  // 3
  "El Emperador",   // 4
  "El Hierofante",  // 5
  "Los Enamorados", // 6
  "El Carro",       // 7
  "La Justicia",    // 8
  "El Ermitaño",    // 9
  "La Rueda de la Fortuna", // 10
  "La Fuerza",      // 11
  "El Colgado",     // 12
  "La Muerte",      // 13
  "La Templanza",   // 14
  "El Diablo",      // 15
  "La Torre",       // 16
  "La Estrella",    // 17
  "La Luna",        // 18
  "El Sol",         // 19
  "El Juicio",      // 20
  "El Mundo"        // 21
];

// 🔁 Antagonistas y potenciadores por ÍNDICE DE CASILLA (no por carta)
const ANTAGONIST_MAP = {
  0: 8,
  1: 15,
  2: 20, 3: 13, 4: 7,  5: 15, 6: 15, 7: 16,
  8: 0,   9: 19, 10: 8, 11: 13, 12: 7, 13: 3,
  14: 15, 15: 17,16: 14,17: 16,18: 19,19: 18,
  20: 0,  21: 15
};

const POTENCIADOR_MAP = {
  0: 10, 1: 17, 2: 18, 3: 19, 4: 8,  5: 14, 6: 17, 7: 11,
  8: 4,  9: 18,10: 0,  11: 7, 12: 2, 13: 20,14: 5, 15: 16,
  16: 15,17: 6, 18: 9, 19: 3, 20: 13,21: 21
};

// 🎭 Slots arcanos: estructura central del duelo arcano
export const ARCANA_SLOTS = ARCANA_SLOTS_NAMES.map((nombre, slotId) => ({
  slotId,                     // 0–21
  nombre,                     // "El Sol", etc.
  antagonistaSlot: ANTAGONIST_MAP[slotId] ?? null,
  potenciadorSlot: POTENCIADOR_MAP[slotId] ?? null,
  // descripción del rol (para el Oráculo / UI)
  descripcionRol: "",         // la rellenamos más adelante si querés
}));

// 🔮 Espíritu básico (no tiene efecto, solo lore + atributos aleatorios)
export const SPIRIT_CARD = {
  id: "spirit_init",
  nombre: "Ánima Iniciática",
  descripcion:
    "El reflejo espiritual del jugador en su primera travesía arcana.",
  // Los atributos numéricos se asignan SIEMPRE de forma aleatoria por tirada
};

// 🌬️ Elementos base para los efectos elementales
export const ELEMENT_TYPES = ["AGUA", "TIERRA", "FUEGO", "AIRE", "AMOR"];

// 🜁 Efectos elementales (5 para el deck de iniciación)
// Cada uno define su efecto como función pura sobre el gameState
export const ELEMENTAL_EFFECTS = [
  {
    id: "elem_fuego_basal",
    nombre: "Fuego Basal",
    elemento: "FUEGO",
    duracionTurnos: 1,
    descripcion: "El calor de la chispa inicial refuerza tu ataque.",
    applyEffect(gameState, owner) {
      const attrs = gameState.currentTurn[owner].attrs;
      attrs.ATK += 2;
    },
  },
  {
    id: "elem_tierra_firme",
    nombre: "Tierra Firme",
    elemento: "TIERRA",
    duracionTurnos: 1,
    descripcion: "La solidez de la tierra fortalece tu defensa.",
    applyEffect(gameState, owner) {
      const attrs = gameState.currentTurn[owner].attrs;
      attrs.DEF += 2;
    },
  },
  {
    id: "elem_viento_veloz",
    nombre: "Viento Veloz",
    elemento: "AIRE",
    duracionTurnos: 1,
    descripcion: "Un soplo súbito empuja tu velocidad hacia arriba.",
    applyEffect(gameState, owner) {
      const attrs = gameState.currentTurn[owner].attrs;
      attrs.SPD += 2;
    },
  },
  {
    id: "elem_agua_profunda",
    nombre: "Agua Profunda",
    elemento: "AGUA",
    duracionTurnos: 1,
    descripcion: "La corriente sutil del agua afila tu magia.",
    applyEffect(gameState, owner) {
      const attrs = gameState.currentTurn[owner].attrs;
      attrs.MAG += 2;
    },
  },
  {
    id: "elem_amor_resonante",
    nombre: "Amor Resonante",
    elemento: "AMOR",
    duracionTurnos: 1,
    descripcion:
      "La resonancia del vínculo te sostiene cuando todo tiembla.",
    applyEffect(gameState, owner) {
      // mantén un mínimo de 3 en todos los atributos esta tirada
      const attrs = gameState.currentTurn[owner].attrs;
      ["ATK", "DEF", "SPD", "MAG"].forEach((k) => {
        if (attrs[k] < 3) attrs[k] = 3;
      });
    },
  },
];

// 📜 Destinos (Augurios y Maldiciones)
// MISMOS textos y lógica conceptual que tu versión funcional, pero aquí solo
// guardamos el meta; la lógica fina se aplicará en el engine.
export const DESTINOS = [
  // Augurios (A)
  { id: "A1", type: "A", nombre: "Círculo de Luz",
    descripcion: "+2 a todos tus atributos esta tirada." },
  { id: "A2", type: "A", nombre: "Escudo del Alba",
    descripcion: "Todo el daño que recibís esta tirada se reduce a la mitad." },
  { id: "A3", type: "A", nombre: "Manantial Vital",
    descripcion: "Recuperás +10 LP al revelarse." },
  { id: "A4", type: "A", nombre: "Reloj del Éter",
    descripcion: "+2 ATK esta tirada." },
  { id: "A5", type: "A", nombre: "Sello Dorado",
    descripcion: "Ignorás las negaciones del Códice en tu contra." },
  { id: "A6", type: "A", nombre: "Eco Solar",
    descripcion: "+2 al segundo atributo que elegís." },
  { id: "A7", type: "A", nombre: "Luz Benevolente",
    descripcion: "Si perdés, el daño que recibís se reduce a la mitad." },
  { id: "A8", type: "A", nombre: "Reinvocación",
    descripcion: "+2 MAG esta tirada." },
  { id: "A9", type: "A", nombre: "Sacrificio del Alma",
    descripcion: "Perdés 5 LP ahora, pero ganás +2 a todos los atributos esta tirada." },
  { id: "A10", type: "A", nombre: "Visión del Oráculo",
    descripcion: "+2 SPD esta tirada." },
  { id: "A11", type: "A", nombre: "Equilibrio Ancestral",
    descripcion:
      "Ambos ganan +5 LP y tus atributos no bajan de 3 esta tirada." },

  // Maldiciones (M)
  { id: "M1", type: "M", nombre: "Ceguera del Caos",
    descripcion: "El jugador afectado jugará ciego la próxima tirada." },
  { id: "M2", type: "M", nombre: "Silencio de los Dioses",
    descripcion: "Cancela el efecto de Destino del rival esta tirada." },
  { id: "M3", type: "M", nombre: "Veneno del Alma",
    descripcion: "Si ganás, el rival recibe +5 daño adicional." },
  { id: "M4", type: "M", nombre: "Ruptura del Vacío",
    descripcion: "Todos los atributos del rival se vuelven 0 esta tirada." },
  { id: "M5", type: "M", nombre: "Reflejo Carmesí",
    descripcion: "Si perdés, el rival recibe la mitad del daño infligido." },
  { id: "M6", type: "M", nombre: "Cisma Eterno",
    descripcion: "Se cancelan ambos Destinos esta tirada." },
  { id: "M7", type: "M", nombre: "Maldición del Espejo",
    descripcion: "El rival pierde 2 puntos en todos sus atributos esta tirada." },
  { id: "M8", type: "M", nombre: "Filo del Juicio",
    descripcion: "Si hay empate, el rival recibe 10 daño directo." },
  { id: "M9", type: "M", nombre: "Desgarrar la Carne",
    descripcion: "Si el rival eligió ATK, su ATK se vuelve 0 esta tirada." },
  { id: "M10", type: "M", nombre: "Pacto de Sangre",
    descripcion: "Perdés 5 LP, pero si ganás hacés +10 daño." },
  { id: "M11", type: "M", nombre: "Reloj Final",
    descripcion: "Ambos jugadores pierden 10 LP." },
];

// 👑 Deidades — 11 deidades de distintas tradiciones, con invocaciones difíciles
// Nota: las funciones de condición y efecto se aplicarán desde el engine, aquí
// solo dejamos la "intención"; igual ya las definimos como funciones para
// poder usarlas directamente si querés.
export const DEIDADES = [
  {
    id: "dei_zeus",
    nombre: "Zeus",
    cultura: "Grecia",
    nivel: 1,
    duracionTurnos: 5,
    descripcion:
      "Señor del trueno. Mientras esté activo, tu ATK nunca baja de 3.",
    puedeInvocarse(gameState, owner) {
      // Ritual: turno múltiplo de 3 y combinación ATK+MAG elegida
      const turno = gameState.turnNumber;
      const sel = gameState.currentTurn[owner].chosenAttrs;
      return (
        turno > 1 &&
        turno % 3 === 0 &&
        sel.includes("ATK") &&
        sel.includes("MAG")
      );
    },
    aplicarPersistente(gameState, owner) {
      const attrs = gameState.currentTurn[owner].attrs;
      if (attrs.ATK < 3) attrs.ATK = 3;
    },
  },
  {
    id: "dei_amaterasu",
    nombre: "Amaterasu",
    cultura: "Japón",
    nivel: 1,
    duracionTurnos: 3,
    descripcion:
      "Diosa del sol. Mientras brilla, tus atributos elegidos reciben +2.",
    puedeInvocarse(gameState, owner) {
      // Ritual: tu Arcano debe estar en la casilla "El Sol" (slot 19)
      const slot = gameState.currentTurn[owner].slotIdArcano;
      return slot === 19;
    },
    aplicarPersistente(gameState, owner) {
      const { chosenAttrs, attrs } = gameState.currentTurn[owner];
      chosenAttrs.forEach((k) => {
        attrs[k] += 2;
      });
    },
  },
  {
    id: "dei_anubis",
    nombre: "Anubis",
    cultura: "Egipto",
    nivel: 2,
    duracionTurnos: 3,
    descripcion:
      "Guardián de los muertos. Puede pesar el corazón del rival y drenar su LP.",
    puedeInvocarse(gameState, owner) {
      // Ritual: solo si ambos jugadores están por debajo de 20 LP
      const { LP } = gameState;
      return LP.player < 20 && LP.opponent < 20;
    },
    aplicarPersistente(gameState, owner) {
      const rival = owner === "player" ? "opponent" : "player";
      gameState.LP[rival] -= 2;
    },
  },
  {
    id: "dei_odin",
    nombre: "Odín",
    cultura: "Nórdica",
    nivel: 1,
    duracionTurnos: 4,
    descripcion:
      "Padre de todo. Sacrifica un poco de LP para obtener conocimiento.",
    puedeInvocarse(gameState, owner) {
      // Ritual: si elegiste DEF+MAG y tu LP es mayor a 10
      const sel = gameState.currentTurn[owner].chosenAttrs;
      const lp = gameState.LP[owner];
      return (
        lp > 10 &&
        sel.includes("DEF") &&
        sel.includes("MAG")
      );
    },
    aplicarPersistente(gameState, owner) {
      gameState.LP[owner] -= 1;
      const attrs = gameState.currentTurn[owner].attrs;
      attrs.MAG += 2;
    },
  },
  {
    id: "dei_quetzalcoatl",
    nombre: "Quetzalcóatl",
    cultura: "Mesoamérica",
    nivel: 2,
    duracionTurnos: 3,
    descripcion:
      "Serpiente emplumada. Equilibra el cielo y la tierra en tu favor.",
    puedeInvocarse(gameState, owner) {
      // Ritual: turno par y empate de LP
      const t = gameState.turnNumber;
      const { LP } = gameState;
      return t % 2 === 0 && LP.player === LP.opponent;
    },
    aplicarPersistente(gameState, owner) {
      const attrs = gameState.currentTurn[owner].attrs;
      const avg =
        (attrs.ATK + attrs.DEF + attrs.SPD + attrs.MAG) / 4;
      ["ATK", "DEF", "SPD", "MAG"].forEach((k) => {
        attrs[k] = Math.max(attrs[k], Math.round(avg));
      });
    },
  },
  {
    id: "dei_yemaya",
    nombre: "Yemayá",
    cultura: "Afrocaribeña",
    nivel: 2,
    duracionTurnos: 3,
    descripcion:
      "Madre de las aguas. Su presencia amortigua el daño recibido.",
    puedeInvocarse(gameState, owner) {
      // Ritual: solo si perdiste la tirada anterior
      return gameState.lastWinner &&
        gameState.lastWinner !== owner;
    },
    aplicarPersistente(gameState, owner) {
      gameState.damageReduction[owner] =
        (gameState.damageReduction[owner] || 0) + 0.5; // 50%
    },
  },
  {
    id: "dei_shiva",
    nombre: "Shiva",
    cultura: "India",
    nivel: 1,
    duracionTurnos: 2,
    descripcion:
      "Destructor y recreador. Rompe los extremos para rehacer el equilibrio.",
    puedeInvocarse(gameState, owner) {
      // Ritual: si algún atributo tuyo supera 9
      const attrs = gameState.currentTurn[owner].attrs;
      return Object.values(attrs).some((v) => v > 9);
    },
    aplicarPersistente(gameState, owner) {
      const attrs = gameState.currentTurn[owner].attrs;
      ["ATK", "DEF", "SPD", "MAG"].forEach((k) => {
        if (attrs[k] > 9) attrs[k] = 9;
      });
    },
  },
  {
    id: "dei_hecate",
    nombre: "Hécate",
    cultura: "Grecia",
    nivel: 2,
    duracionTurnos: 3,
    descripcion:
      "Señora de las encrucijadas. Desvía el Códice a tu favor.",
    puedeInvocarse(gameState, owner) {
      // Ritual: si se podría aplicar Códice este turno
      const codex = gameState.potentialCodexResult;
      return codex && codex.canApply;
    },
    aplicarPersistente(gameState, owner) {
      // El Códice, si se invoca, nunca te penaliza a vos
      gameState.codexBias = owner;
    },
  },
  {
    id: "dei_thor",
    nombre: "Thor",
    cultura: "Nórdica",
    nivel: 1,
    duracionTurnos: 2,
    descripcion:
      "Portador del martillo. Refuerza el golpe final si ganás la tirada.",
    puedeInvocarse(gameState, owner) {
      // Ritual: elegiste ATK+SPD
      const sel = gameState.currentTurn[owner].chosenAttrs;
      return sel.includes("ATK") && sel.includes("SPD");
    },
    aplicarPersistente(gameState, owner) {
      gameState.bonusOnWin[owner] =
        (gameState.bonusOnWin[owner] || 0) + 5;
    },
  },
  {
    id: "dei_ra",
    nombre: "Ra",
    cultura: "Egipto",
    nivel: 1,
    duracionTurnos: 3,
    descripcion:
      "Disco solar. Mientras gobierna, tus atributos elegidos no pueden ser anulados.",
    puedeInvocarse(gameState, owner) {
      // Ritual: tu slot es Sol (19) o Estrella (17)
      const slot = gameState.currentTurn[owner].slotIdArcano;
      return slot === 19 || slot === 17;
    },
    aplicarPersistente(gameState, owner) {
      gameState.protectedAttrs[owner] =
        [...(gameState.currentTurn[owner].chosenAttrs || [])];
    },
  },
  {
    id: "dei_coatlicue",
    nombre: "Coatlicue",
    cultura: "Mesoamérica",
    nivel: 2,
    duracionTurnos: 2,
    descripcion:
      "Madre de dioses. Devora para volver a parir: ambas partes pagan el precio.",
    puedeInvocarse(gameState, owner) {
      // Ritual: ambos tienen ≤ 15 LP
      const { LP } = gameState;
      return LP.player <= 15 && LP.opponent <= 15;
    },
    aplicarPersistente(gameState, owner) {
      const rival = owner === "player" ? "opponent" : "player";
      gameState.LP[owner] -= 3;
      gameState.LP[rival] -= 5;
    },
  },
];
