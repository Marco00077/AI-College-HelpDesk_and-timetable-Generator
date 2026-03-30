const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Class = require('../models/Class');
const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');
const Course = require('../models/Course');
const Timetable = require('../models/Timetable');
const { generateTimetable } = require('../utils/timetableGenerator');

dotenv.config();

const generateAllTimetables = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Get all courses
    const courses = await Course.find();
    const teachers = await Teacher.find().populate('subjects');

    console.log('=== Generating Timetables for All Courses ===\n');

    for (const course of courses) {
      console.log(`\n📚 Course: ${course.name} (${course.code})`);
      
      // Get all sections for this course
      const classes = await Class.find({ course: course._id })
        .populate('subjects')
        .populate('course')
        .sort({ section: 1 });

      if (classes.length === 0) {
        console.log('  No sections found');
        continue;
      }

      console.log(`  Sections: ${classes.map(c => c.section).join(', ')}`);

      // Create shared teacher schedule for this course
      const sharedTeacherSchedule = {};
      teachers.forEach(teacher => {
        sharedTeacherSchedule[teacher._id.toString()] = {};
        ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].forEach(day => {
          sharedTeacherSchedule[teacher._id.toString()][day] = [];
        });
      });

      // Generate for each section
      for (const classData of classes) {
        console.log(`\n  Generating for Section ${classData.section}...`);
        
        const schedule = await generateTimetable(classData, classData.subjects, teachers, sharedTeacherSchedule);
        
        // Count total periods
        const totalPeriods = schedule.reduce((sum, day) => sum + day.periods.length, 0);
        console.log(`    ✓ Generated ${totalPeriods} periods across 6 days`);

        // Save to database
        await Timetable.findOneAndUpdate(
          { class: classData._id },
          { class: classData._id, schedule },
          { upsert: true, new: true }
        );
        console.log(`    ✓ Saved to database`);

        // Show Monday schedule as sample
        if (schedule[0].periods.length > 0) {
          console.log(`    Monday sample:`);
          schedule[0].periods.slice(0, 2).forEach(period => {
            const subject = classData.subjects.find(s => s._id.toString() === period.subject.toString());
            const teacher = teachers.find(t => t._id.toString() === period.teacher.toString());
            console.log(`      - Period ${period.periodNumber}: ${subject?.name} (${teacher?.name})`);
          });
        }
      }
    }

    console.log('\n\n✅ All timetables generated successfully!');
    console.log('\nYou can now view them in the frontend:');
    console.log('1. Go to Timetable tab');
    console.log('2. Select a course');
    console.log('3. Select a section');
    console.log('4. Click "View Timetable"');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

generateAllTimetables();
