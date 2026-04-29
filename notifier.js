// notifier.js — แจ้งเตือนออเดอร์ใหม่ด้วยเสียงคนพูดภาษาไทย + visual alert
// ใช้ร่วมกัน kitchen.html + index.html
window.OrderNotifier = (function () {
  const KEY = 'orderNotifier';
  const settings = {
    enabled: localStorage.getItem(KEY + '.enabled') !== '0',
    volume: parseFloat(localStorage.getItem(KEY + '.volume') || '1'),
    repeatSec: 30,
    rate: parseFloat(localStorage.getItem(KEY + '.rate') || '1.0'),
  };

  const seenPendingIds = new Set();
  let firstLoad = true;
  let repeatTimer = null;
  let unlocked = false;
  let lastPendingCount = 0;
  const originalTitle = document.title;
  let getOrdersFn = null; // injected by check()

  // ===== Web Speech API (เสียงคนพูดไทย) =====
  function speak(text) {
    if (!settings.enabled) return;
    if (!('speechSynthesis' in window)) {
      playBeep();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'th-TH';
      u.rate = settings.rate;
      u.pitch = 1.1;
      u.volume = settings.volume;
      const voices = window.speechSynthesis.getVoices();
      const thaiVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('th'));
      if (thaiVoice) u.voice = thaiVoice;
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.warn('TTS failed, fallback to beep:', e);
      playBeep();
    }
  }

  // ===== Fallback: Web Audio beep =====
  let _ctx = null;
  function getCtx() {
    if (!_ctx) {
      try { _ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    }
    return _ctx;
  }
  function playBeep() {
    const ctx = getCtx();
    if (!ctx) return;
    try {
      // Double beep — มีเอกลักษณ์มากกว่า beep เดียว
      [880, 1100].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.value = 0;
        const t0 = ctx.currentTime + i * 0.25;
        gain.gain.linearRampToValueAtTime(settings.volume * 0.4, t0 + 0.02);
        gain.gain.linearRampToValueAtTime(0, t0 + 0.18);
        osc.start(t0);
        osc.stop(t0 + 0.2);
      });
    } catch (e) {}
  }

  // ===== Audio unlock — เพราะ browser ต้องมี user interaction ก่อน =====
  function unlock() {
    if (unlocked) return;
    unlocked = true;
    try {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0; u.lang = 'th-TH';
      window.speechSynthesis.speak(u);
    } catch (e) {}
    try { getCtx() && getCtx().resume(); } catch (e) {}
    showBanner('✓ เปิดเสียงแจ้งเตือนแล้ว — เมื่อมีออเดอร์ใหม่จะได้ยิน', 2500, '#16a34a');
    hideUnlockBanner();
    // Test sound briefly
    setTimeout(() => speak('พร้อมรับออเดอร์'), 300);
  }

  // ===== Visual: tab title + flash + banner =====
  function setTitle(pendingCount) {
    if (pendingCount > 0) document.title = `🔔(${pendingCount}) ${originalTitle}`;
    else document.title = originalTitle;
  }
  function flash() {
    if (!document.body) return;
    document.body.classList.add('order-flash-on');
    setTimeout(() => document.body.classList.remove('order-flash-on'), 600);
  }
  function showBanner(msg, ms, color) {
    let el = document.getElementById('orderNotifierToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'orderNotifierToast';
      el.style.cssText = `position:fixed;top:12px;left:50%;transform:translateX(-50%);
        background:${color || '#dc2626'};color:#fff;padding:10px 20px;border-radius:999px;
        font-size:14px;font-weight:700;z-index:99999;box-shadow:0 6px 20px rgba(0,0,0,.25);
        font-family:inherit;max-width:90vw;text-align:center`;
      document.body.appendChild(el);
    } else {
      el.style.background = color || '#dc2626';
    }
    el.textContent = msg;
    el.style.display = 'block';
    clearTimeout(el._t);
    if (ms) el._t = setTimeout(() => { el.style.display = 'none'; }, ms);
  }

  // ===== Unlock banner =====
  let unlockBannerEl = null;
  function showUnlockBanner() {
    if (unlocked) return;
    if (unlockBannerEl) return;
    const el = document.createElement('div');
    el.id = 'orderNotifierUnlock';
    el.style.cssText = `position:fixed;bottom:12px;left:50%;transform:translateX(-50%);
      background:linear-gradient(135deg,#1652F0,#0738C9);color:#fff;
      padding:12px 22px;border-radius:999px;font-size:14px;font-weight:700;
      z-index:99998;box-shadow:0 6px 20px rgba(22,82,240,.4);cursor:pointer;
      font-family:inherit;display:flex;align-items:center;gap:8px;
      animation:orderUnlockPulse 1.6s ease-in-out infinite`;
    el.innerHTML = '🔊 กดที่นี่เพื่อเปิดเสียงแจ้งเตือนออเดอร์';
    el.onclick = unlock;
    document.body.appendChild(el);
    unlockBannerEl = el;
  }
  function hideUnlockBanner() {
    if (unlockBannerEl) { unlockBannerEl.remove(); unlockBannerEl = null; }
  }

  // ===== Inject CSS =====
  const style = document.createElement('style');
  style.textContent = `
    @keyframes orderFlashKf { 0%,100%{background-color:transparent} 50%{background-color:rgba(220,38,38,.18)} }
    body.order-flash-on { animation: orderFlashKf .55s ease-in-out; }
    @keyframes orderUnlockPulse { 0%,100%{transform:translateX(-50%) scale(1)} 50%{transform:translateX(-50%) scale(1.05)} }
  `;
  document.head.appendChild(style);

  // ===== Pre-load Thai voices (some browsers load async) =====
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {};
  }

  // ===== Repeat timer =====
  function startRepeat() {
    if (repeatTimer) return;
    repeatTimer = setInterval(() => {
      const orders = getOrdersFn ? getOrdersFn() : [];
      const c = orders.filter(o => o.status === 'pending').length;
      if (c <= 0) { stopRepeat(); return; }
      speak(`มีออเดอร์รอยืนยัน ${c} รายการ`);
      flash();
    }, settings.repeatSec * 1000);
  }
  function stopRepeat() {
    if (repeatTimer) { clearInterval(repeatTimer); repeatTimer = null; }
  }

  // ===== Main entry: เรียกทุกครั้งที่ orders เปลี่ยน =====
  function check(orders, opts) {
    opts = opts || {};
    getOrdersFn = opts.getOrders || (() => orders);

    const pending = orders.filter(o => o.status === 'pending');
    const newOnes = pending.filter(o => !seenPendingIds.has(o.id));
    pending.forEach(o => seenPendingIds.add(o.id));

    setTitle(pending.length);

    // Show unlock banner if not unlocked yet AND there are/will be orders
    if (!unlocked && settings.enabled) showUnlockBanner();

    // First load — แค่ track + start repeat ถ้ามีของเก่ารอ ไม่ต้องเด้งเสียงใหม่
    if (firstLoad) {
      firstLoad = false;
      lastPendingCount = pending.length;
      if (pending.length > 0) startRepeat();
      return;
    }

    // มี order ใหม่เข้ามา → alert
    if (newOnes.length > 0) {
      const msg = newOnes.length === 1
        ? 'ออเดอร์มาใหม่!'
        : `ออเดอร์มาใหม่ ${newOnes.length} รายการ!`;
      speak(msg);
      flash();
      showBanner('🔔 ' + msg, 4000, '#dc2626');
    }

    // Manage repeat timer
    if (pending.length > 0) startRepeat();
    else stopRepeat();

    lastPendingCount = pending.length;
  }

  // Auto-unlock บน first click ที่ไหนก็ได้
  document.addEventListener('click', () => unlock(), { once: false, capture: true });
  document.addEventListener('touchstart', () => unlock(), { once: false, capture: true });

  return {
    check,
    unlock,
    test() {
      unlock();
      speak('ทดสอบเสียงแจ้งเตือน ออเดอร์มาใหม่');
      flash();
      showBanner('🔔 ทดสอบเสียง', 2000, '#1652F0');
    },
    setEnabled(v) {
      settings.enabled = !!v;
      localStorage.setItem(KEY + '.enabled', v ? '1' : '0');
      if (!v) { stopRepeat(); document.title = originalTitle; hideUnlockBanner(); }
    },
    isEnabled() { return settings.enabled; },
    setVolume(v) {
      settings.volume = Math.max(0, Math.min(1, parseFloat(v) || 0));
      localStorage.setItem(KEY + '.volume', String(settings.volume));
    },
    getVolume() { return settings.volume; },
    setRate(v) {
      settings.rate = Math.max(0.5, Math.min(2, parseFloat(v) || 1));
      localStorage.setItem(KEY + '.rate', String(settings.rate));
    },
    getRate() { return settings.rate; },
    isUnlocked() { return unlocked; },
  };
})();
