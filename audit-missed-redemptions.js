// 🛡️ audit-missed-redemptions (loyalty-shop / krua-phuyai-pong)
//   Reconciles customer point balances against their order history.
//
//   Background: before the 2026-05-27 hotfix, the customer-side and
//   kitchen-side redeem paths wrote loyalty fields via full-doc
//   `saveCustomer({merge:true})`. A stale local snapshot could:
//     (a) silently overwrite cloud-side earnings backwards, OR
//     (b) on stricter Firestore rules, get rejected entirely.
//   Either way, orders sometimes showed `-15 แต้ม` to the kitchen but the
//   customer's cloud points never reflected the deduction. Shop absorbed
//   the discount.
//
//   This script:
//     1. Reads every customer doc.
//     2. Reads every order belonging to that customer (by id or phone).
//     3. Computes:
//          actual_redeemed   = SUM of order.redemptions[].points_used
//          implied_redeemed  = customer.lifetime_points - customer.points
//          missed            = actual_redeemed - implied_redeemed
//        (positive `missed` = customer still has points they shouldn't —
//        the shop ate that discount; negative = customer was over-charged.)
//
//   By default (--dry-run, default) it prints + writes CSV.
//   Pass --apply to actually deduct the missed amount via FieldValue.increment.
//
// Usage:
//   1. Download service account:
//        Firebase Console → Project Settings (krua-phuyai-pong)
//          → Service accounts → Generate new private key
//      Save as ./service-account.json (or set GOOGLE_APPLICATION_CREDENTIALS).
//   2. cd ~/Projects/loyalty-shop
//      npm install firebase-admin       # if not already present
//      node audit-missed-redemptions.js                  # dry-run
//      node audit-missed-redemptions.js --apply          # actually deduct
//      node audit-missed-redemptions.js --phone=0856769308  # one customer
//
// Output CSV (./missed-redemptions.csv):
//   phone, name, current_points, lifetime_points,
//   actual_redeemed, implied_redeemed, missed, action

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const SERVICE_ACCOUNT = process.env.GOOGLE_APPLICATION_CREDENTIALS
  || path.join(__dirname, 'service-account.json');

try {
  admin.initializeApp({
    credential: admin.credential.cert(require(SERVICE_ACCOUNT)),
  });
} catch (e) {
  console.error('❌ Failed to load service account at', SERVICE_ACCOUNT);
  console.error('   Generate via: Firebase Console (krua-phuyai-pong) → Project Settings');
  console.error('   → Service accounts → Generate new private key');
  console.error('   Save as ' + path.join(__dirname, 'service-account.json'));
  process.exit(1);
}

const db = admin.firestore();

function arg(name) {
  const p = process.argv.find(a => a.startsWith(`--${name}=`));
  return p ? p.split('=').slice(1).join('=') : null;
}
const FLAG_APPLY = process.argv.includes('--apply');
const ONLY_PHONE = arg('phone');

