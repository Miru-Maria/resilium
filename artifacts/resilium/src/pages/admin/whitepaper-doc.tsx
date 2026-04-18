const TODAY = "April 2026";

const DIMENSIONS = [
  { name: "Financial Resilience", weight: "25%", desc: "Savings depth in months of runway, income stability classification, and dependency load. The most immediately survival-critical dimension." },
  { name: "Skills Resilience", weight: "20%", desc: "Breadth of transferable skills across digital, physical, survival, medical, financial, and language competencies." },
  { name: "Health Resilience", weight: "15%", desc: "Self-reported health status and medical skill possession. Poor health reduces resilience ceiling regardless of financial strength." },
  { name: "Mobility Resilience", weight: "15%", desc: "Ability to relocate and access transportation, informed by mobility level, housing type, and dependency constraints." },
  { name: "Psychological Resilience", weight: "15%", desc: "10-question MRC across stress tolerance, adaptability, learning agility, change management, emotional regulation, and social support." },
  { name: "Resource Resilience", weight: "10%", desc: "Emergency supply depth, survival skill possession, and financial skill backup. First line of practical defence in any disruption scenario." },
];

const MR_SUBDIMS = [
  { dim: "Stress Tolerance", questions: "2 (averaged)" },
  { dim: "Adaptability", questions: "2 (averaged)" },
  { dim: "Learning Agility", questions: "1" },
  { dim: "Change Management", questions: "2 (averaged)" },
  { dim: "Emotional Regulation", questions: "2 (averaged)" },
  { dim: "Social Support", questions: "1" },
];

const MARKET = [
  { segment: "Personal finance & wellness apps", size: "$11.4B", cagr: "14%" },
  { segment: "Mental health & wellbeing platforms", size: "$6.2B", cagr: "18%" },
  { segment: "Emergency preparedness products & services", size: "$3.8B", cagr: "9%" },
  { segment: "Online education & skills development", size: "$185B", cagr: "13%" },
];

const COMPETITORS = [
  { name: "Ready.gov / FEMA portals", gap: "Government, generic, no personalisation, no AI" },
  { name: "Life360 / Prepared", gap: "Family safety, location-focused, no assessment layer" },
  { name: "BetterUp / Calm", gap: "Psychological dimension only, no financial or logistical factors" },
  { name: "Personal Capital / YNAB", gap: "Financial only, no preparedness dimension" },
];

const ECONOMICS = [
  { metric: "Free → Pro conversion rate", conservative: "2%", base: "5%", optimistic: "10%" },
  { metric: "Monthly Pro churn", conservative: "8%", base: "5%", optimistic: "3%" },
  { metric: "Avg revenue per user (annual)", conservative: "$79", base: "$99", optimistic: "$108" },
  { metric: "LTV at base case churn", conservative: "$198", base: "$297", optimistic: "$540" },
];

const SCENARIOS = ["Job Loss", "Natural Disaster", "Health Crisis", "Relocation"];

const NAVS = ["executive-summary", "problem", "solution", "market", "business-model", "privacy", "platform", "impact"];

