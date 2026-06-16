const express = require('express');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort('-createdAt').limit(30);
    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.json({ success: true, notifications, unreadCount });
  } catch (err) { next(err); }
});

router.put('/read-all', async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.put('/:id/read', async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isRead: true });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
