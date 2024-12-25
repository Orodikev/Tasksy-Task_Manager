const express = require('express');
const { register, login } = require('../controllers/authController');
const router = express.Router();

// Authentication routes
router.post('/register', register); // Route to register a user
router.post('/login', login); // Route to log in a user

module.exports = router;
