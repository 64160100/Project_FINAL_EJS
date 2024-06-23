const connection = require('../models/ConMysql');

module.exports = {

    viwetest: function (req, res) {
        let error = {};
        res.render('test', { error: error });
    },

    // Assuming connection is already defined and required at the top of the file
    addtest: function (req, res) {
        const {
            employee_id, title, first_name, last_name, nickname,
            id_number, date_of_birth, phone_number, email, other
        } = req.body;

        const checkDuplicates = (employeeId, idNumber, phoneNumber, callback) => {
            const query = `SELECT employee_id, id_number, phone_number FROM tbl_employees WHERE employee_id = ? OR id_number = ? OR phone_number = ?`;
            connection.query(query, [employeeId, idNumber, phoneNumber], (error, results) => {
                if (error) return callback(error, null);
                let duplicates = {};
                if (results.length > 0) {
                    results.forEach(result => {
                        if (result.employee_id === employeeId) duplicates.employee_id = 'Employee ID';
                        if (result.id_number === idNumber) duplicates.id_number = 'ID Number';
                        if (result.phone_number === phoneNumber) duplicates.phone_number = 'Phone Number';
                    });
                    return callback(null, duplicates);
                }
                return callback(null, false); // No duplicates
            });
        };

        checkDuplicates(employee_id, id_number, phone_number, (error, duplicates) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).send('Internal Server Error');
            }
            if (duplicates && Object.keys(duplicates).length > 0) {
                // Send back the duplicate fields to the frontend
                return res.render('test', { error: duplicates });
            }

            // If no duplicates, proceed with insertion
            const data = {
                employee_id, title, first_name, last_name, nickname,
                id_number, date_of_birth, phone_number, email, other
            };
            connection.query('INSERT INTO tbl_employees SET ?', data, function (error) {
                if (error) {
                    console.error('Database error:', error);
                    res.status(500).send('Internal Server Error');
                } else {
                    res.redirect('/test');
                }
            });
        });
    },
};