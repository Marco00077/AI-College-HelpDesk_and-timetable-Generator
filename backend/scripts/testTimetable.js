const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Class = require('../models/Class');
const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');
const Course = require('../models/Course');
const Timetable = require('../models/Timetable');
const { generateTimetable } = require('../utils/timetableGenerator');

dotenv.config();

const testTimetableGeneration = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Fetch CSE classes only
    const cseClasses = await Class.find().populate('subjects').populate('course');
    const cseSections = cseClasses.filter(cls => cls.course?.code === 'CSE');
    
    console.log(`Found ${cseSections.length} CSE sections:\n`);
    cseSections.forEach(cls => {
      console.log(`- Section ${cls.section}, Semester ${cls.semester}`);
      console.log(`  Subjects: ${cls.subjects.map(s => s.name).join(', ')}`);
    });

    // Fetch teachers
    const teachers = await Teacher.find().populate('subjects');
    console.log(`\nFound ${teachers.length} teachers\n`);

    // Shared teacher schedule
    const sharedTeacherSchedule = {};
    teachers.forEach(teacher => {
      sharedTeacherSchedule[teacher._id.toString()] = {};
      ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].forEach(day => {
        sharedTeacherSchedule[teacher._id.toString()][day] = [];
      });
    });

    // Generate timetables for all CSE sections
    console.log('=== Generating timetables for all CSE sections ===\n');
    
    for (const classData of cseSections) {
      console.log(`\n--- Section ${classData.section} ---`);
      
      const schedule = await generateTimetable(classData, classData.subjects, teachers, sharedTeacherSchedule);
      
      // Save to database
      await Timetable.findOneAndUpdate(
        { class: classData._id },
        { class: classData._id, schedule },
        { upsert: true, new: true }
      );
      
      console.log(`\nSection ${classData.section} Schedule Summary:`);
      schedule.forEach(day => {
        if (day.periods.length > 0) {
          console.log(`${day.day}: ${day.periods.length} periods`);
          day.periods.forEach(period => {
            const subject = classData.subjects.find(s => s._id.toString() === period.subject.toString());
            const teacher = teachers.find(t => t._id.toString() === period.teacher.toString());
            console.log(`  Period ${period.periodNumber}: ${subject?.name} - ${teacher?.name} (${period.startTime}-${period.endTime})`);
          });
        }
      });
    }

    console.log('\n✅ All timetables generated and saved');
    process.exit(0);
  } catch (error) {
    console.error('Test error:', error);
    process.exit(1);
  }
};

testTimetableGeneration();
