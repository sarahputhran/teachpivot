/**
 * Risk Flagging Script for TeachPivot
 * 
 * This script evaluates AggregatedSignal documents and applies deterministic
 * risk flags based on explicit, auditable criteria.
 * 
 * COLLECTION READS: AggregatedSignal
 * COLLECTION WRITES: AggregatedSignal ONLY
 * 
 * FLAGGING POLICY:
 * - A record is eligible for flagging only if:
 *     totalReflections >= 5
 * - A record should be flagged if:
 *     failureRate >= 0.30 (30%)
 *     AND at least one themeSignal accounts for >= 40% of failures
 * 
 * FLAG LIFECYCLE:
 * - FLAGS TURN ON when:
 *     All three criteria are met (eligibility + failureRate + theme concentration)
 *     flaggedAt is set to the timestamp of FIRST flagging
 *     flagHistory counter is incremented
 * 
 * - FLAGS TURN OFF (RESOLVE) when:
 *     failureRate drops below threshold, OR
 *     dominant theme concentration drops below threshold, OR
 *     totalReflections drops below minimum (edge case)
 *     isFlagged is set to false
 *     resolvedAt is set to the current timestamp
 *     resolvedReason describes which criterion failed
 *     flaggedAt is PRESERVED for audit purposes
 * 
 * IDEMPOTENCY GUARANTEE:
 * - Re-running this script on already-flagged documents:
 *     Does NOT update flaggedAt (preserves original flag time)
 *     Does NOT increment flagHistory
 *     Only updates flagReason if criteria values change
 * 
 * - Re-running on already-resolved documents:
 *     Does NOT update resolvedAt unless flag state changes
 *     Preserves full audit trail
 * 
 * WRITE SAFETY CONFIRMATION:
 * - Only AggregatedSignal collection is ever written to
 * - No new collections are created
 * - PrepCard and Reflection are never modified
 **/


const mongoose = require('mongoose');
const AggregatedSignal = require('../models/AggregatedSignal');

// =============================================================================
// CONFIGURATION: Flagging Thresholds
// =============================================================================

const FLAGGING_CONFIG = {
    // Minimum reflections required for a record to be eligible for flagging
    minReflectionsForEligibility: 5,

    // Minimum failure rate (as decimal) to trigger flagging consideration
    failureRateThreshold: 0.30,

    // Minimum percentage of failures a single theme must account for
    // to indicate a concentrated pattern (as decimal, 0.40 = 40%)
    themeConcentrationThreshold: 0.40
};

// =============================================================================
// FLAGGING LOGIC
// =============================================================================

/**
 * Evaluate a single AggregatedSignal document against flagging criteria.
 * Returns the flag status and structured reason.
 * 
 * @param {Object} signal - AggregatedSignal document (lean)
 * @param {Object} config - Flagging configuration thresholds
 * @returns {Object} - { isFlagged: boolean, flagReason: Object }
 */
function evaluateFlaggingCriteria(signal, config = FLAGGING_CONFIG) {
    const totalReflections = signal.totalReflections || 0;
    const failureRate = signal.failureRate || 0;
    const didntWorkCount = signal.didntWorkCount || 0;

    // Initialize structured reason object
    const flagReason = {
        eligibility: {
            totalReflections: totalReflections,
            requiredMinimum: config.minReflectionsForEligibility,
            met: totalReflections >= config.minReflectionsForEligibility
        },
        failureRateCriteria: {
            failureRate: failureRate,
            threshold: config.failureRateThreshold,
            met: false  // Will be evaluated if eligible
        },
        dominantThemeCriteria: {
            themeName: null,
            themeCount: 0,
            failureCount: didntWorkCount,
            percentageOfFailures: 0,
            threshold: config.themeConcentrationThreshold,
            met: false
        }
    };

    // STEP 1: Check eligibility
    if (!flagReason.eligibility.met) {
        // Not eligible for flagging - insufficient sample size
        return {
            isFlagged: false,
            flagReason: flagReason
        };
    }

    // STEP 2: Check failure rate threshold
    flagReason.failureRateCriteria.met = failureRate >= config.failureRateThreshold;

    if (!flagReason.failureRateCriteria.met) {
        // Failure rate below threshold - not flagged
        return {
            isFlagged: false,
            flagReason: flagReason
        };
    }

    // STEP 3: Check for dominant theme in failures
    // We need to find if any theme accounts for >= threshold of failures
    // Theme signal count represents how many reflections had that theme as a reason

    const themeSignals = signal.themeSignals;

    if (!themeSignals || didntWorkCount === 0) {
        // No theme data or no failures - cannot evaluate theme concentration
        return {
            isFlagged: false,
            flagReason: flagReason
        };
    }

    // Find the theme with highest count and check if it meets concentration threshold
    let dominantTheme = null;
    let maxThemeCount = 0;
    let maxPercentage = 0;

    // themeSignals is a Map in Mongoose, convert if needed
    const themeEntries = themeSignals instanceof Map
        ? Array.from(themeSignals.entries())
        : Object.entries(themeSignals);

    for (const [themeName, themeData] of themeEntries) {
        const count = themeData?.count || 0;
        if (count > maxThemeCount) {
            maxThemeCount = count;
            dominantTheme = themeName;
        }
    }

    // Calculate percentage of failures this theme accounts for
    if (dominantTheme && didntWorkCount > 0) {
        maxPercentage = maxThemeCount / didntWorkCount;

        flagReason.dominantThemeCriteria.themeName = dominantTheme;
        flagReason.dominantThemeCriteria.themeCount = maxThemeCount;
        flagReason.dominantThemeCriteria.percentageOfFailures = Math.round(maxPercentage * 10000) / 10000;
        flagReason.dominantThemeCriteria.met = maxPercentage >= config.themeConcentrationThreshold;
    }

    // FINAL DECISION: Flag if ALL criteria are met
    const isFlagged = (
        flagReason.eligibility.met &&
        flagReason.failureRateCriteria.met &&
        flagReason.dominantThemeCriteria.met
    );

    return {
        isFlagged: isFlagged,
        flagReason: flagReason
    };
}

