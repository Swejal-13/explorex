const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title:  { type: String, required: true, trim: true, maxlength: 200 },
    slug:   { type: String, unique: true, lowercase: true },
    excerpt:{ type: String, maxlength: 500 },
    content:{ type: String, required: true }, // HTML from rich text editor

    coverImage: { url: String, publicId: String },
    images:     [{ url: String, publicId: String, caption: String }],

    destination: { type: String },
    destinationRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination' },

    tags:       [{ type: String, lowercase: true, trim: true }],
    category: {
      type: String,
      enum: ['Travel Guide', 'Adventure', 'Food & Culture', 'Budget Travel', 'Luxury', 'Solo Travel', 'Family', 'Photography'],
      default: 'Travel Guide',
    },

    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },

    likes:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likeCount:    { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    viewCount:    { type: Number, default: 0 },

    readTime:     { type: Number }, // minutes
    isFeatured:   { type: Boolean, default: false },
    publishedAt:  { type: Date },
  },
  { timestamps: true }
);

// Auto-generate slug
blogSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 100) + '-' + Date.now().toString(36);
  }
  if (this.isModified('content')) {
    const words = this.content.replace(/<[^>]*>/g, '').split(' ').length;
    this.readTime = Math.max(1, Math.round(words / 200));
  }
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

blogSchema.index({ author: 1, status: 1 });
blogSchema.index({ tags: 1, status: 1 });
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });
blogSchema.index({ isFeatured: -1, likeCount: -1 });

module.exports = mongoose.model('Blog', blogSchema);
