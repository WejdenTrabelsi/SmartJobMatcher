// backend/routes/profile.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

// Update user profile
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { fullName, phone, location, bio, skills, experience, education } = req.body;
    
    // Build update object based on user role
    const updateData = {};
    
    if (req.user.role === 'candidate') {
      if (fullName !== undefined) updateData.fullName = fullName;
      if (phone !== undefined) updateData.phone = phone;
      if (location !== undefined) updateData.location = location;
      if (bio !== undefined) updateData.bio = bio;
      if (skills !== undefined) updateData.skills = skills;
      if (experience !== undefined) updateData.experience = experience;
      if (education !== undefined) updateData.education = education;
    } else if (req.user.role === 'recruiter') {
      // Add recruiter-specific fields here if needed
      if (phone !== undefined) updateData.phone = phone;
      if (location !== undefined) updateData.location = location;
      if (bio !== undefined) updateData.bio = bio;
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password').populate('skills', 'name category');
    
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      message: 'Failed to update profile', 
      error: error.message 
    });
  }
});

// Get user profile
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('skills', 'name category');
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch profile', 
      error: error.message 
    });
  }
});

module.exports = router;