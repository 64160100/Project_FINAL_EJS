const express = require('express');
const LoginView = require('../controllers/loginController.js');
const router = express.Router();

router.get('/login', LoginView.loginView);
router.get('/logout', LoginView.logoutView);
router.post('/loginUser', LoginView.loginStage);

module.exports = router;
