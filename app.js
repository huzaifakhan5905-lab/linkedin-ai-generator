/* ══════════════════════════════════════════
   PostCraft AI — app.js v3.0
   7 Gaps Fixed + 10 New Features
══════════════════════════════════════════ */

/* ══ CONFIG (GAP #2: API key ONLY server-side) ══ */
const CONFIG = {
  HISTORY_KEY:  'postcraft_history_v3',
  LI_CHAR_LIMIT: 3000,
};

/* ══ STYLE & TONE MAPS ══ */
const STYLE_PROMPTS = {
  storytelling:'Personal narrative', insight:'Hot Take', listicle:'Listicle',
  question:'Question', motivational:'Inspire', casestudy:'Case Study',
  justin_welsh:'Justin Welsh', sahil_bloom:'Sahil Bloom',
  paul_graham:'Paul Graham', ruben_hassid:'Ruben Hassid'
};

/* ══ HOOK LIBRARY DATA ══ */
const HOOKS = {
  story: [
    "3 years ago, I was fired from my dream job.",
    "I made a $50,000 mistake. Here's what it taught me:",
    "My manager told me I'd never make it. I proved her wrong.",
    "I almost quit LinkedIn last year. Glad I didn't.",
    "The day I lost my biggest client changed everything.",
    "I failed 7 times before I figured this out.",
    "Nobody told me this when I started my career.",
    "6 months ago I had zero followers. Here's what changed:",
    "The worst advice I ever followed cost me 2 years.",
    "I cried in a meeting once. Still cringe. Here's what I learned:",
  ],
  insight: [
    "Unpopular opinion: 90% of LinkedIn advice is wrong.",
    "Hot take: Your morning routine is not why you're failing.",
    "Stop optimizing your resume. Start doing this instead:",
    "The most underrated career skill nobody talks about:",
    "Working harder is not the answer. Working smarter isn't either.",
    "Cold emails don't work. Here's what does:",
    "The biggest lie in job searching:",
    "Your LinkedIn profile is costing you opportunities.",
    "Most people build networks wrong. Here's the right way:",
    "Remote work didn't kill productivity. Management did.",
  ],
  listicle: [
    "5 things I wish I knew before my first job:",
    "7 free tools that replaced my $500/month stack:",
    "10 words to delete from your LinkedIn profile right now:",
    "3 questions I ask before every important decision:",
    "5 signs you're being underpaid (and what to do):",
    "4 habits that separate top 1% performers from the rest:",
    "6 mistakes every new manager makes (and how to avoid them):",
    "8 Chrome extensions every professional needs:",
    "5 books that changed how I think about work:",
    "3 LinkedIn mistakes costing you job opportunities:",
  ],
  data: [
    "73% of hiring managers Google candidates before interviews.",
    "People who write on LinkedIn get 10x more opportunities.",
    "The average recruiter spends 7 seconds on your resume.",
    "LinkedIn profiles with photos get 21x more views.",
    "87% of talent says their boss is the #1 reason they quit.",
    "Remote workers are 13% more productive (Stanford study).",
    "85% of jobs are filled through networking, not job boards.",
    "Only 3% of LinkedIn users post content. That's your edge.",
    "Companies with diverse teams outperform by 35% (McKinsey).",
    "Employees who feel recognized are 63% more engaged.",
  ],
  question: [
    "What's the one career decision you'd take back?",
    "Is work-life balance actually possible? Or just a myth?",
    "Would you rather have job security or a higher salary?",
    "What's the hardest professional feedback you ever received?",
    "What skill do you wish they taught in schools?",
    "Is hustle culture killing creativity?",
    "What's the most overrated career advice?",
    "Do you regret any career path you've taken?",
    "At what salary did you feel financially free?",
    "Would you work for free if money wasn't an issue?",
  ],
  curiosity: [
    "I spent 30 days doing X. Here's what happened:",
    "Nobody is talking about this shift happening in our industry:",
    "I reverse-engineered 100 viral LinkedIn posts. Here's the pattern:",
    "After 10 years in tech, I'm seeing something alarming:",
    "I interviewed 50 CEOs. They all said the same thing:",
    "The secret to getting promoted that nobody shares:",
    "I read every book on productivity. One thing actually works:",
    "The #1 thing great managers do differently:",
    "I tracked my time for 90 days. The results shocked me:",
    "What Harvard's research on success actually shows:",
  ],
  fear: [
    "AI will replace your job if you don't do this now:",
    "Your network is silently judging your LinkedIn profile.",
    "Most people peak in their career by age 35. Don't let this be you.",
    "You're losing job opportunities right now and don't know it.",
    "The skill gap between you and top performers is growing daily.",
    "Your next layoff might be closer than you think.",
    "People who ignore this will struggle in the next 5 years:",
    "The reason you're stuck in your career (hard truth):",
    "Most people retire with regret. Here's why:",
    "The silent career killer no one warns you about:",
  ],
};

/* ══ TEMPLATES ══ */
const TEMPLATES = [
  { emoji:'🚀', title:'Career Win', style:'storytelling', tone:'casual', desc:'Promotion ya bada achievement share karo', prompt:'I recently got promoted after 3 years of hard work and want to share the journey and lessons learned with my network' },
  { emoji:'💡', title:'Industry Hot Take', style:'insight', tone:'bold', desc:'Controversial opinion jo debate shuru kare', prompt:'Controversial opinion: most people in my industry are doing a very common thing completely wrong and here is why they are missing the point' },
  { emoji:'📋', title:'Lessons Learned', style:'listicle', tone:'professional', desc:'5 cheezein jo kash pehle pata hoti', prompt:'5 things I wish someone had told me when I first started my career — lessons I had to learn the hard way over years of mistakes' },
  { emoji:'📊', title:'Real Results', style:'casestudy', tone:'data-driven', desc:'Numbers ke saath real story', prompt:'We went from zero to significant customers and revenue in a short timeframe using one specific strategy. Here is exactly what we did step by step' },
  { emoji:'🙋', title:'Engagement Post', style:'question', tone:'casual', desc:'Comments drive karo genuine question se', prompt:'I am genuinely curious what other professionals think about this trending topic in my industry — what has been your personal experience' },
  { emoji:'🧠', title:'Learning Aloud', style:'storytelling', tone:'empathetic', desc:'Jo seekh rahe ho woh share karo', prompt:'I am currently learning a new skill in public and sharing my raw experience — here is what I have discovered so far and what truly surprised me' },
  { emoji:'😅', title:'Failure Story', style:'storytelling', tone:'empathetic', desc:'Vulnerability drives highest engagement', prompt:'I failed very publicly at something I was confident about — here is exactly what happened, what went wrong, and the most important lessons I took away' },
  { emoji:'🔥', title:'Productivity Hack', style:'listicle', tone:'bold', desc:'Tools ya habits jo game-changer hain', prompt:'The three specific tools and daily habits that have completely transformed my productivity this year and why most people overlook them' },
];

/* ══ STATE ══ */
const S = { style:'storytelling', post:'', inputMode:'topic', topicText:'', urlText:'' };

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  renderTemplates();
  initChips();
  initTextareaCounter();
  updateHistoryBadge();
  checkOnboarding();  // Gap #5: Onboarding
  handleHashNav();    // Gap #7: Hash Navigation
});

window.addEventListener('hashchange', handleHashNav);

/* ── GAP #7: Hash Navigation ── */
function handleHashNav() {
  const hash = window.location.hash;
  if (!hash) return;
  setTimeout(() => {
    const el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior:'smooth', block:'start' });
  }, 100);
}

/* ── INPUT MODE (SEPARATE DRAFTS & CLEAR SWITCHING) ── */
function switchInputMode(mode) {
  const ta = document.getElementById('topicInput');
  const cc = document.getElementById('charCount');
  
  // Save current text to corresponding mode draft
  if (ta) {
    if (S.inputMode === 'topic') {
      S.topicText = ta.value;
    } else {
      S.urlText = ta.value;
    }
  }

  S.inputMode = mode;
  const isTopic = mode === 'topic';
  document.getElementById('tabModeTopic')?.classList.toggle('pay-tab--active', isTopic);
  document.getElementById('tabModeUrl')?.classList.toggle('pay-tab--active', !isTopic);
  const lbl = document.getElementById('inputLabel');
  
  if (lbl) lbl.textContent = isTopic ? 'What do you want to post about?' : 'Paste YouTube Video or Web Article URL:';
  if (ta) {
    ta.placeholder = isTopic
      ? "e.g. 'I got promoted after 3 years...' or 'Hot take on remote work'"
      : "e.g. 'https://youtube.com/watch?v=...' or 'https://medium.com/article-slug'";
    
    // Switch to selected mode's saved text
    ta.value = isTopic ? (S.topicText || '') : (S.urlText || '');
    if (cc) cc.textContent = `${ta.value.length} / 500`;
  }
}


