exports.validateSignup = (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    req.flash('error_msg', 'All fields are required.');
    return res.redirect('/signup');
  }

  if (password !== confirmPassword) {
    req.flash('error_msg', 'Passwords do not match.');
    return res.redirect('/signup');
  }

  if (password.length < 6) {
    req.flash('error_msg', 'Password must be at least 6 characters.');
    return res.redirect('/signup');
  }

  next();
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    req.flash('error_msg', 'Both email and password are required.');
    return res.redirect('/login');
  }

  next();
};
