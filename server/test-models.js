require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

(async () => {
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  const modelsToTest = [
    'gemini-pro',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-2.0-pro',
    'gemini-exp-1114'
  ];

  console.log('Testing available models...\n');

  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing ${modelName}...`);
      const model = client.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('test');
      console.log(`✅ ${modelName} works!\n`);
      break;
    } catch (error) {
      console.log(`❌ ${modelName}: ${error.message.substring(0, 80)}\n`);
    }
  }
})();
