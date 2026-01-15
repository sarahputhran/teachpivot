require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./middleware/db');

const app = express();

// Connect to MongoDB and auto-seed if empty
const initializeApp = async () => {
  try {
    await connectDB();

    // Check if we have any curriculum data
    const Curriculum = require('./models/Curriculum');
    const PrepCard = require('./models/PrepCard');
    const existingCurriculum = await Curriculum.findOne();
    const existingPrepCards = await PrepCard.countDocuments();

    console.log(`Found ${existingPrepCards} prep cards in database`);

    if (!existingCurriculum || existingPrepCards < 100) {
      console.log('Insufficient data found, running seed script...');
      // Run the seedData.js script directly
      const { execSync } = require('child_process');
      try {
        execSync('node src/data/seedData.js', {
          cwd: __dirname.replace('/src', '').replace('\\src', ''),
          stdio: 'inherit'
        });
        console.log('Seeding completed!');
      } catch (seedErr) {
        console.log('Auto-seed failed, please run: node src/data/seedData.js manually');
      }
    } else {
      console.log('Database already contains curriculum data');
    }

  } catch (error) {
    console.error('App initialization error:', error);
  }
};

initializeApp();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/curriculum', require('./routes/curriculum'));
app.use('/api/prep-cards', require('./routes/prepCard'));
app.use('/api/reflections', require('./routes/reflection'));
app.use('/api/crp', require('./routes/crp'));

// Seed route for development (manual trigger)
app.post('/api/seed', async (req, res) => {
  try {
    const { execSync } = require('child_process');
    execSync('node src/data/seedData.js', {
      cwd: __dirname.replace('/src', '').replace('\\src', ''),
      stdio: 'inherit'
    });
    res.json({ success: true, message: 'Database seeded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
