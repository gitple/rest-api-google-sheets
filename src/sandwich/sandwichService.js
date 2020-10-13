const {
  google
} = require('googleapis');
const mockupData = require("./sandwich-data.json");

const SPREAD_SHEET_ID = '12dBp6YshIjPvwp85VUQI2mgsU5KBLU54tVitKEyQghQ';
const SANDWICH_RANGE = 'sandwich!A:C';
const SALAD_RANGE = 'salad!A:C';

const formatSelectRow = row => ({
  label: row[0],
  value: row[1],
  image: row[2]
});

const retrieveDataFromSpreadSheets = async (range) => {
  const auth = await google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const api = google.sheets({
    version: 'v4',
    auth
  });
  const response = await api.spreadsheets.values.get({
    spreadsheetId: SPREAD_SHEET_ID,
    range: range
  });
  return response.data.values;
}

const retrieveDataFromMockup = async (range) => {
  let result;

  if (range === SANDWICH_RANGE) {
    result = mockupData.sandwich;
  } else if (range === SALAD_RANGE) {
    result = mockupData.salad;
  } else {
    console.error("[sandwichService/retrieveDataFromMockup] range is invalid. range:", range);
  }
  return result;
}

const retrieveData =
  process.env.NODE_ENV === "development"
    ? retrieveDataFromMockup
    : retrieveDataFromSpreadSheets;


exports.getSandwich = async () => {
  const results = await retrieveData(SANDWICH_RANGE);
  
  // console.log('[sandwichService/getSandwich] retrieveDataFromSpreadSheets() result', results);
  return results.map((row) => formatSelectRow(row));
}

exports.getSalad = async () => {
  const results = await retrieveData(SALAD_RANGE);

  // console.log('[sandwichService/getSalad] retrieveDataFromSpreadSheets() result', results);
  return results.map(row => formatSelectRow(row));
}
