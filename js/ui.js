// js/ui.js
// ====================================
// Control visual y lógica de interfaz
// arc/DSTNY — Versión con controles
// ====================================

import { GameState } from "./engine.js";
import { ARCANA_SLOTS, ELEMENTAL_EFFECTS } from "./cards.js";

// BEGIN PATCH: emoji card rendering
const EMOJI_ARCANA_MAP = {
  "El Loco": "🤹",
  "El Mago": "✨",
  "La Sacerdotisa": "📜",
  "La Emperatriz": "👑",
  "El Emperador": "🛡️",
  "El Hierofante": "⛪",
  "Los Enamorados": "❤️",
  "El Carro": "🚗",
  "La Justicia": "⚖️",
  "El Ermitaño": "🕯️",
  "La Rueda de la Fortuna": "🎡",
  "La Fuerza": "🦁",
  "El Colgado": "🔗",
  "La Muerte": "☠️",
  "La Templanza": "🕊️",
  "El Diablo": "😈",
  "La Torre": "🏰",
  "La Estrella": "⭐",
  "La Luna": "🌙",
  "El Sol": "☀️",
  "El Juicio": "📯",
  "El Mundo": "🌍",
};

const EMOJI_DESTINO_MAP = {
  A1: "✨",
  A2: "🛡️",
  A3: "💧",
  A4: "⚔️",
  A5: "🔶",
  A6: "👁️",
  A7: "🕊️",
  A8: "🔮",
  A9: "❤️",
  A10: "🌪️",
  A11: "⚖️",
  M1: "🙈",
  M2: "🤫",
  M3: "☠️",
  M4: "⚫",
  M5: "🔁",
  M6: "❌",
  M7: "🚫",
  M8: "⚔️",
  M9: "🩸",
  M10: "📜",
  M11: "⏰",
};

const EMOJI_DEIDAD_MAP = {
  dei_zeus: "⚡",
  dei_hera: "👑",
  dei_poseidon: "🌊",
  dei_hades: "💀",
  dei_odin: "🦉",
  dei_thor: "🔨",
  dei_ra: "☀️",
  dei_anubis: "🐺",
  dei_bastet: "🐈",
  dei_hecate: "🌑",
  dei_yemaya: "🌊",
};

const EMOJI_ELEMENTO_MAP = {
  FUEGO: "🔥",
  TIERRA: "🪨",
  AIRE: "🌪️",
  AGUA: "💧",
  AMOR: "💖",
};

const EMOJI_SPIRIT = "🕯️👻";
// END PATCH

export class UIController {
  constructor() {
    this.game = new GameState();

    // Flags de UI (para retroiluminación y estado visual)
    this.flags = {
      destino: false,
      duelo: false,
      codexChoice: null, // "invocar" | "rechazar" | null
    };

    this.playerName = "Jugador";
    this.dueloRevelado = false; // queda revelado hasta fin de partida
    this.matchConfigured = false;
    this.playerAvatarClass = "avatar-sigil-1";
    this.opponentAvatarClass = "avatar-sigil-2";

    this.lastResolution = null;      // resultado numérico de la última tirada
    this.turnCounter = 1;            // número de tirada actual
    this.oracleLog = [];             // arreglo con el registro de tiradas
    this.lastLoggedTurn = null;      // para evitar duplicados en el log
    this.loggedElementUse = { player: false, opponent: false };
    this.viewMode = "text";          // "text" | "emoji" | "card"

    this.cacheDOM();


        // LP anterior para animar daño / curación
    this.prevLP = {
      player: this.game.LP.player,
      opponent: this.game.LP.opponent,
    };


    this.logContainer = document.getElementById("oracle-log");
    this.btnExportLog = document.getElementById("btn-export-log");

    this.setupControls();
    this.setupOverlayClose();
    this.setupSetupModal();
    this.setupThemeToggle();
    this.renderCodexMatrix();

    // Evento para exportar el registro del Oráculo
    this.btnExportLog.addEventListener("click", () => {
      this.exportOracleLog();
    });

    window.addEventListener("resize", () => this.updateLayoutOffsets());

    this.renderAll();
  }

  // ===========================
  // DOM
  // ===========================
    cacheDOM() {
    // LP (texto principal)
    this.playerLPbar = document.getElementById("player-lp");
    this.opponentLPbar = document.getElementById("opponent-lp");
    this.playerNameLabel = document.getElementById("player-name");

    // Barras de LP estilo TCG
    this.playerLPWrapper = document.getElementById("player-lp-wrapper");
    this.playerLPBarFill = document.getElementById("player-lp-bar");
    this.playerLPPercent = document.getElementById("player-lp-percent");

    this.opponentLPWrapper = document.getElementById("opponent-lp-wrapper");
    this.opponentLPBarFill = document.getElementById("opponent-lp-bar");
    this.opponentLPPercent = document.getElementById("opponent-lp-percent");
    this.playerAvatarEl = document.getElementById("player-avatar");
    this.opponentAvatarEl = document.getElementById("opponent-avatar");

    // Zona Oráculo
    this.oraclePhaseSteps = document.getElementById("oracle-phase-steps");
    this.oracleMessage = document.getElementById("oracle-message");
    this.codexLegend = document.getElementById("codex-legend");
    this.codexTable = document.getElementById("codex-table");
    this.grimorioPanel = document.getElementById("grimorio-panel");
    this.oracleBlock = document.querySelector(".oracle-top-block");
    this.oracleSlotMain = document.getElementById("oracle-slot-main");

    // Zona Jugador
    this.playerArcanoTitle = document.getElementById("player-arcano-title");
    this.playerArcanoInfo = document.getElementById("player-arcano-info");
    this.playerArcanoAttrsEl = document.getElementById("player-arcano-attrs");
    this.playerArcanoVisual = document.getElementById("player-arcano-visual");
    this.playerArcanoArt = document.getElementById("player-arcano-art");

    // NUEVO: info de soporte del jugador
    this.playerSpiritInfo = document.getElementById("player-spirit-info");
    this.playerElementInfo = document.getElementById("player-element-info");
    this.playerDestinoInfo = document.getElementById("player-destino-info");
    this.playerDeidadInfo = document.getElementById("player-deidad-info");
    this.playerDestinoBadge = document.getElementById("player-destino-badge");
    this.playerDeidadBadge = document.getElementById("player-deidad-badge");
    this.playerSpiritBadge = document.getElementById("player-spirit-badge");
    this.playerElementBadge = document.getElementById("player-element-badge");


    // Botón exportar log
    this.btnExportLog = document.getElementById("btn-export-log");

    // Zona Oponente
    this.opponentArcanoTitle = document.getElementById("opponent-arcano-title");
    this.opponentArcanoInfo = document.getElementById("opponent-arcano-info");
    this.opponentArcanoAttrsEl = document.getElementById("opponent-arcano-attrs");
    this.opponentArcanoVisual = document.getElementById("opponent-arcano-visual");
    this.opponentArcanoArt = document.getElementById("opponent-arcano-art");

    // NUEVO: info de soporte del oponente
    this.opponentSpiritInfo = document.getElementById("opponent-spirit-info");
    this.opponentElementInfo = document.getElementById("opponent-element-info");
    this.opponentDestinoInfo = document.getElementById("opponent-destino-info");
    this.opponentDeidadInfo = document.getElementById("opponent-deidad-info");
    this.opponentDestinoBadge = document.getElementById("opponent-destino-badge");
    this.opponentDeidadBadge = document.getElementById("opponent-deidad-badge");
    this.opponentSpiritBadge = document.getElementById("opponent-spirit-badge");
    this.opponentElementBadge = document.getElementById("opponent-element-badge");


    // Controles inferiores
    this.turnControls = document.getElementById("turn-controls");
    this.controlsBar = document.querySelector(".controls-bar");
    this.topBar = document.querySelector(".top-bar");
    this.themeToggle = document.getElementById("theme-toggle");

    // Modal de setup
    this.setupModal = document.getElementById("game-setup-modal");
    this.playerNameInput = document.getElementById("player-name-input");
    this.startGameBtn = document.getElementById("start-game-btn");
    this.modeOptions = document.querySelectorAll('input[name="mode"]');
    this.elementSelect = document.getElementById("elemental-select");
    this.avatarOptions = document.querySelectorAll('input[name="avatar"]');
    this.viewModeOptions = document.querySelectorAll('input[name="view-mode"]');

  }

