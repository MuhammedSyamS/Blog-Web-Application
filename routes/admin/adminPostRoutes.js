// routes/admin/adminPostRoutes.js

const express = require('express');
const router  = express.Router();
const adminPostController = require('../../controllers/admin/adminPostController');
const { isAdmin }         = require('../../middleware/roleMiddleware');
const { upload }          = require('../../middleware/uploadMiddleware');

// All posts
router.get('/',                  isAdmin, adminPostController.getAllPosts);
// View single post
router.get('/:id',               isAdmin, adminPostController.getPostById);
// Edit post form
router.get('/:id/edit',          isAdmin, adminPostController.getEditPost);
// Update post (PUT via method-override)
router.put('/:id',               isAdmin, upload.array('newImages', 5), adminPostController.updatePost);

module.exports = router;
