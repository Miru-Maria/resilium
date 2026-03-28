# Resilium: Full Technical Specification
## Version 2.0 — March 2026

---

## 1. System Overview

Resilium is a full-stack, multi-artifact monorepo application delivering personalised resilience assessment on web and mobile. The system is built as a pnpm workspace containing three deployed artifacts and three shared library packages.

### 1.1 Repository Structure

```
resilium/
├── artifacts/
│   ├── api-server/          # Express 5 REST API (Node.js 24)
│   ├── resilium/            # React + Vite web application
│   └── resilium-mobile/     # Expo (React Native) mobile application
├── lib/
│   ├── db/                  # Drizzle ORM schema + migrations
│   └── replit-auth-web/     # Shared Replit Auth hook for web
└── pnpm-workspace.yaml
```

### 1.2 Artifact Summary

| Artifact | Runtime | Port | Purpose |
|---|---|---|---|
| `api-server` | Node.js 24 | `$PORT` (8080 dev) | REST API, AI orchestration, auth, webhooks |
| `resilium` | Vite 7 / React 19 | `$PORT` (5173 dev) | Web frontend (SPA) |
| `resilium-mobile` | Expo SDK 53 | `$PORT` | React Native app (web + iOS + Android) |

---

## 2. Technology Stack

### 2.1 Backend

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js | 24 LTS |
| Framework | Express | 5.x |
| Language | TypeScript | 5.9.x |
| ORM | Drizzle ORM | 0.39.x |
| Database | PostgreSQL | 16 (Replit managed) |
| Session store | connect-pg-simple | pg-backed sessions |
| Authentication | Replit Auth (OpenID Connect / PKCE) | — |
| AI provider | OpenAI gpt-5.2 via Replit AI Integrations proxy | gpt-5.2 |
| Rate limiting | express-rate-limit | 7.x |
| Build | esbuild (via custom build.mjs) | 0.24.x |

### 2.2 Frontend (Web)

| Layer | Technology | Version |
|---|---|---|
| Framework | React | 19.x |
| Build tool | Vite | 7.x |
| Routing | Wouter | 3.x |
| State / data fetching | TanStack React Query | 5.x |
| UI components | shadcn/ui (Radix UI primitives) | — |
| Styling | Tailwind CSS | 4.x |
| Animation | Framer Motion | 12.x |
| Charts | Recharts | 2.x |
| Icons | Lucide React | — |
| Payments | Paddle.js v2 (overlay checkout) | — |

### 2.3 Mobile

| Layer | Technology | Version |
|---|---|---|
| Framework | Expo | SDK 53 |
| React Native | React Native | 0.79.x |
| Navigation | Expo Router (file-based) | 6.x |
| Animations | React Native Reanimated | 3.x |
| Notifications | expo-notifications | — |
| Haptics | expo-haptics | — |
| Gradients | Expo Linear Gradient | — |
| SVG | react-native-svg | 15.x |
| Icons | @expo/vector-icons (Feather) | — |
| Fonts | Expo Google Fonts (Inter, Playfair Display) | — |

### 2.4 Shared Libraries

| Package | Purpose |
|---|---|
| `@workspace/db` | Drizzle schema, types, and database client |
| `@workspace/replit-auth-web` | Shared Replit Auth hook (`useAuth`) for web |

---

## 3. Database Schema

All tables use PostgreSQL via Drizzle ORM. Schema is pushed using `drizzle-kit push`.

### 3.1 Core Tables

#### `users`
```sql
id                VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()
email             VARCHAR UNIQUE
first_name        VARCHAR
last_name         VARCHAR
profile_image_url VARCHAR
created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```
Populated and maintained by Replit Auth on every login via upsert.

#### `sessions`
```sql
sid     VARCHAR PRIMARY KEY
sess    JSONB NOT NULL
expire  TIMESTAMP NOT NULL
```
Standard express-session + connect-pg-simple store. Indexed on `expire`.

