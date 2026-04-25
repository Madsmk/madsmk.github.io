const DEBUG = false;

function log(...args) {
    if (DEBUG) console.log(...args);
}

import { teamMap, FIXTURES } from './data_2026.js';
import { POINT_RULES, GROUPS, ADVANCEMENT_RULES } from './config.js';
import { ANNEX_C } from './annex_c_2026.js';
import { buildRoundOf32Matchups, buildRoundOf16Matchups, buildQuarterfinalMatchups, buildSemifinalMatchups, buildFinalMatchups } from './logic_playoff.js';
import { renderPlayoffTree } from './render_playoff.js'

let thirdPlaceManualOrder = null; // array med gruppe-bokstaver i ønsket rekkefølge
let knockoutManualOrder = null;

export function getTeamName(teamID) {
    return teamMap?.[teamID]?.name ?? '';
}

export const groups = {};

export function initializeGroups() {
    const teamCountPerGroup = 4;

    GROUPS.forEach(group => {
        groups[group] = {
            teams: [],
            teamPoints: {},
        };

        for (let i = 1; i <= teamCountPerGroup; i++) {
            const teamID = `team${group}${i}`;
            const teamName = teamMap[teamID]?.name;

            if (teamName) {
                groups[group].teams.push(teamName);
                groups[group].teamPoints[teamName] = 0;
            }
        }
    });
}

export function fillAllCells() {
    GROUPS.forEach(group => {
        const fixures = FIXTURES[group];
        if (!fixures) return;

        fixures.forEach(({ id, home, away }) => {
            const matchNumber = id.slice(1); // "01", "02", ...

            const homeCell = document.querySelector(
                `.row.match${group}${matchNumber} .cell.home`
            );
            const awayCell = document.querySelector(
                `.row.match${group}${matchNumber} .cell.away`
            );

            if (homeCell && awayCell) {
                homeCell.textContent = getTeamName(`team${group}${home}`);
                awayCell.textContent = getTeamName(`team${group}${away}`);
            }
        });
    });
}

function calculatePoints(isCheckedH, isCheckedU, isCheckedB, isRadioChecked, type) {
    const checked = {
        H: isCheckedH,
        U: isCheckedU,
        B: isCheckedB
    };
    const checkedCount = Object.values(checked).filter(Boolean).length;

    //Ingen valg
    if (checkedCount === 0) return 0;

    if (checkedCount === 1) {
        const guessed = Object.keys(checked).find(k => checked[k]); // 'H' | 'U' | 'B'

        // Riktig utfall
        if (guessed === type) {
            return isRadioChecked
            ? POINT_RULES.singleDouble[type]
            : POINT_RULES.single[type];            
        }
        
        // Feil utfall
        if (isRadioChecked) {
            // Dobling: feil gir trekk
            return POINT_RULES.penalty.double;
        }
        
        // Ikke dobling
        const pos = { H: 0, U: 1, B: 2 };
        const diff = Math.abs(pos[guessed] - pos[type]);

        // 1 plass feil => 0
        if (diff === 1) return POINT_RULES.penalty.singleAdjacent;

        // 2 plasser feil
        return POINT_RULES.penalty.singleTwoSteps;
    }

    // Halvgardering
    if (checkedCount === 2) {
        if (checked[type]) {
            return isRadioChecked
            ? POINT_RULES.half.double
            : POINT_RULES.half.points;
        }
        
        return isRadioChecked
            ? POINT_RULES.half.double * -1
            : POINT_RULES.half.points * -1;        
    }

    // Helgardering
    if (checkedCount === 3) {
        return isRadioChecked
            ? POINT_RULES.full.double
            : POINT_RULES.full.points;        
    }

    return 0;
}

function calculateBonus(isCheckedH, isCheckedU, isCheckedB) {
    const checkedCount = [isCheckedH, isCheckedU, isCheckedB].filter(Boolean).length;
    
    if (checkedCount === 1) return POINT_RULES.bonus.single;
    if (checkedCount === 2) return POINT_RULES.bonus.half;
    return 0;
}

