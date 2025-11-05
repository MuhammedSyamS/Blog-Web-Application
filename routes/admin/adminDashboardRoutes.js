const express = require('express');
const router = express.Router();
const adminDashboardController = require('../../controllers/admin/adminDashboardController');
const { isAdmin } = require('../../middleware/roleMiddleware');

// 🧭 Admin Dashboard
router.get('/', isAdmin, adminDashboardController.getDashboard);



module.exports = router;
