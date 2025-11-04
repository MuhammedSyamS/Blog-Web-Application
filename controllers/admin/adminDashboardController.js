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


// 🔄 Reactivate User Controller
exports.reactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User reactivated successfully', user });
  } catch (error) {
    console.error('Error reactivating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
