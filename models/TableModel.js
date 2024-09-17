const connection = require('./ConMysql');

module.exports = {

    getTablesAndZones: function (callback) {
        // First, query the tbl_table
        connection.query('SELECT * FROM tbl_table', (error, tables) => {
            if (error) {
                console.error('Error fetching tables from database:', error);
                return callback(error, null);
            }

            // Next, query the tbl_zones
            connection.query('SELECT * FROM tbl_zones', (error, zones) => {
                if (error) {
                    console.error('Error fetching zones from database:', error);
                    // It's important to return here to avoid calling the callback twice
                    return callback(error, null);
                }

                // If both queries succeed, return the results together
                callback(null, { tables: tables, zones: zones });
            });
        });
    },

    getTablesByZone: function (zoneId, callback) {
        // First query to get tables by zone
        const queryTables = `
            SELECT tbl_table.id_table 
            FROM tbl_table
            JOIN tbl_zones ON tbl_table.zone_name = tbl_zones.zone_name
            WHERE tbl_zones.zone_name = ?
        `;

        connection.query(queryTables, [zoneId], (error, tables) => {
            if (error) {
                console.error('Error fetching tables from database:', error);
                return callback(error, null);
            }

            // Second query to get all zones, nested within the callback of the first query
            const queryZones = 'SELECT * FROM tbl_zones';
            connection.query(queryZones, (error, zones) => {
                if (error) {
                    console.error('Error fetching zones from database:', error);
                    return callback(error, null);
                }

                // If both queries succeed, return the results together
                callback(null, { tables: tables, zones: zones });
            });
        });
    },

    getAllTables: function (callback) {
        connection.query('SELECT * FROM tbl_table', (error, results) => {
            if (error) {
                return callback(error, null);
            } else {

                const table = results.map(table => ({
                    id: table.id_table,
                    name: table.table_name
                }));
                return callback(null, table);
            }
        });
    },

    createTable: function (tableData, callback) {
        // Step 1: Ensure zone_name exists in tbl_zones
        connection.query('SELECT zone_name FROM tbl_zones WHERE zone_name = ?', [tableData.zone_name], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            if (results.length === 0) {
                // zone_name does not exist, insert it into tbl_zones
                connection.query('INSERT INTO tbl_zones (zone_name) VALUES (?)', [tableData.zone_name], (error, results) => {
                    if (error) {
                        return callback(error, null);
                    }
                    // Proceed to insert tables after ensuring zone_name exists
                    insertTables();
                });
            } else {
                // zone_name exists, proceed to insert tables
                insertTables();
            }
        });

        function insertTables() {
            let insertionsCompleted = 0;
            const totalInsertions = parseInt(tableData.id_table); // Assuming this is the user input for the number of tables to create

            for (let i = 1; i <= totalInsertions; i++) {
                // Insert each id_table entry with the specified zone_name
                connection.query('INSERT INTO tbl_table (id_table, zone_name) VALUES (?, ?)', [i, tableData.zone_name], (error, results) => {
                    if (error) {
                        return callback(error, null);
                    }
                    insertionsCompleted++;
                    // Check if all insertions are completed
                    if (insertionsCompleted === totalInsertions) {
                        // All insertions are complete, send result back to the controller
                        callback(null, { message: `${totalInsertions} tables created successfully in zone ${tableData.zone_name}.` });
                    }
                });
            }
        }
    },

    getOrderFood: function (callback) {
        connection.query('SELECT * FROM tbl_menu', (error, results) => {
            if (error) {
                return callback(error, null);
            } else {
                const menu = results.map(item => ({
                    id: item.id_menu,
                    name: item.name_product,
                    picture: item.menu_picture,
                    price: item.price,
                    category: item.menu_category,
                    type: item.menu_type,
                    status: item.status // Include the status field
                }));
                return callback(null, menu);
            }
        });
    },

    getSpecificMenuItems: function (tableId, zoneName, callback) {
        const query = "SELECT * FROM list_menu WHERE id_table = ? AND zone_name = ?";
        connection.query(query, [tableId, zoneName], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results);
        });
    },

    // In your model file (e.g., TableModel.js)
    getListMenuOptions: (callback) => {
        const query = 'SELECT * FROM list_menu_options';
        connection.query(query, (error, results) => {
            if (error) {
                return callback(error);
            }
            callback(null, results);
        });
    },

    getMenuItemById: function (itemId, callback) {
        const sql = 'SELECT * FROM tbl_menu WHERE id_menu = ?';
        connection.query(sql, [itemId], (error, results) => {
            if (error) {
                return callback(error, null);
            }

            if (results.length === 0) {
                return callback(null, null);
            }

            const menu = results.map(item => ({
                id: item.id_menu,
                name: item.name_product,
                picture: item.menu_picture,
                price: item.price,
                category: item.menu_category,
                type: item.menu_type,
            }));

            return callback(null, menu[0]); // Assuming you want to return a single item
        });
    },

    getMenuOptionsByMenuId: (menuId, callback) => {
        const query = `
            SELECT 
                id_menu_options, 
                menu_id, 
                name_options, 
                price, 
                name_ingredient_menu_options, 
                unit_quantity_menu_options, 
                unit_id_menu_options 
            FROM tbl_menu_options 
            WHERE menu_id = ?
        `;
        connection.query(query, [menuId], (error, results) => {
            if (error) {
                return callback(error, null);
            }

            // Group data in JavaScript
            const groupedResults = results.reduce((acc, curr) => {
                const key = curr.name_options;
                if (!acc[key]) {
                    acc[key] = {
                        id_menu_options: curr.id_menu_options, // Include id_menu_options
                        name_options: curr.name_options,
                        price: curr.price, // Show the highest price
                        ingredients: [],
                        quantities: [], // Separate total_quantity into an array
                        unit_ids: [] // Separate unit_id_menu_options into an array
                    };
                } else {
                    // Update the price to be the highest price
                    acc[key].price = Math.max(acc[key].price, curr.price);
                }
                acc[key].ingredients.push(curr.name_ingredient_menu_options);
                acc[key].quantities.push(curr.unit_quantity_menu_options); // Add quantity to the array
                acc[key].unit_ids.push(curr.unit_id_menu_options); // Add unit_id to the array
                return acc;
            }, {});

            // Convert Object back to Array
            const finalResults = Object.values(groupedResults);

            callback(null, finalResults);
        });
    },

    getFoodRecipesByMenuId: (menuId, callback) => {
        const query = `
            SELECT 
                id_food_recipes, 
                tbl_menu_id, 
                name_ingredient, 
                unit_quantity, 
                unit_id 
            FROM tbl_food_recipes 
            WHERE tbl_menu_id = ?
        `;
        connection.query(query, [menuId], (error, results) => {
            if (error) {
                return callback(error, null);
            }

            // จัดกลุ่มข้อมูลใน JavaScript
            const groupedResults = results.reduce((acc, curr) => {
                const key = curr.id_food_recipes;
                if (!acc[key]) {
                    acc[key] = {
                        id_food_recipes: curr.id_food_recipes,
                        tbl_menu_id: curr.tbl_menu_id,
                        ingredients: [],
                        quantities: [],
                        unit_ids: []
                    };
                }
                acc[key].ingredients.push(curr.name_ingredient);
                acc[key].quantities.push(curr.unit_quantity);
                acc[key].unit_ids.push(curr.unit_id);
                return acc;
            }, {});

            // แปลง Object กลับเป็น Array
            const finalResults = Object.values(groupedResults);

            callback(null, finalResults);
        });
    },

    getZoneAndTableDetails: function (zoneId, tableId, callback) {
        const query = `
            SELECT 
                tbl_zones.zone_name, 
                tbl_table.id_table 
            FROM tbl_zones 
            JOIN tbl_table ON tbl_zones.zone_name = tbl_table.zone_name 
            WHERE tbl_zones.zone_name = ? AND tbl_table.id_table = ?
        `;
        connection.query(query, [zoneId, tableId], (error, results) => {
            if (error) {
                return callback(error, null);
            }

            const zone = results[0].zone_name;
            const table = results[0].id_table;

            callback(null, { zone: zone, table: table });
        });
    },

    getZoneAndItemDetails: function (zoneId, itemId, callback) {
        const query = `
            SELECT 
                tbl_zones.zone_name, 
                tbl_table.id_table, 
                tbl_table.table_name, 
                tbl_menu.id_menu, 
                tbl_menu.name_product, 
                tbl_menu.price 
            FROM tbl_zones 
            JOIN tbl_table ON tbl_zones.zone_name = tbl_table.zone_name 
            JOIN tbl_menu ON tbl_table.id_table = tbl_menu.id_menu 
            WHERE tbl_zones.zone_name = ? AND tbl_menu.id_menu = ?
        `;
        connection.query(query, [zoneId, itemId], (error, results) => {
            if (error) {
                return callback(error, null);
            }

            const zone = results[0].zone_name;
            const table = results[0].table_name;
            const item = results.map(item => ({
                id: item.id_menu,
                name: item.name_product,
                price: item.price
            }));

            callback(null, { zone: zone, table: table, item: item });
        });
    },

    getTableById: function (tableId, callback) {
        connection.query('SELECT * FROM tbl_table WHERE id_table = ?', [tableId], (error, results) => {
            if (error) {
                return callback(error, null);
            }

            if (results.length === 0) {
                return callback(null, null);
            }

            const table = results.map(table => ({
                id: table.id_table,
                name: table.table_name
            }));

            return callback(null, table[0]); // Assuming you want to return a single table
        });
    },

    updateTable: function (tableId, zoneName, tableData, callback) {
        connection.query('UPDATE tbl_table SET table_name = ? WHERE id_table = ? AND zone_name = ?',
            [tableData.name, tableId, zoneName], (error, results) => {
                if (error) {
                    return callback(error, null);
                }
                callback(null, results);
            });
    },

    getZoneNameById: (zoneId, callback) => {
        const query = 'SELECT zone_name FROM `tbl_zones` WHERE `zone_name` = ?';
        connection.query(query, [zoneId], (error, results) => {
            if (error) {
                return callback(error);
            }
            if (results.length > 0) {
                callback(null, results[0].zone_name);
            } else {
                callback(new Error('Zone not found'));
            }
        });
    },


    deleteTableByIdAndZone: (tableId, zoneName, callback) => {
        const query = 'DELETE FROM `tbl_table` WHERE `id_table` = ? AND `zone_name` = ?';
        connection.query(query, [tableId, zoneName], (error, results) => {
            if (error) {
                console.error('Error deleting table from database:', error);
                return callback(error);
            }
            console.log('Deleted table with ID:', tableId);
            callback(null, results);
        });
    },

    getLockZone: (zoneId, callback) => {
        const query = 'SELECT lock_zone FROM `tbl_zones` WHERE `zone_name` = ?';
        connection.query(query, [zoneId], (error, results) => {
            if (error) {
                return callback(error);
            }
            if (results.length > 0) {
                callback(null, results[0].lock_zone);
            } else {
                callback(new Error('Zone not found'));
            }
        });
    },

    deleteZone: (zoneId, callback) => {
        // First, delete the entries from tbl_table
        const deleteTablesQuery = 'DELETE FROM `tbl_table` WHERE `zone_name` = ?';
        connection.query(deleteTablesQuery, [zoneId], (error, results) => {
            if (error) {
                console.error('Error deleting tables from database:', error);
                return callback(error);
            }
            console.log('Deleted tables for zone with ID:', zoneId);

            // Then, delete the entry from tbl_zones
            const deleteZoneQuery = 'DELETE FROM `tbl_zones` WHERE `zone_name` = ?';
            connection.query(deleteZoneQuery, [zoneId], (error, results) => {
                if (error) {
                    console.error('Error deleting zone from database:', error);
                    return callback(error);
                }
                console.log('Deleted zone with ID:', zoneId);
                callback(null, results);
            });
        });
    },

    findRemainingZone: (callback) => {
        const query = 'SELECT `zone_name` FROM `tbl_zones` LIMIT 1';
        connection.query(query, (error, results) => {
            if (error) {
                return callback(error);
            }
            if (results.length > 0) {
                callback(null, results[0].zone_name);
            } else {
                callback(null, null); // No remaining zones
            }
        });
    },

    updateLockZone: (zoneName, newLockState, callback) => {
        const query = 'UPDATE tbl_zones SET lock_zone = ? WHERE zone_name = ?';
        connection.query(query, [newLockState, zoneName], (error, results) => {
            if (error) {
                return callback(error);
            }
            callback(null);
        });
    },

    checkZoneExists: (zoneId, callback) => {
        const query = 'SELECT COUNT(*) AS count FROM `tbl_zones` WHERE `zone_name` = ?';
        connection.query(query, [zoneId], (error, results) => {
            if (error) {
                return callback(error);
            }
            const exists = results[0].count > 0;
            callback(null, exists);
        });
    },

    insertTable: (zoneId, tableId, callback) => {
        const query = 'INSERT INTO `tbl_table` (`id_table`, `zone_name`) VALUES (?, ?)';
        connection.query(query, [tableId, zoneId], (error, results) => {
            if (error) {
                return callback(error);
            }
            callback(null, results);
        });
    },

    getMaxNumList: (callback) => {
        const query = 'SELECT MAX(num_list) AS maxNumList FROM list_menu';

        connection.query(query, (error, results) => {
            if (error) {
                return callback(error, null);
            }
            const maxNumList = results[0].maxNumList || 0;
            callback(null, maxNumList);
        });
    },

    createOrder: (orderData, callback) => {
        const query = `
            INSERT INTO list_menu (num_list, tbl_menu_id, product_list, num_unit, product_price, price_all, Where_eat, id_table, zone_name)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            orderData.num_list,
            orderData.menu_id,
            orderData.product_list,
            orderData.num_unit,
            orderData.product_price,
            orderData.price_all,
            orderData.Where_eat,
            orderData.id_table,
            orderData.zone_name
        ];

        connection.query(query, values, (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results);
        });
    },

    getMaxNumBill: (callback) => {
        const query = 'SELECT MAX(id_bill) AS maxNumBill FROM tbl_bill';

        connection.query(query, (error, results) => {
            if (error) {
                return callback(error, null);
            }
            const maxNumBill = results[0].maxNumBill || 0;
            callback(null, maxNumBill);
        });
    },

    getListMenuId: (callback) => {
        const query = 'SELECT MAX(list_menu_id) AS maxListMenuId FROM list_menu_options';
        connection.query(query, (error, results) => {
            if (error) {
                return callback(error, null);
            }
            const maxListMenuId = results[0].maxListMenuId || 0;
            callback(null, maxListMenuId);
        });
    },

    createSpecialOption: (optionsData, callback) => {
        const query = `
            INSERT INTO list_menu_options (list_menu_id, id_menu_options, name_options, num_list, product_list, id_table, zone_name)
            VALUES ?
        `;

        const values = optionsData.map(option => [
            option.list_menu_id,
            option.option_id,
            option.option_name,
            option.num_list,
            option.product_list,
            option.id_table,
            option.zone_name
        ]);

        connection.query(query, [values], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results);
        });
    },

    updateOrder: (orderData, callback) => {
        console.log(orderData);
        if (typeof callback !== 'function') {
            throw new TypeError('Callback must be a function');
        }

        // Split num_list into an array if it's a comma-separated string
        const numListArray = orderData.num_list.split(',');

        const query = `
            UPDATE list_menu 
            SET status_bill = ?
            WHERE num_list IN (?) AND id_table = ? AND zone_name = ?
        `;

        const values = [
            orderData.status_bill || 'N', // Default to 'N' if status_bill is not provided
            numListArray,
            orderData.id_table,
            orderData.zone_name
        ];

        console.log(values);

        connection.query(query, values, (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results);
        });
    },

    deleteOptionsByOrderId: (orderId, callback) => {
        const query = 'DELETE FROM list_menu_options WHERE num_list = ?';
        connection.query(query, [orderId], (error, results) => {
            if (error) {
                return callback(error);
            }
            callback(null, results);
        });
    },

    deleteOrderById: (orderId, callback) => {
        const query = 'DELETE FROM list_menu WHERE num_list = ?';
        connection.query(query, [orderId], (error, results) => {
            if (error) {
                return callback(error);
            }
            callback(null, results);
        });
    },

    getBill: (callback) => {
        const query = 'SELECT * FROM check_bill';
        connection.query(query, (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results);
        });
    },
};