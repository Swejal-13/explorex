const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Storage for general images
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'explorex',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});

// Storage for blog images (different folder + larger size)
const blogStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'explorex/blogs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }],
  },
});

const uploadImage = multer({ storage: imageStorage, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadBlog  = multer({ storage: blogStorage,  limits: { fileSize: 10 * 1024 * 1024 } });

module.exports = { cloudinary, uploadImage, uploadBlog };
