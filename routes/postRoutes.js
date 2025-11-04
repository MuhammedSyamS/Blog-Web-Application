const express = require('express');
const router = express.Router();

const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController'); // ✅ Added
const likeController = require('../controllers/likeController');       // ✅ Added
const { isAuthenticated } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// 🏠 Homepage & all posts
router.get('/', postController.getAllPosts);

// 🆕 Create post
router.get('/new', isAuthenticated, postController.renderCreateForm);
router.post('/new', isAuthenticated, upload.array('images', 5), postController.createPost);

// ✏️ Edit post
router.get('/edit/:postId', isAuthenticated, postController.renderEditForm);
router.post('/edit/:postId', isAuthenticated, upload.array('images', 5), postController.updatePost);

// 🗑️ Delete post
router.post('/delete/:postId', isAuthenticated, postController.deletePost);

// 🔍 View single post
router.get('/:postId', postController.getPostById);

// 💬 Comments
router.post('/:postId/comments', isAuthenticated, commentController.addComment);     // ✅ works with your EJS
router.delete('/:postId/comments/:commentId', isAuthenticated, commentController.deleteComment); // ✅ delete comment

// ❤️ Likes
router.post('/:postId/like', isAuthenticated, likeController.toggleLike); // ✅ AJAX like button

module.exports = router;
