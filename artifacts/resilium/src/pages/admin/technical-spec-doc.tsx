const VERSION = "3.1";
const DATE = "April 2026";

const BACKEND_STACK = [
  { layer: "Runtime", tech: "Node.js 24 LTS" },
  { layer: "Framework", tech: "Express 5.x" },
  { layer: "Language", tech: "TypeScript 5.9.x" },
  { layer: "ORM", tech: "Drizzle ORM 0.39.x" },
  { layer: "Database", tech: "PostgreSQL 16 (Replit managed)" },
  { layer: "Session store", tech: "connect-pg-simple (pg-backed sessions)" },
  { layer: "Authentication", tech: "Clerk (JWT via @clerk/express)" },
  { layer: "AI — reports", tech: "gpt-5.4 via Replit AI Integrations proxy" },
  { layer: "AI — Companion", tech: "gpt-4.1-mini via Replit AI Integrations proxy" },
  { layer: "Email", tech: "Resend API" },
  { layer: "Error monitoring", tech: "Sentry (@sentry/node)" },
  { layer: "Rate limiting", tech: "express-rate-limit 7.x" },
  { layer: "Build", tech: "esbuild (custom build.mjs)" },
];

const FRONTEND_STACK = [
  { layer: "Framework", tech: "React 19.x" },
  { layer: "Build tool", tech: "Vite 7.x" },
  { layer: "Routing", tech: "Wouter 3.x" },
  { layer: "State / data", tech: "TanStack React Query 5.x" },
  { layer: "UI components", tech: "shadcn/ui (Radix UI primitives)" },
  { layer: "Styling", tech: "Tailwind CSS 4.x" },
  { layer: "Animation", tech: "Framer Motion 12.x" },
  { layer: "Charts", tech: "Recharts 2.x" },
  { layer: "Icons", tech: "Lucide React" },
  { layer: "Payments", tech: "Stripe (server-side Checkout Sessions)" },
  { layer: "Auth", tech: "Clerk React SDK (@clerk/react)" },
  { layer: "Error monitoring", tech: "Sentry (@sentry/react)" },
];

const MOBILE_STACK = [
  { layer: "Framework", tech: "Expo SDK 53" },
  { layer: "React Native", tech: "0.79.x" },
  { layer: "Navigation", tech: "Expo Router 6.x (file-based)" },
  { layer: "Animations", tech: "React Native Reanimated 3.x" },
  { layer: "Auth", tech: "Clerk Expo SDK (@clerk/clerk-expo)" },
  { layer: "Notifications", tech: "expo-notifications" },
  { layer: "Haptics", tech: "expo-haptics" },
  { layer: "Gradients", tech: "Expo Linear Gradient" },
  { layer: "SVG", tech: "react-native-svg 15.x" },
  { layer: "Icons", tech: "@expo/vector-icons (Feather)" },
  { layer: "Fonts", tech: "Expo Google Fonts (Inter, Playfair Display)" },
  { layer: "Error monitoring", tech: "Sentry (@sentry/react-native)" },
];

const DB_TABLES = [
  { name: "users", desc: "User accounts (Clerk userId as PK). Upserted on every authenticated request." },
  { name: "sessions", desc: "express-session PostgreSQL store. Indexed on expire." },
  { name: "resilience_reports", desc: "Core report: inputs, six dimension scores, MRC sub-scores, pathway, and all AI-generated JSONB fields." },
  { name: "subscriptions", desc: "Stripe subscription state per user: status, stripeCustomerId, stripeSubscriptionId, current_period_end." },
  { name: "checklist_progress", desc: "Per-report, per-area checklist item completion (boolean + timestamp)." },
  { name: "progress_snapshots", desc: "Historical score snapshots per report — enables longitudinal trend chart." },
  { name: "challenge_progress", desc: "Per-user 30-day resilience challenge: day number, completion, action_text, dimension." },
  { name: "push_tokens", desc: "Expo push tokens per session for server-initiated notifications (iOS + web)." },
  { name: "gdpr_consent", desc: "Versioned consent records with session ID, version string, and timestamp." },
  { name: "gdpr_requests", desc: "Data export and deletion requests with contact email and request type." },
  { name: "gdpr_admin_actions", desc: "Audit trail of all admin GDPR actions (fulfill, delete, export)." },
  { name: "feedback", desc: "Per-report star ratings and free-text comments." },
  { name: "site_announcements", desc: "Admin-controlled platform-wide banners with active toggle." },
  { name: "ux_test_runs / ux_test_results", desc: "AI persona UX testing framework — run metadata and per-persona score results." },
  { name: "admin_audit_log", desc: "Append-only record of all admin actions: logins (success/fail), logouts, password changes, manual backup triggers, and GDPR actions. Includes IP and user-agent." },
];

