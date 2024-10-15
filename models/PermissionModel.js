const connection = require('./ConMysql');

module.exports = {

    getAllPermissions: function (callback) {
        connection.query('SELECT * FROM tbl_user_permission', (error, results) => {
            if (error) {
                return callback(error, null);
            } else {

                const permission = results.map(permission => ({
                    id: permission.permission_id,
                    name: permission.permission_name
                }));
                return callback(null, permission);
            }
        });
    },

    createPermission: function (permissionData, callback) {
        const query = `
            INSERT INTO tbl_user_permission (
                permission_id, 
                permission_name,
                create_by,
                create_time
            ) VALUES (?, ?, ?, ?)
        `;

        // Assuming permissionData is an array containing all the values in the correct order
        connection.query(query, permissionData, function (error, results) {
            if (error) {
                return callback(error, null);
            } else {
                // Assuming permission_id is the first element in permissionData
                const permission_id = permissionData[0];
                const tables = [
                    'permission_dashboard',
                    'permission_employee',
                    'permission_menu',
                    'permission_buying',
                    'permission_promotion',
                    'permission_table'
                ];
                let completed = 0;
                for (const table of tables) {
                    const insertQuery = `
                        INSERT INTO ${table} (
                            permission_id, 
                            ${table.split('_')[1]}_read, 
                            ${table.split('_')[1]}_create, 
                            ${table.split('_')[1]}_update, 
                            ${table.split('_')[1]}_delete, 
                            ${table.split('_')[1]}_view
                        ) VALUES (?, 'N', 'N', 'N', 'N', 'N')
                    `;
                    connection.query(insertQuery, [permission_id], function (err) {
                        if (err) {
                            return callback(err, null);
                        }
                        completed++;
                        if (completed === tables.length) {
                            return callback(null, results);
                        }
                    });
                }
            }
        });
    },

    getPermissionDetails: function (permissionId, callback) {
        const query = `
        SELECT 
            up.permission_id, 
            up.permission_name, 
            COALESCE(d.dashboard_read, 'N') as dashboard_read, 
            COALESCE(d.dashboard_create, 'N') as dashboard_create, 
            COALESCE(d.dashboard_update, 'N') as dashboard_update, 
            COALESCE(d.dashboard_delete, 'N') as dashboard_delete, 
            COALESCE(d.dashboard_view, 'N') as dashboard_view,
            COALESCE(e.employee_read, 'N') as employee_read, 
            COALESCE(e.employee_create, 'N') as employee_create, 
            COALESCE(e.employee_update, 'N') as employee_update, 
            COALESCE(e.employee_delete, 'N') as employee_delete, 
            COALESCE(e.employee_view, 'N') as employee_view,
            COALESCE(m.menu_read, 'N') as menu_read, 
            COALESCE(m.menu_create, 'N') as menu_create, 
            COALESCE(m.menu_update, 'N') as menu_update, 
            COALESCE(m.menu_delete, 'N') as menu_delete, 
            COALESCE(m.menu_view, 'N') as menu_view,
            COALESCE(b.buying_read, 'N') as buying_read, 
            COALESCE(b.buying_create, 'N') as buying_create, 
            COALESCE(b.buying_update, 'N') as buying_update, 
            COALESCE(b.buying_delete, 'N') as buying_delete, 
            COALESCE(b.buying_view, 'N') as buying_view,
            COALESCE(p.promotion_read, 'N') as promotion_read, 
            COALESCE(p.promotion_create, 'N') as promotion_create, 
            COALESCE(p.promotion_update, 'N') as promotion_update, 
            COALESCE(p.promotion_delete, 'N') as promotion_delete, 
            COALESCE(p.promotion_view, 'N') as promotion_view,
            COALESCE(t.table_read, 'N') as table_read, 
            COALESCE(t.table_create, 'N') as table_create, 
            COALESCE(t.table_update, 'N') as table_update, 
            COALESCE(t.table_delete, 'N') as table_delete, 
            COALESCE(t.table_view, 'N') as table_view
        FROM 
            tbl_user_permission up
        LEFT JOIN 
            permission_dashboard d ON up.permission_id = d.permission_id
        LEFT JOIN 
            permission_employee e ON up.permission_id = e.permission_id
        LEFT JOIN 
            permission_menu m ON up.permission_id = m.permission_id
        LEFT JOIN 
            permission_buying b ON up.permission_id = b.permission_id
        LEFT JOIN 
            permission_promotion p ON up.permission_id = p.permission_id
        LEFT JOIN 
            permission_table t ON up.permission_id = t.permission_id
        WHERE 
            up.permission_id = ?
        `;
        connection.query(query, [permissionId], function (error, permission) {
            if (error) {
                return callback(error, null);
            } else {
                return callback(null, permission);
            }
        });
    },

    deletePermission: function (permissionId, callback) {
        const queries = [
            `DELETE FROM permission_dashboard WHERE permission_id = ?`,
            `DELETE FROM permission_employee WHERE permission_id = ?`,
            `DELETE FROM permission_menu WHERE permission_id = ?`,
            `DELETE FROM permission_table WHERE permission_id = ?`,
            `DELETE FROM permission_buying WHERE permission_id = ?`,
            `DELETE FROM permission_promotion WHERE permission_id = ?`,
            `DELETE FROM tbl_user_permission WHERE permission_id = ?`
        ];

        queries.forEach((query, index) => {
            connection.query(query, [permissionId], (error, result) => {
                if (error) {
                    return callback(error, null);
                }
                if (index === queries.length - 1) { // Last query
                    callback(null, "Permission deleted successfully");
                }
            }
            );
        });
    },
    
    updatePermission(permissionId, permissions, callback) {
        // Assuming db is a database connection object
        const queries = [
            {
                query: `UPDATE permission_dashboard SET dashboard_read = ?, dashboard_create = ?, dashboard_update = ?, dashboard_delete = ?, dashboard_view = ? WHERE permission_id = ?`,
                params: [permissions.dashboard_read, permissions.dashboard_create, permissions.dashboard_update, permissions.dashboard_delete, permissions.dashboard_view, permissionId]
            },
            {
                query: `UPDATE permission_employee SET employee_read = ?, employee_create = ?, employee_update = ?, employee_delete = ?, employee_view = ? WHERE permission_id = ?`,
                params: [permissions.employee_read, permissions.employee_create, permissions.employee_update, permissions.employee_delete, permissions.employee_view, permissionId]
            },
            {
                query: `UPDATE permission_menu SET menu_read = ?, menu_create = ?, menu_update = ?, menu_delete = ?, menu_view = ? WHERE permission_id = ?`,
                params: [permissions.menu_read, permissions.menu_create, permissions.menu_update, permissions.menu_delete, permissions.menu_view, permissionId]
            },
            {
                query: `UPDATE permission_table SET table_read = ?, table_create = ?, table_update = ?, table_delete = ?, table_view = ? WHERE permission_id = ?`,
                params: [permissions.table_read, permissions.table_create, permissions.table_update, permissions.table_delete, permissions.table_view, permissionId]
            },
            {
                query: `UPDATE permission_buying SET buying_read = ?, buying_create = ?, buying_update = ?, buying_delete = ?, buying_view = ? WHERE permission_id = ?`,
                params: [permissions.buying_read, permissions.buying_create, permissions.buying_update, permissions.buying_delete, permissions.buying_view, permissionId]
            },
            {
                query: `UPDATE permission_promotion SET promotion_read = ?, promotion_create = ?, promotion_update = ?, promotion_delete = ?, promotion_view = ? WHERE permission_id = ?`,
                params: [permissions.promotion_read, permissions.promotion_create, permissions.promotion_update, permissions.promotion_delete, permissions.promotion_view, permissionId]
            }
        ];
    
        queries.forEach((item, index) => {
            connection.query(item.query, item.params, (error, result) => {
                if (error) {
                    return callback(error, null);
                }
                if (index === queries.length - 1) { // Last query
                    callback(null, "Permissions updated successfully");
                }
            });
        });
    }

};