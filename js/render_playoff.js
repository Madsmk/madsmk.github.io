// render_playoff.js

window.addEventListener('resize', () => drawBracketLines({ animate: false }));

/**
 * Render én match-boks og plasser den deterministisk med grid-row.
 *
 * @param {HTMLElement} el - container (.top-half eller .bottom-half)
 * @param {object} match - { matchNo, home, away, from? }
 * @param {object} opts
 * @param {'r32'|'r16'|'qf'|'sf'|'final'} opts.round
 * @param {number} opts.indexInHalf - 0-basert indeks innenfor top-half/bottom-half
 * @param {(seed:string)=>string} opts.nameOf - seed -> lagnavn
 * @param {(homeSeed:string, awaySeed:string)=>('home'|'away'|null)} opts.winnerSideOf
 */
export function renderMatch(el, match, opts) {
  const { round, indexInHalf, nameOf, winnerSideOf } = opts;

  const homeSeed = match.home;
  const awaySeed = match.away;

  const homeName = nameOf(homeSeed);
  const awayName = nameOf(awaySeed);

  const winSide = winnerSideOf(homeSeed, awaySeed); // 'home'|'away'|null
  const homeClass = winSide ? (winSide === 'home' ? 'winner' : 'loser') : '';
  const awayClass = winSide ? (winSide === 'away' ? 'winner' : 'loser') : '';

  // --- GRID-ROW LOGIKK (halvering per runde) ---
  // r32: 2, r16: 4, qf: 8, sf: 16, final: 32
  const spanByRound = { r32: 2, r16: 4, qf: 8, sf: 16, final: 32 };
  const span = spanByRound[round] ?? 2;

  // Start på rad 1 og hopp med span*2 for å få luft og midtstilling
  const rowStart = 1 + indexInHalf * (span * 2);
  const rowEnd = rowStart + span;

  const fromAttr = Array.isArray(match.from) ? ` data-from="${match.from.join(',')}"` : '';

  el.insertAdjacentHTML(
    'beforeend',
    `
      <div class="match" data-match="${match.matchNo}"${fromAttr}
           style="grid-row: ${rowStart} / ${rowEnd};">
        <div class="team home ${homeClass}" title="${homeSeed}">${homeName}</div>
        <div class="team away ${awayClass}" title="${awaySeed}">${awayName}</div>
      </div>
    `
  );
}

/**
 * Render hele sluttspilltreet.
 * Forventer at .top-half/.bottom-half er grid-containere (CSS).
 */
export function renderPlayoffTree(knockout, resolveName, pickWinnerSide) {
  if (!knockout) return;

  const { r32, r16, qf, sf, fm } = knockout;
  const qs = (sel) => document.querySelector(sel);

  const containers = {
    r32:  { top: qs('.sluttspillTreTable .round32 .top-half'),       bot: qs('.sluttspillTreTable .round32 .bottom-half') },
    r16:  { top: qs('.sluttspillTreTable .round16 .top-half'),       bot: qs('.sluttspillTreTable .round16 .bottom-half') },
    qf:   { top: qs('.sluttspillTreTable .quarterfinals .top-half'), bot: qs('.sluttspillTreTable .quarterfinals .bottom-half') },
    sf:   { top: qs('.sluttspillTreTable .semifinals .top-half'),    bot: qs('.sluttspillTreTable .semifinals .bottom-half') },
    final:{ top: qs('.sluttspillTreTable .final .top-half'),         bot: qs('.sluttspillTreTable .final .bottom-half') },
  };

  // Guard + clear
  for (const r of Object.values(containers)) {
    if (!r.top || !r.bot) {
      console.error('Mangler .top-half/.bottom-half i en av sluttspill-containerne');
      return;
    }
    r.top.innerHTML = '';
    r.bot.innerHTML = '';
  }

  const nameOf = (seed) =>
    (typeof resolveName === 'function' ? resolveName(seed) : String(seed));

  const winnerSideOf = (homeSeed, awaySeed) =>
    (typeof pickWinnerSide === 'function' ? pickWinnerSide(homeSeed, awaySeed) : null);

  const renderRound = (matches, container, roundKey) => {
    const half = Math.ceil(matches.length / 2);
    const top = matches.slice(0, half);
    const bot = matches.slice(half);

    top.forEach((m, i) =>
      renderMatch(container.top, m, { round: roundKey, indexInHalf: i, nameOf, winnerSideOf })
    );

    bot.forEach((m, i) =>
      renderMatch(container.bot, m, { round: roundKey, indexInHalf: i, nameOf, winnerSideOf })
    );
  };

  renderRound(r32, containers.r32, 'r32');
  renderRound(r16, containers.r16, 'r16');
  renderRound(qf,  containers.qf,  'qf');
  renderRound(sf,  containers.sf,  'sf');

  // Final + bronse (én per half)
  renderMatch(containers.final.top, fm.final,      { round: 'final', indexInHalf: 0, nameOf, winnerSideOf });
  renderMatch(containers.final.bot, fm.thirdPlace, { round: 'final', indexInHalf: 0, nameOf, winnerSideOf });
}