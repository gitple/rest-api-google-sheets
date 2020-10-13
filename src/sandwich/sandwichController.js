const sandwichService = require('./sandwichService');

/**
 * Controller to retrieve single date push up
 */
exports.getSandwich = async (req, res) => {
  try {
    const result = await sandwichService.getSandwich();
    return res.json({
      templateType: "basicCard",
      data: result
    });
  } catch (err) {
    console.error('[sandwichController/getSandwich] error:', err);
    return res.status(500).json({
      errors: err
    });
  }
};

/**
 * Controller to retrieve single date push up
 */
exports.getSalad = async (req, res) => {
  try {
    const result = await sandwichService.getSalad();
    return res.json({
      templateType: "basicCard",
      data: result
    });
  } catch (err) {
    console.error('[sandwichController/getSalad] error:', err);
    return res.status(500).json({
      errors: err
    });
  }
};
