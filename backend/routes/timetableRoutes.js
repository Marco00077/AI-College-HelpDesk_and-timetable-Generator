const express = require('express');
const router = express.Router();
const { generateClassTimetable, getTimetable, generatePDF } = require('../controllers/timetableController');
const { protect, adminOnly } = require('../middleware/auth');

// POST /api/timetable/generate - Generate timetable (admin only)
router.post('/generate', protect, adminOnly, generateClassTimetable);

// GET /api/timetable/:classId - Get timetable for a class (authenticated users)
router.get('/:classId', protect, getTimetable);

// GET /api/timetable/:classId/pdf - Download timetable as PDF (authenticated users)
router.get('/:classId/pdf', protect, generatePDF);

module.exports = router;
