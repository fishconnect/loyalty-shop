# 🏪 Setup Guide — Deploy Loyalty Shop to a new restaurant

This guide takes you from "fresh GitHub fork + new Firebase project" to "live shop running on a custom domain" in ~30 minutes per new client.

---

## 0. Prerequisites (one-time, dev side)

- GitHub account
- Google account for the shop owner (or your own if hosting for them)
- A domain or subdomain you control (optional but recommended)

---

## 1. Fork + clone the repo (5 min)

```bash
# Fork on GitHub UI, then:
git clone https://github.com/<your-org>/loyalty-shop.git <shop-slug>
cd <shop-slug>
```

---

## 2. Create Firebase project (10 min)

1. Go to https://console.firebase.google.com → **Add project**
2. Name it `<shop-slug>` (e.g. `bunma-cafe`)
3. Disable Google Analytics (optional, not needed for this app)
4. After project is ready: **Build → Firestore Database → Create database**
   - Pick **production mode** (we'll paste rules in step 4)
   - Region: `asia-southeast1` (Singapore — closest to Thailand)
5. **Project Settings (⚙️) → General → Your apps → Add Web app**
   - Nickname: `<shop-slug>-web`
   - Skip Firebase Hosting (we use GitHub Pages)
   - Copy the `firebaseConfig` object

---

## 3. Update firebase.js with new project's config

Open [firebase.js](firebase.js) and replace the `firebaseConfig` object (around line 9) with the one you just copied.

**DO NOT** commit and push this until step 5 (rules are in place first).

---

## 4. Paste Firestore Security Rules

1. Open [firestore.rules](firestore.rules) in this repo
2. Copy the entire content
3. Firebase Console → **Firestore → Rules tab** → paste over the default content
4. Click **Publish**

Verify: try to read `customers` collection from an unauthenticated request — should fail.

---

## 5. Deploy to GitHub Pages (5 min)

```bash
git add firebase.js
git commit -m "Configure Firebase for <shop-name>"
git push origin main
```

In GitHub repo: **Settings → Pages**:
- Source: `Deploy from branch` → `main` → `/ (root)`
- Save

Optional: **Custom domain** → enter `shop.example.com` → save → DNS:
- CNAME `shop` → `<your-org>.github.io`

The site is live at `https://<your-org>.github.io/<shop-slug>/` (or your custom domain) within 1-2 minutes.

---

## 6. First-time admin setup on the live site (5 min)

1. Visit `<your-domain>` → app loads with default settings
2. Go to **Settings (⚙️) tab** → ⚠️ **change admin password from `1234`** to something strong (12+ chars, mix of letters/numbers)
3. Settings → upload **logo** + **payment QR code**
4. Settings → set shop **hours**, **address**, **LINE ID**
5. Settings → **disable features the shop doesn't need**:
   - 🏭 `factory` — turn off if no factory orders
   - 💳 `loyalty` — turn off if no points system
   - 🛵 `delivery` — turn off if pickup only

(Once a `settings/shop` doc exists with `features: {factory: false}`, the 🏭 tab is hidden across all devices.)

---

## 7. Optional but recommended hardening (15 min)

### a. Enable Firebase App Check
1. Firebase Console → **Build → App Check → Get Started**
2. Click **Register** on the web app → pick **reCAPTCHA v3**
3. If asked for a site key: click "I don't have one" — Firebase generates it
4. Copy the site key
5. In [firebase.js](firebase.js): replace `PASTE_RECAPTCHA_V3_SITE_KEY_HERE` with the key
6. Bump cache version, push

Result: API key abuse from other domains is blocked.

### b. Enable Sentry error monitoring
1. Sign up at https://sentry.io (free 5K events/month)
2. New project → **Browser JavaScript** → copy the DSN
3. In [sentry-init.js](sentry-init.js): replace `PASTE_SENTRY_DSN_HERE` with the DSN
4. Bump cache version, push

Result: every JS error on every device shows up in Sentry dashboard with stack trace.

### c. Upgrade to Blaze plan + enable daily backups
1. Firebase Console → **⚙️ Project Settings → Usage and billing → Modify plan → Blaze**
2. Set **Budgets & alerts → $5/month** (email when usage approaches)
3. Firestore → **Backups → Schedule daily backup** (~$0.18/month for a small shop)

---

## 8. Train the shop owner (15 min)

Walk through:
- Login with the new admin password
- Settings tab → all editing flows (menu price, image, deletion, loyalty config)
- Reports tab → daily/weekly/monthly views
- Kitchen tab → mark orders done
- 📦 **Export data button** in Settings — show how to download a backup JSON weekly to Google Drive

Give them:
- Admin password (in writing — paper, not email)
- The customer-facing URL (for QR code in shop)
- Your support contact

---

## Customization checklist

Common things each shop will want changed beyond config:

- [ ] Logo (Settings → upload)
- [ ] Payment QR (Settings → upload)
- [ ] Shop name (Settings → shop config — sets document title too)
- [ ] Hours (Settings)
- [ ] Menu items + prices + images (Menu manager)
- [ ] Loyalty thresholds (Settings → 🎁 Loyalty card)
- [ ] Promo banner (Settings → 📢 promo cards)
- [ ] Disabled features (factory / loyalty / delivery)
- [ ] Color theme — currently hardcoded; if a shop wants different brand colors, edit CSS variables at top of each `*.html` file

---

## Tech debt / known limitations

- **No Firebase Auth** — admin login is client-side password check. Anyone with API key can write to Firestore. App Check + tight rules mitigate but don't fully prevent. Add proper auth before scaling beyond ~5 shops.
- **Single tenant per Firebase project** — by design. Each shop gets their own Firebase project.
- **No automated tests** — manual test only. Run through customer order + kitchen flow before each release.
- **Cache busting via `?v=YYYYMMDDx` query string** — bump on every deploy. Browsers (especially iOS) hold aggressive cache; users may need hard refresh (Cmd+Shift+R).
