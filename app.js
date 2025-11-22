// ============================
// 📦 Import required modules
// ============================
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const Setting = require('./models/Setting');



// ============================
// ⚙️ Load environment variables
// ============================
dotenv.config();

// ============================
// 🚀 Initialize Express app
// ============================
const app = express();

// ============================
// 🖼️ View engine setup (EJS)
// ============================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ============================
// 🧩 Middleware
// ============================

// Serve static assets
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Method override (before routes)
app.use(methodOverride('_method'));

// Layout default
app.set('layout', 'layouts/main');

// ============================
// 🔐 Session & Flash setup
// ============================
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fallbacksecret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());

// ============================
// 🌍 Global template variables
// ============================
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.user = req.session.user || null;
  next();
});

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});


// ============================
// 🛣️ Route imports (Safe loading)
// ============================
const safeImport = (routePath) => {
  try {
    const route = require(routePath);
    if (typeof route !== 'function') {
      console.error(`⚠️ Route file "${routePath}" did not export a router.`);
      return (req, res) => res.status(500).send('Route misconfigured.');
    }
    return route;
  } catch (err) {
    console.error(`❌ Failed to load route: ${routePath}\n`, err.message);
    return (req, res) => res.status(500).send('Route not found or invalid.');
  }
};

// Page Title//

app.use(async (req, res, next) => {
  try {
    const settings = await Setting.findOne();
    res.locals.siteTitle = settings ? settings.siteTitle : 'My Blog';
  } catch {
    res.locals.siteTitle = 'My Blog';
  }
  next();
});


// ✅ Debug flash test route
app.get('/test-flash', (req, res) => {
  req.flash('success_msg', '✅ Flash success works!');
  req.flash('error_msg', '❌ Flash error works!');
  res.redirect('/login');
});

// Public routes
app.use('/', safeImport('./routes/authRoutes'));
app.use('/', safeImport('./routes/mainRoutes'));
app.use('/user', safeImport('./routes/userRoutes'));
app.use('/posts', safeImport('./routes/postRoutes'));
app.use('/posts', safeImport('./routes/likeRoutes'));
app.use('/', safeImport('./routes/commentRoutes'));

// ✅ Admin routes
app.use('/admin/users', safeImport('./routes/admin/adminUserRoutes'));
app.use('/admin/posts', safeImport('./routes/admin/adminPostRoutes'));
app.use('/admin/settings', safeImport('./routes/admin/adminSettingsRoutes'));
app.use('/admin/dashboard', safeImport('./routes/admin/adminDashboardRoutes'));

// ============================
// 🏠 Default route
// ============================
app.get('/', (req, res) => res.redirect('/index'));

// ============================
// 🗄️ Connect to MongoDB & start server
// ============================
const PORT = process.env.PORT || 5001;
const DB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blogapp';

mongoose
  .connect(DB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });
