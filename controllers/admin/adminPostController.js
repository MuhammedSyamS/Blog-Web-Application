const Post = require('../../models/Post');

// Get all posts (Admin Dashboard)
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('author');
    res.render('admin/posts/list', { title: 'All Posts', posts });
  } catch (err) {
    console.error('Error fetching posts:', err);
    req.flash('error_msg', 'Error fetching posts');
    res.redirect('/admin/dashboard');
  }
};

// Get single post by ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author');
    if (!post) {
      req.flash('error_msg', 'Post not found');
      return res.redirect('/admin/posts');
    }
    res.render('admin/posts/view', { title: post.title, post });
  } catch (err) {
    console.error('Error fetching post:', err);
    req.flash('error_msg', 'Error fetching post');
    res.redirect('/admin/posts');
  }
};

// Render edit post form
exports.getEditPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      req.flash('error_msg', 'Post not found');
      return res.redirect('/admin/posts');
    }
    res.render('admin/posts/edit', { title: 'Edit Post', post });
  } catch (err) {
    console.error('Error loading edit page:', err);
    req.flash('error_msg', 'Error loading edit page');
    res.redirect('/admin/posts');
  }
};

// Update post
exports.updatePost = async (req, res) => {
  try {
    const { title, content, status } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) {
      req.flash('error_msg', 'Post not found');
      return res.redirect('/admin/posts');
    }

    // Handle new images (if any)
    const newImages = req.files ? req.files.map(file => file.filename) : [];

    // Update fields
    post.title   = title;
    post.content = content;
    post.status  = status || post.status;
    if (newImages.length > 0) {
      post.images = [...post.images, ...newImages];
    }

    await post.save();
    req.flash('success_msg', 'Post updated successfully');
    res.redirect('/admin/posts');
  } catch (err) {
    console.error('Error updating post:', err);
    req.flash('error_msg', 'Error updating post');
    res.redirect(`/admin/posts/${req.params.id}/edit`);
  }
};

// 🗑️ Delete Post
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    await Post.findByIdAndDelete(postId);
    req.flash('success_msg', 'Post deleted successfully');
    res.redirect('/admin/posts');
  } catch (error) {
    console.error('Error deleting post:', error);
    req.flash('error_msg', 'Failed to delete post');
    res.redirect('/admin/posts');
  }
};
