// js/grimoire.js

// Ejemplo de matriz del Códice (placeholder)
export const GRIMOIRE_CODEX_MATRIX = [
  // Podés representarlo como tabla de relaciones de ATK/DEF/SPD/MAG
];

export function evaluarCodice(chosenPlayer, chosenOpponent) {
  // chosenPlayer / chosenOpponent: ["ATK", "DEF"], etc.
  // Devuelve un objeto tipo:
  // { hit: true/false, atributoAnulado: "ATK" | null }
  // Por ahora devolvemos algo simplificado:

  const setP = new Set(chosenPlayer);
  const inter = chosenOpponent.filter((a) => setP.has(a));

  if (inter.length > 0) {
    return {
      hit: true,
      atributoAnulado: inter[0], // el primero que coincida
    };
  }

  return {
    hit: false,
    atributoAnulado: null,
  };
}
