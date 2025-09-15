const jwt = require("jsonwebtoken");

const jwtSecret = "mohammedRaifulAlamfromNepalBirgunj"; // ⚠️ move to .env later

// Authenticate any logged-in user (employee/admin)
const authenticateToken = (req, res, next) => {
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.split(" ")[1]; // Extract token

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded; // attach {id, role} to request
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

// Authorize specific roles
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied. You do not have permission." });
        }
        next();
    };
};

module.exports = { authenticateToken, authorizeRoles };