const WEB_ROUTES = [
  { route: "/", auth: "No", desc: "Landing page — hero, value proposition, sign-in" },
  { route: "/about", auth: "No", desc: "About Resilium" },
  { route: "/demo", auth: "No", desc: "Static fictional demo report for 'Alex M.'" },
  { route: "/pricing", auth: "No", desc: "Pro plan pricing and comparison" },
  { route: "/consent", auth: "No", desc: "GDPR consent capture before assessment" },
  { route: "/assess", auth: "No (gated)", desc: "14-step assessment — gated at 3 free" },
  { route: "/results/:reportId", auth: "No", desc: "Full AI report, radar chart, checklists, feedback" },
  { route: "/plan/:reportId", auth: "Pro", desc: "Saved action plan view (offline-capable for Pro)" },
  { route: "/scenarios/:reportId", auth: "Pro", desc: "Scenario stress-test runner" },
  { route: "/coaching", auth: "No", desc: "Phoenix Insight Coaching referral" },
  { route: "/profile", auth: "Yes", desc: "Saved reports, progress tracking, account settings" },
  { route: "/sign-in / /sign-up", auth: "No", desc: "Clerk sign-in and sign-up pages" },
  { route: "/privacy / /terms / /refund", auth: "No", desc: "Legal pages" },
  { route: "/admin/login", auth: "No", desc: "Admin login" },
  { route: "/admin/dashboard", auth: "Admin", desc: "Analytics overview (6 tabs)" },
  { route: "/admin/analytics", auth: "Admin", desc: "KPI cards, 12-month trends, dimension averages, funnel" },
  { route: "/admin/users", auth: "Admin", desc: "User management" },
  { route: "/admin/announcements", auth: "Admin", desc: "Site announcement management" },
  { route: "/admin/testimonials", auth: "Admin", desc: "Testimonials management" },
  { route: "/admin/marketing", auth: "Admin", desc: "Marketing tools" },
  { route: "/admin/documents", auth: "Admin", desc: "Document management" },
  { route: "/admin/security", auth: "Admin", desc: "Security settings" },
  { route: "/admin/monitoring", auth: "Admin", desc: "System monitoring" },
  { route: "/admin/ux-testing", auth: "Admin", desc: "AI persona UX testing" },
  { route: "/admin/mobile", auth: "Admin", desc: "Mobile analytics" },
  { route: "/admin/gdpr", auth: "Admin", desc: "GDPR request management" },
  { route: "/admin/consent-log", auth: "Admin", desc: "Consent audit trail" },
];

const ENV_VARS = [
  { name: "DATABASE_URL", scope: "API", req: "Yes", desc: "PostgreSQL connection string" },
  { name: "SESSION_SECRET", scope: "API", req: "Yes", desc: "Express session signing key" },
  { name: "CLERK_SECRET_KEY", scope: "API", req: "Yes", desc: "Clerk server-side secret key" },
  { name: "CLERK_PUBLISHABLE_KEY", scope: "API", req: "Yes", desc: "Clerk publishable key (@clerk/express)" },
  { name: "VITE_CLERK_PUBLISHABLE_KEY", scope: "Web", req: "Yes", desc: "Clerk publishable key for React SDK" },
  { name: "ADMIN_USERNAME / ADMIN_PASSWORD", scope: "API", req: "Yes", desc: "Admin panel credentials" },
  { name: "STRIPE_SECRET_KEY", scope: "API", req: "Payments", desc: "Stripe secret API key (sk_live_... in production, sk_test_... in sandbox)" },
  { name: "STRIPE_PUBLISHABLE_KEY", scope: "API/Web", req: "Payments", desc: "Stripe publishable key — used for client-side Stripe.js if needed" },
  { name: "STRIPE_WEBHOOK_SECRET", scope: "API", req: "Payments", desc: "Stripe webhook signing secret (whsec_...) — verifies event authenticity" },
  { name: "RESEND_API_KEY", scope: "API", req: "Email", desc: "Resend email delivery API key" },
  { name: "AI_INTEGRATIONS_OPENAI_BASE_URL", scope: "API", req: "Yes", desc: "Auto-provisioned by Replit AI Integrations" },
  { name: "AI_INTEGRATIONS_OPENAI_API_KEY", scope: "API", req: "Yes", desc: "Auto-provisioned by Replit AI Integrations" },
  { name: "DEFAULT_OBJECT_STORAGE_BUCKET_ID", scope: "API", req: "Backups", desc: "Replit Object Storage bucket ID — used for daily automated DB backups (stored as JSON, 7-day retention)" },
  { name: "REPLIT_DOMAINS", scope: "Shared", req: "Yes", desc: "Auto-provisioned by Replit" },
];

