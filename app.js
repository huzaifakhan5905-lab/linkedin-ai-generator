/* ══════════════════════════════════════════
   PostCraft AI — app.js (EasyGen Level Features)
══════════════════════════════════════════ */

const CONFIG = {
  OPENROUTER_KEY: 'your_openrouter_api_key_here',
  MODELS: [
    'inclusionai/ling-3.0-flash:free',
    'poolside/laguna-s-2.1:free',
    'poolside/laguna-xs-2.1:free',
    'google/gemini-2.0-flash-exp:free',
    'meta-llama/llama-3.1-8b-instruct:free',
    'deepseek/deepseek-r1:free',
    'qwen/qwen-2.5-coder-32b-instruct:free'
  ],
};

/* ══════════════════════════════════════════
   TEMPLATES
══════════════════════════════════════════ */
const TEMPLATES = [
  { emoji:'🚀', title:'Career Win',       style:'storytelling', tone:'casual',       desc:'Promotion ya bada achievement share karo',   prompt:'I recently got promoted / achieved a major career milestone and want to share the journey and lessons learned with my network' },
  { emoji:'💡', title:'Industry Hot Take', style:'insight',      tone:'bold',         desc:'Controversial opinion jo debate shuru kare',  prompt:'Controversial opinion: most people in my industry are doing a very common thing completely wrong and here is why they are missing the point' },
  { emoji:'📋', title:'Lessons Learned',  style:'listicle',     tone:'professional', desc:'5 cheezein jo kash pehle pata hoti',          prompt:'5 things I wish someone had told me when I first started my career — lessons I had to learn the hard way over years of mistakes' },
  { emoji:'📊', title:'Real Results',     style:'casestudy',    tone:'data-driven',  desc:'Numbers ke saath real story',                prompt:'We went from zero to a significant number of customers and revenue in a short timeframe using one specific strategy. Here is exactly what we did step by step' },
  { emoji:'🙋', title:'Engagement Post',  style:'question',     tone:'casual',       desc:'Comments drive karo genuine question se',    prompt:'I am genuinely curious what other professionals think about this trending and often debated topic in my industry — what has been your personal experience' },
  { emoji:'🧠', title:'Learning Aloud',   style:'storytelling', tone:'empathetic',   desc:'Jo seekh rahe ho woh share karo',            prompt:'I am currently learning a new and challenging skill in public and sharing my raw unfiltered experience — here is what I have discovered so far and what truly surprised me' },
  { emoji:'😅', title:'Failure Story',    style:'storytelling', tone:'empathetic',   desc:'Vulnerability drives highest engagement',    prompt:'I failed very publicly at something I was confident about — here is exactly what happened, what went wrong, and the most important lessons I took away from it' },
  { emoji:'🔥', title:'Productivity Hack',style:'listicle',     tone:'bold',         desc:'Tools ya habits jo game-changer hain',       prompt:'The three specific tools and daily habits that have completely transformed my productivity this year and why most people overlook them entirely' },
];

const STYLE_PROMPTS = {
  storytelling: 'Write as a personal narrative with beginning, tension, and payoff. Short paragraphs. Make it feel human.',
  insight:      'Open with a bold, surprising statement. Back it up with clear reasoning. Opinionated and direct.',
  listicle:     'Numbered list. Punchy header. Each point: one clear idea + short explanation.',
  question:     'Share your own view first to set context, then end with a genuinely thought-provoking question.',
  motivational: 'Uplifting and real. NOT cliché. Make readers feel seen and motivated.',
  casestudy:    'Situation → Approach → Result (with specifics) → Key takeaway.',
  justin_welsh: "Write in Justin Welsh's style: ultra-concise, line-by-line formatting, actionable solopreneur frameworks, zero fluff.",
  sahil_bloom:  "Write in Sahil Bloom's style: visual mental models, breakdown of key principles, high leverage storytelling with bullet takeaways.",
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

/* ══════════════════════════════════════════
   STATE
══════════════════════════════════════════ */
const S = {
  style:     'storytelling',
  post:      '',
  inputMode: 'topic', // 'topic' or 'url'
};

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  renderTemplates();
  initChips();
  initTextareaCounter();
});

/* ── INPUT MODE SWITCHER (TOPIC VS YOUTUBE/URL) ─────── */
function switchInputMode(mode) {
  S.inputMode = mode;
  const isTopic = mode === 'topic';
  document.getElementById('tabModeTopic')?.classList.toggle('pay-tab--active', isTopic);
  document.getElementById('tabModeUrl')?.classList.toggle('pay-tab--active', !isTopic);

  const lbl = document.getElementById('inputLabel');
  const ta  = document.getElementById('topicInput');
  if (lbl) lbl.textContent = isTopic ? 'What do you want to post about?' : 'Paste YouTube Video or Web Article URL:';
  if (ta)  ta.placeholder = isTopic
    ? "e.g. 'I got promoted after 3 years of grinding...' or 'Hot take on remote work'"
    : "e.g. 'https://youtube.com/watch?v=...' or 'https://medium.com/article-slug'";
}

