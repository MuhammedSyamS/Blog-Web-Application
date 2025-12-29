const mongoose = require("mongoose");

const TempUserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String, // hashed but not final
  otp: String,
  otpExpires: Date
});

module.exports = mongoose.model("TempUser", TempUserSchema);
