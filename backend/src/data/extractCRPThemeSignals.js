const mongoose = require('mongoose');
const path = require('path');
const CRPReview = require('../models/CRPReview');
const AggregatedSignal = require('../models/AggregatedSignal');

const CRP_THEME_DICTIONARY = {
    instructional_clarity: {
        description: 'Issues with clarity of instruction, explanation, or communication',
        keywords: [
            'unclear', 'confusing', 'vague', 'ambiguous', 'clarity', 'explain',
            'explanation', 'instruction', 'instructions', 'communicate', 'communication',
            'understand', 'understanding', 'misunderstand', 'misunderstood', 'comprehend',
            'comprehension', 'articulate', 'express', 'convey', 'describe', 'definition',
            'define', 'meaning', 'interpret', 'interpretation', 'verbose', 'wordy',
            'concise', 'precise', 'specific', 'general', 'abstract', 'concrete'
        ]
    },
    prerequisite_assumption: {
        description: 'Assumptions about prior knowledge that may not hold',
        keywords: [
            'prerequisite', 'prior', 'previous', 'assume', 'assumption', 'assumes',
            'assuming', 'background', 'foundation', 'foundational', 'basic', 'basics',
            'earlier', 'before', 'already', 'know', 'known', 'knowledge', 'familiar',
            'familiarity', 'exposure', 'exposed', 'introduced', 'introduction',
            'gap', 'gaps', 'missing', 'lack', 'lacking', 'weak', 'weakness',
            'review', 'revise', 'revision', 'recall', 'remember', 'forgot', 'forgotten'
        ]
    },
    activity_design_issue: {
        description: 'Problems with the design or structure of learning activities',
        keywords: [
            'activity', 'activities', 'exercise', 'exercises', 'task', 'tasks',
            'design', 'designed', 'structure', 'structured', 'format', 'approach',
            'method', 'methodology', 'strategy', 'technique', 'practice', 'hands-on',
            'interactive', 'engagement', 'engaging', 'boring', 'passive', 'active',
            'groupwork', 'group', 'individual', 'collaborative', 'collaboration',
            'worksheet', 'material', 'materials', 'resource', 'resources', 'tool', 'tools'
        ]
    },
    curriculum_alignment: {
        description: 'Misalignment between content and curriculum standards or objectives',
        keywords: [
            'curriculum', 'curricular', 'alignment', 'aligned', 'misaligned', 'standard',
            'standards', 'objective', 'objectives', 'goal', 'goals', 'outcome', 'outcomes',
            'learning', 'competency', 'competencies', 'skill', 'skills', 'syllabus',
            'scope', 'sequence', 'benchmark', 'benchmarks', 'grade-level', 'grade',
            'expectation', 'expectations', 'target', 'targets', 'requirement', 'requirements',
            'coverage', 'cover', 'covered', 'topic', 'topics', 'content'
        ]
    },
    time_feasibility: {
        description: 'Concerns about time required vs time available',
        keywords: [
            'time', 'timing', 'duration', 'length', 'long', 'short', 'quick', 'quickly',
            'fast', 'slow', 'rush', 'rushed', 'hurry', 'hurried', 'pace', 'pacing',
            'feasible', 'feasibility', 'realistic', 'unrealistic', 'practical', 'impractical',
            'period', 'periods', 'class', 'session', 'sessions', 'minute', 'minutes',
            'hour', 'hours', 'schedule', 'scheduling', 'fit', 'fitting', 'squeeze',
            'complete', 'completion', 'finish', 'finished', 'enough', 'insufficient'
        ]
    },
    learner_diversity: {
        description: 'Issues related to accommodating diverse learner needs',
        keywords: [
            'diverse', 'diversity', 'different', 'difference', 'differences', 'varied',
            'variety', 'varying', 'range', 'spectrum', 'learner', 'learners', 'student',
            'students', 'ability', 'abilities', 'level', 'levels', 'mixed', 'heterogeneous',
            'differentiate', 'differentiation', 'differentiated', 'accommodate', 'accommodation',
            'adapt', 'adaptation', 'modify', 'modification', 'scaffold', 'scaffolding',
            'support', 'struggling', 'advanced', 'gifted', 'special', 'needs', 'inclusive'
        ]
    }
};

const CRP_THEME_NAMES = Object.keys(CRP_THEME_DICTIONARY);

function tokenize(text) {
    if (!text || typeof text !== 'string') return [];
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(token => token.length > 2);
}

function computeTF(tokens) {
    const tf = new Map();
    const totalTokens = tokens.length;
    if (totalTokens === 0) return tf;

    for (const token of tokens) {
        tf.set(token, (tf.get(token) || 0) + 1);
    }

    for (const [term, count] of tf) {
        tf.set(term, count / totalTokens);
    }

    return tf;
}

function computeIDF(corpus) {
    const idf = new Map();
    const N = corpus.length;
    if (N === 0) return idf;

    const docFreq = new Map();
    for (const tokens of corpus) {
        const uniqueTokens = new Set(tokens);
        for (const token of uniqueTokens) {
            docFreq.set(token, (docFreq.get(token) || 0) + 1);
        }
    }

    for (const [term, df] of docFreq) {
        idf.set(term, Math.log(N / df));
    }

    return idf;
}

function computeTFIDF(tf, idf) {
    const tfidf = new Map();
    for (const [term, tfScore] of tf) {
        const idfScore = idf.get(term) || 0;
        tfidf.set(term, tfScore * idfScore);
    }
    return tfidf;
}

