const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination' },

    roomType:   { type: String, required: true },
    checkIn:    { type: Date, required: true },
    checkOut:   { type: Date, required: true },
    nights:     { type: Number },
    guests:     { type: Number, required: true, default: 2, min: 1 },

    pricePerNight: { type: Number, required: true },
    subtotal:      { type: Number },
    taxes:         { type: Number },
    totalAmount:   { type: Number, required: true },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'refunded'],
      default: 'pending',
    },

    payment: {
      method:      { type: String, enum: ['razorpay', 'upi', 'card', 'netbanking'], default: 'razorpay' },
      status:      { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
      razorpayOrderId:   String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      paidAt: Date,
    },

    guestDetails: {
      name:  String,
      email: String,
      phone: String,
    },

    specialRequests: { type: String, maxlength: 500 },
    cancellationReason: String,
    cancelledAt: Date,

    confirmationCode: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

// Calculate derived fields before saving
bookingSchema.pre('save', function (next) {
  if (this.checkIn && this.checkOut) {
    const diffMs = new Date(this.checkOut) - new Date(this.checkIn);
    this.nights = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    this.subtotal = this.nights * this.pricePerNight;
    this.taxes = Math.round(this.subtotal * 0.12);
    this.totalAmount = this.subtotal + this.taxes;
  }
  if (!this.confirmationCode) {
    this.confirmationCode = 'EX' + Date.now().toString(36).toUpperCase();
  }
  next();
});

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ hotel: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
