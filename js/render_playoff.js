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

export function renderPlayoffTree(knockout, resolveName, pickWinnerSide) {
  if (!knockout) return;

  const { r32, r16, qf, sf, fm } = knockout;
  const qs = sel => document.querySelector(sel);

  const containers = {
    r32: qs('.sluttspillTreTable .round32 .round-grid'),
    r16: qs('.sluttspillTreTable .round16 .round-grid'),
    qf:  qs('.sluttspillTreTable .quarterfinals .round-grid'),
    sf:  qs('.sluttspillTreTable .semifinals .round-grid'),
    final: qs('.sluttspillTreTable .final .round-grid'),
    bronze: qs('.sluttspillTreTable .final .round-grid.bronze')
  };

  // ✅ Kun valider + tøm grid-containere
  for (const [key, el] of Object.entries(containers)) {
    if (!el) {
      console.error(`Manglende container: ${key}`);
      return;
    }
    el.innerHTML = '';
  }

  const nameOf = seed =>
    typeof resolveName === 'function' ? resolveName(seed) : String(seed);

  const winnerSideOf = (h, a) =>
    typeof pickWinnerSide === 'function' ? pickWinnerSide(h, a) : null;

  const renderRound = (matches, gridEl, roundKey) => {
    gridEl.innerHTML = '';
    gridEl.style.display = 'grid';
    gridEl.style.gridTemplateRows = `repeat(${matches.length}, 1fr)`;

    matches.forEach((match, i) => {
      renderMatch(gridEl, match, i, roundKey, nameOf, winnerSideOf);
    });
  };

  // R16/QF: tre-rekkefølge
  const r16Ordered = orderByNextRound(r16, qf);
  const qfOrdered  = orderByNextRound(qf, sf);
  const r32Ordered = orderByNextRound(r32, r16Ordered);

  renderRound(r32Ordered, containers.r32, 'r32');
  renderRound(r16Ordered, containers.r16, 'r16');
  renderRound(qfOrdered,  containers.qf,  'qf');
  renderRound(sf,         containers.sf,  'sf');

  renderRound([fm.final],      containers.final,  'final');
  renderRound([fm.thirdPlace], containers.bronze, 'bronze');
}

export function renderMatch(containerEl, match, indexInRound, roundKey, nameOf, winnerSideOf) {
  const splitNameRank = (text) => {
    const m = /^(.*?)(?:\s*\(#(\d+)\))?$/.exec(text);
    return { name: m?.[1] ?? text, rank: m?.[2] ?? null };
  };

  const home = splitNameRank(nameOf(match.home));
  const away = splitNameRank(nameOf(match.away));

  const winSide = winnerSideOf(match.home, match.away);
  const homeClass = winSide === 'home' ? 'winner' : winSide ? 'loser' : '';
  const awayClass = winSide === 'away' ? 'winner' : winSide ? 'loser' : '';

  containerEl.insertAdjacentHTML(
    'beforeend',
    `
    <div class="match" data-match="${match.matchNo}" style="grid-row: ${indexInRound + 1};">
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