const mongoose = require('mongoose');

/**
 * PrepCardRevision Model
 * 
 * CRP-authored revisions that overlay base PrepCards.
 * Base PrepCards are NEVER modified - revisions provide an overlay mechanism.
 * 
 * Lifecycle: draft → active → superseded
 * Only ONE revision can be active per base PrepCard at a time.
 */
const prepCardRevisionSchema = new mongoose.Schema({
    // Link to immutable base PrepCard
    basePrepCardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PrepCard',
        required: true
    },

    // Author info - always CRP
    authorRole: {
        type: String,
        enum: ['crp'],
        default: 'crp',
        required: true
    },

    // Evidence justification (CRP-only visibility)
    // This is NEVER exposed to teachers
    evidenceSummary: {
        aggregatedSignalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AggregatedSignal',
            default: null
        },
        interpretedSignalSnapshot: {
            type: Object,
            default: null
        },
        crpNotes: {
            type: String,
            default: ''
        },
        triggeringReasons: [{
            type: String
        }]
    },

    // Full revised guidance blocks
    // These replace the base PrepCard content when active
    revisedGuidance: {
        whatBreaksHere: {
            type: String,
            required: true
        },
        earlyWarningSigns: [{
            type: String
        }],
        ifStudentsLost: [{
            type: String
        }],
        ifStudentsBored: [{
            type: String
        }],
        peerInsights: {
            count: { type: Number, default: 0 },
            insight: { type: String, default: null }
        }
    },

    // Revision lifecycle status
    status: {
        type: String,
        enum: ['draft', 'active', 'superseded'],
        default: 'draft'
    },

    // Sequential revision number per base PrepCard
    revisionNumber: {
        type: Number,
        required: true
    },

    // Audit timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    activatedAt: {
        type: Date,
        default: null
    },
    supersededAt: {
        type: Date,
        default: null
    },
    supersededBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PrepCardRevision',
        default: null
    }
});

// Efficient lookup: find active revision for a PrepCard
prepCardRevisionSchema.index({ basePrepCardId: 1, status: 1 });

// Unique constraint: one revision number per base PrepCard
prepCardRevisionSchema.index(
    { basePrepCardId: 1, revisionNumber: 1 },
    { unique: true }
);

// Find all revisions for a PrepCard ordered by revision number
prepCardRevisionSchema.index({ basePrepCardId: 1, revisionNumber: -1 });

module.exports = mongoose.model('PrepCardRevision', prepCardRevisionSchema);
