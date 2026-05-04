
// FIFA 2026 – visuell rekkefølge for Round of 32
const R32_VISUAL_ORDER = [
  73, 74, 75, 76,
  79, 80, 77, 78,
  83, 84, 81, 82,
  86, 88, 85, 87
];


/**
 * Sorterer en runde slik at kampene som møtes i neste runde
 * står ved siden av hverandre visuelt (ekte sluttspilltre).
 */
function orderByNextRound(currentMatches, nextMatches) {
  if (!Array.isArray(nextMatches)) return currentMatches;

  const byNo = new Map(currentMatches.map(m => [m.matchNo, m]));
  const ordered = [];

  nextMatches.forEach(nm => {
    if (!Array.isArray(nm.from)) return;
    nm.from.forEach(srcNo => {
      const m = byNo.get(srcNo);
      if (m) ordered.push(m);
    });
  });

  const used = new Set(ordered.map(m => m.matchNo));
  currentMatches.forEach(m => {
    if (!used.has(m.matchNo)) ordered.push(m);
  });

  return ordered;
}

/**
 * Renderer hele sluttspilltreet
 */
export function renderPlayoffTree(knockout, resolveName, pickWinnerSide) {
  if (!knockout) return;

  const { r32, r16, qf, sf, fm } = knockout;
  const qs = sel => document.querySelector(sel);

  const containers = {
    r32:  qs('.sluttspillTreTable .round32'),
    r16:  qs('.sluttspillTreTable .round16'),
    qf:   qs('.sluttspillTreTable .quarterfinals'),
    sf:   qs('.sluttspillTreTable .semifinals'),
    final:qs('.sluttspillTreTable .final')
  };

  for (const el of Object.values(containers)) {
    if (!el) {
      console.error('Sluttspill-container mangler i DOM');
      return;
    }
    el.innerHTML = '';
  }

  const nameOf = seed =>
    typeof resolveName === 'function' ? resolveName(seed) : String(seed);

  const winnerSideOf = (h, a) =>
    typeof pickWinnerSide === 'function' ? pickWinnerSide(h, a) : null;

  /**
   * ✅ HELT AVGJØRENDE:
   * Vi OPPRETTER grid-rader eksplisitt her.
   * Uten dette får du ALLTID toppjustering.
   */
  const renderRound = (matches, containerEl, roundKey) => {
    containerEl.style.gridTemplateRows = `repeat(${matches.length}, 1fr)`;
    containerEl.style.gridAutoRows = '1fr';

    matches.forEach((match, i) => {
      renderMatch(containerEl, match, i, roundKey, nameOf, winnerSideOf);
    });
  };

  
  const r32ByNo = new Map(r32.map(m => [m.matchNo, m]));
  const r32Ordered = R32_VISUAL_ORDER
    .map(no => r32ByNo.get(no))
    .filter(Boolean);
  const r16Ordered = orderByNextRound(r16, qf);
  const qfOrdered  = orderByNextRound(qf, sf);

  renderRound(r32Ordered, containers.r32, 'r32');
  renderRound(r16Ordered, containers.r16, 'r16');
  renderRound(qfOrdered,  containers.qf,  'qf');
  renderRound(sf,         containers.sf,  'sf');

  containers.final.style.gridTemplateRows = 'repeat(2, 1fr)';
  containers.final.style.gridAutoRows = '1fr';

  renderMatch(containers.final, fm.final,      0, 'final', nameOf, winnerSideOf);
  renderMatch(containers.final, fm.thirdPlace, 1, 'final', nameOf, winnerSideOf);
}

/**
 * Renderer én kamp korrekt i sin "tabellrute"
 */
export function renderMatch(
  containerEl,
  match,
  indexInRound,
  roundKey,
  nameOf,
  winnerSideOf
) {
  const splitNameRank = (text) => {
    const m = /^(.*?)(?:\s*\(#(\d+)\))?$/.exec(text);
    return {
      name: m?.[1] ?? text,
      rank: m?.[2] ?? null
    };
  };

  const home = splitNameRank(nameOf(match.home));
  const away = splitNameRank(nameOf(match.away));

  const winSide = winnerSideOf(match.home, match.away);
  const homeClass = winSide === 'home' ? 'winner' : winSide ? 'loser' : '';
  const awayClass = winSide === 'away' ? 'winner' : winSide ? 'loser' : '';

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