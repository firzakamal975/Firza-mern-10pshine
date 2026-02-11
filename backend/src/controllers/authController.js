const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');

// --- Nodemailer Transporter Setup ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 1. Signup Logic
exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({ 
            username, 
            email, 
            password: hashedPassword 
        });

        res.status(201).json({ 
            message: "User registered successfully", 
            user: { id: newUser.id, username: newUser.username } 
        });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 2. Login Logic (With 2FA Integration)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please provide email and password" });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // --- 2FA Check Logic ---
        if (user.twoFactorEnabled) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
            user.otpCode = otp;
            user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 Minutes validity
            await user.save();

            // Send OTP via Email
            await transporter.sendMail({
                to: user.email,
                from: process.env.EMAIL_USER,
                subject: '🛡️ Login Verification Code',
                html: `
                    <div style="font-family: sans-serif; text-align: center; padding: 20px;">
                        <h2>Security Verification</h2>
                        <p>Use the code below to complete your login:</p>
                        <h1 style="color: #4f46e5; font-size: 40px; letter-spacing: 10px;">${otp}</h1>
                        <p>This code expires in 10 minutes.</p>
                    </div>`
            });

            return res.status(200).json({ requires2FA: true, message: "OTP sent to email" });
        }

        // Normal Token Generation (If 2FA is disabled)
        const token = jwt.sign(
            { id: user.id }, 
            process.env.JWT_SECRET || 'secret_key_fallback', 
            { expiresIn: '1h' }
        );

        res.status(200).json({ 
            message: "Login successful", 
            token, 
            user: { 
                id: user.id, 
                username: user.username, 
                email: user.email,
                gender: user.gender,
                dob: user.dob,
                profilePic: user.profilePic,
                twoFactorEnabled: user.twoFactorEnabled 
            } 
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 3. Verify OTP Logic (New)
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ 
            where: { 
                email, 
                otpCode: otp, 
                otpExpires: { [Op.gt]: Date.now() } 
            } 
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // OTP clear kar dein verification ke baad
        user.otpCode = null;
        user.otpExpires = null;
        await user.save();

        const token = jwt.sign(
            { id: user.id }, 
            process.env.JWT_SECRET || 'secret_key_fallback', 
            { expiresIn: '1h' }
        );

        res.status(200).json({ 
            message: "OTP Verified! Login successful", 
            token, 
            user: { 
                id: user.id, 
                username: user.username, 
                email: user.email 
            } 
        });
    } catch (error) {
        res.status(500).json({ message: "Verification failed", error: error.message });
    }
};

// 4. Toggle 2FA Setting (New)
exports.toggle2FA = async (req, res) => {
    try {
        const userId = req.user.id; // Middleware se aayega
        const { twoFactorEnabled } = req.body;

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.twoFactorEnabled = twoFactorEnabled;
        await user.save();

        res.status(200).json({ 
            message: `2FA ${twoFactorEnabled ? 'Enabled' : 'Disabled'}`, 
            twoFactorEnabled: user.twoFactorEnabled 
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating 2FA" });
    }
};

// 5. Update Profile Logic
exports.updateProfile = async (req, res) => {
    try {
        const { username, gender, dob, newPassword } = req.body;
        const userId = req.user.id;

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (username) user.username = username;
        if (gender) user.gender = gender;
        if (dob) user.dob = dob;

        if (req.file) {
            user.profilePic = `/uploads/${req.file.filename}`;
        }

        if (newPassword && newPassword.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        await user.save();

        res.status(200).json({ 
            message: "Profile updated successfully!", 
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                gender: user.gender,
                dob: user.dob,
                profilePic: user.profilePic,
                twoFactorEnabled: user.twoFactorEnabled
            } 
        });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Error updating profile" });
    }
};

// 6. Forgot Password Logic
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User with this email does not exist' });
        }

        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 Hour
        await user.save();

        const resetUrl = `http://localhost:5173/reset-password/${token}`;

        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: 'Password Reset Request',
            html: `
                <p>You requested a password reset</p>
                <p>Click this <a href="${resetUrl}">link</a> to reset your password.</p>
                <p>This link will expire in 1 hour.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Reset link sent to email' });
    } catch (err) {
        console.error("Forgot Password Error:", err);
        res.status(500).json({ message: 'Error sending email' });
    }
};

// 7. Reset Password Logic
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { [Op.gt]: Date.now() }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Token is invalid or has expired' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error("Reset Password Error:", err);
        res.status(500).json({ message: 'Error resetting password' });
    }
};