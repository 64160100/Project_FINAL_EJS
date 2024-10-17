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
		// Check if the user is logged in
		if (!req.session.user) {
			return res.redirect('/login');
		}
		const permissions = req.session.permissions;
		// Check if the user has the required permissions
		if (!permissions || permissions.menu.menu_read !== 'Y') {
			return res.redirect('/404');
		}
	
		MenuModel.getMenu((error, menu) => {
			if (error) {
				console.error('Error fetching menu: ', error);
				res.status(500).send('Internal Server Error');
			} else {
				// Fetch food recipes and warehouse data for comparison
				MenuModel.getFoodRecipesMenu((error, foodRecipes) => {
					if (error) {
						console.error('Error fetching food recipes: ', error);
						res.status(500).send('Internal Server Error');
					} else {
						MenuModel.getWarehouse((error, warehouse) => {
							if (error) {
								console.error('Error fetching warehouse: ', error);
								res.status(500).send('Internal Server Error');
							} else {
								// Aggregate results by id_warehouse
								const aggregatedResults = warehouse.reduce((acc, current) => {
									// Ensure unit_quantity_all is treated as a number for summation
									current.unit_quantity_all = parseFloat(current.unit_quantity_all) || 0;
	
									// If the id_warehouse already exists, sum up the unit_quantity_all and append tbl_buying_id
									if (acc[current.id_warehouse]) {
										acc[current.id_warehouse].unit_quantity_all += current.unit_quantity_all;
										acc[current.id_warehouse].tbl_buying_ids.push(current.tbl_buying_id);
									} else {
										// Otherwise, add the entry to the accumulator
										acc[current.id_warehouse] = {
											...current,
											tbl_buying_ids: [current.tbl_buying_id] // Initialize tbl_buying_ids array
										};
									}
									return acc;
								}, {});
								// Convert the aggregated results back to an array
								const aggregatedArray = Object.values(aggregatedResults);
								// Aggregate warehouse quantities by name_product
								const aggregatedWarehouse = aggregatedArray.reduce((acc, item) => {
									if (!acc[item.name_product]) {
										acc[item.name_product] = 0;
									}
									acc[item.name_product] += item.unit_quantity_all;
									return acc;
								}, {});
								// Calculate the number of menus that can be created
								const menuCounts = menu.map(menuItem => {
									const ingredients = foodRecipes.filter(recipe => recipe.tbl_menu_id === menuItem.id_menu);
									const minMenus = ingredients.reduce((min, ingredient) => {
										const totalQuantity = aggregatedWarehouse[ingredient.name_ingredient] || 0;
										const possibleMenus = Math.floor(totalQuantity / ingredient.unit_quantity);
										return Math.min(min, possibleMenus);
									}, Infinity);
									// If minMenus is Infinity, set it to 0
									const remainMenus = minMenus === Infinity ? 0 : minMenus;
									
									return {    
										...menuItem,
										remain: remainMenus,
										status: remainMenus === 0 ? 'OFF' : 'ON'
									};
								});
								console.log('menuCounts:', menuCounts);
								// Update remain and status in the database
								const updatePromises = menuCounts.map(menuItem => {
									return new Promise((resolve, reject) => {
										MenuModel.updateMenuRemainAndStatus(menuItem.id_menu, menuItem.remain, menuItem.status, (error, results) => {
											if (error) {
												reject(error);
											} else {
												resolve(results);
											}
										});
									});
								});
	
								Promise.all(updatePromises)
									.then(() => {
										res.render('menu', { menu: menuCounts, user: req.session.user, permissions: permissions });
									})
									.catch(error => {
										console.error('Error updating menu remain and status: ', error);
										res.status(500).send('Internal Server Error');
									});
							}
						});
					}
				});
			}
		});
	},

	menuAdd: function (req, res) {
		// Check if the user is logged in
		if (!req.session.user) {
			return res.redirect('/login');
		}
		const permissions = req.session.permissions;
		// Check if the user has the required permissions
		if (!permissions || permissions.menu.menu_read !== 'Y') {
			return res.redirect('/404');
		}
	
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
												// Aggregate results by id_warehouse
												const aggregatedResults = menuFormbuying.reduce((acc, current) => {
													// Ensure unit_quantity_all is treated as a number for summation
													current.unit_quantity_all = parseFloat(current.unit_quantity_all) || 0;
	
													// If the id_warehouse already exists, sum up the unit_quantity_all
													if (acc[current.id_warehouse]) {
														acc[current.id_warehouse].unit_quantity_all += current.unit_quantity_all;
													} else {
														// Otherwise, add the entry to the accumulator
														acc[current.id_warehouse] = {
															...current,
															unit_quantity_all: current.unit_quantity_all // Initialize unit_quantity_all
														};
													}
													return acc;
												}, {});
	
												// Convert the aggregated results back to an array
												const aggregatedArray = Object.values(aggregatedResults);
	
												// Generate the product code
												const generateProductCode = () => {
													// Fetch the existing product codes from the menu
													const existingCodes = menu.map(item => item.id_menu);
	
													// Find the highest existing code and increment it
													let maxCode = 0;
													existingCodes.forEach(code => {
														const numericPart = parseInt(code.substring(1), 10);
														if (numericPart > maxCode) {
															maxCode = numericPart;
														}
													});
	
													// Generate the new code
													const newCode = 'R' + String(maxCode + 1).padStart(3, '0');
													return newCode;
												};
	
												const newProductCode = generateProductCode();
		
												res.render('add_menu', {
													menu: menu,
													settingType: settingType,
													settingUnit: settingUnit,
													settingCategory: settingCategory,
													menuFormbuying: aggregatedArray,
													newProductCode: newProductCode, // Pass the new product code to the view
													user: req.session.user,
													permissions: permissions
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

		if (!req.session.user) {
			return res.redirect('/login');
		}
		const permissions = req.session.permissions;
		// Check if the user has the required permissions
		if (!permissions || permissions.menu.menu_read !== 'Y') {
			return res.redirect('/404');
		}

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
						// Fetch menu options from tbl_menu_options
						MenuModel.getMenuOptions(menuId, (err, menuOptions) => {
							if (err) {
								console.error('Error fetching menu options: ', err);
								res.status(500).send('Internal Server Error');
							} else {
								menu.ingredients = ingredients || [];
								menu.menuOptions = menuOptions || [];

								// Group menu options by name_options
								const groupedMenuOptions = menu.menuOptions.reduce((acc, option) => {
									if (!acc[option.name_options]) {
										acc[option.name_options] = [];
									}
									acc[option.name_options].push(option);
									return acc;
								}, {});
								res.render('view_menu', { menu: menu, groupedMenuOptions: groupedMenuOptions, user: req.session.user, permissions: permissions });
							}
						});
					}
				});
			}
		});
	},

	menuEdit: function (req, res) {
        const id = req.params.id;

		if (!req.session.user) {
			return res.redirect('/login');
		}
		const permissions = req.session.permissions;
		// Check if the user has the required permissions
		if (!permissions || permissions.menu.menu_read !== 'Y') {
			return res.redirect('/404');
		}

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
                                        MenuModel.getFoodRecipes(id, (error, ingredients) => {
                                            if (error) {
                                                console.error('Error fetching ingredients: ', error);
                                                res.status(500).send('Internal Server Error');
                                            } else {
                                                MenuModel.getMenuOptions(id, (err, menuOptions) => {
                                                    if (err) {
                                                        console.error('Error fetching menu options: ', err);
                                                        res.status(500).send('Internal Server Error');
                                                    } else {
                                                        MenuModel.getMenuFormbuying((err, menuFormbuying) => {
                                                            if (err) {
                                                                console.error('Error fetching menu form buying: ', err);
                                                                res.status(500).send('Internal Server Error');
                                                            } else {
                                                                // Aggregate results by id_warehouse
                                                                const aggregatedResults = menuFormbuying.reduce((acc, current) => {
                                                                    // Ensure unit_quantity_all is treated as a number for summation
                                                                    current.unit_quantity_all = parseFloat(current.unit_quantity_all) || 0;

                                                                    // If the id_warehouse already exists, sum up the unit_quantity_all
                                                                    if (acc[current.id_warehouse]) {
                                                                        acc[current.id_warehouse].unit_quantity_all += current.unit_quantity_all;
                                                                    } else {
                                                                        // Otherwise, add the entry to the accumulator
                                                                        acc[current.id_warehouse] = {
                                                                            ...current,
                                                                            unit_quantity_all: current.unit_quantity_all // Initialize unit_quantity_all
                                                                        };
                                                                    }
                                                                    return acc;
                                                                }, {});

                                                                // Convert the aggregated results back to an array
                                                                const aggregatedArray = Object.values(aggregatedResults);

                                                                if (!menu) {
                                                                    console.error('Menu is null or undefined');
                                                                    res.status(404).send('Menu not found');
                                                                } else {
                                                                    // Ensure menu.ingredients is an array
                                                                    menu.ingredients = menu.ingredients || [];
                                                                    menu.menuOptions = menuOptions || [];

                                                                    // Group menu options by name_options
                                                                    const groupedMenuOptions = menu.menuOptions.reduce((acc, option) => {
                                                                        if (!acc[option.name_options]) {
                                                                            acc[option.name_options] = [];
                                                                        }
                                                                        acc[option.name_options].push(option);
                                                                        return acc;
                                                                    }, {});

                                                                    // Fetch the existing image path from the menu object
                                                                    const existingImagePath = menu.imagePath || '';

                                                                    res.render('edit_menu', {
                                                                        menu: menu,
                                                                        settingType: settingType,
                                                                        settingUnit: settingUnit,
                                                                        settingCategory: settingCategory,
                                                                        ingredients: ingredients,
                                                                        groupedMenuOptions: groupedMenuOptions,
                                                                        menuFormbuying: aggregatedArray,
                                                                        existingImagePath: existingImagePath,
																		user: req.session.user, 
																		permissions: permissions
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
	
		console.log('id:', id);
		console.log('foodRecipeId:', foodRecipeId);
	
		// First, delete related rows in tbl_menu_options
		MenuModel.deleteRelatedMenuOptions(id, (error, result) => {
			if (error) {
				console.error('Error deleting related menu options: ', error);
				return res.status(500).send('Internal Server Error');
			}
	
			// Then, delete related rows in tbl_food_recipes
			MenuModel.deleteRelatedRecipes(id, foodRecipeId, (error, result) => {
				if (error) {
					console.error('Error deleting related recipes: ', error);
					return res.status(500).send('Internal Server Error');
				}
	
				// Finally, delete the row in tbl_menu
				MenuModel.deleteMenu(id, (error, result) => {
					if (error) {
						console.error('Error deleting menu: ', error);
						return res.status(500).send('Internal Server Error');
					} else {
						res.redirect('/menu');
					}
				});
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
				status: req.body.status === 'ON' ? 'ON' : 'OFF', // Ensure this is "ON" or "OFF"
				menu_picture: req.file ? `${req.file.filename}` : null,
				remain: 0
			};
	
			let name_ingredients = req.body.name_ingredient || [];
			let unit_quantity = req.body.quantity || [];
			let unit_id = req.body.setting_unit_id || [];
			let id_food_recipes = req.body.id_food_recipes || [];
	
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
	
			// Check if there is an existing picture in the database
			MenuModel.getMenuById(menu.id_menu, (error, existingMenu) => {
				if (error) {
					console.error('Error fetching menu: ', error);
					return res.status(500).send('Internal Server Error');
				}
	
				// If no new file is uploaded and delete_flag is true, use the default image
				if (!req.file && req.body.delete_flag === 'true') {
					menu.menu_picture = 'Default_menu.png';
				} else if (!req.file && existingMenu && existingMenu.menu_picture) {
					// If no new file is uploaded, use the existing picture
					menu.menu_picture = existingMenu.menu_picture;
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
	
							// Get existing ingredients for the menu
							MenuModel.getIngredientsByMenuId(id_menu, (error, existingIngredients) => {
								if (error) {
									console.error('Error fetching ingredients: ', error);
									return res.status(500).send('Internal Server Error');
								}
	
								// Convert existing ingredients to a map for easy lookup
								const existingIngredientsMap = new Map();
								existingIngredients.forEach(ingredient => {
									existingIngredientsMap.set(ingredient.id_food_recipes, ingredient);
								});
	
								// Find the next available id_food_recipes
								let nextId = maxId + 1;
	
								// Process each ingredient from the form
								const ingredientPromises = name_ingredients.map((name_ingredient, index) => {
									return new Promise((resolve, reject) => {
										const ingredient = {
											id_food_recipes: id_food_recipes[index] || nextId,
											tbl_menu_id: id_menu,
											name_ingredient: name_ingredient,
											unit_quantity: unit_quantity[index],
											unit_id: unit_id[index],
										};
	
										if (!id_food_recipes[index]) {
											nextId++;
										}
		
										// Check if the ingredient already exists
										MenuModel.getIngredientByMenuIdAndNameIngredient(ingredient.tbl_menu_id, ingredient.name_ingredient, (error, existingIngredient) => {
											if (error) {
												console.error('Error fetching ingredient: ', error);
												return reject(error);
											} else if (existingIngredient) {
												if (ingredient.unit_quantity === '0') {
													// Delete the ingredient if the quantity is zero
													MenuModel.deleteIngredient(existingIngredient.id_food_recipes, (error, result) => {
														if (error) {
															console.error('Error deleting ingredient: ', error);
															return reject(error);
														}
														resolve();
													});
												} else {
													// Update the existing ingredient
													MenuModel.updateIngredient(ingredient, (error, result) => {
														if (error) {
															console.error('Error updating ingredient: ', error);
															return reject(error);
														}
														resolve();
													});
												}
											} else {
												console.log('Ingredient does not exist:', existingIngredient);
												// Insert the new ingredient
												MenuModel.insertIngredient(ingredient, (error, result) => {
													if (error) {
														console.error('Error inserting ingredient: ', error);
														return reject(error);
													}
													resolve();
												});
											}
										});
									});
								});
	
								Promise.all(ingredientPromises)
									.then(() => {
										// Remove ingredients that are not in the form
										const existingIds = existingIngredients.map(ingredient => ingredient.id_food_recipes);
										const formIds = new Set(id_food_recipes);
	
										const idsToRemove = existingIds.filter(id => !formIds.has(id));
	
										const removalPromises = idsToRemove.map(id => {
											return new Promise((resolve, reject) => {
												MenuModel.deleteIngredient(id, (error, result) => {
													if (error) {
														console.error('Error deleting ingredient: ', error);
														return reject(error);
													}
													resolve();
												});
											});
										});
	
										return Promise.all(removalPromises);
									})
									.then(() => {
										return res.redirect(`/view_menu/${id_menu}`);
									})
									.catch(error => {
										console.error('Error processing ingredients: ', error);
										return res.status(500).send('Internal Server Error');
									});
							});
						});
					}
				});
			});
		});
	},

	menuCategoryView: (req, res) => {
		if (!req.session.user) {
			return res.redirect('/login');
		}
		const permissions = req.session.permissions;
		// Check if the user has the required permissions
		if (!permissions || permissions.menu.menu_read !== 'Y') {
			return res.redirect('/404');
		}
		MenuModel.viewSettingCategory((error, results) => {
			if (error) {
				console.log(error);
			} else {
				res.render('setting_menu_category', { results, user: req.session.user, permissions: permissions });
			}
		});
	},

	menuTypeView: (req, res) => {
		if (!req.session.user) {
			return res.redirect('/login');
		}
		const permissions = req.session.permissions;
		// Check if the user has the required permissions
		if (!permissions || permissions.menu.menu_read !== 'Y') {
			return res.redirect('/404');
		}
		MenuModel.viewSettingType((error, results) => {
			if (error) {
				console.log(error);
			} else {
				res.render('setting_menu_type', { results, user: req.session.user, permissions: permissions });
			}
		});
	},

	menuUnitView: (req, res) => {
		if (!req.session.user) {
			return res.redirect('/login');
		}
		const permissions = req.session.permissions;
		// Check if the user has the required permissions
		if (!permissions || permissions.menu.menu_read !== 'Y') {
			return res.redirect('/404');
		}
		MenuModel.viewSettingUnit((error, results) => {
			if (error) {
				console.log(error);
			} else {
				res.render('setting_menu_unit', { results, user: req.session.user, permissions: permissions });
			}
		});
	},

	menuCategoryAdd: (req, res) => {

		if (!req.session.user) {
			return res.redirect('/login');
		}
		const permissions = req.session.permissions;
		// Check if the user has the required permissions
		if (!permissions || permissions.menu.menu_read !== 'Y') {
			return res.redirect('/404');
		}

		MenuModel.viewSettingCategory((error, results) => {
			if (error) {
				console.log(error);
			} else {
				res.render('setting_add_menu_category', { results, user: req.session.user, permissions: permissions });
			}
		});
	},

	menuTypeAdd: (req, res) => {

		if (!req.session.user) {
			return res.redirect('/login');
		}
		const permissions = req.session.permissions;
		// Check if the user has the required permissions
		if (!permissions || permissions.menu.menu_read !== 'Y') {
			return res.redirect('/404');
		}

		MenuModel.viewSettingType((error, results) => {
			if (error) {
				console.log(error);
			} else {
				res.render('setting_add_menu_type', { results, user: req.session.user, permissions: permissions });
			}
		});
	},

	menuUnitAdd: (req, res) => {
		if (!req.session.user) {
			return res.redirect('/login');
		}
		const permissions = req.session.permissions;
		// Check if the user has the required permissions
		if (!permissions || permissions.menu.menu_read !== 'Y') {
			return res.redirect('/404');
		}

		MenuModel.viewSettingUnit((error, results) => {
			if (error) {
				console.log(error);
			} else {
				res.render('setting_add_menu_unit', { results, user: req.session.user, permissions: permissions });
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
	},

	menuOptions: function (req, res) {
		const menuId = req.params.id; // Assuming the id is passed as a URL parameter

			if (!req.session.user) {
			return res.redirect('/login');
		}
		const permissions = req.session.permissions;
		// Check if the user has the required permissions
		if (!permissions || permissions.menu.menu_read !== 'Y') {
			return res.redirect('/404');
		}

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
												// Assuming you have a function to get menu options
												MenuModel.getMenuOptionsByMenuId(menuId, (error, menuOptions) => {
													if (error) {
														console.error('Error fetching menu options: ', error);
														res.status(500).send('Internal Server Error');
													} else {
														console.log('menuOptions:', menuFormbuying);
														res.render('menu_options', {
															menu: menu,
															settingType: settingType,
															settingUnit: settingUnit,
															settingCategory: settingCategory,
															menuFormbuying: menuFormbuying,
															menuId: menuId, // Pass menuId to the template
															menuOptions: menuOptions, // Pass menuOptions to the template
															errorMessages: req.flash('errorMessages') || {},
															user: req.session.user, 
															permissions: permissions
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
			}
		});
	},

	menuOptionsCreate: (req, res) => {
		const { name_options, price, name_ingredient_menu_options, unit_quantity_menu_options, unit_id_menu_options } = req.body;
		const menuId = req.params.id; // Assuming the id is passed as a URL parameter
	
		// Ensure these are arrays
		let nameIngredients = Array.isArray(name_ingredient_menu_options) ? name_ingredient_menu_options : [name_ingredient_menu_options];
		let unitQuantities = Array.isArray(unit_quantity_menu_options) ? unit_quantity_menu_options : [unit_quantity_menu_options];
		let unitIds = Array.isArray(unit_id_menu_options) ? unit_id_menu_options : [unit_id_menu_options];
	
		// Check if the category name already exists within the same menu_id
		MenuModel.checkCategoryNameWithinMenu(menuId, name_options, (error, exists) => {
			let errorMessages = {};
	
			if (error) {
				console.error('Error checking category name: ', error);
				return res.status(500).send('Internal Server Error');
			}
	
			if (exists) {
				// If the category name exists within the same menu_id, add an error message
				errorMessages.name_options = 'ชื่อหมวดหมู่นี้มีอยู่แล้วในเมนูนี้';
	
				// Fetch menuFormbuying data
				MenuModel.getMenuFormBuying((error, menuFormbuying) => {
					if (error) {
						console.error('Error fetching menuFormbuying: ', error);
						return res.status(500).send('Internal Server Error');
					}
	
					// Render the view with the error message and menuFormbuying data
					return res.render('menu_options', {
						errorMessages: errorMessages,
						menuId: menuId,
						name_options: name_options,
						price: price,
						name_ingredient_menu_options: nameIngredients,
						unit_quantity_menu_options: unitQuantities,
						unit_id_menu_options: unitIds,
						menuFormbuying: menuFormbuying
					});
				});
			} else {
				// Get the max ID first
				MenuModel.getMaxIdMenuOptions((error, maxId) => {
					if (error) {
						console.error('Error getting max id_menu_options: ', error);
						return res.status(500).send('Internal Server Error');
					}
	
					let errorOccurred = false;
	
					// Loop through the ingredients and create new menu options
					nameIngredients.forEach((nameIngredient, index) => {
						const newMenuOptions = {
							id_menu_options: maxId + index + 1, // Incrementing the id_menu_options field
							name_options: name_options,
							menu_id: menuId,
							price: price,
							name_ingredient_menu_options: nameIngredient,
							unit_quantity_menu_options: unitQuantities[index],
							unit_id_menu_options: unitIds[index],
						};
	
						console.log('newMenuOptions:', newMenuOptions);
	
						// Insert the new menu options into the database
						MenuModel.insertMenuOptions(newMenuOptions, (err, results) => {
							if (err) {
								console.error('Error inserting menu options: ', err);
								errorOccurred = true;
							}
	
							if (index === nameIngredients.length - 1) {
								if (errorOccurred) {
									return res.status(500).send('Internal Server Error');
								} else {
									return res.redirect(`/edit_menu/${menuId}`);
								}
							}
						});
					});
				});
			}
		});
	},

	menuOptionsEdit: function (req, res) {
		const menuOptionsId = req.params.id; 
		if (!req.session.user) {
			return res.redirect('/login');
		}
		const permissions = req.session.permissions;
		// Check if the user has the required permissions
		if (!permissions || permissions.menu.menu_read !== 'Y') {
			return res.redirect('/404');
		}
		console.log('menuOptionsId:', menuOptionsId);
		MenuModel.getMenuOptionsById(menuOptionsId, (error, menuOptions) => {
			if (error) {
				console.error('Error fetching menu options: ', error);
				res.status(500).send('Internal Server Error');
			} else if (!menuOptions) {
				res.status(404).send('Menu options not found');
			} else {
				const menuId = menuOptions.menu_id; // Assuming menu_id is a property of menuOptions
				// Fetch all menu options for the same menu_id
				MenuModel.getMenuOptionsByMenuId(menuId, (error, allMenuOptions) => {
					if (error) {
						console.error('Error fetching all menu options: ', error);
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
														res.render('edit_menu_options', {
															menuOptions: menuOptions,
															allMenuOptions: allMenuOptions, // Pass all menu options to the template
															settingType: settingType,
															settingUnit: settingUnit,
															settingCategory: settingCategory,
															menuFormbuying: menuFormbuying,
															menuId: menuId,
															user: req.session.user, 
															permissions: permissions
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
			}
		});
	},

	menuOptionsDelete: (req, res) => {
		const menuOptionsId = req.params.id; // Assuming the id is passed as a URL parameter
		console.log('menuOptionsId:', menuOptionsId);
	
		MenuModel.deleteMenuOptions(menuOptionsId, (error, results) => {
			if (error) {
				console.error('Error deleting menu options: ', error);
				return res.status(500).send('Internal Server Error');
			} else {
				const menuId = results.menuId;
				console.log('menuId:', menuId);
				return res.redirect(`/edit_menu/${menuId}`); // Redirect to the edit menu page
			}
		});
	},

	menuOptionsUpdate: (req, res) => {
		const { menuOptionsId, name_options, price, name_ingredient_menu_options, unit_quantity_menu_options, unit_id_menu_options, menuId } = req.body;
	
		console.log('menuOptionsId:', req.body);
	
		// Ensure these are arrays
		let nameOptions = Array.isArray(name_options) ? name_options : [name_options];
		let prices = Array.isArray(price) ? price : [price];
		let nameIngredients = Array.isArray(name_ingredient_menu_options) ? name_ingredient_menu_options : [name_ingredient_menu_options];
		let unitQuantities = Array.isArray(unit_quantity_menu_options) ? unit_quantity_menu_options : [unit_quantity_menu_options];
		let unitIds = Array.isArray(unit_id_menu_options) ? unit_id_menu_options : [unit_id_menu_options];
		let menuOptionsIds = Array.isArray(menuOptionsId) ? menuOptionsId : [menuOptionsId];
	
		let errorOccurred = false;
	
		// Loop through the ingredients and update menu options
		menuOptionsIds.forEach((id, index) => {
			const updatedMenuOptions = {
				id_menu_options: id, // Use the existing id_menu_options
				name_options: nameOptions[index] || '',
				menu_id: menuId || null,
				price: prices[index] || 0,
				name_ingredient_menu_options: nameIngredients[index] || '',
				unit_quantity_menu_options: unitQuantities[index] || 0,
				unit_id_menu_options: unitIds[index] || ''
			};
	
			console.log('updatedMenuOptions:', updatedMenuOptions);
	
			// Update the menu options in the database
			MenuModel.updateMenuOptions(updatedMenuOptions, (err, results) => {
				if (err) {
					console.error('Error updating menu options: ', err);
					errorOccurred = true;
				}
	
				// Check if the name_options has changed
				if (nameOptions[index] !== updatedMenuOptions.name_options) {
					// Update the ingredient names if the category name has changed
					MenuModel.updateIngredientNames(menuId, updatedMenuOptions.name_options, nameOptions[index], (err, results) => {
						if (err) {
							console.error('Error updating ingredient names: ', err);
							errorOccurred = true;
						}
					});
				}
	
				if (index === menuOptionsIds.length - 1) {
					if (errorOccurred) {
						return res.status(500).send('Internal Server Error');
					} else {
						return res.redirect(`/edit_menu/${menuId}`);
					}
				}
			});
		});
	},

};	