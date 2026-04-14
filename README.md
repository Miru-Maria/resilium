# Resilium

**Know your readiness. Build your resilience.**

Resilium is a full-stack personal resilience planning platform. Users complete a structured assessment across six life dimensions and receive an AI-generated resilience report: a 0–100 score, vulnerability breakdown, prioritised action plan, scenario stress-tests, and daily habits.

---

## Features

### Assessment
- **14-step assessment flow** — mental resilience deep-dive (10 Likert questions), then location, income stability, savings runway, dependents, skills, health, mobility, housing, emergency supplies, and risk concerns
- **Mental Resilience deep-dive** — 10 Likert-scale questions across stress tolerance, adaptability, learning agility, change management, emotional regulation, and social support
- Determines a **Growth pathway** (challenge-oriented) or **Compensation pathway** (emotionally-scaffolded) that shapes all AI-generated content
- Assess as an **individual or full household**; available in **English and Romanian**

### AI Report
- **Resilience Score 0–100** with sub-scores across 6 dimensions
- **Radar chart** visualisation of all six dimensions
- **Top vulnerabilities** with severity ratings (critical / high / medium / low)
- **Prioritised action plan** — short, mid, and long-term steps per area
- **Scenario stress-tests** (Pro) — simulate job loss, health crisis, natural disaster, or relocation; AI models impact delta and tailored recovery steps
- **Daily habits** personalised to weak areas and psychological pathway
- Powered by **gpt-5.4** (full report generation) and **gpt-4.1-mini** (AI Companion) via Replit AI Integrations

### AI Companion (Pro)
- Context-aware conversational guidance drawing directly from the user's scores
- Ask follow-up questions about any dimension, habit, or action plan item
- Powered by gpt-4.1-mini; session-scoped with no persistent message history

### Progress & Engagement
- **Interactive checklists** per resilience area with completion tracking
- **Score snapshots** — historical timeline to track improvement over time
- **Milestone markers** — Momentum Building → Strong Foundation → Well Prepared → Fully Resilient
- **Daily coaching tip cards** — rotating tips tied to the user's lowest-scoring dimension
- **Achievement badges** — milestone badges awarded for first assessment, plan saves, reassessments, and streak milestones
- **Streak tracking** — consecutive daily engagement tracked in `localStorage`
- **30-day resilience challenge** — curated 30-step action bank weighted toward weakest dimensions; dashboard progress ring

### Offline Capability (Pro)
- Last-viewed action plan cached to `localStorage` with a 7-day TTL
- Profile plan list also cached per user
- If the server is unreachable, Pro users see their last-viewed plan with a sky-blue "Pro Offline" banner

### Freemium & Payments
- **2 free assessments** for anonymous and free-tier users (paywall counter visible in assessment header)
- **Pro subscriptions** via Paddle — unlocks unlimited reports, scenario simulations, AI Companion, daily tips, challenge, offline cache
- Donation option on results page

### User Experience
- **Dark-only UI** — permanently dark interface, no light mode toggle
- **Brand palette** — background `#0D1225`, primary orange `#E08040`, warm text `#EAD9BE`
- **Clerk authentication** — sign in to save and revisit reports
- **Anonymous sessions** — assessment works without an account; data tied to a `sessionId`
- **Shareable score card** — share results via the Web Share API

### GDPR & Privacy
- Versioned consent capture before any data collection
- Data export on request (JSON download)
- Data deletion request flow
- Admin GDPR management panel with audit trail
- Consent log with paginated history

### Admin Dashboard
- Secure cookie-based admin auth (credentials from environment secrets)
- Overview analytics with Recharts visualisations — demographics, score distribution, risk concern breakdowns
- Full report history and feedback ratings aggregation
- **Analytics** — KPI cards (total users, conversion rate, Pro count, assessments), 12-month signup/assessment trends, dimension score bar chart, plan distribution, free→Pro funnel
- **Mobile analytics** — daily trends, score distribution, top locations
- **GDPR request management** — mark fulfilled, trigger deletion, download exports
- **AI UX testing** — 8 pre-built personas run through the full pipeline; a separate AI evaluator rates each report for quality, relevance, and empathy; live SSE progress stream; exportable Markdown/PDF report
- **Users management**, **Announcements**, **Testimonials**, **Marketing**, **Security**, **Monitoring**, **Documents** admin sub-pages

### Mobile App
- Expo React Native with Expo Router (file-based routing)
- **iOS and web** (no Android builds)
- Push notification reminders — requests permission, schedules a 30-day local check-in, registers push token for server-sent pushes
- Haptic feedback and animated transitions throughout

### Demo
- `/demo` — static fictional sample report for "Alex M." showing the full results UI, Pro teasers, and scenario section (linked from landing navigation)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Web frontend | React 19, Vite 7, TypeScript, Tailwind CSS v4, shadcn/ui, Wouter, Framer Motion, Recharts |
| Mobile app | Expo (React Native), Expo Router, expo-notifications, expo-haptics — iOS + web |
| API server | Node.js 24, Express 5, TypeScript, esbuild |
| Database | PostgreSQL 16, Drizzle ORM |
| AI | OpenAI gpt-5.4 (reports) / gpt-4.1-mini (AI Companion) via Replit AI Integrations |
| Auth | Clerk (JWT-based; web + mobile) |
| Payments | Paddle (subscriptions + donations, HMAC-verified webhooks) |
| Error monitoring | Sentry (web, mobile, API) |
| Email | Resend (welcome email, weekly digest) |
| Monorepo | pnpm workspaces, TypeScript 5.9 |

---

## Project Structure

