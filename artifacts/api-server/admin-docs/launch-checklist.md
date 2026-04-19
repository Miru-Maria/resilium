# Resilium — Go-to-Market Launch Checklist
**Last updated:** April 19, 2026
**Maintained by:** Cristiana Paun (Solo Founder)
**Domain:** resilium-platform.com

Status key: ✅ Done · 🔄 In progress · ❌ Not started · ⚠️ Needs attention

---

## 1. Platform & Infrastructure

| Item | Status | Notes |
|---|---|---|
| Production deployment on resilium-platform.com | ✅ | Live on Replit deployment |
| Custom domain configured + HTTPS | ✅ | TLS managed by Replit |
| Express API server (pino logging, graceful error handling) | ✅ | |
| PostgreSQL database with connection pool | ✅ | idleTimeout 30s, max 10 connections |
| Sentry error monitoring (production) | ✅ | DSN configured; Express request handler active |
| PWA service worker — correct SPA fallback | ✅ | Fixed navigateFallback → index.html |
| Content Security Policy (CSP) header | ✅ | Covers Clerk, Sentry, Google Fonts |
| Rate limiting on assessments | ✅ | 5/hour per user universally |
| Admin panel with password protection | ✅ | /admin route |
| Cron jobs scheduled | ✅ | Admin digest Mon 07:00, User digest Sun 18:00, 7d/30d reminders, site audit |

---

## 2. Authentication

| Item | Status | Notes |
|---|---|---|
| Clerk production keys configured | ✅ | CLERK_SECRET_KEY + VITE_CLERK_PUBLISHABLE_KEY |
| Sign-up / sign-in / profile UI | ✅ | |
| Protected routes (middleware) | ✅ | clerkMiddleware on all API routes |
| @clerk/shared critical vulnerability patched | ✅ | Updated to latest (route protection bypass — GHSA — fixed April 2026) |
| Social OAuth (Google, GitHub) | ❌ | Optional but increases conversion; enable in Clerk Dashboard |
| Email verification enforced | ✅ | Handled by Clerk |

---

## 3. Payments & Billing

| Item | Status | Notes |
|---|---|---|
| Stripe live mode enabled | ✅ | Live keys configured |
| Monthly plan ($9/mo) | ✅ | price_... configured in Stripe |
| Annual plan ($79/yr) | ✅ | price_... configured in Stripe |
| Stripe Checkout (hosted) | ✅ | |
| Webhook: checkout.session.completed | ✅ | Provisions Pro tier |
| Webhook: customer.subscription.created/updated/deleted | ✅ | Tier sync |
| Webhook: invoice.payment_failed | ✅ | Sends payment failure email |
| Webhook: invoice.payment_succeeded | ✅ | Sends renewal confirmation email (skips first) |
| Manage Subscription button (customer portal) | ✅ | Profile → Billing |
| EU SCA / 3DS compliance | ✅ | Enabled in Stripe Dashboard |
| Stripe Dashboard: renewal emails ON | ✅ | Configured in Stripe notifications |
| Stripe Dashboard: expiring card emails ON | ✅ | Configured in Stripe notifications |
| First real renewal webhook — verify it fired | ❌ | Check Stripe Webhook Dashboard after first renewal |
| Stripe webhook delivery dashboard monitoring | ❌ | Bookmark: dashboard.stripe.com → Developers → Webhooks |
| VAT / tax collection (Romania SRL) | ⚠️ | Stripe Tax not yet configured; needed once SRL is registered. EU VAT rules apply. |

---

## 4. Email (Resend)

| Item | Status | Notes |
|---|---|---|
| Welcome email (on sign-up) | ✅ | Triggered via Clerk webhook |
| Payment succeeded / Pro upgrade email | ✅ | |
| Payment failed email | ✅ | Custom handler; Stripe platform failed-payment emails turned OFF |
| Subscription renewal confirmation | ✅ | invoice.payment_succeeded, skips first payment |
| Weekly user digest cron | ✅ | Sunday 18:00 UTC |
| 7-day inactivity reminder | ✅ | Daily 09:00 UTC |
| 30-day inactivity reminder | ✅ | Monday 08:00 UTC |
| Resend domain verified (resilium-platform.com) | ⚠️ | Verify SPF/DKIM records in Resend dashboard |
| Unsubscribe header on all emails | ✅ | List-Unsubscribe header + footer link |
| 5-email post-assessment drip sequence | ❌ | Day 0, 2, 5, 9, 14 — drives free → Pro conversion. High priority. |
| 6-month "resilience journey" email (Pro) | ❌ | Low priority; plan for Month 3 post-launch |

---

## 5. Security

| Item | Status | Notes |
|---|---|---|
| HTTPS everywhere | ✅ | Enforced by Replit deployment |
| @clerk/shared — route protection bypass (CRITICAL) | ✅ | Updated April 19, 2026 |
| drizzle-orm — SQL injection via identifiers (HIGH) | ✅ | Updated to 0.45.2 April 19, 2026 |
| vite — arbitrary file read via dev server (HIGH) | ✅ | Updated to 7.3.2 April 19, 2026 |
| path-to-regexp — ReDoS (HIGH) | ⚠️ | Transitive dep via Express; fix available in 8.4.0. Run: `pnpm --filter @workspace/api-server update path-to-regexp` |
| node-forge — RSA/Ed25519 forgery + DoS (HIGH, x4) | ⚠️ | Transitive dep (likely via Clerk SDK); fix available in 1.4.0. Monitor Clerk update. |
| serialize-javascript — RCE (HIGH) | ⚠️ | Transitive build-tool dep; fix requires major bump (v7). Dev-only risk — not in production bundle. |
| lodash — code injection via _.template (HIGH) | ⚠️ | Check if _.template is used anywhere. If not, risk is theoretical. Fix in 4.18.0. |
| CSP header | ✅ | Meta tag in index.html |
| Rate limiting (assessments, auth routes) | ✅ | express-rate-limit |
| Input validation (Zod on all API routes) | ✅ | |
| Dependency audit — run monthly | ❌ | Schedule: first Monday of each month |
| Penetration test / security audit | ❌ | Recommend before $10K MRR milestone |

