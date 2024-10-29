const UserModel = require('../models/UserModel.js');
const bcrypt = require('bcrypt');

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
                console.log('User:', User);
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
                        const errorMessage = req.session.errorMessage;
                        delete req.session.errorMessage;
                        console.log('User:', User);
                        console.log('Permissions:', Permissions);
                        res.render('edit_user', { User: User, Permissions: Permissions, user: req.session.user, permissions: permissions, errorMessage: errorMessage });
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

        // Hash the password before saving it to the database
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Error hashing password: ', err);
                return res.status(500).send('Internal Server Error');
            }

            UserModel.updateUserPassword(userId, hashedPassword, (error, results) => {
                if (error) {
                    console.error('Error updating password: ', error);
                    res.status(500).send('Internal Server Error');
                } else {
                    res.redirect('/user');
                }
            });
        });
    },

    createUser: function (req, res) {
        if (!req.session.user) {
            return res.redirect('/login');
        }
    
        const userId = req.params.id;
        const user = req.body;
        const originalUsername = req.body.original_username;
    
        console.log('Creating user:', user);
    
        // ตรวจสอบว่าผู้ใช้ซ้ำกันหรือไม่
        UserModel.findUserByUsername(user.username, (error, existingUser) => {
            if (error) {
                console.error('Error checking existing user: ', error);
                return res.status(500).send('Internal Server Error');
            }
    
            // หากผู้ใช้ซ้ำกันและไม่ใช่ผู้ใช้เดิม
            if (existingUser && existingUser.id !== userId && user.username !== originalUsername) {
                req.session.errorMessage = 'ชื่อผู้ใช้ถูกใช้งานแล้ว';
                return res.redirect(`/edit_user/${userId}`);
            }
    
            // Proceed with creating/updating the user
            UserModel.updateUser(userId, user, (error, results) => {
                if (error) {
                    console.error('Error creating user: ', error);
                    return res.status(500).send('Internal Server Error');
                } else {
                    // Assuming the creation is successful, redirect to the user list or a success page
                    res.redirect('/user');
                }
            });
        });
    },

    updateUserStatus: function(req, res) {
        if (!req.session.user) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        console.log('Updating user status:', req.body);
        const { userId, status } = req.body;

        UserModel.updateUserStatus(userId, status, (error, results) => {
            if (error) {
                console.error('Error updating user status:', error);
                return res.status(500).json({ success: false, error: 'Internal server error' });
            } else {
                return res.json({ success: true });
            }
        });
    }
};