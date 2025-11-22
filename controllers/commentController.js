// controllers/commentController.js
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { verifyToken } = require('../utils/jwt');

exports.addComment = async (req, res) => {
  try {
    let user;

    if (req.session && req.session.user) {
      user = req.session.user;
    } else {
      const token = req.cookies?.jwt || (req.headers['authorization']?.split(' ')[1]);
      if (!token) {
        return res.status(401).json({ success: false, message: "Login required" });
      }
      try {
        const decoded = verifyToken(token);
        user = decoded;
      } catch (err) {
        console.warn("Invalid or expired token:", err.message);
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
      }
    }

    const postId = req.params.postId;
    if (!postId) {
      return res.status(400).json({ success: false, message: "Missing post ID" });
    }

    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Comment cannot be empty" });
    }

    // Check post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const newComment = await Comment.create({
      post: postId,
      author: user._id || user.id,
      content: content.trim()
    });

    post.comments.push(newComment._id);
    await post.save();

    res.json({
      success: true,
      comment: {
        _id: newComment._id,
        content: newComment.content,
        author: user.name || "You",
        createdAt: newComment.createdAt
      }
    });
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ success: false, message: "Failed to add comment" });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    let user;

    if (req.session && req.session.user) {
      user = req.session.user;
    } else {
      const token = req.cookies?.jwt || (req.headers['authorization']?.split(' ')[1]);
      if (!token) {
        return res.status(401).json({ success: false, message: "Login required" });
      }
      try {
        const decoded = verifyToken(token);
        user = decoded;
      } catch (err) {
        console.warn("Invalid token:", err.message);
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
      }
    }

    const { postId, commentId } = req.params;
    if (!postId || !commentId) {
      return res.status(400).json({ success: false, message: "Missing post or comment ID" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    const isAuthor = comment.author.toString() === (user._id || user.id).toString();
    const isAdmin = user.role === 'admin';

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
