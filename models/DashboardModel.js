const connection = require('./ConMysql');

module.exports = {
    getAllRecords: (callback) => {
        const query = 'SELECT * FROM record_check_bill';
        connection.query(query, (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results);
        });
    },

    getTotalAmountByDay: (callback) => {
        const query = `
            SELECT DATE(created_at) as date, SUM(final_amount) as total_amount
            FROM record_check_bill
            GROUP BY DATE(created_at)
        `;
        connection.query(query, (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results);
        });
    },

    getTotalAmountByMonth: (callback) => {
        const query = `
            SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(final_amount) as total_amount
            FROM record_check_bill
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        `;
        connection.query(query, (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results);
        });
    },

    getTotalAmountByYear: (callback) => {
        const query = `
            SELECT YEAR(created_at) as year, SUM(final_amount) as total_amount
            FROM record_check_bill
            GROUP BY YEAR(created_at)
        `;
        connection.query(query, (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results);
        });
    },

    getTopMenuItems: (callback) => {
        const query = `
            SELECT num_list, product_list, SUM(num_nuit) as order_count
            FROM record_check_bill
            GROUP BY num_list, product_list
            ORDER BY order_count DESC
            LIMIT 10
        `;
        connection.query(query, (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results);
        });
    }

};