```
resilium/
├── artifacts/
│   ├── resilium/            # React + Vite web app
│   ├── resilium-mobile/     # Expo React Native mobile app (iOS + web)
│   ├── api-server/          # Express API server
│   └── mockup-sandbox/      # Component preview server (design tooling)
├── lib/
│   └── db/                  # Drizzle ORM schema + migrations
└── attached_assets/         # Brand assets (logo, marketing banner)
```

---

## Resilience Dimensions

| Dimension | Weight | Key inputs |
|---|---|---|
| Financial | 25% | Income stability, savings runway, dependents |
| Skills | 20% | Digital, physical, survival, medical, financial, language skills |
| Health | 15% | Self-reported health status, medical skills |
| Mobility | 15% | Mobility level, housing type, dependents |
| Psychological | 15% | Average of 10 mental resilience sub-question scores |
| Resources | 10% | Emergency supplies, survival and financial skills |

---

## Pages & Routes

### Web App

| Route | Description |
|---|---|
| `/` | Landing page — hero, value proposition, sign-in |
| `/about` | About Resilium |
| `/demo` | Live demo — fictional sample report for "Alex M." |
| `/pricing` | Pro plan pricing |
| `/consent` | GDPR consent before assessment |
| `/assess` | 14-step resilience assessment |
| `/results/:reportId` | Full AI report, radar chart, checklists, feedback |
| `/plan/:reportId` | Saved action plan view (Pro offline-capable) |
| `/scenarios/:reportId` | Scenario stress-test runner (Pro) |
| `/coaching` | Phoenix Insight Coaching referral page |
| `/profile` | Saved reports (requires auth) |
| `/privacy` | Privacy Policy |
| `/terms` | Terms & Conditions |
| `/refund` | Refund Policy |
| `/sign-in` | Clerk sign-in |
| `/sign-up` | Clerk sign-up |
| `/admin/login` | Admin login |
| `/admin/dashboard` | Analytics overview (6 tabs) |
| `/admin/analytics` | User analytics — KPIs, trends, funnel |
| `/admin/users` | User management |
| `/admin/announcements` | Site-wide announcement management |
| `/admin/testimonials` | Testimonials management |
| `/admin/marketing` | Marketing tools |
| `/admin/documents` | Document management |
| `/admin/security` | Security settings |
| `/admin/monitoring` | System monitoring |
| `/admin/ux-testing` | AI persona UX testing |
| `/admin/mobile` | Mobile analytics |
| `/admin/gdpr` | GDPR request management |
| `/admin/consent-log` | Consent audit trail |

### Mobile Screens

| Screen | Description |
|---|---|
| Home | Hero, feature highlights, "Get Started" CTA |
| Consent | GDPR disclosure |
| Assessment | 14-step native form with haptics |
| Loading | Animated AI generation progress |
| Results | Score rings, action plan, share button |
| My Data | View, export, or delete personal data |

---

## API Endpoints

### Core

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/resilience/assess` | Run scoring and generate AI report |
| `GET` | `/api/resilience/reports/:reportId` | Fetch a report |
| `GET` | `/api/resilience/reports/:reportId/checklists` | Get checklist items |
| `PATCH` | `/api/resilience/reports/:reportId/checklists/:area/:itemId` | Toggle checklist item |
| `GET` | `/api/resilience/reports/:reportId/snapshots` | Historical score snapshots |

### Auth (Clerk)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/auth/user` | Current authenticated user (validated via Clerk JWT) |
| `POST` | `/api/auth/mobile-token` | Exchange Clerk session token for mobile session |

### GDPR

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/gdpr/consent` | Log versioned consent |
| `GET` | `/api/gdpr/export/:sessionId` | Export all data for a session |
| `POST` | `/api/gdpr/data-request` | Submit deletion or export request |

### Subscriptions & Payments

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/users/me/subscription` | Returns `{isPro, status, currentPeriodEnd}` |
| `POST` | `/api/webhooks/paddle` | Paddle webhook handler |

### User

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/users/me/plans` | List saved reports |
| `GET` | `/api/users/me/report-count` | Count of saved reports |
| `GET` | `/api/users/me/export` | Full data export (JSON) |
| `DELETE` | `/api/users/me` | Delete account (GDPR) |

### Admin

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/admin/login` | Admin login |
| `GET` | `/api/admin/analytics` | Full platform analytics |
| `GET` | `/api/admin/analytics/users` | User KPIs, 12-month trends, dimension averages, funnel |
| `GET` | `/api/admin/analytics/mobile` | Mobile metrics |
| `GET` | `/api/admin/gdpr/requests` | GDPR requests list |
| `GET` | `/api/admin/consent-log` | Paginated consent audit log |

### Push Notifications

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/push-tokens` | Register an Expo push token |

---

## Getting Started

### Prerequisites

- Node.js 24+
- pnpm 9+
- PostgreSQL database

### Install

```bash
pnpm install
```

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Secret for signing web sessions |
| `CLERK_SECRET_KEY` | Clerk secret key (server-side) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (frontend) |
| `ADMIN_USERNAME` | Admin dashboard login username |
| `ADMIN_PASSWORD` | Admin dashboard login password |
| `PADDLE_WEBHOOK_SECRET` | Paddle webhook verification secret |
| `RESEND_API_KEY` | Resend API key for email delivery |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | Auto-provisioned by Replit AI Integrations |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | Auto-provisioned by Replit AI Integrations |

### Push database schema

```bash
cd lib/db && pnpm run push-force
```

### Start all services

```bash
# API server
pnpm --filter @workspace/api-server run dev

# Web app
pnpm --filter @workspace/resilium run dev

# Mobile app
pnpm --filter @workspace/resilium-mobile run dev
```

---

## License

MIT
