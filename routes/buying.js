const express = require('express');
const buying = require('../controllers/buyingController.js');
const router = express.Router();

router.get('/buying', buying.buyingView);
router.get('/add_buying', buying.addBuyingView);
// router.get('/view_buying/:id', buying.viewBuyingView);
router.get('/setting_type', buying.settingTypeView);
router.get('/setting_add_type', buying.settingAddTypeView);
router.post('/create_setting_type', buying.createSettingType);
router.post('/delete_setting_type/:id', buying.deleteSettingType);

router.get('/setting_unit', buying.settingUnitView);
router.get('/setting_add_unit', buying.settingAddUnitView);
router.post('/create_setting_unit', buying.createSettingUnit);
router.post('/delete_setting_unit/:id', buying.deleteSettingUnit);

router.post('/create_buying', buying.createBuying);

module.exports = router;