export function updatePoints(group) {
  const fixtures = FIXTURES[group] ?? [];
  
  fixtures.forEach(({ id }) => {
    const matchNumber = id.slice(1);

    const poengH  = document.querySelector(`.poeng-h.match${group}${matchNumber}`);
    const poengU  = document.querySelector(`.poeng-u.match${group}${matchNumber}`);
    const poengB  = document.querySelector(`.poeng-b.match${group}${matchNumber}`);
    const poengBP = document.querySelector(`.poeng-bp.match${group}${matchNumber}`);

    if (!poengH || !poengU || !poengB || !poengBP) return;

    const isRadioChecked = document.getElementById(`X${group}${matchNumber}`)?.checked;
    const isCheckedH = document.getElementById(`H${group}${matchNumber}`)?.checked;
    const isCheckedU = document.getElementById(`U${group}${matchNumber}`)?.checked;
    const isCheckedB = document.getElementById(`B${group}${matchNumber}`)?.checked;

    const pointsH  = calculatePoints(isCheckedH, isCheckedU, isCheckedB, isRadioChecked, 'H');
    const pointsU  = calculatePoints(isCheckedH, isCheckedU, isCheckedB, isRadioChecked, 'U');
    const pointsB  = calculatePoints(isCheckedH, isCheckedU, isCheckedB, isRadioChecked, 'B');
    const bonusBP  = calculateBonus(isCheckedH, isCheckedU, isCheckedB);

    // ✅ 1) TØM tekstinnhold for å unngå "00", "88", "-2-2"
    // (vi lar CSS vise tallet via data-value)
    poengH.textContent  = '';
    poengU.textContent  = '';
    poengB.textContent  = '';
    poengBP.textContent = '';

    // ✅ 2) Sett data-value (CSS bruker dette)
    poengH.setAttribute("data-value", String(pointsH));
    poengU.setAttribute("data-value", String(pointsU));
    poengB.setAttribute("data-value", String(pointsB));
    poengBP.setAttribute("data-value", String(bonusBP));

    // ✅ 3) Trigger "updated" animasjon (valgfritt)
    [poengH, poengU, poengB, poengBP].forEach(el => {
      el.classList.remove("updated");
      void el.offsetWidth; // reflow for å re-trigge animasjon
      el.classList.add("updated");
      setTimeout(() => el.classList.remove("updated"), 150);
    });
  });
}


function handleLinkClick(event, group) {
  const btn = event.currentTarget;

  const index = parseInt(btn.dataset.index, 10);
  const direction = btn.dataset.direction;

  if (Number.isNaN(index)) return;

  if (direction === 'opp' && index > 0) {
    swapTeams(index, index - 1, groups[group].teams);
  } else if (direction === 'ned' && index < groups[group].teams.length - 1) {
    swapTeams(index, index + 1, groups[group].teams);
  }

  updateRankingTable(group);
  updateThirdPlacedTeamsRanking();
  updateKnockoutRankingAndTree();
}

export function updateRankingTable(group) {
  // Nullstill poeng
  groups[group].teams.forEach(team => {
    groups[group].teamPoints[team] = 0;
  });

  // Bruk fixtures (VM/EM-agnostisk)
  const fixtures = FIXTURES[group] ?? [];

  fixtures.forEach(({ id, home, away }) => {
    const matchNumber = id.slice(1);

    const homeChecked = document.getElementById(`H${group}${matchNumber}`)?.checked;
    const drawChecked = document.getElementById(`U${group}${matchNumber}`)?.checked;
    const awayChecked = document.getElementById(`B${group}${matchNumber}`)?.checked;

    const checkboxCount = [homeChecked, drawChecked, awayChecked].filter(Boolean).length;
    if (checkboxCount === 0) return;

    const homeTeam = getTeamName(`team${group}${home}`);
    const awayTeam = getTeamName(`team${group}${away}`);

    if (homeChecked) groups[group].teamPoints[homeTeam] += 3 / checkboxCount;
    if (drawChecked) {
      groups[group].teamPoints[homeTeam] += 1 / checkboxCount;
      groups[group].teamPoints[awayTeam] += 1 / checkboxCount;
    }
    if (awayChecked) groups[group].teamPoints[awayTeam] += 3 / checkboxCount;
  });

  // Sorter
  groups[group].teams.sort(
    (a, b) => groups[group].teamPoints[b] - groups[group].teamPoints[a]
  );

  const rankingTable = document.querySelector(`.rangering-${group}`);
  if (!rankingTable) return;

  rankingTable.innerHTML = `
    <div class="rangOverskrift">
      <div class="cell">Plass</div>
      <div class="cell">Land</div>
      <div class="cell">Forventet poeng</div>
    </div>
  `;

  const isTie = (a, b) =>
    Math.abs(groups[group].teamPoints[a] - groups[group].teamPoints[b]) < 1e-9;

  groups[group].teams.forEach((team, index) => {
    let actionsHTML = `${team}`;

    if (index > 0 && isTie(team, groups[group].teams[index - 1])) {
      actionsHTML += `
        <button type="button"
                class="opp"
                data-index="${index}"
                data-direction="opp">
          (opp)
        </button>`;
    }

    if (index < groups[group].teams.length - 1 &&
        isTie(team, groups[group].teams[index + 1])) {
      actionsHTML += `
        <button type="button"
                class="ned"
                data-index="${index}"
                data-direction="ned">
          (ned)
        </button>`;
    }

    rankingTable.innerHTML += `
      <div class="rad">
        <div class="cell plass">${index + 1}</div>
        <div class="cell land">${actionsHTML}</div>
        <div class="cell poeng">
          ${groups[group].teamPoints[team].toFixed(1)}
        </div>
      </div>
    `;
  });

  // ✅ Event binding (knapper – ikke lenker)
  rankingTable.querySelectorAll('button.opp, button.ned')
    .forEach(button => {
      button.addEventListener('click', event => {
        handleLinkClick(event, group);
      });
    });
}

