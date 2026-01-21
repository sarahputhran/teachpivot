const mongoose = require('mongoose');

const interpretedSignalSchema = new mongoose.Schema({
    // Canonical Context Scope
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
    prepCardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PrepCard',
        required: false // Optional, as signals might be computed before a PrepCard exists (though unlikely in current flow)
    },

    // 1. Unstructured Text Signals (from TeacherFeedback)
    // Extracted using TF-IDF / Frequency analysis
    textSignals: {
        topTerms: [{
            term: String,       // e.g., "timing", "too fast"
            frequency: Number,  // Raw count in window
            relevance: Number,  // TF-IDF score or simple frequency weight
            sampleSize: Number  // Number of distinct feedback entries this term appeared in
        }],
        totalFeedbackProcessed: {
            type: Number,
            default: 0
        },
        periodStart: Date,    // Window start for this batch
        periodEnd: Date,      // Window end for this batch
        lastComputed: {
            type: Date,
            default: Date.now
        }
    },

    // 2. Correlation Signals (Structured Reflection <-> Text)
    // "When teachers report X (structured), they also say Y (text)"
    correlatedSignals: [{
        reflectionReason: String, // e.g. "timing_issue"
        associatedTerms: [{
            term: String,
            frequency: Number
        }]
    }],

    // Metadata
    timestamp: {
        type: Date,
        default: Date.now
    },
    computationVersion: {
        type: String,
        default: 'v1'
    },

    // Privacy / Compliance
    minSupportThresholdUsed: {
        type: Number,
        required: true,
        default: 3 // Default minimum support to ensure anonymity
    }

}, { timestamps: true });

// Index for efficient lookup by context
interpretedSignalSchema.index({ subject: 1, grade: 1, topicId: 1, situation: 1 });

// Index for lookup by prepCard
interpretedSignalSchema.index({ prepCardId: 1 });

module.exports = mongoose.model('InterpretedSignal', interpretedSignalSchema);
