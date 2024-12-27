const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });  
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        return res.status(201).json({ message: 'Registration successful, please log in' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to register', error: error.message }); 
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });  
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' }); 
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' }); 
        }

        if (!JWT_SECRET) {
            return res.status(500).json({ message: 'JWT_SECRET is not defined in the environment variables' });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, userId: user._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});



module.exports = router;
