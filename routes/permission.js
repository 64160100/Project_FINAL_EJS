const express = require('express');
const permission = require('../controllers/permissionController.js'); // Fix the casing of the file name
const router = express.Router();

router.get('/permission', permission.allPermission);
router.get('/add_permission', permission.viewAddPermission);
router.get('/view_permission/:id', permission.viewPermission);
router.get('/edit_permission/:id', permission.editPermission);
router.post('/create_permission', permission.createPermission)
router.post('/delete_permission/:id', permission.deletePermission);
router.post('/update_permission', permission.updatePermission);

// router.get('/add_employee', viewemployee.addEmployee);
// router.post('/edit_employee:id', viewemployee.editEmployee);

module.exports = router;