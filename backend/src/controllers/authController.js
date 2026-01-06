const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Signup Logic
exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({ username, email, password: hashedPassword });
        res.status(201).json({ message: "User registered successfully", user: { id: newUser.id, username } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. Login Logic (Updated)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // User ko email se find karein
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Password compare karein
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // JWT Token generate karein
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ 
            message: "Login successful", 
            token, 
            user: { id: user.id, username: user.username } 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};