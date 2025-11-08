const Post = require('../models/Post');
const Comment = require('../models/Comment');

/* -------------------------------------------------------------------------- */
/* 🏠 GET ALL POSTS (Homepage)                                                */
/* -------------------------------------------------------------------------- */
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name _id')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'name' }
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

    // ✅ If new images uploaded, replace old images completely
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => `/uploads/${f.filename}`);
      post.images = newImages; // overwrite old images
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

    const alreadyLiked = post.likes.some(id => id.toString() === userId.toString());
    if (alreadyLiked) post.likes.pull(userId);
    else post.likes.push(userId);

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
/* 💬 ADD COMMENT via AJAX                                                    */
/* -------------------------------------------------------------------------- */
exports.addCommentAjax = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: "Login required" });
    }

    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Comment cannot be empty" });
    }

    const postId = req.params.postId;
    const newComment = await Comment.create({
      post: postId,
      author: req.session.user._id,
      content: content.trim(),
    });

    await Post.findByIdAndUpdate(postId, { $push: { comments: newComment._id } });
    await newComment.populate("author", "name");

    res.json({
      success: true,
      comment: {
        _id: newComment._id,
        content: newComment.content,
        author: newComment.author?.name || "You",
        createdAt: newComment.createdAt,
      },
    });
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ success: false, message: "Failed to add comment" });
  }
};

/* -------------------------------------------------------------------------- */
/* 💬 DELETE COMMENT via AJAX                                                 */
/* -------------------------------------------------------------------------- */
exports.deleteCommentAjax = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

    const userId = req.session.user?._id.toString();
    const isAuthor = comment.author.toString() === userId;
    const isAdmin = req.session.user?.role === "admin";

    if (!isAuthor && !isAdmin)
      return res.status(403).json({ success: false, message: "Not allowed to delete this comment" });

    await Comment.findByIdAndDelete(commentId);
    await Post.findByIdAndUpdate(postId, { $pull: { comments: commentId } });

    res.json({ success: true, message: "Comment deleted successfully" });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ success: false, message: "Failed to delete comment" });
  }
};
