const { compare } = require('bcrypt');
const TableModel = require('../models/TableModel.js');
const menuController = require('../controllers/menuController.js');

module.exports = {

	tableView: (req, res) => {
		if (!req.session.user) {
			return res.redirect('/login');
		}
		const permissions = req.session.permissions;
		// Check if the user has the required permissions
		if (!permissions || permissions.table.table_read !== 'Y') {
			return res.redirect('/404');
		}
	
		TableModel.getTablesAndZones((error, results) => {
			if (error) {
				console.error('Error fetching data from database:', error);
				return res.status(500).send('Error fetching data from database');
			}
	
			if (results.tables.length > 0 || results.zones.length > 0) {
				if (results.zones.length > 0) {
					console.log('Redirecting to /view_zone/:id with zone ID:', results.zones[0].zone_name);
					return res.redirect(`/view_zone/${results.zones[0].zone_name}`);
				} else {
					console.log('No zones found, but tables are available');
					return res.render('table', {
						title: 'Table View',
						tables: results.tables,
						zones: [],
						message: 'No zones found, but tables are available',
						user: req.session.user,
						permissions: permissions
					});
				}
			} else {
				res.render('table', {
					title: 'Table View',
					tables: [],
					zones: [],
					message: 'No tables or zones found',
					user: req.session.user,
					permissions: permissions
				});
			}
		});
	},

	viewZone: (req, res) => {
		if (!req.session.user) {
			return res.redirect('/login');
		}
		const permissions = req.session.permissions;
		// Check if the user has the required permissions
		if (!permissions || permissions.table.table_read !== 'Y') {
			return res.redirect('/404');
		}
	
		const zoneId = req.params.id;
	
		TableModel.getTablesAndZones((error, zones) => {
			if (error) {
				console.error('Error fetching zones from database:', error);
				return res.status(500).send('Error fetching zones from database');
			}
	
			TableModel.getTablesByZone(zoneId, (error, results) => {
				if (error) {
					console.error('Error fetching tables from database:', error);
					return res.status(500).send('Error fetching tables from database');
				}
	
				// Render the view_zone template with both tables and zones data
				res.render('view_zone', {
					title: `Tables in Zone ${zoneId}`,
					zoneId: zoneId,
					tables: results.tables, // Pass the tables to the view
					zones: results.zones, // Assuming zones is fetched correctly
					user: req.session.user,
					permissions: permissions
				});
			});
		});
	},

	addTableView: (req, res) => {
		if (!req.session.user) {
			return res.redirect('/login');
		}
		const permissions = req.session.permissions;
		// Check if the user has the required permissions
		if (!permissions || permissions.table.table_read !== 'Y') {
			return res.redirect('/404');
		}
	
		res.render('add_table', {
			title: 'Add Table',
			user: req.session.user,
			permissions: permissions
		});
	},

	createTable: (req, res) => {
		const tableData = {
			id_table: req.body.id_table,
			zone_name: req.body.zone_name,
		};
	
		// Check if the zone_name already exists
		TableModel.getZoneByName(tableData.zone_name, (error, existingZone) => {
			if (error) {
				console.error('Error fetching zone from database:', error);
				return res.status(500).send('Error fetching zone from database');
			}
	
			if (existingZone) {
				const createTableError = `ไม่สามารถสร้างโซน ${tableData.zone_name} ได้เนื่องจากมีอยู่แล้ว`;
				return res.redirect(`/view_zone/${tableData.zone_name}?createTableError=${encodeURIComponent(createTableError)}`);
			}
	
			// Proceed to create the table if the zone_name does not exist
			TableModel.createTable(tableData, (error, result) => {
				if (error) {
					console.error(error);
					const createTableError = 'An error occurred while creating the table';
					return res.redirect(`/view_zone/${tableData.zone_name}?createTableError=${encodeURIComponent(createTableError)}`);
				} else {
					res.redirect(`/view_zone/${req.body.zone_name}`);
				}
			});
		});
	},

	orderFood: (req, res) => {
		TableModel.getOrderFood((error, menu) => {
			if (error) {
				console.error(error);
				res.status(500).send("An error occurred");
			} else {
				// Group menu items by category
				const groupedMenu = menu.reduce((acc, item) => {
					if (!acc[item.category]) {
						acc[item.category] = [];
					}
					acc[item.category].push(item);
					return acc;
				}, {});

				// Load basket items from session
				const basket = req.session.basket || [];

				res.render('order_food', {
					groupedMenu: groupedMenu,
					basket: basket,
					zone_name: req.body.zone_name || 'default_zone_name'
				});
			}
		});
	},

	customize: (req, res) => {
		const itemId = req.params.id;

		console.log('Customizing item with ID:', itemId);

		TableModel.getMenuItemById(itemId, (error, item) => {
			if (error) {
				console.error('Error fetching item:', error);
				return res.status(500).send("An error occurred");
			}

			if (!item) {
				return res.status(404).send("Item not found");
			}

			TableModel.getMenuOptionsByMenuId(itemId, (error, menuOptions) => {
				if (error) {
					console.error('Error fetching menu options:', error);
					return res.status(500).send("An error occurred");
				}

				TableModel.getFoodRecipesByMenuId(itemId, (error, foodRecipes) => {
					if (error) {
						console.error('Error fetching food recipes:', error);
						return res.status(500).send("An error occurred");
					}

					console.group('Menu Item');
					console.log(item);
					console.groupEnd();

					console.group('Food Recipes');
					console.log(foodRecipes);
					console.groupEnd();
					console.groupEnd();

					console.group('Menu Options');
					console.log(menuOptions);
					console.groupEnd();

					res.render('customize', {
						item: item,
						menuOptions: menuOptions,
						foodRecipes: foodRecipes
					});
				});
			});
		});
	},

	zoneOrderFood: (req, res) => {
		if (!req.session.user) {
			return res.redirect('/login');
		}
		const permissions = req.session.permissions;
		// Check if the user has the required permissions
		if (!permissions || permissions.table.table_read !== 'Y') {
			return res.redirect('/404');
		}
		
		const zoneName = req.params.zone;
		const tableId = req.params.table;
	
		TableModel.getZoneAndTableDetails(zoneName, tableId, (error, results) => {
			if (error) {
				console.error('Error fetching data from database:', error);
				return res.status(500).send('Error fetching data from database');
			}
	
			TableModel.getOrderFood((error, menu) => {
				if (error) {
					console.error(error);
					return res.status(500).send("An error occurred");
				}
				TableModel.getFoodRecipesMenu((error, foodRecipes) => {
					if (error) {
						console.error('Error fetching food recipes: ', error);
						return res.status(500).send('Internal Server Error');
					} else {
						TableModel.getWarehouse((error, warehouse) => {
							if (error) {
								console.error('Error fetching warehouse: ', error);
								return res.status(500).send('Internal Server Error');
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
									const ingredients = foodRecipes.filter(recipe => recipe.tbl_menu_id === menuItem.id);
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
								// Update remain and status in the database
								const updatePromises = menuCounts.map(menuItem => {
									return new Promise((resolve, reject) => {
										TableModel.updateMenuRemainAndStatus(menuItem.id, menuItem.remain, menuItem.status, (error, results) => {
											if (error) {
												reject(error);
											} else {
												resolve(results);
											}
										});
									});
								});
	
								// Wait for all updates to complete
								Promise.all(updatePromises)
									.then(() => {
										// Step 3: Fetch specific columns from list_menu
										TableModel.getSpecificMenuItems(tableId, zoneName, (error, menuItems) => {
											if (error) {
												console.error('Error fetching specific menu items:', error);
												return res.status(500).send('Error fetching specific menu items');
											}
	
											// Step 4: Fetch menu options from list_menu_options table
											TableModel.getListMenuOptions((error, listMenuOptions) => {
												if (error) {
													console.error('Error fetching menu options:', error);
													return res.status(500).send('Error fetching menu options');
												}
	
												// Step 5: Fetch promotions from tbl_promotion table
												TableModel.getPromotions((error, promotions) => {
													if (error) {
														console.error('Error fetching promotions:', error);
														return res.status(500).send('Error fetching promotions');
													}
	
													// Step 6: Fetch price_discount_promotion from list_menu table
													TableModel.getPriceDiscountPromotions(tableId, zoneName, (error, priceDiscountPromotion) => {
														if (error) {
															console.error('Error fetching price discount promotion:', error);
															return res.status(500).send(`Error fetching price discount promotion for Zone: ${zoneName}, Table: ${tableId}`);
														}
	
														const availablePromotions = promotions.filter(promotion => promotion.status_promotion !== 'Y');
	
														// Group menu items by category
														const groupedMenu = menu.reduce((acc, item) => {
															if (!acc[item.category]) {
																acc[item.category] = [];
															}
															acc[item.category].push(item);
															return acc;
														}, {});
	
														// Group listMenuOptions by num_list
														const groupedOptions = listMenuOptions.reduce((acc, option) => {
															if (!acc[option.num_list]) {
																acc[option.num_list] = [];
															}
															acc[option.num_list].push(option);
															return acc;
														}, {});
	
														const menuItemsWithTotalPrice = menuItems.map(item => {
															let totalPrice = parseFloat(item.price_all);
															const options = groupedOptions[item.num_list];
															if (options) {
																options.forEach(option => {
																	if (option.price_options_all) {
																		totalPrice += parseFloat(option.price_options_all);
																	}
																});
															}
															return {
																...item,
																totalPrice: totalPrice
															};
														});
	
														const totalPrice = menuItemsWithTotalPrice.reduce((acc, item) => acc + item.totalPrice, 0);
														const get_promo_code = menuItems.length > 0 ? menuItems[0].promo_code : '';
														req.session.totalPrice = totalPrice;
														
														const basket = req.session.basket || [];
														res.render('order_food', {
															groupedMenu: groupedMenu,
															basket: basket,
															zone_name: zoneName,
															table_id: tableId,
															menuItems: menuItemsWithTotalPrice,
															groupedOptions: groupedOptions,
															promotions: availablePromotions,
															totalPrice: totalPrice.toFixed(2),
															finalPrice: (totalPrice - (priceDiscountPromotion || 0)).toFixed(2),
															discountPrice: (priceDiscountPromotion || 0).toFixed(2),
															get_promo_code: get_promo_code,
															user: req.session.user,
															permissions: permissions
														});
													});
												});
											});
										});
									})
									.catch(updateError => {
										console.error('Error updating menu remain and status:', updateError);
										res.status(500).send('Error updating menu remain and status');
									});
							}
						});
					}
				});
			});
		});
	},

	  applyDiscount: (req, res) => {
		const { discount_code } = req.body;
		const zoneName = req.params.zone;
		const tableId = req.params.table;
	  
		console.log('Applying promotion with code:', req.body);
		TableModel.getPromotionByCode(discount_code, (error, promotion) => {
		  console.log('Promotion:', promotion);
		  if (error) {
			console.error('Error fetching promotion:', error);
			req.session.errorMessage = 'Error fetching promotion';
			return res.status(500).send('Error fetching promotion');
		  }
	  
		  if (!promotion) {
			req.session.errorMessage = 'รหัสโปรโมชั่นไม่ถูกต้อง';
			TableModel.updatePriceDiscountPromotion(null, null, tableId, zoneName, (updateError) => {
			  if (updateError) {
				console.error('Error resetting price_discount_promotion and promo_code:', updateError);
				req.session.errorMessage = 'Error resetting price_discount_promotion and promo_code';
				return res.status(500).send('Error resetting price_discount_promotion and promo_code');
			  }
			  return res.redirect(`/zone/${zoneName}/table/${tableId}/view_checkbill`);
			});
			return;
		  }
	  
		  if (promotion.status_promotion === 'Y') {
			req.session.errorMessage = 'รหัสโปรโมชั่นนี้ถูกใช้งานแล้ว';
			TableModel.updatePriceDiscountPromotion(null, null, tableId, zoneName, (updateError) => {
			  if (updateError) {
				console.error('Error resetting price_discount_promotion and promo_code:', updateError);
				req.session.errorMessage = 'Error resetting price_discount_promotion and promo_code';
				return res.status(500).send('Error resetting price_discount_promotion and promo_code');
			  }
			  return res.redirect(`/zone/${zoneName}/table/${tableId}/view_checkbill`);
			});
			return;
		  }
	  
		  const discount = parseFloat(promotion.price_discount);
		  const totalPrice = parseFloat(req.session.totalPrice); 
		  const finalPrice = totalPrice - discount;
	  
		  req.session.finalPrice = finalPrice;
		  req.session.discountPrice = discount.toFixed(2);
		  req.session.errorMessage = null; 
	  
		  const promo_code = discount_code;
	  
		  TableModel.updatePriceDiscountPromotion(discount, promo_code, tableId, zoneName, (updateError) => {
			if (updateError) {
			  console.error('Error updating price_discount_promotion:', updateError);
			  req.session.errorMessage = 'Error updating price_discount_promotion';
			  return res.status(500).send('Error updating price_discount_promotion');
			}
	  
			TableModel.getZoneAndTableDetails(zoneName, tableId, (error, results) => {
			  if (error) {
				console.error('Error fetching data from database:', error);
				req.session.errorMessage = 'Error fetching data from database';
				return res.status(500).send('Error fetching data from database');
			  }
	  
			  if (!results || results.length === 0) {
				console.error('No zone and table details found');
				req.session.errorMessage = 'No zone and table details found';
				return res.status(404).send('No zone and table details found');
			  }
	  
			  res.redirect(`/zone/${zoneName}/table/${tableId}/view_checkbill`);
			});
		  });
		});
	  },

	// เพิ่มฟังก์ชัน zoneCustomize
	zoneCustomize: (req, res) => {
		if (!req.session.user) {
			return res.redirect('/login');
		}
		const permissions = req.session.permissions;
		// Check if the user has the required permissions
		if (!permissions || permissions.table.table_read !== 'Y') {
			return res.redirect('/404');
		}
	
		const zoneName = req.params.zone;
		const tableId = req.params.table;
		const itemId = req.params.id;
	
		TableModel.getMenuItemById(itemId, (error, item) => {
			if (error) {
				console.error('Error fetching item:', error);
				return res.status(500).send("An error occurred");
			}
	
			if (!item) {
				return res.status(404).send("Item not found");
			}
	
			TableModel.getMenuOptionsByMenuId(itemId, (error, menuOptions) => {
				if (error) {
					console.error('Error fetching menu options:', error);
					return res.status(500).send("An error occurred");
				}
	
				TableModel.getFoodRecipesByMenuId(itemId, (error, foodRecipes) => {
					if (error) {
						console.error('Error fetching food recipes:', error);
						return res.status(500).send("An error occurred");
					}
	
					const insufficientProducts = foodRecipes.filter(recipe => recipe.unit_quantity > item.remain);
					let errorMessage = null;
					if (insufficientProducts.length > 0) {
						const productNames = insufficientProducts.map(product => product.name_ingredient).join(', ');
						errorMessage = `Insufficient quantity for products: ${productNames}.`;
					}
	
					const numUnit = req.body.quantity || 1;
					menuOptions.forEach(option => {
						option.num_unit = numUnit;
						option.price_options_all = option.price * numUnit;
					});
	
					res.render('customize', {
						item: item,
						menuOptions: menuOptions,
						foodRecipes: foodRecipes,
						zone_name: zoneName,
						table_id: tableId,
						errorMessage: errorMessage,
						user: req.session.user,
						permissions: permissions
					});
				});
			});
		});
	},

	createOrder: (req, res) => {
		const zoneName = req.params.zone;
		const tableId = req.params.table;
		let selectedOptions = req.body.special_options || [];

		// Ensure selectedOptions is an array
		if (!Array.isArray(selectedOptions)) {
			selectedOptions = [selectedOptions];
		}

		const nameOptions = selectedOptions.map(id => req.body[`name_options_${id}`]);

		TableModel.getMaxNumList((error, maxNumList) => {
			if (error) {
				console.error('Error fetching max num_list:', error);
				return res.status(500).send('Error fetching max num_list');
			}

			// Calculate the new num_list value
			const newNumList = maxNumList + 1;

			const orderData = {
				num_list: newNumList,
				menu_id: req.body.id,
				product_list: req.body.name,
				num_unit: req.body.quantity,
				product_price: req.body.price,
				price_all: req.body.price * req.body.quantity,
				Where_eat: req.body.where_eat,
				zone_name: zoneName,
				id_table: tableId,
				selected_options: selectedOptions,
				name_options: nameOptions,
				status_bill: 'N'
			};

			// Check for specific error message before proceeding
			if (req.body.errorMessage && req.body.errorMessage.includes('Insufficient quantity for product')) {
				return res.render('customize', {
					groupedMenu: {},
					basket: req.session.basket || [],
					zone_name: zoneName,
					table_id: tableId,
					menuItems: [],
					groupedOptions: {},
					errorMessage: req.body.errorMessage,
					item: req.body, // Ensure item is passed to the view
					menuOptions: [] // Ensure menuOptions is passed to the view
				});
			}

			TableModel.createOrder(orderData, (error, result) => {
				if (error) {
					console.error('Error creating order:', error);
					return res.status(500).send('Error creating order');
				}

				// Fetch the max list_menu_id from list_menu_options table
				TableModel.getListMenuId((error, maxListMenuId) => {
					if (error) {
						console.error('Error fetching max list_menu_id:', error);
						return res.status(500).send('Error fetching max list_menu_id');
					}

					// Increment maxListMenuId for each option
					let list_menu_id = maxListMenuId;

					const optionsData = selectedOptions.map((optionId, index) => {
						list_menu_id++; // Increment maxListMenuId by 1
						const numUnit = req.body.quantity; // Use num_unit from req.body.quantity
						const optionPrice = parseFloat(req.body[`options_price_${optionId}`]); // Get the option price from the request body
						const priceOptionsAll = optionPrice * numUnit; // Calculate price_options_all by multiplying options_price with num_unit

						return {
							list_menu_id: list_menu_id,
							option_id: optionId,
							option_name: nameOptions[index],
							num_list: newNumList,
							product_list: req.body.name,
							num_unit: numUnit,
							options_price: optionPrice,
							price_options_all: priceOptionsAll,
							id_table: tableId,
							zone_name: zoneName,
						};
					});

					// Create special options if there are any
					if (optionsData.length > 0) {
						TableModel.createSpecialOption(optionsData, (optionsError, optionsResult) => {
							if (optionsError) {
								console.error('Error creating order options:', optionsError);
								deleteOrder(orderData.num_list, tableId, zoneName); // Delete the created order
								return res.status(500).send('Error creating order options');
							}
							// Proceed with the new code after creating special options
							createFoodComparisonOptions(optionsData, orderData);
						});
					} else {
						// Proceed with the new code if there are no special options
						proceedWithUpdate(orderData);
					}
				});
			});
		});

		function createFoodComparisonOptions(optionsData, orderData) {
			// Fetch the max id_food_comparison_options
			TableModel.getMaxFoodComparisonOptionsId((error, maxId) => {
				if (error) {
					console.error('Error fetching max id_food_comparison_options:', error);
					deleteOrder(orderData.num_list, orderData.id_table, orderData.zone_name); // Delete the created order
					return res.status(500).send('Error fetching max id_food_comparison_options');
				}

				// Iterate over each option and create entries for tbl_food_comparison_options
				const foodComparisonOptionsData = optionsData.flatMap((option, index) => {
					const ingredients = req.body[`ingredient_${option.option_id}`] || [];
					const quantities = req.body[`quantity_${option.option_id}`] || [];
					const units = req.body[`unit_${option.option_id}`] || [];
					const numUnit = req.body.quantity; // Get the num_unit from the request body

					return ingredients.map((ingredient, idx) => ({
						id_food_comparison_options: maxId + 1 + idx + index * ingredients.length,
						list_menu_options: option.list_menu_id,
						num_unit: numUnit,
						name_ingredient_options: ingredient,
						unit_quantity_options: quantities[idx] * numUnit, // Multiply unit_quantity by num_unit
						unit_id_options: units[idx],
						id_table: orderData.id_table,
						zone_name: orderData.zone_name
					}));
				});

				// Ensure unique id_food_comparison_options within the same num_list
				const uniqueFoodComparisonOptionsData = [];
				const idMap = new Map();

				foodComparisonOptionsData.forEach((item, index) => {
					const key = `${item.list_menu_options}-${item.id_table}-${item.zone_name}-${item.name_ingredient_options}`;
					if (!idMap.has(key)) {
						idMap.set(key, maxId + 1 + idMap.size);
					}
					uniqueFoodComparisonOptionsData.push({
						...item,
						id_food_comparison_options: idMap.get(key)
					});
				});

				TableModel.createFoodComparisonOptions(uniqueFoodComparisonOptionsData, (error, result) => {
					if (error) {
						console.error('Error creating food comparison options:', error);
						deleteOrder(orderData.num_list, orderData.id_table, orderData.zone_name); // Delete the created order
						return res.status(500).send('Error creating food comparison options');
					}

					// Proceed to update the recipe data in tbl_warehouse
					const ingredientsToUpdate = uniqueFoodComparisonOptionsData.map(optionData => ({
						name_ingredient: optionData.name_ingredient_options,
						unit_quantity: optionData.unit_quantity_options
					}));

					if (ingredientsToUpdate.length > 0) {
						TableModel.updateWarehouseProducts(ingredientsToUpdate, (updateError, updateResult) => {
							if (updateError) {
								console.error('Error updating warehouse products:', updateError);
								// Send error to the view
								deleteOrder(orderData.num_list, orderData.id_table, orderData.zone_name); // Delete the created order
								return res.render('customize', {
									groupedMenu: {},
									basket: req.session.basket || [],
									zone_name: orderData.zone_name,
									table_id: orderData.id_table,
									menuItems: [],
									groupedOptions: {},
									errorMessage: `Error updating warehouse products: ${updateError.message}`,
									item: orderData, // Ensure item is passed to the view
									menuOptions: [] // Ensure menuOptions is passed to the view
								});
							}
							// Proceed with the new code after updating warehouse products
							proceedWithUpdate(orderData);
						});
					} else {
						// Proceed with the new code if there are no ingredients to update
						proceedWithUpdate(orderData);
					}
				});
			});
		}

		function proceedWithUpdate(orderData) {
			const updatedData = req.body;
			let fetchError = false;
			let saveError = false;
			let menuDataByNumList = {};
			let fetchCount = 0;

			// Arrays to store the separated data
			let tblMenuIdArray = [];
			let numUnitArray = [];

			TableModel.getData(orderData.num_list, (error, results) => {
				if (error) {
					console.error('Error fetching data from database:', error);
					fetchError = true;
					deleteOrder(orderData.num_list, orderData.id_table, orderData.zone_name); // Delete the created order
					return;
				}

				// If results is an array, push it into the object
				if (Array.isArray(results)) {
					menuDataByNumList[orderData.num_list] = results;

					// Separate the data into different arrays
					results.forEach(result => {
						tblMenuIdArray.push(result.tbl_menu_id);
						numUnitArray.push(result.num_unit);
					});
				} else {
					console.warn('Unexpected data format in results:', results);
				}

				fetchCount++;
				if (fetchCount === 1) {
					proceedWithUpdateInner();
				}
			});

			function proceedWithUpdateInner() {
				if (fetchError) {
					return res.status(500).send('Error fetching data');
				}

				// Iterate over each tbl_menu_id and fetch recipes
				tblMenuIdArray.forEach((tbl_menu_id, index) => {
					TableModel.getFoodRecipes(tbl_menu_id, (error, recipeResults) => {
						if (error) {
							console.error('Error fetching bill from database:', error);
							saveError = true;
							deleteOrder(orderData.num_list, orderData.id_table, orderData.zone_name); // Delete the created order
							return;
						}

						// Filter recipeResults to only include those that match tbl_menu_id
						const filteredRecipeResults = recipeResults.filter(recipeData => {
							return recipeData.tbl_menu_id === tbl_menu_id;
						});

						// Fetch the current max id_food_comparison and increment it by 1
						TableModel.getMaxFoodComparisonId((error, maxId) => {
							if (error) {
								console.error('Error fetching max id_food_comparison:', error);
								saveError = true;
								deleteOrder(orderData.num_list, orderData.id_table, orderData.zone_name); // Delete the created order
								return;
							}

							// Iterate over the recipe data and create multiple entries
							const foodComparisonDataArray = filteredRecipeResults.map((recipeData, idx) => ({
								id_food_comparison: maxId + 1 + idx + index * filteredRecipeResults.length,
								num_list: orderData.num_list, // Use orderData.num_list here
								tbl_menu_id_menu: tbl_menu_id, // id from getIdmenu
								num_unit: numUnitArray[index],
								name_ingredient_all: recipeData.name_ingredient,
								unit_quantity_all: recipeData.unit_quantity * numUnitArray[index], // Multiply unit_quantity by num_unit
								unit_id_all: recipeData.unit_id,
								zone_name: orderData.zone_name,
								id_table: orderData.id_table,
							}));
							TableModel.saveFoodComparison(foodComparisonDataArray, (error, result) => {

								if (error) {
									console.error('Error saving food comparison:', error);
									saveError = true;
									// Check for specific error message
									if (error.message.includes('Insufficient quantity for product')) {
										deleteOrder(orderData.num_list, orderData.id_table, orderData.zone_name); // Delete the created order
										return res.render('customize', {
											groupedMenu: {},
											basket: req.session.basket || [],
											zone_name: orderData.zone_name,
											table_id: orderData.id_table,
											menuItems: [],
											groupedOptions: {},
											errorMessage: `Error updating warehouse products: ${error.message}`,
											item: orderData, // Ensure item is passed to the view
											menuOptions: [] // Ensure menuOptions is passed to the view
										});
									}
								} else {
									// Proceed to update the recipe data in tbl_warehouse
									const ingredientsToUpdate = filteredRecipeResults.map(recipeData => ({
										name_ingredient: recipeData.name_ingredient,
										unit_quantity: recipeData.unit_quantity * numUnitArray[index]
									}));
									if (ingredientsToUpdate.length > 0) {
										TableModel.updateWarehouseProducts(ingredientsToUpdate, (updateError, updateResult) => {
											if (updateError) {
												console.error('Error updating warehouse products:', updateError);
												// Send error to the view
												deleteOrder(orderData.num_list, orderData.id_table, orderData.zone_name); // Delete the created order
												return res.render('customize', {
													groupedMenu: {},
													basket: req.session.basket || [],
													zone_name: orderData.zone_name,
													table_id: orderData.id_table,
													menuItems: [],
													groupedOptions: {},
													errorMessage: `Error updating warehouse products: ${updateError.message}`,
													item: orderData, // Ensure item is passed to the view
													menuOptions: [] // Ensure menuOptions is passed to the view
												});
											}
											// Redirect after the update process is completed
											return res.redirect(`/zone/${orderData.zone_name}/table/${orderData.id_table}/order_food`);
										});
									} else {
										// Redirect if there are no ingredients to update
										return res.redirect(`/zone/${orderData.zone_name}/table/${orderData.id_table}/order_food`);
									}
								}
							});
						});
					});
				});
			}
		}

		function deleteOrder(num_list, id_table, zone_name) {
			TableModel.deleteOrder(num_list, id_table, zone_name, (deleteError, deleteResult) => {
				if (deleteError) {
					console.error('Error deleting order:', deleteError);
				} else {
					console.log('Order deleted successfully:', deleteResult);
				}
			});
		}
	},

	updateOrder: (req, res) => {
		const zoneName = req.params.zone;
		const tableId = req.params.table;
		const updatedData = req.body;

		// Proceed with updating the order
		TableModel.updateOrder(updatedData, (error, results) => {
			if (error) {
				console.error('Error updating order:', error);
				return res.status(500).send('Error updating order');
			}

			// Redirect after the update process is completed
			return res.redirect(`/zone/${zoneName}/table/${tableId}/order_food`);
		});
	},

	deleteOrder: (req, res) => {
		const zoneName = req.params.zone;
		const tableId = req.params.table;
		const orderId = req.body.num_list;

		// Check the database for list_menu_options
		TableModel.checkListMenuOptions(orderId, (checkError, checkResults) => {
			if (checkError) {
				console.error('Error fetching list_menu_options data:', checkError);
				return res.status(500).send('Error fetching list_menu_options data');
			}

			const listMenuIds = checkResults.map(result => result.list_menu_id);

			if (listMenuIds.length === 0) {
				// If no list_menu_ids, proceed with deletion directly
				proceedWithDeletion();
			} else {
				// Fetch the food comparison options data for the order
				TableModel.getFoodComparisonOptionsByListMenuIds(listMenuIds, (optionsFetchError, foodComparisonOptionsResults) => {
					if (optionsFetchError) {
						console.error('Error fetching food comparison options data:', optionsFetchError);
						return res.status(500).send('Error fetching food comparison options data');
					}

					const optionsIngredientsToUpdate = foodComparisonOptionsResults.map(optionData => ({
						name_ingredient: optionData.name_ingredient_options,
						unit_quantity: optionData.unit_quantity_options
					}));

					if (optionsIngredientsToUpdate.length > 0) {
						TableModel.returnWarehouseProducts(optionsIngredientsToUpdate, (optionsUpdateError, optionsUpdateResult) => {
							if (optionsUpdateError) {
								console.error('Error updating warehouse products for options:', optionsUpdateError);
								return res.status(500).send('Error updating warehouse products for options');
							}

							// Delete the order from the tbl_food_comparison_options table
							TableModel.deleteFoodComparisonOptionsByListMenuIds(listMenuIds, (foodComparisonOptionsError) => {
								if (foodComparisonOptionsError) {
									console.error('Error deleting food comparison options:', foodComparisonOptionsError);
									return res.status(500).send('Error deleting food comparison options');
								}

								proceedWithDeletion();
							});
						});
					} else {
						// If no options ingredients to update, proceed with deletion
						TableModel.deleteFoodComparisonOptionsByListMenuIds(listMenuIds, (foodComparisonOptionsError) => {
							if (foodComparisonOptionsError) {
								console.error('Error deleting food comparison options:', foodComparisonOptionsError);
								return res.status(500).send('Error deleting food comparison options');
							}

							proceedWithDeletion();
						});
					}
				});
			}

			function proceedWithDeletion() {
				TableModel.getFoodComparisonByOrderId(orderId, (fetchError, foodComparisonResults) => {
					if (fetchError) {
						console.error('Error fetching food comparison data:', fetchError);
						return res.status(500).send('Error fetching food comparison data');
					}

					const ingredientsToUpdate = foodComparisonResults.map(recipeData => ({
						name_ingredient: recipeData.name_ingredient_all,
						unit_quantity: recipeData.unit_quantity_all
					}));

					if (ingredientsToUpdate.length > 0) {
						TableModel.returnWarehouseProducts(ingredientsToUpdate, (updateError, updateResult) => {
							if (updateError) {
								console.error('Error updating warehouse products:', updateError);
								return res.status(500).send('Error updating warehouse products');
							}

							// Delete the order from the tbl_food_comparison table
							TableModel.deleteFoodComparisonByOrderId(orderId, (foodComparisonError) => {
								if (foodComparisonError) {
									console.error('Error deleting food comparison:', foodComparisonError);
									return res.status(500).send('Error deleting food comparison');
								}

								// Delete the order from the list_menu_options table
								TableModel.deleteOptionsByOrderId(orderId, (optionsError) => {
									if (optionsError) {
										console.error('Error deleting order options:', optionsError);
										return res.status(500).send('Error deleting order options');
									}

									// Finally, delete the order from the main orders table
									TableModel.deleteOrderById(orderId, (orderError) => {
										if (orderError) {
											console.error('Error deleting order:', orderError);
											return res.status(500).send('Error deleting order');
										}
										res.redirect(`/zone/${zoneName}/table/${tableId}/order_food`);
									});
								});
							});
						});
					} else {
						// If no ingredients to update, proceed with deletion
						TableModel.deleteFoodComparisonByOrderId(orderId, (foodComparisonError) => {
							if (foodComparisonError) {
								console.error('Error deleting food comparison:', foodComparisonError);
								return res.status(500).send('Error deleting food comparison');
							}

							TableModel.deleteOptionsByOrderId(orderId, (optionsError) => {
								if (optionsError) {
									console.error('Error deleting order options:', optionsError);
									return res.status(500).send('Error deleting order options');
								}

								TableModel.deleteOrderById(orderId, (orderError) => {
									if (orderError) {
										console.error('Error deleting order:', orderError);
										return res.status(500).send('Error deleting order');
									}
									res.redirect(`/zone/${zoneName}/table/${tableId}/order_food`);
								});
							});
						});
					}
				});
			}
		});
	},

	editTable: (req, res) => {
		if (!req.session.user) {
			return res.redirect('/login');
		}
		const permissions = req.session.permissions;
		// Check if the user has the required permissions
		if (!permissions || permissions.table.table_read !== 'Y') {
			return res.redirect('/404');
		}
	
		const zoneId = req.params.id;
		const deleteZoneError = req.query.deleteZoneError || null; // Get deleteZoneError from query parameters if it exists
		const deleteTableError = req.query.deleteTableError || null; // Get deleteTableError from query parameters if it exists
		const createTableError = req.query.createTableError || null; // Get createTableError from query parameters if it exists
	
		TableModel.getTablesAndZones((error, zones) => {
			if (error) {
				console.error('Error fetching zones from database:', error);
				return res.status(500).send('Error fetching zones from database');
			}
	
			if (!Array.isArray(zones)) {
				zones = [];
			}
	
			TableModel.getTablesByZone(zoneId, (error, results) => {
				if (error) {
					console.error('Error fetching tables from database:', error);
					return res.status(500).send('Error fetching tables from database');
				}
	
				TableModel.getLockZone(zoneId, (error, lockZone) => {
					if (error) {
						console.error('Error fetching lock zone from database:', error);
						return res.status(500).send('Error fetching lock zone from database');
					}
	
					res.render('edit_table', {
						title: `Tables in Zone ${zoneId}`,
						zoneId: zoneId,
						tables: results.tables, // Pass the tables to the view
						zones: zones, // Pass all zones to the view
						lockZone: lockZone, // Pass the lock zone to the view
						deleteZoneError: deleteZoneError, // Pass the delete zone error message to the view
						deleteTableError: deleteTableError, // Pass the delete table error message to the view
						createTableError: createTableError, // Pass the create table error message to the view
						user: req.session.user,
						permissions: permissions
					});
				});
			});
		});
	},

	updateTable: (req, res) => {
		const zoneId = req.params.id;
		const tableId = req.params.tableId;
		const updatedData = req.body;

		TableModel.updateTable(tableId, updatedData, (error) => {
			if (error) {
				console.error('Error updating table:', error);
				return res.status(500).send('Error updating table');
			}

			// Redirect back to the view_zone/:id page
			res.redirect(`/view_zone/${zoneId}`);
		});
	},

	deleteTable: (req, res) => {
		const tableId = req.body.id_table;
		const zoneId = req.body.zoneId;
	
		// Fetch the zone name using the zoneId
		TableModel.getZoneNameById(zoneId, (error, zoneName) => {
			if (error) {
				console.error('Error fetching zone name from database:', error);
				return res.status(500).send('Error fetching zone name from database');
			}
	
			TableModel.deleteTableByIdAndZone(tableId, zoneName, (error) => {
				if (error) {
					if (error.code === 'ER_ROW_IS_REFERENCED_2') {
						// Fetch the table and zone details to include in the error message
						TableModel.getTablesByZone(zoneId, (fetchError, results) => {
							if (fetchError) {
								console.error('Error fetching tables from database:', fetchError);
								return res.status(500).send('Error fetching tables from database');
							}
	
							const table = results.tables.find(t => t.id_table === tableId);
							const deleteTableError = `ไม่สามารถลบโต๊ะ ${tableId} ในโซน ${zoneName} ได้เนื่องจากยังมีเมนูตกค้างอยู่`;

							return res.redirect(`/edit_table/${zoneId}?deleteTableError=${encodeURIComponent(deleteTableError)}`);
						});
					} else {
						console.error('Error deleting table from database:', error);
						return res.status(500).send('Error deleting table from database');
					}
				} else {
					res.redirect(`/edit_table/${zoneId}`);
				}
			});
		});
	},

	deleteZone: (req, res) => {
		const zoneId = req.params.id;
		TableModel.deleteZone(zoneId, (error) => {
			if (error) {
				if (error.code === 'ER_ROW_IS_REFERENCED_2') {
					// Fetch the zone details to include in the error message
					TableModel.getTablesByZone(zoneId, (fetchError, results) => {
						if (fetchError) {
							console.error('Error fetching tables from database:', fetchError);
							return res.status(500).send('Error fetching tables from database');
						}
	
						// Find the specific table causing the issue
						const problematicTable = results.tables.length > 0 ? results.tables[0] : null;
						const deleteZoneError = problematicTable
						? `ไม่สามารถลบโซน ${zoneId} ได้เนื่องจากโต๊ะ ${problematicTable.id_table} ยังคงมีเมนูตกค้างอยู่`
						: `ไม่สามารถลบโซน ${zoneId} ได้เนื่องจากยังมีเมนูตกค้างอยู่`;
	
						return res.redirect(`/edit_table/${zoneId}?deleteZoneError=${encodeURIComponent(deleteZoneError)}`);
					});
				} else {
					console.error('Error deleting zone from database:', error);
					return res.status(500).send('Error deleting zone from database');
				}
			} else {
				// Find a remaining zone to redirect to
				TableModel.findRemainingZone((error, remainingZoneId) => {
					if (error) {
						console.error('Error finding remaining zone:', error);
						return res.status(500).send('Error finding remaining zone');
					}
	
					if (remainingZoneId) {
						// Redirect to the remaining zone
						res.redirect(`/view_zone/${remainingZoneId}`);
					} else {
						// No remaining zones, redirect to a default page or show a message
						res.redirect('/table');
					}
				});
			}
		});
	},

	toggleLockZone: (req, res) => {
		const zoneId = req.params.id;
		const newLockState = req.body.lockZone;
		TableModel.updateLockZone(zoneId, newLockState, (error) => {
			if (error) {
				console.error('Error updating lock zone in database:', error);
				return res.status(500).send('Error updating lock zone in database');
			}

			// Redirect back to the edit_table/:id page
			res.redirect(`/edit_table/${zoneId}`);
		});
	},

	insertTable: (req, res) => {
		const zoneId = req.params.id;
		const { table_id } = req.body;
	
		if (!req.session.user) {
			return res.redirect('/login');
		}
		const permissions = req.session.permissions;
		// Check if the user has the required permissions
		if (!permissions || permissions.table.table_read !== 'Y') {
			return res.redirect('/404');
		}
	
		// Check if the zoneId exists in tbl_zones
		TableModel.checkZoneExists(zoneId, (error, exists) => {
			if (error) {
				console.error('Error checking zone existence:', error);
				return res.status(500).send('Error checking zone existence');
			}
	
			if (!exists) {
				return res.status(400).send('Zone does not exist');
			}
	
			// Proceed to insert the table
			TableModel.insertTable(zoneId, table_id, (error, results) => {
				if (error) {
					if (error.code === 'ER_DUP_ENTRY') {
						// Fetch necessary data to render the edit_table view with an error message
						TableModel.getTablesAndZones((error, zones) => {
							if (error) {
								console.error('Error fetching zones from database:', error);
								return res.status(500).send('Error fetching zones from database');
							}
	
							if (!Array.isArray(zones)) {
								zones = [];
							}
	
							TableModel.getTablesByZone(zoneId, (error, results) => {
								if (error) {
									console.error('Error fetching tables from database:', error);
									return res.status(500).send('Error fetching tables from database');
								}
	
								TableModel.getLockZone(zoneId, (error, lockZone) => {
									if (error) {
										console.error('Error fetching lock zone from database:', error);
										return res.status(500).send('Error fetching lock zone from database');
									}
	
									res.render('edit_table', {
										title: `Tables in Zone ${zoneId}`,
										zoneId: zoneId,
										tables: results.tables, // Pass the tables to the view
										zones: zones, // Pass all zones to the view
										lockZone: lockZone, // Pass the lock zone to the view
										createTableError: 'โต๊ะอาหารนี้มีอยู่แล้ว', // Pass the error message to the view
										deleteZoneError: '', // Pass an empty deleteZoneError to the view
										deleteTableError: '', // Pass an empty deleteTableError to the view
										user: req.session.user, // Pass the user to the view
										permissions: permissions // Pass the permissions to the view
									});
								});
							});
						});
					} else {
						console.error('Error creating table in database:', error);
						return res.status(500).send('Error creating table in database');
					}
				} else {
					// Redirect back to the view_zone/:id page
					res.redirect(`/view_zone/${zoneId}`);
				}
			});
		});
	},

	viewBill: (req, res) => {
		if (!req.session.user) {
			return res.redirect('/login');
		}
		const permissions = req.session.permissions;
		// Check if the user has the required permissions
		if (!permissions || permissions.table.table_read !== 'Y') {
			return res.redirect('/404');
		}
	
		TableModel.getBill((error, results) => {
			if (error) {
				console.error('Error fetching bill from database:', error);
				return res.status(500).send('Error fetching bill from database');
			}
	
			// Group the results by Table ID and Zone Name
			const groupedResults = results.reduce((acc, item) => {
				const key = `${item.id_table}-${item.zone_name}`;
				if (!acc[key]) {
					acc[key] = {
						id_table: item.id_table,
						zone_name: item.zone_name,
						total_price: 0,
						total_items: 0,
						items: []
					};
				}
				acc[key].items.push(item);
				acc[key].total_price += parseFloat(item.price_all); // Summing price_all for the same id_table and zone_name
				acc[key].total_items += 1;
				return acc;
			}, {});
	
			// Convert the grouped results to an array
			const groupedArray = Object.values(groupedResults).map(group => {
				return {
					...group,
					where_eat: group.items[0].Where_eat // Assuming the first item's Where_eat value is representative
				};
			});
	
			TableModel.getZones((error, results) => {
				if (error) {
					// Handle error (e.g., render an error page or send an error response)
					console.error('Error fetching data from database:', error);
					return res.status(500).send('Error fetching data from database');
				}
	
				const firstZoneName = results[0].zone_name;
	
				res.render('view_bill', {
					title: 'View Bill',
					bill: groupedArray,
					firstZoneName: firstZoneName,
					user: req.session.user,
					permissions: permissions
				});
			});
		});
	},

	zoneViewCheckBill: (req, res) => {
		if (!req.session.user) {
			return res.redirect('/login');
		}
		const permissions = req.session.permissions;
		// Check if the user has the required permissions
		if (!permissions || permissions.table.table_read !== 'Y') {
			return res.redirect('/404');
		}
	
		const zoneName = req.params.zone;
		const tableId = req.params.table;
	
		// Step 1: Query the database for the specific zone and its table
		TableModel.getZoneAndTableDetails(zoneName, tableId, (error, results) => {
			if (error) {
				console.error('Error fetching data from database:', error);
				return res.status(500).send('Error fetching data from database');
			}
	
			// Load basket items from session
			const basket = req.session.basket || [];
	
			// Step 2: Fetch specific columns from list_menu
			TableModel.getSpecificMenuItems(tableId, zoneName, (error, menuItems) => {
				if (error) {
					console.error('Error fetching specific menu items:', error);
					return res.status(500).send('Error fetching specific menu items');
				}
	
				// Step 3: Fetch menu options from list_menu_options table
				TableModel.getListMenuOptions((error, listMenuOptions) => {
					if (error) {
						console.error('Error fetching menu options:', error);
						return res.status(500).send('Error fetching menu options');
					}
	
					// Step 4: Fetch price_discount_promotion from list_menu table
					TableModel.getPriceDiscountPromotions(zoneName, tableId, (error, priceDiscountPromotion) => {
						if (error) {
							console.error('Error fetching price discount promotion:', error);
							return res.status(500).send(`Error fetching price discount promotion for Zone: ${zoneName}, Table: ${tableId}`);
						}
	
						// Group listMenuOptions by num_list
						const groupedOptions = listMenuOptions.reduce((acc, option) => {
							if (!acc[option.num_list]) {
								acc[option.num_list] = [];
							}
							acc[option.num_list].push(option);
							return acc;
						}, {});
	
						const menuItemsWithTotalPrice = menuItems.map(item => {
							let totalPrice = parseFloat(item.price_all);
							const options = groupedOptions[item.num_list];
							if (options) {
								options.forEach(option => {
									if (option.price_options_all) {
										totalPrice += parseFloat(option.price_options_all);
									}
								});
							}
							return {
								...item,
								totalPrice: totalPrice
							};
						});
	
						const totalPrice = menuItemsWithTotalPrice.reduce((acc, item) => acc + item.totalPrice, 0);
						req.session.totalPrice = totalPrice;
	
						// Extract promo_code from menuItems
						const get_promo_code = menuItems.length > 0 ? menuItems[0].promo_code : '';
						
						res.render('view_checkbill', {
							basket: basket,
							zone_name: zoneName,
							table_id: tableId,
							menuItems: menuItemsWithTotalPrice,
							groupedOptions: groupedOptions,
							totalPrice: totalPrice.toFixed(2),
							finalPrice: (totalPrice - (priceDiscountPromotion || 0)).toFixed(2),
							discountPrice: (priceDiscountPromotion || 0).toFixed(2),
							get_promo_code: get_promo_code,
							session: req.session,
							user: req.session.user,
							permissions: permissions
						});
					});
				});
			});
		});
	},

	  createCheckBill: (req, res) => {
		const zoneName = req.params.zone;
		const tableId = req.params.table;
		const updatedData = req.body;
	
		// Extract promo_code and status_promotion from updatedData
		const { promo_code, status_promotion } = updatedData;
	
		TableModel.updatePromotionStatus(promo_code, status_promotion, (updateError, updateResults) => {
			if (updateError) {
				console.error('Error updating promotion status:', updateError);
				return res.status(500).send('Error updating promotion status');
			} else {
				TableModel.getLatestRecordCheckBill((error, maxIdRecord) => {
					if (error) {
						console.error('Error fetching record check bill:', error);
						return res.status(500).send('Error fetching record check bill');
					}
	
					let idRecord = maxIdRecord ? maxIdRecord + 1 : 1;
	
					TableModel.getCheckBillMenuItems(tableId, zoneName, (error, menuItems) => {
						if (error) {
							console.error('Error fetching specific menu items:', error);
							return res.status(500).send('Error fetching specific menu items');
						}
						console.log('Menu Items:', menuItems);
	
						let totalAmount = 0;
	
						const fetchOptionsPromises = menuItems.map(item => {
							if (item.status_bill === 'Y') {
								totalAmount += parseFloat(item.price_all);
								return new Promise((resolve, reject) => {
									TableModel.getMenuOptions(item.num_list, (error, options) => {
										console.log('Options:', options);
										if (error) {
											console.error('Error fetching menu options:', error);
											reject('Error fetching menu options');
										} else {
											options.forEach(option => {
												totalAmount += parseFloat(option.price_options_all);
											});
											resolve();
										}
									});
								});
							} else {
								return Promise.resolve();
							}
						});
	
						Promise.all(fetchOptionsPromises).then(() => {
							const discountItem = menuItems.find(item => item.status_bill === 'Y' && item.price_discount_promotion);
							const discount = discountItem ? discountItem.price_discount_promotion : 0;
							
							console.log('Total Amount:', totalAmount);
							console.log('Discount:', discount);
							const finalAmount = totalAmount - discount;
	
							const numList = menuItems
								.filter(item => item.status_bill === 'Y')
								.map(item => item.num_list);
	
							TableModel.getLatestBillNumber((error, maxBillNumber) => {
								if (error) {
									console.error('Error fetching latest bill number:', error);
									return res.status(500).send('Error fetching latest bill number');
								}
	
								let billNumber = maxBillNumber ? maxBillNumber.toString().split('').reduce((acc, num) => acc + parseInt(num), 0) + 1 : 1;
	
								const createRecords = numList.map(num => {
									const filteredItems = menuItems.filter(item => item.num_list === num);
									const aggregatedData = {
										id_record: idRecord++,
										bill_number: billNumber,
										num_list: [num],
										product_list: filteredItems.map(item => item.product_list).join(', '),
										total_amount: totalAmount || 0,
										discount: filteredItems.reduce((sum, item) => sum + (item.price_discount_promotion || 0), 0),
										final_amount: finalAmount || 0,
										payment_method: updatedData.payment_method,
										id_table: filteredItems.length > 0 ? filteredItems[0].id_table : null,
										zone_name: filteredItems.length > 0 ? filteredItems[0].zone_name : null,
										num_nuit: filteredItems.reduce((sum, item) => sum + parseInt(item.num_unit), 0)
									};
	
									return new Promise((resolve, reject) => {
										console.log('Aggregated Data:', aggregatedData);
										TableModel.insertCheckBill(aggregatedData, (error, results) => {
											if (error) {
												console.error('Error inserting check bill:', error);
												reject('Error inserting check bill');
											} else {
												resolve(results);
											}
										});
									});
								});
	
								Promise.all(createRecords)
									.then(() => {
										const checkListMenuOptionsPromises = numList.map(num => {
											return new Promise((resolve, reject) => {
												TableModel.checkListMenuOptions(num, (checkError, checkResults) => {
													if (checkError) {
														console.error('Error fetching list_menu_options data:', checkError);
														reject('Error fetching list_menu_options data');
													} else {
														resolve(checkResults);
													}
												});
											});
										});
	
										return Promise.all(checkListMenuOptionsPromises);
									})
									.then(checkResultsArray => {
										const listMenuIds = checkResultsArray.flat().map(result => result.list_menu_id);
	
										if (listMenuIds.length === 0) {
											return proceedWithDeletion();
										} else {
											return new Promise((resolve, reject) => {
												TableModel.getFoodComparisonOptionsByListMenuIds(listMenuIds, (optionsFetchError, foodComparisonOptionsResults) => {
													if (optionsFetchError) {
														console.error('Error fetching food comparison options data:', optionsFetchError);
														reject('Error fetching food comparison options data');
													} else {
														TableModel.deleteFoodComparisonOptionsByListMenuIds(listMenuIds, (foodComparisonOptionsError) => {
															if (foodComparisonOptionsError) {
																console.error('Error deleting food comparison options:', foodComparisonOptionsError);
																reject('Error deleting food comparison options');
															} else {
																resolve();
															}
														});
													}
												});
											});
										}
									})
									.then(() => proceedWithDeletion())
									.then(() => res.redirect(`/zone/${zoneName}/table/${tableId}/order_food`))
									.catch(error => res.status(500).send(error));
	
								function proceedWithDeletion() {
									const fetchFoodComparisonPromises = numList.map(num => {
										return new Promise((resolve, reject) => {
											TableModel.getFoodComparisonByOrderId(num, (fetchError, foodComparisonResults) => {
												if (fetchError) {
													console.error('Error fetching food comparison data:', fetchError);
													reject('Error fetching food comparison data');
												} else {
													resolve(foodComparisonResults);
												}
											});
										});
									});
	
									return Promise.all(fetchFoodComparisonPromises)
										.then(foodComparisonResultsArray => {
											const deleteFoodComparisonPromises = numList.map(num => {
												return new Promise((resolve, reject) => {
													TableModel.deleteFoodComparisonByOrderId(num, (foodComparisonError) => {
														if (foodComparisonError) {
															console.error('Error deleting food comparison:', foodComparisonError);
															reject('Error deleting food comparison');
														} else {
															resolve();
														}
													});
												});
											});
	
											return Promise.all(deleteFoodComparisonPromises);
										})
										.then(() => {
											const deleteListMenuOptionsPromises = numList.map(num => {
												return new Promise((resolve, reject) => {
													TableModel.deleteOptionsByOrderId(num, (optionsError) => {
														if (optionsError) {
															console.error('Error deleting order options:', optionsError);
															reject('Error deleting order options');
														} else {
															resolve();
														}
													});
												});
											});
	
											return Promise.all(deleteListMenuOptionsPromises);
										})
										.then(() => {
											const deleteOrderPromises = numList.map(num => {
												return new Promise((resolve, reject) => {
													TableModel.deleteOrderById(num, (orderError) => {
														if (orderError) {
															console.error('Error deleting order:', orderError);
															reject('Error deleting order');
														} else {
															resolve();
														}
													});
												});
											});
	
											return Promise.all(deleteOrderPromises);
										});
								}
							});
						});
					});
				});
			}
		});
	},

	getIndex: (req, res) => {
		if (!req.session.user) {
			return res.redirect('/login');
		}

		const permissions = req.session.permissions;
		const zoneName = req.params.zone;
		const tableId = req.params.table;
	
		res.render('menuindex', { 
			user: req.session.user, 
			permissions: permissions,
			zone_name: zoneName, // ส่ง zone_name ไปยัง EJS
			table_id: tableId // ส่ง table_id ไปยัง EJS
		});		
	},
};
