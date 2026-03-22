const { ChatMistralAI } = require("@langchain/mistralai");
const logger = require('../utils/logger');

/**
 * Get a Mistral model instance using LangChain
 */
const getMistralModel = (config = {}) => {
  if (!process.env.MISTRAL_API_KEY) {
    logger.error('MISTRAL_API_KEY environment variable is not set');
    throw new Error('MISTRAL_API_KEY environment variable is not set');
  }

  try {
    const model = new ChatMistralAI({
      apiKey: process.env.MISTRAL_API_KEY,
      modelName: config.modelName || "mistral-small",
      temperature: config.temperature !== undefined ? config.temperature : 0.7,
      maxTokens: config.maxTokens || 1024,
    });

    logger.info(`Mistral model initialized: ${config.modelName || 'mistral-small'}`);
    return model;
  } catch (error) {
    logger.error(`Error initializing Mistral model: ${error.message}`);
    throw new Error(`Failed to initialize Mistral model: ${error.message}`);
  }
};

module.exports = {
  getMistralModel,
};
