const mongoose = require('mongoose');

const prepCardSchema = new mongoose.Schema({
  subject: {
    type: String,
    enum: ['Maths', 'EVS'],
    required: true
  },
  grade: {
    type: Number,
    enum: [3, 4],
    required: true
  },
  topicId: {
    type: String,
    required: true
  },
  situation: {
    type: String,
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
