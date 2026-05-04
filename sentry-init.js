// 🐛 Sentry error monitoring — catches JS errors on all client devices
//
// HOW TO ENABLE (one-time, ~5 min):
//   1. Sign up at https://sentry.io (free 5K events/month)
//   2. Create a new project → pick "Browser JavaScript"
//   3. Copy the DSN string (looks like https://abc...@o123.ingest.sentry.io/456)
//   4. Replace SENTRY_DSN below
//   5. Bump cache version + push
//
// Once enabled, every uncaught error/exception across all devices (admin,
// kitchen, customer, factory mode) shows up in Sentry dashboard with stack
// trace + browser info. Set up email alerts so you know within minutes if
// something breaks in production.
//
// Until DSN is set, this file is a no-op (zero overhead).

(function () {
  const SENTRY_DSN = "PASTE_SENTRY_DSN_HERE";
  if (!SENTRY_DSN || SENTRY_DSN === "PASTE_SENTRY_DSN_HERE") return;

  // Lazy-load Sentry SDK from CDN — only when DSN is configured
  const script = document.createElement('script');
  script.src = 'https://browser.sentry-cdn.com/8.30.0/bundle.min.js';
  script.crossOrigin = 'anonymous';
  script.onload = function () {
    if (!window.Sentry) return;
    try {
      window.Sentry.init({
        dsn: SENTRY_DSN,
        // Tag events with the page so we can filter by surface area
        initialScope: {
          tags: {
            page: location.pathname.replace(/^\//, '').replace('.html', '') || 'index',
          },
        },
        // 10% of transactions for performance monitoring (free tier friendly)
        tracesSampleRate: 0.1,
        // Mask user input in replays (PDPA — don't capture phone/name)
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 0,
      });
      console.log('[sentry] enabled');
    } catch (e) { console.warn('[sentry] init failed', e); }
  };
  script.onerror = function () { console.warn('[sentry] CDN load failed'); };
  document.head.appendChild(script);
})();
