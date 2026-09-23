const jwt = require('jsonwebtoken');
const { store } = require('../services/dataStore');

const JWT_SECRET = process.env.JWT_SECRET || 'lawshield_super_secure_jwt_token_key_2026_x9';

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = store.users.find(u => u._id.toString() === decoded.userId.toString() || u.email === decoded.email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User belonging to token no longer exists' });
    }
    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      emergencyContacts: user.emergencyContacts || [],
    };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token is expired or invalid', error: err.message });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user ? req.user.role : 'unauthenticated'}' does not have permission.`
      });
    }
    next();
  };
};

module.exports = { authenticate, authorizeRoles, JWT_SECRET };