/**
 * Determine the reason why a previously flagged record is now resolved.
 * Inspects the flagReason object to identify which criterion no longer passes.
 * 
 * @param {Object} flagReason - The structured flag reason from evaluation
 * @returns {string} - Human-readable description of resolution reason
 */
function determineResolutionReason(flagReason) {
    const reasons = [];

    if (!flagReason.eligibility.met) {
        reasons.push(`totalReflections (${flagReason.eligibility.totalReflections}) dropped below minimum (${flagReason.eligibility.requiredMinimum})`);
    }

    if (!flagReason.failureRateCriteria.met) {
        const currentRate = (flagReason.failureRateCriteria.failureRate * 100).toFixed(1);
        const threshold = (flagReason.failureRateCriteria.threshold * 100).toFixed(1);
        reasons.push(`failureRate (${currentRate}%) dropped below threshold (${threshold}%)`);
    }

    if (!flagReason.dominantThemeCriteria.met) {
        const currentPct = (flagReason.dominantThemeCriteria.percentageOfFailures * 100).toFixed(1);
        const threshold = (flagReason.dominantThemeCriteria.threshold * 100).toFixed(1);
        const themeName = flagReason.dominantThemeCriteria.themeName || 'no theme';
        reasons.push(`dominant theme concentration (${themeName}: ${currentPct}%) dropped below threshold (${threshold}%)`);
    }

    if (reasons.length === 0) {
        return 'Criteria no longer met (unspecified)';
    }

    return reasons.join('; ');
}

// =============================================================================
// MAIN FLAGGING FUNCTION
// =============================================================================

/**
 * Run the risk flagging evaluation on all AggregatedSignal documents.
 * Updates each document with flag metadata.
 * 
 * @returns {Promise<Object>} - Summary of operations
 */
