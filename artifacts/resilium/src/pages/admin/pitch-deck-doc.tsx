const DATE = "April 2026";

const SLIDES = [
  {
    num: "01",
    title: "Title — Resilium",
    category: "Cover",
    color: "#E08040",
    summary: "Personal Resilience Planning platform. Tagline: 'Know how ready you really are.' Available on Web and iOS. Free to start.",
    keyPoints: [
      "Domain: resilium-platform.com",
      "Tech stack callout: Web · Mobile · API · AI",
      "Lead message: Free to start · Web · iOS",
    ],
  },
  {
    num: "02",
    title: "The Problem — Disruption doesn't announce itself",
    category: "Problem",
    color: "#6366f1",
    summary: "Most individuals face serious disruptions — job loss, health crises, natural disaster — without a clear picture of their own readiness. Gut feel is not a plan.",
    keyPoints: [
      "56% of Americans have less than 3 months of emergency savings (Bankrate 2024)",
      "No map for uncertainty: people face crises without structured readiness assessment",
      "Gut feel is not a plan: false confidence or quiet anxiety — neither helps people act",
    ],
  },
  {
    num: "03",
    title: "The Solution — A personal resilience score",
    category: "Solution",
    color: "#10b981",
    summary: "Three pillars: structured 14-step assessment, AI-generated report, and active progress tracking with daily engagement features.",
    keyPoints: [
      "14-step assessment: 6 weighted dimensions in under 10 minutes — individual or household; English & Romanian",
      "AI-generated report: gpt-5.4 produces 0–100 score, top vulnerabilities, 4 scenario stress-tests, personalised action plan. AI Companion (gpt-4.1-mini) answers follow-up questions",
      "Track progress: daily coaching tips, streak tracking, achievement badges, 30-day challenge. Pro unlocks scenario simulations, AI Companion, and offline plan access",
      "Positioning: Grounded. Strategic. Empowering — not alarmist.",
    ],
  },
  {
    num: "04",
    title: "Who It's For — The quietly prepared",
    category: "Audience",
    color: "#E08040",
    summary: "Not doomsday preppers. People who look at an uncertain world and want a clear-eyed plan — not anxiety.",
    keyPoints: [
      "The Financially Anxious — stable income, uncertain future; want to know if their safety net is real",
      "Expats & Digital Nomads — managing multi-currency exposure and relocation risk",
      "Preparedness Planners — already thinking ahead; want an objective score, not guesswork",
      "The Cautiously Aware — don't call themselves preppers, but quietly paying attention",
      "Families & Households — want a shared readiness score, not separate plans",
    ],
  },
  {
    num: "05a",
    title: "The Product — Four steps to prepared",
    category: "Product",
    color: "#6366f1",
    summary: "A clear four-step user journey from first assessment to ongoing improvement and coaching referral.",
    keyPoints: [
      "Step 1: 14-question assessment across 7 life dimensions",
      "Step 2: Get a 0–100 score and AI-generated stress-tests",
      "Step 3: Personalised action plan with daily habits and checklists",
      "Step 4: Reassess month-over-month; connect with a coach if needed",
    ],
  },
  {
    num: "05b",
    title: "Testimonial — Pauline H.",
    category: "Social Proof",
    color: "#10b981",
    summary: "Unsolicited endorsement from a holistic & executive performance coach.",
    keyPoints: [
      "'Definitely following this project. As a holistic & executive performance coach, this is definitely something I'd love to get my clients to use.'",
      "— Pauline H., Holistic & Executive Performance Coach",
    ],
  },
  {
    num: "06",
    title: "Plans & Pricing — Start free. Upgrade when it matters.",
    category: "Monetisation",
    color: "#E08040",
    summary: "Three tiers designed around how seriously users want to take their readiness — not how much can be extracted from them.",
    keyPoints: [
      "Free: 3 full assessments · full AI report and action plan · no account required for first run",
      "Pro (unlimited assessments): full progress history, crisis scenario simulations, resilience resume, AI Companion, offline plan access — web and mobile",
      "Coaching: if psychological resilience score signals support need, Resilium surfaces a direct path to a human coach",
    ],
  },
  {
    num: "07",
    title: "Why Resilium — Not fear. Clarity.",
    category: "Close",
    color: "#6366f1",
    summary: "A data-led summary of core value propositions: speed to first score, depth of assessment, and accessible entry point.",
    keyPoints: [
      "10 minutes to first score — no account required to start",
      "6 resilience dimensions — financial, health, skills, mobility, psychological, resources",
      "Individual & Household assessment modes",
      "0–100 score — clear, actionable, with top vulnerabilities and personalised plan",
      "Free to start — always — 3 full assessments before deciding on Pro",
    ],
  },
  {
    num: "08",
    title: "Final — Know your readiness. Build your resilience.",
    category: "CTA",
    color: "#E08040",
    summary: "Brand closing moment. Direct call to action.",
    keyPoints: [
      "resilium-platform.com",
      "Start free today — no account required",
    ],
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Cover":       "bg-orange-100 text-orange-700",
  "Problem":     "bg-red-100 text-red-700",
  "Solution":    "bg-emerald-100 text-emerald-700",
  "Audience":    "bg-amber-100 text-amber-700",
  "Product":     "bg-indigo-100 text-indigo-700",
  "Social Proof":"bg-teal-100 text-teal-700",
  "Monetisation":"bg-orange-100 text-orange-700",
  "Close":       "bg-indigo-100 text-indigo-700",
  "CTA":         "bg-orange-100 text-orange-700",
};

export default function PitchDeckDoc() {
  return (
    <div className="min-h-screen bg-[#F7F7FA] font-sans">
      <div className="bg-[#0D1225] text-white px-8 py-5 flex items-center justify-between sticky top-0 z-50 shadow-xl">
        <div>
          <span className="text-[#E08040] font-bold text-lg tracking-tight">Resilium</span>
          <span className="text-gray-400 text-sm ml-3">Pitch Deck · {DATE}</span>
        </div>
        <span className="text-xs text-gray-500 hidden sm:block">8 slides · resilium-platform.com</span>
      </div>

      <nav className="bg-white border-b border-gray-200 px-8 py-2 flex gap-4 text-xs font-medium text-gray-500 overflow-x-auto">
        {SLIDES.map(s => (
          <a key={s.num} href={`#slide-${s.num}`} className="hover:text-[#E08040] whitespace-nowrap transition-colors">
            {s.num} {s.category}
          </a>
        ))}
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">

        <div className="bg-[#0D1225] rounded-2xl p-8 mb-10">
          <p className="text-[#EAD9BE] text-xs uppercase tracking-widest mb-2">{DATE} · 8 Slides</p>
          <h1 className="text-3xl font-bold text-white mb-3">Pitch Deck — Slide Content Reference</h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-3xl">
            A structured summary of all pitch deck slides. The live animated deck is accessible at the pitch deck preview URL. This reference is intended for quick review of messaging, data points, and slide-by-slide positioning decisions.
          </p>
        </div>

        <div className="space-y-6">
          {SLIDES.map((slide) => (
            <div key={slide.num} id={`slide-${slide.num}`} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-stretch">
                <div
                  className="flex-shrink-0 w-2 rounded-l-2xl"
                  style={{ backgroundColor: slide.color }}
                />
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="text-3xl font-black leading-none"
                        style={{ color: slide.color, fontFamily: "Plus Jakarta Sans, sans-serif" }}
                      >
                        {slide.num}
                      </span>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{slide.title}</div>
                        <div className="mt-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${CATEGORY_COLORS[slide.category] ?? "bg-gray-100 text-gray-600"}`}>
                            {slide.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4 italic">{slide.summary}</p>
                  <div className="border-t border-gray-100 pt-4">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Key Points</div>
                    <ul className="space-y-1.5">
                      {slide.keyPoints.map((point, i) => (
                        <li key={i} className="flex gap-2 items-start text-xs text-gray-700">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: slide.color }} />
                          <span className="leading-snug">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-orange-50 border border-[#E08040]/30 rounded-2xl p-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#E08040] mb-2">Live Deck</p>
          <p className="text-sm text-gray-700">The animated pitch deck is available in the pitch deck preview (Resilium Pitch Deck artifact). Slide order: Title → Problem → Solution → Audience → Product → Testimonial → Pricing → Close → Final.</p>
        </div>
      </div>
    </div>
  );
}
