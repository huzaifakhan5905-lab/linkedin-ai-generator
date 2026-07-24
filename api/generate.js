// api/generate.js — PostCraft AI Secure Vercel Serverless Function
// Supports: post, variations, comment, connection, poll modes + real URL fetching

const MODELS = [
  'google/gemini-2.0-flash-exp:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'inclusionai/ling-3.0-flash:free',
  'deepseek/deepseek-r1:free',
  'qwen/qwen-2.5-coder-32b-instruct:free',
  'poolside/laguna-s-2.1:free',
  'poolside/laguna-xs-2.1:free',
];

const STYLE_PROMPTS = {
  storytelling: 'Write as a personal narrative with beginning, tension, and payoff. Short paragraphs. Make it feel human.',
  insight:      'Open with a bold, surprising statement. Back it up with clear reasoning. Opinionated and direct.',
  listicle:     'Numbered list. Punchy header. Each point: one clear idea + short explanation.',
  question:     'Share your own view first to set context, then end with a genuinely thought-provoking question.',
  motivational: 'Uplifting and real. NOT cliché. Make readers feel seen and motivated.',
  casestudy:    'Situation → Approach → Result (with specifics) → Key takeaway.',
  justin_welsh: "Write in Justin Welsh's style: ultra-concise, line-by-line formatting, actionable 1-person business systems, zero fluff.",
  sahil_bloom:  "Write in Sahil Bloom's style: visual mental models, breakdown of key principles, high leverage storytelling with 5 bullet takeaways.",
  paul_graham:  "Write in Paul Graham's style: thoughtful essayist tone, deep startup wisdom, clear contrarian perspective.",
  ruben_hassid: "Write in Ruben Hassid's style: punchy 1-line scroll-stopping hook, double line breaks, bold subheaders, viral LinkedIn formatting."
};

const TONE_PROMPTS = {
  casual:        'Tone: conversational, real, like talking to a smart friend. No corporate speak.',
  professional:  'Tone: polished, authoritative, clear. No fluff.',
  bold:          'Tone: confident, provocative, direct. Do not hedge.',
  empathetic:    'Tone: warm, human, emotionally connecting.',
  'data-driven': 'Tone: analytical, credible, fact-based.',
  humorous:      'Tone: genuinely witty and clever. Not forced.',
};

/* ── Real URL Content Fetcher (Server-Side, No CORS) ── */
async function fetchUrlContent(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PostCraftBot/1.0)' }
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text')) return null;
    const html = await res.text();
    // Extract readable text from HTML
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .slice(0, 3000);
    return text.length > 100 ? text : null;
  } catch (e) {
    console.warn('URL fetch failed:', e.message);
    return null;
  }
}

/* ── Prompt Builders ── */
function buildPostPrompt({ content, isUrl, style, tone, useEmoji, useHashtag, useHook }) {
  const styleInstruction = STYLE_PROMPTS[style] || STYLE_PROMPTS.storytelling;
  const toneInstruction = TONE_PROMPTS[tone] || TONE_PROMPTS.casual;
  return `You are an elite LinkedIn content strategist. Write a high-performing LinkedIn post.

${isUrl ? `SOURCE CONTENT (extracted from URL):\n"${content}"\nINSTRUCTION: Extract core insights/lessons from above and write a viral LinkedIn post about them.` : `TOPIC: "${content}"`}

STYLE: ${styleInstruction}
${toneInstruction}
${useHook ? 'HOOK: First line MUST stop the scroll — specific, surprising, or emotionally charged. Never start with "I".' : ''}
${useEmoji ? 'Use 2-4 relevant emojis naturally.' : 'NO emojis.'}
${useHashtag ? 'End with 3-5 relevant hashtags on a new line.' : 'NO hashtags.'}

RULES:
- Short paragraphs (max 2-3 sentences)
- 150-280 words total
- NEVER use "In today's world", "I'm excited to share", "game-changer"
- Be specific and personal
- End with a question or call to action

Output ONLY the post. No labels, no extra text.`;
}

function buildVariationsPrompt({ content, isUrl, tone, useEmoji, useHashtag }) {
  return `You are an elite LinkedIn content strategist. Generate 3 DIFFERENT high-performing LinkedIn post variations for the same topic.

${isUrl ? `SOURCE CONTENT: "${content}"` : `TOPIC: "${content}"`}

Each variation must use a DIFFERENT style:
- Variation 1: Personal Story / Narrative style
- Variation 2: Bold Hot Take / Insight style
- Variation 3: Numbered List / Tactical style

${TONE_PROMPTS[tone] || TONE_PROMPTS.casual}
${useEmoji ? 'Use 2-3 relevant emojis per post naturally.' : 'NO emojis.'}
${useHashtag ? 'End each with 3-5 hashtags.' : 'NO hashtags.'}

RULES per variation:
- 150-280 words
- Strong scroll-stopping hook (never start with "I")
- End with question or CTA
- NEVER use "In today's world", "I'm excited to share", "game-changer"

Output format (use exactly these separators, nothing else):
---VARIATION 1---
[post text]
---VARIATION 2---
[post text]
---VARIATION 3---
[post text]`;
}

function buildCommentPrompt({ postContent }) {
  return `You are an expert LinkedIn engagement strategist. Write 3 thoughtful, high-value comments for the following LinkedIn post.

POST TO COMMENT ON:
"${postContent}"

Each comment should:
- Add genuine value, insight, or a personal angle
- Be 1-3 sentences (50-100 words max)
- Feel authentic, not generic ("Great post!" is NOT acceptable)
- End with a relevant question OR a brief personal experience that resonates

Output format (use exactly these separators):
---COMMENT 1---
[comment text]
---COMMENT 2---
[comment text]
---COMMENT 3---
[comment text]`;
}

