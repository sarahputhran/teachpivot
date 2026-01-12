require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./middleware/db');

const app = express();

// Connect to MongoDB
connectDB();

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
