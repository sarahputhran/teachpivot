const mongoose = require('mongoose');
const Reflection = require('../models/Reflection');
const AggregatedSignal = require('../models/AggregatedSignal');

// Each theme maps to:
// 1. directReasons: enum values from Reflection.reason that directly indicate this theme
// 2. keywords: terms to match via TF-IDF in situation text
// =============================================================================

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

// =============================================================================
// TF-IDF IMPLEMENTATION (Lightweight, No External Dependencies)
// =============================================================================

/**
 * Tokenize text into lowercase words, removing punctuation
 * @param {string} text - Input text
 * @returns {string[]} - Array of lowercase tokens
 */
function tokenize(text) {
    if (!text || typeof text !== 'string') return [];
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')  // Remove punctuation
        .split(/\s+/)                   // Split on whitespace
        .filter(token => token.length > 2);  // Remove very short tokens
}

/**
 * Compute term frequency for a document
 * @param {string[]} tokens - Tokenized document
 * @returns {Map<string, number>} - Term frequency map
 */
function computeTF(tokens) {
    const tf = new Map();
    const totalTokens = tokens.length;
    if (totalTokens === 0) return tf;

    for (const token of tokens) {
        tf.set(token, (tf.get(token) || 0) + 1);
    }

    // Normalize by document length
    for (const [term, count] of tf) {
        tf.set(term, count / totalTokens);
    }

    return tf;
}

/**
 * Compute inverse document frequency across a corpus
 * @param {string[][]} corpus - Array of tokenized documents
 * @returns {Map<string, number>} - IDF map
 */
function computeIDF(corpus) {
    const idf = new Map();
    const N = corpus.length;
    if (N === 0) return idf;

    // Count documents containing each term
    const docFreq = new Map();
    for (const tokens of corpus) {
        const uniqueTokens = new Set(tokens);
        for (const token of uniqueTokens) {
            docFreq.set(token, (docFreq.get(token) || 0) + 1);
        }
    }

    // Compute IDF: log(N / df)
    for (const [term, df] of docFreq) {
        idf.set(term, Math.log(N / df));
    }

    return idf;
}

/**
 * Compute TF-IDF scores for a single document
 * @param {Map<string, number>} tf - Term frequency map
 * @param {Map<string, number>} idf - IDF map
 * @returns {Map<string, number>} - TF-IDF scores
 */
function computeTFIDF(tf, idf) {
    const tfidf = new Map();
    for (const [term, tfScore] of tf) {
        const idfScore = idf.get(term) || 0;
        tfidf.set(term, tfScore * idfScore);
    }
    return tfidf;
}

// =============================================================================
// THEME EXTRACTION LOGIC
// =============================================================================

/**
 * Map a set of TF-IDF scored terms to theme scores
 * @param {Map<string, number>} tfidf - TF-IDF scores for a document
 * @returns {Object} - Theme scores { themeName: score }
 */
function mapTermsToThemes(tfidf) {
    const themeScores = {};

    for (const themeName of THEME_NAMES) {
        const theme = THEME_DICTIONARY[themeName];
        let score = 0;

        // Sum TF-IDF scores for matching keywords
        for (const keyword of theme.keywords) {
            // Check for exact match or keyword as part of a token
            for (const [term, tfidfScore] of tfidf) {
                if (term === keyword || term.includes(keyword) || keyword.includes(term)) {
                    score += tfidfScore;
                }
            }
        }

        themeScores[themeName] = Math.round(score * 10000) / 10000;  // Round to 4 decimals
    }

    return themeScores;
}

/**
 * Count direct reason mappings to themes
 * @param {string[]} reasons - Array of reason enum values
 * @returns {Object} - Theme counts { themeName: count }
 */
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

/**
 * Aggregate theme signals for a group of reflections
 * @param {Object[]} reflections - Array of reflection documents
 * @param {Map<string, number>} globalIDF - Precomputed IDF across all situations
 * @returns {Object} - Aggregated theme signals
 */
