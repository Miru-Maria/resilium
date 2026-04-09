# Overview

Resilium is a personal resilience planning platform designed to help users assess their preparedness for life's challenges. It provides a 10-step assessment, including a detailed Mental Resilience deep-dive, to generate an AI-powered Resilience Report. This report includes a personalized score (0–100), identifies vulnerabilities, proposes an action plan, simulates crisis scenarios, and suggests daily habits. The platform supports GDPR-compliant data management and offers a full admin dashboard for analytics, AI UX testing, consent management, and user administration. It operates on a freemium model, offering two free assessments, with Pro subscriptions available via Paddle for advanced features like scenario stress-tests and AI sub-steps.

# User Preferences

I prefer detailed explanations.
I want iterative development.
Ask before making major changes.
Do not make changes to the folder `lib/replit-auth-web/`.
Do not make changes to the file `artifacts/resilium-mobile/app/my-data.tsx`.
All copy should use "I/me" framing or impersonal language, not "we/our".
The project must use American English only (e.g., "paralyzed", "personalized", "organized", "color", "behavior").
The platform's narrative should avoid an HR/corporate angle, focusing instead on preppers, financially anxious individuals, expats/digital nomads, and the quietly cautious.

# System Architecture

## Application Structure

The project is a pnpm workspace monorepo using TypeScript, consisting of three main artifacts: `api-server` (Express API), `resilium` (React + Vite web frontend), and `resilium-mobile` (Expo React Native mobile app). Core libraries include `db` (Drizzle ORM), `replit-auth-web`, and `integrations-openai-ai-server`.

## Core User Flow

The user journey begins on the landing page, leading to a GDPR consent screen. Following consent, users complete a 14-step assessment, including a 10-question Mental Resilience deep-dive, covering areas like income stability, skills, health, and risk concerns. This culminates in an AI-generated Resilience Report displayed on the results page, which then guides users to a Strategic Action Plan—an interactive document with goal-headlined tasks, time horizons, AI sub-steps (Pro-gated), and curated resources. Authenticated users can access their report history and progress tracking via a profile page.

## Scoring Logic

The overall resilience score is derived from six weighted dimensions, each scored 0-100: Financial (25%), Skills (20%), Health (15%), Mobility (15%), Psychological (15%), and Resources (10%). The Psychological score is an average of 10 mental resilience sub-questions.

## Design

The platform features a permanent dark-only theme with a background color `#0D1225`, primary accent color `#E08040` (amber), and text color `#EAD9BE`. Custom CSS variables are defined in `:root`. A custom logo (`/logo.png` for web, `../assets/logo.png` for mobile) is used across the platform.

## Navigation Architecture

A single `GlobalNav` component in `App.tsx` renders as a `fixed top-0 z-[100]` bar on every non-admin, non-coaching page. It shows:
- Resilium logo linking to `/` (always at top-left)
- About / Demo / Pricing links (center, hidden on mobile)
- Auth state: animated user avatar + dropdown (My Plans, Account, Sign Out) when signed in, or a Sign In button when not — with a 3-second `authTimedOut` fallback for dev environments where Clerk won't load
- A `GlobalNavSpacer` sibling pushes page content 56px down to avoid overlap

Individual page headers contain only page-specific CTAs (e.g., "Build My Plan", print/share buttons). The `PageNav` component (`src/components/page-nav.tsx`) still exists but is no longer used — the GlobalNav is the single source of truth for navigation.

## Technical Implementations

- **Monorepo**: pnpm workspaces
- **Backend**: Node.js 24, Express 5, PostgreSQL with Drizzle ORM, Zod for validation.
- **Frontend**: React, Vite, Tailwind CSS, framer-motion, recharts.
- **Mobile**: Expo, React Native, Expo Router (tab + stack navigation), `@expo/vector-icons`, expo-haptics. Main screens (Home, Plans, Check-in, Account) live in `app/(tabs)/` with a persistent bottom tab bar. Flow screens (assessment, consent, results, sign-in, pricing, scenarios, about, coaching) remain as root stack screens.
- **AI**: OpenAI (gpt-5.2) via Replit AI Integrations. The AI generates structured JSON reports including risk summaries, vulnerabilities, action plans, scenario simulations, and daily habits, maintaining an intelligent, grounded, and empowering tone.
- **Authentication**: Clerk (`@clerk/react`, `@clerk/express`, `@clerk/expo`) handles user authentication across web and mobile. Production instance is live on `resilium-platform.com` with DNS CNAME records (`clerk.resilium-platform.com → frontend-api.clerk.services`). The Clerk publishable key is hardcoded in `artifacts/resilium/vite.config.ts` via a `define` block to prevent Replit's build process from overriding it with its own managed key.
- **GDPR**: Implemented with explicit consent mechanisms, data export, and deletion request functionalities. Anonymous reports are auto-deleted after 30 days.
- **Admin Dashboard**: Provides comprehensive analytics, GDPR management, consent logging, and AI UX testing capabilities. Access is protected by `ADMIN_USERNAME`/`ADMIN_PASSWORD` secrets.
- **Mobile Notifications**: Uses `expo-notifications` for local check-in notifications and registration for server-sent pushes. Push tokens are registered via authenticated `POST /api/push-tokens` (Clerk auth, fixed from legacy bug). Tokens are stored in `usersTable.pushToken`. Server-side cron sends pushes via Expo push API.
- **Rate Limiting**: `/api/resilience/assess` is rate-limited to 6 requests/min per IP for unauthenticated users.
- **Email Unsubscribe**: HMAC-SHA256 tokens (signed with `CLERK_SECRET_KEY`) power one-click unsubscribe. `GET /api/email/unsubscribe?uid=<userId>&sig=<token>` sets `users.emailOptOut=true`. All bulk emails include `List-Unsubscribe` headers and footer links. Cron jobs skip opted-out users.
- **Error Monitoring**: In-memory error rate tracking + admin email digest alerts (cron-based). Sentry is integrated across all three artifacts: `@sentry/react` (web, `src/main.tsx`), `@sentry/react-native` (mobile, `app/_layout.tsx`), and `@sentry/node` (API, `src/instrument.ts` + Express error handler in `src/app.ts`). Sentry is enabled only in production (`enabled: import.meta.env.PROD` on web, `enabled: !__DEV__` on mobile). Org slug: `resilium-5q` (dashboard: `https://resilium-5q.sentry.io/`). DSNs: web=`4511187672957008`, mobile=`4511187688816720`, api=`4511187305431120` (all under org `o4511187075923968`, ingest at `ingest.de.sentry.io`).
- **Welcome Email Trigger**: Fires on user's first `GET /api/users/me/subscription` request (first page load). Tracks with `usersTable.emailWelcomeSent`. Idempotent — existing users who missed it will receive it on next login.
- **Domain Redirect**: 301 redirect from `resilium-ai.replit.app` → `resilium-platform.com` in Express middleware. Also client-side redirect in `index.html` for web requests.

# External Dependencies

- **Database**: PostgreSQL (auto-provisioned by Replit)
- **AI Service**: OpenAI (gpt-5.2) via Replit AI Integrations
- **Authentication**: Clerk (for user authentication)
- **Payments/Subscriptions**: Paddle (for Pro subscriptions and donations)
- **Push Notifications**: Expo Notifications
- **Version Control**: GitHub (mirrored via Replit connector)