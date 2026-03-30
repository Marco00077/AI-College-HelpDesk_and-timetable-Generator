const KnowledgeBase = require('../models/KnowledgeBase');
const Course = require('../models/Course');
const { findBestMatch, preprocessText } = require('../utils/nlpProcessor');

// Process chat query
const processQuery = async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    // Check if query is about a specific course
    const courseResponse = await handleCourseQuery(query);
    if (courseResponse) {
      return res.json(courseResponse);
    }
    
    // Fetch all knowledge base entries
    const knowledgeBase = await KnowledgeBase.find();
    
    // Find best matching response
    const match = findBestMatch(query, knowledgeBase);
    
    if (match) {
      return res.json({
        response: match.response,
        intent: match.intent,
        category: match.category,
      });
    }
    
    // Default response if no match found
    return res.json({
      response: 'I apologize, but I could not find an answer to your question. Please contact the admin office or try rephrasing your query.',
      intent: 'unknown',
      category: 'general',
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process query' });
  }
};

// Handle course-specific queries
const handleCourseQuery = async (query) => {
  const queryLower = query.toLowerCase();
  const keywords = preprocessText(query);
  const queryWords = queryLower.split(/\s+/);
  
  // Fetch all courses and sort by code length (longest first) to prioritize longer codes
  const courses = await Course.find();
  courses.sort((a, b) => b.code.length - a.code.length);
  
  // Check if query mentions a specific course
  let matchedCourse = null;
  let bestMatchScore = 0;
  
  for (const course of courses) {
    const courseName = course.name.toLowerCase();
    const courseCode = course.code.toLowerCase();
    let score = 0;
    
    // Check for exact code match in original query words (case insensitive)
    const hasExactCode = queryWords.some(word => word === courseCode);
    
    if (hasExactCode) {
      score = 100;
    }
    // Check if code appears as whole word using regex
    else {
      const regex = new RegExp(`\\b${courseCode}\\b`, 'i');
      if (regex.test(queryLower)) {
        score = 90;
      }
    }
    
    // Course name match (lower priority)
    if (score === 0 && queryLower.includes(courseName)) {
      score = 50;
    }
    
    if (score > bestMatchScore) {
      bestMatchScore = score;
      matchedCourse = course;
    }
  }
  
  if (!matchedCourse || bestMatchScore < 25) {
    return null;
  }
  
  // Determine what information is being asked about the course
  if (keywords.includes('fee') || keywords.includes('fees') || keywords.includes('cost') || keywords.includes('price')) {
    return {
      response: `The annual tuition fee for ${matchedCourse.name} (${matchedCourse.code}) is ₹${matchedCourse.fees.toLocaleString('en-IN')}. The program duration is ${matchedCourse.duration}.`,
      intent: 'ask_course_fees',
      category: 'fees',
      courseData: matchedCourse
    };
  }
  
  if (keywords.includes('duration') || keywords.includes('long') || keywords.includes('years')) {
    return {
      response: `${matchedCourse.name} (${matchedCourse.code}) is a ${matchedCourse.duration} program. The annual fee is ₹${matchedCourse.fees.toLocaleString('en-IN')}.`,
      intent: 'ask_course_duration',
      category: 'courses',
      courseData: matchedCourse
    };
  }
  
  if (keywords.includes('tell') || keywords.includes('about') || keywords.includes('detail') || keywords.includes('info') || keywords.includes('information') || queryLower.includes('tell me')) {
    let response = `${matchedCourse.name} (${matchedCourse.code}) is a ${matchedCourse.category} program.\n\n`;
    if (matchedCourse.description) {
      response += `${matchedCourse.description}\n\n`;
    }
    response += `Duration: ${matchedCourse.duration}\n`;
    response += `Annual Fee: ₹${matchedCourse.fees.toLocaleString('en-IN')}`;
    
    return {
      response,
      intent: 'ask_course_info',
      category: 'courses',
      courseData: matchedCourse
    };
  }
  
  // Default course response
  return {
    response: `${matchedCourse.name} (${matchedCourse.code}) is available. It's a ${matchedCourse.duration} ${matchedCourse.category} program with an annual fee of ₹${matchedCourse.fees.toLocaleString('en-IN')}. ${matchedCourse.description || ''}`,
    intent: 'ask_course',
    category: 'courses',
    courseData: matchedCourse
  };
};

module.exports = { processQuery };
