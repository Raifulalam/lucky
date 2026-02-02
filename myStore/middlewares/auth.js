const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Access denied. Token missing." });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ✅ REQUIRED FIELDS
        if (!decoded || !decoded._id) {
            return res.status(401).json({ message: "Invalid token payload" });
        }

        req.user = {
            _id: decoded._id,        // ✅ MongoDB ObjectId
            name: decoded.name,      // ✅ REQUIRED by Order schema
            email: decoded.email,
            role: decoded.role || "user",
        };

        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired. Please login again." });
        }

        return res.status(401).json({ message: "Invalid or malformed token" });
    }
};

module.exports = authenticate;
