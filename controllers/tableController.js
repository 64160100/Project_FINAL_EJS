const TableModel = require('../models/TableModel.js');

module.exports = {
    tableView: (req, res) => {
		res.render('table', {
			title: 'table',
		});
	},
};