// middleware/uploadMiddleware.js
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

// Storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // ensure folder exists
    const dir = path.join(__dirname, '../public/uploads');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ storage, fileFilter });


/**
 * Function to handle uploading multiple images.
 * @param {Array} files - array of files from req.files
 * @returns {Promise<Array>} - array of filenames or file info
 */

const uploadImages = async (files) => {
  if (!files || !files.length) return [];
  // for each file, you can transform/store details
  // return array of the saved file paths or names
  return files.map(file => ({
    filename: file.filename,
    path: file.path
  }));
};

/**
 * Function to delete images by filenames or paths
 * @param {Array} imagePaths - array of image paths to delete
 * @returns {Promise<void>}
 */
const deleteImages = async (imagePaths) => {
  if (!imagePaths || !imagePaths.length) return;
  for (const imgPath of imagePaths) {
    const fullPath = path.join(__dirname, '../public/uploads', imgPath);
    try {
      fs.unlinkSync(fullPath);
    } catch (err) {
      console.warn('Failed to delete image:', fullPath, err);
    }
  }
};

module.exports = {
  upload,          // to use as middleware in routes: e.g., upload.array('images', 10)
  uploadImages,
  deleteImages
};
