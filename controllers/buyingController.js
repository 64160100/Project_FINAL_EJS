const BuyingModel = require('../models/BuyingModel.js');
const { spawn } = require('child_process');

function startPythonScript() {
	const pythonProcess = spawn('python', ['server.py']);
	console.log('Python script started');
}

module.exports = {

	buyingView: function (req, res) {

		BuyingModel.fetch_last_state((err, time_counters) => {
			if (err) {
				console.error('Error fetching state:', err);
				res.status(500).send('Server Error');
				return;
			}

			for (const [id_buying_list, counters] of Object.entries(time_counters)) {
				console.log(`ID ${id_buying_list}: ${counters.day}d ${counters.hour}h ${counters.minute}m ${counters.second}s`);
			}

			BuyingModel.getBuying(function (error, results) {
				if (error) {
					res.status(500).send('Server Error');
					return;
				}

				res.render('buying', { buying: results });
			});
		});
	},

	addBuyingView: (req, res) => {
		// Assuming SettingModel has methods to fetch setting types and units
		BuyingModel.viewSettingType((err, settingTypes) => {
			if (err) {
				console.error("Error fetching setting types:", err);
				return res.status(500).send("Error fetching setting types");
			}

			BuyingModel.viewSettingUnit((err, settingUnits) => {
				if (err) {
					console.error("Error fetching setting units:", err);
					return res.status(500).send("Error fetching setting units");
				}
				res.render('add_buying', {
					title: 'Add Buying',
					settingTypes: settingTypes,
					settingUnits: settingUnits,
					selectedSettingType: null,
					selectedSettingUnit: null,
					error: req.flash('error'),
				});
			});
		});
	},

	createBuying: (req, res) => {
		const { id_buying_list, name_product, date_of_receipt, setting_type_id, setting_unit_id, price, unit_quantity } = req.body;
		let { time } = req.body;
		console.log(req.body);
		let [day, hour, minute, second] = [0, 0, 0, 0];
	
		if (time) {
			let timeParts = time.replace(/\s/g, '').split(':');
			day = parseInt(timeParts[0]) || 0;
			hour = parseInt(timeParts[1]) || 0;
			minute = parseInt(timeParts[2]) || 0;
			second = parseInt(timeParts[3]) || 0;
		}
		BuyingModel.checkDuplicates_AddBuying(id_buying_list, name_product, (error, duplicates) => {
			if (error) {
				console.error('Database error:', error);
				return res.status(500).send('Internal Server Error');
			}
			if (duplicates && Object.keys(duplicates).length > 0) {
				BuyingModel.viewSettingType((err, settingTypes) => {
					if (err) {
						console.error("Error fetching setting types:", err);
						return res.status(500).send("Error fetching setting types");
					}
					BuyingModel.viewSettingUnit((err, settingUnits) => {
						if (err) {
							console.error("Error fetching setting units:", err);
							return res.status(500).send("Error fetching setting units");
						}
						return res.render('add_buying', {
							settingTypes: settingTypes,
							settingUnits: settingUnits,
							selectedSettingType: setting_type_id,
							selectedSettingUnit: setting_unit_id,
							error: duplicates,
						});
					}); // This was missing
				}); // This was incorrectly placed
			} else {
				BuyingModel.createBuying(id_buying_list, name_product, date_of_receipt, setting_type_id, setting_unit_id, price, unit_quantity, day, hour, minute, second, (error, result) => {
					if (error) {
						console.error('Database error:', error);
						return res.status(500).send('Internal Server Error');
					} else {
						startPythonScript();
						res.redirect('/buying');
					}
				});
			}
		});
	},

	updateBuyingTime: function (req, res) {
		const { id_buying_list, day, hour, minute, second } = req.body;

		BuyingModel.update_time(id_buying_list, day, hour, minute, second, (err, result) => {
			if (err) {
				console.error('Error updating time:', err);
				res.status(500).send('Server Error');
				return;
			}
			res.send('Time updated successfully');
		});
	},

	viewBuyingView: (req, res) => {
		const buyingId = req.params.id;
	
		BuyingModel.getBuyingById(buyingId, function (error, results) {
			if (error) {
				console.error('Database error:', error);
				res.status(500).send('Internal Server Error');
			} else if (results.length > 0) {
				const buying = results[0];
	
				function formatDate(date) {
					const d = new Date(date),
						month = '' + (d.getMonth() + 1),
						day = '' + d.getDate(),
						year = d.getFullYear();
	
					return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
				}
	
				if (buying.date_of_receipt) {
					buying.date_of_receipt = formatDate(buying.date_of_receipt);
				}
	
				// Fetch the last state after getting the buying details
				BuyingModel.fetch_last_state((err, time_counters) => {
					if (err) {
						console.error('Error fetching state:', err);
						res.status(500).send('Server Error');
						return;
					}
	
					for (const [id_buying_list, counters] of Object.entries(time_counters)) {
						console.log(`ID ${id_buying_list}: ${counters.day}d ${counters.hour}h ${counters.minute}m ${counters.second}s`);
					}
	
					BuyingModel.viewSettingType((errorSettingType, settingTypes) => {
						if (errorSettingType) {
							console.log(errorSettingType);
							return res.status(500).send("Error fetching setting types");
						}
						BuyingModel.viewSettingUnit((errorSettingUnit, settingUnits) => {
							if (errorSettingUnit) {
								console.log(errorSettingUnit);
								return res.status(500).send("Error fetching setting units");
							}
	
							console.log(buying);
							startPythonScript();
							res.render('view_buying', {
								buying,
								settingTypes,
								settingUnits,
								selectedSettingType: buying.setting_type_id,
								selectedSettingUnit: buying.setting_unit_id,
							});
	
						});
					});
				});
			} else {
				// Handle case where no results are found
				res.status(404).send('Buying not found');
			}
		});
	},

	deleteBuying: (req, res) => {
		const id_buying_list = req.params.id;
		BuyingModel.deleteBuying(id_buying_list, (error, results) => {
			if (error) {
				console.log(error);
			} else {
				res.redirect('/buying');
			}
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
	},

	warehouseView: (req, res) => {
		BuyingModel.viewWarehouse((error, results) => {
			if (error) {
				console.log(error);
			} else {
				// Aggregate results by id_warehouse
				const aggregatedResults = results.reduce((acc, current) => {
					// If the id_warehouse already exists, sum up the unit_quantity_all
					if (acc[current.id_warehouse]) {
						acc[current.id_warehouse].unit_quantity_all += current.unit_quantity_all;
					} else {
						// Otherwise, add the entry to the accumulator
						acc[current.id_warehouse] = current;
						// Ensure unit_quantity_all is treated as a number for summation
						acc[current.id_warehouse].unit_quantity_all = current.unit_quantity_all;
					}
					return acc;
				}, {});
	
				// Convert the aggregated results back to an array
				const aggregatedArray = Object.values(aggregatedResults);
	
				console.log(aggregatedArray);
				res.render('warehouse', { results: aggregatedArray });
			}
		});
	},

	viewWarehouseView: (req, res) => {
		const warehouseId = req.params.id; // Extracting the id from request parameters
		BuyingModel.viewWarehouse((error, results) => {
			if (error) {
				console.log(error);
			} else {
				// Filter results for the specific id_warehouse
				const filteredResults = results.filter(result => result.id_warehouse == warehouseId);
	
				// Assuming you still want to aggregate the filtered results
				const aggregatedResults = filteredResults.reduce((acc, current) => {
					if (acc[current.id_warehouse]) {
						acc[current.id_warehouse].unit_quantity_all += current.unit_quantity_all;
					} else {
						acc[current.id_warehouse] = current;
						acc[current.id_warehouse].unit_quantity_all = current.unit_quantity_all;
					}
					return acc;
				}, {});
	
				// Convert the aggregated results back to an array
				const aggregatedArray = Object.values(aggregatedResults);
				const warehouseData = aggregatedArray[0];
	
				console.log(aggregatedArray);
				// Render the view for the specific warehouse id
				res.render('view_warehouse', { warehouse: warehouseData });
			}
		});
	},
	
	createWarehouse: (req, res) => {
		const { unit_quantity_max } = req.body; 
		console.log(req.body);

		const id_warehouse = req.body.id_warehouse; // You need an ID to know which warehouse to update
	
		BuyingModel.updateWarehouseQuantityMax(id_warehouse, unit_quantity_max, (error, results) => {
			if (error) {
				console.log(error);
			} else {
				res.redirect('/warehouse');
			}
		});
	}
};