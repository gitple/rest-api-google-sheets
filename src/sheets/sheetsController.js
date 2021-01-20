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

exports.getDataById = async (req, res) => {
  try {
    const id =  req.params.id;
    console.info('[sheetsController/getDataById] request id:', id);

    const result = await sheetsService.getDataById(id, ...sheetInfo(req));
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

exports.putDataById = async (req, res) => {
  // TODO: add put by id
  return res.status(200).json({test: 'test'});
}

exports.putDataByKey = async (req, res) => {
  // TODO: add put by key
  return res.status(200).json({test: 'test'});
}

exports.postData = async (req, res) => {
  try {
    const result = await sheetsService.postData(req.body, ...sheetInfo(req));
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
