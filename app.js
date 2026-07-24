/* ══════════════════════════════════════════
   PostCraft AI — app.js
   Bugs Fixed + 5 New Features Added
══════════════════════════════════════════ */

const CONFIG = {
  OPENROUTER_KEY: 'your_openrouter_api_key_here',
  MODELS: [
    'google/gemini-2.0-flash-exp:free',
    'meta-llama/llama-3.1-8b-instruct:free',
    'inclusionai/ling-3.0-flash:free',
    'deepseek/deepseek-r1:free',
    'qwen/qwen-2.5-coder-32b-instruct:free',
    'poolside/laguna-s-2.1:free',
    'poolside/laguna-xs-2.1:free',
  ],
  HISTORY_KEY: 'postcraft_history_v2',
  LI_CHAR_LIMIT: 3000,
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
  inputMode: 'topic',
};

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  renderTemplates();
  initChips();
  initTextareaCounter();
  updateHistoryBadge();
});

/* ── INPUT MODE SWITCHER ─────────────────────────────── */
function switchInputMode(mode) {
  S.inputMode = mode;
  const isTopic = mode === 'topic';
  document.getElementById('tabModeTopic')?.classList.toggle('pay-tab--active', isTopic);
  document.getElementById('tabModeUrl')?.classList.toggle('pay-tab--active', !isTopic);

  const lbl = document.getElementById('inputLabel');
  const ta  = document.getElementById('topicInput');
  if (lbl) lbl.textContent = isTopic ? 'What do you want to post about?' : 'Paste YouTube Video or Web Article URL:';
  if (ta)  ta.placeholder = isTopic
    ? "e.g. 'I got promoted after 3 years...' or 'Hot take on remote work'"
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
  toast(`⚡ ${creatorKey.replace('_',' ').replace(/\b\w/g,l=>l.toUpperCase())} style selected!`, 'ok');
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
   BUG #5 FIX: URL VALIDATION
══════════════════════════════════════════ */
function isValidUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch { return false; }
}

/* ══════════════════════════════════════════
   GENERATE — Single Post (BUG #1 FIX: Real URL fetch)
══════════════════════════════════════════ */
async function generatePost() {
  const topic = document.getElementById('topicInput')?.value?.trim();

  if (!topic || topic.length < 3) {
    toast('⚠️ Please enter your topic or URL', 'err');
    document.getElementById('topicInput')?.focus();
    return;
  }

  // Bug #5: URL Validation
  if (S.inputMode === 'url' && !isValidUrl(topic)) {
    toast('⚠️ Please enter a valid URL starting with https://', 'err');
    document.getElementById('topicInput')?.focus();
    return;
  }

  const tone      = document.getElementById('toneSelect')?.value || 'casual';
  const useEmoji  = document.getElementById('useEmoji')?.checked ?? true;
  const useHashtag = document.getElementById('useHashtag')?.checked ?? true;
  const useHook   = document.getElementById('useHook')?.checked ?? true;

  setBusy(true, 'generateBtn', 'genBtnText', 'genBtnIcon', 'spinner', 'Generating...');
  try {
    const post = await callAI({ mode:'post', topic, style: S.style, tone, useEmoji, useHashtag, useHook, inputMode: S.inputMode });
    S.post = post;
    renderResult(post);
    saveToHistory(post);
    toast('✓ Post generated!', 'ok');
  } catch(e) {
    console.error('Generation failed:', e);
    toast(`⚠️ ${e.message || 'Generation failed. Try again.'}`, 'err');
  } finally {
    setBusy(false, 'generateBtn', 'genBtnText', 'genBtnIcon', 'spinner', 'Generate Free Post');
  }
}

