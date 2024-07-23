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
    
            // Step 2: Pass the results to the view
            // Check if both tables and zones are not empty
            if (results.tables.length > 0 || results.zones.length > 0) {
                // There are tables or zones in the database, pass them to the view
                res.render('table', {
                    title: 'Table View',
                    tables: results.tables, // Pass the tables to the view
                    zones: results.zones, // Pass the zones to the view
                    message: `Total tables: ${results.tables.length}, Total zones: ${results.zones.length}` // Display the number of tables and zones
                });
            } else {
                // No tables or zones found, pass an empty array or a message indicating no data found
                res.render('table', {
                    title: 'Table View',
                    tables: [], // Pass an empty array for tables
                    zones: [], // Pass an empty array for zones
                    message: 'No tables or zones found'
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
	
			// Ensure zones is an array
			if (!Array.isArray(zones)) {
				zones = []; // Convert zones to an empty array if it's not an array
			}
	
			TableModel.getTablesByZone(zoneId, (error, tables) => {
				if (error) {
					console.error('Error fetching tables from database:', error);
					return res.status(500).send('Error fetching tables from database');
				}
	
				res.render('view_zone', {
					title: `Tables in Zone ${zoneId}`,
					zoneId: zoneId,
					tables: tables,
					zones: zones // Now zones is guaranteed to be an array
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
		// Assuming req.body contains 'id_table' and 'zone_name'
		const tableData = {
			id_table: req.body.id_table,
			zone_name: req.body.zone_name,
		};
	
		// Call the createTable function from the TableModel
		// Assuming this is in your controller
		TableModel.createTable(tableData, (error, result) => {
			if (error) {
				// Handle error (e.g., send error response to client)
				console.error(error);
				res.status(500).send("An error occurred");
			} else {
				// Redirect to '/view_zone/:id' where :id is the id_table from the request
				res.redirect(`/view_zone/${req.body.zone_name}`);
			}
		});
	},
};