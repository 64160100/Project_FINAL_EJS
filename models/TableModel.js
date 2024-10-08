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
                    remain: item.remain,
                    status: item.status,
                    category: item.menu_category,
                    type: item.menu_type,
                    menu_unit: item.menu_type
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

    getPromotions: (callback) => {
        const query = `
            SELECT id_promotion, price_discount, status_promotion, promo_code
            FROM tbl_promotion
        `;
        connection.query(query, (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results);
        });
    },

    getFoodRecipesMenu: function (callback) {
        connection.query('SELECT * FROM tbl_food_recipes', (error, results) => {
            if (error) {
                return callback(error);
            }
            // Ensure that all values are strings before escaping
            const sanitizedResults = results.map(row => {
                return {
                    ...row,
                    name_ingredient: String(row.name_ingredient),
                    unit_quantity: parseFloat(row.unit_quantity) // Ensure unit_quantity is a number
                };
            });
            callback(null, sanitizedResults);
        });
    },

    getWarehouse: function (callback) {
        connection.query('SELECT * FROM tbl_warehouse', (error, results) => {
            if (error) {
                return callback(error, null);
            }
            // Ensure that all values are strings before escaping
            const sanitizedResults = results.map(row => {
                return {
                    ...row,
                    name_product: String(row.name_product),
                    unit_quantity_all: parseFloat(row.unit_quantity_all) // Ensure unit_quantity_all is a number
                };
            });
            return callback(null, sanitizedResults);
        });
    },

    updateMenuRemainAndStatus: function (id, remain, status, callback) {
        const query = 'UPDATE tbl_menu SET remain = ?, status = ? WHERE id_menu = ?';
        connection.query(query, [remain, status, id], (error, results) => {
            if (error) {
                return callback(error, null);
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
                remain: item.remain, // Include the remain field
                status: item.status,
                category: item.menu_category,
                type: item.menu_type,
                menu_unit: item.menu_type,
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

    updateMenuRemain: (menuId, remain, callback) => {
        const query = 'UPDATE tbl_menu SET remain = ? WHERE id = ?';
        connection.query(query, [remain, menuId], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results);
        });
    },

    getMenuRemainById: function (itemId, callback) {
        const query = 'SELECT remain FROM tbl_menu WHERE id_menu = ?';
        connection.query(query, [menuId], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            if (results.length === 0) {
                return callback(new Error('Menu not found'), null);
            }
            callback(null, results[0].remain);
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

    getPriceDiscountPromotion: (callback) => {
        const query = `
          SELECT price_discount_promotion
          FROM list_menu
          LIMIT 1
        `;
    
        connection.query(query, (error, results) => {
          if (error) {
            console.error('Error fetching price discount promotion:', error);
            return callback(error);
          }
          const priceDiscountPromotion = results[0] ? parseFloat(results[0].price_discount_promotion) : 0;
          callback(null, priceDiscountPromotion);
        });
      },

    getMenuWithRemainAndStatus: function (callback) {
        const query = 'SELECT id_menu, name_product, price, menu_picture, remain, status, menu_category, menu_type FROM tbl_menu';
        connection.query(query, (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results);
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
            INSERT INTO list_menu (num_list, tbl_menu_id, product_list, num_unit, product_price, price_all, Where_eat, id_table, zone_name, status_bill)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            orderData.zone_name,
            'N' // Add status_bill value
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
            INSERT INTO list_menu_options (list_menu_id, id_menu_options, name_options, num_list, product_list, id_table, zone_name, options_price, num_unit, price_options_all)
            VALUES ?
        `;

        const values = optionsData.map(option => [
            option.list_menu_id,
            option.option_id,
            option.option_name,
            option.num_list,
            option.product_list,
            option.id_table,
            option.zone_name,
            option.options_price,
            option.num_unit,
            option.price_options_all
        ]);

        connection.query(query, [values], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results);
        });
    },

    getMaxFoodComparisonOptionsId: (callback) => {
        const query = 'SELECT MAX(id_food_comparison_options) AS maxId FROM tbl_food_comparison_options';
        connection.query(query, (error, results) => {
            if (error) {
                return callback(error);
            }
            const maxId = results[0].maxId || 0;
            callback(null, maxId);
        });
    },

    getMenuOptionsByIds: (optionIds, callback) => {
        const query = 'SELECT * FROM tbl_menu_options WHERE id_menu_options IN (?)';
        connection.query(query, [optionIds], (error, results) => {
            if (error) {
                return callback(error);
            }
            callback(null, results);
        });
    },

    createFoodComparisonOptions: (data, callback) => {
        const query = 'INSERT INTO tbl_food_comparison_options (id_food_comparison_options, list_menu_options, num_unit, name_ingredient_options, unit_quantity_options, unit_id_options, id_table, zone_name) VALUES ?';
        const values = data.map(item => [
            item.id_food_comparison_options,
            item.list_menu_options,
            item.num_unit,
            item.name_ingredient_options,
            item.unit_quantity_options,
            item.unit_id_options,
            item.id_table,
            item.zone_name
        ]);
        connection.query(query, [values], (error, results) => {
            if (error) {
                return callback(error);
            }
            callback(null, results);
        });
    },

    getData: (num_list, callback) => {
        const query = `
            SELECT num_list, tbl_menu_id, num_unit 
            FROM list_menu 
            WHERE num_list = ?
        `;

        connection.query(query, [num_list], (error, results) => {
            if (error) {
                console.error('Error executing query:', error);
                return callback(error, null);
            }
            callback(null, results);
        });
    },

    updateOrder: (orderData, callback) => {
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

        connection.query(query, values, (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results);
        });
    },

    returnWarehouseProducts: (ingredients, callback) => {
        const queries = ingredients.map(ingredient => {
            return {
                checkQuery: `
                    SELECT id_warehouse, tbl_buying_id, unit_quantity_all 
                    FROM tbl_warehouse 
                    WHERE name_product = ?
                    ORDER BY id_warehouse ASC
                `,
                updateWarehouseQuery: `
                    UPDATE tbl_warehouse 
                    SET unit_quantity_all = unit_quantity_all + ?
                    WHERE id_warehouse = ? AND tbl_buying_id = ?
                `,
                updateBuyingQuery: `
                    UPDATE tbl_buying 
                    SET unit_quantity = unit_quantity + ?
                    WHERE id_buying_list = ?
                `,
                values: [ingredient.unit_quantity, ingredient.name_ingredient]
            };
        });
    
        const executeQuery = (index) => {
            if (index >= queries.length) {
                return callback(null, { message: 'All updates executed successfully' });
            }
            const { checkQuery, updateWarehouseQuery, updateBuyingQuery, values } = queries[index];
            const [unitQuantity, nameIngredient] = values;
            
            connection.query(checkQuery, [nameIngredient], (checkError, checkResults) => {
                if (checkError) {
                    console.error('Error executing check query:', checkError);
                    return callback(checkError, null);
                }
    
                if (checkResults.length === 0) {
                    const error = new Error(`Product ${nameIngredient} not found`);
                    console.error(error.message);
                    return callback(error, null);
                }
    
                // Sort checkResults by tbl_buying_id in descending order
                checkResults.sort((a, b) => b.tbl_buying_id.localeCompare(a.tbl_buying_id));
    
                let remainingQuantity = unitQuantity;
                const updatePromises = [];
    
                for (const result of checkResults) {
                    const warehouseId = result.id_warehouse;
                    const buyingId = result.tbl_buying_id;
    
                    if (remainingQuantity <= 0) break;
    
                    const quantityToAdd = Math.min(remainingQuantity, unitQuantity);
                    remainingQuantity -= quantityToAdd;
    
                    updatePromises.push(new Promise((resolve, reject) => {
                        console.log('Adding', quantityToAdd, 'to warehouse with ID', warehouseId);
                        connection.query(updateWarehouseQuery, [quantityToAdd, warehouseId, buyingId], (updateError, updateResults) => {
                            if (updateError) {
                                console.error('Error executing update warehouse query:', updateError);
                                return reject(updateError);
                            }
                            console.log('Adding', quantityToAdd, 'to buying with ID', buyingId);
                            connection.query(updateBuyingQuery, [quantityToAdd, buyingId], (updateBuyingError, updateBuyingResults) => {
                                if (updateBuyingError) {
                                    console.error('Error executing update buying query:', updateBuyingError);
                                    return reject(updateBuyingError);
                                }
                                resolve();
                            });
                        });
                    }));
                }
    
                Promise.all(updatePromises)
                    .then(() => {
                        executeQuery(index + 1);
                    })
                    .catch(updateError => {
                        console.error('Error executing update queries:', updateError);
                        return callback(updateError, null);
                    });
            });
        };
    
        executeQuery(0);
    },

    deleteFoodComparisonOptionsByListMenuIds: (listMenuIds, callback) => {
        const query = 'DELETE FROM tbl_food_comparison_options WHERE list_menu_options IN (?)';
        connection.query(query, [listMenuIds], (error, results) => {
            if (error) {
                return callback(error);
            }
            callback(null, results);
        });
    },

    getFoodComparisonOptionsByOrderId: (orderId, callback) => {
        const query = 'SELECT * FROM tbl_food_comparison_options WHERE list_menu_options = ?';
        connection.query(query, [orderId], (error, results) => {
            if (error) {
                return callback(error);
            }
            callback(null, results);
        });
    },

    checkListMenuOptions(orderId, callback) {
        const query = `
            SELECT lmo.*
            FROM list_menu_options lmo
            WHERE lmo.num_list = ?
        `;

        connection.query(query, [orderId], (error, results) => {
            if (error) {
                console.error('Error fetching list_menu_options data:', error);
                return callback(error, null);
            }
            callback(null, results);
        });
    },

    getFoodComparisonOptionsByListMenuIds: (listMenuIds, callback) => {
        const query = 'SELECT * FROM tbl_food_comparison_options WHERE list_menu_options IN (?)';
        connection.query(query, [listMenuIds], (error, results) => {
            if (error) {
                return callback(error);
            }
            callback(null, results);
        });
    },

    getFoodComparisonByOrderId: (orderId, callback) => {
        const query = `
            SELECT * FROM tbl_food_comparison 
            WHERE num_list = ?
        `;

        connection.query(query, [orderId], (error, results) => {
            if (error) {
                console.error('Error fetching food comparison data:', error);
                return callback(error, null);
            }
            callback(null, results);
        });
    },

    deleteFoodComparisonOptionsByOrderId: (orderId, callback) => {
        const query = 'DELETE FROM tbl_food_comparison_options WHERE list_menu_options = ?';
        connection.query(query, [orderId], (error, results) => {
            if (error) {
                return callback(error);
            }
            callback(null, results);
        });
    },

    returnWarehouseOptions: (ingredients, callback) => {
        const queries = ingredients.map(ingredient => {
            return {
                query: `
                    UPDATE tbl_warehouse 
                    SET unit_quantity_all = unit_quantity_all + ?
                    WHERE name_product = ?
                `,
                values: [ingredient.unit_quantity, ingredient.name_ingredient]
            };
        });

        const executeQuery = (index) => {
            if (index >= queries.length) {
                return callback(null, { message: 'All updates executed successfully' });
            }

            const { query, values } = queries[index];
            connection.query(query, values, (error, results) => {
                if (error) {
                    return callback(error);
                }
                executeQuery(index + 1);
            });
        };

        executeQuery(0);
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

    updatePromotionStatus: (promo_code, status_promotion, callback) => {
        const query = 'UPDATE tbl_promotion SET status_promotion = ? WHERE promo_code = ?';
        const values = [status_promotion, promo_code];

        connection.query(query, values, (error, results) => {
            if (error) {
                console.error('Error updating promotion status:', error);
                return callback(error);
            }
            callback(null, results);
        });
    },

    deleteFoodComparisonByOrderId: (orderId, callback) => {
        const query = 'DELETE FROM tbl_food_comparison WHERE num_list = ?';
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

    getPromotionByCode: (promoCode, callback) => {
        const query = `
            SELECT id_promotion, price_discount, status_promotion, promo_code
            FROM tbl_promotion
            WHERE promo_code = ?
        `;
        connection.query(query, [promoCode], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results[0]);
        });
    },

    updatePriceDiscountPromotion: (discount, promo_code, callback) => {
        const query = `
          UPDATE list_menu
          SET price_discount_promotion = ?, promo_code = ?
        `;
    
        connection.query(query, [discount, promo_code], (error, results) => {
          if (error) {
            console.error('Error updating price_discount_promotion and promo_code:', error);
            return callback(error);
          }
          callback(null, results);
        });
      },

    getGroupedMenu: (callback) => {
        const query = `
                SELECT 
                    categories.name AS category_name, 
                    menu_items.id, 
                    menu_items.name, 
                    menu_items.price 
                FROM 
                    menu_items 
                JOIN 
                    categories 
                ON 
                    menu_items.category_id = categories.id
                ORDER BY 
                    categories.name, menu_items.name
            `;

        connection.query(query, (error, results) => {
            if (error) {
                return callback(error, null);
            }

            const groupedMenu = results.reduce((acc, item) => {
                if (!acc[item.category_name]) {
                    acc[item.category_name] = [];
                }
                acc[item.category_name].push({
                    id: item.id,
                    name: item.name,
                    price: item.price
                });
                return acc;
            }, {});

            callback(null, groupedMenu);
        });
    },


    getBill: (callback) => {
        const sqlQuery = `
            SELECT num_list, tbl_menu_id, product_list, num_unit, product_price, price_all, Where_eat, status_bill, id_table, zone_name
            FROM list_menu
            WHERE status_bill = 'Y';
        `;
        connection.query(sqlQuery, (error, results) => {
            if (error) {
                return callback(error, null);
            }
            console.log(results);
            callback(null, results);
        });
    },

    getZones: (callback) => {
        const query = 'SELECT * FROM tbl_zones';
        connection.query(query, (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results);
        });
    },

    getFoodRecipes: (tbl_menu_id, callback) => {
        const query = 'SELECT id_food_recipes, tbl_menu_id, name_ingredient, unit_quantity, unit_id FROM tbl_food_recipes WHERE tbl_menu_id = ?';
        connection.query(query, [tbl_menu_id], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results);
        });
    },

    getFoodComparisonByMenuId: (menuId, callback) => {
        const query = 'SELECT * FROM tbl_food_comparison WHERE id_food_comparison = ?';
        connection.query(query, [menuId], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results);
        });
    },

    getMaxFoodComparisonId: (callback) => {
        const query = 'SELECT MAX(id_food_comparison) AS maxFoodComparisonId FROM tbl_food_comparison';
        connection.query(query, (error, results) => {
            if (error) {
                return callback(error, null);
            }
            const maxFoodComparisonId = results[0].maxFoodComparisonId || 0;
            callback(null, maxFoodComparisonId);
        });
    },

    checkIngredientQuantities: (foodComparisonDataArray, callback) => {
        const insufficientIngredients = [];
        let processedCount = 0;

        // Iterate over each item in the foodComparisonDataArray
        foodComparisonDataArray.forEach((item) => {
            const query = 'SELECT unit_quantity_all FROM tbl_warehouse WHERE name_product = ?';
            connection.query(query, [item.name_ingredient_all], (error, results) => {
                if (error) {
                    return callback(error, null);
                }

                const availableQuantity = results.length > 0 ? results[0].unit_quantity_all : 0;
                if (availableQuantity < item.unit_quantity_all) {
                    insufficientIngredients.push({
                        ingredient: item.name_ingredient_all,
                        required: item.unit_quantity_all,
                        available: availableQuantity
                    });
                }

                // Check if all items have been processed
                processedCount++;
                if (processedCount === foodComparisonDataArray.length) {
                    callback(null, insufficientIngredients);
                }
            });
        });
    },

    saveFoodComparison: (foodComparisonDataArray, callback) => {
        const query = `
            INSERT INTO tbl_food_comparison 
            (id_food_comparison, num_list, tbl_menu_id_menu, num_unit, name_ingredient_all, unit_quantity_all, unit_id_all, id_table, zone_name) 
            VALUES ?
        `;

        const values = foodComparisonDataArray.map(data => [
            data.id_food_comparison,
            data.num_list,
            data.tbl_menu_id_menu,
            data.num_unit,
            data.name_ingredient_all,
            data.unit_quantity_all,
            data.unit_id_all,
            data.id_table,
            data.zone_name
        ]);

        connection.query(query, [values], (error, results) => {
            if (error) {
                console.error('Error executing query:', error);
                return callback(error, null);
            }
            callback(null, results);
        });
    },

    checkWarehouseProducts: (productName, callback) => {
        const query = `
            SELECT * FROM tbl_warehouse 
            WHERE name_product = ?
        `;

        connection.query(query, [productName], (error, results) => {
            if (error) {
                console.error('Error executing select query:', error);
                return callback(error, null);
            }
            callback(null, results);
        });
    },


    restoreWarehouseProducts: (ingredients, callback) => {
        const queries = ingredients.map(ingredient => {
            return {
                restoreQuery: `
                    UPDATE tbl_warehouse 
                    SET unit_quantity_all = unit_quantity_all + ?
                    WHERE name_product = ?
                `,
                values: [ingredient.unit_quantity, ingredient.name_ingredient]
            };
        });

        const executeQuery = (index) => {
            if (index >= queries.length) {
                return callback(null, { message: 'All restores executed successfully' });
            }

            const { restoreQuery, values } = queries[index];

            // Proceed with restore
            connection.query(restoreQuery, values, (restoreError, restoreResults) => {
                if (restoreError) {
                    console.error('Error executing restore query:', restoreError);
                    return callback(restoreError, null);
                }
                executeQuery(index + 1);
            });
        };

        executeQuery(0);
    },

    deleteSpecialOptionsByNumList: (num_list, callback) => {
        const query = 'DELETE FROM list_menu_options WHERE num_list = ?';
        connection.query(query, [num_list], (error, results) => {
            if (error) {
                return callback(error);
            }
            callback(null, results);
        });
    },


    updateWarehouseProducts: (ingredients, callback) => {
        const queries = ingredients.map(ingredient => {
            return {
                checkQuery: `
                    SELECT id_warehouse, tbl_buying_id, unit_quantity_all 
                    FROM tbl_warehouse 
                    WHERE name_product = ?
                `,
                updateWarehouseQuery: `
                    UPDATE tbl_warehouse 
                    SET unit_quantity_all = GREATEST(unit_quantity_all - ?, 0)
                    WHERE id_warehouse = ? AND tbl_buying_id = ?
                `,
                updateBuyingQuery: `
                    UPDATE tbl_buying 
                    SET unit_quantity = GREATEST(unit_quantity - ?, 0)
                    WHERE id_buying_list = ?
                `,
                restoreQuery: `
                    UPDATE tbl_warehouse 
                    SET unit_quantity_all = unit_quantity_all + ?
                    WHERE id_warehouse = ? AND tbl_buying_id = ?
                `,
                updateMenuStatusQuery: `
                    UPDATE tbl_menu 
                    SET status = 'OFF' 
                    WHERE name_product = ?
                `,
                values: [ingredient.unit_quantity, ingredient.name_ingredient]
            };
        });
    
        const executeQuery = (index) => {
            if (index >= queries.length) {
                return callback(null, { message: 'All updates executed successfully' });
            }
    
            const { checkQuery, updateWarehouseQuery, updateBuyingQuery, restoreQuery, updateMenuStatusQuery, values } = queries[index];
            const [unitQuantity, nameIngredient] = values;
    
            // Check current unit_quantity_all
            connection.query(checkQuery, [nameIngredient], (checkError, checkResults) => {
                if (checkError) {
                    console.error('Error executing check query:', checkError);
                    return callback(checkError, null);
                }
    
                if (checkResults.length === 0) {
                    const error = new Error(`Product ${nameIngredient} not found`);
                    console.error(error.message);
                    return callback(error, null);
                }
    
                let remainingQuantity = unitQuantity;
                const updatePromises = [];
    
                for (const result of checkResults) {
                    const currentQuantity = result.unit_quantity_all;
                    const warehouseId = result.id_warehouse;
                    const buyingId = result.tbl_buying_id;
    
                    if (remainingQuantity <= 0) break;
    
                    const quantityToDeduct = Math.min(currentQuantity, remainingQuantity);
                    remainingQuantity -= quantityToDeduct;
    
                    updatePromises.push(new Promise((resolve, reject) => {
                        connection.query(updateWarehouseQuery, [quantityToDeduct, warehouseId, buyingId], (updateError, updateResults) => {
                            if (updateError) {
                                console.error('Error executing update warehouse query:', updateError);
                                return reject(updateError);
                            }
                            connection.query(updateBuyingQuery, [quantityToDeduct, buyingId], (updateBuyingError, updateBuyingResults) => {
                                if (updateBuyingError) {
                                    console.error('Error executing update buying query:', updateBuyingError);
                                    return reject(updateBuyingError);
                                }
                                resolve();
                            });
                        });
                    }));
                }
    
                if (remainingQuantity > 0) {
                    const maxOrders = Math.floor(unitQuantity / remainingQuantity);
                    const error = new Error(`Insufficient quantity for product ${nameIngredient}. You can order up to ${maxOrders} more times.`);
                    console.error(error.message);
                    return callback(error, null);
                }
    
                Promise.all(updatePromises)
                    .then(() => {
                        // Check if any of the updated quantities are less than or equal to 0
                        connection.query(checkQuery, [nameIngredient], (checkErrorAfterUpdate, checkResultsAfterUpdate) => {
                            if (checkErrorAfterUpdate) {
                                console.error('Error executing check query after update:', checkErrorAfterUpdate);
                                return callback(checkErrorAfterUpdate, null);
                            }
    
                            const needsStatusUpdate = checkResultsAfterUpdate.some(result => result.unit_quantity_all <= 0);
    
                            if (needsStatusUpdate) {
                                // Update the status of the product in tbl_menu to 'OFF'
                                connection.query(updateMenuStatusQuery, [nameIngredient], (updateStatusError, updateStatusResults) => {
                                    if (updateStatusError) {
                                        console.error('Error updating menu status:', updateStatusError);
                                        return callback(updateStatusError, null);
                                    }
                                    executeQuery(index + 1);
                                });
                            } else {
                                executeQuery(index + 1);
                            }
                        });
                    })
                    .catch(updateError => {
                        console.error('Error executing update queries:', updateError);
                        return callback(updateError, null);
                    });
            });
        };
    
        executeQuery(0);
    },

    deleteFoodComparison: (id_food_comparison, callback) => {
        const query = 'DELETE FROM tbl_food_comparison WHERE id_food_comparison = ?';
        connection.query(query, [id_food_comparison], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            return callback(null, results);
        });
    },

    deleteFoodComparison: (id_food_comparison, callback) => {
        const query = 'DELETE FROM tbl_food_comparison WHERE id_food_comparison = ?';
        connection.query(query, [id_food_comparison], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            return callback(null, results);
        });
    },

    deleteOrder: (id_food_comparison, id_table, zone_name, callback) => {
        const deleteFoodComparisonQuery = 'DELETE FROM tbl_food_comparison WHERE id_food_comparison = ?';
        connection.query(deleteFoodComparisonQuery, [id_food_comparison], (error, results) => {
            console.log('Deleted food comparison:', results);
            if (error) {
                return callback(error, null);
            }

            const deleteListMenuQuery = 'DELETE FROM list_menu WHERE num_list = ? AND id_table = ? AND zone_name = ?';
            connection.query(deleteListMenuQuery, [id_food_comparison, id_table, zone_name], (error, results) => {
                if (error) {
                    return callback(error, null);
                }
                return callback(null, results);
            });
        });
    },

    updateMenu: (menuId, remain, status, callback) => {
        const query = 'UPDATE tbl_menu SET remain = ?, status = ? WHERE id_menu = ?';
        connection.query(query, [remain, status, menuId], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results);
        });
    },

    // In your model file (e.g., TableModel.js)

    getLatestRecordCheckBill: (callback) => {
        const query = 'SELECT MAX(id_record) AS maxIdRecord FROM record_check_bill';
        connection.query(query, (error, results) => {
            if (error) {
                return callback(error, null);
            }
            const maxIdRecord = results[0] ? results[0].maxIdRecord : null;
            callback(null, maxIdRecord);
        });
    },

    getLatestBillNumber: (callback) => {
        const query = 'SELECT MAX(bill_number) AS maxBillNumber FROM record_check_bill';
        connection.query(query, (error, results) => {
            if (error) {
                return callback(error, null);
            }
            const maxBillNumber = results[0] ? results[0].maxBillNumber : null;
            callback(null, maxBillNumber);
        });
    },

    getCheckBillMenuItems: (tableId, zoneName, callback) => {
        const query = 'SELECT * FROM list_menu WHERE id_table = ? AND zone_name = ?';
        connection.query(query, [tableId, zoneName], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results);
        });
    },

    insertCheckBill: (aggregatedData, callback) => {
        const query = `
          INSERT INTO record_check_bill (id_record, bill_number, num_list, product_list, total_amount, discount, final_amount, payment_method, id_table, zone_name, created_at, num_nuit)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            aggregatedData.id_record,
            aggregatedData.bill_number,
            aggregatedData.num_list.join(','),
            aggregatedData.product_list,
            aggregatedData.total_amount,
            aggregatedData.discount,
            aggregatedData.final_amount,
            aggregatedData.payment_method,
            aggregatedData.id_table,
            aggregatedData.zone_name,
            new Date(), // Add the current timestamp for created_at
            aggregatedData.num_nuit // Add num_nuit field
        ];

        connection.query(query, values, (error, results) => {
            if (error) {
                console.error('Error inserting record_check_bill:', error);
                return callback(error, null);
            }
            return callback(null, results);
        });
    },
};