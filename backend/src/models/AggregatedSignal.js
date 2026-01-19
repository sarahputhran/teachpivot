const mongoose = require('mongoose');

const aggregatedSignalSchema = new mongoose.Schema({
  subject: String,
  grade: Number,
  topicId: String,
  situation: String,
  totalReflections: Number,
  successCount: Number,
  successRate: Number,
  // Additional outcome counts for detailed breakdown
  partiallyWorkedCount: {
    type: Number,
    default: 0
  },
  didntWorkCount: {
    type: Number,
    default: 0
  },
  // Failure rate = didnt_work_count / total_attempts
  failureRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
  // Confidence score - deterministic function of sample size
  confidenceScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
  commonReasons: [{
    reason: String,
    count: Number
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create compound index for efficient upserts and lookups
aggregatedSignalSchema.index(
  { subject: 1, grade: 1, topicId: 1, situation: 1 },
  { unique: true }
);

module.exports = mongoose.model('AggregatedSignal', aggregatedSignalSchema);
