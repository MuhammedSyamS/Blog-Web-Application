// controllers/userController.js
const User = require('../models/User');
const Post = require('../models/Post');

// ==============================
// 👤 Get Logged-In User Profile (includes dashboard info)
// ==============================
exports.getProfile = async (req, res) => {
  try {
    // ✅ Ensure user is logged in
    const sessionUser = req.user || req.session.user;
    if (!sessionUser) {
      req.flash('error_msg', 'Please log in first.');
      return res.redirect('/login');
    }

    // ✅ Fetch fresh user data (includes likedPosts)
    const user = await User.findById(sessionUser._id)
      .populate('likedPosts') // includes all liked post info
      .lean();

    // ✅ Fetch user’s own posts
    const myPosts = await Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .lean();

    // ✅ Render user profile (merged dashboard view)
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
