
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },

  // ✅ Track liked posts
  likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
}, 
{
  timestamps: true // ✅ correct place (schema options)
});

module.exports = mongoose.model('User', UserSchema);
