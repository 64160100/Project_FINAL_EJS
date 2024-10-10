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

    getTotalAmountByMonth: function(callback) {
        const query = `
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') AS month, 
                SUM(final_amount) AS total_amount 
            FROM 
                record_check_bill 
            GROUP BY 
                month
        `;
        
        connection.query(query, (error, results) => {
            console.log(results);
            if (error) {
                return callback(error, null);
            }
            const monthlyTotals = results.reduce((acc, row) => {
                acc[row.month] = row.total_amount;
                return acc;
            }, {});
            callback(null, monthlyTotals);
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
    },

    resetDailyTotals: function(callback) {
        const query = 'UPDATE daily_totals SET netSales = 0, totalSales = 0 WHERE date = CURDATE()';

        connection.query(query, (error, results) => {
            if (error) {
                console.error('Error resetting daily totals:', error);
                return callback(error);
            }
            callback(null, results);
        });
    }

};
