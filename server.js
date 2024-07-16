const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const flash = require('express-flash');
const session = require('express-session');
const { spawn } = require('child_process');
const cors = require('cors');
const ejs = require('ejs');

app.use(session({
    secret: 'keyboard',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60*60*1000 }
}));
app.use(flash());

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs'); 
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

app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    const permissions = req.session.permissions;
    
    if (!permissions || permissions.dashboard.dashboard_read !== 'Y') {
        res.redirect('/404');
    } else {
    res.render('dashboard', { user: req.session.user, permissions: permissions });
    }
});

// ===================== Login ===================== //
app.get('/login' , require('./routes/login'));
app.get('/logout' , require('./routes/login'));
app.post('/loginUser' , require('./routes/login'))

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

// ===================== Menu ===================== //
app.get('/menu', require('./routes/menu'));

// ===================== Table ===================== //
app.get('/table', require('./routes/table'));

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

app.post('/updateBuyingTime', require('./routes/buying'));

app.get('/warehouse', require('./routes/buying'));
app.get('/view_warehouse/:id', require('./routes/buying'));
app.post('/update_warehouse', require('./routes/buying'));

// ===================== Promotion ===================== //
app.get('/promotion', require('./routes/promotion'));

app.listen(3000, () => {
    console.log('Server has started with port 3000');
    console.log('http://localhost:3000');
    startPythonScript();
});

function startPythonScript() {
    const pythonProcess = spawn('python', ['server.py']);
    console.log('Python script started');

}