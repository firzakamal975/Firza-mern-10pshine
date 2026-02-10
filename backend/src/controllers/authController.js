const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');

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

// 2. Login Logic
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

        const token = jwt.sign(
            { id: user.id }, 
            process.env.JWT_SECRET || 'secret_key_fallback', 
            { expiresIn: '1h' }
        );

        res.status(200).json({ 
            message: "Login successful", 
            token, 
            user: { id: user.id, username: user.username } 
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 3. Forgot Password Logic
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

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

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

// 4. Reset Password Logic
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