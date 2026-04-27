const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadRoot = path.join(__dirname, "..", "..", "uploads", "hrms", "profiles");
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, callback) => callback(null, uploadRoot),
    filename: (req, file, callback) => {
        const extension = path.extname(file.originalname) || ".png";
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
        callback(null, fileName);
    },
});

const fileFilter = (req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
        return callback(new Error("Only image uploads are allowed."));
    }

    return callback(null, true);
};

module.exports = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 3 * 1024 * 1024,
    },
});
