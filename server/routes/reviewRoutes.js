const express = require('express');
const { Review } = require('../models/Review');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { targetType, targetId, page = 1, limit = 10 } = req.query;
    const filter = { isApproved: true };
    if (targetType) filter.targetType = targetType;
    if (targetId)   filter.targetId = targetId;
    const skip = (Number(page)-1)*Number(limit);
    const [reviews, total] = await Promise.all([
      Review.find(filter).populate('user','name avatar').sort('-createdAt').skip(skip).limit(Number(limit)),
      Review.countDocuments(filter),
    ]);
    res.json({ success: true, reviews, total });
  } catch (err) { next(err); }
});

router.post('/', protect, async (req, res, next) => {
  try {
    const existing = await Review.findOne({ user: req.user._id, targetType: req.body.targetType, targetId: req.body.targetId });
    if (existing) return res.status(409).json({ success: false, message: 'Review already submitted' });
    const review = await Review.create({ ...req.body, user: req.user._id });
    await review.populate('user','name avatar');
    res.status(201).json({ success: true, review });
  } catch (err) { next(err); }
});

module.exports = router;