// Function to get the third ranked team from a group
function getTeamRankedThreeFromGroup(group) {
    const teams = groups[group].teams;
    return teams.length >= 3 ? teams[2] : null;
}

function addThirdPlaceEventListeners(thirdPlaceTeams) {
    document.querySelectorAll('.rangeringAllTeams .opp, .rangeringAllTeams .ned').forEach(link => {
        link.addEventListener('click', function (event) {
            handleThirdPlaceLinkClick(event, thirdPlaceTeams);
        });
    });
}

function swapThirdPlaceElements(index1, index2, thirdPlaceTeams) {
    [thirdPlaceTeams[index1], thirdPlaceTeams[index2]] = [thirdPlaceTeams[index2], thirdPlaceTeams[index1]];
}

function handleThirdPlaceLinkClick(evt, thirdPlaceTeams) {
    evt.preventDefault();
    const index = parseInt(evt.target.dataset.index);
    const direction = evt.target.dataset.direction;
    
    if (direction === 'opp' && index > 0) {
        swapThirdPlaceElements(index, index - 1, thirdPlaceTeams);
    } else if (direction === 'ned' && index < thirdPlaceTeams.length - 1) {
        swapThirdPlaceElements(index, index + 1, thirdPlaceTeams);
    }

    updateKnockoutRankingAndTree();
}

export function updateThirdPlacedTeamsRanking() {
  const thirdPlaceTeams = [];

  // 1) Samle 3.-plass fra hver gruppe
  GROUPS.forEach(group => {
    const team = getTeamRankedThreeFromGroup(group);
    if (team) {
      thirdPlaceTeams.push({
        group,
        team,
        points: groups[group].teamPoints[team]
      });
    }
  });

  // 2) Standard sortering (poeng) – brukes ved første init / når order mangler
  thirdPlaceTeams.sort((a, b) => b.points - a.points);

  // 3) Init / sync manuell rekkefølge
  // Hvis vi ikke har en manuell rekkefølge ennå, start med poengsortert rekkefølge
  if (!thirdPlaceManualOrder || thirdPlaceManualOrder.length !== thirdPlaceTeams.length) {
    thirdPlaceManualOrder = thirdPlaceTeams.map(t => t.group);
  } else {
    // Hvis grupper har endret seg (burde ikke i VM, men greit), synk
    const current = new Set(thirdPlaceTeams.map(t => t.group));
    thirdPlaceManualOrder = thirdPlaceManualOrder.filter(g => current.has(g));
    // legg til evt nye grupper bakerst
    thirdPlaceTeams.forEach(t => {
      if (!thirdPlaceManualOrder.includes(t.group)) thirdPlaceManualOrder.push(t.group);
    });
  }

  // 4) Bruk manuell rekkefølge til å lage endelig rekkefølge i tabellen
  const byGroup = new Map(thirdPlaceTeams.map(t => [t.group, t]));
  const ordered = thirdPlaceManualOrder.map(g => byGroup.get(g)).filter(Boolean);

  // 5) Antall som går videre (VM 2026 = 8)
  const qualifiedCount = ADVANCEMENT_RULES.bestThirdPlaced;
  const qualified = ordered.slice(0, qualifiedCount);

  // 6) Render tabell
  const rankingTable = document.querySelector('.rangeringAllTeams');
  if (rankingTable) {
    rankingTable.innerHTML = `
      <div class="rangOverskrift">
        <div class="cell">Plass</div>
        <div class="cell">Gruppe</div>
        <div class="cell">Land</div>
        <div class="cell">Forventet poeng</div>
        <div class="cell">Flytt</div>
        <div class="cell">Status</div>
      </div>
    `;

    // Hjelper for å avgjøre om flytting skal tillates (kun ved poenglikhet med nabo)
    const isTie = (i, j) =>
      i >= 0 && j >= 0 &&
      i < ordered.length && j < ordered.length &&
      Math.abs(ordered[i].points - ordered[j].points) < 1e-9;

    ordered.forEach(({ group, team, points }, index) => {
      const okUp = index > 0 && isTie(index, index - 1);
      const okDown = index < ordered.length - 1 && isTie(index, index + 1);

      const status = index < qualifiedCount ? '✅ Videre' : '❌ Utslått';

      rankingTable.innerHTML += `
        <div class="rad ${index < qualifiedCount ? 'qualified' : 'not-qualified'}">
          <div class="cell plass">${index + 1}</div>
          <div class="cell gruppe">${group}</div>
          <div class="cell land">${team}</div>
          <div class="cell poeng">${points.toFixed(1)}</div>
          <div class="cell flytt">
            <button type="button" class="move-up" data-index="${index}" ${okUp ? '' : 'disabled'}>
              (opp)
            </button>
            <button type="button" class="move-down" data-index="${index}" ${okDown ? '' : 'disabled'}>
              (ned)
            </button>
          </div>
          <div class="cell status">${status}</div>
        </div>
      `;
    });

    // 7) Bind events (buttons)
    rankingTable.querySelectorAll('button.move-up, button.move-down').forEach(btn => {
      btn.addEventListener('click', (event) => {
        const b = event.currentTarget;
        const index = parseInt(b.dataset.index, 10);
        if (Number.isNaN(index)) return;

        if (b.classList.contains('move-up') && index > 0) {
          // swap i tredjeplass-ordren
          [thirdPlaceManualOrder[index - 1], thirdPlaceManualOrder[index]] =
            [thirdPlaceManualOrder[index], thirdPlaceManualOrder[index - 1]];
        }

        if (b.classList.contains('move-down') && index < thirdPlaceManualOrder.length - 1) {
          [thirdPlaceManualOrder[index + 1], thirdPlaceManualOrder[index]] =
            [thirdPlaceManualOrder[index], thirdPlaceManualOrder[index + 1]];
        }

        // Re-render + oppdater sluttspill
        updateThirdPlacedTeamsRanking();
        updateKnockoutRankingAndTree();
      });
    });
  }

  // 8) Returnér gruppene til de kvalifiserte tredjeplassene (brukes i Annex C)
  return qualified.map(t => t.group);
}