  // ===========================
  // Controles de la tirada
  // ===========================
  setupControls() {
    this.buttons = {};

    const leftCol = document.createElement("div");
    const rightCol = document.createElement("div");
    leftCol.className = "controls-col controls-col--left";
    rightCol.className = "controls-col controls-col--right";

    const makeRow = (col, extraClass = "") => {
      const row = document.createElement("div");
      row.className = `controls-row ${extraClass}`.trim();
      col.appendChild(row);
      return row;
    };

    const makeButton = (id, label, extraClass = "", targetRow) => {
      const btn = document.createElement("button");
      btn.id = id;
      btn.className = "control-btn " + extraClass;
      btn.textContent = label;
      targetRow.appendChild(btn);
      this.buttons[id] = btn;
      return btn;
    };

    // Columnas y filas
    const leftRows = {
      primary: makeRow(leftCol),
      attrs: makeRow(leftCol, "controls-row--attrs"),
      destino: makeRow(leftCol),
      oraculo: makeRow(leftCol),
    };

    const rightRows = {
      deidad: makeRow(rightCol),
      codex: makeRow(rightCol),
      codexToggle: makeRow(rightCol),
      resolver: makeRow(rightCol),
    };

    // Columna izquierda
    makeButton(
      "btn-new-turn",
      "Nueva tirada",
      "control-btn--primary",
      leftRows.primary
    );
    makeButton("btn-duelo", "Activar duelo espiritual", "", leftRows.primary);

    ["ATK", "DEF", "SPD", "MAG"].forEach((key) => {
      makeButton(
        `btn-attr-${key.toLowerCase()}`,
        `${key}: ?`,
        "control-btn-attr",
        leftRows.attrs
      );
    });

    makeButton("btn-destino", "Activar destino", "", leftRows.destino);
    makeButton(
      "btn-oraculo",
      "Oráculo / Revelar",
      "control-btn--primary",
      leftRows.oraculo
    );

    // Columna derecha
    makeButton("btn-deidad", "Invocar deidad", "", rightRows.deidad);
    makeButton("btn-codex-invocar", "Invocar Códice", "", rightRows.codex);
    makeButton("btn-codex-rechazar", "Rechazar Códice", "", rightRows.codex);
    makeButton(
      "btn-toggle-grimorio",
      "Ver Códice",
      "control-btn--ghost",
      rightRows.codexToggle
    );
    makeButton(
      "btn-resolver",
      "Resolver tirada",
      "control-btn--primary",
      rightRows.resolver
    );

    this.turnControls.appendChild(leftCol);
    this.turnControls.appendChild(rightCol);

    this.bindControlEvents();
  }

