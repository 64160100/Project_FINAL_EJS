const connection = require('./ConMysql');

module.exports = {
    getAllEmployees: function (callback) {
        connection.query('SELECT * FROM tbl_employees', (error, results) => {
            if (error) {
                return callback(error, null);
            } else {
                // Transform the results into a simpler format if necessary
                const employees = results.map(employee => ({
                    id: employee.employee_id,
                    name: `${employee.first_name} ${employee.last_name}`
                }));
                return callback(null, employees);
            }
        });
    },

    checkDuplicates_AddEmployee: function (employeeId, idNumber, phoneNumber, callback) {
        const query = `SELECT employee_id, id_number, phone_number FROM tbl_employees WHERE employee_id = ? OR id_number = ? OR phone_number = ?`;
        connection.query(query, [employeeId, idNumber, phoneNumber], (error, results) => {
            if (error) return callback(error, null);
            let duplicates = {};
            if (results.length > 0) {
                results.forEach(result => {
                    if (result.employee_id === employeeId) duplicates.employee_id = 'รหัสพนักงาน';
                    if (result.id_number === idNumber) duplicates.id_number = 'เลขบัตรประชาชน';
                    if (result.phone_number === phoneNumber) duplicates.phone_number = 'เบอร์โทรศัพท์';
                });
                return callback(null, duplicates);
            }
            return callback(null, false);
        });
    },

    addEmployee: function (formData, callback) {
        connection.query('INSERT INTO tbl_employees SET ?', formData, (error, results) => {
            callback(error, results);
        });
    },

    checkDuplicates_EditEmployee: function (employeeId, idNumber, phoneNumber, callback) {
        const query = `SELECT employee_id, id_number, phone_number FROM tbl_employees WHERE (id_number = ? OR phone_number = ?) AND employee_id != ?`;
        connection.query(query, [idNumber, phoneNumber, employeeId], (error, results) => {
            if (error) return callback(error, null);
            let duplicates = {};
            if (results.length > 0) {
                results.forEach(result => {
                    if (result.id_number === idNumber) duplicates.id_number = true;
                    if (result.phone_number === phoneNumber) duplicates.phone_number = true;
                });
                return callback(null, duplicates);
            }
            return callback(null, false);
        });
    },

    getEmployeeById: function (employeeId, callback) {
        connection.query('SELECT * FROM tbl_employees WHERE employee_id = ?', [employeeId], function (error, results) {
            if (error) {
                return callback(error, null);
            } else {
                return callback(null, results);
            }
        });
    },

    deleteById: function (employeeId, callback) {
        connection.query('DELETE FROM tbl_employees WHERE employee_id = ?', [employeeId], function (error, results) {
            callback(error, results);
        });
    },

    updateById: function (employeeId, updateData, callback) {
        const { title, first_name, last_name, nickname, id_number, date_of_birth, phone_number, email, other } = updateData;
        const sql = `UPDATE tbl_employees SET title = ?, first_name = ?, last_name = ?, nickname = ?, id_number = ?, date_of_birth = ?, phone_number = ?, email = ?, other = ? WHERE employee_id = ?`;
        const values = [title, first_name, last_name, nickname, id_number, date_of_birth, phone_number, email, other, employeeId];

        connection.query(sql, values, (error, results) => {
            callback(error, results);
        });
    },

};
