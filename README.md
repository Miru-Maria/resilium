# Resilium

**Know your readiness. Build your resilience.**

Resilium is a full-stack personal resilience planning platform. Users complete a structured 10-step assessment across six life dimensions and receive an AI-generated resilience report: a 0–100 score, vulnerability breakdown, prioritised action plan, scenario stress-tests, and daily habits.

---

## Features

### Assessment
- **10-step assessment flow** — location, income stability, savings runway, dependents, skills, health, mobility, housing, emergency supplies, and risk concerns
- **Mental Resilience deep-dive** — 10 Likert-scale questions across stress tolerance, adaptability, social support, purpose clarity, emotional recovery, resourcefulness, proactive preparation, boundary-setting, crisis leadership, and long-term thinking
- Determines a **Growth pathway** (challenge-oriented) or **Compensation pathway** (emotionally-scaffolded) that shapes all AI-generated content

### AI Report
- **Resilience Score 0–100** with sub-scores across 6 dimensions
- **Radar chart** visualisation of all six dimensions
- **Top vulnerabilities** with severity ratings (critical / high / medium / low)
- **Prioritised action plan** — short, mid, and long-term steps per area
- **Scenario stress-tests** (Pro) — simulate job loss, health crisis, natural disaster, or relocation; AI models impact delta and tailored recovery steps
- **Daily habits** personalised to weak areas and psychological pathway

### Progress Tracking
- **Interactive checklists** per resilience area with completion tracking
- **Score snapshots** — historical timeline to track improvement over time
- **Milestone markers** — Momentum Building → Strong Foundation → Well Prepared → Fully Resilient

### Freemium & Payments
- 2 free assessments for anonymous and free-tier users (paywall counter visible in assessment header)
- **Pro subscriptions** via Paddle — unlocks unlimited reports and scenario simulations
- Donation option on results page

### User Experience
- **Dark-only UI** — permanently dark interface, no light mode toggle
- **Brand palette** — background `#0D1225`, primary orange `#E08040`, warm text `#EAD9BE`
- **Replit Auth (OIDC/PKCE)** — sign in to save and revisit reports
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
- **Mobile analytics** — daily trends, score distribution, top locations
- **GDPR request management** — mark fulfilled, trigger deletion, download exports
- **AI UX testing** — 8 pre-built personas run through the full pipeline; a separate AI evaluator rates each report for quality, relevance, and empathy; live SSE progress stream; exportable Markdown/PDF report

### Mobile App
- Expo React Native with Expo Router (file-based routing)
- Push notification reminders — requests permission, schedules a 30-day local check-in, registers push token for server-sent pushes
- Haptic feedback and animated transitions throughout

### Demo
- `/demo` — static fictional sample report for "Alex M." showing the full results UI, Pro teasers, and scenario section (linked from landing navigation)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Web frontend | React 19, Vite, TypeScript, Tailwind CSS v4, shadcn/ui, Wouter, Framer Motion, Recharts |
| Mobile app | Expo (React Native), Expo Router, expo-notifications, expo-haptics |
| API server | Node.js 24, Express 5, TypeScript, esbuild |
| Database | PostgreSQL, Drizzle ORM |
| AI | OpenAI gpt-5.2 via Replit AI Integrations (no user API key required) |
| Auth | Replit Auth (OpenID Connect / PKCE) |
| Payments | Paddle (subscriptions + donations) |
| Monorepo | pnpm workspaces, TypeScript 5.9 |

---

## Project Structure

```
resilium/
├── artifacts/
│   ├── resilium/            # React + Vite web app
│   ├── resilium-mobile/     # Expo React Native mobile app
│   ├── api-server/          # Express API server (port 8080)
│   └── mockup-sandbox/      # Component preview server (design tooling)
├── lib/
│   ├── db/                  # Drizzle ORM schema + migrations
│   └── replit-auth-web/     # Shared Replit Auth hook for web
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
| `/assess` | 10-step resilience assessment |
| `/results/:reportId` | Full AI report, radar chart, checklists, feedback |
| `/scenarios/:reportId` | Scenario stress-test runner (Pro) |
| `/profile` | Saved reports (requires auth) |
| `/privacy` | Privacy Policy |
| `/terms` | Terms & Conditions |
| `/refund` | Refund Policy |
| `/admin/login` | Admin login |
| `/admin/dashboard` | Analytics overview (6 tabs) |
| `/admin/ux-test` | AI persona UX testing |
| `/admin/mobile` | Mobile analytics |
| `/admin/gdpr` | GDPR request management |
| `/admin/consent-log` | Consent audit trail |

### Mobile Screens

| Screen | Description |
|---|---|
| Home | Hero, feature highlights, "Get Started" CTA |
| Consent | GDPR disclosure |
| Assessment | 10-step native form with haptics |
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

### Auth

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/auth/user` | Current authenticated user |
| `GET` | `/api/login` | Initiate Replit OIDC flow |
| `GET` | `/api/callback` | OIDC callback handler |
| `GET` | `/api/logout` | Clear session |
| `POST` | `/api/auth/mobile-token` | Exchange OIDC token for mobile session |

### GDPR

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/gdpr/consent` | Log versioned consent |
| `GET` | `/api/gdpr/export/:sessionId` | Export all data for a session |
| `POST` | `/api/gdpr/data-request` | Submit deletion or export request |

### Subscriptions & Payments

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/subscription/status` | Returns `{isPro, status, currentPeriodEnd}` |
| `POST` | `/api/webhooks/paddle` | Paddle webhook handler |

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
| `ADMIN_USERNAME` | Admin dashboard login username |
| `ADMIN_PASSWORD` | Admin dashboard login password |
| `PADDLE_WEBHOOK_SECRET` | Paddle webhook verification secret |
| `VITE_PADDLE_CLIENT_TOKEN` | Paddle client token (frontend) |
| `VITE_PADDLE_PRICE_ID` | Paddle monthly Pro price ID |
| `VITE_PADDLE_PRICE_ID_ANNUAL` | Paddle annual Pro price ID |
| `VITE_PADDLE_DONATION_PRICE_ID` | Paddle donation price ID |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | Auto-provisioned by Replit AI Integrations |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | Auto-provisioned by Replit AI Integrations |
| `REPLIT_DOMAINS` | Auto-provisioned by Replit |
| `REPL_ID` | Auto-provisioned by Replit |

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
