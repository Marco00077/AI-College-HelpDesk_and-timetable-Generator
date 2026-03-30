const mongoose = require('mongoose');

const knowledgeBaseSchema = new mongoose.Schema({
  keywords: {
    type: [String],
    required: true,
  },
  intent: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['fees', 'courses', 'admission', 'timetable', 'general'],
    default: 'general',
  },
}, { timestamps: true });

module.exports = mongoose.model('KnowledgeBase', knowledgeBaseSchema);
