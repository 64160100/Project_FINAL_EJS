const { compare } = require('bcrypt');
const TableModel = require('../models/TableModel.js');

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

			// Step 2: Fetch the menu items
			TableModel.getOrderFood((error, menu) => {
				if (error) {
					console.error(error);
					res.status(500).send("An error occurred");
				} else {
					// Filter menu items to include only those with status "ON"
					const filteredMenu = menu.filter(item => item.status === 'ON');

					// Group menu items by category
					const groupedMenu = filteredMenu.reduce((acc, item) => {
						if (!acc[item.category]) {
							acc[item.category] = [];
						}
						acc[item.category].push(item);
						return acc;
					}, {});

					// Load basket items from session
					const basket = req.session.basket || [];

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

							// Group listMenuOptions by num_list
							const groupedOptions = listMenuOptions.reduce((acc, option) => {
								if (!acc[option.num_list]) {
									acc[option.num_list] = [];
								}
								acc[option.num_list].push(option);
								return acc;
							}, {});

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
				}
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

					res.render('customize', {
						item: item,
						menuOptions: menuOptions,
						foodRecipes: foodRecipes,
						zone_name: zoneName,
						table_id: tableId
					});
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
				name_options: nameOptions
			};

			console.log('Updated Data:', orderData.num_list);
			console.log('Updated Data:', orderData.menu_id);
			console.log('Updated Data:', orderData.num_unit);

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
						TableModel.createSpecialOption(optionsData, (optionsError, optionsResult) => {
							if (optionsError) {
								console.error('Error creating order options:', optionsError);
								return res.status(500).send('Error creating order options');
							}
							// Proceed with the new code after creating special options
							proceedWithUpdate(orderData);
						});
					} else {
						// Proceed with the new code if there are no special options
						proceedWithUpdate(orderData);
					}
				});
			});
		});

		function proceedWithUpdate(orderData) {
			const updatedData = req.body;
			let fetchError = false;
			let saveError = false;
			let menuDataByNumList = {};
			let fetchCount = 0;

			console.log('Updated Data:', orderData.num_list);
			console.log('Updated Data:', orderData.menu_id);
			console.log('Updated Data:', orderData.num_unit);

			// Arrays to store the separated data
			let tblMenuIdArray = [];
			let numUnitArray = [];

			TableModel.getData(orderData.num_list, (error, results) => {
				if (error) {
					console.error('Error fetching data from database:', error);
					fetchError = true;
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
						console.log('Fetching recipes for tbl_menu_id:', tbl_menu_id);
						if (error) {
							console.error('Error fetching bill from database:', error);
							saveError = true;
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
								return;
							}

							// Iterate over the recipe data and create multiple entries
							const foodComparisonDataArray = filteredRecipeResults.map((recipeData, idx) => ({
								id_food_comparison: maxId + 1 + idx + index * filteredRecipeResults.length,
								num_list: orderData.num_list, // Use orderData.num_list here
								tbl_menu_id_menu: tbl_menu_id, // id from getIdmenu
								num_unit: numUnitArray[index],
								id_food_recipes: recipeData.id_food_recipes,
								tbl_menu_id_recipes: recipeData.tbl_menu_id, // Assign tbl_menu_id from recipeData
								name_ingredient_all: recipeData.name_ingredient,
								unit_quantity_all: recipeData.unit_quantity * numUnitArray[index], // Multiply unit_quantity by num_unit
								unit_id_all: recipeData.unit_id,
								zone_name: zoneName,
								id_table: tableId,
							}));

							TableModel.saveFoodComparison(foodComparisonDataArray, (error, result) => {
								if (error) {
									console.error('Error saving food comparison:', error);
									saveError = true;
								}
							});
						});
					});
				});

				// Redirect after the update process is completed
				return res.redirect(`/zone/${zoneName}/table/${tableId}/order_food`);
			}
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

		// First, delete the order from the list_menu_options table
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

};
