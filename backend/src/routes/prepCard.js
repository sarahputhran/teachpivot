const express = require('express');
const router = express.Router();
const PrepCard = require('../models/PrepCard');
const Curriculum = require('../models/Curriculum');

// GET all situations for a topic (declare first to avoid "situations" being captured as :situation)
// Returns PrepCards enriched with topicName from Curriculum for proper Title Case display
router.get('/:subject/:grade/:topicId/situations', async (req, res) => {
  try {
    const { subject, grade, topicId } = req.params;

    // Fetch PrepCards for this topic
    const prepCards = await PrepCard.find({
      subject,
      grade: parseInt(grade),
      topicId
    }).select('situation whatBreaksHere earlyWarningSigns');

    // Look up the topic name from Curriculum for proper Title Case display
    let topicName = topicId.replace(/_/g, ' '); // Fallback: replace underscores with spaces
    const curriculum = await Curriculum.findOne({
      subject,
      grade: parseInt(grade)
    });

    if (curriculum && curriculum.topics) {
      const topic = curriculum.topics.find(t => t.id === topicId);
      if (topic && topic.name) {
        topicName = topic.name; // Use the proper Title Case name from Curriculum
      }
    }

    // Return enriched response with topicName for UI display
    res.json({
      topicName,
      situations: prepCards
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET prep card for a specific context (subject, grade, topic, situation)
router.get('/:subject/:grade/:topicId/:situation', async (req, res) => {
  try {
    const { subject, grade, topicId, situation } = req.params;

    const prepCard = await PrepCard.findOne({
      subject,
      grade: parseInt(grade),
      topicId,
      situation
    });

    if (!prepCard) {
      return res.status(404).json({ error: 'Prep card not found' });
    }

    res.json(prepCard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
