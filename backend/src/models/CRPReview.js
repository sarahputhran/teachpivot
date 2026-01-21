const mongoose = require('mongoose');

const crpReviewSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true
    },
    grade: {
        type: Number,
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
    aggregatedSignalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AggregatedSignal',
        required: true
    },
    action: {
        type: String,
        enum: ['needs_modification', 'add_alternate', 'no_change'],
        required: true
    },
    reasons: {
        type: [String],
        default: []
    },
    notes: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient lookups by aggregatedSignalId
crpReviewSchema.index({ aggregatedSignalId: 1 });

// Compound index for lookups by context
crpReviewSchema.index({ subject: 1, grade: 1, topicId: 1, situation: 1 });

module.exports = mongoose.model('CRPReview', crpReviewSchema);
