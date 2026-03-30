const express = require('express');
const router = express.Router();
const {
  addSubject, getSubjects, updateSubject, deleteSubject,
  addTeacher, getTeachers, updateTeacher, deleteTeacher,
  addClass, getClasses, updateClass, deleteClass,
  addKnowledge, getKnowledge, updateKnowledge, deleteKnowledge,
  addCourse, getCourses, updateCourse, deleteCourse,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// Subject routes (admin only for write operations)
router.post('/subjects', protect, adminOnly, addSubject);
router.get('/subjects', getSubjects);
router.put('/subjects/:id', protect, adminOnly, updateSubject);
router.delete('/subjects/:id', protect, adminOnly, deleteSubject);

// Teacher routes (admin only for write operations)
router.post('/teachers', protect, adminOnly, addTeacher);
router.get('/teachers', getTeachers);
router.put('/teachers/:id', protect, adminOnly, updateTeacher);
router.delete('/teachers/:id', protect, adminOnly, deleteTeacher);

// Class routes (admin only for write operations)
router.post('/classes', protect, adminOnly, addClass);
router.get('/classes', getClasses);
router.put('/classes/:id', protect, adminOnly, updateClass);
router.delete('/classes/:id', protect, adminOnly, deleteClass);

// Knowledge base routes (admin only for write operations)
router.post('/knowledge', protect, adminOnly, addKnowledge);
router.get('/knowledge', getKnowledge);
router.put('/knowledge/:id', protect, adminOnly, updateKnowledge);
router.delete('/knowledge/:id', protect, adminOnly, deleteKnowledge);

// Course routes (admin only for write operations)
router.post('/courses', protect, adminOnly, addCourse);
router.get('/courses', getCourses);
router.put('/courses/:id', protect, adminOnly, updateCourse);
router.delete('/courses/:id', protect, adminOnly, deleteCourse);

module.exports = router;
