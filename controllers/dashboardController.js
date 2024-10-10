const DashboardModel = require('../models/DashboardModel.js');
const moment = require('moment-timezone');

module.exports = {
    deshboardview: function (req, res) {
        DashboardModel.getAllRecords((error, allRecords) => {
            if (error) {
                console.error('Error fetching data from record_check_bill:', error);
                return res.status(500).send('Error fetching data from record_check_bill');
            }

            const uniqueRecords = Object.values(allRecords.reduce((acc, record) => {
                if (!acc[record.bill_number]) {
                    acc[record.bill_number] = record;
                }
                return acc;
            }, {}));

            const dailyTotals = uniqueRecords.reduce((acc, record) => {
                // Convert created_at to Thai time
                const date = moment(record.created_at).tz('Asia/Bangkok').format('YYYY-MM-DD');
                if (!acc[date]) {
                    acc[date] = 0;
                }
                acc[date] += record.final_amount;
                return acc;
            }, {});

            // Group records by month and sum the final_amount for each month
            const monthlyTotals = uniqueRecords.reduce((acc, record) => {
                // Convert created_at to Thai time and format as YYYY-MM
                const month = moment(record.created_at).tz('Asia/Bangkok').format('YYYY-MM');
                if (!acc[month]) {
                    acc[month] = 0;
                }
                acc[month] += record.final_amount;
                return acc;
            }, {});

            // Group records by year and sum the final_amount for each year
            const yearlyTotals = uniqueRecords.reduce((acc, record) => {
                // Convert created_at to Thai time and format as YYYY
                const year = moment(record.created_at).tz('Asia/Bangkok').format('YYYY');
                if (!acc[year]) {
                    acc[year] = 0;
                }
                acc[year] += record.final_amount;
                return acc;
            }, {});

            DashboardModel.getTopMenuItems((error, topMenuItems) => {
                if (error) {
                    console.error('Error fetching top menu items:', error);
                    return res.status(500).send('Error fetching top menu items');
                }

                const combinedTopMenuItems = Object.values(topMenuItems.reduce((acc, item) => {
                    if (!acc[item.product_list]) {
                        acc[item.product_list] = { ...item };
                    } else {
                        acc[item.product_list].order_count += item.order_count;
                    }
                    return acc;
                }, {}));

                const totalSales = uniqueRecords.reduce((sum, record) => sum + record.total_amount, 0);
                const netSales = uniqueRecords.reduce((sum, record) => sum + record.final_amount, 0);
                const totalBills = uniqueRecords.length;
                const averageSalesPerBill = (netSales / totalBills).toFixed(2);

                console.log('uniqueRecords:', totalSales);

                res.render('dashboard', {
                    allRecords: uniqueRecords,
                    dailyTotals: dailyTotals,
                    monthlyTotals: monthlyTotals,
                    yearlyTotals: yearlyTotals,
                    topMenuItems: combinedTopMenuItems,
                    totalSales: totalSales,
                    netSales: netSales,
                    totalBills: totalBills,
                    averageSalesPerBill: averageSalesPerBill
                });
            });
        });
    }
};