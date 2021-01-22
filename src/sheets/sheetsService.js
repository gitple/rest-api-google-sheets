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

const SHEET_ROW_ID = 'row';

/**
 * retrieve range data from the Google spreadsheet
 * @param {string} sheetId : sheet id
 * @param {string} tabId : tab name
 * @param {string} range : data ranage. Example A1:Z1
 */
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
 * Returns one or more ranges of values from a spreadsheet
 * reference: https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/batchGet
 * @param {*} sheetId 
 * @param {*} tabId 
 * @param {*} range 
 */
const batchGetFromSheet = async (sheetId, tabId, range) => {
  const auth = await google.auth.getClient({
    keyFile: path.join(__dirname, 'creds.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const api = google.sheets({
    version: 'v4',
    auth
  });
  const response = await api.spreadsheets.values.batchGet({
    spreadsheetId: sheetId,
    ranges: [`${tabId}!${range}`]
  });

  console.debug(`[batchGetFromSheet] sheet id: ${sheetId}, tab id: ${tabId}, range: ${range} `);
  console.debug(response.data)

  return response.data.valueRanges;
}

const updateToSheet = async (row, sheetId, tabId, range) => {
  const auth = await google.auth.getClient({
    keyFile: path.join(__dirname, 'creds.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const api = google.sheets({
    version: 'v4',
    auth
  }); 

  const response = await api.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `${tabId}!${range}`,
    valueInputOption: 'USER_ENTERED',
    includeValuesInResponse: true,
    requestBody: {
      values: [
        row, // Example: ['Grant', '1/1/2000'],
      ],
    },
  });

  console.debug(`[updateToSheet] sheet id: ${sheetId}, tab id: ${tabId}`);
  console.debug(response.data);
  return response.data;
}

