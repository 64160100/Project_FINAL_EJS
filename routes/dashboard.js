const express = require('express');
const DashboardView = require('../controllers/dashboardController.js');
const router = express.Router();

router.get('/dashboard', DashboardView.deshboardview);


module.exports = router;
