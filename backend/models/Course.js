const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  duration: {
    type: String,
    required: true,
  },
  fees: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    enum: ['undergraduate', 'postgraduate', 'diploma', 'certificate'],
    default: 'undergraduate',
  },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
