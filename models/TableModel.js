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
                }));
                return callback(null, menu);
            }
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
    
            // จัดกลุ่มข้อมูลใน JavaScript
            const groupedResults = results.reduce((acc, curr) => {
                const key = curr.name_options;
                if (!acc[key]) {
                    acc[key] = {
                        name_options: curr.name_options,
                        price: curr.price, // แสดงราคาที่มากที่สุด
                        ingredients: [],
                        quantities: [], // แยก total_quantity ออกมาเป็น array
                        unit_ids: [] // แยก unit_id_menu_options ออกมาเป็น array
                    };
                } else {
                    // อัปเดตราคาให้เป็นราคาที่มากที่สุด
                    acc[key].price = Math.max(acc[key].price, curr.price);
                }
                acc[key].ingredients.push(curr.name_ingredient_menu_options);
                acc[key].quantities.push(curr.unit_quantity_menu_options); // เพิ่ม quantity ลงใน array
                acc[key].unit_ids.push(curr.unit_id_menu_options); // เพิ่ม unit_id ลงใน array
                return acc;
            }, {});
    
            // แปลง Object กลับเป็น Array
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
    }

};