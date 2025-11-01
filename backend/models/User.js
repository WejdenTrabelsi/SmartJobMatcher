// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['candidate', 'recruiter'],
    required: true
  },
  
  // Candidate-specific fields
  fullName: {
    type: String,
    required: function() { return this.role === 'candidate'; }
  },
  phone: String,
  location: String,
  bio: String,
  resumeUrl: String,
  skills: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'skills'
  }],
  experience: [{
    title: String,
    company: String,
    duration: String,
    description: String
  }],
  education: [{
    degree: String,
    institution: String,
    year: String
  }],
  
  // Recruiter-specific fields
  companyName: {
    type: String,
    required: function() { return this.role === 'recruiter'; }
  },
  companyWebsite: String,
  companyDescription: String,
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('users', userSchema);