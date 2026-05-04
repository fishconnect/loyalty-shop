// Firebase init + cloud API exposed as window.cloud
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, doc, collection, setDoc, getDoc, getDocs,
  onSnapshot, query, orderBy, updateDoc, deleteDoc, where,
  increment
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDINBiADdxm0aLKD3S7BBOWFr9fiR21oW4",
  authDomain: "krua-phuyai-pong.firebaseapp.com",
  projectId: "krua-phuyai-pong",
  storageBucket: "krua-phuyai-pong.firebasestorage.app",
  messagingSenderId: "340301784167",
  appId: "1:340301784167:web:8bfda9700fec214d3560c2",
  measurementId: "G-G1Z546KRBQ"
};

const app = initializeApp(firebaseConfig);
const fdb = getFirestore(app);

// Image base64 strings are too big to sync via Firestore (1MB doc limit).
// Strip image fields from the menu config before pushing to cloud — images
// stay only in localStorage on the device that uploaded them.
function _stripImagesFromMenuConfig(config) {
  if (!config || typeof config !== 'object') return config || {};
  const out = { ...config };
  if (config.overrides) {
    out.overrides = {};
    Object.entries(config.overrides).forEach(([id, ov]) => {
      if (!ov) return;
      const { image, ...rest } = ov;          // drop image
      out.overrides[id] = rest;
    });
  }
  if (Array.isArray(config.custom)) {
    out.custom = config.custom.map(c => {
      if (!c) return c;
      const { image, ...rest } = c;            // drop image
      return rest;
    });
  }
  // Drop the (separate) paymentQrDataUrl too — same reason
  if (out.paymentQrDataUrl) delete out.paymentQrDataUrl;
  return out;
}

