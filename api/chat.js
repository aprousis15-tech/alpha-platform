export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  let body = req.body;
  if (typeof body === 'string') body = JSON.parse(body);

  const system = body?.system || "";
  const messages = body?.messages || [];
  const max_tokens = body?.max_tokens || 3000;

  const systemText = system ? system + "\n\n" : "";
  const userText = messages?.[0]?.content || "";

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: systemText + userText }] }],
        generationConfig: { maxOutputTokens: 8192, temperature: 0.7 }
      })
    }
  );

  const data = await response.json();
  console.log("Gemini response:", JSON.stringify(data).slice(0, 500));
  
let text = data.candidates?.[0]?.content?.parts?.[0]?.text || 
           data.error?.message || 
           "No response from Gemini";
text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  res.status(200).json({ content: [{ type: "text", text }] });
}
