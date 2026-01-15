const express = require('express');
const router = express.Router();
const PrepCard = require('../models/PrepCard');

// GET all situations for a topic (declare first to avoid "situations" being captured as :situation)
router.get('/:subject/:grade/:topicId/situations', async (req, res) => {
  try {
    const { subject, grade, topicId } = req.params;

    const prepCards = await PrepCard.find({
      subject,
      grade: parseInt(grade),
      topicId
    }).select('situation whatBreaksHere earlyWarningSigns');

    res.json(prepCards);
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
