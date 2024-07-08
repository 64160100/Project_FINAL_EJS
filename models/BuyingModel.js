const connection = require('./ConMysql');

module.exports = {
    createBuying: (buying) => {
        return new Promise((resolve, reject) => {
            connection.query('INSERT INTO buying SET ?', buying, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
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
    }
};