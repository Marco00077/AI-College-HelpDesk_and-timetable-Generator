const mongoose = require('mongoose');
const dotenv = require('dotenv');
const KnowledgeBase = require('../models/KnowledgeBase');
const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const User = require('../models/User');
const Course = require('../models/Course');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await KnowledgeBase.deleteMany({});
    await Subject.deleteMany({});
    await Teacher.deleteMany({});
    await Class.deleteMany({});
    await User.deleteMany({});
    await Course.deleteMany({});

    // Seed Courses
    const coursesData = [
      {
        name: 'Bachelor of Computer Applications',
        code: 'BCA',
        description: 'Undergraduate program in Computer Applications focusing on software development and IT',
        duration: '3 years',
        fees: 150000,
        category: 'undergraduate',
      },
      {
        name: 'Computer Science Engineering',
        code: 'CSE',
        description: 'Bachelor of Technology in Computer Science and Engineering',
        duration: '4 years',
        fees: 200000,
        category: 'undergraduate',
      },
      {
        name: 'Electronics Engineering',
        code: 'ECE',
        description: 'Bachelor of Technology in Electronics and Communication Engineering',
        duration: '4 years',
        fees: 180000,
        category: 'undergraduate',
      },
      {
        name: 'Mechanical Engineering',
        code: 'ME',
        description: 'Bachelor of Technology in Mechanical Engineering',
        duration: '4 years',
        fees: 175000,
        category: 'undergraduate',
      },
      {
        name: 'Master of Computer Applications',
        code: 'MCA',
        description: 'Postgraduate program in Computer Applications',
        duration: '2 years',
        fees: 120000,
        category: 'postgraduate',
      },
      {
        name: 'MBA',
        code: 'MBA',
        description: 'Master of Business Administration',
        duration: '2 years',
        fees: 250000,
        category: 'postgraduate',
      },
    ];

    await Course.insertMany(coursesData);
    console.log('Courses seeded');

    // Seed Knowledge Base
    const knowledgeData = [
      {
        keywords: ['fee', 'fees', 'cost', 'payment', 'tuition'],
        intent: 'ask_fees',
        category: 'fees',
        response: 'We offer various programs with different fee structures. Please ask about a specific course (e.g., "BCA fees", "CSE fees", "MCA fees") to get detailed information.',
      },
      {
        keywords: ['course', 'courses', 'program', 'programs', 'offered'],
        intent: 'ask_courses',
        category: 'courses',
        response: 'We offer BCA, CSE (Computer Science Engineering), ECE (Electronics Engineering), ME (Mechanical Engineering), MCA (Master of Computer Applications), and MBA programs. Ask about any specific course for details!',
      },
      {
        keywords: ['admission', 'apply', 'application', 'enroll', 'enrollment'],
        intent: 'ask_admission',
        category: 'admission',
        response: 'Admissions are open from June to August. You can apply online through our website. Requirements include high school transcripts and entrance exam scores.',
      },
      {
        keywords: ['timetable', 'schedule', 'class', 'timing', 'time'],
        intent: 'ask_timetable',
        category: 'timetable',
        response: 'You can view your class timetable in the Timetable section. Classes run from 9 AM to 4 PM, Monday to Saturday.',
      },
      {
        keywords: ['contact', 'phone', 'email', 'reach'],
        intent: 'ask_contact',
        category: 'general',
        response: 'You can reach us at contact@college.edu or call +1-234-567-8900. Office hours are 9 AM to 5 PM.',
      },
    ];

    await KnowledgeBase.insertMany(knowledgeData);
    console.log('Knowledge base seeded');

    // Seed Subjects
    const subjectsData = [
      { name: 'Data Structures', code: 'CS201', hoursPerWeek: 4 },
      { name: 'Database Systems', code: 'CS202', hoursPerWeek: 3 },
      { name: 'Web Development', code: 'CS203', hoursPerWeek: 3 },
      { name: 'Operating Systems', code: 'CS204', hoursPerWeek: 4 },
      { name: 'Computer Networks', code: 'CS205', hoursPerWeek: 3 },
    ];

    const createdSubjects = await Subject.insertMany(subjectsData);
    console.log('Subjects seeded');

    // Seed Teachers
    const teachersData = [
      { name: 'Dr. John Smith', employeeId: 'T001', subjects: [createdSubjects[0]._id, createdSubjects[1]._id] },
      { name: 'Prof. Sarah Johnson', employeeId: 'T002', subjects: [createdSubjects[2]._id] },
      { name: 'Dr. Michael Brown', employeeId: 'T003', subjects: [createdSubjects[3]._id, createdSubjects[4]._id] },
    ];

    await Teacher.insertMany(teachersData);
    console.log('Teachers seeded');

    // Get created courses
    const cseCourse = await Course.findOne({ code: 'CSE' });
    const mcaCourse = await Course.findOne({ code: 'MCA' });

    // Seed Classes with course references
    const classesData = [
      { 
        course: cseCourse._id, 
        section: 'A', 
        semester: 3,
        subjects: [createdSubjects[0]._id, createdSubjects[1]._id, createdSubjects[2]._id] 
      },
      { 
        course: cseCourse._id, 
        section: 'B', 
        semester: 3,
        subjects: [createdSubjects[0]._id, createdSubjects[3]._id, createdSubjects[4]._id] 
      },
      { 
        course: mcaCourse._id, 
        section: 'A', 
        semester: 1,
        subjects: [createdSubjects[1]._id, createdSubjects[2]._id] 
      },
    ];

    await Class.insertMany(classesData);
    console.log('Classes seeded');

    console.log('\n✅ All data seeded successfully!');
    console.log('\nNote: No demo users created.');
    console.log('Please register your own account at http://localhost:3000');
    console.log('Select "Admin" or "Student" role during registration.');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
