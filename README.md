# Resilium

**Personal resilience planning platform.** Resilium assesses your readiness across six life dimensions — financial, health, skills, mobility, psychological, and resources — and generates a personalised action plan for navigating life's disruptions.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Web App](#web-app)
- [Mobile App](#mobile-app)
- [API Server](#api-server)
- [Admin Dashboard](#admin-dashboard)
- [Scoring System](#scoring-system)
- [AI Report Generation](#ai-report-generation)
- [GDPR & Privacy](#gdpr--privacy)
- [Authentication](#authentication)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)

---

## Overview

Resilium helps individuals understand and improve their personal resilience before a crisis hits. Users complete a structured 11-step assessment — including a mental resilience deep-dive — and receive an AI-generated report with a 0–100 resilience score, scenario simulations (job loss, natural disaster, etc.), a prioritised action plan, and daily habits tailored to their profile.

The platform is available as both a **React web app** and an **Expo React Native mobile app**, backed by a shared **Express API** and **PostgreSQL** database.

---

## Features

### Assessment
- **11-step assessment flow** covering mental resilience, location, income stability, savings runway, dependents, skills, health status, mobility, housing type, emergency supplies, and risk concerns
- **Mental Resilience Baseline** — 10 Likert-scale questions across stress tolerance, adaptability, social support, self-efficacy, and future orientation; determines a Growth or Compensation psychological pathway
- **Mobile-optimised flow** with haptic feedback and animated transitions

### AI Report
- **Resilience Score (0–100)** with sub-scores across 6 dimensions
- **Radar chart visualisation** of all six dimensions
- **Mental Resilience Profile** — Growth pathway (challenge-oriented) vs. Compensation pathway (emotionally-scaffolded), with tailored guidance for each
- **Top vulnerabilities** with severity ratings (critical / high / medium / low)
- **Prioritised action plan** — short, mid, and long-term steps per area
- **Scenario simulations** — AI models impact and recovery plan for specific disruptions such as job loss, natural disaster, health crisis, and economic downturn
- **Daily habits** personalised to the user's weak areas and psychological pathway

### Progress Tracking
- **Interactive checklists** per resilience area, with completion tracking
- **Score snapshots** — historical timeline so users can track improvement over time
- **Milestone markers** — Momentum Building → Strong Foundation → Well Prepared → Fully Resilient

### User Experience
- **Dark / light mode** with system preference detection and manual override; persists across sessions
- **Unified brand palette** — forest green (#2D4A3E) in light mode, emerald teal (#2ECC8F) in dark mode
- **Replit Auth (OIDC/PKCE)** — sign in to save and revisit plans
- **Anonymous sessions** — assessment works without an account; data tied to a sessionId
- **Save PDF / Share** — export or share your results page

### GDPR & Privacy
- Versioned consent capture before any data collection
- Data export on request (JSON download)
- Data deletion request flow
- Admin GDPR management panel with audit trail
- Consent log with paginated history and CSV export

### Admin Dashboard
- Secure cookie-based admin auth (credentials from environment secrets)
- Overview analytics with Recharts visualisations
- Demographics, score distribution, and risk concern breakdowns
- Full report history
- Feedback ratings aggregation
- Mobile analytics panel (daily trends, score distribution, top locations)
- GDPR request management (mark fulfilled, trigger deletion, download export)
- Automated UX testing simulation (see below)

### AI UX Testing (Admin)
- 8 pre-built user personas — Urban Young Professional, Rural Retiree, Single Parent, Recent Graduate, Mid-Career Switcher, Expat, Freelancer, and Near-Retirement Worker
- Runs each persona through the full assessment and report generation pipeline
- A separate AI evaluator rates each report for quality, relevance, and empathy
- Generates a cross-persona summary report
- Live SSE progress stream during runs
- Exportable Markdown / printable PDF report

---

## Tech Stack

| Layer | Technology |
|---|---|
| Web frontend | React 19, Vite, TypeScript, Tailwind CSS v4, shadcn/ui, Wouter, Framer Motion, Recharts |
| Mobile app | Expo (React Native), Expo Router, React Native Reanimated, Linear Gradient |
| API server | Node.js, Express, TypeScript, esbuild |
| Database | PostgreSQL, Drizzle ORM |
| AI | OpenAI (via Replit AI Integrations — no user API key required) |
| Auth | Replit Auth (OpenID Connect / PKCE) |
| Monorepo | pnpm workspaces |

---

## Project Structure

```
resilium/
├── artifacts/
│   ├── resilium/          # React + Vite web app
│   ├── resilium-mobile/   # Expo React Native mobile app
│   ├── api-server/        # Express API server
│   └── mockup-sandbox/    # Component preview server (design tooling)
├── lib/
│   ├── db/                # Drizzle ORM schema + migrations
│   └── api-client-react/  # Auto-generated React Query hooks from OpenAPI spec
├── packages/
│   └── replit-auth-web/   # Shared Replit Auth hook for web
└── scripts/
    └── post-merge.sh      # Runs DB migrations after task merges
```

---

## Web App

**Location:** `artifacts/resilium/`

### Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | Landing | Hero, value proposition, sign-in |
| `/assess` | Assessment | 11-step resilience assessment form |
| `/results/:reportId` | Results | Full AI report, radar chart, checklists, feedback widget |
| `/profile` | Profile | Saved plans list (requires auth) |
| `/privacy` | Privacy Policy | GDPR information and user rights |
| `/admin/login` | Admin Login | Secure admin authentication |
| `/admin/dashboard` | Admin Dashboard | Analytics overview (6 tabs) |
| `/admin/ux-test` | UX Testing | Run AI persona simulations |
| `/admin/ux-test/report/:runId` | UX Test Report | Per-run results and cross-persona analysis |
| `/admin/mobile` | Mobile Analytics | Mobile-specific metrics and trends |
| `/admin/gdpr` | GDPR Management | Process data requests |
| `/admin/consent-log` | Consent Log | Paginated audit trail with CSV export |

### Key Components
- `ThemeToggle` — light/dark mode switcher, present in every page header
- `ResilientIcon` — custom mountain-path brand SVG, used across all headers
- `CircularProgress` — animated score ring
- `RadarChartView` — six-dimension Recharts radar
- `SiteFooter` — GDPR links, privacy policy

---

## Mobile App

**Location:** `artifacts/resilium-mobile/`

Built with Expo Router (file-based routing). Supports iOS and Android via Expo Go, and runs in a web preview via Metro bundler.

### Screens

| Screen | File | Description |
|---|---|---|
| Home | `app/index.tsx` | Hero, feature highlights, "Get Started" CTA |
| Consent | `app/consent.tsx` | GDPR disclosure and data collection agreement |
| Assessment | `app/assessment.tsx` | 10-step native assessment form with haptics |
| Loading | `app/loading.tsx` | Animated AI generation progress screen |
| Results | `app/results.tsx` | Score rings, action plan, share button |
| My Data | `app/my-data.tsx` | View, export, or delete personal data |

### Theme System
- `context/theme.tsx` — `ThemeProvider` with `useColors()` and `useTheme()` hooks
- Reads system colour scheme on first launch, persists manual preference via AsyncStorage
- Light palette: forest green primary (`#2D4A3E`), off-white background (`#F8FAF9`)
- Dark palette: dark forest background (`#0B1812`), emerald teal primary (`#2ECC8F`)
- Sun/moon toggle button in the home screen header

---

## API Server

**Location:** `artifacts/api-server/`

Express server built with TypeScript and compiled with esbuild.

### Endpoints

#### Resilience
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/resilience/assess` | Run scoring + generate AI report |
| `GET` | `/api/resilience/reports/:reportId` | Fetch a report |
| `GET` | `/api/resilience/reports/:reportId/checklists` | Get checklist items and completion |
| `PATCH` | `/api/resilience/reports/:reportId/checklists/:area/:itemId` | Toggle checklist item |
| `GET` | `/api/resilience/reports/:reportId/snapshots` | Historical score snapshots |

#### Auth
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/auth/user` | Current authenticated user |
| `GET` | `/api/login` | Initiate Replit OIDC flow |
| `GET` | `/api/callback` | OIDC callback handler |
| `GET` | `/api/logout` | Clear session |
| `POST` | `/api/auth/mobile-token` | Exchange OIDC token for mobile session |

#### GDPR
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/gdpr/consent` | Log versioned consent |
| `GET` | `/api/gdpr/export/:sessionId` | Export all data for a session |
| `POST` | `/api/gdpr/data-request` | Submit deletion or export request |

#### Feedback
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/feedback` | Submit star rating + comment for a report |

#### Admin (protected — requires admin session)
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/admin/login` | Admin login |
| `GET` | `/api/admin/session` | Check admin auth state |
| `GET` | `/api/admin/analytics` | Aggregated platform analytics |
| `GET` | `/api/admin/analytics/mobile` | Mobile-specific metrics |
| `GET` | `/api/admin/ux-test/personas` | List available UX test personas |
| `POST` | `/api/admin/ux-test/run` | Start a simulation run |
| `GET` | `/api/admin/ux-test/runs` | List past runs |
| `GET` | `/api/admin/ux-test/runs/:runId` | Get run details |
| `GET` | `/api/admin/ux-test/runs/:runId/stream` | SSE live progress stream |
| `GET` | `/api/admin/gdpr/requests` | List GDPR data requests |
| `POST` | `/api/admin/gdpr/requests/:id/fulfill` | Fulfill a request |
| `GET` | `/api/admin/gdpr/requests/:id/export` | Download export data |
| `GET` | `/api/admin/gdpr/consent-log` | Paginated consent audit log |

---

## Admin Dashboard

Access at `/admin/login` with credentials set in `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment secrets.

The dashboard has six tabs on the main view: **Overview**, **Demographics**, **Score Analytics**, **Risk Concerns**, **Reports**, and **Feedback**. The sidebar links to **Mobile Analytics**, **GDPR Management**, and **Consent Log**.

The **UX Testing** section lets you select any combination of the 8 built-in personas, run a full simulation, watch live SSE progress, then review per-persona AI quality scores and a cross-persona synthesis report — all exportable as Markdown or PDF.

---

## Scoring System

Scores are calculated in `artifacts/api-server/src/routes/resilience/scoring.ts`.

| Dimension | Weight | Key inputs |
|---|---|---|
| Financial | 25% | Income stability, savings runway, dependents |
| Skills | 20% | Transferable skill count and diversity |
| Health | 15% | Self-reported health status |
| Mobility | 15% | Geographic mobility level |
| Psychological | 15% | Mental resilience questionnaire (10 questions) |
| Resources | 10% | Emergency supplies, housing security |

The mental resilience questionnaire covers five sub-dimensions: stress tolerance, adaptability, social support, self-efficacy, and future orientation. The combined result determines whether the user falls on a **Growth pathway** (challenge-oriented framing) or a **Compensation pathway** (emotionally-scaffolded framing), which the AI uses to tailor the language and recommendations in the report.

---

## AI Report Generation

Powered by OpenAI through Replit's AI Integration proxy — no API key is needed from the user; it is provisioned automatically via `AI_INTEGRATIONS_OPENAI_BASE_URL` and `AI_INTEGRATIONS_OPENAI_API_KEY`.

The AI receives the calculated scores, raw assessment answers, and the user's psychological pathway, then returns a structured JSON report containing:

- Executive risk summary
- Top vulnerabilities with severity and rationale
- Action plan items per dimension, each tagged short / mid / long term
- Scenario simulations with impact assessment and recovery steps
- Daily habit recommendations
- Interactive checklist items per resilience area, worded according to the user's Growth or Compensation pathway

---

## GDPR & Privacy

- Consent is captured before any data collection on both web and mobile
- Consent records are versioned and stored in the `gdpr_consent` table
- Each user/session has a `sessionId` linking their data; no PII is required to use the app
- Users can export all their data or request deletion from the My Data screen (mobile) or via the API
- Admins can process requests, trigger deletions, and download export packages from the GDPR panel
- All admin GDPR actions are logged in the `gdpr_admin_actions` audit table

---

## Authentication

Web authentication uses **Replit Auth (OpenID Connect with PKCE)**. Users can take the assessment anonymously; signing in enables saving and revisiting plans.

The mobile app supports the same Replit Auth flow via a token exchange endpoint (`/api/auth/mobile-token`) that converts an OIDC token from Expo into a server-side session.

Admin authentication is a separate cookie-based system using credentials stored as environment secrets, with a 24-hour session TTL.

---

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 9+
- PostgreSQL database (or use the Replit-provisioned one)

### Install dependencies
```bash
pnpm install
```

### Push database schema
```bash
pnpm --filter @workspace/db run push
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

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Secret for signing web sessions |
| `ADMIN_USERNAME` | Admin dashboard login username |
| `ADMIN_PASSWORD` | Admin dashboard login password |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | Auto-provisioned by Replit AI Integrations |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | Auto-provisioned by Replit AI Integrations |
| `REPLIT_DOMAINS` | Auto-provisioned by Replit |
| `REPL_ID` | Auto-provisioned by Replit |
