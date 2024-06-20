const express = require('express');
const viewemployee = require('../controllers/employeeController.js'); // Fix the casing of the file name
const router = express.Router();

router.get('/employee', viewemployee.allEmployees);
router.get('/add_employee', viewemployee.addEmployee);

// router.get('/add_employee', viewemployee.addEmployee);
router.post('/edit_employee:id', viewemployee.editEmployee);

module.exports = router;