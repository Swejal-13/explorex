const express = require('express');
const { uploadImage, uploadBlog } = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/image', protect, uploadImage.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  res.json({ success: true, url: req.file.path, publicId: req.file.filename });
});

router.post('/blog-image', protect, uploadBlog.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  res.json({ success: true, url: req.file.path, publicId: req.file.filename });
});

module.exports = router;