---

## 6. Legal & Compliance ⚠️ (Highest Priority Gap)

| Item | Status | Notes |
|---|---|---|
| Privacy Policy page | ❌ | **Required by GDPR (EU users) and Clerk's ToS.** Must be live before public launch. |
| Terms of Service page | ❌ | **Required before charging users.** |
| Cookie consent banner | ❌ | **Required by GDPR/ePrivacy for EU users.** Even session cookies technically require notice. Minimal implementation: a simple dismissible banner with a link to Privacy Policy. |
| GDPR data deletion / export flow | ❌ | Required if you have EU users. At minimum: email gdpr@resilium-platform.com handled manually until volume warrants automation. |
| Romania SRL registration | 🔄 | Pending. Needed before Stripe Tax / VAT collection. |
| Stripe Tax (VAT) | ❌ | Enable once SRL registered. Required for selling to EU consumers. |

---

## 7. SEO & Discoverability

| Item | Status | Notes |
|---|---|---|
| robots.txt | ❌ | Create at /public/robots.txt — allow all, point to sitemap |
| sitemap.xml | ❌ | Generate and submit to Google Search Console |
| OpenGraph / Twitter meta tags | ❌ | og:title, og:description, og:image for link previews on social |
| Google Search Console verified | ❌ | Add DNS TXT record via domain registrar |
| Favicon + Apple touch icon | ⚠️ | Verify correct icons in /public; PWA manifest should reference them |
| Page titles / meta descriptions on all routes | ⚠️ | Audit: landing, dashboard, assessment, pricing, profile |

---

## 8. Analytics

| Item | Status | Notes |
|---|---|---|
| Web analytics (Plausible / PostHog / GA4) | ❌ | Needed to track funnel from visitor → assessment → Pro. Plausible recommended (GDPR-friendly, no cookie consent required for analytics). |
| Conversion event tracking (assessment completed, upgrade clicked, Pro converted) | ❌ | Depends on analytics tool above |
| Stripe Revenue dashboard | ✅ | Native in Stripe Dashboard |
| Sentry performance monitoring | ✅ | Configured |

---

## 9. Mobile (iOS — Target: Q3 2026)

| Item | Status | Notes |
|---|---|---|
| Expo mobile app built | ✅ | Running in workspace |
| iOS App Store account (Apple Developer Program) | ❌ | $99/yr — enroll at developer.apple.com |
| App Store submission (first build) | ❌ | Q3 2026 per marketing plan |
| ASO: screenshots, description, keywords | ❌ | "Know your score in 8 minutes" hook |
| Review prompt at score reveal moment | ❌ | High-emotion trigger = best review conversion |
| Android (Google Play) | ❌ | Not in scope for initial launch |

---

## 10. Pre-Launch Marketing Checklist

| Item | Status | Notes |
|---|---|---|
| Landing page live | ✅ | resilium-platform.com |
| Pricing page | ✅ | |
| Product Hunt launch planned | ❌ | Schedule: choose a Tuesday–Thursday. Prep hunter, assets, and maker note. |
| First 3 SEO articles written | ❌ | Priority: "personal resilience plan", "emergency preparedness checklist", "resilience score assessment" |
| Reddit seeding post drafted | ❌ | r/personalfinance + r/preppers — data-driven hook from real assessment results |
| Email list pre-launch waitlist | ❌ | Optional but useful if you delay public access briefly |
| Twitter/X + LinkedIn presence | ❌ | Founder-led content; start 4 weeks before launch |
| Google Alerts activated | ✅ | See competitor-monitoring.md |

---

## 11. Post-Launch Monitoring (First 30 Days)

| Item | Status | Notes |
|---|---|---|
| Sentry — review weekly for new error patterns | ❌ | Ongoing |
| Stripe Webhook Dashboard — verify no failed deliveries | ❌ | Especially after first renewal cycle |
| Clerk Dashboard — review new signups weekly | ❌ | Check for bot/spam patterns |
| Check first Pro renewal webhook fired correctly | ❌ | Critical — verify invoice.payment_succeeded was received |
| Monitor assessment completion rate | ❌ | Target: >50% of starts complete |
| Monitor free → Pro conversion rate | ❌ | Target: >5% at 90 days |
| Review pino logs for unexpected 4xx/5xx patterns | ❌ | Weekly |

---

## Summary: Priority Order Before Public Soft Launch

1. **Privacy Policy + Terms of Service** — must exist before you charge anyone
2. **Cookie consent banner** — GDPR requirement for EU visitors
3. **5-email drip sequence** — highest direct impact on revenue
4. **OpenGraph meta tags** — every share link looks bare without this
5. **robots.txt + sitemap** — takes 30 minutes; pays off for months
6. **Web analytics** — you can't optimize what you can't measure
7. **path-to-regexp + lodash security updates** — transitive dep cleanup

---

*Resilium — Know your readiness. Own your future.*
