const express = require('express');
const router = express.Router();
const TeacherFeedback = require('../models/TeacherFeedback');
const PrepCard = require('../models/PrepCard');
const SignalInterpreter = require('../services/SignalInterpreter');

// @route   POST /api/feedback
// @desc    Submit teacher free-text feedback (append-only)
// @access  Public (for now, pending auth integration)
router.post('/', async (req, res) => {
    try {
        const { prepCardId, content, clientVersion } = req.body;

        // 1. Basic Validation
        if (!prepCardId || !content) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: prepCardId, content'
            });
        }

        if (typeof content !== 'string') { // Allow empty string check to handle logic below
            return res.status(400).json({ success: false, message: 'Content must be a string' });
        }

        const trimmedContent = content.trim();

        if (trimmedContent.length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Feedback too short. Minimum 10 characters required.'
            });
        }

        if (trimmedContent.length > 5000) {
            return res.status(400).json({
                success: false,
                message: 'Feedback too long. Maximum 5000 characters allowed.'
            });
        }

        // 2. Validate PrepCard Existence & Get Context
        const prepCard = await PrepCard.findById(prepCardId);
        if (!prepCard) {
            return res.status(404).json({
                success: false,
                message: 'PrepCard not found'
            });
        }

        // 3. Create Record (Append-Only)
        // No interpretation logic triggered here.
        const feedback = await TeacherFeedback.create({
            prepCardId,
            content: trimmedContent,
            clientVersion
        });

        res.status(201).json({
            success: true,
            data: {
                id: feedback._id,
                timestamp: feedback.timestamp
            }
        });

        // 4. Trigger Signal Interpretation (Async / Fire-and-forget for speed)
        // In prod, this might be a job queue. For now, just run it.
        SignalInterpreter.computeSignalsForContext(
            prepCard.subject,
            prepCard.grade,
            prepCard.topicId,
            prepCard.situation
        ).catch(err => console.error('Signal computation failed:', err));

    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

module.exports = router;
