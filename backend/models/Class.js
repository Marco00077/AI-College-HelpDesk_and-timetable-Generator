const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  section: {
    type: String,
    required: true,
  },
  semester: {
    type: Number,
    required: true,
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
  }],
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
