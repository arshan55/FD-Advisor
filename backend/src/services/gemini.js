import 'dotenv/config';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MOCK_MODE = !GEMINI_API_KEY || GEMINI_API_KEY === 'mock-gemini-key';

const SYSTEM_PROMPT = `You are FD Mitra, a trusted multilingual financial advisor helping first-time Fixed Deposit users in India. You speak in the user's chosen language: Hindi, Bhojpuri, Marathi, Tamil, English, or Hinglish. You always respond in whichever language the user is currently using.

Rules you must always follow:
1. Never use English financial jargon without immediately explaining it in the same message in plain terms
2. Use simple analogies and real rupee amounts in your examples
3. Always use Indian number formatting (₹1,00,000 not ₹100,000)
4. When explaining interest rates, always show the actual rupee gain, not just the percentage
5. If a user seems confused or anxious, reassure them about DICGC insurance (₹5 lakh government guarantee)
6. Never recommend a specific bank — always present options and let the user decide
7. Keep responses short — maximum 4 sentences per reply unless the user asks for detail
8. Match the vocabulary level of the user — if they use simple words, use simpler words back
9. For Bhojpuri, use authentic dialect, not just translated Hindi
10. If you do not know something, say so honestly and suggest they visit the bank branch`;

// Mock responses for when API key is missing (dev/demo mode only)
const mockResponses = {
  'hi': 'Namaste! Main FD Mitra hoon. Abhi main demo mode mein hoon — asli Gemini AI key set karein sahi jawab ke liye.',
  'default': 'Hello! I am FD Mitra in demo mode. Please set a valid GEMINI_API_KEY for full AI responses.'
};

export async function getGeminiResponse(userMessage, language, conversationHistory = []) {
  if (MOCK_MODE) {
    console.warn('⚠️  Gemini running in MOCK MODE — set GEMINI_API_KEY in backend/.env');
    await new Promise(resolve => setTimeout(resolve, 400));
    return language === 'hi' ? mockResponses['hi'] : mockResponses['default'];
  }

  try {
    // Build the conversation contents array with proper multi-turn format
    const contents = [];

    // Add conversation history (last 10 messages)
    const recentHistory = (conversationHistory || []).slice(-10);
    for (const msg of recentHistory) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      }
    }

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: `${SYSTEM_PROMPT}\n\nCurrent language: ${language}` }]
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 400
          }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', response.status, errText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, koi response nahi mila.';
  } catch (error) {
    console.error('Gemini API error:', error.message);
    return 'Abhi thodi takleef ho rahi hai. Please thodi der baad try karein.';
  }
}

export async function explainJargon(term, language) {
  const prompt = `Explain the financial term "${term}" in simple ${language}. Use plain language, a relatable analogy, and a rupee example. Maximum 3 sentences.`;
  return getGeminiResponse(prompt, language, []);
}
