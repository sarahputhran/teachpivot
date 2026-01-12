const express = require('express');
const router = express.Router();
const Reflection = require('../models/Reflection');

// POST a reflection (anonymized)
router.post('/', async (req, res) => {
  try {
    const { subject, grade, topicId, situation, outcome, reason } = req.body;
    
    if (!outcome) {
      return res.status(400).json({ error: 'outcome is required' });
    }
    
    const reflection = new Reflection({
      subject,
      grade,
      topicId,
      situation,
      outcome,
      reason: reason || 'none'
    });
    
    await reflection.save();
    
    // Trigger pattern learning asynchronously (fire and forget)
    // In production, this would be a job queue
    
    res.status(201).json({ success: true, id: reflection._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
