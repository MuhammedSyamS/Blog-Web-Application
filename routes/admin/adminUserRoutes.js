const express = require('express');
const router = express.Router();
const adminUserController = require('../../controllers/admin/adminUserController');
const { isAdmin } = require('../../middleware/roleMiddleware');

// 📋 All users
router.get('/', isAdmin, adminUserController.getAllUsers);

// 👁️ View single user
router.get('/:id', isAdmin, adminUserController.getUserDetails);

// ✏️ Edit user form
router.get('/:id/edit', isAdmin, adminUserController.getEditUser);

// 💾 Update user
router.put('/:id', isAdmin, adminUserController.updateUser);

// ❌ Delete user
router.delete('/:id', isAdmin, adminUserController.deleteUser);

router.put('/:id/reactivate', isAdmin, adminUserController.reactivateUser);

// ✅ Deactivate user
router.put('/:id/deactivate', isAdmin, adminUserController.deactivateUser);

module.exports = router;
