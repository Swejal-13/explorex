const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned in queries by default
    },
    avatar: { type: String, default: '' },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    googleId: { type: String, default: null },
    bio: { type: String, maxlength: 300, default: '' },
    preferences: {
      interests:   { type: [String], default: [] },
      budget:      { type: String, enum: ['budget', 'mid-range', 'luxury'], default: 'mid-range' },
      travelStyle: { type: [String], default: [] },
    },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }],
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    resetPasswordToken:   { type: String },
    resetPasswordExpires: { type: Date },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Return safe public profile
userSchema.methods.toPublicJSON = function () {
  return {
    _id:         this._id,
    name:        this.name,
    email:       this.email,
    avatar:      this.avatar,
    role:        this.role,
    bio:         this.bio,
    preferences: this.preferences,
    createdAt:   this.createdAt,
  };
};

//userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });

module.exports = mongoose.model('User', userSchema);
