# Resilium: Full Technical Specification
## Version 1.0 — March 2026

---

## 1. System Overview

Resilium is a full-stack, multi-artifact monorepo application delivering personalised resilience assessment on web and mobile. The system is built as a pnpm workspace containing three deployed artifacts and three shared library packages.

### 1.1 Repository Structure

```
resilium/
├── artifacts/
│   ├── api-server/          # Express.js REST API (Node.js)
│   ├── resilium/            # React + Vite web application
│   └── resilium-mobile/     # Expo (React Native) mobile application
├── lib/
│   ├── db/                  # Drizzle ORM schema + migrations
│   ├── api-client-react/    # Auto-generated typed API client (React hooks)
│   └── integrations-*/      # AI provider integration wrappers
└── pnpm-workspace.yaml
```

### 1.2 Artifact Summary

| Artifact | Runtime | Port | Purpose |
|---|---|---|---|
| `api-server` | Node.js 20 | `$PORT` (8080 dev) | REST API, AI orchestration, auth, webhooks |
| `resilium` | Vite 7 / React 19 | `$PORT` (5173 dev) | Web frontend (SPA) |
| `resilium-mobile` | Expo SDK 53 | `$PORT` | React Native app (web + iOS + Android) |

---

## 2. Technology Stack

### 2.1 Backend

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js | 20 LTS |
| Framework | Fastify-style Express.js | 4.x |
| Language | TypeScript | 5.x |
| ORM | Drizzle ORM | 0.39.x |
| Database | PostgreSQL | 16 (Replit managed) |
| Session store | connect-pg-simple | pg-backed sessions |
| Authentication | Replit Auth (OpenID Connect / PKCE) | — |
| AI provider | OpenAI (GPT-4 class) via Replit AI Integrations proxy | gpt-4o |
| Logging | Pino + pino-http | 9.x |
| HTTP server | Fastify/Express | — |
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
| Type generation | Orval (OpenAPI → React hooks) | — |
| Payments | Paddle.js v2 (overlay checkout) | — |

### 2.3 Mobile

| Layer | Technology | Version |
|---|---|---|
| Framework | Expo | SDK 53 |
| React Native | React Native | 0.79.x |
| Navigation | Expo Router (file-based) | 6.x |
| Animations | React Native Reanimated | 3.x |
| Gradients | Expo Linear Gradient | — |
| SVG | react-native-svg | 15.x |
| Icons | @expo/vector-icons (Feather) | — |
| Fonts | Expo Google Fonts (Inter, Playfair Display) | — |

### 2.4 Shared Libraries

| Package | Purpose |
|---|---|
| `@workspace/db` | Drizzle schema, types, and database client |
| `@workspace/api-client-react` | Auto-generated typed React Query hooks from OpenAPI spec |
| `@workspace/api-zod` | Zod validation schemas shared between server and client |
| `@workspace/integrations-openai-ai-server` | OpenAI client wrapper via Replit AI proxy |

---

## 3. Database Schema

All tables use PostgreSQL via Drizzle ORM. Schema is pushed using `drizzle-kit push`.

### 3.1 Core Tables

#### `users`
```sql
id            VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()
email         VARCHAR UNIQUE
first_name    VARCHAR
last_name     VARCHAR
profile_image_url VARCHAR
created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
housing_type          TEXT NOT NULL               -- own | rent | family | shelter
has_emergency_supplies BOOLEAN NOT NULL
psychological_resilience REAL NOT NULL            -- 1–10 self-rating
risk_concerns         JSONB NOT NULL              -- string[]

-- Mental Resilience sub-scores (0–100 normalised)
mr_stress_tolerance   REAL
mr_adaptability       REAL
mr_learning_agility   REAL
mr_change_management  REAL
mr_emotional_regulation REAL
mr_social_support     REAL
mr_composite          REAL                        -- weighted average
mr_pathway            TEXT                        -- growth | compensation | null

-- Dimension scores (0–100)
score_overall         REAL NOT NULL
score_financial       REAL NOT NULL
score_health          REAL NOT NULL
score_skills          REAL NOT NULL
score_mobility        REAL NOT NULL
score_psychological   REAL NOT NULL
score_resources       REAL NOT NULL

-- AI-generated content
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

#### Additional Tables
- `gdpr_requests` — tracks data export/deletion requests with contact email and request type
- `feedback` — per-report star ratings and free-text comments
- `site_announcements` — admin-controlled platform-wide banners
- `ux_test_runs` / `ux_test_results` — AI persona-driven UX testing framework

---

## 4. API Specification

Base path: `/api`

Authentication: Replit Auth session cookie (`connect.sid`) or admin bearer token.

### 4.1 Assessment & Reports

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/resilience/assess` | Optional | Submit assessment, trigger AI scoring |
| `GET` | `/resilience/reports/:reportId` | Optional | Fetch report by public ID |
| `GET` | `/resilience/reports/:reportId/checklists` | Optional | Fetch checklist progress |
| `PATCH` | `/resilience/reports/:reportId/checklists/:area/:itemId` | Required | Toggle checklist item |

