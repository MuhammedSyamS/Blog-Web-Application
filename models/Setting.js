const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  siteTitle: { type: String, default: 'My Blog' },
  allowRegistrations: { type: Boolean, default: true }
});

module.exports = mongoose.model('Setting', settingSchema);
