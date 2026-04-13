/* Marketing & Distribution Strategy — Rich React Component
   Visual style matches competitive-analysis.tsx
   Overlap note: Section 9 (Competitive Differentiation) removed — see Competitive Analysis tab.
   Channel tactics (Reddit, Product Hunt) at strategic level only — full playbook in GTM Plan tab.
*/

const TODAY = "April 2026";

const MARKET_SIZE = [
  { segment: "Consumer resilience / preparedness", tam: "$4.2B", sam: "$680M" },
  { segment: "Employee benefits & wellness", tam: "$61B", sam: "$3.1B" },
  { segment: "Financial planning software", tam: "$22B", sam: "$890M" },
];

const FUNNEL = [
  { stage: "Unique visitors", volume: "180,000", rate: "—", highlight: false },
  { stage: "Assessment started", volume: "72,000", rate: "40%", highlight: false },
  { stage: "Assessment completed", volume: "36,000", rate: "50%", highlight: false },
  { stage: "Email captured", volume: "28,800", rate: "80%", highlight: false },
  { stage: "Free → Pro conversion", volume: "1,440", rate: "5%", highlight: true },
  { stage: "Annual plan uptake (of Pro)", volume: "576", rate: "40%", highlight: false },
];

const CONVERSION_LEVERS = [
  { n: 1, name: "Score wall", detail: "Free report shows 'What's holding you back' but locks the prioritized action items behind Pro." },
  { n: 2, name: "Scenario gate", detail: "'Run Scenario Stress-Test' surfaced prominently in results — clicking triggers a Pro upgrade prompt with a preview of the output." },
  { n: 3, name: "Guides gate", detail: "Crisis Guides visible as a tab with a Pro badge; free users see a locked preview listing categories, then an upgrade prompt." },
  { n: 4, name: "Plan save limit", detail: "On the 3rd save attempt, a paywall appears showing the history feature." },
  { n: 5, name: "Email drip", detail: "5-email sequence over 14 days: Day 0 report summary → Day 2 '#1 weakness' → Day 5 scenario preview → Day 9 Pro walkthrough → Day 14 limited-time discount." },
];

const CHANNELS = [
  {
    name: "SEO / Content Marketing",
    share: "45%",
    shareNum: 45,
    color: "#E08040",
    bullets: [
      "High-intent, low-competition keywords: 'personal resilience plan' (2.9K/mo, KD 18), 'resilience score assessment' (880, KD 14), 'job loss financial plan' (3.2K, KD 31)",
      "4 content pillars: scenario deep-dives, dimension explainers, score-based hooks, proprietary data stories",
      "Target: 3 blog posts/week × 6 months = 72 articles → 15K organic visitors/month by Month 9",
      "Compounding data moat: real assessment data generates unique content no generic site can replicate",
      "Full tactical playbook (Reddit, Product Hunt, community seeding) → GTM Plan tab",
    ],
  },
  {
    name: "Social & Creator Partnerships",
    share: "25%",
    shareNum: 25,
    color: "#6366f1",
    bullets: [
      "YouTube sponsorships: personal finance, preparedness, self-improvement creators (50K–500K subscribers)",
      "Typical CPM $18–$35; mid-tier sponsorships ($2K–$8K/video) highly cost-effective vs. direct response",
      "TikTok / Instagram Reels: creators take the assessment on camera, react to their score, tag Resilium",
      "Community seeding: genuine participation in r/personalfinance, r/preppers, r/financialindependence",
    ],
  },
  {
    name: "Paid Acquisition",
    share: "15%",
    shareNum: 15,
    color: "#f59e0b",
    bullets: [
      "Deploy only after organic signals confirm converting angles",
      "Google Search: target 'emergency preparedness plan', 'financial resilience assessment' (bottom-of-funnel)",
      "Meta: lookalike audiences off email list; video creative showing the app flow",
      "Target: blended CAC < $18 free users, < $65 Pro (LTV > $96 at ~$8/mo ARPU × 12 mo avg retention)",
    ],
  },
  {
    name: "B2B Partnerships",
    share: "15%",
    shareNum: 15,
    color: "#10b981",
    bullets: [
      "HR / Benefits brokers: white-label Resilium for Teams; 30% to broker / 70% Resilium; $5–$8/employee/month",
      "Insurance carriers: resilience score as underwriting signal or value-add for policyholders",
      "Financial advisors: 'Resilience Report' as client onboarding tool; flat annual license per advisor seat",
      "Minimum contract $99/month for teams under 20 seats; no per-seat floor for SMBs",
    ],
  },
];