/* ── CREATOR PRESET ── */
function selectCreatorStyle(key) {
  S.style = key;
  document.querySelectorAll('.chip').forEach(c => {
    const on = c.dataset.style === key;
    c.classList.toggle('chip--on', on);
    c.setAttribute('aria-checked', on ? 'true' : 'false');
  });
  toast(`⚡ ${key.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())} style active!`, 'ok');
}

/* ── CHIPS ── */
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

/* ── TEXTAREA COUNTER & DRAFT AUTO-SAVE ── */
function initTextareaCounter() {
  const ta = document.getElementById('topicInput');
  const cc = document.getElementById('charCount');
  if (!ta || !cc) return;

  // Restore saved draft if exists
  const saved = localStorage.getItem('postcraft_draft_topic');
  if (saved && !ta.value) {
    ta.value = saved;
    cc.textContent = `${saved.length} / 500`;
  }

  ta.addEventListener('input', () => {
    if (ta.value.length > 500) ta.value = ta.value.slice(0,500);
    cc.textContent = `${ta.value.length} / 500`;
    localStorage.setItem('postcraft_draft_topic', ta.value);
  });
}


/* ── TEMPLATES ── */
function renderTemplates() {
  const g = document.getElementById('templatesGrid');
  if (!g) return;
  g.innerHTML = TEMPLATES.map((t,i) => `
    <button class="tcard" onclick="useTemplate(${i})">
      <span class="tcard__emoji">${t.emoji}</span>
      <div class="tcard__title">${t.title}</div>
      <div class="tcard__desc">${t.desc}</div>
      <div class="tcard__cta">Use template →</div>
    </button>`).join('');
}

function useTemplate(i) {
  const t = TEMPLATES[i]; if (!t) return;
  switchInputMode('topic');
  document.getElementById('topicInput').value = t.prompt;
  document.getElementById('toneSelect').value  = t.tone;
  document.getElementById('charCount').textContent = `${t.prompt.length} / 500`;
  S.style = t.style;
  document.querySelectorAll('.chip').forEach(c => {
    const on = c.dataset.style === t.style;
    c.classList.toggle('chip--on', on);
    c.setAttribute('aria-checked', on?'true':'false');
  });
  document.getElementById('generator')?.scrollIntoView({ behavior:'smooth', block:'start' });
  toast('✓ Template applied!', 'ok');
}

/* ── URL VALIDATION ── */
function isValidUrl(str) {
  try { const u = new URL(str); return u.protocol==='http:'||u.protocol==='https:'; }
  catch { return false; }
}

/* ══════════════════════════════════════════
   GAP #5: ONBOARDING MODAL
══════════════════════════════════════════ */
function checkOnboarding() {
  if (!localStorage.getItem('postcraft_welcomed')) {
    setTimeout(() => document.getElementById('onboardingOverlay').style.display='flex', 800);
  }
}

function closeOnboarding() {
  localStorage.setItem('postcraft_welcomed', '1');
  document.getElementById('onboardingOverlay').style.display='none';
  document.getElementById('generator')?.scrollIntoView({ behavior:'smooth' });
}

/* ══════════════════════════════════════════
   GENERATE — Single Post
══════════════════════════════════════════ */
async function generatePost() {
  const topic = document.getElementById('topicInput')?.value?.trim();
  
  if (S.inputMode === 'url') {
    if (!topic || !isValidUrl(topic)) {
      toast('⚠️ Invalid URL! Link must start with https:// or http:// (e.g., https://youtube.com/...) or switch to Topic Mode', 'err');
      return;
    }
  } else {
    if (!topic || topic.length < 3) {
      toast('⚠️ Please enter your topic before generating', 'err');
      return;
    }
  }

  const tone       = document.getElementById('toneSelect')?.value||'casual';
  const lang       = document.getElementById('langSelect')?.value||'hinglish';
  const length     = document.getElementById('lengthSelect')?.value||'medium';
  const cta        = document.getElementById('ctaSelect')?.value||'question';
  const useEmoji   = document.getElementById('useEmoji')?.checked??true;
  const useHashtag = document.getElementById('useHashtag')?.checked??true;
  const useHook    = document.getElementById('useHook')?.checked??true;

  setBusy(true,'generateBtn','genBtnText','genBtnIcon','spinner','Generating...');
  try {
    const data = await callAPI({ mode:'post', topic, style:S.style, tone, lang, length, cta, useEmoji, useHashtag, useHook, inputMode:S.inputMode });

    // Gap #3: Show feedback if URL fetch failed
    if (data.urlFetchFailed) toast('⚠️ URL content unreachable — generated using link topic','warn');
    S.post = data.post;
    renderResult(data.post);
    saveToHistory(data.post);
    toast('✓ Post generated!','ok');
  } catch(e) {
    toast(`⚠️ ${e.message||'Generation failed. Try again.'}`, 'err');
  } finally {
    setBusy(false,'generateBtn','genBtnText','genBtnIcon','spinner','Generate Free Post');
  }
}

/* ══════════════════════════════════════════
   GENERATE — 3 Variations
══════════════════════════════════════════ */
async function generateVariations() {
  const topic = document.getElementById('topicInput')?.value?.trim();
  
  if (S.inputMode === 'url') {
    if (!topic || !isValidUrl(topic)) {
      toast('⚠️ Invalid URL! Link must start with https:// or http:// (e.g., https://youtube.com/...)', 'err');
      return;
    }
  } else {
    if (!topic || topic.length < 3) {
      toast('⚠️ Please enter your topic first', 'err');
      return;
    }
  }

  const tone       = document.getElementById('toneSelect')?.value||'casual';
  const useEmoji   = document.getElementById('useEmoji')?.checked??true;
  const useHashtag = document.getElementById('useHashtag')?.checked??true;


  setBusy(true,'variationsBtn','varBtnText',null,'varSpinner','Generating 3 versions...');
  try {
    const data = await callAPI({ mode:'variations', topic, tone, useEmoji, useHashtag, inputMode:S.inputMode });
    if (data.urlFetchFailed) toast('⚠️ URL fetch failed — using topic mode','warn');
    showVariationsModal(data.result||data.post);
    toast('✓ 3 Variations ready!','ok');
  } catch(e) {
    toast(`⚠️ ${e.message||'Failed'}`, 'err');
  } finally {
    setBusy(false,'variationsBtn','varBtnText',null,'varSpinner','🔁 Generate 3 Variations');
  }
}

function showVariationsModal(raw) {
  const parts = raw.split(/---VARIATION \d+---/).map(s=>s.trim()).filter(Boolean);
  const c = document.getElementById('variationsContainer');
  if (!c) return;
  c.innerHTML = parts.map((v,i) => `
    <div class="variation-card">
      <div class="variation-card__head">
        <span class="variation-badge">Variation ${i+1}</span>
        <button class="btn btn--ghost btn--sm" onclick="selectVariation(${i})">✓ Use This</button>
      </div>
      <div class="variation-card__body" id="var-text-${i}">${esc(v)}</div>
    </div>`).join('');
  window._variations = parts;
  document.getElementById('variationsOverlay').style.display='flex';
  document.body.style.overflow='hidden';
}

function selectVariation(idx) {
  const p = window._variations?.[idx]; if (!p) return;
  S.post = p; renderResult(p); saveToHistory(p);
  closeVariationsModal(); toast('✓ Variation applied!','ok');
}

function closeVariationsModal() {
  document.getElementById('variationsOverlay').style.display='none';
  document.body.style.overflow='';
}

/* ══════════════════════════════════════════
   COMMENT GENERATOR
══════════════════════════════════════════ */
async function generateComments() {
  const postContent = document.getElementById('commentPostInput')?.value?.trim();
  if (!postContent || postContent.length < 20) { toast('⚠️ Paste a LinkedIn post (min 20 chars)','err'); return; }
  setBusy(true,'commentBtn','commentBtnText',null,'commentSpinner','Generating comments...');
  try {
    const data = await callAPI({ mode:'comment', postContent });
    renderCommentResults(data.result);
    toast('✓ 3 Comments ready!','ok');
  } catch(e) { toast(`⚠️ ${e.message||'Failed'}`, 'err'); }
  finally { setBusy(false,'commentBtn','commentBtnText',null,'commentSpinner','💬 Generate 3 Smart Comments'); }
}

