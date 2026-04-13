/* Competitor Monitoring Brief — Rich React Component
   Visual style matches competitive-analysis.tsx
   Overlap note: Escalation triggers here are reactive monitoring triggers.
   Strategic action plan in response to competitor moves lives in the Competitive Analysis tab.
*/

const TODAY = "April 13, 2026";

const COMPETITORS = [
  { name: "ReadyScore", url: "readyscore.com", priority: "High", frequency: "As it happens", notes: "Doubling down on prepper niche; watch for Pro tier or mobile app launch" },
  { name: "Coached.com", url: "coached.com", priority: "Medium", frequency: "Once a week", notes: "Pivoted away from resilience; 1.2M users are a threat if they pivot back" },
  { name: "IDR Labs", url: "idrlabs.com", priority: "Low", frequency: "Once a week", notes: "Static test aggregator; monitor for new product launches" },
  { name: "BetterUp", url: "betterup.com", priority: "High", frequency: "As it happens", notes: "BetterUp Ready™ launched 2025; watch for consumer / self-service path" },
  { name: "Driven Resilience (PR6)", url: "home.hellodriven.com", priority: "Medium", frequency: "Once a week", notes: "Expanding to individuals; watch US market entry and USD pricing" },
  { name: "FEMA / Red Cross", url: "ready.gov / redcross.org", priority: "Low", frequency: "Monthly", notes: "Government / nonprofit; monitor for new app feature updates only" },
];

const ALERTS = [
  {
    competitor: "ReadyScore",
    priority: "High",
    color: "#E08040",
    links: [
      { label: "Brand + product", url: "https://www.google.com/alerts?q=%22ReadyScore%22+preparedness+OR+emergency&hl=en&gl=us&source=web" },
      { label: "Pricing / Pro tier watch", url: "https://www.google.com/alerts?q=%22readyscore.com%22+pricing+OR+pro+OR+premium+OR+paid&hl=en&gl=us&source=web" },
      { label: "Funding / press", url: "https://www.google.com/alerts?q=%22ReadyScore%22+raises+OR+funding+OR+launch+OR+partner&hl=en&gl=us&source=web" },
    ],
  },
  {
    competitor: "BetterUp",
    priority: "High",
    color: "#E08040",
    links: [
      { label: "BetterUp Ready™ specifically", url: "https://www.google.com/alerts?q=%22BetterUp+Ready%22&hl=en&gl=us&source=web" },
      { label: "Consumer pivot watch", url: "https://www.google.com/alerts?q=%22BetterUp%22+consumer+OR+individual+OR+self-service+OR+B2C&hl=en&gl=us&source=web" },
      { label: "Funding / IPO", url: "https://www.google.com/alerts?q=%22BetterUp%22+raises+OR+valuation+OR+IPO+OR+acquisition&hl=en&gl=us&source=web" },
    ],
  },
  {
    competitor: "Coached.com",
    priority: "Medium",
    color: "#6366f1",
    links: [
      { label: "Re-pivot watch", url: "https://www.google.com/alerts?q=%22Coached.com%22+resilience+OR+new+OR+launch+OR+feature&hl=en&gl=us&source=web" },
      { label: "Brand mentions", url: "https://www.google.com/alerts?q=%22Coached.com%22+personality+OR+career&hl=en&gl=us&source=web" },
    ],
  },
  {
    competitor: "Driven Resilience / PR6",
    priority: "Medium",
    color: "#6366f1",
    links: [
      { label: "Brand mentions", url: "https://www.google.com/alerts?q=%22Driven+Resilience%22+OR+%22Hello+Driven%22+OR+%22PR6+resilience%22&hl=en&gl=us&source=web" },
      { label: "US expansion watch", url: "https://www.google.com/alerts?q=%22Driven+Resilience%22+US+OR+America+OR+individual+OR+consumer&hl=en&gl=us&source=web" },
    ],
  },
  {
    competitor: "IDR Labs",
    priority: "Low",
    color: "#6b7280",
    links: [
      { label: "Brand + new tests", url: "https://www.google.com/alerts?q=%22IDR+Labs%22+resilience+OR+new+OR+test&hl=en&gl=us&source=web" },
    ],
  },
  {
    competitor: "Category-wide new entrants",
    priority: "High",
    color: "#E08040",
    links: [
      { label: "Consumer resilience apps", url: "https://www.google.com/alerts?q=%22resilience+app%22+OR+%22resilience+score%22+launch+OR+new+OR+raises+OR+seed&hl=en&gl=us&source=web" },
      { label: "Preparedness startups", url: "https://www.google.com/alerts?q=%22emergency+preparedness+app%22+funding+OR+launch+OR+product+hunt&hl=en&gl=us&source=web" },
    ],
  },
];

