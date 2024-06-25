const PermissionModel = require('../models/PermissionModel.js');

module.exports = {

    viwePermission: function (req, res) {
        PermissionModel.getAllPermissions((error, permission) => {
            if (error) {
                console.error('Error fetching employees: ', error);
                res.status(500).send('Internal Server Error');
            } else {
                // Render the EJS template with the employees data
                res.render('permission', { permission: permission });
            }
        });
    },

    viweCreatePermission : function (req, res) {
        res.render('create_permission');
    },
};

