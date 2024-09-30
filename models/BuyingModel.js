const connection = require('./ConMysql');

module.exports = {

    getBuying: function (callback) {
        const query = 'SELECT * FROM tbl_buying';

        connection.query(query, (error, results) => {
            if (error) {
                return callback(error);
            }
            return callback(null, results);
        });
    },

    createBuying: function (id_buying_list, name_product, date_of_receipt, setting_type_id, setting_unit_id, price, unit_quantity, day, hour, minute, second, callback) {
        if (typeof callback !== 'function') {
            throw new TypeError('Callback must be a function');
        }

        // Step 1: Check for existing product name
        const checkProductQuery = `
            SELECT w.id_warehouse 
            FROM tbl_warehouse w
            JOIN tbl_buying b ON w.tbl_buying_id = b.id_buying_list
            WHERE b.name_product = ?
            LIMIT 1`;
        
        connection.query(checkProductQuery, [name_product], (checkError, checkResults) => {
            if (checkError) {
                return callback(checkError);
            }
            
            let warehouseId;
            if (checkResults.length > 0) {
                // Product exists, use its id_warehouse
                warehouseId = checkResults[0].id_warehouse;
                insertIntoWarehouse(warehouseId);
            } else {
                // Product does not exist, generate a new id_warehouse and tbl_id_warehouse
                const newIdQuery = 'SELECT id_warehouse, tbl_id_warehouse FROM tbl_warehouse ORDER BY tbl_id_warehouse DESC LIMIT 1';
                connection.query(newIdQuery, [], (newIdError, newIdResults) => {
                    if (newIdError) {
                        return callback(newIdError);
                    }
                    let tblIdWarehouse;
                    if (newIdResults.length > 0) {
                        // Generate next id_warehouse and tbl_id_warehouse based on the last one
                        const lastId = newIdResults[0].id_warehouse;
                        const idNumber = parseInt(lastId.substring(1)) + 1; // Assuming id format is "T001"
                        warehouseId = `T${idNumber.toString().padStart(3, '0')}`;
                        tblIdWarehouse = newIdResults[0].tbl_id_warehouse + 1;
                    } else {
                        // No entries, start with "T001" and tbl_id_warehouse 1
                        warehouseId = "T001";
                        tblIdWarehouse = 1;
                    }
                    insertIntoWarehouse(warehouseId, tblIdWarehouse);
                });
            }
        });

        function insertIntoWarehouse(warehouseId, tblIdWarehouse) {
            // Insert into tbl_buying
            const query = 'INSERT INTO tbl_buying (id_buying_list, name_product, date_of_receipt, setting_type_id, setting_unit_id, price, unit_quantity, day, hour, minute, second) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            const values = [id_buying_list, name_product, date_of_receipt, setting_type_id, setting_unit_id, price, unit_quantity, day, hour, minute, second];
            
            connection.query(query, values, (error, results) => {
                if (error) {
                    return callback(error);
                }

                // Check the maximum value of tbl_id_warehouse and increment it
                const maxIdQuery = 'SELECT MAX(tbl_id_warehouse) AS maxId FROM tbl_warehouse';
                connection.query(maxIdQuery, [], (maxIdError, maxIdResults) => {
                    if (maxIdError) {
                        return callback(maxIdError);
                    }
                    let newTblIdWarehouse = 1;
                    if (maxIdResults.length > 0 && maxIdResults[0].maxId !== null) {
                        newTblIdWarehouse = maxIdResults[0].maxId + 1;
                    }

                    // Insert into tbl_warehouse with the determined id_warehouse and new tbl_id_warehouse
                    const warehouseQuery = 'INSERT INTO tbl_warehouse (tbl_id_warehouse, id_warehouse, unit_quantity_all, unit_quantity_max, tbl_buying_id, setting_unit_id, setting_type_id, name_product) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
                    const warehouseValues = [newTblIdWarehouse, warehouseId, unit_quantity, 'null', id_buying_list, setting_unit_id, setting_type_id, name_product]; // Adjust as necessary
                    
                    connection.query(warehouseQuery, warehouseValues, (warehouseError, warehouseResults) => {
                        if (warehouseError) {
                            return callback(warehouseError);
                        }
                        return callback(null, { buyingResults: results, warehouseResults: warehouseResults });
                    });
                });
            });
        }
    },

    getBuyingById: function (buyingId, callback) {
        connection.query('SELECT * FROM tbl_buying WHERE id_buying_list = ?', [buyingId], function (error, results) {
            if (error) {
                return callback(error, null);
            } else {
                return callback(null, results);
            }
        });
    },

    deleteBuying: function (buyingId, id_warehouse, unit_quantity, callback) {
        if (typeof callback !== 'function') {
            throw new TypeError('Callback must be a function');
        }
        
        // Start a transaction
        connection.beginTransaction(function(err) {
            if (err) {
                return callback(err, null);
            }
    
            // Update the unit_quantity_all in tbl_warehouse
            const updateQuery = `
                UPDATE tbl_warehouse 
                SET unit_quantity_all = unit_quantity_all - ?
                WHERE id_warehouse = ?`;
            connection.query(updateQuery, [unit_quantity, id_warehouse], function (updateError, updateWarehouseResults) {
                if (updateError) {
                    // If an error occurs, rollback the transaction
                    return connection.rollback(function() {
                        callback(updateError, null);
                    });
                }
    
                // Delete the row in tbl_warehouse
                const deleteWarehouseQuery = 'DELETE FROM tbl_warehouse WHERE tbl_buying_id = ?';
                connection.query(deleteWarehouseQuery, [buyingId], function (deleteWarehouseError, deleteWarehouseResults) {
                    if (deleteWarehouseError) {
                        // If an error occurs, rollback the transaction
                        return connection.rollback(function() {
                            callback(deleteWarehouseError, null);
                        });
                    }
    
                    // Then, delete the row in tbl_buying
                    connection.query('DELETE FROM tbl_buying WHERE id_buying_list = ?', [buyingId], function (deleteError, deleteBuyingResults) {
                        if (deleteError) {
                            // If an error occurs, rollback the transaction
                            return connection.rollback(function() {
                                callback(deleteError, null);
                            });
                        }
    
                        // If no errors, commit the transaction
                        connection.commit(function(commitError) {
                            if (commitError) {
                                return connection.rollback(function() {
                                    callback(commitError, null);
                                });
                            }
                            // Success
                            callback(null, { buyingResults: deleteBuyingResults, warehouseResults: updateWarehouseResults, deleteWarehouseResults: deleteWarehouseResults });
                        });
                    });
                });
            });
        });
    },

    checkDuplicates_AddBuying: function (idBuyingList, nameProduct, callback) {
        const query = `SELECT id_buying_list FROM tbl_buying WHERE id_buying_list = ?`;
        connection.query(query, [idBuyingList], (error, results) => {
            if (error) return callback(error, null);
            let duplicates = {};
            if (results.length > 0) {
                results.forEach(result => {
                    if (result.id_buying_list === idBuyingList) duplicates.id_buying_list = 'ID Buying List ซ้ำ';
                });
                return callback(null, duplicates);
            }
            return callback(null, false);
        });
    },

    update_time: function (id_buying_list, day, hour, minute, second, callback) {
        connection.query('SELECT * FROM tbl_buying WHERE id_buying_list = ?', [id_buying_list], (err, results) => {
            if (err) return callback(err);

            if (results.length > 0) {
                connection.query('UPDATE tbl_buying SET day = ?, hour = ?, minute = ?, second = ? WHERE id_buying_list = ?',
                    [day, hour, minute, second, id_buying_list], callback);
            } else {
                connection.query('INSERT INTO tbl_buying (id_buying_list, day, hour, minute, second) VALUES (?, ?, ?, ?, ?)',
                    [id_buying_list, day, hour, minute, second], callback);
            }
        });
    },

    fetch_last_state: function (callback) {
        connection.query('SELECT id_buying_list, day, hour, minute, second FROM tbl_buying', (err, results) => {
            if (err) return callback(err);

            const state = {};
            results.forEach(row => {
                state[row.id_buying_list] = { day: row.day, hour: row.hour, minute: row.minute, second: row.second };
            });
            callback(null, state);
        });
    },


    viewSettingType: function (callback) {
        connection.query('SELECT id_type FROM setting_type', (error, results) => {
            if (error) {
                return callback(error);
            }
            return callback(null, results);
        });
    },

    createSettingType: function (id_type, callback) {
        const query = 'INSERT INTO setting_type (id_type) VALUES (?)';
        connection.query(query, [id_type], (error, results) => {
            if (error) {
                return callback(error);
            }
            return callback(null, results);
        });
    },

    deleteSettingType: function (id, callback) {
        const query = 'DELETE FROM setting_type WHERE id_type = ?';
        connection.query(query, [id], (error, results) => {
            if (error) {
                return callback(error);
            }
            return callback(null, results);
        });
    },

    viewSettingUnit: function (callback) {
        connection.query('SELECT id_unit FROM setting_unit', (error, results) => {
            if (error) {
                return callback(error);
            }
            return callback(null, results);
        });
    },

    getLastProductCode: function (callback) {
        connection.query('SELECT id_buying_list FROM tbl_buying ORDER BY id_buying_list DESC LIMIT 1', (error, results) => {
            if (error) {
                return callback(error);
            }
            return callback(null, results);
        });
    },

    createSettingUnit: function (id_unit, callback) {
        const query = 'INSERT INTO setting_unit (id_unit) VALUES (?)';
        connection.query(query, [id_unit], (error, results) => {
            if (error) {
                return callback(error);
            }
            return callback(null, results);
        });
    },

    deleteSettingUnit: function (id, callback) {
        const query = 'DELETE FROM setting_unit WHERE id_unit = ?';
        connection.query(query, [id], (error, results) => {
            if (error) {
                return callback(error);
            }
            return callback(null, results);
        });
    },

    viewWarehouse: function(callback) {
        // SQL query to join tbl_warehouse with tbl_buying and select required fields including name_product
        const query = `
            SELECT w.*, b.name_product 
            FROM tbl_warehouse w
            JOIN tbl_buying b ON w.tbl_buying_id = b.id_buying_list
        `;
    
        // Execute the query
        connection.query(query, (error, results) => {
            if (error) {
                // Handle any errors
                return callback(error);
            }
            // Return the results through the callback
            callback(null, results);
        });
    },

    updateWarehouseQuantity: function (id_warehouse, unit_quantity_all, callback) {
        const updateQuery = 'UPDATE tbl_warehouse SET unit_quantity_all = ? WHERE id_warehouse = ?';
        connection.query(updateQuery, [unit_quantity_all, id_warehouse], (updateError, updateResults) => {
            if (updateError) {
                return callback(updateError);
            }
            callback(null, updateResults);
        });
    },

    updateWarehouseQuantityMax: function (id_warehouse, unit_quantity_max, callback) {
        connection.query('UPDATE tbl_warehouse SET unit_quantity_max = ? WHERE id_warehouse = ?', [unit_quantity_max, id_warehouse], (error, results) => {
            if (error) {
                return callback(error);
            }
            return callback(null, results);
        });
    }

};