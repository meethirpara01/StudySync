const aiAssistantService = require('../ai/aiAssistant.service');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');

const sendAIError = (res, error, operation) => {
  const isQuotaError = /429|quota|rate.?limit/i.test(error.message || '');
  const statusCode = isQuotaError ? 429 : 500;
  const message = isQuotaError
    ? 'Gemini API quota exceeded. Please wait for the quota reset or use a Gemini API key with billing enabled.'
    : error.message || `Failed to ${operation}`;

  logger.error(`[POST /api/ai] ${operation} error: ${error.message}`);
  return res.status(statusCode).json({ success: false, message });
};

/**
 * @desc    Ask AI a question
 * @route   POST /api/ai/ask
 * @access  Private
 */
const askAI = asyncHandler(async (req, res) => {
  const { prompt, context } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ 
      success: false, 
      message: 'Prompt is required and must be a string' 
    });
  }

  try {
    logger.info(`[POST /api/ai/ask] Processing question`);
    const response = await aiAssistantService.askQuestion(prompt, context);
    
    if (!response || typeof response !== 'string') {
      logger.error('Invalid response from AI service');
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to get AI response' 
      });
    }

    logger.info('[POST /api/ai/ask] ✅ Success');
    res.status(200).json({ 
      success: true, 
      response: response 
    });
  } catch (error) {
    sendAIError(res, error, 'get AI response');
  }
});

/**
 * @desc    Summarize notes
 * @route   POST /api/ai/summarize
 * @access  Private
 */
const summarizeNotes = asyncHandler(async (req, res) => {
  const { notes } = req.body;

  if (!notes || typeof notes !== 'string') {
    return res.status(400).json({ 
      success: false, 
      message: 'Notes are required and must be a string' 
    });
  }

  try {
    logger.info(`[POST /api/ai/summarize] Processing notes`);
    const summary = await aiAssistantService.summarizeNotes(notes);
    
    if (!summary || typeof summary !== 'string') {
      logger.error('Invalid summary from AI service');
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to summarize notes' 
      });
    }

    logger.info('[POST /api/ai/summarize] ✅ Success');
    res.status(200).json({ 
      success: true, 
      summary: summary 
    });
  } catch (error) {
    sendAIError(res, error, 'summarize notes');
  }
});

/**
 * @desc    Generate quiz
 * @route   POST /api/ai/quiz
 * @access  Private
 */
const generateQuiz = asyncHandler(async (req, res) => {
  const { topic } = req.body;

  if (!topic || typeof topic !== 'string') {
    return res.status(400).json({ 
      success: false, 
      message: 'Topic is required and must be a string' 
    });
  }

  try {
    logger.info(`[POST /api/ai/quiz] Generating quiz for: ${topic}`);
    const quiz = await aiAssistantService.generateQuiz(topic);
    
    if (!quiz) {
      logger.error('Invalid quiz from AI service');
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to generate quiz' 
      });
    }

    logger.info('[POST /api/ai/quiz] ✅ Success');
    res.status(200).json({ 
      success: true, 
      quiz: quiz 
    });
  } catch (error) {
    sendAIError(res, error, 'generate quiz');
  }
});

module.exports = {
  askAI,
  summarizeNotes,
  generateQuiz,
};
