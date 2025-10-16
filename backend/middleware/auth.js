const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Dev bypass token for local development flows without a real JWT
    if (token === 'dev-bypass-token') {
      req.user = { role: 'supplier_admin' };
      return next();
    }

    const decoded = jwt.verify(token, 'your-secret-key'); // In production, use environment variable
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

const adminAuth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Dev bypass token for local development flows without a real JWT
    if (token === 'dev-bypass-token') {
      req.user = { role: 'supplier_admin' };
      return next();
    }

    const decoded = jwt.verify(token, 'your-secret-key');
    // Allow both 'admin' and 'supplier_admin' to access admin endpoints used by the Supplier Admin Dashboard
    const allowedRoles = new Set(['admin', 'supplier_admin']);
    if (!allowedRoles.has(decoded.role)) {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = { auth, adminAuth };
