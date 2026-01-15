const express = require('express');
const router = express.Router();
const Curriculum = require('../models/Curriculum');

// GET all subjects and grades
router.get('/subjects', async (req, res) => {
  try {
    const subjects = ['Maths', 'EVS'];
    const grades = [3];
    res.json({ subjects, grades });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET topics for a subject and grade
router.get('/:subject/:grade/topics', async (req, res) => {
  try {
    const { subject, grade } = req.params;
    const curriculum = await Curriculum.findOne({
      subject,
      grade: parseInt(grade)
    });

    if (!curriculum) {
      return res.status(404).json({ error: 'Curriculum not found' });
    }

    res.json(curriculum.topics || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
