const express = require('express');
const Hotel = require('../models/Hotel');
const { protect, authorize } = require('../middleware/authMiddleware');
const { cacheAside } = require('../config/redis');
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { destination, category, minPrice, maxPrice, stars, page = 1, limit = 12, sort = '-rating' } = req.query;
    const filter = { isActive: true };
    if (destination) filter.destination = destination;
    if (category)    filter.category = category;
    if (stars)       filter.starRating = Number(stars);
    if (minPrice || maxPrice) {
      filter['pricePerNight.min'] = {};
      if (minPrice) filter['pricePerNight.min'].$gte = Number(minPrice);
      if (maxPrice) filter['pricePerNight.min'].$lte = Number(maxPrice);
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [hotels, total] = await Promise.all([
      Hotel.find(filter).populate('destination','name country').sort(sort).skip(skip).limit(Number(limit)).select('-__v'),
      Hotel.countDocuments(filter),
    ]);
    res.json({ success: true, hotels, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate('destination');
    if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
    res.json({ success: true, hotel });
  } catch (err) { next(err); }
});

router.post('/',    protect, authorize('admin'), async (req, res, next) => {
  try { const h = await Hotel.create(req.body); res.status(201).json({ success: true, hotel: h }); }
  catch (err) { next(err); }
});

router.put('/:id',  protect, authorize('admin'), async (req, res, next) => {
  try {
    const h = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!h) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, hotel: h });
  } catch (err) { next(err); }
});

module.exports = router;
