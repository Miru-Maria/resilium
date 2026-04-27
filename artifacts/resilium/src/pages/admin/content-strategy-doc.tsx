const DATE = "April 2026";

const BLOG_PHASES = [
  {
    phase: "Phase 1",
    label: "Solo Launch",
    status: "Live",
    statusColor: "#10b981",
    cadence: "1 post / week",
    owner: "Founder-led",
    goal: "Establish topical authority, get indexed, test what resonates",
    topics: ["Dimension deep-dives", "\"What does a good score mean?\" explainers", "Resilience myths debunked", "Personal finance + preparedness crossovers"],
    notes: "Each post targets a long-tail keyword. Minimum 1,000 words. Include structured data (FAQ schema). Internal-link to the assessment CTA.",
  },
  {
    phase: "Phase 2",
    label: "Scale Up",
    status: "Planned",
    statusColor: "#6366f1",
    cadence: "3 posts / week",
    owner: "Founder + 1 writer",
    goal: "Compound organic traffic, build backlink targets, own SERPs for resilience scoring",
    topics: ["Pillar pages (1 per dimension)", "Comparison posts (\"Resilium vs. generic preparedness checklists\")", "Data-driven posts (citing our own aggregate stats)", "Guest expert perspectives"],
    notes: "Hire a writer with SEO + personal finance background. Founder reviews all drafts for brand voice. Target DA 30+ backlinks through data posts and expert quotes.",
  },
];

const BLOG_KW_CLUSTERS = [
  { cluster: "Resilience scoring", examples: ["personal resilience score", "how to measure resilience", "resilience assessment tool"], intent: "Commercial" },
  { cluster: "Emergency preparedness", examples: ["household emergency preparedness", "how prepared am I for a crisis", "family preparedness checklist"], intent: "Informational" },
  { cluster: "Financial readiness", examples: ["financial resilience meaning", "emergency fund how much", "financial preparedness 2026"], intent: "Informational" },
  { cluster: "Dimension-specific", examples: ["psychological resilience definition", "skill transferability career", "household mobility planning"], intent: "Informational" },
  { cluster: "Brand + product", examples: ["Resilium review", "Resilium platform", "resilience app"], intent: "Navigational" },
];

const PILLARS = [
  {
    num: "01",
    name: "Clarity",
    color: "#E08040",
    tagline: "Cutting through noise with facts and frameworks",
    desc: "Educational content that replaces vague anxiety with concrete knowledge. What does financial resilience actually mean? What is a good score? Why do most people feel underprepared?",
    formats: ["Myth vs. reality posts", "Stat-led insights", "Dimension deep-dives", "\"What your score means\" explainers"],
    freq: "2× / week",
  },
  {
    num: "02",
    name: "Readiness",
    color: "#6366f1",
    tagline: "Redefining what it means to be prepared",
    desc: "Thought leadership that shifts the conversation from 'prepper' stereotypes to intelligent, modern resilience. Resilience as a life skill — not a bunker.",
    formats: ["Contrarian takes on 'preparedness'", "The 6 dimensions explained", "Household vs. individual readiness", "\"Before the crisis\" framing"],
    freq: "1× / week",
  },
  {
    num: "03",
    name: "Progress",
    color: "#10b981",
    tagline: "The journey of building resilience, step by step",
    desc: "Motivating, honest content about improvement over time. Small steps, real outcomes. The 30-day mindset. Celebrating that readiness compounds — slowly, then all at once.",
    formats: ["\"Start here\" guides", "30-day challenge stories", "Streak and milestone moments", "Progress > perfection framing"],
    freq: "1× / week",
  },
  {
    num: "04",
    name: "Perspective",
    color: "#3B82F6",
    tagline: "Broader lens on why resilience matters now",
    desc: "Macro context that makes personal resilience feel urgent without fear-mongering. Climate events, economic volatility, job market shifts — framed as 'this is why a score matters', not doom.",
    formats: ["Data-backed trend pieces", "Resilience across cultures/countries", "\"What the data shows\" posts", "Research and study highlights"],
    freq: "2× / month",
  },
  {
    num: "05",
    name: "Product",
    color: "#8B5CF6",
    tagline: "Resilium in action — features and outcomes",
    desc: "Transparent, low-pressure product content. Not advertising — showing. How does the assessment work? What does an AI action plan actually look like? What can you do in 10 minutes?",
    formats: ["Feature spotlights", "\"Did you know\" micro-posts", "Before/after score framing (anonymous)", "Free vs. Pro benefit clarity"],
    freq: "1× / 2 weeks",
  },
];