/**
 * Appends row data to the Google spreadsheet
 * @param {array} row : Data to be added. Example: ['Grant', '1/1/2000'],
 * @param {string} sheetId : sheet id
 * @param {string} tabId : tab name
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

  // NOTE: get all rows for next row id
  const rows = await retrieveFromSheet(sheetId, tabId, SHEETS_RANGE.data);
  const rowCount = _.size(rows);

  const response = await api.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${tabId}!A${rowCount + 2}`, // 'A1:A1', // Needed, but not used when values are present.
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

const parseRange = (tabId, range) => {
  const regexpNumber = /\d/g;
  const RegexpAlphabet = /[a-zA-Z]/g;
  const rangeRowColumn = _.split(_.replace(range, `'${tabId}'!`, ''), ':', 2);

  if (!rangeRowColumn[0] || !rangeRowColumn[1]) {
    console.warn('[parseRange] invalid range', tabId, range);
    return null;
  }
  
  return {
    start: {
      column: _.replace(rangeRowColumn[0], regexpNumber, ''),
      row: _.replace(rangeRowColumn[0], RegexpAlphabet, '')
    },
    end: {
      column: _.replace(rangeRowColumn[1], regexpNumber, ''),
      row: _.replace(rangeRowColumn[1], RegexpAlphabet, '')
    }
  }
}

const rowToObject = (keys, row, id = null) => {
  if (keys && row) {
    const result = _.reduce(keys, (result, key, index) => {
      if (key && !_.isNil(row[index])) {
        result[key] = row[index];
      }
      return result;
    }, {});
    if (!_.isNil(id)) {
      result[SHEET_ROW_ID] = id;
    }
    return result;
  }

  return null;
}

const objectToRow =  (keys, object) => {
  return _.reduce(keys, (result, key) => {
    if (object[key]) {
      result.push(object[key]);
    } else  {
      result.push(null);
    }
    return result;
  }, []);
}

const getCardSelects = async (sheetId, tabId) => {
  const formatCardRow = row => ({
    label: row[0],
    value: row[1],
    image: row[2]
  });

  const rows = await retrieveFromSheet(sheetId, tabId, SHEETS_RANGE.cardSelect);

  return rows ? rows.map((row) => formatCardRow(row)) : [];
}

const getListSelects = async (sheetId, tabId) => {
  const formatListRow = row => ({
    label: row[0],
    value: row[1]
  });

  const rows = await retrieveFromSheet(sheetId, tabId, SHEETS_RANGE.listSelect);

  return rows ? rows.map((row) => formatListRow(row)) : [];
}

const getByKey = async (key, value, operations, sheetId, tabId) => {
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

    let matchedData;
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

        matchedData = rowToObject(keys[0], row)

        // add google sheet row ID
        matchedData[SHEET_ROW_ID] = rowIndex + 2;

        return false;
      }
    });

    console.debug(`[getData] sheet id: ${sheetId}, tab id: ${tabId}`);
    console.debug('[getData] matched  data: ', matchedData);

    return matchedData;
  }

  return null;
}

const getByRow = async (rowId, sheetId, tabId) => {
  const keys = await retrieveFromSheet(sheetId, tabId, SHEETS_RANGE.keys);  
  const rows = await retrieveFromSheet(sheetId, tabId, `${rowId}:${rowId}`); 

  if (keys && keys[0] && rows && rows[0]) {
    return rowToObject(keys[0], rows[0], rowId);
  }

  return null;
}

const putByKey = async (key, value, operations, data, sheetId, tabId) => {
  const keys = await retrieveFromSheet(sheetId, tabId, SHEETS_RANGE.keys); 
  const beforeData = await getByKey(key,  value, operations, sheetId,  tabId);

  if (keys && keys[0] && beforeData) {
    const updateData = _.assign(beforeData, data);
    const response = await updateToSheet(objectToRow(keys[0], updateData), sheetId, tabId, `${updateData[SHEET_ROW_ID]}:${updateData[SHEET_ROW_ID]}`);
    const updatedValues = _.get(response, 'updatedData.values');

    if (updatedValues && updatedValues[0]) {
      const result = rowToObject(keys[0], updatedValues[0]);
      result[SHEET_ROW_ID] = beforeData[SHEET_ROW_ID];
      return result;
    }

    return response;
  }

  return null;
}

const putByRow = async (rowId, data, sheetId, tabId) => {
  const keys = await retrieveFromSheet(sheetId, tabId, SHEETS_RANGE.keys); 
  const beforeData = await getByRow(rowId, sheetId, tabId);

  if (keys && keys[0] && beforeData) {
    const updateData = _.assign(beforeData, data);
    const response = await updateToSheet(objectToRow(keys[0], updateData), sheetId, tabId, `${updateData[SHEET_ROW_ID]}:${updateData[SHEET_ROW_ID]}`);
    const updatedValues = _.get(response, 'updatedData.values');

    if (updatedValues && updatedValues[0]) {
      const result = rowToObject(keys[0], updatedValues[0]);
      result[SHEET_ROW_ID] = rowId;
      return result;
    }

    return response;
  }

  return null;
}


const post = async (body, sheetId, tabId) => {
  // get title keys
  const keys = await retrieveFromSheet(sheetId, tabId, SHEETS_RANGE.keys);

  if (keys && keys[0]) {
    const row = objectToRow(keys[0], body);
    const result = await appendToSheet(row, sheetId, tabId);

    // TODO: add row id
    const updatedValues = _.get(result, 'updates.updatedData.values');
    const updatedRange = _.get(result, 'updates.updatedData.range');
    if (updatedValues && updatedValues[0] && updatedRange) {
      const range = parseRange(tabId, updatedRange);
      return rowToObject(keys[0], updatedValues[0], range.start.row);
    }

    return result;
  }
  return null;
}

module.exports = {
  getCardSelects:  getCardSelects,
  getListSelects: getListSelects,
  getByKey: getByKey,
  getByRow: getByRow,
  putByKey: putByKey,
  putByRow: putByRow,
  post:  post
}