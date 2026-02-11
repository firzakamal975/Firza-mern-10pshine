const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) return res.status(400).json({ message: "All fields are required" });
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ message: "User already exists" });
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ username, email, password: hashedPassword });
        res.status(201).json({ message: "User registered", user: { id: newUser.id, username: newUser.username } });
    } catch (error) {
        res.status(500).json({ message: "Error", error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: "User not found" });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        if (user.twoFactorEnabled) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            user.otpCode = otp;
            user.otpExpires = Date.now() + 10 * 60 * 1000;
            await user.save();
            await transporter.sendMail({
                to: user.email,
                from: process.env.EMAIL_USER,
                subject: '🛡️ Login Verification Code',
                html: `<h1>${otp}</h1>`
            });
            return res.status(200).json({ requires2FA: true });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret_key_fallback', { expiresIn: '1h' });
        res.status(200).json({ token, user });
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ where: { email, otpCode: otp, otpExpires: { [Op.gt]: Date.now() } } });
        if (!user) return res.status(400).json({ message: "Invalid OTP" });
        user.otpCode = null;
        user.otpExpires = null;
        await user.save();
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret_key_fallback', { expiresIn: '1h' });
        res.status(200).json({ token, user });
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
};

exports.toggle2FA = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        user.twoFactorEnabled = req.body.twoFactorEnabled;
        await user.save();
        res.status(200).json({ twoFactorEnabled: user.twoFactorEnabled });
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { username, gender, dob, newPassword } = req.body;
        const user = await User.findByPk(req.user.id);
        if (username) user.username = username;
        if (gender) user.gender = gender;
        if (dob) user.dob = dob;
        if (req.file) user.profilePic = `/uploads/${req.file.filename}`;
        if (newPassword) user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ where: { email: req.body.email } });
        if (!user) return res.status(404).json({ message: "Not found" });
        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();
        await transporter.sendMail({
            to: user.email,
            subject: 'Reset Password',
            html: `<a href="http://localhost:5173/reset-password/${token}">Reset</a>`
        });
        res.status(200).json({ message: "Sent" });
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const user = await User.findOne({ where: { resetPasswordToken: req.params.token, resetPasswordExpires: { [Op.gt]: Date.now() } } });
        if (!user) return res.status(400).json({ message: "Expired" });
        user.password = await bcrypt.hash(req.body.password, 10);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();
        res.status(200).json({ message: "Success" });
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
};

exports.deleteProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.profilePic) {
            const filePath = path.join(__dirname, '../../', user.profilePic);
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (err) {
                    console.log("File already gone or error");
                }
            }
        }

        await user.destroy();
        res.status(200).json({ message: "Deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error", error: error.message });
    }
};