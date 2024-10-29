const UserModel = require('../models/LoginModel');
const bcrypt = require('bcrypt');

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
				console.error('เกิดข้อผิดพลาดในการตรวจสอบชื่อผู้ใช้', error);
				return res.status(500).json({ message: 'Internal Server Error' });
			}
			if (!userResult) {
				req.flash('error', 'ไม่มีชื่อผู้ใช้');
				return res.render('login', { messages: req.flash('error') });
			}
	
			UserModel.getLoginUser(inputData, (error, result) => {
				console.log('result:', result);
				if (error) {
					console.error('Error logging in:', error);
					return res.status(500).json({ message: 'Internal Server Error' });
				}
				if (!result) {
					req.flash('error', 'รหัสผ่านไม่ถูกต้อง');
					return res.render('login', { messages: req.flash('error') });
				}
				if (bcrypt.compare(inputData.password, result.password)) {
					// Store user and permissions directly in the session
					req.session.user = result;
	
					UserModel.getUserPermissions(result.tbl_user_permission, (permError, permissions) => {
						if (permError) {
							console.error('Error fetching permissions:', permError);
							return res.status(500).json({ message: 'Failed to fetch user permissions' });
						}
						req.session.permissions = permissions;
						console.log('Session permissions:', permissions);
						console.log('Session logged in');
	
						// Debug statement before redirect
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