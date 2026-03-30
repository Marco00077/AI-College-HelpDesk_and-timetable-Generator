const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Class = require('../models/Class');
const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');
const Course = require('../models/Course');
const { generateTimetable } = require('../utils/timetableGenerator');

dotenv.config();

const testSharedSchedule = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Fetch CSE classes (both sections)
    const cseClasses = await Class.find({ section: { $in: ['A', 'B'] } })
      .populate('subjects')
      .populate('course')
      .sort({ section: 1 });
    
    const teachers = await Teacher.find().populate('subjects');

    console.log('=== Testing Shared Teacher Schedule ===\n');
    console.log('This simulates generating timetables for all sections of a course\n');

    // Create shared teacher schedule
    const sharedTeacherSchedule = {};
    teachers.forEach(teacher => {
      sharedTeacherSchedule[teacher._id.toString()] = {};
      ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].forEach(day => {
        sharedTeacherSchedule[teacher._id.toString()][day] = [];
      });
    });

    const results = [];

    for (const classData of cseClasses) {
      console.log(`\n--- ${classData.course?.name} Section ${classData.section} ---`);
      console.log(`Subjects: ${classData.subjects.map(s => s.name).join(', ')}`);
      
      const schedule = await generateTimetable(classData, classData.subjects, teachers, sharedTeacherSchedule);
      
      console.log('\nMonday Schedule:');
      if (schedule[0].periods.length === 0) {
        console.log('  No periods scheduled');
      } else {
        schedule[0].periods.forEach(period => {
          const subject = classData.subjects.find(s => s._id.toString() === period.subject.toString());
          const teacher = teachers.find(t => t._id.toString() === period.teacher.toString());
          console.log(`  Period ${period.periodNumber}: ${subject?.name} - ${teacher?.name} (${period.startTime}-${period.endTime})`);
        });
      }
      
      console.log('\nTuesday Schedule:');
      if (schedule[1].periods.length === 0) {
        console.log('  No periods scheduled');
      } else {
        schedule[1].periods.forEach(period => {
          const subject = classData.subjects.find(s => s._id.toString() === period.subject.toString());
          const teacher = teachers.find(t => t._id.toString() === period.teacher.toString());
          console.log(`  Period ${period.periodNumber}: ${subject?.name} - ${teacher?.name} (${period.startTime}-${period.endTime})`);
        });
      }

      results.push({ section: classData.section, schedule });
    }

    console.log('\n\n=== Conflict Check ===');
    console.log('Checking if any teacher is scheduled in two sections at the same time...\n');

    let conflicts = 0;
    for (let i = 0; i < results.length; i++) {
      for (let j = i + 1; j < results.length; j++) {
        const sectionA = results[i];
        const sectionB = results[j];

        for (let dayIdx = 0; dayIdx < 6; dayIdx++) {
          const dayA = sectionA.schedule[dayIdx];
          const dayB = sectionB.schedule[dayIdx];

          dayA.periods.forEach(periodA => {
            dayB.periods.forEach(periodB => {
              if (periodA.periodNumber === periodB.periodNumber && 
                  periodA.teacher.toString() === periodB.teacher.toString()) {
                const teacher = teachers.find(t => t._id.toString() === periodA.teacher.toString());
                console.log(`❌ CONFLICT: ${teacher?.name} scheduled in both Section ${sectionA.section} and Section ${sectionB.section} on ${dayA.day} Period ${periodA.periodNumber}`);
                conflicts++;
              }
            });
          });
        }
      }
    }

    if (conflicts === 0) {
      console.log('✅ No conflicts found! Each teacher is only in one section at a time.');
    } else {
      console.log(`\n⚠️ Found ${conflicts} conflicts`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Test error:', error);
    process.exit(1);
  }
};

testSharedSchedule();