function getAllTeamsFromGroups() {
    const allTeams = [];

    GROUPS.forEach(group => {
        const teamRows = document.querySelectorAll(`.rangering${group} .rad`);
        
        teamRows.forEach(row => {
            const teamName = row.querySelector('.land').textContent.replace(/\(opp\)|\(ned\)/g, '').trim();
            const points = parseFloat(row.querySelector('.poeng').textContent);
            allTeams.push({
                team: teamName,
                group: group,
                points: points
            });
        });
    });

    return allTeams;
}

export function updateKnockoutRankingTable() {
  const knockoutTeams = [];

  // 1️⃣ Gruppevinnere og -toere
  GROUPS.forEach(group => {
    const teams = groups[group].teams;

    if (teams[0]) {
      knockoutTeams.push({
        seed: `1${group}`,
        group,
        position: 1,
        team: teams[0],
        points: groups[group].teamPoints[teams[0]]
      });
    }

    if (teams[1]) {
      knockoutTeams.push({
        seed: `2${group}`,
        group,
        position: 2,
        team: teams[1],
        points: groups[group].teamPoints[teams[1]]
      });
    }
  });

  // 2️⃣ Kvalifiserte tredjeplasser
  const qualifiedThirdGroups = updateThirdPlacedTeamsRanking();

  qualifiedThirdGroups.forEach(group => {
    const team = getTeamRankedThreeFromGroup(group);
    if (team) {
      knockoutTeams.push({
        seed: `3${group}`,
        group,
        position: 3,
        team,
        points: groups[group].teamPoints[team]
      });
    }
  });

  // 3️⃣ Standardsortering (valgfri – poeng synkende)
  knockoutTeams.sort((a, b) => b.points - a.points);

  // 4️⃣ Init / sync manuell rekkefølge
  if (!knockoutManualOrder || knockoutManualOrder.length !== knockoutTeams.length) {
    knockoutManualOrder = knockoutTeams.map(t => t.seed);
  } else {
    const current = new Set(knockoutTeams.map(t => t.seed));
    knockoutManualOrder = knockoutManualOrder.filter(s => current.has(s));
    knockoutTeams.forEach(t => {
      if (!knockoutManualOrder.includes(t.seed)) {
        knockoutManualOrder.push(t.seed);
      }
    });
  }

  const bySeed = new Map(knockoutTeams.map(t => [t.seed, t]));
  const ordered = knockoutManualOrder.map(s => bySeed.get(s)).filter(Boolean);

  // 5️⃣ Render tabell
  const table = document.querySelector('.sluttspillTable');
  if (!table) return ordered;

  table.innerHTML = `
    <div class="rangOverskrift">
      <div class="cell">Rangering</div>
      <div class="cell">Seed</div>
      <div class="cell">Land</div>
      <div class="cell">Forventet poeng</div>
      <div class="cell">Flytt</div>
    </div>
  `;

  ordered.forEach(({ seed, team, points }, index) => {
    table.innerHTML += `
      <div class="rad">
        <div class="cell plass">${index + 1}</div>
        <div class="cell seed">${seed}</div>
        <div class="cell land">${team}</div>
        <div class="cell poeng">${points.toFixed(1)}</div>
        <div class="cell flytt">
          <button type="button"
                  class="opp"
                  data-index="${index}"
                  ${index === 0 ? 'disabled' : ''}>(opp)</button>
          <button type="button"
                  class="ned"
                  data-index="${index}"
                  ${index === ordered.length - 1 ? 'disabled' : ''}>(ned)</button>
        </div>
      </div>
    `;
  });

  // 6️⃣ Event listeners
  table.querySelectorAll('button.opp, button.ned').forEach(btn => {
    btn.addEventListener('click', e => {
      const index = parseInt(e.currentTarget.dataset.index, 10);
      if (Number.isNaN(index)) return;

      if (btn.classList.contains('opp') && index > 0) {
        [knockoutManualOrder[index - 1], knockoutManualOrder[index]] =
          [knockoutManualOrder[index], knockoutManualOrder[index - 1]];
      }

      if (btn.classList.contains('ned') && index < knockoutManualOrder.length - 1) {
        [knockoutManualOrder[index + 1], knockoutManualOrder[index]] =
          [knockoutManualOrder[index], knockoutManualOrder[index + 1]];
      }

   updateKnockoutRankingAndTree();
    });
  });

  return ordered;
}

