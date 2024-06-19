const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const flash = require('express-flash');
const session = require('express-session');
// const cors = require('cors');

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
    res.render('home');
});

app.get('/login', require('./routes/login'));
app.post('/loginUser', require('./routes/login'));

app.get('/home', (req, res) => {

  });


app.listen(3000, () => {
    console.log('Server has started with port 3000');
    console.log('http://localhost:3000');
});