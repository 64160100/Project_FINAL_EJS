const connection = require('./ConMysql');
const bcrypt = require('bcrypt');

module.exports = {
    
    getAllUser: function (callback) {
        connection.query(`
            SELECT 
                e.employee_id, 
                e.first_name, 
                e.last_name, 
                u.tbl_user_permission, 
                u.status,
                p.permission_name
            FROM 
                tbl_employees e
            LEFT JOIN 
                tbl_user u 
            ON 
                e.employee_id = u.tbl_employees
            LEFT JOIN
                tbl_user_permission p
            ON
                u.tbl_user_permission = p.permission_id
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
                    permissionName: employee.permission_name || '--', // Handle NULL values
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
                u.status,
                p.permission_name
            FROM 
                tbl_employees e
            LEFT JOIN 
                tbl_user u 
            ON 
                e.employee_id = u.tbl_employees
            LEFT JOIN
                tbl_user_permission p
            ON
                u.tbl_user_permission = p.permission_id
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
                    permissionName: employee.permission_name || '--', // Handle NULL values
                    password: employee.password || '',
                    username: employee.username || '',
                    status: employee.status || 'ไม่พร้อมใช้งาน' 
                }));
                return callback(null, employees);
            }
        });
    },
    
    getAllPermissions: function(callback) {
        const query = "SELECT permission_id, permission_name FROM `tbl_user_permission`";
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

    findUserByUsername: function(username, callback) {
        const query = 'SELECT * FROM tbl_user WHERE username = ?';
        connection.query(query, [username], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            if (results.length > 0) {
                return callback(null, results[0]);
            } else {
                return callback(null, null);
            }
        });
    },

    updateUser: (employeeId, userData, callback) => {
        // Assuming userData contains { user_id: 'some_id', username: 'admin', permission: 'xxx', status: 'ON' }
        let { permission, status, username } = userData;
    
        // Set default values if permission or status is null or undefined
        permission = permission || 'DefaultPermission'; // Replace 'DefaultPermission' with your default value
        status = status || 'DefaultStatus'; // Replace 'DefaultStatus' with your default value
    
        // SQL UPDATE statement to update user details
        const sqlQuery = `
            UPDATE tbl_user
            SET tbl_user_permission = ?, status = ?, username = ?
            WHERE tbl_employees = ?
        `;
    
        // Assuming `connection` is your database connection object
        connection.query(sqlQuery, [permission, status, username, employeeId], (error, results) => {
            if (error) {
                // Handle error
                callback(error, null);
            } else {
                // Success
                callback(null, results);
            }
        });
    },

    updateUserStatus: function(userId, status, callback) {
        const query = 'UPDATE tbl_user SET status = ? WHERE tbl_employees = ?';
        connection.query(query, [status, userId], (error, results) => {
            if (error) {
                return callback(error, null);
            } else {
                return callback(null, results);
            }
        });
    }
};