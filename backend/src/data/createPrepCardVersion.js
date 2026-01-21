// Run with: node src/data/createPrepCardVersion.js <prepCardId>

require('dotenv').config({ path: 'backend/.env' });

const mongoose = require('mongoose');
const PrepCard = require('../models/PrepCard');
const AggregatedSignal = require('../models/AggregatedSignal');
const CRPReview = require('../models/CRPReview');

const VALID_ACTIONS = ['needs_modification', 'add_alternate'];

async function createPrepCardVersion(prepCardId) {
    if (!prepCardId) {
        console.error('Usage: node src/data/createPrepCardVersion.js <prepCardId>');
        process.exit(1);
    }

    if (!mongoose.Types.ObjectId.isValid(prepCardId)) {
        console.error('Invalid PrepCard ID format');
        process.exit(1);
    }

    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
        console.error('MONGO_URI not defined in environment');
        process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    try {
        const oldPrepCard = await PrepCard.findById(prepCardId);
        if (!oldPrepCard) {
            console.error(`PrepCard not found: ${prepCardId}`);
            process.exit(1);
        }

        if (oldPrepCard.archived === true) {
            console.error('PrepCard is already archived, cannot create new version from archived card');
            process.exit(1);
        }

        const aggregatedSignal = await AggregatedSignal.findOne({
            subject: oldPrepCard.subject,
            grade: oldPrepCard.grade,
            topicId: oldPrepCard.topicId,
            situation: oldPrepCard.situation
        });

        if (!aggregatedSignal) {
            console.error('No AggregatedSignal found for this PrepCard');
            process.exit(1);
        }

        if (aggregatedSignal.isFlagged !== true) {
            console.error('Precondition failed: AggregatedSignal.isFlagged must be true');
            process.exit(1);
        }

        const crpReviews = await CRPReview.find({
            subject: oldPrepCard.subject,
            grade: oldPrepCard.grade,
            topicId: oldPrepCard.topicId,
            situation: oldPrepCard.situation,
            action: { $in: VALID_ACTIONS }
        });

        if (crpReviews.length === 0) {
            console.error('Precondition failed: No CRPReview with action "needs_modification" or "add_alternate"');
            process.exit(1);
        }

        const triggeringCRPReviewIds = crpReviews.map(r => r._id);

        console.log('Preconditions met. Creating new version...');

        const newVersion = (oldPrepCard.version || 1) + 1;

        const newPrepCardData = {
            subject: oldPrepCard.subject,
            grade: oldPrepCard.grade,
            topicId: oldPrepCard.topicId,
            situation: oldPrepCard.situation,
            whatBreaksHere: oldPrepCard.whatBreaksHere,
            earlyWarningSigns: [...(oldPrepCard.earlyWarningSigns || [])],
            ifStudentsLost: [...(oldPrepCard.ifStudentsLost || [])],
            ifStudentsBored: [...(oldPrepCard.ifStudentsBored || [])],
            successRate: 0.5,
            peerInsights: { count: 0, insight: null },
            confidence: 0.5,
            version: newVersion,
            active: true,
            archived: false,
            parentPrepCardId: oldPrepCard._id,
            sourcePrepCardId: oldPrepCard._id,
            triggeringCRPReviewIds: triggeringCRPReviewIds,
            versionCreatedAt: new Date()
        };

        const newPrepCard = await PrepCard.create(newPrepCardData);
        console.log(`Created new PrepCard: ${newPrepCard._id} (v${newVersion})`);

        await PrepCard.updateOne(
            { _id: oldPrepCard._id },
            { $set: { active: false, archived: true } }
        );
        console.log(`Archived old PrepCard: ${oldPrepCard._id}`);

        const newAggregatedSignal = await AggregatedSignal.create({
            prepCardId: newPrepCard._id,
            subject: newPrepCard.subject,
            grade: newPrepCard.grade,
            topicId: newPrepCard.topicId,
            situation: newPrepCard.situation,
            totalReflections: 0,
            successCount: 0,
            successRate: 0,
            partiallyWorkedCount: 0,
            didntWorkCount: 0,
            failureRate: 0,
            confidenceScore: 0,
            commonReasons: [],
            themeSignals: new Map(),
            themeLastUpdated: null,
            crpThemeSignals: new Map(),
            crpThemeLastUpdated: null,
            isFlagged: false,
            flagReason: null,
            flaggedAt: null,
            resolvedAt: null,
            resolvedReason: null,
            flagHistory: 0,
            lastUpdated: new Date()
        });
        console.log(`Created new AggregatedSignal: ${newAggregatedSignal._id}`);

        console.log('\nVersioning complete:');
        console.log(`  Old PrepCard: ${oldPrepCard._id} → archived`);
        console.log(`  New PrepCard: ${newPrepCard._id} → active (v${newVersion})`);
        console.log(`  New AggregatedSignal: ${newAggregatedSignal._id} → initialized`);
        console.log(`  Triggering CRPReviews: ${triggeringCRPReviewIds.length}`);

    } catch (error) {
        console.error('Error during versioning:', error.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

const prepCardId = process.argv[2];
createPrepCardVersion(prepCardId);
