// api/generate.js - Secure Vercel Serverless Function for AI Generation

const MODELS = [
  'inclusionai/ling-3.0-flash:free',
  'poolside/laguna-s-2.1:free',
  'poolside/laguna-xs-2.1:free',
  'google/gemini-2.0-flash-exp:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'deepseek/deepseek-r1:free',
  'qwen/qwen-2.5-coder-32b-instruct:free'
];

const STYLE_PROMPTS = {
  storytelling: 'Write as a personal narrative with beginning, tension, and payoff. Short paragraphs. Make it feel human.',
  insight:      'Open with a bold, surprising statement. Back it up with clear reasoning. Opinionated and direct.',
  listicle:     'Numbered list. Punchy header. Each point: one clear idea + short explanation.',
  question:     'Share your own view first to set context, then end with a genuinely thought-provoking question.',
  motivational: 'Uplifting and real. NOT cliché. Make readers feel seen and motivated.',
  casestudy:    'Situation → Approach → Result (with specifics) → Key takeaway.',
};

const TONE_PROMPTS = {
  casual:        'Tone: conversational, real, like talking to a smart friend. No corporate speak.',
  professional:  'Tone: polished, authoritative, clear. No fluff.',
  bold:          'Tone: confident, provocative, direct. Do not hedge.',
  empathetic:    'Tone: warm, human, emotionally connecting.',
  'data-driven': 'Tone: analytical, credible, fact-based.',
  humorous:      'Tone: genuinely witty and clever. Not forced.',
};

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENROUTER_API_KEY is not configured on the server.' });
  }

  const { topic, style, tone, useEmoji, useHashtag, useHook } = req.body || {};

  if (!topic || typeof topic !== 'string' || topic.trim().length < 10) {
    return res.status(400).json({ error: 'Topic must be at least 10 characters long.' });
  }

  // Sanitize length
  const cleanTopic = topic.trim().slice(0, 500);

  const styleInstruction = STYLE_PROMPTS[style] || STYLE_PROMPTS.storytelling;
  const toneInstruction = TONE_PROMPTS[tone] || TONE_PROMPTS.casual;

  const prompt = `You are an elite LinkedIn content strategist. Write a high-performing LinkedIn post.

TOPIC: "${cleanTopic}"
STYLE: ${styleInstruction}
${toneInstruction}
${useHook ? 'HOOK: First line MUST stop the scroll — be specific, surprising, or emotionally charged. Never start with "I".' : ''}
${useEmoji ? 'Use 2-4 relevant emojis naturally placed.' : 'NO emojis at all.'}
${useHashtag ? 'End with 3-5 relevant hashtags on a new line.' : 'NO hashtags.'}

RULES:
- Short paragraphs (max 2-3 sentences)
- 150-280 words total
- NEVER use "In today's world", "I'm excited to share", "game-changer"
- Be specific and personal
- End with a question or call to action

Output ONLY the post. No labels, no meta text.`;

  let lastError = null;

  for (const model of MODELS) {
    try {
      // Create fresh headers object for each request to prevent any header mutation/append accumulation
      const reqHeaders = new Headers();
      reqHeaders.set('Authorization', `Bearer ${apiKey}`);
      reqHeaders.set('Content-Type', 'application/json');
      reqHeaders.set('HTTP-Referer', 'https://postcraft.ai');
      reqHeaders.set('X-Title', 'PostCraft AI');

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: reqHeaders,
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: 'You are an expert LinkedIn content creator. Authentic, engaging, results-driven. Never generic.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.88,
          max_tokens: 650,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`${response.status}: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const postText = data.choices?.[0]?.message?.content?.trim();

      if (postText) {
        return res.status(200).json({ success: true, post: postText, modelUsed: model });
      }
    } catch (err) {
      console.warn(`Serverless model attempt [${model}] failed:`, err.message);
      lastError = err;
    }
  }

  return res.status(500).json({
    error: lastError ? lastError.message : 'All AI models failed to generate a response.'
  });
}