const TEMPLATES = [
  {
    type: "Thought Leadership",
    hook: "Contrarian or curiosity-gap opener",
    example: `Most resilience advice tells you to stockpile supplies.\n\nThat's not wrong. But it's the last 5%.\n\nThe 95% most people skip:\n\n→ Understanding your financial runway\n→ Knowing your household's mobility limits\n→ Having a skills baseline that transfers across crises\n→ Documenting what matters before you need it\n\nPreparedness isn't a personality type. It's a practice.\n\nWhat's the one dimension you'd score yourself lowest on right now?`,
    notes: "Open with a contrarian premise. 3–5 short bullets. End with a single direct question. Target: 700–900 chars.",
  },
  {
    type: "Educational — Stat-led",
    hook: "Specific number as opener",
    example: `56% of adults have less than 3 months of emergency savings.\n\nThat stat gets shared a lot. What gets shared less:\n\nSavings is only one of six dimensions of resilience.\n\nThe others — health readiness, skill transferability, household mobility, psychological bandwidth, emergency resources — rarely get measured at all.\n\nMost people aren't underprepared because they're irresponsible.\n\nThey're underprepared because no one gave them a complete picture.\n\nResilient people aren't different. They're informed.`,
    notes: "Lead with a real, cited number. Pivot to insight. Close with reframing. No CTA needed — end on the thought. Target: 600–800 chars.",
  },
  {
    type: "Product Spotlight",
    hook: "Feature revealed through outcome",
    example: `You can assess your full household in Resilium — not just yourself.\n\nIt sounds like a small thing. It's not.\n\nBecause resilience is rarely individual. A job loss affects everyone. A health crisis affects everyone. A mobility gap — one person with limited mobility in an evacuation scenario — affects everyone.\n\nThe household score accounts for dependents, mobility needs, and shared resources. It produces a different plan than an individual assessment would.\n\nThat gap is where most single-person assessments fall short.\n\nStart free at resilium-platform.com`,
    notes: "Lead with the feature, not the feature name. Show the why before the what. CTA is low-pressure, final line only. Target: 500–700 chars.",
  },
  {
    type: "Perspective — Macro lens",
    hook: "Observation about the world, not the product",
    example: `2024 was the hottest year on record.\nThe EU's economic volatility index hit a 10-year high.\nAI eliminated an estimated 1.3M jobs in 12 months.\n\nNone of this is new information.\n\nWhat is new: the expectation that individuals can navigate these overlapping disruptions without a personal resilience baseline.\n\nFinancial advisors help with money. Therapists help with mindset. Doctors help with health.\n\nNo one helps you see how all of it connects — and where your gaps actually are.\n\nThat's the problem Resilium exists to solve.`,
    notes: "Three macro facts as list. Pivot to the gap. End on positioning without naming the product until the final line. Target: 700–850 chars.",
  },
];

