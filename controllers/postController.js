const Post = require('../models/Post');
const Comment = require('../models/Comment');

/* -------------------------------------------------------------------------- */
/* 🏠 GET ALL POSTS (Homepage)                                                */
/* -------------------------------------------------------------------------- */
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name _id') // populate author info
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'name' } // populate comment authors
      })
      .sort({ createdAt: -1 });

    res.render('user/index', {
      title: 'All Posts',
      posts,
      user: req.session.user || null,
    });
  } catch (err) {
    console.error('Error fetching posts:', err);
    req.flash('error_msg', 'Error loading posts.');
    res.redirect('/error');
  }
};

/* -------------------------------------------------------------------------- */
/* 📝 RENDER CREATE POST FORM                                                  */
/* -------------------------------------------------------------------------- */
exports.renderCreateForm = (req, res) => {
  res.render('user/posts/create', { user: req.session.user });
};

/* -------------------------------------------------------------------------- */
/* 🆕 CREATE NEW POST                                                          */
/* -------------------------------------------------------------------------- */
exports.createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    const newPost = new Post({
      title,
      content,
      images,
      author: req.session.user._id,
    });

    await newPost.save();
    req.flash('success_msg', 'Post created successfully!');
    res.redirect('/');
  } catch (err) {
    console.error('Error creating post:', err);
    req.flash('error_msg', 'Failed to create post.');
    res.redirect('/posts/new');
  }
};

/* -------------------------------------------------------------------------- */
/* ✏️ RENDER EDIT POST FORM                                                   */
/* -------------------------------------------------------------------------- */
exports.renderEditForm = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      req.flash('error_msg', 'Post not found.');
      return res.redirect('/posts');
    }

    // Ensure the logged-in user is the author
    if (post.author.toString() !== req.session.user._id.toString()) {
      req.flash('error_msg', 'You are not authorized to edit this post.');
      return res.redirect('/posts');
    }

    res.render('user/posts/edit-post', { post, user: req.session.user });
  } catch (err) {
    console.error('Error loading edit form:', err);
    req.flash('error_msg', 'Could not load edit page.');
    res.redirect('/posts');
  }
};

/* -------------------------------------------------------------------------- */
/* 💾 UPDATE POST                                                             */
/* -------------------------------------------------------------------------- */
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      req.flash('error_msg', 'Post not found.');
      return res.redirect('/posts');
    }

    // Authorization check
    if (post.author.toString() !== req.session.user._id.toString()) {
      req.flash('error_msg', 'You are not authorized to update this post.');
      return res.redirect('/posts');
    }

    post.title = req.body.title;
    post.content = req.body.content;

    // Add new uploaded images if any
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => `/uploads/${f.filename}`);
      post.images.push(...newImages);
    }

    await post.save();
    req.flash('success_msg', 'Post updated successfully!');
    res.redirect(`/posts/${post._id}`);
  } catch (err) {
    console.error('Error updating post:', err);
    req.flash('error_msg', 'Failed to update post.');
    res.redirect('/posts');
  }
};

/* -------------------------------------------------------------------------- */
/* 🗑️ DELETE POST                                                             */
/* -------------------------------------------------------------------------- */
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      req.flash('error_msg', 'Post not found.');
      return res.redirect('/');
    }

    // Authorization check
    if (
      post.author.toString() !== req.session.user._id.toString() &&
      req.session.user.role !== 'admin'
    ) {
      req.flash('error_msg', 'You are not authorized to delete this post.');
      return res.redirect('/');
    }

    await Post.findByIdAndDelete(req.params.postId);
    req.flash('success_msg', 'Post deleted successfully!');
    res.redirect('/');
  } catch (err) {
    console.error('Error deleting post:', err);
    req.flash('error_msg', 'Failed to delete post.');
    res.redirect('/');
  }
};

/* -------------------------------------------------------------------------- */
/* 🔍 GET SINGLE POST                                                         */
/* -------------------------------------------------------------------------- */
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('author', 'name email')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'name' },
      });

    if (!post) {
      return res.status(404).render('user/posts/view', {
        title: 'Post Not Found',
        post: null,
        likesCount: 0,
        comments: [],
        message: 'The post you’re looking for does not exist.',
        user: req.session.user || null,
      });
    }

    res.render('user/posts/view', {
      title: post.title,
      post,
      likesCount: post.likes.length || 0,
      comments: post.comments || [],
      user: req.session.user || null,
    });
  } catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).render('user/posts/view', {
      title: 'Server Error',
      post: null,
      likesCount: 0,
      comments: [],
      message: 'Something went wrong while loading the post.',
      user: req.session.user || null,
    });
  }
};

/* -------------------------------------------------------------------------- */
/* ❤️ TOGGLE LIKE                                                             */
/* -------------------------------------------------------------------------- */
exports.toggleLike = async (req, res) => {
  try {
    const userId = req.session.user?._id;
    const postId = req.params.postId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not logged in.' });
    }

    const post = await Post.findById(postId);
    if (!post)
      return res.status(404).json({ success: false, message: 'Post not found.' });

    const alreadyLiked = post.likes.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadyLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      success: true,
      liked: !alreadyLiked,
      likesCount: post.likes.length,
    });
  } catch (err) {
    console.error('Error toggling like:', err);
    res.status(500).json({ success: false, message: 'Failed to toggle like.' });
  }
};

/* -------------------------------------------------------------------------- */
/* 💬 ADD COMMENT                                                             */
/* -------------------------------------------------------------------------- */
exports.addComment = async (req, res) => {
  try {
    if (!req.session.user) {
      req.flash('error_msg', 'Please log in to comment.');
      return res.redirect(`/posts/${req.params.postId}`);
    }

    const postId = req.params.postId;
    const { content } = req.body;

    if (!content || !content.trim()) {
      req.flash('error_msg', 'Comment cannot be empty.');
      return res.redirect(`/posts/${postId}`);
    }

    // ✅ Create comment (timestamps handled automatically)
    const newComment = await Comment.create({
      post: postId,
      author: req.session.user._id,
      content: content.trim(),
    });

    // ✅ Link to post
    await Post.findByIdAndUpdate(postId, {
      $push: { comments: newComment._id },
    });

    req.flash('success_msg', 'Comment added successfully!');
    res.redirect(`/posts/${postId}`);
  } catch (err) {
    console.error('Error adding comment:', err);
    req.flash('error_msg', 'Failed to add comment.');
    res.redirect(`/posts/${req.params.postId}`);
  }
};
