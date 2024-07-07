

// 1. Authentication middleware
const Admin = require('../../model/admin');
const jwt = require('jsonwebtoken');

function authenticateAdmin(req, res, next) {
  // Get token from request header
  const token = req.headers['authorization'] ? req.headers['authorization'].split(' ')[1] : null;

  // Check if token exists
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // Set req.userId with the admin's user ID
    next(); // Move to next middleware
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/// 2. Authorization middleware
async function authorizeAdmin(req, res, next) {
  console.log('Decoded JWT payload:', req.userId); // Log decoded JWT payload

  try {
    // Fetch the admin object from the database using the admin ID
    const user = await Admin.findById(req.userId);

    // Check if admin object exists and its role matches required role
    if (user && user.role === 'admin') {
      next(); // Admin has required role, proceed to next middleware
    } else {
      console.log('Authorization failed. User:', req.userId);
      return res.status(403).json({ error: 'Forbidden' }); // Admin does not have required role
    }
  } catch (error) {
    console.error('Error fetching admin:', error);
    return res.status(500).json({ error: 'Internal Server Error' }); // Server error
  }
}

module.exports = { authenticateAdmin, authorizeAdmin };
