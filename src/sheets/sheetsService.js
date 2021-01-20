const path = require('path');
const {
  google
} = require('googleapis');
const _ = require('lodash');

const SHEETS_RANGE = {
  'listSelect': 'A2:B',
  'cardSelect': 'A2:C',
  'data': 'A2:Z',
  'keys': '1:1'
}

const SHEET_ROW_ID = '_id';

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
    includeValuesInResponse: true,
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

/**
 * 
 * @param {*} sheetId 
 * @param {*} tabId 
 */
// const updateToSheet = async()


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

exports.getData = async (key, value, operations, sheetId, tabId) => {
  // param ex) key=email,done&value=ys@xx.com|jy@xx.com,yes

  const keys = await retrieveFromSheet(sheetId, tabId, SHEETS_RANGE.keys);
  const rows = await retrieveFromSheet(sheetId, tabId, SHEETS_RANGE.data);

  const keysParam = _.split(key, ',');
  const valuesParam = _.split(value, ',');
  const opsParam = _.split(operations, ',');

  if (keys && keys[0]) {
    const keyIndexList = _.reduce(keysParam, (r, v) => {
      r.push(_.indexOf(keys[0], v));
      return r;
    }, []);

    let matchedRow;
    _.forEach(rows, (row, rowIndex) => {
      if (!key // 1st row on missing a key param
        ||
        _.every(keyIndexList, // AND: comma separated keys and values, OR: '|' separated ones for a value
          (v, k) => _.some(_.split(valuesParam[k], '|'), (sv) => {
            let rtn = false;

            switch (opsParam[k]) {
              case 'gt': {
                rtn = (Number(row[v]) > Number(sv));
                break;
              }
              case 'gte': {
                rtn = (Number(row[v]) >= Number(sv));
                break;
              }
              case 'lt': {
                rtn = (Number(row[v]) < Number(sv));
                break;
              }
              case 'lte': {
                rtn = (Number(row[v]) <= Number(sv));
                break;
              }
              default: {
                rtn = (row[v] == sv);
                break;
              }
            }
            return rtn;
          }))) {
        matchedRow = _.reduce(keys[0], (result, key, index) => {
          result[key] = row[index];
          return result;
        }, {});

        // add google sheet row ID
        matchedRow[SHEET_ROW_ID] = rowIndex + 2;

        return false;
      }
    });

    console.debug(`[getData] sheet id: ${sheetId}, tab id: ${tabId}`);
    console.debug('data: ', matchedRow);

    return matchedRow;
  }

  return null;
}

exports.getDataById = async (id, sheetId, tabId) => {

  const keys = await retrieveFromSheet(sheetId, tabId, SHEETS_RANGE.keys);  
  const rows = await retrieveFromSheet(sheetId, tabId, `${id}:${id}`);

  if (keys && keys[0] && rows && rows[0]) {
    const row = rows[0];
    const result = _.reduce(keys[0], (result, key, index) => {
      if (key && !_.isNil(row[index])) {
        result[key] = row[index];
      }
      return result;
    }, {});
    result[SHEET_ROW_ID] = id;
    return result;
  }

  return null;
}

exports.postData = async (body, sheetId, tabId) => {
  // get title keys
  const keys = await retrieveFromSheet(sheetId, tabId, SHEETS_RANGE.keys);

  if (keys && keys[0]) {
    const row = _.reduce(keys[0], (result, key) => {
      if (body[key]) {
        result.push(body[key]);
      } else  {
        result.push(null);
      }
      return result;
    }, []);
    const result = await appendToSheet(row, sheetId, tabId);

    // TODO: add row id

    return result;
  }
  return null;
}