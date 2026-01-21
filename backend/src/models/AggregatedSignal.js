const mongoose = require('mongoose');

const aggregatedSignalSchema = new mongoose.Schema({
  prepCardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PrepCard',
    default: null
  },
  subject: String,
  grade: Number,
  topicId: String,
  situation: String,
  totalReflections: Number,
  successCount: Number,
  successRate: Number,
  partiallyWorkedCount: {
    type: Number,
    default: 0
  },
  didntWorkCount: {
    type: Number,
    default: 0
  },
  failureRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
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
  crpThemeSignals: {
    type: Map,
    of: Number,
    default: {}
  },
  crpThemeLastUpdated: {
    type: Date
  },
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
  resolvedAt: {
    type: Date,
    default: null
  },
  resolvedReason: {
    type: String,
    default: null
  },
  flagHistory: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

aggregatedSignalSchema.index(
  { prepCardId: 1 },
  { unique: true }
);

module.exports = mongoose.model('AggregatedSignal', aggregatedSignalSchema);
