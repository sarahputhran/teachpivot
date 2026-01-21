const mongoose = require('mongoose');
const Reflection = require('../models/Reflection');
const AggregatedSignal = require('../models/AggregatedSignal');

const THEME_DICTIONARY = {
    language_barrier: {
        description: 'Issues related to vocabulary, terminology, or language comprehension',
        directReasons: ['language_confusion'],
        keywords: [
            'language', 'word', 'words', 'term', 'terms', 'meaning', 'vocabulary',
            'confusion', 'confused', 'unclear', 'understand', 'understanding',
            'explain', 'explanation', 'definition', 'define', 'translate',
            'english', 'hindi', 'mother tongue', 'vernacular'
        ]
    },
    pacing_mismatch: {
        description: 'Issues related to lesson timing, speed, or schedule alignment',
        directReasons: ['timing_issue'],
        keywords: [
            'fast', 'slow', 'time', 'timing', 'rush', 'rushed', 'hurry', 'hurried',
            'pace', 'pacing', 'speed', 'behind', 'ahead', 'schedule', 'period',
            'minute', 'minutes', 'hour', 'late', 'early', 'quick', 'quickly',
            'catch up', 'skip', 'skipped', 'cover', 'coverage'
        ]
    },
    prerequisite_gap: {
        description: 'Issues where students lack foundational knowledge needed for current topic',
        directReasons: ['prerequisite_weak'],
        keywords: [
            'basic', 'basics', 'earlier', 'previous', 'foundation', 'foundational',
            'prior', 'background', 'prerequisite', 'weak', 'weakness', 'forgot',
            'forgotten', 'remember', 'recall', 'review', 'revise', 'revision',
            'last year', 'last class', 'grade 2', 'grade 3', 'before', 'already'
        ]
    },
    example_relevance: {
        description: 'Issues where examples or illustrations did not connect with students',
        directReasons: ['example_didnt_land'],
        keywords: [
            'example', 'examples', 'illustration', 'illustrate', 'connect', 'connection',
            'relate', 'related', 'context', 'real', 'practical', 'apply', 'application',
            'relevant', 'relevance', 'story', 'scenario', 'situation', 'case',
            'demonstrate', 'demonstration', 'show', 'visual', 'diagram'
        ]
    },
    engagement: {
        description: 'Issues related to student attention, interest, or participation',
        directReasons: [],  // No direct reason enum for this
        keywords: [
            'attention', 'attentive', 'interest', 'interested', 'focus', 'focused',
            'bored', 'boring', 'distracted', 'distraction', 'engaged', 'engagement',
            'participate', 'participation', 'active', 'passive', 'listen', 'listening',
            'sleepy', 'tired', 'restless', 'excited', 'motivation', 'motivated'
        ]
    },
    complexity: {
        description: 'Issues related to concept difficulty or abstraction level',
        directReasons: [],  // No direct reason enum for this
        keywords: [
            'difficult', 'difficulty', 'hard', 'complex', 'complexity', 'confusing',
            'simple', 'easy', 'abstract', 'abstraction', 'concrete', 'tangible',
            'complicated', 'tough', 'challenge', 'challenging', 'struggle', 'struggling',
            'advanced', 'level', 'step', 'steps', 'break down', 'simplify'
        ]
    }
};

// Get all theme names
const THEME_NAMES = Object.keys(THEME_DICTIONARY);

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

function mapTermsToThemes(tfidf) {
    const themeScores = {};

    for (const themeName of THEME_NAMES) {
        const theme = THEME_DICTIONARY[themeName];
        let score = 0;

        for (const keyword of theme.keywords) {
            for (const [term, tfidfScore] of tfidf) {
                if (term === keyword || term.includes(keyword) || keyword.includes(term)) {
                    score += tfidfScore;
                }
            }
        }

        themeScores[themeName] = Math.round(score * 10000) / 10000;
    }

    return themeScores;
}

function countDirectReasons(reasons) {
    const themeCounts = {};

    for (const themeName of THEME_NAMES) {
        themeCounts[themeName] = 0;
    }

    for (const reason of reasons) {
        if (!reason || reason === 'none') continue;

        for (const themeName of THEME_NAMES) {
            const theme = THEME_DICTIONARY[themeName];
            if (theme.directReasons.includes(reason)) {
                themeCounts[themeName]++;
            }
        }
    }

    return themeCounts;
}