function csvCell(v) {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

async function main() {
  console.error(FLAG_APPLY ? '🛠️  APPLY mode — will write fixes' : '🔍 DRY-RUN — no writes');
  console.error('   Loading customers + orders from krua-phuyai-pong...');

  // Pull all customers
  const custSnap = ONLY_PHONE
    ? { docs: [await db.collection('customers').doc(ONLY_PHONE).get()] }
    : await db.collection('customers').get();
  const customers = {};
  for (const d of custSnap.docs) {
    if (!d.exists) continue;
    customers[d.id] = d.data();
  }
  console.error(`   ${Object.keys(customers).length} customer(s)`);

  // Pull all orders ONCE — server-side filtering by customer_id field is
  // possible but with mixed customer_id vs customer_phone, easier to scan once.
  const orders = await db.collection('orders').get();
  console.error(`   ${orders.size} order(s)`);

  // Group orders by customer key (try customer_id, fall back to customer_phone)
  const ordersByCust = {};
  for (const od of orders.docs) {
    const o = od.data();
    const key = o.customer_id || o.customer_phone;
    if (!key) continue;
    (ordersByCust[key] ||= []).push({ id: od.id, ...o });
  }

  const rows = [];
  let totalMissed = 0, customersAffected = 0, applied = 0, failed = 0;

  for (const [phone, c] of Object.entries(customers)) {
    if (ONLY_PHONE && phone !== ONLY_PHONE) continue;
    const myOrders = ordersByCust[phone] || [];
    const reds = myOrders.flatMap(o => Array.isArray(o.redemptions) ? o.redemptions : []);
    const actual = reds.reduce((s, r) => s + (Number(r.points_used) || 0), 0);
    const points   = Number(c.points || 0);
    const lifetime = Number(c.lifetime_points || 0);
    const implied  = Math.max(0, lifetime - points);
    const missed   = actual - implied;

    // 🛡️ HOTFIX 2026-05-27 — also reconcile the per-type counters that the
    //   admin dashboard's "สรุปการแลกแต้ม" KPI reads. Legacy stale-snapshot
    //   writes left these undercounting; rebuild from source-of-truth orders.
    const actualDrink = reds.filter(r => r.type === 'drink').length;
    const actualDish  = reds.filter(r => r.type === 'discount').length;
    const curDrink    = Number(c.drink_redeemed_count || 0);
    const curDish     = Number(c.dish_redeemed_count || 0);
    const drinkGap    = actualDrink - curDrink;   // typically >= 0
    const dishGap     = actualDish  - curDish;

    if (actual === 0 && missed === 0 && drinkGap === 0 && dishGap === 0) continue;

    let action = 'OK';
    const updates = {};
    if (missed > 0) updates.points = admin.firestore.FieldValue.increment(-missed);
    // Use increment so this never decreases monotonic counters even if cloud
    // already moved ahead (e.g. a new redemption landed since we snapshotted).
    if (drinkGap > 0) updates.drink_redeemed_count = admin.firestore.FieldValue.increment(drinkGap);
    if (dishGap  > 0) updates.dish_redeemed_count  = admin.firestore.FieldValue.increment(dishGap);

    if (missed > 0 || drinkGap > 0 || dishGap > 0) {
      action = FLAG_APPLY ? 'APPLIED' : 'WOULD_FIX';
      if (missed > 0) {
        customersAffected++;
        totalMissed += missed;
      }
      if (FLAG_APPLY) {
        try {
          updates.points_manual_set_at = new Date().toISOString();
          const parts = [];
          if (missed > 0)    parts.push(`${missed}pt deduction`);
          if (drinkGap > 0)  parts.push(`+${drinkGap} drink_redeemed_count`);
          if (dishGap > 0)   parts.push(`+${dishGap} dish_redeemed_count`);
          updates.points_manual_set_reason = `backfill (${reds.length} redemption(s)): ` + parts.join(', ');
          await db.collection('customers').doc(phone).update(updates);
          applied++;
        } catch (e) {
          action = 'FAILED:' + (e.code || e.message || 'error');
          failed++;
        }
      }
    } else if (missed < 0) {
      action = 'OVERCHARGED';  // customer was deducted more than their orders show
    }

    rows.push({
      phone, name: c.name || '',
      current_points: points, lifetime_points: lifetime,
      actual_redeemed: actual, implied_redeemed: implied, missed,
      drink_actual: actualDrink, drink_current: curDrink, drink_gap: drinkGap,
      dish_actual:  actualDish,  dish_current:  curDish,  dish_gap:  dishGap,
      action,
      redemption_count: reds.length,
    });
  }

  // Sort by missed desc (biggest losses first)
  rows.sort((a, b) => (b.missed - a.missed) || (b.dish_gap + b.drink_gap - a.dish_gap - a.drink_gap));

  const header = ['phone','name','current_points','lifetime_points','actual_redeemed','implied_redeemed','missed','drink_actual','drink_current','drink_gap','dish_actual','dish_current','dish_gap','redemption_count','action'];
  const lines = [header.join(',')];
  for (const r of rows) lines.push(header.map(k => csvCell(r[k])).join(','));
  const outPath = path.join(__dirname, 'missed-redemptions.csv');
  fs.writeFileSync(outPath, lines.join('\n') + '\n');

  const counterFixCount = rows.filter(r => r.drink_gap > 0 || r.dish_gap > 0).length;
  console.log('\n=== Summary ===');
  console.log(`Customers with mismatches: ${rows.length}`);
  console.log(`Customers underpaid (points): ${customersAffected}   (shop lost ${totalMissed}pt)`);
  console.log(`Customers with stale redeem counters: ${counterFixCount}`);
  if (FLAG_APPLY) {
    console.log(`Applied: ${applied}   Failed: ${failed}`);
  } else {
    console.log(`\n(dry-run — re-run with --apply to actually fix)`);
  }
  console.log(`\nFull CSV: ${outPath}`);

  // Print top 20 to stdout
  if (rows.length) {
    console.log('\nTop offenders:');
    console.log('phone           | name                 | pts/lt   | redeemed | missed | drink Δ | dish Δ | action');
    console.log('----------------+----------------------+----------+----------+--------+---------+--------+--------');
    for (const r of rows.slice(0, 20)) {
      console.log(
        `${String(r.phone).padEnd(15)} | ${String(r.name).slice(0,20).padEnd(20)} | ${String(r.current_points).padStart(3)}/${String(r.lifetime_points).padStart(3)}  | ${String(r.actual_redeemed).padStart(8)} | ${String(r.missed).padStart(6)} | ${String(r.drink_gap).padStart(7)} | ${String(r.dish_gap).padStart(6)} | ${r.action}`
      );
    }
  }

  process.exit(0);
}

main().catch(e => { console.error('fatal', e); process.exit(1); });
