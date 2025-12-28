// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },

  likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],

  // OTP fields
  otp: { type: String },
  otpExpires: { type: Date },
  isVerified: { type: Boolean, default: false }
}, 
{
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