/* ══════════════════════════════════════════
   FEATURE 1: 3 VARIATIONS AT ONCE
══════════════════════════════════════════ */
async function generateVariations() {
  const topic = document.getElementById('topicInput')?.value?.trim();
  if (!topic || topic.length < 3) {
    toast('⚠️ Please enter your topic first', 'err');
    document.getElementById('topicInput')?.focus();
    return;
  }
  if (S.inputMode === 'url' && !isValidUrl(topic)) {
    toast('⚠️ Please enter a valid URL', 'err');
    return;
  }

  const tone      = document.getElementById('toneSelect')?.value || 'casual';
  const useEmoji  = document.getElementById('useEmoji')?.checked ?? true;
  const useHashtag = document.getElementById('useHashtag')?.checked ?? true;

  setBusy(true, 'variationsBtn', 'varBtnText', null, 'varSpinner', 'Generating 3 versions...');

  try {
    const raw = await callAI({ mode:'variations', topic, tone, useEmoji, useHashtag, inputMode: S.inputMode });
    showVariationsModal(raw);
    toast('✓ 3 Variations ready!', 'ok');
  } catch(e) {
    toast(`⚠️ ${e.message || 'Failed to generate variations'}`, 'err');
  } finally {
    setBusy(false, 'variationsBtn', 'varBtnText', null, 'varSpinner', '🔁 Generate 3 Variations');
  }
}

