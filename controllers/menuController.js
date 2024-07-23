const MenuModel = require('../models/MenuModel.js');

module.exports = {

	menuView: function (req, res) {
		MenuModel.getMenu((error, menu) => {
			if (error) {
				console.error('Error fetching manu: ', error);
				res.status(500).send('Internal Server Error');
			} else {
				res.render('menu', { menu: menu });
			}
		});
	},
	
	menuAdd: function (req, res) {
		MenuModel.getMenu((error, menu) => {
			if (error) {
				console.error
				('Error fetching menu: ', error);
				res.status(500).send('Internal Server Error');
			}
			res.render('add_menu', { menu: menu });
		}
		);
	}
};