const BOOKMARKS = [
  {
    competitor: "ReadyScore",
    links: [
      { label: "Homepage / product", url: "https://readyscore.com/" },
      { label: "Wayback Machine (pricing history)", url: "https://web.archive.org/web/2024*/readyscore.com" },
      { label: "LinkedIn", url: "https://www.linkedin.com/company/readyscore/" },
      { label: "G2 search", url: "https://www.g2.com/search?query=readyscore" },
      { label: "Product Hunt", url: "https://www.producthunt.com/search?q=readyscore" },
    ],
  },
  {
    competitor: "BetterUp",
    links: [
      { label: "Homepage", url: "https://www.betterup.com/" },
      { label: "BetterUp Ready™", url: "https://www.betterup.com/products/betterup-ready" },
      { label: "Pricing (check quarterly)", url: "https://www.betterup.com/pricing" },
      { label: "Platform releases / changelog", url: "https://www.betterup.com/platform-releases" },
      { label: "LinkedIn jobs (roadmap signal)", url: "https://www.linkedin.com/company/betterup/jobs/" },
      { label: "G2 reviews", url: "https://www.g2.com/products/betterup/reviews" },
    ],
  },
  {
    competitor: "Coached.com",
    links: [
      { label: "Homepage (pivoted to career tests)", url: "https://coached.com/" },
      { label: "Resilience tool (now secondary)", url: "https://coached.com/tools/personal-resilience-scale" },
      { label: "LinkedIn jobs", url: "https://www.linkedin.com/company/coached-com/jobs/" },
      { label: "G2 search", url: "https://www.g2.com/search?query=coached" },
    ],
  },
  {
    competitor: "Driven Resilience (PR6)",
    links: [
      { label: "Homepage", url: "https://home.hellodriven.com/" },
      { label: "Course shop", url: "https://home.hellodriven.com/shop/" },
      { label: "Blog", url: "https://home.hellodriven.com/blog/" },
      { label: "LinkedIn jobs", url: "https://www.linkedin.com/company/hello-driven/jobs/" },
      { label: "G2 search", url: "https://www.g2.com/search?query=driven+resilience" },
    ],
  },
  {
    competitor: "IDR Labs",
    links: [
      { label: "Homepage", url: "https://idrlabs.com/" },
      { label: "Resilience test", url: "https://idrlabs.com/personal-resilience/test.php" },
    ],
  },
  {
    competitor: "FEMA / Red Cross",
    links: [
      { label: "FEMA Ready", url: "https://www.ready.gov/" },
      { label: "Red Cross mobile apps", url: "https://www.redcross.org/get-help/how-to-prepare-for-emergencies/mobile-apps.html" },
      { label: "FEMA app updates", url: "https://www.fema.gov/about/news-multimedia/mobile-app" },
    ],
  },
];

const RITUAL = [
  { time: "0–5 min", task: "Check Google Alert email digest", watch: "Press coverage, blog posts, product announcements since last month" },
  { time: "5–10 min", task: "Open BetterUp Ready™ page + LinkedIn jobs", watch: "New job titles: 'consumer', 'B2C', 'self-service' = pivot risk. New features on Ready™ page?" },
  { time: "10–14 min", task: "Open ReadyScore homepage (curl if needed)", watch: "Changed framing? New categories? Signs of Pro tier? Mobile app?" },
  { time: "14–17 min", task: "Open Coached.com homepage", watch: "Any return to resilience positioning? New pricing tier?" },
  { time: "17–20 min", task: "Open Driven Resilience shop", watch: "New USD pricing? US-targeted content? Consumer app launch?" },
  { time: "20–24 min", task: "Search Product Hunt: 'resilience score' 'preparedness app'", watch: "Any new consumer entrant not caught by Google Alerts" },
  { time: "24–27 min", task: "Run curl on any new entrant homepage found", watch: "Apply research chain if JS-rendered: meta tags → JS bundle extraction" },
  { time: "27–30 min", task: "Update Change Log below", watch: "One row per finding. Flag escalation triggers." },
];

