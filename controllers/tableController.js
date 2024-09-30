const { compare } = require('bcrypt');
const TableModel = require('../models/TableModel.js');
const menuController = require('../controllers/menuController.js');

module.exports = {

	tableView: (req, res) => {
		// Step 1: Query the database for all tables and zones
		TableModel.getTablesAndZones((error, results) => {
			if (error) {
				// Handle error (e.g., render an error page or send an error response)
				console.error('Error fetching data from database:', error);
				return res.status(500).send('Error fetching data from database');
			}

			// Step 2: Check if both tables and zones are not empty
			if (results.tables.length > 0 || results.zones.length > 0) {
				// Check if zones array is not empty and redirect to the first zone's ID
				if (results.zones.length > 0) {
					console.log('Redirecting to /view_zone/:id with zone ID:', results.zones[0].zone_name);
					return res.redirect(`/view_zone/${results.zones[0].zone_name}`);
				} else {
					// If zones array is empty but tables array is not, handle accordingly
					console.log('No zones found, but tables are available');
					return res.render('table', {
						title: 'Table View',
						tables: results.tables,
						zones: [],
						message: 'No zones found, but tables are available',
					});
				}
			} else {
				// No tables or zones found, render the /table view with a message
				res.render('table', {
					title: 'Table View',
					tables: [], // Pass an empty array for tables
					zones: [], // Pass an empty array for zones
					message: 'No tables or zones found',
				});
			}
		});
	},

	viewZone: (req, res) => {
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
				});
			});
		});
	},

	addTableView: (req, res) => {
		res.render('add_table', {
			title: 'Add Table',
		});
	},

	createTable: (req, res) => {
		const tableData = {
			id_table: req.body.id_table,
			zone_name: req.body.zone_name,
		};

		TableModel.createTable(tableData, (error, result) => {
			if (error) {
				console.error(error);
				res.status(500).send("An error occurred");
			} else {
				res.redirect(`/view_zone/${req.body.zone_name}`);
			}
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

	// เพิ่มฟังก์ชัน zoneOrderFood
	zoneOrderFood: (req, res) => {
		const zoneName = req.params.zone;
		const tableId = req.params.table;
	
		// Step 1: Query the database for the specific zone and its table
		TableModel.getZoneAndTableDetails(zoneName, tableId, (error, results) => {
			if (error) {
				console.error('Error fetching data from database:', error);
				return res.status(500).send('Error fetching data from database');
			}
	
			// Step 2: Fetch food recipes and warehouse data for comparison
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
	
												// Load basket items from session
												const basket = req.session.basket || [];
												
												// Step 5: Render the order_food view with the retrieved data
												res.render('order_food', {
													groupedMenu: groupedMenu,
													basket: basket,
													zone_name: zoneName,
													table_id: tableId,
													menuItems: menuItems,
													groupedOptions: groupedOptions,
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


	// เพิ่มฟังก์ชัน zoneCustomize
	zoneCustomize: (req, res) => {
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
	
					// Group menu options by name_options
					const groupedMenuOptions = menuOptions.reduce((acc, option) => {
						if (!acc[option.name_options]) {
							acc[option.name_options] = [];
						}
						acc[option.name_options].push(option);
						return acc;
					}, {});
	
					// Check for insufficient quantity
					const insufficientProducts = foodRecipes.filter(recipe => recipe.unit_quantity > item.remain);
					let errorMessage = null;
					if (insufficientProducts.length > 0) {
						const productNames = insufficientProducts.map(product => product.name_ingredient).join(', ');
						errorMessage = `Insufficient quantity for products: ${productNames}.`;
					}
	
					res.render('customize', {
						item: item,
						menuOptions: menuOptions,
						foodRecipes: foodRecipes,
						zone_name: zoneName,
						table_id: tableId,
						errorMessage: errorMessage, // Pass the errorMessage to the view
						groupedMenuOptions: groupedMenuOptions // Pass groupedMenuOptions to the view
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
						return {
							list_menu_id: list_menu_id,
							option_id: optionId,
							option_name: nameOptions[index],
							num_list: newNumList,
							product_list: req.body.name,
							id_table: tableId,
							zone_name: zoneName
						};
					});
	
					// Create special options if there are any
					if (optionsData.length > 0) {
						console.log('Creating special options:', optionsData);
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
	
					return ingredients.map((ingredient, idx) => ({
						id_food_comparison_options: maxId + 1 + idx + index * ingredients.length,
						list_menu_options: option.list_menu_id,
						num_unit: quantities[idx],
						name_ingredient_options: ingredient,
						unit_quantity_options: quantities[idx],
						unit_id_options: units[idx],
						id_table: orderData.id_table,
						zone_name: orderData.zone_name
					}));
				});
				
				console.log('Creating food comparison options:', foodComparisonOptionsData);

				TableModel.createFoodComparisonOptions(foodComparisonOptionsData, (error, result) => {
					if (error) {
						console.error('Error creating food comparison options:', error);
						deleteOrder(orderData.num_list, orderData.id_table, orderData.zone_name); // Delete the created order
						return res.status(500).send('Error creating food comparison options');
					}
					// Proceed with the new code after creating food comparison options
					proceedWithUpdate(orderData);
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
			console.log('Deleting order:', num_list, id_table, zone_name);
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

		// First, fetch the food comparison data for the order
		TableModel.getFoodComparisonByOrderId(orderId, (fetchError, foodComparisonResults) => {
			if (fetchError) {
				console.error('Error fetching food comparison data:', fetchError);
				return res.status(500).send('Error fetching food comparison data');
			}

			// Proceed to update the recipe data in tbl_warehouse
			const ingredientsToUpdate = foodComparisonResults.map(recipeData => ({
				name_ingredient: recipeData.name_ingredient_all,
				unit_quantity: recipeData.unit_quantity_all
			}));
			console.log('Ingredients to Update:', ingredientsToUpdate);

			if (ingredientsToUpdate.length > 0) {
				TableModel.returnWarehouseProducts(ingredientsToUpdate, (updateError, updateResult) => {
					if (updateError) {
						console.error('Error updating warehouse products:', updateError);
						return res.status(500).send('Error updating warehouse products');
					}

					// Delete the order from the list_menu_options table
					TableModel.deleteOptionsByOrderId(orderId, (optionsError) => {
						if (optionsError) {
							console.error('Error deleting order options:', optionsError);
							return res.status(500).send('Error deleting order options');
						}

						// Then, delete the order from the tbl_food_comparison table
						TableModel.deleteFoodComparisonByOrderId(orderId, (foodComparisonError) => {
							if (foodComparisonError) {
								console.error('Error deleting food comparison:', foodComparisonError);
								return res.status(500).send('Error deleting food comparison');
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
				TableModel.deleteOptionsByOrderId(orderId, (optionsError) => {
					if (optionsError) {
						console.error('Error deleting order options:', optionsError);
						return res.status(500).send('Error deleting order options');
					}

					TableModel.deleteFoodComparisonByOrderId(orderId, (foodComparisonError) => {
						if (foodComparisonError) {
							console.error('Error deleting food comparison:', foodComparisonError);
							return res.status(500).send('Error deleting food comparison');
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
	},

	editTable: (req, res) => {
		const zoneId = req.params.id;
		const errorMessage = req.query.errorMessage || null; // Get errorMessage from query parameters if it exists

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
						errorMessage: errorMessage // Pass the error message to the view
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
					console.error('Error deleting table from database:', error);
					return res.status(500).send('Error deleting table from database');
				}
				console.log('Redirecting to /edit_table/:id with zone ID:', zoneId);
				res.redirect(`/edit_table/${zoneId}`);
			});
		});
	},

	deleteZone: (req, res) => {
		const zoneId = req.params.id;

		TableModel.deleteZone(zoneId, (error) => {
			if (error) {
				console.error('Error deleting zone from database:', error);
				return res.status(500).send('Error deleting zone from database');
			}

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
										errorMessage: 'โต๊ะอาหารนี้มีอยู่แล้ว' // Pass the error message to the view
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

				console.log('Grouped Array:', groupedArray);
				console.log('First Zone Name:', firstZoneName);

				res.render('view_bill', {
					title: 'View Bill',
					bill: groupedArray,
					firstZoneName: firstZoneName
				});
			});
		});
	},

	zoneViewCheckBill: (req, res) => {
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

					// Group listMenuOptions by num_list
					const groupedOptions = listMenuOptions.reduce((acc, option) => {
						if (!acc[option.num_list]) {
							acc[option.num_list] = [];
						}
						acc[option.num_list].push(option);
						return acc;
					}, {});

					const item = results[0];

										// Step 4: Render the view_checkbill view with the retrieved data
					res.render('view_checkbill', {
						basket: basket,
						zone_name: zoneName,
						table_id: tableId,
						menuItems: menuItems,
						groupedOptions: groupedOptions,
					});
				});
			});
		});
	},

	createCheckBill: (req, res) => {
		const zoneName = req.params.zone;
		const tableId = req.params.table;
		const updatedData = req.body;
	
		// Fetch id_record from record_check_bill
		TableModel.getLatestRecordCheckBill((error, maxIdRecord) => {
			if (error) {
				console.error('Error fetching record check bill:', error);
				return res.status(500).send('Error fetching record check bill');
			}
	
			// Start idRecord at 1 if no records exist, otherwise increment the maxIdRecord by 1
			let idRecord = maxIdRecord ? maxIdRecord + 1 : 1;
	
			TableModel.getCheckBillMenuItems(tableId, zoneName, (error, menuItems) => {
				if (error) {
					console.error('Error fetching specific menu items:', error);
					return res.status(500).send('Error fetching specific menu items');
				}
				// Calculate total amount by summing up price_all from menu items where status_bill is 'Y'
				const totalAmount = menuItems.reduce((sum, item) => {
					if (item.status_bill === 'Y') {
						return sum + parseFloat(item.price_all);
					}
					return sum;
				}, 0);
	
				// Calculate final amount by subtracting discount from total amount
				const discount = updatedData.discount || 0;
				const finalAmount = totalAmount - discount;
	
				// Filter num_list values where status_bill is 'Y'
				const numList = menuItems
					.filter(item => item.status_bill === 'Y')
					.map(item => item.num_list);
	
				// Fetch the latest bill number
				TableModel.getLatestBillNumber((error, maxBillNumber) => {
					if (error) {
						console.error('Error fetching latest bill number:', error);
						return res.status(500).send('Error fetching latest bill number');
					}
	
					// Start billNumber at 1 if no records exist, otherwise increment the maxBillNumber by 1
					let billNumber = maxBillNumber ? maxBillNumber.toString().split('').reduce((acc, num) => acc + parseInt(num), 0) + 1 : 1;
	
					// Iterate over numList and create a record for each item
					const createRecords = numList.map(num => {
						const filteredItems = menuItems.filter(item => item.num_list === num);
						const aggregatedData = {
							id_record: idRecord++,
							bill_number: billNumber,
							num_list: [num],
							product_list: filteredItems.map(item => item.product_list).join(', '),
							total_amount: totalAmount || 0,
							discount: discount,
							final_amount: finalAmount || 0,
							payment_method: updatedData.payment_method,
							id_table: filteredItems.length > 0 ? filteredItems[0].id_table : null,
							zone_name: filteredItems.length > 0 ? filteredItems[0].zone_name : null,
							num_nuit: filteredItems.reduce((sum, item) => sum + parseInt(item.num_unit), 0) // Add num_nuit field
						};
						
						return new Promise((resolve, reject) => {
							TableModel.insertCheckBill(aggregatedData, (error, results) => {
								console.log('Insert Check Bill Results:', results);
								if (error) {
									console.error('Error inserting check bill:', error);
									reject('Error inserting check bill');
								} else {
									resolve(results);
								}
							});
						});
					});
	
					// Execute all insertions and then delete records from tbl_food_comparison and list_menu
					Promise.all(createRecords)
						.then(() => {
							// Delete records from tbl_food_comparison based on num_list values
							const deleteFoodComparisonPromises = numList.map(num => {
								return new Promise((resolve, reject) => {
									TableModel.deleteFoodComparisonItemByNumList(tableId, zoneName, num, (error) => {
										if (error) {
											console.error('Error deleting food comparison item:', error);
											reject('Error deleting food comparison item');
										} else {
											resolve();
										}
									});
								});
							});
	
							// Execute all deletions from tbl_food_comparison first
							return Promise.all(deleteFoodComparisonPromises)
								.then(() => {
									// Delete records from list_menu based on num_list values
									const deleteListMenuPromises = numList.map(num => {
										return new Promise((resolve, reject) => {
											TableModel.deleteListMenuItemByNumList(tableId, zoneName, num, (error) => {
												if (error) {
													console.error('Error deleting list menu item:', error);
													reject('Error deleting list menu item');
												} else {
													resolve();
												}
											});
										});
									});
	
									// Execute all deletions from list_menu
									return Promise.all(deleteListMenuPromises);
								});
						})
						.then(() => res.redirect(`/zone/${zoneName}/table/${tableId}/order_food`))
						.catch(error => res.status(500).send(error));
				});
			});
		});
	}
};
