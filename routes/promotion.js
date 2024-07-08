const express = require('express');
const promotion = require('../controllers/promotionController.js');
const router = express.Router();

router.get('/promotion', promotion.promotionView);

module.exports = router;