#### `resilience_reports`
```sql
id                    SERIAL PRIMARY KEY
report_id             TEXT UNIQUE NOT NULL        -- public UUID
session_id            TEXT                        -- anonymous session tracking
user_id               VARCHAR REFERENCES users(id) ON DELETE CASCADE
created_at            TIMESTAMP DEFAULT NOW()
currency              VARCHAR(3) DEFAULT 'USD'    -- USD | EUR | RON
location              TEXT NOT NULL
income_stability      TEXT NOT NULL               -- fixed | freelance | unstable
savings_months        REAL NOT NULL
has_dependents        BOOLEAN NOT NULL
skills                JSONB NOT NULL              -- string[]
health_status         TEXT NOT NULL               -- excellent | good | fair | poor
mobility_level        TEXT NOT NULL               -- high | medium | low
housing_type          TEXT NOT NULL               -- own | rent | family | nomadic | other
has_emergency_supplies BOOLEAN NOT NULL
psychological_resilience REAL NOT NULL            -- 1–10 self-rating
risk_concerns         JSONB NOT NULL              -- string[]

-- Mental Resilience sub-scores (0–100 normalised from 1–5 Likert)
mr_stress_tolerance   REAL
mr_adaptability       REAL
mr_learning_agility   REAL
mr_change_management  REAL
mr_emotional_regulation REAL
mr_social_support     REAL
mr_composite          REAL                        -- simple mean of 6 sub-scores
mr_pathway            TEXT                        -- growth | compensation | null

-- Dimension scores (0–100)
score_overall         REAL NOT NULL
score_financial       REAL NOT NULL
score_health          REAL NOT NULL
score_skills          REAL NOT NULL
score_mobility        REAL NOT NULL
score_psychological   REAL NOT NULL
score_resources       REAL NOT NULL

-- AI-generated content (JSONB)
risk_profile_summary  TEXT NOT NULL
top_vulnerabilities   JSONB NOT NULL
action_plan           JSONB NOT NULL
scenario_simulations  JSONB NOT NULL
daily_habits          JSONB NOT NULL
checklists_by_area    JSONB
recommended_resources JSONB
```

#### `subscriptions`
```sql
id                      SERIAL PRIMARY KEY
user_id                 VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE
paddle_subscription_id  TEXT UNIQUE
paddle_customer_id      TEXT
status                  TEXT NOT NULL DEFAULT 'inactive'
                        -- inactive | active | cancel_scheduled | past_due | cancelled
plan_name               TEXT DEFAULT 'Pro'
current_period_end      TIMESTAMP
created_at              TIMESTAMP DEFAULT NOW()
updated_at              TIMESTAMP DEFAULT NOW()
```

#### `checklist_progress`
```sql
id           SERIAL PRIMARY KEY
report_id    TEXT NOT NULL
area         TEXT NOT NULL
item_id      TEXT NOT NULL
completed    BOOLEAN NOT NULL DEFAULT false
completed_at TIMESTAMP
```

#### `progress_snapshots`
```sql
id                  SERIAL PRIMARY KEY
session_id          TEXT NOT NULL
report_id           TEXT NOT NULL
snapshot_at         TIMESTAMP DEFAULT NOW()
score_overall       REAL NOT NULL
score_financial     REAL NOT NULL
score_health        REAL NOT NULL
score_skills        REAL NOT NULL
score_mobility      REAL NOT NULL
score_psychological REAL NOT NULL
score_resources     REAL NOT NULL
mr_composite        REAL
```

#### `push_tokens`
```sql
id           SERIAL PRIMARY KEY
session_id   TEXT NOT NULL
token        TEXT NOT NULL
platform     TEXT                -- ios | android | web
created_at   TIMESTAMP DEFAULT NOW()
```
Stores Expo push tokens for server-initiated notifications.

#### Additional Tables
- `gdpr_consent` — versioned consent records with session ID, version string, and timestamp
- `gdpr_requests` — tracks data export/deletion requests with contact email and request type
- `gdpr_admin_actions` — audit trail of all admin GDPR actions
- `feedback` — per-report star ratings and free-text comments
- `site_announcements` — admin-controlled platform-wide banners
- `ux_test_runs` / `ux_test_results` — AI persona-driven UX testing framework

