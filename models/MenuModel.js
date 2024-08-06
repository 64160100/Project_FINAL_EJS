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

    getMenuFormbuying: function (callback) {
        connection.query('SELECT * FROM tbl_buying', (error, results) => {
            if (error) {
                return callback(error, null);
            }
            return callback(null, results);
        });
    },

    createMenuHasBuying: function (data, callback) {
        connection.query('INSERT INTO tbl_buying_menu SET ?', data, (error, results) => {
            if (error) {
                return callback(error);
            }
            return callback(null, results);
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