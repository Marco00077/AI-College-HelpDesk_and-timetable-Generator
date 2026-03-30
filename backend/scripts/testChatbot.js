const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('../models/Course');
const KnowledgeBase = require('../models/KnowledgeBase');
const { processQuery } = require('../controllers/chatController');

dotenv.config();

const testChatbot = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const testQueries = [
      'BCA fees',
      'What is the fee for CSE?',
      'Tell me about MCA',
      'How long is the MBA program?',
      'CSE course details',
      'What courses do you offer?'
    ];

    console.log('=== Testing Chatbot with Course Queries ===\n');

    for (const query of testQueries) {
      console.log(`Query: "${query}"`);
      
      // Create mock request and response
      const req = { body: { query } };
      const res = {
        json: (data) => {
          console.log(`Response: ${data.response}`);
          console.log(`Intent: ${data.intent}`);
          console.log(`Category: ${data.category}`);
          if (data.courseData) {
            console.log(`Course: ${data.courseData.name} (${data.courseData.code})`);
          }
          console.log('---\n');
        },
        status: (code) => ({
          json: (data) => {
            console.log(`Error ${code}: ${data.error}\n`);
          }
        })
      };
      
      await processQuery(req, res);
    }

    console.log('✅ Chatbot test complete');
    process.exit(0);
  } catch (error) {
    console.error('Test error:', error);
    process.exit(1);
  }
};

testChatbot();