function detectThemesFromTFIDF(tfidf) {
    const detectedThemes = {};

    for (const themeName of CRP_THEME_NAMES) {
        const theme = CRP_THEME_DICTIONARY[themeName];
        let detected = false;

        for (const keyword of theme.keywords) {
            for (const [term, tfidfScore] of tfidf) {
                if (tfidfScore > 0 && (term === keyword || term.includes(keyword) || keyword.includes(term))) {
                    detected = true;
                    break;
                }
            }
            if (detected) break;
        }

        detectedThemes[themeName] = detected;
    }

    return detectedThemes;
}

function extractTextFromCRPReview(crpReview) {
    const textParts = [];

    if (Array.isArray(crpReview.reasons)) {
        for (const reason of crpReview.reasons) {
            if (reason && typeof reason === 'string') {
                textParts.push(reason);
            }
        }
    }

    if (crpReview.notes && typeof crpReview.notes === 'string') {
        textParts.push(crpReview.notes);
    }

    return textParts.join(' ');
}

function createGroupKey(review) {
    return `${review.subject}|${review.grade}|${review.topicId}|${review.situation}`;
}

function parseGroupKey(key) {
    const [subject, grade, topicId, situation] = key.split('|');
    return {
        subject,
        grade: parseInt(grade, 10),
        topicId,
        situation
    };
}

async function runCRPThemeExtraction() {
    console.log('[CRP Theme Extraction] Starting...');
    console.log(`[CRP Theme Extraction] Theme dictionary: ${CRP_THEME_NAMES.join(', ')}`);

    const crpReviews = await CRPReview.find({}).lean();
    const crpCount = crpReviews.length;

    if (crpCount === 0) {
        console.log('[CRP Theme Extraction] No CRPReview documents found');
        return { processed: 0, updated: 0, reason: 'No CRPReview documents' };
    }

    console.log(`[CRP Theme Extraction] Found ${crpCount} CRPReview documents`);

    const allTexts = crpReviews.map(review => extractTextFromCRPReview(review));
    const corpus = allTexts.map(text => tokenize(text));
    const globalIDF = computeIDF(corpus);

    console.log(`[CRP Theme Extraction] Built IDF with vocabulary size: ${globalIDF.size}`);

    const groupedReviews = new Map();

    for (const review of crpReviews) {
        const key = createGroupKey(review);
        if (!groupedReviews.has(key)) {
            groupedReviews.set(key, []);
        }
        groupedReviews.get(key).push(review);
    }

    console.log(`[CRP Theme Extraction] Grouped into ${groupedReviews.size} unique contexts`);

    let updatedCount = 0;
    let processedCount = 0;
    let notFoundCount = 0;

    for (const [key, reviews] of groupedReviews) {
        processedCount++;
        const identity = parseGroupKey(key);

        const themeCounts = {};
        for (const themeName of CRP_THEME_NAMES) {
            themeCounts[themeName] = 0;
        }

        for (const review of reviews) {
            const text = extractTextFromCRPReview(review);
            const tokens = tokenize(text);

            if (tokens.length === 0) {
                continue;
            }

            const tf = computeTF(tokens);
            const tfidf = computeTFIDF(tf, globalIDF);
            const detectedThemes = detectThemesFromTFIDF(tfidf);

            for (const themeName of CRP_THEME_NAMES) {
                if (detectedThemes[themeName]) {
                    themeCounts[themeName]++;
                }
            }
        }

        const updateResult = await AggregatedSignal.updateOne(
            {
                subject: identity.subject,
                grade: identity.grade,
                topicId: identity.topicId,
                situation: identity.situation
            },
            {
                $set: {
                    crpThemeSignals: themeCounts,
                    crpThemeLastUpdated: new Date()
                }
            }
        );

        if (updateResult.matchedCount === 0) {
            notFoundCount++;
            console.log(`[Warning] No AggregatedSignal found for: ${key}`);
        } else if (updateResult.modifiedCount > 0) {
            updatedCount++;
        }

        if (processedCount % 20 === 0) {
            console.log(`[Progress] ${processedCount}/${groupedReviews.size} groups processed`);
        }
    }

    console.log('[CRP Theme Extraction] Complete');
    console.log(`Processed: ${processedCount} groups`);
    console.log(`Updated: ${updatedCount} AggregatedSignal documents`);
    console.log(`Not found: ${notFoundCount} (no matching AggregatedSignal)`);

    return {
        crpReviewsProcessed: crpCount,
        groupsProcessed: processedCount,
        aggregatedSignalsUpdated: updatedCount,
        aggregatedSignalsNotFound: notFoundCount,
        themesInDictionary: CRP_THEME_NAMES.length,
        vocabularySize: globalIDF.size
    };
}

async function main() {
    require('dotenv').config({ path: path.join(__dirname, '../../.env') });

    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
        console.error('ERROR: MONGO_URI is not defined in environment variables');
        process.exit(1);
    }

    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB Atlas');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }

    try {
        const result = await runCRPThemeExtraction();
        console.log('Result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('CRP Theme extraction failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        await mongoose.disconnect();
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    runCRPThemeExtraction,
    CRP_THEME_DICTIONARY,
    CRP_THEME_NAMES,
    tokenize,
    computeTF,
    computeIDF,
    computeTFIDF,
    detectThemesFromTFIDF,
    extractTextFromCRPReview
};
