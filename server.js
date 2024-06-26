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
    res.render('index');
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard');
});

app.get('/login', (req, res) => {
    res.render('login');
});


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

// app.post('/add_employee', require('./routes/employee'));
// app.get('/employee_add', (req, res) => {
//     res.render('employee_add');
// });

// app.post('/edit_employee:id', require('./routes/employee'));

// app.get('/login', require('./routes/login'));
// // app.post('/loginUser', require('./routes/login'));

app.get('/test', require('./routes/test'));
app.post('/create_test', require('./routes/test'));

app.listen(3000, () => {
    console.log('Server has started with port 3000');
    console.log('http://localhost:3000');
});