/* ── CREATOR PRESET SELECTION ────────────────────────── */
function selectCreatorStyle(creatorKey) {
  S.style = creatorKey;
  document.querySelectorAll('#creatorChips .chip, #styleChips .chip').forEach(c => {
    const active = c.dataset.style === creatorKey;
    c.classList.toggle('chip--on', active);
    c.setAttribute('aria-checked', active ? 'true' : 'false');
  });
  toast(`⚡ Selected Creator Preset: ${creatorKey.replace('_',' ').toUpperCase()}`, 'ok');
}

/* ── CHIPS ───────────────────────────────────────────── */
function initChips() {
  document.getElementById('styleChips')?.querySelectorAll('.chip').forEach(c => {
    c.addEventListener('click', () => {
      document.querySelectorAll('#creatorChips .chip, #styleChips .chip').forEach(x => {
        x.classList.remove('chip--on'); x.setAttribute('aria-checked','false');
      });
      c.classList.add('chip--on'); c.setAttribute('aria-checked','true');
      S.style = c.dataset.style;
    });
  });
}

/* ── TEXTAREA COUNTER ────────────────────────────────── */
function initTextareaCounter() {
  const ta = document.getElementById('topicInput');
  const cc = document.getElementById('charCount');
  if (!ta || !cc) return;
  ta.addEventListener('input', () => {
    if (ta.value.length > 500) ta.value = ta.value.slice(0,500);
    cc.textContent = `${ta.value.length} / 500`;
  });
}

/* ── TEMPLATES ───────────────────────────────────────── */
function renderTemplates() {
  const g = document.getElementById('templatesGrid');
  if (!g) return;
  g.innerHTML = TEMPLATES.map((t,i) => `
    <button class="tcard" onclick="useTemplate(${i})">
      <span class="tcard__emoji">${t.emoji}</span>
      <div class="tcard__title">${t.title}</div>
      <div class="tcard__desc">${t.desc}</div>
      <div class="tcard__cta">Use this template →</div>
    </button>`).join('');
}

function useTemplate(i) {
  const t = TEMPLATES[i];
  if (!t) return;
  switchInputMode('topic');
  document.getElementById('topicInput').value = t.prompt;
  document.getElementById('toneSelect').value = t.tone;
  document.getElementById('charCount').textContent = `${t.prompt.length} / 500`;
  S.style = t.style;
  document.querySelectorAll('.chip').forEach(c => {
    const on = c.dataset.style === t.style;
    c.classList.toggle('chip--on', on);
    c.setAttribute('aria-checked', on ? 'true' : 'false');
  });
  document.getElementById('generator')?.scrollIntoView({ behavior:'smooth', block:'start' });
  toast('✓ Template applied!', 'ok');
}

/* ══════════════════════════════════════════
   GENERATE (100% FREE & UNLIMITED)
══════════════════════════════════════════ */
async function generatePost() {
  const topic = document.getElementById('topicInput')?.value?.trim();

  if (!topic || topic.length < 5) {
    toast('⚠️ Please enter your topic or URL link', 'err');
    document.getElementById('topicInput')?.focus();
    return;
  }

  const tone     = document.getElementById('toneSelect')?.value || 'casual';
  const useEmoji = document.getElementById('useEmoji')?.checked ?? true;
  const useHashtag  = document.getElementById('useHashtag')?.checked ?? true;
  const useHook  = document.getElementById('useHook')?.checked ?? true;

  setBusy(true);
  try {
    const post = await callAI({ topic, style: S.style, tone, useEmoji, useHashtag, useHook, inputMode: S.inputMode });
    S.post = post;
    renderResult(post);
    toast('✓ Content generated!', 'ok');
  } catch(e) {
    console.error('Generation failed:', e);
    toast(`⚠️ Error: ${e.message || 'Generation failed'}`, 'err');
  } finally {
    setBusy(false);
  }
}

/* ── SMART API CALL (Serverless with Direct Fallback) ── */
async function callAI(payload) {
  if (window.location.protocol.startsWith('http')) {
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.post) return data.post;
      }
    } catch (e) {
      console.warn('Serverless API unavailable, falling back to direct API...', e);
    }
  }

  return callDirectOpenRouter(payload);
}

