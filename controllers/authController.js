const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Setting = require('../models/Setting');
const { createToken } = require('../utils/jwt');

// 🧩 GET: Login Page
exports.getLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Login',
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

    // ✅ Generate JWT token
    const token = createToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    res.cookie('jwt', token, { httpOnly: true });
    req.flash('success_msg', 'Successfully logged in!');
    return res.redirect('/index');

  } catch (err) {
    console.error('Login error:', err);
    req.flash('error_msg', 'Something went wrong. Please try again.');
    return res.redirect('/login');
  }
};

// 🧩 GET: Signup Page
exports.getSignup = async (req, res) => {
  try {
    const settings = await Setting.findOne();
    const allowRegistrations = settings ? settings.allowRegistrations : true;

    if (!allowRegistrations) {
      req.flash('error_msg', 'Registrations are currently disabled by the admin.');
      return res.redirect('/login');
    }

    res.render('auth/signup', {
      title: 'Sign Up',
      success_msg: res.locals.success_msg,
      error_msg: res.locals.error_msg,
    });
  } catch (err) {
    console.error('Error checking registration setting:', err);
    req.flash('error_msg', 'Error loading signup page.');
    return res.redirect('/login');
  }
};

// 🧩 POST: Handle Signup
exports.postSignup = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  try {
    // 🚫 Check if registration is allowed
    const settings = await Setting.findOne();
    if (settings && !settings.allowRegistrations) {
      req.flash('error_msg', 'Registrations are currently disabled.');
      return res.redirect('/login');
    }

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

    // ✅ Generate JWT token
    const token = createToken({
      id: newUser._id,
      email: newUser.email,
      role: newUser.role
    });

    req.session.user = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    };

    res.cookie('jwt', token, { httpOnly: true });

    req.flash('success_msg', 'Account created successfully. Please log in.');
    return res.redirect('/login');

  } catch (err) {
    console.error('Signup error:', err);
    req.flash('error_msg', 'Error creating account.');
    return res.redirect('/signup');
  }
};

// 🚪 LOGOUT
exports.logout = (req, res) => {
  res.clearCookie('jwt');
  req.session.destroy(() => res.redirect('/login'));
};