---

## 4. API Specification

Base path: `/api`

Authentication: Replit Auth session cookie (`connect.sid`) for user routes; admin cookie-based session for admin routes.

### 4.1 Assessment & Reports

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/resilience/assess` | Optional | Submit assessment; triggers scoring and AI report generation |
| `GET` | `/resilience/reports/:reportId` | Optional | Fetch report by public ID |
| `GET` | `/resilience/reports/:reportId/checklists` | Optional | Fetch checklist items and completion state |
| `PATCH` | `/resilience/reports/:reportId/checklists/:area/:itemId` | Required | Toggle checklist item completion |
| `GET` | `/resilience/reports/:reportId/snapshots` | Optional | Historical score snapshots for a report |

**POST `/resilience/assess` — Request body:**
```typescript
{
  location: string                   // free text geographic location
  currency?: "USD" | "EUR" | "RON"
  incomeStability: "fixed" | "freelance" | "unstable"
  savingsMonths: number              // 0–36+
  hasDependents: boolean
  skills: string[]                   // digital | physical | survival | medical | financial | language | none
  healthStatus: "excellent" | "good" | "fair" | "poor"
  mobilityLevel: "high" | "medium" | "low"
  housingType: "own" | "rent" | "family" | "nomadic" | "other"
  hasEmergencySupplies: boolean
  psychologicalResilience: number    // 1–10 fallback self-rating
  riskConcerns: string[]
  mentalResilienceAnswers: {
    stressTolerance1:      1|2|3|4|5
    stressTolerance2:      1|2|3|4|5
    adaptability1:         1|2|3|4|5
    adaptability2:         1|2|3|4|5
    learningAgility1:      1|2|3|4|5
    changeManagement1:     1|2|3|4|5
    changeManagement2:     1|2|3|4|5
    emotionalRegulation1:  1|2|3|4|5
    emotionalRegulation2:  1|2|3|4|5
    socialSupport1:        1|2|3|4|5
  }
}
```

**Rate limiting:** 6 submissions per minute per IP for anonymous users.

### 4.2 Scenario Simulations (Pro)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/scenarios` | Required (Pro) | Generate scenario stress-test for an existing report |

**POST `/scenarios` — Request body:**
```typescript
{
  reportId: string       // existing report UUID
  scenario: string       // "job_loss" | "natural_disaster" | "health_crisis" | "relocation"
}
```

Returns scenario impact delta on each dimension, recovery timeline estimate, and tailored action steps.

### 4.3 User Management

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/users/me/plans` | Required | List user's saved reports |
| `DELETE` | `/users/me/plans/:reportId` | Required | Delete a specific report |
| `DELETE` | `/users/me/plans` | Required | Delete all reports |
| `DELETE` | `/users/me` | Required | Full account deletion (GDPR) |
| `GET` | `/users/me/report-count` | Required | Count of saved reports |
| `GET` | `/users/me/export` | Required | Full data export (JSON) |
| `GET` | `/users/me/latest-checklist` | Required | Latest report's checklist data |
| `POST` | `/users/me/compare-plans` | Required | AI comparison of two plan IDs |

### 4.4 Authentication

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/auth/user` | Current session user |
| `GET` | `/login` | Initiate Replit Auth OIDC flow |
| `GET` | `/callback` | OIDC callback handler |
| `GET` | `/logout` | Clear session |
| `POST` | `/auth/mobile-token` | Exchange OIDC token for mobile session |

### 4.5 Subscriptions

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/subscription/status` | Required | Returns `{ isPro, status, currentPeriodEnd }` |
| `POST` | `/webhooks/paddle` | Signature | Receive Paddle subscription lifecycle events |

**Webhook events handled:**
- `subscription.activated` → set status `active`
- `subscription.updated` → update status and `current_period_end`
- `subscription.cancelled` → set status `cancelled`
- `subscription.past_due` → set status `past_due`

**Signature verification:** HMAC-SHA256 over `{timestamp}:{rawBody}` using `PADDLE_WEBHOOK_SECRET`.

### 4.6 GDPR

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/gdpr/consent` | Log versioned consent record |
| `GET` | `/gdpr/export/:sessionId` | Export all data for a session |
| `POST` | `/gdpr/data-request` | Submit deletion or export request |

