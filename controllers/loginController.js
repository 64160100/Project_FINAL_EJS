const UserModel = require('../models/LoginModel');
const bcypt = require('bcrypt');

module.exports = {
	loginView: (req, res) => {
		res.render('login', {
			title: 'Login',
		});
	},

	loginStage: (req, res) => {
		const inputData = {
			username: req.body.username,
			password: req.body.password,
		};
	
		UserModel.validateUsername(inputData, (error, userResult) => {
			if (error) {
				console.error('Error validating username:', error);
				return res.status(500).json({ message: 'Internal Server Error' });
			}
			if (!userResult) {
				req.flash('error', 'Username does not exist');
				return res.render('login', { messages: req.flash('error') });
			}
	
			UserModel.getLoginUser(inputData, (error, result) => {
				console.log('result:', result);
				if (error) {
					console.error('Error logging in:', error);
					return res.status(500).json({ message: 'Internal Server Error' });
				}
				if (!result) {
					req.flash('error', 'Invalid password');
					return res.render('login', { messages: req.flash('error') });
				}
				if (bcypt.compare(inputData.password, result.password)) {
					req.session.user = result;
					// console.log('Session user:', result.password);
					
					UserModel.getUserPermissions(result.tbl_user_permission, (permError, permissions) => {
						if (permError) {
							console.error('Error fetching permissions:', permError);
							return res.status(500).json({ message: 'Failed to fetch user permissions' });
						}
						req.session.permissions = permissions;
						// console.log('permissions:', permissions);
						console.log('Session permissions:', permissions);
						console.log('Session logged in');
						return res.redirect('/');
					});
				} else {
					req.flash('error', 'Invalid password');
					return res.render('login', { messages: req.flash('error') });
				}
			});
		});
	},
	logoutView: (req, res) => {
		req.session.destroy();
		console.log('Session logged out');
		res.redirect('/login');
	}
};