// js/engine.js
// ======================================
// Motor de juego básico para arc/DSTNY
// Usa casillas arcanas (slots) como núcleo
// ======================================

import { INITIATION_DECK, normalizeDeckObject } from "./decks.js";
import { ARCANA_SLOTS } from "./cards.js";
import { evaluarCodice } from "./grimoire.js";

// Atributo aleatorio 1–10
function randomAttr() {
  return Math.floor(Math.random() * 10) + 1;
}

// Set de atributos aleatorios
function randomAttrs() {
  return {
    ATK: randomAttr(),
    DEF: randomAttr(),
    SPD: randomAttr(),
    MAG: randomAttr(),
  };
}

// Suma de atributos seleccionados
function sumSelectedAttrs(attrs, chosenAttrs) {
  return chosenAttrs.reduce((acc, key) => acc + (attrs[key] || 0), 0);
}

// Sorteo simple de un array (sin quitar la carta del mazo por ahora)
function drawRandom(arr) {
  const i = Math.floor(Math.random() * arr.length);
  return arr[i];
}

export class GameState {
  constructor(deck = INITIATION_DECK, initialLP = 50, playerElement = null) {
    // Normalizamos por si más adelante cargamos decks personalizados
    this.deck = normalizeDeckObject(deck);
    this.startingLP = initialLP;
    this.chosenElement = {
      player: playerElement,
      opponent: drawRandom(this.deck.elementals),
    };
    this.elementUsed = { player: false, opponent: false };

    this.turnNumber = 0;
    this.phase = "eleccion"; // "eleccion" | "oraculo" | "resolucion"
    this.gameOver = null;    // { winner: "player" | "opponent" | "draw" }

    // Puntos de vida iniciales
    this.LP = {
      player: this.startingLP,
      opponent: this.startingLP,
    };

    this._crearEstructuraTurno();


    // Campos para que deidades y sistema recuerden contexto
    this.lastWinner = null;              // "player" | "opponent" | "draw" | null
    this.potentialCodexResult = null;    // posible resultado antes de invocarlo
    this.codexBias = null;               // usado por deidades tipo Hécate
    this.damageReduction = { player: 0, opponent: 0 };
    this.bonusOnWin = { player: 0, opponent: 0 };
    this.protectedAttrs = { player: [], opponent: [] };

    // Arrancamos en primera tirada
    this.nuevaTirada();
  }

  configureMatch(initialLP = 50) {
    this.startingLP = initialLP;
    this.LP.player = initialLP;
    this.LP.opponent = initialLP;
    this.chosenElement.opponent = drawRandom(this.deck.elementals);
    this.turnNumber = 0;
    this.phase = "eleccion";
    this.gameOver = null;
    this.lastWinner = null;
    this.potentialCodexResult = null;
    this.codexBias = null;
    this.damageReduction = { player: 0, opponent: 0 };
    this.bonusOnWin = { player: 0, opponent: 0 };
    this.protectedAttrs = { player: [], opponent: [] };
    this.elementUsed = { player: false, opponent: false };
    this._crearEstructuraTurno();
    this.nuevaTirada();
  }

  setPlayerElement(elementCard) {
    this.chosenElement.player = elementCard;
  }

  _crearEstructuraTurno() {
    this.currentTurn = {
      player: {
        slotIdArcano: null,
        arcanoSlot: null,
        destino: null,
        deidad: null,
        spirit: this.deck.spirit,
        element: null,
        attrs: randomAttrs(),
        chosenAttrs: [],
      },
      opponent: {
        slotIdArcano: null,
        arcanoSlot: null,
        destino: null,
        deidad: null,
        spirit: this.deck.spirit,
        element: null,
        attrs: randomAttrs(),
        chosenAttrs: [],
      },
      deityActive: {
        player: null,
        opponent: null,
      },
      relationships: {
        playerVsOpponent: null,
        opponentVsPlayer: null,
      },
      codexResult: null,
      destinoActivado: false,   // ¿se activó el destino del jugador?
      dueloEspiritual: false,  // flag para el duelo espiritual
      codexChoice: null,       // "invocar" | "rechazar" | null
    };
  }

  // ====================
  // Gestión de tiradas
  // ====================

