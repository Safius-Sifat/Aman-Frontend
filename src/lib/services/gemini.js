import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.PUBLIC_VITE_GEMINI_API_KEY || process.env.PUBLIC_GEMINI_API_KEY || 'default_key';

let genAI;
let model;

// Initialize Gemini AI
try {
  genAI = new GoogleGenerativeAI(API_KEY);
  model = genAI.getGenerativeModel({ model: 'gemini-pro' });
} catch (error) {
  console.error('Failed to initialize Gemini AI:', error);
}

/**
 * Generate AI insights from user data
 * @param {Object} userData - User's personal and biometric data
 * @returns {Promise<Object>} AI-generated insights
 */
export async function generateAIInsights(userData) {
  try {
    const { personalInfo, additionalInfo, faceFeatures, voiceFeatures } = userData;

    const prompt = `
    Analyze the following refugee family reunification data and provide insights for family matching:

    Personal Information:
    - Name: ${personalInfo.firstName} ${personalInfo.lastName}
    - Date of Birth: ${personalInfo.dateOfBirth}
    - Place of Birth: ${personalInfo.placeOfBirth}
    - Nationality: ${personalInfo.nationality}
    - Languages: ${personalInfo.languages?.join(', ') || 'Not specified'}
    - Family Members: ${personalInfo.familyMembers?.map(m => `${m.name} (${m.relationship})`).join(', ') || 'Not specified'}

    Additional Information:
    - Last Known Location: ${additionalInfo.lastKnownLocation}
    - Separation Date: ${additionalInfo.separationDate}
    - Separation Circumstances: ${additionalInfo.separationCircumstances}
    - Additional Notes: ${additionalInfo.additionalNotes}

    Biometric Data Available:
    - Facial features: ${Object.keys(faceFeatures).length > 0 ? 'Yes' : 'No'}
    - Voice features: ${Object.keys(voiceFeatures).length > 0 ? 'Yes' : 'No'}

    Please provide:
    1. Key identifying characteristics for family matching
    2. Potential search keywords and aliases
    3. Geographic regions to focus search efforts
    4. Risk assessment and priority level
    5. Recommended matching strategies

    Format the response as JSON with the following structure:
    {
      "keyCharacteristics": ["array of key identifying features"],
      "searchKeywords": ["array of search terms"],
      "focusRegions": ["array of geographic regions"],
      "riskAssessment": "string describing risk level and factors",
      "priorityLevel": "high/medium/low",
      "matchingStrategies": ["array of recommended strategies"],
      "confidence": "percentage of data completeness"
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    try {
      const insights = JSON.parse(text);
      return {
        ...insights,
        generatedAt: new Date().toISOString(),
        dataQuality: calculateDataQuality(userData)
      };
    } catch (parseError) {
      console.warn('Failed to parse AI response as JSON, using fallback');
      return generateFallbackInsights(userData);
    }

  } catch (error) {
    console.error('Gemini AI analysis error:', error);
    return generateFallbackInsights(userData);
  }
}

/**
 * Analyze family connections between users
 * @param {Object} user1Data - First user's data
 * @param {Object} user2Data - Second user's data
 * @returns {Promise<Object>} Connection analysis
 */
export async function analyzeConnectionProbability(user1Data, user2Data) {
  try {
    const prompt = `
    Analyze the probability of family connection between these two individuals in a refugee context:

    Person 1:
    - Name: ${user1Data.firstName} ${user1Data.lastName}
    - Birth: ${user1Data.dateOfBirth} in ${user1Data.placeOfBirth}
    - Family: ${user1Data.familyMembers?.map(m => `${m.name} (${m.relationship})`).join(', ') || 'Not specified'}
    - Last Location: ${user1Data.lastKnownLocation}
    - Languages: ${user1Data.languages?.join(', ') || 'Not specified'}

    Person 2:
    - Name: ${user2Data.firstName} ${user2Data.lastName}
    - Birth: ${user2Data.dateOfBirth} in ${user2Data.placeOfBirth}
    - Family: ${user2Data.familyMembers?.map(m => `${m.name} (${m.relationship})`).join(', ') || 'Not specified'}
    - Last Location: ${user2Data.lastKnownLocation}
    - Languages: ${user2Data.languages?.join(', ') || 'Not specified'}

    Provide analysis in JSON format:
    {
      "connectionProbability": "percentage as number",
      "potentialRelationship": "string describing likely relationship",
      "matchingFactors": ["array of supporting factors"],
      "discrepancies": ["array of conflicting information"],
      "confidenceLevel": "high/medium/low",
      "recommendedActions": ["array of next steps"]
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.warn('Failed to parse connection analysis, using fallback');
      return generateFallbackConnectionAnalysis(user1Data, user2Data);
    }

  } catch (error) {
    console.error('Connection analysis error:', error);
    return generateFallbackConnectionAnalysis(user1Data, user2Data);
  }
}

/**
 * Generate contextual search suggestions
 * @param {string} query - Search query
 * @param {Object} context - Search context
 * @returns {Promise<Array>} Search suggestions
 */
