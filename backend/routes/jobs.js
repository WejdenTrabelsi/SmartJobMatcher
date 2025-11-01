// backend/routes/jobs.js
const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Get all jobs (public + filtered)
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      location, 
      jobType, 
      experienceLevel, 
      skills,
      page = 1, 
      limit = 10 
    } = req.query;
    
    let query = { status: 'active' };
    
    // Search in title, description, company
    if (search) {
      query.$text = { $search: search };
    }
    
    // Filter by location
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    // Filter by job type
    if (jobType) {
      query.jobType = jobType;
    }
    
    // Filter by experience level
    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }
    
    // Filter by skills (if skills is comma-separated string)
    if (skills) {
      const skillArray = skills.split(',');
      query.requiredSkills = { $in: skillArray };
    }
    
    const jobs = await Job.find(query)
      .populate('requiredSkills', 'name category')
      .populate('recruiterId', 'companyName email')
      .sort({ postedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Job.countDocuments(query);
    
    res.json({
      jobs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('requiredSkills', 'name category')
      .populate('recruiterId', 'companyName companyWebsite companyDescription email');
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new job (recruiters only)
router.post('/', authMiddleware, roleMiddleware(['recruiter']), async (req, res) => {
  try {
    const {
      title,
      description,
      company,
      location,
      jobType,
      experienceLevel,
      salaryRange,
      requiredSkills,
      responsibilities,
      qualifications,
      benefits,
      closingDate
    } = req.body;
    
    const job = new Job({
      title,
      description,
      company,
      location,
      jobType,
      experienceLevel,
      salaryRange,
      requiredSkills,
      responsibilities,
      qualifications,
      benefits,
      closingDate,
      recruiterId: req.user._id
    });
    
    await job.save();
    
    res.status(201).json({
      message: 'Job created successfully',
      job
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update job (recruiters only - own jobs)
router.put('/:id', authMiddleware, roleMiddleware(['recruiter']), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if recruiter owns this job
    if (job.recruiterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }
    
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('requiredSkills', 'name category');
    
    res.json({
      message: 'Job updated successfully',
      job: updatedJob
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete job (recruiters only - own jobs)
router.delete('/:id', authMiddleware, roleMiddleware(['recruiter']), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if recruiter owns this job
    if (job.recruiterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }
    
    await Job.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get recruiter's own jobs
router.get('/my-jobs', authMiddleware, roleMiddleware(['recruiter']), async (req, res) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user._id })
      .populate('requiredSkills', 'name category')
      .sort({ postedAt: -1 });
    
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Close job (change status to closed)
router.patch('/:id/close', authMiddleware, roleMiddleware(['recruiter']), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    if (job.recruiterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    job.status = 'closed';
    await job.save();
    
    res.json({ message: 'Job closed successfully', job });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;