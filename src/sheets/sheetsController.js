const { options } = require('../router');
const sheetsService = require('./sheetsService');

const sheetInfo = (req) => {
  const sheetId = req.query.sheet;
  const tabId = req.query.tab;

  console.debug(`[sheetsController/sheetInfo] sheets id: ${sheetId}, tab id: ${tabId}`);
  return [sheetId, tabId];
}

exports.getCardSelects = async (req, res) => {
  try {
    const result = await sheetsService.getCardSelects(...sheetInfo(req));
    if (result) {
      return res.json({
        templateType: "basicCard",
        data: result
      });
    }
    return res.status(404).json({
      errors: 'not found'
    });
  } catch (err) {
    console.error('[sheetsController/getSelects] error:', err);
    return res.status(500).json({
      errors: err
    });
  }
};

exports.getListSelects = async (req, res) => {
  try {
    const result = await sheetsService.getListSelects(...sheetInfo(req));
    if (result) {
      return res.json({
        templateType: "list",
        data: result
      });
    }
    return res.status(404).json({
      errors: 'not found'
    });
  } catch (err) {
    console.error('[sheetsController/getSelects] error:', err);
    return res.status(500).json({
      errors: err
    });
  }
};

exports.getDataByKey = async (req, res) => {
  try {
    const rowId = req.query.row;
    const key =  req.query.key;
    const value = req.query.value;
    const operations = req.query.op;
    console.info('[sheetsController/getDataByKey] request key, value, operations:', key, value, operations);

    let result;
    if (rowId) {
      result = await sheetsService.getByRow(rowId, ...sheetInfo(req));
    } else {
      result = await sheetsService.getByKey(key, value, operations, ...sheetInfo(req));
    }

    if (result) {
      return res.json(result);
    }
    return res.status(404).json({errors: 'not found'})
  } catch (err) {
    console.error('[sheetsController/getDataByKey] error:', err);
    return res.status(500).json({
      errors: err
    });
  }
};

exports.getDataById = async (req, res) => {
  try {
    const rowId =  req.params.id;
    console.info('[sheetsController/getDataById] request id:', rowId);

    const result = await sheetsService.getByRow(rowId, ...sheetInfo(req));
    if (result) {
      return res.json(result);
    }
    return res.status(404).json({errors: 'not found'})
  } catch (err) {
    console.error('[sheetsController/getDataById] error:', err);
    return res.status(500).json({
      errors: err
    });
  }
}

exports.putDataByKey = async (req, res) => {
  try {
    const rowId = req.query.row;
    const key =  req.query.key;
    const value = req.query.value;
    const operations = req.query.op;
    console.info('[sheetsController/putDataByKey] request key, value, operations:', key, value, operations);

    let result;
    if (rowId) {
      result = await sheetsService.putByRow(rowId, req.body, ...sheetInfo(req));
    } else {
      result = await sheetsService.putByKey(key, value, operations, req.body, ...sheetInfo(req));
    }

    if (result) {
      return res.json(result);
    }
    return res.status(404).json({errors: 'not found'})
  } catch (err) {
    console.error('[sheetsController/putDataByKey] error:', err);
    return res.status(500).json({
      errors: err
    });
  }
}

exports.putDataById = async (req, res) => {
  try {
    const id =  req.params.id;
    console.info('[sheetsController/putDataById] request id:', id, req.bod);

    const result = await sheetsService.putByRow(id, req.body, ...sheetInfo(req));
    if (result) {
      return res.json(result);
    }
    return res.status(404).json({errors: 'not found'})
  } catch (err) {
    console.error('[sheetsController/putDataById] error:', err);
    return res.status(500).json({
      errors: err
    });
  }
}

exports.postData = async (req, res) => {
  try {
    const result = await sheetsService.post(req.body, ...sheetInfo(req));
    if (result) {
      return res.status(201).json(result);
    }
    return  res.status(400).json({
      errors: 'bad request'
    });
  } catch (err) {
    console.error('[sheetsController/setData] error:', err);
    return res.status(500).json({
      errors: err
    });
  }
};
