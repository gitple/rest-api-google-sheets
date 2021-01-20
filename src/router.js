const express = require('express');
const router = express.Router();
const sheetsController = require('./sheets/sheetsController');

router.get('/cards', sheetsController.getCardSelects);

router.get('/lists', sheetsController.getListSelects);

router.get('/data/:id', sheetsController.getDataById);

router.get('/data', sheetsController.getDataByKey);

router.put('/data/:id', sheetsController.putDataById);

router.put('/data', sheetsController.putDataByKey);

router.post('/data', sheetsController.postData);

module.exports = router;