**POST `/resilience/assess` — Request body:**
```typescript
{
  location: string                  // free text geographic location
  currency: "USD" | "EUR" | "RON"
  incomeStability: "fixed" | "freelance" | "unstable"
  savingsMonths: number             // 0–36+
  hasDependents: boolean
  skills: SkillsItem[]             // multi-select enum
  healthStatus: "excellent" | "good" | "fair" | "poor"
  mobilityLevel: "high" | "medium" | "low"
  housingType: "own" | "rent" | "family" | "shelter"
  hasEmergencySupplies: boolean
  psychologicalResilience: number   // 1–10
  riskConcerns: RiskConcernsItem[]  // multi-select enum
  mentalResilienceAnswers: {
    stressTolerance1: 1|2|3|4|5
    stressTolerance2: 1|2|3|4|5
    adaptability1:    1|2|3|4|5
    adaptability2:    1|2|3|4|5
    learningAgility1: 1|2|3|4|5
    changeManagement1:1|2|3|4|5
    changeManagement2:1|2|3|4|5
    emotionalRegulation1: 1|2|3|4|5
    emotionalRegulation2: 1|2|3|4|5
    socialSupport1:   1|2|3|4|5
  }
}
```

**Rate limiting:** Anonymous users: 6 requests/60s. Authenticated users: unlimited.

### 4.2 User Management

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/users/me/plans` | Required | List user's saved plans |
| `DELETE` | `/users/me/plans/:reportId` | Required | Delete a specific plan |
| `DELETE` | `/users/me/plans` | Required | Delete all plans |
| `DELETE` | `/users/me` | Required | Full account deletion (GDPR) |
| `GET` | `/users/me/subscription` | Required | Current subscription status |
| `GET` | `/users/me/report-count` | Required | Count of saved reports |
| `GET` | `/users/me/export` | Required | Full data export (JSON) |
| `GET` | `/users/me/latest-checklist` | Required | Latest report's checklist data |
| `POST` | `/users/me/compare-plans` | Required | AI comparison of two plan IDs |

### 4.3 Authentication

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/auth/user` | Current session user |
| `GET` | `/auth/login` | Initiate Replit Auth OIDC flow |
| `GET` | `/auth/callback` | OIDC callback handler |
| `GET` | `/auth/logout` | Clear session |

### 4.4 Payments (Paddle)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/paddle/webhook` | Signature | Receive Paddle subscription events |

**Webhook events handled:**
- `subscription.activated` → set status `active`
- `subscription.updated` → update status and period end
- `subscription.cancelled` → set status `cancelled`
- `subscription.past_due` → set status `past_due`

**Signature verification:** HMAC-SHA256 over `{timestamp}:{rawBody}` using `PADDLE_WEBHOOK_SECRET`.

### 4.5 Admin (Bearer token required)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/admin/login` | Exchange credentials for JWT |
| `GET` | `/admin/session` | Validate token |
| `POST` | `/admin/logout` | Invalidate token |
| `GET` | `/admin/analytics` | Full platform analytics aggregate |
| `GET` | `/admin/users` | User table with plan counts |

### 4.6 Supporting Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/announcements` | Active site announcements |
| `POST` | `/admin/announcements` | Create announcement |
| `PATCH` | `/admin/announcements/:id` | Toggle active state |
| `DELETE` | `/admin/announcements/:id` | Delete announcement |
| `POST` | `/feedback` | Submit report feedback/rating |
| `POST` | `/gdpr/request` | Submit data request |
| `GET` | `/health` | Health check |

---

## 5. Scoring Methodology

Scoring is entirely deterministic. No AI is involved in score calculation. The algorithm runs server-side in `scoring.ts`.

### 5.1 Dimension Weights

| Dimension | Weight |
|---|---|
| Financial | 25% |
| Psychological | 20% |
| Health | 15% |
| Skills | 15% |
| Mobility | 15% |
| Resources | 10% |

### 5.2 Financial Score Components

- Savings depth (0–6 months: 0–60 points; 6–12 months: 60–85 points; 12+ months: 85–100 points)
- Income stability modifier: Fixed +10, Freelance 0, Unstable −15
- Dependents penalty: −10 if `hasDependents`
- Geographic cost-of-living adjustment applied based on location text

