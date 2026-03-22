require('dotenv').config();
const aiService = require('./src/ai/aiAssistant.service');

(async () => {
  console.log('Testing AI Service with your API key...\n');
  
  try {
    console.log('1️⃣ Testing askQuestion...');
    const qaResponse = await aiService.askQuestion('What is photosynthesis?', 'biology');
    console.log('✅ Q&A Working!');
    console.log('Response:', qaResponse.substring(0, 100) + '...\n');
  } catch (error) {
    console.error('❌ Q&A Failed:', error.message.substring(0, 100) + '\n');
  }

  try {
    console.log('2️⃣ Testing summarizeNotes...');
    const notes = 'Python is a high-level programming language. It uses indentation for code blocks. Lists store multiple values. Functions are reusable code blocks.';
    const summary = await aiService.summarizeNotes(notes);
    console.log('✅ Summarize Working!');
    console.log('Summary:', summary.substring(0, 100) + '...\n');
  } catch (error) {
    console.error('❌ Summarize Failed:', error.message.substring(0, 100) + '\n');
  }

  console.log('=== AI Services Ready! ===');
})();
