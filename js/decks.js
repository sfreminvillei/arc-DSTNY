// js/decks.js
import {
  ARCANA_SLOTS,
  DESTINOS,
  DEIDADES,
  SPIRIT_CARD,
  ELEMENTAL_EFFECTS,
} from "./cards.js";

// 🃏 Deck de iniciación estándar
// (lo que cualquier jugador recibe para poder jugar una partida básica)
export const INITIATION_DECK = {
  spirit: SPIRIT_CARD,
  elementals: ELEMENTAL_EFFECTS.slice(0, 5), // 5 efectos elementales
  deidades: DEIDADES.slice(0, 11),          // 11 deidades
  destinos: DESTINOS.slice(0, 22),          // 22 destinos (11 A + 11 M)
  arcanos: ARCANA_SLOTS.slice(0, 22),       // las 22 casillas arcanas
};

// 🧩 Esquema esperado para un deck personalizado
// (para cuando carguemos JSON del jugador)
export function normalizeDeckObject(deckObj = {}) {
  return {
    spirit: deckObj.spirit || SPIRIT_CARD,
    elementals: deckObj.elementals || ELEMENTAL_EFFECTS.slice(0, 5),
    deidades: deckObj.deidades || DEIDADES.slice(0, 11),
    destinos: deckObj.destinos || DESTINOS.slice(0, 22),
    arcanos: deckObj.arcanos || ARCANA_SLOTS.slice(0, 22),
  };
}
