const BuyingModel = require('../models/BuyingModel.js');
const { spawn } = require('child_process');

function startPythonScript() {
	const pythonProcess = spawn('python', ['server.py']);
	console.log('Python script started');
}

module.exports = {

	buyingView: function (req, res) {
		if (!req.session.user) {
			return res.redirect('/login');
		}
		const permissions = req.session.permissions;
		// Check if the user has the required permissions
		if (!permissions || permissions.buying.buying_read !== 'Y') {
			return res.redirect('/404');
		}
	
		const currentPage = parseInt(req.query.page) || 1;
		const itemsPerPage = 10;
		const offset = (currentPage - 1) * itemsPerPage;
	
		BuyingModel.fetch_last_state((err, time_counters) => {
			if (err) {
				console.error('Error fetching state:', err);
				res.status(500).send('Server Error');
				return;
			}
	
			for (const [id_buying_list, counters] of Object.entries(time_counters)) {
				console.log(`ID ${id_buying_list}: ${counters.day}d ${counters.hour}h ${counters.minute}m ${counters.second}s`);
			}
	
			BuyingModel.getBuyingByPageWithCount(itemsPerPage, offset, (error, results, totalItems) => {
				if (error) {
					res.status(500).send('Server Error');
					return;
				}
	
				const totalPages = Math.ceil(totalItems / itemsPerPage);
				console.log(results);
				res.render('buying', {
					buying: results,
					currentPage,
					totalPages,
					user: req.session.user,
					permissions: permissions
				});
			});
		});
	},

	addBuyingView: (req, res) => {
		if (!req.session.user) {
			return res.redirect('/login');
		}
		const permissions = req.session.permissions;
		// Check if the user has the required permissions
		if (!permissions || permissions.buying.buying_read !== 'Y') {
			return res.redirect('/404');
		}
	
		// Fetch setting types
		BuyingModel.viewSettingType((err, settingTypes) => {
			if (err) {
				console.error("Error fetching setting types:", err);
				return res.status(500).send("Error fetching setting types");
			}
	
			// Fetch setting units
			BuyingModel.viewSettingUnit((err, settingUnits) => {
				if (err) {
					console.error("Error fetching setting units:", err);
					return res.status(500).send("Error fetching setting units");
				}
	
				// Fetch the last product code
				BuyingModel.getLastProductCode((err, lastCode) => {
					if (err) {
						console.error("Error fetching last product code:", err);
						return res.status(500).send("Error fetching last product code");
					}
	
					// Generate the next product code
					let nextCode = 'J001'; // Default code if no previous code is found
					if (lastCode && lastCode.length > 0 && lastCode[0].id_buying_list) {
						const codeNumber = parseInt(lastCode[0].id_buying_list.substring(1)) + 1;
						nextCode = 'J' + codeNumber.toString().padStart(3, '0');
					}
	
					// Render the view with the fetched data and generated code
					res.render('add_buying', {
						title: 'Add Buying',
						settingTypes: settingTypes,
						settingUnits: settingUnits,
						selectedSettingType: null,
						selectedSettingUnit: null,
						error: req.flash('error'),
						id_buying_list: nextCode, // Pass the generated code to the template
						user: req.session.user,
						permissions: permissions
					});
				});
			});
		});
	},

	createBuying: (req, res) => {
		const { id_buying_list, name_product, date_of_receipt, setting_type_id, setting_unit_id, price, unit_quantity } = req.body;
		let { time } = req.body;
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
		if (!req.session.user) {
			return res.redirect('/login');
		}
		const permissions = req.session.permissions;
		// Check if the user has the required permissions
		if (!permissions || permissions.buying.buying_read !== 'Y') {
			return res.redirect('/404');
		}
	
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
								user: req.session.user,
								permissions: permissions
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
		const unit_quantity = req.body.unit_quantity; // Get unit_quantity from the request body
		const id_warehouse = req.body.id_warehouse; // Get id_warehouse from the request body

		BuyingModel.deleteBuying(id_buying_list, id_warehouse, unit_quantity, (deleteError, deleteResults) => {
			console.log(deleteResults);
			if (deleteError) {
				return res.status(500).send('Error deleting buying entry');
			}

			res.redirect('/buying');
		});
	},

	settingTypeView: (req, res) => {
		if (!req.session.user) {
			return res.redirect('/login');
		}
		const permissions = req.session.permissions;
		// Check if the user has the required permissions
		if (!permissions || permissions.buying.buying_read !== 'Y') {
			return res.redirect('/404');
		}
	
		BuyingModel.viewSettingType((error, results) => {
			if (error) {
				console.log(error);
				return res.status(500).send('Internal Server Error');
			} else {
				// Check if each type is referenced in the tbl_buying and setting_type tables
				const typesWithReferences = results.map(type => {
					return new Promise((resolve, reject) => {
						// Check if the type is referenced in tbl_buying
						BuyingModel.checkTypeReferencedInBuying(type.id_type, (error, isReferencedInBuying) => {
							if (error) {
								return reject(error);
							}
									
								type.isReferencedInBuying = isReferencedInBuying;
								resolve(type);
						});
					});
				});
	
				Promise.all(typesWithReferences)
					.then(types => {
						console.log(types);
						res.render('setting_type', {
							results: types, // Pass results instead of types
							user: req.session.user,
							permissions: permissions,
							errorMessage: req.query.errorMessage || null // Pass error message if exists
						});
					})
					.catch(error => {
						console.log(error);
						return res.status(500).send('Internal Server Error');
					});
			}
		});
	},

	settingAddTypeView: (req, res) => {
		if (!req.session.user) {
			return res.redirect('/login');
		}
		const permissions = req.session.permissions;
		// Check if the user has the required permissions
		if (!permissions || permissions.buying.buying_read !== 'Y') {
			return res.redirect('/404');
		}
	
		BuyingModel.viewSettingType((error, results) => {
			if (error) {
				console.log(error);
			} else {
				res.render('setting_add_type', {
					results,
					user: req.session.user,
					permissions: permissions
				});
			}
		});
	},

	createSettingType: (req, res) => {
		const id_type = req.body.id_type;
	
		// Check for duplicate entry before inserting
		BuyingModel.checkTypeExists(id_type, (error, exists) => {
			if (error) {
				console.log(error);
				return res.status(500).send('Internal Server Error');
			}
	
			if (exists) {
				// If the type already exists, render the page with an error message
				BuyingModel.viewSettingType((error, results) => {
					if (error) {
						console.log(error);
						return res.status(500).send('Internal Server Error');
					} else {
						return res.render('setting_add_type', {
							results,
							user: req.session.user,
							permissions: req.session.permissions,
							errorMessage: `มีรายการ '${id_type}' อยู่'`
						});
					}
				});
			} else {
				// If the type does not exist, proceed with the insertion
				BuyingModel.createSettingType(id_type, (error, results) => {
					if (error) {
						console.log(error);
						return res.status(500).send('Internal Server Error');
					} else {
						return res.redirect('/setting_type');
					}
				});
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
		if (!req.session.user) {
			return res.redirect('/login');
		}
		const permissions = req.session.permissions;
		// Check if the user has the required permissions
		if (!permissions || permissions.buying.buying_read !== 'Y') {
			return res.redirect('/404');
		}
	
		BuyingModel.viewSettingUnit((error, results) => {
			if (error) {
				console.log(error);
				return res.status(500).send('Internal Server Error');
			} else {
				// Check if each unit is referenced in the tbl_buying table
				const unitsWithReferences = results.map(unit => {
					return new Promise((resolve, reject) => {
						BuyingModel.checkUnitReferencedInBuying(unit.id_unit, (error, isReferencedInBuying) => {
							if (error) {
								return reject(error);
							}
	
							unit.isReferencedInBuying = isReferencedInBuying;
							resolve(unit);
						});
					});
				});
	
				Promise.all(unitsWithReferences)
					.then(units => {
						console.log(units);
						res.render('setting_unit', {
							results: units, // Pass results instead of units
							user: req.session.user,
							permissions: permissions,
							errorMessage: req.query.errorMessage || null // Pass error message if exists
						});
					})
					.catch(error => {
						console.log(error);
						return res.status(500).send('Internal Server Error');
					});
			}
		});
	},
	
	settingAddUnitView: (req, res) => {
		if (!req.session.user) {
			return res.redirect('/login');
		}
		const permissions = req.session.permissions;
		// Check if the user has the required permissions
		if (!permissions || permissions.buying.buying_read !== 'Y') {
			return res.redirect('/404');
		}
	
		BuyingModel.viewSettingUnit((error, results) => {
			if (error) {
				console.log(error);
			} else {
				res.render('setting_add_unit', {
					results,
					user: req.session.user,
					permissions: permissions
				});
			}
		});
	},

	createSettingUnit: (req, res) => {
		const id_unit = req.body.id_unit;
	
		// Check for duplicate entry before inserting
		BuyingModel.checkUnitExists(id_unit, (error, exists) => {
			if (error) {
				console.log(error);
				return res.status(500).send('Internal Server Error');
			}
	
			if (exists) {
				// If the unit already exists, render the page with an error message
				BuyingModel.viewSettingUnit((error, results) => {
					if (error) {
						console.log(error);
						return res.status(500).send('Internal Server Error');
					} else {
						return res.render('setting_add_unit', {
							results,
							user: req.session.user,
							permissions: req.session.permissions,
							errorMessage: `มีรายการ '${id_unit}' อยู่แล้ว`
						});
					}
				});
			} else {
				// If the unit does not exist, proceed with the insertion
				BuyingModel.createSettingUnit(id_unit, (error, results) => {
					if (error) {
						console.log(error);
						return res.status(500).send('Internal Server Error');
					} else {
						return res.redirect('/setting_unit');
					}
				});
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

	searchProduct(req, res) {
		if (!req.session.user) {
			return res.redirect('/login');
		}
		const permissions = req.session.permissions;
		// Check if the user has the required permissions
		if (!permissions || permissions.buying.buying_read !== 'Y') {
			return res.redirect('/404');
		}
	
		const query = req.query.query;
		console.log(query);
		BuyingModel.searchProducts(query, (err, results) => {
			console.log(results);
			if (err) {
				return res.status(500).send(err);
			}
			if (results.length === 0) {
				return res.status(404).json({ message: 'No products found' });
			}
			res.json(results);
		});
	},

	warehouseView: (req, res) => {
		if (!req.session.user) {
			return res.redirect('/login');
		}
		const permissions = req.session.permissions;
		// Check if the user has the required permissions
		if (!permissions || permissions.buying.buying_read !== 'Y') {
			return res.redirect('/404');
		}
	
		BuyingModel.viewWarehouse((error, results) => {
			if (error) {
				console.log(error);
			} else {
				// Aggregate results by id_warehouse
				const aggregatedResults = results.reduce((acc, current) => {
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


				res.render('warehouse', {
					results: aggregatedArray,
					user: req.session.user,
					permissions: permissions
				});
			}
		});
	},

	viewWarehouseView: (req, res) => {
		if (!req.session.user) {
			return res.redirect('/login');
		}
		const permissions = req.session.permissions;
		// Check if the user has the required permissions
		if (!permissions || permissions.buying.buying_read !== 'Y') {
			return res.redirect('/404');
		}
	
		const warehouseId = req.params.id; // Extracting the id from request parameters
		BuyingModel.viewWarehouse((error, results) => {
			if (error) {
				console.log(error);
			} else {
				// Filter results for the specific id_warehouse
				const filteredResults = results.filter(result => result.id_warehouse == warehouseId);
	
				// Aggregate the filtered results by id_warehouse
				const aggregatedResults = filteredResults.reduce((acc, current) => {
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
				const warehouseData = aggregatedArray[0];
				
				// Render the view for the specific warehouse id
				res.render('view_warehouse', {
					warehouse: warehouseData,
					user: req.session.user,
					permissions: permissions
				});
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