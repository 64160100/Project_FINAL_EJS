const BuyingModel = require('../models/BuyingModel.js');

module.exports = {
	buyingView: (req, res) => {
		res.render('buying', {
			title: 'buying',
		});
	},

	addBuyingView: (req, res) => {
		res.render('add_buying', {
			title: 'add_buying',
		});
	},

	createBuying: (req, res) => {
		const buying = new BuyingModel(req.body);
		buying.save()
			.then(buying => {
				res.redirect('/buying');
			})
			.catch(err => {
				res.status(400).send("Unable to save to database");
			});
	},

	settingTypeView: (req, res) => {
		BuyingModel.viewSettingType((error, results) => {
			if (error) {
				console.log(error);
			} else {
				res.render('setting_type', { results });
			}
		});
	},

	settingAddTypeView: (req, res) => {
		BuyingModel.viewSettingType((error, results) => {
			if (error) {
				console.log(error);
			} else {
				res.render('setting_add_type', { results });
			}
		});
	},

	createSettingType: (req, res) => {
		const id_type = req.body.id_type;
		BuyingModel.createSettingType(id_type, (error, results) => {
			if (error) {
				console.log(error);
			} else {
				res.redirect('/setting_type');
			}
		});
	},

	deleteSettingType: (req, res) => {
		const id_type = req.params.id;
		BuyingModel.deleteSettingType(id_type, (error, results) => {
			if (error) {
				console.log(error);
			} else {
				res.redirect('/setting_type');
			}
		});
	},

	settingUnitView: (req, res) => {
		BuyingModel.viewSettingUnit((error, results) => {
			if (error) {
				console.log(error);
			} else {
				res.render('setting_unit', { results });
			}
		});
	},

	settingAddUnitView: (req, res) => {
		BuyingModel.viewSettingUnit((error, results) => {
			if (error) {
				console.log(error);
			} else {
				res.render('setting_add_unit', { results });
			}
		});
	},

	createSettingUnit: (req, res) => {
		const id_unit = req.body.id_unit;
		BuyingModel.createSettingUnit(id_unit, (error, results) => {
			if (error) {
				console.log(error);
			} else {
				res.redirect('/setting_unit');
			}
		});
	},

	deleteSettingUnit: (req, res) => {
		const id_unit = req.params.id;
		BuyingModel.deleteSettingUnit(id_unit, (error, results) => {
			if (error) {
				console.log(error);
			} else {
				res.redirect('/setting_unit');
			}
		});
	}
	
};