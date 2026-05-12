const jwt = require("jsonwebtoken");
const ExpressError = require("../utils/ExpressError");

module.exports.verifyToken = (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            throw new ExpressError(401, "Access denied. No token provided.");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey");
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ success: false, message: "Invalid or expired token." });
    }
};

module.exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: "Access denied. Admin only." });
    }
};
