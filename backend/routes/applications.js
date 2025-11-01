// backend/routes/applications.js
const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { generateJobMatch } = require('../utils/nlpMatcher');

// Apply to a job (candidates only)
router.post('/:jobId', authMiddleware, roleMiddleware(['candidate']), async (req, res) => {
  try {
    const { coverLetter } = req.body;
    const jobId = req.params.jobId;
    const candidateId = req.user._id;
    
    // Check if job exists
    const job = await Job.findById(jobId).populate('requiredSkills');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    if (job.status !== 'active') {
      return res.status(400).json({ message: 'This job is no longer accepting applications' });
    }
    
    // Check if already applied
    const existingApplication = await Application.findOne({ 
      jobId, 
      candidateId 
    });
    
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }
    
    // Get candidate profile with skills
    const candidate = await User.findById(candidateId).populate('skills');
    
    // Calculate match score using NLP
    const matchResult = await generateJobMatch(candidate, job);
    
    // Create application
    const application = new Application({
      jobId,
      candidateId,
      recruiterId: job.recruiterId,
      coverLetter,
      resumeUrl: candidate.resumeUrl || '',
      matchScore: matchResult.matchScore
    });
    
    await application.save();
    
    // Increment applications count on job
    await Job.findByIdAndUpdate(jobId, { 
      $inc: { applicationsCount: 1 } 
    });
    
    res.status(201).json({
      message: 'Application submitted successfully',
      application,
      matchScore: matchResult.matchScore
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get candidate's own applications
router.get('/my-applications', authMiddleware, roleMiddleware(['candidate']), async (req, res) => {
  try {
    const applications = await Application.find({ 
      candidateId: req.user._id 
    })
      .populate({
        path: 'jobId',
        populate: { path: 'requiredSkills', select: 'name category' }
      })
      .sort({ appliedAt: -1 });
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get applications for a specific job (recruiters only)
router.get('/job/:jobId', authMiddleware, roleMiddleware(['recruiter']), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if recruiter owns this job
    if (job.recruiterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these applications' });
    }
    
    const applications = await Application.find({ 
      jobId: req.params.jobId 
    })
      .populate('candidateId', 'fullName email phone location skills experience education resumeUrl')
      .populate({
        path: 'candidateId',
        populate: { path: 'skills', select: 'name category' }
      })
      .sort({ matchScore: -1 }); // Highest match scores first
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all applications for recruiter (all their jobs)
router.get('/recruiter/all', authMiddleware, roleMiddleware(['recruiter']), async (req, res) => {
  try {
    const applications = await Application.find({ 
      recruiterId: req.user._id 
    })
      .populate('candidateId', 'fullName email phone location')
      .populate('jobId', 'title company location')
      .sort({ appliedAt: -1 });
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single application by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('candidateId', 'fullName email phone location skills experience education resumeUrl')
      .populate({
        path: 'candidateId',
        populate: { path: 'skills', select: 'name category' }
      })
      .populate('jobId')
      .populate({
        path: 'jobId',
        populate: { path: 'requiredSkills', select: 'name category' }
      });
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check authorization
    const isCandidate = application.candidateId._id.toString() === req.user._id.toString();
    const isRecruiter = application.recruiterId.toString() === req.user._id.toString();
    
    if (!isCandidate && !isRecruiter) {
      return res.status(403).json({ message: 'Not authorized to view this application' });
    }
    
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update application status (recruiters only)
router.patch('/:id/status', authMiddleware, roleMiddleware(['recruiter']), async (req, res) => {
  try {
    const { status, recruiterNotes } = req.body;
    
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check if recruiter owns this application
    if (application.recruiterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }
    
    application.status = status;
    if (recruiterNotes) {
      application.recruiterNotes = recruiterNotes;
    }
    application.updatedAt = Date.now();
    
    await application.save();
    
    res.json({
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete/Withdraw application (candidates only - own applications)
router.delete('/:id', authMiddleware, roleMiddleware(['candidate']), async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check if candidate owns this application
    if (application.candidateId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this application' });
    }
    
    // Don't allow withdrawal if already reviewed/shortlisted/accepted
    if (['reviewed', 'shortlisted', 'accepted'].includes(application.status)) {
      return res.status(400).json({ 
        message: 'Cannot withdraw application that has been reviewed or shortlisted' 
      });
    }
    
    await Application.findByIdAndDelete(req.params.id);
    
    // Decrement applications count on job
    await Job.findByIdAndUpdate(application.jobId, { 
      $inc: { applicationsCount: -1 } 
    });
    
    res.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get application statistics (recruiters)
router.get('/stats/overview', authMiddleware, roleMiddleware(['recruiter']), async (req, res) => {
  try {
    const stats = await Application.aggregate([
      { $match: { recruiterId: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const total = await Application.countDocuments({ recruiterId: req.user._id });
    
    res.json({
      total,
      byStatus: stats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;