  bindControlEvents() {
    // Nueva tirada
    this.buttons["btn-new-turn"].addEventListener("click", () => {
      if (this.game.gameOver || !this.matchConfigured) return;
      this.turnCounter += 1;           // siguiente tirada
      this.game.nuevaTirada();
      this.lastResolution = null;      // limpiamos el resumen anterior
      this.flags.destino = false;
      this.flags.duelo = false;
      this.flags.codexChoice = null;
      this.game.currentTurn.destinoActivado = false;
      this.game.currentTurn.dueloEspiritual = false;
      this.game.currentTurn.codexChoice = null;

      this.appendOracleLog(
        "Nueva tirada. Se barajan arcanos, destinos, deidades y espíritus."
      );

      this.renderAll();
    });

    // Botones grandes de atributos (parte inferior)
    ["ATK", "DEF", "SPD", "MAG"].forEach((key) => {
      const id = `btn-attr-${key.toLowerCase()}`;
      this.buttons[id].addEventListener("click", () => {
        // Solo se puede elegir atributos en fase de elección
        if (this.game.phase !== "eleccion") return;
        this.game.elegirAtributo("player", key);
        this.renderAll();
      });
    });

    // Oráculo / Revelar
    this.buttons["btn-oraculo"].addEventListener("click", () => {
      if (!this.matchConfigured || this.game.gameOver) return;
      this.game.entrarFaseOraculo();

      const pArc = this.game.currentTurn.player.arcanoSlot;
      const oArc = this.game.currentTurn.opponent.arcanoSlot;
      const attrs = this.game.currentTurn.player.attrs;
      const chosen = this.game.currentTurn.player.chosenAttrs;
      const chosenText = chosen
        .map((k) => `${k}: ${attrs[k]}`)
        .join(" · ");

      this.appendOracleLog(
        `El Oráculo revela el duelo: ${
          pArc ? pArc.nombre : "Arcano desconocido"
        } contra ${oArc ? oArc.nombre : "Arcano oculto"}. Tus atributos elegidos: ${
          chosenText || "ninguno"
        }.`
      );

      this.renderAll();
    });

    // Resolver tirada
    this.buttons["btn-resolver"].addEventListener("click", () => {
      if (!this.matchConfigured || this.game.gameOver) return;
      const result = this.game.resolverTirada(); // el motor devuelve detalles numéricos
      this.lastResolution = result || null;
      this.renderAll();
    });


    // Activar Destino
    this.buttons["btn-destino"].addEventListener("click", () => {
      if (!this.matchConfigured || this.game.gameOver) return;
      this.flags.destino = !this.flags.destino;
      this.game.currentTurn.destinoActivado = this.flags.destino;
      const destinoCard = this.game.currentTurn.player.destino;
      if (this.flags.destino) {
        this.appendOracleLog(
          `✦ Los hilos del destino se tensan: activas ${destinoCard ? `${destinoCard.nombre} (${destinoCard.id})` : "un augurio velado"}.`
        );
      } else {
        this.appendOracleLog("El destino queda en silencio. Los augurios se repliegan por ahora.");
      }
      this.renderControlStates();
    });

    // Activar Duelo espiritual
    this.buttons["btn-duelo"].addEventListener("click", () => {
      if (!this.matchConfigured || this.game.gameOver) return;
      this.flags.duelo = !this.flags.duelo;
      this.game.currentTurn.dueloEspiritual = this.flags.duelo;
      if (this.flags.duelo) {
        this.dueloRevelado = true;
        this.appendOracleLog("La Llama del Espíritu se agita: declaras un duelo espiritual.");
      } else {
        this.appendOracleLog("El duelo espiritual se disuelve; los espíritus vuelven a reposar.");
      }
      this.renderControlStates();
    });

    // Invocar Deidad (jugador)
    this.buttons["btn-deidad"].addEventListener("click", () => {
      if (!this.matchConfigured || this.game.gameOver) return;
      if (this.game.puedeActivarDeidad("player")) {
        const activated = this.game.activarDeidad("player");
        if (activated) {
          const deity = this.game.currentTurn.deityActive.player?.card;
          this.appendOracleLog(
            `✧ Invocas a ${deity ? deity.nombre : "una deidad"}; sus ecos resuenan en la arena.`
          );
        }
      }
      this.renderAll();
    });

    // Invocar Códice
    this.buttons["btn-codex-invocar"].addEventListener("click", () => {
      if (!this.matchConfigured || this.game.gameOver) return;
      this.flags.codexChoice =
        this.flags.codexChoice === "invocar" ? null : "invocar";
      this.game.currentTurn.codexChoice = this.flags.codexChoice;
      this.renderControlStates();
    });

    // Rechazar Códice
    this.buttons["btn-codex-rechazar"].addEventListener("click", () => {
      if (!this.matchConfigured || this.game.gameOver) return;
      this.flags.codexChoice =
        this.flags.codexChoice === "rechazar" ? null : "rechazar";
      this.game.currentTurn.codexChoice = this.flags.codexChoice;
      this.renderControlStates();
    });

        // Toggle panel Grimorio (solo mostrar/ocultar)
    this.buttons["btn-toggle-grimorio"].addEventListener("click", () => {
      this.toggleGrimorioPanel();
    });

    
  }

    toggleGrimorioPanel() {
    if (!this.grimorioPanel) return;
    const btn = this.buttons?.["btn-toggle-grimorio"];
    const isActive = this.grimorioPanel.classList.toggle("active");
    if (btn) {
      btn.textContent = isActive ? "Ocultar Códice" : "Ver Códice";
    }
  }

  setupOverlayClose() {
    if (!this.grimorioPanel) return;
    this.grimorioPanel.addEventListener("click", (ev) => {
      if (ev.target === this.grimorioPanel && this.grimorioPanel.classList.contains("active")) {
        this.toggleGrimorioPanel();
      }
    });
  }

  setupSetupModal() {
    if (!this.setupModal) return;
    this.setupModal.classList.remove("hidden");

    if (this.elementSelect) {
      this.elementSelect.innerHTML = "";
      ELEMENTAL_EFFECTS.forEach((el) => {
        const opt = document.createElement("option");
        opt.value = el.id;
        opt.textContent = `${el.nombre} (${el.elemento}) — ${el.descripcion}`;
        this.elementSelect.appendChild(opt);
      });
    }

    this.startGameBtn?.addEventListener("click", () => {
      const selectedMode = Array.from(this.modeOptions || []).find((r) => r.checked);
      const lpValue = selectedMode ? parseInt(selectedMode.value, 10) : 50;
      const name = (this.playerNameInput?.value || "").trim() || "Jugador";
      const elementId = this.elementSelect?.value;
      const elementCard = ELEMENTAL_EFFECTS.find((e) => e.id === elementId) || null;
      const avatarClass =
        Array.from(this.avatarOptions || []).find((r) => r.checked)?.value ||
        "avatar-sigil-1";
      const viewModeValue =
        Array.from(this.viewModeOptions || []).find((r) => r.checked)?.value ||
        "text";
      this.applyMatchConfig(name, lpValue, elementCard, avatarClass, viewModeValue);
    });
  }

  applyMatchConfig(name, lpValue, elementCard, avatarClass, viewMode = "text") {
    this.playerName = name;
    if (this.playerNameLabel) {
      this.playerNameLabel.textContent = name;
    }

    this.game.configureMatch(lpValue);
    this.game.setPlayerElement(elementCard);
    this.game.currentTurn.player.element = elementCard;
    this.playerAvatarClass = avatarClass || "avatar-sigil-1";
    this.opponentAvatarClass = this._randomOpponentAvatar(this.playerAvatarClass);
    this.prevLP = { player: lpValue, opponent: lpValue };
    this.flags = { destino: false, duelo: false, codexChoice: null };
    this.dueloRevelado = false;
    this.turnCounter = 1;
    this.oracleLog = [];
    this.lastLoggedTurn = null;
    this.lastResolution = null;
    this.loggedElementUse = { player: false, opponent: false };
    this.viewMode = viewMode;
    this.matchConfigured = true;

    this._applyAvatarClasses();

    // Limpiar log visual
    if (this.logContainer) {
      this.logContainer.innerHTML = "";
    }

    this.setupModal?.classList.add("hidden");
    this.renderAll();
  }

