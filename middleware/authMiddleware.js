const { generateToken, verifyToken } = require('../utils/jwt');

// ✅ Helper: Attach user from session to req.user (for consistency)
function attachUser(req, res, next) {
  if (req.session && req.session.user) {
    req.user = req.session.user; // 👈 this line ensures req.user is always available
  }
  next();
}

// 🔒 Only logged-in users
exports.isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    req.user = req.session.user; // 👈 ensures req.user works for routes like /dashboard
    return next();
  }
  req.flash('error_msg', 'Please log in first.');
  res.redirect('/login');
};

// 🚫 Only guests (e.g., signup or login pages)
exports.isGuest = (req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  res.redirect('/home');
};

// ✅ Used for routes that strictly need authentication
exports.ensureAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user; // 👈 attach user safely
    return next();
  }
  req.flash('error_msg', 'Please log in to continue.');
  res.redirect('/login');
};

// 👇 Export attachUser if you ever want to use it globally in app.js
exports.attachUser = attachUser;



