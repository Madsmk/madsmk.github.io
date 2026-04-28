/**
 * Knockout builder utilities for FIFA WC 2026
 * Round of 32 (73-88) -> Round of 16 (89-96) -> QF (97-100) -> SF (101-102) -> 3rd (103) + Final (104)
 */

/**
 * Build Round of 32 matchups for FIFA WC 2026 (48 teams, 12 groups, 8 best 3rd-place).
 *
 * @param {string[]} bestThirdGroups - Array of 8 group letters that qualified as best 3rd-place.
 * @param {Record<string, Record<string, string>>} ANNEX_C - Lookup table from Annex C:
 *        key = sorted groups joined by ',' (e.g. "E,F,G,H,I,J,K,L")
 *        value = mapping { A:'E', B:'J', D:'I', E:'F', G:'H', I:'G', K:'L', L:'K' }
 *
 * @returns {Array<{matchNo:number, home:string, away:string, type:'fixed'|'annex'}>}
 */
export function buildRoundOf32Matchups(bestThirdGroups, ANNEX_C) {
  if (!Array.isArray(bestThirdGroups)) {
    throw new Error("bestThirdGroups must be an array of group letters.");
  }

  const uniq = [...new Set(bestThirdGroups.map(g => String(g).trim().toUpperCase()))];
  if (uniq.length !== 8) {
    throw new Error(`bestThirdGroups must contain exactly 8 unique group letters. Got: ${uniq.length}`);
  }

  const invalid = uniq.filter(g => !/^[A-L]$/.test(g));
  if (invalid.length) {
    throw new Error(`Invalid group letters in bestThirdGroups: ${invalid.join(", ")}`);
  }

  const key = uniq.slice().sort().join(",");
  const mapping = ANNEX_C[key];
  if (!mapping) {
    throw new Error(`No Annex C mapping found for key: ${key}`);
  }

  const third = (grpLetter) => `3${grpLetter}`;

  // Optional sanity check: all mapped third groups should be among the 8 qualified groups
  const mappedThirdGroups = Object.values(mapping);
  const missing = mappedThirdGroups.filter(g => !uniq.includes(g));
  if (missing.length) {
    console.warn(`Annex mapping refers to third-place groups not in bestThirdGroups: ${missing.join(", ")}`);
  }

  // Round of 32 match list (match numbers 73..88)
  return [
    { matchNo: 73, home: "2A", away: "2B", type: "fixed" },

    { matchNo: 74, home: "1E", away: third(mapping.E), type: "annex" },
    { matchNo: 75, home: "1F", away: "2C", type: "fixed" },
    { matchNo: 76, home: "1C", away: "2F", type: "fixed" },

    { matchNo: 77, home: "1I", away: third(mapping.I), type: "annex" },
    { matchNo: 78, home: "2E", away: "2I", type: "fixed" },

    { matchNo: 79, home: "1A", away: third(mapping.A), type: "annex" },
    { matchNo: 80, home: "1L", away: third(mapping.L), type: "annex" },

    { matchNo: 81, home: "1D", away: third(mapping.D), type: "annex" },
    { matchNo: 82, home: "1G", away: third(mapping.G), type: "annex" },

    { matchNo: 83, home: "2K", away: "2L", type: "fixed" },
    { matchNo: 84, home: "1H", away: "2J", type: "fixed" },

    { matchNo: 85, home: "1B", away: third(mapping.B), type: "annex" },
    { matchNo: 86, home: "1J", away: "2H", type: "fixed" },

    { matchNo: 87, home: "1K", away: third(mapping.K), type: "annex" },
    { matchNo: 88, home: "2D", away: "2G", type: "fixed" },
  ];
}

