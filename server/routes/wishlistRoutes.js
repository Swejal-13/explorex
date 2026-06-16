const express = require('express');
const User = require('../models/User');
const Destination = require('../models/Destination');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json({ success: true, wishlist: user.wishlist });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { destinationId } = req.body;
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { wishlist: destinationId } });
    await Destination.findByIdAndUpdate(destinationId, { $inc: { wishlistCount: 1 } });
    res.json({ success: true, message: 'Added to wishlist' });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $pull: { wishlist: req.params.id } });
    await Destination.findByIdAndUpdate(req.params.id, { $inc: { wishlistCount: -1 } });
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (err) { next(err); }
});

module.exports = router;
