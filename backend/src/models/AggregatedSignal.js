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
  },
  // Phase 3: Theme signals extracted from Reflection text
  themeSignals: {
    type: Map,
    of: {
      count: { type: Number, default: 0 },
      score: { type: Number, default: 0 }
    },
    default: {}
  },
  themeLastUpdated: {
    type: Date
  },
  // Phase 4: Risk flagging metadata
  isFlagged: {
    type: Boolean,
    default: false
  },
  flagReason: {
    eligibility: {
      totalReflections: { type: Number },
      requiredMinimum: { type: Number },
      met: { type: Boolean }
    },
    failureRateCriteria: {
      failureRate: { type: Number },
      threshold: { type: Number },
      met: { type: Boolean }
    },
    dominantThemeCriteria: {
      themeName: { type: String, default: null },
      themeCount: { type: Number, default: 0 },
      failureCount: { type: Number, default: 0 },
      percentageOfFailures: { type: Number, default: 0 },
      threshold: { type: Number },
      met: { type: Boolean }
    }
  },
  flaggedAt: {
    type: Date,
    default: null
  },
  // Flag resolution tracking - records when a flag was cleared
  resolvedAt: {
    type: Date,
    default: null
  },
  // Reason the flag was resolved (e.g., "failureRate dropped below threshold")
  resolvedReason: {
    type: String,
    default: null
  },
  // Count of times this record has been flagged (for audit trail)
  flagHistory: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Create compound index for efficient upserts and lookups
aggregatedSignalSchema.index(
  { subject: 1, grade: 1, topicId: 1, situation: 1 },
  { unique: true }
);

module.exports = mongoose.model('AggregatedSignal', aggregatedSignalSchema);
