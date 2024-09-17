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

							console.log('groupedOptions:', groupedOptions);
							console.log('menuItems:', menuItems);
	  
							// Step 5: Render the order_food view with the retrieved data
							res.render('order_food', {
								groupedMenu: groupedMenu,
								basket: basket,
								zone_name: zoneName,
								table_id: tableId,
								menuItems: menuItems,
								groupedOptions: groupedOptions 
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
							res.redirect(`/zone/${zoneName}/table/${tableId}/order_food`);
						});
					} else {
						res.redirect(`/zone/${zoneName}/table/${tableId}/order_food`);
					}
				});
			});
		});
	},

	updateOrder: (req, res) => {
		const zoneName = req.params.zone;
		const tableId = req.params.table;
		const orderId = req.body.num_list;
		const updatedData = req.body;
	
		// Validate incoming data
		if (!orderId || !updatedData) {
			console.error('Invalid data received');
			return res.status(400).send('Invalid data received');
		}
		// Update the order in the database
		TableModel.updateOrder(updatedData, (error, results) => {
			if (error) {
				console.error('Error updating order:', error);
				return res.status(500).send('Error updating order');
			}
	
			// Check if status_bill is 'Y' and handle accordingly
			if (updatedData.status_bill === 'Y') {
				// Additional logic for handling status_bill can be added here
			}
	
			res.redirect(`/zone/${zoneName}/table/${tableId}/order_food`);
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
	
			// Then, delete the order from the main orders table
			TableModel.deleteOrderById(orderId, (orderError) => {
				if (orderError) {
					console.error('Error deleting order:', orderError);
					return res.status(500).send('Error deleting order');
				}
				res.redirect(`/zone/${zoneName}/table/${tableId}/order_food`);
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

        console.log('Deleting table with ID:', tableId);
        console.log('In zone ID:', zoneId);

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

			res.render('view_bill', {
				title: 'View Bill',
				bill: results,
			});
		});
	},
};
