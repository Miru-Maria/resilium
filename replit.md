# Workspace

## Overview

**Resilium** — An AI-powered personal resilience planning platform. Users complete a 10-step assessment (including a 10-question Mental Resilience deep-dive), receive an AI-generated Resilience Report (score 0–100, vulnerabilities, action plan, scenario simulations, daily habits), and can manage their data under GDPR. Includes a full admin dashboard for analytics, AI UX testing, consent management, user management, and site announcement banners. Results page includes resource recommendations, shareable score card (Web Share API), and optional Stripe donation link.

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, Tailwind CSS, framer-motion, recharts
- **Mobile**: Expo + React Native (Expo Router, `@expo/vector-icons`, expo-haptics)
- **AI**: OpenAI via Replit AI Integrations (gpt-5.2)
- **Auth**: Replit OIDC (PKCE), express-session

## Application Architecture

### Core User Flow
1. Landing page → hero CTA
2. Consent screen (GDPR Article 6(1)(a), version 1.0)
3. 10-step assessment:
   - Location, Income stability, Savings runway, Dependents, Skills, Health & Mobility, Housing, Emergency supplies
   - **Mental Resilience deep-dive** (10 sub-questions rated 1–5: stressTolerance, adaptability, socialSupport, purposeClarity, emotionalRecovery, resourcefulness, proactivePreparation, boundarySetting, crisisLeadership, longTermThinking)
   - Risk concerns
4. AI-generated Resilience Report with score 0-100, vulnerabilities, action plan
5. Dashboard with score visualization, scenario simulations, daily habits, checklists, snapshots

### Scoring Logic
Six dimensions, each 0-100:
- **Financial** (25% weight): Income stability + savings runway + dependents
- **Skills** (20% weight): Digital, physical, survival, medical, financial, language skills
- **Health** (15% weight): Health status + medical skills
- **Mobility** (15% weight): Mobility level + housing type + dependents
- **Psychological** (15% weight): Average of 10 MR sub-question scores × 2 (maps 1–5 scale to 2–10)
- **Resources** (10% weight): Emergency supplies + survival/financial skills