const KEYWORDS = [
  { keyword: "emergency preparedness checklist", volume: "40,500", kd: "28" },
  { keyword: "personal resilience plan", volume: "2,900", kd: "18" },
  { keyword: "financial emergency plan template", volume: "1,600", kd: "22" },
  { keyword: "resilience score assessment", volume: "880", kd: "14" },
  { keyword: "job loss financial plan", volume: "3,200", kd: "31" },
];

const MILESTONES = [
  { milestone: "Public launch (web)", target: "Q2 2026", kpi: "500 assessments in first week" },
  { milestone: "App Store launch", target: "Q3 2026", kpi: "1,000 installs in first month" },
  { milestone: "$10K MRR", target: "Q3 2026", kpi: "~1,110 Pro subscribers" },
  { milestone: "First B2B pilot", target: "Q4 2026", kpi: "1 company, 50+ seats" },
  { milestone: "$50K MRR", target: "Q1 2027", kpi: "~5,560 Pro subscribers or equiv. mix" },
  { milestone: "$1M ARR", target: "Q4 2027", kpi: "~9,250 subscribers + B2B" },
];

const BUDGET = [
  { category: "Content / SEO (writers, tools)", monthly: "$4,500", total: "$81,000" },
  { category: "Creator partnerships", monthly: "$6,000", total: "$108,000" },
  { category: "Paid acquisition (search + social)", monthly: "$5,000", total: "$90,000" },
  { category: "B2B sales & partnerships", monthly: "$3,000", total: "$54,000" },
  { category: "Product & engineering", monthly: "$12,000", total: "$216,000" },
  { category: "Infrastructure & AI costs", monthly: "$2,000", total: "$36,000" },
];

const MOAT = [
  {
    item: "Proprietary dataset",
    detail: "As assessments accumulate, percentile benchmarks become more meaningful and harder to replicate. Each user improves the benchmark for all others.",
  },
  {
    item: "AI scenario engine",
    detail: "Personalized what-if modeling at the individual level is technically complex — it requires a tightly integrated scoring + LLM pipeline that competitors cannot quickly copy.",
  },
  {
    item: "Cross-dimension correlation",
    detail: "Insights like 'your financial cushion partially offsets your low social support' are unique to Resilium's integrated multi-dimension model. No single-dimension tool can replicate this.",
  },
];

const EMAIL_LIFECYCLE = [
  { timing: "Week 1", action: "'Your AI Plan — week 1 checklist' (action items from their plan)" },
  { timing: "Month 1", action: "'You're 30 days in — here's your progress' (checklist completion summary)" },
  { timing: "Month 3", action: "'Time to retake your assessment — things may have changed'" },
  { timing: "Month 6", action: "'Your 6-month resilience journey' (PDF summary, shareable)" },
  { timing: "Annual", action: "30-day and 7-day renewal reminders; churn-saver offer (1 month free)" },
];

