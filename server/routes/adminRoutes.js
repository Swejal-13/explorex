const express = require('express');
const adminCtrl = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats',               adminCtrl.getStats);
router.get('/users',               adminCtrl.getUsers);
router.put('/users/:id',           adminCtrl.updateUser);
router.get('/bookings',            adminCtrl.getAllBookings);
router.get('/analytics/revenue',   adminCtrl.getRevenueAnalytics);

module.exports = router;
