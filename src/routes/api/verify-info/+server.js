import { json } from '@sveltejs/kit';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export async function POST({ request }) {
    try {
        const { backgroundInfo, language } = await request.json();

        if (!backgroundInfo || backgroundInfo.trim().length < 50) {
            return json({
                isRelevant: false,
                feedback: "Please provide more detailed information about yourself. Include details about your family, background, experiences, and anything that might help identify you."
            });
        }

        // If no API key is configured, skip verification
        if (!GEMINI_API_KEY) {
            return json({
                isRelevant: true,
                feedback: "Information received successfully."
            });
        }

        const prompt = `
      Analyze the following background information provided by a person who is trying to reunite with their family. 
      Determine if the information is relevant, detailed, and helpful for family identification purposes.
      
      The information should ideally include details about:
      - Family background and members
      - Places lived or visited
      - Personal experiences and memories
      - Occupation, education, or skills
      - Physical characteristics or distinctive features
      - Current situation
      - Any other identifying information
      
      Background Information: "${backgroundInfo}"
      
      Respond with a JSON object containing:
      - "isRelevant": boolean (true if the information is sufficient and relevant)
      - "feedback": string (helpful feedback if not sufficient, or encouragement if good)
      
      The response should be in ${language === 'es' ? 'Spanish' : language === 'ar' ? 'Arabic' : 'English'}.
    `;

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (!response.ok) {
            throw new Error('Gemini API request failed');
        }

        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            throw new Error('No response from Gemini API');
        }

        // Try to parse JSON from the response
        let result;
        try {
            // Extract JSON from the response (it might be wrapped in markdown code blocks)
            const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                result = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            // Fallback if JSON parsing fails
            const isRelevant = generatedText.toLowerCase().includes('relevant') ||
                generatedText.toLowerCase().includes('sufficient') ||
                backgroundInfo.length > 200;

            result = {
                isRelevant,
                feedback: isRelevant
                    ? "Thank you for providing detailed information. This will help with family matching."
                    : "Please provide more specific details about your background, family, and experiences."
            };
        }

        return json(result);

    } catch (error) {
        console.error('Verification error:', error);

        // Fallback: simple length-based validation
        const isRelevant = backgroundInfo.trim().length > 100;

        return json({
            isRelevant,
            feedback: isRelevant
                ? "Information received successfully."
                : "Please provide more detailed background information to help with family matching."
        });
    }
}
