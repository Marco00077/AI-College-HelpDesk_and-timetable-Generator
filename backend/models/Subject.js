const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  hoursPerWeek: {
    type: Number,
    required: true,
    default: 3,
  },
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);
