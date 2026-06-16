const express = require('express');
const bookCtrl = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);
router.post('/',                bookCtrl.createBooking);
router.post('/verify-payment',  bookCtrl.verifyPayment);
router.get('/my',               bookCtrl.getMyBookings);
router.get('/:id',              bookCtrl.getBooking);
router.put('/:id/cancel',       bookCtrl.cancelBooking);

module.exports = router;