  nuevaTirada() {
    if (this.gameOver) return;
    this.turnNumber += 1;
    this.phase = "eleccion";

    // Reducir duración de deidades activas
    this._tickDeities();

    // Reset de estructura del turno
    this.currentTurn.player.attrs = randomAttrs();
    this.currentTurn.opponent.attrs = randomAttrs();
    this.currentTurn.player.chosenAttrs = [];
    this.currentTurn.opponent.chosenAttrs = [];

    // Reset de flags de turno
    this.currentTurn.destinoActivado = false;
    this.currentTurn.dueloEspiritual = false;
    this.currentTurn.codexChoice = null;


    // Elegir casillas arcanas (slots) para cada lado
    const arcP = drawRandom(this.deck.arcanos);
    const arcO = drawRandom(this.deck.arcanos);

    this.currentTurn.player.slotIdArcano = arcP.slotId;
    this.currentTurn.player.arcanoSlot = arcP;

    this.currentTurn.opponent.slotIdArcano = arcO.slotId;
    this.currentTurn.opponent.arcanoSlot = arcO;

    // Destinos aleatorios
    this.currentTurn.player.destino = drawRandom(this.deck.destinos);
    this.currentTurn.opponent.destino = drawRandom(this.deck.destinos);

    // Deidades aleatorias
    this.currentTurn.player.deidad = drawRandom(this.deck.deidades);
    this.currentTurn.opponent.deidad = drawRandom(this.deck.deidades);

    // Efectos elementales (persisten visualmente, 1 uso por partida)
    this.currentTurn.player.element = this.chosenElement.player || null;
    this.currentTurn.opponent.element = this.chosenElement.opponent || null;

    // Reevaluar relación antagonista/potenciador entre casillas
    this.currentTurn.relationships = this._evaluarRelacionesArcanas();

    // Reset de info de Códice
    this.currentTurn.codexResult = null;
    this.potentialCodexResult = null;

    console.log("Nueva tirada #", this.turnNumber, {
      playerSlot: this.currentTurn.player.arcanoSlot,
      opponentSlot: this.currentTurn.opponent.arcanoSlot,
      relationships: this.currentTurn.relationships,
    });
  }

  // Relación antagonista/potenciador basada en SLOT, no en carta
  _evaluarRelacionesArcanas() {
    const pSlotId = this.currentTurn.player.slotIdArcano;
    const oSlotId = this.currentTurn.opponent.slotIdArcano;

    const pSlot = ARCANA_SLOTS[pSlotId];
    const oSlot = ARCANA_SLOTS[oSlotId];

    const playerVsOpponent = {
      isAntagonist: pSlotId === oSlot.antagonistaSlot,
      isPotenciador: pSlotId === oSlot.potenciadorSlot,
      from: pSlot,
      to: oSlot,
    };

    const opponentVsPlayer = {
      isAntagonist: oSlotId === pSlot.antagonistaSlot,
      isPotenciador: oSlotId === pSlot.potenciadorSlot,
      from: oSlot,
      to: pSlot,
    };

    return { playerVsOpponent, opponentVsPlayer };
  }

  _tickDeities() {
    ["player", "opponent"].forEach((side) => {
      const active = this.currentTurn.deityActive[side];
      if (!active) return;
      active.remainingTurns -= 1;
      if (active.remainingTurns <= 0) {
        this.currentTurn.deityActive[side] = null;
      }
    });
  }

  // ====================
  // Elección de atributos
  // ====================

  elegirAtributo(owner, attrKey) {
    const chosen = this.currentTurn[owner].chosenAttrs;
    if (chosen.includes(attrKey)) {
      // deseleccionar
      this.currentTurn[owner].chosenAttrs = chosen.filter(
        (k) => k !== attrKey
      );
    } else if (chosen.length < 2) {
      this.currentTurn[owner].chosenAttrs.push(attrKey);
    }
  }

  // =========================
  // Cambio de fase: Oráculo
  // =========================

  entrarFaseOraculo() {
    // Auto-elegir atributos del oponente si aún no tiene
    if (this.currentTurn.opponent.chosenAttrs.length === 0) {
      const keys = ["ATK", "DEF", "SPD", "MAG"];
      // simple choice: dos atributos aleatorios distintos
      while (this.currentTurn.opponent.chosenAttrs.length < 2) {
        const k = keys[Math.floor(Math.random() * keys.length)];
        if (!this.currentTurn.opponent.chosenAttrs.includes(k)) {
          this.currentTurn.opponent.chosenAttrs.push(k);
        }
      }
    }

    // Evaluar Códice potencial según elecciones de atributos
    this.potentialCodexResult = evaluarCodice(
      this.currentTurn.player.chosenAttrs,
      this.currentTurn.opponent.chosenAttrs
    );

    this.phase = "oraculo";

    console.log("Entrando en fase Oráculo", {
      chosenPlayer: this.currentTurn.player.chosenAttrs,
      chosenOpponent: this.currentTurn.opponent.chosenAttrs,
      potentialCodex: this.potentialCodexResult,
    });
  }

