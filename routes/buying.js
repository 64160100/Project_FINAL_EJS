const express = require('express');
const buying = require('../controllers/buyingController.js');
const router = express.Router();

router.get('/buying', buying.buyingView);
router.get('/add_buying', buying.addBuyingView);
router.get('/view_buying/:id', buying.viewBuyingView);
router.post('/create_buying', buying.createBuying);
router.post('/delete_buying/:id', buying.deleteBuying);
// router.get('/view_buying/:id', buying.viewBuyingView);

router.get('/setting_type', buying.settingTypeView);
router.get('/setting_add_type', buying.settingAddTypeView);
router.post('/create_setting_type', buying.createSettingType);
router.post('/delete_setting_type/:id', buying.deleteSettingType);

router.get('/setting_unit', buying.settingUnitView);
router.get('/setting_add_unit', buying.settingAddUnitView);
router.post('/create_setting_unit', buying.createSettingUnit);
router.post('/delete_setting_unit/:id', buying.deleteSettingUnit);

router.get('/search-product', buying.searchProduct);

router.post('/updateBuyingTime', buying.updateBuyingTime);

router.get('/warehouse', buying.warehouseView);
router.get('/view_warehouse/:id', buying.viewWarehouseView);
router.post('/update_warehouse', buying.createWarehouse);



module.exports = router;