function buildConnectionPrompt({ name, role, reason }) {
  return `You are a LinkedIn networking expert. Write 3 personalized LinkedIn connection request messages.

Person's Name: ${name || 'the person'}
Their Role/Industry: ${role || 'professional'}
Why connecting: ${reason || 'mutual professional interest'}

Each message must:
- Be under 300 characters (LinkedIn's limit)
- Mention something specific about their work or role
- State clearly why you want to connect
- Sound human, warm, not salesy
- NO generic phrases like "I'd like to add you to my network"

Output format (use exactly these separators):
---MESSAGE 1---
[message text]
---MESSAGE 2---
[message text]
---MESSAGE 3---
[message text]`;
}

function buildPollPrompt({ topic }) {
  return `You are a LinkedIn viral content strategist. Create 3 high-engagement LinkedIn poll ideas for the topic below.

TOPIC: "${topic}"

Each poll must have:
- 1 engaging, opinionated question (that makes people WANT to vote)
- Exactly 4 answer options (LinkedIn max)
- Options should represent real diverse views, not obvious yes/no

Format (use exactly these separators):
---POLL 1---
QUESTION: [question]
A: [option]
B: [option]
C: [option]
D: [option]
---POLL 2---
QUESTION: [question]
A: [option]
B: [option]
C: [option]
D: [option]
---POLL 3---
QUESTION: [question]
A: [option]
B: [option]
C: [option]
D: [option]`;
}

/* ── Call AI Helper ── */
async function callAI(apiKey, prompt, maxTokens = 700) {
  let lastError = null;
  for (const model of MODELS) {
    try {
      const headers = new Headers();
      headers.set('Authorization', `Bearer ${apiKey}`);
      headers.set('Content-Type', 'application/json');
      headers.set('HTTP-Referer', 'https://postcraft.ai');
      headers.set('X-Title', 'PostCraft AI');

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You are an expert LinkedIn content creator. Authentic, engaging, viral. Never generic.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.88,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(`${response.status}: ${err.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) return { text, model };
    } catch (err) {
      console.warn(`[${model}] failed:`, err.message);
      lastError = err;
    }
  }
  throw lastError || new Error('All AI models failed.');
}

/* ── Main Handler ── */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const apiKey = (process.env.OPENROUTER_API_KEY || '').trim();
  if (!apiKey) return res.status(500).json({ error: 'OPENROUTER_API_KEY not configured.' });

  const { mode = 'post', topic, style, tone, useEmoji, useHashtag, useHook, inputMode,
          postContent, name, role, reason } = req.body || {};

  try {
    // ── MODE: Comment Generator
    if (mode === 'comment') {
      if (!postContent || postContent.trim().length < 20) {
        return res.status(400).json({ error: 'Post content required for comment generation.' });
      }
      const prompt = buildCommentPrompt({ postContent: postContent.trim().slice(0, 1000) });
      const { text } = await callAI(apiKey, prompt, 600);
      return res.status(200).json({ success: true, result: text });
    }

    // ── MODE: Connection Request Generator
    if (mode === 'connection') {
      const prompt = buildConnectionPrompt({ name, role, reason });
      const { text } = await callAI(apiKey, prompt, 500);
      return res.status(200).json({ success: true, result: text });
    }

    // ── MODE: Poll Generator
    if (mode === 'poll') {
      if (!topic || topic.trim().length < 3) {
        return res.status(400).json({ error: 'Topic required for poll generation.' });
      }
      const prompt = buildPollPrompt({ topic: topic.trim().slice(0, 300) });
      const { text } = await callAI(apiKey, prompt, 800);
      return res.status(200).json({ success: true, result: text });
    }

    // ── For post/variations modes — need topic
    if (!topic || typeof topic !== 'string' || topic.trim().length < 3) {
      return res.status(400).json({ error: 'Topic or URL must be provided.' });
    }

    const rawInput = topic.trim();
    const isUrl = inputMode === 'url' || /^https?:\/\//i.test(rawInput);

    // Real URL Content Fetching (Bug #1 Fix)
    let content = rawInput;
    let fetchedFromUrl = false;
    if (isUrl) {
      const fetched = await fetchUrlContent(rawInput);
      if (fetched) {
        content = fetched;
        fetchedFromUrl = true;
      }
    }

    // ── MODE: 3 Variations
    if (mode === 'variations') {
      const prompt = buildVariationsPrompt({ content: content.slice(0, 2000), isUrl: fetchedFromUrl, tone, useEmoji, useHashtag });
      const { text } = await callAI(apiKey, prompt, 1400);
      return res.status(200).json({ success: true, result: text, fetchedFromUrl });
    }

    // ── MODE: Single Post (default)
    const prompt = buildPostPrompt({
      content: content.slice(0, 2000), isUrl: fetchedFromUrl,
      style, tone, useEmoji, useHashtag, useHook
    });
    const { text, model } = await callAI(apiKey, prompt, 650);
    return res.status(200).json({ success: true, post: text, modelUsed: model, fetchedFromUrl });

  } catch (err) {
    console.error('Handler error:', err.message);
    return res.status(500).json({ error: err.message || 'Generation failed.' });
  }
}
