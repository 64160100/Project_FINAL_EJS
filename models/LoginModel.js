const connection = require('./ConMysql');
const bcrypt = require('bcrypt');

module.exports = {

    getLoginUser: function (inputData, callback) {
        const { username, password } = inputData;
        const query = `SELECT * FROM tbl_user WHERE username = ?`;
        const values = [username];
    
        connection.query(query, values, (error, results) => {
            if (error) {
                console.error('Error fetching user:', error);
                return callback(error, null);
            }
    
            if (results.length > 0) {
                const user = results[0];
    
                // Compare the provided password with the stored hashed password
                bcrypt.compare(password, user.password, (err, isPasswordMatch) => {
                    if (err) {
                        console.error('Error comparing passwords:', err);
                        return callback(err, null);
                    }
    
                    if (isPasswordMatch) {
                        return callback(null, user);
                    } else {
                        return callback(null, null); // Password does not match
                    }
                });
            } else {
                return callback(null, null); // User not found
            }
        });
    },

    getUserPermissions: function (permissionId, callback) {
        // Define queries for each permission type
        const queries = {
            dashboard: "SELECT 'dashboard' as type, dashboard_read, dashboard_create, dashboard_update, dashboard_delete, dashboard_view FROM permission_dashboard WHERE permission_id = ?",
            employee: "SELECT 'employee' as type, employee_read, employee_create, employee_update, employee_delete, employee_view FROM permission_employee WHERE permission_id = ?",
            menu: "SELECT 'menu' as type, menu_read, menu_create, menu_update, menu_delete, menu_view FROM permission_menu WHERE permission_id = ?",
            buying: "SELECT 'buying' as type, buying_read, buying_create, buying_update, buying_delete, buying_view FROM permission_buying WHERE permission_id = ?",
            promotion: "SELECT 'promotion' as type, promotion_read, promotion_create, promotion_update, promotion_delete, promotion_view FROM permission_promotion WHERE permission_id = ?",
            table: "SELECT 'table' as type, table_read, table_create, table_update, table_delete, table_view FROM permission_table WHERE permission_id = ?"
        };
    
        // Execute each query and collect results
        let permissions = {};
        let queryCount = 0;
        Object.keys(queries).forEach((key) => {
            connection.query(queries[key], [permissionId], (error, results) => {
                if (error) {
                    console.error(`Error fetching ${key} permissions:`, error);
                    return callback(error, null);
                }
                permissions[key] = results[0]; // Assuming each query returns exactly one row
                queryCount++;
                if (queryCount === Object.keys(queries).length) {
                    // All queries have completed
                    return callback(null, permissions);
                }
            });
        });
    },


    validateUsername: function (inputData, callback) {
        const { username } = inputData;
        const query = `SELECT * FROM tbl_user WHERE username = ?`;
        const values = [username];

        connection.query(query, values, (error, results) => {
            if (error) {
            console.error('Error fetching user:', error);
            return callback(error, null);
            }

            if (results.length > 0) {
            return callback(null, results[0]);
            }

            return callback(null, null);
        });
    },
};

