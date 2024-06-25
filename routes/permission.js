const express = require('express');
const permission = require('../controllers/permissionController.js'); // Fix the casing of the file name
const router = express.Router();

router.get('/permission', permission.viwePermission);
router.get('/create_permission', permission.viweCreatePermission);

// router.get('/add_employee', viewemployee.addEmployee);
// router.post('/edit_employee:id', viewemployee.editEmployee);

module.exports = router;