/**
 * CRP Revisions Routes
 * 
 * CRUD operations for PrepCard revisions.
 * All routes are CRP-only (protected by roleAuth middleware).
 * 
 * Routes:
 * - POST   /api/crp/revisions              Create new revision
 * - GET    /api/crp/revisions/:basePrepCardId  Get all revisions for a PrepCard
 * - PATCH  /api/crp/revisions/:revisionId/activate  Activate a revision
 * - GET    /api/crp/revisions/:revisionId  Get single revision details
 */

const express = require('express');
const router = express.Router();
const { roleAuth } = require('../middleware/roleAuth');
const PrepCardRevision = require('../models/PrepCardRevision');
const PrepCard = require('../models/PrepCard');
const AggregatedSignal = require('../models/AggregatedSignal');
const InterpretedSignal = require('../models/InterpretedSignal');

// All routes require CRP role
router.use(roleAuth('crp'));

/**
 * POST /api/crp/revisions
 * Create a new revision for a PrepCard
 */
router.post('/', async (req, res) => {
    try {
        const {
            basePrepCardId,
            revisedGuidance,
            crpNotes,
            triggeringReasons
        } = req.body;

        // Validate required fields
        if (!basePrepCardId || !revisedGuidance) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: basePrepCardId, revisedGuidance'
            });
        }

        // Validate base PrepCard exists
        const basePrepCard = await PrepCard.findById(basePrepCardId);
        if (!basePrepCard) {
            return res.status(404).json({
                success: false,
                error: 'Base PrepCard not found'
            });
        }

        // Get next revision number
        const latestRevision = await PrepCardRevision.findOne({ basePrepCardId })
            .sort({ revisionNumber: -1 })
            .select('revisionNumber');
        const nextRevisionNumber = (latestRevision?.revisionNumber || 0) + 1;

        // Fetch aggregated signal for evidence snapshot
        const aggregatedSignal = await AggregatedSignal.findOne({
            subject: basePrepCard.subject,
            grade: basePrepCard.grade,
            topicId: basePrepCard.topicId,
            situation: basePrepCard.situation
        });

        // Fetch interpreted signal for evidence snapshot
        const interpretedSignal = await InterpretedSignal.findOne({
            subject: basePrepCard.subject,
            grade: basePrepCard.grade,
            topicId: basePrepCard.topicId,
            situation: basePrepCard.situation
        });

        // Create revision
        const revision = new PrepCardRevision({
            basePrepCardId,
            authorRole: 'crp',
            evidenceSummary: {
                aggregatedSignalId: aggregatedSignal?._id || null,
                interpretedSignalSnapshot: interpretedSignal ? {
                    textSignals: interpretedSignal.textSignals,
                    correlatedSignals: interpretedSignal.correlatedSignals,
                    timestamp: interpretedSignal.timestamp
                } : null,
                crpNotes: crpNotes || '',
                triggeringReasons: triggeringReasons || []
            },
            revisedGuidance: {
                whatBreaksHere: revisedGuidance.whatBreaksHere || basePrepCard.whatBreaksHere,
                earlyWarningSigns: revisedGuidance.earlyWarningSigns || basePrepCard.earlyWarningSigns,
                ifStudentsLost: revisedGuidance.ifStudentsLost || basePrepCard.ifStudentsLost,
                ifStudentsBored: revisedGuidance.ifStudentsBored || basePrepCard.ifStudentsBored,
                peerInsights: revisedGuidance.peerInsights || basePrepCard.peerInsights
            },
            status: 'draft',
            revisionNumber: nextRevisionNumber
        });

        await revision.save();

        res.status(201).json({
            success: true,
            message: 'Revision created successfully',
            revision
        });
    } catch (error) {
        console.error('Error creating revision:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/crp/revisions/:basePrepCardId
 * Get all revisions for a PrepCard
 */
router.get('/:basePrepCardId', async (req, res) => {
    try {
        const { basePrepCardId } = req.params;

        // Validate base PrepCard exists
        const basePrepCard = await PrepCard.findById(basePrepCardId);
        if (!basePrepCard) {
            return res.status(404).json({
                success: false,
                error: 'Base PrepCard not found'
            });
        }

        const revisions = await PrepCardRevision.find({ basePrepCardId })
            .sort({ revisionNumber: -1 })
            .lean();

        res.json({
            success: true,
            basePrepCardId,
            count: revisions.length,
            revisions
        });
    } catch (error) {
        console.error('Error fetching revisions:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/crp/revisions/detail/:revisionId
 * Get single revision details
 */
router.get('/detail/:revisionId', async (req, res) => {
    try {
        const { revisionId } = req.params;

        const revision = await PrepCardRevision.findById(revisionId)
            .populate('basePrepCardId')
            .lean();

        if (!revision) {
            return res.status(404).json({
                success: false,
                error: 'Revision not found'
            });
        }

        res.json({
            success: true,
            revision
        });
    } catch (error) {
        console.error('Error fetching revision:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * PATCH /api/crp/revisions/:revisionId/activate
 * Activate a revision (makes it visible to teachers)
 * 
 * This will:
 * 1. Supersede any currently active revision
 * 2. Set this revision as active
 */
router.patch('/:revisionId/activate', async (req, res) => {
    try {
        const { revisionId } = req.params;

        const revision = await PrepCardRevision.findById(revisionId);
        if (!revision) {
            return res.status(404).json({
                success: false,
                error: 'Revision not found'
            });
        }

        if (revision.status === 'active') {
            return res.status(400).json({
                success: false,
                error: 'Revision is already active'
            });
        }

        if (revision.status === 'superseded') {
            return res.status(400).json({
                success: false,
                error: 'Cannot activate a superseded revision. Create a new one instead.'
            });
        }

        // Supersede current active revision (if any)
        const currentActive = await PrepCardRevision.findOne({
            basePrepCardId: revision.basePrepCardId,
            status: 'active'
        });

        if (currentActive) {
            currentActive.status = 'superseded';
            currentActive.supersededAt = new Date();
            currentActive.supersededBy = revision._id;
            await currentActive.save();
        }

        // Activate this revision
        revision.status = 'active';
        revision.activatedAt = new Date();
        await revision.save();

        res.json({
            success: true,
            message: 'Revision activated successfully',
            revision,
            superseded: currentActive ? currentActive._id : null
        });
    } catch (error) {
        console.error('Error activating revision:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * PUT /api/crp/revisions/:revisionId
 * Update a draft revision
 */
router.put('/:revisionId', async (req, res) => {
    try {
        const { revisionId } = req.params;
        const { revisedGuidance, crpNotes } = req.body;

        const revision = await PrepCardRevision.findById(revisionId);
        if (!revision) {
            return res.status(404).json({
                success: false,
                error: 'Revision not found'
            });
        }

        if (revision.status !== 'draft') {
            return res.status(400).json({
                success: false,
                error: 'Only draft revisions can be updated'
            });
        }

        if (revisedGuidance) {
            revision.revisedGuidance = {
                ...revision.revisedGuidance,
                ...revisedGuidance
            };
        }
        if (crpNotes !== undefined) revision.evidenceSummary.crpNotes = crpNotes;

        await revision.save();

        res.json({
            success: true,
            message: 'Revision updated successfully',
            revision
        });
    } catch (error) {
        console.error('Error updating revision:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * DELETE /api/crp/revisions/:revisionId
 * Delete a draft revision (cannot delete active or superseded)
 */
router.delete('/:revisionId', async (req, res) => {
    try {
        const { revisionId } = req.params;

        const revision = await PrepCardRevision.findById(revisionId);
        if (!revision) {
            return res.status(404).json({
                success: false,
                error: 'Revision not found'
            });
        }

        if (revision.status !== 'draft') {
            return res.status(400).json({
                success: false,
                error: 'Only draft revisions can be deleted'
            });
        }

        await PrepCardRevision.deleteOne({ _id: revisionId });

        res.json({
            success: true,
            message: 'Draft revision deleted'
        });
    } catch (error) {
        console.error('Error deleting revision:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
