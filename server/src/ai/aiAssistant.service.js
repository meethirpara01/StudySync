const { getMistralModel } = require('./mistralClient');
const { PromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const logger = require('../utils/logger');

class AIAssistantService {
  constructor() {
    this.outputParser = new StringOutputParser();
  }

  /**
   * Ask a question to the AI assistant
   * @param {string} prompt - The user's question
   * @param {string} context - Additional context
   * @returns {Promise<string>} - The AI's response
   */
  async askQuestion(prompt, context = '') {
    try {
      if (!prompt || typeof prompt !== 'string') {
        throw new Error('Prompt must be a non-empty string');
      }

      logger.info(`Processing question: ${prompt.substring(0, 50)}...`);

      const model = getMistralModel();

      const template = `You are a helpful study assistant for StudySync, an educational platform.
Context: {context}
Question: {question}

Provide a helpful, concise, and educational response.`;

      const promptTemplate = PromptTemplate.fromTemplate(template);
      const chain = promptTemplate.pipe(model).pipe(this.outputParser);

      const response = await chain.invoke({
        question: String(prompt).trim(),
        context: String(context || 'General study assistance').trim(),
      });

      if (!response || typeof response !== 'string') {
        throw new Error('Invalid response from AI model');
      }

      logger.info('✅ Question answered successfully');
      return response.trim();
    } catch (error) {
      logger.error(`AI Assistant Error: ${error.message}`);
      throw new Error(`Failed to get AI response: ${error.message}`);
    }
  }

  /**
   * Summarize study notes
   * @param {string} notes - The notes to summarize
   * @returns {Promise<string>} - The summarized notes
   */
  async summarizeNotes(notes) {
    try {
      if (!notes || typeof notes !== 'string') {
        throw new Error('Notes must be a non-empty string');
      }

      logger.info('Processing summarization...');

      const model = getMistralModel();

      const template = `Summarize the following study notes in a structured way with key points.
Use bullet points and clear headers.

Notes:
{notes}

Provide a concise summary capturing main concepts.`;

      const promptTemplate = PromptTemplate.fromTemplate(template);
      const chain = promptTemplate.pipe(model).pipe(this.outputParser);

      const response = await chain.invoke({ 
        notes: String(notes).trim() 
      });

      if (!response || typeof response !== 'string') {
        throw new Error('Invalid response from AI model');
      }

      logger.info('✅ Notes summarized successfully');
      return response.trim();
    } catch (error) {
      logger.error(`AI Summarization Error: ${error.message}`);
      throw new Error(`Failed to summarize notes: ${error.message}`);
    }
  }

  /**
   * Generate quiz questions
   * @param {string} topic - The topic for quiz
   * @returns {Promise<Array>} - Array of quiz questions
   */
  async generateQuiz(topic) {
    try {
      if (!topic || typeof topic !== 'string') {
        throw new Error('Topic must be a non-empty string');
      }

      logger.info(`Generating quiz for: ${topic}`);

      const model = getMistralModel();

      const template = `Generate 5 multiple-choice questions for: {topic}

Format as JSON array with objects containing: question, options (array of 4), correctAnswer, explanation

Return ONLY valid JSON array, no markdown formatting, no code blocks.`;

      const promptTemplate = PromptTemplate.fromTemplate(template);
      const chain = promptTemplate.pipe(model).pipe(this.outputParser);

      const response = await chain.invoke({ 
        topic: String(topic).trim() 
      });

      if (!response || typeof response !== 'string') {
        throw new Error('Invalid response from AI model');
      }

      try {
        // Remove markdown code blocks if present
        let cleanedResponse = response.trim();
        if (cleanedResponse.startsWith('```')) {
          cleanedResponse = cleanedResponse.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        }

        const parsed = JSON.parse(cleanedResponse.trim());
        logger.info('✅ Quiz generated successfully');
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (parseError) {
        logger.warn(`Failed to parse quiz JSON: ${parseError.message}`);
        logger.warn(`Raw response: ${response.substring(0, 200)}`);
        throw new Error('Invalid quiz format from AI');
      }
    } catch (error) {
      logger.error(`AI Quiz Generation Error: ${error.message}`);
      throw new Error(`Failed to generate quiz: ${error.message}`);
    }
  }

  /**
   * Moderate a message
   * @param {string} message - The message to moderate
   * @returns {Promise<boolean>} - True if safe, false if unsafe
   */
  async moderateMessage(message) {
    try {
      if (!message || typeof message !== 'string') {
        return true; // Default to safe
      }

      logger.info('Moderating message...');

      const model = getMistralModel({ temperature: 0.1 });

      const template = `Is this message appropriate for a study group chat?
Message: "{message}"

Respond with ONLY "safe" or "unsafe".`;

      const promptTemplate = PromptTemplate.fromTemplate(template);
      const chain = promptTemplate.pipe(model).pipe(this.outputParser);

      const response = await chain.invoke({ 
        message: String(message).trim().substring(0, 500) 
      });

      if (!response || typeof response !== 'string') {
        return true; // Default to safe on error
      }

      const text = response.toLowerCase().trim();
      const isSafe = text.includes('safe') && !text.includes('unsafe');

      logger.info(`✅ Moderation result: ${isSafe ? 'safe' : 'unsafe'}`);
      return isSafe;
    } catch (error) {
      logger.error(`AI Moderation Error: ${error.message}`);
      return true; // Default to safe if error occurs
    }
  }
}

module.exports = new AIAssistantService();
