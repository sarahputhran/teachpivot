const mongoose = require('mongoose');

const curriculumSchema = new mongoose.Schema({
  subject: {
    type: String,
    enum: ['Maths', 'Science'],
    required: true
  },
  grade: {
    type: Number,
    enum: [9, 10],
    required: true
  },
  topics: [{
    id: String,
    name: String,
    description: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Curriculum', curriculumSchema);
