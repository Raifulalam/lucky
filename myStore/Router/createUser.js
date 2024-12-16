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

const jwtSecret = "mohammedRaifulAlamfromNepalBirgunj";

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

router.get('/users', async function (req, res) {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

//dlete users
router.delete('/users/:id', async function (req, res) {
    try {
        const id = req.params.id;
        // Find and delete the user by id
        const user = await User.findByIdAndDelete(id);

        // Check if the user was found and deleted
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // If user was deleted successfully, return the user data
        res.status(200).json({ success: true, message: 'User deleted successfully', user });
    } catch (error) {
        console.error(error);
        // Return a 500 status code for server errors
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// Backend route for updating user data
router.put('/users/:id', async (req, res) => {
    try {
        // Find the user by ID
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update the user with the data from the request body
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedUser); // Send the updated user back in the response
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});



// Update User Profile Data (Protected Route)
router.put('/userData', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);  // Use the user ID from the JWT
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const updatedUser = await User.findByIdAndUpdate(user._id, req.body, { new: true });
        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/addUserInfo/:userId', async (req, res) => {
    const { userId } = req.params;  // Extract the userId from the URL parameter
    const { name, email, phone, address } = req.body;  // Extract user info from the request body

    // Validate required fields
    if (!name || !email || !phone || !address) {
        return res.status(400).json({ message: 'All fields (name, email, phone, address) are required' });
    }

    try {
        // Find the user by userId and update the userinfo array
        const updatedUser = await User.findByIdAndUpdate(
            userId,  // Find user by userId
            {
                $push: {  // $push is used to add to an array
                    userinfo: { name, email, phone, address }
                }
            },
            { new: true }  // Return the updated user document
        );

        // If user is not found
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Respond with the updated user data
        res.status(200).json({ message: 'User info added successfully', user: updatedUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error adding user info', error: err.message });
    }
});


module.exports = router;
