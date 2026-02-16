const express = require('express');
const { signup, login, verifyOTP, toggle2FA, forgotPassword, resetPassword, updateProfile, deleteProfile } = require('../controllers/authController'); 
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

router.post('/register', signup); 
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.put('/toggle-2fa', authMiddleware, toggle2FA);
router.put('/update-profile', authMiddleware, upload.single('profilePic'), updateProfile);
router.delete('/delete-account', authMiddleware, deleteProfile);

module.exports = router;