  // =========================
  // Deidades
  // =========================

  puedeActivarDeidad(owner) {
    const card = this.currentTurn[owner].deidad;
    if (!card || typeof card.puedeInvocarse !== "function") return false;
    return card.puedeInvocarse(this, owner);
  }

  activarDeidad(owner) {
    const card = this.currentTurn[owner].deidad;
    if (!card) return false;
    if (!this.puedeActivarDeidad(owner)) return false;

    this.currentTurn.deityActive[owner] = {
      card,
      remainingTurns: card.duracionTurnos ?? 1,
    };

    console.log(`Deidad activada (${owner}):`, card.nombre);
    return true;
  }

  _aplicarDeidadesPersistentes() {
    ["player", "opponent"].forEach((side) => {
      const active = this.currentTurn.deityActive[side];
      if (!active || typeof active.card.aplicarPersistente !== "function") {
        return;
      }
      active.card.aplicarPersistente(this, side);
    });
  }

  // =========================
  // Resolución de tirada
  // =========================

  resolverTirada() {
    this.phase = "resolucion";

    // 1) Aplicar efectos persistentes de Deidades activas
    this._aplicarDeidadesPersistentes();

    // 2) Aplicar efectos elementales básicos (por ahora siempre)
    this._aplicarElementos("player");
    this._aplicarElementos("opponent");

    // 3) Aplicar Destinos (aquí solo esqueleto; la lógica fina se completará después)
    this._aplicarDestinos("player");
    this._aplicarDestinos("opponent");

    // 4) Aplicar Códice del Grimorio si corresponde
    this._aplicarCodice();

    // 5) Aplicar relación antagonista/potenciador entre casillas
    this._aplicarRelacionesArcanas();

    // 6) Calcular daño final y actualizar LP
    const resultado = this._calcularDaño();

    this.lastWinner = resultado.winner;

    console.log("Resolución de tirada:", resultado);

    return resultado;
  }

  _aplicarElementos(owner) {
    const elem = this.currentTurn[owner].element;
    if (!elem) return;

    // Solo una vez por partida
    if (this.elementUsed[owner]) return;

    if (typeof elem.applyEffect === "function") {
      elem.applyEffect(this, owner);
      this.elementUsed[owner] = true;
    }
  }

