const express = require('express');
const aiCtrl = require('../controllers/aiController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: 'AI rate limit reached' });

router.post('/itinerary',       aiLimiter, optionalAuth, aiCtrl.generateItinerary);
router.get('/recommendations',  protect, aiCtrl.getRecommendations);
router.get('/my-plans',         protect, aiCtrl.getMyPlans);
router.delete('/plans/:id',     protect, aiCtrl.deletePlan);

module.exports = router;
