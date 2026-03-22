import axios from 'axios';

const API_URL = '/api/ai';

/**
 * Ask AI a question
 * @param {Object} promptData - { prompt: string, context?: string }
 * @returns {Promise<{success: boolean, response: string}>}
 */
const askAI = async (promptData) => {
  try {
    if (!promptData.prompt || typeof promptData.prompt !== 'string') {
      throw new Error('Prompt must be a non-empty string');
    }

    const response = await axios.post(`${API_URL}/ask`, promptData);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get AI response');
    }

    return {
      success: true,
      response: response.data.response
    };
  } catch (error) {
    console.error('AI Service Error:', error);
    throw error;
  }
};

/**
 * Summarize notes
 * @param {Object} notesData - { notes: string }
 * @returns {Promise<{success: boolean, summary: string}>}
 */
const summarizeNotes = async (notesData) => {
  try {
    if (!notesData.notes || typeof notesData.notes !== 'string') {
      throw new Error('Notes must be a non-empty string');
    }

    const response = await axios.post(`${API_URL}/summarize`, notesData);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to summarize notes');
    }

    return {
      success: true,
      summary: response.data.summary
    };
  } catch (error) {
    console.error('Summarize Service Error:', error);
    throw error;
  }
};

/**
 * Generate quiz
 * @param {Object} topicData - { topic: string }
 * @returns {Promise<{success: boolean, quiz: Array}>}
 */
const generateQuiz = async (topicData) => {
  try {
    if (!topicData.topic || typeof topicData.topic !== 'string') {
      throw new Error('Topic must be a non-empty string');
    }

    const response = await axios.post(`${API_URL}/quiz`, topicData);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to generate quiz');
    }

    return {
      success: true,
      quiz: response.data.quiz
    };
  } catch (error) {
    console.error('Quiz Service Error:', error);
    throw error;
  }
};

const aiService = {
  askAI,
  summarizeNotes,
  generateQuiz,
};

export default aiService;
