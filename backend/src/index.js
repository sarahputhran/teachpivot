require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./middleware/db');

const app = express();

/* =========================
   Initialize application
   ========================= */

const initializeApp = async () => {
  try {
    // Connect to MongoDB (local or cloud)
    await connectDB();

    // Sanity check: confirm PrepCards exist
    const PrepCard = require('./models/PrepCard');
    const prepCardCount = await PrepCard.countDocuments();

    console.log(`Found ${prepCardCount} prep cards in database`);

    if (prepCardCount === 0) {
      console.warn(
        'WARNING: No PrepCards found in database. ' +
        'Run POST /api/seed if this is unexpected.'
      );
    }
  } catch (error) {
    console.error('App initialization error:', error);
    process.exit(1);
  }
};

initializeApp();

/* =========================
   Middleware
   ========================= */

// ✅ FIXED CORS (allows ANY localhost port for dev)
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

/* =========================
   Routes
   ========================= */

app.use('/api/curriculum', require('./routes/curriculum'));
app.use('/api/prep-cards', require('./routes/prepCard'));
app.use('/api/reflections', require('./routes/reflection'));
app.use('/api/crp', require('./routes/crp'));
app.use('/api/crp/revisions', require('./routes/revisions'));
app.use('/api/feedback', require('./routes/feedback'));


/* =========================
   Manual seed route
   (explicit, intentional)
   ========================= */

app.post('/api/seed', async (req, res) => {
  try {
    const { execSync } = require('child_process');

    execSync('node src/data/seedData.js', {
      cwd: __dirname.replace('/src', '').replace('\\src', ''),
      stdio: 'inherit'
    });

    res.json({
      success: true,
      message: 'Database seeded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/* =========================
   Health check
   ========================= */

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

/* =========================
   Server
   ========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