function aggregateThemeSignals(reflections, globalIDF) {
    const themeSignals = {};
    for (const themeName of THEME_NAMES) {
        themeSignals[themeName] = {
            count: 0,
            score: 0
        };
    }

    const allReasons = reflections.map(r => r.reason).filter(r => r);

    const reasonCounts = countDirectReasons(allReasons);
    for (const themeName of THEME_NAMES) {
        themeSignals[themeName].count = reasonCounts[themeName];
    }

    const situationText = reflections[0]?.situation || '';
    const tokens = tokenize(situationText);

    if (tokens.length > 0) {
        const tf = computeTF(tokens);
        const tfidf = computeTFIDF(tf, globalIDF);
        const keywordScores = mapTermsToThemes(tfidf);

        for (const themeName of THEME_NAMES) {
            themeSignals[themeName].score = keywordScores[themeName];
        }
    }

    return themeSignals;
}

async function runThemeExtraction() {
    console.log('[Theme Extraction] Starting...');

    const reflectionCount = await Reflection.countDocuments();
    const aggregatedSignalCount = await AggregatedSignal.countDocuments();

    if (reflectionCount === 0) {
        console.log('[Theme Extraction] No Reflection documents found');
        return { processed: 0, updated: 0, reason: 'No Reflection documents' };
    }

    if (aggregatedSignalCount === 0) {
        console.log('[Theme Extraction] No AggregatedSignal documents found');
        return { processed: 0, updated: 0, reason: 'No AggregatedSignal documents' };
    }

    const uniqueSituations = await Reflection.distinct('situation');
    const corpus = uniqueSituations.map(s => tokenize(s));
    const globalIDF = computeIDF(corpus);

    const aggregatedSignals = await AggregatedSignal.find({}).lean();

    let updatedCount = 0;
    let processedCount = 0;

    for (const signal of aggregatedSignals) {
        processedCount++;

        // Fetch reflections for this group
        const reflections = await Reflection.find({
            subject: signal.subject,
            grade: signal.grade,
            topicId: signal.topicId,
            situation: signal.situation
        }).lean();

        if (reflections.length === 0) {
            continue;
        }

        // Aggregate theme signals
        const themeSignals = aggregateThemeSignals(reflections, globalIDF);

        const updateResult = await AggregatedSignal.updateOne(
            { _id: signal._id },
            {
                $set: {
                    themeSignals: themeSignals,
                    themeLastUpdated: new Date()
                }
            }
        );

        if (updateResult.modifiedCount > 0) {
            updatedCount++;
        }

        if (processedCount % 20 === 0) {
            console.log(`[Progress] ${processedCount}/${aggregatedSignals.length}`);
        }
    }

    console.log('[Theme Extraction] Complete');
    console.log(`Processed: ${processedCount}, Updated: ${updatedCount}`);

    return {
        processed: processedCount,
        updated: updatedCount,
        themesExtracted: THEME_NAMES.length,
        vocabularySize: globalIDF.size
    };
}

async function main() {
    // Check if mongoose is already connected (when called from route)
    if (mongoose.connection.readyState !== 1) {
        // Load environment and connect
        require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

        const mongoURI = process.env.MONGO_URI;
        if (!mongoURI) {
            console.error('MONGO_URI is not defined in environment variables');
            process.exit(1);
        }

        try {
            await mongoose.connect(mongoURI);
            console.log('Connected to MongoDB Atlas');
        } catch (error) {
            console.error('MongoDB connection failed:', error.message);
            process.exit(1);
        }
    }

    try {
        const result = await runThemeExtraction();
        console.log('\nTheme extraction completed successfully');
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Theme extraction failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        // Only disconnect if we connected (standalone mode)
        if (require.main === module) {
            await mongoose.disconnect();
            console.log('\nDisconnected from MongoDB');
        }
    }
}

// Export for use as a module (callable from routes)
module.exports = {
    runThemeExtraction,
    THEME_DICTIONARY,
    THEME_NAMES,
    tokenize,
    computeTF,
    computeIDF,
    computeTFIDF,
    mapTermsToThemes,
    countDirectReasons
};

// Run if executed directly as a script
if (require.main === module) {
    main();
}
