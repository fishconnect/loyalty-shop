// notifier.js — แจ้งเตือนออเดอร์ใหม่ด้วย beep + เสียงคนพูดภาษาไทย + visual alert
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
  const originalTitle = document.title;
  let getOrdersFn = null;
  let voicesReady = false;
  let cachedVoices = [];

  function log(...args) { try { console.log('[Notifier]', ...args); } catch (e) {} }

  // ===== Load voices (Chrome ต้องรอ async) =====
  function refreshVoices() {
    if (!('speechSynthesis' in window)) return;
    try {
      cachedVoices = window.speechSynthesis.getVoices() || [];
      if (cachedVoices.length > 0) voicesReady = true;
      log('Voices loaded:', cachedVoices.length, 'Thai:', cachedVoices.filter(v => v.lang && v.lang.toLowerCase().startsWith('th')).map(v => v.name));
    } catch (e) { log('refreshVoices err', e); }
  }
  if ('speechSynthesis' in window) {
    refreshVoices();
    window.speechSynthesis.onvoiceschanged = refreshVoices;
  }

  // ===== Web Audio (beep) — ทำงานแน่ๆ ทุก browser =====
  let _ctx = null;
  function getCtx() {
    if (!_ctx) {
      try { _ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { log('AudioContext fail', e); }
    }
    if (_ctx && _ctx.state === 'suspended') {
      _ctx.resume().catch(e => log('resume fail', e));
    }
    return _ctx;
  }

  function playBeep(pattern) {
    const ctx = getCtx();
    if (!ctx) { log('no audio context'); return; }
    pattern = pattern || [880, 1200, 880]; // 3-note alert
    try {
      pattern.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        const t0 = ctx.currentTime + i * 0.18;
        const dur = 0.15;
        gain.gain.setValueAtTime(0, t0);
        gain.gain.linearRampToValueAtTime(settings.volume * 0.5, t0 + 0.02);
        gain.gain.linearRampToValueAtTime(0, t0 + dur);
        osc.start(t0);
        osc.stop(t0 + dur + 0.01);
      });
      log('Beep played, volume:', settings.volume);
    } catch (e) { log('beep err', e); }
  }

  // ===== Web Speech API (เสียงคนพูดไทย) =====
  function speak(text) {
    if (!settings.enabled) return;
    if (!('speechSynthesis' in window)) { log('No speechSynthesis'); return; }
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'th-TH';
      u.rate = settings.rate;
      u.pitch = 1.1;
      u.volume = settings.volume;
      if (!voicesReady) refreshVoices();
      const thaiVoice = cachedVoices.find(v => v.lang && v.lang.toLowerCase().startsWith('th'));
      if (thaiVoice) {
        u.voice = thaiVoice;
        log('Speak (th):', text, 'voice:', thaiVoice.name);
      } else {
        log('Speak (no Thai voice — using default):', text);
      }
      u.onerror = (e) => log('TTS error:', e.error || e);
      u.onend = () => log('TTS ended:', text);
      window.speechSynthesis.speak(u);
    } catch (e) { log('speak err', e); }
  }

  // ===== Unlock audio =====
  function unlock() {
    if (unlocked) return;
    unlocked = true;
    log('Unlock triggered');
    try {
      const ctx = getCtx();
      if (ctx) ctx.resume();
    } catch (e) {}
    try {
      // Some browsers need a silent utterance to unlock TTS
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0; u.lang = 'th-TH';
      window.speechSynthesis.speak(u);
    } catch (e) {}
    hideUnlockBanner();
    showBanner('✓ เปิดเสียงแจ้งเตือนแล้ว', 2200, '#16a34a');
    // Confirm with a small beep so user knows it's working
    setTimeout(() => playBeep([700, 1000]), 100);
    setTimeout(() => speak('พร้อมรับออเดอร์'), 400);
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
    if (unlocked || unlockBannerEl) return;
    if (!settings.enabled) return;
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', showUnlockBanner, { once: true });
      return;
    }
    const el = document.createElement('div');
    el.id = 'orderNotifierUnlock';
    el.style.cssText = `position:fixed;bottom:16px;left:50%;transform:translateX(-50%);
      background:linear-gradient(135deg,#dc2626,#991b1b);color:#fff;
      padding:14px 24px;border-radius:999px;font-size:15px;font-weight:800;
      z-index:99998;box-shadow:0 8px 24px rgba(220,38,38,.5);cursor:pointer;
      font-family:inherit;display:flex;align-items:center;gap:8px;
      animation:orderUnlockPulse 1.4s ease-in-out infinite;
      max-width:92vw;text-align:center`;
    el.innerHTML = '🔊 กดที่นี่เพื่อเปิดเสียงแจ้งเตือน';
    el.onclick = (ev) => { ev.stopPropagation(); unlock(); };
    document.body.appendChild(el);
    unlockBannerEl = el;
    log('Unlock banner shown');
  }
  function hideUnlockBanner() {
    if (unlockBannerEl) { unlockBannerEl.remove(); unlockBannerEl = null; }
  }

  // ===== Inject CSS =====
  const style = document.createElement('style');
  style.textContent = `
    @keyframes orderFlashKf { 0%,100%{background-color:transparent} 50%{background-color:rgba(220,38,38,.18)} }
    body.order-flash-on { animation: orderFlashKf .55s ease-in-out; }
    @keyframes orderUnlockPulse { 0%,100%{transform:translateX(-50%) scale(1)} 50%{transform:translateX(-50%) scale(1.06)} }
  `;
  document.head.appendChild(style);

  // ===== Repeat timer =====
  function startRepeat() {
    if (repeatTimer) return;
    log('Repeat started');
    repeatTimer = setInterval(() => {
      const orders = getOrdersFn ? getOrdersFn() : [];
      const c = orders.filter(o => o.status === 'pending').length;
      if (c <= 0) { stopRepeat(); return; }
      log('Repeat alert, count:', c);
      playBeep([880, 1200, 880]);
      speak(`มีออเดอร์รอยืนยัน ${c} รายการ`);
      flash();
    }, settings.repeatSec * 1000);
  }
  function stopRepeat() {
    if (repeatTimer) { clearInterval(repeatTimer); repeatTimer = null; log('Repeat stopped'); }
  }

  // ===== Main entry =====
  function check(orders, opts) {
    opts = opts || {};
    getOrdersFn = opts.getOrders || (() => orders);

    const pending = orders.filter(o => o.status === 'pending');
    const newOnes = pending.filter(o => !seenPendingIds.has(o.id));
    pending.forEach(o => seenPendingIds.add(o.id));

    setTitle(pending.length);

    if (firstLoad) {
      firstLoad = false;
      log('First load. pending:', pending.length, 'unlocked:', unlocked);
      if (pending.length > 0) startRepeat();
      return;
    }

    if (newOnes.length > 0) {
      const msg = newOnes.length === 1 ? 'ออเดอร์มาใหม่!' : `ออเดอร์มาใหม่ ${newOnes.length} รายการ!`;
      log('NEW ORDER!', msg, 'unlocked:', unlocked);
      playBeep([880, 1200, 1500, 1200, 880]); // attention-grabbing pattern
      speak(msg);
      flash();
      showBanner('🔔 ' + msg, 4000, '#dc2626');
      // If audio not unlocked, show unlock banner
      if (!unlocked) showUnlockBanner();
    }

    if (pending.length > 0) startRepeat();
    else stopRepeat();
  }

  // ===== Listen for ANY user interaction to unlock =====
  function tryUnlock() { if (!unlocked) unlock(); }
  ['click', 'touchstart', 'touchend', 'keydown', 'pointerdown'].forEach(ev => {
    document.addEventListener(ev, tryUnlock, { capture: true, passive: true });
  });

  // ===== Show unlock banner on page load (after small delay) =====
  function init() {
    setTimeout(() => {
      if (!unlocked && settings.enabled) showUnlockBanner();
    }, 800);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  log('OrderNotifier loaded. enabled:', settings.enabled, 'volume:', settings.volume);

  return {
    check, unlock,
    test() {
      log('TEST sound triggered');
      unlock();
      // Force play beep IMMEDIATELY (in user gesture context)
      playBeep([880, 1200, 1500, 1200, 880]);
      flash();
      showBanner('🔔 ทดสอบเสียง — ถ้าไม่ได้ยินบีบ ตรวจระดับเสียงเครื่อง', 3500, '#1652F0');
      setTimeout(() => speak('ทดสอบเสียงแจ้งเตือน ออเดอร์มาใหม่'), 700);
    },
    setEnabled(v) {
      settings.enabled = !!v;
      localStorage.setItem(KEY + '.enabled', v ? '1' : '0');
      if (!v) { stopRepeat(); document.title = originalTitle; hideUnlockBanner(); }
      else if (!unlocked) showUnlockBanner();
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
    _debug: { settings, getCtx, refreshVoices, get cachedVoices() { return cachedVoices; } }
  };
})();
