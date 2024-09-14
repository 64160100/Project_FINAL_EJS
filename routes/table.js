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

router.get('/order_food', table.orderFood);
router.get('/customize/:id', table.customize);


router.get('/zone/:zone/table/:table/order_food', table.zoneOrderFood);
router.get('/zone/:zone/table/:table/customize/:id', table.zoneCustomize);

module.exports = router;