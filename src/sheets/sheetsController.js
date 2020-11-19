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

exports.getData = async (req, res) => {
  try {
    const key =  req.query.key;
    const value = req.query.value;
    const operations = req.query.op;
    const result = await sheetsService.getData(key, value, operations, ...sheetInfo(req));
    if (result) {
      return res.json(result);
    }
    return res.status(404).json({errors: 'not found'})
  } catch (err) {
    console.error('[sheetsController/getData] error:', err);
    return res.status(500).json({
      errors: err
    });
  }
};

exports.setData = async (req, res) => {
  try {
    const result = await sheetsService.setData(req.body, ...sheetInfo(req));
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