  setupThemeToggle() {
    if (!this.themeToggle) return;
    const stored = localStorage.getItem("arc_dstny_theme");
    this.currentTheme = stored === "light" ? "light" : "dark";
    this.applyTheme(this.currentTheme);

    this.themeToggle.addEventListener("click", () => {
      this.currentTheme = this.currentTheme === "dark" ? "light" : "dark";
      this.applyTheme(this.currentTheme);
      localStorage.setItem("arc_dstny_theme", this.currentTheme);
    });
  }

  applyTheme(theme) {
    const body = document.body;
    if (!body) return;
    body.classList.remove("theme-dark", "theme-light");
    body.classList.add(theme === "light" ? "theme-light" : "theme-dark");
    body.dataset.viewMode = this.viewMode || "text";
    if (this.themeToggle) {
      this.themeToggle.textContent = theme === "light" ? "☀️" : "🌙";
    }
  }


  // ===========================
  // Render principal
  // ===========================
  renderAll() {
    this.renderLP();
    this.renderPhaseSteps();
    this.renderOracleMessage();
    this.renderArcana();
    this.renderSupportCards();   // NUEVO
    this.renderAttributes();
    this.renderControlStates();
    this.updateLayoutOffsets();
}


  // ===========================
  // LP
  // ===========================
  renderLP() {
  const lpPlayer = Math.max(0, this.game.LP.player);
  const lpOpponent = Math.max(0, this.game.LP.opponent);

  // Texto principal
  this.playerLPbar.innerText = `${lpPlayer} LP`;
  this.opponentLPbar.innerText = `${lpOpponent} LP`;
  if (this.playerNameLabel) {
    this.playerNameLabel.textContent = this.playerName;
  }
  this._applyAvatarClasses();

  // Valor máximo "de referencia" para la barra (estilo TCG)
  const MAX_LP = this.game.startingLP || 50;

  // Jugador
  this._updateLPBar(
    lpPlayer,
    this.prevLP.player,
    MAX_LP,
    this.playerLPWrapper,
    this.playerLPBarFill,
    this.playerLPPercent
  );

  // Oponente
  this._updateLPBar(
    lpOpponent,
    this.prevLP.opponent,
    MAX_LP,
    this.opponentLPWrapper,
    this.opponentLPBarFill,
    this.opponentLPPercent
  );

  // Guardar como referencia para la próxima actualización
  this.prevLP.player = lpPlayer;
  this.prevLP.opponent = lpOpponent;
}

  _updateLPBar(current, previous, max, wrapper, fillEl, percentEl) {
    if (!wrapper || !fillEl || !percentEl) return;

    const safeMax = max > 0 ? max : 1;
    const ratio = Math.max(0, Math.min(current / safeMax, 1));
    const percent = Math.round(ratio * 100);

    // Ancho de la barra + texto de porcentaje
    fillEl.style.width = `${percent}%`;
    percentEl.textContent = `${percent}%`;

    // Color según porcentaje (verde / amarillo / rojo)
    if (percent > 60) {
      fillEl.style.background = "linear-gradient(90deg, #22c55e, #4ade80)";
      fillEl.style.boxShadow = "0 0 6px rgba(34, 197, 94, 0.8)";
    } else if (percent > 30) {
      fillEl.style.background = "linear-gradient(90deg, #eab308, #facc15)";
      fillEl.style.boxShadow = "0 0 6px rgba(234, 179, 8, 0.8)";
    } else {
      fillEl.style.background = "linear-gradient(90deg, #ef4444, #f97373)";
      fillEl.style.boxShadow = "0 0 6px rgba(239, 68, 68, 0.9)";
    }

    // Animación de daño / curación
    wrapper.classList.remove("damage", "heal");

    if (previous != null && current !== previous) {
      const cls = current < previous ? "damage" : "heal";
      wrapper.classList.add(cls);

      // Limpiamos la clase luego de la animación
      setTimeout(() => {
        wrapper.classList.remove(cls);
      }, 450);
    }
  }



  // ===========================
  // Pasos del Oráculo
  // ===========================
  renderPhaseSteps() {
    const phase = this.game.phase;

    const phaseLabel = {
      eleccion: "Fase de elección",
      oraculo: "Fase del Oráculo",
      resolucion: "Fase de resolución",
      fin: "Fin de partida",
    }[phase] || "Fase desconocida";

    const summary = `Estado actual: ${phaseLabel} · Tirada ${this.turnCounter}`;
    this.oraclePhaseSteps.innerText = summary;
  }

