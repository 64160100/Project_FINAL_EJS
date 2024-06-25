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

    createPermission: function (formData, callback) {
        connection.query('INSERT INTO tbl_user_permission SET ?', formData, (error, results) => {
            callback(error, results);
        });
    },

    getPermissionById: function (permissionId, callback) {
        connection.query('SELECT * FROM tbl_user_permission WHERE user_permission_id = ?', [permissionId], function (error, results) {
            if (error) {
                return callback(error, null);
            } else {
                return callback(null, results);
            }
        });
    },

    updatePermission: function (formData, callback) {
        connection.query('UPDATE tbl_user_permission SET ? WHERE user_permission_id = ?', [formData, formData.user_permission_id], (error, results) => {
            callback(error, results);
        });
    },

    deletePermission: function (permissionId, callback) {
        connection.query('DELETE FROM tbl_user_permission WHERE user_permission_id = ?', [permissionId], (error, results) => {
            callback(error, results);
        });
    }
}
