const express = require('express');
const router = express.Router();
const PrepCard = require('../models/PrepCard');
const Curriculum = require('../models/Curriculum');
const PrepCardRevision = require('../models/PrepCardRevision');
const { detectRole } = require('../middleware/roleAuth');

// Apply role detection to all routes (optional - doesn't block)
router.use(detectRole);

router.get('/:subject/:grade/:topicId/situations', async (req, res) => {
  try {
    const { subject, grade, topicId } = req.params;

    const prepCards = await PrepCard.find({
      subject,
      grade: parseInt(grade),
      topicId
    }).select('situation whatBreaksHere earlyWarningSigns');

    let topicName = topicId.replace(/_/g, ' ');
    const curriculum = await Curriculum.findOne({
      subject,
      grade: parseInt(grade)
    });

    if (curriculum && curriculum.topics) {
      const topic = curriculum.topics.find(t => t.id === topicId);
      if (topic && topic.name) {
        topicName = topic.name;
      }
    }

    res.json({
      topicName,
      situations: prepCards
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /:subject/:grade/:topicId/:situation
 * 
 * Returns PrepCard content with active revision overlay if exists.
 * 
 * For Teachers:
 * - Returns revised guidance if active revision exists
 * - Includes isRevised flag and revisionDate
 * - Does NOT include evidence summary or CRP notes
 * 
 * For CRPs:
 * - Returns same as teachers PLUS evidenceSummary and revisionId
 */
router.get('/:subject/:grade/:topicId/:situation', async (req, res) => {
  try {
    const { subject, grade, topicId, situation } = req.params;
    const userRole = req.userRole; // From detectRole middleware

    const prepCard = await PrepCard.findOne({
      subject,
      grade: parseInt(grade),
      topicId,
      situation
    });

    if (!prepCard) {
      return res.status(404).json({ error: 'Prep card not found' });
    }

    // Check for active revision
    const activeRevision = await PrepCardRevision.findOne({
      basePrepCardId: prepCard._id,
      status: 'active'
    });

    if (activeRevision) {
      // Build response with revision overlay
      const response = {
        // Base PrepCard metadata
        _id: prepCard._id,
        subject: prepCard.subject,
        grade: prepCard.grade,
        topicId: prepCard.topicId,
        situation: prepCard.situation,
        successRate: prepCard.successRate,
        confidence: prepCard.confidence,
        version: prepCard.version,
        createdAt: prepCard.createdAt,
        updatedAt: prepCard.updatedAt,

        // Revised content (from active revision)
        whatBreaksHere: activeRevision.revisedGuidance.whatBreaksHere,
        earlyWarningSigns: activeRevision.revisedGuidance.earlyWarningSigns,
        ifStudentsLost: activeRevision.revisedGuidance.ifStudentsLost,
        ifStudentsBored: activeRevision.revisedGuidance.ifStudentsBored,
        peerInsights: activeRevision.revisedGuidance.peerInsights,

        // Revision metadata (visible to both)
        isRevised: true,
        revisionDate: activeRevision.activatedAt,
        revisionNumber: activeRevision.revisionNumber
      };

      // CRPs also get evidence summary (teachers do not)
      if (userRole === 'crp') {
        response.evidenceSummary = activeRevision.evidenceSummary;
        response.revisionId = activeRevision._id;
        response.revisionStatus = activeRevision.status;
      }

      return res.json(response);
    }

    // No active revision - return base PrepCard
    const response = prepCard.toObject();
    response.isRevised = false;

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
