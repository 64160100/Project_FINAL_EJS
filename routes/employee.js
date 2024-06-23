const express = require('express');
const employee = require('../controllers/employeeController.js'); // Fix the casing of the file name
const router = express.Router();

router.get('/employee', employee.allEmployees);
router.get('/add_employee', employee.viweAddEmployee);
router.get('/view_employee/:id', employee.viewEmployee);
router.get('/edit_employee/:id', employee.editEmployee);
router.post('/create_employee', employee.addEmployee);
router.post('/delete_employee/:id', employee.deleteEmployee);
router.post('/update_employee', employee.updateEmployee);

// router.get('/add_employee', viewemployee.addEmployee);
// router.post('/edit_employee:id', viewemployee.editEmployee);

module.exports = router;