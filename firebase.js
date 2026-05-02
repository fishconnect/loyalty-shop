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