async function runRiskFlagging() {
    const executionTimestamp = new Date().toISOString();
    console.log('='.repeat(70));
    console.log('[RISK FLAGS] Risk Flagging Evaluation Started');
    console.log(`[RISK FLAGS] Timestamp: ${executionTimestamp}`);
    console.log('='.repeat(70));

    // Log configuration
    console.log('[CONFIG] Flagging thresholds:');
    console.log(`  - Minimum reflections for eligibility: ${FLAGGING_CONFIG.minReflectionsForEligibility}`);
    console.log(`  - Failure rate threshold: ${FLAGGING_CONFIG.failureRateThreshold * 100}%`);
    console.log(`  - Theme concentration threshold: ${FLAGGING_CONFIG.themeConcentrationThreshold * 100}%`);
    console.log('');

    // ========== STEP 1: VERIFY INPUT DATA ==========
    const aggregatedSignalCount = await AggregatedSignal.countDocuments();
    console.log(`[INPUT] AggregatedSignal documents to evaluate: ${aggregatedSignalCount}`);

    if (aggregatedSignalCount === 0) {
        console.log('[INPUT] WARNING: No AggregatedSignal documents found.');
        return {
            processed: 0,
            flagged: 0,
            unflagged: 0,
            reason: 'No AggregatedSignal documents'
        };
    }

    // ========== STEP 2: PROCESS EACH AGGREGATED SIGNAL ==========
    console.log('[PROCESSING] Evaluating flagging criteria for each document...');

    const aggregatedSignals = await AggregatedSignal.find({}).lean();

    let processedCount = 0;
    let flaggedCount = 0;
    let unflaggedCount = 0;
    let updatedCount = 0;

    let resolvedCount = 0;
    let newlyFlaggedCount = 0;
    let unchangedCount = 0;

    for (const signal of aggregatedSignals) {
        processedCount++;

        // Evaluate flagging criteria
        const { isFlagged, flagReason } = evaluateFlaggingCriteria(signal);

        // Get current flag state from the document
        const wasAlreadyFlagged = signal.isFlagged === true;
        const now = new Date();

        // Build update document with IDEMPOTENCY in mind
        const update = { $set: {} };

        // Always update flagReason to reflect current evaluation
        update.$set.flagReason = flagReason;

        if (isFlagged && !wasAlreadyFlagged) {
            // CASE 1: Newly flagged (was not flagged before, now should be)
            update.$set.isFlagged = true;
            update.$set.flaggedAt = now;
            update.$set.resolvedAt = null;  // Clear any previous resolution
            update.$set.resolvedReason = null;
            update.$inc = { flagHistory: 1 };  // Increment flag history counter
            newlyFlaggedCount++;

            console.log(`  [NEW FLAG] ${signal.subject} / Grade ${signal.grade} / ${signal.topicId}`);
            console.log(`             Situation: "${(signal.situation || '').substring(0, 50)}..."`);
            console.log(`             Failure Rate: ${(signal.failureRate * 100).toFixed(1)}%`);
            console.log(`             Dominant Theme: ${flagReason.dominantThemeCriteria.themeName} (${(flagReason.dominantThemeCriteria.percentageOfFailures * 100).toFixed(1)}% of failures)`);

        } else if (isFlagged && wasAlreadyFlagged) {
            // CASE 2: Still flagged (IDEMPOTENT - do NOT update flaggedAt or flagHistory)
            // Only flagReason is updated (already set above)
            update.$set.isFlagged = true;
            // Preserve existing flaggedAt - do not overwrite
            // Preserve existing flagHistory - do not increment
            flaggedCount++;
            unchangedCount++;

            // Silent - no logging for unchanged state

        } else if (!isFlagged && wasAlreadyFlagged) {
            // CASE 3: Flag resolved (was flagged, now criteria not met)
            update.$set.isFlagged = false;
            update.$set.resolvedAt = now;
            // Preserve flaggedAt for audit trail - do NOT set to null

            // Determine resolution reason
            const resolutionReason = determineResolutionReason(flagReason);
            update.$set.resolvedReason = resolutionReason;
            resolvedCount++;

            console.log(`  [RESOLVED] ${signal.subject} / Grade ${signal.grade} / ${signal.topicId}`);
            console.log(`             Reason: ${resolutionReason}`);
            console.log(`             Originally flagged at: ${signal.flaggedAt || 'unknown'}`);

        } else {
            // CASE 4: Still not flagged (was not flagged, still not flagged)
            update.$set.isFlagged = false;
            // No changes to timestamps - preserve any historical data
            unflaggedCount++;
            unchangedCount++;

            // Silent - no logging for unchanged unflagged state
        }

        // Update the document
        const updateResult = await AggregatedSignal.updateOne(
            { _id: signal._id },
            update
        );

        if (updateResult.modifiedCount > 0) {
            updatedCount++;
        }
    }

    // ========== STEP 3: SUMMARY ==========
    const summary = {
        processed: processedCount,
        newlyFlagged: newlyFlaggedCount,
        stillFlagged: flaggedCount,
        resolved: resolvedCount,
        notFlagged: unflaggedCount,
        unchanged: unchangedCount,
        updated: updatedCount,
        config: FLAGGING_CONFIG
    };

    console.log('');
    console.log('='.repeat(70));
    console.log('[RISK FLAGS] Evaluation Complete');
    console.log(`[SUMMARY] Documents processed: ${summary.processed}`);
    console.log(`[SUMMARY] Newly flagged: ${summary.newlyFlagged}`);
    console.log(`[SUMMARY] Still flagged (unchanged): ${summary.stillFlagged}`);
    console.log(`[SUMMARY] Flags resolved: ${summary.resolved}`);
    console.log(`[SUMMARY] Not flagged: ${summary.notFlagged}`);
    console.log(`[SUMMARY] Documents updated: ${summary.updated}`);
    console.log('[CONFIRMATION] Only AggregatedSignal collection was written to.');
    console.log('[CONFIRMATION] No new collections created.');
    console.log('[CONFIRMATION] PrepCard and Reflection documents were NOT modified.');
    console.log('='.repeat(70));

    return summary;
}

// =============================================================================
// MAIN ENTRY POINT
// =============================================================================

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
        const result = await runRiskFlagging();
        console.log('Risk flagging completed successfully');
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Risk flagging failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        // Only disconnect if we connected (standalone mode)
        if (require.main === module) {
            await mongoose.disconnect();
            console.log('Disconnected from MongoDB');
        }
    }
}

// Export for use as a module (callable from routes)
module.exports = {
    runRiskFlagging,
    evaluateFlaggingCriteria,
    determineResolutionReason,
    FLAGGING_CONFIG
};

// Run if executed directly as a script
if (require.main === module) {
    main();
}
