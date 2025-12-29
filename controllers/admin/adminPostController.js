const Post = require('../../models/Post');
const fs = require('fs');
const path = require('path');

// ✅ Get all posts
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('author');
    res.render('admin/posts/list', { title: 'All Posts', posts });
  } catch (err) {
    console.error('Error fetching posts:', err);
    req.flash('error_msg', 'Error fetching posts');
    res.redirect('/admin/dashboard');
  }
};

// ✅ Get single post by ID
const getPostById = async (req, res) => {
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

// ✅ Render edit post form
const getEditPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      req.flash('error_msg', 'Post not found');
      return res.redirect('/admin/posts');
    }

    res.render('admin/posts/edit', { title: 'Edit Post', post, images: post.images });
  } catch (err) {
    console.error('Error loading edit page:', err);
    req.flash('error_msg', 'Error loading edit page');
    res.redirect('/admin/posts');
  }
};

// ✅ Update post (FIXED IMAGE LOGIC)

const updatePost = async (req, res) => {
  try {
    const { title, content, status, removeImages } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      req.flash('error_msg', 'Post not found');
      return res.redirect('/admin/posts');
    }

    // Remove selected images
    if (removeImages) {
      const imagesToRemove = Array.isArray(removeImages) ? removeImages : [removeImages];
      imagesToRemove.forEach(filename => {
        const filePath = path.join(__dirname, '../../public/uploads', filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
      post.images = post.images.filter(img => !imagesToRemove.includes(path.basename(img)));
    }

    // Add new images (from input name="newImages")
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      post.images.push(...newImages);
    }

    post.title = title;
    post.content = content;
    post.status = status || post.status;

    await post.save();

    req.flash('success_msg', 'Post updated successfully');
    res.redirect('/admin/posts');
  } catch (err) {
    console.error('Error updating post:', err);
    req.flash('error_msg', 'Error updating post');
    res.redirect(`/admin/posts/${req.params.id}/edit`);
  }
};


// ✅ Delete post (THIS WAS MISSING ❗)
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      req.flash('error_msg', 'Post not found');
      return res.redirect('/admin/posts');
    }

    // Delete images from filesystem
    post.images.forEach(img => {
      const filename = path.basename(img);
      const filePath = path.join(
        __dirname,
        '../../public/uploads',
        filename
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    await Post.findByIdAndDelete(req.params.id);

    req.flash('success_msg', 'Post deleted successfully');
    res.redirect('/admin/posts');
  } catch (err) {
    console.error('Error deleting post:', err);
    req.flash('error_msg', 'Failed to delete post');
    res.redirect('/admin/posts');
  }
};

// ✅ EXPORTS (NOW ALL FUNCTIONS EXIST)
module.exports = {
  getAllPosts,
  getPostById,
  getEditPost,
  updatePost,
  deletePost
};
