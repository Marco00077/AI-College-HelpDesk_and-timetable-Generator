const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Timetable = require('../models/Timetable');

dotenv.config();

const clearTimetables = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await Timetable.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} timetables`);
    console.log('\nPlease regenerate timetables from Admin Panel → Generate Timetable tab');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

clearTimetables();