### Design
- **Theme**: Permanently dark-only (no light mode, no toggle). Background `#0D1225`, primary `#E08040` (amber), text `#EAD9BE`.
- **Logo**: Custom PNG (`/logo.png` on web, `../assets/logo.png` on mobile). `ResilientIcon` renders `<img src="/logo.png">`.
- **CSS vars** in `:root` (no `.dark` class on `<html>`).

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   ├── resilium/           # React + Vite frontend (previewPath: /)
│   └── resilium-mobile/    # Expo React Native mobile app
├── lib/
│   ├── db/                 # Drizzle ORM schema + DB connection
│   ├── replit-auth-web/    # useAuth hook for Replit OIDC browser auth
│   └── integrations-openai-ai-server/  # OpenAI via Replit integrations
├── scripts/
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── tsconfig.json
```

## Database Schema

### `users` table
Replit Auth users — id (varchar PK = OIDC sub), email, firstName, lastName, profileImageUrl, createdAt, updatedAt

### `sessions` table
Replit Auth sessions — sid (varchar PK), sess (jsonb), expire (timestamp)

### `resilience_reports` table
Stores assessment inputs + generated report:
- Input: location, incomeStability, savingsMonths, hasDependents, skills (jsonb), healthStatus, mobilityLevel, housingType, hasEmergencySupplies, psychologicalResilience, riskConcerns (jsonb), **mentalResilienceAnswers (jsonb)**
- `currency` (varchar, default 'USD') — preferred currency (USD/EUR/RON) for AI financial advice
- Scores: scoreOverall, scoreFinancial, scoreHealth, scoreSkills, scoreMobility, scorePsychological, scoreResources
- MR sub-scores: mrStressTolerance, mrAdaptability, mrLearningAgility, mrChangeManagement, mrEmotionalRegulation, mrSocialSupport, mrComposite, mrPathway
- Report: riskProfileSummary, topVulnerabilities (jsonb), actionPlan (jsonb), scenarioSimulations (jsonb), dailyHabits (jsonb), checklistsByArea (jsonb)
- `sessionId` (varchar) — anonymous user tracking

### `gdpr_consents` table
sessionId, platform, consentVersion, consentGivenAt, ipHash

### `gdpr_data_requests` table
sessionId, type ('export' | 'deletion'), status ('pending' | 'completed'), createdAt, completedAt

### `report_checklists` table
reportId (FK), items (jsonb), createdAt, updatedAt

### `report_snapshots` table
reportId (FK), scores (jsonb), takenAt

### `report_feedback` table
reportId (FK), rating (int), comment (text), createdAt

### `admin_sessions` table
Token-based admin auth — token (varchar PK), createdAt, expiresAt

### `ux_test_runs` table
AI UX simulation runs — runId, status, personas (jsonb), results (jsonb), createdAt

## API Routes

### Public
- `GET /api/healthz` — Health check
- `POST /api/resilience/assess` — Submit assessment + sessionId → AI report
- `GET /api/resilience/reports/:reportId` — Retrieve report
- `GET /api/resilience/reports/:reportId/checklists` — Report checklists
- `GET /api/resilience/reports/:reportId/snapshots` — Score snapshots
- `POST /api/resilience/reports/:reportId/feedback` — Submit star rating + comment
- `GET /api/auth/user` — Current Replit Auth state
- `GET /api/login` — Replit OIDC login redirect
- `GET /api/callback` — OIDC callback
- `GET /api/logout` — Clear session + OIDC end-session

### GDPR
- `POST /api/gdpr/consent` — Record consent (sessionId, platform, consentVersion)
- `GET /api/gdpr/export/:sessionId` — Export all user data
- `POST /api/gdpr/data-request` — Submit deletion request
- `GET /api/gdpr/status/:sessionId` — Check deletion request status

### Authenticated User
- `GET /api/users/me/plans` — User's saved plan summaries
- `DELETE /api/users/me/plans/:reportId` — Delete a plan

### Admin (token auth, 24h TTL)
- `POST /api/admin/login` — Admin login → session token
- `POST /api/admin/logout` — Revoke admin session
- `GET /api/admin/analytics` — Full dashboard analytics (overview, demographics, scores, risk, recent reports, feedback)
- `GET /api/admin/analytics/mobile` — Mobile-specific analytics (platform breakdown, daily trend, score distribution, top locations)
- `GET /api/admin/gdpr/requests` — GDPR data requests list
- `PATCH /api/admin/gdpr/requests/:id` — Update request status
- `GET /api/admin/gdpr/consents` — Consent log
- `POST /api/admin/ux-test/run` — Trigger AI UX simulation
- `GET /api/admin/ux-test/runs` — List simulation runs
- `GET /api/admin/ux-test/runs/:runId` — Get run results
- `GET /api/admin/ux-test/personas` — List AI test personas

## Admin Dashboard Pages

Access at `/admin` (requires `ADMIN_USERNAME` / `ADMIN_PASSWORD` secrets):
- `/admin/dashboard` — Main analytics: total reports, avg score, daily chart, demographics, risk concerns, score histogram, feedback
- `/admin/mobile` — Mobile analytics: platform breakdown, daily mobile trend, score distribution, top locations
- `/admin/gdpr` — GDPR data request management (pending/completed deletion requests)
- `/admin/consent-log` — Consent record viewer
- `/admin/ux-test` — AI UX testing: run simulations with AI personas
- `/admin/ux-test/report/:runId` — Detailed simulation results per persona

## Web Frontend Pages

- `/` — Landing page (hero, How it works, Who it's for [preppers/financially anxious/expats/cautious], What you'll get, Privacy, CTA)
- `/consent` — GDPR consent screen (pre-assessment)
- `/assessment` — 10-step assessment with Mental Resilience deep-dive
- `/loading` — AI generation loading screen
- `/results/:reportId` — Full report dashboard (score, radar chart, vulnerabilities, action plan tabs, scenarios, habits, checklists, snapshots, feedback)
- `/profile` — "My Plans" (Replit Auth users)
- `/my-data` — GDPR data management (export, deletion request)
- `/admin` — Admin entry (redirects to `/admin/login`)

## Mobile App Screens (Expo)

- `app/index.tsx` — Home screen (logo, Start CTA, My Data link)
- `app/consent.tsx` — GDPR consent (calls `POST /api/gdpr/consent`)
- `app/assessment.tsx` — 10-step assessment with Mental Resilience 10-question deep-dive
- `app/loading.tsx` — AI generation loading with progress animation
- `app/results.tsx` — Full report view (score, category bars, vulnerabilities, action plan tabs, scenarios, habits, share)
- `app/my-data.tsx` — GDPR: export data, delete data request

## AI Integration

Uses Replit AI Integrations (OpenAI gpt-5.2). The AI:
1. Receives user profile + calculated scores + mentalResilienceAnswers
2. Generates structured JSON: riskProfileSummary, topVulnerabilities, actionPlan (short/mid/long term), scenarioSimulations (5 scenarios), dailyHabits (5 habits)
3. Voice: intelligent, grounded, strategic, empowering — not alarmist

## GitHub Repository

Mirrored to: https://github.com/Miru-Maria/resilium (branch: `main`)
GitHub integration: Replit connector `conn_github_01KJXCFKRVXXA64K4SRJX9NF1V`
Push method: GitHub Contents API via `@replit/connectors-sdk` token

## Environment Variables

- `DATABASE_URL`, `PGHOST`, etc. — Auto-provisioned by Replit PostgreSQL
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — Auto-provisioned by Replit AI Integrations
- `AI_INTEGRATIONS_OPENAI_API_KEY` — Auto-provisioned by Replit AI Integrations
- `PORT` — Auto-assigned per artifact by Replit
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — Admin dashboard credentials (secrets)
- `EXPO_PUBLIC_DOMAIN` — Mobile app API domain (set in `.env` for mobile)

## Key Conventions

- **American English only** — No UK spellings. `paralyzed`, `personalized`, `organized`, `color`, `behavior`, etc.
- **No HR/corporate angle** — Audience: preppers, financially anxious Americans, expats/digital nomads, the quietly cautious.
- **Currency** — USD, EUR, RON supported. Picker at location step (step 2) in assessment. Stored in DB and passed to AI.
- **Rate limiting** — `/api/resilience/assess` limited to 6 req/min per IP (skips for authenticated users).
- **Anonymous TTL** — Anonymous reports (userId IS NULL) auto-deleted after 30 days. Cleanup runs on server startup + daily.
- **UX Testing** — Admin-only route. NOT linked from the public nav dropdown.
- **Profile plan cards** — Show location, currency badge, mini dimension score bars (Fin/Hlt/Skl/Mob/Psy/Res).
- **Save prompt** — Results page shows a "Sign in to save" banner for unauthenticated users.
- **Always dark** — No `.dark` class. Background `#0D1225`, primary `#E08040`, text `#EAD9BE`.

## GDPR Contact

Sole individual operator. Contact: `contact_resilium@pm.me`. No DPA or "we/our" language — all copy uses "I/me" framing or impersonal.
