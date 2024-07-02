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
        // Insert into tbl_employees
        connection.query('INSERT INTO tbl_employees SET ?', formData, (error, results) => {
            if (error) {
                return callback(error, null); // Handle error during employee insertion
            }
            
            // Assuming formData contains employee_id as BKB0001 or similar
            const employeeId = formData.employee_id; // Use this if employee_id is provided in formData
            // const employeeId = results.insertId; // Use this if employee_id is auto-generated and not in formData
    
            // Prepare the INSERT statement for tbl_user
            const insertUserSql = `
                INSERT INTO tbl_user 
                (tbl_employees, tbl_user_permission, username, fullname, password, profile_picture, status) 
                VALUES (?, NULL, NULL, NULL, NULL, NULL, 'OFF');
            `;
    
            // Execute the INSERT statement for tbl_user
            connection.query(insertUserSql, [employeeId], (error, results) => {
                callback(error, results); // Final callback after attempting to insert into tbl_user
            });
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

    deleteEmployeeById: function (employeeId, callback) {
        // Start a transaction
        connection.beginTransaction(function(err) {
            if (err) {
                callback(err, null);
                return;
            }
    
            // Step 1: Delete from related table(s) first
            connection.query('DELETE FROM tbl_user WHERE tbl_employees = ?', [employeeId], function(error, results) {
                if (error) {
                    // Rollback the transaction if there's an error
                    return connection.rollback(function() {
                        callback(error, null);
                    });
                }
    
                console.log('Deleted from related table(s).');
    
                // Step 2: Delete from the main table
                connection.query('DELETE FROM tbl_employees WHERE employee_id = ?', [employeeId], function(error, results) {
                    if (error) {
                        // Rollback the transaction if there's an error
                        return connection.rollback(function() {
                            callback(error, null);
                        });
                    }
    
                    // Commit the transaction
                    connection.commit(function(err) {
                        if (err) {
                            return connection.rollback(function() {
                                callback(err, null);
                            });
                        }
                        console.log('Transaction completed successfully.');
                        callback(null, results);
                    });
                });
            });
        });
    },

    updateEmployeeById: function (employeeId, updateData, callback) {
        const { title, first_name, last_name, nickname, id_number, date_of_birth, phone_number, email, other } = updateData;
        const sql = `UPDATE tbl_employees SET title = ?, first_name = ?, last_name = ?, nickname = ?, id_number = ?, date_of_birth = ?, phone_number = ?, email = ?, other = ? WHERE employee_id = ?`;
        const values = [title, first_name, last_name, nickname, id_number, date_of_birth, phone_number, email, other, employeeId];

        connection.query(sql, values, (error, results) => {
            callback(error, results);
        });
    },

};
