const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }], 
  images: [String],
  status: { type: String, enum: ['published', 'draft', 'pending'], default: 'published' }
},{timestamps: true }); 


module.exports = mongoose.model('Post', PostSchema);
