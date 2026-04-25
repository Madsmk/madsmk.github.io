import { resolveSeedToTeamName } from './logic.js';
import { createPlayoffSeedResolver } from './logic.js';

// js/render_playoff.js
export function renderPlayoffTree(knockout, resolveTeamName = null) {
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

  Object.values(containers).forEach(r => {
    if (!r.top || !r.bot) return;
    r.top.innerHTML = '';
    r.bot.innerHTML = '';
  });

  const nameOf = (seed) => typeof resolveTeamName === 'function' ? resolveTeamName(seed) : seed;

  const renderMatch = (el, match, label) => {
    el.innerHTML += `
      <div class="match" data-match="${match.matchNo}" ${match.from ? `data-from="${match.from.join(',')}"` : ''}>
        <div class="match-label">${label}</div>
        <div class="team home">${nameOf(match.home)}</div>
        <div class="team away">${nameOf(match.away)}</div>
      </div>
    `;
  };

  const splitAndRender = (matches, container, label) => {
    const half = Math.ceil(matches.length / 2);
    matches.slice(0, half).forEach(m => renderMatch(container.top, m, `${label} ${m.matchNo}`));
    matches.slice(half).forEach(m => renderMatch(container.bot, m, `${label} ${m.matchNo}`));
  };

  splitAndRender(r32, containers.r32, 'R32');
  splitAndRender(r16, containers.r16, 'R16');
  splitAndRender(qf,  containers.qf,  'QF');
  splitAndRender(sf,  containers.sf,  'SF');

  renderMatch(containers.final.top, fm.final, 'Finale');
  renderMatch(containers.final.bot, fm.thirdPlace, 'Bronsefinale');
}

export function renderMatch(el, match, label) {
  const homeName = resolveSeedToTeamName(match.home);
  const awayName = resolveSeedToTeamName(match.away);

  el.innerHTML += `
    <div class="match"
         data-match="${match.matchNo}"
         ${match.from ? `data-from="${match.from.join(',')}"` : ''}>
      <div class="match-label">${label}</div>
      <div class="team home">${homeName}</div>
      <div class="team away">${awayName}</div>
    </div>
  `;
}