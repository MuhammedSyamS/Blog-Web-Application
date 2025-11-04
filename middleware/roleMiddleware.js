// middleware/roleMiddleware.js

exports.isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  req.flash('error_msg', 'Access denied. Admins only.');
  return res.redirect('/login');
};

// Optionally export more middleware:
exports.isUser = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'user') {
    return next();
  }
  req.flash('error_msg', 'Access restricted to regular users.');
  return res.redirect('/');
};