### 4.7 Push Notifications

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/push-tokens` | Register Expo push token (body: `{ token, platform?, sessionId }`) |

### 4.8 Admin (cookie-based admin session required)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/admin/login` | Authenticate with `ADMIN_USERNAME` / `ADMIN_PASSWORD` |
| `GET` | `/admin/session` | Validate admin session |
| `GET` | `/admin/analytics` | Full platform analytics aggregate |
| `GET` | `/admin/analytics/mobile` | Mobile-specific metrics |
| `GET` | `/admin/ux-test/personas` | List available UX test personas |
| `POST` | `/admin/ux-test/run` | Start a persona simulation run |
| `GET` | `/admin/ux-test/runs` | List past simulation runs |
| `GET` | `/admin/ux-test/runs/:runId` | Get run details and per-persona scores |
| `GET` | `/admin/ux-test/runs/:runId/stream` | SSE live progress stream |
| `GET` | `/admin/gdpr/requests` | List data requests |
| `POST` | `/admin/gdpr/requests/:id/fulfill` | Mark request fulfilled |
| `GET` | `/admin/gdpr/requests/:id/export` | Download export package |
| `GET` | `/admin/gdpr/consent-log` | Paginated consent audit log |
| `GET` | `/announcements` | Active site announcements |
| `POST` | `/admin/announcements` | Create announcement |
| `PATCH` | `/admin/announcements/:id` | Toggle announcement active state |
| `DELETE` | `/admin/announcements/:id` | Delete announcement |

### 4.9 Supporting

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/feedback` | Submit report star rating + comment |
| `GET` | `/health` | Health check (returns `{ status: "ok" }`) |

---

## 5. Scoring Methodology

All scoring is deterministic. No AI is involved in score calculation. The algorithm runs server-side in `scoring.ts`.

### 5.1 Dimension Weights

| Dimension | Weight |
|---|---|
| Financial | 25% |
| Skills | 20% |
| Health | 15% |
| Mobility | 15% |
| Psychological | 15% |
| Resources | 10% |

### 5.2 Financial Score

| Input | Contribution |
|---|---|
| Income stability: fixed | +40 pts |
| Income stability: freelance | +25 pts |
| Income stability: unstable | +10 pts |
| Savings ≥ 12 months | +40 pts |
| Savings 6–11 months | +30 pts |
| Savings 3–5 months | +20 pts |
| Savings 1–2 months | +10 pts |
| Savings < 1 month | +0 pts |
| No dependents | +20 pts |
| Has dependents | +5 pts |

### 5.3 Skills Score

| Skill | Points |
|---|---|
| Survival | 25 |
| Digital | 20 |
| Physical | 20 |
| Medical | 20 |
| Financial | 15 |
| Language | 15 |
| None | 0 |

Multiple skills sum; capped at 100.

### 5.4 Health Score

| Input | Contribution |
|---|---|
| Health: excellent | +60 pts |
| Health: good | +45 pts |
| Health: fair | +25 pts |
| Health: poor | +10 pts |
| Has medical skill | +20 pts |
| Base | +20 pts |

### 5.5 Mobility Score

| Input | Contribution |
|---|---|
| Mobility: high | +50 pts |
| Mobility: medium | +30 pts |
| Mobility: low | +10 pts |
| Housing: nomadic | +40 pts |
| Housing: rent | +30 pts |
| Housing: family | +25 pts |
| Housing: own | +20 pts |
| Housing: other | +15 pts |
| No dependents | +10 pts |

### 5.6 Resources Score

| Input | Contribution |
|---|---|
| Has emergency supplies | +50 pts |
| Has survival skill | +30 pts |
| Has financial skill | +20 pts |

### 5.7 Mental Resilience Composite (MRC)

The 10 Likert questions (1–5 scale) map to six sub-dimensions:

```
stressTolerance    = mean(stressTolerance1, stressTolerance2)
adaptability       = mean(adaptability1, adaptability2)
learningAgility    = learningAgility1
changeManagement   = mean(changeManagement1, changeManagement2)
emotionalRegulation = mean(emotionalRegulation1, emotionalRegulation2)
socialSupport      = socialSupport1

