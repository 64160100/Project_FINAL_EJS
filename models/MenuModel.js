const connection = require('./ConMysql');

module.exports = {

    getMenu: function (callback) {
        connection.query('SELECT * FROM tbl_menu', (error, results) => {
            if (error) {
                return callback(error, null);
            }
            return callback(null, results); 
        });
    }
};