export function updateKnockoutRankingAndTree() {
  const ranked = updateKnockoutRankingTable();
  if (!ranked || ranked.length === 0) return;

  const knockout = buildKnockoutFromCurrentState();
  if (!knockout) return;

  // renderPlayoffTree må importeres fra render_playoff.js
  renderPlayoffTree(knockout, knockoutManualOrder);
}

// Add event listeners for match ranking manipulation in the sluttspill table
function addSluttspillEventListeners(sluttspillTeams) {
    document.querySelectorAll('.sluttspillTable .opp, .sluttspillTable .ned').forEach(link => {
        link.addEventListener('click', function (event) {
            console.log('Sluttspill link clicked:', event.target); // Log link click
            handleSluttspillLinkClick(event, sluttspillTeams);
        });
    });
}

// Render the ranking table for the playoff teams
function renderSluttspillTable(sluttspillTeams) {
    const sluttspillTable = document.querySelector('.sluttspillTable');
    if (sluttspillTable) {
        sluttspillTable.innerHTML = `
            <div class="rangOverskrift">
                <div class="cell">Rangering</div>
                <div class="cell">Land</div>
                <div class="cell">Forventet poeng</div>
            </div>
        `;

        sluttspillTeams.forEach((team, index) => {
            let actionsHTML = `${team.team}`;
            if (index > 0) {
                actionsHTML += ` <a href="#" class="opp" data-index="${index}" data-direction="opp">(opp)</a>`;
            }
            if (index < sluttspillTeams.length - 1) {
                actionsHTML += ` <a href="#" class="ned" data-index="${index}" data-direction="ned">(ned)</a>`;
            }
            sluttspillTable.innerHTML += `
                <div class="rad">
                    <div class="cell plass">${index + 1}</div>
                    <div class="cell land">${actionsHTML}</div>
                    <div class="cell poeng">${team.points.toFixed(1)}</div>
                </div>
            `;
        });

        addSluttspillEventListeners(sluttspillTeams);
    } else {
        console.error('Sluttspill table not found.');
    }
}

function swapTeams(index1, index2, teams) {
    [teams[index1], teams[index2]] = [teams[index2], teams[index1]];
}

// Handle click event on "(opp)" or "(ned)" links in the sluttspill table
function handleSluttspillLinkClick(event, sluttspillTeams) {
    event.preventDefault();
    const index = parseInt(event.target.dataset.index);
    const direction = event.target.dataset.direction;
    console.log('Handling sluttspill link click:', event.target.dataset); // Log handling details
    if (direction === 'opp' && index > 0) {
        swapTeams(index, index - 1, sluttspillTeams);
    } else if (direction === 'ned' && index < sluttspillTeams.length - 1) {
        swapTeams(index, index + 1, sluttspillTeams);
    }

    renderSluttspillTable(sluttspillTeams);
    generatePlayoffTree(sluttspillTeams); // Update the playoff tree after the click event
}

