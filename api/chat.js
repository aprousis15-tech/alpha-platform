export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);

    const system = body?.system || '';
    const messages = body?.messages || [];

    const systemText = system ? system + '\n\n' : '';
    const userText = messages?.[0]?.content || '';

    const requestBody = {
      contents: [{ role: 'user', parts: [{ text: systemText + userText }] }],
      generationConfig: { maxOutputTokens: 8192, temperature: 0.1 },
      tools: [{ google_search: {} }]
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );

    const data = await response.json();

    // Extract ALL text parts — grounded responses may split text across multiple parts
    let text = '';
    const parts = data.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.text) text += part.text;
    }

    if (!text) {
      text = data.error?.message || 'No response from Gemini';
    }

    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    res.status(200).json({ content: [{ type: 'text', text }] });
  } catch (err) {
    res.status(500).json({ content: [{ type: 'text', text: 'Server error: ' + (err.message || 'Unknown') }] });
  }
}
