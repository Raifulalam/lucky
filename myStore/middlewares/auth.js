const jwt = require("jsonwebtoken");

const parseCookieHeader = (cookieHeader = "") =>
    cookieHeader.split(";").reduce((acc, part) => {
        const [rawKey, ...rawValue] = part.trim().split("=");
        if (!rawKey) {
            return acc;
        }

        const key = rawKey.trim();
        const value = rawValue.join("=").trim();
        if (key) {
            acc[key] = decodeURIComponent(value || "");
        }

        return acc;
    }, {});

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const cookies = parseCookieHeader(req.headers.cookie || "");

        let token = null;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        } else if (cookies.authToken) {
            token = cookies.authToken;
        }

        if (!token) {
            return res.status(401).json({
                message: "Access denied. Token missing.",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "change-me-in-env");

        // Defensive check
        if (!decoded || !decoded.id) {
            return res.status(401).json({
                message: "Invalid token payload",
            });
        }

        req.user = {
            id: decoded.id,
            name: decoded.name,
            role: decoded.role || "user",
            email: decoded.email,
        };

        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Token expired. Please login again.",
            });
        }

        return res.status(401).json({
            message: "Invalid or malformed token",
        });
    }
};

module.exports = authenticate;