// Populate the next rounds of the playoff tree including the quarter-finals
function populateNextRounds(round16Container, quarterfinalsContainer, semifinalsContainer, finalContainer, initialRankings) {
    const advanceTeams = (matches) => {
        const winners = [];
        matches.forEach(match => {
            const team1Element = match.querySelector('.team:nth-child(1)');
            const team2Element = match.querySelector('.team:nth-child(2)');

            const team1 = team1Element ? team1Element.getAttribute('data-team') : '';
            const team2 = team2Element ? team2Element.getAttribute('data-team') : '';

            const team1Ranking = initialRankings[team1];
            const team2Ranking = initialRankings[team2];

            console.log(`Comparing ${team1} (Ranking: ${team1Ranking}) vs ${team2} (Ranking: ${team2Ranking})`);
            
            if (team1 && team2) {
                if (team1Ranking < team2Ranking) {
                    team1Element.classList.add('winner');
                    team2Element.classList.add('loser');
                    winners.push({ team: team1, ranking: team1Ranking });
                    console.log(`${team1} wins`);
                } else {
                    team1Element.classList.add('loser');
                    team2Element.classList.add('winner');
                    winners.push({ team: team2, ranking: team2Ranking });
                    console.log(`${team2} wins`);
                }
            }
        });
        return winners;
    };

    const nextRound = (winners, container, roundName) => {
        container.innerHTML = ''; // Clear previous content
        for (let i = 0; i < winners.length; i += 2) {
            const matchId = `${roundName}${Math.floor(i / 2) + 1}`;
            const team1 = winners[i] ? winners[i].team : '';
            const ranking1 = winners[i] ? winners[i].ranking : '';
            const team2 = winners[i + 1] ? winners[i + 1].team : '';
            const ranking2 = winners[i + 1] ? winners[i + 1].ranking : '';

            const matchHTML = createMatchHTML(team1, team2, matchId, ranking1, ranking2);
            container.innerHTML += matchHTML;
        }
    };

    const round16Winners = advanceTeams(round16Container.querySelectorAll('.match'));
    nextRound(round16Winners, quarterfinalsContainer, 'QF');

    const quarterfinalWinners = advanceTeams(quarterfinalsContainer.querySelectorAll('.match'));
    nextRound(quarterfinalWinners, semifinalsContainer, 'SF');

    const semifinalWinners = advanceTeams(semifinalsContainer.querySelectorAll('.match'));
    // Directly manage marking winner and loser for the final match here
    if (semifinalWinners.length >= 2) {
        const finalMatchId = 'Final1';
        const finalTeam1 = semifinalWinners[0].team;
        const finalRanking1 = semifinalWinners[0].ranking;
        const finalTeam2 = semifinalWinners[1].team;
        const finalRanking2 = semifinalWinners[1].ranking;

        const finalMatchHTML = createMatchHTML(finalTeam1, finalTeam2, finalMatchId, finalRanking1, finalRanking2);
        finalContainer.innerHTML += finalMatchHTML;

        const finalMatchElement = finalContainer.querySelector('.match');
        const finalTeam1Element = finalMatchElement.querySelector('.team:nth-child(1)');
        const finalTeam2Element = finalMatchElement.querySelector('.team:nth-child(2)');

        if (finalRanking1 < finalRanking2) {
            finalTeam1Element.classList.add('winner');
            finalTeam2Element.classList.add('loser');
        } else {
            finalTeam1Element.classList.add('loser');
            finalTeam2Element.classList.add('winner');
        }
    }
}

function getTopFourThirdPlacedTeams() {
    const topFourTeams = [];
    const sluttspillTeamRows = document.querySelectorAll('.rangeringAllTeams .rad');

    const teamsData = [];
    sluttspillTeamRows.forEach(row => {
        const teamName = row.querySelector('.land').textContent.replace(/\(opp\)|\(ned\)/g, '').trim();
        const points = parseFloat(row.querySelector('.poeng').textContent);

        const teamKey = Object.keys(teamMap).find(key => teamMap[key].name === teamName);
        if (teamKey) {
            teamsData.push({
                teamKey: teamKey,
                points: points
            });
        }
    });

    teamsData.sort((a, b) => b.points - a.points);

    for (let i = 0; i < Math.min(4, teamsData.length); i++) {
        topFourTeams.push({
            team: teamsData[i].teamKey,
            name: teamMap[teamsData[i].teamKey].name,
            points: teamsData[i].points,
            group: teamMap[teamsData[i].teamKey].group
        });
    }

    return topFourTeams;
}

// Map groups to matches based on predefined rules
function mapGroupsToMatches(groups) {
    const table = {
        'A B C D': ['A', 'C', 'B', 'D'],
        'A B C E': ['A', 'C', 'B', 'E'],
        'A B C F': ['A', 'C', 'B', 'F'],
        'A B D E': ['A', 'D', 'B', 'E'],
        'A B D F': ['A', 'D', 'B', 'F'],
        'A B E F': ['A', 'E', 'B', 'F'],
        'A C D E': ['A', 'D', 'C', 'E'],
        'A C D F': ['A', 'D', 'C', 'F'],
        'A C E F': ['A', 'E', 'C', 'F'],
        'A D E F': ['A', 'E', 'D', 'F'],
        'B C D E': ['B', 'D', 'C', 'E'],
        'B C D F': ['B', 'D', 'C', 'F'],
        'B C E F': ['B', 'E', 'C', 'F'],
        'B D E F': ['B', 'E', 'D', 'F'],
        'C D E F': ['C', 'E', 'D', 'F']
    };
    
    return table[groups.join(' ')] || ['A', 'B', 'C', 'D']; // Return default order if mapping fails
}

// Get team ranking based on position in sluttspillTeams
function getTeamRanking(teamName) {
    const teamRows = document.querySelectorAll('.sluttspillTable .rad');
    for (const row of teamRows) {
        const landCell = row.querySelector('.land');
        if (landCell && landCell.textContent.includes(teamName)) {
            const rankingCell = row.querySelector('.plass');
            return rankingCell ? rankingCell.textContent.trim() : 'N/A';
        }
    }
    return 'N/A';
}

// Create HTML for matches with team names and rankings
function createMatchHTML(team1, team2, matchId, ranking1 = '', ranking2 = '') {
    ranking1 = ranking1 ? `(${ranking1})` : '';
    ranking2 = ranking2 ? `(${ranking2})` : '';
    
    return `
        <div class="match" id="${matchId}">
            <div class="team" data-team="${team1}">${team1} ${ranking1}</div>
            <div class="team" data-team="${team2}">${team2} ${ranking2}</div>
        </div>
    `;
}

function getTeamFromRankingTable(group, position) {
    const rankingTable = document.querySelector(`.rangering${group}`);
    if (!rankingTable) {
        console.error(`Ranking table for group ${group} not found.`);
        return '';
    }

    const teamRows = rankingTable.querySelectorAll('.rad .land');
    if (position < 1 || position > teamRows.length) {
        console.error(`Invalid position ${position} for group ${group}.`);
        return '';
    }

    const cleanTeamName = teamRows[position - 1].textContent.trim().replace(/\s*\(.*?\)\s*/g, '');

    return cleanTeamName;
}



export function populateSluttspillTable() {
    const sluttspillTeams = [];

    GROUPS.forEach(group => {
        const teams = groups[group].teams;
        if (teams.length >= 2) {
            sluttspillTeams.push({
                team: teams[0],
                points: groups[group].teamPoints[teams[0]],
                groupPosition: 1
            });
            sluttspillTeams.push({
                team: teams[1],
                points: groups[group].teamPoints[teams[1]],
                groupPosition: 2
            });
        }
    });

    const rankingTable = document.querySelector('.rangeringAllTeams');
    if (rankingTable) {
        const thirdPlaceTeams = Array.from(rankingTable.querySelectorAll('.rad')).slice(0, ADVANCEMENT_RULES.bestThirdPlaced);
        thirdPlaceTeams.forEach(row => {
            sluttspillTeams.push({
                team: row.querySelector('.land').textContent.replace(/\s*\(opp\)\s*|\s*\(ned\)\s*/g, ''),
                points: parseFloat(row.querySelector('.poeng').textContent),
                groupPosition: 3
            });
        });
    }

    const sluttspillTable = document.querySelector('.sluttspillTable');
    if (sluttspillTable) {
        sluttspillTable.innerHTML = `
            <div class="rangOverskrift">
                <div class="cell">Rangering</div>
                <div class="cell">Land</div>
                <div class="cell">Forventet poeng</div>
                </div>
            `;
    
            sluttspillTeams.forEach((team, index) => {
                let actionsHTML = `${team.team}`;
                if (index > 0) {
                    actionsHTML += ` <a href="#" class="opp" data-index="${index}" data-direction="opp">(opp)</a>`;
                }
                if (index < sluttspillTeams.length - 1) {
                    actionsHTML += ` <a href="#" class="ned" data-index="${index}" data-direction="ned">(ned)</a>`;
                }
                sluttspillTable.innerHTML += `
                    <div class="rad">
                        <div class="cell plass">${index + 1}</div>
                        <div class="cell land">${actionsHTML}</div>
                        <div class="cell poeng">${team.points.toFixed(1)}</div>
                    </div>
                `;
            });
    
            addSluttspillEventListeners(sluttspillTeams);
        } else {
            console.error('Sluttspill table not found.');
        }
    
        generatePlayoffTree(sluttspillTeams); // Generate playoff tree after populating the table
    }

function buildKnockoutFromCurrentState() {
  // 1️⃣ Finn de 8 beste tredjeplassene
  const bestThirdGroups = updateThirdPlacedTeamsRanking();

  if (!bestThirdGroups || bestThirdGroups.length !== ADVANCEMENT_RULES.bestThirdPlaced) {
    console.warn('Sluttspill ikke klart – mangler tredjeplasser');
    return;
  }

  // 2️⃣ Bygg sluttspillrundene
  const r32 = buildRoundOf32Matchups(bestThirdGroups, ANNEX_C);
  const r16 = buildRoundOf16Matchups(r32);
  const qf  = buildQuarterfinalMatchups(r16);
  const sf  = buildSemifinalMatchups(qf);
  const fm  = buildFinalMatchups(sf);

  // 3️⃣ Debug / videre rendering
  console.log('R32', r32);
  console.log('R16', r16);
  console.log('QF', qf);
  console.log('SF', sf);
  console.log('Final', fm.final);
  console.log('Bronse', fm.thirdPlace);

  return { r32, r16, qf, sf, fm };
}

export function resolveSeedToTeamName(seed) {
  if (!seed) return '';

  // Eks: '1A', '2C', '3E'
  const match = seed.match(/^([123])([A-L])$/);
  if (match) {
    const position = Number(match[1]); // 1 | 2 | 3
    const group = match[2];
    return groups[group]?.teams?.[position - 1] ?? seed;
  }

  // Eks: 'W79' / 'L101' – foreløpig vis seed (kan utvides senere)
  return seed;
}

