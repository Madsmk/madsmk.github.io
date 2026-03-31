console.log("init.js LASTET")

import { renderGroup } from './render.js';
import { GROUPS } from './config.js';
import {
  initializeGroups,
  fillAllCells,
  updatePoints,
  updateRankingTable,
  updateThirdPlacedTeamsRanking,
  populateSluttspillTable,
  groups
} from './logic.js';
import { initSubmit } from './submit.js';

document.addEventListener('DOMContentLoaded', () => {
    renderAllGroups();
    initialize();
});

function renderAllGroups() {
    GROUPS.forEach(g => renderGroup(g));
}

function initialize() {
    initializeGroups();
    fillAllCells();
    document
        .querySelectorAll('input[type=checkbox], input[type=radio]')
        .forEach(el => el.addEventListener('change', updateAll));
    updateAll();
    initSubmit({
        serviceId: 'contact_service',
        templateId: 'contact_form',
        groups: GROUPS // endre til A-L senere
    });
}

function updateAll() {
  Object.keys(groups).forEach(group => {
    updatePoints(group);
    updateRankingTable(group);
  });
  updateThirdPlacedTeamsRanking();
  populateSluttspillTable();
}