// Wait for both DOM content and data.js to be loaded
document.addEventListener('DOMContentLoaded', function() {
  // The teamData and pitcherData objects are now expected to be loaded from data.js
  
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
        { team: match[1], pitcher: match[2] },
        { team: match[3], pitcher: match[4] }
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
    
    // Process each matchup
    matchups.forEach(matchup => {
      const [team1, team2] = matchup;
      
      // Process team strikeouts - we want opposing pitcher against high strikeout teams
      if (teamData.teamStrikeouts[team1.team] && team2.pitcher !== "TBD") {
        teamStrikeoutRecs.push({
          recommendation: `${team2.pitcher} vs ${teamData.teamMap[team1.team] || team1.team}`,
          value: teamData.teamStrikeouts[team1.team],
          sortValue: teamData.teamStrikeouts[team1.team]
        });
      }
      
      if (teamData.teamStrikeouts[team2.team] && team1.pitcher !== "TBD") {
        teamStrikeoutRecs.push({
          recommendation: `${team1.pitcher} vs ${teamData.teamMap[team2.team] || team2.team}`,
          value: teamData.teamStrikeouts[team2.team],
          sortValue: teamData.teamStrikeouts[team2.team]
        });
      }
      
      // Process pitcher strikeouts
      if (pitcherData.strikeouts[team1.pitcher]) {
        pitcherStrikeoutRecs.push({
          recommendation: `${team1.pitcher} (${team1.team})`,
          value: pitcherData.strikeouts[team1.pitcher].value,
          sortValue: pitcherData.strikeouts[team1.pitcher].value
        });
      }
      
      if (pitcherData.strikeouts[team2.pitcher]) {
        pitcherStrikeoutRecs.push({
          recommendation: `${team2.pitcher} (${team2.team})`,
          value: pitcherData.strikeouts[team2.pitcher].value,
          sortValue: pitcherData.strikeouts[team2.pitcher].value
        });
      }
      
      // Process ERA
      if (pitcherData.era[team1.pitcher]) {
        eraRecs.push({
          recommendation: `Against ${team1.pitcher} (${team1.team})`,
          value: pitcherData.era[team1.pitcher].value,
          sortValue: pitcherData.era[team1.pitcher].value
        });
      }
      
      if (pitcherData.era[team2.pitcher]) {
        eraRecs.push({
          recommendation: `Against ${team2.pitcher} (${team2.team})`,
          value: pitcherData.era[team2.pitcher].value,
          sortValue: pitcherData.era[team2.pitcher].value
        });
      }
      
      // Process Hits Allowed
      if (pitcherData.hitsAllowed[team1.pitcher]) {
        hitsAllowedRecs.push({
          recommendation: `Against ${team1.pitcher} (${team1.team})`,
          value: pitcherData.hitsAllowed[team1.pitcher].value,
          sortValue: pitcherData.hitsAllowed[team1.pitcher].value
        });
      }
      
      if (pitcherData.hitsAllowed[team2.pitcher]) {
        hitsAllowedRecs.push({
          recommendation: `Against ${team2.pitcher} (${team2.team})`,
          value: pitcherData.hitsAllowed[team2.pitcher].value,
          sortValue: pitcherData.hitsAllowed[team2.pitcher].value
        });
      }
    });
    
    // Sort all recommendations
    teamStrikeoutRecs.sort((a, b) => b.sortValue - a.sortValue);
    pitcherStrikeoutRecs.sort((a, b) => b.sortValue - a.sortValue);
    eraRecs.sort((a, b) => b.sortValue - a.sortValue);
    hitsAllowedRecs.sort((a, b) => b.sortValue - a.sortValue);
    
    return {
      teamStrikeoutRecs: teamStrikeoutRecs.slice(0, 5),
      pitcherStrikeoutRecs: pitcherStrikeoutRecs.slice(0, 5),
      eraRecs: eraRecs.slice(0, 5),
      hitsAllowedRecs: hitsAllowedRecs.slice(0, 5)
    };
  }
  
  // Function to display recommendations
  function displayRecommendations(results) {
    document.getElementById('results').classList.remove('hidden');
    
    // Display team strikeouts
    const teamStrikeoutsList = document.getElementById('teamStrikeoutsList');
    teamStrikeoutsList.innerHTML = '';
    results.teamStrikeoutRecs.forEach((rec, index) => {
      const li = document.createElement('li');
      li.className = index === 0 ? 'top-pick' : '';
      li.innerHTML = `${rec.recommendation} <span class="stat-value">${rec.value.toFixed(2)} K/game</span>`;
      teamStrikeoutsList.appendChild(li);
    });
    
    // Display pitcher strikeouts
    const pitcherStrikeoutsList = document.getElementById('pitcherStrikeoutsList');
    pitcherStrikeoutsList.innerHTML = '';
    results.pitcherStrikeoutRecs.forEach((rec, index) => {
      const li = document.createElement('li');
      li.className = index === 0 ? 'top-pick' : '';
      li.innerHTML = `${rec.recommendation} <span class="stat-value">${rec.value} K</span>`;
      pitcherStrikeoutsList.appendChild(li);
    });
    
    // Display ERA
    const eraList = document.getElementById('eraList');
    eraList.innerHTML = '';
    results.eraRecs.forEach((rec, index) => {
      const li = document.createElement('li');
      li.className = index === 0 ? 'top-pick' : '';
      li.innerHTML = `${rec.recommendation} <span class="stat-value">${rec.value}</span>`;
      eraList.appendChild(li);
    });
    
    // Display Hits Allowed
    const hitsAllowedList = document.getElementById('hitsAllowedList');
    hitsAllowedList.innerHTML = '';
    results.hitsAllowedRecs.forEach((rec, index) => {
      const li = document.createElement('li');
      li.className = index === 0 ? 'top-pick' : '';
      li.innerHTML = `${rec.recommendation} <span class="stat-value">${rec.value}</span>`;
      hitsAllowedList.appendChild(li);
    });
  }  
  
  // Event listener for analyze button
  document.getElementById('analyzeBtn').addEventListener('click', function() {
    const inputText = document.getElementById('matchupsInput').value;
    const matchups = parseAllMatchups(inputText);
    
    if (matchups.length > 0) {
      const results = analyzeMatchups(matchups);
      displayRecommendations(results);
    } else {
      alert('No valid matchups found. Please check your input format.');
    }
  });
});
