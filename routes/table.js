const express = require('express');
const table = require('../controllers/tableController.js');
const router = express.Router();

router.get('/table', table.tableView);
router.get('/add_table', table.addTableView);
router.get('/view_zone/:id', table.viewZone);
router.post('/create_area', table.createTable);

router.get('/order_food', table.orderFood);

module.exports = router;