export function renderGroup(groupLetter, mountId = null) {
  const rootId = mountId || `group${groupLetter}-root`;
  const root = document.getElementById(rootId);
  if (!root) {
    console.error(`Fant ikke #${rootId} i HTML`);
    return;
  }
  console.log("renderGroup:", groupLetter, "rootId:", rootId);
  const containerClass = `container container-${groupLetter}`;

  // Bygg kamp-rader 01-06
  let matchRows = "";
  for (let i = 1; i <= 6; i++) {
    const id = String(i).padStart(2, "0");

    // ID-konvensjonene dine (viktig for updatePoints/updateRankingTable)
    const homeId  = `H${groupLetter}${id}`;  // HA01
    const drawId  = `U${groupLetter}${id}`;  // UA01
    const awayId  = `B${groupLetter}${id}`;  // BA01
    const radioId = `X${groupLetter}${id}`;  // XA01

    matchRows += `
      <div class="row match${groupLetter}${id}">
        <div class="cell home"></div>
        <div class="cell away"></div>

        <div class="cell">
          <div class="tips">
            <label class="tip-option">
              <input type="checkbox" name="match${groupLetter}${id}" id="${homeId}">
              <span class="utfall">H</span>
              <span class="dot one"></span>
            </label>

            <label class="tip-option">
              <input type="checkbox" name="match${groupLetter}${id}" id="${drawId}">
              <span class="utfall">U</span>
              <span class="dot two"></span>
            </label>

            <label class="tip-option">
              <input type="checkbox" name="match${groupLetter}${id}" id="${awayId}">
              <span class="utfall">B</span>
              <span class="dot three"></span>
            </label>
          </div>
        </div>

        <div class="cell">
          <div class="dobling">
            <label class="double-option">
              <input type="radio" name="gruppe${groupLetter}" id="${radioId}" class="radio-option">
              <span class="radio match${groupLetter}${i}"></span>
              <span class="utvalgt"></span>
            </label>
          </div>
        </div>

        <div class="cell poeng-h match${groupLetter}${id}"></div>
        <div class="cell poeng-u match${groupLetter}${id}"></div>
        <div class="cell poeng-b match${groupLetter}${id}"></div>
        <div class="cell poeng-bp match${groupLetter}${id}"></div>
      </div>
    `;
  }

  // "Ingen dobling" (07) – vi lager også match${group}07 slik at deriveTeams() finner den
  const noDoublingRow = `
    <div class="row match${groupLetter}07">
      <div class="cell home"></div>
      <div class="cell away"></div>
      <div class="cell">Ingen dobling -></div>

      <div class="cell">
        <div class="dobling">
          <label class="double-option">
            <input type="radio" name="gruppe${groupLetter}" id="X${groupLetter}07" class="radio-option">
            <span class="radio match${groupLetter}7"></span>
            <span class="utvalgt"></span>
          </label>
        </div>
      </div>

      <div class="cell"></div>
      <div class="cell"></div>
      <div class="cell"></div>
      <div class="cell"></div>
    </div>
  `;

  // Ranking-container: JS-en din forventer .rangeringA/.rangeringB osv og fyller den selv
  const rankingContainer = `<div class="rangering rangering-${groupLetter}"></div>`;

  root.innerHTML = `
    <div class="${containerClass}">
      <div class="title">Gruppe ${groupLetter}</div>

      <form>
        <div class="table">
          <div class="header">
            <div class="cell">Hjemmelag</div>
            <div class="cell">Bortelag</div>
            <div class="cell">Tips</div>
            <div class="cell">Dobling</div>
            <div class="cell">Poeng H</div>
            <div class="cell">Poeng U</div>
            <div class="cell">Poeng B</div>
            <div class="cell">Maks BP*</div>
          </div>

          ${matchRows}
          ${noDoublingRow}
        </div>

        ${rankingContainer}
      </form>
    </div>
  `;
}


export function renderPlayoffTree(knockout) {
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

  // Guard
  for (const round of Object.values(containers)) {
    if (!round.top || !round.bot) {
      console.error('Mangler container i sluttspill-treet');
      return;
    }
    round.top.innerHTML = '';
    round.bot.innerHTML = '';
  }

  const renderMatch = (el, match, label) => {
    el.innerHTML += `
      <div class="match" data-match="${match.matchNo}">
        <div class="match-label">${label}</div>
        <div class="team home">${match.home}</div>
        <div class="team away">${match.away}</div>
      </div>
    `;
  };

  const splitAndRender = (matches, container, labelPrefix) => {
    const half = Math.ceil(matches.length / 2);
    matches.slice(0, half).forEach(m =>
      renderMatch(container.top, m, `${labelPrefix} ${m.matchNo}`)
    );
    matches.slice(half).forEach(m =>
      renderMatch(container.bot, m, `${labelPrefix} ${m.matchNo}`)
    );
  };

  // ---- Render all rounds ----
  splitAndRender(r32, containers.r32, 'R32');
  splitAndRender(r16, containers.r16, 'R16');
  splitAndRender(qf,  containers.qf,  'QF');
  splitAndRender(sf,  containers.sf,  'SF');

  // ---- Final + bronse ----
  renderMatch(containers.final.top, fm.final, 'Finale');
  renderMatch(containers.final.bot, fm.thirdPlace, 'Bronsefinale');
}


