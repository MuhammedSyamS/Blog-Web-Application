// controllers/likeController.js
const Post = require('../models/Post');
const User = require('../models/User');
const { verifyToken } = require('../utils/jwt');

exports.toggleLike = async (req, res) => {
  try {
    let userId;

    // • Session-based auth
    if (req.session && req.session.user) {
      userId = req.session.user._id?.toString();
    } else {
      // • Token-based fallback
      const bearer = req.headers['authorization'];
      const token = req.cookies?.jwt || (bearer && bearer.split(' ')[1]);
      if (!token) {
        return res.status(401).json({ success: false, message: 'Please log in first.' });
      }
      try {
        const decoded = verifyToken(token);
        userId = (decoded.id || decoded._id)?.toString();
      } catch (err) {
        console.warn('Invalid token:', err.message);
        return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
      }
    }

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User not found.' });
    }

    const postId = req.params.postId;

    // • Use updateOne to toggle like for Post and User
    const postUpdate = await Post.updateOne(
      { _id: postId, likes: { $ne: userId } },
      { $addToSet: { likes: userId } }
    );
    const postWasAdded = postUpdate.modifiedCount > 0;

    let liked;
    if (postWasAdded) {
      // It means like was just added
      await User.updateOne(
        { _id: userId, likedPosts: { $ne: postId } },
        { $addToSet: { likedPosts: postId } }
      );
      liked = true;
    } else {
      // It means like existed so remove
      await Post.updateOne(
        { _id: postId },
        { $pull: { likes: userId } }
      );
      await User.updateOne(
        { _id: userId },
        { $pull: { likedPosts: postId } }
      );
      liked = false;
    }

    // Get fresh likes count directly (without loading full document)
    const updatedPost = await Post.findById(postId).select('likes').lean();
    const likesCount = updatedPost.likes.length;

    res.json({ success: true, liked, likesCount });

  } catch (err) {
    console.error('Error toggling like:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
