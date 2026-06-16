const express = require('express');
const blogCtrl = require('../controllers/blogController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/',               optionalAuth, blogCtrl.getBlogs);
router.get('/:slug',          optionalAuth, blogCtrl.getBlog);
router.post('/',              protect, blogCtrl.createBlog);
router.put('/:id',            protect, blogCtrl.updateBlog);
router.delete('/:id',         protect, blogCtrl.deleteBlog);
router.post('/:id/like',      protect, blogCtrl.toggleLike);
router.get('/:id/comments',   blogCtrl.getComments);
router.post('/:id/comments',  protect, blogCtrl.addComment);

module.exports = router;
