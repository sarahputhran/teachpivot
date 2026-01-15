// Quick verification script to count prep cards by chapter
require('dotenv').config();
const mongoose = require('mongoose');
const PrepCard = require('../models/PrepCard');

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teachpivot');
        console.log('Connected to MongoDB');

        // Count total cards
        const totalCards = await PrepCard.countDocuments();
        console.log(`\n✅ Total Prep Cards: ${totalCards}`);

        // Count by subject
        const mathsCards = await PrepCard.countDocuments({ subject: 'Maths' });
        const evsCards = await PrepCard.countDocuments({ subject: 'EVS' });
        console.log(`   - Maths: ${mathsCards} cards`);
        console.log(`   - EVS: ${evsCards} cards`);

        // EVS Chapters
        console.log(`\n📚 EVS Chapters:`);
        const evsTopics = ['family_friends', 'going_mela', 'celebrating_festivals', 'plants', 'plants_animals'];
        for (const topicId of evsTopics) {
            const count = await PrepCard.countDocuments({ subject: 'EVS', topicId });
            console.log(`   ${topicId}: ${count} cards`);
        }

        // Math Chapters
        console.log(`\n📐 Math Chapters:`);
        const mathTopics = ['whats_name', 'toy_joy', 'double_century', 'vacation_nani', 'shapes'];
        for (const topicId of mathTopics) {
            const count = await PrepCard.countDocuments({ subject: 'Maths', topicId });
            console.log(`   ${topicId}: ${count} cards`);
        }

        // Count by situation type
        console.log(`\n🎯 By Situation Type:`);
        const situations = [
            'prerequisite_gap',
            'cant_visualize',
            'mixed_pace',
            'language_not_landing',
            'activity_chaos',
            'worked_once_failed_later'
        ];
        for (const situation of situations) {
            const count = await PrepCard.countDocuments({ situation });
            console.log(`   ${situation}: ${count} cards`);
        }

        await mongoose.disconnect();
        console.log(`\n✅ Verification complete!`);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verify();
