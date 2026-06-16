const User = require('../models/User');
const Booking = require('../models/Booking');
const Destination = require('../models/Destination');
const Hotel = require('../models/Hotel');
const Blog = require('../models/Blog');

// ── @GET /api/admin/stats ──────────────────────────────────────────────────
exports.getStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth    = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalUsers, newUsersThisMonth,
      totalBookings, bookingsThisMonth,
      totalRevenue, revenueThisMonth,
      totalDestinations, totalHotels, totalBlogs,
      recentBookings, topDestinations,
      bookingsByStatus,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Booking.countDocuments({ status: { $ne: 'cancelled' } }),
      Booking.countDocuments({ status: 'confirmed', createdAt: { $gte: startOfMonth } }),
      Booking.aggregate([
        { $match: { 'payment.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Booking.aggregate([
        { $match: { 'payment.status': 'paid', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Destination.countDocuments({ isActive: true }),
      Hotel.countDocuments({ isActive: true }),
      Blog.countDocuments({ status: 'published' }),
      Booking.find({ status: 'confirmed' })
        .sort('-createdAt')
        .limit(5)
        .populate('user', 'name')
        .populate('hotel', 'name'),
      Destination.find({ isActive: true }).sort('-viewCount').limit(5).select('name country viewCount rating'),
      Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      success: true,
      stats: {
        users:        { total: totalUsers, thisMonth: newUsersThisMonth },
        bookings:     { total: totalBookings, thisMonth: bookingsThisMonth },
        revenue:      { total: totalRevenue[0]?.total || 0, thisMonth: revenueThisMonth[0]?.total || 0 },
        destinations: totalDestinations,
        hotels:       totalHotels,
        blogs:        totalBlogs,
      },
      recentBookings,
      topDestinations,
      bookingsByStatus,
    });
  } catch (err) {
    next(err);
  }
};

// ── @GET /api/admin/users ──────────────────────────────────────────────────
exports.getUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    if (role) filter.role = role;

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, users, total });
  } catch (err) {
    next(err);
  }
};

// ── @PUT /api/admin/users/:id ──────────────────────────────────────────────
exports.updateUser = async (req, res, next) => {
  try {
    const { role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role, isActive }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ── @GET /api/admin/bookings ───────────────────────────────────────────────
exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('user', 'name email')
        .populate('hotel', 'name')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Booking.countDocuments(filter),
    ]);
    res.json({ success: true, bookings, total });
  } catch (err) {
    next(err);
  }
};

// ── @GET /api/admin/analytics/revenue ─────────────────────────────────────
exports.getRevenueAnalytics = async (req, res, next) => {
  try {
    const monthlyRevenue = await Booking.aggregate([
      { $match: { 'payment.status': 'paid' } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    res.json({ success: true, monthlyRevenue });
  } catch (err) {
    next(err);
  }
};
