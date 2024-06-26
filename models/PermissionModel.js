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
                            ${table.split('_')[1]}_confirm
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
            COALESCE(d.dashboard_confirm, 'N') as dashboard_confirm,
            COALESCE(e.employee_read, 'N') as employee_read, 
            COALESCE(e.employee_create, 'N') as employee_create, 
            COALESCE(e.employee_update, 'N') as employee_update, 
            COALESCE(e.employee_delete, 'N') as employee_delete, 
            COALESCE(e.employee_confirm, 'N') as employee_confirm,
            COALESCE(m.menu_read, 'N') as menu_read, 
            COALESCE(m.menu_create, 'N') as menu_create, 
            COALESCE(m.menu_update, 'N') as menu_update, 
            COALESCE(m.menu_delete, 'N') as menu_delete, 
            COALESCE(m.menu_confirm, 'N') as menu_confirm,
            COALESCE(b.buying_read, 'N') as buying_read, 
            COALESCE(b.buying_create, 'N') as buying_create, 
            COALESCE(b.buying_update, 'N') as buying_update, 
            COALESCE(b.buying_delete, 'N') as buying_delete, 
            COALESCE(b.buying_confirm, 'N') as buying_confirm,
            COALESCE(p.promotion_read, 'N') as promotion_read, 
            COALESCE(p.promotion_create, 'N') as promotion_create, 
            COALESCE(p.promotion_update, 'N') as promotion_update, 
            COALESCE(p.promotion_delete, 'N') as promotion_delete, 
            COALESCE(p.promotion_confirm, 'N') as promotion_confirm,
            COALESCE(t.table_read, 'N') as table_read, 
            COALESCE(t.table_create, 'N') as table_create, 
            COALESCE(t.table_update, 'N') as table_update, 
            COALESCE(t.table_delete, 'N') as table_delete, 
            COALESCE(t.table_confirm, 'N') as table_confirm
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

    updatePermissions: async (permissionData) => {
        // Replace undefined or null values with 'N' in permissionData
        Object.keys(permissionData).forEach(key => {
            if (permissionData[key] === undefined || permissionData[key] === null) {
                permissionData[key] = 'N'; // Convert undefined or null to 'N'
            }
        });

        // Construct an SQL query to update permissions based on permissionData
        const updatePermissionsQuery = `
ี           ๊UPDATE 
            up.permission_id, 
            up.permission_name, 
            COALESCE(d.dashboard_read, 'N') as dashboard_read, 
            COALESCE(d.dashboard_create, 'N') as dashboard_create, 
            COALESCE(d.dashboard_update, 'N') as dashboard_update, 
            COALESCE(d.dashboard_delete, 'N') as dashboard_delete, 
            COALESCE(d.dashboard_confirm, 'N') as dashboard_confirm,
            COALESCE(e.employee_read, 'N') as employee_read, 
            COALESCE(e.employee_create, 'N') as employee_create, 
            COALESCE(e.employee_update, 'N') as employee_update, 
            COALESCE(e.employee_delete, 'N') as employee_delete, 
            COALESCE(e.employee_confirm, 'N') as employee_confirm,
            COALESCE(m.menu_read, 'N') as menu_read, 
            COALESCE(m.menu_create, 'N') as menu_create, 
            COALESCE(m.menu_update, 'N') as menu_update, 
            COALESCE(m.menu_delete, 'N') as menu_delete, 
            COALESCE(m.menu_confirm, 'N') as menu_confirm,
            COALESCE(b.buying_read, 'N') as buying_read, 
            COALESCE(b.buying_create, 'N') as buying_create, 
            COALESCE(b.buying_update, 'N') as buying_update, 
            COALESCE(b.buying_delete, 'N') as buying_delete, 
            COALESCE(b.buying_confirm, 'N') as buying_confirm,
            COALESCE(p.promotion_read, 'N') as promotion_read, 
            COALESCE(p.promotion_create, 'N') as promotion_create, 
            COALESCE(p.promotion_update, 'N') as promotion_update, 
            COALESCE(p.promotion_delete, 'N') as promotion_delete, 
            COALESCE(p.promotion_confirm, 'N') as promotion_confirm,
            COALESCE(t.table_read, 'N') as table_read, 
            COALESCE(t.table_create, 'N') as table_create, 
            COALESCE(t.table_update, 'N') as table_update, 
            COALESCE(t.table_delete, 'N') as table_delete, 
            COALESCE(t.table_confirm, 'N') as table_confirm
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

        const values = [
            permissionData.dashboard_read, permissionData.dashboard_create, permissionData.dashboard_update, permissionData.dashboard_delete, permissionData.dashboard_confirm,
            permissionData.employee_read, permissionData.employee_create, permissionData.employee_update, permissionData.employee_delete, permissionData.employee_confirm,
            permissionData.menu_read, permissionData.menu_create, permissionData.menu_update, permissionData.menu_delete, permissionData.menu_confirm,
            permissionData.table_read, permissionData.table_create, permissionData.table_update, permissionData.table_delete, permissionData.table_confirm,
            permissionData.buying_read, permissionData.buying_create, permissionData.buying_update, permissionData.buying_delete, permissionData.buying_confirm,
            permissionData.promotion_read, permissionData.promotion_create, permissionData.promotion_update, permissionData.promotion_delete, permissionData.promotion_confirm,
            permissionData.permission_id
        ].map(value => value === undefined ? null : value); // Ensure no undefined values

        try {
            // Use the correct variable name for the SQL query
            const [result] = await connection.execute(updatePermissionsQuery, values);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating permissions in the database:', error);
            throw error;
        }
    },


    deletePermission: function (permissionId, callback) {
        connection.query('DELETE FROM tbl_user_permission WHERE user_permission_id = ?', [permissionId], (error, results) => {
            callback(error, results);
        });
    }
};