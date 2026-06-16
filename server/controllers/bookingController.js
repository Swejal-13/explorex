//const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const Notification = require('../models/Notification');
const { sendEmail } = require('../utils/email');
const { emitToUser } = require('../sockets');

//const razorpay = new Razorpay({
  //key_id:     process.env.RAZORPAY_KEY_ID,
  //key_secret: process.env.RAZORPAY_KEY_SECRET,
//});

// ── @POST /api/bookings ────────────────────────────────────────────────────
exports.createBooking = async (req, res, next) => {
  try {
    const { hotelId, roomType, checkIn, checkOut, guests, guestDetails, specialRequests } = req.body;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel || !hotel.isActive) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    const room = hotel.roomTypes.find((r) => r.name === roomType && r.available);
    if (!room) {
      return res.status(400).json({ success: false, message: 'Room type unavailable' });
    }

    // Create Razorpay order first
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    const subtotal = nights * room.price;
    const taxes = Math.round(subtotal * 0.12);
    const totalAmount = subtotal + taxes;

    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100, // paise
      currency: 'INR',
      receipt: `explorex_${Date.now()}`,
    });

    const booking = await Booking.create({
      user: req.user._id,
      hotel: hotelId,
      destination: hotel.destination,
      roomType,
      checkIn,
      checkOut,
      guests,
      pricePerNight: room.price,
      guestDetails: guestDetails || { name: req.user.name, email: req.user.email },
      specialRequests,
      payment: {
        razorpayOrderId: razorpayOrder.id,
        status: 'pending',
      },
    });

    res.status(201).json({
      success: true,
      booking,
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    next(err);
  }
};

// ── @POST /api/bookings/verify-payment ────────────────────────────────────
exports.verifyPayment = async (req, res, next) => {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        status: 'confirmed',
        'payment.status': 'paid',
        'payment.razorpayPaymentId': razorpayPaymentId,
        'payment.razorpaySignature': razorpaySignature,
        'payment.paidAt': new Date(),
      },
      { new: true }
    ).populate('hotel', 'name address');

    // Send confirmation email
    sendEmail({
      to: booking.guestDetails.email || req.user.email,
      subject: `Booking Confirmed — ${booking.hotel.name} | ${booking.confirmationCode}`,
      html: `<p>Your booking at <strong>${booking.hotel.name}</strong> is confirmed!<br>
        Confirmation code: <strong>${booking.confirmationCode}</strong><br>
        Check-in: ${new Date(booking.checkIn).toDateString()}<br>
        Check-out: ${new Date(booking.checkOut).toDateString()}</p>`,
    }).catch(() => {});

    // In-app notification
    const notif = await Notification.create({
      user: req.user._id,
      type: 'booking_confirmed',
      title: 'Booking Confirmed!',
      message: `Your stay at ${booking.hotel.name} has been confirmed. Code: ${booking.confirmationCode}`,
      link: `/bookings/${booking._id}`,
    });
    emitToUser(req.user._id.toString(), 'notification', notif);

    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

// ── @GET /api/bookings/my ──────────────────────────────────────────────────
exports.getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('hotel', 'name images address category')
        .populate('destination', 'name country')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Booking.countDocuments(filter),
    ]);

    res.json({ success: true, bookings, total, page: Number(page) });
  } catch (err) {
    next(err);
  }
};

// ── @GET /api/bookings/:id ─────────────────────────────────────────────────
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id })
      .populate('hotel')
      .populate('destination');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

// ── @PUT /api/bookings/:id/cancel ─────────────────────────────────────────
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Already cancelled' });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = req.body.reason || 'User requested cancellation';
    booking.cancelledAt = new Date();
    await booking.save();

    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};
