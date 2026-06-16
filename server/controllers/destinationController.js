const Destination = require('../models/Destination');
const { cacheAside, invalidate } = require('../config/redis');

// ── @GET /api/destinations ─────────────────────────────────────────────────
exports.getDestinations = async (req, res, next) => {
  try {
    const {
      search, type, trending, featured,
      minBudget, maxBudget, sort = '-rating',
      page = 1, limit = 12,
    } = req.query;

    const filter = { isActive: true };
    if (search) filter.$text = { $search: search };
    if (type)   filter.type = type;
    if (trending === 'true')  filter.isTrending = true;
    if (featured === 'true')  filter.isFeatured = true;
    if (minBudget || maxBudget) {
      filter['avgBudgetPerDay.midRange'] = {};
      if (minBudget) filter['avgBudgetPerDay.midRange'].$gte = Number(minBudget);
      if (maxBudget) filter['avgBudgetPerDay.midRange'].$lte = Number(maxBudget);
    }

    const cacheKey = `destinations:${JSON.stringify({ filter, sort, page, limit })}`;
    const data = await cacheAside(cacheKey, async () => {
      const skip = (Number(page) - 1) * Number(limit);
      const [destinations, total] = await Promise.all([
        Destination.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(Number(limit))
          .select('-__v'),
        Destination.countDocuments(filter),
      ]);
      return { destinations, total, page: Number(page), pages: Math.ceil(total / limit) };
    }, 120); // cache 2 min

    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

// ── @GET /api/destinations/:id ─────────────────────────────────────────────
exports.getDestination = async (req, res, next) => {
  try {
    const dest = await Destination.findOne({
      $or: [
        { _id: req.params.id.match(/^[0-9a-f]{24}$/) ? req.params.id : null },
        { slug: req.params.id },
      ],
      isActive: true,
    });

    if (!dest) return res.status(404).json({ success: false, message: 'Destination not found' });

    // Increment view count asynchronously
    Destination.findByIdAndUpdate(dest._id, { $inc: { viewCount: 1 } }).exec();

    res.json({ success: true, destination: dest });
  } catch (err) {
    next(err);
  }
};

// ── @POST /api/destinations  (admin) ──────────────────────────────────────
exports.createDestination = async (req, res, next) => {
  try {
    const dest = await Destination.create(req.body);
    await invalidate('destinations:*');
    res.status(201).json({ success: true, destination: dest });
  } catch (err) {
    next(err);
  }
};

// ── @PUT /api/destinations/:id  (admin) ───────────────────────────────────
exports.updateDestination = async (req, res, next) => {
  try {
    const dest = await Destination.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!dest) return res.status(404).json({ success: false, message: 'Not found' });
    await invalidate('destinations:*');
    res.json({ success: true, destination: dest });
  } catch (err) {
    next(err);
  }
};

// ── @DELETE /api/destinations/:id  (admin) ────────────────────────────────
exports.deleteDestination = async (req, res, next) => {
  try {
    const dest = await Destination.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!dest) return res.status(404).json({ success: false, message: 'Not found' });
    await invalidate('destinations:*');
    res.json({ success: true, message: 'Destination deactivated' });
  } catch (err) {
    next(err);
  }
};

// ── @GET /api/destinations/nearby ─────────────────────────────────────────
exports.getNearby = async (req, res, next) => {
  try {
    const { lng, lat, maxDistance = 300000 } = req.query; // metres, default 300 km
    const destinations = await Destination.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(maxDistance),
        },
      },
      isActive: true,
    }).limit(10);
    res.json({ success: true, destinations });
  } catch (err) {
    next(err);
  }
};
