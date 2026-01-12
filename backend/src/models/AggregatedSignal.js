const mongoose = require('mongoose');

const aggregatedSignalSchema = new mongoose.Schema({
  subject: String,
  grade: Number,
  topicId: String,
  situation: String,
  totalReflections: Number,
  successCount: Number,
  successRate: Number,
  commonReasons: [{
    reason: String,
    count: Number
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('AggregatedSignal', aggregatedSignalSchema);
