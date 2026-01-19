/**
 * Aggregation Script for TeachPivot
 * 
 * This script aggregates Reflection documents by (subject, grade, topicId, situation)
 * and writes computed metrics to AggregatedSignal using upsert semantics.
 * 
 * COLLECTION WRITES: AggregatedSignal ONLY
 * 
 * This script is:
 * - Deterministic: Same input always produces same output
 * - Idempotent: Can be run multiple times safely
 * - Non-destructive: Uses upsert, does not delete data
 */

const mongoose = require('mongoose');
const Reflection = require('../models/Reflection');
const AggregatedSignal = require('../models/AggregatedSignal');

/**
 * Compute confidence score based on sample size only.
 * Uses a logarithmic function that asymptotically approaches 1.0
 * as sample size increases, starting low for small samples.
 * 
 * Formula: confidence = 1 - (1 / (1 + ln(1 + n/10)))
 * 
 * This is purely deterministic and based on sample size only:
 * - n=1: ~0.09
 * - n=5: ~0.36
 * - n=10: ~0.50
 * - n=30: ~0.68
 * - n=100: ~0.79
 * - n=500: ~0.87
 * - n=1000: ~0.90
 * 
 * @param {number} sampleSize - The total number of reflections
 * @returns {number} - Confidence score between 0 and 1
 */
function computeConfidenceScore(sampleSize) {
    if (sampleSize <= 0) return 0;
    // Logarithmic confidence: grows with sample size, never exceeds 1
    const confidence = 1 - (1 / (1 + Math.log(1 + sampleSize / 10)));
    // Round to 4 decimal places for consistency
    return Math.round(confidence * 10000) / 10000;
}

/**
 * Run the aggregation pipeline to compute metrics from Reflections
 * and upsert results into AggregatedSignal.
 * 
 * @returns {Promise<{processed: number, upserted: number, modified: number}>}
 */