export async function generateSearchSuggestions(query, context = {}) {
  try {
    const prompt = `
    Generate search suggestions for refugee family reunification based on:
    Query: "${query}"
    Context: ${JSON.stringify(context)}
    
    Consider:
    - Name variations and transliterations
    - Geographic variants
    - Age-appropriate searches
    - Cultural naming conventions
    - Common refugee patterns
    
    Return array of search suggestions as JSON:
    ["suggestion1", "suggestion2", "suggestion3", ...]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      return JSON.parse(text);
    } catch (parseError) {
      return generateFallbackSearchSuggestions(query);
    }

  } catch (error) {
    console.error('Search suggestions error:', error);
    return generateFallbackSearchSuggestions(query);
  }
}

/**
 * Calculate data quality score
 * @param {Object} userData - User data
 * @returns {number} Quality score (0-100)
 */
function calculateDataQuality(userData) {
  let score = 0;
  let maxScore = 0;

  // Personal information completeness
  const personalFields = ['firstName', 'lastName', 'dateOfBirth', 'placeOfBirth', 'nationality'];
  personalFields.forEach(field => {
    maxScore += 10;
    if (userData.personalInfo?.[field]) score += 10;
  });

  // Additional information completeness
  const additionalFields = ['lastKnownLocation', 'separationDate'];
  additionalFields.forEach(field => {
    maxScore += 10;
    if (userData.additionalInfo?.[field]) score += 10;
  });

  // Biometric data availability
  maxScore += 20;
  if (userData.faceFeatures && Object.keys(userData.faceFeatures).length > 0) score += 10;
  if (userData.voiceFeatures && Object.keys(userData.voiceFeatures).length > 0) score += 10;

  // Family information
  maxScore += 10;
  if (userData.personalInfo?.familyMembers?.length > 0) score += 10;

  // Languages
  maxScore += 10;
  if (userData.personalInfo?.languages?.length > 0) score += 10;

  return Math.round((score / maxScore) * 100);
}

/**
 * Generate fallback insights when AI is unavailable
 * @param {Object} userData - User data
 * @returns {Object} Basic insights
 */
function generateFallbackInsights(userData) {
  const { personalInfo, additionalInfo } = userData;

  return {
    keyCharacteristics: [
      `${personalInfo.firstName} ${personalInfo.lastName}`,
      personalInfo.dateOfBirth,
      personalInfo.placeOfBirth,
      personalInfo.nationality
    ].filter(Boolean),
    searchKeywords: [
      personalInfo.firstName,
      personalInfo.lastName,
      personalInfo.placeOfBirth,
      additionalInfo.lastKnownLocation
    ].filter(Boolean),
    focusRegions: [
      personalInfo.placeOfBirth,
      additionalInfo.lastKnownLocation
    ].filter(Boolean),
    riskAssessment: 'Standard risk - automated analysis unavailable',
    priorityLevel: 'medium',
    matchingStrategies: [
      'Name-based matching',
      'Geographic correlation',
      'Age-based filtering'
    ],
    confidence: calculateDataQuality(userData),
    generatedAt: new Date().toISOString(),
    dataQuality: calculateDataQuality(userData),
    fallback: true
  };
}

/**
 * Generate fallback connection analysis
 * @param {Object} user1Data - First user data
 * @param {Object} user2Data - Second user data
 * @returns {Object} Basic connection analysis
 */
function generateFallbackConnectionAnalysis(user1Data, user2Data) {
  const matchingFactors = [];
  const discrepancies = [];

  // Name similarity
  if (user1Data.lastName === user2Data.lastName) {
    matchingFactors.push('Same family name');
  }

  // Geographic proximity
  if (user1Data.placeOfBirth === user2Data.placeOfBirth) {
    matchingFactors.push('Same place of birth');
  }

  if (user1Data.lastKnownLocation === user2Data.lastKnownLocation) {
    matchingFactors.push('Same last known location');
  }

  // Age analysis
  if (user1Data.dateOfBirth && user2Data.dateOfBirth) {
    const age1 = new Date().getFullYear() - new Date(user1Data.dateOfBirth).getFullYear();
    const age2 = new Date().getFullYear() - new Date(user2Data.dateOfBirth).getFullYear();
    const ageDiff = Math.abs(age1 - age2);

    if (ageDiff <= 5) {
      matchingFactors.push('Similar age range');
    } else if (ageDiff >= 15) {
      matchingFactors.push('Potential parent-child relationship');
    }
  }

  return {
    connectionProbability: Math.min(matchingFactors.length * 20, 80),
    potentialRelationship: 'Unknown - requires further analysis',
    matchingFactors,
    discrepancies,
    confidenceLevel: matchingFactors.length >= 3 ? 'high' : matchingFactors.length >= 2 ? 'medium' : 'low',
    recommendedActions: [
      'Conduct detailed interview',
      'Verify documentation',
      'Arrange supervised meeting'
    ],
    fallback: true
  };
}

/**
 * Generate fallback search suggestions
 * @param {string} query - Search query
 * @returns {Array} Basic search suggestions
 */
function generateFallbackSearchSuggestions(query) {
  if (!query) return [];

  const suggestions = [query];

  // Add variations
  suggestions.push(query.toLowerCase());
  suggestions.push(query.toUpperCase());

  // Add partial matches
  const words = query.split(' ');
  words.forEach(word => {
    if (word.length > 2) {
      suggestions.push(word);
    }
  });

  return [...new Set(suggestions)];
}

export default {
  generateAIInsights,
  analyzeConnectionProbability,
  generateSearchSuggestions
};
