const express = require('express');
const router = express.Router();
const AggregatedSignal = require('../models/AggregatedSignal');
const InterpretedSignal = require('../models/InterpretedSignal');
const CRPReview = require('../models/CRPReview');
const { runAggregation } = require('../data/aggregateReflections');
const { runThemeExtraction, THEME_NAMES } = require('../data/extractThemeSignals');
const { runRiskFlagging, FLAGGING_CONFIG } = require('../data/applyRiskFlags');
const { roleAuth } = require('../middleware/roleAuth');

// All CRP routes require CRP role - teachers cannot access these
router.use(roleAuth('crp'));

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

router.post('/extract-themes', async (req, res) => {
  try {
    const result = await runThemeExtraction();
    res.json({
      success: true,
      message: 'Theme extraction completed successfully',
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

router.post('/apply-risk-flags', async (req, res) => {
  try {
    const result = await runRiskFlagging();
    res.json({
      success: true,
      message: 'Risk flagging completed successfully',
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

// Recompute interpreted text signals from teacher feedback
const SignalInterpreter = require('../services/SignalInterpreter');
const ReviewSummarizer = require('../services/ReviewSummarizer');
const PrepCard = require('../models/PrepCard');

router.post('/recompute-signals', async (req, res) => {
  try {
    // Get all unique contexts from PrepCards
    const contexts = await PrepCard.aggregate([
      {
        $group: {
          _id: {
            subject: '$subject',
            grade: '$grade',
            topicId: '$topicId',
            situation: '$situation'
          }
        }
      }
    ]);

    let updated = 0;
    for (const ctx of contexts) {
      const { subject, grade, topicId, situation } = ctx._id;
      const result = await SignalInterpreter.computeSignalsForContext(
        subject, grade, topicId, situation
      );
      if (result) updated++;
    }

    res.json({
      success: true,
      message: `Recomputed signals for ${updated} contexts`,
      contextsProcessed: contexts.length,
      signalsUpdated: updated
    });
  } catch (error) {
    console.error('Signal recomputation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/dashboard', async (req, res) => {
  try {
    const { subject, grade } = req.query;

    let query = {};
    if (subject) query.subject = subject;
    if (grade) query.grade = parseInt(grade);

    const signals = await AggregatedSignal.find(query)
      .select('subject grade topicId situation totalReflections successCount successRate partiallyWorkedCount didntWorkCount failureRate confidenceScore commonReasons lastUpdated themeSignals themeLastUpdated isFlagged flagReason flaggedAt resolvedAt resolvedReason flagHistory createdAt updatedAt')
      .lean();

    // If no signals, return empty array immediately to avoid invalid queries
    if (!signals.length) {
      return res.json([]);
    }

    // Fetch InterpretedSignals for these contexts
    const contextKeys = signals.map(s => ({
      subject: s.subject,
      grade: s.grade,
      topicId: s.topicId,
      situation: s.situation
    }));

    // Perform lookups in parallel
    const [interpretedSignals, allReviews] = await Promise.all([
      // Fetch text signals
      InterpretedSignal.find({ $or: contextKeys }).lean(),
      // Fetch reviews
      CRPReview.find({ aggregatedSignalId: { $in: signals.map(s => s._id) } }).sort({ createdAt: -1 }).lean()
    ]);

    // Map by context key for O(1) merge
    const signalMap = new Map();
    interpretedSignals.forEach(is => {
      const key = `${is.subject}-${is.grade}-${is.topicId}-${is.situation}`;
      signalMap.set(key, is);
    });

    // Map reviews by signal ID
    const reviewMap = new Map();
    allReviews.forEach(r => {
      const sid = r.aggregatedSignalId.toString();
      if (!reviewMap.has(sid)) reviewMap.set(sid, []);
      reviewMap.get(sid).push(r);
    });

    // Merge everything into the response
    const enrichedSignals = signals.map(s => {
      const key = `${s.subject}-${s.grade}-${s.topicId}-${s.situation}`;
      const interpreted = signalMap.get(key);
      const reviews = reviewMap.get(s._id.toString()) || [];

      return {
        ...s,
        interpretedSignals: interpreted ? interpreted.textSignals : null,
        reviews: reviews, // All reviews
        latestReview: reviews[0] || null // Most recent review
      };
    });

    // Generate TF-IDF Review Summaries for consensus
    ReviewSummarizer.buildCorpus(enrichedSignals.map(s => ({
      id: s._id,
      reviews: s.reviews || []
    })));

    enrichedSignals.forEach(s => {
      if (s.reviews && s.reviews.length > 0) {
        s.reviewSummary = ReviewSummarizer.generateSummary(s._id, s.reviews);
      }
    });

    res.json(enrichedSignals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/heatmap', async (req, res) => {
  try {
    const { subject, grade } = req.query;

    let query = {};
    if (subject) query.subject = subject;
    if (grade) query.grade = parseInt(grade);

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
          language_barrier_total: { $sum: '$themeSignals.language_barrier.count' },
          pacing_mismatch_total: { $sum: '$themeSignals.pacing_mismatch.count' },
          prerequisite_gap_total: { $sum: '$themeSignals.prerequisite_gap.count' },
          example_relevance_total: { $sum: '$themeSignals.example_relevance.count' },
          engagement_total: { $sum: '$themeSignals.engagement.count' },
          complexity_total: { $sum: '$themeSignals.complexity.count' },
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

router.post('/reviews', async (req, res) => {
  try {
    const { subject, grade, topicId, situation, aggregatedSignalId, action, reasons, notes } = req.body;

    if (!subject || grade === undefined || !topicId || !situation || !aggregatedSignalId || !action) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: subject, grade, topicId, situation, aggregatedSignalId, action'
      });
    }

    const validActions = ['needs_modification', 'add_alternate', 'no_change'];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        error: `Invalid action. Must be one of: ${validActions.join(', ')}`
      });
    }

    const signal = await AggregatedSignal.findById(aggregatedSignalId).lean();
    if (!signal) {
      return res.status(404).json({
        success: false,
        error: 'AggregatedSignal not found'
      });
    }

    if (!signal.isFlagged) {
      return res.status(400).json({
        success: false,
        error: 'Cannot create review for an AggregatedSignal that is not flagged'
      });
    }

    const review = new CRPReview({
      subject,
      grade,
      topicId,
      situation,
      aggregatedSignalId,
      action,
      reasons: reasons || [],
      notes: notes || null
    });

    await review.save();

    res.status(201).json({
      success: true,
      message: 'CRP review created successfully',
      review
    });
  } catch (error) {
    console.error('CRP review creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/reviews/:aggregatedSignalId', async (req, res) => {
  try {
    const { aggregatedSignalId } = req.params;

    const signal = await AggregatedSignal.findById(aggregatedSignalId).lean();
    if (!signal) {
      return res.status(404).json({
        success: false,
        error: 'AggregatedSignal not found'
      });
    }

    const reviews = await CRPReview.find({ aggregatedSignalId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      aggregatedSignalId,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('CRP reviews fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
