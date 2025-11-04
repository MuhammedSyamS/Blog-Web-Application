// middleware/errorHandler.js
exports.errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);
  req.flash('error_msg', 'Something went wrong!');
  res.status(500).render('pages/error', {
    title: 'Error',
    message: err.message,
    error: err
  });
};