// ---- Seed resolving for playoff rendering ----

function buildRankMapFromKnockoutOrder(knockoutManualOrder) {
  // rank 0 = best, 1 = next, ...
  const rank = new Map();
  (knockoutManualOrder ?? []).forEach((seed, idx) => rank.set(seed, idx));
  return rank;
}

function buildSeedToTeamNameMap() {
  // resolves 1A/2A/3A → actual team names using groups
  const map = new Map();

  GROUPS.forEach(g => {
    const t = groups[g]?.teams ?? [];
    if (t[0]) map.set(`1${g}`, t[0]);
    if (t[1]) map.set(`2${g}`, t[1]);
    if (t[2]) map.set(`3${g}`, t[2]); // NOTE: third place team name (after ranking table ordering)
  });

  return map;
}

function flattenAllMatches(knockout) {
  const all = [];
  if (!knockout) return all;
  all.push(...(knockout.r32 ?? []));
  all.push(...(knockout.r16 ?? []));
  all.push(...(knockout.qf ?? []));
  all.push(...(knockout.sf ?? []));
  if (knockout.fm?.thirdPlace) all.push(knockout.fm.thirdPlace);
  if (knockout.fm?.final) all.push(knockout.fm.final);
  return all;
}

function buildMatchIndex(knockout) {
  const idx = new Map(); // matchNo -> match object
  flattenAllMatches(knockout).forEach(m => idx.set(m.matchNo, m));
  return idx;
}

/**
 * Create a resolver that can resolve:
 *  - 1A/2B/3E → team name
 *  - W79/L79 → team name (based on knockout ranking)
 *
 * @param {object} knockout - { r32, r16, qf, sf, fm } from buildKnockoutFromCurrentState()
 * @param {string[]} knockoutManualOrder - array of seed strings in user-defined knockout ranking order
 * @returns {(seed:string)=>string} resolver function
 */
export function createPlayoffSeedResolver(knockout, knockoutManualOrder) {
  const seedToTeam = buildSeedToTeamNameMap();
  const rankMap = buildRankMapFromKnockoutOrder(knockoutManualOrder);
  const matchIndex = buildMatchIndex(knockout);

  // Cache computed winners/losers
  const winnerCache = new Map(); // matchNo -> teamName
  const loserCache = new Map();  // matchNo -> teamName

  // resolve a base seed ("1A") or a dynamic seed ("W79")
  const resolve = (seed) => {
    if (!seed) return '';

    // Base seed like "1A", "2B", "3E"
    if (/^[123][A-L]$/.test(seed)) {
      return seedToTeam.get(seed) ?? seed; // fallback to seed if missing
    }

    // Winner/Loser seed like "W79" / "L101"
    const wl = seed.match(/^([WL])(\\d{2,3})$/);
    if (wl) {
      const kind = wl[1];              // 'W' or 'L'
      const matchNo = parseInt(wl[2], 10);

      // compute match winner/loser if not cached
      ensureMatchOutcome(matchNo);

      return (kind === 'W')
        ? (winnerCache.get(matchNo) ?? seed)
        : (loserCache.get(matchNo) ?? seed);
    }

    // unknown format
    return seed;
  };

  const ensureMatchOutcome = (matchNo) => {
    if (winnerCache.has(matchNo) && loserCache.has(matchNo)) return;

    const match = matchIndex.get(matchNo);
    if (!match) {
      // unknown match number
      winnerCache.set(matchNo, `W${matchNo}`);
      loserCache.set(matchNo, `L${matchNo}`);
      return;
    }

    const homeName = resolve(match.home);
    const awayName = resolve(match.away);

    // Determine which seed corresponds to each side for ranking lookup:
    // If match.home is already a seed ("1A"/"3E"/"W79"), use it.
    // If it resolves to a name but seed wasn't present, still use match.home.
    const homeSeed = match.home;
    const awaySeed = match.away;

    const homeRank = rankMap.has(homeSeed) ? rankMap.get(homeSeed) : Number.POSITIVE_INFINITY;
    const awayRank = rankMap.has(awaySeed) ? rankMap.get(awaySeed) : Number.POSITIVE_INFINITY;

    // If ranks exist: lower index = better.
    // If rank missing for both: fallback alphabetical by name to keep deterministic.
    let homeWins;
    if (homeRank !== awayRank) {
      homeWins = homeRank < awayRank;
    } else {
      homeWins = String(homeName).localeCompare(String(awayName), 'nb') <= 0;
    }

    const winner = homeWins ? homeName : awayName;
    const loser  = homeWins ? awayName : homeName;

    winnerCache.set(matchNo, winner);
    loserCache.set(matchNo, loser);
  };

  return resolve;
}

    // Generate the initial playoff tree
function generatePlayoffTree() {
  const knockout = buildKnockoutFromCurrentState();
  if (!knockout) return;
  renderPlayoffTree(knockout);
}