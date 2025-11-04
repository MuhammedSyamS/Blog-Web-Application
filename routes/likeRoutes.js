const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.post('/:postId/like', isAuthenticated, likeController.toggleLike);

module.exports = router;
