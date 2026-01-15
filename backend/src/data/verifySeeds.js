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

        // Count by grade
        const grade3Cards = await PrepCard.countDocuments({ grade: 3 });
        const grade4Cards = await PrepCard.countDocuments({ grade: 4 });
        console.log(`\n[info] By Grade:`);
        console.log(`   - Grade 3: ${grade3Cards} cards`);
        console.log(`   - Grade 4: ${grade4Cards} cards`);

        // EVS Chapters (Grade 3)
        console.log(`\n[info] EVS Grade 3 Chapters:`);
        const evsTopicsGrade3 = ['family_friends', 'going_mela', 'celebrating_festivals', 'plants', 'plants_animals'];
        for (const topicId of evsTopicsGrade3) {
            const count = await PrepCard.countDocuments({ subject: 'EVS', grade: 3, topicId });
            console.log(`   ${topicId}: ${count} cards`);
        }

        // EVS Chapters (Grade 4)
        console.log(`\n[info] EVS Grade 4 Chapters:`);
        const evsTopicsGrade4 = ['living_together', 'exploring_neighbourhood', 'nature_trail', 'growing_up_with_nature', 'food_for_health'];
        for (const topicId of evsTopicsGrade4) {
            const count = await PrepCard.countDocuments({ subject: 'EVS', grade: 4, topicId });
            console.log(`   ${topicId}: ${count} cards`);
        }

        // Math Chapters (Grade 3)
        console.log(`\n[info] Math Grade 3 Chapters:`);
        const mathTopicsGrade3 = ['whats_name', 'toy_joy', 'double_century', 'vacation_nani', 'shapes'];
        for (const topicId of mathTopicsGrade3) {
            const count = await PrepCard.countDocuments({ subject: 'Maths', grade: 3, topicId });
            console.log(`   ${topicId}: ${count} cards`);
        }

        // Math Chapters (Grade 4)
        console.log(`\n[info] Math Grade 4 Chapters:`);
        const mathTopicsGrade4 = ['shapes_around_us', 'hide_and_seek', 'patterns_around_us', 'thousands_around_us', 'how_heavy_how_light'];
        for (const topicId of mathTopicsGrade4) {
            const count = await PrepCard.countDocuments({ subject: 'Maths', grade: 4, topicId });
            console.log(`   ${topicId}: ${count} cards`);
        }

        // Count by situation type
        console.log(`\n[info] By Situation Type (all grades):`);
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
        console.log(`\n[ok] Verification complete!`);
        console.log(`\n[info] Expected totals:`);
        console.log(`   - Grade 3: 90 cards (45 EVS + 45 Maths)`);
        console.log(`   - Grade 4: 90 cards (45 EVS + 45 Maths)`);
        console.log(`   - Grand Total: 180 cards`);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verify();
