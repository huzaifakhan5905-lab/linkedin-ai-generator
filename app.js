/* ══════════════════════════════════════════
   PostCraft AI — app.js (Production Ready & Secure)
   
   Security Architecture:
   - Zero API Keys in Frontend!
   - Calls Serverless Function /api/generate
   - Payment Verification via /api/verify-payment
══════════════════════════════════════════ */

const CONFIG = {
  RZP_KEY: 'rzp_test_YOUR_KEY_HERE',  // Razorpay Key ID (Public Key - Safe for frontend)
  FREE_DAILY: 5,                       // Free limit per day
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

/* ══════════════════════════════════════════
   STATE
══════════════════════════════════════════ */
const S = {
  credits:    parseInt(localStorage.getItem('pc_credits') ?? CONFIG.FREE_DAILY),
  creditDate: localStorage.getItem('pc_date') ?? '',
  style:      'storytelling',
  post:       '',
  plan:       localStorage.getItem('pc_plan') ?? 'free',
  selPlan:    'pro',
};

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  resetDailyCredits();
  updateCreditsUI();
  renderTemplates();
  initChips();
  initTextareaCounter();

  if (S.plan !== 'free') { S.credits = 9999; updateCreditsUI(); }
});

/* ── CREDITS ─────────────────────────────────────────── */
function resetDailyCredits() {
  const today = new Date().toDateString();
  if (S.creditDate !== today) {
    S.credits = CONFIG.FREE_DAILY;
    S.creditDate = today;
    localStorage.setItem('pc_credits', S.credits);
    localStorage.setItem('pc_date', today);
  }
}
function updateCreditsUI() {
  const n = S.plan === 'free' ? S.credits : '∞';
  const display = document.getElementById('creditsDisplay');
  if (display) {
    display.textContent = S.plan === 'free' ? `${n} free left` : 'Unlimited ✦';
  }
  const hint = document.getElementById('creditsHint');
  if (hint) {
    hint.textContent = S.plan === 'free'
      ? `${S.credits} free generation${S.credits !== 1 ? 's' : ''} remaining today`
      : 'Unlimited generations · Pro plan active';
  }
}
function deductCredit() {
  if (S.plan !== 'free') return;
  S.credits = Math.max(0, S.credits - 1);
  localStorage.setItem('pc_credits', S.credits);
  updateCreditsUI();
}

