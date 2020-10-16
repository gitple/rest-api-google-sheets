const express = require('express');
const router = express.Router();
const sheetsController = require('./sheets/sheetsController');

router.get('/cards', sheetsController.getCardSelects);
router.get('/lists', sheetsController.getListSelects);
router.get('/data', sheetsController.getData);
router.post('/data', sheetsController.setData);

module.exports = router;