const ESCALATION = [
  { trigger: "BetterUp announces a consumer / self-service tier", why: "Well-funded, proof-backed direct competitor overnight", response: "Update competitive analysis; accelerate Pro differentiation; consider direct response SEO content" },
  { trigger: "New consumer resilience app raises >$1M", why: "White space has been spotted by funded operators", response: "Identify their angle; find the gap within the gap; accelerate the unique financial dimension positioning" },
  { trigger: "ReadyScore launches a Pro tier or mobile app", why: "Closes their biggest weaknesses; format match intensifies", response: "Accelerate mainstream framing SEO; publish direct comparison content" },
  { trigger: "Coached.com re-pivots back to resilience", why: "1.2M user base + quality UX is a serious headstart", response: "Monitor closely; differentiate sharply on financial + material dimensions they lack" },
  { trigger: "Driven Resilience launches a US consumer app or USD pricing", why: "PR6's scientific credibility + consumer model = strong positioning", response: "Compete on action planning and financial dimension; emphasize scientific parity (CD-RISC)" },
];

const CHANGELOG = [
  { date: "Apr 13, 2026", competitor: "Coached.com", change: "Pivoted main product to career/personality test; 1.2M+ users. Resilience tool demoted to secondary /tools/ page.", action: "Competitive analysis updated — priority downgraded from Medium to Watch" },
  { date: "Apr 13, 2026", competitor: "BetterUp", change: "Launched BetterUp Ready™ — dedicated workforce resilience product with human + AI coaching, Personal Concierge, longitudinal ROI tracking.", action: "Priority upgraded to High; consumer pivot flagged as top escalation trigger" },
  { date: "Apr 13, 2026", competitor: "Driven Resilience", change: "Rebranded from Hello Driven; now sells individual courses/certifications (AUD pricing) via shop. Branding updated August 2025.", action: "Noted partial consumer expansion; US reach still limited" },
  { date: "Apr 13, 2026", competitor: "Batten.app", change: "'Under construction' — effectively shut down despite raising $6M in 2021.", action: "Confirms no new funded direct competitor entered the space" },
  { date: "Apr 13, 2026", competitor: "ReadyScore", change: "Updated copyright to 2026; launching 'Prep Like Noah' book; messaging hardened around survivalist framing.", action: "Widened mainstream gap assessment; opportunity confirmed" },
  { date: "Apr 2026", competitor: "—", change: "Initial monitoring brief created.", action: "First research pass completed" },
];

