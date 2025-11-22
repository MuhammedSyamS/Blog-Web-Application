const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'your-secret';
function createToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '1h' });
}
function verifyToken(token) {
  return jwt.verify(token, SECRET);
}
module.exports = { createToken, verifyToken };