function renderCommentResults(raw) {
  const parts = raw.split(/---COMMENT \d+---/).map(s=>s.trim()).filter(Boolean);
  const out = document.getElementById('commentResults');
  if (!out) return;
  out.innerHTML = parts.map((c,i) => `
    <div class="result-card">
      <div class="result-card__num">Comment ${i+1}</div>
      <div class="result-card__text" id="cmnt-${i}">${esc(c)}</div>
      <button class="btn btn--ghost btn--sm" onclick="copyText('cmnt-${i}')">📋 Copy</button>
    </div>`).join('');
  out.style.display='grid';
  document.getElementById('commentEmpty').style.display='none';
}

/* ══════════════════════════════════════════
   CONNECTION REQUEST GENERATOR
══════════════════════════════════════════ */
async function generateConnectionMsgs() {
  const name   = document.getElementById('connName')?.value?.trim();
  const role   = document.getElementById('connRole')?.value?.trim();
  const reason = document.getElementById('connReason')?.value?.trim();
  if (!name||!role) { toast('⚠️ Please fill Name and Role','err'); return; }
  setBusy(true,'connBtn','connBtnText',null,'connSpinner','Generating...');
  try {
    const data = await callAPI({ mode:'connection', name, role, reason });
    renderConnectionResults(data.result);
    toast('✓ 3 Messages ready!','ok');
  } catch(e) { toast(`⚠️ ${e.message||'Failed'}`, 'err'); }
  finally { setBusy(false,'connBtn','connBtnText',null,'connSpinner','🤝 Generate 3 Connection Messages'); }
}

function renderConnectionResults(raw) {
  const parts = raw.split(/---MESSAGE \d+---/).map(s=>s.trim()).filter(Boolean);
  const out = document.getElementById('connResults');
  if (!out) return;
  out.innerHTML = parts.map((m,i) => {
    const over = m.length>300;
    return `<div class="result-card${over?' result-card--warn':''}">
      <div class="result-card__num">Message ${i+1} <span class="char-badge${over?' char-badge--over':''}">${m.length}/300</span></div>
      <div class="result-card__text" id="conn-${i}">${esc(m)}</div>
      <button class="btn btn--ghost btn--sm" onclick="copyText('conn-${i}')">📋 Copy</button>
    </div>`;
  }).join('');
  out.style.display='grid';
  document.getElementById('connEmpty').style.display='none';
}

/* ══════════════════════════════════════════
   POLL GENERATOR
══════════════════════════════════════════ */
async function generatePolls() {
  const topic = document.getElementById('pollTopicInput')?.value?.trim();
  if (!topic || topic.length < 3) { toast('⚠️ Please enter a poll topic','err'); return; }
  setBusy(true,'pollBtn','pollBtnText',null,'pollSpinner','Generating...');
  try {
    const data = await callAPI({ mode:'poll', topic });
    renderPollResults(data.result);
    toast('✓ 3 Poll ideas ready!','ok');
  } catch(e) { toast(`⚠️ ${e.message||'Failed'}`, 'err'); }
  finally { setBusy(false,'pollBtn','pollBtnText',null,'pollSpinner','📊 Generate 3 Poll Ideas'); }
}

function renderPollResults(raw) {
  const blocks = raw.split(/---POLL \d+---/).map(s=>s.trim()).filter(Boolean);
  const out = document.getElementById('pollResults');
  if (!out) return;
  out.innerHTML = blocks.map((b,i) => {
    const lines = b.split('\n').map(l=>l.trim()).filter(Boolean);
    const q = lines.find(l=>l.startsWith('QUESTION:'))?.replace('QUESTION:','').trim()||'';
    const opts = lines.filter(l=>/^[A-D]:/.test(l)).map(l=>l.replace(/^[A-D]:\s*/,'').trim());
    return `<div class="poll-card">
      <div class="poll-card__num">Poll ${i+1}</div>
      <div class="poll-card__question" id="poll-q-${i}">${esc(q)}</div>
      <div class="poll-card__options">${opts.map((o,j)=>`
        <div class="poll-option"><span class="poll-option__letter">${'ABCD'[j]}</span><span>${esc(o)}</span></div>`).join('')}
      </div>
      <button class="btn btn--ghost btn--sm" onclick="copyPoll(${i})">📋 Copy Poll</button>
    </div>`;
  }).join('');
  out.style.display='grid';
  window._pollBlocks = blocks;
  document.getElementById('pollEmpty').style.display='none';
}

function copyPoll(idx) {
  const b = window._pollBlocks?.[idx]; if (!b) return;
  navigator.clipboard.writeText(b).then(()=>toast('✓ Poll copied!','ok')).catch(()=>toast('⚠️ Copy failed','err'));
}

/* ══════════════════════════════════════════
   FEATURE 1: HEADLINE GENERATOR
══════════════════════════════════════════ */
async function generateHeadlines() {
  const name        = document.getElementById('hlName')?.value?.trim()||'';
  const currentRole = document.getElementById('hlRole')?.value?.trim();
  const targetRole  = document.getElementById('hlTarget')?.value?.trim();
  const skills      = document.getElementById('hlSkills')?.value?.trim();
  const superpower  = document.getElementById('hlSuper')?.value?.trim();
  if (!currentRole) { toast('⚠️ Please enter your current role','err'); return; }
  setBusy(true,'hlBtn','hlBtnText',null,'hlSpinner','Generating 5 headlines...');
  try {
    const data = await callAPI({ mode:'headline', name, currentRole, targetRole, skills, superpower });
    renderHeadlines(data.result);
    toast('✓ 5 Headlines ready!','ok');
  } catch(e) { toast(`⚠️ ${e.message||'Failed'}`, 'err'); }
  finally { setBusy(false,'hlBtn','hlBtnText',null,'hlSpinner','✨ Generate 5 Headlines'); }
}

function renderHeadlines(raw) {
  const parts = raw.split(/---HEADLINE \d+---/).map(s=>s.trim()).filter(Boolean);
  const out = document.getElementById('hlResults');
  if (!out) return;
  out.innerHTML = parts.map((h,i) => {
    const len = h.length;
    const over = len>220;
    return `<div class="result-card${over?' result-card--warn':''}">
      <div class="result-card__num">Headline ${i+1} <span class="char-badge${over?' char-badge--over':''}">${len}/220</span></div>
      <div class="result-card__text hl-text" id="hl-${i}">${esc(h)}</div>
      <button class="btn btn--ghost btn--sm" onclick="copyText('hl-${i}')">📋 Copy</button>
    </div>`;
  }).join('');
  out.style.display='grid';
  document.getElementById('hlEmpty').style.display='none';
}

/* ══════════════════════════════════════════
   FEATURE 2: ABOUT / BIO WRITER
══════════════════════════════════════════ */
async function generateAbout() {
  const currentRole    = document.getElementById('abtRole')?.value?.trim();
  const experience     = document.getElementById('abtExp')?.value?.trim();
  const skills         = document.getElementById('abtSkills')?.value?.trim();
  const achievements   = document.getElementById('abtAchieve')?.value?.trim();
  const targetAudience = document.getElementById('abtAudience')?.value?.trim();
  const goal           = document.getElementById('abtGoal')?.value?.trim();
  const tone           = document.getElementById('abtTone')?.value||'professional';
  if (!currentRole) { toast('⚠️ Please enter your current role','err'); return; }
  setBusy(true,'abtBtn','abtBtnText',null,'abtSpinner','Writing your About section...');
  try {
    const data = await callAPI({ mode:'about', currentRole, experience, skills, achievements, targetAudience, goal, tone });
    renderAbout(data.result);
    toast('✓ About section ready!','ok');
  } catch(e) { toast(`⚠️ ${e.message||'Failed'}`, 'err'); }
  finally { setBusy(false,'abtBtn','abtBtnText',null,'abtSpinner','✍️ Write My About Section'); }
}

function renderAbout(text) {
  const out = document.getElementById('abtResult'); if (!out) return;
  const len = text.length;
  const over = len>2600;
  out.innerHTML = `
    <div class="result-card">
      <div class="result-card__num">About Section <span class="char-badge${over?' char-badge--over':''}">${len}/2600 chars</span></div>
      <div class="result-card__text" id="abt-text" style="white-space:pre-wrap">${esc(text)}</div>
      <button class="btn btn--ghost btn--sm" onclick="copyText('abt-text')">📋 Copy Full Section</button>
    </div>`;
  out.style.display='block';
  document.getElementById('abtEmpty').style.display='none';
}