const HOOKS = [
  { pattern: "Contrarian", template: "Everyone says [common belief]. Here's what actually matters.", example: "Everyone says 'emergency fund.' Here's what the other 5 dimensions look like." },
  { pattern: "Specificity signal", template: "[Specific number] + [unexpected insight].", example: "56%. That's one dimension. Here are the other five." },
  { pattern: "Callout", template: "If you're [specific person] still [doing X], read this.", example: "If you consider yourself financially responsible and haven't assessed your mobility, read this." },
  { pattern: "Curiosity gap", template: "I looked at [X]. What I found changed how I think about [Y].", example: "I looked at the most common vulnerability in resilience assessments. It's not finances." },
  { pattern: "Permission / Unpopular opinion", template: "Unpopular opinion: [reframe].", example: "Unpopular opinion: most resilience advice is optimised for worst-case scenarios that will never happen to you." },
  { pattern: "Negative hook", template: "[Number] things [target audience] gets wrong about [topic].", example: "3 things financially literate people still get wrong about household resilience." },
];

export default function ContentStrategyDoc() {
  return (
    <div className="px-8 py-8 max-w-5xl mx-auto space-y-8">

      <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-200">
        <div className="px-8 py-7" style={{ background: "#0D1225" }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#E08040" }}>Content Strategy</p>
          <h1 className="text-3xl font-bold text-white font-display mb-1">Resilium Content & SEO Strategy</h1>
          <p className="text-sm" style={{ color: "#8A7A6A" }}>Version 1.1 · {DATE} · Blog Platform + LinkedIn · Organic-first</p>
        </div>
      </div>

      {/* Blog Platform & SEO */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Blog Platform & SEO</h2>
            <p className="text-xs text-gray-400 mt-0.5">Live at <span className="font-mono text-gray-600">resilium-platform.com/blog</span> · Admin workflow in /admin/blog</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ background: "#10b981" }}>Live</span>
        </div>

        {/* Quick stats */}
        <div className="px-6 pt-5 pb-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Blog status", value: "Live", note: "Published & indexed" },
            { label: "Phase 1 cadence", value: "1×/week", note: "Founder-led, solo" },
            { label: "Phase 2 cadence", value: "3×/week", note: "With writer (planned)" },
            { label: "Admin route", value: "/admin/blog", note: "Draft · schedule · publish" },
          ].map(({ label, value, note }) => (
            <div key={label} className="rounded-xl p-4" style={{ background: "#F7F7FA" }}>
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <p className="text-sm font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{note}</p>
            </div>
          ))}
        </div>

        {/* Phase cards */}
        <div className="p-6 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {BLOG_PHASES.map((p) => (
            <div key={p.phase} className="rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between" style={{ background: "#F7F7FA" }}>
                <div>
                  <span className="text-xs font-bold text-gray-900">{p.phase} — {p.label}</span>
                  <span className="ml-2 text-xs text-gray-400">{p.cadence} · {p.owner}</span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: p.statusColor }}>{p.status}</span>
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold mb-1" style={{ color: "#E08040" }}>Goal</p>
                <p className="text-sm text-gray-700 mb-3">{p.goal}</p>
                <p className="text-xs font-semibold mb-2" style={{ color: "#E08040" }}>Content types</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {p.topics.map((t) => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{t}</span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 italic leading-relaxed">{p.notes}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Admin workflow callout */}
        <div className="px-6 pb-5">
          <div className="rounded-xl border border-indigo-100 p-4" style={{ background: "#F5F5FF" }}>
            <p className="text-xs font-semibold text-indigo-700 mb-2">Admin Publishing Workflow</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs text-gray-700">
              {[
                { step: "1", label: "Draft", desc: "Write in /admin/blog → New Post. Save as Draft. Set SEO title + meta desc before saving." },
                { step: "2", label: "Schedule", desc: "Set publish date/time. Posts auto-publish at the scheduled time — no manual action needed." },
                { step: "3", label: "Publish", desc: "Publish immediately or confirm scheduled. Blog list shows Published / Draft / Scheduled status." },
                { step: "4", label: "Promote", desc: "After publish: LinkedIn post (same day), internal link from related posts, update sitemap." },
              ].map(({ step, label, desc }) => (
                <div key={step} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-black mt-0.5" style={{ background: "#6366f1" }}>{step}</div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-0.5">{label}</p>
                    <p className="text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SEO Keyword Clusters */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">SEO Keyword Clusters</h2>
          <p className="text-xs text-gray-400 mt-1">One article per cluster minimum. Each article should target 1 primary keyword + 2–3 supporting terms. Use long-tail variants in H2/H3 headers.</p>
        </div>
        <div className="p-6">
          <div className="rounded-xl overflow-hidden border border-gray-100">
            <div className="grid grid-cols-12 px-4 py-2 border-b border-gray-100 bg-gray-50">
              <span className="col-span-3 text-xs font-semibold text-gray-500">Cluster</span>
              <span className="col-span-7 text-xs font-semibold text-gray-500">Target Keywords</span>
              <span className="col-span-2 text-xs font-semibold text-gray-500">Intent</span>
            </div>
            {BLOG_KW_CLUSTERS.map(({ cluster, examples, intent }) => (
              <div key={cluster} className="grid grid-cols-12 px-4 py-3 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 items-start">
                <span className="col-span-3 text-xs font-bold text-gray-900 pt-0.5">{cluster}</span>
                <div className="col-span-7 flex flex-wrap gap-1.5">
                  {examples.map((ex) => (
                    <span key={ex} className="text-xs font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-600">{ex}</span>
                  ))}
                </div>
                <span className="col-span-2 text-xs pt-0.5" style={{ color: intent === "Commercial" ? "#E08040" : intent === "Navigational" ? "#6366f1" : "#10b981" }}>{intent}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-amber-100 p-4" style={{ background: "#FEF7F0" }}>
            <p className="text-xs font-semibold mb-1" style={{ color: "#E08040" }}>Technical SEO checklist (per post)</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {[
                "Primary keyword in H1 + first 100 words",
                "Meta title ≤ 60 chars, meta desc ≤ 155 chars",
                "At least 1 internal link to assessment CTA",
                "FAQ schema markup on definition posts",
                "Open Graph image (1200×630) set",
                "Canonical URL confirmed before publishing",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
                  <span className="text-xs text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── LINKEDIN SECTION BREAK ─── */}
      <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-200">
        <div className="px-8 py-5" style={{ background: "#0D1225" }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#E08040" }}>Part 2</p>
          <h2 className="text-2xl font-bold text-white font-display">LinkedIn Strategy</h2>
          <p className="text-sm mt-1" style={{ color: "#8A7A6A" }}>Brand-first · 3–4 posts/week · Authority building</p>
        </div>
      </div>

      {/* Platform Overview */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">LinkedIn Strategy Overview</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#E08040" }}>Goal</p>
            <p className="text-sm text-gray-700 leading-relaxed">Build brand awareness and authority in the personal resilience space. Drive profile visits → platform signups. Position Resilium as the default answer to "how do I actually know if I'm prepared?"</p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#E08040" }}>Posting Cadence</p>
            <p className="text-sm text-gray-700 leading-relaxed"><strong>3–4 posts per week.</strong> Consistency over volume. Quality over frequency. One post that genuinely makes someone stop and think is worth five filler posts.</p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#E08040" }}>Best Posting Times</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong>EU audience:</strong> Tue–Thu, 8–9am & 12–1pm Romanian time (EET/EEST).<br/>
              <strong>US audience:</strong> Tue–Thu, 3–5pm Romanian time (= 8–10am EST).<br/>
              Rotate times to test which reaches further.
            </p>
          </div>
        </div>
        <div className="px-6 pb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Hook window", value: "110 chars", note: "Mobile truncation cutoff" },
            { label: "Optimal length", value: "700–900 chars", note: "Not 3,000 — dwell time matters" },
            { label: "Hashtags", value: "3–5 max", note: "At the very end only" },
            { label: "CTA rule", value: "One per post", note: "Always a question or invitation" },
          ].map(({ label, value, note }) => (
            <div key={label} className="rounded-xl p-4" style={{ background: "#F7F7FA" }}>
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <p className="text-sm font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content Pillars */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Content Pillars</h2>
        </div>
        <div className="p-6 space-y-4">
          {PILLARS.map((p) => (
            <div key={p.num} className="rounded-xl border border-gray-200 p-5">
              <div className="flex items-start gap-4">
                <div className="rounded-xl w-10 h-10 flex items-center justify-center flex-shrink-0 text-white text-xs font-black" style={{ background: p.color }}>
                  {p.num}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 flex-wrap mb-1">
                    <h3 className="text-sm font-bold text-gray-900">{p.name} — <span className="font-normal text-gray-500">{p.tagline}</span></h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white flex-shrink-0" style={{ background: p.color }}>{p.freq}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{p.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {p.formats.map((f) => (
                      <span key={f} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Content Mix */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Weekly Content Mix</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
            {[
              { day: "Tuesday", type: "Clarity", sub: "Educational / stat-led", color: "#E08040" },
              { day: "Wednesday", type: "Readiness", sub: "Thought leadership", color: "#6366f1" },
              { day: "Thursday", type: "Progress", sub: "Motivational / journey", color: "#10b981" },
              { day: "Friday", type: "Perspective", sub: "Macro lens (bi-weekly)\nor Product Spotlight", color: "#3B82F6" },
            ].map(({ day, type, sub, color }) => (
              <div key={day} className="rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">{day}</p>
                <p className="text-sm font-bold" style={{ color }}>{type}</p>
                <p className="text-xs text-gray-400 mt-1 leading-tight">{sub}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-amber-100 p-4" style={{ background: "#FEF7F0" }}>
            <p className="text-xs font-semibold" style={{ color: "#E08040" }}>Engagement rule</p>
            <p className="text-sm text-gray-700 mt-1">Reply to every comment within the first hour of posting. LinkedIn's algorithm reads comment velocity in the first 60–120 minutes as a signal of quality. A post with 5 comments in the first hour will outperform a post with 50 likes and no replies.</p>
          </div>
        </div>
      </div>

      {/* Hook Formulas */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Hook Formulas for Resilium</h2>
          <p className="text-xs text-gray-400 mt-1">All hooks must fit within 110 characters — the mobile truncation point. Write the hook last, after you know what the post says.</p>
        </div>
        <div className="p-6">
          <div className="rounded-xl overflow-hidden border border-gray-100">
            <div className="grid grid-cols-12 px-4 py-2 border-b border-gray-100 bg-gray-50">
              <span className="col-span-2 text-xs font-semibold text-gray-500">Pattern</span>
              <span className="col-span-4 text-xs font-semibold text-gray-500">Template</span>
              <span className="col-span-6 text-xs font-semibold text-gray-500">Resilium Example</span>
            </div>
            {HOOKS.map(({ pattern, template, example }) => (
              <div key={pattern} className="grid grid-cols-12 px-4 py-3 border-b border-gray-50 last:border-b-0 hover:bg-gray-50">
                <span className="col-span-2 text-xs font-bold text-gray-900 self-start pt-0.5">{pattern}</span>
                <span className="col-span-4 text-xs text-gray-500 italic pr-4 leading-relaxed">{template}</span>
                <span className="col-span-6 text-xs text-gray-700 font-medium leading-relaxed">{example}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-red-100 p-4 bg-red-50">
            <p className="text-xs font-semibold text-red-600 mb-1">Banned openers — never start a post with:</p>
            <p className="text-xs text-gray-600">"I'm excited to share..." · "As a founder..." · "In today's fast-paced world..." · "Hey everyone..." · "I wanted to take a moment..." · "We're thrilled to announce..."</p>
          </div>
        </div>
      </div>

      {/* Post Templates */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Post Templates with Examples</h2>
          <p className="text-xs text-gray-400 mt-1">Ready-to-adapt examples. Edit the specifics, keep the structure.</p>
        </div>
        <div className="p-6 space-y-5">
          {TEMPLATES.map(({ type, hook, example, notes }) => (
            <div key={type} className="rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between" style={{ background: "#F7F7FA" }}>
                <div>
                  <span className="text-sm font-bold text-gray-900">{type}</span>
                  <span className="ml-3 text-xs text-gray-400">Hook: {hook}</span>
                </div>
              </div>
              <div className="p-5">
                <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans mb-3 border-l-2 pl-4" style={{ borderColor: "#E08040" }}>{example}</pre>
                <p className="text-xs text-gray-400 italic">{notes}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hashtag Strategy */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Hashtag Strategy</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">Use 3–5 hashtags per post, at the very end. LinkedIn deprioritised hashtag discovery in 2024 — they no longer drive reach the way they once did. Their value is now categorical (helping LinkedIn understand your content type) not distributional.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#E08040" }}>Core Brand Tags</p>
              <div className="flex flex-wrap gap-2">
                {["#Resilium", "#PersonalResilience", "#ResiliencePlanning", "#KnowYourReadiness"].map((tag) => (
                  <span key={tag} className="text-xs font-mono px-2.5 py-1 rounded-full text-white" style={{ background: "#0D1225" }}>{tag}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#E08040" }}>Topic Tags (rotate)</p>
              <div className="flex flex-wrap gap-2">
                {["#FinancialResilience", "#EmergencyPreparedness", "#PersonalFinance", "#MentalHealth", "#FutureOfWork", "#ClimateResilience"].map((tag) => (
                  <span key={tag} className="text-xs font-mono px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{tag}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#E08040" }}>Audience Tags (selective)</p>
              <div className="flex flex-wrap gap-2">
                {["#Leadership", "#WellBeing", "#FutureReady", "#PersonalDevelopment", "#Productivity"].map((tag) => (
                  <span key={tag} className="text-xs font-mono px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">KPIs & What to Track</h2>
        </div>
        <div className="p-6">
          <div className="rounded-xl overflow-hidden border border-gray-100">
            <div className="grid grid-cols-12 px-4 py-2 border-b border-gray-100 bg-gray-50">
              <span className="col-span-3 text-xs font-semibold text-gray-500">Metric</span>
              <span className="col-span-2 text-xs font-semibold text-gray-500">Target</span>
              <span className="col-span-7 text-xs font-semibold text-gray-500">Why it matters</span>
            </div>
            {[
              { metric: "Engagement rate", target: "2–4%", why: "Likes + comments + shares ÷ impressions. LinkedIn average is 1.5% — above 2% is strong for a new page." },
              { metric: "Comment:like ratio", target: "> 0.1", why: "Comments signal real resonance. 1 comment per 10 likes is a baseline. 1 per 5 is excellent. Prioritise posts that get comments over posts that get likes." },
              { metric: "Follower growth rate", target: "+10–20%/month (early)", why: "Absolute numbers matter less than trajectory. Early growth from 0–500 is the hardest phase — expect slow starts." },
              { metric: "Profile views / post", target: "Track trend", why: "A spike in profile views after a post means your hook pulled people in. High impressions + low profile views = good reach, weak hook." },
              { metric: "Click-through (if linked)", target: "> 1.5%", why: "LinkedIn suppresses link posts in the algorithm. When you do link, the CTR bar is high. Use links sparingly — max 1× per week, and put the link in the first comment, not the post body." },
              { metric: "Impression reach", target: "Track weekly avg", why: "Weekly impression average tells you if your content is being pushed outside your followers. A rising average = algorithm is amplifying you." },
            ].map(({ metric, target, why }) => (
              <div key={metric} className="grid grid-cols-12 px-4 py-3 border-b border-gray-50 last:border-b-0 hover:bg-gray-50">
                <span className="col-span-3 text-xs font-semibold text-gray-900 self-start pt-0.5">{metric}</span>
                <span className="col-span-2 text-xs font-bold self-start pt-0.5" style={{ color: "#E08040" }}>{target}</span>
                <span className="col-span-7 text-xs text-gray-600 leading-relaxed">{why}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-amber-100 p-4" style={{ background: "#FEF7F0" }}>
            <p className="text-xs font-semibold mb-1" style={{ color: "#E08040" }}>Review cadence</p>
            <p className="text-sm text-gray-700">Check post-level stats at 24h and 7 days. Note which pillar and hook pattern performed best each week. After 4 weeks, double down on the top-performing pillar and retire the weakest format. Re-evaluate every 30 days.</p>
          </div>
        </div>
      </div>

      {/* Content Calendar Template */}
      <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b" style={{ background: "#0D1225", borderColor: "rgba(255,255,255,0.08)" }}>
          <h2 className="text-base font-bold text-white">Month 1 Launch Plan</h2>
          <p className="text-xs mt-1" style={{ color: "#8A7A6A" }}>Suggested post topics for the first 4 weeks. Adapt freely — the pillar balance matters more than the exact topic.</p>
        </div>
        <div className="p-6 space-y-4" style={{ background: "#0D1225" }}>
          {[
            {
              week: "Week 1 — Establish",
              posts: [
                { day: "Tue", pillar: "Clarity", topic: "The 6 dimensions of resilience — what they are and why they all matter" },
                { day: "Thu", pillar: "Readiness", topic: "Unpopular opinion: preparedness isn't about disasters. It's about the everyday." },
                { day: "Fri", pillar: "Product", topic: "What Resilium actually is — and why it takes 10 minutes" },
              ]
            },
            {
              week: "Week 2 — Educate",
              posts: [
                { day: "Tue", pillar: "Clarity", topic: "The stat that made us build Resilium: 56% of adults, less than 3 months of savings" },
                { day: "Wed", pillar: "Readiness", topic: "What 'being prepared' actually means in 2026 (it's not what most people think)" },
                { day: "Fri", pillar: "Perspective", topic: "Job loss, health events, climate disruption — the 3 crises most families will face in a decade" },
              ]
            },
            {
              week: "Week 3 — Deepen",
              posts: [
                { day: "Tue", pillar: "Clarity", topic: "Financial resilience deep-dive: why savings is just the start" },
                { day: "Thu", pillar: "Progress", topic: "Resilience doesn't require a perfect score. It requires a next step." },
                { day: "Fri", pillar: "Product", topic: "Household mode: why individual assessments miss the point for families" },
              ]
            },
            {
              week: "Week 4 — Build momentum",
              posts: [
                { day: "Tue", pillar: "Clarity", topic: "The dimension most people skip — and why it's the most revealing" },
                { day: "Wed", pillar: "Readiness", topic: "Resilience as a life skill: what it looks like when you've built it" },
                { day: "Thu", pillar: "Progress", topic: "What changes after you know your score (the real answer isn't 'everything')" },
                { day: "Fri", pillar: "Perspective", topic: "Why resilience planning is the self-improvement category nobody's built well — until now" },
              ]
            },
          ].map(({ week, posts }) => (
            <div key={week} className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="px-4 py-2.5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <p className="text-xs font-bold text-white">{week}</p>
              </div>
              <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                {posts.map(({ day, pillar, topic }) => (
                  <div key={topic} className="flex items-start gap-4 px-4 py-3">
                    <span className="text-xs font-semibold w-8 flex-shrink-0 pt-0.5" style={{ color: "#E08040" }}>{day}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: "rgba(224,128,64,0.15)", color: "#E08040" }}>{pillar}</span>
                    <span className="text-xs leading-relaxed" style={{ color: "#EAD9BE" }}>{topic}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
