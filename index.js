// Define attachEventListeners function
function attachEventListeners() {
    console.log('Attaching event listeners');
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const radioButtons = document.querySelectorAll('input[type="radio"]');

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            console.log(`Checkbox ${checkbox.id} changed`);
            updateAll();
        });
    });

    radioButtons.forEach(radioButton => {
        radioButton.addEventListener('change', () => {
            console.log(`Radio button ${radioButton.id} changed`);
            updateAll();
        });
    });
}

// Define updateAll function which calls updatePoints, updateRankingTable, updateThirdPlacedTeamsRanking, and populateSluttspillTable
function updateAll() {
    Object.keys(groups).forEach(group => {
        updatePoints(group);
        updateRankingTable(group);
    });
    updateThirdPlacedTeamsRanking();
    populateSluttspillTable();
}

function renderGroupA() {
  const root = document.getElementById("groupA-root");
  if (!root) {
    console.error("Fant ikke #groupA-root i index.html");
    return;
  }

  // Bygg kamp-rader 01-06 (samme ID-konvensjon som før: HA01, UA01, BA01, XA01 ...)
  let matchRows = "";
  for (let i = 1; i <= 6; i++) {
    const id = String(i).padStart(2, "0");
    const homeId = `HA${id}`;
    const drawId = `UA${id}`;
    const awayId = `BA${id}`;

    matchRows += `
      <div class="row matchA${id}">
        <div class="cell home"></div>
        <div class="cell away"></div>

        <div class="cell">
          <input type="checkbox" name="matchA${id}" id="${homeId}">
          <input type="checkbox" name="matchA${id}" id="${drawId}">
          <input type="checkbox" name="matchA${id}" id="${awayId}">

          <div class="tips">
            <label for="${homeId}">
              <span class="dot one"></span>
              <span class="utfall">H</span>
            </label>
            <label for="${drawId}">
              <span class="dot two"></span>
              <span class="utfall">U</span>
            </label>
            <label for="${awayId}">
              <span class="dot three"></span>
              <span class="utfall">B</span>
            </label>
          </div>
        </div>

        <div class="cell">
          <input type="radio" name="gruppeA" id="XA${id}" class="radio-option">
          <div class="dobling">
            <label for="XA${id}">
              <span class="radio matchA${i}"></span>
              <span class="utvalgt"></span>
            </label>
          </div>
        </div>

        <div class="cell poeng-h matchA${id}"></div>
        <div class="cell poeng-u matchA${id}"></div>
        <div class="cell poeng-b matchA${id}"></div>
        <div class="cell poeng-bp matchA${id}"></div>
      </div>
    `;
  }

  // Viktig forbedring: lag "Ingen dobling" som en faktisk matchA07-rad,
  // slik at EmailJS deriveTeams() ikke prøver å slå opp en ikke-eksisterende matchA07.
  // (Din nåværende deriveTeams() søker .row.matchA07 når radio-id er XA07) [2](https://phoenixonline-my.sharepoint.com/personal/mads_kjeldsberg_apotek1_no/Documents/Microsoft%20Copilot-chatfiler/index%20(1).js)[1](https://phoenixonline-my.sharepoint.com/personal/mads_kjeldsberg_apotek1_no/Documents/Microsoft%20Copilot-chatfiler/index.html)
  const noDoublingRow = `
    <div class="row matchA07">
      <div class="cell home"></div>
      <div class="cell away"></div>
      <div class="cell">Ingen dobling -></div>

      <div class="cell">
        <input type="radio" name="gruppeA" id="XA07" class="radio-option">
        <div class="dobling">
          <label for="XA07">
            <span class="radio matchA7"></span>
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

  // Rangeringstabellen (du bruker .rangeringA i JS: document.querySelector('.rangering' + group)) [2](https://phoenixonline-my.sharepoint.com/personal/mads_kjeldsberg_apotek1_no/Documents/Microsoft%20Copilot-chatfiler/index%20(1).js)
  const rankingBlock = `
    <div class="rangeringA">
      <div class="rangOverskrift">
        <div class="cell">Plass</div>
        <div class="cell">Land</div>
        <div class="cell">Forventet poeng</div>
      </div>
      <div class="rad land01">
        <div class="cell plass01">1</div>
        <div class="cell land land01"></div>
        <div class="cell poeng poeng01"></div>
      </div>
      <div class="rad land02">
        <div class="cell plass02">2</div>
        <div class="cell land land02"></div>
        <div class="cell poeng poeng02"></div>
      </div>
      <div class="rad land03">
        <div class="cell plass03">3</div>
        <div class="cell land land03"></div>
        <div class="cell poeng poeng03"></div>
      </div>
      <div class="rad land04">
        <div class="cell plass04">4</div>
        <div class="cell land land04"></div>
        <div class="cell poeng poeng04"></div>
      </div>
    </div>
  `;

  // Hele containerA (samme som før)
  root.innerHTML = `
    <div class="containerA">
      <div class="title">Gruppe A</div>
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

        ${rankingBlock}
      </form>
    </div>
  `;
}

// Main initialization using the DOMContentLoaded event
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOMContentLoaded event fired');

    renderGroupA();

    initializeGroups();
    fillAllCells();
    attachEventListeners(); // Attach the event listeners

    Object.keys(groups).forEach((group) => {
        updatePoints(group);
        updateRankingTable(group);
    });

    updateThirdPlacedTeamsRanking();
    populateSluttspillTable();
});

// Team data mapping
const teamMap = {
    'teamA1': { name: 'Tyskland', group: 'A' },
    'teamA2': { name: 'Skottland', group: 'A' },
    'teamA3': { name: 'Ungarn', group: 'A' },
    'teamA4': { name: 'Sveits', group: 'A' },
    'teamB1': { name: 'Spania', group: 'B' },
    'teamB2': { name: 'Kroatia', group: 'B' },
    'teamB3': { name: 'Italia', group: 'B' },
    'teamB4': { name: 'Albania', group: 'B' },
    'teamC1': { name: 'Slovenia', group: 'C' },
    'teamC2': { name: 'Danmark', group: 'C' },
    'teamC3': { name: 'Serbia', group: 'C' },
    'teamC4': { name: 'England', group: 'C' },
    'teamD1': { name: 'Nederland', group: 'D' },
    'teamD2': { name: 'Frankrike', group: 'D' },
    'teamD3': { name: 'Polen', group: 'D' },
    'teamD4': { name: 'Østerrike', group: 'D' },
    'teamE1': { name: 'Ukraina', group: 'E' },
    'teamE2': { name: 'Slovakia', group: 'E' },
    'teamE3': { name: 'Belgia', group: 'E' },
    'teamE4': { name: 'Romania', group: 'E' },
    'teamF1': { name: 'Tyrkia', group: 'F' },
    'teamF2': { name: 'Portugal', group: 'F' },
    'teamF3': { name: 'Georgia', group: 'F' },
    'teamF4': { name: 'Tsjekkia', group: 'F' }
};


const groups = {};

function getTeamName(teamID) {
    return teamMap[teamID]?.name || '';
}

function initializeGroups() {
    const groupCount = 6;
    const teamCountPerGroup = 4;
    for (let groupCharCode = 'A'.charCodeAt(0); groupCharCode < 'A'.charCodeAt(0) + groupCount; groupCharCode++) {
        let group = String.fromCharCode(groupCharCode);
        groups[group] = {
            teams: [],
            teamPoints: {}
        };

        for (let i = 1; i <= teamCountPerGroup; i++) {
            let teamID = `team${group}${i}`;
            let teamName = teamMap[teamID]?.name || '';
            if (teamName) {
                groups[group].teams.push(teamName);
                groups[group].teamPoints[teamName] = 0;
            }
        }
    }
    console.log('Groups initialized:', groups); // Debugging log
}

function fillAllCells() {
    console.log('Filling all cells');
    Object.keys(groups).forEach(group => {
        const matches = [
            [1, 2, '01'],
            [3, 4, '02'],
            [1, 3, '03'],
            [4, 2, '04'],
            [2, 3, '05'],
            [4, 1, '06']
        ];

        matches.forEach(([homeTeamNum, awayTeamNum, matchNumber]) => {
            const homeCell = document.querySelector(`.row.match${group}${matchNumber} .cell.home`);
            const awayCell = document.querySelector(`.row.match${group}${matchNumber} .cell.away`);
            if (homeCell && awayCell) {
                homeCell.textContent = getTeamName(`team${group}${homeTeamNum}`);
                awayCell.textContent = getTeamName(`team${group}${awayTeamNum}`);
                console.log(`Populating cells for match ${matchNumber} in group ${group}: ${homeCell.textContent} vs ${awayCell.textContent}`);
            } else {
                console.error(`Could not find cells for match ${matchNumber} in group ${group}`);
            }
        });
    });
}

function updatePoints(group) {
    const matches = [
        [1, 2, '01'],
        [3, 4, '02'],
        [1, 3, '03'],
        [4, 2, '04'],
        [2, 3, '05'],
        [4, 1, '06']
    ];

    matches.forEach(([homeTeamNum, awayTeamNum, matchNumber]) => {
        const poengH = document.querySelector(`.poeng-h.match${group}${matchNumber}`);
        const poengU = document.querySelector(`.poeng-u.match${group}${matchNumber}`);
        const poengB = document.querySelector(`.poeng-b.match${group}${matchNumber}`);
        const poengBP = document.querySelector(`.poeng-bp.match${group}${matchNumber}`);

        if (poengH && poengU && poengB && poengBP) {
            const isRadioChecked = document.getElementById(`X${group}${matchNumber}`)?.checked;
            const isCheckedH = document.getElementById(`H${group}${matchNumber}`)?.checked;
            const isCheckedU = document.getElementById(`U${group}${matchNumber}`)?.checked;
            const isCheckedB = document.getElementById(`B${group}${matchNumber}`)?.checked;

            const pointsH = calculatePoints(isCheckedH, isCheckedU, isCheckedB, isRadioChecked, 'H');
            const pointsU = calculatePoints(isCheckedH, isCheckedU, isCheckedB, isRadioChecked, 'U');
            const pointsB = calculatePoints(isCheckedH, isCheckedU, isCheckedB, isRadioChecked, 'B');
            const bonusBP = calculateBonus(isCheckedH, isCheckedU, isCheckedB);

            poengH.textContent = pointsH;
            poengU.textContent = pointsU;
            poengB.textContent = pointsB;
            poengBP.textContent = bonusBP;
        }
    });
}

function calculatePoints(isCheckedH, isCheckedU, isCheckedB, isRadioChecked, type) {
    const checkedCount = [isCheckedH, isCheckedU, isCheckedB].filter(checked => checked).length;

    if (checkedCount === 1) {
        if ((type === "H" && isCheckedH) || (type === "U" && isCheckedU) || (type === "B" && isCheckedB)) {
            if (type === "U" && isCheckedU) {
                return isRadioChecked ? 18 : 9;
            } else {
                return isRadioChecked ? 16 : 8;
            }
        } else {
            if ((type === "H" || type === "B") && isCheckedU === false) {
                return isRadioChecked ? -16 : -2;
            } else {
                return isRadioChecked ? -16 : 0;
            }
        }
    } else if (checkedCount === 2) {
        if ((type === "H" && isCheckedH) || (type === "U" && isCheckedU) || (type === "B" && isCheckedB)) {
            return isRadioChecked ? 8 : 4;
        } else {
            return isRadioChecked ? -8 : -4;
        }
    } else if (checkedCount === 3) {
        return isRadioChecked ? 2 : 1;
    } else {
        return 0;
    }
}

function calculateBonus(isCheckedH, isCheckedU, isCheckedB) {
    const checkedCount = [isCheckedH, isCheckedU, isCheckedB].filter(Boolean).length;
    return checkedCount === 1 ? 6 : checkedCount === 2 ? 3 : 0;
}

function updateRankingTable(group) {
    groups[group].teams.forEach(team => groups[group].teamPoints[team] = 0);

    const matches = [
        [1, 2, '01'],
        [3, 4, '02'],
        [1, 3, '03'],
        [4, 2, '04'],
        [2, 3, '05'],
        [4, 1, '06']
    ];

    matches.forEach(([homeTeamNum, awayTeamNum, matchNumber]) => {
        const homeChecked = document.getElementById(`H${group}${matchNumber}`)?.checked;
        const drawChecked = document.getElementById(`U${group}${matchNumber}`)?.checked;
        const awayChecked = document.getElementById(`B${group}${matchNumber}`)?.checked;

        const checkboxCount = [homeChecked, drawChecked, awayChecked].filter(Boolean).length;

        if (checkboxCount > 0) {
            const homeTeamName = getTeamName(`team${group}${homeTeamNum}`);
            const awayTeamName = getTeamName(`team${group}${awayTeamNum}`);

            if (homeChecked) groups[group].teamPoints[homeTeamName] += 3 / checkboxCount;
            if (drawChecked) {
                groups[group].teamPoints[homeTeamName] += 1 / checkboxCount;
                groups[group].teamPoints[awayTeamName] += 1 / checkboxCount;
            }
            if (awayChecked) groups[group].teamPoints[awayTeamName] += 3 / checkboxCount;
        }
    });

    groups[group].teams.sort((a, b) => groups[group].teamPoints[b] - groups[group].teamPoints[a]);

    const rankingTable = document.querySelector('.rangering' + group);
    if (rankingTable) {
        rankingTable.innerHTML = `
            <div class="rangOverskrift">
                <div class="cell">Plass</div>
                <div class="cell">Land</div>
                <div class="cell">Forventet poeng</div>
            </div>
        `;

        groups[group].teams.forEach((team, index) => {
            let actionsHTML = `${team}`;
            if (index > 0 && groups[group].teamPoints[team] === groups[group].teamPoints[groups[group].teams[index - 1]]) {
                actionsHTML += ` <a href="#" class="opp" data-index="${index}" data-direction="opp" data-group="${group}">(opp)</a>`;
            }
            if (index < groups[group].teams.length - 1 && groups[group].teamPoints[team] === groups[group].teamPoints[groups[group].teams[index + 1]]) {
                actionsHTML += ` <a href="#" class="ned" data-index="${index}" data-direction="ned" data-group="${group}">(ned)</a>`;
            }

            rankingTable.innerHTML += `
                <div class="rad">
                    <div class="cell plass">${index + 1}</div>
                    <div class="cell land">${actionsHTML}</div>
                    <div class="cell poeng">${groups[group].teamPoints[team].toFixed(1)}</div>
                </div>
            `;
        });

        document.querySelectorAll('.rangering' + group + ' .opp, .rangering' + group + ' .ned').forEach(link => {
            link.addEventListener('click', function (event) {
                handleLinkClick(event, group);
            });
        });
    }
}

function handleLinkClick(event, group) {
    event.preventDefault();
    const index = parseInt(event.target.dataset.index);
    const direction = event.target.dataset.direction;
    if (direction === 'opp' && index > 0) {
        swapTeams(index, index - 1, groups[group].teams);
    } else if (direction === 'ned' && index < groups[group].teams.length - 1) {
        swapTeams(index, index + 1, groups[group].teams);
    }

    updateRankingTable(group);
    updateThirdPlacedTeamsRanking();
    populateSluttspillTable();
}

function swapTeams(index1, index2, teams) {
    [teams[index1], teams[index2]] = [teams[index2], teams[index1]];
}

// Function to get the third ranked team from a group
function getTeamRankedThreeFromGroup(group) {
    const teams = groups[group].teams;
    return teams.length >= 3 ? teams[2] : null;
}

function updateThirdPlacedTeamsRanking() {
    console.log('updateThirdPlacedTeamsRanking')
    const thirdPlaceTeams = [];
    ['A', 'B', 'C', 'D', 'E', 'F'].forEach(group => {
        const team = getTeamRankedThreeFromGroup(group);
        if (team) {
            thirdPlaceTeams.push({
                team: team,
                points: groups[group].teamPoints[team]
            });
        }
    });

    thirdPlaceTeams.sort((a, b) => b.points - a.points);

    const rankingTable = document.querySelector('.rangeringAllTeams');
    if (rankingTable) {
        rankingTable.innerHTML = `
            <div class="rangOverskrift">
                <div class="cell">Plass</div>
                <div class="cell">Land</div>
                <div class="cell">Forventet poeng</div>
            </div>
        `;

        thirdPlaceTeams.forEach(({ team, points }, index) => {
            let actionsHTML = `${team}`;
            if (index > 0 && points === thirdPlaceTeams[index - 1].points) {
                actionsHTML += ` <a href="#" class="opp" data-index="${index}" data-direction="opp">(opp)</a>`;
            }
            if (index < thirdPlaceTeams.length - 1 && points === thirdPlaceTeams[index + 1].points) {
                actionsHTML += ` <a href="#" class="ned" data-index="${index}" data-direction="ned">(ned)</a>`;
            }
            rankingTable.innerHTML += `
                <div class="rad">
                    <div class="cell plass">${index + 1}</div>
                    <div class="cell land">${actionsHTML}</div>
                    <div class="cell poeng">${points.toFixed(1)}</div>
                </div>
            `;
        });
        console.log(thirdPlaceTeams)
        addThirdPlaceEventListeners(thirdPlaceTeams);
    }
}

function addThirdPlaceEventListeners(thirdPlaceTeams) {
    document.querySelectorAll('.rangeringAllTeams .opp, .rangeringAllTeams .ned').forEach(link => {
        link.addEventListener('click', function (event) {
            handleThirdPlaceLinkClick(event, thirdPlaceTeams);
        });
    });
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

    updateOverallRankingTable(thirdPlaceTeams);
    populateSluttspillTable();
}

function swapThirdPlaceElements(index1, index2, thirdPlaceTeams) {
    [thirdPlaceTeams[index1], thirdPlaceTeams[index2]] = [thirdPlaceTeams[index2], thirdPlaceTeams[index1]];
}

function updateOverallRankingTable(thirdPlaceTeams) {
    const rankingTable = document.querySelector('.rangeringAllTeams');
    const allTeams = getAllTeamsFromGroups();
    console.log('RangeringAllTeams')
    if (rankingTable) {
        rankingTable.innerHTML = `
            <div class="rangOverskrift">
                <div class="cell">Plass</div>
                <div class="cell">Land</div>
                <div class="cell">Forventet poeng</div>
            </div>
        `;

        thirdPlaceTeams.forEach(({ team, points }, index) => {
            let actionsHTML = `${team}`;
            if (index > 0 && points === thirdPlaceTeams[index - 1].points) {
                actionsHTML += ` <a href="#" class="opp" data-index="${index}" data-direction="opp">(opp)</a>`;
            }
            if (index < thirdPlaceTeams.length - 1 && points === thirdPlaceTeams[index + 1].points) {
                actionsHTML += ` <a href="#" class="ned" data-index="${index}" data-direction="ned">(ned)</a>`;
            }
            rankingTable.innerHTML += `
                <div class="rad">
                    <div class="cell plass">${index + 1}</div>
                    <div class="cell land">${actionsHTML}</div>
                    <div class="cell poeng">${points.toFixed(1)}</div>
                </div>
            `;
        });

        addThirdPlaceEventListeners(thirdPlaceTeams);
        generatePlayoffTree(allTeams);
    }
}

function getAllTeamsFromGroups() {
    const allTeams = [];

    ['A', 'B', 'C', 'D', 'E', 'F'].forEach(group => {
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

function populateSluttspillTable() {
    const sluttspillTeams = [];

    ['A', 'B', 'C', 'D', 'E', 'F'].forEach(group => {
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
        const thirdPlaceTeams = Array.from(rankingTable.querySelectorAll('.rad')).slice(0, 4);
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
    
    // Add event listeners for match ranking manipulation in the sluttspill table
    function addSluttspillEventListeners(sluttspillTeams) {
        document.querySelectorAll('.sluttspillTable .opp, .sluttspillTable .ned').forEach(link => {
            link.addEventListener('click', function (event) {
                console.log('Sluttspill link clicked:', event.target); // Log link click
                handleSluttspillLinkClick(event, sluttspillTeams);
            });
        });
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
    
    // Generate the initial playoff tree
    function generatePlayoffTree(sluttspillTeams) {
        console.log('Generating playoff tree');
    
        const round16Container = document.querySelector('.sluttspillTreTable .round16');
        const quarterfinalsContainer = document.querySelector('.sluttspillTreTable .quarterfinals');
        const semifinalsContainer = document.querySelector('.sluttspillTreTable .semifinals');
        const finalContainer = document.querySelector('.sluttspillTreTable .final');
        
        if (!round16Container || !quarterfinalsContainer || !semifinalsContainer || !finalContainer) {
            console.error("Containers for playoff tree not found.");
            return;
        }
    
        // Clear previous tree content
        round16Container.innerHTML = '';
        quarterfinalsContainer.innerHTML = '';
        semifinalsContainer.innerHTML = '';
        finalContainer.innerHTML = '';
    
        const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
        const groupPositions = {};
    
        groupLetters.forEach(group => {
            const rankingTable = document.querySelector(`.rangering${group}`);
            if (!rankingTable) return;
    
            const teamRows = rankingTable.querySelectorAll('.rad .land');
            groupPositions[group] = {};
    
            teamRows.forEach(row => {
                const place = parseInt(row.closest('.rad').querySelector('.plass').textContent, 10);
                const team = row.textContent.replace(/\s*\(.*?\)\s*/g, '').trim();
                groupPositions[group][place] = team;
            });
        });
    
        console.log('Group Positions:', groupPositions);
    
        const matchups = [
            { group1: 'B', place1: 1, group2: 'C', place2: 3 },
            { group1: 'A', place1: 1, group2: 'C', place2: 2 },
            { group1: 'F', place1: 1, group2: 'C', place2: 3 },
            { group1: 'D', place1: 2, group2: 'E', place2: 2 },
            { group1: 'E', place1: 1, group2: 'C', place2: 3 },
            { group1: 'D', place1: 1, group2: 'F', place2: 2 },
            { group1: 'C', place1: 1, group2: 'C', place2: 3 },
            { group1: 'A', place1: 2, group2: 'B', place2: 2 }
        ];
    
        const topFourThirdPlaced = getTopFourThirdPlacedTeams();
        console.log('Top four third-placed teams:', topFourThirdPlaced);
        
        if (topFourThirdPlaced.length < 4) {
            console.error("Not enough third-placed teams for the playoff.", topFourThirdPlaced);
            return;
        }
    
        const topFourGroups = topFourThirdPlaced.map((team) => team.group).sort();
        console.log('test', topFourThirdPlaced, topFourGroups);
    
        const mappedGroups = mapGroupsToMatches(topFourGroups);
        console.log('Mapped groups:', mappedGroups);
    
        const thirdPlaceMappings = [
            { matchIndex: 0, mappedGroupIndex: 0 },
            { matchIndex: 2, mappedGroupIndex: 1 },
            { matchIndex: 4, mappedGroupIndex: 2 },
            { matchIndex: 6, mappedGroupIndex: 3 }
        ];
    
        thirdPlaceMappings.forEach((mapping) => {
            const matchIndex = mapping.matchIndex;
            const mappedGroupIndex = mapping.mappedGroupIndex;
            const group = mappedGroups[mappedGroupIndex];
            matchups[matchIndex].group2 = group;
            matchups[matchIndex].place2 = 3;
        });
    
        console.log('Updated matchups:', matchups);
    
        const initialRankings = {};
    
        // Capture initial rankings for all teams
        matchups.forEach((matchup, index) => {
            const team1 = getTeamFromRankingTable(matchup.group1, matchup.place1);
            const team2 = getTeamFromRankingTable(matchup.group2, matchup.place2);
    
            const ranking1 = parseInt(getTeamRanking(team1), 10);
            const ranking2 = parseInt(getTeamRanking(team2), 10);
    
            initialRankings[team1] = ranking1;
            initialRankings[team2] = ranking2;
    
            console.log(`Match ${index + 1}: ${team1} (${ranking1}) vs ${team2} (${ranking2})`);
    
            if (team1 && team2) {
                const matchId = `RO16${index + 1}`;
                const matchHTML = createMatchHTML(team1, team2, matchId, ranking1, ranking2);
                round16Container.innerHTML += matchHTML;
            } else {
                console.error(`Could not find teams for match ${index + 1}.`);
            }
        });
    
        populateNextRounds(round16Container, quarterfinalsContainer, semifinalsContainer, finalContainer, initialRankings);
    }
    
    function createMatchHTML(team1, team2, matchId, ranking1 = '', ranking2 = '') {
        ranking1 = ranking1 !== '' ? `(${ranking1})` : '';
        ranking2 = ranking2 !== '' ? `(${ranking2})` : '';
        
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
      
        return table[groups.join(' ')] || ['A', 'A', 'C', 'D']; // Return default order if mapping fails
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

document.addEventListener('DOMContentLoaded', function() {
    emailjs.init({
        publicKey: "h9CcX5Ytepi9higkh",// Replace with your EmailJS user ID
    }); 

    const tipsForm = document.getElementById('tipsForm');

    tipsForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;

        const checkedCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        const checkedRadioButtons = document.querySelectorAll('input[type="radio"]:checked');

        const deriveTeams = (id) => {
            const match = id.match(/(\w)(\d{2})/);
            if (!match) return { homeTeam: undefined, awayTeam: undefined };

            const group = match[1];
            const matchNumber = match[2];

            const homeTeamElement = document.querySelector(`.row.match${group}${matchNumber} .cell.home`);
            const awayTeamElement = document.querySelector(`.row.match${group}${matchNumber} .cell.away`);

            const homeTeam = homeTeamElement ? homeTeamElement.textContent.trim() : "";
            const awayTeam = awayTeamElement ? awayTeamElement.textContent.trim() : "";

            return { homeTeam, awayTeam };
        };

        let checkboxData = [];
        checkedCheckboxes.forEach(checkbox => {
            const { homeTeam, awayTeam } = deriveTeams(checkbox.id);
            checkboxData.push({
                id: checkbox.id,
                homeTeam: homeTeam,
                awayTeam: awayTeam
            });
        });

        let radioButtonData = [];
        checkedRadioButtons.forEach(radioButton => {
            const { homeTeam, awayTeam } = deriveTeams(radioButton.id);
            radioButtonData.push({
                id: radioButton.id,
                homeTeam: homeTeam,
                awayTeam: awayTeam
            });
        });

        const getPlassAndTeams = (selector) => {
            const rows = document.querySelectorAll(selector + ' .rad');
            let data = [];
            rows.forEach(row => {
                const plass = row.querySelector('.plass') ? row.querySelector('.plass').textContent.trim() : "";
                let team = row.querySelector('.land') ? row.querySelector('.land').textContent.trim() : "";
                team = team.replace(/\(opp\)|\(ned\)/g, '').trim();
                data.push({ plass, team });
            });
            return data;
        };

        const plassAndTeams = {};
        ['A', 'B', 'C', 'D', 'E', 'F'].forEach(group => {
            plassAndTeams[group] = getPlassAndTeams(`.rangering${group}`);
        });
        const allTeamsRanking = getPlassAndTeams('.rangeringAllTeams');
        const playoffRanking = getPlassAndTeams('.sluttspillTable');

        const data = {
            fullName: fullName,
            email: email,
            checkboxData: checkboxData,
            radioButtonData: radioButtonData,
            plassAndTeams: plassAndTeams,
            allTeamsRanking: allTeamsRanking,
            playoffRanking: playoffRanking
        };

        // Check the size of data
        const dataSize = new Blob([JSON.stringify(data)]).size;
        console.log('Data size:', dataSize, 'bytes');

        if (dataSize > 50000) {
            console.error('Data exceeds the 50KB limit for EmailJS');
            alert('Form data is too large to be sent.');
            return;
        }

        // Log to see the structured data before sending
        console.log('Data to be sent:', JSON.stringify(data, null, 2));


        emailjs.send('contact_service', 'contact_form', data)
        .then((response) => {
            console.log('Email sent successfully!', response.status, response.text);
            alert('Det tips er registrert. Lykke til!');
        }, (err) => {
            console.error('Failed to send email:', err);
            alert('Ditt tips ble ikke registrert. Vennligst ta kontakt med Mads');
        });
    });
});