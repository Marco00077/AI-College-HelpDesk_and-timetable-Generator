// Simple rule-based NLP processor

// Common stop words to remove
const stopWords = ['is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 
  'could', 'may', 'might', 'must', 'can', 'the', 'a', 'an', 'and', 'or', 
  'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'about',
  'what', 'when', 'where', 'how', 'why', 'which', 'who', 'whom'];

// Preprocess text: lowercase, remove punctuation, remove stop words
const preprocessText = (text) => {
  // Convert to lowercase
  let processed = text.toLowerCase();
  
  // Remove punctuation
  processed = processed.replace(/[^\w\s]/g, ' ');
  
  // Split into words
  let words = processed.split(/\s+/).filter(word => word.length > 0);
  
  // Remove stop words
  words = words.filter(word => !stopWords.includes(word));
  
  return words;
};

// Extract keywords from processed text
const extractKeywords = (words) => {
  return words;
};

// Calculate similarity score between query keywords and knowledge base keywords
const calculateSimilarity = (queryKeywords, kbKeywords) => {
  let matchCount = 0;
  
  queryKeywords.forEach(qWord => {
    kbKeywords.forEach(kbWord => {
      if (qWord === kbWord || qWord.includes(kbWord) || kbWord.includes(qWord)) {
        matchCount++;
      }
    });
  });
  
  return matchCount;
};

// Find best matching response from knowledge base
const findBestMatch = (query, knowledgeBase) => {
  const queryKeywords = preprocessText(query);
  
  let bestMatch = null;
  let highestScore = 0;
  
  knowledgeBase.forEach(entry => {
    const score = calculateSimilarity(queryKeywords, entry.keywords);
    
    if (score > highestScore) {
      highestScore = score;
      bestMatch = entry;
    }
  });
  
  // Threshold for minimum match
  if (highestScore >= 1) {
    return bestMatch;
  }
  
  return null;
};

module.exports = {
  preprocessText,
  extractKeywords,
  findBestMatch,
};
