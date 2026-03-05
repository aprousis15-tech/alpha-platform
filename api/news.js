export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  let body = req.body;
  if (typeof body === 'string') body = JSON.parse(body);

  const sector = body?.sector || 'AI & Technology';

  const prompt = `You are an expert investment research analyst. Find the 5 most important and recent news items for investors focused on the "${sector}" sector. For each news item provide:
1. A concise headline (under 15 words)
2. A 2-sentence summary of why it matters for investors
3. The source name and approximate date
4. Whether this is BULLISH, BEARISH, or NEUTRAL for the sector

Respond ONLY with a JSON array. No markdown fences. No preamble. Example format:
[
  {
    "headline": "headline here",
    "summary": "summary here",
    "source": "Source Name, Date",
    "sentiment": "BULLISH"
  }
]`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
        generationConfig: { maxOutputTokens: 8192, temperature: 0.3 }
      })
    }
  );

  const data = await response.json();
  console.log('News API response:', JSON.stringify(data).slice(0, 300));

  let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
  text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  let articles = [];
  try {
    articles = JSON.parse(text);
  } catch(e) {
    console.error('Parse error:', e.message, 'Raw:', text.slice(0, 200));
    articles = [];
  }

  res.status(200).json({ articles });
}
