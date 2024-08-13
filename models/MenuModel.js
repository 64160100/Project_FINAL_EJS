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

    getMenuFormbuying: function (callback) {
        connection.query('SELECT * FROM tbl_buying', (error, results) => {
            if (error) {
                return callback(error, null);
            }
            return callback(null, results);
        });
    },

    getMaxIdFoodRecipes: function(callback) {
        const sql = 'SELECT MAX(id_food_recipes) AS maxId FROM tbl_food_recipes';
        connection.query(sql, (error, results) => {
            if (error) {
                return callback(error, null);
            }
            const maxId = results[0].maxId || 0;
            callback(null, maxId);
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

    updateMenu: function (data, callback) {
        const query = 'UPDATE tbl_menu SET ? WHERE id_menu = ?';
        connection.query(query, [data, data.id_menu], (error, results) => {
            if (error) {
                return callback(error);
            }
            return callback(null, results);
        });
    },

    updateIngredient: function (ingredient, callback) {
        const query = `
            UPDATE tbl_food_recipes
            SET name_ingredient = ?, unit_quantity = ?, unit_id = ?
            WHERE id_food_recipes = ?
        `;
        const values = [
            ingredient.name_ingredient,
            ingredient.unit_quantity,
            ingredient.unit_id,
            ingredient.id_food_recipes
        ];
        connection.query(query, values, (error, result) => {
            if (error) {
                return callback(error, null);
            }
            return callback(null, result);
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
};