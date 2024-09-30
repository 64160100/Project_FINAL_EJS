const DashboardModel = require('../models/DashboardModel.js');

module.exports = {

    deshboardview: function (req, res) {
        DashboardModel.getAllRecords((error, allRecords) => {
            if (error) {
                console.error('Error fetching data from record_check_bill:', error);
                return res.status(500).send('Error fetching data from record_check_bill');
            }
    
            DashboardModel.getTotalAmountByDay((error, dailyTotals) => {
                if (error) {
                    console.error('Error fetching daily totals:', error);
                    return res.status(500).send('Error fetching daily totals');
                }
    
                DashboardModel.getTotalAmountByMonth((error, monthlyTotals) => {
                    if (error) {
                        console.error('Error fetching monthly totals:', error);
                        return res.status(500).send('Error fetching monthly totals');
                    }
    
                    DashboardModel.getTotalAmountByYear((error, yearlyTotals) => {
                        if (error) {
                            console.error('Error fetching yearly totals:', error);
                            return res.status(500).send('Error fetching yearly totals');
                        }
    
                        DashboardModel.getTopMenuItems((error, topMenuItems) => {
                            if (error) {
                                console.error('Error fetching top menu items:', error);
                                return res.status(500).send('Error fetching top menu items');
                            }
    
                            // รวม order_count ของ product_list ที่ซ้ำกัน
                            const combinedTopMenuItems = Object.values(topMenuItems.reduce((acc, item) => {
                                if (!acc[item.product_list]) {
                                    acc[item.product_list] = { ...item };
                                } else {
                                    acc[item.product_list].order_count += item.order_count;
                                }
                                return acc;
                            }, {}));
    
                            const totalSales = allRecords.reduce((sum, record) => sum + record.total_amount, 0);
                            const netSales = allRecords.reduce((sum, record) => sum + record.final_amount, 0);
                            const totalBills = allRecords.length;
                            const averageSalesPerBill = (netSales / totalBills).toFixed(2);
                            
                            console.log('allRecords:', combinedTopMenuItems);
                            // Render the dashboard view with the fetched data
                            res.render('dashboard', {
                                allRecords: allRecords,
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
                });
            });
        });
    }

};