### 5.3 Mental Resilience Composite

The 10-question MRC assessment produces six sub-dimension scores:

```
stress_tolerance     = mean(stressTolerance1, stressTolerance2) / 5 × 100
adaptability         = mean(adaptability1, adaptability2) / 5 × 100
learning_agility     = learningAgility1 / 5 × 100
change_management    = mean(changeManagement1, changeManagement2) / 5 × 100
emotional_regulation = mean(emotionalRegulation1, emotionalRegulation2) / 5 × 100
social_support       = socialSupport1 / 5 × 100

MRC = (stress_tolerance × 0.20) +
      (adaptability × 0.20) +
      (learning_agility × 0.15) +
      (change_management × 0.15) +
      (emotional_regulation × 0.20) +
      (social_support × 0.10)
```

**Pathway classification:**
- `growth`: MRC ≥ 70 — user has headroom for challenge
- `compensation`: MRC < 70 — user should focus on stabilisation before expansion
- `null`: insufficient data

The MRC feeds into the psychological dimension score alongside the self-rated resilience score (weighted 60% MRC, 40% self-rating).

### 5.4 Overall Score

```
overall = (financial × 0.25) + (psychological × 0.20) +
          (health × 0.15) + (skills × 0.15) +
          (mobility × 0.15) + (resources × 0.10)
```

All scores are clamped to [0, 100].

---

## 6. AI Pipeline

### 6.1 Architecture

The AI layer uses OpenAI's GPT-4o model via Replit's AI Integrations proxy, which handles API key management and billing. The server never stores or exposes the raw API key.

### 6.2 Report Generation Flow

```
1. Score calculation (deterministic, ~1ms)
2. Prompt construction from score context + input data
3. OpenAI API call (streaming not used; full response awaited)
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

### 6.3 AI Prompt Design

The system prompt establishes Resilium as a personal resilience advisor. The user prompt injects:
- All six dimension scores and sub-scores
- The MRC score and pathway classification
- Geographic context (location)
- Key vulnerability flags derived from inputs
- Currency preference (affects financial framing)

The prompt instructs the model to produce responses in a specific JSON schema, validated server-side before storage. Malformed AI responses trigger a retry (max 2 attempts).

### 6.4 Plan Comparison AI

A separate AI call handles the `POST /users/me/compare-plans` endpoint. Two full report objects are provided to the model, which produces a comparative analysis identifying improvements, regressions, and recommended next steps between two assessment dates.

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

Session cookies are `HttpOnly`, `Secure` (production), `SameSite: lax`, and expire after 24 hours.

### 7.2 Admin Authentication

Admin routes use a separate JWT-based system:
- Credentials (`ADMIN_USERNAME`, `ADMIN_PASSWORD`) stored as environment secrets
- Successful login returns a signed JWT bearer token
- All admin routes validate the token via `Authorization: Bearer {token}` header
- Tokens expire after 8 hours

### 7.3 Paddle Webhook Security

All Paddle webhook payloads are verified via HMAC-SHA256 signature before processing:

```typescript
const signed = `${timestamp}:${rawBody}`;
const expected = createHmac("sha256", PADDLE_WEBHOOK_SECRET)
  .update(signed)
  .digest("hex");
