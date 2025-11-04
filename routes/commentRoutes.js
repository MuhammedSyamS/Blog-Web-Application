const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController') // ✅ fixed path
const { isAuthenticated } = require('../middleware/authMiddleware');

// ✏️ Add Comment
router.post('/:postId/comments', isAuthenticated, commentController.addComment);

// 🗑️ Delete Comment
router.delete('/:postId/comments/:commentId', isAuthenticated, commentController.deleteComment);

module.exports = router;