  // ===========================
  // Mensajes del Oráculo
  // ===========================
  renderOracleMessage() {
    const phase = this.game.phase;
    const locked = !this.matchConfigured;

    if (!this.oracleMessage) return;

    let msg = "";

    if (this.game.gameOver) {
      const winner = this.game.gameOver.winner;
      if (winner === "draw") msg = "Los hilos se detienen en equilibrio. No hay vencedor.";
      else if (winner === "player") msg = "El Oráculo susurra tu nombre: victoria sellada.";
      else msg = "El Oráculo se inclina por tu rival. La partida concluye.";
    } else if (locked) {
      msg = "Configura tu nombre, modo y elemento antes de despertar al Oráculo.";
    } else if (phase === "eleccion") {
      msg =
        "El Oráculo aguarda en silencio: traza dos atributos para esta tirada.";
    } else if (phase === "oraculo") {
      msg =
        "Las cartas quedan al descubierto. Activa Destino, convoca a los Dioses o pide al Códice.";
    } else if (phase === "resolucion") {
      const r = this.lastResolution;
      const codex = this.game.currentTurn.codexResult;

      if (!r) {
        msg =
          "La tirada se resuelve. Observa cómo se cruzan los hilos del destino.";
      } else {
        const dP = r.damageToPlayer || 0;
        const dO = r.damageToOpponent || 0;

        if (dP === 0 && dO === 0) {
          msg = "El Oráculo declara equilibrio: ningún filo alcanza al rival.";
        } else if (dO > dP) {
          msg = `Tus hilos superan la prueba: el rival recibe ${dO} de daño.`;
        } else if (dP > dO) {
          msg = `El destino te golpea: recibes ${dP} de daño directo.`;
        } else {
          msg = `Ambos quedan marcados: ${dP} puntos de daño para cada lado.`;
        }

        // Capa extra: resumen del Códice
        if (codex) {
          if (codex.applied) {
            msg += ` El Códice traza su línea: anula ${codex.atributo} del oponente.`;
          } else if (codex.reason === "backlash") {
            msg += ` El Códice no encuentra línea y te castiga con ${codex.backlash} de daño.`;
          } else if (codex.reason === "protected") {
            msg += ` El Códice intenta anular ${codex.atributo}, pero una deidad lo bloquea.`;
          } else if (codex.reason === "bias_block") {
            msg +=
              " El Códice se inclinó hacia las deidades y bloqueó tu intento de negación.";
          } else if (codex.reason === "rejected") {
            msg += " Elegiste no invocar el Códice en esta tirada.";
          }
        }
      }

      // Guardar en el log del Oráculo (una vez por tirada)
      if (this.lastResolution && this.lastLoggedTurn !== this.turnCounter) {
        const bundle = this._buildResolutionNarrative(msg);
        this.appendOracleLogBatch(bundle);
        this.lastLoggedTurn = this.turnCounter;
      }

    }

    this.oracleMessage.innerText = msg;

  }


  // ===========================
  // Arcano por lado
  // ===========================
  renderArcana() {
    const p = this.game.currentTurn.player.arcanoSlot;
    const o = this.game.currentTurn.opponent.arcanoSlot;
    const phase = this.game.phase;

    const showEmoji = this.viewMode !== "text";
    const showCard = this.viewMode === "card";
    const playerEmoji = showEmoji ? `${this._emojiForArcano(p)} ` : "";
    this.playerArcanoTitle.innerText = p ? `${playerEmoji}${p.nombre}` : "";

    if (p) {
      const slot = ARCANA_SLOTS[p.slotId];
      const antName =
        slot && slot.antagonistaSlot != null
          ? ARCANA_SLOTS[slot.antagonistaSlot]?.nombre || "—"
          : "—";
      const potName =
        slot && slot.potenciadorSlot != null
          ? ARCANA_SLOTS[slot.potenciadorSlot]?.nombre || "—"
          : "—";

      this.playerArcanoInfo.innerText =
        `Antagonista: ${antName} · Potenciador: ${potName}`;
    } else {
      this.playerArcanoInfo.innerText = "";
    }

    if (phase === "oraculo" || phase === "resolucion") {
      this.opponentArcanoTitle.innerText = o ? o.nombre : "???";

      if (o) {
        const slotO = ARCANA_SLOTS[o.slotId];
        const antO =
          slotO && slotO.antagonistaSlot != null
            ? ARCANA_SLOTS[slotO.antagonistaSlot]?.nombre || "—"
            : "—";
        const potO =
          slotO && slotO.potenciadorSlot != null
            ? ARCANA_SLOTS[slotO.potenciadorSlot]?.nombre || "—"
            : "—";
        this.opponentArcanoInfo.innerText =
          `Antagonista: ${antO} · Potenciador: ${potO}`;
      } else {
        this.opponentArcanoInfo.innerText = "???";
      }
      const opponentEmoji = showEmoji ? `${this._emojiForArcano(o)} ` : "";
      this.opponentArcanoTitle.innerText = o ? `${opponentEmoji}${o.nombre}` : "???";
    } else {
      this.opponentArcanoTitle.innerText = "???";
      this.opponentArcanoInfo.innerText = "";
      this.opponentArcanoTitle.innerText = showEmoji ? "❔ ???" : "???";
    }

    this._renderArcanoAttrs("player", this.playerArcanoAttrsEl);
    this._renderArcanoAttrs("opponent", this.opponentArcanoAttrsEl);

    this._renderArcanoVisual(this.playerArcanoVisual, p, showCard);
    this._renderArcanoVisual(this.opponentArcanoVisual, o, showCard);
  }

