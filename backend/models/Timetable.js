const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  schedule: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true,
    },
    periods: [{
      periodNumber: Number,
      subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      },
      teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
      },
      startTime: String,
      endTime: String,
    }],
  }],
  generatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);