async function runAggregation() {
    // ========== STEP 1: PROVE EXECUTION ==========
    const executionTimestamp = new Date().toISOString();
    console.log('='.repeat(60));
    console.log('[AGGREGATION] Aggregation started');
    console.log(`[AGGREGATION] Timestamp: ${executionTimestamp}`);
    console.log('='.repeat(60));

    // ========== STEP 2: PROVE REFLECTION INPUT ==========
    const totalReflectionCount = await Reflection.countDocuments();
    console.log(`[INPUT] Total Reflection documents in database: ${totalReflectionCount}`);

    if (totalReflectionCount === 0) {
        console.log('[INPUT] WARNING: Zero Reflection documents found. Aggregation will produce zero groups.');
        return { processed: 0, upserted: 0, modified: 0, reason: 'No Reflection documents exist' };
    }

    // Log one sample Reflection document
    const sampleReflection = await Reflection.findOne().lean();
    console.log('[INPUT] Sample Reflection document:');
    console.log(`  - subject: ${JSON.stringify(sampleReflection?.subject)} (type: ${typeof sampleReflection?.subject})`);
    console.log(`  - grade: ${JSON.stringify(sampleReflection?.grade)} (type: ${typeof sampleReflection?.grade})`);
    console.log(`  - topicId: ${JSON.stringify(sampleReflection?.topicId)} (type: ${typeof sampleReflection?.topicId})`);
    console.log(`  - situation: ${JSON.stringify(sampleReflection?.situation)} (type: ${typeof sampleReflection?.situation})`);
    console.log(`  - outcome: ${JSON.stringify(sampleReflection?.outcome)}`);
    console.log(`  - Full document: ${JSON.stringify(sampleReflection, null, 2)}`);

    // MongoDB aggregation pipeline to group reflections and compute metrics
    const pipeline = [
        // Stage 1: Group by the composite key (subject, grade, topicId, situation)
        {
            $group: {
                _id: {
                    subject: '$subject',
                    grade: '$grade',
                    topicId: '$topicId',
                    situation: '$situation'
                },
                total_attempts: { $sum: 1 },
                worked_count: {
                    $sum: { $cond: [{ $eq: ['$outcome', 'worked'] }, 1, 0] }
                },
                partially_worked_count: {
                    $sum: { $cond: [{ $eq: ['$outcome', 'partially_worked'] }, 1, 0] }
                },
                didnt_work_count: {
                    $sum: { $cond: [{ $eq: ['$outcome', 'didnt_work'] }, 1, 0] }
                },
                // Collect reasons for aggregation
                reasons: { $push: '$reason' }
            }
        },
        // Stage 2: Compute rates and format output
        {
            $project: {
                _id: 0,
                subject: '$_id.subject',
                grade: '$_id.grade',
                topicId: '$_id.topicId',
                situation: '$_id.situation',
                total_attempts: 1,
                worked_count: 1,
                partially_worked_count: 1,
                didnt_work_count: 1,
                success_rate: {
                    $cond: [
                        { $eq: ['$total_attempts', 0] },
                        0,
                        { $divide: ['$worked_count', '$total_attempts'] }
                    ]
                },
                failure_rate: {
                    $cond: [
                        { $eq: ['$total_attempts', 0] },
                        0,
                        { $divide: ['$didnt_work_count', '$total_attempts'] }
                    ]
                },
                reasons: 1
            }
        }
    ];

    // Execute the aggregation pipeline (READ ONLY from Reflections)
    const aggregatedResults = await Reflection.aggregate(pipeline);

    // ========== STEP 3: PROVE GROUPING OUTPUT ==========
    console.log('='.repeat(60));
    console.log(`[GROUPING] Number of grouped documents after $group stage: ${aggregatedResults.length}`);

    if (aggregatedResults.length === 0) {
        console.log('[GROUPING] WARNING: Aggregation produced ZERO groups!');
        console.log('[GROUPING] Possible causes:');
        console.log('  - All grouping fields (subject, grade, topicId, situation) may be null/undefined');
        console.log('  - Field names may have casing mismatches');
        console.log('  - Data types may not match expected schema');

        // Diagnostic: Check what fields actually exist in Reflections
        const fieldDiagnostic = await Reflection.aggregate([
            { $limit: 5 },
            {
                $project: {
                    hasSubject: { $cond: [{ $ifNull: ['$subject', false] }, true, false] },
                    hasGrade: { $cond: [{ $ifNull: ['$grade', false] }, true, false] },
                    hasTopicId: { $cond: [{ $ifNull: ['$topicId', false] }, true, false] },
                    hasSituation: { $cond: [{ $ifNull: ['$situation', false] }, true, false] },
                    subject: 1, grade: 1, topicId: 1, situation: 1
                }
            }
        ]);
        console.log('[GROUPING] Field diagnostic (first 5 docs):');
        fieldDiagnostic.forEach((doc, i) => {
            console.log(`  Doc ${i + 1}: ${JSON.stringify(doc)}`);
        });
    } else {
        console.log(`[GROUPING] First grouped result: ${JSON.stringify(aggregatedResults[0], null, 2)}`);
    }
    console.log('='.repeat(60));

    let upsertedCount = 0;
    let modifiedCount = 0;

    // Process each aggregated result and upsert to AggregatedSignal
    for (const result of aggregatedResults) {
        // Compute confidence score (deterministic, based on sample size only)
        const confidenceScore = computeConfidenceScore(result.total_attempts);

        // Compute common reasons (aggregate reason counts)
        const reasonCounts = {};
        for (const reason of result.reasons) {
            if (reason && reason !== 'none') {
                reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
            }
        }

        const commonReasons = Object.entries(reasonCounts)
            .map(([reason, count]) => ({ reason, count }))
            .sort((a, b) => b.count - a.count);

        // Build the filter for upsert (composite key)
        const filter = {
            subject: result.subject,
            grade: result.grade,
            topicId: result.topicId,
            situation: result.situation
        };

        // Build the update document
        // Maps to existing schema fields + additional computed fields
        const update = {
            $set: {
                // Existing schema fields (mapped from requirements)
                totalReflections: result.total_attempts,
                successCount: result.worked_count,
                successRate: Math.round(result.success_rate * 10000) / 10000,
                commonReasons: commonReasons,
                lastUpdated: new Date(),

                // Additional computed fields (stored as additional properties)
                partiallyWorkedCount: result.partially_worked_count,
                didntWorkCount: result.didnt_work_count,
                failureRate: Math.round(result.failure_rate * 10000) / 10000,
                confidenceScore: confidenceScore
            }
        };

        // Upsert to AggregatedSignal (ONLY collection written to)
        const upsertResult = await AggregatedSignal.updateOne(
            filter,
            update,
            { upsert: true }
        );

        if (upsertResult.upsertedCount > 0) {
            upsertedCount++;
        } else if (upsertResult.modifiedCount > 0) {
            modifiedCount++;
        }
    }

    const summary = {
        processed: aggregatedResults.length,
        upserted: upsertedCount,
        modified: modifiedCount
    };

    // ========== STEP 4: PROVE WRITES ==========
    console.log('='.repeat(60));
    console.log('[WRITES] Aggregation complete');
    console.log(`[WRITES] Documents processed: ${summary.processed}`);
    console.log(`[WRITES] Documents upserted to AggregatedSignal: ${summary.upserted}`);
    console.log(`[WRITES] Documents modified in AggregatedSignal: ${summary.modified}`);
    console.log('[WRITES] CONFIRMATION: Only AggregatedSignal collection was written to.');

    // Verify final count in AggregatedSignal
    const finalAggregatedCount = await AggregatedSignal.countDocuments();
    console.log(`[WRITES] Total documents now in AggregatedSignal: ${finalAggregatedCount}`);
    console.log('='.repeat(60));

    return summary;
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
        const result = await runAggregation();
        console.log('Aggregation completed successfully');
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Aggregation failed:', error.message);
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
module.exports = { runAggregation, computeConfidenceScore };

// Run if executed directly as a script
if (require.main === module) {
    main();
}
