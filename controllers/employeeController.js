const EmployeeModel = require('../models/EmployeeModel.js');

module.exports = {

    allEmployees: function (req, res) {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        const permissions = req.session.permissions;

        if (!permissions || permissions.employee.employee_read !== 'Y') {
            res.redirect('/404');
        } else {
            EmployeeModel.getAllEmployees((error, employees) => {
                if (error) {
                    console.error('Error fetching employees: ', error);
                    res.status(500).send('Internal Server Error');
                } else {
                    res.render('employee', { employees: employees, user: req.session.user, permissions: permissions });
                }
            });
        }
    },

    viewEmployee: function (req, res) {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const permissions = req.session.permissions;

        if (!permissions || permissions.employee.employee_read !== 'Y') {
            res.redirect('/404');
        } else {
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

                    res.render('view_employee', { employee: employee, user: req.session.user, permissions: permissions });
                } else {
                    res.status(404).send('Employee not found');
                }
            });
        }
    },

    viweAddEmployee: function (req, res) {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const permissions = req.session.permissions;

        if (!permissions || permissions.employee.employee_read !== 'Y') {
            res.redirect('/404');
        } else {

            res.render('add_employee', {
                error: req.flash('error'),
                formData: req.body || {},
                user: req.session.user,
                permissions: permissions
            });
        }
    },

    addEmployee: function (req, res) {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const permissions = req.session.permissions;

        if (!permissions || permissions.employee.employee_read !== 'Y') {
            res.redirect('/404');
        } else {

            const {
                employee_id, title, first_name, last_name, nickname,
                id_number, date_of_birth, phone_number, email, other
            } = req.body;

            const formData = {
                employee_id, title, first_name, last_name, nickname,
                id_number, date_of_birth, phone_number, email, other
            };

            console.log(formData);

            EmployeeModel.checkDuplicates_AddEmployee(employee_id, id_number, phone_number, (error, duplicates) => {
                if (error) {
                    console.error('Database error:', error);
                    return res.status(500).send('Internal Server Error');
                }
                if (duplicates && Object.keys(duplicates).length > 0) {
                    return res.render('add_employee', { error: duplicates, formData: formData, user: req.session.user, permissions: permissions });
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
        }
    },

    editEmployee: function (req, res) {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const permissions = req.session.permissions;
        if (!permissions || permissions.employee.employee_read !== 'Y') {
            res.redirect('/404');
        } else {

            const employeeId = req.params.id;

            EmployeeModel.getEmployeeById(employeeId, function (error, results) {
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

                    res.render('edit_employee', { employee: employee, error: {}, user: req.session.user, permissions: permissions });
                } else {
                    res.status(404).send('Employee not found');
                }
            });
        }
    },

    updateEmployee: function (req, res) {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const permissions = req.session.permissions;
        if (!permissions || permissions.employee.employee_read !== 'Y') {
            res.redirect('/404');
        } else {

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
                    if (duplicates.id_number) {
                        errorMessages.id_number = 'เลขบัตรประชาชน';
                    }
                    if (duplicates.phone_number) {
                        errorMessages.phone_number = 'เบอร์โทรศัพท์';
                    }

                    if (Object.keys(errorMessages).length > 0) {
                        return res.render('edit_employee', { error: errorMessages, employee: req.body, user: req.session.user, permissions: permissions });
                    }
                }

                EmployeeModel.updateEmployeeById(employee_id, formData, (err, result) => {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).send('Internal Server Error');
                    }
                    if (result.affectedRows === 0) {
                        return res.render('edit_employee', { error: { message: 'Employee not found.' }, employee: formData, user: req.session.user, permissions: permissions });
                    }
                    res.redirect(`/view_employee/${employee_id}`);
                });
            });
        }
    },

    deleteEmployee: function (req, res) {
        if (!req.session.user) {
            return res.redirect('/login');
        }
            const employeeId = req.params.id;
            EmployeeModel.deleteEmployeeById(employeeId, function (error, results) {
                if (error) {
                    console.error('Database error:', error);
                    res.status(500).send('Internal Server Error');
                } else {
                    res.redirect('/employee');
                }
            });
    },
};