const SCORING = [
  { dim: "Financial", weight: "25%", inputs: "Income stability (+10–40), savings months (+0–40), dependents (+5 or +20)" },
  { dim: "Skills", weight: "20%", inputs: "Survival +25, Digital/Physical/Medical +20 each, Financial/Language +15 each; capped at 100" },
  { dim: "Health", weight: "15%", inputs: "Health status (+10–60), medical skill (+20), base (+20)" },
  { dim: "Mobility", weight: "15%", inputs: "Mobility level (+10–50), housing type (+15–40), no dependents (+10)" },
  { dim: "Psychological", weight: "15%", inputs: "MRC composite (mean of 6 sub-scores, normalised 0–100)" },
  { dim: "Resources", weight: "10%", inputs: "Emergency supplies (+50), survival skill (+30), financial skill (+20)" },
];

const PERF = [
  { metric: "API cold start", observed: "~843ms (esbuild bundle)", target: "<2s" },
  { metric: "Assessment AI generation", observed: "8–15s", target: "<20s" },
  { metric: "Web app initial load (dev HMR)", observed: "~180ms", target: "<2s prod" },
  { metric: "Database query (reports list)", observed: "<10ms", target: "<50ms" },
  { metric: "Anonymous report cleanup", observed: "<100ms", target: "—" },
];

const NAVS = ["overview", "stack", "database", "routes", "scoring", "ai-pipeline", "auth", "deployment", "performance"];

