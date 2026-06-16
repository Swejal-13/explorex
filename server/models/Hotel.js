const mongoose = require('mongoose');

const roomTypeSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: String,
  price:       { type: Number, required: true }, // per night in INR
  maxGuests:   { type: Number, default: 2 },
  amenities:   [String],
  images:      [{ url: String, publicId: String }],
  available:   { type: Boolean, default: true },
}, { _id: false });

const hotelSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, unique: true, lowercase: true },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },
    address:     { type: String, required: true },

    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },

    category: {
      type: String,
      enum: ['Budget', 'Standard', 'Deluxe', 'Luxury', 'Heritage', 'Resort', 'Boutique'],
      required: true,
    },

    starRating: { type: Number, min: 1, max: 5 },
    rating:     { type: Number, default: 0, min: 0, max: 5 },
    reviewCount:{ type: Number, default: 0 },

    description:  { type: String, maxlength: 3000 },
    shortDesc:    { type: String, maxlength: 300 },

    images: [{ url: String, publicId: String, isPrimary: Boolean }],

    amenities:    [String],
    roomTypes:    [roomTypeSchema],

    pricePerNight: {
      min: Number,
      max: Number,
    },

    policies: {
      checkIn:    { type: String, default: '14:00' },
      checkOut:   { type: String, default: '12:00' },
      cancellation: String,
      petFriendly: { type: Boolean, default: false },
    },

    contact: {
      phone: String,
      email: String,
      website: String,
    },

    tags:      [String],
    isFeatured:{ type: Boolean, default: false },
    isActive:  { type: Boolean, default: true },
  },
  { timestamps: true }
);

hotelSchema.index({ location: '2dsphere' });
hotelSchema.index({ destination: 1, rating: -1 });
hotelSchema.index({ name: 'text', address: 'text' });

hotelSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  next();
});

module.exports = mongoose.model('Hotel', hotelSchema);