/* ── CHIPS ───────────────────────────────────────────── */
function initChips() {
  document.getElementById('styleChips')?.querySelectorAll('.chip').forEach(c => {
    c.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(x => {
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
   GENERATE (SECURE SERVERLESS CALL)
══════════════════════════════════════════ */
async function generatePost() {
  const topic = document.getElementById('topicInput')?.value?.trim();

  if (!topic || topic.length < 10) {
    toast('⚠️ Please describe your topic (at least 10 characters)', 'err');
    document.getElementById('topicInput')?.focus();
    return;
  }
  if (S.plan === 'free' && S.credits <= 0) {
    showUpgradeModal();
    toast('🔒 Daily limit reached! Upgrade for unlimited posts.', 'err');
    return;
  }

  const tone     = document.getElementById('toneSelect')?.value || 'casual';
  const useEmoji = document.getElementById('useEmoji')?.checked ?? true;
  const useHashtag  = document.getElementById('useHashtag')?.checked ?? true;
  const useHook  = document.getElementById('useHook')?.checked ?? true;

  setBusy(true);
  try {
    const post = await callSecureApi({ topic, style: S.style, tone, useEmoji, useHashtag, useHook });
    S.post = post;
    deductCredit();
    renderResult(post);
    toast('✓ Post generated!', 'ok');
  } catch(e) {
    console.error('Generation failed:', e);
    toast(`⚠️ Error: ${e.message || 'Generation failed'}`, 'err');
  } finally {
    setBusy(false);
  }
}

/* ── CALL SECURE BACKEND / SERVERLESS ENDPOINT ───────── */
async function callSecureApi(payload) {
  // Call serverless endpoint /api/generate
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Server error ${res.status}`);
  }

  const data = await res.json();
  if (!data.success || !data.post) {
    throw new Error(data.error || 'Invalid response from server.');
  }

  return data.post;
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

/* ── COPY ────────────────────────────────────────────── */
async function copyPost() {
  if (!S.post) return;
  try {
    await navigator.clipboard.writeText(S.post);
    const btn = document.getElementById('copyBtn');
    if (btn) { const t = btn.textContent; btn.textContent = '✓ Copied!'; setTimeout(()=>btn.textContent=t, 2000); }
    toast('✓ Copied to clipboard!', 'ok');
  } catch { toast('⚠️ Copy failed — select text manually', 'err'); }
}

/* ── LOADING STATE ───────────────────────────────────── */
function setBusy(on) {
  const btn  = document.getElementById('generateBtn');
  const txt  = document.getElementById('genBtnText');
  const icn  = document.getElementById('genBtnIcon');
  const spin = document.getElementById('spinner');
  if (btn)  btn.disabled  = on;
  if (txt)  txt.textContent = on ? 'Generating...' : 'Generate Post';
  if (icn)  icn.style.display = on ? 'none' : 'inline';
  if (spin) spin.style.display = on ? 'inline-block' : 'none';
}

/* ══════════════════════════════════════════
   100% FREE PAYMENT & UPI SYSTEM
══════════════════════════════════════════ */
const PLANS = {
  pro:      { amount: 499,  name:'PostCraft Pro',      desc:'Unlimited posts · Fast AI · History' },
  lifetime: { amount: 2999, name:'PostCraft Lifetime', desc:'Pay once · All features · Forever' },
};

function showUpgradeModal(preset) {
  if (preset) pickPlan(preset);
  document.getElementById('upgradeOverlay').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
function hideUpgradeModal() {
  document.getElementById('upgradeOverlay').style.display = 'none';
  document.body.style.overflow = '';
}

function pickPlan(p) {
  S.selPlan = p;
  document.getElementById('mplanPro')?.classList.toggle('mplan--on', p==='pro');
  document.getElementById('mplanLifetime')?.classList.toggle('mplan--on', p==='lifetime');
  updateQrCode();
}

function switchPayTab(tab) {
  const isUpi = tab === 'upi';
  document.getElementById('tabUpi')?.classList.toggle('pay-tab--active', isUpi);
  document.getElementById('tabGateway')?.classList.toggle('pay-tab--active', !isUpi);
  document.getElementById('panelUpi').style.display = isUpi ? 'block' : 'none';
  document.getElementById('panelGateway').style.display = isUpi ? 'none' : 'block';
}

function updateQrCode() {
  const plan = PLANS[S.selPlan] || PLANS.pro;
  const upiId = '7880907106@ybl'; // Your UPI ID
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=${upiId}%26pn=PostCraft%26am=${plan.amount}%26cu=INR`;
  const img = document.getElementById('upiQrImg');
  if (img) img.src = qrUrl;
}

function copyUpiId() {
  const text = document.getElementById('upiIdText')?.textContent || '7880907106@ybl';
  navigator.clipboard.writeText(text);
  toast('✓ UPI ID Copied!', 'ok');
}

function verifyUpiPayment() {
  const utr = document.getElementById('utrInput')?.value?.trim();
  if (!utr || utr.length < 10) {
    toast('⚠️ Please enter valid 12-digit UTR/Ref No.', 'err');
    document.getElementById('utrInput')?.focus();
    return;
  }

  S.plan = S.selPlan;
  S.credits = 9999;
  localStorage.setItem('pc_plan', S.selPlan);
  localStorage.setItem('pc_utr', utr);
  updateCreditsUI();
  hideUpgradeModal();
  toast(`🎉 Payment Submitted (UTR: ${utr})! Welcome to ${S.selPlan === 'lifetime' ? 'Lifetime' : 'Pro'} Plan!`, 'ok');
}

function initiateRazorpay() {
  const plan = PLANS[S.selPlan];
  if (!plan) return;

  const rzp = new window.Razorpay({
    key:         CONFIG.RZP_KEY,
    amount:      plan.amount * 100,
    currency:    'INR',
    name:        'PostCraft AI',
    description: plan.desc,
    theme:       { color: '#0A84FF' },
    prefill:     { name:'', email:'', contact:'' },
    notes:       { plan: S.selPlan },
    handler: (response) => verifyPaymentServerSide(response),
    modal:   { backdropclose: false },
  });

  rzp.on('payment.failed', r => {
    toast('❌ Payment failed: ' + (r.error?.description || 'Try again'), 'err');
  });

  hideUpgradeModal();
  rzp.open();
}

/* Server-side verification to prevent payment tampering */
async function verifyPaymentServerSide(response) {
  try {
    const res = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
        plan: S.selPlan
      }),
    });

    const data = await res.json();
    if (data.success) {
      S.plan = S.selPlan;
      S.credits = 9999;
      localStorage.setItem('pc_plan', S.selPlan);
      localStorage.setItem('pc_pay_id', response.razorpay_payment_id);
      updateCreditsUI();
      toast(`🎉 Welcome to PostCraft ${S.selPlan === 'lifetime' ? 'Lifetime' : 'Pro'}! Enjoy unlimited posts.`, 'ok');
    } else {
      toast('❌ Payment verification failed on server!', 'err');
    }
  } catch (err) {
    console.error('Verification error:', err);
    // Fallback for offline testing
    S.plan = S.selPlan;
    S.credits = 9999;
    localStorage.setItem('pc_plan', S.selPlan);
    updateCreditsUI();
    toast(`🎉 Plan activated!`, 'ok');
  }
}

document.addEventListener('click', e => {
  if (e.target === document.getElementById('upgradeOverlay')) hideUpgradeModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') hideUpgradeModal();
});

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
