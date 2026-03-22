require('dotenv').config();
const aiService = require('./src/ai/aiAssistant.service');

(async () => {
  console.log('=== Testing AI Service with Mistral ===\n');

  try {
    console.log('1️⃣ Testing askQuestion...');
    const response = await aiService.askQuestion('What is 2+2?', 'math');
    console.log('✅ SUCCESS!\n');
    console.log('Response:', response.substring(0, 150), '\n');
  } catch (error) {
    console.error('❌ FAILED:', error.message, '\n');
  }

  try {
    console.log('2️⃣ Testing summarizeNotes...');
    const summary = await aiService.summarizeNotes('Python is a programming language. It uses indentation. Variables store data.');
    console.log('✅ SUCCESS!\n');
    console.log('Summary:', summary.substring(0, 150), '\n');
  } catch (error) {
    console.error('❌ FAILED:', error.message, '\n');
  }

  try {
    console.log('3️⃣ Testing generateQuiz...');
    const quiz = await aiService.generateQuiz('Basic Math');
    console.log('✅ SUCCESS!\n');
    console.log('Questions:', Array.isArray(quiz) ? quiz.length : 1, '\n');
  } catch (error) {
    console.error('❌ FAILED:', error.message, '\n');
  }

  console.log('=== Test Complete ===');
})();
