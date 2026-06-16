const Anthropic = require('@anthropic-ai/sdk');
const TripPlan = require('../models/TripPlan');
const Destination = require('../models/Destination');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── @POST /api/ai/itinerary ────────────────────────────────────────────────
exports.generateItinerary = async (req, res, next) => {
  try {
    const { destination, budget, days, interests = [] } = req.body;

    if (!destination || !days) {
      return res.status(400).json({ success: false, message: 'Destination and days are required' });
    }

    const prompt = `You are an expert travel planner for India and international destinations.
Create a detailed ${days}-day itinerary for:
- Destination: ${destination}
- Budget: ₹${budget || 'flexible'} total
- Interests: ${interests.length ? interests.join(', ') : 'general tourism'}

Respond ONLY with valid JSON (no markdown, no backticks):
{
  "title": "descriptive trip title",
  "summary": "1-2 sentence overview",
  "days": [
    {
      "day": 1,
      "title": "Day theme",
      "activities": "Morning: ... Afternoon: ... Evening: ...",
      "places": ["Place 1", "Place 2"],
      "meals": ["Restaurant/Cafe suggestion"],
      "estimatedCost": 2500
    }
  ],
  "budgetBreakdown": "Accommodation: ₹X, Food: ₹Y, Transport: ₹Z, Activities: ₹W",
  "travelTips": "3 concise essential tips",
  "bestTimeToVisit": "Months or season"
}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content.map((c) => c.text || '').join('');
    const clean = text.replace(/```json|```/g, '').trim();
    const plan = JSON.parse(clean);

    // Save to DB if user is authenticated
    let savedPlan = null;
    if (req.user) {
      // Find matching destination reference
      const destRef = await Destination.findOne({
        $or: [
          { name: { $regex: destination, $options: 'i' } },
          { slug: destination.toLowerCase().replace(/\s+/g, '-') },
        ],
      });

      savedPlan = await TripPlan.create({
        user:        req.user._id,
        destination,
        destinationRef: destRef?._id,
        budget:      Number(budget) || null,
        days:        Number(days),
        interests,
        title:       plan.title,
        summary:     plan.summary,
        itinerary:   plan.days,
        budgetBreakdown: plan.budgetBreakdown,
        travelTips:  plan.travelTips,
        bestTimeToVisit: plan.bestTimeToVisit,
        aiModel: 'claude',
      });
    }

    res.json({ success: true, plan, savedPlanId: savedPlan?._id });
  } catch (err) {
    next(err);
  }
};

// ── @GET /api/ai/recommendations ──────────────────────────────────────────
exports.getRecommendations = async (req, res, next) => {
  try {
    const user = req.user;
    const interests  = user.preferences?.interests  || [];
    const budget     = user.preferences?.budget     || 'mid-range';
    const travelStyle = user.preferences?.travelStyle || [];

    const allDestinations = await Destination.find({ isActive: true })
      .select('name country type tags avgBudgetPerDay rating isTrending')
      .limit(50);

    const prompt = `You are a travel recommendation engine.
User profile:
- Interests: ${interests.join(', ') || 'not specified'}
- Budget preference: ${budget}
- Travel style: ${travelStyle.join(', ') || 'general'}

Available destinations (JSON):
${JSON.stringify(allDestinations.map((d) => ({
  id: d._id,
  name: d.name,
  country: d.country,
  type: d.type,
  tags: d.tags,
  rating: d.rating,
  trending: d.isTrending,
})), null, 0)}

Return ONLY valid JSON with 5 destination IDs ranked by fit:
{
  "recommendations": [
    { "id": "...", "reason": "One sentence why it fits this user" }
  ]
}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    const text  = message.content.map((c) => c.text || '').join('');
    const clean = text.replace(/```json|```/g, '').trim();
    const { recommendations } = JSON.parse(clean);

    // Hydrate with full destination objects
    const ids = recommendations.map((r) => r.id);
    const destinations = await Destination.find({ _id: { $in: ids } });

    const result = recommendations.map((r) => ({
      reason: r.reason,
      destination: destinations.find((d) => d._id.toString() === r.id),
    })).filter((r) => r.destination);

    res.json({ success: true, recommendations: result });
  } catch (err) {
    next(err);
  }
};

// ── @GET /api/ai/my-plans ──────────────────────────────────────────────────
exports.getMyPlans = async (req, res, next) => {
  try {
    const plans = await TripPlan.find({ user: req.user._id })
      .sort('-createdAt')
      .limit(20);
    res.json({ success: true, plans });
  } catch (err) {
    next(err);
  }
};

// ── @DELETE /api/ai/plans/:id ──────────────────────────────────────────────
exports.deletePlan = async (req, res, next) => {
  try {
    const plan = await TripPlan.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.json({ success: true, message: 'Plan deleted' });
  } catch (err) {
    next(err);
  }
};
