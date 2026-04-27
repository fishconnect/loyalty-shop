// Firebase init + cloud API exposed as window.cloud
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, doc, collection, setDoc, getDoc, getDocs,
  onSnapshot, query, orderBy, updateDoc, deleteDoc, where
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
  }
};

// Helper for non-module scripts to await cloud
window.dispatchEvent(new CustomEvent('cloud-ready'));
console.log('[cloud] Firebase ready');
