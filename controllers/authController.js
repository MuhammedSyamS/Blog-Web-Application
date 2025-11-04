const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { createToken, verifyToken } = require('../utils/jwt');



// 🧩 GET: Login Page
exports.getLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Login',
    // ✅ These now come directly from res.locals set in app.js
    success_msg: res.locals.success_msg,
    error_msg: res.locals.error_msg,
  });
};

// 🧩 POST: Handle Login
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error_msg', 'Invalid email or password.');
      return res.redirect('/login');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash('error_msg', 'Invalid email or password.');
      return res.redirect('/login');
    }

    // ✅ Save user in session
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    req.flash('success_msg', 'Successfully logged in!');
    res.redirect('/home');
  } catch (err) {
    console.error('Login error:', err);
    req.flash('error_msg', 'Something went wrong. Please try again.');
    res.redirect('/login');
  }
};

// 🧩 GET: Signup Page
exports.getSignup = (req, res) => {
  res.render('auth/signup', {
    title: 'Sign Up',
    success_msg: res.locals.success_msg,
    error_msg: res.locals.error_msg,
  });
};

// 🧩 POST: Handle Signup
exports.postSignup = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  try {
    if (password !== confirmPassword) {
      req.flash('error_msg', 'Passwords do not match.');
      return res.redirect('/signup');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error_msg', 'Email already registered.');
      return res.redirect('/signup');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    req.flash('success_msg', 'Account created successfully. Please log in.');
    res.redirect('/login');
  } catch (err) {
    console.error('Signup error:', err);
    req.flash('error_msg', 'Error creating account.');
    res.redirect('/signup');
  }
};

// 🚪 LOGOUT
exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
};
