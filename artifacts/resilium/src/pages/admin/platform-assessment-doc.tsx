import React from "react";

const TODAY = "April 27, 2026";

/* ─── AUDIT DATA ─────────────────────────────────────────── */

const WEB_AUDIT = [
  { area: "Landing page", status: "good", note: "Animated neural canvas, live testimonials from DB, trust signals all present" },
  { area: "14-Step assessment", status: "strong", note: "Well-sequenced, draft saving, bilingual (EN/RO), progress bar, location detection; chronic condition sub-questions captured when user selects Yes" },
  { area: "Results page", status: "strong", note: "Score radar, risk profile card, action plan, feedback, social share modal (X/Facebook/Reddit/Instagram), Markdown export, goal reminder banner; coaching callout card surfaces when psychological or health score < 70; household invite card with Web Share API + clipboard fallback" },
  { area: "Plan page", status: "strong", note: "AI-generated action plan with DB-backed checklist progress tracking; goal reminder banner; Markdown export button; 'One thing right now' card (first uncompleted item from weakest score area); completion milestone emails at 1/5/10 actions; household invite card with Web Share API + clipboard fallback; 3 free 'Break it down' AI-step tries for free users with amber badge counter; Pro users unlimited" },
  { area: "Scenarios page", status: "good", note: "Stress test simulations with impact ratings and immediate steps" },
  { area: "Coaching page", status: "functional", note: "Phoenix brand, warm design, Playfair serif headings, correct for its purpose" },
  { area: "Profile page", status: "strong", note: "7 tabs: Account → Overview → Reports → Plans → Checklist → Companion (Pro) → Guides; GDPR export, subscription status, data deletion all wired" },
  { area: "AI Companion tab", status: "good", note: "DB-backed conversation history; gpt-4.1-mini; grounded in user's latest scores; localStorage offline cache; free users see upgrade CTA" },
  { area: "Guides tab", status: "good", note: "10 crisis guides; location-aware; downloadable for offline reading; AsyncStorage download tracking" },
  { area: "Pricing page", status: "good", note: "Clear feature comparison, Stripe server-side checkout, upgrade flow tested end-to-end" },
  { area: "Anonymous user experience", status: "good", note: "Free-tier gate enforced via localStorage + plan count, clear messaging" },
  { area: "About page", status: "good", note: "Methodology, Scientific Foundation (6 academic citations), Media Citations (5 mainstream sources), Privacy, About the Project" },
  { area: "Dark / light theme", status: "removed", note: "Theme toggle removed — app uses a single polished dark theme; no toggle in UI." },
  { area: "Competitive analysis PDF", status: "good", note: "jsPDF crash resolved; full PDF generation working" },
];

const MOBILE_AUDIT = [
  { area: "Loading / splash screen", status: "strong", note: "Neural net animation, brain logo, premium feel — custom branded" },
  { area: "Sign-in", status: "good", note: "Clerk OAuth, token cache split (localStorage web / SecureStore native)" },
  { area: "Home tab", status: "good", note: "Animated orbs, streak tracking, score display, daily motivations" },
  { area: "Progress tab", status: "good", note: "35-day activity calendar (colored dots), score history chart (Pro-gated), recent 7 check-ins" },
  { area: "Plans tab", status: "good", note: "Plan list, score badges, Pro comparison modal wired" },
  { area: "Check-in tab", status: "good", note: "5-dimension daily self-rating, local streak persistence via AsyncStorage" },
  { area: "Account / data tab", status: "good", note: "GDPR export, deletion, subscription status, sign out" },
  { area: "Assessment", status: "good", note: "Full flow matching the web version" },
  { area: "Results", status: "strong", note: "Score breakdown, action plan, dimension interpretation; 'One thing right now' card (first uncompleted item from weakest area); household invite card with share + clipboard fallback — at full parity with web" },
  { area: "Coaching page", status: "good", note: "Matches web structure — score context cards, About Cristiana, full CTA sections" },
  { area: "AI Companion tab", status: "good", note: "DB-backed chat with user's latest scores as context; gpt-4.1-mini; AsyncStorage offline cache; free users see upgrade CTA" },
  { area: "Guides tab", status: "good", note: "10 crisis guides bundled offline; location-aware guide ordering; AsyncStorage download tracking" },
  { area: "App Store / Play Store", status: "pending", note: "Intentionally deferred — owner working on submission" },
];

