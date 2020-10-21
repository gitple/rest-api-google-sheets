const path = require('path');
const { google } = require('googleapis');
const _ = require('lodash');

const SHEETS_RANGE = {
  'listSelect': 'A2:B',
  'cardSelect': 'A2:C',
  'data': 'A2:Z',
  'keys':  'A1:Z1'
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

exports.getData = async (key, value, sheetId, tabId) => {
  const keys = await retrieveFromSheet(sheetId, tabId, SHEETS_RANGE.keys);
  const rows = await retrieveFromSheet(sheetId, tabId, SHEETS_RANGE.data);

  if (keys && keys[0]) {
    const keyIndex = _.findIndex(keys[0]);

    let matchedRow;
    _.forEach(rows, (row) => {
      if (row[keyIndex] === value) {
        matchedRow = _.reduce(keys[0], (result, key, index) => {
          result[key] = row[index];
          return result;
        }, {});
        return false;
      }
    });

    console.debug(`[getData] sheet id: ${sheetId}, tab id: ${tabId}`);
    console.debug('data: ', matchedRow);

    return matchedRow;
  }

  return null;
}

exports.setData = async (body, sheetId, tabId) => {
  // get title keys
  const keys = await retrieveFromSheet(sheetId, tabId, SHEETS_RANGE.keys);

  if (keys && keys[0]) {
    const row = _.reduce(keys[0], (result, key) => {
      if (body[key]) {
        result.push(body[key]);
      }
      return result;
    }, []);
    return await appendToSheet(row, sheetId, tabId);
  }
  return null;
}

