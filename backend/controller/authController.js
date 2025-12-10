const User = require('../models/User');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/GenerateToken');

const registerUser = async (req, res) => {
    const {name, email, password } = req.body;

    try {
        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashed });

        res.json({
            token: generateToken(user._id), 
            message: {userid: user._id, email: user.email}
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

const loginUser = async (req, res ) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.json({
            token: generateToken(user._id),
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
    });
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
};