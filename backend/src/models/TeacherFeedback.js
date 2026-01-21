const mongoose = require('mongoose');

const teacherFeedbackSchema = new mongoose.Schema({
  prepCardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PrepCard',
    required: true
  },
  content: {
    type: String,
    required: true,
    minLength: 10,
    maxLength: 5000
  },
  clientVersion: {
    type: String,
    required: false
  },
  timestamp: {
    type: Date,
    default: Date.now,
    immutable: true
  }
}, { timestamps: false });

// Ensure strict immutability for the collection if possible, but definitely at app level
// Note: MongoDB itself doesn't strictly enforce append-only without specific ACLs, 
// but we design the app to never update/delete these.

module.exports = mongoose.model('TeacherFeedback', teacherFeedbackSchema);