function PriorityBadge({ priority }: { priority: string }) {
  const color = priority === "High" ? "bg-orange-100 text-orange-700" : priority === "Medium" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600";
  return <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${color}`}>{priority}</span>;
}

export default function CompetitorMonitoringDoc() {
  const NAVS = ["competitors", "alerts", "bookmarks", "ritual", "escalation", "changelog"];

  return (
    <div className="min-h-screen bg-[#F7F7FA] font-sans">
      {/* Header */}
      <div className="bg-[#0D1225] text-white px-8 py-5 flex items-center justify-between sticky top-0 z-50 shadow-xl">
        <div>
          <span className="text-[#E08040] font-bold text-lg tracking-tight">Resilium</span>
          <span className="text-gray-400 text-sm ml-3">Competitor Monitoring Brief · {TODAY}</span>
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

        {/* Competitors Overview */}
        <section id="competitors">
          <div className="bg-[#0D1225] rounded-2xl p-8 mb-8">
            <p className="text-[#EAD9BE] text-xs uppercase tracking-widest mb-2">Last updated: {TODAY}</p>
            <h1 className="text-3xl font-bold text-white mb-2">Competitor Monitoring Brief</h1>
            <p className="text-gray-400 text-sm">6 competitors tracked · Google Alerts configured · 30-minute monthly ritual · Escalation playbooks defined</p>
          </div>

          <div className="bg-orange-50 border border-[#E08040]/30 rounded-2xl p-5 mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-[#E08040] mb-2">On-Demand Research Command</p>
            <p className="text-xs text-gray-600 mb-2">Paste this at any time to run a full competitive check:</p>
            <div className="bg-[#0D1225] rounded-xl p-3">
              <p className="text-green-400 text-xs font-mono leading-relaxed">
                Run my monthly competitive check for Resilium. Check: ReadyScore, Coached.com, IDR Labs, BetterUp (especially BetterUp Ready™), Driven Resilience/PR6, and any new consumer resilience or preparedness apps. Update competitor-monitoring.md with your findings.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0D1225] text-white">
                  <th className="text-left px-4 py-3 font-semibold text-sm">Competitor</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm">URL</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm">Priority</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm">Alert Frequency</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm">Notes</th>
                </tr>
              </thead>
              <tbody>
                {COMPETITORS.map((c, i) => (
                  <tr key={c.name} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    <td className="px-4 py-3 font-semibold text-gray-900 text-xs whitespace-nowrap">{c.name}</td>
                    <td className="px-4 py-3 text-xs">
                      <a href={`https://${c.url.split(" ")[0]}`} target="_blank" rel="noopener noreferrer" className="text-[#E08040] hover:underline font-mono">{c.url}</a>
                    </td>
                    <td className="px-4 py-3 text-xs"><PriorityBadge priority={c.priority} /></td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{c.frequency}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 leading-snug">{c.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Google Alerts */}
        <section id="alerts">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Google Alert Links</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-3" />
          <p className="text-sm text-gray-500 mb-6">Click each link once to activate. Set "As it happens" for High priority competitors. "Once a week" for Medium. Deliver to a dedicated alias (e.g. <span className="font-mono text-xs bg-gray-100 px-1 rounded">resilium-competitive@</span>) to keep your main inbox clean.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ALERTS.map((a) => (
              <div key={a.competitor} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-gray-900 text-sm">{a.competitor}</p>
                  <PriorityBadge priority={a.priority} />
                </div>
                <ul className="space-y-2">
                  {a.links.map((l) => (
                    <li key={l.label}>
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#E08040] hover:underline flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: a.color }} />
                        {l.label}
                        <span className="text-gray-300 text-[10px]">↗</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Bookmark Bundle */}
        <section id="bookmarks">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Bookmark Bundle</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-3" />
          <p className="text-sm text-gray-500 mb-6">Save these in a browser folder: <span className="font-mono text-xs bg-gray-100 px-1 rounded">🔍 Resilium Competitive</span></p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BOOKMARKS.map((b) => (
              <div key={b.competitor} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <p className="font-bold text-gray-900 text-xs mb-3 uppercase tracking-wider">{b.competitor}</p>
                <ul className="space-y-1.5">
                  {b.links.map((l) => (
                    <li key={l.label}>
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#E08040] hover:underline flex items-start gap-1.5">
                        <span className="mt-1 w-1 h-1 rounded-full bg-[#E08040] flex-shrink-0" />
                        <span>{l.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Monthly Ritual */}
        <section id="ritual">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">30-Minute Monthly Ritual</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-3" />
          <p className="text-sm text-gray-500 mb-6">Run on the <strong>first Monday of each month</strong>. Log all findings in the Change Log section below.</p>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0D1225] text-white">
                  <th className="text-left px-4 py-3 font-semibold text-sm whitespace-nowrap">Time</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm">Task</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm">What to Watch For</th>
                </tr>
              </thead>
              <tbody>
                {RITUAL.map((r, i) => (
                  <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    <td className="px-4 py-3 text-[#E08040] font-bold text-xs whitespace-nowrap">{r.time}</td>
                    <td className="px-4 py-3 text-gray-800 text-xs font-medium leading-snug">{r.task}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs leading-snug">{r.watch}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Escalation Triggers */}
        <section id="escalation">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Escalation Triggers</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-3" />
          <p className="text-sm text-gray-500 mb-6">
            Re-run the full competitive analysis and update strategy immediately if any of these occur.
            Strategic responses to competitor moves (SEO pivots, product differentiation) are in the <strong>Competitive Analysis tab</strong>.
          </p>
          <div className="space-y-3">
            {ESCALATION.map((e, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="flex gap-4 items-start">
                  <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-600 text-xs font-bold">!</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 mb-1">{e.trigger}</p>
                    <p className="text-xs text-gray-500 mb-2"><span className="font-semibold text-gray-700">Why it matters:</span> {e.why}</p>
                    <div className="bg-orange-50 border border-[#E08040]/20 rounded-lg px-3 py-2">
                      <p className="text-xs text-gray-700"><span className="font-semibold text-[#E08040]">Response:</span> {e.response}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Change Log */}
        <section id="changelog">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Change Log</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-6" />
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0D1225] text-white">
                  <th className="text-left px-4 py-3 font-semibold text-sm whitespace-nowrap">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm">Competitor</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm">What Changed</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm">Action Taken</th>
                </tr>
              </thead>
              <tbody>
                {CHANGELOG.map((c, i) => (
                  <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    <td className="px-4 py-3 text-[#E08040] font-bold text-xs whitespace-nowrap">{c.date}</td>
                    <td className="px-4 py-3 text-gray-900 font-semibold text-xs whitespace-nowrap">{c.competitor}</td>
                    <td className="px-4 py-3 text-gray-700 text-xs leading-snug">{c.change}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs leading-snug italic">{c.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">
            Research methodology: direct homepage fetches (curl), product page analysis, LinkedIn, App Store, web searches. No paid CI tools. SimilarWeb estimates not used (unreliable below 50K visits/month).
          </p>
        </section>

      </div>
    </div>
  );
}