async function callDirectOpenRouter(payload) {
  const { topic, style, tone, useEmoji, useHashtag, useHook, inputMode } = payload;
  const cleanInput = topic.trim().slice(0, 500);
  const styleInstruction = STYLE_PROMPTS[style] || STYLE_PROMPTS.storytelling;
  const toneInstruction = TONE_PROMPTS[tone] || TONE_PROMPTS.casual;
  const isUrlMode = inputMode === 'url' || /^https?:\/\//i.test(cleanInput);

  const prompt = `You are an elite LinkedIn content strategist. Write a high-performing LinkedIn post.

${isUrlMode ? `LINK/URL SOURCE: "${cleanInput}"
INSTRUCTION: Extract core message/insights from this link topic and write a viral LinkedIn post.` : `TOPIC: "${cleanInput}"`}
STYLE & CREATOR FRAMEWORK: ${styleInstruction}
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
  const cleanKey = CONFIG.OPENROUTER_KEY.trim();

  for (const model of CONFIG.MODELS) {
    try {
      const headers = new Headers();
      headers.set('Authorization', `Bearer ${cleanKey}`);
      headers.set('Content-Type', 'application/json');
      headers.set('HTTP-Referer', window.location.href);
      headers.set('X-Title', 'PostCraft AI');

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: headers,
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

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(`${res.status}: ${errData.error?.message || res.statusText}`);
      }

      const data = await res.json();
      const postText = data.choices?.[0]?.message?.content?.trim();
      if (postText) return postText;
    } catch (err) {
      console.warn(`Direct model attempt [${model}] failed:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All AI models failed to respond.');
}

/* ── RENDER RESULT ───────────────────────────────────── */
function renderResult(post) {
  document.getElementById('emptyState').style.display = 'none';
  const result = document.getElementById('result');
  result.style.display = 'flex';

  document.getElementById('postPreview').innerHTML =
    post.split('\n').map(l => l.trim() === '' ? '<br>' : `<span>${esc(l)}</span>`).join('\n');

  document.getElementById('reactions').textContent = rnd(80,450);
  document.getElementById('comments').textContent  = rnd(12,70);

  const shareBtn = document.getElementById('liShareBtn');
  if (shareBtn) shareBtn.href = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(post)}`;

  setTimeout(() => calcScores(post), 280);
  result.scrollIntoView({ behavior:'smooth', block:'nearest' });
}

/* ── CAROUSEL GENERATOR (EASYGEN LEVEL FEATURE) ──────── */
function openCarouselModal() {
  if (!S.post) return;
  const container = document.getElementById('carouselSlidesContainer');
  if (!container) return;

  // Split post into 4-5 slides
  const lines = S.post.split('\n').filter(l => l.trim() !== '');
  const hook = lines[0] || 'Viral Insight';
  const bodyParagraphs = lines.slice(1, -1);
  const cta = lines[lines.length - 1] || 'Follow for more insights!';

  // Group paragraphs into 3-4 slides
  const slideContents = [
    { title: 'HOOK SLIDE', text: hook },
  ];

  let currentChunk = '';
  bodyParagraphs.forEach((p, idx) => {
    currentChunk += (currentChunk ? '\n\n' : '') + p;
    if (currentChunk.length > 120 || idx === bodyParagraphs.length - 1) {
      slideContents.push({ title: `KEY TAKEAWAY #${slideContents.length}`, text: currentChunk });
      currentChunk = '';
    }
  });

  slideContents.push({ title: 'ACTION / SUMMARY', text: cta });

  // Render HTML slides
  container.innerHTML = slideContents.map((s, idx) => `
    <div class="carousel-slide">
      <div class="carousel-slide__num">Slide ${idx + 1} / ${slideContents.length}</div>
      <div class="carousel-slide__text">${esc(s.text)}</div>
      <div class="carousel-slide__foot">
        <span>PostCraft AI</span>
        <span>Swipe ➔</span>
      </div>
    </div>
  `).join('');

  document.getElementById('carouselOverlay').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeCarouselModal() {
  document.getElementById('carouselOverlay').style.display = 'none';
  document.body.style.overflow = '';
}

