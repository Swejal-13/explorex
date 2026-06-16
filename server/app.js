const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// ── Route imports ──────────────────────────────────────────────────────────
const authRoutes        = require('./routes/authRoutes');
const destinationRoutes = require('./routes/destinationRoutes');
const hotelRoutes       = require('./routes/hotelRoutes');
const bookingRoutes     = require('./routes/bookingRoutes');
const blogRoutes        = require('./routes/blogRoutes');
const reviewRoutes      = require('./routes/reviewRoutes');
const wishlistRoutes    = require('./routes/wishlistRoutes');
const aiRoutes          = require('./routes/aiRoutes');
const notificationRoutes= require('./routes/notificationRoutes');
const adminRoutes       = require('./routes/adminRoutes');
const uploadRoutes      = require('./routes/uploadRoutes');

const app = express();

// ── Security middleware ────────────────────────────────────────────────────
app.use(helmet());
app.use(mongoSanitize());
app.use(xssClean());

// ── CORS ──────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Compression & body parsing ─────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Request logging ────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// ── Global rate limiter ────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

// ── Health check ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

// ── API routes ─────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/destinations',  destinationRoutes);
app.use('/api/hotels',        hotelRoutes);
app.use('/api/bookings',      bookingRoutes);
app.use('/api/blogs',         blogRoutes);
app.use('/api/reviews',       reviewRoutes);
app.use('/api/wishlist',      wishlistRoutes);
app.use('/api/ai',            aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/upload',        uploadRoutes);

// ── 404 & error handlers ───────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
