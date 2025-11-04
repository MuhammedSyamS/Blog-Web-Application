const express = require('express');
const router = express.Router();
const adminSettingsController = require('../../controllers/admin/adminSettingsController');
const { isAdmin } = require('../../middleware/roleMiddleware');

// ⚙️ Settings Page
router.get('/', isAdmin, adminSettingsController.getSettings);

// 💾 Update Settings
router.post('/', isAdmin, adminSettingsController.updateSettings);

module.exports = router;
