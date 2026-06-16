// ── authRoutes.js ──────────────────────────────────────────────────────────
const express = require('express');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
  ],
  authController.register
);
router.post('/login',    authLimiter, authController.login);
router.post('/google',   authLimiter, authController.googleAuth);
router.post('/refresh',  authController.refreshToken);
router.post('/logout',   protect, authController.logout);
router.get('/me',        protect, authController.getMe);
router.put('/me',        protect, authController.updateProfile);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password/:token', authLimiter, authController.resetPassword);

module.exports = router;
