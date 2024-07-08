const MenuModel = require('../models/MenuModel.js');

module.exports = {
    menuView: (req, res) => {
		res.render('menu', {
			title: 'menu',
		});
	},
};