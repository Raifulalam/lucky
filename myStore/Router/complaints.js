const express = require('express');
const router = express.Router();
const Complaint = require('../Models/complaintsSchema');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists, create it if it doesn't
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Configure Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // Upload folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // Unique filename
    }
});

// Multer settings for file size and file type validation
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5MB
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            req.fileValidationError = 'Only image files are allowed.';
            return cb(new Error('Only image files are allowed.'));
        }
    }
});

// Serve static files from the 'uploads' folder
router.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Post endpoint to submit a complaint with image
router.post('/submitComplaint', upload.single('image'), async (req, res) => {
    // Handle Multer errors
    if (req.fileValidationError) {
        return res.status(400).json({ success: false, message: req.fileValidationError });
    }

    if (!req.file) {
        console.error('No image file uploaded.');
        return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }

    const { name, address, phone, province, district, product, model, warranty, issue } = req.body;
    const imagePath = `/uploads/${req.file.filename}`;

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
        image: imagePath
    });

    try {
        await newComplaint.save();
        console.log('Complaint saved:', newComplaint);
        res.status(201).json({
            success: true,
            message: 'Complaint submitted successfully!',
            data: { complaintId: newComplaint._id }
        });
    } catch (err) {
        console.error('Error submitting complaint:', err);
        res.status(500).json({ success: false, message: 'Error submitting complaint', error: err.message });
    }
});

// Endpoint to retrieve the complaints from the database
router.get('/getComplaints', async (req, res) => {
    try {
        const complaints = await Complaint.find();

        // If no complaints found, return 404
        if (complaints.length === 0) {
            return res.status(404).json({ success: false, message: 'Complaints Not Found' });
        }

        // Send the complaints as response
        res.json({ success: true, complaints });
    } catch (err) {
        console.error('Error retrieving complaints:', err); // Log the error
        res.status(500).json({ success: false, message: 'Error retrieving complaints', error: err.message });
    }
});

module.exports = router;
