const mongoose = require('mongoose');

// ── Comment ────────────────────────────────────────────────────────────────
const commentSchema = new mongoose.Schema(
  {
    blog:   { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text:   { type: String, required: true, maxlength: 1000 },
    likes:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null }, // threaded replies
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

commentSchema.index({ blog: 1, createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);

// ── Review ─────────────────────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema(
  {
    user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: {
      type: String,
      enum: ['Hotel', 'Destination', 'Package'],
      required: true,
    },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'targetType' },

    rating: { type: Number, required: true, min: 1, max: 5 },
    title:  { type: String, maxlength: 150 },
    body:   { type: String, maxlength: 2000 },

    images: [{ url: String, publicId: String }],

    categories: {
      cleanliness:  { type: Number, min: 1, max: 5 },
      location:     { type: Number, min: 1, max: 5 },
      service:      { type: Number, min: 1, max: 5 },
      valueForMoney:{ type: Number, min: 1, max: 5 },
    },

    travelType: {
      type: String,
      enum: ['solo', 'couple', 'family', 'friends', 'business'],
    },

    helpfulVotes: { type: Number, default: 0 },
    isVerifiedStay: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

reviewSchema.index({ targetType: 1, targetId: 1, rating: -1 });
reviewSchema.index({ user: 1 });

// Update parent rating after a review is saved
reviewSchema.post('save', async function () {
  const model = mongoose.model(this.targetType);
  const result = await reviewSchema.model('Review').aggregate([
    { $match: { targetType: this.targetType, targetId: this.targetId } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (result.length) {
    await model.findByIdAndUpdate(this.targetId, {
      rating: Math.round(result[0].avgRating * 10) / 10,
      reviewCount: result[0].count,
    });
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = { Comment, Review };
