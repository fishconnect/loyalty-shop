// 🛡️ clamp-negative-points (loyalty-shop / krua-phuyai-pong)
//
//   Reconcile any customers whose `points` ended up negative after the
//   2026-05-27 backfill chain:
//     1) audit-missed-redemptions deducted the points the system had
//        failed to deduct under the old silent-fail bug.
//     2) repolicy-past-orders then deducted the over-credited points
//        from past redemption orders under the policy change.
//   Both were individually correct, but their sum could push a customer
//   below zero (a customer who already had a low balance + many past
//   redemptions).
//
//   In an ideal accounting world we'd carry the negative as `points_owed`
//   (a liability the customer pays off on the next earn). In reality
//   customers don't expect to see -2 in the app, and the shop has already
//   delivered the goods — so we clamp points to 0 and absorb the gap as
//   shop write-off. Audit trail is preserved on the customer doc.
//
//   `lifetime_points` is left as-is (it's a historical sum, not a current
//   balance — never directly user-visible).
//
// Usage:
//   node clamp-negative-points.js              # dry-run
//   node clamp-negative-points.js --apply

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const SERVICE_ACCOUNT = process.env.GOOGLE_APPLICATION_CREDENTIALS
  || path.join(__dirname, 'service-account.json');
try {
  admin.initializeApp({ credential: admin.credential.cert(require(SERVICE_ACCOUNT)) });
} catch (e) {
  console.error('❌ Failed to load service account at', SERVICE_ACCOUNT);
  process.exit(1);
}

const db = admin.firestore();
const FLAG_APPLY = process.argv.includes('--apply');

async function main() {
  console.error(FLAG_APPLY ? '🛠️  APPLY — will clamp negative points to 0' : '🔍 DRY-RUN');

  const snap = await db.collection('customers').get();
  const negs = [];
  for (const d of snap.docs) {
    const c = d.data();
    const p = Number(c.points || 0);
    if (p < 0) negs.push({ id: d.id, name: c.name || '', points: p, lifetime: c.lifetime_points || 0, ref: d.ref });
  }

  console.error(`   ${snap.size} customer(s) scanned, ${negs.length} below zero`);

  let applied = 0, totalAbsorbed = 0, failed = 0;
  for (const n of negs) {
    totalAbsorbed += Math.abs(n.points);
    if (!FLAG_APPLY) continue;
    try {
      await n.ref.update({
        // Use increment(+|points|) so the result is exactly 0 even if a
        // concurrent earn just landed between scan and write.
        points: admin.firestore.FieldValue.increment(Math.abs(n.points)),
        points_writeoff_at: new Date().toISOString(),
        points_writeoff_amount: Math.abs(n.points),
        points_writeoff_reason: 'clamp-to-zero after audit+repolicy chain (shop absorbs)',
      });
      applied++;
    } catch (e) {
      failed++;
      console.error(`   ${n.id} failed:`, e.message);
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Customers below zero: ${negs.length}`);
  console.log(`Points absorbed by shop: ${totalAbsorbed}`);
  if (FLAG_APPLY) console.log(`Applied: ${applied}   Failed: ${failed}`);
  if (negs.length) {
    console.log('\nphone           | name                 | was   | absorbed');
    console.log('----------------+----------------------+-------+----------');
    for (const n of negs.sort((a,b) => a.points - b.points)) {
      console.log(`${String(n.id).padEnd(15)} | ${String(n.name).slice(0,20).padEnd(20)} | ${String(n.points).padStart(5)} | ${String(Math.abs(n.points)).padStart(8)}`);
    }
  }
  if (!FLAG_APPLY) console.log('\n(dry-run — re-run with --apply to actually write)');
  process.exit(0);
}

main().catch(e => { console.error('fatal', e); process.exit(1); });