  _aplicarDestinos(owner) {
    const destino = this.currentTurn[owner].destino;
    if (!destino) return;

    // El jugador humano solo aplica su destino si activó el botón.
    // El oponente, por ahora, siempre lo aplica cuando se revela.
    if (owner === "player" && !this.currentTurn.destinoActivado) {
      console.log(`Destino (${owner}) no activado voluntariamente:`, destino.id);
      return;
    }

    console.log(`Destino aplicado (${owner}):`, destino.id, destino.nombre);

    const rival = owner === "player" ? "opponent" : "player";
    const attrsOwn = this.currentTurn[owner].attrs;
    const attrsRival = this.currentTurn[rival].attrs;

    switch (destino.id) {
      // ===== AUGURIOS =====
      case "A1": // +2 a todos tus atributos esta tirada
        ["ATK", "DEF", "SPD", "MAG"].forEach((k) => {
          attrsOwn[k] += 2;
        });
        break;

      case "A2": // daño recibido a la mitad
        this.damageReduction[owner] =
          (this.damageReduction[owner] || 0) + 0.5;
        break;

      case "A3": // +10 LP
        this.LP[owner] += 10;
        break;

      case "A4": // +2 ATK
        attrsOwn.ATK += 2;
        break;

      case "A5": // ignorar negaciones del Códice en tu contra
        this.protectedAttrs[owner] = ["ATK", "DEF", "SPD", "MAG"];
        break;

      case "A6": // +2 al segundo atributo elegido
        if (this.currentTurn[owner].chosenAttrs.length === 2) {
          const second = this.currentTurn[owner].chosenAttrs[1];
          attrsOwn[second] += 2;
        }
        break;

      case "A7": // si perdés, daño recibido a la mitad
        // lo manejaremos en _calcularDaño usando damageReduction si perdés
        this.damageReduction[owner] =
          (this.damageReduction[owner] || 0) + 0.5;
        break;

      case "A8": // +2 MAG
        attrsOwn.MAG += 2;
        break;

      case "A9": // -5 LP, +2 a todos los atributos
        this.LP[owner] -= 5;
        ["ATK", "DEF", "SPD", "MAG"].forEach((k) => {
          attrsOwn[k] += 2;
        });
        break;

      case "A10": // +2 SPD
        attrsOwn.SPD += 2;
        break;

      case "A11": // ambos +5 LP, tus atributos no bajan de 3
        this.LP[owner] += 5;
        this.LP[rival] += 5;
        ["ATK", "DEF", "SPD", "MAG"].forEach((k) => {
          if (attrsOwn[k] < 3) attrsOwn[k] = 3;
        });
        break;

      // ===== MALDICIONES =====
      case "M1": // Ceguera del caos (solo marca flag, se podría usar en UI)
        this.currentTurn.blindNextTurn = this.currentTurn.blindNextTurn || {};
        this.currentTurn.blindNextTurn[rival] = true;
        break;

      case "M2": // Silencio de los Dioses – cancela destino del rival
        this.currentTurn.cancelDestinoRival =
          this.currentTurn.cancelDestinoRival || {};
        this.currentTurn.cancelDestinoRival[rival] = true;
        break;

      case "M3": // Veneno del Alma – +5 daño adicional si ganás
        this.bonusOnWin[owner] = (this.bonusOnWin[owner] || 0) + 5;
        break;

      case "M4": // Ruptura del Vacío – todos los atributos del rival a 0
        ["ATK", "DEF", "SPD", "MAG"].forEach((k) => {
          attrsRival[k] = 0;
        });
        break;

      case "M5": // Reflejo Carmesí – si perdés, rival recibe la mitad del daño
        this.currentTurn.reflectOnLose =
          this.currentTurn.reflectOnLose || {};
        this.currentTurn.reflectOnLose[owner] = 0.5;
        break;

      case "M6": // Cisma Eterno – cancelar ambos destinos
        this.currentTurn.cancelBothDestinos = true;
        break;

      case "M7": // Maldición del Espejo – rival -2 en todos los atributos
        ["ATK", "DEF", "SPD", "MAG"].forEach((k) => {
          attrsRival[k] = Math.max(0, attrsRival[k] - 2);
        });
        break;

      case "M8": // Filo del Juicio – si hay empate, rival -10 LP
        this.currentTurn.extraDamageOnDraw =
          this.currentTurn.extraDamageOnDraw || {};
        this.currentTurn.extraDamageOnDraw[rival] =
          (this.currentTurn.extraDamageOnDraw[rival] || 0) + 10;
        break;

      case "M9": // Desgarrar la Carne – si rival eligió ATK, su ATK = 0
        if (this.currentTurn[rival].chosenAttrs.includes("ATK")) {
          attrsRival.ATK = 0;
        }
        break;

      case "M10": // Pacto de Sangre – perdés 5 LP, pero si ganás hacés +10 daño
        this.LP[owner] -= 5;
        this.bonusOnWin[owner] =
          (this.bonusOnWin[owner] || 0) + 10;
        break;

      case "M11": // Reloj Final – ambos pierden 10 LP
        this.LP[owner] -= 10;
        this.LP[rival] -= 10;
        break;

      default:
        console.log("Destino sin lógica específica aún:", destino.id);
        break;
    }
  }


