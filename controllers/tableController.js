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
	}

};
