const User = require('../models/User');
const Post = require('../models/Post');
const { verifyToken } = require('../utils/jwt');

// ==============================
// 👤 Get Logged-In User Profile
// ==============================
exports.getProfile = async (req, res) => {
  try {
    let sessionUser = req.user || req.session.user;

    // ✅ If no session or req.user, try token from cookie or header
    if (!sessionUser) {
      const token = req.cookies?.jwt || req.headers['authorization']?.split(' ')[1];
      if (token) {
        try {
          const decoded = verifyToken(token);
          sessionUser = decoded; // set from token payload
        } catch (err) {
          console.warn('Invalid token in getProfile:', err.message);
          req.flash('error_msg', 'Session expired. Please log in again.');
          return res.redirect('/login');
        }
      }
    }

    // ❌ Still no user
    if (!sessionUser) {
      req.flash('error_msg', 'Please log in first.');
      return res.redirect('/login');
    }

    // ✅ Fetch fresh user data (includes likedPosts)
    const user = await User.findById(sessionUser.id || sessionUser._id)
      .populate('likedPosts')
      .lean();

    // ✅ Fetch user’s own posts
    const myPosts = await Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .lean();

    // ✅ Render user profile
    res.render('user/profile', {
      title: 'My Profile',
      user,
      myPosts,
    });

  } catch (err) {
    console.error('Profile Error:', err);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'Something went wrong while loading your profile.',
    });
  }
};
