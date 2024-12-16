const express = require('express');
const router = express.Router();
const Complaint = require('../Models/complaintsSchema');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// Configure Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // Upload folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // Unique filename
    }
});

const upload = multer({ storage: storage });

// Post endpoint to submit a complaint with image
router.post('/submitComplaint', upload.single('image'), async (req, res) => {
    const { name, address, phone, province, district, product, model, warranty, issue } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;  // Save the relative path of the image

    const newComplaint = new Complaint({
        name,
        address,
        phone,
        province,
        district,
        product,
        model,
        warranty,
        issue,
        image: imagePath  // Store image URL in the database
    });

    try {
        await newComplaint.save();
        res.status(201).json({ success: true, message: 'Complaint submitted successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error submitting complaint', error: err.message });
    }
});


// Endpoint to retrieve the image from the database
router.get('/getComplaints', async (req, res) => {
    try {

        const complaints = await Complaint.find(); // Corrected 'complaints' to 'Complaint'

        // If no complaints found, return 404
        if (complaints.length === 0) {
            return res.status(404).json({ success: false, message: 'Complaints Not Found' });
        }

        // Send the complaints as response
        res.json({ success: true, complaints });

    } catch (err) {
        // Log and handle any errors that occur during the database operation
        console.error('Error:', err);
        res.status(500).json({ success: false, message: 'Error retrieving complaints', error: err.message });
    }
});




module.exports = router;
