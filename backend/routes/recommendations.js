// backend/routes/recommendations.js
const express = require('express');
const router = express.Router();
const Recommendation = require('../models/Recommendation');
const Job = require('../models/Job');
const User = require('../models/User');
const Application = require('../models/Application');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { generateJobMatch } = require('../utils/nlpMatcher');

// Generate recommendations for a candidate (candidates only)
router.post('/generate', authMiddleware, roleMiddleware(['candidate']), async (req, res) => {
  try {
    const candidateId = req.user._id;
    
    // Get candidate profile with populated skills
    const candidate = await User.findById(candidateId).populate('skills');
    
    if (!candidate.skills || candidate.skills.length === 0) {
      return res.status(400).json({ 
        message: 'Please add skills to your profile to get job recommendations' 
      });
    }
    
    // Get all active jobs
    const jobs = await Job.find({ status: 'active' })
      .populate('requiredSkills')
      .populate('recruiterId', 'companyName');
    
    if (jobs.length === 0) {
      return res.status(404).json({ message: 'No active jobs available' });
    }
    
    // Get jobs candidate has already applied to
    const appliedJobs = await Application.find({ 
      candidateId 
    }).select('jobId');
    const appliedJobIds = appliedJobs.map(app => app.jobId.toString());
    
    // Delete old recommendations for this candidate
    await Recommendation.deleteMany({ candidateId });
    
    // Generate recommendations
    const recommendations = [];
    
    for (const job of jobs) {
      // Skip if already applied
      if (appliedJobIds.includes(job._id.toString())) {
        continue;
      }
      
      // Calculate match score
      const matchResult = await generateJobMatch(candidate, job);
      
      // Only recommend if match score is above threshold (e.g., 50%)
      if (matchResult.matchScore >= 50) {
        const recommendation = new Recommendation({
          candidateId,
          jobId: job._id,
          matchScore: matchResult.matchScore,
          matchDetails: matchResult.matchDetails,
          reasoning: matchResult.reasoning
        });
        
        recommendations.push(recommendation);
      }
    }
    
    // Save all recommendations
    if (recommendations.length > 0) {
      await Recommendation.insertMany(recommendations);
    }
    
    res.json({
      message: `Generated ${recommendations.length} job recommendations`,
      count: recommendations.length,
      recommendations: recommendations.sort((a, b) => b.matchScore - a.matchScore)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get recommendations for current candidate
router.get('/', authMiddleware, roleMiddleware(['candidate']), async (req, res) => {
  try {
    const { minScore = 50, limit = 20 } = req.query;
    
    const recommendations = await Recommendation.find({ 
      candidateId: req.user._id,
      matchScore: { $gte: minScore }
    })
      .populate({
        path: 'jobId',
        populate: [
          { path: 'requiredSkills', select: 'name category' },
          { path: 'recruiterId', select: 'companyName companyWebsite' }
        ]
      })
      .sort({ matchScore: -1 })
      .limit(parseInt(limit));
    
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single recommendation by ID
router.get('/:id', authMiddleware, roleMiddleware(['candidate']), async (req, res) => {
  try {
    const recommendation = await Recommendation.findById(req.params.id)
      .populate({
        path: 'jobId',
        populate: [
          { path: 'requiredSkills', select: 'name category' },
          { path: 'recruiterId', select: 'companyName companyWebsite companyDescription' }
        ]
      });
    
    if (!recommendation) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }
    
    // Check if candidate owns this recommendation
    if (recommendation.candidateId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json(recommendation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark recommendation as viewed
router.patch('/:id/viewed', authMiddleware, roleMiddleware(['candidate']), async (req, res) => {
  try {
    const recommendation = await Recommendation.findById(req.params.id);
    
    if (!recommendation) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }
    
    if (recommendation.candidateId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    recommendation.viewed = true;
    recommendation.viewedAt = Date.now();
    await recommendation.save();
    
    res.json({ 
      message: 'Recommendation marked as viewed',
      recommendation 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get recommendations statistics
router.get('/stats/overview', authMiddleware, roleMiddleware(['candidate']), async (req, res) => {
  try {
    const total = await Recommendation.countDocuments({ 
      candidateId: req.user._id 
    });
    
    const viewed = await Recommendation.countDocuments({ 
      candidateId: req.user._id,
      viewed: true 
    });
    
    const highMatch = await Recommendation.countDocuments({ 
      candidateId: req.user._id,
      matchScore: { $gte: 80 } 
    });
    
    const avgScore = await Recommendation.aggregate([
      { $match: { candidateId: req.user._id } },
      { $group: { _id: null, avgScore: { $avg: '$matchScore' } } }
    ]);
    
    res.json({
      total,
      viewed,
      unviewed: total - viewed,
      highMatch,
      averageScore: avgScore.length > 0 ? Math.round(avgScore[0].avgScore) : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete all recommendations for candidate
router.delete('/clear', authMiddleware, roleMiddleware(['candidate']), async (req, res) => {
  try {
    await Recommendation.deleteMany({ candidateId: req.user._id });
    
    res.json({ message: 'All recommendations cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get top matching candidates for a job (recruiters only)
router.get('/job/:jobId/candidates', authMiddleware, roleMiddleware(['recruiter']), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId).populate('requiredSkills');
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if recruiter owns this job
    if (job.recruiterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Find all recommendations for this job
    const recommendations = await Recommendation.find({ 
      jobId: req.params.jobId,
      matchScore: { $gte: 60 } // Only show good matches
    })
      .populate('candidateId', 'fullName email phone location skills experience')
      .populate({
        path: 'candidateId',
        populate: { path: 'skills', select: 'name category' }
      })
      .sort({ matchScore: -1 })
      .limit(50);
    
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;