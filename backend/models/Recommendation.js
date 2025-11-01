// backend/models/Recommendation.js
const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'jobs',
    required: true
  },
  matchScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  matchDetails: {
    skillsMatch: {
      matched: [String],
      missing: [String],
      percentage: Number
    },
    experienceMatch: {
      score: Number,
      reason: String
    },
    locationMatch: {
      score: Number,
      reason: String
    }
  },
  reasoning: String, // Human-readable explanation
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000 // Auto-delete after 30 days
  },
  viewed: {
    type: Boolean,
    default: false
  },
  viewedAt: Date
});

// Index for efficient querying
recommendationSchema.index({ candidateId: 1, matchScore: -1 });
recommendationSchema.index({ jobId: 1, matchScore: -1 });

module.exports = mongoose.model('recommendations', recommendationSchema);