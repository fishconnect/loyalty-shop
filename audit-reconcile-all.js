// 🧮 audit-reconcile-all (loyalty-shop / krua-phuyai-pong)
//
//   Whole-customer-base reconciliation. For EVERY customer it recomputes the
//   authoritative balance from order history (the SAME rules as the admin
//   "คำนวณแต้มใหม่" button) and detects three kinds of drift:
//     • points / lifetime_points don't match the computed truth
//     • OVER-REDEMPTION: redeemed more than earned → needs a write-off so the
//       stamp-card ledger reconciles to 0 (shop absorbs the deficit)
//     • redeem counters (drink/dish/food) don't match the actual orders
//
//   Earn model (mirrors index.html recomputePoints exactly):
//     earned   = Σ over DONE/DELIVERED non-factory orders of
//                  (points_awarded if stamped, else floor(total/50))
//     used     = Σ points_used in those done orders' redemptions
//     signup   = 5 if the customer has ANY non-factory order
//     lifetime = signup + earned
//     points   = max(0, lifetime - used)
//     deficit  = max(0, used - lifetime)   // = points_writeoff_amount
//
//   Safety: DRY-RUN by default (writes nothing, prints a full report).
//           `--apply` writes the corrected fields per customer.
//
// Usage:
//   node audit-reconcile-all.js            # dry-run report
//   node audit-reconcile-all.js --apply    # reconcile every customer

const admin = require('firebase-admin');
const path = require('path');
const SA = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, 'service-account.json');
try { admin.initializeApp({ credential: admin.credential.cert(require(SA)) }); }
catch (e) { console.error('❌ service account:', e.message); process.exit(1); }

const db = admin.firestore();
const APPLY = process.argv.includes('--apply');
const SIGNUP = 5;
const PER_BAHT = 1 / 50;

const norm = p => String(p || '').replace(/\D/g, '');

(async () => {
  const [custSnap, orderSnap] = await Promise.all([
    db.collection('customers').get(),
    db.collection('orders').get(),
  ]);

  // index orders by customer (phone or id)
  const orders = [];
  orderSnap.forEach(d => orders.push({ _id: d.id, ...d.data() }));
  const byKey = new Map();
  const push = (k, o) => { if (!k) return; if (!byKey.has(k)) byKey.set(k, []); byKey.get(k).push(o); };
  orders.forEach(o => { push(norm(o.customer_phone), o); if (o.customer_id) push(String(o.customer_id), o); });

  const customers = [];
  custSnap.forEach(d => customers.push({ _id: d.id, ...d.data() }));

  let nDrift = 0, nOver = 0, totalDeficit = 0, nCounter = 0;
  const changes = [];

  for (const c of customers) {
    const phone = norm(c.phone || c._id);
    // gather this customer's orders (dedup by order doc id)
    const seen = new Set();
    const mine = [];
    [...(byKey.get(phone) || []), ...(byKey.get(String(c._id)) || []), ...(byKey.get(String(c.id)) || [])]
      .forEach(o => { if (!seen.has(o._id)) { seen.add(o._id); mine.push(o); } });

    const nonFactory = mine.filter(o => o.source !== 'factory');
    const done = nonFactory.filter(o => ['done', 'delivered'].includes(o.status));

    let earned = 0;
    done.forEach(o => {
      earned += (typeof o.points_awarded === 'number')
        ? o.points_awarded
        : Math.floor(Number(o.total || 0) * PER_BAHT);
    });
    let used = 0, drinkN = 0, dishN = 0, foodN = 0;
    done.forEach(o => (o.redemptions || []).forEach(r => {
      used += Number(r.points_used || 0);
      if (r.type === 'drink') drinkN++;
      else if (r.type === 'discount') dishN++;
      else if (r.type === 'food') foodN++;
    }));

    const signup = nonFactory.length > 0 ? SIGNUP : 0;
    const lifetime = signup + earned;
    const points = Math.max(0, lifetime - used);
    const deficit = Math.max(0, used - lifetime);

    const curPts = Number(c.points || 0);
    const curLife = Number(c.lifetime_points || 0);
    const curWO = Number(c.points_writeoff_amount || 0);
    const curDrink = Number(c.drink_redeemed_count || 0);

    const ptsDrift = curPts !== points || curLife !== lifetime;
    const woDrift = curWO !== deficit;
    const cntDrift = curDrink !== drinkN;

    if (!ptsDrift && !woDrift && !cntDrift) continue;

    if (ptsDrift) nDrift++;
    if (deficit > 0) { nOver++; totalDeficit += deficit; }
    if (cntDrift) nCounter++;

    changes.push({
      phone, docId: c._id, name: c.name, orders: nonFactory.length,
      from: { points: curPts, lifetime: curLife, writeoff: curWO, drink: curDrink },
      to:   { points, lifetime, writeoff: deficit, drink: drinkN, dish: dishN, food: foodN },
      deficit,
    });
  }

  // ---- report ----
  changes.sort((a, b) => b.deficit - a.deficit || (b.to.lifetime - a.to.lifetime));
  console.log(`\n===== AUDIT (${customers.length} customers, ${orders.length} orders) =====`);
  console.log(`drift (points/lifetime off): ${nDrift}`);
  console.log(`OVER-REDEEMERS (need write-off): ${nOver}  · total deficit absorbed = ${totalDeficit} แต้ม`);
  console.log(`counter mismatch (drink): ${nCounter}`);
  console.log(`customers needing a change: ${changes.length}\n`);

  changes.forEach(ch => {
    const flag = ch.deficit > 0 ? '⛔OVER' : '  drift';
    console.log(`${flag} | ${ch.name || ''} (${ch.phone}) | ${ch.orders} ord`);
    console.log(`        points ${ch.from.points}→${ch.to.points} · lifetime ${ch.from.lifetime}→${ch.to.lifetime} · writeoff ${ch.from.writeoff}→${ch.to.writeoff} · drinkCnt ${ch.from.drink}→${ch.to.drink}`);
  });

  if (!APPLY) {
    console.log(`\n🔍 DRY-RUN — nothing written. Re-run with --apply to reconcile all ${changes.length} customers.`);
    process.exit(0);
  }

  console.log(`\n💾 Applying ${changes.length} reconciliations...`);
  const nowIso = new Date().toISOString();
  let ok = 0;
  for (const ch of changes) {
    const updates = {
      points: ch.to.points,
      lifetime_points: ch.to.lifetime,
      drink_redeemed_count: ch.to.drink,
      dish_redeemed_count: ch.to.dish,
      food_redeemed_count: ch.to.food,
    };
    if (ch.to.writeoff > 0) {
      updates.points_writeoff_amount = ch.to.writeoff;
      updates.points_writeoff_at = nowIso;
    } else {
      updates.points_writeoff_amount = admin.firestore.FieldValue.delete();
      updates.points_writeoff_at = admin.firestore.FieldValue.delete();
    }
    try { await db.doc('customers/' + ch.docId).update(updates); ok++; }
    catch (e) { console.warn(`  ⚠️ ${ch.name} (${ch.docId}):`, e.message); }
  }
  console.log(`✅ reconciled ${ok}/${changes.length} customers.`);
  process.exit(0);
})().catch(e => { console.error('❌', e); process.exit(1); });
