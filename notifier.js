// notifier.js — แจ้งเตือนออเดอร์ใหม่ด้วย beep ต่อเนื่อง จนกดยืนยัน
// ใช้ร่วมกัน kitchen.html + index.html
window.OrderNotifier = (function () {
  const KEY = 'orderNotifier';
  const settings = {
    enabled: localStorage.getItem(KEY + '.enabled') !== '0',
    volume: parseFloat(localStorage.getItem(KEY + '.volume') || '1'),
    repeatSec: parseFloat(localStorage.getItem(KEY + '.repeatSec') || '2'),
  };

  const seenPendingIds = new Set();
  let firstLoad = true;
  let repeatTimer = null;
  let unlocked = false;
  let wakeLock = null;
  const originalTitle = document.title;
  let getOrdersFn = null;

  function log(...args) { try { console.log('[Notifier]', ...args); } catch (e) {} }

  // ===== Vibration (mobile) =====
  function vibrate(pattern) {
    if (!navigator.vibrate) return;
    try { navigator.vibrate(pattern || [400, 120, 400, 120, 600]); } catch (e) { log('vibrate err', e); }
  }

  // ===== OS Notification (works on locked screen if permission granted) =====
  function fireOSNotification(count) {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    try {
      const n = new Notification('🔔 ออเดอร์ใหม่ที่ครัวผู้ใหญ่ปอง', {
        body: count === 1 ? 'มีออเดอร์ใหม่ — กดเพื่อรับ' : `มีออเดอร์ใหม่ ${count} รายการ — กดเพื่อรับ`,
        tag: 'kitchen-order',
        renotify: true,
        requireInteraction: true,
        vibrate: [400, 120, 400, 120, 600, 120, 400],
        icon: 'logo.jpg',
        badge: 'logo.jpg'
      });
      n.onclick = () => { window.focus(); try { n.close(); } catch (e) {} };
      log('OS notification fired');
    } catch (e) { log('OS notif fail', e); }
  }

  async function requestNotifPermission() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    try {
      const r = await Notification.requestPermission();
      log('Notification permission:', r);
      return r === 'granted';
    } catch (e) { log('notif perm err', e); return false; }
  }

  // ===== Wake Lock (keep screen on while pending) =====
  async function acquireWakeLock() {
    if (wakeLock) return;
    if (!('wakeLock' in navigator)) { log('WakeLock unsupported'); return; }
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => {
        log('WakeLock released by system');
        wakeLock = null;
      });
      log('WakeLock acquired');
    } catch (e) { log('WakeLock fail', e); }
  }
  async function releaseWakeLock() {
    if (!wakeLock) return;
    try { await wakeLock.release(); } catch (e) {}
    wakeLock = null;
    log('WakeLock released');
  }
  // Re-acquire when tab becomes visible (system auto-releases when hidden)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      const orders = getOrdersFn ? getOrdersFn() : [];
      if (orders.some(o => o.status === 'pending')) acquireWakeLock();
    }
  });

  // ===== Web Audio (beep) =====
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

  // ===== Unlock audio + ask for notification permission (must be on user gesture) =====
  function unlock() {
    if (unlocked) return;
    unlocked = true;
    log('Unlock triggered');
    try {
      const ctx = getCtx();
      if (ctx) ctx.resume();
    } catch (e) {}
    hideUnlockBanner();
    // Ask for OS notification permission (so we can wake the phone when screen is off)
    requestNotifPermission().then(granted => {
      log('Permission granted on unlock:', granted);
    });
    // Test vibration so user knows it works
    vibrate([100, 50, 100]);
    showBanner('✓ เปิดเสียงแจ้งเตือนแล้ว', 2200, '#16a34a');
    setTimeout(() => playBeep([700, 1000]), 100);
  }

  // ===== Visual =====
  function setTitle(pendingCount) {
    if (pendingCount > 0) document.title = `🔔(${pendingCount}) ${originalTitle}`;
    else document.title = originalTitle;
  }
  function flash() {
    if (!document.body) return;
    document.body.classList.add('order-flash-on');
    setTimeout(() => document.body.classList.remove('order-flash-on'), 500);
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

  // ===== CSS =====
  const style = document.createElement('style');
  style.textContent = `
    @keyframes orderFlashKf { 0%,100%{background-color:transparent} 50%{background-color:rgba(220,38,38,.18)} }
    body.order-flash-on { animation: orderFlashKf .45s ease-in-out; }
    @keyframes orderUnlockPulse { 0%,100%{transform:translateX(-50%) scale(1)} 50%{transform:translateX(-50%) scale(1.06)} }
  `;
  document.head.appendChild(style);

  // ===== Continuous repeat (until confirmed) =====
  function startRepeat() {
    if (repeatTimer) return;
    log('Repeat started, every', settings.repeatSec, 'sec');
    // Acquire wake lock so screen stays on while pending
    acquireWakeLock();
    repeatTimer = setInterval(() => {
      const orders = getOrdersFn ? getOrdersFn() : [];
      const c = orders.filter(o => o.status === 'pending').length;
      if (c <= 0) { stopRepeat(); return; }
      log('Continuous beep, pending:', c);
      playBeep([880, 1200, 880]);
      vibrate([300, 100, 300]);
      flash();
      // Re-fire OS notification every cycle (with renotify it pulses)
      fireOSNotification(c);
    }, settings.repeatSec * 1000);
  }
  function stopRepeat() {
    if (repeatTimer) { clearInterval(repeatTimer); repeatTimer = null; log('Repeat stopped'); }
    releaseWakeLock();
    // Close any open OS notification
    try {
      if ('Notification' in window && navigator.serviceWorker) {
        navigator.serviceWorker.getRegistrations?.().then(regs => regs.forEach(r => r.getNotifications?.({tag:'kitchen-order'}).then(ns => ns.forEach(n => n.close()))));
      }
    } catch (e) {}
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
      if (pending.length > 0) {
        startRepeat();
        // Also fire OS notification on first load if pending exists (admin reopened tab)
        fireOSNotification(pending.length);
      }
      return;
    }

    if (newOnes.length > 0) {
      const msg = newOnes.length === 1 ? 'ออเดอร์มาใหม่!' : `ออเดอร์มาใหม่ ${newOnes.length} รายการ!`;
      log('NEW ORDER!', msg);
      playBeep([880, 1200, 1500, 1200, 880]); // attention-grabbing pattern
      vibrate([500, 150, 500, 150, 800]);     // strong vibration
      flash();
      fireOSNotification(pending.length);
      showBanner('🔔 ' + msg, 4000, '#dc2626');
      if (!unlocked) showUnlockBanner();
    }

    if (pending.length > 0) startRepeat();
    else stopRepeat();
  }

  // ===== Auto-unlock on any user gesture =====
  function tryUnlock() { if (!unlocked) unlock(); }
  ['click', 'touchstart', 'touchend', 'keydown', 'pointerdown'].forEach(ev => {
    document.addEventListener(ev, tryUnlock, { capture: true, passive: true });
  });

  // ===== Show unlock banner on page load =====
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

  log('OrderNotifier loaded. enabled:', settings.enabled, 'volume:', settings.volume, 'repeatSec:', settings.repeatSec, 'wakeLock:', 'wakeLock' in navigator, 'notif:', 'Notification' in window);

  return {
    check, unlock,
    test() {
      log('TEST sound triggered');
      unlock();
      playBeep([880, 1200, 1500, 1200, 880]);
      vibrate([500, 150, 500, 150, 800]);
      fireOSNotification(1);
      flash();
      showBanner('🔔 ทดสอบเสียง · สั่น · OS notification — ถ้าไม่เห็น notification ให้อนุญาตในเบราว์เซอร์', 4500, '#1652F0');
    },
    requestNotifPermission,
    isNotifGranted() { return 'Notification' in window && Notification.permission === 'granted'; },
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
    setRepeatSec(v) {
      settings.repeatSec = Math.max(0.5, Math.min(10, parseFloat(v) || 2));
      localStorage.setItem(KEY + '.repeatSec', String(settings.repeatSec));
      if (repeatTimer) { stopRepeat(); startRepeat(); }
    },
    getRepeatSec() { return settings.repeatSec; },
    isUnlocked() { return unlocked; },
  };
})();
