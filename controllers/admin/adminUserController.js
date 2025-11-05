const User = require('../../models/User');

// 📋 Get all users (admin dashboard)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.render('admin/users/list', { users });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load users.');
    res.redirect('/admin');
  }
};

// 👁️ View a single user
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/admin/users');
    }
    res.render('admin/users/view', { user });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading user details');
    res.redirect('/admin/users');
  }
};

// ✏️ Get edit user form
exports.getEditUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/admin/users');
    }
    res.render('admin/users/edit', { user });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading edit form');
    res.redirect('/admin/users');
  }
};

// 💾 Update user
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    await User.findByIdAndUpdate(req.params.id, { name, email, role });
    req.flash('success_msg', 'User updated successfully!');
    res.redirect('/admin/users');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to update user');
    res.redirect('/admin/users');
  }
};

// ❌ Delete user
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'User deleted successfully!');
    res.redirect('/admin/users');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to delete user');
    res.redirect('/admin/users');
  }
};

// ✅ Deactivate User
exports.deactivateUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    req.flash('success_msg', 'User deactivated successfully.');
    res.redirect('/admin/users'); // reloads the list with updated data
  } catch (err) {
    console.error('❌ Error deactivating user:', err);
    req.flash('error_msg', 'Failed to deactivate user.');
    res.redirect('/admin/users');
  }
};

// 🔄 Reactivate User
exports.reactivateUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isActive: true });
    req.flash('success_msg', 'User reactivated successfully.');
    res.redirect('/admin/users'); // reloads the list with updated data
  } catch (err) {
    console.error('❌ Error reactivating user:', err);
    req.flash('error_msg', 'Failed to reactivate user.');
    res.redirect('/admin/users');
  }
};



