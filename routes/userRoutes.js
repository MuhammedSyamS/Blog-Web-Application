const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.get('/profile', isAuthenticated, userController.getProfile);

// User dashboard

module.exports = router;