function showVariationsModal(raw) {
  const parts = raw.split(/---VARIATION \d+---/).map(s => s.trim()).filter(Boolean);
  const container = document.getElementById('variationsContainer');
  if (!container) return;

  container.innerHTML = parts.map((v, i) => `
    <div class="variation-card">
      <div class="variation-card__head">
        <span class="variation-badge">Variation ${i+1}</span>
        <button class="btn btn--ghost btn--sm" onclick="selectVariation(${i})">✓ Use This</button>
      </div>
      <div class="variation-card__body" id="var-text-${i}">${esc(v)}</div>
    </div>
  `).join('');

  // Store variations for selection
  window._variations = parts;
  document.getElementById('variationsOverlay').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function selectVariation(idx) {
  const post = window._variations?.[idx];
  if (!post) return;
  S.post = post;
  renderResult(post);
  saveToHistory(post);
  closeVariationsModal();
  toast('✓ Variation applied!', 'ok');
}

function closeVariationsModal() {
  document.getElementById('variationsOverlay').style.display = 'none';
  document.body.style.overflow = '';
}

/* ══════════════════════════════════════════
   FEATURE 2: COMMENT GENERATOR
══════════════════════════════════════════ */
async function generateComments() {
  const postContent = document.getElementById('commentPostInput')?.value?.trim();
  if (!postContent || postContent.length < 20) {
    toast('⚠️ Paste a LinkedIn post (at least 20 characters)', 'err');
    document.getElementById('commentPostInput')?.focus();
    return;
  }

  setBusy(true, 'commentBtn', 'commentBtnText', null, 'commentSpinner', 'Generating comments...');
  try {
    const raw = await callAI({ mode:'comment', postContent });
    renderCommentResults(raw);
    toast('✓ 3 Comments ready!', 'ok');
  } catch(e) {
    toast(`⚠️ ${e.message || 'Failed'}`, 'err');
  } finally {
    setBusy(false, 'commentBtn', 'commentBtnText', null, 'commentSpinner', '💬 Generate 3 Smart Comments');
  }
}

function renderCommentResults(raw) {
  const parts = raw.split(/---COMMENT \d+---/).map(s => s.trim()).filter(Boolean);
  const out = document.getElementById('commentResults');
  if (!out) return;

  out.innerHTML = parts.map((c, i) => `
    <div class="result-card">
      <div class="result-card__num">Comment ${i+1}</div>
      <div class="result-card__text" id="cmnt-${i}">${esc(c)}</div>
      <button class="btn btn--ghost btn--sm" onclick="copyText('cmnt-${i}')">📋 Copy</button>
    </div>
  `).join('');
  out.style.display = 'grid';
}

/* ══════════════════════════════════════════
   FEATURE 3: CONNECTION REQUEST GENERATOR
══════════════════════════════════════════ */
async function generateConnectionMsgs() {
  const name   = document.getElementById('connName')?.value?.trim();
  const role   = document.getElementById('connRole')?.value?.trim();
  const reason = document.getElementById('connReason')?.value?.trim();

  if (!name || !role) {
    toast('⚠️ Please fill in Name and Role fields', 'err');
    return;
  }

  setBusy(true, 'connBtn', 'connBtnText', null, 'connSpinner', 'Generating messages...');
  try {
    const raw = await callAI({ mode:'connection', name, role, reason });
    renderConnectionResults(raw);
    toast('✓ 3 Connection messages ready!', 'ok');
  } catch(e) {
    toast(`⚠️ ${e.message || 'Failed'}`, 'err');
  } finally {
    setBusy(false, 'connBtn', 'connBtnText', null, 'connSpinner', '🤝 Generate 3 Connection Messages');
  }
}

function renderConnectionResults(raw) {
  const parts = raw.split(/---MESSAGE \d+---/).map(s => s.trim()).filter(Boolean);
  const out = document.getElementById('connResults');
  if (!out) return;

  out.innerHTML = parts.map((m, i) => {
    const len = m.length;
    const over = len > 300;
    return `
      <div class="result-card ${over ? 'result-card--warn' : ''}">
        <div class="result-card__num">Message ${i+1} <span class="char-badge ${over?'char-badge--over':''}">${len}/300 chars</span></div>
        <div class="result-card__text" id="conn-${i}">${esc(m)}</div>
        <button class="btn btn--ghost btn--sm" onclick="copyText('conn-${i}')">📋 Copy</button>
      </div>
    `;
  }).join('');
  out.style.display = 'grid';
}

/* ══════════════════════════════════════════
   FEATURE 4: POLL GENERATOR
══════════════════════════════════════════ */
async function generatePolls() {
  const topic = document.getElementById('pollTopicInput')?.value?.trim();
  if (!topic || topic.length < 3) {
    toast('⚠️ Please enter a poll topic', 'err');
    document.getElementById('pollTopicInput')?.focus();
    return;
  }

  setBusy(true, 'pollBtn', 'pollBtnText', null, 'pollSpinner', 'Generating polls...');
  try {
    const raw = await callAI({ mode:'poll', topic });
    renderPollResults(raw);
    toast('✓ 3 Poll ideas ready!', 'ok');
  } catch(e) {
    toast(`⚠️ ${e.message || 'Failed'}`, 'err');
  } finally {
    setBusy(false, 'pollBtn', 'pollBtnText', null, 'pollSpinner', '📊 Generate 3 Poll Ideas');
  }
}

function renderPollResults(raw) {
  const blocks = raw.split(/---POLL \d+---/).map(s => s.trim()).filter(Boolean);
  const out = document.getElementById('pollResults');
  if (!out) return;

  out.innerHTML = blocks.map((b, i) => {
    const lines = b.split('\n').map(l => l.trim()).filter(Boolean);
    const question = lines.find(l => l.startsWith('QUESTION:'))?.replace('QUESTION:','').trim() || '';
    const options = lines.filter(l => /^[A-D]:/.test(l)).map(l => l.replace(/^[A-D]:\s*/,'').trim());
    return `
      <div class="poll-card">
        <div class="poll-card__num">Poll ${i+1}</div>
        <div class="poll-card__question" id="poll-q-${i}">${esc(question)}</div>
        <div class="poll-card__options">
          ${options.map((o,j) => `
            <div class="poll-option">
              <span class="poll-option__letter">${['A','B','C','D'][j]}</span>
              <span>${esc(o)}</span>
            </div>
          `).join('')}
        </div>
        <button class="btn btn--ghost btn--sm" onclick="copyPoll(${i})">📋 Copy Poll</button>
      </div>
    `;
  }).join('');
  out.style.display = 'grid';

  // Store raw blocks for copying
  window._pollBlocks = blocks;
}

function copyPoll(idx) {
  const block = window._pollBlocks?.[idx];
  if (!block) return;
  navigator.clipboard.writeText(block).then(() => toast('✓ Poll copied!', 'ok')).catch(() => toast('⚠️ Copy failed', 'err'));
}

/* ══════════════════════════════════════════
   FEATURE 5 / BUG #2 FIX: POST HISTORY
══════════════════════════════════════════ */
function saveToHistory(post) {
  try {
    const history = getHistory();
    const entry = {
      id: Date.now(),
      post,
      preview: post.slice(0, 100).replace(/\n/g,' '),
      date: new Date().toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'}),
      style: S.style,
    };
    const updated = [entry, ...history].slice(0, 15);
    localStorage.setItem(CONFIG.HISTORY_KEY, JSON.stringify(updated));
    updateHistoryBadge();
  } catch(e) {}
}

function getHistory() {
  try { return JSON.parse(localStorage.getItem(CONFIG.HISTORY_KEY) || '[]'); }
  catch { return []; }
}

function updateHistoryBadge() {
  const count = getHistory().length;
  const badge = document.getElementById('historyBadge');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count ? 'inline-flex' : 'none';
  }
}

