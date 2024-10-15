const express = require('express');
const table = require('../controllers/tableController.js');
const router = express.Router();
const crypto = require('crypto');

// เก็บบัญชีชั่วคราวในหน่วยความจำ (หรือคุณสามารถใช้ฐานข้อมูล)
const temporaryAccounts = {};

const createTemporaryAccount = (zoneId, tableId) => {
    const tempUserId = crypto.randomBytes(16).toString('hex');
    const tempUser = {
        id: tempUserId,
        username: `temp_${zoneId}_${tableId}`,
        permissions: {
            dashboard: {
                type: 'dashboard',
                dashboard_read: 'N',
                dashboard_create: 'N',
                dashboard_update: 'N',
                dashboard_delete: 'N',
                dashboard_view: 'N'
            },
            employee: {
                type: 'employee',
                employee_read: 'N',
                employee_create: 'N',
                employee_update: 'N',
                employee_delete: 'N',
                employee_view: 'N'
            },
            menu: {
                type: 'menu',
                menu_read: 'N',
                menu_create: 'N',
                menu_update: 'N',
                menu_delete: 'N',
                menu_view: 'N'
            },
            buying: {
                type: 'buying',
                buying_read: 'N',
                buying_create: 'N',
                buying_update: 'N',
                buying_delete: 'N',
                buying_view: 'N'
            },
            promotion: {
                type: 'promotion',
                promotion_read: 'N',
                promotion_create: 'N',
                promotion_update: 'N',
                promotion_delete: 'N',
                promotion_view: 'Y'
            },
            table: {
                type: 'table',
                table_read: 'Y',
                table_create: 'Y',
                table_update: 'Y',
                table_delete: 'Y',
                table_view: 'N'
            }
        },
        expires: Date.now() + 24 * 60 * 60 * 1000 // บัญชีชั่วคราวมีอายุ 24 ชั่วโมง
    };

    // เก็บบัญชีชั่วคราวในหน่วยความจำ
    temporaryAccounts[tempUserId] = tempUser;

    return tempUser;
};

function isValidToken(zoneId, tableId, timestamp) {
    // ตรรกะการตรวจสอบโทเค็น
    const tokenAge = Date.now() - parseInt(timestamp, 10);
    return tokenAge < 24 * 60 * 60 * 1000; // ตัวอย่าง: โทเค็นมีอายุ 24 ชั่วโมง
}

function checkZoneAndTable(req, res, next) {
    const { zone, table } = req.params;
    if (req.session.zoneId === zone && req.session.tableId === table) {
        next();
    } else if (req.session.user && temporaryAccounts[req.session.user.id]) {
        res.status(404).render('404_Not_Found');
    } else {
        next();
    }
}

router.get('/table', table.tableView);
router.get('/add_table', table.addTableView);
router.get('/view_zone/:id', table.viewZone);

router.get('/edit_table/:id', table.editTable);
router.post('/create_table/:id', table.insertTable);
router.post('/create_area', table.createTable);

router.post('/toggle_lock/:id', table.toggleLockZone);
router.post('/delete_table/:id', table.deleteTable);
router.post('/delete_zone/:id', table.deleteZone);

router.get('/view_bill', table.viewBill);

router.get('/zone/:zone/table/:table/order_food', checkZoneAndTable, table.zoneOrderFood);
router.get('/zone/:zone/table/:table/customize/:id', checkZoneAndTable, table.zoneCustomize);
router.post('/zone/:zone/table/:table/create_order', checkZoneAndTable, table.createOrder);
router.post('/zone/:zone/table/:table/update_order', checkZoneAndTable, table.updateOrder);
router.post('/zone/:zone/table/:table/delete_order', checkZoneAndTable, table.deleteOrder);

router.post('/zone/:zone/table/:table/app_promotion', checkZoneAndTable, table.applyDiscount);

router.get('/zone/:zone/table/:table/view_checkbill', checkZoneAndTable, table.zoneViewCheckBill);
router.post('/zone/:zone/table/:table/create_checkbill', checkZoneAndTable, table.createCheckBill);

router.get('/zone/:zone/table/:table/menuindex', checkZoneAndTable, table.getIndex);

router.get('/zone/:zone/table/:table/order_food/auto_login', (req, res) => {
    const token = req.query.token;
    const [zoneId, tableId, timestamp] = Buffer.from(token, 'base64').toString('utf-8').split(':');

    // ตรวจสอบโทเค็น (เช่น ตรวจสอบว่าโทเค็นถูกต้องและไม่หมดอายุ)
    if (isValidToken(zoneId, tableId, timestamp)) {
        // สร้างบัญชีชั่วคราว
        const tempUser = createTemporaryAccount(zoneId, tableId);

        req.session.user = tempUser;
        req.session.zoneId = zoneId;
        req.session.tableId = tableId;
        req.session.permissions = tempUser.permissions; // ตั้งค่า permissions ใน session
        req.session.loggedIn = true;

        // เปลี่ยนเส้นทางไปยังหน้าสั่งอาหาร
        res.redirect(`/zone/${zoneId}/table/${tableId}/order_food`);
    } else {
        res.status(400).send('Invalid or expired token');
    }
});

router.get('/404', checkZoneAndTable, (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    const permissions = req.session.permissions;
    console.log('TOT',permissions);
    res.status(404).render('404_not_found', { permissions });
});

module.exports = router;