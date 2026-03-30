const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const KnowledgeBase = require('../models/KnowledgeBase');
const Course = require('../models/Course');

// Subject Management
const addSubject = async (req, res) => {
  try {
    const subject = new Subject(req.body);
    await subject.save();
    res.status(201).json({ success: true, subject });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, subject });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteSubject = async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Subject deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Teacher Management
const addTeacher = async (req, res) => {
  try {
    const teacher = new Teacher(req.body);
    await teacher.save();
    res.status(201).json({ success: true, teacher });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().populate('subjects');
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, teacher });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Teacher deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Class Management
const addClass = async (req, res) => {
  try {
    const classData = new Class(req.body);
    await classData.save();
    res.status(201).json({ success: true, class: classData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getClasses = async (req, res) => {
  try {
    const classes = await Class.find().populate('subjects').populate('course');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateClass = async (req, res) => {
  try {
    const classData = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, class: classData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteClass = async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Class deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Knowledge Base Management
const addKnowledge = async (req, res) => {
  try {
    const knowledge = new KnowledgeBase(req.body);
    await knowledge.save();
    res.status(201).json({ success: true, knowledge });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getKnowledge = async (req, res) => {
  try {
    const knowledge = await KnowledgeBase.find();
    res.json(knowledge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateKnowledge = async (req, res) => {
  try {
    const knowledge = await KnowledgeBase.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, knowledge });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteKnowledge = async (req, res) => {
  try {
    await KnowledgeBase.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Knowledge entry deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addSubject, getSubjects, updateSubject, deleteSubject,
  addTeacher, getTeachers, updateTeacher, deleteTeacher,
  addClass, getClasses, updateClass, deleteClass,
  addKnowledge, getKnowledge, updateKnowledge, deleteKnowledge,
};

// Course Management
const addCourse = async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addSubject, getSubjects, updateSubject, deleteSubject,
  addTeacher, getTeachers, updateTeacher, deleteTeacher,
  addClass, getClasses, updateClass, deleteClass,
  addKnowledge, getKnowledge, updateKnowledge, deleteKnowledge,
  addCourse, getCourses, updateCourse, deleteCourse,
};
