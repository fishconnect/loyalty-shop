// Menu data — แก้ไขได้ที่นี่ที่เดียว
window.SHOP_INFO = {
  name: "ครัวผู้ใหญ่ปอง",
  tagline: "อาหารตามสั่ง · ก๋วยเตี๋ยว · เครื่องดื่ม",
  phone: "061-962-3696",
  logo: "logo.jpg",
  defaultImage: "assets/menu-placeholder.jpg",
  // 📍 Shop coordinates — used for distance validation on delivery orders.
  lat: 13.667149,
  lng: 100.188090,
  deliveryRadiusKm: 7, // hard limit — orders beyond this distance are blocked
};

// 🔒 PDPA policy version — bump when privacy.html / tos.html materially change.
// Customer-facing pages (menu/points/status) all read this so we don't have to
// edit 3 files every time. Cookie banner re-shows when version changes.
window.PDPA_POLICY_VERSION = '1.1';

// 🔒 Device ID — random per browser, stored in localStorage. Used to identify
// "is this device trusted by this customer?" for PDPA-compliant access control.
// Same device across visits → same ID. Cleared if user clears browser data.
window.getDeviceId = function() {
  let id = '';
  try { id = localStorage.getItem('deviceId') || ''; } catch (e) {}
  if (!id) {
    id = 'd-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
    try { localStorage.setItem('deviceId', id); } catch (e) {}
  }
  return id;
};

// 🔐 PIN session helpers — 365-day "remember me" by default. Stores phone +
//    expiry in localStorage so customers stay logged in for a year on each
//    browser. Cross-browser (Facebook in-app vs Safari) still requires
//    re-entering PIN on each, but ONLY ONCE per browser per year.
window.PIN_SESSION_KEY = 'pinSession';
window.PIN_SESSION_DAYS = 365;
window.savePinSession = function(phone) {
  try {
    const expiresAt = Date.now() + (window.PIN_SESSION_DAYS * 24 * 60 * 60 * 1000);
    localStorage.setItem(window.PIN_SESSION_KEY, JSON.stringify({ phone: String(phone), expiresAt }));
    // Backward compat: also write the legacy key some pages still read
    localStorage.setItem('pinSessionPhone', String(phone));
  } catch (e) {}
};
window.getPinSessionPhone = function() {
  try {
    const raw = localStorage.getItem(window.PIN_SESSION_KEY);
    if (raw) {
      const o = JSON.parse(raw);
      if (o && o.phone && o.expiresAt && o.expiresAt > Date.now()) return o.phone;
      // Expired — clear
      localStorage.removeItem(window.PIN_SESSION_KEY);
      localStorage.removeItem('pinSessionPhone');
      return null;
    }
    // Legacy key fallback (no expiry — accept once, then upgrade to dated session)
    const legacy = localStorage.getItem('pinSessionPhone');
    if (legacy) {
      window.savePinSession(legacy);
      return legacy;
    }
  } catch (e) {}
  return null;
};
window.clearPinSession = function() {
  try {
    localStorage.removeItem(window.PIN_SESSION_KEY);
    localStorage.removeItem('pinSessionPhone');
  } catch (e) {}
};

// 📱 Detect if the page is being shown inside an in-app browser
//    (Facebook, Messenger, Instagram, LINE, TikTok, etc.). Each app has its
//    own webview with isolated localStorage/cookies, so PIN sessions stored
//    on one app don't carry to Safari/Chrome — leading to "have to log in
//    again" friction. We use this to show a "เปิดใน Safari/Chrome" banner.
window.isInAppBrowser = function() {
  const ua = navigator.userAgent || '';
  return /FBAN|FBAV|FB_IAB|FBIOS|Instagram|Line\/|TikTok|BytedanceWebview|Snapchat|wv|Twitter/i.test(ua);
};

