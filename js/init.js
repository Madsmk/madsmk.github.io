console.log("init.js LASTET")

import { renderGroup } from './render.js';
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
  ['A','B','C','D','E','F'].forEach(renderGroup);

  initializeGroups();
  fillAllCells();

  document
    .querySelectorAll('input[type=checkbox], input[type=radio]')
    .forEach(el => el.addEventListener('change', updateAll));

  updateAll();
  initSubmit({
    serviceId: 'contact_service',
    templateId: 'contact_form',
    groups: ['A','B','C','D','E','F'] // endre til A-L senere
  });
});

function updateAll() {
  Object.keys(groups).forEach(group => {
    updatePoints(group);
    updateRankingTable(group);
  });
  updateThirdPlacedTeamsRanking();
  populateSluttspillTable();
}