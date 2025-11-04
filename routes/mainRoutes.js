const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.get('/', (req, res) => res.redirect('/index'));
router.get('/index', postController.getAllPosts);

module.exports = router;
