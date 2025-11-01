// backend/models/Skill.js
const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  category: {
    type: String,
    enum: [
      'programming',
      'framework',
      'database',
      'cloud',
      'devops',
      'design',
      'soft-skill',
      'language',
      'tool',
      'other'
    ],
    default: 'other'
  },
  synonyms: [String], // e.g., ['js', 'javascript', 'ecmascript']
  usageCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Text index for skill search
skillSchema.index({ name: 'text', synonyms: 'text' });

module.exports = mongoose.model('skills', skillSchema);