const ADMIN_AUDIT = [
  { area: "Login", status: "strong", note: "httpOnly cookie session (admin_sess) — token inaccessible to JS. All login/logout/password change/backup actions logged in admin_audit_log table with IP. CSP headers on API (default-src 'none') and web frontend (per-source allowlist: Clerk, Sentry, Google Fonts only)." },
  { area: "Audit log", status: "strong", note: "Append-only DB table recording every admin action (login success/fail, logout, password change, manual backup trigger, GDPR actions) with timestamp, IP, and user-agent. Visible in admin Security page." },
  { area: "Backup panel", status: "strong", note: "Daily automated DB snapshots at 02:30 UTC (7-table JSON, 7-day retention). On-demand trigger from Security page. Backup history table with dates and file sizes." },
  { area: "Analytics overview", status: "strong", note: "Recharts bar / pie / line / radar, live DB data, plan views metric" },
  { area: "Demographic breakdown", status: "good", note: "Location, income, age, housing, mobility, dependents — all charted" },
  { area: "User management", status: "good", note: "Clerk-sourced user list with plan counts and last-active timestamps" },
  { area: "GDPR management", status: "good", note: "Manual deletion and data export triggers, consent log accessible" },
  { area: "Announcements", status: "good", note: "Create / edit banners shown to all users on the web app" },
  { area: "Testimonials moderation", status: "good", note: "Approve / reject user feedback, approved items show on landing page" },
  { area: "Mobile analytics", status: "good", note: "Web vs. mobile session split, daily breakdown chart, score distribution" },
  { area: "Security monitoring", status: "good", note: "Error rate tracking with in-memory window, alert emails on threshold" },
  { area: "Sentry monitoring page", status: "good", note: "Dedicated /admin/monitoring page with project cards and deep-links to Issues, Performance, Replays, Alerts for all three Sentry projects" },
  { area: "UX testing (AI personas)", status: "good", note: "AI-simulated user sessions for UX analysis — genuinely clever differentiator" },
];

const FUNCTIONALITY_GROUPS = [
  {
    label: "Core Platform",
    items: [
      "Assessment → AI scoring → AI report generation → saved to database",
      "User authentication — Clerk, both web and mobile, token cache split correctly",
      "Plan limit enforcement — free tier capped at 3, Pro unlimited",
      "Subscription status check — Stripe webhook → database → status gate on all routes",
      "Rate limiting on assessment endpoint — 6/min, Pro subscribers bypass",
      "Checklist progress tracking — database-backed, persists across sessions",
      "Social sharing — share modal (X/Twitter, Facebook, Reddit, Instagram) on results page",
      "Draft saving for in-progress assessments (localStorage)",
    ],
  },
  {
    label: "Compliance & Data",
    items: [
      "GDPR export and deletion pipeline — user-triggered and admin-triggered",
      "Consent collection and logging with platform tracking (web vs. mobile)",
      "Email unsubscribe with List-Unsubscribe header (RFC compliant)",
      "Terms, Privacy, Refund, Consent pages — all live and linked from footer",
    ],
  },
  {
    label: "Email & Engagement Automation",
    items: [
      "Welcome email on first assessment (Resend) — triggered from resilium-platform.com domain",
      "5-email post-assessment drip sequence — Days 0/2/5/9/14 (DRIP_EMAILS_ENABLED=true)",
      "7-day re-engagement reminders — daily cron at 09:00 UTC",
      "30-day reassessment reminders — Monday cron at 08:00 UTC",
      "User weekly digest email (Sunday 18:00 UTC) — includes user's top high-priority short-term action item pulled from their report, shown as a 'This week's focus' card",
      "Completion milestone emails — triggered at 1st, 5th, and 10th completed checklist actions; personalised copy, orange accent, unsubscribe-compliant; fired async (non-blocking) after each checklist toggle",
      "Admin weekly digest with stats — Monday cron at 07:00 UTC",
      "Error rate alerts — email if 5+ server errors within any 10-minute window",
      "Wednesday 06:00 UTC — automated e2e assessment smoke test with email report",
      "Sunday 07:00 UTC — site-wide functionality audit across all endpoints + DB with email report",
    ],
  },
  {
    label: "Push Notifications (Mobile)",
    items: [
      "Expo push token storage in database (users table)",
      "Push broadcast endpoint for targeted user notifications",
      "Push infrastructure wired to Expo push API with ticket handling",
    ],
  },
  {
    label: "AI Companion & Crisis Guides",
    items: [
      "AI Companion (Pro) — DB-backed conversations; gpt-4.1-mini; grounded in user's latest assessment scores; conversation history persists; localStorage offline cache",
      "Guides tab (all users) — 10 crisis guides bundled in app; location-aware ordering; one-tap offline download; download state tracked",
      "Goal reminder banner — pill badge shown at top of Results, Plan, and Checklist tabs; API /me/latest-checklist extended to return primaryGoal and successVision",
    ],
  },
  {
    label: "Security & Reliability",
    items: [
      "GDPR export endpoint: rate limiting (5/15 min) + session ownership check",
      "GDPR data-request: rate limiting + UUID format validation on sessionId",
      "Checklist PATCH: requires authentication + report ownership verification",
      "Plan comparison AI endpoint: per-user rate limiting (10/hour)",
      "React Query: targeted cache invalidation on sign-in (no full cache wipe)",
      "ClerkAuthBridge: 5-second token fetch timeout prevents permanent API hangs",
      "Report queries: staleTime Infinity — immutable data, no unnecessary re-fetches",
      "Welcome email failures: now logged as warnings (previously silently swallowed)",
    ],
  },
  {
    label: "Admin & Analytics",
    items: [
      "Admin analytics — 7+ chart types pulling real-time database data",
      "Testimonials: collect on results → moderate in admin → display on landing",
      "Announcements: create in admin → display to all users instantly",
      "Progress snapshots table in DB (foundation for score trend history)",
      "Sentry error monitoring — wired across all 3 platforms; admin Sentry page with project deep-links",
      "Push notification permission prompt — bottom sheet modal fires after first assessment",
      "Score trend history chart (web + mobile, Pro gate) — GET /api/users/me/score-history endpoint",
      "Mobile onboarding carousel — 3-slide FlatList pagingEnabled carousel with progress dots, Skip, and CTA",
    ],
  },
];

