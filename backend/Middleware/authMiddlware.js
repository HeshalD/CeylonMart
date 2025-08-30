const jwt = require("jsonwebtoken");

const authMiddleware = (roles = []) => {
    return (req, res, next) => {
        try {
            const token = req.header("Authorization")?.replace("Bearer ", "");
            if (!token) return res.status(401).json({ message: "Access Denied" });

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(403).json({ message: "Forbidden: Insufficient rights" });
            }

            next();
        } catch (err) {
            res.status(401).json({ message: "Invalid Token" });
        }
    };
};

module.exports = authMiddleware;
