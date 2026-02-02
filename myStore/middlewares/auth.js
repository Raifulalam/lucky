const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Token missing" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded || !decoded._id || !decoded.name || !decoded.email) {
            return res.status(401).json({ message: "Invalid token payload" });
        }

        req.user = {
            _id: decoded._id,
            name: decoded.name,
            email: decoded.email,
            role: decoded.role || "user",
        };

        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};


module.exports = authenticate;
