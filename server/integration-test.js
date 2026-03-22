/* 
  Integration Test for Mistral AI + LangChain
  Tests all API endpoints
*/

require('dotenv').config();
const http = require('http');
const jwt = require('jsonwebtoken');

// Create a valid JWT token
const token = jwt.sign(
  { id: 'test-user', email: 'test@test.com' },
  process.env.JWT_SECRET || '4afc81ab333d82e3db180f094e87e8150e787afaeb7cff96d968e724351af5e06f7f1472',
  { expiresIn: '24h' }
);

function makeRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `token=${token}`,
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body)
          });
        } catch {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('=== Integration Test: Mistral AI + LangChain ===\n');

  try {
    console.log('1️⃣ Testing /api/ai/ask endpoint...');
    const askRes = await makeRequest('POST', '/api/ai/ask', {
      prompt: 'What is the capital of France?',
      context: 'geography'
    });
    
    if (askRes.data.success && askRes.data.response) {
      console.log('✅ SUCCESS! Response:', askRes.data.response.substring(0, 80) + '...\n');
    } else {
      console.error('❌ FAILED:', askRes.data.message, '\n');
    }

    console.log('2️⃣ Testing /api/ai/summarize endpoint...');
    const summarizeRes = await makeRequest('POST', '/api/ai/summarize', {
      notes: 'Machine learning is a subset of artificial intelligence. It involves training algorithms to learn from data. Neural networks are inspired by the biological brain.'
    });
    
    if (summarizeRes.data.success && summarizeRes.data.summary) {
      console.log('✅ SUCCESS! Summary:', summarizeRes.data.summary.substring(0, 80) + '...\n');
    } else {
      console.error('❌ FAILED:', summarizeRes.data.message, '\n');
    }

    console.log('3️⃣ Testing /api/ai/quiz endpoint...');
    const quizRes = await makeRequest('POST', '/api/ai/quiz', {
      topic: 'Basic Biology'
    });
    
    if (quizRes.data.success && Array.isArray(quizRes.data.quiz)) {
      console.log('✅ SUCCESS! Generated', quizRes.data.quiz.length, 'questions\n');
      if (quizRes.data.quiz[0]) {
        console.log('Sample question:', quizRes.data.quiz[0].question?.substring(0, 60) + '...\n');
      }
    } else {
      console.error('❌ FAILED:', quizRes.data.message, '\n');
    }

    console.log('=== All Tests Complete ===');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test Error:', error.message);
    process.exit(1);
  }
}

runTests();
