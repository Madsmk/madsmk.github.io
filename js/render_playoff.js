// render_playoff.js

export function renderPlayoffTree(knockout, resolveName, pickWinnerSide) {
  if (!knockout) return;

  const { r32, r16, qf, sf, fm } = knockout;
  const qs = (sel) => document.querySelector(sel);

  const containers = {
    r32: { top: qs('.sluttspillTreTable .round32 .top-half'), bot: qs('.sluttspillTreTable .round32 .bottom-half') },
    r16: { top: qs('.sluttspillTreTable .round16 .top-half'), bot: qs('.sluttspillTreTable .round16 .bottom-half') },
    qf:  { top: qs('.sluttspillTreTable .quarterfinals .top-half'), bot: qs('.sluttspillTreTable .quarterfinals .bottom-half') },
    sf:  { top: qs('.sluttspillTreTable .semifinals .top-half'), bot: qs('.sluttspillTreTable .semifinals .bottom-half') },
    final:{ top: qs('.sluttspillTreTable .final .top-half'), bot: qs('.sluttspillTreTable .final .bottom-half') },
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

  const nameOf = (seed) => (typeof resolveName === 'function' ? resolveName(seed) : String(seed));
  const winnerSideOf = (homeSeed, awaySeed) =>
    (typeof pickWinnerSide === 'function' ? pickWinnerSide(homeSeed, awaySeed) : null);

  const renderMatch = (el, match) => {
    const homeSeed = match.home;
    const awaySeed = match.away;

    const homeName = nameOf(homeSeed);
    const awayName = nameOf(awaySeed);

    const winSide = winnerSideOf(homeSeed, awaySeed); // 'home' | 'away' | null

    const homeClass = winSide ? (winSide === 'home' ? 'winner' : 'loser') : '';
    const awayClass = winSide ? (winSide === 'away' ? 'winner' : 'loser') : '';

    const fromAttr = Array.isArray(match.from) ? ` data-from="${match.from.join(',')}"` : '';

    el.innerHTML += `
      <div class="match" data-match="${match.matchNo}"${fromAttr}>
        <div class="team home ${homeClass}" title="${homeSeed}">${homeName}</div>
        <div class="team away ${awayClass}" title="${awaySeed}">${awayName}</div>
      </div>
    `;
  };

  const splitAndRender = (matches, container) => {
    const half = Math.ceil(matches.length / 2);
    matches.slice(0, half).forEach(m => renderMatch(container.top, m));
    matches.slice(half).forEach(m => renderMatch(container.bot, m));
  };

  splitAndRender(r32, containers.r32);
  splitAndRender(r16, containers.r16);
  splitAndRender(qf,  containers.qf);
  splitAndRender(sf,  containers.sf);

  // Final + bronse
  renderMatch(containers.final.top, fm.final);
  renderMatch(containers.final.bot, fm.thirdPlace);
}