export function buildRoundOf16Matchups(roundOf32Matchups) {
  if (!Array.isArray(roundOf32Matchups)) {
    throw new Error("roundOf32Matchups must be an array.");
  }

  const matchNos = new Set(roundOf32Matchups.map(m => m.matchNo));
  const required = Array.from({ length: 16 }, (_, i) => 73 + i); // 73..88
  const missing = required.filter(n => !matchNos.has(n));
  if (missing.length) {
    throw new Error(`Missing R32 matches: ${missing.join(", ")}`);
  }

  const W = (n) => `W${n}`;

  return [
    { matchNo: 89, home: W(74), away: W(77), from: [74, 77] },
    { matchNo: 90, home: W(73), away: W(75), from: [73, 75] },
    { matchNo: 91, home: W(76), away: W(78), from: [76, 78] },
    { matchNo: 92, home: W(79), away: W(80), from: [79, 80] },
    { matchNo: 93, home: W(83), away: W(84), from: [83, 84] },
    { matchNo: 94, home: W(81), away: W(82), from: [81, 82] },
    { matchNo: 95, home: W(86), away: W(88), from: [86, 88] },
    { matchNo: 96, home: W(85), away: W(87), from: [85, 87] },
  ];
}

export function buildQuarterfinalMatchups(r16) {
  const matchNos = new Set(r16.map(m => m.matchNo));
  const required = [89,90,91,92,93,94,95,96];
  const missing = required.filter(n => !matchNos.has(n));
  if (missing.length) throw new Error(`Missing R16 matches: ${missing.join(", ")}`);

  const W = (n) => `W${n}`;

  return [
    { matchNo: 97,  home: W(89), away: W(90), from: [89, 90] },
    { matchNo: 98,  home: W(93), away: W(94), from: [93, 94] },
    { matchNo: 99,  home: W(91), away: W(92), from: [91, 92] },
    { matchNo: 100, home: W(95), away: W(96), from: [95, 96] },
  ];
}

/**
 * Build Semifinal matchups (SF) from Quarterfinals (QF).
 *
 * @param {Array<{matchNo:number}>} qf
 * @returns {Array<{matchNo:number, home:string, away:string, from:number[]}>}
 */
export function buildSemifinalMatchups(qf) {
  if (!Array.isArray(qf)) {
    throw new Error("qf must be an array (output from buildQuarterfinalMatchups).");
  }

  const matchNos = new Set(qf.map(m => m.matchNo));
  const required = [97, 98, 99, 100];
  const missing = required.filter(n => !matchNos.has(n));
  if (missing.length) {
    throw new Error(`qf is missing Quarterfinal match numbers: ${missing.join(", ")}`);
  }

  const W = (n) => `W${n}`;

  return [
    { matchNo: 101, home: W(97), away: W(98), from: [97, 98] },
    { matchNo: 102, home: W(99), away: W(100), from: [99, 100] },
  ];
}

/**
 * Build Final + Third place from Semifinals (SF).
 *
 * @param {Array<{matchNo:number}>} sf
 * @returns {{
 *   final: { matchNo:number, home:string, away:string, from:number[] },
 *   thirdPlace: { matchNo:number, home:string, away:string, from:number[] }
 * }}
 */
export function buildFinalMatchups(sf) {
  if (!Array.isArray(sf)) {
    throw new Error("sf must be an array (output from buildSemifinalMatchups).");
  }

  const matchNos = new Set(sf.map(m => m.matchNo));
  const required = [101, 102];
  const missing = required.filter(n => !matchNos.has(n));
  if (missing.length) {
    throw new Error(`sf is missing Semifinal match numbers: ${missing.join(", ")}`);
  }

  const W = (n) => `W${n}`;
  const L = (n) => `L${n}`;

  return {
    thirdPlace: { matchNo: 103, home: L(101), away: L(102), from: [101, 102] },
    final:      { matchNo: 104, home: W(101), away: W(102), from: [101, 102] },
  };
}

function orderByNextRound(currentMatches, nextMatches) {
  const byNo = new Map(currentMatches.map(m => [m.matchNo, m]));
  const out = [];

  // Gå gjennom neste runde i ønsket rekkefølge, og ta 'from'-matchene i den rekkefølgen
  nextMatches.forEach(nm => {
    (nm.from ?? []).forEach(srcNo => {
      const m = byNo.get(srcNo);
      if (m) out.push(m);
    });
  });

  // fallback: hvis noe mangler (burde ikke), legg til resten
  const used = new Set(out.map(m => m.matchNo));
  currentMatches.forEach(m => { if (!used.has(m.matchNo)) out.push(m); });

  return out;
}

