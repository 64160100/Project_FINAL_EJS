const UserModel = require('../models/UserModel.js');

module.exports = {
    allUser: function (req, res) {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        const permissions = req.session.permissions;
        if (!permissions || permissions.employee.employee_read !== 'Y') {
            return res.redirect('/404');
        }

        UserModel.getAllUser((error, User) => {
            if (error) {
                console.error('Error fetching employees: ', error);
                res.status(500).send('Internal Server Error');
            } else {
                res.render('user', { User: User, user: req.session.user, permissions: permissions });
            }
        });
    },

    editUser: function (req, res) {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        const permissions = req.session.permissions;

        if (!permissions || permissions.employee.employee_read !== 'Y') {
            return res.redirect('/404');
        }

        const userId = req.params.id;
        UserModel.getUserById(userId, (error, userResults) => {
            if (error) {
                console.error('Error fetching user: ', error);
                res.status(500).send('Internal Server Error');
            } else if (userResults.length > 0) {
                const User = userResults[0];
                UserModel.getAllPermissions((error, Permissions) => {
                    if (error) {
                        console.error('Error fetching permissions: ', error);
                        res.status(500).send('Internal Server Error');
                    } else {
                        res.render('edit_user', { User: User, Permissions: Permissions, user: req.session.user, permissions: permissions });
                    }
                });
            } else {
                res.status(404).send('User not found');
            }
        });
    },

    addUserPassword: function (req, res) {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        
        const permissions = req.session.permissions;

        if (!permissions || permissions.employee.employee_read !== 'Y') {
            return res.redirect('/404');
        }

        const userId = req.params.id;

        UserModel.getUserById(userId, (error, userResults) => {
            if (error) {
                console.error('Error fetching user: ', error);
                res.status(500).send('Internal Server Error');
            } else if (userResults.length > 0) {
                const User = userResults[0];

                res.render('add_user_password', { User: User, user: req.session.user, permissions: permissions });
            } else {
                res.status(404).send('User not found');
            }
        });
    },

    createPassword: function (req, res) {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const userId = req.params.id; // Ensure this matches the route parameter name
        const password = req.body.password;

        console.log('Creating password for user ID:', userId);
        console.log('Password', password);

        // Make sure userId is not null or undefined before proceeding
        if (!userId) {
            console.error('User ID is missing');
            return res.status(400).send('Bad Request: Missing User ID');
        }

        UserModel.updateUserPassword(userId, password, (error, results) => {
            if (error) {
                console.error('Error updating password: ', error);
                res.status(500).send('Internal Server Error');
            } else {
                res.redirect('/user');
            }
        });
    },

    createUser: function (req, res) {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const userId = req.params.id;
        const user = req.body;

        console.log('Creating user:', user);

        UserModel.updateUser(userId, user, (error, results) => {
            if (error) {
                console.error('Error creating user: ', error);
                res.status(500).send('Internal Server Error');
            } else {
                // Assuming the creation is successful, redirect to the user list or a success page
                res.redirect('/user');
            }
        });
    }
};