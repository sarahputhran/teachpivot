/**
 * Generate Synthetic Reflections for TeachPivot
 * 
 * This script fetches all PrepCards and generates multiple Reflection documents
 * for each, with realistic distributions and timestamps.
 * 
 * Usage: node src/data/generateSyntheticReflections.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../middleware/db');
const PrepCard = require('../models/PrepCard');
const Reflection = require('../models/Reflection');

// Configuration
const REFLECTIONS_PER_CARD_MIN = 5;
const REFLECTIONS_PER_CARD_MAX = 15;
const DAYS_SPREAD = 30; // Spread timestamps across this many days

// Outcome distributions (enum values kept unchanged for database consistency)
const OUTCOMES = ['worked', 'partially_worked', 'didnt_work'];

// Internal reason codes (used for weighted selection)
const REASON_CODES = [
    'timing_issue',
    'prerequisite_weak',
    'example_didnt_land',
    'language_confusion',
    'none'
];

// =============================================================
// TEXT FORMATTING HELPERS (FOR RUNTIME/CONSOLE DISPLAY ONLY)
// 
// These helpers convert enum values to human-readable text for
// console output and logs. They are NOT used for database storage.
// Enum fields must remain machine-safe. Display formatting is
// handled separately by the frontend or API at runtime.
// =============================================================

/**
 * Converts a reason code to plain English (for console display only).
 * E.g., "prerequisite_weak" → "Prerequisite understanding was weak"
 * NOTE: Do NOT store this in the database - use raw enum value instead.
 */
const reasonToDisplayText = (reasonCode) => {
    const reasonMap = {
        'timing_issue': 'Timing did not work well for the class',
        'prerequisite_weak': 'Prerequisite understanding was weak',
        'example_didnt_land': 'The example did not connect with students',
        'language_confusion': 'Language or vocabulary caused confusion',
        'none': 'No specific issue identified'
    };
    return reasonMap[reasonCode] || reasonCode.replace(/_/g, ' ');
};

/**
 * Converts an outcome code to Title Case display text (for console display only).
 * E.g., "partially_worked" → "Partially Worked"
 * NOTE: Do NOT store this in the database - use raw enum value instead.
 */
const outcomeToDisplayText = (outcomeCode) => {
    const outcomeMap = {
        'worked': 'Worked',
        'partially_worked': 'Partially Worked',
        'didnt_work': "Didn't Work"
    };
    return outcomeMap[outcomeCode] || outcomeCode.replace(/_/g, ' ');
};

/**
 * Normalizes a situation string for display.
 * Replaces underscores with spaces and trims.
 * NOTE: This is safe to use for the `situation` field (free-text, not enum).
 */
const normalizeSituation = (situation) => {
    if (!situation) return '';
    return situation.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
};

/**
 * Weighted random selection from an array based on weights
 */
function weightedRandom(items, weights) {
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < items.length; i++) {
        random -= weights[i];
        if (random <= 0) {
            return items[i];
        }
    }
    return items[items.length - 1];
}

/**
 * Generate a random timestamp within the past N days
 */
function generateRandomTimestamp(daysBack) {
    const now = new Date();
    const pastDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
    const randomTime = pastDate.getTime() + Math.random() * (now.getTime() - pastDate.getTime());
    return new Date(randomTime);
}

/**
 * Generate a random integer between min and max (inclusive)
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get outcome weights for a PrepCard
 * Some cards are biased toward 'didnt_work' outcomes
 */

function getOutcomeWeights(prepCard, isBiasedCard) {
    if (isBiasedCard) {
        // Biased cards fail more often
        return [0.15, 0.25, 0.60]; // worked, partially_worked, didnt_work
    }

    // Normal cards (no learning assumed yet)
    return [0.45, 0.30, 0.25];
}

/**
 * Get reason weights based on outcome
 */
function getReasonWeights(outcome) {
    if (outcome === 'worked') {
        // Successful outcomes mostly have 'none' as reason
        return [0.05, 0.05, 0.05, 0.05, 0.80];
    } else if (outcome === 'partially_worked') {
        // Partial success has mixed reasons
        return [0.25, 0.20, 0.20, 0.15, 0.20];
    } else {
        // Failures have specific reasons
        return [0.25, 0.30, 0.25, 0.15, 0.05];
    }
}

/**
 * Generate reflections for a single PrepCard.
 * 
 * NOTE: Enum fields (outcome, reason) must remain machine-safe enum values.
 * Display formatting is handled separately at runtime by the frontend or API.
 */
