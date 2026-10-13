const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const logger = require('../utils/logger');

const getGeminiModel = (config = {}) => {
  if (!process.env.GEMINI_API_KEY) {
    logger.error('GEMINI_API_KEY environment variable is not set');
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const modelName = config.modelName || process.env.GEMINI_MODEL || 'gemini-3.8-flash';

  try {
    const model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      model: modelName,
      temperature: config.temperature !== undefined ? config.temperature : 0.7,
      maxOutputTokens: config.maxTokens || 1024,
    });

    logger.info(`Gemini model initialized: ${modelName}`);
    return model;
  } catch (error) {
    logger.error(`Error initializing Gemini model: ${error.message}`);
    throw new Error(`Failed to initialize Gemini model: ${error.message}`);
  }
};

module.exports = { getGeminiModel };
