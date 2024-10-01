const PromotionModel = require('../models/PromotionModel.js');

function generatePromoCode(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let promoCode = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        promoCode += characters[randomIndex];
    }
    return promoCode;
}

module.exports = {
	promotionView: (req, res) => {
		PromotionModel.getAllPromotions((err, promotions) => {
			if (err) {
				return res.status(500).json({
					message: 'Database error!',
					error: err
				});
			}
	
			// Format the dates to only include the date part
			promotions = promotions.map(promotion => {
				return {
					...promotion,
					start_date: new Date(promotion.start_date).toISOString().split('T')[0],
					last_day: new Date(promotion.last_day).toISOString().split('T')[0]
				};
			});
	
			// Filter promotions to show only one per sum_promotion_id
			const uniquePromotions = [];
			const seenSumPromotionIds = new Set();
	
			promotions.forEach(promotion => {
				if (!seenSumPromotionIds.has(promotion.sum_promotion_id)) {
					uniquePromotions.push(promotion);
					seenSumPromotionIds.add(promotion.sum_promotion_id);
				}
			});
	
			res.render('promotion', { promotions: uniquePromotions });
		});
	},

	addPromotionView: (req, res) => {
		res.render('add_promotion', {
			title: 'Add a new promotion',
		});
	},

	viewPromotionView: (req, res) => {
		const sumPromotionId = req.params.id;
		const page = parseInt(req.query.page) || 1;
		const limit = 10;
		const offset = (page - 1) * limit;
	
		PromotionModel.getPromotionsBySumIdWithPagination(sumPromotionId, limit, offset, (err, results, total) => {
			if (err) {
				console.error('Error fetching promotions:', err);
				res.status(500).send('Server Error');
				return;
			}
	
			const totalPages = Math.ceil(total / limit);
	
			res.render('view_promotion', {
				title: 'View promotion',
				promotions: results,
				currentPage: page,
				totalPages: totalPages
			});
		});
	},

	editPromotionView: (req, res) => {
		const id = req.params.id;
		PromotionModel.getPromotionById(id, (err, result) => {
			if (err) {
				return res.status(500).json({
					message: 'Database error!',
					error: err
				});
			}
			res.render('edit_promotion', {
				title: 'Edit promotion',
				promotion: result[0]
			});
		});
	},

	createPromotion: (req, res) => {
		const data = req.body;
	
		// Get the latest id_promotion and sum_promotion_id
		PromotionModel.getLatestPromotionId((err, latestId) => {
			if (err) {
				console.error('Error fetching latest id_promotion:', err);
				res.status(500).send('Server Error');
				return;
			}
	
			PromotionModel.getLatestSumPromotionId((err, latestSumId) => {
				if (err) {
					console.error('Error fetching latest sum_promotion_id:', err);
					res.status(500).send('Server Error');
					return;
				}
	
				// Generate new sum_promotion_id
				let newSumId;
				if (!latestSumId || typeof latestSumId !== 'string') {
					newSumId = 'P001';
				} else {
					const numericPart = parseInt(latestSumId.slice(1), 10) + 1;
					newSumId = 'P' + numericPart.toString().padStart(3, '0');
				}
	
				const numPromotions = parseInt(data.num_promotions, 10);
				const promotions = [];
	
				for (let i = 0; i < numPromotions; i++) {
					const promotionData = { ...data };
					promotionData.id_promotion = latestId + 1 + i;
					promotionData.sum_promotion_id = newSumId;
					promotionData.promo_code = generatePromoCode(8); // Length of promo code is 8 characters
					promotionData.status_promotion = 'N'; // Set status_promotion to 'N'
					promotions.push(promotionData);
				}
	
				console.log(promotions);
				PromotionModel.createPromotions(promotions, (err, result) => {
					if (err) {
						console.error('Error creating promotions:', err);
						res.status(500).send('Server Error');
						return;
					}
					
					res.redirect('/promotion');
				});
			});
		});
	},

	deletePromotion: (req, res) => {
		const id = req.params.id;
		PromotionModel.deletePromotion(id, (err, result) => {
			if (err) {
				return res.status(500).json({
					message: 'Database error!',
					error: err
				});
			}
			res.redirect('/promotion');
		});
	},

	updatePromotion: (req, res) => {
		const data = req.body;
		PromotionModel.updatePromotion(data, (err, result) => {
			if (err) {
				return res.status(500).json({
					message: 'Database error!',
					error: err
				});
			}
			res.redirect('/promotion');
		});
	},
};