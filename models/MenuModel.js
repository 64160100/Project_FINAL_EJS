const connection = require('./ConMysql');

module.exports = {

    getMenu: function (callback) {
        connection.query('SELECT * FROM tbl_menu', (error, results) => {
            if (error) {
                return callback(error, null);
            }
            return callback(null, results);
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

    getMenuById: function (menuId, callback) {
        const sql = 'SELECT * FROM tbl_menu WHERE id_menu = ?';
        connection.query(sql, [menuId], (error, results) => {
            if (error) {
                return callback(error, null);
            }
    
            if (results.length === 0) {
                return callback(null, null);
            }
    
            callback(null, results[0]);
        });
    },

    getFoodRecipes: function (menuId, callback) {
        const sql = 'SELECT * FROM tbl_food_recipes WHERE tbl_menu_id = ?';
        connection.query(sql, [menuId], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            return callback(null, results);
        });
    },

    getMenuOptions: function(menuId, callback) {
        const query = 'SELECT * FROM tbl_menu_options WHERE menu_id = ?';
        connection.query(query, [menuId], (err, results) => {
            if (err) {
                console.error('Error fetching menu options: ', err);
                return callback(err, null);
            }
            callback(null, results);
        });
    },

    getMenuFormbuying: function (callback) {
        connection.query('SELECT * FROM tbl_warehouse', (error, results) => {
            if (error) {
                return callback(error, null);
            }
            return callback(null, results);
        });
    },

    getMaxIdFoodRecipes: function(callback) {
        const sql = 'SELECT id_food_recipes FROM tbl_food_recipes ORDER BY id_food_recipes ASC';
        connection.query(sql, (error, results) => {
            if (error) {
                return callback(error, null);
            }
            let maxId = 0;
            for (let i = 0; i < results.length; i++) {
                if (results[i].id_food_recipes > maxId) {
                    maxId = results[i].id_food_recipes;
                }
            }
            callback(null, maxId);
        });
    },

    getIngredientsByMenuId: function (menuId, callback) {
        const query = 'SELECT * FROM tbl_food_recipes WHERE tbl_menu_id = ?';
        connection.query(query, [menuId], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            return callback(null, results);
        });
    },

    createIngredient: function (ingredient, callback) {
        const query = `
            INSERT INTO tbl_food_recipes (id_food_recipes, tbl_menu_id, name_ingredient, unit_quantity, unit_id)
            VALUES (?, ?, ?, ?, ?)
        `;
        const values = [
            ingredient.id_food_recipes,
            ingredient.tbl_menu_id,
            ingredient.name_ingredient,
            ingredient.unit_quantity,
            ingredient.unit_id
        ];
        connection.query(query, values, (error, result) => {
            if (error) {
                return callback(error, null);
            }
            return callback(null, result);
        });
    },

    deleteMenu: function (id, callback) {
        const query = 'DELETE FROM tbl_menu WHERE id_menu = ?';
        connection.query(query, [id], (error, results) => {
            if (error) {
                return callback(error);
            }
            return callback(null, results);
        });
    },

    deleteRelatedRecipes: function (menuId, foodRecipeId, callback) {
        const deleteRecipesQuery = 'DELETE FROM tbl_food_recipes WHERE tbl_menu_id = ? OR id_food_recipes = ?';
        connection.query(deleteRecipesQuery, [menuId, foodRecipeId], (error, result) => {
            if (error) {
                return callback(error, null);
            }
            return callback(null, result);
        });
    },

    deleteRelatedMenuOptions: function (menuId, callback) {
        const query = 'DELETE FROM tbl_menu_options WHERE menu_id = ?';
        connection.query(query, [menuId], (error, results) => {
            if (error) {
                console.error('Error deleting related menu options:', error);
                return callback(error);
            }
            callback(null, results);
        });
    },

    updateMenu: function (menu, callback) {
        const query = `
            UPDATE tbl_menu SET 
                name_product = ?, 
                menu_type = ?, 
                menu_category = ?, 
                price = ?, 
                menu_unit = ?, 
                status = ?, 
                menu_picture = ?, 
                remain = ? 
            WHERE id_menu = ?
        `;

        const values = [
            menu.name_product,
            menu.menu_type,
            menu.menu_category,
            menu.price,
            menu.menu_unit,
            menu.status, // Ensure this is "ON" or "OFF"
            menu.menu_picture,
            menu.remain,
            menu.id_menu
        ];

        connection.query(query, values, (error, results) => {
            if (error) {
                console.error('Error updating menu:', error);
                return callback(error);
            }
            callback(null, results);
        });
    },

    getIngredientByMenuIdAndNameIngredient: function (tbl_menu_id, name_ingredient, callback) {
        const query = `
            SELECT * FROM tbl_food_recipes
            WHERE tbl_menu_id = ? AND name_ingredient = ?
        `;
        const values = [tbl_menu_id, name_ingredient];
        connection.query(query, values, (error, results) => {
            if (error) {
                return callback(error, null);
            }
            return callback(null, results.length > 0 ? results[0] : null);
        });
    },

    insertIngredient: function (ingredient, callback) {
        const query = `
            INSERT INTO tbl_food_recipes (id_food_recipes, tbl_menu_id, name_ingredient, unit_quantity, unit_id)
            VALUES (?, ?, ?, ?, ?)
        `;
        const values = [
            ingredient.id_food_recipes,
            ingredient.tbl_menu_id,
            ingredient.name_ingredient,
            ingredient.unit_quantity,
            ingredient.unit_id
        ];
        console.log('Inserting ingredient:', values);
        connection.query(query, values, (error, result) => {
            if (error) {
                return callback(error, null);
            }
            return callback(null, result);
        });
    },

    updateIngredient: function (ingredient, callback) {
        const query = `
            INSERT INTO tbl_food_recipes (id_food_recipes, tbl_menu_id, name_ingredient, unit_quantity, unit_id)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                name_ingredient = VALUES(name_ingredient),
                unit_quantity = VALUES(unit_quantity),
                unit_id = VALUES(unit_id)
        `;
        const values = [
            ingredient.id_food_recipes, 
            ingredient.tbl_menu_id,
            ingredient.name_ingredient,
            ingredient.unit_quantity,
            ingredient.unit_id
        ];        
        connection.query(query, values, (error, result) => {
            if (error) {
                return callback(error, null);
            }
            return callback(null, result);
        });
    },

    deleteIngredient: function (id, callback) {
        const query = 'DELETE FROM tbl_food_recipes WHERE id_food_recipes = ?';
        connection.query(query, [id], (error, results) => {
            if (error) {
                return callback(error);
            }
            return callback(null, results);
        });
    },

    viewSettingType: function (callback) {
        connection.query('SELECT menu_type FROM menu_type', (error, results) => {
            if (error) {
                return callback(error, null);
            }
            return callback(null, results);
        });
    },

    viewSettingUnit: function (callback) {
        connection.query('SELECT menu_unit FROM menu_unit', (error, results) => {
            if (error) {
                return callback(error, null);
            }
            return callback(null, results);
        });
    },

    viewSettingCategory: function (callback) {
        connection.query('SELECT menu_category FROM menu_category', (error, results) => {
            if (error) {
                return callback(error, null);
            }
            return callback(null, results);
        });
    },

    createMenu: function (data, callback) {
        connection.query('INSERT INTO tbl_menu SET ?', data, (error, results) => {
            if (error) {
                return callback(error);
            }
            return callback(null, results);
        });
    },

    createSettingType: function (data, callback) {
        connection.query('INSERT INTO menu_type SET ?', data, (error, results) => {
            if (error) {
                return callback(error);
            }
            return callback(null, results);
        });
    },

    createSettingUnit: function (data, callback) {
        connection.query('INSERT INTO menu_unit SET ?', data, (error, results) => {
            if (error) {
                return callback(error);
            }
            return callback(null, results);
        });
    },

    createSettingCategory: function (data, callback) {
        connection.query('INSERT INTO menu_category SET ?', data, (error, results) => {
            if (error) {
                return callback(error);
            }
            return callback(null, results);
        });
    },

    deleteSettingCategory: function (id, callback) {
        const query = 'DELETE FROM menu_category WHERE menu_category = ?';
        connection.query(query, [id], (error, results) => {
            if (error) {
                return callback(error);
            }
            return callback(null, results);
        });
    },

    deleteSettingType: function (id, callback) {
        const query = 'DELETE FROM menu_type WHERE menu_type = ?';
        connection.query(query, [id], (error, results) => {
            if (error) {
                return callback(error);
            }
            return callback(null, results);
        });
    },

    deleteSettingUnit: function (id, callback) {
        const query = 'DELETE FROM menu_unit WHERE menu_unit = ?';
        connection.query(query, [id], (error, results) => {
            if (error) {
                return callback(error);
            }
            return callback(null, results);
        });
    },

    checkCategoryNameWithinMenu: (menuId, name_options, callback) => {
        const query = 'SELECT COUNT(*) AS count FROM tbl_menu_options WHERE menu_id = ? AND name_options = ?';
        connection.query(query, [menuId, name_options], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            const exists = results[0].count > 0;
            callback(null, exists);
        });
    },

    getMenuFormBuying: (callback) => {
        const query = 'SELECT * FROM tbl_buying';
        connection.query(query, (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results);
        });
    },

    getMaxIdMenuOptions: (callback) => {
        const query = 'SELECT MAX(id_menu_options) AS maxId FROM tbl_menu_options';
        connection.query(query, (error, results) => {
            if (error) {
                console.error('Database query error:', error);
                return callback(error, null);
            }
            if (!results || results.length === 0) {
                console.error('No results returned from the query');
                return callback(new Error('No results returned from the query'), null);
            }
            const maxId = results[0].maxId || 0; // If no records, maxId will be 0
            callback(null, maxId);
        });
    },
    
    insertMenuOptions: (menuOptions, callback) => {
        const query = 'INSERT INTO tbl_menu_options SET ?';
        connection.query(query, menuOptions, (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results);
        });
    }, 

    getMenuOptionsById: (menuOptionsId, callback) => {
        const query = 'SELECT id_menu_options, menu_id FROM tbl_menu_options WHERE menu_id = ?';
        connection.query(query, [menuOptionsId], (error, results) => {
            if (error) {
                console.error('Database query error:', error);
                return callback(error, null);
            }
            if (results.length === 0) {
                console.error('No menu options found with the given ID');
                return callback(null, null);
            }
            callback(null, results[0]);
        });
    },

    getMenuOptionsByMenuId: (menuId, callback) => {
        const query = 'SELECT * FROM tbl_menu_options WHERE menu_id = ?';
        connection.query(query, [menuId], (error, results) => {
            if (error) {
                console.error('Database query error:', error);
                return callback(error, null);
            }
            callback(null, results);
        });
    },

    deleteMenuOptions: (menuOptionsId, callback) => {
        // Query to get the menu_id before deleting the menu option
        const getMenuIdQuery = 'SELECT menu_id FROM tbl_menu_options WHERE id_menu_options = ?';
        connection.query(getMenuIdQuery, [menuOptionsId], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            if (results.length === 0) {
                return callback(new Error('Menu option not found'), null);
            }
    
            const menuId = results[0].menu_id;
    
            // Query to delete the menu option
            const deleteQuery = 'DELETE FROM tbl_menu_options WHERE id_menu_options = ?';
            connection.query(deleteQuery, [menuOptionsId], (deleteError, deleteResults) => {
                if (deleteError) {
                    return callback(deleteError, null);
                }
                callback(null, { results: deleteResults, menuId: menuId });
            });
        });
    },

    updateMenuOptions: (menuOptions, callback) => {
        const query = 'UPDATE tbl_menu_options SET ? WHERE id_menu_options = ?';
        connection.query(query, [menuOptions, menuOptions.id_menu_options], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results);
        });
    },

    updateIngredientNames: (menuId, oldName, newName, callback) => {
        const query = 'UPDATE tbl_food_recipes SET name_ingredient = ? WHERE tbl_menu_id = ? AND name_ingredient = ?';
        connection.query(query, [newName, menuId, oldName], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results);
        });
    },
};