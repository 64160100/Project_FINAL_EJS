const connection = require('./ConMysql');

module.exports = {
    
    getAllPromotions: (callback) => {
        const query = 'SELECT * FROM tbl_promotion'; // Adjust the query as necessary
        connection.query(query, (err, results) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });
    },

    getPromotionsBySumIdWithPagination: (sumPromotionId, limit, offset, callback) => {
        const query = 'SELECT * FROM tbl_promotion WHERE sum_promotion_id = ? LIMIT ? OFFSET ?';
        connection.query(query, [sumPromotionId, limit, offset], (err, results) => {
            if (err) {
                return callback(err, null, null);
            }

            const countQuery = 'SELECT COUNT(*) AS total FROM tbl_promotion WHERE sum_promotion_id = ?';
            connection.query(countQuery, [sumPromotionId], (err, countResult) => {
                if (err) {
                    return callback(err, null, null);
                }

                const total = countResult[0].total;
                callback(null, results, total);
            });
        });
    },

    getLatestPromotionId: (callback) => {
        const query = 'SELECT MAX(id_promotion) AS latestId FROM tbl_promotion';
    
        connection.query(query, (error, results) => {
            if (error) {
                return callback(error, null);
            }
            const latestId = results[0].latestId || 0; // If no records, start from 0
            callback(null, latestId);
        });
    },

    getLatestSumPromotionId: (callback) => {
        const query = 'SELECT MAX(sum_promotion_id) AS latestSumId FROM tbl_promotion';
        connection.query(query, (err, results) => {
            if (err) {
                return callback(err, null);
            }
            const latestSumId = results[0].latestSumId;
            callback(null, latestSumId);
        });
    },

    createPromotions: (promotions, callback) => {
        const query = 'INSERT INTO tbl_promotion (id_promotion, sum_promotion_id, promo_code, name_promotion, price_discount, status_promotion, num_promotions, start_date, last_day) VALUES ?';
        const values = promotions.map(promotion => [
            promotion.id_promotion,
            promotion.sum_promotion_id,
            promotion.promo_code,
            promotion.name_promotion,
            promotion.price_discount,
            promotion.status_promotion,
            promotion.num_promotions,
            promotion.start_date,
            promotion.last_day
        ]);
        connection.query(query, [values], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });
    },


    updatePromotion: (data, callback) => {
        connection.query('UPDATE tbl_promotion SET ? WHERE id = ?', [data, data.id], callback);
    },

    deletePromotionById: (promotionId, callback) => {
        const query = 'DELETE FROM tbl_promotion WHERE sum_promotion_id = ?';
    
        connection.query(query, [promotionId], (error, results) => {
          if (error) {
            console.error('Error deleting promotion:', error);
            return callback(error);
          }
          callback(null, results);
        });
      },


};