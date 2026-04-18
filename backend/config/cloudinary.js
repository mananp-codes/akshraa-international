/**
 * Cloudinary Configuration
 * Used for storing and serving product images
 */

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Cloudinary storage for Multer
// Files will be stored in the 'akshraa/products' folder on Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'akshraa/products',         // Folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // Allowed image types
    transformation: [
      { width: 800, height: 800, crop: 'limit', quality: 'auto' } // Optimize images
    ],
  },
});

// Multer middleware with 5MB file size limit and image type validation
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

module.exports = { cloudinary, upload };