Each sub-score normalised to 0–100:
  subScore = round(((avg - 1) / 4) × 100)

MRC = round(mean of all six sub-scores)       -- equal weight (1/6 each)
```

**Pathway classification:**
- `growth`: MRC ≥ 60 — user has capacity for challenge-oriented goals
- `compensation`: MRC < 60 — user should focus on stabilisation before expansion

**Cross-area psychological modifier (compensation pathway only):**
```
modifier = 0.85 + (MRC / 60) × 0.15
  -- MRC=0  → modifier 0.85 (15% dampening)
  -- MRC=59 → modifier ~0.998 (≈ no dampening)

Financial and Skills scores are multiplied by modifier before weighting.
Health, Mobility, and Resources are unaffected.
```

### 5.8 Overall Score

```
overall = (financial × modifier × 0.25) +
          (health × 0.15) +
          (skills × modifier × 0.20) +
          (mobility × 0.15) +
          (psychological × 0.15) +
          (resources × 0.10)
```

All scores are clamped to [0, 100].

---

## 6. AI Pipeline

### 6.1 Architecture

The AI layer uses OpenAI's gpt-5.2 model via Replit's AI Integrations proxy, which handles API key management and billing. The server never stores or exposes the raw API key.

### 6.2 Report Generation Flow

```
1. Score calculation (deterministic, ~1ms)
2. Prompt construction from score context + input data + MRC pathway
3. OpenAI API call (full response awaited; not streamed)
4. Response parsed into structured JSON:
   - riskProfileSummary (text)
   - topVulnerabilities (array of {area, description, severity})
   - actionPlan (array of {timeframe, action, priority, area})
   - scenarioSimulations (array of {scenario, impact, mitigation})
   - dailyHabits (array of {habit, rationale, difficulty})
   - checklistsByArea (object: area → [{itemId, text, priority}])
   - recommendedResources (array of {title, url, category, description})
