const express = require('express');
const menu = require('../controllers/menuController.js');
const router = express.Router();

router.get('/menu', menu.menuView);
router.get('/add_menu', menu.menuAdd);

module.exports = router;