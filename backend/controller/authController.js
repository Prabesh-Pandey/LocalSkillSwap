const User = require('../models/User');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/GenerateToken');

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    // Input validation
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    if (name.trim().length < 2) {
        return res.status(400).json({ message: 'Name must be at least 2 characters long' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    try {
        const exists = await User.findOne({ email: email.toLowerCase() });
        if (exists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ 
            name: name.trim(), 
            email: email.toLowerCase(), 
            password: hashed 
        });

        res.status(201).json({
            token: generateToken(user._id),
            id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }

    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.json({
            token: generateToken(user._id),
            id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMe = async (req, res) => {
    res.json({
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt,
    });
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
};