window.cloud = {
  ready: true,

  // Customers
  async saveCustomer(c) {
    if (!c?.id) return;
    try { await setDoc(doc(fdb, 'customers', String(c.id)), c, { merge: true }); }
    catch (e) { console.warn('[cloud] saveCustomer', e); }
  },
  async getCustomer(id) {
    try {
      const s = await getDoc(doc(fdb, 'customers', String(id)));
      return s.exists() ? s.data() : null;
    } catch (e) { console.warn('[cloud] getCustomer', e); return null; }
  },
  // 🔧 Manual points override — admin types in the exact value to fix data drift
  // that recompute can't fix (e.g. orders missing customer_phone, pre-system orders).
  // Logs to consent_logs for the audit trail.
  async setCustomerPointsManual(id, points, lifetime, reason) {
    if (!id) return false;
    try {
      const updates = {};
      if (typeof points === 'number' && !Number.isNaN(points)) updates.points = Math.max(0, Math.floor(points));
      if (typeof lifetime === 'number' && !Number.isNaN(lifetime)) updates.lifetime_points = Math.max(0, Math.floor(lifetime));
      if (!Object.keys(updates).length) return false;
      updates.points_manual_set_at = new Date().toISOString();
      updates.points_manual_set_reason = String(reason || '').slice(0, 500);
      await updateDoc(doc(fdb, 'customers', String(id)), updates);
      await this.saveConsentLog?.({
        type: 'admin_manual_points_set',
        customer_id: String(id),
        customer_phone: String(id),
        version: '1.1',
        accepted: true,
        details: { points: updates.points, lifetime_points: updates.lifetime_points, reason: updates.points_manual_set_reason },
      });
      return true;
    } catch (e) { console.warn('[cloud] setCustomerPointsManual', e); return false; }
  },
  // 📜 Fetch ALL orders fresh from Firestore — used by at-risk scanner so
  //    its drift report doesn't depend on whether the snapshot listener has
  //    populated db.pendingOrders yet on this admin device.
  async getAllOrders() {
    try {
      const snap = await getDocs(collection(fdb, 'orders'));
      const out = [];
      snap.forEach(d => out.push(d.data()));
      return out;
    } catch (e) { console.warn('[cloud] getAllOrders', e); return []; }
  },

  // Fetch all orders that belong to a phone — for diagnostic display
  async getOrdersForCustomer(phoneOrId) {
    try {
      const snap = await getDocs(collection(fdb, 'orders'));
      const out = [];
      const target = String(phoneOrId);
      snap.forEach(d => {
        const o = d.data();
        if (o.customer_id === target || o.customer_phone === target) out.push(o);
      });
      return out;
    } catch (e) { console.warn('[cloud] getOrdersForCustomer', e); return []; }
  },

  async deleteCustomer(id) {
    try { await deleteDoc(doc(fdb, 'customers', String(id))); }
    catch (e) { console.warn('[cloud] deleteCustomer', e); }
  },
  // 🔒 Atomic point operations — server-side increment so concurrent writes don't lose updates
  async incrementCustomerPoints(id, deltaPoints, deltaLifetime, extra) {
    if (!id) return;
    const updates = {};
    if (typeof deltaPoints === 'number' && deltaPoints !== 0) updates.points = increment(deltaPoints);
    if (typeof deltaLifetime === 'number' && deltaLifetime !== 0) updates.lifetime_points = increment(deltaLifetime);
    if (extra && typeof extra === 'object') Object.assign(updates, extra);
    if (!Object.keys(updates).length) return;
    try {
      await updateDoc(doc(fdb, 'customers', String(id)), updates);
    } catch (e) {
      // Doc might not exist yet — fall back to setDoc with merge (won't be atomic but works)
      console.warn('[cloud] incrementCustomerPoints fallback', e);
      try {
        const flat = {};
        if (typeof deltaPoints === 'number') flat.points = deltaPoints;
        if (typeof deltaLifetime === 'number') flat.lifetime_points = deltaLifetime;
        if (extra) Object.assign(flat, extra);
        await setDoc(doc(fdb, 'customers', String(id)), flat, { merge: true });
      } catch (e2) { console.warn('[cloud] incrementCustomerPoints fatal', e2); }
    }
  },
  async getAllCustomers() {
    try {
      const snap = await getDocs(collection(fdb, 'customers'));
      const out = {};
      snap.forEach(d => out[d.id] = d.data());
      return out;
    } catch (e) { console.warn('[cloud] getAllCustomers', e); return {}; }
  },
  onCustomers(cb) {
    return onSnapshot(collection(fdb, 'customers'), snap => {
      const out = {};
      snap.forEach(d => out[d.id] = d.data());
      cb(out);
    }, err => console.warn('[cloud] onCustomers', err));
  },

  // Orders (pending + done both)
  async saveOrder(o) {
    if (!o?.id) return;
    try { await setDoc(doc(fdb, 'orders', String(o.id)), o, { merge: true }); }
    catch (e) { console.warn('[cloud] saveOrder', e); throw e; }
  },
  async updateOrder(id, updates) {
    try { await updateDoc(doc(fdb, 'orders', String(id)), updates); }
    catch (e) { console.warn('[cloud] updateOrder', e); }
  },
  async deleteOrder(id) {
    try { await deleteDoc(doc(fdb, 'orders', String(id))); }
    catch (e) { console.warn('[cloud] deleteOrder', e); }
  },
  // 🛑 Customer-initiated cancel — only allowed while status is 'pending'.
  // We don't delete the order; we flip its status to 'cancelled' and stamp
  // who/when so the kitchen sees the change immediately and accounting keeps
  // a complete history.
  async cancelOrderByCustomer(id, reason) {
    if (!id) return;
    try {
      await updateDoc(doc(fdb, 'orders', String(id)), {
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: 'customer',
        cancel_reason: reason || 'ลูกค้ายกเลิกเอง',
      });
      return true;
    } catch (e) { console.warn('[cloud] cancelOrderByCustomer', e); return false; }
  },
  onOrders(cb) {
    return onSnapshot(query(collection(fdb, 'orders'), orderBy('date', 'desc')), snap => {
      const out = [];
      snap.forEach(d => out.push(d.data()));
      cb(out);
    }, err => console.warn('[cloud] onOrders', err));
  },
  onOrder(id, cb) {
    return onSnapshot(doc(fdb, 'orders', String(id)), snap => {
      cb(snap.exists() ? snap.data() : null);
    }, err => console.warn('[cloud] onOrder', err));
  },

  // 🎁 LOYALTY CONFIG — admin-editable thresholds + drink-reward menu list,
  //    plus a list of time-windowed promotions that override the base values
  //    while active. Stored in `settings/loyalty`. Customer points balances
  //    are NOT touched — only the redemption rules change.
  //    Schema: { base: {...}, promos: [{id,name,start,end,overrides:{...}}] }
  async getLoyaltyConfig() {
    try {
      const s = await getDoc(doc(fdb, 'settings', 'loyalty'));
      return s.exists() ? s.data() : null;
    } catch (e) { console.warn('[cloud] getLoyaltyConfig', e); return null; }
  },
  async saveLoyaltyConfig(config) {
    try { await setDoc(doc(fdb, 'settings', 'loyalty'), config); return true; }
    catch (e) { console.warn('[cloud] saveLoyaltyConfig', e); return false; }
  },
  onLoyaltyConfig(cb) {
    return onSnapshot(doc(fdb, 'settings', 'loyalty'), snap => {
      cb(snap.exists() ? snap.data() : null);
    }, err => console.warn('[cloud] onLoyaltyConfig', err));
  },

  // 🖼️ MENU IMAGES — stored in a separate collection to bypass the 1MB
  //    Firestore doc limit on the menuConfig doc. Each image lives in its
  //    own doc menu_images/{itemId} = { dataUrl, savedAt }. Compressed
  //    images are ~50KB so far below the per-doc limit.
  async saveMenuImage(itemId, dataUrl) {
    if (!itemId || !dataUrl) return false;
    try {
      await setDoc(doc(fdb, 'menu_images', String(itemId)), {
        dataUrl,
        savedAt: new Date().toISOString(),
      });
      return true;
    } catch (e) { console.warn('[cloud] saveMenuImage', e); return false; }
  },
  async deleteMenuImage(itemId) {
    if (!itemId) return false;
    try { await deleteDoc(doc(fdb, 'menu_images', String(itemId))); return true; }
    catch (e) { console.warn('[cloud] deleteMenuImage', e); return false; }
  },
  async getAllMenuImages() {
    try {
      const snap = await getDocs(collection(fdb, 'menu_images'));
      const out = {};
      snap.forEach(d => { const data = d.data(); if (data?.dataUrl) out[d.id] = data.dataUrl; });
      return out;
    } catch (e) { console.warn('[cloud] getAllMenuImages', e); return {}; }
  },
  onMenuImages(cb) {
    return onSnapshot(collection(fdb, 'menu_images'), snap => {
      const out = {};
      snap.forEach(d => { const data = d.data(); if (data?.dataUrl) out[d.id] = data.dataUrl; });
      cb(out);
    }, err => console.warn('[cloud] onMenuImages', err));
  },

  // Menu config (overrides + custom items)
  // 🔧 Image base64 strings are heavy. Firestore doc limit = 1MB.
  // CRITICAL: setDoc({merge:true}) deep-merges sub-maps which means
  // existing image fields stay even if we send stripped data — so the
  // doc keeps growing. Use setDoc WITHOUT merge to fully replace the
  // doc with our (stripped) version. Images live only in localStorage.
  async saveMenuConfig(config) {
    try {
      const stripped = _stripImagesFromMenuConfig(config);
      await setDoc(doc(fdb, 'settings', 'menu'), stripped);  // no merge: replace entire doc
    } catch (e) { console.warn('[cloud] saveMenuConfig', e); throw e; }
  },
  async getMenuConfig() {
    try {
      const s = await getDoc(doc(fdb, 'settings', 'menu'));
      return s.exists() ? s.data() : { overrides: {}, custom: [] };
    } catch (e) { return { overrides: {}, custom: [] }; }
  },
  onMenuConfig(cb) {
    return onSnapshot(doc(fdb, 'settings', 'menu'), snap => {
      cb(snap.exists() ? snap.data() : { overrides: {}, custom: [] });
    });
  },

  // 🏭 Factory menu config (separate from regular menu) — same image issue
  async saveFactoryConfig(config) {
    try {
      const stripped = _stripImagesFromMenuConfig(config);
      await setDoc(doc(fdb, 'settings', 'factory'), stripped);  // no merge: replace
    }
    catch (e) { console.warn('[cloud] saveFactoryConfig', e); }
  },
  async getFactoryConfig() {
    try {
      const s = await getDoc(doc(fdb, 'settings', 'factory'));
      return s.exists() ? s.data() : { overrides: {}, custom: [] };
    } catch (e) { return { overrides: {}, custom: [] }; }
  },
  onFactoryConfig(cb) {
    return onSnapshot(doc(fdb, 'settings', 'factory'), snap => {
      cb(snap.exists() ? snap.data() : { overrides: {}, custom: [] });
    });
  },

  // Admin password
  async saveAdminPassword(pwd) {
    try { await setDoc(doc(fdb, 'settings', 'admin'), { password: pwd }, { merge: true }); }
    catch (e) { console.warn('[cloud] saveAdminPassword', e); }
  },
  async getAdminPassword() {
    try {
      const s = await getDoc(doc(fdb, 'settings', 'admin'));
      return s.exists() ? (s.data().password || '1234') : '1234';
    } catch (e) { return '1234'; }
  },

  // Feature flags (turn marketing features on/off without redeploy)
  async saveFeatureFlags(flags) {
    try { await setDoc(doc(fdb, 'settings', 'features'), flags, { merge: true }); }
    catch (e) { console.warn('[cloud] saveFeatureFlags', e); }
  },
  async getFeatureFlags() {
    try {
      const s = await getDoc(doc(fdb, 'settings', 'features'));
      return s.exists() ? s.data() : null;
    } catch (e) { return null; }
  },
  onFeatureFlags(cb) {
    return onSnapshot(doc(fdb, 'settings', 'features'), snap => {
      cb(snap.exists() ? snap.data() : null);
    });
  },

  // 💰 Expenses (food cost, packaging, labor, rent, utilities, etc.)
  async saveExpense(e) {
    if (!e?.id) return;
    try { await setDoc(doc(fdb, 'expenses', String(e.id)), e, { merge: true }); }
    catch (err) { console.warn('[cloud] saveExpense', err); throw err; }
  },
  async deleteExpense(id) {
    try { await deleteDoc(doc(fdb, 'expenses', String(id))); }
    catch (err) { console.warn('[cloud] deleteExpense', err); }
  },
  onExpenses(cb) {
    return onSnapshot(collection(fdb, 'expenses'), snap => {
      const out = [];
      snap.forEach(d => out.push(d.data()));
      cb(out);
    }, err => console.warn('[cloud] onExpenses', err));
  },

  // Chat / contact button config (customer-facing chat link)
  async saveContactConfig(cfg) {
    try { await setDoc(doc(fdb, 'settings', 'contact'), cfg, { merge: true }); }
    catch (e) { console.warn('[cloud] saveContactConfig', e); }
  },
  async getContactConfig() {
    try {
      const s = await getDoc(doc(fdb, 'settings', 'contact'));
      return s.exists() ? s.data() : null;
    } catch (e) { return null; }
  },
  onContactConfig(cb) {
    return onSnapshot(doc(fdb, 'settings', 'contact'), snap => {
      cb(snap.exists() ? snap.data() : null);
    });
  },

  // 🔒 PDPA RECOVERY — admin-initiated unlock for customers who lost access
  // (forgot birthday, switched devices and can't verify, etc.). Every action
  // is logged for the audit trail.
  async resetCustomerBirthday(phoneOrId, adminNote) {
    if (!phoneOrId) return false;
    try {
      await updateDoc(doc(fdb, 'customers', String(phoneOrId)), {
        birth_day: null,
        birth_month: null,
        birth_locked: false,
        birth_reset_at: new Date().toISOString(),
        birth_reset_note: adminNote || 'admin reset',
      });
      await this.saveConsentLog?.({
        type: 'admin_birthday_reset',
        customer_id: String(phoneOrId),
        customer_phone: String(phoneOrId),
        version: '1.1',
        accepted: true,
        details: { admin_note: adminNote || '', user_agent: navigator.userAgent.slice(0, 200) },
      });
      return true;
    } catch (e) { console.warn('[cloud] resetCustomerBirthday', e); return false; }
  },

  async clearCustomerLinkedDevices(phoneOrId, adminNote) {
    if (!phoneOrId) return false;
    try {
      await updateDoc(doc(fdb, 'customers', String(phoneOrId)), {
        linked_devices: [],
        devices_cleared_at: new Date().toISOString(),
        devices_cleared_note: adminNote || 'admin cleared',
      });
      await this.saveConsentLog?.({
        type: 'admin_devices_cleared',
        customer_id: String(phoneOrId),
        customer_phone: String(phoneOrId),
        version: '1.1',
        accepted: true,
        details: { admin_note: adminNote || '', user_agent: navigator.userAgent.slice(0, 200) },
      });
      return true;
    } catch (e) { console.warn('[cloud] clearCustomerLinkedDevices', e); return false; }
  },

  // 🧹 PDPA CLEANUP — anonymize a customer per retention policy
  // (after 3 years inactive). Strips PII but keeps an empty shell so
  // historical orders still aggregate correctly.
  async anonymizeCustomer(phoneOrId, reason) {
    if (!phoneOrId) return false;
    try {
      // Generate a random anon id so future order aggregations still work
      const anonId = 'anon-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
      await updateDoc(doc(fdb, 'customers', String(phoneOrId)), {
        name: '[ANONYMIZED]',
        phone: '',
        photo: null,
        birth_day: null,
        birth_month: null,
        birth_locked: false,
        delivery_addresses: [],
        linked_devices: [],
        anonymized: true,
        anonymized_at: new Date().toISOString(),
        anonymized_reason: reason || 'retention_policy',
        anon_id: anonId,
      });
      await this.saveConsentLog?.({
        type: 'customer_anonymized',
        customer_id: String(phoneOrId),
        customer_phone: '',
        version: '1.1',
        accepted: true,
        details: { reason: reason || 'retention_policy', anon_id: anonId },
      });
      return true;
    } catch (e) { console.warn('[cloud] anonymizeCustomer', e); return false; }
  },

  // 🔐 PIN AUTH SYSTEM — phone + 4-digit PIN auth that works on any device,
  //    any browser. Replaces device-bound verification so customers can log
  //    in from Safari/Chrome/Edge on a friend's phone, etc. PIN is hashed
  //    SHA-256 with phone as salt + a global pepper, so the stored hash is
  //    not directly brute-forceable per-customer.
  //
  //    Lockout: 3 wrong attempts → 1-minute lock (server-side counter).
  async _hashPin(phone, pin) {
    const salt = String(phone) + ':loyalty-shop-pin-v1:';
    const data = new TextEncoder().encode(salt + String(pin));
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0')).join('');
  },

  async setCustomerPin(phone, pin) {
    if (!phone) return { ok: false, error: 'missing phone' };
    if (!/^\d{4}$/.test(String(pin))) return { ok: false, error: 'PIN ต้องเป็นตัวเลข 4 หลัก' };
    try {
      const pinHash = await this._hashPin(phone, pin);
      await updateDoc(doc(fdb, 'customers', String(phone)), {
        pin_hash: pinHash,
        pin_set_at: new Date().toISOString(),
        pin_lock_until: 0,
        pin_attempts: 0,
      });
      return { ok: true };
    } catch (e) { console.warn('[cloud] setCustomerPin', e); return { ok: false, error: e.message }; }
  },

  // Login: verify phone + PIN. Manages lockout server-side.
  // Returns { ok, customer, error?, attemptsLeft?, lockUntil?, needsPinSetup? }
  async verifyCustomerPin(phone, pin) {
    if (!phone || !pin) return { ok: false, error: 'กรอกเบอร์และ PIN ให้ครบ' };
    try {
      const ref = doc(fdb, 'customers', String(phone));
      const snap = await getDoc(ref);
      if (!snap.exists()) return { ok: false, error: 'ไม่พบเบอร์นี้ในระบบ' };
      const cust = snap.data();
      const now = Date.now();

      // Check lockout
      if (cust.pin_lock_until && cust.pin_lock_until > now) {
        const secondsLeft = Math.ceil((cust.pin_lock_until - now) / 1000);
        return { ok: false, error: `🔒 ล็อก ${secondsLeft} วินาที (ผิดเกินกำหนด)`, lockUntil: cust.pin_lock_until };
      }

      // No PIN set yet → flag for migration UI
      if (!cust.pin_hash) {
        return {
          ok: false,
          needsPinSetup: true,
          error: 'ลูกค้านี้ยังไม่ได้ตั้ง PIN — กรุณาตั้งใหม่',
          hasBirthday: !!(cust.birth_day && cust.birth_month),
        };
      }

      const inputHash = await this._hashPin(phone, pin);
      if (inputHash !== cust.pin_hash) {
        const newAttempts = (cust.pin_attempts || 0) + 1;
        const updates = { pin_attempts: newAttempts };
        if (newAttempts >= 3) {
          updates.pin_lock_until = now + 60 * 1000; // 1 minute
          updates.pin_attempts = 0;                 // reset for next round
        }
        await updateDoc(ref, updates);
        const remaining = Math.max(0, 3 - newAttempts);
        return {
          ok: false,
          error: remaining > 0 ? `PIN ไม่ถูกต้อง · เหลืออีก ${remaining} ครั้ง` : '🔒 ผิด 3 ครั้ง · ล็อก 1 นาที',
          attemptsLeft: remaining,
        };
      }

      // Success — reset counters
      if (cust.pin_attempts || cust.pin_lock_until) {
        await updateDoc(ref, { pin_attempts: 0, pin_lock_until: 0 });
      }
      return { ok: true, customer: cust };
    } catch (e) {
      console.warn('[cloud] verifyCustomerPin', e);
      return { ok: false, error: e.message };
    }
  },

  // Self-service migration: existing customer (no PIN, has birthday on file)
  // verifies with birthday and sets a new PIN in one step.
  async setCustomerPinByBirthday(phone, day, month, newPin) {
    if (!phone || !day || !month) return { ok: false, error: 'missing fields' };
    if (!/^\d{4}$/.test(String(newPin))) return { ok: false, error: 'PIN ต้องเป็นตัวเลข 4 หลัก' };
    try {
      const ref = doc(fdb, 'customers', String(phone));
      const snap = await getDoc(ref);
      if (!snap.exists()) return { ok: false, error: 'ไม่พบเบอร์นี้' };
      const cust = snap.data();
      if (!cust.birth_day || !cust.birth_month) {
        return { ok: false, error: 'ลูกค้านี้ไม่ได้บันทึกวันเกิด — ติดต่อร้าน' };
      }
      if (parseInt(day) !== cust.birth_day || parseInt(month) !== cust.birth_month) {
        return { ok: false, error: 'วันเกิดไม่ตรง — ติดต่อร้าน' };
      }
      const pinHash = await this._hashPin(phone, newPin);
      await updateDoc(ref, {
        pin_hash: pinHash,
        pin_set_at: new Date().toISOString(),
        pin_set_by: 'self_birthday_verify',
        pin_lock_until: 0,
        pin_attempts: 0,
      });
      await this.saveConsentLog?.({
        type: 'pin_set_by_birthday',
        customer_id: String(phone),
        customer_phone: String(phone),
        version: '1.2',
        accepted: true,
        details: { method: 'self_birthday_verify' },
      });
      return { ok: true, customer: cust };
    } catch (e) {
      console.warn('[cloud] setCustomerPinByBirthday', e);
      return { ok: false, error: e.message };
    }
  },

  // Admin override: reset PIN without verification. Used when customer forgot
  // PIN AND has no birthday on file. Admin must verify identity out-of-band.
  async resetCustomerPinAdmin(phone, newPin, adminNote) {
    if (!phone) return { ok: false, error: 'missing phone' };
    if (!/^\d{4}$/.test(String(newPin))) return { ok: false, error: 'PIN ต้องเป็นตัวเลข 4 หลัก' };
    try {
      const pinHash = await this._hashPin(phone, newPin);
      await updateDoc(doc(fdb, 'customers', String(phone)), {
        pin_hash: pinHash,
        pin_set_at: new Date().toISOString(),
        pin_set_by: 'admin_reset',
        pin_reset_note: String(adminNote || '').slice(0, 500),
        pin_lock_until: 0,
        pin_attempts: 0,
      });
      await this.saveConsentLog?.({
        type: 'admin_pin_reset',
        customer_id: String(phone),
        customer_phone: String(phone),
        version: '1.2',
        accepted: true,
        details: { admin_note: adminNote || '' },
      });
      return { ok: true };
    } catch (e) {
      console.warn('[cloud] resetCustomerPinAdmin', e);
      return { ok: false, error: e.message };
    }
  },

  // 🆔 DEVICE TRUST CODE — mobile-friendly admin-assisted unlock.
  //   Customer's "verify gate" generates a 4-char code from their deviceId,
  //   writes the request to /device_trust_requests/{phone}_{code}, and shows
  //   the code on screen. Customer reads the code aloud to the shop owner,
  //   who types phone + code into admin → cloud.trustDeviceByCode() looks up
  //   the request, links the device to the customer's account, and deletes
  //   the request. No more chicken-and-egg "ติดต่อ admin" lockout.
  //
  //   Doc shape: { device_id, phone, code, name, requested_at, user_agent }
  //   TTL: client clears requests older than 30 min on next access.
  async requestDeviceTrust(phone, code, deviceId, displayName) {
    if (!phone || !code || !deviceId) return false;
    try {
      const id = String(phone) + '_' + String(code).toUpperCase();
      await setDoc(doc(fdb, 'device_trust_requests', id), {
        device_id: deviceId,
        phone: String(phone),
        code: String(code).toUpperCase(),
        name: displayName || '',
        requested_at: new Date().toISOString(),
        user_agent: navigator.userAgent.slice(0, 200),
      });
      return true;
    } catch (e) { console.warn('[cloud] requestDeviceTrust', e); return false; }
  },

  // 👨‍💼 Admin-side: list all pending trust requests (< 30 min old) so admin
  // can see who's currently at the verify gate without guessing codes. Auto-
  // cleans stale entries (>30 min) in the background.
  async listPendingTrustRequests() {
    try {
      const snap = await getDocs(collection(fdb, 'device_trust_requests'));
      const now = Date.now();
      const out = [];
      for (const d of snap.docs) {
        const data = d.data();
        const t = data.requested_at ? new Date(data.requested_at).getTime() : 0;
        const age = now - t;
        if (age <= 30 * 60 * 1000) {
          out.push({
            phone: data.phone || '',
            code: data.code || '',
            name: data.name || '',
            device_id: data.device_id || '',
            ageSec: Math.max(0, Math.floor(age / 1000)),
            id: d.id,
          });
        } else {
          // Stale — best-effort cleanup, don't block listing
          deleteDoc(doc(fdb, 'device_trust_requests', d.id)).catch(() => {});
        }
      }
      out.sort((a, b) => a.ageSec - b.ageSec); // newest first
      return out;
    } catch (e) { console.warn('[cloud] listPendingTrustRequests', e); return []; }
  },

  // 👨‍💼 Admin-side: look up the request by phone+code, link the device, delete request.
  // Returns { ok: true, deviceId, name } on success, { ok: false, error: '...' } on fail.
  async trustDeviceByCode(phone, code) {
    if (!phone || !code) return { ok: false, error: 'missing phone or code' };
    const id = String(phone) + '_' + String(code).toUpperCase();
    try {
      const ref = doc(fdb, 'device_trust_requests', id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        return { ok: false, error: 'ไม่พบคำขอ — ลูกค้าต้องเปิดประตูยืนยันค้างไว้และอ่านโค้ดที่ขึ้นบนจอ' };
      }
      const req = snap.data();
      // Reject stale requests (> 30 min old) for safety
      const age = Date.now() - new Date(req.requested_at).getTime();
      if (age > 30 * 60 * 1000) {
        await deleteDoc(ref).catch(() => {});
        return { ok: false, error: 'โค้ดนี้หมดอายุแล้ว (>30 นาที) — ขอให้ลูกค้ารีเฟรชหน้าจอแล้วอ่านโค้ดใหม่' };
      }
      // Link the device
      const linked = await this.linkDeviceToCustomer(req.phone, req.device_id, 'admin_code');
      if (!linked) return { ok: false, error: 'ไม่พบลูกค้าเบอร์นี้ในระบบ' };
      // Best-effort cleanup
      try { await deleteDoc(ref); } catch (e) {}
      // Audit log specific to this method
      try {
        await this.saveConsentLog?.({
          type: 'admin_device_trust_by_code',
          customer_id: String(req.phone),
          customer_phone: String(req.phone),
          version: '1.1',
          accepted: true,
          details: { device_id: req.device_id, code: String(code).toUpperCase() },
        });
      } catch (e) {}
      return { ok: true, deviceId: req.device_id, name: req.name || '' };
    } catch (e) {
      console.warn('[cloud] trustDeviceByCode', e);
      return { ok: false, error: e.message };
    }
  },

  // 🔒 Add a device ID to the customer's trusted devices list. Called after
  // a successful birthday-verification on a new device. Idempotent.
  async linkDeviceToCustomer(phoneOrId, deviceId, verifiedBy) {
    if (!phoneOrId || !deviceId) return false;
    try {
      const ref = doc(fdb, 'customers', String(phoneOrId));
      const snap = await getDoc(ref);
      if (!snap.exists()) return false;
      const cust = snap.data();
      const linked = Array.isArray(cust.linked_devices) ? cust.linked_devices : [];
      if (linked.includes(deviceId)) return true;
      linked.push(deviceId);
      await updateDoc(ref, {
        linked_devices: linked,
        last_device_link_at: new Date().toISOString(),
        last_device_link_by: verifiedBy || 'birthday',
      });
      // Also log it in consent_logs for audit trail (PDPA)
      await this.saveConsentLog?.({
        type: 'device_linked',
        customer_id: String(phoneOrId),
        customer_phone: String(phoneOrId),
        version: '1.0',
        accepted: true,
        details: { device_id: deviceId, method: verifiedBy || 'birthday', user_agent: navigator.userAgent.slice(0, 200) },
      });
      return true;
    } catch (e) { console.warn('[cloud] linkDeviceToCustomer', e); return false; }
  },

  // 🔒 PDPA consent log — every time a customer accepts/rejects a policy version,
  // we write an immutable record to /consent_logs so we can prove later that
  // consent was obtained (which version, when, what device, what they agreed to).
  async saveConsentLog(log) {
    if (!log?.id) log.id = 'cl-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    log.timestamp = log.timestamp || new Date().toISOString();
    try {
      await setDoc(doc(fdb, 'consent_logs', String(log.id)), log);
      return log.id;
    } catch (e) { console.warn('[cloud] saveConsentLog', e); return null; }
  },
  async getConsentLogsForCustomer(phoneOrId) {
    try {
      const q = query(collection(fdb, 'consent_logs'), where('customer_id', '==', String(phoneOrId)));
      const snap = await getDocs(q);
      const out = [];
      snap.forEach(d => out.push(d.data()));
      return out.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (e) { console.warn('[cloud] getConsentLogsForCustomer', e); return []; }
  },
  onConsentLogs(cb) {
    return onSnapshot(collection(fdb, 'consent_logs'), snap => {
      const out = [];
      snap.forEach(d => out.push(d.data()));
      cb(out.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    }, err => console.warn('[cloud] onConsentLogs', err));
  },

  // 🔒 PDPA: soft-delete request (right to erasure / right to be forgotten).
  // We don't hard-delete because we may need the order history for accounting,
  // but we mark the customer as deleted + redact their PII.
  async requestAccountDeletion(phoneOrId, reason) {
    if (!phoneOrId) return;
    try {
      await updateDoc(doc(fdb, 'customers', String(phoneOrId)), {
        deletion_requested: true,
        deletion_requested_at: new Date().toISOString(),
        deletion_reason: reason || '',
      });
      // Log it as a PDPA event too
      await this.saveConsentLog({
        type: 'account_deletion_request',
        customer_id: String(phoneOrId),
        customer_phone: String(phoneOrId),
        accepted: false,
        details: { reason: reason || '' },
      });
    } catch (e) { console.warn('[cloud] requestAccountDeletion', e); }
  },

  // Telegram bot config (shared across devices)
  async saveTelegramConfig(cfg) {
    try { await setDoc(doc(fdb, 'settings', 'telegram'), cfg, { merge: true }); }
    catch (e) { console.warn('[cloud] saveTelegramConfig', e); }
  },
  async getTelegramConfig() {
    try {
      const s = await getDoc(doc(fdb, 'settings', 'telegram'));
      return s.exists() ? s.data() : null;
    } catch (e) { return null; }
  },
  onTelegramConfig(cb) {
    return onSnapshot(doc(fdb, 'settings', 'telegram'), snap => {
      cb(snap.exists() ? snap.data() : null);
    });
  }
};

// Helper for non-module scripts to await cloud
window.dispatchEvent(new CustomEvent('cloud-ready'));
console.log('[cloud] Firebase ready');
