const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'booking_confirmed', 'booking_cancelled', 'booking_reminder',
        'blog_like', 'blog_comment', 'blog_comment_reply',
        'review_reply', 'new_follower',
        'trip_reminder', 'system',
      ],
      required: true,
    },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    link:    { type: String },
    isRead:  { type: Boolean, default: false },
    data:    { type: mongoose.Schema.Types.Mixed }, // extra context
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
