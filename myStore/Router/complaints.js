const express = require('express');
const router = express.Router();
const Complaint = require('../Models/complaintsSchema');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, './uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true }); // Create the uploads directory if it doesn't exist
    console.log('Uploads directory created');
} else {
    console.log('Uploads directory already exists');
}

// Set up multer storage and file validation
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log("Uploads directory for multer: ", uploadsDir); // Log the uploads directory
        cb(null, uploadsDir); // Save files in the 'uploads' folder
    },
    filename: (req, file, cb) => {
        const fileName = Date.now() + path.extname(file.originalname); // Rename file to avoid conflicts
        console.log('Saving file as: ', fileName); // Log the file name
        cb(null, fileName);
    }
});

// File size limit: 5MB; Allowed types: JPG, JPEG, PNG
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and JPG are allowed.'), false);
        }
    }
});

// Endpoint to handle complaint submissions (with image upload)
router.post('/submitComplaint', upload.single('image'), async (req, res) => {
    try {
        // Log the request data for debugging
        console.log('Request received:', req.body);
        console.log('Uploaded file details:', req.file);

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Destructure the data from the request body
        const { name, address, phone, province, district, product, model, warranty, issue } = req.body;
        const imagePath = `/uploads/${req.file.filename}`;

        // Log the image path
        console.log('Image saved to:', imagePath);

        // Create a new complaint document
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

        // Save the complaint to the database
        await newComplaint.save();

        // Respond with success message and image path
        res.status(201).json({ message: 'Complaint submitted successfully!', image: imagePath });

    } catch (error) {
        console.error('Error uploading file and saving complaint:', error);
        if (error instanceof multer.MulterError) {
            return res.status(400).json({ error: `Multer Error: ${error.message}` });
        }
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// Endpoint to retrieve complaints from the database
router.get('/getComplaint', async (req, res) => {
    try {
        const complaints = await Complaint.find();

        if (complaints.length === 0) {
            return res.status(404).json({ success: false, message: 'No complaints found' });
        }

        res.status(200).json({ success: true, complaints });
    } catch (err) {
        console.error('Error fetching complaints:', err);
        res.status(500).json({ success: false, message: 'Error fetching complaints', error: err.message });
    }
});

module.exports = router;
