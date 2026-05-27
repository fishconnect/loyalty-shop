// 🛡️ repolicy-past-orders (loyalty-shop / krua-phuyai-pong)
//
//   Retroactively applies the 2026-05-27 earning-policy change to past
//   orders that used redemptions:
//
//     OLD policy: points_awarded = floor(original_total / 50)  (pre-discount)
//     NEW policy: points_awarded = floor(total / 50)           (post-discount)
//
//   For each past `done`/`delivered` order with redemptions[]:
//     excess = old_pts - new_pts          (typically 0 or 1, sometimes 2)
//     if excess > 0:
//       (a) on the ORDER doc: stamp new value, preserve old as
//           `points_awarded_legacy`, add `points_repolicy_at` timestamp.
//       (b) on the CUSTOMER doc: deduct `excess` from both `points` AND
//           `lifetime_points` atomically.
//
//   Why both? customer.lifetime_points is the running sum of points ever
//   credited; it was inflated by the same excess. Leaving lifetime as-is
//   would break the admin dashboard's drift check (sum(order.points_awarded)
//   ≠ customer.lifetime_points → permanent yellow "drift" alert).
//
//   Why update order docs too? The admin "🔄 คำนวณแต้มใหม่" button now
//   TRUSTS `o.points_awarded` if it exists (see index.html post-fix). If we
//   only touched customer balances without updating orders, the next press
//   of that button would silently ADD the deducted points back.
//
//   Safety:
//     - DRY-RUN by default. Prints what would happen and writes CSV.
//     - `--apply` actually writes. Idempotent: re-runs skip orders that
//       already have `points_awarded_legacy` set.
//     - `--phone=<n>` limits to one customer for spot-testing.
//     - No customer ever ends up with negative `points` (clamped at 0).
//
// Usage:
//   cd ~/Projects/loyalty-shop
//   node repolicy-past-orders.js               # dry-run
//   node repolicy-past-orders.js --phone=0856769308 --apply
//   node repolicy-past-orders.js --apply       # apply for all customers
//
// Output CSV (./repolicy-past-orders.csv):
//   phone, name, orders_touched, total_excess, action

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
  process.exit(1);
}

const db = admin.firestore();
const POINTS_PER_BAHT = 1 / 50;

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

function calcPts(amount) { return Math.floor(Number(amount || 0) * POINTS_PER_BAHT); }

