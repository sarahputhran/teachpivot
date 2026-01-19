const express = require('express');
const router = express.Router();
const AggregatedSignal = require('../models/AggregatedSignal');
const { runAggregation } = require('../data/aggregateReflections');

// POST - Trigger aggregation of reflections into AggregatedSignal
// This is a callable endpoint, NOT auto-run on startup
router.post('/aggregate', async (req, res) => {
  try {
    const result = await runAggregation();
    res.json({
      success: true,
      message: 'Aggregation completed successfully',
      ...result
    });
  } catch (error) {
    console.error('Aggregation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET CRP dashboard - aggregated signals by topic and situation
router.get('/dashboard', async (req, res) => {
  try {
    const { subject, grade } = req.query;

    let query = {};
    if (subject) query.subject = subject;
    if (grade) query.grade = parseInt(grade);

    const signals = await AggregatedSignal.find(query).lean();

    res.json(signals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET topic heatmap for CRP
router.get('/heatmap', async (req, res) => {
  try {
    const { subject, grade } = req.query;

    let query = {};
    if (subject) query.subject = subject;
    if (grade) query.grade = parseInt(grade);

    // Aggregate by topic - calculate difficulty as inverse of success rate
    const pipeline = [
      { $match: query },
      {
        $group: {
          _id: '$topicId',
          avgSuccessRate: { $avg: '$successRate' },
          totalReflections: { $sum: '$totalReflections' }
        }
      },
      {
        $project: {
          topicId: '$_id',
          difficulty: { $subtract: [1, '$avgSuccessRate'] },
          totalReflections: 1,
          _id: 0
        }
      }
    ];

    const heatmap = await AggregatedSignal.aggregate(pipeline);

    res.json(heatmap);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
