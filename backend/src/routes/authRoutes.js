const express = require('express');
const { signup, login, forgotPassword, resetPassword } = require('../controllers/authController'); 
const router = express.Router();

router.post('/register', signup); 
router.post('/login', login);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;