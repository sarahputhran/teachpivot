const mongoose = require('mongoose');

const curriculumSchema = new mongoose.Schema({
  subject: {
    type: String,
    enum: ['Maths', 'Science', 'EVS'],
    required: true
  },
  grade: {
    type: Number,
    enum: [3, 4],
    required: true
  },
  topics: [{
    id: String,
    name: String,
    description: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Curriculum', curriculumSchema);
