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

// — VERIFY OTP
router.get('/verify', isGuest, authController.getVerify);
router.post('/verify', authController.postVerify);

// — FORGOT PASSWORD
router.get('/forgot', isGuest, authController.getForgot);
router.post('/forgot', authController.postForgot);

// — RESET PASSWORD
router.get('/reset', isGuest, authController.getReset);
router.post('/reset', authController.postReset);

// 🚪 Logout
router.get('/logout', authController.logout);

module.exports = router;
