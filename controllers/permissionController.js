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
                console.log(permission)

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

    updatePermission: async (req, res) => {
        try {

            const permissionData = req.body;

            const result = await PermissionModel.updatePermissions(permissionData);
    
            console.log('result:', permissionData);

            if (result) {
                
                res.redirect(`/view_permission/${permissionData.permission_id}`);
            } else {
                res.status(400).send({ message: 'Failed to update permissions' });
            }
        } catch (error) {
            console.error('Error updating permissions:', error);
            res.status(500).send({ message: 'Server error while updating permissions' });
        }
    },

};