assert(expected === h1); // from Paddle-Signature header
```

Raw request body is captured before JSON parsing to ensure signature integrity.

### 7.4 Rate Limiting

Anonymous assessment submissions are rate-limited to 6 per minute per IP. Authenticated users bypass this limit. Admin login attempts are not explicitly rate-limited but require credential match.

---

## 8. Freemium Access Control

### 8.1 Anonymous Users

Assessment count tracked in browser `localStorage` under key `resilium_free_count`. On the client, if count ≥ 2, the assessment page renders a paywall screen before any form elements are shown. The backend enforces no hard limit on anonymous submissions (rate limiting provides the guard), as anonymous reports are auto-purged after 30 days.

### 8.2 Authenticated Users (No Subscription)

On assessment page load, two parallel API calls are made:
- `GET /api/users/me/subscription` — returns `{ isActive: boolean, status: string }`
- `GET /api/users/me/report-count` — returns `{ count: number }`

If `!isActive && count >= 2`, the paywall screen is shown. Gate fails open (on API error, user is allowed through).

### 8.3 Authenticated Users (Active Subscription)

`isActive: true` (status `active` or `cancel_scheduled`) bypasses all frontend gates. The backend also skips the `PLAN_LIMIT` check for subscribers when processing assessment submissions.

### 8.4 Plan Storage Limit

Non-subscribing authenticated users are limited to 10 stored plans (`PLAN_LIMIT = 10`). This backend check occurs on every `POST /resilience/assess` for authenticated requests. Active subscribers are exempt.

---

## 9. Frontend Architecture

### 9.1 Web Application

The React SPA uses Wouter for lightweight client-side routing. All routes are registered in `App.tsx`:

| Route | Component | Auth required |
|---|---|---|
| `/` | `LandingPage` | No |
| `/assess` | `AssessmentPage` | No (gated) |
| `/results/:reportId` | `ResultsPage` | No |
| `/profile` | `ProfilePage` | Yes |
| `/pricing` | `PricingPage` | No |
| `/about` | `AboutPage` | No |
| `/privacy` | `PrivacyPage` | No |
| `/admin/*` | Admin pages | Admin JWT |

TanStack React Query manages all server state with a shared `QueryClient`. The API client is auto-generated from the OpenAPI specification using Orval, providing fully typed request/response hooks.

### 9.2 Assessment Flow

The assessment is a single-page multi-step form with 11 steps:

- **Step 1:** Mental Resilience Assessment (10 sub-questions with `mrStep` sub-counter)
- **Steps 2–11:** Geographic, financial, health, skills, housing, supplies, psychological, and risk questions

State is managed via React `useState` with a single `formData` object. Progress is calculated as a proportion of total sub-steps (MR questions + remaining steps). Navigation is animated via Framer Motion `AnimatePresence`.

### 9.3 Profile Architecture

The Profile page implements a 4-tab architecture:

1. **Overview** — Score summary cards, trend line chart (Recharts), most-improved / focus-area highlights
2. **Plans** — Plan cards with individual deletion, compare mode (select 2 → AI analysis modal)
3. **Checklist** — Persistent per-item progress loaded from DB, collapsible by area
4. **Account** — GDPR export, reminder preferences, danger zone (delete all plans, delete account)

### 9.4 Admin Dashboard

Admin pages use a shared `AdminLayout` component (sidebar navigation, authentication check, JWT management) and cover:

- Analytics dashboard (Recharts bar/line/pie/radar charts)
- User management table
- Announcements management
- GDPR request log
- Consent log
- AI UX testing runner (dispatches persona-based assessment runs)

---

## 10. Mobile Application

### 10.1 Architecture

The Expo app uses file-based routing via Expo Router. Key screens:

| File | Route | Description |
|---|---|---|
| `app/index.tsx` | `/` | Landing / home screen |
| `app/assessment.tsx` | `/assessment` | Multi-step assessment form |
| `app/results.tsx` | `/results` | Report display screen |

### 10.2 Design System

The mobile app implements a custom design system independent of the web's shadcn/ui, using native React Native components styled inline. Core design tokens:

```typescript
const colors = {
  background: "#0D1225",    // deep navy
  primary: "#E08040",       // orange brand
  primaryDark: "#C06820",
  card: "#141928",
  text: "#E8EAF2",
  textMuted: "#6B7280",
  success: "#10B981",
}
```

Typography uses Inter (body) and Playfair Display (headings) loaded via Expo Google Fonts.

### 10.3 Neural Network Animation

The landing screen features a procedurally animated SVG neural network rendered via `react-native-svg`:

- 22 particles with randomised initial positions and velocities
- Connection lines drawn between particles within `min(w,h) × 0.45` distance
- Animation runs at 20fps cap via `requestAnimationFrame`
- Positioned absolutely behind hero content with `pointerEvents="none"`
- Responsive: measures hero section via `onLayout` and scales to fill

### 10.4 Assessment (Mobile)

The mobile assessment mirrors the web assessment data model exactly, posting to the same `POST /api/resilience/assess` endpoint. Differences from web:

- Flat `ScrollView`-based layout rather than the web's fixed-height animated cards
- Touch-optimised input components (large tap targets, native pickers)
- Results navigated to via Expo Router `router.push('/results')`

---

## 11. Data Privacy & GDPR

### 11.1 Data Classification

| Data Type | Retention | Deletion path |
|---|---|---|
| Anonymous reports | 30 days | Auto-purged by cron job on API startup |
| Authenticated reports | Until user deletion | `DELETE /api/users/me` or `DELETE /api/users/me/plans` |
| Session data | 24 hours | Automatic expiry |
| GDPR requests | Indefinite (legal record) | Manual admin action |
| Subscription records | Until account deletion | Cascade on user delete |

### 11.2 Automated Cleanup

On API server startup and every 24 hours:
```typescript
db.delete(resilienceReportsTable).where(
  and(isNull(userId), lt(createdAt, thirtyDaysAgo))
)
```

### 11.3 User Data Export

`GET /api/users/me/export` returns a complete JSON object containing:
- User profile data
- All resilience reports (full objects)
- Checklist progress
- Subscription status
- GDPR request history

Delivered as `application/json` with `Content-Disposition: attachment` for browser download.

### 11.4 Account Deletion

`DELETE /api/users/me` performs:
1. Delete all resilience reports (cascades to checklist progress)
2. Delete subscription record
3. Delete user record (cascades to sessions)

All operations within a single transaction where possible.

---

## 12. Infrastructure & Deployment

### 12.1 Deployment Platform

Resilium is deployed on Replit's managed cloud infrastructure:

- **Compute:** Managed containerised execution environment
- **Database:** Replit-managed PostgreSQL 16 (accessed via `DATABASE_URL`)
- **TLS:** Automatic TLS termination at edge (mTLS for preview, full TLS in production)
- **CDN:** Replit edge proxy handles routing and caching
- **Domain:** `*.replit.app` with custom domain support

### 12.2 Environment Variables

| Variable | Scope | Required | Purpose |
|---|---|---|---|
| `DATABASE_URL` | Shared | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Shared | Yes | Express session signing key |
| `ADMIN_USERNAME` | Shared | Yes | Admin panel credentials |
| `ADMIN_PASSWORD` | Shared | Yes | Admin panel credentials |
| `VITE_PADDLE_CLIENT_TOKEN` | Shared | For payments | Paddle.js frontend token |
| `VITE_PADDLE_PRICE_ID` | Shared | For payments | Monthly subscription price ID |
| `VITE_PADDLE_PRICE_ID_ANNUAL` | Shared | For payments | Annual subscription price ID |
| `PADDLE_WEBHOOK_SECRET` | Shared | For payments | Webhook signature verification |
| `STRIPE_DONATION_URL` | Shared | No | Optional donation link |

### 12.3 Build Process

**API Server:** TypeScript source transpiled and bundled via esbuild into a single `dist/index.mjs`. Source maps generated for production debugging. Bundle size: ~2.7MB (includes all dependencies).

**Web app:** Vite production build with tree-shaking, code splitting, and asset fingerprinting. `BASE_URL` injected at build time for path-prefixed proxy routing.

**Mobile app:** Expo web build via Metro bundler for web deployment. Native builds (iOS/Android) via EAS Build (external to Replit).

### 12.4 Database Migrations

Schema changes are applied using Drizzle Kit's push mode:
```bash
cd lib/db && pnpm run push-force
# Executes: drizzle-kit push --force --config ./drizzle.config.ts
```

No manual SQL migrations are written. The Drizzle schema is the single source of truth.

---

## 13. Performance Characteristics

| Metric | Observed | Target |
|---|---|---|
| API cold start | ~843ms (esbuild bundle) | <2s |
| Assessment AI generation | 8–15s | <20s |
| Web app initial load (dev) | ~180ms HMR | <2s prod |
| Database query (reports list) | <10ms | <50ms |
| Anonymous report cleanup | <100ms | — |

AI generation latency is the primary user-facing performance constraint. The assessment submission endpoint streams no partial results; the full report is awaited before redirect. A loading state with animated messaging manages user expectation during this window.

---

## 14. Testing & Quality

### 14.1 Input Validation

All API inputs are validated using Zod schemas defined in `@workspace/api-zod`. Validation errors return structured `VALIDATION_ERROR` responses with field-level detail.

### 14.2 Error Handling

All API routes use try/catch with Pino logger error recording. Client receives typed error codes (`PLAN_LIMIT_EXCEEDED`, `RATE_LIMITED`, `VALIDATION_ERROR`, `UNAUTHORIZED`) enabling typed client-side error handling.

### 14.3 AI Response Validation

AI-generated report content is validated structurally before database insertion. If the AI returns malformed JSON or fails schema validation, a retry is attempted (max 2). Persistent failure returns a 500 with a user-facing message.

---

## 15. Roadmap

| Priority | Feature | Status |
|---|---|---|
| High | Paddle payment integration | In progress (credentials pending) |
| High | Mobile auth parity (sign in from app) | Planned |
| Medium | Email notification on plan milestone | Planned |
| Medium | Employer/team dashboard | Planned |
| Medium | API access for institutional partners | Planned |
| Low | iOS/Android native distribution (EAS Build) | Planned |
| Low | Webhooks for third-party integrations | Planned |

---

*Document version: 1.0*
*Last updated: March 2026*
*Platform: Resilium v1.0 (production)*
