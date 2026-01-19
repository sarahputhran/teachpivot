const express = require('express');
const router = express.Router();
const AggregatedSignal = require('../models/AggregatedSignal');
const { runAggregation } = require('../data/aggregateReflections');
const { runThemeExtraction, THEME_NAMES } = require('../data/extractThemeSignals');
const { runRiskFlagging, FLAGGING_CONFIG } = require('../data/applyRiskFlags');

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

// POST - Trigger Phase 3 theme signal extraction
// Extracts pedagogical themes from Reflection data and stores in AggregatedSignal
// WRITES TO: AggregatedSignal ONLY (themeSignals, themeLastUpdated fields)
router.post('/extract-themes', async (req, res) => {
  try {
    const result = await runThemeExtraction();
    res.json({
      success: true,
      message: 'Phase 3 theme extraction completed successfully',
      themes: THEME_NAMES,
      ...result
    });
  } catch (error) {
    console.error('Theme extraction error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Trigger Phase 4 risk flagging evaluation
// Evaluates AggregatedSignal documents and applies risk flags based on deterministic criteria
// WRITES TO: AggregatedSignal ONLY (isFlagged, flagReason, flaggedAt fields)
router.post('/apply-risk-flags', async (req, res) => {
  try {
    const result = await runRiskFlagging();
    res.json({
      success: true,
      message: 'Phase 4 risk flagging completed successfully',
      config: FLAGGING_CONFIG,
      ...result
    });
  } catch (error) {
    console.error('Risk flagging error:', error);
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

// GET theme signals for a specific topic/situation
// Returns aggregated theme counts and scores
router.get('/theme-signals', async (req, res) => {
  try {
    const { subject, grade, topicId, situation } = req.query;

    let query = { themeSignals: { $exists: true } };
    if (subject) query.subject = subject;
    if (grade) query.grade = parseInt(grade);
    if (topicId) query.topicId = topicId;
    if (situation) query.situation = situation;

    const signals = await AggregatedSignal.find(query)
      .select('subject grade topicId situation themeSignals themeLastUpdated totalReflections')
      .lean();

    res.json({
      count: signals.length,
      availableThemes: THEME_NAMES,
      signals: signals
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET theme heatmap - aggregated theme prevalence by topic
// Useful for identifying which topics have specific pedagogical challenges
router.get('/theme-heatmap', async (req, res) => {
  try {
    const { subject, grade, theme } = req.query;

    let matchQuery = { themeSignals: { $exists: true } };
    if (subject) matchQuery.subject = subject;
    if (grade) matchQuery.grade = parseInt(grade);

    const pipeline = [
      { $match: matchQuery },
      {
        $group: {
          _id: '$topicId',
          totalReflections: { $sum: '$totalReflections' },
          // Aggregate theme counts across all situations for each topic
          language_barrier_total: { $sum: '$themeSignals.language_barrier.count' },
          pacing_mismatch_total: { $sum: '$themeSignals.pacing_mismatch.count' },
          prerequisite_gap_total: { $sum: '$themeSignals.prerequisite_gap.count' },
          example_relevance_total: { $sum: '$themeSignals.example_relevance.count' },
          engagement_total: { $sum: '$themeSignals.engagement.count' },
          complexity_total: { $sum: '$themeSignals.complexity.count' },
          // Aggregate TF-IDF scores
          language_barrier_score: { $avg: '$themeSignals.language_barrier.score' },
          pacing_mismatch_score: { $avg: '$themeSignals.pacing_mismatch.score' },
          prerequisite_gap_score: { $avg: '$themeSignals.prerequisite_gap.score' },
          example_relevance_score: { $avg: '$themeSignals.example_relevance.score' },
          engagement_score: { $avg: '$themeSignals.engagement.score' },
          complexity_score: { $avg: '$themeSignals.complexity.score' }
        }
      },
      {
        $project: {
          topicId: '$_id',
          totalReflections: 1,
          themes: {
            language_barrier: { count: '$language_barrier_total', avgScore: '$language_barrier_score' },
            pacing_mismatch: { count: '$pacing_mismatch_total', avgScore: '$pacing_mismatch_score' },
            prerequisite_gap: { count: '$prerequisite_gap_total', avgScore: '$prerequisite_gap_score' },
            example_relevance: { count: '$example_relevance_total', avgScore: '$example_relevance_score' },
            engagement: { count: '$engagement_total', avgScore: '$engagement_score' },
            complexity: { count: '$complexity_total', avgScore: '$complexity_score' }
          },
          _id: 0
        }
      }
    ];

    const heatmap = await AggregatedSignal.aggregate(pipeline);

    // If a specific theme is requested, sort by that theme's count
    if (theme && THEME_NAMES.includes(theme)) {
      heatmap.sort((a, b) => (b.themes[theme]?.count || 0) - (a.themes[theme]?.count || 0));
    }

    res.json({
      availableThemes: THEME_NAMES,
      topicCount: heatmap.length,
      heatmap: heatmap
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET flagged signals - retrieve all flagged AggregatedSignal documents for auditing
// Returns documents with isFlagged=true, sorted by flaggedAt descending
router.get('/flagged-signals', async (req, res) => {
  try {
    const { subject, grade, topicId } = req.query;

    let query = { isFlagged: true };
    if (subject) query.subject = subject;
    if (grade) query.grade = parseInt(grade);
    if (topicId) query.topicId = topicId;

    const flaggedSignals = await AggregatedSignal.find(query)
      .select('subject grade topicId situation totalReflections failureRate didntWorkCount themeSignals isFlagged flagReason flaggedAt')
      .sort({ flaggedAt: -1 })
      .lean();

    res.json({
      count: flaggedSignals.length,
      config: FLAGGING_CONFIG,
      signals: flaggedSignals
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