/* ══════════════════════════════════════════
   FEATURE 3: DM / INMAIL GENERATOR
══════════════════════════════════════════ */
async function generateDMs() {
  const name    = document.getElementById('dmName')?.value?.trim();
  const company = document.getElementById('dmCompany')?.value?.trim();
  const purpose = document.getElementById('dmPurpose')?.value||'job';
  const context = document.getElementById('dmContext')?.value?.trim();
  if (!name) { toast('⚠️ Please enter recipient name','err'); return; }
  setBusy(true,'dmBtn','dmBtnText',null,'dmSpinner','Writing DMs...');
  try {
    const data = await callAPI({ mode:'dm', name, company, purpose, context });
    renderDMResults(data.result);
    toast('✓ 3 DM templates ready!','ok');
  } catch(e) { toast(`⚠️ ${e.message||'Failed'}`, 'err'); }
  finally { setBusy(false,'dmBtn','dmBtnText',null,'dmSpinner','✉️ Generate 3 DM Templates'); }
}

function renderDMResults(raw) {
  const parts = raw.split(/---DM \d+---/).map(s=>s.trim()).filter(Boolean);
  const out = document.getElementById('dmResults'); if (!out) return;
  out.innerHTML = parts.map((m,i) => {
    const len = m.length; const over = len>300;
    return `<div class="result-card${over?' result-card--warn':''}">
      <div class="result-card__num">DM ${i+1} <span class="char-badge${over?' char-badge--over':''}">${len} chars</span></div>
      <div class="result-card__text" id="dm-${i}">${esc(m)}</div>
      <button class="btn btn--ghost btn--sm" onclick="copyText('dm-${i}')">📋 Copy</button>
    </div>`;
  }).join('');
  out.style.display='grid';
  document.getElementById('dmEmpty').style.display='none';
}

/* ══════════════════════════════════════════
   FEATURE 4: HOOK LIBRARY
══════════════════════════════════════════ */
let hookCategory = 'story';

function switchHookCategory(cat) {
  hookCategory = cat;
  document.querySelectorAll('.hook-cat-btn').forEach(b => b.classList.toggle('hook-cat-btn--active', b.dataset.cat===cat));
  renderHooks();
}

function renderHooks() {
  const grid = document.getElementById('hookGrid'); if (!grid) return;
  const hooks = HOOKS[hookCategory] || [];
  const search = document.getElementById('hookSearch')?.value?.toLowerCase()||'';
  const filtered = search ? hooks.filter(h=>h.toLowerCase().includes(search)) : hooks;
  grid.innerHTML = filtered.map(h => `
    <div class="hook-card" onclick="useHook(this,'${h.replace(/'/g,"\\'")}')">
      <div class="hook-card__text">${esc(h)}</div>
      <div class="hook-card__cta">Use this hook →</div>
    </div>`).join('');
}

function useHook(el, hook) {
  switchInputMode('topic');
  document.getElementById('topicInput').value = hook;
  document.getElementById('charCount').textContent = `${hook.length} / 500`;
  document.getElementById('generator')?.scrollIntoView({ behavior:'smooth' });
  toast('✓ Hook applied! Add your story below it.','ok');
}

function filterHooks() { renderHooks(); }

function openHookLibrary() {
  document.getElementById('hookLibraryOverlay').style.display='flex';
  document.body.style.overflow='hidden';
  hookCategory = 'story';
  document.querySelectorAll('.hook-cat-btn').forEach(b => b.classList.toggle('hook-cat-btn--active', b.dataset.cat==='story'));
  renderHooks();
}

function closeHookLibrary() {
  document.getElementById('hookLibraryOverlay').style.display='none';
  document.body.style.overflow='';
}

/* ══════════════════════════════════════════
   FEATURE 5: CONTENT REPURPOSER
══════════════════════════════════════════ */
async function generateRepurpose() {
  const postContent = document.getElementById('repurposeInput')?.value?.trim();
  const sourceType  = document.getElementById('repurposeSource')?.value||'blog';
  if (!postContent || postContent.length < 30) { toast('⚠️ Please paste your content (min 30 chars)','err'); return; }
  setBusy(true,'repurposeBtn','repurposeBtnText',null,'repurposeSpinner','Repurposing content...');
  try {
    const data = await callAPI({ mode:'repurpose', postContent, sourceType });
    renderRepurposeResults(data.result);
    toast('✓ 4 LinkedIn formats ready!','ok');
  } catch(e) { toast(`⚠️ ${e.message||'Failed'}`, 'err'); }
  finally { setBusy(false,'repurposeBtn','repurposeBtnText',null,'repurposeSpinner','🔄 Repurpose to LinkedIn'); }
}

function renderRepurposeResults(raw) {
  const post      = raw.match(/---POST---([\s\S]*?)(?=---CAROUSEL---|$)/)?.[1]?.trim()||'';
  const carousel  = raw.match(/---CAROUSEL---([\s\S]*?)(?=---POLL---|$)/)?.[1]?.trim()||'';
  const poll      = raw.match(/---POLL---([\s\S]*?)(?=---COMMENT---|$)/)?.[1]?.trim()||'';
  const comment   = raw.match(/---COMMENT---([\s\S]*?)$/)?.[1]?.trim()||'';
  const out = document.getElementById('repurposeResults'); if (!out) return;
  const block = (title, id, content) => `
    <div class="result-card">
      <div class="result-card__num">${title}</div>
      <div class="result-card__text" id="${id}" style="white-space:pre-wrap">${esc(content)}</div>
      <button class="btn btn--ghost btn--sm" onclick="copyText('${id}')">📋 Copy</button>
    </div>`;
  out.innerHTML = [
    post     && block('📝 LinkedIn Post','rep-post',post),
    carousel && block('🎨 Carousel Outline','rep-carousel',carousel),
    poll     && block('📊 Poll Idea','rep-poll',poll),
    comment  && block('💬 Comment Starter','rep-comment',comment),
  ].filter(Boolean).join('');
  out.style.display='grid';
  document.getElementById('repurposeEmpty').style.display='none';
}

/* ══════════════════════════════════════════
   FEATURE 6: CONTENT CALENDAR
══════════════════════════════════════════ */
async function generateCalendar() {
  const industry = document.getElementById('calIndustry')?.value?.trim();
  const role     = document.getElementById('calRole')?.value?.trim();
  const goal     = document.getElementById('calGoal')?.value?.trim();
  if (!industry) { toast('⚠️ Please enter your industry','err'); return; }
  setBusy(true,'calBtn','calBtnText',null,'calSpinner','Building your 7-day calendar...');
  try {
    const data = await callAPI({ mode:'calendar', industry, role, goal });
    renderCalendar(data.result);
    toast('✓ 7-day content calendar ready!','ok');
  } catch(e) { toast(`⚠️ ${e.message||'Failed'}`, 'err'); }
  finally { setBusy(false,'calBtn','calBtnText',null,'calSpinner','📅 Generate 7-Day Calendar'); }
}

function renderCalendar(raw) {
  const days = raw.split(/---DAY \d+---/).map(s=>s.trim()).filter(Boolean);
  const dayNames = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const out = document.getElementById('calResults'); if (!out) return;
  out.innerHTML = days.map((d,i) => {
    const lines = d.split('\n').map(l=>l.trim()).filter(Boolean);
    const get = k => lines.find(l=>l.startsWith(k+':'))?.replace(k+':','').trim()||'';
    return `<div class="cal-day">
      <div class="cal-day__header">
        <span class="cal-day__num">Day ${i+1}</span>
        <span class="cal-day__name">${dayNames[i]||''}</span>
        <span class="cal-day__type">${get('TYPE')}</span>
      </div>
      <div class="cal-day__topic">${get('TOPIC')}</div>
      <div class="cal-day__hook">"${get('HOOK')}"</div>
      <div class="cal-day__key">${get('KEY POINT')}</div>
      <button class="btn btn--ghost btn--sm" onclick="calToGenerator('${(get('TOPIC')+'. Hook: '+get('HOOK')).replace(/'/g,"\\'")}')">Use This →</button>
    </div>`;
  }).join('');
  out.style.display='grid';
  document.getElementById('calEmpty').style.display='none';
}

function calToGenerator(text) {
  switchInputMode('topic');
  document.getElementById('topicInput').value = text;
  document.getElementById('charCount').textContent = `${text.length} / 500`;
  document.getElementById('generator')?.scrollIntoView({ behavior:'smooth' });
  toast('✓ Idea applied to generator!','ok');
}

/* ══════════════════════════════════════════
   FEATURE 7: POST ANALYZER
══════════════════════════════════════════ */
async function analyzePost() {
  const post = document.getElementById('analyzeInput')?.value?.trim();
  if (!post || post.length < 30) { toast('⚠️ Paste your LinkedIn post (min 30 chars)','err'); return; }
  setBusy(true,'analyzeBtn','analyzeBtnText',null,'analyzeSpinner','Analyzing your post...');
  try {
    const data = await callAPI({ mode:'analyze', post });
    renderAnalysis(data.result);
    toast('✓ Analysis complete!','ok');
  } catch(e) { toast(`⚠️ ${e.message||'Failed'}`, 'err'); }
  finally { setBusy(false,'analyzeBtn','analyzeBtnText',null,'analyzeSpinner','🔍 Analyze My Post'); }
}

