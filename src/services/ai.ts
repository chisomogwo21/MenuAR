const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function sendToGemini(
  message: string,
  conversationHistory: {role: string, content: string}[],
  menuItems: any[]
) {
  if (!GEMINI_API_KEY) {
    throw new Error('VITE_GEMINI_API_KEY is not defined in the environment variables.');
  }

  const systemPrompt = `You are a friendly AI menu assistant. Help diners choose dishes they will love.
  
  Today's menu:
  ${menuItems.map(item =>
    `- ${item.name} (RWF ${item.price.toLocaleString()}): 
    ${item.description}. 
    Allergens: ${item.allergens?.join(', ') || 'none'}. 
    Calories: ${item.calories || 'not listed'}.`
  ).join('\n')}
  
  Rules:
  - Only recommend dishes from the menu above
  - Keep responses short and friendly (2-3 sentences)
  - When recommending mention name, price, one reason
  - Never make up dishes or prices
  - If asked about something not on the menu, say so`;

  const contents = [
    {
      role: 'user',
      parts: [{ text: systemPrompt }]
    },
    {
      role: 'model',
      parts: [{ text: 'Understood! I am ready to help diners choose from the menu.' }]
    },
    ...conversationHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    })),
    {
      role: 'user',
      parts: [{ text: message }]
    }
  ];

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents })
  });

  if (!response.ok) {
    throw new Error(`Failed to communicate with Gemini API: ${await response.text()}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}
