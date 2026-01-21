const express = require('express');
const router = express.Router();

// Import sub-routers
const curriculumRouter = require('./curriculum');
const prepCardRouter = require('./prepCard');
const reflectionRouter = require('./reflection');
const crpRouter = require('./crp');
const revisionsRouter = require('./revisions');
const feedbackRouter = require('./feedback');

// Import Models for direct top-level routes
const Curriculum = require('../models/Curriculum');

/* =========================
   Sanity Check / Health
   ========================= */
router.get('/test', (req, res) => {
    res.json({ ok: true });
});

router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

/* =========================
   Top-level Routes (:8000/api/...)
   ========================= */

// GET /api/topics - Return list of all unique topics
router.get('/topics', async (req, res) => {
    try {
        // Strategy: Fetch all curriculum docs, extract distinct topics
        // Or fetch distinct topic IDs from PrepCards if Curriculum is empty?
        // Let's rely on Curriculum model as primary source of truth for structure.

        // Fetch all curriculums to get all topics
        const allCurriculums = await Curriculum.find({});

        let allTopics = [];
        allCurriculums.forEach(curr => {
            if (curr.topics && Array.isArray(curr.topics)) {
                allTopics.push(...curr.topics);
            }
        });

        // Remove duplicates based on ID
        const uniqueTopics = Array.from(new Map(allTopics.map(item => [item.id, item])).values());

        res.json(uniqueTopics);
    } catch (error) {
        console.error('Error fetching topics:', error);
        res.status(500).json({ error: error.message });
    }
});

/* =========================
   Mount Sub-Routers
   ========================= */
// Access: /api/curriculum/...
router.use('/curriculum', curriculumRouter);

// Access: /api/prep-cards/...
router.use('/prep-cards', prepCardRouter);

// Access: /api/reflections/...
router.use('/reflections', reflectionRouter);

// Access: /api/crp/revisions/... -> Note: Mount specific route BEFORE generic /crp to avoid masking
router.use('/crp/revisions', revisionsRouter);

// Access: /api/crp/...
router.use('/crp', crpRouter);

// Access: /api/feedback/...
router.use('/feedback', feedbackRouter);

module.exports = router;
