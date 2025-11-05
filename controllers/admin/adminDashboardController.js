const User = require('../../models/User');
const Post = require('../../models/Post');

// 📊 Admin Dashboard Controller
exports.getDashboard = async (req, res) => {
  try {
    // Count users and posts
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    const pendingPosts = await Post.countDocuments({ status: 'pending' });

    const stats = { totalUsers, totalPosts, pendingPosts };

    res.render('admin/dashboard', { stats });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading dashboard data.');
    res.redirect('/');
  }
};

