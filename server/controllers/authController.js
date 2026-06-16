const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');
const logger = require('../utils/logger');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Token helpers ──────────────────────────────────────────────────────────
const signAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const signRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' });

const sendTokens = async (user, statusCode, res) => {
  const accessToken  = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  res.status(statusCode).json({
    success: true,
    accessToken,
    refreshToken,
    user: user.toPublicJSON(),
  });
};

// ── @POST /api/auth/register ───────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    logger.info(`New user registered: ${email}`);
    await sendTokens(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// ── @POST /api/auth/login ──────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account deactivated' });
    }

    await sendTokens(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ── @POST /api/auth/google ─────────────────────────────────────────────────
exports.googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub: googleId, email, name, picture } = ticket.getPayload();

    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (!user) {
      user = await User.create({ name, email, googleId, avatar: picture });
    } else if (!user.googleId) {
      user.googleId = googleId;
      if (picture && !user.avatar) user.avatar = picture;
      await user.save({ validateBeforeSave: false });
    }

    await sendTokens(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ── @POST /api/auth/refresh ────────────────────────────────────────────────
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const newAccessToken = signAccessToken(user._id);
    res.json({ success: true, accessToken: newAccessToken });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Token expired or invalid' });
  }
};

// ── @POST /api/auth/logout ─────────────────────────────────────────────────
exports.logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

// ── @GET /api/auth/me ──────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user.toPublicJSON() });
};

// ── @PUT /api/auth/me ──────────────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'bio', 'avatar', 'preferences'];
    const updates = {};
    allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
};

// ── @POST /api/auth/forgot-password ───────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken   = crypto.createHash('sha256').update(token).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hr
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await sendEmail({
      to: user.email,
      subject: 'ExploreX — Reset Your Password',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`,
    });

    res.json({ success: true, message: 'Reset link sent to your email' });
  } catch (err) {
    next(err);
  }
};

// ── @POST /api/auth/reset-password/:token ─────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token is invalid or has expired' });
    }

    user.password = req.body.password;
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    await sendTokens(user, 200, res);
  } catch (err) {
    next(err);
  }
};
