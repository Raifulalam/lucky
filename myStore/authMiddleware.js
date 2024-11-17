// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const jwtSecret = "mohammedRaifulAlamfromNepalBirgunj"; // Replace with a stronger secret in production

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', ''); // Extract token from Authorization header

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);  // Verify the token using the secret key
        req.user = decoded;  // Attach decoded data (user info) to req.user
        next();  // Proceed to the next middleware or route handler
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = authenticateToken;
