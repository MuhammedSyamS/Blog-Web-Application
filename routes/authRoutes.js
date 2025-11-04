const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isGuest } = require('../middleware/authMiddleware');
const { validateSignup, validateLogin } = require('../middleware/validationMiddleware');

// 🧭 Auth Routes
router.get('/login', isGuest, authController.getLogin);
router.post('/login', validateLogin, authController.postLogin);

router.get('/signup', isGuest, authController.getSignup);
router.post('/signup', validateSignup, authController.postSignup);

// 🚪 Logout
router.get('/logout', authController.logout);

module.exports = router;
