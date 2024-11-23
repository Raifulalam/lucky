// routes/user.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const User = require('../Models/user.model')
// const User = require('../models/user.model');  // Ensure correct model import
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../authMiddleware');  // Import the JWT authentication middleware

const jwtSecret = "mohammedRaifulAlamfromNepalBirgunj"; // Replace with a stronger secret in production

// User Registration Route
router.post('/createUser', [
    body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,50}$/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        // Check if email already exists
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Hash the user's password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Create a new user instance
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        });

        // Save the user to the database
        const savedUser = await user.save();

        // Respond with the saved user details (excluding password)
        res.status(201).json({
            id: savedUser._id,
            name: savedUser.name,
            email: savedUser.email,
        });
    } catch (err) {
        // Handle errors
        res.status(400).json({ message: err.message });
    }
});

// User Login Route
router.post('/loginUser', [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Please enter a valid password'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const comparePassword = await bcrypt.compare(password, user.password);
        if (!comparePassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const data = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        };

        // Sign the token with an expiry time (optional)
        const authToken = jwt.sign(data, jwtSecret);//, { expiresIn: '1h' }

        return res.json({ success: true, authToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Fetch User Profile Data (Protected Route)
router.get('/userData', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);  // Use the user ID from the JWT token
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return user data excluding password
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avtar: user.avtar,
            created: user.created_at,

        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
