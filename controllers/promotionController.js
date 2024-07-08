const PromotionModel = require('../models/PromotionModel.js');

module.exports = {
    promotionView: (req, res) => {
		res.render('promotion', {
			title: 'promotion',
		});
	},
};