const express = require('express');
const { 
    signup, 
    login, 
    verifyOTP,      // Naya function add kiya
    toggle2FA,      // Naya function add kiya
    forgotPassword, 
    resetPassword, 
    updateProfile 
} = require('../controllers/authController'); 
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// --- Public Routes ---
router.post('/register', signup); 
router.post('/login', login);
router.post('/verify-otp', verifyOTP); // Login modal ke liye OTP verification
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// --- Protected Routes ---
// Settings mein 2FA on/off karne ke liye
router.put('/toggle-2fa', authMiddleware, toggle2FA);

// Profile update handles text and profile picture upload
router.put('/update-profile', authMiddleware, upload.single('profilePic'), updateProfile);

module.exports = router;