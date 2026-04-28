/**
 * Sorterer en runde slik at kampene som møtes i neste runde
 * står ved siden av hverandre visuelt.
 *
 * @param {Array} currentMatches  f.eks. r32
 * @param {Array} nextMatches     f.eks. r16
 * @returns {Array} sortert liste av currentMatches
 */
function orderByNextRound(currentMatches, nextMatches) {
  if (!Array.isArray(nextMatches)) return currentMatches;

  const byNo = new Map(currentMatches.map(m => [m.matchNo, m]));
  const ordered = [];

  // Gå i riktig tre-rekkefølge via "from" i neste runde
  nextMatches.forEach(nm => {
    if (!Array.isArray(nm.from)) return;
    nm.from.forEach(srcNo => {
      const match = byNo.get(srcNo);
      if (match) ordered.push(match);
    });
  });

  // Fallback: legg til evt. matcher som ikke ble brukt
  const used = new Set(ordered.map(m => m.matchNo));
  currentMatches.forEach(m => {
    if (!used.has(m.matchNo)) ordered.push(m);
  });

  return ordered;
}

export function renderPlayoffTree(knockout, resolveName, pickWinnerSide) {
  if (!knockout) return;

  const { r32, r16, qf, sf, fm } = knockout;

  const qs = (sel) => document.querySelector(sel);

  const containers = {
    r32: qs('.sluttspillTreTable .round32'),
    r16: qs('.sluttspillTreTable .round16'),
    qf:  qs('.sluttspillTreTable .quarterfinals'),
    sf:  qs('.sluttspillTreTable .semifinals'),
    final: qs('.sluttspillTreTable .final'),
  };

  // Guard + clear
  for (const [k, el] of Object.entries(containers)) {
    if (!el) {
      console.error(`Fant ikke container for ${k} i .sluttspillTreTable`);
      return;
    }
    el.innerHTML = '';
  }

  const nameOf = (seed) => (typeof resolveName === 'function' ? resolveName(seed) : String(seed));
  const winnerSideOf = (homeSeed, awaySeed) =>
    (typeof pickWinnerSide === 'function' ? pickWinnerSide(homeSeed, awaySeed) : null);

  // Render én runde som "tabellruter": N rader = antall kamper
  const renderRound = (matches, containerEl, roundKey) => {
    // Lager "ruter": 16 rader for R32, 8 for R16, osv.
    containerEl.style.gridTemplateRows = `repeat(${matches.length}, 1fr)`;

    matches.forEach((match, i) => {
      renderMatch(containerEl, match, i, roundKey, nameOf, winnerSideOf);
    });
  };

  // r16, qf, sf, fm kommer fra knockout
  const r32Ordered = orderByNextRound(r32, r16);  // R32 sorteres etter R16.from
  const r16Ordered = orderByNextRound(r16, qf);   // R16 sorteres etter QF.from
  const qfOrdered  = orderByNextRound(qf, sf);    // QF sorteres etter SF.from
  const sfOrdered  = sf;                          // to matcher; rekkefølge ok

  renderRound(r32Ordered, containers.r32, 'r32');
  renderRound(r16Ordered, containers.r16, 'r16');
  renderRound(qfOrdered,  containers.qf,  'qf');
  renderRound(sfOrdered,  containers.sf,  'sf');

  // Final-kolonnen: 2 rader (finale + bronse)
  containers.final.style.gridTemplateRows = 'repeat(2, 1fr)';
  renderMatch(containers.final, fm.final, 0, 'final', nameOf, winnerSideOf);
  renderMatch(containers.final, fm.thirdPlace, 1, 'final', nameOf, winnerSideOf);
}

/**
 * Render én match og plasser den i grid-row (i+1).
 * Dette gir deterministisk plassering ("tabellrute").
 */
export function renderMatch(containerEl, match, indexInRound, roundKey, nameOf, winnerSideOf) {
  const homeSeed = match.home;
  const awaySeed = match.away;

  function splitNameRank(text) {
    const m = /^(.*?)(?:\s*\(#(\d+)\))?$/.exec(text);
    return {
      name: m?.[1] ?? text,
      rank: m?.[2] ?? null
    };
  }

  const home = splitNameRank(nameOf(homeSeed));
  const away = splitNameRank(nameOf(awaySeed));


  const winSide = winnerSideOf(homeSeed, awaySeed); // 'home'|'away'|null
  const homeClass = winSide ? (winSide === 'home' ? 'winner' : 'loser') : '';
  const awayClass = winSide ? (winSide === 'away' ? 'winner' : 'loser') : '';

  const fromAttr = Array.isArray(match.from) ? ` data-from="${match.from.join(',')}"` : '';

  containerEl.insertAdjacentHTML(
    'beforeend',
    `
      <div class="match" data-match="${match.matchNo}">
        <div class="team home ${homeClass}">
          <div class="team-name">${home.name}</div>
          ${home.rank ? `<div class="team-rank">#${home.rank}</div>` : ''}
        </div>
        <div class="team away ${awayClass}">
          <div class="team-name">${away.name}</div>
          ${away.rank ? `<div class="team-rank">#${away.rank}</div>` : ''}
        </div>
      </div>
    `
  );
}