import type { VercelRequest, VercelResponse } from '@vercel/node';

const SYSTEM_PROMPT = `You are an elite bilingual Arabic-English converter specializing in natural, culturally authentic conversions for names, addresses, and general text, with particular expertise in Egyptian naming conventions and Egyptian geography.

STRICT CONVERSION RULES:
1. ARABIC NAMES TO ENGLISH:
   - Convert Arabic names to their standard, natural Egyptian English spelling conventions.
   - Examples:
     * عبد الرحمن محمد أحمد الغوري -> Abdelrahman Mohamed Ahmed El Ghoury
     * عبد الله -> Abdallah
     * مصطفى محمود -> Mostafa Mahmoud
     * الشاذلي -> El Shazly
     * الشافعي -> El Shafaey
   - CRITICAL: NEVER translate the semantic/religious meaning of personal names (e.g. "عبد الرحمن" MUST be "Abdelrahman", NEVER "Servant of the Merciful").
   - Compound names starting with "عبد" should be "Abdel..." or "Abdul...".
   - Surnames with the definite article "ال" should naturally be "El ..." or "Al ...".

2. ENGLISH NAMES TO ARABIC:
   - Convert English names into standard Arabic spelling.
   - Examples:
     * Mohamed Ahmed -> محمد أحمد
     * Abdelrahman El Ghoury -> عبد الرحمن الغوري
     * Sarah -> سارة
     * Peter -> بيتر

3. ADDRESSES:
   - Arabic to English: Translate structural words ("شارع" -> "Street", "ميدان" -> "Square", "مدينة" -> "City", "حي" -> "District", "محافظة" -> "Governorate", "طريق" -> "Road", "عمارة" -> "Building", "شقة" -> "Apt", "الدور" -> "Floor", "تقاطع" -> "Intersection", "بجوار" -> "Near").
   - Transliterate proper names within addresses naturally using Egyptian conventions (e.g. "القاهرة، مدينة نصر، شارع عباس العقاد" -> "Cairo, Nasr City, Abbas El Akkad Street").
   - English to Arabic: Reverse the above accurately (e.g. "Cairo, Nasr City, Abbas El Akkad Street" -> "القاهرة، مدينة نصر، شارع عباس العقاد").

4. GENERAL RULES:
   - Preserve all punctuation, numbers, formatting, and line breaks.
   - Output ONLY the converted text. Do NOT wrap in quotes, do NOT add conversational filler, explanations, or notes.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Custom-API-Key, X-API-Provider'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, sourceLang, targetLang } = req.body || {};

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Text parameter is required' });
  }

  const customKey = (req.headers['x-custom-api-key'] as string) || '';
  const preferredProvider = (req.headers['x-api-provider'] as string) || 'auto';

  // Check API keys in order: Custom Key -> GEMINI_API_KEY -> OPENAI_API_KEY -> GROQ_API_KEY
  const geminiKey = process.env.GEMINI_API_KEY || (customKey.startsWith('AIza') ? customKey : '');
  const openaiKey = process.env.OPENAI_API_KEY || (customKey.startsWith('sk-') && !customKey.startsWith('gsk_') ? customKey : '');
  const groqKey = process.env.GROQ_API_KEY || (customKey.startsWith('gsk_') ? customKey : '');

  const userPrompt = `Source Language: ${sourceLang === 'ar' ? 'Arabic' : 'English'}
Target Language: ${targetLang === 'ar' ? 'Arabic' : 'English'}
Input text to convert:
"""
${text.trim()}
"""`;

  // 1. Try Gemini API
  if (geminiKey && (preferredProvider === 'auto' || preferredProvider === 'gemini')) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          return res.status(200).json({
            result: candidate.trim(),
            source: 'ai',
            model: 'gemini-2.0-flash',
          });
        }
      }
    } catch (err) {
      console.error('Gemini API error:', err);
    }
  }

  // 2. Try OpenAI API
  if (openaiKey && (preferredProvider === 'auto' || preferredProvider === 'openai')) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.1,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          return res.status(200).json({
            result: content.trim(),
            source: 'ai',
            model: 'gpt-4o-mini',
          });
        }
      }
    } catch (err) {
      console.error('OpenAI API error:', err);
    }
  }

  // 3. Try Groq API
  if (groqKey && (preferredProvider === 'auto' || preferredProvider === 'groq')) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.1,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          return res.status(200).json({
            result: content.trim(),
            source: 'ai',
            model: 'llama-3.3-70b-versatile',
          });
        }
      }
    } catch (err) {
      console.error('Groq API error:', err);
    }
  }

  // Return fallback notification to allow client-side smart converter to execute
  return res.status(200).json({
    result: null,
    source: 'engine',
    message: 'No external AI key configured or key rate limited. Using built-in linguistic engine.',
  });
}
