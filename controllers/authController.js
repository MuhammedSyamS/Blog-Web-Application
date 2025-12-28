const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Setting = require('../models/Setting');
const { createToken } = require('../utils/jwt');
const { sendOTP } = require('../utils/email');

// — HELPER: generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 🧩 GET: Login Page
exports.getLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Login',
    success_msg: res.locals.success_msg,
    error_msg: res.locals.error_msg,
  });
};

// 🧩 POST: Handle Login (block unverified)
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error_msg', 'Invalid email or password.');
      return res.redirect('/login');
    }

    // ❌ Block login before verification
    if (!user.isVerified) {
      req.flash('error_msg', 'Account not verified. Check your email for OTP.');
      return res.redirect('/login');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash('error_msg', 'Invalid email or password.');
      return res.redirect('/login');
    }

    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // JWT token
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
    req.flash('error_msg', 'Something went wrong.');
    return res.redirect('/login');
  }
};

// 🧩 GET: Signup Page
exports.getSignup = async (req, res) => {
  try {
    const settings = await Setting.findOne();
    const allowRegistrations = settings ? settings.allowRegistrations : true;
    if (!allowRegistrations) {
      req.flash('error_msg', 'Registrations disabled by admin.');
      return res.redirect('/login');
    }
    res.render('auth/signup', {
      title: 'Sign Up',
      success_msg: res.locals.success_msg,
      error_msg: res.locals.error_msg,
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading signup page.');
    return res.redirect('/login');
  }
};

// 🧩 POST: Signup with OTP
exports.postSignup = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  try {
    const settings = await Setting.findOne();
    if (settings && !settings.allowRegistrations) {
      req.flash('error_msg', 'Registrations are disabled.');
      return res.redirect('/signup');
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

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    const newUser = new User({
      name,
      email,
      password: hashed,
      otp,
      otpExpires: Date.now() + 5 * 60 * 1000,
      isVerified: false
    });

    await newUser.save();
    await sendOTP(email, otp, "Verify Your Account");

    req.flash('success_msg', 'OTP sent to email. Verify account.');
    return res.redirect('/verify');

  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error creating account.');
    return res.redirect('/signup');
  }
};

// 🧩 GET: Verify OTP Page
exports.getVerify = (req, res) => {
  res.render('auth/verify', {
    title: 'Verify Account',
    success_msg: res.locals.success_msg,
    error_msg: res.locals.error_msg,
  });
};

// 🧩 POST: Handle OTP Verification
exports.postVerify = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error_msg', 'Invalid email.');
      return res.redirect('/verify');
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      req.flash('error_msg', 'Invalid or expired OTP.');
      return res.redirect('/verify');
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    req.flash('success_msg', 'Verified! You can now log in.');
    return res.redirect('/login');

  } catch (err) {
    req.flash('error_msg', 'Verification failed.');
    return res.redirect('/verify');
  }
};

// 🧩 GET: Forgot Password
exports.getForgot = (req, res) => {
  res.render('auth/forgot', {
    title: 'Forgot Password',
    success_msg: res.locals.success_msg,
    error_msg: res.locals.error_msg,
  });
};

// 🧩 POST: Send Forgot OTP
exports.postForgot = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error_msg', 'No user found.');
      return res.redirect('/forgot');
    }
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();
    await sendOTP(email, otp, "Reset Password OTP");

    req.flash('success_msg', 'OTP sent. Check email.');
    return res.redirect('/reset');
  } catch {
    req.flash('error_msg', 'Error sending OTP.');
    return res.redirect('/forgot');
  }
};

// 🧩 GET: Reset Password Page
exports.getReset = (req, res) => {
  res.render('auth/reset', {
    title: 'Reset Password',
    success_msg: res.locals.success_msg,
    error_msg: res.locals.error_msg,
  });
};

// 🧩 POST: Reset Password
exports.postReset = async (req, res) => {
  const { email, otp, newPassword, confirmNewPassword } = req.body;
  try {
    if (newPassword !== confirmNewPassword) {
      req.flash('error_msg', 'Passwords do not match.');
      return res.redirect('/reset');
    }
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      req.flash('error_msg', 'Invalid OTP or email.');
      return res.redirect('/reset');
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    req.flash('success_msg', 'Password reset successful.');
    return res.redirect('/login');

  } catch {
    req.flash('error_msg', 'Reset failed.');
    return res.redirect('/reset');
  }
};

// 🚪 LOGOUT
exports.logout = (req, res) => {
  res.clearCookie('jwt');
  req.session.destroy(() => res.redirect('/login'));
};
