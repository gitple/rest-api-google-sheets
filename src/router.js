const express = require('express');
const router = express.Router();
const sandwichController = require('./sandwich/sandwichController');

router.get('/sandwich', sandwichController.getSandwich);
router.get('/salad', sandwichController.getSalad);

// router.get('/sandwich', sandwichController.getWithDate);

module.exports = router;