const { createToken, verifyToken } = require('../utils/jwt');

// Helper: attach user from session or token to req.user
function attachUser(req, res, next) {
  // 1. Check for session user
  if (req.session && req.session.user) {
    req.user = req.session.user;
    return next();
  }

  // 2. If no session user, check for token
  const token = req.cookies?.jwt || req.headers['authorization']?.split(' ')[1];
  if (token) {
    try {
      const payload = verifyToken(token);
      // Attach payload data to req.user
      req.user = {
        _id: payload.id,
        email: payload.email,
        role: payload.role
      };
      return next();
    } catch (err) {
      console.warn('Invalid token:', err);
      // If token invalid, we clear cookie (optional)
      res.clearCookie('jwt');
    }
  }

  // If no session or token, just proceed (user might be guest)
  next();
}

// Middleware: require user logged in (session or valid token)
exports.isAuthenticated = (req, res, next) => {
  if (req.session?.user) {
    req.user = req.session.user;
    return next();
  }

  const token = req.cookies?.jwt || req.headers['authorization']?.split(' ')[1];
  if (token) {
    try {
      const payload = verifyToken(token);
      req.user = {
        _id: payload.id,
        email: payload.email,
        role: payload.role
      };
      return next();
    } catch (err) {
      console.warn('Token verification failed:', err);
    }
  }

  req.flash('error_msg', 'Please log in first.');
  return res.redirect('/login');
};

// Middleware: only guests allowed (no session, no valid token)
exports.isGuest = (req, res, next) => {
  if (!req.session?.user) {
    const token = req.cookies?.jwt || req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return next();
    }
    // If token exists and is valid, then user is logged in via token
    try {
      verifyToken(token);
      // user has token → redirect away
      return res.redirect('/home');
    } catch {
      // token invalid → treat as guest
      return next();
    }
  }
  return res.redirect('/home');
};

// Middleware: strict authentication (session or valid token) for protected routes
exports.ensureAuthenticated = (req, res, next) => {
  if (req.session?.user) {
    req.user = req.session.user;
    return next();
  }

  const token = req.cookies?.jwt || req.headers['authorization']?.split(' ')[1];
  if (token) {
    try {
      const payload = verifyToken(token);
      req.user = {
        _id: payload.id,
        email: payload.email,
        role: payload.role
      };
      return next();
    } catch (err) {
      console.warn('Token verification failed:', err);
    }
  }

  req.flash('error_msg', 'Please log in to continue.');
  return res.redirect('/login');
};

// Export attachUser if you want to set it globally
exports.attachUser = attachUser;
