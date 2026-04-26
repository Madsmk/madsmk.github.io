// js/render_playoff.js
import { resolveSeedToTeamName } from './logic.js';

/**
 * Render hele sluttspilltreet inn i HTML-strukturen din:
 * .sluttspillTreTable > .round32/.round16/.quarterfinals/.semifinals/.final
 * og hver runde har .top-half og .bottom-half
 *
 * @param {object} knockout - { r32, r16, qf, sf, fm }
 * @param {function|null} resolveTeamName - optional: seed -> lagnavn (kan overstyre default)
 */
export function renderPlayoffTree(knockout, resolveTeamName = null) {
  if (!knockout) return;

  const { r32, r16, qf, sf, fm } = knockout;

  const qs = (sel) => document.querySelector(sel);

  const containers = {
    r32: {
      top: qs('.sluttspillTreTable .round32 .top-half'),
      bot: qs('.sluttspillTreTable .round32 .bottom-half'),
    },
    r16: {
      top: qs('.sluttspillTreTable .round16 .top-half'),
      bot: qs('.sluttspillTreTable .round16 .bottom-half'),
    },
    qf: {
      top: qs('.sluttspillTreTable .quarterfinals .top-half'),
      bot: qs('.sluttspillTreTable .quarterfinals .bottom-half'),
    },
    sf: {
      top: qs('.sluttspillTreTable .semifinals .top-half'),
      bot: qs('.sluttspillTreTable .semifinals .bottom-half'),
    },
    final: {
      top: qs('.sluttspillTreTable .final .top-half'),
      bot: qs('.sluttspillTreTable .final .bottom-half'),
    },
  };

  // Guard + clear
  Object.values(containers).forEach(r => {
    if (!r.top || !r.bot) {
      console.error('Mangler .top-half/.bottom-half i en av sluttspill-containerne');
      return;
    }
    r.top.innerHTML = '';
    r.bot.innerHTML = '';
  });

  // Default: vis faktiske lag for 1A/2B/3E osv.
  // (W79/L101 vises fortsatt som seed inntil du legger inn W/L-resolver)
  const nameOf = (seed) => {
    if (typeof resolveTeamName === 'function') return resolveTeamName(seed);
    return resolveSeedToTeamName(seed) ?? seed;
  };

  const renderMatch = (el, match, label) => {
    const fromAttr = Array.isArray(match.from) ? ` data-from="${match.from.join(',')}"` : '';
    el.innerHTML += `
      <div class="match" data-match="${match.matchNo}"${fromAttr}>
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
  splitAndRender(qf, containers.qf, 'QF');
  splitAndRender(sf, containers.sf, 'SF');

  renderMatch(containers.final.top, fm.final, 'Finale');
  renderMatch(containers.final.bot, fm.thirdPlace, 'Bronsefinale');
}