async function main() {
  console.error(FLAG_APPLY ? '🛠️  APPLY — will rewrite past orders + customer balances'
                            : '🔍 DRY-RUN — no writes');
  if (ONLY_PHONE) console.error(`   Limiting to phone ${ONLY_PHONE}`);

  const orders = await db.collection('orders').get();
  console.error(`   ${orders.size} order(s) total`);

  // For each order with redemption[] AND in done/delivered status, compute
  // the policy delta. Group by customer for atomic per-customer deduction.
  const perCustomer = {};  // key: phone, value: { name, orders: [{id, oldPts, newPts, excess, ref}], totalExcess }
  let scanned = 0, eligible = 0, skipped_already_repoliced = 0;

  for (const od of orders.docs) {
    scanned++;
    const o = od.data();
    if (!['done', 'delivered'].includes(o.status)) continue;
    if (o.source === 'factory') continue;
    const reds = Array.isArray(o.redemptions) ? o.redemptions : [];
    if (reds.length === 0) continue;
    if (typeof o.points_awarded_legacy === 'number') {
      // Already repoliced in a previous run — skip.
      skipped_already_repoliced++;
      continue;
    }

    const orig = Number(o.original_total || o.total || 0);
    const paid = Number(o.total || 0);
    if (orig <= 0 || paid <= 0) continue;

    const oldPts = (typeof o.points_awarded === 'number') ? o.points_awarded : calcPts(orig);
    const newPts = calcPts(paid);
    const excess = oldPts - newPts;
    if (excess <= 0) continue;
    eligible++;

    const key = o.customer_id || o.customer_phone;
    if (!key) continue;
    const c = perCustomer[key] ||= { name: o.customer_name || '', orders: [], totalExcess: 0 };
    c.orders.push({ id: od.id, oldPts, newPts, excess, original_total: orig, total: paid, ref: od.ref });
    c.totalExcess += excess;
  }

  // Optionally filter to one customer
  const phonesToProcess = ONLY_PHONE
    ? (perCustomer[ONLY_PHONE] ? [ONLY_PHONE] : [])
    : Object.keys(perCustomer);

  const rows = [];
  let totalDeducted = 0, customersTouched = 0, ordersUpdated = 0;
  let failed = 0;

  for (const phone of phonesToProcess) {
    const c = perCustomer[phone];
    if (!c) continue;

    let action = FLAG_APPLY ? 'APPLYING…' : 'WOULD_APPLY';
    if (FLAG_APPLY) {
      // 1) Update each order doc atomically.
      try {
        for (const o of c.orders) {
          await o.ref.update({
            points_awarded: o.newPts,
            points_awarded_legacy: o.oldPts,
            points_repolicy_at: new Date().toISOString(),
            points_repolicy_reason: 'switched earn policy from pre-discount to post-discount paid amount',
          });
          ordersUpdated++;
        }
        // 2) Deduct the total excess from customer atomically.
        //    Use increment so concurrent writes (e.g. a new order awarding
        //    points right now) compose cleanly.
        await db.collection('customers').doc(phone).update({
          points:          admin.firestore.FieldValue.increment(-c.totalExcess),
          lifetime_points: admin.firestore.FieldValue.increment(-c.totalExcess),
          points_manual_set_at: new Date().toISOString(),
          points_manual_set_reason:
            `repolicy: deducted ${c.totalExcess}pt from ${c.orders.length} past redemption order(s) ` +
            `(earn policy switched pre→post-discount)`,
        });
        action = 'APPLIED';
        customersTouched++;
        totalDeducted += c.totalExcess;
      } catch (e) {
        action = 'FAILED:' + (e.code || e.message || 'error');
        failed++;
      }
    } else {
      customersTouched++;
      totalDeducted += c.totalExcess;
      ordersUpdated += c.orders.length;
    }

    rows.push({
      phone, name: c.name,
      orders_touched: c.orders.length,
      total_excess: c.totalExcess,
      details: c.orders.map(o => `${o.id}(${o.oldPts}→${o.newPts})`).join(' '),
      action,
    });
  }

  rows.sort((a, b) => b.total_excess - a.total_excess);

  const header = ['phone','name','orders_touched','total_excess','action','details'];
  const lines = [header.join(',')];
  for (const r of rows) lines.push(header.map(k => csvCell(r[k])).join(','));
  const outPath = path.join(__dirname, 'repolicy-past-orders.csv');
  fs.writeFileSync(outPath, lines.join('\n') + '\n');

  console.log('\n=== Summary ===');
  console.log(`Scanned orders:             ${scanned}`);
  console.log(`Skipped (already repoliced): ${skipped_already_repoliced}`);
  console.log(`Eligible redemption orders: ${eligible}`);
  console.log(`Customers affected:         ${customersTouched}`);
  console.log(`Orders ${FLAG_APPLY?'updated':'to update'}:        ${ordersUpdated}`);
  console.log(`Total points ${FLAG_APPLY?'deducted':'to deduct'}: ${totalDeducted}`);
  if (FLAG_APPLY) console.log(`Failures:                   ${failed}`);
  console.log(`\nCSV: ${outPath}`);

  if (rows.length) {
    console.log('\nTop customers:');
    console.log('phone           | name                 | orders | excess | action');
    console.log('----------------+----------------------+--------+--------+----------');
    for (const r of rows.slice(0, 25)) {
      console.log(
        `${String(r.phone).padEnd(15)} | ${String(r.name).slice(0,20).padEnd(20)} | ${String(r.orders_touched).padStart(6)} | ${String(r.total_excess).padStart(6)} | ${r.action}`
      );
    }
  }

  if (!FLAG_APPLY) {
    console.log('\n(dry-run — re-run with --apply to actually write)');
  }

  process.exit(0);
}

main().catch(e => { console.error('fatal', e); process.exit(1); });