function renderAnalysis(raw) {
  const get = key => raw.match(new RegExp(key+':\\s*(.+)'))?.[1]?.trim()||'N/A';
  const improved = raw.match(/---IMPROVED---([\s\S]*?)$/)?.[1]?.trim()||'';
  const hookScore = parseInt(get('HOOK_SCORE'))||0;
  const readScore = parseInt(get('READABILITY_SCORE'))||0;
  const engScore  = parseInt(get('ENGAGEMENT_SCORE'))||0;
  const issues    = get('ISSUES').split('|').map(s=>s.trim());

  const out = document.getElementById('analyzeResults'); if (!out) return;
  out.innerHTML = `
    <div class="analysis-scores">
      <div class="analysis-score-item">
        <div class="score-arc" style="--pct:${hookScore}%"><span>${hookScore}</span></div>
        <div class="score-label">Hook</div>
        <div class="score-fb">${get('HOOK_FEEDBACK')}</div>
      </div>
      <div class="analysis-score-item">
        <div class="score-arc" style="--pct:${readScore}%"><span>${readScore}</span></div>
        <div class="score-label">Readability</div>
        <div class="score-fb">${get('READABILITY_FEEDBACK')}</div>
      </div>
      <div class="analysis-score-item">
        <div class="score-arc" style="--pct:${engScore}%"><span>${engScore}</span></div>
        <div class="score-label">Engagement</div>
        <div class="score-fb">${get('ENGAGEMENT_FEEDBACK')}</div>
      </div>
    </div>
    <div class="analysis-issues">
      <strong>⚠️ Top Issues:</strong>
      ${issues.map(i=>`<span class="issue-tag">${esc(i)}</span>`).join('')}
    </div>

    <div style="margin-bottom:14px">
      <button class="btn btn--ghost btn--sm" onclick="downloadScoreCardImage(${hookScore}, ${readScore}, ${engScore})">🖼️ Download Shareable Score Card PNG</button>
    </div>

    ${improved ? `<div class="result-card" style="margin-top:16px">
      <div class="result-card__num">✨ Improved Version</div>
      <div class="result-card__text" id="improved-post" style="white-space:pre-wrap">${esc(improved)}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn--ghost btn--sm" onclick="copyText('improved-post')">📋 Copy</button>
        <button class="btn btn--primary btn--sm" onclick="useImprovedPost()">✓ Use This Post</button>
      </div>
    </div>` : ''}`;
  out.style.display='block';
  document.getElementById('analyzeEmpty').style.display='none';
  window._improvedPost = improved;
}

/* ══ SHAREABLE VIRAL POST SCORE CARD GENERATOR ══ */
function downloadScoreCardImage(hookScore, readScore, engScore) {
  const overall = Math.round((hookScore + readScore + engScore) / 3);
  const W = 1200, H = 630;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#0F172A');
  grad.addColorStop(1, '#020617');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

  // Border Frame
  ctx.strokeStyle = '#0A84FF'; ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, W - 60, H - 60);

  // Header
  ctx.fillStyle = '#0A84FF'; ctx.font = 'bold 22px sans-serif';
  ctx.fillText('POSTCRAFT AI  ✦  VIRAL POST AUDIT REPORT', 70, 90);

  // Overall Score Circle / Text
  ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 72px sans-serif';
  ctx.fillText(`${overall}/100`, 70, 200);
  ctx.fillStyle = overall >= 80 ? '#30D158' : overall >= 60 ? '#F5A623' : '#FF453A';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(overall >= 80 ? '🔥 High Viral Potential' : overall >= 60 ? '⚡ Good Quality' : '⚠️ Needs Hook Optimization', 70, 240);

  // 3 Score Columns
  const drawStat = (label, val, x) => {
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(x, 290, 320, 160);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
    ctx.strokeRect(x, 290, 320, 160);

    ctx.fillStyle = '#A0AEC0'; ctx.font = '18px sans-serif';
    ctx.fillText(label, x + 30, 330);

    ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 48px sans-serif';
    ctx.fillText(`${val}%`, x + 30, 400);
  };

  drawStat('Hook Power', hookScore, 70);
  drawStat('Readability', readScore, 430);
  drawStat('Engagement', engScore, 790);

  // Footer Branding
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'; ctx.font = '18px sans-serif';
  ctx.fillText('Analyzed with PostCraft AI  •  generator-seven.vercel.app', 70, H - 65);

  // Trigger Download
  const a = document.createElement('a');
  a.download = `postcraft-viral-score-${overall}.png`;
  a.href = canvas.toDataURL('image/png');
  a.click();
  toast('✓ Shareable Score Card PNG downloaded!', 'ok');
}


function useImprovedPost() {
  if (!window._improvedPost) return;
  S.post = window._improvedPost;
  renderResult(window._improvedPost);
  saveToHistory(window._improvedPost);
  document.getElementById('generator')?.scrollIntoView({ behavior:'smooth' });
  toast('✓ Improved post applied!','ok');
}

/* ══════════════════════════════════════════
   FEATURE 8: HASHTAG RESEARCH
══════════════════════════════════════════ */
async function generateHashtags() {
  const topic = document.getElementById('hashtagInput')?.value?.trim();
  if (!topic) { toast('⚠️ Please enter a topic','err'); return; }
  setBusy(true,'hashtagBtn','hashtagBtnText',null,'hashtagSpinner','Researching hashtags...');
  try {
    const data = await callAPI({ mode:'hashtags', topic });
    renderHashtags(data.result);
    toast('✓ 20 hashtags ready!','ok');
  } catch(e) { toast(`⚠️ ${e.message||'Failed'}`, 'err'); }
  finally { setBusy(false,'hashtagBtn','hashtagBtnText',null,'hashtagSpinner','🔍 Research Hashtags'); }
}

function renderHashtags(raw) {
  const high   = raw.match(/---HIGH VOLUME---([\s\S]*?)(?=---MID VOLUME---|$)/)?.[1]?.trim()||'';
  const mid    = raw.match(/---MID VOLUME---([\s\S]*?)(?=---NICHE---|$)/)?.[1]?.trim()||'';
  const niche  = raw.match(/---NICHE---([\s\S]*?)$/)?.[1]?.trim()||'';
  const out = document.getElementById('hashtagResults'); if (!out) return;

  const renderGroup = (title, color, text) => {
    const tags = text.split('\n').map(l=>l.trim()).filter(l=>l.startsWith('#'));
    return `<div class="hashtag-group">
      <div class="hashtag-group__title" style="color:${color}">${title}</div>
      <div class="hashtag-tags">${tags.map(t=>`<span class="hashtag-tag" onclick="copyHashtag('${t.split(' ')[0]}')">${esc(t)}</span>`).join('')}</div>
    </div>`;
  };

  out.innerHTML = [
    high  && renderGroup('🔥 High Volume (1M+ followers)','#F5A623',high),
    mid   && renderGroup('⚡ Mid Volume (100K-1M)','#0A84FF',mid),
    niche && renderGroup('🎯 Niche (10K-100K)','#30D158',niche),
  ].filter(Boolean).join('');

  // Copy all button
  const allTags = [high,mid,niche].join('\n').split('\n').map(l=>l.split(' ')[0]).filter(l=>l.startsWith('#')).join(' ');
  out.innerHTML += `<button class="btn btn--primary btn--sm" onclick="copyRaw('${allTags.replace(/'/g,"\\'")}')">📋 Copy All Hashtags</button>`;
  out.style.display='block';
  document.getElementById('hashtagEmpty').style.display='none';
}

function copyHashtag(tag) {
  navigator.clipboard.writeText(tag).then(()=>toast(`✓ ${tag} copied!`,'ok'));
}

function copyRaw(text) {
  navigator.clipboard.writeText(text).then(()=>toast('✓ All hashtags copied!','ok')).catch(()=>toast('⚠️ Copy failed','err'));
}

/* ══════════════════════════════════════════
   FEATURE 9: BEFORE/AFTER TRANSFORMER
══════════════════════════════════════════ */
async function transformPost() {
  const post = document.getElementById('transformInput')?.value?.trim();
  if (!post || post.length < 20) { toast('⚠️ Paste your post (min 20 chars)','err'); return; }
  setBusy(true,'transformBtn','transformBtnText',null,'transformSpinner','Transforming...');
  try {
    const data = await callAPI({ mode:'transform', post });
    renderTransform(data.result, post);
    toast('✓ Post transformed!','ok');
  } catch(e) { toast(`⚠️ ${e.message||'Failed'}`, 'err'); }
  finally { setBusy(false,'transformBtn','transformBtnText',null,'transformSpinner','⚡ Transform My Post'); }
}