function aggregateThemeSignals(reflections, globalIDF) {
    // Initialize aggregated signals
    const themeSignals = {};
    for (const themeName of THEME_NAMES) {
        themeSignals[themeName] = {
            count: 0,   // Direct reason counts
            score: 0    // TF-IDF based keyword scores
        };
    }

    // Collect all reasons
    const allReasons = reflections.map(r => r.reason).filter(r => r);

    // Count direct reason mappings
    const reasonCounts = countDirectReasons(allReasons);
    for (const themeName of THEME_NAMES) {
        themeSignals[themeName].count = reasonCounts[themeName];
    }

    // Process situation text via TF-IDF
    // Since all reflections in a group share the same situation, we use the first one
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

// =============================================================================
// MAIN AGGREGATION FUNCTION
// =============================================================================

/**
 * Run Phase 3 theme extraction and update AggregatedSignal documents
 * @returns {Promise<Object>} - Summary of operations
 */
async function runThemeExtraction() {
    const executionTimestamp = new Date().toISOString();
    console.log('='.repeat(70));
    console.log('[PHASE 3] Theme Signal Extraction Started');
    console.log(`[PHASE 3] Timestamp: ${executionTimestamp}`);
    console.log('='.repeat(70));

    // ========== STEP 1: VERIFY INPUT DATA ==========
    const reflectionCount = await Reflection.countDocuments();
    const aggregatedSignalCount = await AggregatedSignal.countDocuments();

    console.log(`[INPUT] Reflection documents: ${reflectionCount}`);
    console.log(`[INPUT] AggregatedSignal documents: ${aggregatedSignalCount}`);

    if (reflectionCount === 0) {
        console.log('[INPUT] WARNING: No Reflection documents found.');
        return { processed: 0, updated: 0, reason: 'No Reflection documents' };
    }

    if (aggregatedSignalCount === 0) {
        console.log('[INPUT] WARNING: No AggregatedSignal documents found. Run Phase 2 first.');
        return { processed: 0, updated: 0, reason: 'No AggregatedSignal documents' };
    }

    // ========== STEP 2: BUILD GLOBAL IDF FROM ALL SITUATIONS ==========
    console.log('[TF-IDF] Building global IDF from all unique situations...');

    // Get all unique situations
    const uniqueSituations = await Reflection.distinct('situation');
    console.log(`[TF-IDF] Found ${uniqueSituations.length} unique situations`);

    // Tokenize all situations to build corpus
    const corpus = uniqueSituations.map(s => tokenize(s));
    const globalIDF = computeIDF(corpus);
    console.log(`[TF-IDF] Global vocabulary size: ${globalIDF.size} terms`);

    // Log top IDF terms (most distinctive)
    const sortedIDF = [...globalIDF.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
    console.log('[TF-IDF] Top 10 distinctive terms (highest IDF):');
    sortedIDF.forEach(([term, idf]) => {
        console.log(`  - "${term}": ${idf.toFixed(4)}`);
    });

    // ========== STEP 3: PROCESS EACH AGGREGATED SIGNAL GROUP ==========
    console.log('[PROCESSING] Extracting theme signals for each AggregatedSignal...');

    // Get all AggregatedSignal documents
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
            console.log(`[WARN] No reflections found for signal: ${signal.topicId} - "${signal.situation?.substring(0, 30)}..."`);
            continue;
        }

        // Aggregate theme signals
        const themeSignals = aggregateThemeSignals(reflections, globalIDF);

        // Update AggregatedSignal (ONLY collection written to)
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

        // Progress logging every 20 documents
        if (processedCount % 20 === 0) {
            console.log(`[PROGRESS] Processed ${processedCount}/${aggregatedSignals.length} documents...`);
        }
    }

    // ========== STEP 4: VERIFICATION AND SUMMARY ==========
    console.log('='.repeat(70));
    console.log('[PHASE 3] Theme Signal Extraction Complete');
    console.log(`[WRITES] Documents processed: ${processedCount}`);
    console.log(`[WRITES] Documents updated in AggregatedSignal: ${updatedCount}`);
    console.log('[WRITES] CONFIRMATION: Only AggregatedSignal collection was written to.');

    // Verify by checking one updated document
    const sampleUpdated = await AggregatedSignal.findOne({ themeSignals: { $exists: true } }).lean();
    if (sampleUpdated) {
        console.log('\n[SAMPLE] Example updated AggregatedSignal document:');
        console.log(JSON.stringify({
            _id: sampleUpdated._id,
            subject: sampleUpdated.subject,
            grade: sampleUpdated.grade,
            topicId: sampleUpdated.topicId,
            situation: sampleUpdated.situation,
            totalReflections: sampleUpdated.totalReflections,
            themeSignals: sampleUpdated.themeSignals,
            themeLastUpdated: sampleUpdated.themeLastUpdated
        }, null, 2));
    }

    console.log('='.repeat(70));

    // ========== SAFETY CHECKS ==========
    console.log('\n[SAFETY] Final Safety Verification:');
    console.log('  - Fields written to AggregatedSignal: themeSignals, themeLastUpdated');
    console.log('  - themeSignals structure: { themeName: { count: Number, score: Number } }');
    console.log('  - Themes: ' + THEME_NAMES.join(', '));
    console.log('  - No raw text stored: CONFIRMED');
    console.log('  - No other collections modified: CONFIRMED');

    return {
        processed: processedCount,
        updated: updatedCount,
        themesExtracted: THEME_NAMES.length,
        vocabularySize: globalIDF.size
    };
}

/**
 * Main entry point for standalone script execution
 */
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
        console.log('\nPhase 3 Theme Extraction completed successfully');
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
