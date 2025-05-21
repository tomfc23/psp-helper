// data.js - Dynamically fetch data from Google Spreadsheet

// Initialize data structure
let teamData = {
  teamStrikeouts: {},
  teamMap: {
    "ARI": "Arizona Diamondbacks",
    "ATL": "Atlanta Braves",
    "BAL": "Baltimore Orioles",
    "BOS": "Boston Red Sox",
    "CHC": "Chicago Cubs",
    "CIN": "Cincinnati Reds",
    "CLE": "Cleveland Guardians",
    "COL": "Colorado Rockies",
    "CWS": "Chicago White Sox",
    "DET": "Detroit Tigers",
    "HOU": "Houston Astros",
    "KC": "Kansas City Royals",
    "LAA": "Los Angeles Angels",
    "LAD": "Los Angeles Dodgers",
    "MIA": "Miami Marlins",
    "MIL": "Milwaukee Brewers",
    "MIN": "Minnesota Twins",
    "NYM": "New York Mets",
    "NYY": "New York Yankees",
    "OAK": "Oakland Athletics",
    "PHI": "Philadelphia Phillies",
    "PIT": "Pittsburgh Pirates",
    "SD": "San Diego Padres",
    "SEA": "Seattle Mariners",
    "SF": "San Francisco Giants",
    "STL": "St. Louis Cardinals",
    "TB": "Tampa Bay Rays",
    "TEX": "Texas Rangers",
    "TOR": "Toronto Blue Jays",
    "WSH": "Washington Nationals",
    "SAC": "Sacramento Athletics"
  },
  reverseTeamMap: {}
};

// Build the reverse team map
for (const [abbr, fullName] of Object.entries(teamData.teamMap)) {
  teamData.reverseTeamMap[fullName.toLowerCase()] = abbr;
}

// Initialize pitcher data structure
let pitcherData = {
  strikeouts: {},
  era: {},
  hitsAllowed: {}
};

// Function to fetch and process data from Google Spreadsheet
async function fetchSpreadsheetData() {
  try {
    // Convert the published Google Sheets URL to CSV export URL
    // Original URL: https://docs.google.com/spreadsheets/d/e/2PACX-1vS9-JsIxebevmoDUnyTjzLeNG3nrGj_iZ7T1Q3JM4gO0YNmJe00PDWr8M7Arbe4V4cPecUnvnPMTTDv/pubhtml
    
    // Extract the spreadsheet ID
    const spreadsheetId = "2PACX-1vS9-JsIxebevmoDUnyTjzLeNG3nrGj_iZ7T1Q3JM4gO0YNmJe00PDWr8M7Arbe4V4cPecUnvnPMTTDv"; // You'll need to extract this from your URL
    
    // Create URLs for each sheet
    const teamStatsUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=TeamStats`;
    const pitcherStatsUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=PitcherStats`;
    
    // Fetch team stats
    const teamStatsResponse = await fetch(teamStatsUrl);
    const teamStatsText = await teamStatsResponse.text();
    
    // Parse CSV data using Papa Parse
    const teamStatsData = Papa.parse(teamStatsText, { 
      header: true, 
      skipEmptyLines: true,
      dynamicTyping: true
    }).data;
    
    // Process team stats
    teamStatsData.forEach(row => {
      if (row.TeamCode && row.StrikeoutsPerGame) {
        teamData.teamStrikeouts[row.TeamCode] = parseFloat(row.StrikeoutsPerGame);
      }
    });
    
    // Fetch pitcher stats
    const pitcherStatsResponse = await fetch(pitcherStatsUrl);
    const pitcherStatsText = await pitcherStatsResponse.text();
    
    // Parse CSV data
    const pitcherStatsData = Papa.parse(pitcherStatsText, { 
      header: true, 
      skipEmptyLines: true,
      dynamicTyping: true
    }).data;
    
    // Process pitcher stats
    pitcherStatsData.forEach(row => {
      if (row.PitcherName && row.Team) {
        // Process strikeouts
        if (row.Strikeouts) {
          pitcherData.strikeouts[row.PitcherName] = { 
            value: parseInt(row.Strikeouts, 10), 
            team: row.Team 
          };
        }
        
        // Process ERA
        if (row.ERA_Points) {
          pitcherData.era[row.PitcherName] = { 
            value: parseInt(row.ERA_Points, 10), 
            team: row.Team 
          };
        }
        
        // Process hits allowed
        if (row.HitsAllowed) {
          pitcherData.hitsAllowed[row.PitcherName] = { 
            value: parseInt(row.HitsAllowed, 10), 
            team: row.Team 
          };
        }
      }
    });
    
    console.log("Data loaded successfully from Google Spreadsheet!");
    
  } catch (error) {
    console.error("Error fetching data from Google Spreadsheet:", error);
    
    // Fallback to stored data if fetching fails
    console.log("Using stored data as fallback...");
    
    // Add your current data as fallback here
    teamData.teamStrikeouts = {
      "SD": 6.84,
      "KC": 6.92,
      "TOR": 7.46,
      "ARI": 7.47,
      "SAC": 7.51,
      "STL": 7.64,
      "NYM": 7.64,
      "HOU": 7.72,
      "TEX": 7.77,
      "CLE": 7.83,
      "PHI": 7.93,
      "CHC": 7.96,
      "WSH": 8.06,
      "MIN": 8.19,
      "MIL": 8.21,
      "LAD": 8.32,
      "ATL": 8.45,
      "CWS": 8.45,
      "TB": 8.54,
      "SF": 8.6,
      "MIA": 8.6,
      "DET": 8.74,
      "PIT": 8.81,
      "BAL": 8.84,
      "NYY": 8.96,
      "SEA": 8.98,
      "CIN": 9.04,
      "BOS": 9.1,
      "LAA": 9.78,
      "COL": 9.85
    };
    
    // Add fallback pitcher data (first few entries from each category as examples)
    pitcherData.strikeouts = {
      "German Marquez": { value: 39, team: "Colorado Rockies" },
      "Tanner Houck": { value: 39, team: "Boston Red Sox" },
      "Sandy Alcantara": { value: 37, team: "Miami Marlins" }
      // Add more pitcher strikeout data as needed
    };
    
    pitcherData.era = {
      "MacKenzie Gore": { value: 84, team: "Washington Nationals" },
      "Zack Wheeler": { value: 80, team: "Philadelphia Phillies" },
      "Garrett Crochet": { value: 73, team: "Boston Red Sox" }
      // Add more pitcher ERA data as needed
    };
    
    pitcherData.hitsAllowed = {
      "Antonio Senzatela": { value: 74, team: "Colorado Rockies" },
      "Kyle Freeland": { value: 64, team: "Colorado Rockies" },
      "Chris Sale": { value: 59, team: "Atlanta Braves" }
      // Add more pitcher hits allowed data as needed
    };
  }
}

// Fetch data when the page loads
document.addEventListener('DOMContentLoaded', fetchSpreadsheetData);

// Export the data objects
window.teamData = teamData;
window.pitcherData = pitcherData;