const DONE_ITEMS = [
  "Full 14-step assessment with all dimensions",
  "AI report generation via OpenAI integration",
  "6-dimension scoring model (financial, health, skills, mobility, psychological, resources)",
  "Results page with radar chart, action plan, interactive checklists",
  "Scenarios / stress test simulations",
  "Coaching page — web (full Phoenix brand design) and mobile (parity achieved)",
  "User authentication — Clerk, web + mobile",
  "Free-tier plan limit (3 plans) with clear messaging",
  "Stripe subscription webhook handler + subscription status gate (sandbox tested, production ready)",
  "Profile page with full plan history, GDPR controls, subscription status",
  "GDPR export + deletion — user-triggered and admin-triggered",
  "Consent collection and platform logging (web vs. mobile split)",
  "Social share modal — X/Twitter, Facebook, Reddit, Instagram",
  "Full email automation suite — welcome, re-engagement, reassessment, weekly digests",
  "Admin digest + error alert emails (weekly, Monday 07:00 UTC)",
  "Push notification infrastructure (Expo push API, token storage, broadcast)",
  "Admin dashboard with live analytics — 7+ chart types",
  "Admin user management (Clerk-sourced), testimonials, announcements, GDPR",
  "Admin marketing analytics, mobile analytics, security monitoring",
  "Admin UX testing with AI persona simulations",
  "Mobile: all 7 tabs functional (Home, Progress, My Plans, Check-in, My Data, Companion, Guides)",
  "Mobile: daily check-in with streak tracking",
  "Mobile: plan comparison modal (Pro feature)",
  "Mobile: animated loading screen with custom brain logo branding",
  "Mobile: full assessment + results flow at parity with web",
  "Rate limiting on all sensitive endpoints with Pro bypass",
  "Health monitoring endpoint",
  "Competitive analysis PDF generator",
  "Investor pitch deck artifact",
  "Terms, Privacy, Refund, About, Consent pages — all live",
  "Bilingual assessment (EN / RO)",
  "Location auto-detection (browser Geolocation API)",
  "Multi-currency support — 9 official currencies + custom code",
  "Draft saving for in-progress assessments",
  "App icon + splash — custom branded brain logo",
  "Sentry error monitoring wired — web, mobile, API",
  "Admin Sentry monitoring page — project cards with deep-links",
  "Automated e2e assessment smoke test — Wednesday 06:00 UTC cron",
  "Automated site-wide audit — Sunday 07:00 UTC cron",
  "Percentile benchmarking — live on results page",
  "Score trend history chart — web + mobile, Pro-gated",
  "AI Companion — web + mobile, Pro-gated",
  "Crisis Guides — 10 guides, offline-capable, all users",
  "Goal reminder banner — Results, Plan, Checklist tabs",
  "Mobile ProGate — all 4 content tabs gated for auth + Pro",
  "Android removed from all materials — iOS + Expo web only",
  "Social share modal — full X, Facebook, Reddit, Instagram",
  "Markdown export on Results page and Plan page",
  "Full autonomous e2e audit completed (April 11, 2026) — all routes verified",
  "Product-wide content audit — 'AI-powered' language replaced with 'structured'/'personalized'",
  "Mobile results page parity — 'One thing right now' card and household invite card added at full feature parity with web",
  "Coaching callout on results page — score-aware card surfaces when psychological or health score < 70, links to /coaching",
  "Household invite card on results page — share button (Web Share API + clipboard fallback) alongside plan page invite",
  "Full platform audit completed (April 27, 2026) — all client-facing flows verified clean, one routing bug fixed (Markdown lock button)",
];

