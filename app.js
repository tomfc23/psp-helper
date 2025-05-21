// Wait for both DOM content and data.js to be loaded
document.addEventListener('DOMContentLoaded', function() {
  // --- Error handling for missing data.js or properties ---
  if (typeof teamData !== 'object' || !teamData.teamStrikeouts) {
    alert('teamData is missing or not loaded. Please check that data.js is present and correctly loaded.');
    return;
  }
  if (typeof pitcherData !== 'object' || !pitcherData.strikeouts) {
    alert('pitcherData is missing or not loaded. Please check that data.js is present and correctly loaded.');
    return;
  }

  // Add a last updated info element
  const dataStatus = document.createElement('div');
  dataStatus.id = 'dataStatus';
  dataStatus.className = 'data-status';
  dataStatus.innerHTML = 'Using local MLB data as of May 3, 2025';
  document.querySelector('.input-section').appendChild(dataStatus);

  // Helper function to extract team and pitcher from matchup string
  function parseMatchup(matchupString) {
    const regex = /([A-Z]+) \(([^)]+)\) vs\. ([A-Z]+) \(([^)]+)\)/;
    const match = matchupString.match(regex);

    if (match) {
      return [
        { team: match[1].trim().toUpperCase(), pitcher: match[2].trim() },
        { team: match[3].trim().toUpperCase(), pitcher: match[4].trim() }
      ];
    }

    return null;
  }

  // Helper function to parse all matchups
  function parseAllMatchups(inputText) {
    const lines = inputText.trim().split('\n');
    const matchups = [];

    lines.forEach(line => {
      const matchup = parseMatchup(line);
      if (matchup) {
        matchups.push(matchup);
      }
    });

    return matchups;
  }

  // Function to analyze matchups and return recommendations
  function analyzeMatchups(matchups) {
    // Arrays to store the processed data
    const teamStrikeoutRecs = [];
    const pitcherStrikeoutRecs = [];
    const eraRecs = [];
    const hitsAllowedRecs = [];

    // Arrays to collect missing keys for debugging
    const missingTeams = new Set();
    const missingPitchers = new Set();

    // Process each matchup
    matchups.forEach(matchup => {
      const [team1, team2] = matchup;

      // Normalize keys
      const team1Key = team1.team.trim().toUpperCase();
      const team2Key = team2.team.trim().toUpperCase();
      const pitcher1Key = team1.pitcher.trim();
      const pitcher2Key = team2.pitcher.trim();

      // Process team strikeouts
      if (teamData.teamStrikeouts[team1Key] && pitcher2Key !== "TBD") {
        teamStrikeoutRecs.push({
          recommendation: `${pitcher2Key} vs ${teamData.teamMap[team1Key] || team1Key}`,
          value: teamData.teamStrikeouts[team1Key],
          sortValue: teamData.teamStrikeouts[team1Key]
        });
      } else if (!teamData.teamStrikeouts[team1Key]) {
        missingTeams.add(team1Key);
      }

      if (teamData.teamStrikeouts[team2Key] && pitcher1Key !== "TBD") {
        teamStrikeoutRecs.push({
          recommendation: `${pitcher1Key} vs ${teamData.teamMap[team2Key] || team2Key}`,
          value: teamData.teamStrikeouts[team2Key],
          sortValue: teamData.teamStrikeouts[team2Key]
        });
      } else if (!teamData.teamStrikeouts[team2Key]) {
        missingTeams.add(team2Key);
      }

      // Process pitcher strikeouts
      if (pitcherData.strikeouts[pitcher1Key]) {
        pitcherStrikeoutRecs.push({
          recommendation: `${pitcher1Key} (${team1Key})`,
          value: pitcherData.strikeouts[pitcher1Key].value,
          sortValue: pitcherData.strikeouts[pitcher1Key].value
        });
      } else {
        missingPitchers.add(pitcher1Key);
      }

      if (pitcherData.strikeouts[pitcher2Key]) {
        pitcherStrikeoutRecs.push({
          recommendation: `${pitcher2Key} (${team2Key})`,
          value: pitcherData.strikeouts[pitcher2Key].value,
          sortValue: pitcherData.strikeouts[pitcher2Key].value
        });
      } else {
        missingPitchers.add(pitcher2Key);
      }

      // Process ERA
      if (pitcherData.era[pitcher1Key]) {
        eraRecs.push({
          recommendation: `${pitcher1Key} (${team1Key})`,
          value: pitcherData.era[pitcher1Key].value,
          sortValue: pitcherData.era[pitcher1Key].value
        });
      } else {
        missingPitchers.add(pitcher1Key);
      }
      if (pitcherData.era[pitcher2Key]) {
        eraRecs.push({
          recommendation: `${pitcher2Key} (${team2Key})`,
          value: pitcherData.era[pitcher2Key].value,
          sortValue: pitcherData.era[pitcher2Key].value
        });
      } else {
        missingPitchers.add(pitcher2Key);
      }

      // Process Hits Allowed
      if (pitcherData.hitsAllowed[pitcher1Key]) {
        hitsAllowedRecs.push({
          recommendation: `Against ${pitcher1Key} (${team1Key})`,
          value: pitcherData.hitsAllowed[pitcher1Key].value,
          sortValue: pitcherData.hitsAllowed[pitcher1Key].value
        });
      } else {
        missingPitchers.add(pitcher1Key);
      }
      if (pitcherData.hitsAllowed[pitcher2Key]) {
        hitsAllowedRecs.push({
          recommendation: `Against ${pitcher2Key} (${team2Key})`,
          value: pitcherData.hitsAllowed[pitcher2Key].value,
          sortValue: pitcherData.hitsAllowed[pitcher2Key].value
        });
      } else {
        missingPitchers.add(pitcher2Key);
      }
    });

    // Sort all recommendations
    teamStrikeoutRecs.sort((a, b) => b.sortValue - a.sortValue);
    pitcherStrikeoutRecs.sort((a, b) => b.sortValue - a.sortValue);
    eraRecs.sort((a, b) => b.sortValue - a.sortValue);
    hitsAllowedRecs.sort((a, b) => b.sortValue - a.sortValue);

    // Attach missing keys for displayRecommendations
    return {
      teamStrikeoutRecs: teamStrikeoutRecs.slice(0, 5),
      pitcherStrikeoutRecs: pitcherStrikeoutRecs.slice(0, 5),
      eraRecs: eraRecs.slice(0, 5),
      hitsAllowedRecs: hitsAllowedRecs.slice(0, 5),
      missingTeams: Array.from(missingTeams),
      missingPitchers: Array.from(missingPitchers)
    };
  }

  // Display recommendations (with missing keys warning)
  function displayRecommendations(results) {
    document.getElementById('results').classList.remove('hidden');

    function renderList(listId, recs, label) {
      const listEl = document.getElementById(listId);
      listEl.innerHTML = '';
      if (recs.length === 0) {
        const li = document.createElement('li');
        li.textContent = `No ${label} found for the given matchups.`;
        listEl.appendChild(li);
      } else {
        recs.forEach((rec, index) => {
          const li = document.createElement('li');
          li.className = index === 0 ? 'top-pick' : '';
          li.innerHTML = `${rec.recommendation} <span class="stat-value">${rec.value}${rec.value && label.includes('Strikeouts') ? ' K' : ''}</span>`;
          listEl.appendChild(li);
        });
      }
    }

    renderList('teamStrikeoutsList', results.teamStrikeoutRecs, 'team strikeout recommendations');
    renderList('pitcherStrikeoutsList', results.pitcherStrikeoutRecs, 'pitcher strikeout recommendations');
    renderList('eraList', results.eraRecs, 'ERA recommendations');
    renderList('hitsAllowedList', results.hitsAllowedRecs, 'hits allowed recommendations');

    // Show missing teams/pitchers if any
    let missingInfo = '';
    if (results.missingTeams.length > 0) {
      missingInfo += `Missing team(s): ${results.missingTeams.join(', ')}. `;
    }
    if (results.missingPitchers.length > 0) {
      missingInfo += `Missing pitcher(s): ${results.missingPitchers.join(', ')}.`;
    }
    if (missingInfo) {
      let status = document.getElementById('results-missing-info');
      if (!status) {
        status = document.createElement('div');
        status.id = 'results-missing-info';
        status.style = 'color: red; margin-top:10px;';
        document.getElementById('results').appendChild(status);
      }
      status.textContent = missingInfo;
    } else {
      const status = document.getElementById('results-missing-info');
      if (status) status.textContent = '';
    }
  }

  document.getElementById('analyzeBtn').addEventListener('click', function() {
    const inputText = document.getElementById('matchupsInput').value;
    const matchups = parseAllMatchups(inputText);
    console.log('Parsed matchups:', matchups);

    if (matchups.length > 0) {
      const results = analyzeMatchups(matchups);
      displayRecommendations(results);
    } else {
      alert('No valid matchups found. Please check your input format.');
    }
  });
});