  // ===========================
  // Espíritu / Elemental / Destino / Deidad
  // ===========================
  renderSupportCards() {
    const turn = this.game.currentTurn;
    const phase = this.game.phase;

    if (!this.matchConfigured) {
      [this.playerSpiritInfo, this.playerElementInfo, this.playerDestinoInfo, this.playerDeidadInfo,
       this.opponentSpiritInfo, this.opponentElementInfo, this.opponentDestinoInfo, this.opponentDeidadInfo]
        .forEach((el) => {
          if (el) {
            el.classList.add("hidden-info");
            el.innerText = "???";
          }
        });
      this._setEmojiBadge(this.playerDestinoBadge, "");
      this._setEmojiBadge(this.playerDeidadBadge, "");
      this._setEmojiBadge(this.playerSpiritBadge, "");
      this._setEmojiBadge(this.playerElementBadge, "");
      this._setEmojiBadge(this.opponentDestinoBadge, "");
      this._setEmojiBadge(this.opponentDeidadBadge, "");
      this._setEmojiBadge(this.opponentSpiritBadge, "");
      this._setEmojiBadge(this.opponentElementBadge, "");
      return;
    }

    const p = turn.player;
    const o = turn.opponent;
    const duelUnlocked = this.dueloRevelado || !!turn.dueloEspiritual;

    // ---- Jugador ----
    if (this.playerSpiritInfo) {
      if (p.spirit) {
        this.playerSpiritInfo.classList.remove("hidden-info");
        this.playerSpiritInfo.innerText = `${p.spirit.nombre} — ${p.spirit.descripcion}`;
      } else {
        this.playerSpiritInfo.classList.add("hidden-info");
        this.playerSpiritInfo.innerText = "???";
      }
      this._setEmojiBadge(
        this.playerSpiritBadge,
        p.spirit ? this._emojiForSpirit(p.spirit) : "",
        "❔"
      );
    }

    if (this.playerElementInfo) {
      if (p.element) {
        this.playerElementInfo.classList.remove("hidden-info");
        const elem = p.element;
        this.playerElementInfo.innerText =
          `${elem.nombre} [${elem.elemento}] — ${elem.descripcion}`;
      } else {
        this.playerElementInfo.classList.add("hidden-info");
        this.playerElementInfo.innerText = "???";
      }
      this._setEmojiBadge(
        this.playerElementBadge,
        p.element ? this._emojiForElement(p.element) : "",
        "❔"
      );
    }

    if (this.playerDestinoInfo && p.destino) {
      const d = p.destino;
      const tipo = d.type === "A" ? "Augurio" : "Maldición";
      this.playerDestinoInfo.innerText =
        `${d.nombre} (${tipo} ${d.id}) — ${d.descripcion}`;
      this._setEmojiBadge(this.playerDestinoBadge, this._emojiForDestino(d), "❔");
    }

    if (this.playerDeidadInfo && p.deidad) {
      const d = p.deidad;
      this.playerDeidadInfo.innerText =
        `${d.nombre} (${d.cultura}) — ${d.descripcion}`;
      this._setEmojiBadge(this.playerDeidadBadge, this._emojiForDeidad(d), "❔");
    }

    // ---- Oponente ----
    const hideOpponentArcana = phase === "eleccion";
    const canRevealOpponent = duelUnlocked && !hideOpponentArcana;

    if (o.spirit) {
      if (this.opponentSpiritInfo) {
        if (canRevealOpponent) {
          this.opponentSpiritInfo.classList.remove("hidden-info");
          this.opponentSpiritInfo.innerText = `${o.spirit.nombre} — ${o.spirit.descripcion}`;
        } else {
          this.opponentSpiritInfo.classList.add("hidden-info");
          this.opponentSpiritInfo.innerText = "???";
        }
      }
      this._setEmojiBadge(
        this.opponentSpiritBadge,
        canRevealOpponent ? this._emojiForSpirit(o.spirit) : "",
        "❔"
      );
    }

    if (o.element) {
      const elemO = o.element;
      if (this.opponentElementInfo) {
        if (canRevealOpponent) {
          this.opponentElementInfo.classList.remove("hidden-info");
          this.opponentElementInfo.innerText =
            `${elemO.nombre} [${elemO.elemento}] — ${elemO.descripcion}`;
        } else {
          this.opponentElementInfo.classList.add("hidden-info");
          this.opponentElementInfo.innerText = "???";
        }
      }
      this._setEmojiBadge(
        this.opponentElementBadge,
        canRevealOpponent ? this._emojiForElement(elemO) : "",
        "❔"
      );
    }

    if (o.destino) {
      const dO = o.destino;
      const tipoO = dO.type === "A" ? "Augurio" : "Maldición";
      if (this.opponentDestinoInfo) {
        if (!hideOpponentArcana) {
          this.opponentDestinoInfo.classList.remove("hidden-info");
          this.opponentDestinoInfo.innerText =
            `${dO.nombre} (${tipoO} ${dO.id}) — ${dO.descripcion}`;
        } else {
          this.opponentDestinoInfo.classList.add("hidden-info");
          this.opponentDestinoInfo.innerText = "???";
        }
      }
      this._setEmojiBadge(
        this.opponentDestinoBadge,
        !hideOpponentArcana ? this._emojiForDestino(dO) : "",
        "❔"
      );
    }

    if (o.deidad) {
      const dO2 = o.deidad;
      if (this.opponentDeidadInfo) {
        if (!hideOpponentArcana) {
          this.opponentDeidadInfo.classList.remove("hidden-info");
          this.opponentDeidadInfo.innerText =
            `${dO2.nombre} (${dO2.cultura}) — ${dO2.descripcion}`;
        } else {
          this.opponentDeidadInfo.classList.add("hidden-info");
          this.opponentDeidadInfo.innerText = "???";
        }
      }
      this._setEmojiBadge(
        this.opponentDeidadBadge,
        !hideOpponentArcana ? this._emojiForDeidad(dO2) : "",
        "❔"
      );
    }
  }



  // ===========================
  // Atributos (botones)
  // ===========================
  renderAttributes() {
    this.renderAttrSet("player");
    this.renderAttrSet("opponent");
    this.renderBottomAttrButtons(); // sincroniza los botones grandes
  }

  renderAttrSet(owner) {
    const dom = owner === "player" ? this.playerAttrs : this.opponentAttrs;
    if (!dom) return;
    const attrs = this.game.currentTurn[owner].attrs;
    const chosen = this.game.currentTurn[owner].chosenAttrs;
    const phase = this.game.phase;

    dom.innerHTML = "";

    const keys = ["ATK", "DEF", "SPD", "MAG"];

    keys.forEach((key) => {
      const value = attrs[key];
      const btn = document.createElement("button");
      btn.classList.add("attr-btn");
      btn.innerText = `${key}: ${value}`;

      // Jugador puede elegir en fase de elección
      if (owner === "player" && phase === "eleccion" && this.matchConfigured && !this.game.gameOver) {
        btn.addEventListener("click", () => {
          this.game.elegirAtributo(owner, key);
          this.renderAll();
        });
      }

      // iluminado si fue elegido
      if (chosen.includes(key)) {
        btn.classList.add("attr-selected");
      }

      // Oponente oculto en fase de elección
      if (owner === "opponent" && phase === "eleccion") {
        btn.innerText = `${key}: ?`;
        btn.classList.add("attr-hidden");
      }

      // En fase Oráculo, mostramos valores y resaltamos elección del oponente
      if (owner === "opponent" && phase === "oraculo") {
        btn.innerText = `${key}: ${value}`;
        if (chosen.includes(key)) {
          btn.classList.add("attr-selected-opponent");
        }
      }

      // En resolución, todo visible
      if (owner === "opponent" && phase === "resolucion") {
        btn.innerText = `${key}: ${value}`;
        if (chosen.includes(key)) {
          btn.classList.add("attr-selected-opponent");
        }
      }

      dom.appendChild(btn);
    });
  }

