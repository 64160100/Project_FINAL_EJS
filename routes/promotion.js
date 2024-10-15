const express = require('express');
const promotion = require('../controllers/promotionController.js');
const router = express.Router();

router.get('/promotion', promotion.promotionView);
router.get('/add_promotion', promotion.addPromotionView);
router.get('/view_promotion/:id', promotion.viewPromotionView);
router.post('/create_promotion', promotion.createPromotion);
router.post('/delete_promotion/:id', promotion.deletePromotion);
router.post('/update_promotion', promotion.updatePromotion);

module.exports = router;