5. Full structured report written to database
6. Report ID returned to client
```

Malformed AI responses trigger a retry (max 2 attempts) before returning an error.

### 6.3 AI Prompt Design

The system prompt establishes Resilium as a personal resilience advisor. The user prompt injects:
- All six dimension scores and sub-scores
- The MRC composite and pathway classification
- Geographic context (location)
- Key vulnerability flags derived from inputs
- Currency preference (affects financial framing)

The MRC pathway directly changes the AI's framing strategy:
- **Growth pathway:** Challenge-oriented language; ambitious action plan; longer-horizon goals
- **Compensation pathway:** Emotionally scaffolded language; stability-first priorities; shorter-horizon milestones

### 6.4 Scenario Simulations

Each scenario stress-test (`/api/scenarios`) is a separate AI call that receives the full report context plus the scenario type. The model returns:
- Impact delta per dimension (e.g., "Financial −25, Skills +5")
- Recovery timeline estimate
- Scenario-specific action steps and resources

Scenarios supported: `job_loss`, `natural_disaster`, `health_crisis`, `relocation`.

### 6.5 Plan Comparison AI

`POST /api/users/me/compare-plans` receives two full report objects and returns a comparative analysis identifying improvements, regressions, and recommended next steps between two assessment dates.

---

## 7. Authentication & Security

### 7.1 User Authentication (Replit Auth)

Resilium uses Replit's managed OpenID Connect implementation:

1. User initiates login → redirect to Replit OIDC provider
2. PKCE challenge generated and verified
3. Callback receives authorisation code → exchanged for tokens
4. User record upserted into `users` table
5. Session established via `express-session` with PostgreSQL store
6. `authMiddleware` populates `req.user` on all authenticated requests

Session cookies are `HttpOnly`, `Secure` (production), `SameSite: lax`, 24-hour TTL.

### 7.2 Admin Authentication

Admin routes use a cookie-based session:
- Credentials (`ADMIN_USERNAME`, `ADMIN_PASSWORD`) stored as environment secrets
- Successful login sets a signed HTTP-only cookie
- All `/api/admin/*` routes validate the admin cookie via middleware
- Admin sessions expire after 24 hours

### 7.3 Paddle Webhook Security

```typescript
const signed = `${timestamp}:${rawBody}`;
const expected = createHmac("sha256", PADDLE_WEBHOOK_SECRET)
  .update(signed)
  .digest("hex");
assert(expected === h1); // from Paddle-Signature header
```

Raw request body is captured before JSON parsing to ensure signature integrity.

### 7.4 Rate Limiting

Anonymous assessment submissions: 6 per minute per IP (express-rate-limit).

---

## 8. Freemium Access Control

### 8.1 Free Limit

`FREE_LIMIT = 2`. Two complete assessments are available at no charge for all users.

### 8.2 Anonymous Users

Assessment count tracked in browser `localStorage` under key `resilium_free_count`. If count ≥ 2, the assessment page renders a paywall screen before any form elements are shown. A progress counter ("X of 2 free assessments used") is displayed in the assessment header throughout.

### 8.3 Authenticated Users (No Subscription)

On assessment page load, two parallel API calls are made:
- `GET /api/subscription/status` — returns `{ isPro, status, currentPeriodEnd }`
- `GET /api/users/me/report-count` — returns `{ count: number }`

If `!isPro && count >= 2`, the paywall screen is shown. Gate fails open on API error.

### 8.4 Pro Subscribers

`isPro: true` (status `active` or `cancel_scheduled`) bypasses all assessment gates. Pro users also unlock the Scenario Simulations runner at `/scenarios/:reportId`.

---

## 9. Frontend Architecture

### 9.1 Web Application Pages

| Route | Description | Auth |
|---|---|---|
| `/` | Landing page — hero, value proposition, sign-in | No |
| `/about` | About Resilium | No |
| `/demo` | Static fictional demo report for "Alex M." | No |
| `/pricing` | Pro plan pricing and comparison | No |
| `/assess` | 11-step assessment (gated at 2 free) | No (gated) |
| `/results/:reportId` | Full AI report, radar chart, checklists, feedback | No |
| `/scenarios/:reportId` | Scenario stress-test runner | Yes (Pro) |
| `/profile` | Saved reports, progress tracking, account settings | Yes |
| `/privacy` | Privacy Policy | No |
| `/terms` | Terms & Conditions | No |
| `/refund` | Refund Policy | No |
| `/admin/login` | Admin login | No |
| `/admin/dashboard` | Analytics overview (6 tabs) | Admin |
| `/admin/ux-test` | AI persona UX testing runner | Admin |
| `/admin/ux-test/report/:runId` | Per-run results | Admin |
| `/admin/mobile` | Mobile analytics | Admin |
| `/admin/gdpr` | GDPR request management | Admin |
| `/admin/consent-log` | Consent audit trail | Admin |

### 9.2 Assessment Flow

The assessment is a multi-step single-page form. Step 1 is the Mental Resilience questionnaire — 10 Likert-scale questions shown one at a time with a sub-step progress counter. Steps 2–11 cover location, income, savings, dependents, skills, health, mobility, housing, emergency supplies, psychological self-rating, and risk concerns. Navigation is animated via Framer Motion `AnimatePresence`. State is held in a single `formData` React state object.

### 9.3 Results Page

Displays: overall score ring (CircularProgress), dimension bar chart, radar chart (Recharts), mental resilience profile (Growth vs. Compensation), top vulnerabilities, action plan (tabbed by timeframe), scenario simulations (accordion), daily habits, and interactive checklists. Authenticated users can also save their plan from this page.

### 9.4 Demo Page

`/demo` presents a pre-populated fictional report for "Alex M." showing all results sections and Pro-gated scenario teasers. Linked from the landing navigation to showcase product value without requiring assessment completion.

### 9.5 Profile Architecture

Four-tab layout:
1. **Overview** — Score trend chart, most-improved / focus-area highlights
2. **Plans** — Plan cards with delete; compare mode (select 2 → AI analysis modal)
3. **Checklist** — DB-persisted item progress; collapsible by area
4. **Account** — GDPR export, delete all plans, delete account

### 9.6 Admin Dashboard

Admin pages use a shared `AdminLayout` component (sidebar navigation, session check). Six-tab analytics view: Overview, Demographics, Score Analytics, Risk Concerns, Reports, Feedback. Sidebar links to Mobile Analytics, GDPR Management, Consent Log, and UX Testing. Site announcements can be created and toggled active/inactive.

---

## 10. Mobile Application

### 10.1 Screens

| File | Route | Description |
|---|---|---|
| `app/index.tsx` | `/` | Landing — hero, feature highlights, "Get Started" CTA |
| `app/consent.tsx` | `/consent` | GDPR disclosure and data collection agreement |
| `app/assessment.tsx` | `/assessment` | 10-step native assessment |
| `app/loading.tsx` | `/loading` | Animated AI generation progress |
| `app/results.tsx` | `/results` | Score rings, action plan, share button |
| `app/my-data.tsx` | `/my-data` | View, export, or delete personal data |

### 10.2 Design System

Dark-only palette:

```typescript
const colors = {
  background:   "#0D1225",  // deep navy
  primary:      "#E08040",  // brand orange
  primaryDark:  "#C06820",
  card:         "#141928",
  text:         "#E8EAF2",
  textMuted:    "#6B7280",
  success:      "#10B981",
}
```

Typography: Inter (body) and Playfair Display (headings) via Expo Google Fonts.

### 10.3 Push Notifications

On the home screen, the app requests notification permissions and, on grant:
1. Retrieves an Expo push token via `expo-notifications`
2. Registers the token at `POST /api/push-tokens`
3. Schedules a local check-in reminder 30 days from first launch

Haptic feedback is provided via `expo-haptics` throughout the assessment flow.

### 10.4 Neural Network Animation

Landing screen background: 22 animated SVG particles with randomised velocities rendered via `react-native-svg`. Connection lines drawn between particles within `min(w,h) × 0.45` distance. Capped at 20fps via `requestAnimationFrame`. Positioned absolutely behind hero content with `pointerEvents="none"`.

---

## 11. Data Privacy & GDPR

### 11.1 Data Classification

| Data Type | Retention | Deletion path |
|---|---|---|
| Anonymous reports | 30 days | Auto-purged on API startup + 24-hour cron |
| Authenticated reports | Until user deletion | `DELETE /api/users/me` or per-plan deletion |
| Session data | 24 hours | Automatic expiry |
| Consent records | Indefinite (legal record) | Manual admin action only |
| GDPR requests | Indefinite (legal record) | Manual admin action only |
| Subscription records | Until account deletion | Cascade on user delete |
| Push tokens | Until session deletion | Cascade on session delete |

### 11.2 Automated Cleanup

On API server startup and every 24 hours:
```typescript
db.delete(resilienceReportsTable).where(
  and(isNull(userId), lt(createdAt, thirtyDaysAgo))
)
```

### 11.3 User Data Export

`GET /api/users/me/export` returns a JSON object containing:
- User profile data
- All resilience reports (full objects)
- Checklist progress
- Subscription status
- GDPR consent records

Delivered as `application/json` with `Content-Disposition: attachment`.

### 11.4 Consent Management

GDPR consent is captured before any data collection on both web and mobile. Records stored in `gdpr_consent` table with versioned consent strings. All admin GDPR actions (fulfill, delete, export) are written to `gdpr_admin_actions` audit table. Admins access the full paginated consent audit log at `/admin/consent-log`.

### 11.5 Account Deletion

`DELETE /api/users/me` performs within a single transaction:
1. Delete all resilience reports (cascades to checklist progress)
2. Delete subscription record
3. Delete push tokens
4. Delete user record (cascades to sessions)

---

## 12. Infrastructure & Deployment

### 12.1 Deployment Platform

Resilium is deployed on Replit's managed cloud infrastructure:

- **Compute:** Managed containerised execution environment
- **Database:** Replit-managed PostgreSQL 16 (accessed via `DATABASE_URL`)
- **TLS:** Automatic TLS termination at edge (mTLS for preview, full TLS in production)
- **CDN:** Replit edge proxy handles routing
- **Domain:** `*.replit.app` with custom domain support

### 12.2 Environment Variables

| Variable | Scope | Required | Purpose |
|---|---|---|---|
| `DATABASE_URL` | API server | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | API server | Yes | Express session signing key |
| `ADMIN_USERNAME` | API server | Yes | Admin panel credentials |
| `ADMIN_PASSWORD` | API server | Yes | Admin panel credentials |
| `PADDLE_WEBHOOK_SECRET` | API server | For payments | Webhook HMAC verification |
| `VITE_PADDLE_CLIENT_TOKEN` | Web frontend | For payments | Paddle.js initialisation token |
| `VITE_PADDLE_PRICE_ID` | Web frontend | For payments | Monthly Pro subscription price ID |
| `VITE_PADDLE_PRICE_ID_ANNUAL` | Web frontend | For payments | Annual Pro subscription price ID |
| `VITE_PADDLE_DONATION_PRICE_ID` | Web frontend | No | Donation price ID |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | API server | Yes | Auto-provisioned by Replit AI Integrations |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | API server | Yes | Auto-provisioned by Replit AI Integrations |
| `REPLIT_DOMAINS` | Shared | Yes | Auto-provisioned by Replit |
| `REPL_ID` | Shared | Yes | Auto-provisioned by Replit |

### 12.3 Build Process

**API Server:** TypeScript compiled and bundled via esbuild into a single `dist/index.mjs`. Bundle size: ~2.7MB.

**Web app:** Vite production build with tree-shaking, code splitting, and asset fingerprinting. `BASE_URL` injected at build time for path-prefixed proxy routing.

**Mobile app:** Expo web build via Metro bundler for web deployment. Native builds (iOS/Android) via EAS Build.

### 12.4 Database Migrations

```bash
cd lib/db && pnpm run push-force
# Executes: drizzle-kit push --force --config ./drizzle.config.ts
```

No manual SQL migrations are written. Drizzle schema is the single source of truth.

---

## 13. Performance Characteristics

| Metric | Observed | Target |
|---|---|---|
| API cold start | ~843ms (esbuild bundle) | <2s |
| Assessment AI generation | 8–15s | <20s |
| Web app initial load (dev HMR) | ~180ms | <2s prod |
| Database query (reports list) | <10ms | <50ms |
| Anonymous report cleanup | <100ms | — |

AI generation latency is the primary user-facing performance constraint. The assessment submission endpoint awaits the full AI response before redirecting. A loading screen with animated messaging and progress indicators manages user expectation during this window.

---

## 14. Testing & Quality

### 14.1 Input Validation

All API request bodies are validated server-side. Invalid requests return structured 400 errors.

### 14.2 AI UX Testing Framework

The admin dashboard includes an automated end-to-end AI evaluation system:

**8 built-in personas:**
- Urban Young Professional
- Rural Retiree
- Single Parent
- Recent Graduate
- Mid-Career Switcher
- Expat
- Freelancer
- Near-Retirement Worker

Each persona runs the full assessment pipeline. A separate AI evaluator scores each resulting report on quality, relevance, and empathy (0–10). A cross-persona summary report is generated at the end of each run. Live progress is streamed via SSE. Reports are exportable as Markdown or printable PDF.

### 14.3 End-to-End Testing

Playwright-based tests run against the full stack to validate assessment flow, results rendering, admin login, and GDPR data operations.

---

*Resilium Technical Specification — Version 2.0 — March 2026*
