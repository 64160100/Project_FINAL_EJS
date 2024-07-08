const express = require('express');
const table = require('../controllers/tableController.js');
const router = express.Router();

router.get('/table', table.tableView);

module.exports = router;