function generateReflectionsForCard(prepCard, isBiasedCard) {
    const reflections = [];
    const count = randomInt(REFLECTIONS_PER_CARD_MIN, REFLECTIONS_PER_CARD_MAX);
    const outcomeWeights = getOutcomeWeights(prepCard, isBiasedCard);

    for (let i = 0; i < count; i++) {
        const outcome = weightedRandom(OUTCOMES, outcomeWeights);
        const reasonWeights = getReasonWeights(outcome);
        const reason = weightedRandom(REASON_CODES, reasonWeights);
        const timestamp = generateRandomTimestamp(DAYS_SPREAD);

        // Build reflection - enum fields store raw enum values only
        reflections.push({
            subject: prepCard.subject,
            grade: prepCard.grade,
            topicId: prepCard.topicId,
            // Normalize situation text (free-text field, safe to format)
            situation: normalizeSituation(prepCard.situation),
            // Enum fields: store raw enum values, NOT human-readable text
            outcome,  // enum: worked | partially_worked | didnt_work
            reason,   // enum: timing_issue | prerequisite_weak | example_didnt_land | language_confusion | none
            timestamp
        });
    }

    return reflections;
}

/**
 * Main function to generate and insert synthetic reflections
 */
async function generateSyntheticReflections() {
    try {
        // Connect to MongoDB
        await connectDB();
        console.log('Connected to MongoDB');

        // Fetch all PrepCards
        const prepCards = await PrepCard.find({});
        console.log(`Found ${prepCards.length} PrepCards`);

        if (prepCards.length === 0) {
            console.log('No PrepCards found. Please seed PrepCards first.');
            process.exit(1);
        }

        // Determine which cards will be biased (higher failure rates)
        // Randomly select ~20% of cards to have higher failure rates
        const biasedCardIndices = new Set();
        const numBiasedCards = Math.max(1, Math.floor(prepCards.length * 0.2));

        while (biasedCardIndices.size < numBiasedCards) {
            biasedCardIndices.add(randomInt(0, prepCards.length - 1));
        }

        console.log(`Biasing ${biasedCardIndices.size} cards toward higher failure rates`);

        // Generate reflections for all PrepCards
        const allReflections = [];

        for (let i = 0; i < prepCards.length; i++) {
            const prepCard = prepCards[i];
            const isBiasedCard = biasedCardIndices.has(i);
            const reflections = generateReflectionsForCard(prepCard, isBiasedCard);
            allReflections.push(...reflections);

            console.log(`Generated ${reflections.length} reflections for PrepCard: ${prepCard.topicId} - ${prepCard.situation.substring(0, 40)}...`);
        }

        console.log(`\nTotal reflections generated: ${allReflections.length}`);

        // Insert all reflections in batches for better performance
        const BATCH_SIZE = 100;
        let inserted = 0;

        for (let i = 0; i < allReflections.length; i += BATCH_SIZE) {
            const batch = allReflections.slice(i, i + BATCH_SIZE);
            await Reflection.insertMany(batch);
            inserted += batch.length;
            console.log(`Inserted ${inserted}/${allReflections.length} reflections...`);
        }

        // Summary statistics
        console.log('\n=== Generation Complete ===');
        console.log(`Total reflections inserted: ${allReflections.length}`);

        // Count outcomes (display with human-readable labels)
        const outcomeCounts = allReflections.reduce((acc, r) => {
            acc[r.outcome] = (acc[r.outcome] || 0) + 1;
            return acc;
        }, {});

        console.log('\nOutcome distribution:');
        for (const [outcome, count] of Object.entries(outcomeCounts)) {
            const percentage = ((count / allReflections.length) * 100).toFixed(1);
            // Display with formatted label
            console.log(`  ${outcomeToDisplayText(outcome)}: ${count} (${percentage}%)`);
        }

        // Count reasons (already stored as human-readable text)
        const reasonCounts = allReflections.reduce((acc, r) => {
            acc[r.reason] = (acc[r.reason] || 0) + 1;
            return acc;
        }, {});

        console.log('\nReason distribution:');
        for (const [reason, count] of Object.entries(reasonCounts)) {
            const percentage = ((count / allReflections.length) * 100).toFixed(1);
            // Reasons are already formatted as plain English
            console.log(`  ${reason}: ${count} (${percentage}%)`);
        }

        // Verify insertion
        const finalCount = await Reflection.countDocuments();
        console.log(`\nVerification: ${finalCount} reflections now in database`);

    } catch (error) {
        console.error('Error generating synthetic reflections:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\nMongoDB connection closed');
    }
}

// Run the script
generateSyntheticReflections();
