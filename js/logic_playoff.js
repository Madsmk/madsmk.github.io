/**
 * Build Round of 32 matchups for FIFA WC 2026 (48 teams, 12 groups, 8 best 3rd-place).
 *
 * @param {string[]} bestThirdGroups - Array of 8 group letters that qualified as best 3rd-place, e.g. ['E','J','I','F','H','G','L','K'].
 * @param {Record<string, Record<string, string>>} ANNEX_C - Lookup table produced from Annex C:
 *        key = sorted groups joined by ',' (e.g. "E,F,G,H,I,J,K,L")
 *        value = mapping { A:'E', B:'J', D:'I', E:'F', G:'H', I:'G', K:'L', L:'K' }
 *
 * @returns {Array<{matchNo:number, home:string, away:string, type:'fixed'|'annex'}>}
 */
export function buildRoundOf32Matchups(bestThirdGroups, ANNEX_C) {
  // --- Validation ---
  if (!Array.isArray(bestThirdGroups)) {
    throw new Error("bestThirdGroups must be an array of group letters.");
  }
  const uniq = [...new Set(bestThirdGroups.map(g => String(g).trim().toUpperCase()))];
  if (uniq.length !== 8) {
    throw new Error(`bestThirdGroups must contain exactly 8 unique group letters. Got: ${uniq.length}`);
  }
  // Ensure they are letters A-L
  const invalid = uniq.filter(g => !/^[A-L]$/.test(g));
  if (invalid.length) {
    throw new Error(`Invalid group letters in bestThirdGroups: ${invalid.join(", ")}`);
  }

  const key = uniq.slice().sort().join(",");
  const mapping = ANNEX_C[key];
  if (!mapping) {
    throw new Error(`No Annex C mapping found for key: ${key}`);
  }

  // Helper to make "3X" string
  const third = (grpLetter) => `3${grpLetter}`;

  // Extra safety: the mapped opponents should be among the qualified 3rd-place groups
  const mappedThirdGroups = Object.values(mapping);
  const missing = mappedThirdGroups.filter(g => !uniq.includes(g));
  if (missing.length) {
    // Not fatal (but indicates mismatch between input and mapping table)
    console.warn(`Annex mapping refers to third-place groups not in bestThirdGroups: ${missing.join(", ")}`);
  }

  // --- Round of 32 match list (match numbers aligned with published bracket lists) ---
  // Fixed matches + Annex-dependent matches.
  // Annex-dependent ones are exactly for winners of A,B,D,E,G,I,K,L (columns in Annex C).
  const matches = [
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

  return matches;
}



/**[1](https://www.foxsports.com/soccer/2026-fifa-world-cup/bracket)[2](https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_knockout_stage)
  return [
    { matchNo: 89, home: W(73), away: W(75), from: [73, 75] }, // W73 vs W75
    { matchNo: 90, home: W(74), away: W(77), from: [74, 77] }, // W74 vs W77
    { matchNo: 91, home: W(76), away: W(78), from: [76, 78] }, // W76 vs W78
    { matchNo: 92, home: W(79), away: W(80), from: [79, 80] }, // W79 vs W80
    { matchNo: 93, home: W(81), away: W(82), from: [81, 82] }, // W81 vs W82
    { matchNo: 94, home: W(83), away: W(84), from: [83, 84] }, // W83 vs W84
    { matchNo: 95, home: W(85), away: W(87), from: [85, 87] }, // W85 vs W87
    { matchNo: 96, home: W(86), away: W(88), from: [86, 88] }, // W86 vs W88
  ];
}


 * Build Round of 16 matchups (R16) from Round of 32 matchups (R32).
 * Uses fixed bracket wiring for WC 2026:
 *  - W73 vs W75
 *  - W74 vs W77
 *  - W76 vs W78
 *  - W79 vs W80
 *  - W81 vs W82
 *  - W83 vs W84
 *  - W85 vs W87
 *  - W86 vs W88
 *
 * Sources: Published WC 2026 bracket wiring (Round of 16 shows W74-W77 etc.) [1](https://www.foxsports.com/soccer/2026-fifa-world-cup/bracket)[2](https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_knockout_stage)
 *
 * @param {Array<{matchNo:number}>} roundOf32Matchups - output from buildRoundOf32Matchups
 * @returns {Array<{matchNo:number, home:string, away:string, from:number[]}>}
 */
export function buildRoundOf16Matchups(roundOf32Matchups) {
  if (!Array.isArray(roundOf32Matchups)) {
    throw new Error("roundOf32Matchups must be an array (output from buildRoundOf32Matchups).");
  }

  const matchNos = new Set(roundOf32Matchups.map(m => m.matchNo));
  const required = Array.from({ length: 16 }, (_, i) => 73 + i); // 73..88
  const missing = required.filter(n => !matchNos.has(n));
  if (missing.length) {
    throw new Error(
      `roundOf32Matchups is missing Round of 32 match numbers: ${missing.join(", ")}`
    );
  }

  // Helper: winner label for match number
  const W = (n) => `W${n}`;

  // Fixed wiring (8 matches). Match numbers 89-96 are commonly used for R16,

/**
 * Build Quarterfinal matchups (QF) from Round of 16 matchups (R16).
 * Fixed bracket wiring for WC 2026:
 *  - W89 vs W90
 *  - W91 vs W92
 *  - W93 vs W94
 *  - W95 vs W96
 *
 * Sources: Published WC 2026 bracket wiring shows QF as W89-W90, W91-W92, W93-W94, W95-W96. [1](https://www.foxsports.com/soccer/2026-fifa-world-cup/bracket)[2](https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_knockout_stage)
 *
 * @param {Array<{matchNo:number, home:string, away:string}>} r16 - output from buildRoundOf16Matchups(...)
 * @returns {Array<{matchNo:number, home:string, away:string, from:number[]}>}
 */
export function buildQuarterfinalMatchups(r16) {
  if (!Array.isArray(r16)) {
    throw new Error("r16 must be an array (output from buildRoundOf16Matchups).");
  }

  // R16 match numbers expected: 89..96 (8 matches)
  const matchNos = new Set(r16.map(m => m.matchNo));
  const required = Array.from({ length: 8 }, (_, i) => 89 + i); // 89..96
  const missing = required.filter(n => !matchNos.has(n));
  if (missing.length) {
    throw new Error(`r16 is missing Round of 16 match numbers: ${missing.join(", ")}`);
  }

  const W = (n) => `W${n}`;

  // Quarterfinals are commonly numbered 97..100 in the published bracket. [1](https://www.foxsports.com/soccer/2026-fifa-world-cup/bracket)[2](https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_knockout_stage)
  return [
    { matchNo: 97, home: W(89), away: W(90), from: [89, 90] },  // QF1
    { matchNo: 98, home: W(91), away: W(92), from: [91, 92] },  // QF2
    { matchNo: 99, home: W(93), away: W(94), from: [93, 94] },  // QF3
    { matchNo: 100, home: W(95), away: W(96), from: [95, 96] }, // QF4
  ];
}

/**
 * Build Semifinal matchups (SF) from Quarterfinal matchups (QF).
 * Fixed bracket wiring for WC 2026:
 *  - W97 vs W98
 *  - W99 vs W100
 *
 * Sources: Published WC 2026 bracket wiring shows SF as W97-W98 and W99-W100. [1](https://www.foxsports.com/soccer/2026-fifa-world-cup/bracket)[2](https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/knockout-stage-match-schedule-bracket)[3](https://www.foxsports.com/soccer/2026-fifa-world-cup/bracket)
 *
 * @param {Array<{matchNo:number, home:string, away:string}>} qf - output from buildQuarterfinalMatchups(...)
 * @returns {Array<{matchNo:number, home:string, away:string, from:number[]}>}
 */
export function buildSemifinalMatchups(qf) {
  if (!Array.isArray(qf)) {
    throw new Error("qf must be an array (output from buildQuarterfinalMatchups).");
  }

  // QF match numbers expected: 97..100 (4 matches)
  const matchNos = new Set(qf.map(m => m.matchNo));
  const required = [97, 98, 99, 100];
  const missing = required.filter(n => !matchNos.has(n));
  if (missing.length) {
    throw new Error(`qf is missing Quarterfinal match numbers: ${missing.join(", ")}`);
  }

  const W = (n) => `W${n}`;

  // Semifinals are commonly numbered 101..102 in the published bracket. [1](https://www.foxsports.com/soccer/2026-fifa-world-cup/bracket)[2](https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/knockout-stage-match-schedule-bracket)[3](https://www.foxsports.com/soccer/2026-fifa-world-cup/bracket)
  return [
    { matchNo: 101, home: W(97),  away: W(98),  from: [97, 98] },   // SF1
    { matchNo: 102, home: W(99),  away: W(100), from: [99, 100] },  // SF2
  ];
}

/**
 * Build Final and Third Place matchups from Semifinals (SF).
 * Fixed bracket wiring for WC 2026:
 *  - Final:       W101 vs W102  (match 104)
 *  - Third place: L101 vs L102  (match 103)
 *
 * @param {Array<{matchNo:number, home:string, away:string}>} sf
 *        Output from buildSemifinalMatchups(...)
 *
 * @returns {{
 *   final: { matchNo:number, home:string, away:string, from:number[] },
 *   thirdPlace: { matchNo:number, home:string, away:string, from:number[] }
 * }}
 */
export function buildFinalMatchups(sf) {
  if (!Array.isArray(sf)) {
    throw new Error("sf must be an array (output from buildSemifinalMatchups).");
  }

  // Semifinal match numbers expected
  const matchNos = new Set(sf.map(m => m.matchNo));
  const required = [101, 102];
  const missing = required.filter(n => !matchNos.has(n));
  if (missing.length) {
    throw new Error(`sf is missing Semifinal match numbers: ${missing.join(", ")}`);
  }

  const W = (n) => `W${n}`;
  const L = (n) => `L${n}`;

  return {
    final: {
      matchNo: 104,
      home: W(101),
      away: W(102),
      from: [101, 102]
    },
    thirdPlace: {
      matchNo: 103,
      home: L(101),
      away: L(102),
      from: [101, 102]
    }
  };
}

