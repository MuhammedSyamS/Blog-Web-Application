// utils/jwt.js
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'your_default_secret_key';

// ✅ Create JWT token
exports.createToken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
};

// ✅ Verify JWT token
exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
};
