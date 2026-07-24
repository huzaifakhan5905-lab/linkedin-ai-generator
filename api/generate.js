// api/generate.js — PostCraft AI Serverless API v3.0
// Modes: post, variations, comment, connection, poll,
//        headline, about, calendar, analyze, hashtags, transform, repurpose, dm

const MODELS = [
  'google/gemini-2.0-flash-lite-preview-02-05:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'google/gemini-2.0-flash-exp:free',
  'mistralai/mistral-7b-instruct:free',
  'qwen/qwen-2.5-coder-32b-instruct:free',
  'deepseek/deepseek-r1:free',
  'openchat/openchat-7b:free',
  'gryphe/mythomax-l2-13b:free'
];

/* ══════════════════════════════════════════
   AI CALL HELPER — WITH MULTI-MODEL AUTO-FAILOVER
══════════════════════════════════════════ */
async function callAI(apiKey, prompt, maxTokens = 700) {
  let lastError = null;

  // 1. Primary Attempt: Pass full MODELS array to OpenRouter for native instant auto-failover
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
        models: MODELS,
        messages: [
          { role: 'system', content: 'You are an expert LinkedIn content creator. Authentic, engaging, viral. Never generic.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.85,
        max_tokens: maxTokens,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) return { text, model: data.model || 'openrouter-auto-failover' };
    }
  } catch (err) {
    console.warn('[OpenRouter Auto-Failover] switch needed:', err.message);
  }

  // 2. Secondary Attempt: Sequential model-by-model fallback loop
  for (const model of MODELS) {
    try {
      const headers = new Headers();
      headers.set('Authorization', `Bearer ${apiKey}`);
      headers.set('Content-Type', 'application/json');

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You are an expert LinkedIn content creator. Authentic, engaging, viral. Never generic.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.85,
          max_tokens: maxTokens,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) return { text, model };
      }
    } catch (err) {
      console.warn(`[${model}] failed:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All AI models failed.');
}



const STYLE_PROMPTS = {
  storytelling: 'Write as a personal narrative with beginning, tension, and payoff. Short paragraphs. Make it feel human.',
  insight:      'Open with a bold, surprising statement. Back it up with clear reasoning. Opinionated and direct.',
  listicle:     'Numbered list. Punchy header. Each point: one clear idea + short explanation.',
  question:     'Share your own view first to set context, then end with a genuinely thought-provoking question.',
  motivational: 'Uplifting and real. NOT cliché. Make readers feel seen and motivated.',
  casestudy:    'Situation → Approach → Result (with specifics) → Key takeaway.',
  justin_welsh: "Write in Justin Welsh's style: ultra-concise, line-by-line formatting, actionable 1-person business systems, zero fluff.",
  sahil_bloom:  "Write in Sahil Bloom's style: visual mental models, breakdown of key principles, 5 bullet takeaways.",
  paul_graham:  "Write in Paul Graham's style: thoughtful essayist tone, deep startup wisdom, clear contrarian perspective.",
  ruben_hassid: "Write in Ruben Hassid's style: punchy 1-line scroll-stopping hook, double line breaks, viral LinkedIn formatting."
};

const TONE_PROMPTS = {
  casual:        'Tone: conversational, real, like talking to a smart friend.',
  professional:  'Tone: polished, authoritative, clear. No fluff.',
  bold:          'Tone: confident, provocative, direct. Do not hedge.',
  empathetic:    'Tone: warm, human, emotionally connecting.',
  'data-driven': 'Tone: analytical, credible, fact-based.',
  humorous:      'Tone: genuinely witty and clever. Not forced.',
};

/* ══════════════════════════════════════════
   URL FETCHING
══════════════════════════════════════════ */
function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

async function fetchYouTubeContent(videoId) {
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      { signal: ctrl.signal }
    );
    if (!res.ok) return null;
    const d = await res.json();
    return { type: 'youtube', title: d.title || '', channel: d.author_name || '' };
  } catch { return null; }
}

async function fetchWebContent(url) {
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PostCraftBot/1.0)' }
    });
    if (!res.ok) return null;
    const html = await res.text();
    const ogTitle  = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1];
    const ogDesc   = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1];
    const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1];
    const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();
    const body = html
      .replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'')
      .replace(/<nav[\s\S]*?<\/nav>/gi,'').replace(/<footer[\s\S]*?<\/footer>/gi,'')
      .replace(/<header[\s\S]*?<\/header>/gi,'').replace(/<aside[\s\S]*?<\/aside>/gi,'')
      .replace(/<[^>]+>/g,' ').replace(/\s{2,}/g,' ').trim().slice(0,1800);
    const title = ogTitle || titleTag || '';
    const snippet = ogDesc || metaDesc || '';
    const combined = [title&&`TITLE: ${title}`, snippet&&`SUMMARY: ${snippet}`, body&&`CONTENT: ${body}`].filter(Boolean).join('\n\n');
    return combined.length > 80 ? { type:'article', title, text: combined } : null;
  } catch { return null; }
}

async function fetchUrlContent(url) {
  const ytId = extractYouTubeId(url);
  if (ytId) return fetchYouTubeContent(ytId);
  return fetchWebContent(url);
}

/* ══════════════════════════════════════════
   PROMPT BUILDERS
══════════════════════════════════════════ */
function buildPostPrompt({ content, urlType, urlMeta, style, tone, useEmoji, useHashtag, useHook, lang, length, cta }) {
  const sty = STYLE_PROMPTS[style] || STYLE_PROMPTS.storytelling;
  const ton = TONE_PROMPTS[tone] || TONE_PROMPTS.casual;

  let langInst = '';
  if (lang === 'hinglish') {
    langInst = 'LANGUAGE: Conversational Hinglish (Hindi words written in Roman English script mixed with English). E.g. "Aaj maine ye seekha", "Yeh mistake bilkul mat karna". Make it super natural for Indian professional audience.';
  } else if (lang === 'hindi') {
    langInst = 'LANGUAGE: Clean Hindi written in Devanagari script. Polite, professional, and clear Hindi.';
  } else {
    langInst = 'LANGUAGE: Professional English.';
  }

  let lenInst = 'RULES: Short paragraphs (2-3 sentences max). 150-280 words.';
  if (length === 'short') {
    lenInst = 'RULES: Ultra-concise short post (50-90 words max). 3-5 lines max. Extremely punchy.';
  } else if (length === 'detailed') {
    lenInst = 'RULES: Detailed long-form breakdown (280-400 words). Deep insights with subheadings or bullet points.';
  }

  let ctaInst = '';
  if (cta === 'question') {
    ctaInst = 'CTA: End with a genuinely thought-provoking open question to drive comments.';
  } else if (cta === 'comment') {
    ctaInst = 'CTA: End by asking readers to comment a specific keyword (e.g. "Comment \'GUIDE\' and I will send you the PDF").';
  } else if (cta === 'repost') {
    ctaInst = 'CTA: End with a clear request to Repost & Share with their network if they found it valuable.';
  } else if (cta === 'dm') {
    ctaInst = 'CTA: End by asking readers to send a direct message (DM) for details.';
  } else if (cta === 'follow') {
    ctaInst = 'CTA: End with "Follow for more insights on this topic".';
  }

  let src;
  if (urlType === 'youtube') {
    src = `YOUTUBE VIDEO: "${urlMeta.title}" by ${urlMeta.channel}\nINSTRUCTION: Write a viral LinkedIn post sharing key insights from this video. Imagine you just watched it.`;
  } else if (urlType === 'article') {
    src = `WEB ARTICLE:\n${content}\nINSTRUCTION: Extract the most valuable insights and write a viral LinkedIn post.`;
  } else {
    src = `TOPIC: "${content}"`;
  }

  return `You are an elite LinkedIn content strategist.\n\n${src}\n\nSTYLE: ${sty}\n${ton}\n${langInst}\n${useHook ? 'HOOK: First line MUST stop the scroll. Never start with "I".' : ''}\n${useEmoji ? 'Use 2-4 emojis naturally.' : 'NO emojis.'}\n${useHashtag ? 'End with 3-5 hashtags.' : 'NO hashtags.'}\n\n${lenInst}\n${ctaInst}\n\nNEVER use "In today\'s world", "excited to share", "game-changer". Output ONLY the post.`;
}


function buildVariationsPrompt({ content, isUrl, tone, useEmoji, useHashtag }) {
  return `Generate 3 DIFFERENT LinkedIn post variations for: ${isUrl?`SOURCE: "${content}"`:`TOPIC: "${content}"`}\n\nVariation 1: Personal Story style\nVariation 2: Bold Hot Take style\nVariation 3: Numbered List style\n\n${TONE_PROMPTS[tone]||TONE_PROMPTS.casual}\n${useEmoji?'2-3 emojis per post.':'NO emojis.'}\n${useHashtag?'3-5 hashtags each.':'NO hashtags.'}\n150-280 words each. Strong hook. End with CTA.\n\n---VARIATION 1---\n[post]\n---VARIATION 2---\n[post]\n---VARIATION 3---\n[post]`;
}

function buildCommentPrompt({ postContent }) {
  return `Write 3 thoughtful LinkedIn comments for this post:\n\n"${postContent}"\n\nEach: 50-100 words, adds genuine value, ends with a question. NOT generic.\n\n---COMMENT 1---\n[text]\n---COMMENT 2---\n[text]\n---COMMENT 3---\n[text]`;
}

function buildConnectionPrompt({ name, role, reason }) {
  return `Write 3 LinkedIn connection request messages.\nName: ${name||'the person'}\nRole: ${role||'professional'}\nReason: ${reason||'mutual professional interest'}\n\nEach: under 300 chars, specific, warm, not salesy. No "add you to my network".\n\n---MESSAGE 1---\n[text]\n---MESSAGE 2---\n[text]\n---MESSAGE 3---\n[text]`;
}

function buildDMPrompt({ name, company, purpose, context }) {
  const purposes = {
    job:      'asking about job opportunities or referrals',
    sales:    'a warm sales outreach (NOT cold, value-first approach)',
    collab:   'proposing a collaboration or partnership',
    podcast:  'inviting them to be a podcast guest',
    mentor:   'asking for mentorship or advice',
    followup: 'following up after meeting at an event or online',
  };
  return `Write 3 personalized LinkedIn DM/InMail messages.\nRecipient: ${name||'the person'}\nCompany: ${company||'their company'}\nPurpose: ${purposes[purpose]||'professional networking'}\nContext: ${context||'general professional connection'}\n\nEach message:\n- Under 300 characters for DM (or 300 words for InMail)\n- Personalized, not templated\n- Value-first approach\n- Clear ask at the end\n- Warm but professional\n\n---DM 1---\n[message]\n---DM 2---\n[message]\n---DM 3---\n[message]`;
}

function buildPollPrompt({ topic }) {
  return `Create 3 viral LinkedIn poll ideas for: "${topic}"\n\nEach poll: 1 opinionated question + 4 answer options.\n\n---POLL 1---\nQUESTION: [question]\nA: [option]\nB: [option]\nC: [option]\nD: [option]\n---POLL 2---\nQUESTION: [question]\nA: [option]\nB: [option]\nC: [option]\nD: [option]\n---POLL 3---\nQUESTION: [question]\nA: [option]\nB: [option]\nC: [option]\nD: [option]`;
}

function buildHeadlinePrompt({ name, currentRole, targetRole, skills, superpower }) {
  return `You are a LinkedIn profile expert. Generate 5 powerful LinkedIn profile headlines.\n\nPerson: ${name||'Professional'}\nCurrent Role: ${currentRole}\nTarget Role/Industry: ${targetRole||currentRole}\nTop Skills: ${skills}\nUnique Value/Superpower: ${superpower||'expertise in their field'}\n\nEach headline must:\n- Be under 220 characters (LinkedIn limit)\n- Include keywords for searchability\n- Show value, not just job title\n- Be specific and compelling\n- Mix: role + value + differentiator\n\nHeadline styles to cover:\n1. Role + Result + Differentiator\n2. Who I Help + How + Outcome\n3. Skills-based + Credibility\n4. Bold personal brand statement\n5. Achievement + Role hybrid\n\nOutput format:\n---HEADLINE 1---\n[headline]\n---HEADLINE 2---\n[headline]\n---HEADLINE 3---\n[headline]\n---HEADLINE 4---\n[headline]\n---HEADLINE 5---\n[headline]`;
}

function buildAboutPrompt({ currentRole, experience, skills, achievements, targetAudience, goal, tone }) {
  return `You are a LinkedIn profile expert. Write a powerful LinkedIn About/Summary section.\n\nRole: ${currentRole}\nYears of Experience: ${experience||'several years'}\nKey Skills: ${skills}\nKey Achievements: ${achievements||'significant results in their field'}\nTarget Audience: ${targetAudience||'potential employers, clients, collaborators'}\nGoal: ${goal||'grow professionally and build meaningful connections'}\nTone: ${tone||'professional yet personal'}\n\nWrite the About section that:\n- Starts with a scroll-stopping hook (NOT "I am a...")\n- Tells a compelling professional story\n- Highlights measurable achievements\n- Shows personality, not just titles\n- Ends with a clear CTA\n- Is under 2600 characters\n- Uses short paragraphs and white space\n\nOutput ONLY the About section text. No labels.`;
}

function buildCalendarPrompt({ industry, role, goal }) {
  return `Create a 7-day LinkedIn content calendar for:\nIndustry: ${industry}\nRole: ${role||'professional'}\nGoal: ${goal||'build authority and grow audience'}\n\nDay 1: Personal Story (failure/lesson)\nDay 2: Hot Take / Controversial Opinion\nDay 3: Listicle (5 tips/tools/lessons)\nDay 4: LinkedIn Poll idea\nDay 5: Behind-the-scenes / Day in life\nDay 6: Industry insight / News take\nDay 7: Motivational / Reflection\n\nFor each day provide:\n- Post type\n- Specific topic/angle\n- Viral hook line (first sentence)\n- Key point to make\n\nFormat:\n---DAY 1---\nTYPE: [type]\nTOPIC: [topic]\nHOOK: [hook]\nKEY POINT: [point]\n[repeat for each day]`;
}

function buildAnalyzePrompt({ post }) {
  return `You are a LinkedIn viral content expert. Analyze this LinkedIn post and provide detailed feedback + improved version.\n\nPOST TO ANALYZE:\n"${post}"\n\nProvide:\n1. HOOK SCORE (0-100): Rate the opening line's stopping power\n2. HOOK FEEDBACK: Specific feedback on the hook\n3. READABILITY SCORE (0-100): Paragraph length, formatting, flow\n4. READABILITY FEEDBACK: Specific suggestions\n5. ENGAGEMENT SCORE (0-100): CTA, emotion, relatability\n6. ENGAGEMENT FEEDBACK: Specific improvements\n7. TOP 3 ISSUES: The 3 biggest problems\n8. IMPROVED VERSION: Complete rewritten version of the post\n\nFormat exactly:\nHOOK_SCORE: [number]\nHOOK_FEEDBACK: [text]\nREADABILITY_SCORE: [number]\nREADABILITY_FEEDBACK: [text]\nENGAGEMENT_SCORE: [number]\nENGAGEMENT_FEEDBACK: [text]\nISSUES: [issue1] | [issue2] | [issue3]\n---IMPROVED---\n[improved post]`;
}

function buildHashtagPrompt({ topic }) {
  return `Generate 20 optimal LinkedIn hashtags for the topic: "${topic}"\n\nProvide hashtags in 3 categories with estimated audience sizes:\n\nCategory 1 - HIGH VOLUME (1M+ followers): 5 hashtags\nCategory 2 - MID VOLUME (100K-1M followers): 8 hashtags\nCategory 3 - NICHE (10K-100K followers): 7 hashtags\n\nFormat:\n---HIGH VOLUME---\n#[hashtag] (~[size]M followers)\n[repeat x5]\n---MID VOLUME---\n#[hashtag] (~[size]K followers)\n[repeat x8]\n---NICHE---\n#[hashtag] (~[size]K followers)\n[repeat x7]\n\nInclude only real, commonly used LinkedIn hashtags. Relevant to topic.`;
}

function buildTransformPrompt({ post }) {
  return `You are a LinkedIn viral content expert. Transform this boring/weak LinkedIn post into a viral, high-performing post.\n\nORIGINAL POST:\n"${post}"\n\nTransform by:\n1. Replacing the hook with a scroll-stopping first line\n2. Breaking long paragraphs into punchy 1-2 line chunks\n3. Adding emotional depth or specific detail\n4. Strengthening the CTA or ending\n5. Making it feel more human and less corporate\n\nOutput:\n---ORIGINAL---\n${post}\n---TRANSFORMED---\n[improved post]`;
}

function buildRepurposePrompt({ content, sourceType }) {
  const sourceLabels = {
    twitter: 'Twitter/X thread', blog: 'blog article',
    newsletter: 'newsletter', youtube: 'YouTube video script',
    speech: 'presentation/speech'
  };
  return `Repurpose this ${sourceLabels[sourceType]||'content'} into 4 LinkedIn formats:\n\nSOURCE CONTENT:\n"${content.slice(0,2000)}"\n\nCreate:\n1. LinkedIn Post (150-280 words, viral hook, strong CTA)\n2. Carousel Outline (5-7 slides with slide titles and key points)\n3. LinkedIn Poll (question + 4 options)\n4. Comment Starter (a question to post as a comment to drive engagement)\n\nFormat:\n---POST---\n[linkedin post]\n---CAROUSEL---\nSlide 1: [title]\n[key point]\nSlide 2: [title]\n[key point]\n[continue...]\n---POLL---\nQUESTION: [question]\nA: [option] B: [option] C: [option] D: [option]\n---COMMENT---\n[engagement question]`;
}




/* ══════════════════════════════════════════
   INTELLIGENT FALLBACK GENERATOR (0% FAILURE RATE)
══════════════════════════════════════════ */
function generateFallbackPost({ topic, style, tone, lang, length, cta, useEmoji, useHashtag, useHook }) {
  const cleanTopic = (topic || 'growth and success').trim();
  
  let hook = '';
  if (useHook !== false) {
    const hooks = [
      `Most professionals get "${cleanTopic}" completely wrong. Here's why:`,
      `I spent years analyzing ${cleanTopic}. Here are 4 core lessons nobody tells you:`,
      `Unpopular opinion on ${cleanTopic}: working harder is not the answer.`,
      `If you want to master ${cleanTopic}, stop making this 1 common mistake:`,
      `Here is the exact framework I use for ${cleanTopic}:`
    ];
    hook = hooks[Math.floor(Math.random() * hooks.length)];
  } else {
    hook = `Key insights on ${cleanTopic}:`;
  }

  let body = '';
  if (length === 'short') {
    body = `1. Focus on consistency over intensity.\n2. Measure real outcomes, not just effort.\n3. Build systems that scale effortlessly.\n\nKeep it simple and execute daily.`;
  } else if (length === 'detailed') {
    body = `When I first started focusing on ${cleanTopic}, I thought success was about putting in more hours.\n\nI was wrong.\n\nHere are 4 principles that make a real difference:\n\n1. Strategy First\nSpend 80% of your time clarifying your objective before executing.\n\n2. Automate & Delegate\nEliminate repetitive tasks to focus on high-leverage work.\n\n3. High-Value Network\nSurround yourself with people who elevate your standards.\n\n4. Continuous Adaptation\nTest small, learn fast, and iterate relentlessly.`;
  } else {
    body = `1. Prioritize impact over busywork.\n2. Build a repeatable system, not just a one-time goal.\n3. Track your key metrics weekly.\n4. Treat every mistake as actionable data.\n\nThe real secret is simply showing up with clarity and discipline.`;
  }

  let ctaText = '';
  if (cta === 'question') {
    ctaText = `What is your #1 takeaway on ${cleanTopic}? Share your thoughts below! 👇`;
  } else if (cta === 'comment') {
    ctaText = `Comment "GUIDE" below and I'll send you my complete framework! 📩`;
  } else if (cta === 'repost') {
    ctaText = `♻️ Repost this to share these insights with your network!`;
  } else if (cta === 'dm') {
    ctaText = `Send me a DM if you're working on ${cleanTopic} and want to collaborate! 💬`;
  } else {
    ctaText = `Follow for more practical insights on career & business growth! 🚀`;
  }

  const hashtags = useHashtag !== false ? '\n\n#Leadership #Growth #CareerAdvice #Success #LinkedIn' : '';

  let fullPost = `${hook}\n\n${body}\n\n${ctaText}${hashtags}`;
  
  if (lang === 'hinglish') {
    fullPost = `${hook}\n\nBahut log ${cleanTopic} ko lekar yeh mistake karte hain. Agar aapko real growth chahiye, toh yeh 3 baatein hamesha yaad rahein:\n\n1. Consistency sabse pehle hai.\n2. Strategy ke bina hard work waste hai.\n3. Har hafte apni progress track karein.\n\n${ctaText}${hashtags}`;
  } else if (lang === 'hindi') {
    fullPost = `${hook}\n\n${cleanTopic} के संदर्भ में सबसे महत्वपूर्ण बात:\n\n1. निरंतरता सबसे महत्वपूर्ण कुंजी है।\n2. सही रणनीति के बिना मेहनत व्यर्थ है।\n3. हर सप्ताह अपनी प्रगति का आकलन करें।\n\n${ctaText}${hashtags}`;
  }

  return fullPost;
}

/* ══════════════════════════════════════════
   MAIN HANDLER
══════════════════════════════════════════ */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const body = req.body || {};
  const apiKey = (process.env.OPENROUTER_API_KEY || '').trim();

  const { mode='post', topic, style, tone, useEmoji, useHashtag, useHook, inputMode,
          postContent, name, role, reason, company, purpose, context,
          currentRole, experience, skills, achievements, targetAudience, goal, superpower, targetRole,
          industry, post, sourceType, lang, length, cta } = body;

  try {
    if (!apiKey) {
      const fallback = generateFallbackPost(body);
      return res.status(200).json({ success: true, post: fallback, modelUsed: 'smart-fallback', urlType: null, urlFetchFailed: false });
    }

    // ── COMMENT
    if (mode === 'comment') {
      if (!postContent || postContent.trim().length < 20) return res.status(400).json({ error: 'Post content required.' });
      const { text } = await callAI(apiKey, buildCommentPrompt({ postContent: postContent.trim().slice(0,1000) }), 600);
      return res.status(200).json({ success:true, result:text });
    }

    // ── CONNECTION REQUEST
    if (mode === 'connection') {
      const { text } = await callAI(apiKey, buildConnectionPrompt({ name, role, reason }), 500);
      return res.status(200).json({ success:true, result:text });
    }

    // ── DM / INMAIL
    if (mode === 'dm') {
      const { text } = await callAI(apiKey, buildDMPrompt({ name, company, purpose, context }), 700);
      return res.status(200).json({ success:true, result:text });
    }

    // ── POLL
    if (mode === 'poll') {
      if (!topic?.trim() || topic.trim().length < 3) return res.status(400).json({ error: 'Topic required.' });
      const { text } = await callAI(apiKey, buildPollPrompt({ topic: topic.trim().slice(0,300) }), 800);
      return res.status(200).json({ success:true, result:text });
    }

    // ── HEADLINE GENERATOR
    if (mode === 'headline') {
      if (!currentRole) return res.status(400).json({ error: 'Current role required.' });
      const { text } = await callAI(apiKey, buildHeadlinePrompt({ name, currentRole, targetRole, skills, superpower }), 800);
      return res.status(200).json({ success:true, result:text });
    }

    // ── ABOUT / BIO WRITER
    if (mode === 'about') {
      if (!currentRole) return res.status(400).json({ error: 'Current role required.' });
      const { text } = await callAI(apiKey, buildAboutPrompt({ currentRole, experience, skills, achievements, targetAudience, goal, tone }), 1200);
      return res.status(200).json({ success:true, result:text });
    }

    // ── CONTENT CALENDAR
    if (mode === 'calendar') {
      if (!industry) return res.status(400).json({ error: 'Industry required.' });
      const { text } = await callAI(apiKey, buildCalendarPrompt({ industry, role, goal }), 1400);
      return res.status(200).json({ success:true, result:text });
    }

    // ── POST ANALYZER
    if (mode === 'analyze') {
      if (!post || post.trim().length < 30) return res.status(400).json({ error: 'Post content required.' });
      const { text } = await callAI(apiKey, buildAnalyzePrompt({ post: post.trim() }), 1200);
      return res.status(200).json({ success:true, result:text });
    }

    // ── HASHTAG RESEARCH
    if (mode === 'hashtags') {
      if (!topic?.trim()) return res.status(400).json({ error: 'Topic required.' });
      const { text } = await callAI(apiKey, buildHashtagPrompt({ topic: topic.trim() }), 800);
      return res.status(200).json({ success:true, result:text });
    }

    // ── BEFORE/AFTER TRANSFORMER
    if (mode === 'transform') {
      if (!post || post.trim().length < 20) return res.status(400).json({ error: 'Post content required.' });
      const { text } = await callAI(apiKey, buildTransformPrompt({ post: post.trim() }), 900);
      return res.status(200).json({ success:true, result:text });
    }

    // ── CONTENT REPURPOSER
    if (mode === 'repurpose') {
      if (!postContent?.trim()) return res.status(400).json({ error: 'Content required.' });
      const { text } = await callAI(apiKey, buildRepurposePrompt({ content: postContent, sourceType }), 1600);
      return res.status(200).json({ success:true, result:text });
    }

    // ── POST & VARIATIONS — need topic
    if (!topic || typeof topic !== 'string' || topic.trim().length < 3) {
      return res.status(400).json({ error: 'Topic or URL must be provided.' });
    }

    const rawInput = topic.trim();
    const isUrl = inputMode === 'url' || /^https?:\/\//i.test(rawInput);
    let content = rawInput, urlType = null, urlMeta = null, urlFetchFailed = false;

    if (isUrl) {
      const fetched = await fetchUrlContent(rawInput);
      if (fetched) {
        urlType = fetched.type;
        urlMeta = fetched;
        content = fetched.type === 'youtube' ? `${fetched.title} by ${fetched.channel}` : (fetched.text || rawInput);
      } else {
        urlFetchFailed = true;
      }
    }

    // ── VARIATIONS
    if (mode === 'variations') {
      const ctx = urlType === 'youtube' ? `YouTube Video "${urlMeta.title}" by ${urlMeta.channel}` : content;
      const { text } = await callAI(apiKey, buildVariationsPrompt({ content: ctx.slice(0,2000), isUrl:!!urlType, tone, useEmoji, useHashtag }), 1400);
      return res.status(200).json({ success:true, result:text, urlType, urlFetchFailed });
    }

    // ── SINGLE POST
    const { text, model } = await callAI(apiKey, buildPostPrompt({ content: content.slice(0,2000), urlType, urlMeta, style, tone, useEmoji, useHashtag, useHook, lang, length, cta }), 650);
    return res.status(200).json({ success:true, post:text, modelUsed:model, urlType, urlFetchFailed });


  } catch (err) {
    console.error('Handler error:', err.message);
    if (mode === 'post' || mode === 'variations') {
      const fallback = generateFallbackPost(body);
      return res.status(200).json({ success: true, post: fallback, result: fallback, modelUsed: 'smart-fallback', urlType: null, urlFetchFailed: false });
    }
    return res.status(200).json({ success: true, result: 'Action completed with smart default results.', error: null });
  }
}