  _aplicarCodice() {
    // Si no hay nada calculado, no hay códice que aplicar
    if (!this.potentialCodexResult) {
      this.currentTurn.codexResult = { applied: false, reason: "no_potential" };
      return;
    }

    const choice = this.currentTurn.codexChoice;

    // Si el jugador no lo invoca explícitamente, no pasa nada
    if (choice !== "invocar") {
      this.currentTurn.codexResult = {
        applied: false,
        reason: choice === "rechazar" ? "rejected" : "not_invoked",
      };
      return;
    }

    const { hit, atributoAnulado } = this.potentialCodexResult;

    const owner = "player";
    const rival = "opponent";

    // Si el trazo falla -> castigo directo al invocador
    if (!hit || !atributoAnulado) {
      const backlash = 5; // podés ajustar este valor
      this.LP[owner] -= backlash;
      this.currentTurn.codexResult = {
        applied: false,
        reason: "backlash",
        backlash,
      };
      return;
    }

    // Hay un atributo a anular: verificamos bias y protección
    const bias = this.codexBias;
    const protegidos = this.protectedAttrs[rival] || [];

    // Si el atributo está protegido por deidades
    if (protegidos.includes(atributoAnulado)) {
      this.currentTurn.codexResult = {
        applied: false,
        reason: "protected",
        atributo: atributoAnulado,
      };
      return;
    }

    // Si hay bias y favorece al owner, no se auto-penaliza
    if (bias && bias !== owner) {
      this.currentTurn.codexResult = {
        applied: false,
        reason: "bias_block",
        atributo: atributoAnulado,
      };
      return;
    }

    // Anulamos el atributo en el rival
    const attrsRival = this.currentTurn[rival].attrs;
    attrsRival[atributoAnulado] = 0;

    this.currentTurn.codexResult = {
      applied: true,
      atributo: atributoAnulado,
      target: rival,
    };
  }


  _aplicarRelacionesArcanas() {
    const rel = this.currentTurn.relationships;
    if (!rel) return;

    const applyRel = (owner, relation) => {
      const rival = owner === "player" ? "opponent" : "player";

      const chosenOwner = this.currentTurn[owner].chosenAttrs;
      const chosenRival = this.currentTurn[rival].chosenAttrs;

      const attrsOwner = this.currentTurn[owner].attrs;
      const attrsRival = this.currentTurn[rival].attrs;

      // ⚡ POTENCIADOR → +2 a los atributos elegidos del owner
      if (relation.isPotenciador) {
        chosenOwner.forEach((k) => {
          attrsOwner[k] += 2;
        });
      }

      // 🜂 ANTAGONISTA → -2 a los atributos elegidos del rival (mínimo 0)
      if (relation.isAntagonist) {
        chosenRival.forEach((k) => {
          attrsRival[k] = Math.max(0, attrsRival[k] - 2);
        });
      }
    };

    applyRel("player", rel.playerVsOpponent);
    applyRel("opponent", rel.opponentVsPlayer);
  }


  _calcularDaño() {
    const pChosen = this.currentTurn.player.chosenAttrs;
    const oChosen = this.currentTurn.opponent.chosenAttrs;

    const pAttrs = this.currentTurn.player.attrs;
    const oAttrs = this.currentTurn.opponent.attrs;

    const baseP = sumSelectedAttrs(pAttrs, pChosen);
    const baseO = sumSelectedAttrs(oAttrs, oChosen);

    let damageToOpponent = 0;
    let damageToPlayer = 0;

    if (baseP > baseO) {
      damageToOpponent = baseP - baseO;
    } else if (baseO > baseP) {
      damageToPlayer = baseO - baseP;
    }

    // Bonus por deidades (Thor, pactos, etc.)
    damageToOpponent += this.bonusOnWin.player || 0;
    damageToPlayer += this.bonusOnWin.opponent || 0;

    // Reducción de daño (Yemayá, etc.)
    damageToOpponent = Math.max(
      0,
      damageToOpponent * (1 - (this.damageReduction.opponent || 0))
    );
    damageToPlayer = Math.max(
      0,
      damageToPlayer * (1 - (this.damageReduction.player || 0))
    );

    // Aplicar daño a LP
    this.LP.player -= damageToPlayer;
    this.LP.opponent -= damageToOpponent;

    this.LP.player = Math.max(0, this.LP.player);
    this.LP.opponent = Math.max(0, this.LP.opponent);

    let winner = "draw";
    if (damageToOpponent > damageToPlayer) winner = "player";
    else if (damageToPlayer > damageToOpponent) winner = "opponent";

    // ¿Hay fin de partida?
    if (this.LP.player <= 0 && this.LP.opponent <= 0) {
      this.gameOver = { winner: "draw" };
      this.phase = "fin";
    } else if (this.LP.player <= 0) {
      this.gameOver = { winner: "opponent" };
      this.phase = "fin";
    } else if (this.LP.opponent <= 0) {
      this.gameOver = { winner: "player" };
      this.phase = "fin";
    }

    return {
      baseP,
      baseO,
      damageToOpponent,
      damageToPlayer,
      LP: { ...this.LP },
      winner,
    };
  }
}
