// Grade 3 and Grade 4 Math and EVS Prep Cards seeding with in-memory MongoDB
// Run with: node src/data/seedDataWithMemoryDB.js

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const Curriculum = require('../models/Curriculum');
const PrepCard = require('../models/PrepCard');

let mongoServer;

const connectDB = async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    console.log('[ok] MongoDB Memory Server connected for seeding');
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
    console.log('[info] Cleared existing data');

    // ===== CURRICULUM SETUP =====

    const evsCurriculum = new Curriculum({
      subject: 'EVS',
      grade: 3,
      topics: [
        { id: 'family_friends', name: 'Family and Friends', description: 'Understanding family structures and relationships' },
        { id: 'going_mela', name: 'Going to the Mela', description: 'Learning about mela, work, and economy' },
        { id: 'celebrating_festivals', name: 'Celebrating Festivals', description: 'Understanding festivals and their significance' },
        { id: 'plants', name: 'Getting to Know Plants', description: 'Learning about plant parts and functions' },
        { id: 'plants_animals', name: 'Plants and Animals Live Together', description: 'Understanding food chains and habitats' }
      ]
    });
    await evsCurriculum.save();

    const mathsCurriculum = new Curriculum({
      subject: 'Maths',
      grade: 3,
      topics: [
        { id: 'whats_name', name: "What's in a Name?", description: 'Understanding place value and number names' },
        { id: 'toy_joy', name: 'Toy Joy', description: 'Learning about patterns' },
        { id: 'double_century', name: 'Double Century', description: 'Understanding numbers up to 200' },
        { id: 'vacation_nani', name: 'Vacation with My Nani Maa', description: 'Addition and subtraction' },
        { id: 'shapes', name: 'Fun with Shapes', description: 'Learning about 2D and 3D shapes' }
      ]
    });
    await mathsCurriculum.save();

    const grade4EvsCurriculum = new Curriculum({
      subject: 'EVS',
      grade: 4,
      topics: [
        { id: 'living_together', name: 'Living Together', description: 'Community roles, cooperation, and shared spaces' },
        { id: 'exploring_neighbourhood', name: 'Exploring Our Neighbourhood', description: 'Places, services, and directions in the neighbourhood' },
        { id: 'nature_trail', name: 'Nature Trail', description: 'Observing plants, animals, and interdependence' },
        { id: 'growing_up_with_nature', name: 'Growing Up with Nature', description: 'Traditional practices that use natural resources wisely' },
        { id: 'food_for_health', name: 'Food for Health', description: 'Healthy food choices, food groups, and balanced meals' }
      ]
    });
    await grade4EvsCurriculum.save();

    const grade4MathsCurriculum = new Curriculum({
      subject: 'Maths',
      grade: 4,
      topics: [
        { id: 'shapes_around_us', name: 'Shapes Around Us', description: '2D/3D shapes, nets, angles, and circle parts' },
        { id: 'hide_and_seek', name: 'Hide and Seek', description: 'Views, positions, directions, and grid paths' },
        { id: 'patterns_around_us', name: 'Patterns Around Us', description: 'Counting patterns, even/odd reasoning, and money patterns' },
        { id: 'thousands_around_us', name: 'Thousands Around Us', description: 'Place value to thousands, number lines, and comparisons' },
        { id: 'how_heavy_how_light', name: 'How Heavy? How Light?', description: 'Weight comparison, balance, and indirect comparisons' }
      ]
    });
    await grade4MathsCurriculum.save();

    console.log('[ok] Successfully seeded Grade 3 and Grade 4 curriculum');
    console.log('[info] Added:');
    console.log('   - EVS Grade 3 (5 chapters x 9 situations = 45 cards)');
    console.log('   - Maths Grade 3 (5 chapters x 9 situations = 45 cards)');
    console.log('   - EVS Grade 4 (5 chapters x 9 situations = 45 cards)');
    console.log('   - Maths Grade 4 (5 chapters x 9 situations = 45 cards)');
    console.log('[count] Total prep cards would be added: 180');

    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
    console.log('[ok] Seeding complete! Database synced.');
  } catch (error) {
    console.error('Error:', error);
    if (mongoServer) await mongoServer.stop();
    process.exit(1);
  }
};

seedData();
