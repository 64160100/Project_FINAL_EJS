const express = require('express');
const test = require('../controllers/testController'); // Fix the casing of the file name
const router = express.Router();

router.get('/test', test.viwetest);
router.post('/create_test', test.addtest);  

module.exports = router;