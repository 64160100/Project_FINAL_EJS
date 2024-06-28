const PermissionModel = require('../models/PermissionModel.js');
const connection = require('../models/ConMysql.js');

module.exports = {

    allPermission: function (req, res) {
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

    viewAddPermission: function (req, res) {
        res.render('add_permission');
    },

    createPermission: function (req, res) {
        let createTime = req.body.create_time ? new Date(req.body.create_time) : new Date();

        if (isNaN(createTime.getTime())) {
            createTime = new Date();
        }

        createTime = new Date(createTime.getTime() + (3600000 * 7));

        const permissionData = [
            req.body.permission_id,
            req.body.permission_name,
            req.body.create_by,
            createTime.toISOString().slice(0, 19).replace('T', ' '),
        ];

        PermissionModel.createPermission(permissionData, (error, result) => {
            if (error) {
                res.status(500).send('Internal Server Error');
            } else {
                res.redirect('/permission');
            }
        });
    },

    viewPermission: function (req, res) {
        const permissionId = req.params.id;
        PermissionModel.getPermissionDetails(permissionId, function (error, permission) {
            if (error) {
                console.error('Database error:', error);
                res.status(500).send('Internal Server Error');
            } else if (permission.length > 0) {
                // Assuming you want to render these details using a view called 'permission_details'
                // console.log(permission)

                res.render('view_permission', { permission: permission });
            } else {
                res.status(404).send('Permission not found');
            }
        });
    },

    editPermission: function (req, res) {
        const permissionId = req.params.id;
        PermissionModel.getPermissionDetails(permissionId, function (error, permission) {
            if (error) {
                console.error('Database error:', error);
                res.status(500).send('Internal Server Error');
            } else if (permission.length > 0) {
                // Assuming you want to render these details using a view called 'edit_permission'
                res.render('edit_permission', { permission: permission });
            } else {
                res.status(404).send('Permission not found');
            }
        });
    },

    deletePermission: function (req, res) {
        const permissionId = req.params.id;
        PermissionModel.deletePermission(permissionId, function (error, result) {
            if (error) {
                console.error('Database error:', error);
                res.status(500).send('Internal Server Error');
            } else {
                res.redirect('/permission');
            }
        });
    },

    updatePermission: function(req, res) {
        const permissionId = req.body.permission_id;
        const permissions = {
            dashboard_read: req.body.dashboard_read ? 'Y' : 'N',
            dashboard_create: req.body.dashboard_create ? 'Y' : 'N',
            dashboard_update: req.body.dashboard_update ? 'Y' : 'N',
            dashboard_delete: req.body.dashboard_delete ? 'Y' : 'N',
            dashboard_confirm: req.body.dashboard_confirm ? 'Y' : 'N',
            employee_read: req.body.employee_read ? 'Y' : 'N',
            employee_create: req.body.employee_create ? 'Y' : 'N',
            employee_update: req.body.employee_update ? 'Y' : 'N',
            employee_delete: req.body.employee_delete ? 'Y' : 'N',
            employee_confirm: req.body.employee_confirm ? 'Y' : 'N',
            menu_read: req.body.menu_read ? 'Y' : 'N',
            menu_create: req.body.menu_create ? 'Y' : 'N',
            menu_update: req.body.menu_update ? 'Y' : 'N',
            menu_delete: req.body.menu_delete ? 'Y' : 'N',
            menu_confirm: req.body.menu_confirm ? 'Y' : 'N',
            table_read: req.body.table_read ? 'Y' : 'N',
            table_create: req.body.table_create ? 'Y' : 'N',
            table_update: req.body.table_update ? 'Y' : 'N',
            table_delete: req.body.table_delete ? 'Y' : 'N',
            table_confirm: req.body.table_confirm ? 'Y' : 'N',
            buying_read: req.body.buying_read ? 'Y' : 'N',
            buying_create: req.body.buying_create ? 'Y' : 'N',
            buying_update: req.body.buying_update ? 'Y' : 'N',
            buying_delete: req.body.buying_delete ? 'Y' : 'N',
            buying_confirm: req.body.buying_confirm ? 'Y' : 'N',
            promotion_read: req.body.promotion_read ? 'Y' : 'N',
            promotion_create: req.body.promotion_create ? 'Y' : 'N',
            promotion_update: req.body.promotion_update ? 'Y' : 'N',
            promotion_delete: req.body.promotion_delete ? 'Y' : 'N',
            promotion_confirm: req.body.promotion_confirm ? 'Y' : 'N',
        };
    
        PermissionModel.updatePermission(permissionId, permissions, (error, message) => {
            if (error) {
                console.error("Error updating permissions:", error);
                res.status(500).send("Error updating permissions");
                return;
            }
            res.redirect('/view_permission/' + permissionId); // Redirect using permissionId
        });
    },

};