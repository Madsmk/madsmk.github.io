import { renderGroup } from './render.js';
import { GROUPS } from './config.js';
import {
  initializeGroups,
  fillAllCells,
  updatePoints,
  updateRankingTable,
  updateThirdPlacedTeamsRanking,
  updateKnockoutRankingAndTree,
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
    attachEventListeners();
    updateAll();
    initSubmit({
        serviceId: 'contact_service',
        templateId: 'contact_form',
        groups: GROUPS // endre til A-L senere
    });
}

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

function updateAll() {
  Object.keys(groups).forEach(group => {
    updatePoints(group);
    updateRankingTable(group);
  });
  updateThirdPlacedTeamsRanking();
  updateKnockoutRankingAndTree();
}