  // ===========================
  // Estado visual de controles
  // ===========================
  renderControlStates() {
    const phase = this.game.phase;
    const locked = !this.matchConfigured || this.game.gameOver;

    const highlight = (id, on) => {
      const btn = this.buttons[id];
      if (!btn) return;
      if (on) btn.classList.add("control-btn--toggle-on");
      else btn.classList.remove("control-btn--toggle-on");
    };

    // Toggles visuales
    highlight("btn-destino", this.flags.destino);
    highlight("btn-duelo", this.flags.duelo);
    highlight("btn-codex-invocar", this.flags.codexChoice === "invocar");
    highlight("btn-codex-rechazar", this.flags.codexChoice === "rechazar");

    // Habilitar / deshabilitar según fase
    // Nueva tirada solo después de la resolución
    this.buttons["btn-new-turn"].disabled = locked || phase !== "resolucion";

    // Oráculo solo después de elegir 2 atributos del jugador
    this.buttons["btn-oraculo"].disabled =
      locked ||
      phase !== "eleccion" ||
      this.game.currentTurn.player.chosenAttrs.length < 2;

    // Resolver tirada SOLO en fase Oráculo (una vez que ya se reveló todo)
    this.buttons["btn-resolver"].disabled = locked || phase !== "oraculo";


    // Solo en fase Oráculo tiene sentido jugar con Deidad y Códice
    const inOraculo = phase === "oraculo";
    this.buttons["btn-deidad"].disabled = locked || !inOraculo;
    this.buttons["btn-codex-invocar"].disabled = locked || !inOraculo;
    this.buttons["btn-codex-rechazar"].disabled = locked || !inOraculo;
  }
  
