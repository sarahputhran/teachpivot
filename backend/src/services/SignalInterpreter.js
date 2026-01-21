const mongoose = require('mongoose');
const TeacherFeedback = require('../models/TeacherFeedback');
const InterpretedSignal = require('../models/InterpretedSignal');
const PrepCard = require('../models/PrepCard');

// ============================================================================
// SEMANTIC PATTERN DICTIONARY
// ============================================================================
// Each key is a clean, human-readable label that will be shown to CRPs.
// Each value is an array of keywords/phrases that map to this pattern.
// 
// DESIGN NOTES:
// - Keywords are normalized (lowercase, no punctuation) before matching
// - Longer phrases are matched first to prevent partial matches
// - Patterns represent INTERPRETED meaning, not raw tokens
// ============================================================================

const SEMANTIC_PATTERNS = {
    // Emotional/Behavioral Patterns
    'Student Hesitation': [
        'scared', 'afraid', 'hesitant', 'nervous', 'anxious', 'shy', 'reluctant',
        'too scared', 'fear', 'fearful', 'timid', 'wouldnt answer', 'didnt raise',
        'wont participate', 'held back', 'unsure', 'self conscious'
    ],
    'Low Engagement': [
        'bored', 'disengaged', 'distracted', 'not paying attention', 'zoned out',
        'uninterested', 'checked out', 'tuned out', 'looking away', 'fidgeting',
        'not focused', 'wandering attention', 'restless', 'disinterested'
    ],
    'Confusion Evident': [
        'confused', 'lost', 'didnt understand', 'dont get it', 'puzzled',
        'struggled', 'struggling', 'difficulty', 'difficult', 'hard to follow',
        'unclear', 'couldnt follow', 'blank stares', 'blank looks', 'bewildered'
    ],

    // Pacing Patterns
    'Pacing Too Fast': [
        'too fast', 'rushed', 'hurried', 'moving too quick', 'speeding',
        'need more time', 'going fast', 'quickly', 'rapid', 'pace too high'
    ],
    'Pacing Too Slow': [
        'too slow', 'dragged', 'dragging', 'boring pace', 'taking too long',
        'slow pace', 'need to speed up', 'moving slow', 'tedious'
    ],

    // Content/Prerequisite Patterns
    'Missing Prerequisites': [
        'prerequisite', 'prior knowledge', 'didnt know basics', 'foundational gap',
        'missing background', 'needed review', 'forgot previous', 'gaps in knowledge',
        'lacked foundation', 'assumed too much'
    ],
    'Content Too Complex': [
        'too complex', 'too hard', 'over their heads', 'above level',
        'too advanced', 'complicated', 'overwhelming', 'too much at once',
        'cognitive overload', 'too many concepts'
    ],
    'Content Too Simple': [
        'too easy', 'too simple', 'already knew', 'repetitive', 'boring easy',
        'not challenging', 'below level', 'knew this already', 'trivial'
    ],

    // Teaching Method Patterns  
    'Needs More Examples': [
        'more examples', 'need examples', 'concrete examples', 'real examples',
        'practical examples', 'show more', 'demonstrate more', 'not enough examples'
    ],
    'Visual Aids Needed': [
        'visual', 'diagram', 'picture', 'chart', 'drawing', 'show visually',
        'needs illustration', 'hard to visualize', 'abstract', 'need to see it'
    ],
    'Language Barrier': [
        'language', 'vocabulary', 'words too hard', 'terminology', 'jargon',
        'english difficulty', 'translation needed', 'didnt understand words',
        'complex language', 'technical terms'
    ],

    // Activity/Interaction Patterns
    'Needs Hands-On': [
        'hands on', 'practical', 'activity', 'manipulatives', 'do something',
        'interactive', 'kinesthetic', 'touch and feel', 'physical activity'
    ],
    'Group Work Issues': [
        'group work', 'collaboration', 'partner work', 'team dynamics',
        'not working together', 'dominated by', 'unequal participation'
    ],

    // Positive Patterns (also worth tracking!)
    'Positive Response': [
        'worked well', 'understood', 'engaged', 'participated actively',
        'got it', 'clicked', 'breakthrough', 'success', 'enjoyed', 'excited'
    ]
};

// Pre-compute sorted keywords for each pattern (longest first for matching priority)
const PATTERN_MATCHERS = {};
for (const [label, keywords] of Object.entries(SEMANTIC_PATTERNS)) {
    PATTERN_MATCHERS[label] = keywords
        .map(kw => kw.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim())
        .filter(kw => kw.length > 0)
        .sort((a, b) => b.length - a.length); // Longest first
}

const MIN_SUPPORT_THRESHOLD = 1; // Minimum feedback entries for a pattern to surface
const DEFAULT_WINDOW_DAYS = 365;

class SignalInterpreter {

