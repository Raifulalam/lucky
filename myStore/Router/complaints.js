const express = require('express');
const router = express.Router();
const Complaint = require('../Models/complaintsSchema');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});


// Set up multer memory storage (store file in memory before uploading to Cloudinary)
const storage = multer.memoryStorage();

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
        console.log('Request received:', req.body);
        console.log('Uploaded file details:', req.file);

        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ error: 'No file data available' });
        }

        // Upload the image to Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'image' },
            async (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error); // Log the error
                    return res.status(500).json({ error: 'Error uploading image to Cloudinary', details: error });
                }

                // Ensure result is valid
                if (!result || !result.secure_url) {
                    console.error('Cloudinary did not return a valid image URL');
                    return res.status(500).json({ error: 'Cloudinary upload failed, no image URL returned' });
                }

                // Debug log for Cloudinary result
                console.log('Cloudinary upload result:', result);

                const imagePath = result.secure_url;  // Cloudinary URL
                console.log('Image uploaded to Cloudinary:', imagePath);

                // Destructure the data from the request body
                const { name, address, phone, province, district, product, model, warranty, issue } = req.body;

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
                    image: imagePath // Save the Cloudinary URL instead of the local path
                });

                // Save the complaint to the database
                await newComplaint.save();

                // Respond with success message and image URL
                res.status(201).json({ message: 'Complaint submitted successfully!', image: imagePath });
            }
        );

        // Stream the file buffer to Cloudinary
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

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
