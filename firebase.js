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
  async saveMenuConfig(config) {
    try { await setDoc(doc(fdb, 'settings', 'menu'), config, { merge: true }); }
    catch (e) { console.warn('[cloud] saveMenuConfig', e); }
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

  // 🏭 Factory menu config (separate from regular menu)
  async saveFactoryConfig(config) {
    try { await setDoc(doc(fdb, 'settings', 'factory'), config, { merge: true }); }
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
