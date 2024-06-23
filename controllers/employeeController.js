const EmployeeModel = require('../models/EmployeeModel.js');
const connection = require('../models/ConMysql');

module.exports = {

    allEmployees: function (req, res) {
        EmployeeModel.getAllEmployees((error, employees) => {
            if (error) {
                console.error('Error fetching employees: ', error);
                res.status(500).send('Internal Server Error');
            } else {
                // Render the EJS template with the employees data
                res.render('employee', { employees: employees });
            }
        });
    },

    viewEmployee: function (req, res) {
        const employeeId = req.params.id;
        EmployeeModel.getEmployeeById(employeeId, function (error, results) {
            if (error) {
                console.error('Database error:', error);
                res.status(500).send('Internal Server Error');
            } else if (results.length > 0) {
                const employee = results[0];

                function formatDate(date) {
                    const d = new Date(date),
                        month = '' + (d.getMonth() + 1),
                        day = '' + d.getDate(),
                        year = d.getFullYear();

                    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
                }

                if (employee.date_of_birth) {
                    employee.date_of_birth = formatDate(employee.date_of_birth);
                }

                res.render('view_employee', { employee: employee });
            } else {
                res.status(404).send('Employee not found');
            }
        });
    },

    viweAddEmployee: function (req, res) {
        res.render('add_employee', {
            error: req.flash('error'), 
            formData: req.body || {} 
        });
    },

    addEmployee: function (req, res) {
        const {
            employee_id, title, first_name, last_name, nickname,
            id_number, date_of_birth, phone_number, email, other
        } = req.body;
    
        const formData = {
            employee_id, title, first_name, last_name, nickname,
            id_number, date_of_birth, phone_number, email, other
        };
    
        EmployeeModel.checkDuplicates_AddEmployee(employee_id, id_number, phone_number, (error, duplicates) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).send('Internal Server Error');
            }
            if (duplicates && Object.keys(duplicates).length > 0) {
                return res.render('add_employee', { error: duplicates, formData: formData });
            }
    
            EmployeeModel.addEmployee(formData, function (error) {
                if (error) {
                    console.error('Database error:', error);
                    res.status(500).send('Internal Server Error');
                } else {
                    res.redirect('/employee');
                }
            });
        });
    },

    editEmployee: function(req, res) {
        const employeeId = req.params.id; 
    
        EmployeeModel.getEmployeeById(employeeId, function(error, results) {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).send('Internal Server Error');
            } 
    
            if (results.length > 0) {
                const employee = results[0];
    
                function formatDate(date) {
                    const d = new Date(date),
                        month = '' + (d.getMonth() + 1),
                        day = '' + d.getDate(),
                        year = d.getFullYear();
    
                    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
                }
    
                if (employee.date_of_birth) {
                    employee.date_of_birth = formatDate(employee.date_of_birth);
                }
    
                // Render the edit page with the employee data
                res.render('edit_employee', { employee: employee, error: {} });
            } else {
                // If no employee data is found, send a 404 error
                res.status(404).send('Employee not found');
            }
        });
    },

    updateEmployee: function(req, res) {
        const {
            employee_id, title, first_name, last_name, nickname,
            id_number, date_of_birth, phone_number, email, other
        } = req.body;
    
        const formData = {
            employee_id, title, first_name, last_name, nickname,
            id_number, date_of_birth, phone_number, email, other
        };
    
        EmployeeModel.checkDuplicates_EditEmployee(employee_id, id_number, phone_number, (error, duplicates) => {
            let errorMessages = {};
            
            if (error) {
                console.error('Database error:', error);
                return res.status(500).send('Internal Server Error');
            }
            
            if (duplicates && Object.keys(duplicates).length > 0) {
                // Assuming duplicates object keys are the fields with duplicates
                if (duplicates.id_number) {
                    errorMessages.id_number = 'เลขบัตรประชาชน';
                }
                if (duplicates.phone_number) {
                    errorMessages.phone_number = 'เบอร์โทรศัพท์';
                }
                
                // If there are error messages, render the page with errors
                if (Object.keys(errorMessages).length > 0) {
                    return res.render('edit_employee', { error: errorMessages, employee: req.body });
                }
            }
    
            EmployeeModel.updateById(employee_id, formData, (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).send('Internal Server Error');
                }
                if (result.affectedRows === 0) {
                    // Handle non-existent employee
                    return res.render('edit_employee', { error: { message: 'Employee not found.' }, employee: formData });
                }
                // Redirect to view_employee page with the employee's ID
                res.redirect(`/view_employee/${employee_id}`);
            });
        });
    },

    deleteEmployee: function(req, res) {
        const employeeId = req.params.id;
        EmployeeModel.deleteById(employeeId, function(error, results) {
            if (error) {
                console.error('Database error:', error);
                res.status(500).send('Internal Server Error');
            } else {
                res.redirect('/employee');
            }
        });
    },
};
