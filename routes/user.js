const express = require('express');
const user = require('../controllers/userController.js'); // Fix the casing of the file name
const router = express.Router();

router.get('/user', user.allUser);
router.get('/edit_user/:id', user.editUser);
router.get('/add_user_password/:id', user.addUserPassword);
router.post('/create_password/:id', user.createPassword);
router.post('/create_user/:id', user.createUser);
router.post('/update-user-status', user.updateUserStatus);

module.exports = router;