function openHistoryPanel() {
  const history = getHistory();
  const panel = document.getElementById('historyList');
  if (!panel) return;

  if (!history.length) {
    panel.innerHTML = '<div class="history-empty">No saved posts yet.<br>Generate your first post above! ✦</div>';
  } else {
    panel.innerHTML = history.map(h => `
      <div class="history-item" onclick="restoreFromHistory(${h.id})">
        <div class="history-item__meta">
          <span class="history-item__date">📅 ${h.date}</span>
          <span class="history-item__style">${h.style}</span>
        </div>
        <div class="history-item__preview">${esc(h.preview)}…</div>
        <div class="history-item__cta">Click to restore →</div>
      </div>
    `).join('');
  }

  document.getElementById('historyOverlay').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeHistoryPanel() {
  document.getElementById('historyOverlay').style.display = 'none';
  document.body.style.overflow = '';
}

function restoreFromHistory(id) {
  const entry = getHistory().find(h => h.id === id);
  if (!entry) return;
  S.post = entry.post;
  renderResult(entry.post);
  closeHistoryPanel();
  document.getElementById('generator')?.scrollIntoView({ behavior:'smooth' });
  toast('✓ Post restored from history!', 'ok');
}

function clearHistory() {
  if (!confirm('Clear all saved posts? This cannot be undone.')) return;
  localStorage.removeItem(CONFIG.HISTORY_KEY);
  updateHistoryBadge();
  closeHistoryPanel();
  toast('History cleared', 'ok');
}

/* ══════════════════════════════════════════
   SMART API CALL (Serverless + Direct Fallback)
══════════════════════════════════════════ */
async function callAI(payload) {
  // Try serverless API first (when deployed on Vercel)
  if (window.location.protocol.startsWith('http')) {
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) return data.post || data.result;
      }
    } catch (e) {
      console.warn('Serverless API unavailable, falling back...', e);
    }
  }

  // Direct fallback for local/file:// mode
  return callDirectOpenRouter(payload);
}

