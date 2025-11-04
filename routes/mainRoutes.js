const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.get('/', (req, res) => res.redirect('/home'));
router.get('/home', postController.getAllPosts);

module.exports = router;
