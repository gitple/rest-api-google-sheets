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
    return res.json({
      templateType: "basicCard",
      data: result
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
    return res.json({
      templateType: "list",
      data: result
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
    const result = await sheetsService.getData(...sheetInfo(req));
    return res.json(result);
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
    return res.status(201).json(result);
  } catch (err) {
    console.error('[sheetsController/setData] error:', err);
    return res.status(500).json({
      errors: err
    });
  }
};