  // ===========================
  // Exportar registro del Oráculo
  // ===========================
  exportOracleLog() {
    if (!this.oracleLog.length) {
      alert("Todavía no hay tiradas registradas por el Oráculo.");
      return;
    }

    const contenido = this.oracleLog.join("\n");
    const blob = new Blob([contenido], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "arc_dstny_oraculo_log.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  renderBottomAttrButtons() {
    const attrs = this.game.currentTurn.player.attrs;
    const chosen = this.game.currentTurn.player.chosenAttrs;
    const phase = this.game.phase;
    const locked = !this.matchConfigured || this.game.gameOver;
    const keys = ["ATK", "DEF", "SPD", "MAG"];

    keys.forEach((key) => {
      const id = `btn-attr-${key.toLowerCase()}`;
      const btn = this.buttons[id];
      if (!btn) return;

      btn.textContent = `${key}: ${attrs[key]}`;

      // estado visual (usamos la misma clase de toggle azul)
      btn.classList.remove("control-btn--toggle-on");
      if (chosen.includes(key)) {
        btn.classList.add("control-btn--toggle-on");
      }

      // solo clickeables en fase de elección
      btn.disabled = locked || phase !== "eleccion";
    });
  }

  _buildResolutionNarrative(summary) {
    const turn = this.game.currentTurn;
    const r = this.lastResolution || {};

    const arcP = turn.player.arcanoSlot?.nombre || "Arcano velado";
    const arcO = turn.opponent.arcanoSlot?.nombre || "Arcano oculto";

    const fmtChosen = (owner) => {
      const attrs = turn[owner].attrs;
      const chosen = turn[owner].chosenAttrs || [];
      if (!chosen.length) return "sin trazos declarados";
      return chosen.map((k) => `${k}: ${attrs[k]}`).join(" · ");
    };

    const lines = [];
    lines.push(`✦ El Oráculo susurra: ${summary}`);
    lines.push(`✺ Los hilos del destino enfrentan a ${arcP} contra ${arcO}.`);
    lines.push(
      `⫷ Trazos revelados → Tú (${fmtChosen("player")}) = ${r.baseP ?? "?"} · Rival (${fmtChosen("opponent")}) = ${r.baseO ?? "?"}.`
    );

    if (turn.destinoActivado && turn.player.destino) {
      const d = turn.player.destino;
      lines.push(`✧ El augurio ${d.nombre} (${d.id}) se activa y tiñe la tirada.`);
    }

    if (turn.opponent.destino) {
      const dO = turn.opponent.destino;
      lines.push(`✧ El rival deja fluir su destino ${dO.nombre} (${dO.id}).`);
    }

    if (turn.dueloEspiritual) {
      lines.push("⟡ Los espíritus chocan en duelo, buscando un alma que ceda.");
    }

    const activeDeity = turn.deityActive.player?.card;
    if (activeDeity) {
      lines.push(`✺ La deidad ${activeDeity.nombre} extiende su influencia (${activeDeity.duracionTurnos ?? 1} turno restante).`);
    }

    const codex = turn.codexResult;
    if (codex) {
      if (codex.applied) {
        lines.push(`⫸ El Códice traza su runa y anula ${codex.atributo} del rival.`);
      } else {
        const reasons = {
          backlash: `El Códice se revuelve y te hiere con ${codex.backlash} de castigo.`,
          protected: `Los dioses protegen ${codex.atributo}; el Códice no logra romper esa defensa.`,
          bias_block: "El sesgo de las deidades desvía el trazo del Códice.",
          rejected: "Decides no invocar el Códice; los símbolos quedan dormidos.",
          not_invoked: "El Códice queda en reposo, sin ser convocado.",
          no_potential: "Los trazos no forman figura para el Códice.",
        };
        lines.push(reasons[codex.reason] || "El Códice se mantiene en silencio.");
      }
    }

    const mentionElement = (owner, label) => {
      if (this.game.elementUsed[owner] && !this.loggedElementUse[owner]) {
        const elem = turn[owner].element;
        if (elem) {
          lines.push(
            `${label} invoca el eco elemental ${elem.nombre} (${elem.elemento}).`
          );
        }
        this.loggedElementUse[owner] = true;
      }
    };
    mentionElement("player", "✦ Tu esencia");
    mentionElement("opponent", "✦ El rival");

    lines.push(
      `◆ Daño infligido → Tú: ${r.damageToPlayer ?? 0} · Rival: ${r.damageToOpponent ?? 0}.`
    );
    lines.push(
      `◆ LP tras la sentencia → Tú: ${r.LP?.player ?? this.game.LP.player} · Rival: ${r.LP?.opponent ?? this.game.LP.opponent}.`
    );

    if (this.game.gameOver) {
      const outcome =
        this.game.gameOver.winner === "draw"
          ? "Equilibrio perfecto. No hay vencedor."
          : this.game.gameOver.winner === "player"
            ? "Victoria sellada en tu nombre."
            : "Los designios favorecen al rival.";
      lines.push(`✦ Los hilos se sellan: ${outcome}`);
    }

    return lines;
  }

  appendOracleLogBatch(entries = []) {
    const list = Array.isArray(entries) ? entries : [entries];
    list
      .slice()
      .reverse()
      .forEach((entry) => {
        if (entry) this.appendOracleLog(entry);
      });
  }

  appendOracleLog(text) {
    if (!this.matchConfigured) return;
    const stamped = `Tirada ${this.turnCounter}: ${text}`;
    this.oracleLog.unshift(stamped);

    if (this.logContainer) {
      const div = document.createElement("div");
      div.className = "oracle-log-entry";
      div.innerText = `⫷ ${stamped}`;
      this.logContainer.prepend(div);
      this.logContainer.scrollTop = 0;
    }
  }

  updateLayoutOffsets() {
    const topHeight = this.topBar?.offsetHeight;
    const controlsHeight = this.controlsBar?.offsetHeight;

    if (topHeight) {
      document.documentElement.style.setProperty(
        "--top-bar-height",
        `${topHeight}px`
      );
    }

    if (controlsHeight) {
      document.documentElement.style.setProperty(
        "--controls-bar-height",
        `${controlsHeight}px`
      );
    }
  }

  renderCodexMatrix() {
    if (!this.codexTable) return;
    const combos = [
      { player: "ATK + DEF", rival: "ATK + MAG", cancels: "MAG" },
      { player: "ATK + MAG", rival: "DEF + SPD", cancels: "SPD" },
      { player: "ATK + SPD", rival: "DEF + MAG", cancels: "MAG" },
      { player: "DEF + MAG", rival: "ATK + SPD", cancels: "SPD" },
      { player: "DEF + SPD", rival: "ATK + MAG", cancels: "MAG" },
      { player: "MAG + SPD", rival: "ATK + DEF", cancels: "DEF" },
    ];

    const wrapper = document.createElement("div");
    wrapper.className = "codex-grid";
    const header = document.createElement("div");
    header.className = "codex-grid__row codex-grid__row--head";
    ["Tus trazos", "Trazos rivales", "Atributo anulado"].forEach((txt) => {
      const cell = document.createElement("div");
      cell.textContent = txt;
      header.appendChild(cell);
    });
    wrapper.appendChild(header);

    combos.forEach((c) => {
      const row = document.createElement("div");
      row.className = "codex-grid__row";
      [c.player, c.rival, c.cancels].forEach((txt) => {
        const cell = document.createElement("div");
        cell.textContent = txt;
        row.appendChild(cell);
      });
      wrapper.appendChild(row);
    });

    this.codexTable.innerHTML = "";
    this.codexTable.appendChild(wrapper);
  }

  // BEGIN PATCH: emoji card rendering
  _setEmojiCard(el, emoji, placeholder = "") {
    if (!el) return;
    if (this.useEmojiView) {
      const val = emoji || placeholder || "❔";
      el.textContent = val;
      el.classList.add("emoji-card");
    } else {
      el.textContent = "";
      el.classList.remove("emoji-card");
    }
  }

  _setEmojiBadge(el, emoji, placeholder = "") {
    if (!el) return;
    const showEmoji = this.viewMode !== "text";
    if (showEmoji) {
      el.textContent = emoji || placeholder || "❔";
      el.classList.add("emoji-card");
    } else {
      el.textContent = "";
      el.classList.remove("emoji-card");
    }
  }

  _emojiForArcano(card) {
    if (!card) return "❔";
    return EMOJI_ARCANA_MAP[card.nombre] || "✦";
  }

  _emojiForDestino(card) {
    if (!card) return "❔";
    return EMOJI_DESTINO_MAP[card.id] || "🔮";
  }

  _emojiForDeidad(card) {
    if (!card) return "❔";
    return EMOJI_DEIDAD_MAP[card.id] || "⛧";
  }

  _emojiForElement(card) {
    if (!card) return "❔";
    return EMOJI_ELEMENTO_MAP[card.elemento] || "🜁";
  }

  _emojiForSpirit(card) {
    if (!card) return "❔";
    return EMOJI_SPIRIT;
  }

  _renderArcanoVisual(el, card, show) {
    if (!el) return;
    if (!show || !card) {
      el.style.display = "none";
      el.style.backgroundImage = "";
      el.textContent = "";
      return;
    }
    el.style.display = "grid";
    const imgUrl = card.imagen || card.image || null;
    if (imgUrl) {
      el.style.backgroundImage = `url('${imgUrl}')`;
      el.style.backgroundSize = "cover";
      el.style.backgroundPosition = "center";
      el.textContent = "";
    } else {
      el.style.backgroundImage = "";
      el.textContent = card.nombre || "Carta";
    }
  }

  _renderArcanoAttrs(owner, targetEl) {
    if (!targetEl) return;
    if (!this.matchConfigured) {
      targetEl.innerHTML = "";
      return;
    }
    const phase = this.game.phase;
    const attrs = this.game.currentTurn[owner].attrs;
    const isOpponent = owner === "opponent";
    const hide = isOpponent && phase === "eleccion";

    const chosen = this.game.currentTurn[owner].chosenAttrs || [];
    const pairs = ["ATK", "DEF", "SPD", "MAG"].map((k) => {
      const val = hide ? "?" : attrs[k];
      const isSelected = chosen.includes(k);
      return { label: `${k}: ${val}`, selected: isSelected };
    });

    targetEl.innerHTML = "";
    pairs.forEach((pair) => {
      const pill = document.createElement("span");
      pill.className = "card-attr-pill";
      if (pair.selected) pill.classList.add("card-attr-pill--selected");
      pill.innerText = pair.label;
      targetEl.appendChild(pill);
    });
  }
  // END PATCH

  _applyAvatarClasses() {
    const apply = (el, cls) => {
      if (!el) return;
      el.className = `lp-avatar ${cls}`;
    };
    apply(this.playerAvatarEl, this.playerAvatarClass);
    apply(this.opponentAvatarEl, this.opponentAvatarClass);
  }

  _randomOpponentAvatar(exclude) {
    const avatars = ["avatar-sigil-1", "avatar-sigil-2", "avatar-sigil-3"].filter(
      (a) => a !== exclude
    );
    return avatars[Math.floor(Math.random() * avatars.length)];
  }
}