async function callDirectOpenRouter(payload) {
  const { mode = 'post', topic, style, tone, useEmoji, useHashtag, useHook, inputMode,
          postContent, name, role, reason } = payload;
  const cleanKey = CONFIG.OPENROUTER_KEY.trim();

  let prompt;
  let maxTokens = 700;

  if (mode === 'comment') {
    prompt = `Write 3 thoughtful LinkedIn comments for this post:\n\n"${(postContent||'').slice(0,800)}"\n\nEach comment: 50-100 words, adds real value, ends with a question or insight. NOT generic. Format:\n---COMMENT 1---\n[text]\n---COMMENT 2---\n[text]\n---COMMENT 3---\n[text]`;
    maxTokens = 600;
  } else if (mode === 'connection') {
    prompt = `Write 3 personalized LinkedIn connection request messages.\nName: ${name}\nRole: ${role}\nReason: ${reason||'mutual professional interest'}\n\nEach under 300 chars, specific, warm, not salesy. Format:\n---MESSAGE 1---\n[text]\n---MESSAGE 2---\n[text]\n---MESSAGE 3---\n[text]`;
    maxTokens = 500;
  } else if (mode === 'poll') {
    prompt = `Create 3 viral LinkedIn poll ideas for topic: "${(topic||'').slice(0,200)}"\n\nEach poll: 1 engaging question + 4 answer options. Format:\n---POLL 1---\nQUESTION: [question]\nA: [option]\nB: [option]\nC: [option]\nD: [option]\n---POLL 2---\n[same]\n---POLL 3---\n[same]`;
    maxTokens = 800;
  } else if (mode === 'variations') {
    const cleanInput = (topic||'').trim().slice(0,500);
    const toneInstruction = TONE_PROMPTS[tone] || TONE_PROMPTS.casual;
    prompt = `Generate 3 DIFFERENT LinkedIn posts for the same topic.\nTOPIC: "${cleanInput}"\n${toneInstruction}\n${useEmoji ? 'Use 2-3 emojis.' : 'No emojis.'}\n${useHashtag ? 'Add 3-5 hashtags.' : 'No hashtags.'}\n\nVariation 1: Personal Story style\nVariation 2: Bold Hot Take style\nVariation 3: Numbered List / Tips style\n\nEach: 150-280 words, strong hook, no clichés.\n\nFormat:\n---VARIATION 1---\n[post]\n---VARIATION 2---\n[post]\n---VARIATION 3---\n[post]`;
    maxTokens = 1400;
  } else {
    // Default: single post
    const cleanInput = (topic||'').trim().slice(0,500);
    const styleInstruction = STYLE_PROMPTS[style] || STYLE_PROMPTS.storytelling;
    const toneInstruction = TONE_PROMPTS[tone] || TONE_PROMPTS.casual;
    const isUrl = inputMode === 'url' || /^https?:\/\//i.test(cleanInput);
    prompt = `You are an elite LinkedIn content strategist. Write a high-performing LinkedIn post.\n\n${isUrl ? `URL TOPIC: "${cleanInput}"\nExtract insights from this URL topic and write a viral LinkedIn post.` : `TOPIC: "${cleanInput}"`}\n\nSTYLE: ${styleInstruction}\n${toneInstruction}\n${useHook ? 'HOOK: First line must stop the scroll. Never start with "I".' : ''}\n${useEmoji ? 'Use 2-4 emojis naturally.' : 'No emojis.'}\n${useHashtag ? 'End with 3-5 hashtags.' : 'No hashtags.'}\n\nRULES:\n- Short paragraphs (max 2-3 sentences)\n- 150-280 words\n- NEVER use "In today\'s world", "I\'m excited to share", "game-changer"\n- End with question or CTA\n\nOutput ONLY the post.`;
  }

  let lastError = null;
  for (const model of CONFIG.MODELS) {
    try {
      const headers = new Headers();
      headers.set('Authorization', `Bearer ${cleanKey}`);
      headers.set('Content-Type', 'application/json');
      headers.set('HTTP-Referer', window.location.href);
      headers.set('X-Title', 'PostCraft AI');

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You are an expert LinkedIn content creator. Authentic, engaging, results-driven. Never generic.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.88,
          max_tokens: maxTokens,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(`${res.status}: ${errData.error?.message || res.statusText}`);
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) return text;
    } catch (err) {
      console.warn(`[${model}] failed:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All AI models failed to respond.');
}

/* ── RENDER RESULT (BUG #4 FIX: 3000 char warning) ─── */
function renderResult(post) {
  document.getElementById('emptyState').style.display = 'none';
  const result = document.getElementById('result');
  result.style.display = 'flex';

  document.getElementById('postPreview').innerHTML =
    post.split('\n').map(l => l.trim() === '' ? '<br>' : `<span>${esc(l)}</span>`).join('\n');

  document.getElementById('reactions').textContent = rnd(80,450);
  document.getElementById('comments').textContent  = rnd(12,70);

  // Bug #4 Fix: LinkedIn character limit warning
  const charLen = post.length;
  const charCountEl = document.getElementById('postCharCount');
  if (charCountEl) {
    const pct = Math.round((charLen / CONFIG.LI_CHAR_LIMIT) * 100);
    const over = charLen > CONFIG.LI_CHAR_LIMIT;
    charCountEl.innerHTML = `
      <div class="char-limit-bar">
        <div class="char-limit-fill ${over ? 'char-limit-fill--over' : ''}" style="width:${Math.min(pct,100)}%"></div>
      </div>
      <span class="${over ? 'char-limit--over' : 'char-limit--ok'}">
        ${over ? '⚠️' : '✓'} ${charLen.toLocaleString()} / ${CONFIG.LI_CHAR_LIMIT.toLocaleString()} chars
        ${over ? ' — <strong>Exceeds LinkedIn limit!</strong>' : ''}
      </span>
    `;
  }

  const shareBtn = document.getElementById('liShareBtn');
  if (shareBtn) shareBtn.href = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(post)}`;

  setTimeout(() => calcScores(post), 280);
  result.scrollIntoView({ behavior:'smooth', block:'nearest' });
}

/* ── CAROUSEL GENERATOR ───────────────────────────────  */
function openCarouselModal() {
  if (!S.post) return;
  const container = document.getElementById('carouselSlidesContainer');
  if (!container) return;

  const lines = S.post.split('\n').filter(l => l.trim() !== '');
  const hook = lines[0] || 'Viral Insight';
  const bodyParagraphs = lines.slice(1, -1);
  const cta = lines[lines.length - 1] || 'Follow for more insights!';

  const slideContents = [{ title: 'HOOK SLIDE', text: hook }];

  let currentChunk = '';
  bodyParagraphs.forEach((p, idx) => {
    currentChunk += (currentChunk ? '\n\n' : '') + p;
    if (currentChunk.length > 120 || idx === bodyParagraphs.length - 1) {
      slideContents.push({ title: `KEY TAKEAWAY #${slideContents.length}`, text: currentChunk });
      currentChunk = '';
    }
  });
  slideContents.push({ title: 'ACTION / SUMMARY', text: cta });

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
  const slides = document.querySelectorAll('#carouselSlidesContainer .carousel-slide');
  if (!slides.length) return;

  const BG_COLORS = ['#0A1628','#100E2A','#0A2010','#1A0A28','#1A1400'];
  const ACCENTS   = ['#0A84FF','#A78BFA','#30D158','#C084FC','#F5A623'];

  const slideData = [];
  slides.forEach((slide, i) => {
    slideData.push({
      num:    slide.querySelector('.carousel-slide__num')?.textContent || `Slide ${i+1}`,
      text:   slide.querySelector('.carousel-slide__text')?.textContent || '',
      bg:     BG_COLORS[i % BG_COLORS.length],
      accent: ACCENTS[i % ACCENTS.length],
    });
  });

  const slidesHtml = slideData.map(s => `
    <div class="slide" style="background:${s.bg};">
      <div class="brand" style="color:${s.accent}">PostCraft AI</div>
      <div class="slide-num" style="color:${s.accent}99">${s.num}</div>
      <div class="slide-text">${s.text.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
      <div class="slide-footer">PostCraft AI &bull; Free LinkedIn Post Generator</div>
    </div>
  `).join('');

  const html = `<!DOCTYPE html>
<html><head>
  <meta charset="UTF-8">
  <title>LinkedIn Carousel — PostCraft AI</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    @page{size:600px 600px;margin:0}
    body{background:#000;font-family:'DM Sans',sans-serif}
    .slide{width:600px;height:600px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:56px 52px;page-break-after:always;break-after:page;position:relative}
    .brand{font-family:'Syne',sans-serif;font-size:11px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;margin-bottom:22px}
    .slide-num{font-family:'Syne',sans-serif;font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;margin-bottom:24px}
    .slide-text{color:#fff;font-size:22px;font-weight:500;line-height:1.65;max-width:440px;white-space:pre-wrap}
    .slide-footer{position:absolute;bottom:28px;left:0;right:0;text-align:center;font-size:10px;color:rgba(255,255,255,.28);font-weight:500}
  </style>
</head><body>
  ${slidesHtml}
  <script>window.onload=function(){setTimeout(function(){window.print()},400)}<\/script>
</body></html>`;

  const win = window.open('', '_blank', 'width=640,height=680');
  if (!win) { toast('⚠️ Popup blocked! Allow popups and try again.', 'err'); return; }
  win.document.open();
  win.document.write(html);
  win.document.close();
}

/* ── SCORES ──────────────────────────────────────────── */
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

/* ── COPY TEXT BY ELEMENT ID ─────────────────────────── */
async function copyText(elId) {
  const el = document.getElementById(elId);
  if (!el) return;
  try {
    await navigator.clipboard.writeText(el.textContent.trim());
    toast('✓ Copied!', 'ok');
  } catch { toast('⚠️ Copy failed', 'err'); }
}

/* ── SET BUSY STATE (Generic) ────────────────────────── */
function setBusy(on, btnId, txtId, icnId, spinId, loadingText) {
  const btn  = document.getElementById(btnId);
  const txt  = document.getElementById(txtId);
  const icn  = icnId ? document.getElementById(icnId) : null;
  const spin = document.getElementById(spinId);
  if (btn)  btn.disabled  = on;
  if (txt)  txt.textContent = on ? loadingText : txt.dataset.original || txt.textContent;
  if (!on && txt && !txt.dataset.original) txt.dataset.original = txt.textContent;
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
  if (e.key === 'Escape') {
    closeCarouselModal();
    closeHistoryPanel();
    closeVariationsModal();
  }
});
