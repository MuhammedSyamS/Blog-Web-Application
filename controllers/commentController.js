const Post = require('../models/Post');
const Comment = require('../models/Comment');

// 📝 Add Comment
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

    // ✅ Create new comment (timestamps will auto-generate from schema)
    const newComment = await Comment.create({
      post: postId,
      author: req.session.user._id,
      content: content.trim()
    });

    // ✅ Link comment to post
    await Post.findByIdAndUpdate(postId, { $push: { comments: newComment._id } });

    req.flash('success_msg', 'Comment added successfully!');
    res.redirect(`/posts/${postId}`);
  } catch (err) {
    console.error('❌ Error adding comment:', err);
    req.flash('error_msg', 'Failed to add comment.');
    res.redirect(`/posts/${req.params.postId}`);
  }
};


// 🗑️ Delete Comment
exports.deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      req.flash('error_msg', 'Comment not found.');
      return res.redirect(`/posts/${postId}`);
    }

    const isAuthor = comment.author.toString() === req.session.user._id.toString();
    const isAdmin = req.session.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      req.flash('error_msg', 'You are not allowed to delete this comment.');
      return res.redirect(`/posts/${postId}`);
    }

    await Comment.findByIdAndDelete(commentId);
    await Post.findByIdAndUpdate(postId, { $pull: { comments: commentId } });

    req.flash('success_msg', 'Comment deleted successfully.');
    res.redirect(`/posts/${postId}`);
  } catch (err) {
    console.error('❌ Error deleting comment:', err);
    req.flash('error_msg', 'Failed to delete comment.');
    res.redirect(`/posts/${req.params.postId}`);
  }
};
