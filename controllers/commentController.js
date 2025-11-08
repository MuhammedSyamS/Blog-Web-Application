const Post = require('../models/Post');
const Comment = require('../models/Comment');

// 📝 Add Comment (AJAX)
exports.addComment = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: "Login required" });
    }

    const postId = req.params.postId;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Comment cannot be empty" });
    }

    const newComment = await Comment.create({
      post: postId,
      author: req.session.user._id,
      content: content.trim()
    });

    await Post.findByIdAndUpdate(postId, { $push: { comments: newComment._id } });

    res.json({
      success: true,
      comment: {
        _id: newComment._id,
        content: newComment.content,
        author: req.session.user.name || "You",
        createdAt: newComment.createdAt
      }
    });
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ success: false, message: "Failed to add comment" });
  }
};

// 🗑️ Delete Comment (AJAX)
exports.deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    const isAuthor = comment.author.toString() === req.session.user._id.toString();
    const isAdmin = req.session.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this comment" });
    }

    await Comment.findByIdAndDelete(commentId);
    await Post.findByIdAndUpdate(postId, { $pull: { comments: commentId } });

    res.json({ success: true, message: "Comment deleted successfully", commentId });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ success: false, message: "Failed to delete comment" });
  }
};