export default function WhitepaperDoc() {
  return (
    <div className="min-h-screen bg-[#F7F7FA] font-sans">
      <div className="bg-[#0D1225] text-white px-8 py-5 flex items-center justify-between sticky top-0 z-50 shadow-xl">
        <div>
          <span className="text-[#E08040] font-bold text-lg tracking-tight">Resilium</span>
          <span className="text-gray-400 text-sm ml-3">White Paper · {TODAY}</span>
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

        <section id="executive-summary">
          <div className="bg-[#0D1225] rounded-2xl p-8 mb-8">
            <p className="text-[#EAD9BE] text-xs uppercase tracking-widest mb-2">{TODAY}</p>
            <h1 className="text-3xl font-bold text-white mb-3">Resilium: Personal Resilience Planning</h1>
            <p className="text-gray-400 text-sm leading-relaxed max-w-3xl">
              A full-stack personal resilience platform that quantifies an individual's readiness across six critical life dimensions and delivers a personalised, actionable improvement roadmap. Unlike generic preparedness checklists or single-domain financial planning tools, Resilium combines validated psychological assessment methodology, transparent deterministic scoring, AI-powered narrative generation, and continuous progress tracking into a single, privacy-first platform available on both web and mobile.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { stat: "68%", label: "Americans couldn't cover a $1,000 expense from savings", src: "Federal Reserve, 2024" },
              { stat: "<40%", label: "of households have an emergency supply kit", src: "FEMA, 2023" },
              { stat: "54%", label: "report high stress when facing unexpected life changes", src: "APA, 2024" },
              { stat: "19%", label: "of workers have skills highly adaptable to automation", src: "McKinsey Global Institute" },
            ].map(s => (
              <div key={s.stat} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="text-2xl font-black text-[#E08040] mb-1">{s.stat}</div>
                <div className="text-xs text-gray-700 leading-snug mb-2">{s.label}</div>
                <div className="text-[10px] text-gray-400">{s.src}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="problem">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">1. The Problem: The Resilience Gap</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-6" />
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
            <h3 className="text-base font-bold text-gray-900 mb-3">Existing Tools Are Inadequate</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0D1225] text-white">
                    <th className="text-left px-4 py-3 font-semibold text-sm">Tool Category</th>
                    <th className="text-left px-4 py-3 font-semibold text-sm">Coverage</th>
                    <th className="text-left px-4 py-3 font-semibold text-sm">Gaps</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { cat: "Financial advisors", cov: "Financial savings, investments", gap: "No psychological or logistical assessment" },
                    { cat: "Emergency preparedness guides", cov: "Physical supplies, evacuation plans", gap: "No personalisation, no progress tracking" },
                    { cat: "Mental health apps", cov: "Psychological wellbeing", gap: "No integration with material factors" },
                    { cat: "HR resilience training", cov: "Workplace-specific coping", gap: "No personal or family dimension" },
                    { cat: "Government preparedness portals", cov: "Generic checklists", gap: "No AI reasoning, no action prioritisation" },
                  ].map((r, i) => (
                    <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                      <td className="px-4 py-3 font-semibold text-gray-900 text-xs">{r.cat}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{r.cov}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{r.gap}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-orange-50 border border-[#E08040]/30 rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#E08040] mb-2">Key Insight</p>
            <p className="text-sm text-gray-700">No existing tool integrates all six dimensions of resilience into a single, continuous, personalised assessment and improvement system. Beyond material vulnerability, unpreparedness has documented psychological effects — chronic anxiety about financial fragility, housing insecurity, and health uncertainty are leading contributors to stress-related illness and reduced cognitive performance.</p>
          </div>
        </section>

        <section id="solution">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">2. The Solution: Resilium</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-6" />

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">Report Outputs</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: "Overall Resilience Score", desc: "0–100 composite and six dimensional sub-scores" },
                { title: "Risk Profile Narrative", desc: "Plain language, tailored to psychological pathway (Growth or Compensation)" },
                { title: "Top Vulnerability Identification", desc: "Specific factors most likely to cause failure under stress, with severity ratings" },
                { title: "Prioritised Action Plan", desc: "Short, mid, and long-term milestones per dimension" },
                { title: "Scenario Stress-Tests (Pro)", desc: "Job loss, natural disaster, health crisis, relocation — impact delta + recovery steps" },
                { title: "Domain Checklists & Habits", desc: "Persistent completion tracking + daily habits personalised to weak areas and pathway" },
                { title: "AI Companion (Pro)", desc: "Context-aware conversational guidance powered by gpt-4.1-mini, drawing from actual scores" },
                { title: "30-Day Challenge", desc: "Curated action bank weighted toward the user's weakest dimensions; progress ring" },
              ].map(o => (
                <div key={o.title} className="flex gap-3 items-start p-3 rounded-xl bg-gray-50">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E08040] mt-1.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-gray-900">{o.title}</div>
                    <div className="text-xs text-gray-500 leading-snug">{o.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">The Six Resilience Dimensions</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0D1225] text-white">
                  <th className="text-left px-4 py-3 font-semibold text-sm">Dimension</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm w-16">Weight</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm">Description</th>
                </tr>
              </thead>
              <tbody>
                {DIMENSIONS.map((d, i) => (
                  <tr key={d.name} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    <td className="px-4 py-3 font-bold text-[#E08040] text-xs whitespace-nowrap">{d.name}</td>
                    <td className="px-4 py-3 font-bold text-gray-900 text-xs">{d.weight}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs leading-snug">{d.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
            <h3 className="text-base font-bold text-gray-900 mb-1">Mental Resilience Assessment (MRC)</h3>
            <p className="text-xs text-gray-500 mb-4">10-question structured evaluation across six validated sub-dimensions. Each question rated 1–5 behavioural frequency. The MRC is the equal-weighted mean of all sub-scores, normalised to 0–100.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0D1225] text-white">
                    <th className="text-left px-4 py-3 font-semibold text-sm">Sub-Dimension</th>
                    <th className="text-left px-4 py-3 font-semibold text-sm">Questions</th>
                  </tr>
                </thead>
                <tbody>
                  {MR_SUBDIMS.map((r, i) => (
                    <tr key={r.dim} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                      <td className="px-4 py-3 font-semibold text-gray-900 text-xs">{r.dim}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{r.questions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="text-xs font-bold text-emerald-700 mb-1">Growth Pathway (MRC ≥ 60)</div>
                <div className="text-xs text-gray-600">Challenge-oriented language; ambitious action plan; longer-horizon goals.</div>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <div className="text-xs font-bold text-indigo-700 mb-1">Compensation Pathway (MRC &lt; 60)</div>
                <div className="text-xs text-gray-600">Emotionally scaffolded language; stability-first priorities; shorter-horizon milestones. Financial and Skills scores dampened by up to −15%.</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-3">Scenario Stress-Tests (Pro)</h3>
            <div className="flex flex-wrap gap-3">
              {SCENARIOS.map(s => (
                <div key={s} className="bg-orange-50 border border-[#E08040]/30 rounded-xl px-4 py-3 text-xs font-semibold text-[#E08040]">{s}</div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">Per-dimension impact delta, recovery timeline estimate, and scenario-specific action steps — answering "what if?" before the scenario happens, rather than after.</p>
          </div>
        </section>

        <section id="market">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">3. Market Opportunity</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-6" />
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Total Addressable Market (2025)</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0D1225] text-white">
                  <th className="text-left px-4 py-3 font-semibold text-sm">Segment</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm">Global Market Size</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm">Growth Rate</th>
                </tr>
              </thead>
              <tbody>
                {MARKET.map((m, i) => (
                  <tr key={m.segment} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    <td className="px-4 py-3 text-gray-800 text-xs font-medium">{m.segment}</td>
                    <td className="px-4 py-3 font-bold text-[#E08040] text-xs">{m.size}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{m.cagr} CAGR</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Competitive Landscape</h3>
              <p className="text-xs text-gray-500 mt-1">No direct competitor currently occupies the multi-dimensional personal resilience space at the consumer level.</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0D1225] text-white">
                  <th className="text-left px-4 py-3 font-semibold text-sm">Adjacent Competitor</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm">Why They Don't Compete Fully</th>
                </tr>
              </thead>
              <tbody>
                {COMPETITORS.map((c, i) => (
                  <tr key={c.name} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    <td className="px-4 py-3 font-semibold text-gray-900 text-xs">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{c.gap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="business-model">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">4. Business Model</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { tier: "Free", price: "Always free", features: "3 complete assessments with full AI-generated reports. No account required for first run. Designed to demonstrate full platform value before monetisation is requested." },
              { tier: "Pro", price: "£9/mo or £79/yr", features: "Unlimited assessments, longitudinal tracking, 4 scenario stress-tests, AI Companion, daily coaching tips, achievement badges, 30-day challenge, offline plan access, plan comparison." },
              { tier: "Coaching", price: "When needed", features: "If psychological resilience score signals the user could benefit from support, Resilium surfaces a direct path to a human coach (Phoenix Insight Coaching)." },
            ].map(t => (
              <div key={t.tier} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-gray-900 text-sm">{t.tier}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">{t.price}</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{t.features}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Unit Economics (Projected)</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0D1225] text-white">
                  <th className="text-left px-4 py-3 font-semibold text-sm">Metric</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm">Conservative</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm">Base Case</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm">Optimistic</th>
                </tr>
              </thead>
              <tbody>
                {ECONOMICS.map((e, i) => (
                  <tr key={e.metric} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    <td className="px-4 py-3 text-gray-800 text-xs font-medium">{e.metric}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{e.conservative}</td>
                    <td className="px-4 py-3 font-bold text-[#E08040] text-xs">{e.base}</td>
                    <td className="px-4 py-3 text-emerald-600 text-xs font-semibold">{e.optimistic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="privacy">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">5. Privacy, Ethics & Compliance</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title: "Privacy by Design", items: ["All data encrypted in transit (TLS) and at rest", "User data never sold or shared with third parties", "Anonymous assessments auto-purged after 30 days", "Full GDPR compliance: export and deletion on request", "Data minimisation: only data needed for scoring is collected", "Versioned, timestamped consent on web and mobile"] },
              { title: "AI Transparency", items: ["Scoring is fully deterministic — no AI in score calculation", "AI used only for language generation and reasoning", "Full score breakdown by dimension enables scrutiny", "Users can understand and question every aspect of their result"] },
              { title: "No Advice Liability", items: ["Platform does not provide medical, financial, or legal advice", "All outputs framed as educational self-assessment tools", "Appropriate disclaimers embedded throughout user journey"] },
            ].map(s => (
              <div key={s.title} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="font-bold text-gray-900 text-sm mb-3">{s.title}</div>
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

        <section id="platform">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">6. Platform Maturity</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-6" />
          <div className="bg-orange-50 border border-[#E08040]/30 rounded-2xl p-5 mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-[#E08040] mb-1">Status</p>
            <p className="text-sm text-gray-700 font-semibold">Fully built, tested, and operational. Serving users on web and mobile in production.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Web Application", desc: "React 19 / Vite 7 / TypeScript · Tailwind CSS · shadcn/ui · Dark-only brand palette (#0D1225 / #E08040)" },
              { title: "Mobile Application", desc: "Expo SDK 53 (React Native) · iOS + web · Push notifications (30-day reminders) · Haptic feedback throughout" },
              { title: "API Server", desc: "Node.js 24 / Express 5 · esbuild compilation · Full OpenAPI specification · Rate limiting" },
              { title: "Database", desc: "PostgreSQL 16 · Drizzle ORM · Production tables: users, reports, subscriptions, checklists, snapshots, challenge progress, GDPR, admin audit · Automated GDPR cleanup" },
              { title: "Authentication", desc: "Clerk (JWT-based) for users · Separate cookie-based admin auth with ADMIN_USERNAME / ADMIN_PASSWORD environment secrets" },
              { title: "Payments", desc: "Stripe subscription billing · Stripe-Signature verified webhooks · Monthly ($9) and annual ($79) Pro plans · Server-side Checkout Sessions" },
              { title: "Engagement Features", desc: "Daily coaching tip cards · Achievement badges · Streak tracking · 30-day resilience challenge with progress ring" },
              { title: "Offline Capability", desc: "Pro users' last-viewed action plan cached locally (7-day TTL) · Profile plan list cached · Offline banner shown when server is unreachable" },
              { title: "Admin Dashboard", desc: "Analytics (KPI cards, 12-month trends, dimension averages, conversion funnel) · User management · GDPR · Announcements · UX testing framework (8 personas)" },
              { title: "Error Monitoring", desc: "Sentry integrated across web, mobile, and API (production only) · In-memory error rate tracking + admin email digest alerts" },
              { title: "Email", desc: "Resend API · Welcome email on first login · Weekly digest cron · One-click unsubscribe with HMAC tokens · List-Unsubscribe headers" },
              { title: "AI UX Testing", desc: "8 built-in personas · AI evaluator scores reports 0–10 on quality, relevance, and empathy · Live SSE progress stream · Exportable Markdown/PDF" },
            ].map(f => (
              <div key={f.title} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <div className="font-bold text-gray-900 text-xs mb-1">{f.title}</div>
                <div className="text-xs text-gray-500 leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="impact">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">7. Impact Vision</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-6" />
          <div className="bg-[#0D1225] rounded-2xl p-8">
            <p className="text-[#EAD9BE] text-sm leading-relaxed mb-4">
              Resilience is a measurable, improvable quantity. Resilium exists to make that measurement accessible to every individual — not just those who can afford bespoke advisors or have the background to self-educate across all six dimensions simultaneously.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              A population that understands its own vulnerabilities is better positioned to address them. Communities where individuals have taken concrete preparedness steps recover faster from disruptions, place less pressure on emergency services, and sustain social cohesion through crises.
            </p>
            <p className="text-[#E08040] text-sm font-semibold">
              Resilium's long-term vision is to become the global standard for individual and community resilience measurement — a platform whose scores are as understood and acted upon as credit scores, but oriented toward durability rather than debt.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
