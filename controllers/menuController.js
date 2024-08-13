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

	menuViewId: function (req, res) {
		const menuId = req.params.id;
		MenuModel.getMenuById(menuId, (error, menu) => {
			if (error) {
				console.error('Error fetching menu: ', error);
				res.status(500).send('Internal Server Error');
			} else if (!menu) {
				res.status(404).send('Menu not found');
			} else {
				// Fetch ingredients from tbl_food_recipes
				MenuModel.getFoodRecipes(menuId, (err, ingredients) => {
					if (err) {
						console.error('Error fetching ingredients: ', err);
						res.status(500).send('Internal Server Error');
					} else {
						console.log('menu:', menu);
						menu.ingredients = ingredients || [];
						res.render('view_menu', { menu: menu });
					}
				});
			}
		});
	},

	menuEdit: function (req, res) {
		const id = req.params.id;
		MenuModel.getMenuById(id, (error, menu) => {
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
												if (!menu) {
													console.error('Menu is null or undefined');
													res.status(404).send('Menu not found');
												} else {
													// Ensure menu.ingredients is an array
													menu.ingredients = menu.ingredients || [];
													res.render('edit_menu', {
														menu: menu,
														settingType: settingType,
														settingUnit: settingUnit,
														settingCategory: settingCategory,
														menuFormbuying: menuFormbuying
													});
												}
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

			console.log('Uploaded file:', req.file);

            const menu = {
                name_product: req.body.name_product,
                id_menu: req.body.id_menu,
                menu_type: req.body.settingType,
                menu_category: req.body.settingCategory,
                price: req.body.price,
                menu_unit: req.body.settingUnit,
                status: req.body.status,
                menu_picture: req.file ? `${req.file.filename}` : null,
                remain: 0
            };

			console.log('menu: ', menu);

            let name_ingredients = req.body.name_ingredient;
            let unit_quantity = req.body.quantity;
            let unit_id = req.body.setting_unit_id;

            // Ensure these are arrays
            if (!Array.isArray(name_ingredients)) {
                name_ingredients = [name_ingredients];
            }
            if (!Array.isArray(unit_quantity)) {
                unit_quantity = [unit_quantity];
            }
            if (!Array.isArray(unit_id)) {
                unit_id = [unit_id];
            }

            if (!name_ingredients || !unit_quantity || !unit_id) {
                return res.status(400).send('All fields are required');
            }

            MenuModel.createMenu(menu, (error, result) => {
				if (error) {
					console.error('Error creating menu: ', error);
					return res.status(500).send('Internal Server Error');
				} else {
					const id_menu = req.body.id_menu;
			
					let errorOccurred = false;
			
					MenuModel.getMaxIdFoodRecipes((error, maxId) => {
						if (error) {
							console.error('Error getting max id_food_recipes: ', error);
							return res.status(500).send('Internal Server Error');
						}
			
						name_ingredients.forEach((name_ingredient, index) => {
							const ingredient = {
								id_food_recipes: maxId + index + 1,
								tbl_menu_id: id_menu,
								name_ingredient: name_ingredient,
								unit_quantity: unit_quantity[index],
								unit_id: unit_id[index],
							};
			
							MenuModel.createIngredient(ingredient, (error, result) => {
								if (error) {
									console.error('Error creating ingredient: ', error);
									errorOccurred = true;
								}
			
								if (index === name_ingredients.length - 1) {
									if (errorOccurred) {
										return res.status(500).send('Internal Server Error');
									} else {
										return res.redirect('/menu');
									}
								}
							});
						});
					});
				}
			});
		});
	},

	menuDelete: function (req, res) {
        const id = req.params.id;
        const foodRecipeId = req.body.id_food_recipes; // Assuming id_food_recipes is passed in the request body

        // First, delete related rows in tbl_food_recipes
        MenuModel.deleteRelatedRecipes(id, foodRecipeId, (error, result) => {
            if (error) {
                console.error('Error deleting related recipes: ', error);
                return res.status(500).send('Internal Server Error');
            }

            // Then, delete the row in tbl_menu
            MenuModel.deleteMenu(id, (error, result) => {
                if (error) {
                    console.error('Error deleting menu: ', error);
                    return res.status(500).send('Internal Server Error');
                } else {
                    res.redirect('/menu');
                }
            });
        });
    },

	menuUpdate: function (req, res) {
		upload.single('menu_image')(req, res, (err) => {
			if (err) {
				console.error('Error uploading file:', err);
				return res.status(500).json({
					message: 'Internal Server Error',
				});
			}
			
			console.log('Uploaded file:', req.file);

			const menu = {
				id_menu: req.body.id_menu,
				name_product: req.body.name_product,
				menu_type: req.body.settingType,
				menu_category: req.body.settingCategory,
				price: req.body.price,
				menu_unit: req.body.settingUnit,
				status: req.body.status,
				menu_picture: req.file ? `${req.file.filename}` : null,
				remain: 0
			};

			console.log('menu: ', menu);

			let name_ingredients = req.body.name_ingredient;
			let unit_quantity = req.body.quantity;
			let unit_id = req.body.setting_unit_id;
			let id_food_recipes = req.body.id_food_recipes;

			// Ensure these are arrays
			if (!Array.isArray(name_ingredients)) {
				name_ingredients = [name_ingredients];
			}
			if (!Array.isArray(unit_quantity)) {
				unit_quantity = [unit_quantity];

			}
			if (!Array.isArray(unit_id)) {
				unit_id = [unit_id];
			}
			if (!Array.isArray(id_food_recipes)) {
				id_food_recipes = [id_food_recipes];
			}

			if (!name_ingredients || !unit_quantity || !unit_id) {
				return res.status(400).send('All fields are required');
			}

			MenuModel.updateMenu(menu, (error, result) => {
				if (error) {
					console.error('Error updating menu: ', error);
					return res.status(500).send('Internal Server Error');
				} else {
					const id_menu = req.body.id_menu;

					let errorOccurred = false;

					MenuModel.getMaxIdFoodRecipes((error, maxId) => {
						if (error) {
							console.error('Error getting max id_food_recipes: ', error);
							return res.status(500).send('Internal Server Error');
						}

						name_ingredients.forEach((name_ingredient, index) => {
							const ingredient = {
								id_food_recipes: id_food_recipes[index],
								tbl_menu_id: id_menu,
								name_ingredient: name_ingredient,
								unit_quantity: unit_quantity[index],
								unit_id: unit_id[index],
							};
							
							MenuModel.updateIngredient(ingredient, (error, result) => {
								if (error) {
									console.error('Error updating ingredient: ', error);
									errorOccurred = true;
								}

								if (index === name_ingredients.length - 1) {
									if (errorOccurred) {
										return res.status(500).send('Internal Server Error');
									} else {
										return res.redirect('/menu');
									}
								}
							}
							);
						});
					});
				}
			});
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
				res.render('setting_add_menu_category', { results });
			}
		});
	},

	menuTypeAdd: (req, res) => {
		MenuModel.viewSettingType((error, results) => {
			if (error) {
				console.log(error);
			} else {
				res.render('setting_add_menu_type', { results });
			}
		});
	},

	menuUnitAdd: (req, res) => {
		MenuModel.viewSettingUnit((error, results) => {
			if (error) {
				console.log(error);
			} else {
				res.render('setting_add_menu_unit', { results });
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