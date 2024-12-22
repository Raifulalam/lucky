const express = require('express');
const router = express.Router();
const messages = require('../Models/contactMessage');

// POST route to save a contact message
router.post('/contactMessage', (req, res) => {
    const { name, email, message } = req.body;

    // Create a new message instance
    const newMessage = new messages({ name, email, message });

    // Save the message to the database
    newMessage.save()
        .then(() => {
            res.status(201).json({ message: 'Contact message saved successfully!' });
        })
        .catch((err) => {
            console.error('Error saving contact message:', err);
            res.status(500).json({ message: 'Failed to save contact message.' });
        });
});

// GET route to fetch all contact messages
router.get('/contactMessages', (req, res) => {
    messages.find()
        .then((messages) => {
            res.json(messages);
        })
        .catch((err) => {
            console.error('Error fetching contact messages:', err);
            res.status(500).json({ message: 'Failed to fetch contact messages.' });
        });
});

module.exports = router;
