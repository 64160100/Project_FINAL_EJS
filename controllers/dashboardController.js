const DashboardModel = require('../models/DashboardModel.js');
const moment = require('moment-timezone');

module.exports = {
    deshboardview: function (req, res) {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        const permissions = req.session.permissions;
        // Check if the user has the required permissions
        if (!permissions || permissions.dashboard.dashboard_read !== 'Y') {
            return res.redirect('/404');
        }
    
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
    
                // ดึงข้อมูลจาก tbl_warehouse
                DashboardModel.getWarehouseData((error, warehouseData) => {
                    if (error) {
                        console.error('Error fetching warehouse data:', error);
                        return res.status(500).send('Error fetching warehouse data');
                    }
                
                    // รวมข้อมูลที่มี id_warehouse เดียวกัน
                    const combinedWarehouseData = warehouseData.reduce((acc, item) => {
                        // Ensure unit_quantity_all is treated as a number for summation
                        item.unit_quantity_all = parseFloat(item.unit_quantity_all) || 0;
                
                        // If the id_warehouse already exists, sum up the unit_quantity_all and update unit_quantity_max if necessary
                        if (acc[item.id_warehouse]) {
                            acc[item.id_warehouse].unit_quantity_all += item.unit_quantity_all;
                            if (item.unit_quantity_max !== 'null') {
                                acc[item.id_warehouse].unit_quantity_max = item.unit_quantity_max;
                            }
                        } else {
                            // Otherwise, add the entry to the accumulator
                            acc[item.id_warehouse] = { ...item };
                        }
                        return acc;
                    }, {});
                
                    // Convert the aggregated results back to an array
                    const combinedWarehouseDataArray = Object.values(combinedWarehouseData);
                
                    // Sort the combined data
                    combinedWarehouseDataArray.sort((a, b) => {
                        const idA = parseInt(a.id_warehouse.replace('T', ''), 10);
                        const idB = parseInt(b.id_warehouse.replace('T', ''), 10);
                        return idA - idB;
                    });
                
                    console.log('combinedWarehouseData:', combinedWarehouseDataArray);
                    
                    res.render('dashboard', {
                        allRecords: uniqueRecords,
                        dailyTotals: dailyTotals,
                        monthlyTotals: monthlyTotals,
                        yearlyTotals: yearlyTotals,
                        topMenuItems: combinedTopMenuItems,
                        totalSales: totalSales,
                        netSales: netSales,
                        totalBills: totalBills,
                        averageSalesPerBill: averageSalesPerBill,
                        warehouseData: combinedWarehouseDataArray, // เพิ่มข้อมูล warehouse
                        user: req.session.user,
                        permissions: permissions
                    });
                });
            });
        });
    }
};