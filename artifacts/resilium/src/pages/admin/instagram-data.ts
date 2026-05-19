export type SlideBg = "alt" | "dark";

export interface Slide {
  bg: SlideBg;
  lines: string[];
  isHook?: boolean;
  isCta?: boolean;
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
