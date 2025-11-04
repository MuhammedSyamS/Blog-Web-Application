// controllers/likeController.js
const Post = require('../models/Post');
const User = require('../models/User');

exports.toggleLike = async (req, res) => {
  try {
    // ✅ Must be logged in
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Please log in first.' });
    }

    const userId = req.session.user._id || req.session.user.id;
    const postId = req.params.postId;

    // ✅ Find post and user
    const post = await Post.findById(postId);
    const user = await User.findById(userId);

    if (!post || !user) {
      return res.status(404).json({ success: false, message: 'Post or User not found.' });
    }

    // ✅ Toggle like on Post
    const postLikeIndex = post.likes.findIndex(id => id.toString() === userId.toString());
    const userLikeIndex = user.likedPosts.findIndex(id => id.toString() === postId.toString());

    let liked;
    if (postLikeIndex === -1) {
      // 👍 Like Post
      post.likes.push(userId);
      user.likedPosts.push(postId);
      liked = true;
    } else {
      // 👎 Unlike Post
      post.likes.splice(postLikeIndex, 1);
      if (userLikeIndex !== -1) user.likedPosts.splice(userLikeIndex, 1);
      liked = false;
    }

    // ✅ Save both documents
    await post.save();
    await user.save();

    res.json({
      success: true,
      liked,
      likesCount: post.likes.length,
    });

  } catch (err) {
    console.error('Error toggling like:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
