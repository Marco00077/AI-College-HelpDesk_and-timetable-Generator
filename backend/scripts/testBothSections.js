const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Class = require('../models/Class');
const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');
const Course = require('../models/Course');
const Timetable = require('../models/Timetable');
const { generateTimetable } = require('../utils/timetableGenerator');

dotenv.config();

const testBothSections = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Fetch CSE classes (both sections)
    const cseClasses = await Class.find({ section: { $in: ['A', 'B'] } })
      .populate('subjects')
      .populate('course');
    
    const teachers = await Teacher.find().populate('subjects');

    console.log('=== Testing Different Sections ===\n');

    for (const classData of cseClasses) {
      console.log(`\n--- ${classData.course?.name} Section ${classData.section} ---`);
      console.log(`Subjects: ${classData.subjects.map(s => s.name).join(', ')}`);
      
      const schedule = await generateTimetable(classData, classData.subjects, teachers);
      
      console.log('\nMonday Schedule:');
      schedule[0].periods.forEach(period => {
        const subject = classData.subjects.find(s => s._id.toString() === period.subject.toString());
        const teacher = teachers.find(t => t._id.toString() === period.teacher.toString());
        console.log(`  Period ${period.periodNumber}: ${subject?.name} - ${teacher?.name} (${period.startTime}-${period.endTime})`);
      });
      
      console.log('\nTuesday Schedule:');
      schedule[1].periods.forEach(period => {
        const subject = classData.subjects.find(s => s._id.toString() === period.subject.toString());
        const teacher = teachers.find(t => t._id.toString() === period.teacher.toString());
        console.log(`  Period ${period.periodNumber}: ${subject?.name} - ${teacher?.name} (${period.startTime}-${period.endTime})`);
      });
    }

    console.log('\n✅ Test complete - check if schedules are different');
    process.exit(0);
  } catch (error) {
    console.error('Test error:', error);
    process.exit(1);
  }
};

testBothSections();
