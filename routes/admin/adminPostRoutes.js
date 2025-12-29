const express = require('express');
const router = express.Router();
const adminPostController = require('../../controllers/admin/adminPostController');
const { isAdmin } = require('../../middleware/roleMiddleware');
const { upload } = require('../../middleware/uploadMiddleware');

// Get all posts
router.get('/', isAdmin, adminPostController.getAllPosts);

// Edit post form
router.get('/:id/edit', isAdmin, adminPostController.getEditPost);

// Update post (PUT)
router.put('/:id', isAdmin, upload.array('newImages', 5), adminPostController.updatePost);

// Delete post
router.delete('/:id', isAdmin, adminPostController.deletePost);

// View single post
router.get('/:id', isAdmin, adminPostController.getPostById);

module.exports = router;