// Identify which app for tailored instructions
window.detectInAppBrowser = function() {
  const ua = navigator.userAgent || '';
  if (/FBAN|FBAV|FB_IAB|FBIOS/i.test(ua)) return 'facebook';
  if (/Instagram/i.test(ua)) return 'instagram';
  if (/Line\//i.test(ua)) return 'line';
  if (/TikTok|BytedanceWebview/i.test(ua)) return 'tiktok';
  if (/Snapchat/i.test(ua)) return 'snapchat';
  if (/Twitter/i.test(ua)) return 'twitter';
  if (/wv/i.test(ua)) return 'webview';
  return null;
};

// Best-effort "open in real browser" — works on Android via intent://
//    On iOS, no programmatic way exists (sandbox), so we return false and
//    the caller should show instructions instead.
window.tryOpenExternalBrowser = function() {
  const isAndroid = /Android/i.test(navigator.userAgent);
  if (!isAndroid) return false;
  const url = location.href;
  // Strip protocol so intent:// can prepend it
  const stripped = url.replace(/^https?:\/\//, '');
  // intent URL: tries Chrome first, falls back to system default
  const intentUrl = `intent://${stripped}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end`;
  location.href = intentUrl;
  return true;
};

// 🪧 Mount the "open in browser" banner at the top of the page if we detect
//    a Facebook/LINE/Instagram in-app browser. Persistent dismissal: once
//    user closes it, sessionStorage flag means it won't re-show this session.
window.mountInAppBrowserBanner = function() {
  if (!window.isInAppBrowser || !window.isInAppBrowser()) return;
  if (sessionStorage.getItem('inAppBannerDismissed') === '1') return;
  if (document.getElementById('inAppBrowserBanner')) return; // already mounted

  const isAndroid = /Android/i.test(navigator.userAgent);
  const app = (window.detectInAppBrowser && window.detectInAppBrowser()) || 'app';
  const appLabels = {
    facebook: 'Facebook', instagram: 'Instagram', line: 'LINE',
    tiktok: 'TikTok', snapchat: 'Snapchat', twitter: 'Twitter', webview: 'แอป',
  };
  const appName = appLabels[app] || 'แอป';

  const banner = document.createElement('div');
  banner.id = 'inAppBrowserBanner';
  banner.style.cssText = 'position:sticky;top:0;left:0;right:0;background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#78350f;padding:10px 14px;font-size:13px;line-height:1.5;z-index:9000;box-shadow:0 2px 8px rgba(0,0,0,.1);font-family:inherit';
  banner.innerHTML = `
    <div style="display:flex;align-items:flex-start;gap:8px;max-width:600px;margin:0 auto">
      <div style="flex:1;min-width:0">
        <div style="font-weight:800;margin-bottom:2px">💡 คุณกำลังเปิดผ่าน ${appName}</div>
        <div style="font-size:11.5px;color:#92400e">
          ${isAndroid
            ? 'กดปุ่มขวาเพื่อเปิดใน Chrome — จะไม่ต้องใส่ PIN ทุกครั้ง'
            : 'กดปุ่มขวาเพื่อดูวิธีเปิดใน Safari — ใส่ PIN แค่ครั้งเดียว'}
        </div>
      </div>
      ${isAndroid
        ? `<button onclick="window.tryOpenExternalBrowser()" style="flex-shrink:0;padding:8px 12px;background:#78350f;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit;white-space:nowrap">📱 เปิดใน Chrome</button>`
        : `<button onclick="window.showOpenInSafariHelp()" style="flex-shrink:0;padding:8px 12px;background:#78350f;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit;white-space:nowrap">📋 วิธีเปิด</button>`}
      <button onclick="document.getElementById('inAppBrowserBanner').remove();sessionStorage.setItem('inAppBannerDismissed','1')" style="flex-shrink:0;padding:8px 10px;background:transparent;color:#78350f;border:1.5px solid #78350f;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit" title="ปิด">✕</button>
    </div>
  `;
  document.body.insertBefore(banner, document.body.firstChild);
};

// iOS instructions modal — show how to open in Safari from FB/IG/LINE
window.showOpenInSafariHelp = function() {
  const app = (window.detectInAppBrowser && window.detectInAppBrowser()) || 'facebook';
  const url = location.href;

  // App-specific menu location hint
  const hint = {
    facebook: 'กดเมนู ⋯ มุมขวาบน → เลือก "เปิดใน Safari"',
    instagram: 'กดเมนู ⋯ มุมขวาบน → เลือก "เปิดใน Browser ภายนอก"',
    line: 'กดเมนู ⋯ มุมขวาบน → เลือก "เปิดด้วยเบราว์เซอร์อื่น"',
    tiktok: 'กดเมนู ⋯ มุมขวาบน → เลือก "เปิดใน Safari"',
  }[app] || 'กดเมนู ⋯ มุมบน แล้วหา "เปิดใน Safari/Browser"';

  let modal = document.getElementById('safariHelpModal');
  if (modal) modal.remove();
  modal = document.createElement('div');
  modal.id = 'safariHelpModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;font-family:inherit';
  modal.innerHTML = `
    <div style="background:#fff;max-width:420px;width:100%;border-radius:18px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.3)">
      <div style="padding:16px 20px;background:linear-gradient(135deg,#1652F0,#0738C9);color:#fff">
        <div style="font-size:18px;font-weight:900">📲 วิธีเปิดใน Safari</div>
        <div style="font-size:12px;opacity:.9;margin-top:2px">เปิดในเบราว์เซอร์ปกติ = ไม่ต้องใส่ PIN ทุกครั้ง</div>
      </div>
      <div style="padding:20px;font-size:14px;line-height:1.7;color:#0a1530">
        <div style="background:#fef3c7;border-radius:10px;padding:12px;margin-bottom:14px;font-weight:700">
          🔍 <b>${hint}</b>
        </div>
        <div style="font-size:13px;color:#5c6982">หรือ คัดลอกลิงก์แล้ววางใน Safari/Chrome เอง:</div>
        <div style="background:#f3f4f6;padding:10px;border-radius:8px;font-family:'SF Mono',Menlo,monospace;font-size:11px;word-break:break-all;margin-top:6px;border:1px dashed #d1d5db">${url}</div>
        <button onclick="navigator.clipboard.writeText('${url.replace(/'/g, "\\'")}').then(()=>{const b=document.getElementById('copyBtn');if(b){b.textContent='✓ คัดลอกแล้ว';b.style.background='#16a34a';}})" id="copyBtn" style="display:block;width:100%;margin-top:8px;padding:11px;background:#1652F0;color:#fff;border:none;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit">📋 คัดลอกลิงก์</button>
      </div>
      <div style="padding:14px 20px;border-top:1px solid #e5e7eb;background:#f7f8fb">
        <button onclick="document.getElementById('safariHelpModal').remove()" style="width:100%;padding:11px;background:#fff;color:#1652F0;border:1.5px solid #1652F0;border-radius:8px;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit">เข้าใจแล้ว</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  // Click outside to close
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
};

// 🍳 OPTION PRESETS — exposed to admin UI so when shop owner adds a new
//    custom menu item, they can pick which option groups apply (spice level,
//    protein selection, egg, premium, etc.) without writing JSON.
//
//    Each preset has:
//      - label   : display text in the admin dropdown
//      - desc    : short description of the choices
//      - build() : returns the actual option group object
//
//    Custom items in menuConfig.custom[] reference presets via
//    `optionPresetKeys: ['spice_level', 'egg_5']`. applyMenuConfig() (below)
//    materializes these into real optionGroups at render time.
window.OPTION_PRESETS = {
  protein_required_basic: {
    label: '🥩 เลือกเนื้อ (1 อย่าง บังคับ)',
    desc: 'หมูชิ้น/หมูสับ/ไก่/แหนม',
    build: () => ({ kind: 'required', label: '🥩 เลือกเนื้อ (1 อย่าง · ไม่คิดเงินเพิ่ม)', min: 1, max: 1, priceEach: 0, choices: ['หมูชิ้น','หมูสับ','ไก่','แหนม'] }),
  },
  protein_required_kaopad_kai: {
    label: '🥩 เลือกเนื้อ ข้าวไข่เจียว',
    desc: 'หมูสับ/ไก่สับ/แหนม',
    build: () => ({ kind: 'required', label: '🥩 เลือกเนื้อ (1 อย่าง · ไม่คิดเงินเพิ่ม)', min: 1, max: 1, priceEach: 0, choices: ['หมูสับ','ไก่สับ','แหนม'] }),
  },
  protein_required_noodle: {
    label: '🥩 เลือกเนื้อผัด/ราดหน้า',
    desc: 'หมูชิ้น/หมูสับ/ไก่',
    build: () => ({ kind: 'required', label: '🥩 เลือกเนื้อ (1 อย่าง · ไม่คิดเงินเพิ่ม)', min: 1, max: 1, priceEach: 0, choices: ['หมูชิ้น','หมูสับ','ไก่'] }),
  },
  protein_basic_kaprao: {
    label: '🥩 เนื้อพื้นฐานกระเพรา 0-3 อย่าง (ฟรี)',
    desc: 'หมูสับ/หมูชิ้น/ไก่/เครื่องในไก่/หน่อไม้ดอง',
    build: () => ({ kind: 'addOn', label: '🥩 เนื้อพื้นฐาน (เลือก 1-3 · ไม่คิดเงินเพิ่ม)', min: 0, max: 3, priceEach: 0, choices: ['หมูสับ','หมูชิ้น','ไก่','เครื่องในไก่','หน่อไม้ดอง'] }),
  },
  protein_basic_tomyum: {
    label: '🥩 เนื้อพื้นฐานต้มยำ 0-3 อย่าง (ฟรี)',
    desc: 'หมูสับ/หมูชิ้น/ไก่',
    build: () => ({ kind: 'addOn', label: '🥩 เนื้อพื้นฐาน (เลือก 1-3 · ไม่คิดเงินเพิ่ม)', min: 0, max: 3, priceEach: 0, choices: ['หมูสับ','หมูชิ้น','ไก่'] }),
  },
  premium_kaprao: {
    label: '🦐 พรีเมี่ยมกระเพรา +10',
    desc: 'หมูกรอบ/กุ้ง/ปลาหมึก/ไข่เยี้ยวม้า/รวมมิตร/ไข่ข้น',
    build: () => ({ kind: 'addOn', label: '🦐 เนื้อพรีเมี่ยม (+10 ต่อรายการ)', min: 0, max: 99, priceEach: 10, choices: ['หมูกรอบ','กุ้ง','ปลาหมึก','ไข่เยี้ยวม้า','รวมมิตร(หมู+หมึก+กุ้ง)','ไข่ข้น'] }),
  },
  premium_kaopad: {
    label: '🦐 พรีเมี่ยมข้าวผัด/ผัดทั่วไป +10',
    desc: 'รวมมิตร/กุ้ง/ปลาหมึก/หมูกรอบ',
    build: () => ({ kind: 'addOn', label: '🦐 เนื้อพรีเมี่ยม (+10 ต่อรายการ)', min: 0, max: 99, priceEach: 10, choices: ['รวมมิตร(หมู+หมึก+กุ้ง)','กุ้ง','ปลาหมึก','หมูกรอบ'] }),
  },
  premium_tomyum: {
    label: '🦐 พรีเมี่ยมต้มยำ +10',
    desc: 'กุ้ง/ปลาหมึก/รวมมิตร',
    build: () => ({ kind: 'addOn', label: '🦐 เนื้อพรีเมี่ยม (+10 ต่อรายการ)', min: 0, max: 99, priceEach: 10, choices: ['กุ้ง','ปลาหมึก','รวมมิตร(หมู+หมึก+กุ้ง)'] }),
  },
  spice_level: {
    label: '🌶️ ระดับความเผ็ด',
    desc: 'ไม่เผ็ด/น้อย/ปกติ/มาก',
    build: () => ({ kind: 'required', label: '🌶️ ระดับความเผ็ด', min: 1, max: 1, priceEach: 0, choices: ['ไม่เผ็ด','เผ็ดน้อย','เผ็ดปรกติ','เผ็ดมาก'] }),
  },
  egg_5: {
    label: '🥚 เพิ่มไข่ +5',
    desc: 'ไข่ดาวสุก/ไม่สุก/เจียว/ต้ม',
    build: () => ({ kind: 'addOn', label: 'เพิ่มไข่ (+5)', min: 0, max: 99, priceEach: 5, choices: ['ไข่ดาวสุก','ไข่ดาวไม่สุก','ไข่เจียว','ไข่ต้ม'] }),
  },
  extra_10: {
    label: '⭐ เพิ่มพิเศษ +10',
    desc: 'พิเศษ',
    build: () => ({ kind: 'addOn', label: 'เพิ่ม', min: 0, max: 1, priceEach: 10, choices: ['พิเศษ'] }),
  },
  extra_20: {
    label: '⭐ เพิ่มพิเศษ +20 (ต้มยำ)',
    desc: 'พิเศษ +20',
    build: () => ({ kind: 'addOn', label: 'เพิ่ม', min: 0, max: 1, priceEach: 20, choices: ['พิเศษ'] }),
  },
  extra_kab_30: {
    label: '⭐ พิเศษ +10 / กับข้าว +30',
    desc: 'พิเศษ +10 หรือ กับข้าว +30',
    build: () => ({ kind: 'addOn', label: 'เพิ่ม', min: 0, max: 99, priceEach: 0, choices: ['พิเศษ','กับข้าว'], prices: { 'พิเศษ': 10, 'กับข้าว': 30 } }),
  },
  extra_kab_10: {
    label: '⭐ พิเศษ +10 / กับข้าว +10',
    desc: 'พิเศษ +10 หรือ กับข้าว +10',
    build: () => ({ kind: 'addOn', label: 'เพิ่ม', min: 0, max: 99, priceEach: 0, choices: ['พิเศษ','กับข้าว'], prices: { 'พิเศษ': 10, 'กับข้าว': 10 } }),
  },
  noodle_6: {
    label: '🍜 เลือกเส้น 6 แบบ (ก๋วยเตี๋ยว)',
    desc: 'เล็ก/ใหญ่/หมี่ขาว/บะหมี่/วุ้นเส้น/มาม่า',
    build: () => ({ kind: 'required', label: 'เลือกเส้น', min: 1, max: 1, priceEach: 0, choices: ['เส้นเล็ก','เส้นใหญ่','หมี่ขาว','บะหมี่','วุ้นเส้น','มาม่า'] }),
  },
  noodle_4: {
    label: '🍜 เลือกเส้น 4 แบบ (ผัด)',
    desc: 'ใหญ่/หมี่/มาม่า/เล็ก',
    build: () => ({ kind: 'required', label: 'เลือกเส้น', min: 1, max: 1, priceEach: 0, choices: ['เส้นใหญ่','เส้นหมี่','เส้นมาม่า','เส้นเล็ก'] }),
  },
  seafood_mix_10: {
    label: '🦐 รวมมิตรทะเล +10',
    desc: 'หมู+หมึก+กุ้ง',
    build: () => ({ kind: 'addOn', label: 'เพิ่ม (+10)', min: 0, max: 1, priceEach: 10, choices: ['รวมมิตรทะเล (หมู+หมึก+กุ้ง)'] }),
  },
  sweetness: {
    label: '🍯 ระดับความหวาน',
    desc: 'ไม่หวาน/น้อย/ปกติ/มาก',
    build: () => ({ kind: 'required', label: '🍯 ระดับความหวาน', min: 1, max: 1, priceEach: 0, choices: ['ไม่หวาน','หวานน้อย','หวานปกติ','หวานมาก'] }),
  },
  drink_blend: {
    label: '🥤 ปั่น +5',
    desc: 'ปั่น (เครื่องดื่ม)',
    build: () => ({ kind: 'addOn', label: 'ตัวเลือก (+5)', min: 0, max: 1, priceEach: 5, choices: ['ปั่น'] }),
  },
  drink_taiwan: {
    label: '🥤 ปั่น/ไข่มุก/บุก/ฟรุ๊ตสลัด +5',
    desc: 'ตัวเลือกชานมไต้หวัน',
    build: () => ({ kind: 'addOn', label: 'ตัวเลือกพิเศษ (+5)', min: 0, max: 99, priceEach: 5, choices: ['ปั่น','ไข่มุก','บุก','ฟรุ๊ตสลัด'] }),
  },
};

// 🛡️ XSS-safe HTML escape for any user-supplied string (customer name, note,
//    address, etc.) that we interpolate into innerHTML. JS template literals
//    don't escape — without this, a customer named '<img onerror=alert(1)>'
//    fires script in admin's view of the customer.
window.escapeHtml = function(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// 🔒 Check if this device is trusted by the given customer.
// First device that signed up is auto-trusted. Other devices need
// to verify (birthday or admin contact) → then get added to linked_devices.
window.isDeviceTrusted = function(customer) {
  if (!customer) return false;
  const myId = window.getDeviceId();
  const linked = customer.linked_devices || [];
  return linked.includes(myId);
};

// 🆔 Short 4-char code derived from deviceId — used for admin-assisted unlock.
// Customer reads this code aloud → admin types it into the unlock form →
// device gets added to linked_devices. Deterministic per-device so refreshing
// the page gives the same code (no race conditions). Alphabet excludes
// confusable chars (0/O, 1/I/L) so it's easy to read over the phone.
window.deviceTrustCode = function(deviceId) {
  const id = deviceId || window.getDeviceId();
  const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; // 30 chars, no 0/1/I/L/O
  // Simple, stable hash — no crypto needed (this isn't a secret, it's a pairing code)
  let h = 5381;
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) + h) + id.charCodeAt(i); // h*33 + c
    h = h & 0xFFFFFFFF;
  }
  let n = Math.abs(h);
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += ALPHABET[n % ALPHABET.length];
    n = Math.floor(n / ALPHABET.length);
  }
  return code;
};

// 📍 Haversine — distance in km between two {lat, lng} points
window.haversineKm = function(a, b) {
  if (!a || !b) return Infinity;
  const R = 6371;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat), lat2 = toRad(b.lat);
  const x = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
};

// ============================================
// Option presets
// ============================================
const _EGGS_5 = ['ไข่ดาวสุก', 'ไข่ดาวไม่สุก', 'ไข่เจียว', 'ไข่ต้ม'];
const _NOODLES_KT = ['เส้นเล็ก', 'เส้นใหญ่', 'หมี่ขาว', 'บะหมี่', 'วุ้นเส้น', 'มาม่า'];   // ก๋วยเตี๋ยว 6 แบบ
const _NOODLES_PS = ['เส้นใหญ่', 'เส้นหมี่', 'เส้นมาม่า', 'เส้นเล็ก'];                    // ผัดซีอิ๊ว/ราดหน้า 4 แบบ

// 🆕 เพิ่มพิเศษ +10 — ใช้ร่วมเกือบทุกเมนู (ยกเว้นทานเล่น/ข้าวเปล่า/เครื่องดื่ม)
const OPT_EXTRA = () => ({ kind: 'addOn', label: 'เพิ่ม', min: 0, max: 1, priceEach: 10, choices: ['พิเศษ'] });
// 🆕 เพิ่มพิเศษ +20 — ต้มยำ/ต้มจืด
const OPT_EXTRA_20 = () => ({ kind: 'addOn', label: 'เพิ่ม', min: 0, max: 1, priceEach: 20, choices: ['พิเศษ'] });
// 🆕 พิเศษ +10 + กับข้าว +30 — รวมในกลุ่มเดียว ใช้ per-choice price
const OPT_EXTRA_AND_KAB_30 = () => ({
  kind: 'addOn', label: 'เพิ่ม', min: 0, max: 99, priceEach: 0,
  choices: ['พิเศษ', 'กับข้าว'],
  prices: { 'พิเศษ': 10, 'กับข้าว': 30 }
});
// 🆕 พิเศษ +10 + กับข้าว +10 — สำหรับยำไข่เจียว/ยำไข่ดาว
const OPT_EXTRA_AND_KAB_10 = () => ({
  kind: 'addOn', label: 'เพิ่ม', min: 0, max: 99, priceEach: 0,
  choices: ['พิเศษ', 'กับข้าว'],
  prices: { 'พิเศษ': 10, 'กับข้าว': 10 }
});

// 🥩 Common protein lists used by multiple presets
const _BASIC_KAPRAO = ['หมูสับ', 'หมูชิ้น', 'ไก่', 'เครื่องในไก่', 'หน่อไม้ดอง'];
const _PREMIUM_KAPRAO = ['หมูกรอบ', 'กุ้ง', 'ปลาหมึก', 'ไข่เยี้ยวม้า', 'รวมมิตร(หมู+หมึก+กุ้ง)', 'ไข่ข้น'];

// 1) ราดข้าวกะเพรา group: เนื้อพื้นฐาน 0-3 (ฟรี) + พรีเมี่ยม +10 (เลือกได้ตามใจ) + เผ็ด + ไข่ +5 + พิเศษ/กับข้าว
//    — ลูกค้าเลือกแค่กุ้งโดยไม่ใส่เนื้อพื้นฐานก็ได้
const OPT_KAPRAO = () => ([
  { kind: 'addOn', label: '🥩 เนื้อพื้นฐาน (เลือก 1-3 · ไม่คิดเงินเพิ่ม)',
    min: 0, max: 3, priceEach: 0, choices: [..._BASIC_KAPRAO] },
  { kind: 'addOn', label: '🦐 เนื้อพรีเมี่ยม (+10 ต่อรายการ)',
    min: 0, max: 99, priceEach: 10, choices: [..._PREMIUM_KAPRAO] },
  OPT_SPICE_LEVEL(),
  { kind: 'addOn', label: 'เพิ่มไข่ (+5)', min: 0, max: 99, priceEach: 5, choices: [..._EGGS_5] },
  OPT_EXTRA_AND_KAB_30()
]);

// 2) ข้าวผัด: เนื้อพื้นฐาน 1 อย่าง (บังคับ) + พรีเมี่ยม +10 + ไข่ +5 + พิเศษ
const OPT_KAOPAD = () => ([
  { kind: 'required', label: '🥩 เลือกเนื้อ (1 อย่าง · ไม่คิดเงินเพิ่ม)',
    min: 1, max: 1, priceEach: 0, choices: ['หมูชิ้น', 'หมูสับ', 'ไก่', 'แหนม'] },
  { kind: 'addOn', label: '🦐 เนื้อพรีเมี่ยม (+10 ต่อรายการ)',
    min: 0, max: 99, priceEach: 10, choices: ['รวมมิตร(หมู+หมึก+กุ้ง)', 'กุ้ง', 'ปลาหมึก', 'หมูกรอบ'] },
  { kind: 'addOn', label: 'เพิ่มไข่ (+5)', min: 0, max: 99, priceEach: 5, choices: [..._EGGS_5] },
  OPT_EXTRA()
]);

// 2b) ข้าวไข่เจียว: เนื้อ 1 (บังคับ) + พรีเมี่ยม +10 + พิเศษ + กับข้าว
const OPT_KAOPAD_KAI = () => ([
  { kind: 'required', label: '🥩 เลือกเนื้อ (1 อย่าง · ไม่คิดเงินเพิ่ม)',
    min: 1, max: 1, priceEach: 0, choices: ['หมูสับ', 'ไก่สับ', 'แหนม'] },
  { kind: 'addOn', label: '🦐 เนื้อพรีเมี่ยม (+10 ต่อรายการ)',
    min: 0, max: 99, priceEach: 10, choices: ['กุ้ง', 'ปลาหมึก', 'รวมมิตร(หมู+หมึก+กุ้ง)'] },
  OPT_EXTRA_AND_KAB_30()
]);

// 2c) มาม่าผัดขึ้เมา / ผัดมาม่า: เนื้อ 1 (บังคับ) + พรีเมี่ยม +10 + เผ็ด + ไข่ +5 + พิเศษ
const OPT_NOODLE_STIRFRY = () => ([
  { kind: 'required', label: '🥩 เลือกเนื้อ (1 อย่าง · ไม่คิดเงินเพิ่ม)',
    min: 1, max: 1, priceEach: 0, choices: ['หมูชิ้น', 'หมูสับ', 'ไก่'] },
  { kind: 'addOn', label: '🦐 เนื้อพรีเมี่ยม (+10 ต่อรายการ)',
    min: 0, max: 99, priceEach: 10, choices: ['รวมมิตร(หมู+หมึก+กุ้ง)', 'กุ้ง', 'ปลาหมึก', 'หมูกรอบ'] },
  OPT_SPICE_LEVEL(),
  { kind: 'addOn', label: 'เพิ่มไข่ (+5)', min: 0, max: 99, priceEach: 5, choices: [..._EGGS_5] },
  OPT_EXTRA()
]);

// 2d) ต้มยำ: เนื้อพื้นฐาน 0-3 + พรีเมี่ยม +10 + เผ็ด + พิเศษ +20
const OPT_TOMYUM_DISH = () => ([
  { kind: 'addOn', label: '🥩 เนื้อพื้นฐาน (เลือก 1-3 · ไม่คิดเงินเพิ่ม)',
    min: 0, max: 3, priceEach: 0, choices: ['หมูสับ', 'หมูชิ้น', 'ไก่'] },
  { kind: 'addOn', label: '🦐 เนื้อพรีเมี่ยม (+10 ต่อรายการ)',
    min: 0, max: 99, priceEach: 10, choices: ['กุ้ง', 'ปลาหมึก', 'รวมมิตร(หมู+หมึก+กุ้ง)'] },
  OPT_SPICE_LEVEL(),
  OPT_EXTRA_20()
]);

// 2e) ต้มจืด: แค่เพิ่มพิเศษ +20
const OPT_TOMJUED = () => ([ OPT_EXTRA_20() ]);

// 3) ผัดซีอิ๊ว: เนื้อ 1 (บังคับ) + พรีเมี่ยม +10 + เลือกเส้น (จำเป็น) + เพิ่มพิเศษ
const OPT_PADSEEW = () => ([
  { kind: 'required', label: '🥩 เลือกเนื้อ (1 อย่าง · ไม่คิดเงินเพิ่ม)',
    min: 1, max: 1, priceEach: 0, choices: ['หมูชิ้น', 'หมูสับ', 'ไก่'] },
  { kind: 'addOn', label: '🦐 เนื้อพรีเมี่ยม (+10 ต่อรายการ)',
    min: 0, max: 99, priceEach: 10, choices: ['รวมมิตร(หมู+หมึก+กุ้ง)', 'กุ้ง', 'ปลาหมึก', 'หมูกรอบ'] },
  { kind: 'required', label: 'เลือกเส้น', min: 1, max: 1, priceEach: 0, choices: [..._NOODLES_PS] },
  OPT_EXTRA()
]);

// 4) ราดหน้า: เนื้อ 1 (บังคับ) + พรีเมี่ยม +10 + เลือกเส้น (จำเป็น) + เพิ่มพิเศษ
const OPT_RADNAA = () => ([
  { kind: 'required', label: '🥩 เลือกเนื้อ (1 อย่าง · ไม่คิดเงินเพิ่ม)',
    min: 1, max: 1, priceEach: 0, choices: ['หมูชิ้น', 'หมูสับ', 'ไก่'] },
  { kind: 'addOn', label: '🦐 เนื้อพรีเมี่ยม (+10 ต่อรายการ)',
    min: 0, max: 99, priceEach: 10, choices: ['รวมมิตร(หมู+หมึก+กุ้ง)', 'กุ้ง', 'ปลาหมึก'] },
  { kind: 'required', label: 'เลือกเส้น', min: 1, max: 1, priceEach: 0, choices: [..._NOODLES_PS] },
  OPT_EXTRA()
]);

// 5) สุกี้: เนื้อ 1 (บังคับ) + พรีเมี่ยม +5 + เพิ่มพิเศษ
const OPT_SUKI = () => ([
  { kind: 'required', label: '🥩 เลือกเนื้อ (1 อย่าง · ไม่คิดเงินเพิ่ม)',
    min: 1, max: 1, priceEach: 0, choices: ['หมูชิ้น', 'ไก่'] },
  { kind: 'addOn', label: '🦐 เนื้อพรีเมี่ยม (+5 ต่อรายการ)',
    min: 0, max: 99, priceEach: 5, choices: ['รวมมิตร(หมู+หมึก+กุ้ง)', 'กุ้ง', 'ปลาหมึก'] },
  OPT_EXTRA()
]);

// 6) เมนูพิเศษ: ไข่ +5 + เพิ่มพิเศษ + กับข้าว +30
const OPT_EGG_ONLY = () => ([
  { kind: 'addOn', label: 'เพิ่มไข่ (+5)', min: 0, max: 99, priceEach: 5, choices: [..._EGGS_5] },
  OPT_EXTRA_AND_KAB_30()
]);

// 6+) เหมือน OPT_EGG_ONLY แต่มีระดับความเผ็ด — สำหรับเมนูพิเศษที่เป็นกระเพรา/คั่วพริกเกลือ
const OPT_EGG_WITH_SPICE = () => ([
  OPT_SPICE_LEVEL(),
  { kind: 'addOn', label: 'เพิ่มไข่ (+5)', min: 0, max: 99, priceEach: 5, choices: [..._EGGS_5] },
  OPT_EXTRA_AND_KAB_30()
]);

// 6b) ยำ ทั่วไป (มีแค่เพิ่มพิเศษ)
const OPT_EXTRA_ONLY = () => ([ OPT_EXTRA() ]);

// 6b+) ยำ + ระดับความเผ็ด
const OPT_EXTRA_ONLY_WITH_SPICE = () => ([ OPT_SPICE_LEVEL(), OPT_EXTRA() ]);

// 6c) ราดข้าว ยำไข่เจียว / ยำไข่ดาว (เพิ่มพิเศษ + กับข้าว ราคาถูกพิเศษ)
const OPT_YAM_RICE = () => ([ OPT_EXTRA_AND_KAB_10() ]);

// 6c+) ข้าวยำไข่ + ระดับความเผ็ด
const OPT_YAM_RICE_WITH_SPICE = () => ([ OPT_SPICE_LEVEL(), OPT_EXTRA_AND_KAB_10() ]);

// 1+) OPT_KAPRAO without spice — for items where spice doesn't apply (e.g. ผัดน้ำมันหอย)
const OPT_KAPRAO_NO_SPICE = () => ([
  { kind: 'addOn', label: '🥩 เนื้อพื้นฐาน (เลือก 1-3 · ไม่คิดเงินเพิ่ม)',
    min: 0, max: 3, priceEach: 0, choices: [..._BASIC_KAPRAO] },
  { kind: 'addOn', label: '🦐 เนื้อพรีเมี่ยม (+10 ต่อรายการ)',
    min: 0, max: 99, priceEach: 10, choices: [..._PREMIUM_KAPRAO] },
  { kind: 'addOn', label: 'เพิ่มไข่ (+5)', min: 0, max: 99, priceEach: 5, choices: [..._EGGS_5] },
  OPT_EXTRA_AND_KAB_30()
]);

// 2c+) OPT_NOODLE_STIRFRY without spice — for ผัดมาม่า (no chili)
const OPT_NOODLE_STIRFRY_NO_SPICE = () => ([
  { kind: 'required', label: '🥩 เลือกเนื้อ (1 อย่าง · ไม่คิดเงินเพิ่ม)',
    min: 1, max: 1, priceEach: 0, choices: ['หมูชิ้น', 'หมูสับ', 'ไก่'] },
  { kind: 'addOn', label: '🦐 เนื้อพรีเมี่ยม (+10 ต่อรายการ)',
    min: 0, max: 99, priceEach: 10, choices: ['รวมมิตร(หมู+หมึก+กุ้ง)', 'กุ้ง', 'ปลาหมึก', 'หมูกรอบ'] },
  { kind: 'addOn', label: 'เพิ่มไข่ (+5)', min: 0, max: 99, priceEach: 5, choices: [..._EGGS_5] },
  OPT_EXTRA()
]);

// 7) ก๋วยเตี๋ยว/เย็นตาโฟ ปกติ: เลือกเส้น 6 แบบ + เพิ่มพิเศษ
const OPT_NOODLE_ONLY = () => ([
  { kind: 'required', label: 'เลือกเส้น', min: 1, max: 1, priceEach: 0, choices: [..._NOODLES_KT] },
  OPT_EXTRA()
]);

// 8) ต้มยำ / ก๋วยเตี๋ยวแห้ง: เลือกเส้น + รวมมิตรทะเล +10 + เพิ่มพิเศษ
const OPT_NOODLE_TOMYUM = () => ([
  { kind: 'required', label: 'เลือกเส้น', min: 1, max: 1, priceEach: 0, choices: [..._NOODLES_KT] },
  { kind: 'addOn', label: 'เพิ่ม (+10)', min: 0, max: 1, priceEach: 10, choices: ['รวมมิตรทะเล (หมู+หมึก+กุ้ง)'] },
  OPT_EXTRA()
]);

// 9) เกี๋ยว / เกาเหลา: รวมมิตรทะเล +10 + เพิ่มพิเศษ
const OPT_KIEW = () => ([
  { kind: 'addOn', label: 'เพิ่ม (+10)', min: 0, max: 1, priceEach: 10, choices: ['รวมมิตรทะเล (หมู+หมึก+กุ้ง)'] },
  OPT_EXTRA()
]);

// 🌶️ ระดับความเผ็ด — ฟรี (รวมในราคาอาหาร) เลือก 1 อย่าง
const OPT_SPICE_LEVEL = () => ({
  kind: 'required', label: '🌶️ ระดับความเผ็ด', min: 1, max: 1, priceEach: 0,
  choices: ['ไม่เผ็ด', 'เผ็ดน้อย', 'เผ็ดปรกติ', 'เผ็ดมาก']
});

// 🍯 ระดับความหวาน — ฟรี เลือก 1 อย่าง (สำหรับเครื่องดื่ม)
const OPT_SWEETNESS = () => ({
  kind: 'required', label: '🍯 ระดับความหวาน', min: 1, max: 1, priceEach: 0,
  choices: ['ไม่หวาน', 'หวานน้อย', 'หวานปกติ', 'หวานมาก']
});

// 10) เครื่องดื่มที่ปั่นได้: หวาน + ปั่น +5 (optional, max 1)
const OPT_DRINK_BLEND = () => ([
  OPT_SWEETNESS(),
  { kind: 'addOn', label: 'ตัวเลือก (+5)', min: 0, max: 1, priceEach: 5, choices: ['ปั่น'] }
]);

// 10b) ชานมไต้หวั่น: หวาน + 4 ตัวเลือก +5 each
const OPT_DRINK_TAIWAN = () => ([
  OPT_SWEETNESS(),
  { kind: 'addOn', label: 'ตัวเลือกพิเศษ (+5)', min: 0, max: 99, priceEach: 5, choices: ['ปั่น', 'ไข่มุก', 'บุก', 'ฟรุ๊ตสลัด'] }
]);

// ============================================
// MENU
// ============================================
window.MENU = [
  {
    cat: "ราดข้าว · ผัดกะเพรา & เมนูยอดนิยม",
    emoji: "🌶️",
    items: [
      { id: 'rd-001', name: 'ข้าวผัดกระเพรา',                price: 40, optionGroups: OPT_KAPRAO() },
      { id: 'rd-002', name: 'ผัดใบโหรพา พริกแห้ง ราดข้าว',  price: 40, optionGroups: OPT_KAPRAO() },
      { id: 'rd-003', name: 'ผัดพริกแกงราดข้าว',             price: 40, optionGroups: OPT_KAPRAO() },
      { id: 'rd-010', name: 'ผัดพะแนงราดข้าว',               price: 40, optionGroups: OPT_KAPRAO() },
      { id: 'rd-004', name: 'กระเทียมพริกไทยราดข้าว',        price: 40, optionGroups: OPT_KAPRAO() },
      { id: 'rd-005', name: 'ผัดฉ่าราดข้าว',                  price: 40, optionGroups: OPT_KAPRAO() },
      { id: 'rd-007', name: 'ผัดพริกสดราดข้าว',              price: 40, optionGroups: OPT_KAPRAO() },
      { id: 'rd-008', name: 'ผัดน้ำพริกเผาราดข้าว',          price: 40, optionGroups: OPT_KAPRAO() },
      { id: 'rd-009', name: 'ผัดน้ำมันหอยราดข้าว',           price: 40, optionGroups: OPT_KAPRAO_NO_SPICE() },
      // ผัดผัก ราดข้าว — แยกเป็น 3 เมนู (เลือกผักคนละชนิด)
      { id: 'rd-011', name: 'ผัดผักคะน้าราดข้าว',            price: 40, optionGroups: OPT_KAPRAO() },
      { id: 'rd-012', name: 'ผัดผักบุ้งราดข้าว',             price: 40, optionGroups: OPT_KAPRAO() },
      { id: 'rd-013', name: 'ผัดผักรวมราดข้าว',              price: 40, optionGroups: OPT_KAPRAO() },
    ]
  },
  {
    cat: "ข้าวผัด / ผัดเส้น",
    emoji: "🍚",
    items: [
      { id: 'sf-001', name: 'ข้าวผัด',          price: 40, optionGroups: OPT_KAOPAD() },
      { id: 'sf-004', name: 'ข้าวไข่เจียว',     price: 40, optionGroups: OPT_KAOPAD_KAI() },
      { id: 'sf-002', name: 'ผัดซีอิ๊ว',         price: 40, optionGroups: OPT_PADSEEW() },
      { id: 'sf-005', name: 'มาม่าผัดขึ้เมา',    price: 40, optionGroups: OPT_NOODLE_STIRFRY() },
      { id: 'sf-006', name: 'ผัดมาม่า',          price: 40, optionGroups: OPT_NOODLE_STIRFRY_NO_SPICE() },
      { id: 'sf-003', name: 'ราดหน้า',           price: 40, optionGroups: OPT_RADNAA() },
    ]
  },
  {
    cat: "สุกี้",
    emoji: "🍲",
    items: [
      { id: 'sk-001', name: 'สุกี้ น้ำ',  price: 45, optionGroups: OPT_SUKI() },
      { id: 'sk-002', name: 'สุกี้ แห้ง', price: 45, optionGroups: OPT_SUKI() },
    ]
  },
  {
    cat: "เมนูพิเศษ ⭐",
    emoji: "⭐",
    items: [
      { id: 'sp-001', name: 'ปลาหมึกผัดไข่เค็มราดข้าว',         price: 60, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-002', name: 'ผัดเผ็ดหมูป่าราดข้าว',              price: 50, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-003', name: 'ผัดกระเพราหมูป่าราดข้าว',           price: 50, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-004', name: 'ผัดพริกปลาดุกสดราดข้าว',           price: 50, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-005', name: 'ผัดพริกปลาดุกทอดราดข้าว',          price: 50, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-006', name: 'ข้าวสามชั้นทอดน้ำปลา',              price: 50, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-007', name: 'ข้าวสามชั้นคั่วพริกเกลือ',          price: 50, optionGroups: OPT_EGG_WITH_SPICE() },
      { id: 'sp-008', name: 'ข้าวหมูกรอบคั่วพริกเกลือ',          price: 50, optionGroups: OPT_EGG_WITH_SPICE() },
      { id: 'sp-009', name: 'ข้าวห่อหมกทะเลไข่ข้น',              price: 50, optionGroups: OPT_EGG_ONLY() },
      { id: 'sp-010', name: 'ข้าวผัดกระเพราหมูสับใส้กรอกแดงราดข้าว', price: 40, optionGroups: OPT_EGG_WITH_SPICE() },
      { id: 'sp-011', name: 'ข้าวผัดกระเพราหมูสับ+หมูยอ ราดข้าว',    price: 40, optionGroups: OPT_EGG_WITH_SPICE() },
      { id: 'sp-012', name: 'ผัดเต้าหู้หมูสับราดข้าว',           price: 40, optionGroups: OPT_EGG_ONLY() },
    ]
  },
  {
    cat: "ยำ",
    emoji: "🥗",
    items: [
      { id: 'ym-001', name: 'ยำวุ้นเส้นรวมมิตร',     price: 50, optionGroups: OPT_EXTRA_ONLY_WITH_SPICE() },
      { id: 'ym-002', name: 'ยำมาม่ารวมมิตร',         price: 50, optionGroups: OPT_EXTRA_ONLY_WITH_SPICE() },
      { id: 'ym-003', name: 'ยำรวมมิตร (ไม่ใส่เส้น)', price: 50, optionGroups: OPT_EXTRA_ONLY_WITH_SPICE() },
      { id: 'ym-004', name: 'ยำไข่เยี่ยวม้า',         price: 50, optionGroups: OPT_EXTRA_ONLY_WITH_SPICE() },
      { id: 'ym-005', name: 'ข้าวยำไข่เจียว',         price: 40, optionGroups: OPT_YAM_RICE_WITH_SPICE() },
      { id: 'ym-006', name: 'ข้าวยำไข่ดาว',           price: 40, optionGroups: OPT_YAM_RICE_WITH_SPICE() },
    ]
  },
  {
    cat: "ต้มยำ / ต้มจืด",
    emoji: "🍲",
    items: [
      { id: 'ty-001', name: 'ต้มยำน้ำข้น',         price: 70, optionGroups: OPT_TOMYUM_DISH() },
      { id: 'ty-002', name: 'ต้มยำน้ำใส',         price: 60, optionGroups: OPT_TOMYUM_DISH() },
      { id: 'ty-003', name: 'ต้มจืดเต้าหู้หมูสับ', price: 60, optionGroups: OPT_TOMJUED() },
    ]
  },
  {
    cat: "ทานเล่น / สเต๊ก / ชุดพิเศษ",
    emoji: "🍗",
    items: [
      { id: 'tn-001', name: 'สเต็กสันคอ',                price: 89 },
      { id: 'tn-002', name: 'เฟร์นฟรายทอด',              price: 39 },
      { id: 'tn-003', name: 'ไก่ป๊อบ',                    price: 49 },
      { id: 'tn-004', name: 'เฟร์นฟรายทอด + ไก่ป๊อบ',    price: 59 },
      { id: 'tn-005', name: 'ชุดหมูจุ่ม',                 price: 199 },
    ]
  },
  {
    cat: "ข้าว / ของเสริม",
    emoji: "🍚",
    items: [
      { id: 'rc-001', name: 'ข้าวเปล่า', price: 5 },
    ]
  },
  {
    cat: "ก๋วยเตี๋ยว / เย็นตาโฟ",
    emoji: "🍜",
    items: [
      { id: 'kt-001', name: 'ก๋วยเตี๋ยวหมูน้ำใส', price: 30, optionGroups: OPT_NOODLE_ONLY() },
      { id: 'kt-002', name: 'ก๋วยเตี๋ยวต้มยำ',     price: 30, optionGroups: OPT_NOODLE_TOMYUM() },
      { id: 'kt-005', name: 'ก๋วยเตี๋ยวแห้ง',      price: 30, optionGroups: OPT_NOODLE_TOMYUM() },
      { id: 'kt-003', name: 'เย็นตาโฟ',             price: 30, optionGroups: OPT_NOODLE_TOMYUM() },
      { id: 'kt-004', name: 'เย็นตาโฟต้มยำ',       price: 30, optionGroups: OPT_NOODLE_TOMYUM() },
    ]
  },
  {
    cat: "เกี๋ยว",
    emoji: "🍝",
    items: [
      { id: 'kw-001', name: 'เกี๋ยวน้ำหมูแดง',         price: 40, optionGroups: OPT_KIEW() },
      { id: 'kw-002', name: 'บะหมี่เกี๋ยวน้ำ-หมูแดง', price: 40, optionGroups: OPT_KIEW() },
    ]
  },
  {
    cat: "เกาเหลา",
    emoji: "🍲",
    items: [
      { id: 'kl-001', name: 'เกาเหลาหมู น้ำใส',        price: 40, optionGroups: OPT_KIEW() },
      { id: 'kl-002', name: 'เกาเหลาเย็นตาโฟ',         price: 40, optionGroups: OPT_KIEW() },
      { id: 'kl-003', name: 'เกาเหลาหมู ต้มยำ',        price: 40, optionGroups: OPT_KIEW() },
      { id: 'kl-004', name: 'เกาเหลาเย็นตาโฟ ต้มยำ',  price: 40, optionGroups: OPT_KIEW() },
    ]
  },
  {
    cat: "เครื่องดื่ม - ชา/กาแฟ/นม",
    emoji: "🥤",
    items: [
      { id: 'dr-001', name: 'ชานมไต้หวั่น', price: 25, optionGroups: OPT_DRINK_TAIWAN() },
      { id: 'dr-002', name: 'ชาไทย',          price: 25, optionGroups: OPT_DRINK_BLEND() },
      { id: 'dr-003', name: 'ชาเขียว',        price: 25, optionGroups: OPT_DRINK_BLEND() },
      { id: 'dr-004', name: 'กาแฟสด',         price: 35, optionGroups: OPT_DRINK_BLEND() },
      { id: 'dr-005', name: 'กาแฟเนส',        price: 25, optionGroups: OPT_DRINK_BLEND() },
      { id: 'dr-006', name: 'โกโก้',           price: 25, optionGroups: OPT_DRINK_BLEND() },
      { id: 'dr-007', name: 'นมชมพู',          price: 25, optionGroups: OPT_DRINK_BLEND() },
      { id: 'dr-008', name: 'ชาดำเย็น',        price: 20, optionGroups: OPT_DRINK_BLEND() },
    ]
  },
  {
    cat: "เครื่องดื่ม - โซดาผลไม้",
    emoji: "🍹",
    items: [
      { id: 'dr-101', name: 'น้ำแดงโซดา',       price: 20, optionGroups: OPT_DRINK_BLEND() },
      { id: 'dr-102', name: 'น้ำเขียวโซดา',     price: 20, optionGroups: OPT_DRINK_BLEND() },
      { id: 'dr-103', name: 'สเตอร์เบอรี่โซดา', price: 20, optionGroups: OPT_DRINK_BLEND() },
      { id: 'dr-104', name: 'บลูฮาวายโซดา',     price: 20, optionGroups: OPT_DRINK_BLEND() },
      { id: 'dr-105', name: 'ลิ้นจี่โซดา',       price: 20, optionGroups: OPT_DRINK_BLEND() },
      { id: 'dr-106', name: 'สัปปะรดโซดา',     price: 20, optionGroups: OPT_DRINK_BLEND() },
    ]
  },
  {
    cat: "เครื่องดื่ม - แก้วโอ่ง",
    emoji: "🧊",
    items: [
      { id: 'dr-200', name: 'น้ำเปล่า',                       price: 5 },
      { id: 'dr-201', name: 'โค๊กแก้วโอ่ง',                price: 20 },
      { id: 'dr-202', name: 'น้ำแดงแฟนต้าแก้วโอ่ง',      price: 20 },
      { id: 'dr-203', name: 'น้ำเขียวแฟนต้าแก้วโอ่ง',     price: 20 },
      { id: 'dr-204', name: 'น้ำส้มแฟนต้าแก้วโอ่ง',       price: 20 },
      { id: 'dr-205', name: 'สไปร์แก้วโอ่ง',               price: 20 },
      { id: 'dr-206', name: 'น้ำแข็งเปล่าแก้วโอ่ง',        price: 5 },
      { id: 'dr-207', name: 'น้ำแข็งตักถุง (เล็ก)',          price: 5 },
      { id: 'dr-208', name: 'น้ำแข็งตักถุง (ใหญ่)',          price: 10 },
      { id: 'dr-209', name: 'โค๊กขวดแก้ว',                   price: 12 },
    ]
  },
];

// ============================================
// FACTORY MENU — เมนูสำหรับโรงงาน (50฿/จาน, ไม่ร่วมโปรแต้ม)
// ============================================
const _F_EGG = ['ไข่ดาว', 'ไข่เจียว'];
const _F_NOODLES = ['เส้นเล็ก', 'เส้นใหญ่', 'หมี่ขาว', 'บะหมี่', 'วุ้นเส้น', 'มาม่า'];

// Free egg add-on (ฟรี รวมในราคาแล้ว)
const F_OPT_FREE_EGG = () => ({
  kind: 'addOn', label: '🥚 ฟรี ไข่ดาว/ไข่เจียว (เลือก 1)',
  min: 0, max: 1, priceEach: 0, choices: [..._F_EGG]
});

// Protein presets
const F_PROTEIN_BASIC = () => ({
  kind: 'required', label: 'เลือกเนื้อ', min: 1, max: 1, priceEach: 0,
  choices: ['หมูชิ้น', 'หมูสับ', 'ไก่']
});
const F_PROTEIN_BASIC_SEA = () => ({
  kind: 'required', label: 'เลือกเนื้อ', min: 1, max: 1, priceEach: 0,
  choices: ['หมูชิ้น', 'หมูสับ', 'ไก่', 'รวมมิตรทะเล']
});
const F_PROTEIN_SEA = () => ({
  kind: 'required', label: 'เลือกเนื้อ', min: 1, max: 1, priceEach: 0,
  choices: ['หมูกรอบ', 'กุ้ง', 'ปลาหมึก', 'รวมมิตร']
});
const F_NOODLE_CHOICE = () => ({
  kind: 'required', label: 'เลือกเส้น', min: 1, max: 1, priceEach: 0, choices: [..._F_NOODLES]
});
const F_NOODLE_TOPPING = () => ({
  kind: 'required', label: 'เลือกเนื้อ (ฟรี)', min: 1, max: 1, priceEach: 0,
  choices: ['หมู', 'รวมมิตรทะเล']
});

window.FACTORY_MENU = [
  {
    cat: "ผัด / ราดข้าว",
    emoji: "🌶️",
    items: [
      { id: 'fc-001', name: 'ผัดกระเพรา',          price: 50, optionGroups: [F_PROTEIN_BASIC(), F_OPT_FREE_EGG()] },
      { id: 'fc-002', name: 'ผัดกระเพรารวมมิตร',    price: 50, optionGroups: [F_PROTEIN_SEA()] },
      { id: 'fc-003', name: 'ผัดพริกแกง',           price: 50, optionGroups: [F_PROTEIN_BASIC(), F_OPT_FREE_EGG()] },
      { id: 'fc-004', name: 'ผัดพริกแกงรวมมิตร',    price: 50, optionGroups: [F_PROTEIN_SEA()] },
      { id: 'fc-005', name: 'ผัดพะแนง',              price: 50, optionGroups: [F_PROTEIN_BASIC(), F_OPT_FREE_EGG()] },
      { id: 'fc-006', name: 'ผัดพริกสด',             price: 50, optionGroups: [F_PROTEIN_BASIC(), F_OPT_FREE_EGG()] },
      { id: 'fc-007', name: 'ราดหน้า',               price: 50, optionGroups: [F_PROTEIN_BASIC_SEA()] },
      { id: 'fc-008', name: 'ผัดซีอิ๊ว',              price: 50, optionGroups: [F_PROTEIN_BASIC_SEA(), { kind: 'required', label: 'เลือกเส้น', min: 1, max: 1, priceEach: 0, choices: ['เส้นใหญ่', 'เส้นเล็ก', 'เส้นหมี่', 'เส้นมาม่า'] }] },
    ]
  },
  {
    cat: "ข้าวผัด / ข้าวต้ม",
    emoji: "🍚",
    items: [
      { id: 'fc-101', name: 'ข้าวผัด',           price: 50, optionGroups: [F_PROTEIN_BASIC(), F_OPT_FREE_EGG()] },
      { id: 'fc-102', name: 'ข้าวผัดรวมมิตร',     price: 50, optionGroups: [F_PROTEIN_BASIC_SEA()] },
      { id: 'fc-103', name: 'ข้าวต้ม',            price: 50, optionGroups: [F_PROTEIN_BASIC_SEA()] },
      { id: 'fc-104', name: 'มาม่าผัดขี้เมา',     price: 50, optionGroups: [F_PROTEIN_BASIC_SEA()] },
    ]
  },
  {
    cat: "สุกี้ / ยำ",
    emoji: "🍲",
    items: [
      { id: 'fc-201', name: 'สุกี้น้ำ',  price: 50, optionGroups: [F_PROTEIN_BASIC_SEA()] },
      { id: 'fc-202', name: 'สุกี้แห้ง', price: 50, optionGroups: [F_PROTEIN_BASIC_SEA()] },
      { id: 'fc-203', name: 'ยำรวมมิตร', price: 50, optionGroups: [
        { kind: 'required', label: 'เลือกเส้น', min: 1, max: 1, priceEach: 0, choices: ['วุ้นเส้น', 'มาม่า'] }
      ] },
    ]
  },
  {
    cat: "ก๋วยเตี๋ยว / เย็นตาโฟ",
    emoji: "🍜",
    items: [
      { id: 'fc-301', name: 'ก๋วยเตี๋ยวหมูน้ำใส', price: 50, optionGroups: [F_NOODLE_CHOICE(), F_NOODLE_TOPPING()] },
      { id: 'fc-302', name: 'ก๋วยเตี๋ยวต้มยำ',     price: 50, optionGroups: [F_NOODLE_CHOICE(), F_NOODLE_TOPPING()] },
      { id: 'fc-303', name: 'ก๋วยเตี๋ยวแห้ง',      price: 50, optionGroups: [F_NOODLE_CHOICE(), F_NOODLE_TOPPING()] },
      { id: 'fc-304', name: 'เย็นตาโฟ',             price: 50, optionGroups: [F_NOODLE_CHOICE(), F_NOODLE_TOPPING()] },
      { id: 'fc-305', name: 'เย็นตาโฟต้มยำ',       price: 50, optionGroups: [F_NOODLE_CHOICE(), F_NOODLE_TOPPING()] },
    ]
  },
  {
    cat: "ข้าวพิเศษ",
    emoji: "🍱",
    items: [
      { id: 'fc-401', name: 'ข้าวปลาดุกทอด',           price: 50, optionGroups: [F_OPT_FREE_EGG()] },
      { id: 'fc-402', name: 'ข้าวปลาดุกผัดพริกแกง',     price: 50 },
      { id: 'fc-403', name: 'ข้าวปลาดุกผัดกระเพรา',     price: 50 },
      { id: 'fc-404', name: 'ข้าวหมูทอด',              price: 50, optionGroups: [F_OPT_FREE_EGG()] },
      { id: 'fc-405', name: 'ข้าวหมูทอดกระเทียม',     price: 50, optionGroups: [F_OPT_FREE_EGG()] },
      { id: 'fc-406', name: 'ข้าวไข่เจียวกุ้ง',         price: 50 },
    ]
  },
  {
    cat: "ของแห้ง / อื่นๆ",
    emoji: "🍜",
    items: [
      { id: 'fc-501', name: 'มาม่าน้ำข้น (ของแห้ง)',    price: 50 },
      { id: 'fc-502', name: 'ไข่ดิบ (ของแห้ง)',         price: 50 },
      { id: 'fc-503', name: 'ข้าวเปล่า + ไข่ดิบ',       price: 50 },
      { id: 'fc-504', name: 'ข้าวเปล่า + มาม่าต้มยำ',   price: 50 },
    ]
  },
  {
    cat: "เครื่องดื่ม",
    emoji: "🥤",
    items: [
      { id: 'fc-601', name: 'น้ำโค๊กแก้วโอ่ง', price: 20 },
    ]
  },
];

// ============================================
// Loyalty config — โปรใหม่
// ============================================
window.LOYALTY = {
  POINTS_PER_BAHT: 1 / 50,          // 50฿ = 1 แต้ม
  SIGNUP_BONUS: 5,                   // สมัครครั้งแรก +5
  REWARD_DRINK_POINTS: 10,           // 10 แต้ม = ฟรีเครื่องดื่ม
  REWARD_DISCOUNT_POINTS: 15,        // 15 แต้ม = ลด 50฿
  REWARD_DISCOUNT_AMOUNT: 50,
  AWARD_ON_STATUS: 'delivered',
  // เครื่องดื่มที่ใช้แลกได้ด้วย 10 แต้ม
  // ชานมไต้หวั่น 25฿ + แก้วโอ่ง 20฿ ทุกตัว (ยกเว้นน้ำแข็งเปล่า)
  DRINK_REWARD_IDS: [
    'dr-001',  // ชานมไต้หวั่น 25
    'dr-201',  // โค๊กแก้วโอ่ง 20
    'dr-202',  // น้ำแดงแฟนต้าแก้วโอ่ง 20
    'dr-203',  // น้ำเขียวแฟนต้าแก้วโอ่ง 20
    'dr-204',  // น้ำส้มแฟนต้าแก้วโอ่ง 20
    'dr-205',  // สไปร์แก้วโอ่ง 20
  ],
};

// คำนวณแต้มจากยอดเงิน
window.calcPointsFromAmount = function(amount) {
  return Math.floor((amount || 0) * LOYALTY.POINTS_PER_BAHT);
};

// ============================================
// Helpers
// ============================================
window.calcLinePrice = function(item, selectedOptions) {
  let base = item.price || 0;
  if (item.optionGroups && selectedOptions) {
    item.optionGroups.forEach((g, gi) => {
      const sel = selectedOptions[gi] || [];
      base += (g.priceEach || 0) * sel.length;
    });
  }
  return base;
};

window.formatOptionSummary = function(item, selectedOptions, opts) {
  opts = opts || {};
  if (!item.optionGroups || !selectedOptions) return '';
  const parts = [];
  item.optionGroups.forEach((g, gi) => {
    const sel = selectedOptions[gi] || [];
    sel.forEach(c => {
      const prefix = (g.priceEach > 0) ? '+' : '';
      const suffix = (opts.showPrice && g.priceEach > 0) ? ` (+${g.priceEach})` : '';
      parts.push(prefix + c + suffix);
    });
  });
  return parts.join(opts.sep || ', ');
};

window.countMainDishes = function(items) {
  let count = 0;
  items.forEach(it => {
    if (it.id && it.id.startsWith('add-')) return;
    count += (it.qty || 1);
  });
  return count;
};

// 💰 Expense categories — for ค่าใช้จ่ายรายวัน + P&L dashboard
window.EXPENSE_CATEGORIES = [
  { id: 'food',       name: 'ต้นทุนวัตถุดิบ',  emoji: '🥩', color: '#dc2626',
    subcats: ['ข้าวสาร', 'หมู', 'ไก่', 'เนื้อวัว', 'ปลา', 'อาหารทะเล', 'ผักสด', 'เครื่องปรุง (ซอส/น้ำปลา/น้ำมัน)', 'ไข่', 'น้ำดื่ม/เครื่องดื่ม'] },
  { id: 'packaging',  name: 'บรรจุภัณฑ์',     emoji: '📦', color: '#f59e0b',
    subcats: ['กล่องอาหาร', 'ถุงหิ้ว', 'ช้อนส้อม/ตะเกียบ', 'ถุงซอส/ซองพริก', 'แก้ว/ฝา/หลอด'] },
  { id: 'labor',      name: 'ค่าแรงงาน',      emoji: '👷', color: '#1652F0',
    subcats: ['พนักงานครัว', 'พนักงานเสิร์ฟ', 'ทำความสะอาด', 'จัดส่ง'] },
  { id: 'rent',       name: 'ค่าเช่า/สถานที่', emoji: '🏠', color: '#8b5cf6',
    subcats: ['ค่าเช่าร้าน', 'ค่าส่วนกลาง'],
    defaultRecurring: 'monthly' },
  { id: 'utilities',  name: 'สาธารณูปโภค',    emoji: '⚡', color: '#06b6d4',
    subcats: ['ไฟฟ้า', 'น้ำประปา', 'แก๊สหุงต้ม', 'อินเทอร์เน็ต/โทรศัพท์'],
    defaultRecurring: 'monthly' },
  { id: 'equipment',  name: 'อุปกรณ์/ภาชนะ',   emoji: '🍳', color: '#16a34a',
    subcats: ['หม้อ/กระทะ', 'เตา/ตู้เย็น', 'จานชาม', 'ผ้าเช็ดมือ/ผ้าเช็ดโต๊ะ', 'ถุงขยะ', 'น้ำยาล้างจาน'] },
  { id: 'marketing',  name: 'โฆษณา/การตลาด',  emoji: '📢', color: '#ec4899',
    subcats: ['Facebook ads', 'LINE OA', 'พิมพ์โบรชัวร์/ป้าย', 'โปรโมชั่น'] },
  { id: 'other',      name: 'อื่นๆ',           emoji: '📝', color: '#6b7280',
    subcats: ['ซ่อมบำรุง', 'เบ็ดเตล็ด'] }
];

// 💰 Allocate an expense across the day(s) it actually applies to.
// Returns array of { date: 'YYYY-MM-DD', amount: number } per day.
//   one_time + rolling=N → split equally across [date, date+1, ..., date+N-1]
//   monthly              → amount/30 applied per day going forward
//   weekly               → amount/7 applied per day going forward
//   one_time (no rolling)→ full amount on the single date
window.allocateExpenseAcrossDays = function(exp, fromDate, toDate) {
  if (!exp || !exp.amount) return [];
  const start = new Date(exp.date || exp.paid_at);
  if (isNaN(start)) return [];
  start.setHours(0,0,0,0);
  const out = [];
  const fromMs = fromDate ? new Date(fromDate).setHours(0,0,0,0) : 0;
  const toMs   = toDate   ? new Date(toDate).setHours(23,59,59,999) : Date.now();

  if (exp.recurring === 'monthly') {
    // amount/30 applied to every day from start (inclusive) until... end of next month
    const perDay = exp.amount / 30;
    for (let i = 0; i < 30; i++) {
      const d = new Date(start.getTime() + i * 86400000);
      if (d.getTime() >= fromMs && d.getTime() <= toMs) {
        out.push({ date: d.toISOString().slice(0,10), amount: perDay });
      }
    }
  } else if (exp.recurring === 'weekly') {
    const perDay = exp.amount / 7;
    for (let i = 0; i < 7; i++) {
      const d = new Date(start.getTime() + i * 86400000);
      if (d.getTime() >= fromMs && d.getTime() <= toMs) {
        out.push({ date: d.toISOString().slice(0,10), amount: perDay });
      }
    }
  } else if (exp.rolling && exp.rolling_days > 1) {
    const days = Math.max(1, exp.rolling_days);
    const perDay = exp.amount / days;
    for (let i = 0; i < days; i++) {
      const d = new Date(start.getTime() + i * 86400000);
      if (d.getTime() >= fromMs && d.getTime() <= toMs) {
        out.push({ date: d.toISOString().slice(0,10), amount: perDay });
      }
    }
  } else {
    // One-time, single day
    if (start.getTime() >= fromMs && start.getTime() <= toMs) {
      out.push({ date: start.toISOString().slice(0,10), amount: exp.amount });
    }
  }
  return out;
};

window.STATUSES = {
  pending:    { label: 'รอยืนยัน',     custLabel: 'รอร้านยืนยันรายการ', icon: '⏳', color: '#f59e0b', next: 'confirmed', nextLabel: '✓ ยืนยันรายการ', stage: 1 },
  confirmed:  { label: 'ยืนยันแล้ว',    custLabel: 'ร้านยืนยันแล้ว — เตรียมทำอาหาร', icon: '📋', color: '#1652F0', next: 'cooking', nextLabel: '🔥 เริ่มทำอาหาร', stage: 2 },
  cooking:    { label: 'กำลังทำ',       custLabel: 'กำลังทำอาหารให้คุณ', icon: '👨‍🍳', color: '#f97316', next: 'ready', nextLabel: '✓ อาหารเสร็จ — พร้อมส่ง', stage: 3 },
  ready:      { label: 'พร้อมจัดส่ง',   custLabel: 'อาหารเสร็จแล้ว · รอการจัดส่ง', icon: '📦', color: '#16a34a', next: 'delivering', nextLabel: '🚚 รับงานจัดส่ง', stage: 4 },
  delivering: { label: 'กำลังจัดส่ง',   custLabel: 'กำลังจัดส่งให้คุณ', icon: '🚚', color: '#06b6d4', next: 'delivered', nextLabel: '✓ จัดส่งสำเร็จ', stage: 5 },
  delivered:  { label: 'จัดส่งสำเร็จ',  custLabel: 'จัดส่งสำเร็จ ขอบคุณครับ', icon: '✅', color: '#16a34a', next: null, nextLabel: '', stage: 6 },
  done:       { label: 'จัดส่งสำเร็จ',  custLabel: 'จัดส่งสำเร็จ ขอบคุณครับ', icon: '✅', color: '#16a34a', next: null, nextLabel: '', stage: 6 },
  cancelled:  { label: 'ยกเลิก',         custLabel: 'ออเดอร์นี้ถูกยกเลิก', icon: '❌', color: '#dc2626', next: null, nextLabel: '', stage: 0 }
};

// Get unique add-on/option choices from a menu (used by admin to toggle availability)
window.getMenuChoices = function(menu) {
  const map = new Map();
  (menu || []).forEach(cat => {
    cat.items.forEach(it => {
      (it.optionGroups || []).forEach(g => {
        (g.choices || []).forEach(c => {
          if (!map.has(c)) {
            map.set(c, { name: c, priceEach: g.priceEach || 0, sampleLabel: g.label });
          }
        });
      });
    });
  });
  return Array.from(map.values()).sort((a, b) => (a.priceEach - b.priceEach) || a.name.localeCompare(b.name, 'th'));
};

// Filter out disabled choices in optionGroups (helper used by both apply funcs)
function _filterDisabledChoices(item, disabledSet) {
  if (!item.optionGroups || !disabledSet || disabledSet.size === 0) return item;
  const filtered = item.optionGroups.map(g => ({
    ...g,
    choices: (g.choices || []).filter(c => !disabledSet.has(c))
  })).filter(g => g.choices.length > 0); // drop empty groups
  return { ...item, optionGroups: filtered };
}

// 🏭 Apply factory menu config (overrides + custom factory items + disabledChoices)
window.applyFactoryConfig = function(config) {
  config = config || { overrides: {}, custom: [], disabledChoices: [] };
  const ov = config.overrides || {};
  const custom = config.custom || [];
  const disabled = new Set(config.disabledChoices || []);

  let result = (window.FACTORY_MENU || []).map(cat => ({
    ...cat,
    items: cat.items.map(it => {
      const o = ov[it.id];
      let item;
      if (!o) item = { ...it, available: true };
      else item = {
        ...it,
        ...(o.name ? { name: o.name } : {}),
        ...(o.price != null ? { price: Number(o.price) } : {}),
        available: o.available !== false
      };
      return _filterDisabledChoices(item, disabled);
    })
  }));

  custom.forEach(c => {
    const item = _filterDisabledChoices({
      id: c.id, name: c.name, price: Number(c.price),
      available: c.available !== false,
      ...(c.optionGroups ? { optionGroups: c.optionGroups } : {})
    }, disabled);
    const targetCat = result.find(cat => cat.cat === c.category);
    if (targetCat) targetCat.items.push(item);
    else result.push({ cat: c.category || 'อื่นๆ', emoji: c.emoji || '🏭', items: [item] });
  });

  return result;
};

window.applyMenuConfig = function(config) {
  config = config || { overrides: {}, custom: [], disabledChoices: [] };
  const ov = config.overrides || {};
  const custom = config.custom || [];
  const disabled = new Set(config.disabledChoices || []);

  let result = MENU.map(cat => ({
    ...cat,
    items: cat.items.map(it => {
      const o = ov[it.id];
      let item;
      if (!o) item = { ...it, available: true };
      else item = {
        ...it,
        ...(o.name ? { name: o.name } : {}),
        ...(o.price != null ? { price: Number(o.price) } : {}),
        ...(o.image ? { image: o.image } : {}),
        available: o.available !== false
      };
      // 🩹 Override option groups for built-in items: if admin set
      //    optionPresetKeys in the override, materialize from presets and
      //    REPLACE the item's default optionGroups. Empty array = "no options".
      if (o && Array.isArray(o.optionPresetKeys) && window.OPTION_PRESETS) {
        const built = o.optionPresetKeys
          .map(k => {
            const p = window.OPTION_PRESETS[k];
            if (!p || typeof p.build !== 'function') return null;
            try { return p.build(); } catch (e) { console.warn('preset build', k, e); return null; }
          })
          .filter(Boolean);
        item.optionGroups = built;
      }
      return _filterDisabledChoices(item, disabled);
    })
  }));

  custom.forEach(c => {
    // 🩹 Materialize optionGroups from preset keys (new) — falls back to
    //    raw optionGroups for legacy items that stored full groups directly.
    let optionGroups = null;
    if (Array.isArray(c.optionPresetKeys) && c.optionPresetKeys.length && window.OPTION_PRESETS) {
      optionGroups = c.optionPresetKeys
        .map(k => {
          const p = window.OPTION_PRESETS[k];
          if (!p || typeof p.build !== 'function') return null;
          try { return p.build(); } catch (e) { console.warn('preset build', k, e); return null; }
        })
        .filter(Boolean);
    } else if (Array.isArray(c.optionGroups) && c.optionGroups.length) {
      optionGroups = c.optionGroups;
    }

    const item = _filterDisabledChoices({
      id: c.id, name: c.name, price: Number(c.price),
      available: c.available !== false,
      ...(c.image ? { image: c.image } : {}),
      ...(optionGroups ? { optionGroups } : {})
    }, disabled);
    const targetCat = result.find(cat => cat.cat === c.category);
    if (targetCat) targetCat.items.push(item);
    else result.push({ cat: c.category || 'อื่นๆ', emoji: c.emoji || '🍽️', items: [item] });
  });

  return result;
};
