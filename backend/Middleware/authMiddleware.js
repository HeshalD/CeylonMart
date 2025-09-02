const jwt = require("jsonwebtoken");

// Verify JWT
exports.verifyToken = (req, res, next) => {
  const raw = req.headers.authorization || "";
  const token = raw.startsWith("Bearer ") ? raw.slice(7) : null;
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Allow only admins
exports.isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
};

// Allow self or admin
exports.isSelfOrAdmin = (req, res, next) => {
  const isSelf = req.user?.id === req.params.id;
  const isAdmin = req.user?.role === "admin";
  if (!isSelf && !isAdmin) return res.status(403).json({ message: "Forbidden" });
  next();
};
