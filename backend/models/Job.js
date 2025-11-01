// backend/models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship'],
    default: 'full-time'
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead'],
    default: 'mid'
  },
  salaryRange: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  requiredSkills: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'skills'
  }],
  responsibilities: [String],
  qualifications: [String],
  benefits: [String],
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  },
  applicationsCount: {
    type: Number,
    default: 0
  },
  postedAt: {
    type: Date,
    default: Date.now
  },
  closingDate: Date
});

// Index for search optimization
jobSchema.index({ title: 'text', description: 'text', company: 'text' });

module.exports = mongoose.model('jobs', jobSchema);