const mongoose = require('mongoose');

const prepCardSchema = new mongoose.Schema({
  subject: {
    type: String,
    enum: ['Maths', 'Science'],
    required: true
  },
  grade: {
    type: Number,
    enum: [8, 9, 10],
    required: true
  },
  topicId: {
    type: String,
    required: true
  },
  situation: {
    type: String,
    enum: [
      'prerequisite_gap',
      'cant_visualize',
      'mixed_pace',
      'language_not_landing',
      'activity_chaos',
      'worked_once_failed_later'
    ],
    required: true
  },
  whatBreaksHere: String,
  earlyWarningSigns: [String],
  ifStudentsLost: [String],
  ifStudentsBored: [String],
  successRate: {
    type: Number,
    default: 0.5,
    min: 0,
    max: 1
  },
  peerInsights: {
    count: Number,
    insight: String
  },
  confidence: {
    type: Number,
    default: 0.5,
    min: 0,
    max: 1
  }
}, { timestamps: true });

module.exports = mongoose.model('PrepCard', prepCardSchema);
