const path = require('path');
const { google } = require('googleapis');
const _ = require('lodash');

const SHEETS_RANGE = {
  'listSelect': 'A:B',
  'cardSelect': 'A:C',
  'data': 'A:B'
}

const retrieveFromSheet = async (sheetId, tabId, range) => {
  const auth = await google.auth.getClient({
    keyFile: path.join(__dirname, 'creds.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const api = google.sheets({
    version: 'v4',
    auth
  });
  const response = await api.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${tabId}!${range}`
  });

  console.debug(`[retrieveFromSheet] sheet id: ${sheetId}, tab id: ${tabId}, range: ${range} `);
  console.debug(response.data)
  
  return response.data.values;
}

/**
 * Appends row data to the Google Sheet
 */
const appendToSheet = async (row, sheetId, tabId) => {
  // Obtain user credentials to use for the request
  const auth = await google.auth.getClient({
    keyFile: path.join(__dirname, 'creds.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const api = google.sheets({
    version: 'v4',
    auth
  });

  const response = await api.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: tabId, // 'A1:A1', // Needed, but not used when values are present.
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [
        row, // Example: ['Grant', '1/1/2000'],
      ],
    },
  });

  console.debug(`[appendToSheet] sheet id: ${sheetId}, tab id: ${tabId}`);
  console.debug(response.data);
  return response.data;
}


exports.getCardSelects = async (sheetId, tabId) => {
  const formatCardRow = row => ({
    label: row[0],
    value: row[1],
    image: row[2]
  });

  const rows = await retrieveFromSheet(sheetId, tabId, SHEETS_RANGE.cardSelect);

  return rows ? rows.map((row) => formatCardRow(row)) : [];
}

exports.getListSelects = async (sheetId, tabId) => {
  const formatListRow = row => ({
    label: row[0],
    value: row[1]
  });

  const rows = await retrieveFromSheet(sheetId, tabId, SHEETS_RANGE.listSelect);

  return rows ? rows.map((row) => formatListRow(row)) : [];
}

exports.getData = async (sheetId, tabId) => {
  const rows = await retrieveFromSheet(sheetId, tabId, SHEETS_RANGE.data);
  return rows ? _.reduce(rows, (result, row) => {
    if (row[0], row[1]) {
      result[row[0]] = row[1];
    }
    return result;
  }, {}) : {};
}

exports.setData = async (body, sheetId, tabId) => {
  // NOTe: body is json data: { key1: value1, key2: value2 }
  // change to [key1, value1, key2, value2]
  let row = [];
  _.forOwn(body, (value, key) => {
    row.push(key);
    try {
      row.push(JSON.stringify(value));
    } catch (error) {
      console.warn('[setData] value JSON.stringify failed. value:', value);
      row.push('parsing error');
    }
  });
  return await appendToSheet(row, sheetId, tabId)
}

