const PermissionModel = require('../models/PermissionModel.js');

module.exports = {

    allPermission: function (req, res) {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const permissions = req.session.permissions;

        if (!permissions || permissions.employee.employee_read !== 'Y') {
            res.redirect('/404');
        } else {
            PermissionModel.getAllPermissions((error, permission) => {
                if (error) {
                    console.error('Error fetching permissions: ', error);
                    res.status(500).send('Internal Server Error');
                } else {
                    res.render('permission', { permission: permission, user: req.session.user, permissions: permissions });
                }
            });
        }
    },

    viewAddPermission: function (req, res) {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const permissions = req.session.permissions;

        if (!permissions || permissions.employee.employee_read !== 'Y') {
            res.redirect('/404');
        } else {
            res.render('add_permission', { user: req.session.user, permissions: permissions });
        }
    },

    createPermission: function (req, res) {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const permissions = req.session.permissions;

        if (!permissions || permissions.employee.employee_read !== 'Y') {
            res.redirect('/404');
        } 
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
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const permissions = req.session.permissions;

        if (!permissions || permissions.employee.employee_read !== 'Y') {
            res.redirect('/404');
        } else {
            const permissionId = req.params.id;
            PermissionModel.getPermissionDetails(permissionId, function (error, permission) {
                if (error) {
                    console.error('Database error:', error);
                    res.status(500).send('Internal Server Error');
                } else if (permission.length > 0) {
                    res.render('view_permission', { permission: permission, user: req.session.user, permissions: permissions  });
                } else {
                    res.status(404).send('Permission not found');
                }
            });
        }
    },

    editPermission: function (req, res) {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        
        const permissions = req.session.permissions;

        if (!permissions || permissions.employee.employee_read !== 'Y') {
            res.redirect('/404');
        } 
            const permissionId = req.params.id;
            PermissionModel.getPermissionDetails(permissionId, function (error, permission) {
                if (error) {
                    console.error('Database error:', error);
                    res.status(500).send('Internal Server Error');
                } else if (permission.length > 0) {
                    res.render('edit_permission', { permission: permission, user: req.session.user, permissions: permissions  });
                } else {
                    res.status(404).send('Permission not found');
                }
            });
    },

    deletePermission: function (req, res) {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const permissions = req.session.permissions;

        if (!permissions || permissions.employee.employee_read !== 'Y') {
            res.redirect('/404');
        } 
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

    updatePermission: function (req, res) {
        if (!req.session.user) {
            return res.redirect('/login');
        }
    
        const permissions = req.session.permissions;
    
        if (!permissions || permissions.employee.employee_read !== 'Y') {
            return res.redirect('/404');
        } 
    
        const permissionId = req.body.permission_id;
        const Permissions = {
            dashboard_read: req.body.dashboard_read ? 'Y' : 'N',
            dashboard_create: req.body.dashboard_create ? 'Y' : 'N',
            dashboard_update: req.body.dashboard_update ? 'Y' : 'N',
            dashboard_delete: req.body.dashboard_delete ? 'Y' : 'N',
            dashboard_view: req.body.dashboard_view ? 'Y' : 'N', // Changed from "dashboard_edit" to "dashboard_view"
            employee_read: req.body.employee_read ? 'Y' : 'N',
            employee_create: req.body.employee_create ? 'Y' : 'N',
            employee_update: req.body.employee_update ? 'Y' : 'N',
            employee_delete: req.body.employee_delete ? 'Y' : 'N',
            employee_view: req.body.employee_view ? 'Y' : 'N', // Changed from "employee_edit" to "employee_view"
            menu_read: req.body.menu_read ? 'Y' : 'N',
            menu_create: req.body.menu_create ? 'Y' : 'N',
            menu_update: req.body.menu_update ? 'Y' : 'N',
            menu_delete: req.body.menu_delete ? 'Y' : 'N',
            menu_view: req.body.menu_view ? 'Y' : 'N', // Changed from "menu_edit" to "menu_view"
            table_read: req.body.table_read ? 'Y' : 'N',
            table_create: req.body.table_create ? 'Y' : 'N',
            table_update: req.body.table_update ? 'Y' : 'N',
            table_delete: req.body.table_delete ? 'Y' : 'N',
            table_view: req.body.table_view ? 'Y' : 'N', // Changed from "table_edit" to "table_view"
            buying_read: req.body.buying_read ? 'Y' : 'N',
            buying_create: req.body.buying_create ? 'Y' : 'N',
            buying_update: req.body.buying_update ? 'Y' : 'N',
            buying_delete: req.body.buying_delete ? 'Y' : 'N',
            buying_view: req.body.buying_view ? 'Y' : 'N', // Changed from "buying_edit" to "buying_view"
            promotion_read: req.body.promotion_read ? 'Y' : 'N',
            promotion_create: req.body.promotion_create ? 'Y' : 'N',
            promotion_update: req.body.promotion_update ? 'Y' : 'N',
            promotion_delete: req.body.promotion_delete ? 'Y' : 'N',
            promotion_view: req.body.promotion_view ? 'Y' : 'N', // Changed from "promotion_edit" to "promotion_view"
        };
    
        PermissionModel.updatePermission(permissionId, Permissions, (error, message) => {
            if (error) {
                console.error("Error updating permissions:", error);
                res.status(500).send("Error updating permissions");
                return;
            }
            res.redirect('/view_permission/' + permissionId); // Redirect using permissionId
        });
    },

};