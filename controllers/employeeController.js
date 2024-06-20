const connection = require('../models/ConMysql.js');

module.exports = {
    allEmployees: function (req, res) {
        connection.query('SELECT * FROM tbl_employees', (error, results) => {
            if (error) {
                console.error('Error fetching employees: ', error);
                res.status(500).send('Internal Server Error');
            } else {
                // สร้างอาร์เรย์ของอ็อบเจกต์พนักงานที่มี id และ name
                const employees = results.map(employee => ({
                    id: employee.employee_id,
                    name: employee.first_name + ' ' + employee.last_name
                }));
                // ส่งอาร์เรย์นี้ไปยังเทมเพลต EJS
                res.render('employee', { employees: employees });
            }
        });
    },
    
    addEmployee: function (req, res) {
        res.render('add_employee', { title: 'Add Employee'});
    },

    editEmployee: function (req, res) {
        connection.query('SELECT * FROM tbl_employees WHERE employee_id = ?', req.params.id, (error, results) => {
            if (error) {
                console.error('Error fetching employee: ', error);
                res.status(500).send('Internal Server Error');
            } else {
                res.render('employee_edit', { employee: results[0] });
            }
        });
        
    }
};
