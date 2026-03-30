const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
  }],
  maxHoursPerDay: {
    type: Number,
    default: 6,
  },
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);
