const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true // ensures comment is linked to a post
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // ensures a comment must have an author
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'], // better validation message
    trim: true, // removes accidental extra spaces
    minlength: [1, 'Comment cannot be empty']
  },
},
  { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);
