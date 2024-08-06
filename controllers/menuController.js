const MenuModel = require('../models/MenuModel.js');

const multer = require('multer');
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './public/img/');
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + '-' + file.originalname);
	}
});

var upload = multer({ storage: storage });

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
				console.error('Error fetching menu: ', error);
				res.status(500).send('Internal Server Error');
			} else {
				MenuModel.viewSettingType((error, settingType) => {
					if (error) {
						console.error('Error fetching setting type: ', error);
						res.status(500).send('Internal Server Error');
					} else {
						MenuModel.viewSettingUnit((error, settingUnit) => {
							if (error) {
								console.error('Error fetching setting unit: ', error);
								res.status(500).send('Internal Server Error');
							} else {
								MenuModel.viewSettingCategory((error, settingCategory) => {
									if (error) {
										console.error('Error fetching setting category: ', error);
										res.status(500).send('Internal Server Error');
									} else {
										MenuModel.getMenuFormbuying((error, menuFormbuying) => {
											if (error) {
												console.error('Error fetching menu form buying: ', error);
												res.status(500).send('Internal Server Error');
											} else {
												res.render('add_menu', {
													menu: menu,
													settingType: settingType,
													settingUnit: settingUnit,
													settingCategory: settingCategory,
													menuFormbuying: menuFormbuying
												});
											}
										});
									}
								});
							}
						});
					}
				});
			}
		});
	},

	menuCreate: function (req, res) {
		upload.single('menu_image')(req, res, (err) => {
			if (err) {
				console.error('Error uploading file:', err);
				return res.status(500).json({
					message: 'Internal Server Error',
				});
			}
	
			const menu = {
				name_product: req.body.name_product,
				id_menu: req.body.id_menu,
				menu_type: req.body.settingType, // Corrected column name
				menu_category: req.body.settingCategory, // Corrected column name
				price: req.body.price,
				menu_unit: req.body.settingUnit, // Corrected column name
				status: req.body.status,
				menu_picture: req.file ? `${req.file.filename}` : null, // Corrected path
				remain: 0 // Set default value for remain
			};
	
			// Extract new form data
			const name_ingredient = req.body.name_ingredient;
			const quantity = req.body.quantity;
			const setting_unit_id = req.body.setting_unit_id;
	
			// Validate the new form data (optional but recommended)
			if (!name_ingredient || !quantity || !setting_unit_id) {
				return res.status(400).send('All fields are required');
			}
	
			// Process the new form data (e.g., save to the database)
			const ingredient = {
				name_ingredient,
				quantity,
				setting_unit_id
			};
	
			console.log(menu);
			console.log(ingredient);
	
			// Assuming you have a MenuModel and IngredientModel
			MenuModel.createMenu(menu, (error, result) => {
				if (error) {
					console.error('Error creating menu: ', error);
					res.status(500).send('Internal Server Error');
				} else {
					// Save the ingredient data
					MenuModel.createMenuHasBuying(ingredient, (err, res) => {
						if (err) {
							console.error('Error creating ingredient: ', err);
							res.status(500).send('Internal Server Error');
						} else {
							res.redirect('/menu');
						}
					});
				}
			});
		});
	},

	menuDelete: function (req, res) {
		const id = req.params.id;
		MenuModel.deleteMenu(id, (error, result) => {
			if (error) {
				console.error('Error deleting menu: ', error);
				res.status(500).send('Internal Server Error');
			} else {
				res.redirect('/menu');
			}
		});
	},

	menuCategoryView: (req, res) => {
		MenuModel.viewSettingCategory((error, results) => {
			if (error) {
				console.log(error);
			} else {
				res.render('setting_menu_category', { results });
			}
		});
	},

	menuTypeView: (req, res) => {
		MenuModel.viewSettingType((error, results) => {
			if (error) {
				console.log(error);
			} else {
				res.render('setting_menu_type', { results });
			}
		});
	},

	menuUnitView: (req, res) => {
		MenuModel.viewSettingUnit((error, results) => {
			if (error) {
				console.log(error);
			} else {
				res.render('setting_menu_unit', { results });
			}
		});
	},

	menuCategoryAdd: (req, res) => {
		MenuModel.viewSettingCategory((error, results) => {
			if (error) {
				console.log(error);
			} else {
				res.render('setting_add_menu_category' , { results });
			}
		});
	},

	menuTypeAdd: (req, res) => {
		MenuModel.viewSettingType((error, results) => {
			if (error) {
				console.log(error);
			} else {
				res.render('setting_add_menu_type' , { results });
			}
		});
	},

	menuUnitAdd: (req, res) => {
		MenuModel.viewSettingUnit((error, results) => {
			if (error) {
				console.log(error);
			} else {
				res.render('setting_add_menu_unit' , { results });
			}
		});
	},

	menuCategoryCreate: (req, res) => {
		const data = {
			menu_category: req.body.menu_category,
		};
		MenuModel.createSettingCategory(data, (error, results) => {
			if (error) {
				console.log(error);
			} else {
				res.redirect('/setting_menu_category');
			}
		});
	},

	menuTypeCreate: (req, res) => {
		const data = {
			menu_type: req.body.menu_type,
		};
		MenuModel.createSettingType(data, (error, results) => {
			if (error) {
				console.log(error);
			} else {
				res.redirect('/setting_menu_type');
			}
		});
	},


	menuUnitCreate: (req, res) => {
		const data = {
			menu_unit: req.body.menu_unit,
		};
		MenuModel.createSettingUnit(data, (error, results) => {
			if (error) {
				console.log(error);
			} else {
				res.redirect('/setting_menu_unit');
			}
		});
	},

	menuCategoryDelete: (req, res) => {
		const id = req.params.id;
		console.log(id);
		MenuModel.deleteSettingCategory(id, (error, results) => {
			if (error) {
				console.log(error);
			} else {
				res.redirect('/setting_menu_category');
			}
		});
	},

	menuTypeDelete: (req, res) => {
		const id = req.params.id;
		MenuModel.deleteSettingType(id, (error, results) => {
			if (error) {
				console.log(error);
			} else {
				res.redirect('/setting_menu_type');
			}
		});
	},

	menuUnitDelete: (req, res) => {
		const id = req.params.id;
		MenuModel.deleteSettingUnit(id, (error, results) => {
			if (error) {
				console.log(error);
			} else {
				res.redirect('/setting_menu_unit');
			}
		});
	}
};