    /**
     * Main entry point to compute signals for a specific context.
     */
    async computeSignalsForContext(subject, grade, topicId, situation) {
        console.log(`[SignalInterpreter] Computing signals for: ${subject}/${grade}/${topicId}/${situation}`);

        // 1. Find PrepCard for this context
        const prepCard = await PrepCard.findOne({ subject, grade, topicId, situation });
        if (!prepCard) {
            console.warn('[SignalInterpreter] No PrepCard found, skipping');
            return null;
        }

        // 2. Fetch feedback in the time window
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - DEFAULT_WINDOW_DAYS);

        const feedbacks = await TeacherFeedback.find({
            prepCardId: prepCard._id,
            timestamp: { $gte: startDate, $lte: endDate }
        });

        console.log(`[SignalInterpreter] Found ${feedbacks.length} feedback entries`);

        if (feedbacks.length < MIN_SUPPORT_THRESHOLD) {
            console.log('[SignalInterpreter] Not enough feedback for privacy-safe signals');
            return null;
        }

        // 3. Extract semantic patterns from feedback
        const textSignals = this.extractSemanticPatterns(feedbacks);

        // 4. Upsert InterpretedSignal
        const signalData = {
            subject,
            grade,
            topicId,
            situation,
            prepCardId: prepCard._id,
            textSignals: {
                topTerms: textSignals.topTerms,
                totalFeedbackProcessed: feedbacks.length,
                periodStart: startDate,
                periodEnd: endDate,
                lastComputed: new Date()
            },
            correlatedSignals: [], // Reserved for future use
            minSupportThresholdUsed: MIN_SUPPORT_THRESHOLD,
            computationVersion: 'v2-semantic'
        };

        const signal = await InterpretedSignal.findOneAndUpdate(
            { subject, grade, topicId, situation },
            signalData,
            { upsert: true, new: true }
        );

        console.log(`[SignalInterpreter] Generated ${textSignals.topTerms.length} semantic patterns`);
        return signal;
    }

    /**
     * Extract semantic patterns from feedback using curated dictionary.
     * Returns clean, human-readable labels only.
     */
    extractSemanticPatterns(feedbacks) {
        // Track: Pattern Label -> { hitCount, feedbackIds }
        const patternHits = new Map();

        for (const fb of feedbacks) {
            const normalizedContent = this.normalizeText(fb.content || '');
            const matchedPatterns = this.matchPatterns(normalizedContent);

            // Each pattern matched for this feedback
            for (const patternLabel of matchedPatterns) {
                if (!patternHits.has(patternLabel)) {
                    patternHits.set(patternLabel, { count: 0, feedbackIds: new Set() });
                }
                const stats = patternHits.get(patternLabel);
                stats.count++;
                stats.feedbackIds.add(fb._id.toString());
            }
        }

        // Convert to output format, filter by support threshold
        const signals = [];
        for (const [label, stats] of patternHits.entries()) {
            const sampleSize = stats.feedbackIds.size; // Distinct feedback entries
            if (sampleSize >= MIN_SUPPORT_THRESHOLD) {
                signals.push({
                    term: label, // Already clean, title-case from SEMANTIC_PATTERNS keys
                    frequency: stats.count,
                    relevance: this.computeRelevance(stats.count, sampleSize, feedbacks.length),
                    sampleSize: sampleSize
                });
            }
        }

        // Sort by relevance (most significant first)
        signals.sort((a, b) => b.relevance - a.relevance);

        // Limit to top 5 patterns to avoid noise
        return {
            topTerms: signals.slice(0, 5)
        };
    }

    /**
     * Normalize text for pattern matching.
     * Lowercase, remove punctuation, collapse whitespace.
     */
    normalizeText(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Match normalized text against semantic patterns.
     * Returns array of matched pattern labels.
     */
    matchPatterns(normalizedText) {
        const matched = new Set();

        for (const [label, keywords] of Object.entries(PATTERN_MATCHERS)) {
            for (const keyword of keywords) {
                if (normalizedText.includes(keyword)) {
                    matched.add(label);
                    break; // One match per pattern is enough
                }
            }
        }

        return Array.from(matched);
    }

    /**
     * Compute relevance score for ranking patterns.
     * Higher = more significant pattern.
     */
    computeRelevance(hitCount, sampleSize, totalFeedbacks) {
        // Factors:
        // 1. Coverage: What % of feedbacks mention this pattern
        // 2. Frequency: Total mentions (in case one feedback mentions it multiple times)
        const coverage = sampleSize / totalFeedbacks;
        const frequencyBoost = Math.log10(hitCount + 1);

        // Weighted combination (coverage matters more for CRP insights)
        const relevance = (coverage * 10) + frequencyBoost;
        return parseFloat(relevance.toFixed(2));
    }
}

module.exports = new SignalInterpreter();
