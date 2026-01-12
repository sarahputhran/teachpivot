// Sample seed data for TeachPivot
// Run with: node src/data/seedData.js

require('dotenv').config();
const mongoose = require('mongoose');
const Curriculum = require('../models/Curriculum');
const PrepCard = require('../models/PrepCard');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teachpivot');
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('Connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Curriculum.deleteMany({});
    await PrepCard.deleteMany({});
    console.log('Cleared existing data');

    // Curriculum for Maths Grade 9
    const mathsCurriculum = new Curriculum({
      subject: 'Maths',
      grade: 9,
      topics: [
        { id: 'fractions', name: 'Fractions', description: 'Understanding and operating with fractions' },
        { id: 'decimals', name: 'Decimals', description: 'Decimal numbers and operations' },
        { id: 'equations', name: 'Linear Equations', description: 'Solving linear equations' }
      ]
    });
    await mathsCurriculum.save();

    // Prep Cards for Fractions - Prerequisite Gap
    const prepCard1 = new PrepCard({
      subject: 'Maths',
      grade: 9,
      topicId: 'fractions',
      situation: 'prerequisite_gap',
      whatBreaksHere: 'Students lack understanding of part-whole relationship needed for fraction operations',
      earlyWarningSigns: ['Confusion when representing fractions', 'Can\'t identify equivalent fractions', 'Struggles with comparing fractions'],
      ifStudentsLost: [
        'Start with concrete visuals: physical fraction bars or circle diagrams',
        'Use pizza slices or chocolate bars as relatable examples',
        'Build from unit fractions (1/2, 1/3) before mixed fractions'
      ],
      ifStudentsBored: [
        'Jump to real-world contexts: recipe portions, measurement',
        'Introduce fraction games: fraction dominoes, comparison races',
        'Connect to music: beat divisions, time signatures'
      ],
      successRate: 0.62,
      peerInsights: {
        count: 8,
        insight: 'Teachers found starting with concrete materials (fraction circles) before moving to abstract notation was key.'
      },
      confidence: 0.75
    });
    await prepCard1.save();

    // Prep Cards for Fractions - Can't Visualize
    const prepCard2 = new PrepCard({
      subject: 'Maths',
      grade: 9,
      topicId: 'fractions',
      situation: 'cant_visualize',
      whatBreaksHere: 'Students can\'t internally picture what fractions look like or mean',
      earlyWarningSigns: ['Memorizes rules but can\'t explain', 'Treats fractions as two separate numbers', 'Can\'t draw representations'],
      ifStudentsLost: [
        'Use interactive visuals: Geogebra, Desmos fraction tools',
        'Have students draw and shade their own fraction representations',
        'Use number lines prominently alongside area models'
      ],
      ifStudentsBored: [
        'Create fraction art projects: mosaic patterns with fractional pieces',
        'Fraction scavenger hunt in the classroom',
        'Build fraction models and explain to peers'
      ],
      successRate: 0.71,
      peerInsights: {
        count: 12,
        insight: '4 teachers found using multiple representations (area, linear, set) together reduced confusion significantly.'
      },
      confidence: 0.82
    });
    await prepCard2.save();

    // Prep Cards for Equations - Language Not Landing
    const prepCard3 = new PrepCard({
      subject: 'Maths',
      grade: 9,
      topicId: 'equations',
      situation: 'language_not_landing',
      whatBreaksHere: 'Mathematical language (variable, expression, equation) is abstract and unfamiliar',
      earlyWarningSigns: ['Uses numbers only, avoids writing variables', 'Can\'t read an equation aloud', 'Treats = as "do something" rather than balance'],
      ifStudentsLost: [
        'Use real-world analogy: a scale/balance with weights',
        'Read equations aloud together: "x plus 5 equals 12"',
        'Use concrete objects to represent variables (box with unknown coins)'
      ],
      ifStudentsBored: [
        'Create equation stories and have peers solve them',
        'Balance scale simulation: physically move weights',
        'Encode secret messages as simple equations'
      ],
      successRate: 0.58,
      peerInsights: {
        count: 6,
        insight: 'Balance metaphor resonated across different backgrounds.'
      },
      confidence: 0.68
    });
    await prepCard3.save();

    console.log('✅ Seed data created successfully');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
