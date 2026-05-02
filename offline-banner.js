// 🌐 Offline / Firebase-down banner
// Sticky red banner at the top of any page that includes this script.
// Triggers when:
//   1. navigator.onLine === false (browser offline)
//   2. window.cloud isn't ready 12s after page load (Firebase init failed)
//   3. window.cloud.ready was true but a recent operation timed out
//      (set window.cloudErrorMode = true from the calling page if needed)
(function () {
  'use strict';

  function show(msg, opts = {}) {
    let b = document.getElementById('offlineBanner');
    const bg = opts.bg || 'linear-gradient(135deg,#dc2626,#991b1b)';
    if (!b) {
      b = document.createElement('div');
      b.id = 'offlineBanner';
      b.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:300;color:#fff;padding:8px 14px;text-align:center;font-weight:700;font-size:12.5px;font-family:-apple-system,"Segoe UI","Sarabun",sans-serif;box-shadow:0 2px 10px rgba(0,0,0,.25)';
      document.body.insertBefore(b, document.body.firstChild);
    }
    b.style.background = bg;
    b.innerHTML = msg;
  }

  function hide() {
    document.getElementById('offlineBanner')?.remove();
  }

  // Determine page-appropriate offline message
  const path = location.pathname;
  let offlineMsg, cloudErrorMsg;
  if (/menu\.html/.test(path) || path.endsWith('/') || path.endsWith('/index.html')) {
    offlineMsg     = '⚠️ ออฟไลน์ — สั่งซื้อยังทำได้ แต่จะส่งให้ครัวเมื่อกลับออนไลน์';
    cloudErrorMsg  = '⚠️ ระบบ cloud มีปัญหา — ข้อมูลอาจไม่อัพเดท · โทร 061-962-3696';
  } else if (/points\.html/.test(path)) {
    offlineMsg     = '⚠️ ออฟไลน์ — แต้มอาจแสดงค่าเก่า · ลองใหม่เมื่อกลับออนไลน์';
    cloudErrorMsg  = '⚠️ ระบบ cloud มีปัญหา — ข้อมูลแต้มอาจไม่อัพเดท';
  } else if (/status\.html/.test(path)) {
    offlineMsg     = '⚠️ ออฟไลน์ — สถานะออเดอร์อาจไม่ตรง ลองรีเฟรชเมื่อกลับออนไลน์';
    cloudErrorMsg  = '⚠️ ระบบ cloud มีปัญหา — ออเดอร์อาจอัพเดทช้า · โทร 061-962-3696';
  } else if (/kitchen\.html/.test(path)) {
    offlineMsg     = '⚠️ ออฟไลน์ — ออเดอร์ใหม่จะไม่เข้า · ตรวจ wifi ด่วน';
    cloudErrorMsg  = '⚠️ Firebase ไม่ตอบ — ออเดอร์อาจไม่เข้า · ตรวจ wifi / refresh หน้านี้';
  } else {
    // Admin / settings / other
    offlineMsg     = '⚠️ ออฟไลน์ — การเปลี่ยนแปลงจะ sync เมื่อกลับออนไลน์';
    cloudErrorMsg  = '⚠️ ระบบ cloud มีปัญหา — ข้อมูลอาจไม่ sync · ลอง refresh';
  }

  // Wire up online/offline events
  window.addEventListener('online',  () => hide());
  window.addEventListener('offline', () => show(offlineMsg));
  if (!navigator.onLine) show(offlineMsg);

  // Detect Firebase failure — show after 12s if cloud isn't ready
  setTimeout(() => {
    if (!window.cloud?.ready && navigator.onLine) {
      show(cloudErrorMsg);
    }
  }, 12000);

  // Periodic re-check every 30s — covers the case where cloud was ready
  // initially but then disconnected (auth expired, network blip, etc.)
  setInterval(() => {
    if (!navigator.onLine) {
      show(offlineMsg);
    } else if (window.cloudErrorMode === true) {
      show(cloudErrorMsg);
    } else if (document.getElementById('offlineBanner') && window.cloud?.ready && !window.cloudErrorMode) {
      // Cloud is back — clear the banner if it's still showing
      hide();
    }
  }, 30000);

  // Expose for manual control from page code
  window.OfflineBanner = { show, hide };
})();
