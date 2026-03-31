import { teamMap } from './data.js';

export function getTeamName(teamID) {
    return teamMap?.[teamID]?.name ?? '';
}

export const groups = {};

export function initializeGroups() {
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
export function fillAllCells() {
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
export function updatePoints(group) {
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
export function updateRankingTable(group) {
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
export function updateThirdPlacedTeamsRanking() {
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
export function populateSluttspillTable() {
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