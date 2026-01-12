const mongoose = require('mongoose');

const reflectionSchema = new mongoose.Schema({
  // No user ID - anonymized by design
  subject: String,
  grade: Number,
  topicId: String,
  situation: String,
  outcome: {
    type: String,
    enum: ['worked', 'partially_worked', 'didnt_work'],
    required: true
  },
  reason: {
    type: String,
    enum: [
      'timing_issue',
      'prerequisite_weak',
      'example_didnt_land',
      'language_confusion',
      'none'
    ],
    default: 'none'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    immutable: true
  }
}, { timestamps: false });

// Ensure immediate anonymization - no user reference ever stored
reflectionSchema.set('toJSON', {
  virtuals: false,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Reflection', reflectionSchema);
