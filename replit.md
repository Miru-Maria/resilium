# Workspace

## Overview

**Resilium** — An AI-powered personal resilience planning system that generates customized "Resilience Reports" for users in under 15 minutes.

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, Tailwind CSS, framer-motion, recharts
- **AI**: OpenAI via Replit AI Integrations (gpt-5.2)

## Application Architecture

### Core User Flow
1. Landing page → compelling "You're one disruption away from chaos" hero
2. 10-step assessment questionnaire (location, income, savings, dependents, skills, health, housing, emergency supplies, psychological resilience, risk concerns)
3. AI-generated Resilience Report with score 0-100, vulnerabilities, action plan
4. Dashboard with score visualization, scenario simulations, daily habits

### Scoring Logic
Six dimensions, each 0-100:
- **Financial** (25% weight): Income stability + savings runway + dependents
- **Skills** (20% weight): Digital, physical, survival, medical, financial, language skills
- **Health** (15% weight): Health status + medical skills
- **Mobility** (15% weight): Mobility level + housing type + dependents
- **Psychological** (15% weight): Self-rated psychological resilience
- **Resources** (10% weight): Emergency supplies + survival/financial skills

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── resilium/           # React + Vite frontend (main app, previewPath: /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   └── integrations-openai-ai-server/  # OpenAI AI client via Replit integrations
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── tsconfig.json
```

## Database Schema

### `resilience_reports` table
Stores all user assessment inputs and generated report data:
- Input fields: location, incomeStability, savingsMonths, hasDependents, skills (jsonb), healthStatus, mobilityLevel, housingType, hasEmergencySupplies, psychologicalResilience, riskConcerns (jsonb)
- Score fields: scoreOverall, scoreFinancial, scoreHealth, scoreSkills, scoreMobility, scorePsychological, scoreResources
- Report fields: riskProfileSummary, topVulnerabilities (jsonb), actionPlan (jsonb), scenarioSimulations (jsonb), dailyHabits (jsonb)

## API Routes

- `GET /api/healthz` — Health check
- `POST /api/resilience/assess` — Submit assessment, receive AI-generated report
- `GET /api/resilience/reports/:reportId` — Retrieve saved report

## AI Integration

Uses Replit AI Integrations (OpenAI gpt-5.2 model). The AI:
1. Takes user's profile + calculated scores
2. Generates structured JSON: riskProfileSummary, topVulnerabilities, actionPlan (3 timeframes), scenarioSimulations (for top risk concerns), dailyHabits
3. Voice: intelligent, grounded, strategic, empowering (not alarmist)

## Frontend Pages

- `/` — Landing page with hero CTA
- `/assess` — Multi-step assessment form (10 steps with progress bar)
- `/results` — Dashboard showing report: circular score, radar chart, vulnerabilities, action plan, scenarios, habits

## Environment Variables

- `DATABASE_URL`, `PGHOST`, etc. — Auto-provisioned by Replit PostgreSQL
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — Auto-provisioned by Replit AI Integrations
- `AI_INTEGRATIONS_OPENAI_API_KEY` — Auto-provisioned by Replit AI Integrations
- `PORT` — Auto-assigned per artifact by Replit

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all lib packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/resilium` (`@workspace/resilium`)

React + Vite frontend served at `/`. Includes:
- `framer-motion` for animations
- `recharts` for score visualization
- `@workspace/api-client-react` for generated API hooks

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes in `src/routes/`:
- `health.ts` — health check
- `resilience/index.ts` — assessment and report endpoints
- `resilience/scoring.ts` — deterministic scoring logic
- `resilience/ai.ts` — OpenAI report generation

### `lib/integrations-openai-ai-server` (`@workspace/integrations-openai-ai-server`)

Pre-configured OpenAI SDK client via Replit AI Integrations. No API key needed.

### `lib/db` (`@workspace/db`)

Drizzle ORM with PostgreSQL. Schema in `src/schema/resilience.ts`.
- `pnpm --filter @workspace/db run push` — sync schema to database