function renderTransform(raw, original) {
  const transformed = raw.match(/---TRANSFORMED---([\s\S]*)$/)?.[1]?.trim() || raw;
  const out = document.getElementById('transformResults'); if (!out) return;
  out.innerHTML = `
    <div class="transform-compare">
      <div class="transform-side transform-side--before">
        <div class="transform-label">❌ BEFORE</div>
        <div class="transform-text">${esc(original)}</div>
      </div>
      <div class="transform-arrow">→</div>
      <div class="transform-side transform-side--after">
        <div class="transform-label">✅ AFTER</div>
        <div class="transform-text" id="transformed-post">${esc(transformed)}</div>
      </div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">
      <button class="btn btn--ghost btn--sm" onclick="copyText('transformed-post')">📋 Copy Transformed</button>
      <button class="btn btn--primary btn--sm" onclick="useTransformed('${transformed.replace(/'/g,"\\'").replace(/\n/g,'\\n')}')">✓ Use This Post</button>
    </div>`;
  out.style.display='block';
  document.getElementById('transformEmpty').style.display='none';
}

function useTransformed(text) {
  const post = text.replace(/\\n/g,'\n');
  S.post = post; renderResult(post); saveToHistory(post);
  document.getElementById('generator')?.scrollIntoView({ behavior:'smooth' });
  toast('✓ Transformed post applied!','ok');
}

/* ══════════════════════════════════════════
   FEATURE 10: CREATOR ANALYTICS DASHBOARD
══════════════════════════════════════════ */
let analyticsData = [];

function addAnalyticsRow() {
  const list = document.getElementById('analyticsList'); if (!list) return;
  const idx = analyticsData.length;
  analyticsData.push({ type:'Post', views:0, reactions:0, comments:0 });
  const row = document.createElement('div');
  row.className = 'analytics-row';
  row.id = `arow-${idx}`;
  row.innerHTML = `
    <select onchange="analyticsData[${idx}].type=this.value">
      <option>Post</option><option>Poll</option><option>Carousel</option><option>Video</option>
    </select>
    <input type="number" placeholder="Views" min="0" oninput="analyticsData[${idx}].views=+this.value||0">
    <input type="number" placeholder="Reactions" min="0" oninput="analyticsData[${idx}].reactions=+this.value||0">
    <input type="number" placeholder="Comments" min="0" oninput="analyticsData[${idx}].comments=+this.value||0">
    <button class="btn btn--ghost btn--sm" onclick="removeAnalyticsRow(${idx})">✕</button>`;
  list.appendChild(row);
}

function removeAnalyticsRow(idx) {
  analyticsData.splice(idx,1);
  document.getElementById(`arow-${idx}`)?.remove();
}

function calculateAnalytics() {
  const rows = analyticsData.filter(r=>r.views>0);
  if (!rows.length) { toast('⚠️ Add at least one post with views','err'); return; }

  const totalViews     = rows.reduce((s,r)=>s+r.views,0);
  const totalReactions = rows.reduce((s,r)=>s+r.reactions,0);
  const totalComments  = rows.reduce((s,r)=>s+r.comments,0);
  const avgEngRate     = ((totalReactions+totalComments)/totalViews*100).toFixed(2);

  // Best content type
  const byType = {};
  rows.forEach(r => {
    if (!byType[r.type]) byType[r.type]={views:0,eng:0,count:0};
    byType[r.type].views+=r.views; byType[r.type].eng+=r.reactions+r.comments; byType[r.type].count++;
  });
  const bestType = Object.entries(byType).sort(([,a],[,b])=>(b.eng/b.views)-(a.eng/a.views))[0];
  const engRating = parseFloat(avgEngRate)>2?'🔥 Excellent':parseFloat(avgEngRate)>1?'✅ Good':parseFloat(avgEngRate)>0.5?'⚠️ Average':'❌ Needs Work';

  const out = document.getElementById('analyticsResults'); if (!out) return;
  out.innerHTML = `
    <div class="analytics-grid">
      <div class="analytics-stat"><div class="analytics-val">${avgEngRate}%</div><div class="analytics-key">Avg Engagement Rate</div><div class="analytics-note">${engRating}</div></div>
      <div class="analytics-stat"><div class="analytics-val">${(totalViews/rows.length).toLocaleString()}</div><div class="analytics-key">Avg Views/Post</div></div>
      <div class="analytics-stat"><div class="analytics-val">${(totalReactions/rows.length).toFixed(0)}</div><div class="analytics-key">Avg Reactions/Post</div></div>
      <div class="analytics-stat"><div class="analytics-val">${bestType?bestType[0]:'—'}</div><div class="analytics-key">Best Content Type</div></div>
    </div>
    <div class="analytics-tips">
      <strong>📌 Personalized Tips:</strong>
      <ul>
        ${parseFloat(avgEngRate)<1?'<li>Your engagement rate is below 1%. Focus on writing stronger hooks — the first line decides everything.</li>':''}
        ${parseFloat(avgEngRate)>2?'<li>Great engagement! Try posting 4-5x per week to maximize momentum.</li>':''}
        ${bestType?`<li>${bestType[0]} posts get highest engagement for you. Create more of them!</li>`:''}
        <li>Best time to post: Tuesday-Thursday, 7-9 AM or 12-1 PM (your audience's timezone).</li>
        <li>Always end posts with a question to boost comments by 2-3x.</li>
      </ul>
    </div>`;
  out.style.display='block';
}

/* ══════════════════════════════════════════
   POST HISTORY (Gap #4: Export/Import Added)
══════════════════════════════════════════ */
function saveToHistory(post) {
  try {
    const history = getHistory();
    const entry = { id:Date.now(), post, preview:post.slice(0,100).replace(/\n/g,' '), date:new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}), style:S.style };
    localStorage.setItem(CONFIG.HISTORY_KEY, JSON.stringify([entry,...history].slice(0,20)));
    updateHistoryBadge();
  } catch(e) {}
}

function getHistory() {
  try { return JSON.parse(localStorage.getItem(CONFIG.HISTORY_KEY)||'[]'); } catch { return []; }
}

function updateHistoryBadge() {
  const count = getHistory().length;
  const b = document.getElementById('historyBadge');
  if (b) { b.textContent=count; b.style.display=count?'inline-flex':'none'; }
}

function openHistoryPanel() {
  const history = getHistory();
  const panel = document.getElementById('historyList'); if (!panel) return;
  panel.innerHTML = !history.length
    ? '<div class="history-empty">No saved posts yet.<br>Generate your first post! ✦</div>'
    : history.map(h=>`
      <div class="history-item" onclick="restoreFromHistory(${h.id})">
        <div class="history-item__meta">
          <span class="history-item__date">📅 ${h.date}</span>
          <span class="history-item__style">${h.style}</span>
        </div>
        <div class="history-item__preview">${esc(h.preview)}…</div>
        <div class="history-item__cta">Click to restore →</div>
      </div>`).join('');
  document.getElementById('historyOverlay').style.display='flex';
  document.body.style.overflow='hidden';
}

function closeHistoryPanel() { document.getElementById('historyOverlay').style.display='none'; document.body.style.overflow=''; }

function restoreFromHistory(id) {
  const entry = getHistory().find(h=>h.id===id); if (!entry) return;
  S.post = entry.post; renderResult(entry.post); closeHistoryPanel();
  document.getElementById('generator')?.scrollIntoView({ behavior:'smooth' });
  toast('✓ Post restored!','ok');
}

function clearHistory() {
  if (!confirm('Clear all saved posts?')) return;
  localStorage.removeItem(CONFIG.HISTORY_KEY); updateHistoryBadge(); closeHistoryPanel(); toast('History cleared','ok');
}

/* ── Gap #4: Export/Import History ── */
function exportHistory() {
  const h = getHistory();
  if (!h.length) { toast('⚠️ No history to export','err'); return; }
  const blob = new Blob([JSON.stringify(h,null,2)],{type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download='postcraft-history.json'; a.click();
  toast('✓ History exported!','ok');
}

function importHistory() {
  const inp = document.createElement('input'); inp.type='file'; inp.accept='.json';
  inp.onchange = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!Array.isArray(data)) throw new Error('Invalid format');
        const existing = getHistory();
        const merged = [...data,...existing].slice(0,20);
        localStorage.setItem(CONFIG.HISTORY_KEY, JSON.stringify(merged));
        updateHistoryBadge(); closeHistoryPanel(); openHistoryPanel();
        toast(`✓ ${data.length} posts imported!`,'ok');
      } catch { toast('⚠️ Invalid file format','err'); }
    };
    reader.readAsText(file);
  };
  inp.click();
}

