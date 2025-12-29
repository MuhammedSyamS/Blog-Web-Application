const bcrypt = require('bcryptjs');
const User = require('../models/User');
const TempUser = require('../models/TempUser'); // NEW
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
    console.error('Error loading signup page:', err);
    req.flash('error_msg', 'Error loading signup page.');
    return res.redirect('/login');
  }
};

// 🧩 POST: Signup — send OTP and store in TempUser
exports.postSignup = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  try {
    // check registration setting
    const settings = await Setting.findOne();
    if (settings && !settings.allowRegistrations) {
      req.flash('error_msg', 'Registrations are disabled.');
      return res.redirect('/signup');
    }

    // validate password
    if (password !== confirmPassword) {
      req.flash('error_msg', 'Passwords do not match.');
      return res.redirect('/signup');
    }

    // block if already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error_msg', 'Email already registered.');
      return res.redirect('/signup');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    // delete any old temp records
    await TempUser.findOneAndDelete({ email });

    // save temp user
    const tempUser = new TempUser({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpires: Date.now() + 5 * 60 * 1000
    });

    await tempUser.save();
    await sendOTP(email, otp, "Your Signup OTP");

    req.flash('success_msg', 'OTP sent to email. Enter OTP to complete signup.');
    return res.redirect('/verify');

  } catch (err) {
    console.error('Signup error:', err);
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

// 🧩 POST: Handle OTP Verification & Create Real User
exports.postVerify = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const tempUser = await TempUser.findOne({ email });
    if (!tempUser) {
      req.flash('error_msg', 'No pending signup found. Please sign up first.');
      return res.redirect('/signup');
    }

    // check OTP
    if (tempUser.otp !== otp || tempUser.otpExpires < Date.now()) {
      req.flash('error_msg', 'Invalid or expired OTP.');
      return res.redirect('/verify');
    }

    // save actual user
    const newUser = new User({
      name: tempUser.name,
      email: tempUser.email,
      password: tempUser.password,
      isVerified: true
    });
    await newUser.save();

    // remove temp
    await TempUser.deleteOne({ email });

    req.flash('success_msg', 'Signup complete! You can now log in.');
    return res.redirect('/login');

  } catch (err) {
    console.error('Verification error:', err);
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
      req.flash('error_msg', 'No user found with that email.');
      return res.redirect('/forgot');
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendOTP(email, otp, "Reset Password OTP");
    req.flash('success_msg', 'OTP sent. Check your email.');
    return res.redirect('/reset');

  } catch (err) {
    console.error('Forgot password error:', err);
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

// 🧩 POST: Reset Password with OTP
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

  } catch (err) {
    console.error('Reset error:', err);
    req.flash('error_msg', 'Reset failed.');
    return res.redirect('/reset');
  }
};

// 🚪 LOGOUT
exports.logout = (req, res) => {
  res.clearCookie('jwt');
  req.session.destroy(() => res.redirect('/login'));
};