export default function TechnicalSpecDoc() {
  return (
    <div className="min-h-screen bg-[#F7F7FA] font-sans">
      <div className="bg-[#0D1225] text-white px-8 py-5 flex items-center justify-between sticky top-0 z-50 shadow-xl">
        <div>
          <span className="text-[#E08040] font-bold text-lg tracking-tight">Resilium</span>
          <span className="text-gray-400 text-sm ml-3">Technical Specification v{VERSION} · {DATE}</span>
        </div>
        <span className="text-xs text-gray-500 hidden sm:block">Confidential · Internal</span>
      </div>

      <nav className="bg-white border-b border-gray-200 px-8 py-2 flex gap-6 text-xs font-medium text-gray-500 overflow-x-auto">
        {NAVS.map(id => (
          <a key={id} href={`#${id}`} className="hover:text-[#E08040] whitespace-nowrap transition-colors capitalize">
            {id.replace(/-/g, " ")}
          </a>
        ))}
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-14">

        <section id="overview">
          <div className="bg-[#0D1225] rounded-2xl p-8 mb-8">
            <p className="text-[#EAD9BE] text-xs uppercase tracking-widest mb-2">Version {VERSION} · {DATE}</p>
            <h1 className="text-3xl font-bold text-white mb-3">Resilium: Full Technical Specification</h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              Full-stack, multi-artifact monorepo (pnpm workspace) containing three deployed artifacts and one shared library package.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0D1225] text-white">
                  <th className="text-left px-4 py-3 font-semibold text-sm">Artifact</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm">Runtime</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm">Port</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { art: "api-server", rt: "Node.js 24", port: "$PORT (8080 dev)", desc: "REST API, AI orchestration, auth, webhooks, email, cron" },
                  { art: "resilium", rt: "Vite 7 / React 19", port: "$PORT (5173 dev)", desc: "Web frontend (SPA)" },
                  { art: "resilium-mobile", rt: "Expo SDK 53", port: "$PORT", desc: "React Native app — iOS + web only" },
                ].map((a, i) => (
                  <tr key={a.art} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    <td className="px-4 py-3 font-bold text-[#E08040] text-xs font-mono">{a.art}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{a.rt}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs font-mono">{a.port}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{a.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="stack">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Technology Stack</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[
              { title: "Backend (API Server)", rows: BACKEND_STACK },
              { title: "Frontend (Web)", rows: FRONTEND_STACK },
              { title: "Mobile (iOS + web)", rows: MOBILE_STACK },
            ].map(g => (
              <div key={g.title} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-[#0D1225] text-white px-4 py-3">
                  <span className="text-sm font-semibold">{g.title}</span>
                </div>
                <table className="w-full text-xs">
                  <tbody>
                    {g.rows.map((r, i) => (
                      <tr key={r.layer} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                        <td className="px-3 py-2 text-gray-500 font-medium whitespace-nowrap w-28">{r.layer}</td>
                        <td className="px-3 py-2 text-gray-800">{r.tech}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </section>

        <section id="database">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Database Schema</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-3" />
          <p className="text-xs text-gray-500 mb-6">PostgreSQL 16 · Drizzle ORM · Schema pushed via <code className="bg-gray-100 px-1 rounded text-[10px]">drizzle-kit push</code> · Drizzle schema is the single source of truth.</p>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0D1225] text-white">
                  <th className="text-left px-4 py-3 font-semibold text-sm">Table</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm">Description</th>
                </tr>
              </thead>
              <tbody>
                {DB_TABLES.map((t, i) => (
                  <tr key={t.name} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    <td className="px-4 py-3 font-bold text-[#E08040] text-xs font-mono whitespace-nowrap">{t.name}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs leading-snug">{t.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mt-4">
            <div className="text-xs font-bold text-gray-900 mb-2">Data Retention Policy</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { type: "Anonymous reports", ret: "30 days — auto-purged on startup + 24-hour cron" },
                { type: "Authenticated reports", ret: "Until user deletion (DELETE /api/users/me)" },
                { type: "Session data", ret: "24 hours — automatic expiry" },
                { type: "Consent & GDPR records", ret: "Indefinite (legal record)" },
                { type: "Subscription records", ret: "Until account deletion (cascade)" },
                { type: "Push tokens", ret: "Until session deletion (cascade)" },
                { type: "Admin audit log", ret: "Indefinite (security record — all admin actions logged)" },
                { type: "DB snapshots (Object Storage)", ret: "7 days — auto-pruned by backup cron; JSON format" },
              ].map(r => (
                <div key={r.type} className="flex gap-2 items-start text-xs">
                  <span className="mt-1 w-1 h-1 rounded-full bg-[#E08040] flex-shrink-0" />
                  <span><span className="font-semibold text-gray-800">{r.type}:</span> <span className="text-gray-600">{r.ret}</span></span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="routes">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Web Application Routes</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-6" />
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0D1225] text-white">
                  <th className="text-left px-4 py-3 font-semibold text-sm">Route</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm w-20">Auth</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm">Description</th>
                </tr>
              </thead>
              <tbody>
                {WEB_ROUTES.map((r, i) => (
                  <tr key={r.route} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    <td className="px-4 py-3 font-mono text-xs text-[#E08040] whitespace-nowrap">{r.route}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        r.auth === "Admin" ? "bg-indigo-100 text-indigo-700" :
                        r.auth === "Yes" || r.auth === "Pro" ? "bg-orange-100 text-orange-700" :
                        "bg-gray-100 text-gray-500"
                      }`}>{r.auth}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs leading-snug">{r.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="scoring">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Scoring Methodology</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-3" />
          <p className="text-xs text-gray-500 mb-6">All scoring is fully deterministic. No AI is involved in score calculation. The algorithm runs server-side in <code className="bg-gray-100 px-1 rounded text-[10px]">scoring.ts</code>. All scores clamped to [0, 100].</p>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0D1225] text-white">
                  <th className="text-left px-4 py-3 font-semibold text-sm">Dimension</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm w-16">Weight</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm">Inputs & Contribution</th>
                </tr>
              </thead>
              <tbody>
                {SCORING.map((s, i) => (
                  <tr key={s.dim} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    <td className="px-4 py-3 font-bold text-[#E08040] text-xs">{s.dim}</td>
                    <td className="px-4 py-3 font-bold text-gray-900 text-xs">{s.weight}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs leading-snug">{s.inputs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="text-xs font-bold text-gray-900 mb-2">Psychological Modifier (Compensation Pathway)</div>
              <p className="text-xs text-gray-600 leading-relaxed mb-2">When MRC &lt; 60, Financial and Skills scores are multiplied by:</p>
              <code className="text-xs bg-gray-100 rounded p-2 block font-mono text-gray-800">modifier = 0.85 + (MRC / 60) × 0.15<br />MRC=0 → 0.85 (−15%)<br />MRC=59 → ≈0.998 (negligible)</code>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="text-xs font-bold text-gray-900 mb-2">Overall Score Formula</div>
              <code className="text-xs bg-gray-100 rounded p-2 block font-mono text-gray-800">overall =<br />  (financial × mod × 0.25) +<br />  (health × 0.15) +<br />  (skills × mod × 0.20) +<br />  (mobility × 0.15) +<br />  (psychological × 0.15) +<br />  (resources × 0.10)</code>
            </div>
          </div>
        </section>

        <section id="ai-pipeline">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">AI Pipeline</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {[
              { model: "gpt-5.4", const: "MAIN_MODEL", role: "Report generation", desc: "Full resilience narrative, vulnerability analysis, action plan, daily habits, and scenario stress-test simulations. Full response awaited (not streamed). Max 2 retry attempts on malformed JSON." },
              { model: "gpt-4.1-mini", const: "MINI_MODEL", role: "AI Companion", desc: "Conversational responses for Pro users asking follow-up questions about their scores, habits, or action items. Session-scoped, lower cost per token, faster response latency." },
            ].map(m => (
              <div key={m.model} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-bold text-gray-900 text-sm font-mono">{m.model}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">{m.role}</span>
                </div>
                <code className="text-[10px] text-gray-500 font-mono block mb-2">{m.const}</code>
                <p className="text-xs text-gray-600 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="text-xs font-bold text-gray-900 mb-3">Report Generation Flow</div>
            <ol className="space-y-2">
              {[
                "Score calculation (deterministic, ~1ms)",
                "Prompt construction from score context + input data + MRC pathway",
                "gpt-5.4 API call (full response awaited; not streamed)",
                "Response parsed into structured JSON: riskProfileSummary, topVulnerabilities, actionPlan, scenarioSimulations, dailyHabits, checklistsByArea, recommendedResources",
                "Full structured report written to database",
                "Report ID returned to client → redirect to /results/:reportId",
              ].map((step, i) => (
                <li key={i} className="flex gap-3 items-start text-xs">
                  <span className="w-5 h-5 rounded-full bg-[#E08040] text-white flex items-center justify-center flex-shrink-0 text-[10px] font-bold">{i + 1}</span>
                  <span className="text-gray-600 leading-snug">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="auth">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Authentication & Security</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title: "User Auth — Clerk", items: ["Web: @clerk/react SDK — ClerkProvider, SignIn, SignUp, useAuth(), useUser()", "API: @clerk/express middleware verifies JWTs on every authenticated request", "Mobile: @clerk/clerk-expo SDK, session token exchanged via POST /api/auth/mobile-token", "User records upserted into users table using Clerk userId as primary key", "Session cookies: HttpOnly, Secure (prod), SameSite: lax, 24-hour TTL"] },
              { title: "Admin Auth", items: ["Credentials from ADMIN_USERNAME / ADMIN_PASSWORD environment secrets", "Successful login sets a signed httpOnly cookie (admin_sess) — never accessible to JavaScript", "All /api/admin/* routes validate the admin cookie via requireAdminSession middleware", "Admin sessions expire after 24 hours", "All admin actions (login, logout, password changes, backups, GDPR) are appended to the admin_audit_log table with IP + user-agent", "Content Security Policy: default-src 'none' on API; strict per-source CSP on web frontend (Clerk, Sentry, Google Fonts only)", "security.txt at /.well-known/security.txt with responsible disclosure policy"] },
              { title: "Stripe Webhook Security", items: ["Stripe-Signature header verified using STRIPE_WEBHOOK_SECRET (whsec_...)", "Raw request body captured before JSON parsing to ensure signature integrity", "Invalid signatures → 400 rejection", "Handles: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted", "Rate limiting: 6 assessments/min per IP for anonymous users (express-rate-limit)"] },
            ].map(s => (
              <div key={s.title} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="font-bold text-gray-900 text-xs mb-3">{s.title}</div>
                <ul className="space-y-1.5">
                  {s.items.map(item => (
                    <li key={item} className="flex gap-2 items-start text-xs text-gray-600">
                      <span className="mt-1 w-1 h-1 rounded-full bg-[#E08040] flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="deployment">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Deployment & Environment</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-6" />
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Environment Variables</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0D1225] text-white">
                  <th className="text-left px-4 py-3 font-semibold text-sm">Variable</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm w-16">Scope</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm w-20">Required</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {ENV_VARS.map((v, i) => (
                  <tr key={v.name} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    <td className="px-4 py-3 font-mono text-[10px] text-gray-800 whitespace-nowrap">{v.name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{v.scope}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${v.req === "Yes" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"}`}>{v.req}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{v.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="performance">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Performance Characteristics</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-6" />
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0D1225] text-white">
                  <th className="text-left px-4 py-3 font-semibold text-sm">Metric</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm">Observed</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm">Target</th>
                </tr>
              </thead>
              <tbody>
                {PERF.map((p, i) => (
                  <tr key={p.metric} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    <td className="px-4 py-3 text-gray-800 text-xs font-medium">{p.metric}</td>
                    <td className="px-4 py-3 font-bold text-[#E08040] text-xs">{p.observed}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">
            AI generation latency is the primary user-facing performance constraint. A loading screen with animated messaging and progress indicators manages user expectation during this window.
          </p>
        </section>

      </div>
    </div>
  );
}