/* ══ CAROUSEL 5 COLOR THEMES ══ */
let currentCarouselTheme = 'dark';

const CAROUSEL_THEMES = {
  dark:      { bg: ['#0A1628','#100E2A','#0A2010','#1A0A28','#1A1400'], accent: ['#0A84FF','#A78BFA','#30D158','#C084FC','#F5A623'], text: '#FFFFFF' },
  light:     { bg: ['#F8FAFC','#F1F5F9','#E2E8F0','#EDF2F7','#FEF3C7'], accent: ['#2563EB','#7C3AED','#059669','#D97706','#DC2626'], text: '#0F172A' },
  neon:      { bg: ['#100E2A','#1D0033','#001F2D','#2D001E','#0D0D0D'], accent: ['#A78BFA','#F472B6','#38BDF8','#FACC15','#4ADE80'], text: '#FFFFFF' },
  corporate: { bg: ['#0F172A','#1E293B','#0F2942','#132043','#001C30'], accent: ['#38BDF8','#60A5FA','#818CF8','#2DD4BF','#F43F5E'], text: '#FFFFFF' },
  sunset:    { bg: ['#1C0A28','#2A0826','#2B1009','#1F0322','#150529'], accent: ['#F5A623','#FF6B35','#F43F5E','#E879F9','#FACC15'], text: '#FFFFFF' }
};

function selectCarouselTheme(theme) {
  currentCarouselTheme = theme;
  document.querySelectorAll('.ctheme-btn').forEach(b => b.classList.toggle('ctheme-btn--active', b.dataset.theme === theme));
  
  const slides = document.querySelectorAll('#carouselSlidesContainer .carousel-slide');
  const t = CAROUSEL_THEMES[theme] || CAROUSEL_THEMES.dark;
  slides.forEach((slide, i) => {
    slide.style.background = t.bg[i % t.bg.length];
    slide.style.color = t.text;
    const num = slide.querySelector('.carousel-slide__num');
    if (num) { num.style.color = t.accent[i % t.accent.length]; }
  });
  toast(`🎨 Theme updated: ${theme}`, 'ok');
}

