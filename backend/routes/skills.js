// backend/routes/skills.js
const express = require('express');
const router = express.Router();
const Skill = require('../models/Skill');
const { authMiddleware } = require('../middleware/auth');

// Get all skills
router.get('/', async (req, res) => {
  try {
    const { category, sort = 'name' } = req.query;
    
    let query = {};
    if (category) {
      query.category = category;
    }
    
    const skills = await Skill.find(query).sort(sort);
    
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search skills by name
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query required' });
    }
    
    const skills = await Skill.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { synonyms: { $regex: q, $options: 'i' } }
      ]
    }).limit(20);
    
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get skills by category
router.get('/category/:category', async (req, res) => {
  try {
    const skills = await Skill.find({ 
      category: req.params.category 
    }).sort('name');
    
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single skill by ID
router.get('/:id', async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    
    res.json(skill);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new skill (authenticated users)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, category, synonyms } = req.body;
    
    // Check if skill already exists
    const existingSkill = await Skill.findOne({ 
      name: name.toLowerCase() 
    });
    
    if (existingSkill) {
      return res.status(400).json({ 
        message: 'Skill already exists',
        skill: existingSkill 
      });
    }
    
    const skill = new Skill({
      name: name.toLowerCase(),
      category,
      synonyms: synonyms || []
    });
    
    await skill.save();
    
    res.status(201).json({
      message: 'Skill created successfully',
      skill
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update skill
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, category, synonyms } = req.body;
    
    const skill = await Skill.findByIdAndUpdate(
      req.params.id,
      { 
        name: name?.toLowerCase(),
        category,
        synonyms
      },
      { new: true, runValidators: true }
    );
    
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    
    res.json({
      message: 'Skill updated successfully',
      skill
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get popular skills (most used)
router.get('/stats/popular', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const skills = await Skill.find()
      .sort({ usageCount: -1 })
      .limit(parseInt(limit));
    
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Increment usage count
router.patch('/:id/increment', async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(
      req.params.id,
      { $inc: { usageCount: 1 } },
      { new: true }
    );
    
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    
    res.json(skill);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;