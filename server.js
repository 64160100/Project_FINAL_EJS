const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const flash = require('express-flash');
const session = require('express-session');
const { spawn } = require('child_process');

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));
app.use(flash());

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));

// ===================== Python-Script ===================== //
app.get('/', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    const permissions = req.session.permissions;

    res.render('index', { user: req.session.user, permissions: permissions });
    
});

app.get('/404', (req, res) => {
    res.status(404).render('404_not_found'); // Adjust the render target to your 404 page template
});

// ===================== dashboard ===================== //
app.get('/dashboard', require('./routes/dashboard'));

// ===================== Login ===================== //
app.get('/login', require('./routes/login'));
app.get('/logout', require('./routes/login'));
app.post('/loginUser', require('./routes/login'))

// ===================== Employee ===================== //
app.get('/employee', require('./routes/employee'));
app.get('/add_employee', require('./routes/employee'));
app.get('/view_employee/:id', require('./routes/employee'));
app.get('/edit_employee/:id', require('./routes/employee'));
app.post('/create_employee', require('./routes/employee'));
app.post('/delete_employee/:id', require('./routes/employee'));
app.post('/update_employee', require('./routes/employee'));

// ===================== Permission ===================== //
app.get('/permission', require('./routes/permission'));
app.get('/add_permission', require('./routes/permission'));
app.get('/view_permission/:id', require('./routes/permission'));
app.get('/edit_permission/:id', require('./routes/permission'));
app.post('/create_permission', require('./routes/permission'));
app.post('/delete_permission/:id', require('./routes/permission'));
app.post('/update_permission', require('./routes/permission'));

// ===================== User ===================== //
app.get('/user', require('./routes/user'));
app.get('/edit_user/:id', require('./routes/user'));
app.get('/add_user_password/:id', require('./routes/user'));
app.post('/create_password/:id', require('./routes/user'));
app.post('/create_user/:id', require('./routes/user'));
app.post('/update-user-status', require('./routes/user'));

// ===================== Menu ===================== //
app.get('/menu', require('./routes/menu'));
app.get('/add_menu', require('./routes/menu'));
app.get('/view_menu/:id', require('./routes/menu'));
app.get('/edit_menu/:id', require('./routes/menu'));
app.post('/update_menu/:id', require('./routes/menu'));
app.post('/create_menu', require('./routes/menu'));
app.post('/delete_menu/:id', require('./routes/menu'));

app.get('/menu_options/:id', require('./routes/menu'));
app.get('/edit_menu_options/:id', require('./routes/menu'));
app.post('/create_menu_options/:id', require('./routes/menu'));
app.post('/delete_menu_options/:id', require('./routes/menu'));
app.post('/update_menu_options/:id', require('./routes/menu'));

app.get('/setting_menu_category', require('./routes/menu'));
app.post('/create_menu_category', require('./routes/menu'));
app.post('/delete_menu_category/:id', require('./routes/menu'));

app.get('/setting_menu_type', require('./routes/menu'));
app.post('/create_menu_type', require('./routes/menu'));
app.post('/delete_menu_type/:id', require('./routes/menu'));

app.get('/setting_menu_unit', require('./routes/menu'));
app.post('/create_menu_unit', require('./routes/menu'));
app.post('/delete_menu_unit/:id', require('./routes/menu'));

app.get('/setting_add_menu_category', require('./routes/menu'));
app.get('/setting_add_menu_type', require('./routes/menu'));
app.get('/setting_add_menu_unit', require('./routes/menu'));

// ===================== Table ===================== //
app.get('/table', require('./routes/table'));
app.get('/add_table', require('./routes/table'));
app.get('/view_zone/:id', require('./routes/table'));
app.get('/edit_table/:id', require('./routes/table'));
app.post('/create_table/:id', require('./routes/table'));
app.post('/create_area', require('./routes/table'));

app.post('/toggle_lock/:id', require('./routes/table'));
app.post('/delete_table/:id', require('./routes/table'));
app.post('/delete_zone/:id', require('./routes/table'));

app.get('/view_bill', require('./routes/table'));

app.get('/zone/:zone/table/:table/order_food', require('./routes/table'));
app.get('/zone/:zone/table/:table/customize/:id', require('./routes/table'));
app.post('/zone/:zone/table/:table/create_order', require('./routes/table'));
app.post('/zone/:zone/table/:table/update_order', require('./routes/table'));
app.post('/zone/:zone/table/:table/delete_order', require('./routes/table'));

app.post('/zone/:zone/table/:table/app_promotion', require('./routes/table'));

app.get('/zone/:zone/table/:table/view_checkbill', require('./routes/table'));
app.post('/zone/:zone/table/:table/create_checkbill', require('./routes/table'));

app.get('/zone/:zone/table/:table/menuindex', require('./routes/table'));

app.get('/zone/:zone/table/:table/order_food/auto_login', require('./routes/table'));

// ===================== Buying ===================== // 
app.get('/buying', require('./routes/buying'));
app.get('/add_buying', require('./routes/buying'));
app.get('/view_buying/:id', require('./routes/buying'));
app.post('/create_buying', require('./routes/buying'));
app.post('/delete_buying/:id', require('./routes/buying'));

app.get('/setting_type', require('./routes/buying'));
app.get('/setting_add_type', require('./routes/buying'));
app.post('/create_setting_type', require('./routes/buying'));
app.post('/delete_setting_type/:id', require('./routes/buying'));

app.get('/setting_unit', require('./routes/buying'));
app.get('/setting_add_unit', require('./routes/buying'));
app.post('/create_setting_unit', require('./routes/buying'));
app.post('/delete_setting_unit/:id', require('./routes/buying'));

app.get('/search-product', require('./routes/buying'));

app.post('/updateBuyingTime', require('./routes/buying'));

app.get('/warehouse', require('./routes/buying'));
app.get('/view_warehouse/:id', require('./routes/buying'));
app.post('/update_warehouse', require('./routes/buying'));

// ===================== Promotion ===================== //
app.get('/promotion', require('./routes/promotion'));
app.get('/view_promotion/:id', require('./routes/promotion'));
app.get('/add_promotion', require('./routes/promotion'));
app.post('/create_promotion', require('./routes/promotion'));
app.post('/delete_promotion/:id', require('./routes/promotion'));
app.post('/update_promotion', require('./routes/promotion'));

app.get('/test', (req, res) => {
    res.render('Test', { message: 'Test route is working!' });
});

app.listen(3000, () => {
    console.log('Server has started with port 3000');
    console.log('http://localhost:3000');
    startPythonScript();
});

function startPythonScript() {
    const pythonProcess = spawn('python', ['server.py']);
    console.log('Python script started');

}