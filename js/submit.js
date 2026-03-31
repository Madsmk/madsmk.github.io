export function initSubmit(options = {}) {
  const {
    serviceId = 'contact_service',
    templateId = 'contact_form',
    maxBytes = 50000,
    groups = ['A', 'B', 'C', 'D', 'E', 'F'], // juster til A-L når du går til VM-format
  } = options;

  const tipsForm = document.getElementById('tipsForm');
  if (!tipsForm) {
    console.error('Fant ikke #tipsForm');
    return;
  }

  tipsForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const fullNameEl = document.getElementById('fullName');
    const emailEl = document.getElementById('email');

    const fullName = fullNameEl ? fullNameEl.value.trim() : '';
    const email = emailEl ? emailEl.value.trim() : '';

    // Hent alle valgte tips
    const checkedCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    const checkedRadioButtons = document.querySelectorAll('input[type="radio"]:checked');

    // Parse ID-er som: HA01 / UA01 / BA01 / XA01
    // => outcome = H/U/B/X, group = A, matchNumber = 01
    const parseTipId = (id) => {
      // Matcher f.eks: HA01, UB06, XD07 (om du bruker den)
      const m = /^([HUBX])([A-Z])(\d{2})$/.exec(id);
      if (!m) return null;
      return { outcome: m[1], group: m[2], matchNumber: m[3] };
    };

    const deriveTeams = (id) => {
      const parsed = parseTipId(id);
      if (!parsed) return { homeTeam: '', awayTeam: '', group: '', matchNumber: '' };

      const { group, matchNumber } = parsed;

      const homeTeamElement = document.querySelector(`.row.match${group}${matchNumber} .cell.home`);
      const awayTeamElement = document.querySelector(`.row.match${group}${matchNumber} .cell.away`);

      return {
        homeTeam: homeTeamElement ? homeTeamElement.textContent.trim() : '',
        awayTeam: awayTeamElement ? awayTeamElement.textContent.trim() : '',
        group,
        matchNumber
      };
    };

    // Strukturert sjekkboks-data
    const checkboxData = Array.from(checkedCheckboxes).map(cb => {
      const { homeTeam, awayTeam, group, matchNumber } = deriveTeams(cb.id);
      return { id: cb.id, group, matchNumber, homeTeam, awayTeam };
    });

    // Strukturert radio-data (dobling)
    const radioButtonData = Array.from(checkedRadioButtons).map(rb => {
      const { homeTeam, awayTeam, group, matchNumber } = deriveTeams(rb.id);
      return { id: rb.id, group, matchNumber, homeTeam, awayTeam };
    });

    // Hent plass/rangering fra tabeller
    const getPlassAndTeams = (selector) => {
      const rows = document.querySelectorAll(selector + ' .rad');
      const data = [];
      rows.forEach(row => {
        const plassEl = row.querySelector('.plass');
        const landEl = row.querySelector('.land');

        const plass = plassEl ? plassEl.textContent.trim() : '';

        let team = landEl ? landEl.textContent.trim() : '';
        // Fjern (opp)/(ned) om de ligger i teksten
        team = team.replace(/\(opp\)|\(ned\)/g, '').trim();

        data.push({ plass, team });
      });
      return data;
    };

    // Per gruppe A-F
    const plassAndTeams = {};
    groups.forEach(g => {
      plassAndTeams[g] = getPlassAndTeams(`.rangering${g}`);
    });

    // Tredjeplass-rangering og sluttspill-rangering
    const allTeamsRanking = getPlassAndTeams('.rangeringAllTeams');
    const playoffRanking = getPlassAndTeams('.sluttspillTable');

    const payload = {
      fullName,
      email,
      checkboxData,
      radioButtonData,
      plassAndTeams,
      allTeamsRanking,
      playoffRanking
    };

    // Størrelsessjekk for EmailJS-limit (du hadde 50KB-limit i originalen) [1](https://phoenixonline-my.sharepoint.com/personal/mads_kjeldsberg_apotek1_no/Documents/Microsoft%20Copilot-chatfiler/index.js.txt)
    const json = JSON.stringify(payload);
    const size = new Blob([json]).size;

    console.log('Data size:', size, 'bytes');
    if (size > maxBytes) {
      console.error(`Data exceeds limit: ${size} > ${maxBytes}`);
      alert('Skjemaet blir for stort å sende. Prøv å redusere data (evt. kontakt Mads).');
      return;
    }

    // Send via EmailJS (global emailjs fra script-tag i index.html) [2](https://phoenixonline-my.sharepoint.com/personal/mads_kjeldsberg_apotek1_no/Documents/Microsoft%20Copilot-chatfiler/index%20(2).html)
    try {
      if (typeof emailjs === 'undefined') {
        throw new Error('EmailJS er ikke lastet (emailjs er undefined). Sjekk script-tag i index.html.');
      }

      const res = await emailjs.send(serviceId, templateId, payload);
      console.log('Email sent successfully!', res.status, res.text);
      alert('Ditt tips er registrert. Lykke til!');
    } catch (err) {
      console.error('Failed to send email:', err);
      alert('Ditt tips ble ikke registrert. Vennligst ta kontakt med Mads.');
    }
  });
}
