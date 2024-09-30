const express = require('express');
const table = require('../controllers/tableController.js');
const router = express.Router();

router.get('/table', table.tableView);
router.get('/add_table', table.addTableView);
router.get('/view_zone/:id', table.viewZone);

router.get('/edit_table/:id', table.editTable);
router.post('/create_table/:id', table.insertTable);
router.post('/create_area', table.createTable);

router.post('/toggle_lock/:id', table.toggleLockZone);
router.post('/delete_table/:id', table.deleteTable);
router.post('/delete_zone/:id', table.deleteZone);

router.get('/view_bill', table.viewBill);

router.get('/zone/:zone/table/:table/order_food', table.zoneOrderFood);
router.get('/zone/:zone/table/:table/customize/:id', table.zoneCustomize);
router.post('/zone/:zone/table/:table/create_order', table.createOrder);
router.post('/zone/:zone/table/:table/update_order', table.updateOrder);
router.post('/zone/:zone/table/:table/delete_order', table.deleteOrder);

router.get('/zone/:zone/table/:table/view_checkbill', table.zoneViewCheckBill);
router.post('/zone/:zone/table/:table/create_checkbill', table.createCheckBill);
module.exports = router;