export default function MarketingStrategyDoc() {
  const NAVS = ["executive-summary", "audiences", "funnel", "channels", "pricing", "retention", "milestones", "budget"];

  return (
    <div className="min-h-screen bg-[#F7F7FA] font-sans">
      {/* Header */}
      <div className="bg-[#0D1225] text-white px-8 py-5 flex items-center justify-between sticky top-0 z-50 shadow-xl">
        <div>
          <span className="text-[#E08040] font-bold text-lg tracking-tight">Resilium</span>
          <span className="text-gray-400 text-sm ml-3">Marketing & Distribution Strategy · {TODAY}</span>
        </div>
        <span className="text-xs text-gray-500 hidden sm:block">Confidential · Solo Founder</span>
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

        {/* Executive Summary */}
        <section id="executive-summary">
          <div className="bg-[#0D1225] rounded-2xl p-8 mb-8">
            <p className="text-[#EAD9BE] text-xs uppercase tracking-widest mb-2">Version 1.1 — April 2026</p>
            <h1 className="text-3xl font-bold text-white mb-2">Marketing & Distribution Strategy</h1>
            <p className="text-gray-400 text-sm mb-5">$1M ARR within 18 months of public launch via freemium funnel, B2B2C partnerships, and a content-led SEO moat.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {MARKET_SIZE.map((m) => (
                <div key={m.segment} className="bg-white/8 rounded-xl p-4 border border-white/10">
                  <p className="text-[#E08040] font-bold text-xl">{m.sam}</p>
                  <p className="text-white text-xs font-semibold mt-0.5">SAM</p>
                  <p className="text-gray-400 text-xs mt-2 leading-snug">{m.segment}</p>
                  <p className="text-gray-600 text-[10px] mt-1">TAM: {m.tam}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-orange-50 border border-[#E08040]/30 rounded-2xl p-6 mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-[#E08040] mb-2">Executive Summary</p>
            <p className="text-gray-800 text-sm leading-relaxed">
              Resilium fills the gap at the intersection of personal finance, mental health, and practical preparedness. The freemium model, content-led acquisition, and B2B expansion path create three compounding growth engines. Initial SAM ~$1.5B combining wellness and direct-to-consumer. The immediate priority is driving free assessment volume through SEO and creator partnerships, optimizing the free → Pro conversion funnel, and closing the first B2B pilot to validate enterprise pricing.
            </p>
          </div>

          {/* Moat */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Defensible Moat</h2>
            <div className="space-y-3">
              {MOAT.map((m, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-6 h-6 rounded-full bg-[#E08040] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">{i + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{m.item}</p>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{m.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Target Audiences */}
        <section id="audiences">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Target Audiences</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-6" />
          <div className="space-y-4">
            {[
              {
                badge: "Primary — B2C",
                badgeColor: "bg-orange-100 text-orange-700",
                name: "The Anxious Planner",
                profile: "28–45 years old · dual-income household · at least one dependent · earns $75K–$180K · checks credit score monthly · has a 401(k) but no emergency continuity plan · reads r/financialindependence and personal finance blogs · triggered by life events: new baby, job change, moving, parent health scare",
                psycho: "Wants control and peace of mind. Already uses Mint, YNAB, Credit Karma, Headspace. Willing to pay for software that saves time and reduces anxiety.",
                acq: "Search (high-intent keywords), personal finance content creators, email newsletters (Morning Brew, Money Girl).",
              },
              {
                badge: "Secondary — B2B",
                badgeColor: "bg-indigo-100 text-indigo-700",
                name: "The Resilience-Forward Employer",
                profile: "HR leaders at mid-market companies (200–2,000 employees) already offering EAP and financial wellness benefits. Looking for differentiated benefits to reduce turnover and improve engagement scores.",
                psycho: "Resilium for Teams gives HR a dashboard of aggregate (anonymized) resilience readiness, identifying departments under stress before it becomes attrition.",
                acq: "Benefits broker partnerships, HR conference sponsorships (SHRM, Benefits Forum), LinkedIn outbound.",
              },
              {
                badge: "Tertiary — Niche B2C",
                badgeColor: "bg-emerald-100 text-emerald-700",
                name: "The Preparedness Community",
                profile: "Self-reliant homesteaders, preppers, remote workers, expats thinking systematically about continuity. Lower income ceiling but very high word-of-mouth amplification.",
                psycho: "Share tools in tight-knit communities on Reddit (r/preppers, r/financialindependence), Discord, and YouTube. One authentic post can drive hundreds of signups.",
                acq: "Community seeding, YouTube sponsorships (homestead/preparedness channels), affiliate program.",
              },
            ].map((a) => (
              <div key={a.name} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                  <h3 className="font-bold text-gray-900 text-lg">{a.name}</h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${a.badgeColor}`}>{a.badge}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <p className="font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Profile</p>
                    <p className="text-gray-700 leading-relaxed">{a.profile}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Psychographic</p>
                    <p className="text-gray-700 leading-relaxed">{a.psycho}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Acquisition</p>
                    <p className="text-gray-700 leading-relaxed">{a.acq}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Freemium Funnel */}
        <section id="funnel">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Freemium Funnel & Conversion</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-6" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Funnel table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-[#0D1225] px-4 py-3">
                <p className="text-white text-sm font-semibold">Year 1 Funnel — Target Metrics</p>
                <p className="text-gray-400 text-xs mt-0.5">MRR target: $11,600/month → ~$139K ARR</p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stage</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Volume</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {FUNNEL.map((f, i) => (
                    <tr key={i} className={`border-b border-gray-50 ${f.highlight ? "bg-orange-50" : i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                      <td className={`px-4 py-2.5 text-xs ${f.highlight ? "font-bold text-[#E08040]" : "text-gray-700"}`}>{f.stage}</td>
                      <td className={`px-4 py-2.5 text-xs text-right font-mono ${f.highlight ? "font-bold text-[#E08040]" : "text-gray-700"}`}>{f.volume}</td>
                      <td className={`px-4 py-2.5 text-xs text-right font-semibold ${f.highlight ? "text-[#E08040]" : f.rate === "—" ? "text-gray-300" : "text-gray-500"}`}>{f.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Conversion levers */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <p className="text-sm font-bold text-gray-900 mb-4">5 Conversion Levers</p>
              <div className="space-y-3">
                {CONVERSION_LEVERS.map((l) => (
                  <div key={l.n} className="flex gap-3 items-start">
                    <div className="w-5 h-5 rounded-full bg-[#E08040]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#E08040] text-xs font-bold">{l.n}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-900">{l.name}: </span>
                      <span className="text-xs text-gray-600 leading-relaxed">{l.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Channel Mix */}
        <section id="channels">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Channel Mix</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-2" />
          <p className="text-sm text-gray-500 mb-6">Four channels, percentage of total acquisition budget. Full tactical playbooks for Reddit and Product Hunt are in the GTM Plan tab.</p>

          <div className="space-y-4">
            {CHANNELS.map((c) => (
              <div key={c.name} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <h3 className="font-bold text-gray-900">{c.name}</h3>
                  <span className="text-lg font-bold" style={{ color: c.color }}>{c.share}</span>
                </div>
                {/* Bar */}
                <div className="h-2 bg-gray-100 rounded-full mb-4 overflow-hidden">
                  <div className="h-2 rounded-full" style={{ width: `${c.shareNum}%`, backgroundColor: c.color }} />
                </div>
                <ul className="space-y-1.5">
                  {c.bullets.map((b, i) => (
                    <li key={i} className="flex gap-2 items-start text-xs text-gray-700 leading-snug">
                      <span className="mt-1 flex-shrink-0 w-1 h-1 rounded-full bg-gray-400" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Keywords table */}
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-[#0D1225] px-4 py-3">
              <p className="text-white text-sm font-semibold">Priority SEO Keywords</p>
              <p className="text-gray-400 text-xs mt-0.5">KD = Keyword Difficulty (0–100 scale). Low KD = faster ranking potential.</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Keyword</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Monthly Volume</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">KD</th>
                </tr>
              </thead>
              <tbody>
                {KEYWORDS.map((k, i) => (
                  <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    <td className="px-4 py-2.5 text-xs text-gray-800 font-medium">{k.keyword}</td>
                    <td className="px-4 py-2.5 text-xs text-right font-mono text-gray-700">{k.volume}</td>
                    <td className="px-4 py-2.5 text-xs text-right font-semibold text-emerald-600">{k.kd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Pricing Rationale</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                tier: "$9 / month",
                label: "Monthly Pro",
                color: "#E08040",
                notes: [
                  "Utility SaaS tier — competitive with YNAB ($14.99/mo) and Headspace ($12.99/mo)",
                  "Below the $10 psychological friction threshold for direct card-entry without a trial",
                  "Priced to feel like a no-brainer rather than a commitment",
                ],
              },
              {
                tier: "$79 / year",
                label: "Annual Pro",
                color: "#6366f1",
                notes: [
                  "~$6.58/month — 27% discount vs. monthly",
                  "Annual plans dramatically improve LTV and reduce churn",
                  "Monthly churn for annual plans: 4–6% vs. 12–18% for monthly",
                ],
              },
              {
                tier: "$5–8 / seat",
                label: "Teams (B2B)",
                color: "#10b981",
                notes: [
                  "Per employee per month; scales with headcount",
                  "No per-seat floor for SMBs; minimum contract $99/month for teams under 20",
                  "Revenue split: 30% to broker / 70% Resilium on brokered deals",
                ],
              },
            ].map((p) => (
              <div key={p.tier} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <p className="text-2xl font-bold mb-0.5" style={{ color: p.color }}>{p.tier}</p>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{p.label}</p>
                <ul className="space-y-1.5">
                  {p.notes.map((n, i) => (
                    <li key={i} className="text-xs text-gray-700 leading-snug flex gap-2 items-start">
                      <span className="mt-1 flex-shrink-0 w-1 h-1 rounded-full" style={{ backgroundColor: p.color }} />
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Retention */}
        <section id="retention">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Retention & Lifecycle</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <p className="text-sm font-bold text-gray-900 mb-3">In-App Engagement Loop</p>
              <div className="bg-[#0D1225] rounded-xl p-4 mb-3">
                <pre className="text-xs text-green-400 font-mono leading-relaxed whitespace-pre-wrap">{`Assessment → Score → AI Plan → Scenario Stress-Test
     ↑                                    |
     └──── Retake Prompt (90 days) ←──────┘`}</pre>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                The natural lifecycle is quarterly — resilience scores change as life circumstances change. Quarterly re-assessment reminders drive app opens, surface Pro upsells for free users, and validate value for Pro users. Daily check-ins create an additional daily engagement layer, building habit loops and streak-based retention.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-900">Email Lifecycle — Pro Users</p>
              </div>
              <table className="w-full text-xs">
                <tbody>
                  {EMAIL_LIFECYCLE.map((e, i) => (
                    <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                      <td className="px-4 py-2.5 font-semibold text-[#E08040] whitespace-nowrap">{e.timing}</td>
                      <td className="px-4 py-2.5 text-gray-700 leading-snug">{e.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Milestones */}
        <section id="milestones">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Success Metrics & Milestones</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-6" />
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0D1225] text-white">
                  <th className="text-left px-4 py-3 font-semibold text-sm">Milestone</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm">Target Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm">KPI</th>
                </tr>
              </thead>
              <tbody>
                {MILESTONES.map((m, i) => (
                  <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    <td className="px-4 py-3 text-gray-900 font-medium text-xs">{m.milestone}</td>
                    <td className="px-4 py-3 text-[#E08040] font-bold text-xs whitespace-nowrap">{m.target}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{m.kpi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cross-reference callout */}
          <div className="mt-6 bg-orange-50 border border-[#E08040]/30 rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#E08040] mb-2">Competitive Landscape</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              The full competitive differentiation analysis — competitor profiles, feature matrix, positioning map, white space opportunities, and strategic action plan — is in the <strong>Competitive Analysis tab</strong>. Key finding: the top-right quadrant (Proactive + Holistic) remains entirely uncontested in the consumer market as of April 2026.
            </p>
          </div>
        </section>

        {/* Budget */}
        <section id="budget">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Investment in Growth — 18-Month Budget</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-6" />
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0D1225] text-white">
                  <th className="text-left px-4 py-3 font-semibold text-sm">Category</th>
                  <th className="text-right px-4 py-3 font-semibold text-sm">Monthly Budget</th>
                  <th className="text-right px-4 py-3 font-semibold text-sm">18-Month Total</th>
                </tr>
              </thead>
              <tbody>
                {BUDGET.map((b, i) => (
                  <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    <td className="px-4 py-3 text-gray-800 text-xs">{b.category}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-gray-700">{b.monthly}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-gray-900">{b.total}</td>
                  </tr>
                ))}
                <tr className="bg-[#E08040]/5 border-t-2 border-[#E08040]/20">
                  <td className="px-4 py-3 font-bold text-gray-900 text-xs">Total</td>
                  <td className="px-4 py-3 text-right font-bold font-mono text-xs text-[#E08040]">$32,500</td>
                  <td className="px-4 py-3 text-right font-bold font-mono text-xs text-[#E08040]">$585,000</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">At $1M ARR (Month 18), the business reaches payback assuming 80% gross margins (SaaS + AI model costs).</p>
        </section>

        {/* Footer */}
        <div className="text-center py-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 italic">Resilium — Know your readiness. Own your future.</p>
        </div>

      </div>
    </div>
  );
}
