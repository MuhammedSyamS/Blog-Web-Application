const Setting = require('../../models/Setting');

// 🧩 Get Settings Page
exports.getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting();
      await settings.save();
    }

    res.render('admin/settings', { settings });
  } catch (err) {
    console.error('Error loading settings:', err);
    req.flash('error_msg', 'Error loading settings.');
    res.redirect('/admin');
  }
};

// 💾 Update Settings
exports.updateSettings = async (req, res) => {
  try {
    const { siteTitle } = req.body;
    const allowRegistrations = req.body.allowRegistrations === 'on';

    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting();
    }

    settings.siteTitle = siteTitle;
    settings.allowRegistrations = allowRegistrations;
    await settings.save();

    req.flash('success_msg', 'Settings updated successfully.');
    res.redirect('/admin/settings');
  } catch (err) {
    console.error('Error updating settings:', err);
    req.flash('error_msg', 'Error saving settings.');
    res.redirect('/admin/settings');
  }
};
