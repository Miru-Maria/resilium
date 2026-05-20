export type SlideBg = "alt" | "dark";
export type SlideType = "score-bands" | "icon-grid" | "pillars" | "numbered";

export interface Slide {
  bg: SlideBg;
  lines: string[];
  isHook?: boolean;
  isCta?: boolean;
  slideType?: SlideType;
}

export interface IGPost {
  id: number;
  week: string;
  day: "Mon" | "Wed" | "Fri" | "Sat";
  type: "carousel" | "single" | "quote";
  topic: string;
  slides?: Slide[];
  imageLines?: string[];
  caption: string;
  hashtags: string;
}

export const IG_POSTS: IGPost[] = [
  // ─── WEEK 1 ───────────────────────────────────────────────────────────────
  {
    id: 1, week: "W1", day: "Mon", type: "carousel",
    topic: "6 dimensions of resilience",
    slides: [
      { bg: "alt", isHook: true, lines: ["Your resilience has 6 dimensions.", "Most people only think about 1."] },
      { bg: "dark", lines: ["1. Financial", "Do you have 3–6 months of expenses saved?", "Multiple income streams?", "No single point of failure?"] },
      { bg: "dark", lines: ["2. Health", "Can you access care if your insurance gaps?", "Do you have a 30-day medication supply?", "Is your health a risk factor in a crisis?"] },
      { bg: "dark", lines: ["3. Skills & Career", "Are your skills in demand beyond your current job?", "Could you freelance or consult if you had to?", "When did you last learn something new?"] },
      { bg: "dark", lines: ["4. Mobility", "If you needed to relocate in 30 days, could you?", "Do you have a valid passport?", "Is your life geographically flexible?"] },
      { bg: "dark", lines: ["5. Emergency Resources", "72-hour kit ready?", "Important documents backed up?", "Do you know your local emergency contacts?"] },
      { bg: "dark", isCta: true, lines: ["6. Mental Resilience", "Can you think clearly under pressure?", "Do you have people to lean on?", "Score all 6 — free in under 5 minutes.", "resilium-platform.com · Link in bio ↑"] },
    ],
    caption: "Most people think resilience means having savings. But financial resilience is just one of six dimensions that determine how prepared you actually are.\n\nWhen disruption hits — a layoff, a health scare, a geopolitical shift — it rarely attacks just one area of your life. It cascades.\n\nResilium scores you across all six, shows you where your gaps are, and gives you a prioritized plan to close them. Free assessment, under 5 minutes.\n\nWhat's your weakest dimension? Drop it in the comments 👇",
    hashtags: "#personalresilience #financialpreparedness #emergencypreparedness #personaldevelopment #riskmanagement #lifeplanning #financialplanning #selfimprovement #mindset #preparedness #resiliencetraining #financialfreedom #lifeskills #careerdevelopment #futureproof",
  },
  {
    id: 2, week: "W1", day: "Wed", type: "single",
    topic: "$1k emergency stat",
    imageLines: ["The average American has less than $1,000 in emergency savings.", "The average person has never scored their resilience.", "These two facts are related."],
    caption: "Resilience isn't built in a crisis. It's built in the quiet moments when you decide to look honestly at where you stand.\n\nResilium gives you an objective score across 6 dimensions in under 5 minutes. Free at resilium-platform.com.",
    hashtags: "#financialresilience #emergencyfund #personalfinance #financialplanning #moneymindset #preparedness #financialfreedom #wealthbuilding #financialliteracy #moneymanagement",
  },
  {
    id: 3, week: "W1", day: "Fri", type: "quote",
    topic: "Cristiana founder quote",
    imageLines: [
      "\u201cResilience isn\u2019t about being unbreakable.\nIt\u2019s about knowing exactly where you\u2019d bend \u2014\nbefore the pressure finds you.\u201d",
      "\u2014 Cristiana, founder of Resilium",
    ],
    caption: "Building Resilium started with a simple question: if everything changed tomorrow, would I be ready?\n\nMost of us don't ask it until we have to. That's what we're changing.\n\nresilium-platform.com",
    hashtags: "#founderquote #resilience #personaldevelopment #mindset #preparedness #futureproof #womenfounder #resiliumplatform",
  },

  // ─── WEEK 2 ───────────────────────────────────────────────────────────────
  {
    id: 4, week: "W2", day: "Mon", type: "carousel",
    topic: "5 signs you're less prepared",
    slides: [
      { bg: "alt", isHook: true, lines: ["5 signs you're less prepared than you think.", "(Most people have at least 3.)"] },
      { bg: "dark", lines: ["Sign 1: Your emergency fund would last less than 2 months.", "The recommended buffer is 3–6 months.", "A sudden job loss would be an immediate crisis."] },
      { bg: "dark", lines: ["Sign 2: Your income comes from exactly one source.", "One layoff. One client. One contract.", "Single point of failure."] },
      { bg: "dark", lines: ["Sign 3: You couldn't work remotely or freelance if you had to.", "Your skills are tied to your current employer.", "No portability = no options."] },
      { bg: "dark", lines: ["Sign 4: Your passport is expired — or you don't have one.", "Relocation readiness is a resilience dimension few people track.", "But when you need it, you need it fast."] },
      { bg: "dark", isCta: true, lines: ["Sign 5: You've never actually assessed your preparedness.", "You're going on gut feel.", "Get an objective score — free.", "resilium-platform.com · Link in bio ↑"] },
    ],
    caption: "Preparedness isn't dramatic. It doesn't look like a bunker. It looks like boring decisions made consistently over time.\n\nBut most of us have never stopped to honestly measure where we stand. We assume we're \"probably fine.\"\n\nResilium removes the guesswork. How many of these apply to you? Be honest 👇",
    hashtags: "#financialpreparedness #personalfinance #emergencypreparedness #riskmanagement #financialplanning #moneytips #preparedness #lifeplanning #financialliteracy #selfassessment",
  },
  {
    id: 5, week: "W2", day: "Wed", type: "single",
    topic: "Score example: 34 vs 71",
    imageLines: ["Score: 34/100\nHighest risk: Financial + Mobility\nNext step: Build 2-month emergency fund first.", "Score: 71/100\nStrongest: Skills + Mental\nNext step: Diversify income streams.", "Your score tells you exactly what to fix first."],
    caption: "A resilience score isn't a judgment. It's a map.\n\nIt shows you where your gaps are, which ones matter most given your situation, and what to work on first — in plain language, not jargon.\n\nFree at resilium-platform.com.",
    hashtags: "#personalresilience #financialplanning #selfimprovement #preparedness #emergencyfund #goalsetting #lifeplanning #financialfreedom",
  },
  {
    id: 6, week: "W2", day: "Sat", type: "quote",
    topic: "60% couldn't cover $1k",
    imageLines: ["60% of Americans couldn't cover a $1,000 emergency without debt.", "Are you in that 60%?\nOr do you just think you're not?"],
    caption: "The uncomfortable truth about financial resilience is that most people overestimate where they stand.\n\nYour Resilium score removes the guesswork. Free in under 5 minutes.\n\nresilium-platform.com",
    hashtags: "#financialliteracy #personalfinance #emergencyfund #moneymindset #financialpreparedness #wealthbuilding #moneymanagement",
  },

  // ─── WEEK 3 ───────────────────────────────────────────────────────────────
  {
    id: 7, week: "W3", day: "Mon", type: "carousel",
    topic: "Job loss scenario",
    slides: [
      { bg: "alt", isHook: true, lines: ["What happens to your life if you lose your job tomorrow?", "Let's actually walk through it."] },
      { bg: "dark", lines: ["Month 1: Severance covers rent. You're applying. Optimistic.", "Savings: still intact."] },
      { bg: "dark", lines: ["Month 2: No offer yet. Market is slow.", "Emergency fund starts dropping. Lifestyle cuts begin."] },
      { bg: "dark", lines: ["Month 3: Stress is affecting your health.", "Relationship tension rising. Credit card appears."] },
      { bg: "dark", lines: ["Month 4: The gap in your resume is now visible.", "You're applying for jobs you'd have turned down before."] },
      { bg: "dark", lines: ["Month 5: You accept a role below your level.", "It takes 18 months to recover income.", "It takes years to rebuild confidence."] },
      { bg: "dark", isCta: true, lines: ["This isn't pessimism. This is the median scenario.", "The difference between month 1 and month 5\nis preparation you did before any of this started.", "Know where you stand — free.", "resilium-platform.com · Link in bio ↑"] },
    ],
    caption: "Job loss scenarios play out in a very predictable sequence. The people who navigate them best aren't the luckiest — they prepared when they didn't have to.\n\nFree assessment, under 5 minutes. Have you stress-tested your finances against a 3-month gap? 👇",
    hashtags: "#jobsecurity #layoffs #financialpreparedness #emergencyfund #careeradvice #personalfinance #incomeplanning #financialliteracy #preparedness #careerdevelopment",
  },
  {
    id: 8, week: "W3", day: "Wed", type: "single",
    topic: "3 questions",
    imageLines: ["Three questions worth answering today:", "1. If your income stopped tomorrow, how long could you sustain your life?\n2. How many people in your network would hire you within 30 days?\n3. If you had to leave your city, could you be gone in a week?"],
    caption: "These aren't hypothetical. They're the exact gaps Resilium measures — and most people don't have clear answers to any of them.\n\nFree assessment at resilium-platform.com.",
    hashtags: "#financialpreparedness #careerresilience #personalfinance #preparedness #emergencyplanning #lifeplanning #selfassessment",
  },
  {
    id: 9, week: "W3", day: "Fri", type: "quote",
    topic: "Preparation isn't pessimism",
    imageLines: ["Preparation isn't pessimism.\nIt's the most optimistic thing you can do."],
    caption: "Optimists prepare. They believe the future is worth protecting.\n\nresilium-platform.com — free resilience assessment.",
    hashtags: "#mindset #resilience #personaldevelopment #preparedness #optimism #selfimprovement #lifeplanning #growthmindset",
  },

  // ─── WEEK 4 ───────────────────────────────────────────────────────────────
  {
    id: 10, week: "W4", day: "Mon", type: "carousel",
    topic: "90-day plan",
    slides: [
      { bg: "alt", isHook: true, lines: ["How to build real resilience in 90 days —", "without overhauling your life."] },
      { bg: "dark", lines: ["Step 1: Assess where you actually stand.", "Not where you think you stand.", "Get a score across 6 dimensions. Takes 5 minutes."] },
      { bg: "dark", lines: ["Days 1–30: Financial floor.", "Open a dedicated emergency account.", "Automate a weekly transfer into it.", "Identify one income diversification option."] },
      { bg: "dark", lines: ["Days 31–60: Skills & networks.", "Update your LinkedIn and resume.", "Reach out to 3 former colleagues.", "Identify one skill worth developing this quarter."] },
      { bg: "dark", lines: ["Days 61–90: Logistics.", "Check passport validity.", "Build a 72-hour emergency kit.", "Back up important documents digitally."] },
      { bg: "dark", lines: ["Reassess at 90 days.", "Most users see a 10–20 point score improvement.", "Small, consistent actions compound."] },
      { bg: "dark", isCta: true, lines: ["Start with step 1 — it's free.", "resilium-platform.com · Link in bio ↑"] },
    ],
    caption: "Resilience isn't built in a single dramatic moment. It's built in 20-minute sessions, repeated over weeks.\n\nSave this post — come back in 90 days and tell me how your score changed 👇",
    hashtags: "#personaldevelopment #financialpreparedness #90daychallenge #goalsetting #selfimprovement #financialplanning #preparedness #emergencyfund #lifeplanning #resiliencetraining",
  },
  {
    id: 11, week: "W4", day: "Wed", type: "single",
    topic: "Testimonial: score 41",
    imageLines: ["\u201cI thought I was pretty well prepared.\nMy Resilium score was 41.\nThat was the wake-up call I needed.\u201d"],
    caption: "The most common thing people say after their first Resilium assessment: \"I thought I was doing better than this.\"\n\nThe score isn't there to scare you. It's there to tell you the truth — so you can actually do something about it.\n\nFree at resilium-platform.com.",
    hashtags: "#personalresilience #selfassessment #financialplanning #preparedness #personaldevelopment #financialliteracy #selfawareness",
  },
  {
    id: 12, week: "W4", day: "Fri", type: "quote",
    topic: "Best time to prepare",
    imageLines: ["The best time to prepare was before you needed to.", "The second best time is now."],
    caption: "You already know this. The only question is whether you act on it.\n\nFree resilience assessment — resilium-platform.com.",
    hashtags: "#preparedness #resilience #personaldevelopment #mindset #financialplanning #selfimprovement #growthmindset #emergencypreparedness",
  },

  // ─── WEEK 5 ───────────────────────────────────────────────────────────────
  {
    id: 13, week: "W5", day: "Mon", type: "carousel",
    topic: "Financial dimension deep-dive",
    slides: [
      { bg: "alt", isHook: true, lines: ["Most people think they're financially resilient.", "The data says otherwise.", "Here's what actually gets measured."] },
      { bg: "dark", lines: ["Emergency fund depth", "Not just 'do you have savings' —\nbut how many months of real expenses it covers.", "Under 1 month: critical risk."] },
      { bg: "dark", lines: ["Income diversification", "One paycheck = one point of failure.", "Side income, freelance work, investments —\neach one adds a layer of protection."] },
      { bg: "dark", lines: ["Debt-to-income ratio", "High debt load is a resilience multiplier — in the wrong direction.", "It accelerates a crisis when income drops."] },
      { bg: "dark", lines: ["Insurance coverage gaps", "Health, disability, renters/homeowners.", "Most people are underinsured in at least one category.", "A single gap can wipe out years of savings."] },
      { bg: "dark", lines: ["Liquid vs. illiquid assets", "A 401k isn't an emergency fund.", "What can you access in 48 hours without penalty?", "That number is your true financial cushion."] },
      { bg: "dark", isCta: true, lines: ["Your financial resilience score tells you\nexactly where your vulnerabilities are.", "Free assessment — 5 minutes.", "resilium-platform.com · Link in bio ↑"] },
    ],
    caption: "Financial resilience isn't just about having money. It's about having money in the right places, in the right form, accessible when you need it.\n\nResilium scores your financial layer specifically, then shows you the fastest actions to strengthen it.\n\nWhat's your biggest financial vulnerability right now? 👇",
    hashtags: "#financialresilience #personalfinance #emergencyfund #financialplanning #moneymindset #incomestreams #financialliteracy #wealthbuilding #moneymanagement #financialfreedom #debtfree #sideincome #financialindependence",
  },
  {
    id: 14, week: "W5", day: "Wed", type: "single",
    topic: "21-day savings stat",
    imageLines: ["The median American household has enough savings\nto last 21 days without income.", "Three weeks.", "Is yours different?"],
    caption: "21 days isn't a buffer. It's a countdown.\n\nResilium's financial dimension score shows you exactly where you stand and what to fix first. Free at resilium-platform.com.",
    hashtags: "#personalfinance #emergencyfund #financialplanning #moneymindset #financialliteracy #wealthbuilding #financialresilience #savingsgoals",
  },
  {
    id: 15, week: "W5", day: "Sat", type: "quote",
    topic: "One income = one failure point",
    imageLines: ["One income stream isn't a salary.\nIt's a single point of failure."],
    caption: "Financial resilience starts with acknowledging this. What's step one for you?\n\nresilium-platform.com — score your financial resilience.",
    hashtags: "#passiveincome #multipleincome #financialindependence #sidehustle #incomestrategy #financialresilience #wealthbuilding #moneymindset",
  },

  // ─── WEEK 6 ───────────────────────────────────────────────────────────────
  {
    id: 16, week: "W6", day: "Mon", type: "carousel",
    topic: "Is your career portable?",
    slides: [
      { bg: "alt", isHook: true, lines: ["Your salary depends on your employer.", "Your resilience depends on your skills.", "These are not the same thing."] },
      { bg: "dark", lines: ["Employer-specific skills die with the job.", "If your value only works at one company,\nyou have no leverage when they don't need you anymore."] },
      { bg: "dark", lines: ["Portable skills travel with you.", "Writing, selling, analyzing, building, managing people —\nthese work anywhere. In any economy."] },
      { bg: "dark", lines: ["The portability test:", "Could you be hired by 3 different types of companies?", "Could you freelance your core skill?", "Could you consult if you had to tomorrow?"] },
      { bg: "dark", lines: ["Network density matters.", "A weak network means a long job search.", "Most people only grow their network when they need it — too late.", "Strong network = fast options."] },
      { bg: "dark", lines: ["The skill gap question:", "What skill, if you had it, would make you 50% more valuable?", "Are you actively building it?"] },
      { bg: "dark", isCta: true, lines: ["Resilium scores your skills & career dimension\nand tells you exactly where to invest your time.", "Free assessment — 5 minutes.", "resilium-platform.com · Link in bio ↑"] },
    ],
    caption: "Career resilience is the dimension most professionals underestimate — until a layoff forces them to measure it in real time.\n\nThe question isn't \"could I get another job.\" It's \"how long would it take, and how much leverage would I have?\"\n\nWhat skill would make you most portable right now? 👇",
    hashtags: "#careerresilience #careerdevelopment #jobsecurity #skills #professionaldevelopment #layoffs #careertips #networking #portableskills #futureofwork #careergrowth #freelancing #upskilling",
  },
  {
    id: 17, week: "W6", day: "Wed", type: "single",
    topic: "3–6 month job search stat",
    imageLines: ["The average job search in the US takes 3–6 months.", "How long could your finances sustain that?", "Those two numbers should match."],
    caption: "Career resilience and financial resilience are inseparable. A 6-month job search with a 2-month emergency fund is a crisis, not a transition.\n\nResilium scores both dimensions — and shows you the gap. Free at resilium-platform.com.",
    hashtags: "#careerdevelopment #jobsearch #financialplanning #emergencyfund #layoffs #careerresilience #personalfinance #jobsecurity",
  },
  {
    id: 18, week: "W6", day: "Fri", type: "quote",
    topic: "Most recession-proof asset",
    imageLines: ["Your most recession-proof asset\nisn't in your bank account.", "It's in your head."],
    caption: "Skills compound. Invest in them consistently.\n\nresilium-platform.com — see how your skills dimension scores.",
    hashtags: "#skills #learning #careerdevelopment #selfimprovement #personaldevelopment #growthmindset #upskilling #lifelonglearning",
  },

  // ─── WEEK 7 ───────────────────────────────────────────────────────────────
  {
    id: 19, week: "W7", day: "Mon", type: "carousel",
    topic: "Health resilience dimension",
    slides: [
      { bg: "alt", isHook: true, lines: ["Every preparedness guide talks about finances.", "Very few talk about health resilience.", "It might be your most overlooked gap."] },
      { bg: "dark", lines: ["Insurance continuity", "What happens to your health coverage if you lose your job?", "COBRA is expensive. ACA marketplace takes time.", "The gap between jobs is a real health risk."] },
      { bg: "dark", lines: ["Medication supply", "Do you have a 30-day buffer of any essential medications?", "Supply chain disruptions happen. Prescription delays happen.", "A buffer buys you time without panic."] },
      { bg: "dark", lines: ["Physical capacity", "Could you handle a physically demanding crisis?", "Caring for others, relocating quickly, managing stress for weeks?", "Physical baseline is a resilience asset."] },
      { bg: "dark", lines: ["Mental health access", "Do you have a therapist, counselor, or support structure you can call?", "Crises amplify mental health vulnerabilities.", "This is infrastructure, not luxury."] },
      { bg: "dark", lines: ["Basic medical literacy", "Do you have a first aid kit?", "Do you know basic emergency procedures?", "Small knowledge gaps have real consequences under pressure."] },
      { bg: "dark", isCta: true, lines: ["Resilium scores your health dimension\nand flags your highest-risk gaps.", "Free assessment — 5 minutes.", "resilium-platform.com · Link in bio ↑"] },
    ],
    caption: "Health resilience isn't about being perfectly healthy. It's about having the systems and buffers in place so that a health event — yours or someone else's — doesn't trigger a cascade.\n\nWhat's your health resilience blind spot? 👇",
    hashtags: "#healthresilience #healthplanning #insurancegap #mentalhealthmatters #emergencypreparedness #healthinsurance #personalfinance #preparedness #wellbeing #selfcare #mentalhealth #healthyliving",
  },
  {
    id: 20, week: "W7", day: "Wed", type: "single",
    topic: "1 in 4 skip medical care",
    imageLines: ["1 in 4 Americans skips medical care because of cost.", "An unmanaged health issue\nis also a financial and career issue.", "The dimensions aren't separate."],
    caption: "Health, money, and career resilience are deeply connected. A gap in one creates pressure in all three.\n\nResilium scores all six dimensions together — because that's how resilience actually works. Free at resilium-platform.com.",
    hashtags: "#healthresilience #personalfinance #healthinsurance #financialplanning #preparedness #mentalhealth #healthyliving #emergencypreparedness",
  },
  {
    id: 21, week: "W7", day: "Sat", type: "quote",
    topic: "Health is a resilience variable",
    imageLines: ["Your health isn't a personal matter.", "It's a resilience variable."],
    caption: "Plan for it accordingly.\n\nresilium-platform.com — score your health dimension.",
    hashtags: "#healthresilience #preparedness #selfcare #healthplanning #personaldevelopment #wellbeing #mindset #resilience",
  },

  // ─── WEEK 8 ───────────────────────────────────────────────────────────────
  {
    id: 22, week: "W8", day: "Mon", type: "carousel",
    topic: "Geographic flexibility",
    slides: [
      { bg: "alt", isHook: true, lines: ["Geographic flexibility is a resilience dimension\nalmost no one measures.", "But it's one of the most powerful ones."] },
      { bg: "dark", lines: ["What mobility resilience actually means:", "Could you take a better job in another city?", "Could you escape a dangerous situation quickly?", "Could you relocate internationally if you needed to?"] },
      { bg: "dark", lines: ["The passport question", "54% of Americans don't have a valid passport.", "That's 54% of Americans with their options limited by paperwork.", "A passport costs $130. The option value is enormous."] },
      { bg: "dark", lines: ["Financial ties", "A mortgage can be a resilience anchor.", "Do you know what it would take to sell or rent if you had to move fast?"] },
      { bg: "dark", lines: ["Relocation networks", "Do you know people in 2–3 other cities you could call?", "Social capital in other geographies is a mobility asset."] },
      { bg: "dark", lines: ["Remote work readiness", "If your job is location-dependent, your options shrink.", "Can your skills travel? Would your employer allow remote?"] },
      { bg: "dark", isCta: true, lines: ["Resilium scores your mobility dimension\nand identifies your geographic constraints.", "Free assessment — 5 minutes.", "resilium-platform.com · Link in bio ↑"] },
    ],
    caption: "Mobility isn't about wanting to leave. It's about having the option to leave — and the option to stay on your own terms.\n\nThe people who navigate crises best are the ones who never felt trapped.\n\nHow geographically flexible are you right now? 👇",
    hashtags: "#mobilityresilience #relocation #remotework #geographicfreedom #passport #preparedness #lifeplanning #digitalnomad #locationindependent #lifetransition",
  },
  {
    id: 23, week: "W8", day: "Wed", type: "single",
    topic: "54% no passport stat",
    imageLines: ["54% of Americans don't have a valid passport.", "A passport is a $130 option on every future opportunity.", "Do you have one?"],
    caption: "Mobility resilience is one of the most actionable dimensions to improve. Sometimes it's just a form and a fee.\n\nResilium shows you your full mobility score and the fastest fixes. Free at resilium-platform.com.",
    hashtags: "#passport #mobility #preparedness #geographicfreedom #remotework #lifeplanning #financialliteracy #opportunityiseverywhere",
  },
  {
    id: 24, week: "W8", day: "Fri", type: "quote",
    topic: "Options require preparation",
    imageLines: ["Options are only options\nif you've already created them.", "Waiting until you need them is too late."],
    caption: "Geographic flexibility. Career portability. Financial cushion. All of it takes time to build.\n\nStart now at resilium-platform.com.",
    hashtags: "#preparedness #mobility #optionality #resilience #personaldevelopment #lifeplanning #mindset #futureproof",
  },

  // ─── WEEK 9 ───────────────────────────────────────────────────────────────
  {
    id: 25, week: "W9", day: "Mon", type: "carousel",
    topic: "Mental resilience is the root",
    slides: [
      { bg: "alt", isHook: true, lines: ["You can have money in the bank,\nskills in demand, and a packed go-bag —\nand still fall apart in a crisis.", "Mental resilience is the root."] },
      { bg: "dark", lines: ["Stress tolerance", "Can you think clearly when the pressure is real?", "Most people overestimate their own stability.", "Stress impairs decision-making in ways you don't notice until after."] },
      { bg: "dark", lines: ["Support network", "Who do you call when things go sideways?", "Not a venting call — a practical one.", "Someone who can help, advise, or just steady you."] },
      { bg: "dark", lines: ["Decision-making under uncertainty", "Crises don't come with complete information.", "The ability to act with imperfect data\nis one of the highest-value resilience skills."] },
      { bg: "dark", lines: ["Recovery speed", "Everyone gets knocked down.", "The variable is how quickly you get back to baseline.", "This can be trained. It's not fixed."] },
      { bg: "dark", lines: ["Routine as infrastructure", "Sleep, movement, connection, purpose.", "When these break down, so does everything else.", "Mental resilience is partly just protecting your foundation."] },
      { bg: "dark", isCta: true, lines: ["Resilium scores your mental resilience\nalongside the other 5 dimensions.", "Free assessment — 5 minutes.", "resilium-platform.com · Link in bio ↑"] },
    ],
    caption: "Every other dimension of resilience — financial, physical, career — is filtered through your mental capacity to handle stress, make decisions, and recover.\n\nIt's not soft. It's foundational.\n\nWhat's one thing you do consistently to protect your mental resilience? 👇",
    hashtags: "#mentalresilience #mentalhealthmatters #stressmanagement #mindset #resilience #personaldevelopment #selfcare #emotionalintelligence #growthmindset #mentalstrength #wellbeing #copingskills",
  },
  {
    id: 26, week: "W9", day: "Wed", type: "single",
    topic: "Most expensive crisis quote",
    imageLines: ["The most expensive crisis\nis the one you weren't mentally prepared for.", "Financial damage can be rebuilt.\nPsychological damage takes longer."],
    caption: "Mental resilience is built before you need it. Therapy, strong routines, real support networks — these aren't indulgences. They're infrastructure.\n\nScore your mental resilience at resilium-platform.com.",
    hashtags: "#mentalresilience #mentalhealthmatters #selfcare #wellbeing #therapy #resilience #mindset #growthmindset",
  },
  {
    id: 27, week: "W9", day: "Fri", type: "quote",
    topic: "Mind must be stable",
    imageLines: ["You can prepare for almost anything.", "But only if your mind is stable enough\nto think clearly when it matters."],
    caption: "Build the foundation first.\n\nresilium-platform.com — mental resilience is one of your six scores.",
    hashtags: "#mentalresilience #mindset #personaldevelopment #resilience #selfcare #growthmindset #mentalstrength #wellbeing",
  },

  // ─── WEEK 10 ──────────────────────────────────────────────────────────────
  {
    id: 28, week: "W10", day: "Mon", type: "carousel",
    topic: "Network as survival asset",
    slides: [
      { bg: "alt", isHook: true, lines: ["In a crisis, people with strong networks\nrecover 3x faster than people without them.", "Your social capital is a resilience asset.", "Are you building it before you need it?"] },
      { bg: "dark", lines: ["What social capital actually means:", "Not followers. Not LinkedIn connections.", "People who would make a call for you.", "People you could call at 11pm."] },
      { bg: "dark", lines: ["Professional social capital", "Former managers who'd vouch for you.", "Colleagues who'd refer you.", "Peers in adjacent fields who'd open doors."] },
      { bg: "dark", lines: ["Community social capital", "Neighbors who'd check on you.", "Local networks you're embedded in.", "People who know your name in the places you inhabit."] },
      { bg: "dark", lines: ["Reciprocal relationships", "Social capital compounds when it's mutual.", "The strongest networks are built by people who give before they need to take.", "Invest now."] },
      { bg: "dark", lines: ["Diversity of network", "People in different industries, cities, and life stages\ngive you access to different opportunities.", "A narrow network is a fragile network."] },
      { bg: "dark", isCta: true, lines: ["Resilium scores your social capital\nas one of six resilience dimensions.", "Free assessment — 5 minutes.", "resilium-platform.com · Link in bio ↑"] },
    ],
    caption: "Social capital is the resilience dimension most people discover too late — when they're already in a crisis and realize they don't have the relationships to navigate it.\n\nBuild it now. It takes time in a way that money doesn't.\n\nWho in your network would you call in a real emergency? 👇",
    hashtags: "#socialcapital #networking #community #relationships #resilience #personaldevelopment #professionalnetwork #lifeplanning #humanconnection #communitybuilding #mentorship",
  },
  {
    id: 29, week: "W10", day: "Wed", type: "single",
    topic: "10 people who'd go out of their way",
    imageLines: ["You don't need 10,000 followers.", "You need 10 people who would\ngenuinely go out of their way for you.", "That's the network that actually matters."],
    caption: "Social capital isn't about being popular. It's about being trusted — by the right people, at the right depth.\n\nScore your social capital dimension at resilium-platform.com.",
    hashtags: "#networking #socialcapital #relationships #community #resilience #personaldevelopment #professionalnetwork #trust",
  },
  {
    id: 30, week: "W10", day: "Sat", type: "quote",
    topic: "No one survives alone",
    imageLines: ["No one survives a crisis alone.", "Build your network before you need it."],
    caption: "Resilience is partly individual, and partly communal. Both require intentional investment.\n\nresilium-platform.com — see your social capital score.",
    hashtags: "#community #networking #resilience #personaldevelopment #socialcapital #relationships #support #humanconnection",
  },

  // ─── WEEK 11 ──────────────────────────────────────────────────────────────
  {
    id: 31, week: "W11", day: "Mon", type: "carousel",
    topic: "Emergency kit gaps",
    slides: [
      { bg: "alt", isHook: true, lines: ["Most emergency kits have water and flashlights.", "Few have the things that actually matter most\nin the first 72 hours of a real disruption."] },
      { bg: "dark", lines: ["Documents first.", "Passport, birth certificate, insurance cards, medication list.", "Scanned to cloud. Physical copies in a waterproof envelope.", "This is the most critical prep most people skip."] },
      { bg: "dark", lines: ["Cash.", "ATMs go down. Card systems fail.", "$300–500 in small bills in a secure location.", "Not a lot — but enough when digital fails."] },
      { bg: "dark", lines: ["Medications and medical supplies.", "30-day buffer of essential prescriptions.", "Basic first aid. Blood pressure/blood sugar monitors if relevant.", "Medical needs don't pause for emergencies."] },
      { bg: "dark", lines: ["Communication plan.", "What's the meeting point if phones are down?", "Who is your out-of-state contact?", "Does your family know the plan without being told?"] },
      { bg: "dark", lines: ["72-hour basics.", "Water (1 gallon per person per day).", "Non-perishable food. Power bank. Manual can opener.", "Warm layers."] },
      { bg: "dark", isCta: true, lines: ["Resilium scores your emergency resources dimension\nand flags the exact gaps in your kit.", "Free assessment — 5 minutes.", "resilium-platform.com · Link in bio ↑"] },
    ],
    caption: "Emergency preparedness isn't about worst-case scenarios. It's about the first 72 hours — when systems are stressed and you need to be self-sufficient while help organizes.\n\nThe gap most people have isn't supplies. It's documents.\n\nWhat's in your emergency kit right now? 👇",
    hashtags: "#emergencypreparedness #emergencykit #disasterpreparedness #72hourkit #prepping #preparedness #disasterready #emergencyplanning #familypreparedness #survivalskills",
  },
  {
    id: 32, week: "W11", day: "Wed", type: "single",
    topic: "15-minute evacuation check",
    imageLines: ["If you had to leave your home in 15 minutes,\ndo you know where your:", "✓ Passport is?\n✓ Insurance documents are?\n✓ Medication list is?", "Most people don't."],
    caption: "The most expensive emergency prep isn't the gear. It's the documents. And they cost nothing to organize.\n\nScore your emergency resources dimension at resilium-platform.com.",
    hashtags: "#emergencypreparedness #documents #preparedness #disasterready #emergencyplanning #72hourkit #beready",
  },
  {
    id: 33, week: "W11", day: "Sat", type: "quote",
    topic: "Crisis doesn't give time to prepare",
    imageLines: ["A crisis doesn't give you time to prepare.", "That's what the time before it is for."],
    caption: "One action this weekend. Just one.\n\nresilium-platform.com — start with your free assessment.",
    hashtags: "#emergencypreparedness #preparedness #resilience #disasterready #beready #selfreliance #personaldevelopment #mindset",
  },

  // ─── WEEK 12 ──────────────────────────────────────────────────────────────
  {
    id: 34, week: "W12", day: "Mon", type: "carousel",
    topic: "Why I built Resilium",
    slides: [
      { bg: "alt", isHook: true, lines: ["I built Resilium because I asked myself\na question I couldn't honestly answer:", "\u201cIf everything changed tomorrow — am I ready?\u201d"] },
      { bg: "dark", lines: ["I started listing the things that would protect me.", "Emergency savings. ✓ (sort of)", "Portable skills. ✓ (mostly)", "Health coverage if I left my job. ✗", "Valid passport. ✓", "Mental capacity to handle real stress. …honestly?"] },
      { bg: "dark", lines: ["No one had taught me to think about resilience\nas a system with multiple dimensions.", "Every article I found was about one thing.", "Savings. Or fitness. Or mindset.", "Never the whole picture."] },
      { bg: "dark", lines: ["So I built a tool that measures all six.", "Not to create fear — but to create clarity.", "Because you can't fix what you can't see."] },
      { bg: "dark", lines: ["Resilium gives you a score across 6 dimensions\nand a prioritized plan.", "Not a checklist. Not a quiz.", "An actual map of where you are — and what to do next."] },
      { bg: "dark", lines: ["I'm Cristiana. I built this as a solo founder.", "It started with one question.", "I'd love to know: what's yours?"] },
      { bg: "dark", isCta: true, lines: ["Take the free assessment.", "See where you actually stand.", "resilium-platform.com · Link in bio ↑"] },
    ],
    caption: "Every product comes from a problem its founder couldn't stop thinking about. This one came from a moment of honest self-assessment that I wasn't prepared for.\n\nWhat question about your own preparedness keeps you up at night?\n\nDrop it below — I read every comment. 👇",
    hashtags: "#founderlife #solofounder #buildinpublic #womenfounder #startupstory #whyibuildthis #personalresilience #founderjourney #entrepreneurlife #productbuilding #womenentrepreneur",
  },
  {
    id: 35, week: "W12", day: "Wed", type: "single",
    topic: "My score was 58",
    imageLines: ["Day 1 of building Resilium:\nI took the assessment myself.", "My score: 58.", "It was exactly the motivation I needed."],
    caption: "Founders should use their own products. I do — every quarter.\n\nMy score has improved. So has the product.\n\nresilium-platform.com — take the assessment that started all of this.",
    hashtags: "#buildinpublic #solofounder #founderlife #womenfounder #startupstory #productdevelopment #authenticity #entrepreneurlife",
  },
  {
    id: 36, week: "W12", day: "Fri", type: "quote",
    topic: "Built for honesty not fear",
    imageLines: ["\u201cI didn't build Resilium for people who are afraid.\nI built it for people who want to be honest\nabout where they stand.\u201d", "\u2014 Cristiana, Resilium"],
    caption: "Honesty is the first step. The plan follows.\n\nresilium-platform.com",
    hashtags: "#founderquote #resilience #honesty #personaldevelopment #womenfounder #buildinpublic #startuplife #selfawareness",
  },

  // ─── WEEK 13 ──────────────────────────────────────────────────────────────
  {
    id: 37, week: "W13", day: "Mon", type: "carousel",
    topic: "90-day results",
    slides: [
      { bg: "alt", isHook: true, lines: ["Three months ago, you might have been\nliving on gut feel about your preparedness.", "Here's what 90 days of intentional work looks like."] },
      { bg: "dark", lines: ["Financial floor: built.", "Emergency fund growing.", "At least one new income possibility identified.", "Recurring expenses audited."] },
      { bg: "dark", lines: ["Career: more portable.", "LinkedIn updated. Network re-engaged.", "One new skill started.", "Two freelance or consulting options mapped."] },
      { bg: "dark", lines: ["Logistics: handled.", "Passport valid.", "Documents organized and backed up.", "72-hour kit assembled. Family plan in place."] },
      { bg: "dark", lines: ["Mental resilience: protected.", "Routine defended. Support network activated.", "One new coping practice adopted."] },
      { bg: "dark", lines: ["Score at day 1 vs. day 90:", "The average Resilium user improves by 15–25 points.", "Not because everything changed.", "Because a few targeted things did."] },
      { bg: "dark", isCta: true, lines: ["Start your 90 days today.", "Free assessment — 5 minutes.", "resilium-platform.com · Link in bio ↑"] },
    ],
    caption: "Ninety days is a short enough horizon to stay motivated. Long enough to see real change.\n\nIf you started your first Resilium assessment in the last 3 months — how has your score changed? Share below 👇\n\nIf you haven't started yet — what's stopping you?",
    hashtags: "#90daychallenge #personalresilience #financialpreparedness #goalsetting #personaldevelopment #selfdevelopment #habitbuilding #progressnotperfection #financialplanning #resilience #preparedness #growthmindset #selfimprovement #intentionalliving",
  },
  {
    id: 38, week: "W13", day: "Wed", type: "single",
    topic: "Progress over perfection",
    imageLines: ["You don't need to be fully prepared.", "You need to be more prepared\nthan you were 90 days ago.", "That's how resilience is built."],
    caption: "Progress compounds. The gap between where you are and where you need to be closes faster than you think when you're consistent.\n\nYour next step: resilium-platform.com. Free assessment.",
    hashtags: "#progressoverperfection #personaldevelopment #resilience #growthmindset #selfimprovement #financialplanning #preparedness #habitbuilding #intentionalliving",
  },
  {
    id: 39, week: "W13", day: "Sat", type: "quote",
    topic: "The version of you who prepared",
    imageLines: ["The version of you who prepared\nwill take care of the version of you\nwho needed it."],
    caption: "That's the whole point.\n\nresilium-platform.com — free resilience assessment. Link in bio.",
    hashtags: "#resilience #personaldevelopment #mindset #preparedness #selfimprovement #growthmindset #intentionalliving #selfcare #futureself #financialplanning",
  },

  // ─── Q1 2027 — INSPIRE ACTION ─────────────────────────────────────────────

  // ─── WEEK 14 ──────────────────────────────────────────────────────────────
  {
    id: 40, week: "W14", day: "Mon", type: "carousel",
    topic: "2027 resilience roadmap",
    slides: [
      { bg: "alt", isHook: true, lines: ["2027 starts with a question worth answering.", "Where do you actually stand?"] },
      { bg: "dark", slideType: "numbered", lines: ["Your Q1 2027 Resilience Roadmap", "Take or retake the assessment — set your real baseline.", "Identify your two lowest-scoring dimensions — those are your Q1 focus.", "Set one specific, measurable improvement per focus area.", "Schedule check-ins at day 30, 60, and 90.", "Reassess at the end of Q1. Measure the distance."] },
      { bg: "dark", lines: ["Why a roadmap beats a resolution:", "Resolutions are vague.\nRoadmaps are specific.", "Specific is what makes improvement measurable.", "Measurable is what makes improvement real."] },
      { bg: "dark", isCta: true, lines: ["Start with step one — it's free.", "resilium-platform.com · Link in bio ↑"] },
    ],
    caption: "New year energy is real — but it fades fast without a structure underneath it.\n\nA resilience roadmap is different from a resolution. It starts with an honest baseline, identifies specific gaps, and gives you four milestones instead of one vague intention.\n\nFree assessment at resilium-platform.com. What's your Q1 focus dimension? 👇",
    hashtags: "#newyear2027 #resilience #goalsetting #personaldevelopment #selfimprovement #intentionalliving #growthmindset #preparedness #habitbuilding #resiliumplatform",
  },
  {
    id: 41, week: "W14", day: "Wed", type: "single",
    topic: "Where were you 90 days ago",
    imageLines: ["Where were you 90 days ago?\nWhere are you now?", "If you can't answer — that's the gap worth closing first."],
    caption: "Progress without measurement is just motion.\n\nThe Resilium assessment gives you a number — across six dimensions — that you can actually track over time. Free at resilium-platform.com.",
    hashtags: "#selfassessment #progressnotperfection #personaldevelopment #resilience #goalsetting #intentionalliving #growthmindset",
  },
  {
    id: 42, week: "W14", day: "Fri", type: "quote",
    topic: "You don't need a resolution",
    imageLines: ["\u201cYou don\u2019t need a resolution.\nYou need a baseline.\u201d", "\u2014 Cristiana, Resilium"],
    caption: "Resolutions assume you know what to improve. A baseline tells you.\n\nFree resilience assessment — resilium-platform.com.",
    hashtags: "#newyear #resilience #personaldevelopment #growthmindset #selfawareness #intentionalliving #founderquote #resiliumplatform",
  },

  // ─── WEEK 15 ──────────────────────────────────────────────────────────────
  {
    id: 43, week: "W15", day: "Mon", type: "carousel",
    topic: "What your score means",
    slides: [
      { bg: "alt", isHook: true, lines: ["Your Resilium score isn't a grade.", "It's a map. Here's how to read it."] },
      { bg: "dark", slideType: "score-bands", lines: ["Where does your score put you?"] },
      { bg: "dark", lines: ["What your score tells you:", "Which dimensions are pulling the overall number down.", "Where your highest-leverage improvements are.", "What to work on first — and why."] },
      { bg: "dark", lines: ["What your score doesn't tell you:", "It's not a judgment of your intelligence, your worth,\nor your potential.", "It's a starting point — and starting points are meant to change."] },
      { bg: "dark", isCta: true, lines: ["Know your score before you plan your quarter.", "Free — 5 minutes.", "resilium-platform.com · Link in bio ↑"] },
    ],
    caption: "A lot of people take the assessment and feel relieved. A lot of people feel surprised. Very few feel exactly what they expected.\n\nThe score isn't the point. What you do with it is.\n\nWhat did your first score tell you that you didn't already know? 👇",
    hashtags: "#personalresilience #selfassessment #resilience #scorebands #growthmindset #personaldevelopment #intentionalliving #preparedness #resiliumplatform",
  },
  {
    id: 44, week: "W15", day: "Wed", type: "single",
    topic: "Most common first score",
    imageLines: ["The most common first score on Resilium: 58.", "Strong in mindset.\nExposed in finances and preparedness.", "That\u2019s not a bad score.\nIt\u2019s an honest one."],
    caption: "58 means you're above the midpoint overall, but your gaps are concentrated and specific — which makes them addressable.\n\nKnow your number. Start from there. resilium-platform.com",
    hashtags: "#personalresilience #selfassessment #financialpreparedness #preparedness #growthmindset #resilience #resiliumplatform",
  },
  {
    id: 45, week: "W15", day: "Sat", type: "quote",
    topic: "Score as map not verdict",
    imageLines: ["A score isn\u2019t a verdict.\nIt\u2019s the map\nyou didn\u2019t know you needed."],
    caption: "Maps don't judge where you are. They show you how to get where you want to go.\n\nresilium-platform.com — free resilience assessment.",
    hashtags: "#resilience #selfawareness #personaldevelopment #growthmindset #mindset #preparedness #resiliumplatform",
  },

  // ─── WEEK 16 ──────────────────────────────────────────────────────────────
  {
    id: 46, week: "W16", day: "Mon", type: "carousel",
    topic: "The two pillars of resilience",
    slides: [
      { bg: "alt", isHook: true, lines: ["Resilience is built on two pillars.", "Most people only strengthen one."] },
      { bg: "dark", slideType: "pillars", lines: ["The Two Pillars of Resilience", "Mental Resilience", "How you think, respond, and recover under pressure.", "Logistics & Resources", "The practical foundations that determine what\u2019s available when pressure arrives."] },
      { bg: "dark", lines: ["Mental resilience without practical foundations:", "You can stay calm in a crisis — but you have no emergency fund.", "You think clearly — but have no options to choose from."] },
      { bg: "dark", lines: ["Practical foundations without mental resilience:", "You have resources — but you freeze when pressure arrives.", "You prepared — but can\u2019t access your own plan under stress."] },
      { bg: "dark", isCta: true, lines: ["Resilium measures both.\nBecause both matter.", "Free — 5 minutes.", "resilium-platform.com · Link in bio \u2191"] },
    ],
    caption: "Most resilience advice focuses on mindset. Most preparedness advice focuses on logistics. Resilium is built on the insight that you need both — and that gaps in one undermine the other.\n\nWhich pillar do you think is your stronger one right now? 👇",
    hashtags: "#resilience #mentalresilience #preparedness #twopillars #personaldevelopment #growthmindset #selfimprovement #resiliumplatform #intentionalliving",
  },
  {
    id: 47, week: "W16", day: "Wed", type: "single",
    topic: "Why both pillars matter",
    imageLines: ["Mindset prepares you to think clearly under pressure.", "Logistics prepares you to have something to think clearly about.", "Both pillars. Both scored."],
    caption: "The difference between people who navigate disruption well and those who don't isn't usually mindset alone or preparation alone. It's both, working together.\n\nFree assessment at resilium-platform.com.",
    hashtags: "#resilience #mentalstrength #preparedness #personaldevelopment #growthmindset #mindset #resiliumplatform",
  },
  {
    id: 48, week: "W16", day: "Fri", type: "quote",
    topic: "Confidence without preparation is fragile",
    imageLines: ["\u201cConfidence without preparation is fragile.\nPreparation without adaptability\nbreaks under pressure.\nYou need both.\u201d", "\u2014 Cristiana, Resilium"],
    caption: "Both pillars. Measured together at resilium-platform.com.",
    hashtags: "#resilience #mindset #preparedness #founderquote #growthmindset #personaldevelopment #resiliumplatform",
  },

  // ─── WEEK 17 ──────────────────────────────────────────────────────────────
  {
    id: 49, week: "W17", day: "Mon", type: "carousel",
    topic: "30-day resilience habit plan",
    slides: [
      { bg: "alt", isHook: true, lines: ["Thirty days is enough to build one real resilience habit.", "Here\u2019s the plan worth following."] },
      { bg: "dark", slideType: "numbered", lines: ["A 30-Day Resilience Habit Plan", "Week 1: Identify your lowest-scoring dimension. Focus there only.", "Week 2: Take one concrete, small action in that dimension.", "Week 3: Add a second small action in the same dimension.", "Week 4: Reflect — did it move the needle? Extend what worked."] },
      { bg: "dark", lines: ["The rule:", "One dimension. One focus. One month.", "Improvement isn\u2019t about doing everything at once.", "It\u2019s about doing the right thing — consistently."] },
      { bg: "dark", isCta: true, lines: ["Start with your lowest score.\nThat\u2019s your highest-leverage move.", "Free assessment — 5 minutes.", "resilium-platform.com · Link in bio \u2191"] },
    ],
    caption: "The mistake most people make: trying to improve every dimension at once.\n\nThe better approach: pick the dimension where a small improvement creates the most downstream benefit — and focus there for 30 days.\n\nSave this post. What's your 30-day focus? 👇",
    hashtags: "#30daychallenge #resilience #habitbuilding #personaldevelopment #goalsetting #intentionalliving #growthmindset #selfimprovement #resiliumplatform",
  },
  {
    id: 50, week: "W17", day: "Wed", type: "single",
    topic: "Highest ROI daily action",
    imageLines: ["The highest-ROI resilience habit:\nReview your score once a month and ask one question.", "\u201cWhat changed \u2014 and did I do it intentionally?\u201d"],
    caption: "Most improvement happens when you're watching. The habit of measurement makes the difference between accidental progress and intentional progress.\n\nTrack your score over time with Resilium Pro — resilium-platform.com.",
    hashtags: "#habitbuilding #personaldevelopment #resilience #selfimprovement #intentionalliving #growthmindset #resiliumplatform",
  },
  {
    id: 51, week: "W17", day: "Sat", type: "quote",
    topic: "Small consistent actions",
    imageLines: ["Small consistent actions.\nThat\u2019s the whole method."],
    caption: "No dramatic overhaul. No perfect conditions. Just the next small thing, done again.\n\nresilium-platform.com",
    hashtags: "#resilience #habitbuilding #consistency #personaldevelopment #growthmindset #selfimprovement #intentionalliving",
  },

  // ─── WEEK 18 ──────────────────────────────────────────────────────────────
  {
    id: 52, week: "W18", day: "Mon", type: "carousel",
    topic: "5 financial habits that build resilience",
    slides: [
      { bg: "alt", isHook: true, lines: ["Financial resilience isn\u2019t about wealth.", "It\u2019s about these five habits."] },
      { bg: "dark", slideType: "icon-grid", lines: ["5 Financial Habits That Build Real Resilience", "\ud83d\udcb0 Separate buffer\nA dedicated emergency account, untouched.", "\ud83d\udcca Know your runway\nMonths of expenses covered if income stops.", "\ud83d\udd01 Automate protection\nWeekly auto-transfer to your emergency account.", "\ud83d\udee1\ufe0f Audit insurance\nHealth, disability, renters — find the gaps."] },
      { bg: "dark", lines: ["The fifth habit:", "Diversify income deliberately.", "Not dramatically \u2014 one consulting option,\none portable skill, one income stream that\nisn\u2019t dependent on your current employer."] },
      { bg: "dark", isCta: true, lines: ["Your financial dimension score shows\nyou exactly where to start.", "Free \u2014 5 minutes.", "resilium-platform.com \u00b7 Link in bio \u2191"] },
    ],
    caption: "Financial resilience is the dimension that most people think they're better at than they are.\n\nIt's not about income level. It's about these five habits — and most people are missing at least two of them.\n\nWhich habit is your weakest? 👇",
    hashtags: "#financialresilience #personalfinance #emergencyfund #financialhabits #moneymindset #financialliteracy #wealthbuilding #incomestreams #financialplanning #resiliumplatform",
  },
  {
    id: 53, week: "W18", day: "Wed", type: "single",
    topic: "Emergency fund wrong question",
    imageLines: ["The emergency fund question most people ask:\n\u201cDo I have one?\u201d", "The right question:\n\u201cCould I access it in 48 hours\nwithout penalty?\u201d"],
    caption: "A 401k is not an emergency fund. Home equity is not an emergency fund. Investments that take days to liquidate are not an emergency fund.\n\nThe real question is: what can you access immediately? That number is your actual buffer.\n\nFree financial resilience score at resilium-platform.com.",
    hashtags: "#emergencyfund #personalfinance #financialliteracy #financialplanning #financialresilience #moneymindset #wealthbuilding",
  },
  {
    id: 54, week: "W18", day: "Fri", type: "quote",
    topic: "Buffer is decision-making time",
    imageLines: ["A buffer isn\u2019t savings.\nIt\u2019s decision-making time."],
    caption: "The difference between reacting and responding — in a financial crisis — is usually measured in months of runway.\n\nresilium-platform.com — score your financial resilience.",
    hashtags: "#financialresilience #emergencyfund #personalfinance #moneymindset #financialliteracy #resilience #resiliumplatform",
  },

  // ─── WEEK 19 ──────────────────────────────────────────────────────────────
  {
    id: 55, week: "W19", day: "Mon", type: "carousel",
    topic: "Career portability test",
    slides: [
      { bg: "alt", isHook: true, lines: ["Your career resilience comes down to 5 questions.", "Most people can\u2019t answer all of them honestly."] },
      { bg: "dark", slideType: "numbered", lines: ["The Career Portability Test", "Could 3 different types of companies hire you for what you do?", "Could you freelance your core skill if you had to tomorrow?", "When did you last update your resume or LinkedIn?", "Who in your network would refer you within 30 days?", "What skill, if you had it, would make you 50% more valuable?"] },
      { bg: "dark", lines: ["The answers that matter:", "Not the ones you wish were true \u2014\nthe ones that are actually true today.", "The gap between those two answers\nis your career resilience gap."] },
      { bg: "dark", isCta: true, lines: ["Resilium scores your career dimension specifically.", "Free \u2014 5 minutes.", "resilium-platform.com \u00b7 Link in bio \u2191"] },
    ],
    caption: "Career resilience isn't about your salary. It's about your options.\n\nThe portability test is the fastest way to see whether a disruption would give you leverage — or leave you scrambling.\n\nWhich of these 5 questions is hardest to answer honestly? 👇",
    hashtags: "#careerresilience #careerdevelopment #jobsecurity #careertips #professionaldevelopment #portableskills #networking #futureofwork #layoffs #resiliumplatform",
  },
  {
    id: 56, week: "W19", day: "Wed", type: "single",
    topic: "Skills that travel vs skills that don't",
    imageLines: ["Skills tied to one employer expire with the job.", "Skills tied to a problem \u2014 writing, building,\nanalyzing, selling, managing \u2014 travel with you forever.", "Know which kind you have more of."],
    caption: "Career resilience starts with an honest inventory of what you're actually bringing to the market — not what your title says.\n\nFree career resilience score at resilium-platform.com.",
    hashtags: "#careerresilience #portableskills #careerdevelopment #jobsecurity #futureofwork #professionaldevelopment #upskilling #resiliumplatform",
  },
  {
    id: 57, week: "W19", day: "Sat", type: "quote",
    topic: "Value not attached to employer",
    imageLines: ["Your value isn\u2019t attached to your employer.\nMake sure you actually know that."],
    caption: "The clearest sign of career resilience: you could leave — and be fine.\n\nresilium-platform.com — score your career dimension.",
    hashtags: "#careerresilience #careerdevelopment #jobsecurity #personaldevelopment #professionalgrowth #resiliumplatform",
  },

  // ─── WEEK 20 ──────────────────────────────────────────────────────────────
  {
    id: 58, week: "W20", day: "Mon", type: "carousel",
    topic: "Social resilience — quality not quantity",
    slides: [
      { bg: "alt", isHook: true, lines: ["Social resilience isn\u2019t about your follower count.", "It\u2019s about four very specific things."] },
      { bg: "dark", slideType: "icon-grid", lines: ["What Social Resilience Actually Measures", "\ud83d\udcde Crisis contacts\nWho answers at 2am \u2014 and actually helps.", "\ud83e\udd1d Reliable support\nPeople who show up, not just sympathize.", "\ud83c\udf10 Professional reach\nConnections that create real optionality.", "\ud83c\udfd8\ufe0f Community\nBelonging beyond work and immediate family."] },
      { bg: "dark", lines: ["The gap most people have:", "A wide network and shallow connections.", "Social resilience requires depth \u2014 not reach.", "One person who will actually help outweighs\n500 connections who won\u2019t."] },
      { bg: "dark", isCta: true, lines: ["Map your social resilience honestly.", "Free \u2014 5 minutes.", "resilium-platform.com \u00b7 Link in bio \u2191"] },
    ],
    caption: "The loneliest people aren't the ones who are alone — they're the ones who are connected to a lot of people but deeply supported by very few.\n\nSocial resilience is one of the most underassessed dimensions in most people's profiles.\n\nHow many people could you genuinely call in a crisis? 👇",
    hashtags: "#socialresilience #community #relationships #personaldevelopment #resilience #mentalhealth #support #intentionalliving #resiliumplatform",
  },
  {
    id: 59, week: "W20", day: "Wed", type: "single",
    topic: "The two calls you need to make",
    imageLines: ["Two calls you need to be able to make:", "1. A professional contact who would vouch for you in a crisis.\n2. A personal contact who would show up if you needed help.", "If you\u2019re not certain who those people are \u2014 that\u2019s worth knowing."],
    caption: "Not a network of hundreds. Just two specific people, for two specific situations.\n\nSocial resilience is scored in the Resilium assessment — free at resilium-platform.com.",
    hashtags: "#socialresilience #relationships #community #resilience #personaldevelopment #support #resiliumplatform",
  },
  {
    id: 60, week: "W20", day: "Fri", type: "quote",
    topic: "Resilience without relationships",
    imageLines: ["Resilience without relationships\nis just stubbornness."],
    caption: "The research is consistent: social support is one of the strongest predictors of recovery after disruption.\n\nresilium-platform.com — score your social resilience.",
    hashtags: "#socialresilience #relationships #community #resilience #personaldevelopment #mentalhealth #resiliumplatform",
  },

  // ─── WEEK 21 ──────────────────────────────────────────────────────────────
  {
    id: 61, week: "W21", day: "Mon", type: "carousel",
    topic: "Physical resilience — the skipped dimension",
    slides: [
      { bg: "alt", isHook: true, lines: ["Physical resilience is the dimension most people skip.", "It\u2019s also the one that affects every other dimension."] },
      { bg: "dark", lines: ["Why it matters:", "Under sustained pressure, physical capacity determines\nhow long you can think clearly, work consistently,\nand recover when disruption passes."] },
      { bg: "dark", lines: ["Sleep:", "Chronic poor sleep degrades decision quality faster\nthan almost any other single variable.", "It\u2019s a resilience input, not a lifestyle preference."] },
      { bg: "dark", lines: ["Movement:", "Regular physical activity is the most evidence-backed\nform of stress regulation available.", "Not performance \u2014 function. Not fitness \u2014 capacity."] },
      { bg: "dark", lines: ["Health access:", "Do you have access to care if you need it?\nIs there a 30-day medication supply?\nIs your health a risk factor in a disruption?"] },
      { bg: "dark", isCta: true, lines: ["Physical resilience is scored in the assessment.\nIt\u2019s not about fitness.\nIt\u2019s about capacity.", "Free \u2014 5 minutes.", "resilium-platform.com \u00b7 Link in bio \u2191"] },
    ],
    caption: "Most people deplete their physical resilience first under pressure — sleep goes, movement goes, nutrition goes. And then the cognitive capacity they need to navigate the disruption also starts to go.\n\nTaking care of your body isn't a luxury. It's resilience infrastructure.\n\nWhat's your weakest physical resilience habit? 👇",
    hashtags: "#physicalresilience #health #sleep #wellness #personaldevelopment #resilience #selfcare #growthmindset #resiliumplatform",
  },
  {
    id: 62, week: "W21", day: "Wed", type: "single",
    topic: "Health as resilience asset",
    imageLines: ["Your health is a resilience asset.", "It\u2019s also, for most people,\nthe first one to deplete under sustained pressure.", "Recovery isn\u2019t a luxury.\nIt\u2019s maintenance."],
    caption: "Physical resilience isn't about peak performance. It's about having enough capacity in reserve to navigate disruption without your body becoming the crisis.\n\nFree assessment — resilium-platform.com.",
    hashtags: "#physicalresilience #health #wellness #selfcare #resilience #personaldevelopment #resiliumplatform",
  },
  {
    id: 63, week: "W21", day: "Sat", type: "quote",
    topic: "Body as infrastructure",
    imageLines: ["Your body is your most important infrastructure.\nMaintain it accordingly."],
    caption: "No other asset you have is as foundational — or as overlooked when everything else demands attention.\n\nresilium-platform.com",
    hashtags: "#physicalresilience #health #wellness #resilience #selfcare #personaldevelopment #resiliumplatform",
  },

  // ─── WEEK 22 ──────────────────────────────────────────────────────────────
  {
    id: 64, week: "W22", day: "Mon", type: "carousel",
    topic: "Practical preparedness — 72 hours",
    slides: [
      { bg: "alt", isHook: true, lines: ["72 hours.", "That\u2019s the resilience window most emergency frameworks target.", "Here\u2019s what practical preparedness actually means."] },
      { bg: "dark", slideType: "icon-grid", lines: ["The Practical Preparedness Essentials", "\ud83c\udf92 72-hour kit\nWater, food, first aid, power bank, cash.", "\ud83d\udcc4 Important documents\nBackup copies \u2014 digital and physical.", "\ud83d\udcde Emergency contacts\nLocal numbers you\u2019ve actually saved.", "\ud83d\udc8a Medication supply\n30-day buffer for essential prescriptions."] },
      { bg: "dark", lines: ["Why most people don\u2019t do this:", "It\u2019s not difficult. It\u2019s not expensive.", "It\u2019s just not urgent until it is.", "And by then, you can\u2019t do it calmly."] },
      { bg: "dark", isCta: true, lines: ["Know your practical resilience score.", "Then spend one afternoon closing the gaps.", "resilium-platform.com \u00b7 Link in bio \u2191"] },
    ],
    caption: "Practical preparedness is the most actionable dimension in the entire assessment.\n\nThe gaps are specific. The actions are clear. And most of them can be completed in a single focused afternoon — not a weekend, not a major project. An afternoon.\n\nWhat's on your practical preparedness to-do list? 👇",
    hashtags: "#practicalpreparedness #emergencypreparedness #preparedness #72hourkit #resilience #personaldevelopment #intentionalliving #resiliumplatform",
  },
  {
    id: 65, week: "W22", day: "Wed", type: "single",
    topic: "One afternoon",
    imageLines: ["Most practical resilience gaps take one afternoon to close.", "Check the kit. Back up the documents.\nSave the emergency contacts.", "The barrier isn\u2019t effort.\nIt\u2019s awareness."],
    caption: "You know this needs to happen. The only thing missing is a specific afternoon on the calendar.\n\nFind your practical resilience gaps first — free at resilium-platform.com.",
    hashtags: "#practicalpreparedness #emergencypreparedness #preparedness #resilience #personaldevelopment #intentionalliving #resiliumplatform",
  },
  {
    id: 66, week: "W22", day: "Fri", type: "quote",
    topic: "Not preparing for catastrophe",
    imageLines: ["You\u2019re not preparing for catastrophe.\nYou\u2019re reducing the cost\nof the ordinary unexpected."],
    caption: "Car insurance isn't pessimistic. Neither is practical preparedness.\n\nresilium-platform.com",
    hashtags: "#preparedness #resilience #personaldevelopment #mindset #growthmindset #resiliumplatform",
  },

  // ─── WEEK 23 ──────────────────────────────────────────────────────────────
  {
    id: 67, week: "W23", day: "Mon", type: "carousel",
    topic: "What 90 days of work looks like",
    slides: [
      { bg: "alt", isHook: true, lines: ["You started Q1 with a baseline.", "Here\u2019s what 90 days of intentional work actually changes."] },
      { bg: "dark", slideType: "numbered", lines: ["What Changes After 90 Days", "Financial: A buffer that didn\u2019t exist \u2014 or grew meaningfully.", "Career: A network re-engaged. A portable skill started.", "Practical: A kit assembled. Documents backed up. Contacts saved.", "Social: One relationship deepened. One community touchpoint made.", "Psychological: A recovery practice adopted and protected."] },
      { bg: "dark", lines: ["The score shift:", "Most users who complete a focused 90-day period see\na 10\u201320 point improvement in targeted dimensions.", "Not because everything changed.\nBecause targeted things did."] },
      { bg: "dark", isCta: true, lines: ["Retake your assessment.\nSee exactly how far you\u2019ve come.", "resilium-platform.com \u00b7 Link in bio \u2191"] },
    ],
    caption: "Ninety days is not a long time. But it's enough to move a number — if you know which number you're targeting.\n\nIf you started with Resilium in January — what's changed? Share below 👇\n\nIf you haven't started yet — this is your prompt.",
    hashtags: "#90daychallenge #resilience #progressnotperfection #personaldevelopment #selfimprovement #habitbuilding #growthmindset #intentionalliving #resiliumplatform",
  },
  {
    id: 68, week: "W23", day: "Wed", type: "single",
    topic: "Dimensions that improve fastest",
    imageLines: ["The dimensions that improve fastest in 90 days:", "Practical resilience \u2014 gaps are specific, actions are clear.\nCareer resilience \u2014 one conversation can shift it significantly.", "The slowest: financial \u2014\nbecause it compounds over months, not weeks."],
    caption: "Knowing which dimension responds fastest to focused effort helps you sequence your improvements in the right order.\n\nResilium Pro shows you prioritized recommendations based on your specific profile. resilium-platform.com.",
    hashtags: "#resilience #selfimprovement #personaldevelopment #growthmindset #habitbuilding #financialplanning #resiliumplatform",
  },
  {
    id: 69, week: "W23", day: "Sat", type: "quote",
    topic: "Second assessment is more honest",
    imageLines: ["The second assessment is always\nmore honest than the first.\nBecause you know what you actually did."],
    caption: "The first score shows where you are. The second shows whether the work was real.\n\nTrack your resilience over time at resilium-platform.com.",
    hashtags: "#resilience #selfassessment #personaldevelopment #growthmindset #selfawareness #intentionalliving #resiliumplatform",
  },

  // ─── WEEK 24 ──────────────────────────────────────────────────────────────
  {
    id: 70, week: "W24", day: "Mon", type: "carousel",
    topic: "The research behind Resilium",
    slides: [
      { bg: "alt", isHook: true, lines: ["Every question in the Resilium assessment has a source.", "We didn\u2019t invent the framework.\nThe research did."] },
      { bg: "dark", slideType: "icon-grid", lines: ["The Research Behind Every Question", "\ud83d\udcda Peer-Reviewed Studies\nPositive psychology and resilience science.", "\u2705 Validated Scales\nEstablished resilience measurement tools.", "\ud83c\udfd7\ufe0f Institutional Frameworks\nFEMA, WHO, and public health research.", "\ud83d\udd04 Real-World Application\nAdapted for practical individual use."] },
      { bg: "dark", lines: ["Why it matters:", "A resilience tool that isn\u2019t grounded in evidence\nisn\u2019t a resilience tool.", "It\u2019s a personality quiz.", "We chose science because it\u2019s more useful."] },
      { bg: "dark", isCta: true, lines: ["The Pro report includes\nmethodology references.", "Understand the \u2018why\u2019 behind your score.", "resilium-platform.com \u00b7 Link in bio \u2191"] },
    ],
    caption: "We get asked sometimes: \"why should I trust this assessment?\"\n\nThe honest answer: don't trust us — trust the research we built it on. Positive psychology. Emergency preparedness science. Validated resilience scales from institutional frameworks.\n\nThe questions aren't arbitrary. They're sourced.\n\nWhat would you want to understand better about the methodology? 👇",
    hashtags: "#resilience #research #science #peerreviewed #personaldevelopment #evidencebased #resiliumplatform #methodology",
  },
  {
    id: 71, week: "W24", day: "Wed", type: "single",
    topic: "Why peer-reviewed research was non-negotiable",
    imageLines: ["Why peer-reviewed research was non-negotiable for us:", "Because people make decisions based on their assessment.", "If the assessment isn\u2019t valid,\nthe decisions built on it aren\u2019t either."],
    caption: "The science behind the assessment is what makes the results actionable rather than just interesting.\n\nresilium-platform.com — built on evidence.",
    hashtags: "#resilience #research #evidencebased #peerreviewed #personaldevelopment #resiliumplatform",
  },
  {
    id: 72, week: "W24", day: "Fri", type: "quote",
    topic: "We built the tool not the framework",
    imageLines: ["We didn\u2019t build the framework.\nThe research did.\nWe built the tool."],
    caption: "Decades of resilience science, made accessible and actionable in under five minutes.\n\nresilium-platform.com",
    hashtags: "#resilience #research #evidencebased #personaldevelopment #growthmindset #resiliumplatform",
  },

  // ─── WEEK 25 ──────────────────────────────────────────────────────────────
  {
    id: 73, week: "W25", day: "Mon", type: "carousel",
    topic: "Privacy by design",
    slides: [
      { bg: "alt", isHook: true, lines: ["You shouldn\u2019t have to give up your identity\nto understand yourself.", "Here\u2019s what privacy by design means at Resilium."] },
      { bg: "dark", slideType: "icon-grid", lines: ["Privacy by Design \u2014 In Practice", "\ud83d\ude48 No name required\nAnonymous by default from the start.", "\ud83d\udd12 Never sold or shared\nYour data stays yours, always.", "\u2705 GDPR-compliant\nBuilt to the highest privacy standard.", "\u2699\ufe0f You\u2019re in control\nCreate an account only if you choose to track."] },
      { bg: "dark", lines: ["Why we built it this way:", "People give more honest answers\nwhen they trust the environment.", "Honest answers produce more accurate scores.", "More accurate scores produce more useful plans.", "Privacy isn\u2019t a feature.\nIt\u2019s the foundation."] },
      { bg: "dark", isCta: true, lines: ["Take the assessment.\nNo account required.", "Understand yourself honestly.", "resilium-platform.com \u00b7 Link in bio \u2191"] },
    ],
    caption: "Most apps want your data. We deliberately designed Resilium so you don't have to give it.\n\nAnonymous by default. No name, no email, no advertising profile. Just your results — and what you decide to do with them.\n\nDoes privacy factor into the tools you choose? 👇",
    hashtags: "#privacybydesign #GDPR #privacy #personaldata #resilience #personaldevelopment #trustworthy #resiliumplatform",
  },
  {
    id: 74, week: "W25", day: "Wed", type: "single",
    topic: "The trust question",
    imageLines: ["The question nobody asks about self-assessment tools:", "\u201cWho has access to my answers?\u201d", "At Resilium: no one does.\nNot by default. Not without your explicit choice."],
    caption: "Self-knowledge requires honesty. Honesty requires trust. Trust requires a system that's actually safe.\n\nAnonymous assessment — resilium-platform.com.",
    hashtags: "#privacy #personaldata #trust #GDPR #resilience #selfassessment #resiliumplatform",
  },
  {
    id: 75, week: "W25", day: "Sat", type: "quote",
    topic: "Self-knowledge and privacy",
    imageLines: ["Self-knowledge\nshouldn\u2019t cost you\nyour privacy."],
    caption: "It never should have been a trade-off.\n\nresilium-platform.com — anonymous by default.",
    hashtags: "#privacy #selfawareness #personaldevelopment #resilience #resiliumplatform",
  },

  // ─── WEEK 26 ──────────────────────────────────────────────────────────────
  {
    id: 76, week: "W26", day: "Mon", type: "carousel",
    topic: "Q1 complete — carry into Q2",
    slides: [
      { bg: "alt", isHook: true, lines: ["Q1 is done.", "Here\u2019s what matters most as you carry it into Q2."] },
      { bg: "dark", slideType: "numbered", lines: ["What to Carry from Q1 into Q2", "Your current score \u2014 write it down. It\u2019s your new baseline.", "The dimension you moved \u2014 that\u2019s your proof of concept.", "The dimension you didn\u2019t touch \u2014 that\u2019s your Q2 priority.", "The habit that stuck \u2014 protect it deliberately."] },
      { bg: "dark", lines: ["What Q2 looks like:", "Build Awareness & Trust at scale.", "More people in your life need to understand\nwhat resilience actually is.", "Your experience is part of that conversation."] },
      { bg: "dark", isCta: true, lines: ["Start Q2 with a fresh assessment.\nSee exactly where three months of work landed you.", "resilium-platform.com \u00b7 Link in bio \u2191"] },
    ],
    caption: "Q1 ends not with a grade — but with a baseline you can actually use.\n\nThe score you have now is the starting point for Q2. The dimension you moved is your proof that improvement is possible. The dimension you didn't touch is your next opportunity.\n\nWhat's your Q2 priority? 👇",
    hashtags: "#Q1review #Q2goals #resilience #personaldevelopment #goalsetting #habitbuilding #intentionalliving #growthmindset #resiliumplatform",
  },
  {
    id: 77, week: "W26", day: "Wed", type: "single",
    topic: "Q1 key lessons",
    imageLines: ["Three things that built the most resilience in Q1:", "1. Knowing exactly which dimension to focus on.\n2. Taking one specific action instead of ten vague ones.\n3. Measuring \u2014 and letting the number tell the truth."],
    caption: "The method works because it's specific. Specificity is what separates improvement that sticks from improvement that doesn't.\n\nCarry that into Q2 — and into Q3. resilium-platform.com.",
    hashtags: "#resilience #lessons #personaldevelopment #growthmindset #intentionalliving #habitbuilding #selfimprovement #resiliumplatform",
  },
  {
    id: 78, week: "W26", day: "Fri", type: "quote",
    topic: "Ready for what's next",
    imageLines: ["The version of you\nwho built this foundation\nis ready for what\u2019s next."],
    caption: "Q2 begins.\n\nresilium-platform.com — free resilience assessment.",
    hashtags: "#resilience #personaldevelopment #growthmindset #intentionalliving #selfimprovement #resiliumplatform #newyear #Q2",
  },
];

export const WEEKS = Array.from(new Set(IG_POSTS.map(p => p.week)));

export const TYPE_LABEL: Record<IGPost["type"], string> = {
  carousel: "Carousel",
  single: "Single Image",
  quote: "Quote Graphic",
};

export const TYPE_COLOR: Record<IGPost["type"], string> = {
  carousel: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  single: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  quote: "bg-violet-500/20 text-violet-300 border-violet-500/30",
};

export const BG_MAP: Record<string, string> = {
  alt: "/instagram/bg-carousel-alt.png",
  dark: "/instagram/bg-carousel-dark.png",
  single: "/instagram/bg-single-image.png",
  quote: "/instagram/bg-quote.png",
};