/* ══ CSV EXPORT FOR HISTORY ══ */
function exportHistoryCSV() {
  const h = getHistory();
  if (!h.length) { toast('⚠️ No history to export', 'err'); return; }
  
  let csv = 'ID,Date,Style,Post Content\n';
  h.forEach(row => {
    const cleanPost = `"${(row.post||'').replace(/"/g, '""')}"`;
    csv += `"${row.id}","${row.date}","${row.style}",${cleanPost}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'postcraft-history.csv';
  a.click();
  toast('✓ Exported CSV for Excel/Google Sheets!', 'ok');
}

/* ══ LINKEDIN POST TITLE CARD / BANNER IMAGE GENERATOR ══ */
function downloadPostImage() {
  if (!S.post) { toast('⚠️ No post to generate image for', 'err'); return; }

  const lines = S.post.split('\n').filter(l => l.trim() !== '');
  const title = lines[0] || 'LinkedIn Growth Insight';
  const subtitle = lines[1] || lines[2] || 'PostCraft AI • Viral Content Suite';

  const W = 1200, H = 630;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background Gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#0A1628');
  grad.addColorStop(0.5, '#100E2A');
  grad.addColorStop(1, '#080A14');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Decorative Accent Blobs
  ctx.fillStyle = 'rgba(10, 132, 255, 0.12)';
  ctx.beginPath(); ctx.arc(150, 100, 220, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(94, 92, 230, 0.12)';
  ctx.beginPath(); ctx.arc(W - 120, H - 80, 260, 0, Math.PI * 2); ctx.fill();

  // Border Frame
  ctx.strokeStyle = 'rgba(10, 132, 255, 0.4)';
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, W - 60, H - 60);

  // Brand Header
  ctx.fillStyle = '#0A84FF';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('POSTCRAFT AI  ✦  LINKEDIN CREATOR TOOL', 70, 90);

  // Main Title Text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px sans-serif';
  wrapCanvasText(ctx, title, 70, 200, W - 140, 50);

  // Subtitle / Body Snippet
  ctx.fillStyle = '#A0AEC0';
  ctx.font = '22px sans-serif';
  wrapCanvasText(ctx, subtitle, 70, 400, W - 140, 36);

  // Footer Tagline
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = '18px sans-serif';
  ctx.fillText('generator-seven.vercel.app  •  100% Free Forever', 70, H - 65);

  // Trigger Download
  const a = document.createElement('a');
  a.download = 'linkedin-post-title-card.png';
  a.href = canvas.toDataURL('image/png');
  a.click();
  toast('✓ High-res Post Image PNG downloaded!', 'ok');
}

/* ══════════════════════════════════════════
   CAROUSEL — PDF & PNG GENERATORS
══════════════════════════════════════════ */
function openCarouselModal() {
  if (!S.post) return;
  const container = document.getElementById('carouselSlidesContainer'); if (!container) return;
  const lines = S.post.split('\n').filter(l=>l.trim()!=='');
  const hook = lines[0]||'Key Insight';
  const body = lines.slice(1,-1);
  const cta  = lines[lines.length-1]||'Follow for more!';
  const slideContents = [{ title:'HOOK', text:hook }];
  let chunk='';
  body.forEach((p,idx) => {
    chunk+=(chunk?'\n\n':'')+p;
    if (chunk.length>120||idx===body.length-1) { slideContents.push({ title:`KEY POINT ${slideContents.length}`, text:chunk }); chunk=''; }
  });
  slideContents.push({ title:'ACTION', text:cta });
  
  const t = CAROUSEL_THEMES[currentCarouselTheme] || CAROUSEL_THEMES.dark;

  container.innerHTML = slideContents.map((s,i) => `
    <div class="carousel-slide" data-idx="${i}" style="background:${t.bg[i%t.bg.length]};color:${t.text}">
      <div class="carousel-slide__num" style="color:${t.accent[i%t.accent.length]}">Slide ${i+1} / ${slideContents.length}</div>
      <div class="carousel-slide__text">${esc(s.text)}</div>
      <div class="carousel-slide__foot"><span>PostCraft AI</span><span>Swipe ➔</span></div>
    </div>`).join('');
  document.getElementById('carouselOverlay').style.display='flex';
  document.body.style.overflow='hidden';
}

function closeCarouselModal() { document.getElementById('carouselOverlay').style.display='none'; document.body.style.overflow=''; }

function printCarouselPdf() {
  const slides = document.querySelectorAll('#carouselSlidesContainer .carousel-slide');
  if (!slides.length) return;
  const t = CAROUSEL_THEMES[currentCarouselTheme] || CAROUSEL_THEMES.dark;
  const slideData = [...slides].map((s,i) => ({
    num: s.querySelector('.carousel-slide__num')?.textContent||'',
    text: s.querySelector('.carousel-slide__text')?.textContent||'',
    bg: t.bg[i%t.bg.length], accent: t.accent[i%t.accent.length]
  }));
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>LinkedIn Carousel</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet">
  <style>*{margin:0;padding:0;box-sizing:border-box}@page{size:600px 600px;margin:0}body{background:#000;font-family:'DM Sans',sans-serif}
  .slide{width:600px;height:600px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:56px;page-break-after:always}
  .brand{font-family:'Syne',sans-serif;font-size:11px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;margin-bottom:22px}
  .num{font-size:10px;letter-spacing:.1em;text-transform:uppercase;margin-bottom:24px;opacity:.6}
  .text{color:#fff;font-size:22px;font-weight:500;line-height:1.65;max-width:440px;white-space:pre-wrap}
  .foot{position:absolute;bottom:28px;font-size:10px;color:rgba(255,255,255,.28)}</style></head><body>
  ${slideData.map(s=>`<div class="slide" style="background:${s.bg}">
    <div class="brand" style="color:${s.accent}">PostCraft AI</div>
    <div class="num" style="color:${s.accent}">${s.num}</div>
    <div class="text">${s.text.replace(/</g,'&lt;')}</div>
    <div class="foot">PostCraft AI • Free LinkedIn Content Generator</div>
  </div>`).join('')}
  <script>window.onload=()=>setTimeout(()=>window.print(),400)<\/script></body></html>`;
  const win = window.open('','_blank','width=640,height=680');
  if (!win) { toast('⚠️ Popup blocked! Allow popups and try again.','err'); return; }
  win.document.open(); win.document.write(html); win.document.close();
}

function downloadCarouselPng() {
  const slides = document.querySelectorAll('#carouselSlidesContainer .carousel-slide');
  if (!slides.length) { toast('⚠️ No slides to download','err'); return; }
  const t = CAROUSEL_THEMES[currentCarouselTheme] || CAROUSEL_THEMES.dark;
  const W = 400, H = 400;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H * slides.length;
  const ctx = canvas.getContext('2d');

  [...slides].forEach((slide,i) => {
    const y = i*H;
    ctx.fillStyle = t.bg[i%t.bg.length]; ctx.fillRect(0,y,W,H);
    ctx.fillStyle = t.accent[i%t.accent.length]; ctx.font = 'bold 10px sans-serif'; ctx.textAlign='center';
    ctx.fillText('PostCraft AI', W/2, y+32);
    ctx.fillStyle = t.text; ctx.font = '15px sans-serif';
    const text = slide.querySelector('.carousel-slide__text')?.textContent||'';
    wrapCanvasText(ctx, text, W/2, y+H/2-30, W-60, 22);
    ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.font='9px sans-serif';
    ctx.fillText('PostCraft AI • Free LinkedIn Content Generator', W/2, y+H-18);
  });

  const a = document.createElement('a');
  a.download = `linkedin-carousel-${currentCarouselTheme}.png`;
  a.href = canvas.toDataURL('image/png'); a.click();
  toast('✓ PNG downloaded!','ok');
}

function wrapCanvasText(ctx, text, x, y, maxW, lineH) {
  const words = text.split(' ');
  let line = '';
  let cy = y;
  words.forEach(word => {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxW && line !== '') {
      ctx.fillText(line.trim(), x, cy); line = word+' '; cy += lineH;
    } else { line = test; }
  });
  if (line.trim()) ctx.fillText(line.trim(), x, cy);
}


/* ══════════════════════════════════════════
   RENDER RESULT (Gap #1: Inline Editing)
══════════════════════════════════════════ */
function renderResult(post) {
  document.getElementById('emptyState').style.display='none';
  const result = document.getElementById('result'); result.style.display='flex';

  // Gap #1: contenteditable post preview
  const preview = document.getElementById('postPreview');
  preview.setAttribute('contenteditable','true');
  preview.innerHTML = post.split('\n').map(l=>l.trim()===''?'<br>':
    `<span>${esc(l)}</span>`).join('\n');

  // Gap #1: Live update S.post on edit
  preview.oninput = () => {
    S.post = preview.innerText;
    updateCharCount(S.post.length);
  };

  document.getElementById('reactions').textContent = rnd(80,450);
  document.getElementById('comments').textContent  = rnd(12,70);

  updateCharCount(post.length);

  setTimeout(()=>calcScores(post), 280);
  result.scrollIntoView({ behavior:'smooth', block:'nearest' });
}

/* ── SMART LINKEDIN SHARE (MOBILE + DESKTOP) ── */
async function shareOnLinkedIn() {
  if (!S.post) {
    toast('⚠️ No post generated to share','err');
    return;
  }

  // 1. Copy post text to clipboard
  try {
    await navigator.clipboard.writeText(S.post);
    toast('📋 Post copied! In LinkedIn app: tap (+) -> Paste','ok');
  } catch(e) {
    toast('📋 Opening LinkedIn...','ok');
  }

  const text = encodeURIComponent(S.post);
  const shareUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${text}`;

  // 2. Open LinkedIn
  setTimeout(() => {
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  }, 300);
}




function updateCharCount(len) {
  const el = document.getElementById('postCharCount'); if (!el) return;
  const pct = Math.round((len/CONFIG.LI_CHAR_LIMIT)*100);
  const over = len > CONFIG.LI_CHAR_LIMIT;
  el.innerHTML = `
    <div class="char-limit-bar"><div class="char-limit-fill${over?' char-limit-fill--over':''}" style="width:${Math.min(pct,100)}%"></div></div>
    <span class="${over?'char-limit--over':'char-limit--ok'}">${over?'⚠️':'✓'} ${len.toLocaleString()} / ${CONFIG.LI_CHAR_LIMIT.toLocaleString()} chars${over?' — <strong>Exceeds LinkedIn limit!</strong>':''}</span>`;
}

/* ══════════════════════════════════════════
   SCORES
══════════════════════════════════════════ */
function calcScores(text) {
  const words = text.split(/\s+/).length;
  const lines = text.split('\n').filter(l=>l.trim());
  const first = lines[0]||'';
  const hasQ = text.includes('?'), hasH = /#\w+/.test(text), hasE = /\p{Emoji}/u.test(text);
  const avgLen = lines.reduce((s,l)=>s+l.length,0)/(lines.length||1);
  const hook = cap(60+(first.length>28?14:0)+(!first.startsWith('I ')?10:0)+((first.includes('!')||first.includes('?'))?11:0),96);
  const read = cap(52+(avgLen<80?24:8)+(lines.length>4?14:4)+(words<280?10:0),97);
  const eng  = cap(55+(hasQ?15:0)+(hasH?12:0)+(hasE?8:0)+(words>100?10:0),96);
  setScore('hookFill','hookNum',hook); setScore('readFill','readNum',read); setScore('engFill','engNum',eng);
}

function setScore(fId, nId, val) {
  const f=document.getElementById(fId), n=document.getElementById(nId);
  if (f) { f.style.width='0%'; setTimeout(()=>{f.style.width=val+'%';},40);
    f.style.background=val>=80?'linear-gradient(90deg,#30D158,#34D399)':val>=60?'linear-gradient(90deg,#0A84FF,#5E5CE6)':'linear-gradient(90deg,#F5A623,#FF6B35)'; }
  if (n) n.textContent=val+'%';
}

async function copyPost() {
  if (!S.post) return;
  try {
    await navigator.clipboard.writeText(S.post);
    const btn=document.getElementById('copyBtn');
    if (btn) { const t=btn.textContent; btn.textContent='✓ Copied!'; setTimeout(()=>btn.textContent=t,2000); }
    toast('✓ Copied to clipboard!','ok');
  } catch { toast('⚠️ Copy failed','err'); }
}

async function copyText(elId) {
  const el=document.getElementById(elId); if (!el) return;
  try { await navigator.clipboard.writeText(el.textContent.trim()); toast('✓ Copied!','ok'); }
  catch { toast('⚠️ Copy failed','err'); }
}

/* ══════════════════════════════════════════
   SMART API CALL
══════════════════════════════════════════ */
async function callAPI(payload) {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const rawText = await res.text();
  let data;
  try {
    data = JSON.parse(rawText);
  } catch (e) {
    console.error('API Non-JSON response:', rawText);
    throw new Error(`Server error (${res.status}): Try again in a few seconds.`);
  }

  if (!res.ok || data.error) {
    throw new Error(data.error || `Server error (${res.status})`);
  }

  return data;
}


/* ══════════════════════════════════════════
   TOOL TABS SWITCHER
══════════════════════════════════════════ */
function switchTool(tool) {
  document.querySelectorAll('.tool-tab').forEach(t=>t.classList.remove('tool-tab--active'));
  document.querySelectorAll('.tool-panel').forEach(p=>p.classList.remove('tool-panel--active'));
  event.target.classList.add('tool-tab--active');
  document.getElementById('tool-'+tool)?.classList.add('tool-panel--active');
  window.location.hash = tool; // Gap #7
}

/* ══════════════════════════════════════════
   SET BUSY
══════════════════════════════════════════ */
function setBusy(on,btnId,txtId,icnId,spinId,loadTxt) {
  const btn=document.getElementById(btnId), txt=document.getElementById(txtId);
  const icn=icnId?document.getElementById(icnId):null, spin=document.getElementById(spinId);
  if (btn) btn.disabled=on;
  if (txt) { if (!txt.dataset.orig) txt.dataset.orig=txt.textContent; txt.textContent=on?loadTxt:txt.dataset.orig; }
  if (icn) icn.style.display=on?'none':'inline';
  if (spin) spin.style.display=on?'inline-block':'none';
}

/* ══════════════════════════════════════════
   UTILS
══════════════════════════════════════════ */
let toastTid;
function toast(msg,type='') {
  const el=document.getElementById('toast'); if (!el) return;
  clearTimeout(toastTid); el.textContent=msg;
  el.className='toast'+(type?` toast-${type}`:''); el.style.display='block';
  toastTid=setTimeout(()=>el.style.display='none',4200);
}
function esc(s) { const d=document.createElement('div'); d.appendChild(document.createTextNode(s)); return d.innerHTML; }
function rnd(a,b) { return Math.floor(Math.random()*(b-a+1))+a; }
function cap(v,max) { return Math.min(v,max); }

document.addEventListener('keydown',e=>{
  if ((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();generatePost();}
  if (e.key==='Escape'){closeCarouselModal();closeHistoryPanel();closeVariationsModal();closeHookLibrary();}
});
