const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// GET /api/courses - Get all courses (public)
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().sort({ category: 1, name: 1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/courses/:id - Get single course (public)
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
