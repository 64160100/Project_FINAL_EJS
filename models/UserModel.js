const connection = require('./ConMysql');

module.exports = {
    getAllUser: function (callback) {
        connection.query(`
            SELECT 
                e.employee_id, 
                e.first_name, 
                e.last_name, 
                u.tbl_user_permission, 
                u.status 
            FROM 
                tbl_employees e
            LEFT JOIN 
                tbl_user u 
            ON 
                e.employee_id = u.tbl_employees
            ORDER BY 
                e.employee_id ASC
        `, (error, results) => {
            if (error) {
                return callback(error, null);
            } else {
                console.log(results);
                // Transform the results into a simpler format if necessary
                const employees = results.map(employee => ({
                    id: employee.employee_id,
                    name: `${employee.first_name} ${employee.last_name}`,
                    userPermission: employee.tbl_user_permission || '--', // Handle NULL values
                    status: employee.status || 'ไม่พร้อมใช้งาน' // Handle NULL values
                }));
                return callback(null, employees);
            }
        });
    },
    
    getUserById: function (id, callback) {
        connection.query(`
            SELECT 
                e.employee_id, 
                e.first_name, 
                e.last_name, 
                u.tbl_user_permission,
                u.username,
                u.password, 
                u.status 
            FROM 
                tbl_employees e
            LEFT JOIN 
                tbl_user u 
            ON 
                e.employee_id = u.tbl_employees
            WHERE 
                e.employee_id = ?
            ORDER BY 
                e.employee_id ASC
        `, [id], (error, results) => {
            if (error) {
                return callback(error, null);
            } else {
                const employees = results.map(employee => ({
                    id: employee.employee_id,
                    name: `${employee.first_name} ${employee.last_name}`,
                    userPermission: employee.tbl_user_permission, 
                    password: employee.password || '--',
                    username: employee.username || '--',
                    status: employee.status || 'ไม่พร้อมใช้งาน' 
                }));
                return callback(null, employees);
            }
        });
    },
    
    getAllPermissions: function(callback) {
        // Assuming `tbl_user_permission` is a table and you want to select all rows from it
        const query = "SELECT permission_id FROM `tbl_user_permission`"; // Corrected query
        connection.query(query, (error, results) => {
            if (error) {
                return callback(error, null);
            } else {
                return callback(null, results);
            }
        });
    },

    updateUserPassword: function (employeeId, password, callback) {
        connection.query(`
            UPDATE tbl_user 
            SET password = ?
            WHERE tbl_employees = ?
        `, [password, employeeId], (error, results) => {
            if (error) {
                return callback(error, null);
            } else {
                return callback(null, results);
            }
        });
    },

    updateUser: (employeeId, userData, callback) => {
    // Assuming userData contains { user_id: 'some_id', username: 'admin', permission: 'xxx', status: 'ON' }
    const { permission, status, username,} = userData;

    // SQL UPDATE statement to update user details
    const sqlQuery = `
        UPDATE tbl_user
        SET tbl_user_permission = ?, status = ?, username = ?
        WHERE tbl_employees = ?
    `;

    // Assuming `connection` is your database connection object
    connection.query(sqlQuery, [permission, status, username, employeeId ], (error, results) => {
        if (error) {
            // Handle error
            callback(error, null);
        } else {
            // Success
            callback(null, results);
        }
    });
},


};