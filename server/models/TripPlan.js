const mongoose = require('mongoose');

const daySchema = new mongoose.Schema({
  day:        { type: Number, required: true },
  title:      String,
  activities: { type: String }, // morning / afternoon / evening narrative
  places:     [String],
  meals:      [String],
  estimatedCost: Number,
}, { _id: false });

const tripPlanSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    destination: { type: String, required: true },
    destinationRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination' },

    budget:      { type: Number },
    days:        { type: Number, required: true },
    interests:   [String],

    title:       { type: String },
    summary:     { type: String },
    itinerary:   [daySchema],

    budgetBreakdown: { type: String },
    travelTips:      { type: String },
    bestTimeToVisit: String,

    aiModel:     { type: String, default: 'gemini' },
    isPublic:    { type: Boolean, default: false },
    isSaved:     { type: Boolean, default: true },
    likes:       { type: Number, default: 0 },
  },
  { timestamps: true }
);

tripPlanSchema.index({ user: 1, createdAt: -1 });
tripPlanSchema.index({ destination: 'text' });

module.exports = mongoose.model('TripPlan', tripPlanSchema);