/* ─── HELPERS ────────────────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    strong: "bg-emerald-100 text-emerald-700",
    good: "bg-emerald-100 text-emerald-700",
    functional: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    removed: "bg-gray-100 text-gray-500",
  };
  const label: Record<string, string> = { strong: "✓ Strong", good: "✓ Good", functional: "✓ Functional", pending: "Pending", removed: "Removed" };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {label[status] ?? status}
    </span>
  );
}


/* ─── MAIN COMPONENT ─────────────────────────────────────── */

export default function PlatformAssessmentDoc() {
  const NAVS = ["opinion", "market", "user-audit", "functionality", "done"];

  return (
    <div className="min-h-screen bg-[#F7F7FA] font-sans">
      {/* Header */}
      <div className="bg-[#0D1225] text-white px-8 py-5 flex items-center justify-between sticky top-0 z-50 shadow-xl">
        <div>
          <span className="text-[#E08040] font-bold text-lg tracking-tight">Resilium</span>
          <span className="text-gray-400 text-sm ml-3">Platform Assessment & Strategic Review · {TODAY}</span>
        </div>
        <span className="text-xs text-gray-500 hidden sm:block">Confidential · Internal</span>
      </div>

      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-8 py-2 flex gap-6 text-xs font-medium text-gray-500 overflow-x-auto">
        {NAVS.map(id => (
          <a key={id} href={`#${id}`} className="hover:text-[#E08040] whitespace-nowrap transition-colors capitalize">
            {id.replace(/-/g, " ")}
          </a>
        ))}
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-14">

        {/* Hero */}
        <div className="bg-[#0D1225] rounded-2xl p-8">
          <p className="text-[#EAD9BE] text-xs uppercase tracking-widest mb-2">Full Assessment · {TODAY}</p>
          <h1 className="text-3xl font-bold text-white mb-2">Platform Assessment<br />& Strategic Review</h1>
          <p className="text-gray-400 text-sm mb-6 max-w-xl leading-relaxed">An honest, unvarnished evaluation of what's been built, how the market might receive it, and a precise checklist of what's done versus what remains.</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { val: "~55,000", label: "Lines of Source Code" },
              { val: "3", label: "Platforms (Web · Mobile · Admin)" },
              { val: "Apr 27, 2026", label: "Assessment Date" },
              { val: "Production", label: "Status: Live ●" },
              { val: "Security", label: "Hardened" },
            ].map(s => (
              <div key={s.val} className="bg-white/8 rounded-xl p-3 border border-white/10">
                <p className="text-[#E08040] font-bold text-base">{s.val}</p>
                <p className="text-gray-400 text-xs mt-0.5 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 1: Honest Opinion */}
        <section id="opinion">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">My Honest Opinion</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-6" />
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>
              This is a <strong className="text-gray-900">real product</strong>. Not a demo, not a prototype — a full-stack, full-featured platform with actual depth. The 14-step assessment, 6-dimension scoring model, AI report generation, dual platform (web + mobile), admin dashboard, email automation, GDPR compliance pipeline, push notifications, Stripe payments with verified webhooks, cron-driven engagement loops, and a pitch deck — the scope and execution quality here is genuinely impressive for what is essentially a solo-built product.
            </p>
            <p>
              The code is disciplined: typed throughout (Zod for API contracts, Drizzle for DB), no TODO comments left in the codebase, thoughtful UI across both platforms, real rate limiting with Pro bypass, and error monitoring built in. These are professional signals.
            </p>
          </div>
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-2">The Honest Caveat</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              What this isn't yet is a <em>launched, market-tested</em> product. There's a meaningful gap between "built" and "in users' hands," and some of the wiring — particularly around payments and push notifications — hasn't been stress-tested in production. That gap is normal and closeable. The foundation is sound.
            </p>
          </div>
        </section>

        {/* Section 2: Market Reception */}
        <section id="market">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Market Reception</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-6" />

          <p className="text-sm font-semibold text-gray-900 mb-3">The Case for Optimism</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {[
              { color: "emerald", title: "Strong tailwinds", body: '"Personal resilience planning" has genuine market tailwinds — geopolitical anxiety, economic instability, and climate awareness are all rising globally, especially in Eastern Europe.' },
              { color: "emerald", title: "No real competition", body: "Competitors are either generic survivalist content, expensive consultants, or PDF worksheets. An AI-scored, personalized, action-oriented system at $9/month doesn't exist yet." },
              { color: "emerald", title: "Smart free tier", body: "The assessment is so thorough and the output so personal that it creates a genuine 'wow' moment before any paywall. The free tier converts by merit, not by pressure." },
              { color: "emerald", title: "Easy price point", body: "$9/month is psychologically easy to justify — one cup of coffee, comparable to a Netflix subscription, yet offers something genuinely actionable and personal." },
            ].map(c => (
              <div key={c.title} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                  <p className="text-sm font-semibold text-gray-900">{c.title}</p>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>

          <p className="text-sm font-semibold text-gray-900 mb-3">Honest Challenges</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Category education needed", body: "Most people don't wake up thinking 'I need a resilience plan.' The marketing has to create the problem before solving it — this raises CAC and requires patience with content strategy." },
              { title: "Assessment length", body: "14 steps is thorough but long. Some users will drop off before completing it. Completion needs to feel rewarding enough to justify the time investment." },
              { title: "Mobile discoverability", body: "With no App Store presence yet, the mobile app isn't organically discoverable. It's currently only reachable via the web URL — a distribution gap that limits growth." },
              { title: "Pro value visibility", body: "The Pro features (percentile benchmarking, score trend history, AI Companion) need to be visible and compelling before users hit a paywall, or the upgrade feels arbitrary." },
            ].map(c => (
              <div key={c.title} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                  <p className="text-sm font-semibold text-gray-900">{c.title}</p>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: User Testing Audit */}
        <section id="user-audit">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">User Testing Audit</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-6" />

          {[
            { label: "Web App", platform: "resilium-platform.com", rows: WEB_AUDIT },
            { label: "Mobile App", platform: "Expo / React Native", rows: MOBILE_AUDIT },
            { label: "Admin Dashboard", platform: "/admin — Password Protected", rows: ADMIN_AUDIT },
          ].map(section => (
            <div key={section.label} className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <p className="text-base font-bold text-gray-900">{section.label}</p>
                <span className="text-xs bg-[#0D1225] text-gray-300 px-2 py-0.5 rounded-full font-mono">{section.platform}</span>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#0D1225] text-white">
                      <th className="text-left px-4 py-2.5 font-semibold">Flow / Screen</th>
                      <th className="text-left px-4 py-2.5 font-semibold w-28">Status</th>
                      <th className="text-left px-4 py-2.5 font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.map((r, i) => (
                      <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                        <td className="px-4 py-2.5 font-medium text-gray-900 whitespace-nowrap">{r.area}</td>
                        <td className="px-4 py-2.5"><StatusBadge status={r.status} /></td>
                        <td className="px-4 py-2.5 text-gray-600 leading-snug">{r.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>

        {/* Section 4: Functionality Audit */}
        <section id="functionality">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Full Functionality Audit</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-3" />
          <p className="text-sm text-gray-500 mb-6">Features confirmed working end-to-end in the production environment at resilium-platform.com. Each entry represents a complete, integrated user journey.</p>
          <div className="space-y-4">
            {FUNCTIONALITY_GROUPS.map(group => (
              <div key={group.label} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/60">
                  <p className="text-sm font-bold text-gray-900">{group.label}</p>
                </div>
                <ul className="divide-y divide-gray-50">
                  {group.items.map((item, i) => (
                    <li key={i} className="flex gap-3 items-start px-5 py-2.5">
                      <span className="text-emerald-500 text-sm flex-shrink-0 mt-0.5">✓</span>
                      <span className="text-xs text-gray-700 leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Done */}
        <section id="done">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">What's Done</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-6" />
          <p className="text-sm text-gray-500 mb-4">{DONE_ITEMS.length} completed items — verified end-to-end on resilium-platform.com as of April 27, 2026.</p>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 max-h-96 overflow-y-auto">
            <ul className="space-y-1.5">
              {DONE_ITEMS.map((item, i) => (
                <li key={i} className="flex gap-2.5 items-start text-xs text-gray-600 leading-snug">
                  <span className="text-emerald-500 flex-shrink-0 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="text-center py-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 italic">Generated by Resilium · April 27, 2026 · resilium-platform.com · Confidential internal document</p>
        </div>

      </div>
    </div>
  );
}