function printCarouselPdf() {
  // Get slide data from existing preview container
  const slides = document.querySelectorAll('#carouselSlidesContainer .carousel-slide');
  if (!slides.length) return;

  // Build structured slide data
  const slideData = [];
  slides.forEach((slide, idx) => {
    const num  = slide.querySelector('.carousel-slide__num')?.textContent || `Slide ${idx + 1}`;
    const text = slide.querySelector('.carousel-slide__text')?.textContent || '';
    slideData.push({ num, text, index: idx + 1, total: slides.length });
  });

  // Remove any stale print area
  const old = document.getElementById('carouselPrintArea');
  if (old) old.remove();

  // Create print-only container
  const printArea = document.createElement('div');
  printArea.id = 'carouselPrintArea';
  printArea.style.cssText = 'display:none;';

  const colors = [
    'linear-gradient(135deg,#0A1628 0%,#0D1533 100%)',
    'linear-gradient(135deg,#100E2A 0%,#1A1050 100%)',
    'linear-gradient(135deg,#0A2010 0%,#0F2E18 100%)',
    'linear-gradient(135deg,#1A0A28 0%,#2A0E40 100%)',
    'linear-gradient(135deg,#1A1400 0%,#2A2000 100%)',
  ];
  const accents = ['#0A84FF','#A78BFA','#30D158','#C084FC','#F5A623'];

  slideData.forEach((slide, i) => {
    const bg     = colors[i % colors.length];
    const accent = accents[i % accents.length];

    const div = document.createElement('div');
    div.className = 'carousel-print-slide';
    div.style.cssText = `background:${bg};`;
    div.innerHTML = `
      <div class="carousel-print-slide__brand" style="color:${accent}">PostCraft AI</div>
      <div class="carousel-print-slide__number" style="color:${accent}80">${slide.num}</div>
      <div class="carousel-print-slide__text">${esc(slide.text)}</div>
      <div class="carousel-print-slide__footer">
        <span class="carousel-print-slide__logo">PostCraft AI · Free LinkedIn Generator</span>
      </div>
    `;
    printArea.appendChild(div);
  });

  document.body.appendChild(printArea);

  // Print then clean up
  setTimeout(() => {
    window.print();
    setTimeout(() => {
      const area = document.getElementById('carouselPrintArea');
      if (area) area.remove();
    }, 1500);
  }, 80);
}

/* ── SCORES & COPY ───────────────────────────────────── */
function calcScores(text) {
  const words  = text.split(/\s+/).length;
  const lines  = text.split('\n').filter(l=>l.trim());
  const first  = lines[0] || '';
  const hasQ   = text.includes('?');
  const hasH   = /#\w+/.test(text);
  const hasE   = /\p{Emoji}/u.test(text);
  const avgLen = lines.reduce((s,l)=>s+l.length,0) / (lines.length||1);

  const hook = cap(60 + (first.length>28?14:0) + (!first.startsWith('I ')?10:0) + (first.includes('!')||first.includes('?')?11:0), 96);
  const read = cap(52 + (avgLen<80?24:8) + (lines.length>4?14:4) + (words<280?10:0), 97);
  const eng  = cap(55 + (hasQ?15:0) + (hasH?12:0) + (hasE?8:0) + (words>100?10:0), 96);

  setScore('hookFill','hookNum', hook);
  setScore('readFill','readNum', read);
  setScore('engFill', 'engNum',  eng);
}

function setScore(fillId, numId, val) {
  const fill = document.getElementById(fillId);
  const num  = document.getElementById(numId);
  if (fill) {
    fill.style.width = '0%';
    setTimeout(()=>{ fill.style.width = val+'%'; }, 40);
    fill.style.background = val>=80
      ? 'linear-gradient(90deg,#30D158,#34D399)'
      : val>=60
        ? 'linear-gradient(90deg,#0A84FF,#5E5CE6)'
        : 'linear-gradient(90deg,#F5A623,#FF6B35)';
  }
  if (num) num.textContent = val+'%';
}

async function copyPost() {
  if (!S.post) return;
  try {
    await navigator.clipboard.writeText(S.post);
    const btn = document.getElementById('copyBtn');
    if (btn) { const t = btn.textContent; btn.textContent = '✓ Copied!'; setTimeout(()=>btn.textContent=t, 2000); }
    toast('✓ Copied to clipboard!', 'ok');
  } catch { toast('⚠️ Copy failed — select text manually', 'err'); }
}

function setBusy(on) {
  const btn  = document.getElementById('generateBtn');
  const txt  = document.getElementById('genBtnText');
  const icn  = document.getElementById('genBtnIcon');
  const spin = document.getElementById('spinner');
  if (btn)  btn.disabled  = on;
  if (txt)  txt.textContent = on ? 'Generating...' : 'Generate Free Post';
  if (icn)  icn.style.display = on ? 'none' : 'inline';
  if (spin) spin.style.display = on ? 'inline-block' : 'none';
}

/* ══════════════════════════════════════════
   UTILS
══════════════════════════════════════════ */
let toastTid;
function toast(msg, type='') {
  const el = document.getElementById('toast');
  if (!el) return;
  clearTimeout(toastTid);
  el.textContent = msg;
  el.className = 'toast' + (type ? ` toast-${type}` : '');
  el.style.display = 'block';
  toastTid = setTimeout(() => el.style.display='none', 4200);
}

function esc(s) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(s));
  return d.innerHTML;
}
function rnd(a,b) { return Math.floor(Math.random()*(b-a+1))+a; }
function cap(v,max) { return Math.min(v,max); }

document.addEventListener('keydown', e => {
  if ((e.ctrlKey||e.metaKey) && e.key==='Enter') { e.preventDefault(); generatePost(); }
});
