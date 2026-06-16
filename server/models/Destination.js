const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    state:   { type: String, trim: true },
    slug:    { type: String, unique: true, lowercase: true },
    description: { type: String, required: true, maxlength: 2000 },
    shortDesc:   { type: String, maxlength: 300 },

    images: [
      {
        url:       String,
        publicId:  String,
        caption:   String,
        isPrimary: { type: Boolean, default: false },
      },
    ],

    type: {
      type: String,
      enum: ['Beach', 'Mountain', 'Cultural', 'Adventure', 'Luxury', 'Wildlife', 'City', 'Spiritual'],
      required: true,
    },

    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },

    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },

    bestTimeToVisit: [String],
    languages:       [String],
    currency:        { type: String },

    avgBudgetPerDay: {
      budget:   Number, // ₹ per person per day
      midRange: Number,
      luxury:   Number,
    },

    highlights:   [String],
    tags:         [{ type: String, lowercase: true }],
    isTrending:   { type: Boolean, default: false },
    isFeatured:   { type: Boolean, default: false },
    isActive:     { type: Boolean, default: true },
    viewCount:    { type: Number, default: 0 },
    wishlistCount:{ type: Number, default: 0 },
  },
  { timestamps: true }
);

destinationSchema.index({ location: '2dsphere' });
destinationSchema.index({ name: 'text', country: 'text', tags: 'text' });
destinationSchema.index({ type: 1, isTrending: -1, rating: -1 });

// Auto-generate slug from name
destinationSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  next();
});

module.exports = mongoose.model('Destination', destinationSchema);
