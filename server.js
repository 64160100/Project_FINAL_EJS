const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const flash = require('express-flash');
const session = require('express-session');
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


app.get('/', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    const permissions = req.session.permissions;
    res.render('index', { user: req.session.user, permissions: permissions });
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

app.get('/login' , require('./routes/login'));
app.get('/logout' , require('./routes/login'));
app.post('/loginUser' , require('./routes/login'))

app.get('/employee', require('./routes/employee'));
app.get('/add_employee', require('./routes/employee'));
app.get('/view_employee/:id', require('./routes/employee'));
app.get('/edit_employee/:id', require('./routes/employee'));
app.post('/create_employee', require('./routes/employee'));
app.post('/delete_employee/:id', require('./routes/employee'));
app.post('/update_employee', require('./routes/employee'));

app.get('/permission', require('./routes/permission'));
app.get('/add_permission', require('./routes/permission'));
app.get('/view_permission/:id', require('./routes/permission'));
app.get('/edit_permission/:id', require('./routes/permission'));
app.post('/create_permission', require('./routes/permission'));
app.post('/delete_permission/:id', require('./routes/permission'));
app.post('/update_permission', require('./routes/permission'));

app.get('/user', require('./routes/user'));
app.get('/edit_user/:id', require('./routes/user'));
app.get('/add_user_password/:id', require('./routes/user'));
app.post('/create_password/:id', require('./routes/user'));
app.post('/create_user/:id', require('./routes/user'));


// app.post('/add_employee', require('./routes/employee'));
// app.get('/employee_add', (req, res) => {
//     res.render('employee_add');
// });

// app.post('/edit_employee:id', require('./routes/employee'));

// app.get('/login', require('./routes/login'));
// // app.post('/loginUser', require('./routes/login'));

app.get('/404', (req, res) => {
    res.status(404).render('404_not_found'); // Adjust the render target to your 404 page template
});


app.listen(3000, () => {
    console.log('Server has started with port 3000');
    console.log('http://localhost:3000');
});