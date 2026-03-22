const express = require('express');
const router = express.Router();
const {
  askAI,
  summarizeNotes,
  generateQuiz,
} = require('../controllers/ai.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/ask', protect, askAI);
router.post('/summarize', protect, summarizeNotes);
router.post('/quiz', protect, generateQuiz);

module.exports = router;
