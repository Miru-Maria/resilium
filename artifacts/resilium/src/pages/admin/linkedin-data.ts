export type LIQuarter = "Q2 2026" | "Q3 2026" | "Q4 2026";
export type LIPhase = "Awareness" | "Authority" | "Conversion";

export interface LIPost {
  id: number;
  week: number;
  date: string;
  quarter: LIQuarter;
  phase: LIPhase;
  phaseGoal: string;
  hook: string;
  body: string;
  graphicDirection: string;
}

export const LI_CTA = "Take the assessment at resilium-platform.com (link in bio).";

export const LI_POSTS: LIPost[] = [

  // ─── Q2 2026 — Awareness ─────────────────────────────────────────────────────
  {
    id: 1, week: 1, date: "May 27, 2026",
    quarter: "Q2 2026", phase: "Awareness", phaseGoal: "Brand recognition and profile follows",
    hook: "Most people think resilience is personality. Research says otherwise.",
    body: `"Resilient" is often used to describe a type of person.

Tough. Optimistic. Unshakeable.

But decades of psychology and emergency preparedness research tell a different story.

Resilience isn't a trait — it's a composite of measurable conditions:

• Financial foundations (runway, savings buffers)
• Practical systems (emergency resources, documentation)
• Social infrastructure (people you can actually call in a crisis)
• Psychological and physical capacity

The reason this distinction matters: traits feel fixed. Conditions can be improved.

When you reframe resilience as something you build — not something you either have or don't — the question stops being "am I resilient?" and becomes "where am I vulnerable, and what can I do about it?"

That's the shift Resilium is designed to create.

Not a personality quiz. A practical assessment — built on peer-reviewed research, designed to give you clarity, not alarm.`,
    graphicDirection: "Minimalist infographic contrasting 'trait' vs 'condition' with brand typography.",
  },
  {
    id: 2, week: 2, date: "June 03, 2026",
    quarter: "Q2 2026", phase: "Awareness", phaseGoal: "Brand recognition and profile follows",
    hook: "Your financial runway is your decision-making time. Most people have less than they think.",
    body: `In a disruption — job loss, health event, unexpected expense — the critical question isn't just "how bad is this?"

It's: how much time do I have to respond thoughtfully?

Three months of runway means you can be selective. You can think, wait for the right opportunity, and avoid reactive decisions made from fear.

Three weeks of runway means you react. Fast, under pressure, with fewer options.

Financial resilience isn't about wealth. It's about buffer — the gap between income disruption and forced decision-making.

Most people significantly overestimate theirs.

When we look at assessment data, financial resilience is consistently the dimension where the largest gap exists between perceived security and actual security.

The people who know their real number are the ones who can improve it.

Knowing is the first step.`,
    graphicDirection: "Timeline graphic showing decision quality vs financial runway. Calm, data-driven.",
  },
  {
    id: 3, week: 3, date: "June 10, 2026",
    quarter: "Q2 2026", phase: "Awareness", phaseGoal: "Brand recognition and profile follows",
    hook: "In a disruption, adaptability matters more than any single skill.",
    body: `The job market is not the same place it was ten years ago.

Loyalty doesn't protect careers the way it once did. Industries shift. Roles evolve. And the skills that felt permanent can become irrelevant faster than most people plan for.

What tends to hold its value: the ability to transfer knowledge across contexts.

• Can you move your expertise into adjacent roles?
• Do your skills apply across industries — or only within one?
• How quickly do you acquire new capabilities?

These aren't hypothetical questions. They're the difference between a career disruption that lasts three months and one that lasts three years.

Career resilience is one of six dimensions we assess at Resilium — and it's one of the most actionable.

Because adaptability, unlike credentials, is something you can develop deliberately.

The people who navigate professional disruption best aren't always the most qualified. They're the most versatile.`,
    graphicDirection: "Branching path illustration showing skill transferability. Warm amber accents.",
  },
  {
    id: 4, week: 4, date: "June 17, 2026",
    quarter: "Q2 2026", phase: "Awareness", phaseGoal: "Brand recognition and profile follows",
    hook: "Pressure doesn't reveal character. It reveals capacity.",
    body: `We use "performing well under pressure" as a compliment — as if it's proof of strength.

But chronic high-pressure performance without recovery is not strength. It's a slow burn.

The science on this is unambiguous: sustained stress degrades decision quality, narrows perspective, and erodes the cognitive resources needed to navigate exactly the situations that require them most.

Psychological resilience isn't about suppressing stress. It's about the recovery cycle:

• How quickly do you return to baseline after a difficult period?
• Do you have practices that actively support that recovery?
• Are you building capacity, or drawing it down?

Most people are drawing it down without realising it.

At Resilium, we assess psychological resilience not as a personality trait — but as a functional state that can be understood, tracked, and improved.

Because the goal isn't to perform well under pressure forever. It's to build conditions where the pressure becomes manageable.`,
    graphicDirection: "Subtle pressure wave graphic with calm recovery curve. Dark navy, brand colors.",
  },
  {
    id: 5, week: 5, date: "June 24, 2026",
    quarter: "Q2 2026", phase: "Awareness", phaseGoal: "Brand recognition and profile follows",
    hook: "Your support network is a resilience asset — but not in the way most people think.",
    body: `Most people, if asked, would say they have a good network.

But network size is not the same as social resilience.

The more useful question is: who would you actually call at 2am during a crisis — and who would answer?

Research on social resilience consistently shows that quality of connection matters far more than quantity. A large LinkedIn network offers almost no practical support during a personal disruption. A few deeply trusted relationships can make an enormous difference.

Social resilience includes:

• Close relationships you can rely on for practical help
• A broader community that provides belonging and perspective
• Professional relationships that create optionality during transitions

When we map people's social resilience through the assessment, it's often the dimension they've thought about least — and the one with the most room for meaningful improvement.

The goal isn't to build a bigger network. It's to build a more intentional one.`,
    graphicDirection: "Node-network illustration emphasizing depth over breadth. Soft amber connections.",
  },
  {
    id: 6, week: 6, date: "July 01, 2026",
    quarter: "Q2 2026", phase: "Awareness", phaseGoal: "Brand recognition and profile follows",
    hook: "Resilience isn't one thing. It's six measurable dimensions — and you're probably strong in some and weak in others.",
    body: `Most resilience frameworks focus on one thing: mindset.

That's not wrong. But it's incomplete.

At Resilium, we assess six dimensions:

1. Financial resilience — your runway and economic buffers
2. Career resilience — your adaptability and professional optionality
3. Psychological resilience — your capacity to manage stress and recover
4. Social resilience — the depth and reliability of your support systems
5. Physical resilience — your health as a foundational resource
6. Practical resilience — your emergency systems and preparedness

Most people have a mixed profile. Financially solid but socially isolated. Mentally strong but physically depleted. Practically unprepared despite feeling generally confident.

The profile matters because resilience in one dimension doesn't transfer automatically to others.

Understanding your specific pattern — where you're strong, where you're exposed — is what makes improvement targeted rather than generic.

That's what the assessment is designed to reveal.`,
    graphicDirection: "Six-dimension radar chart in brand colors. Clean and informative.",
  },

  // ─── Q3 2026 — Authority ─────────────────────────────────────────────────────
  {
    id: 7, week: 7, date: "July 08, 2026",
    quarter: "Q3 2026", phase: "Authority", phaseGoal: "Increase assessment completions",
    hook: "Calm is a strategic advantage. Not a personality trait — a trainable skill.",
    body: `There's a common assumption that some people are just naturally calm under pressure.

The research suggests something more interesting.

Calm — the ability to maintain clear thinking and measured responses during uncertainty — is less about temperament and more about:

• The existence of prior plans (so the brain isn't improvising from scratch)
• Physical recovery states (sleep, stress load, baseline activation)
• Practiced decision frameworks that reduce cognitive load in the moment

In other words, calm is partly downstream of preparation.

People who have thought through scenarios in advance, who have practical systems in place, and who know their own resilience profile — tend to respond more steadily when disruption actually arrives.

This is one of the less obvious insights from the Resilium assessment: improving your practical and financial resilience often improves your psychological resilience too.

Because when you've reduced objective vulnerability, the subjective experience of threat tends to follow.`,
    graphicDirection: "Centered calming typography with subtle geometric calm cues. Deep navy.",
  },
  {
    id: 8, week: 8, date: "July 15, 2026",
    quarter: "Q3 2026", phase: "Authority", phaseGoal: "Increase assessment completions",
    hook: "The most resilient people aren't the most connected. They're the most specifically connected.",
    body: `There's a myth that resilience requires a large, active social network.

It doesn't.

What the research on social support actually shows: the critical factor is the presence of a small number of deeply reliable relationships — people who provide practical help, not just emotional affirmation.

Two categories matter most:

Strong ties — family, close friends, people you've built genuine trust with over time. These are your crisis contacts. The people who will show up, not just sympathize.

Useful ties — professional connections, community members, people with different skills and contexts than your own. These expand your options during transitions.

Most people optimize for neither deliberately.

At Resilium, social resilience is one of the dimensions most people are surprised by — because it requires honest reflection on the reliability of relationships you might be taking for granted.

The question isn't "do you have people around you?"

It's: "could you actually count on them?"`,
    graphicDirection: "Depth-over-breadth relationship map. Two-tier node illustration.",
  },
  {
    id: 9, week: 9, date: "July 22, 2026",
    quarter: "Q3 2026", phase: "Authority", phaseGoal: "Increase assessment completions",
    hook: "Geographic flexibility is an underrated resilience variable — and most people don't factor it in.",
    body: `Where you can live shapes your options in a disruption.

This became obvious during 2020, when remote work suddenly became possible for millions of people who had never considered it. For some, it created options. For others, a rigid location dependency revealed itself as a significant vulnerability.

Geographic resilience includes:

• The ability to work remotely — or to relocate without destroying your income
• Dual-residency options or family networks in different locations
• Low lock-in to a single high-cost market

For people with children in school, mortgages, or care responsibilities, this dimension is often constrained — and that's important to acknowledge honestly.

But for those who have more flexibility than they've recognized, it's worth mapping.

In our assessment, location flexibility contributes to your overall practical resilience score — not because everyone needs to move, but because knowing your options matters.

Awareness of your geographic constraints is itself a form of preparation.`,
    graphicDirection: "Map-inspired mobility graphic. Clean, subtle location markers in amber.",
  },
  {
    id: 10, week: 10, date: "July 29, 2026",
    quarter: "Q3 2026", phase: "Authority", phaseGoal: "Increase assessment completions",
    hook: "Preparedness and paranoia are not the same thing. Most people conflate them.",
    body: `"Prepper" culture has given practical preparedness a branding problem.

Because the version of preparedness that actually matters is quiet, boring, and deeply unsexy:

• Three days of food and water in the event of a disruption
• A copy of your important documents stored somewhere accessible
• Knowing your local emergency contacts and procedures
• A basic financial buffer that buys time if income stops

These aren't extreme measures. They're the practical equivalent of having car insurance — you're not planning to crash, you're reducing the cost if you do.

At Resilium, practical resilience is one of the most actionable dimensions in the assessment — because the gaps are often specific, the improvements are concrete, and most of them take less than an afternoon to address.

The goal is not to build a bunker. It's to reduce the distance between where you are and where you'd need to be if things went sideways.

That gap, for most people, is smaller than they fear and larger than they realize.`,
    graphicDirection: "Elegant preparedness checklist graphic. Calm, not alarmist. Brand palette.",
  },
  {
    id: 11, week: 11, date: "August 05, 2026",
    quarter: "Q3 2026", phase: "Authority", phaseGoal: "Increase assessment completions",
    hook: "Honest self-assessment requires a safe environment. That's a design decision, not a feature.",
    body: `One of the first choices we made when building Resilium: you can take the assessment without creating an account.

This wasn't a technical compromise. It was intentional.

People answer questions about their finances, their relationships, and their psychological state more honestly when they trust the environment. When they know the data isn't being sold, profiled, or used against them.

At Resilium:

• The assessment is available anonymously
• No advertising profiles are created from your results
• No data is sold to third parties
• Creating an account is optional — for those who want to track progress over time

We believe privacy isn't a feature you add. It's part of the product's integrity.

Because the point of a resilience assessment is honest clarity — and that requires an environment where honesty is safe.

If you've been curious about where you stand but hesitant to start, that's a reasonable concern. We designed the tool with it in mind.`,
    graphicDirection: "Privacy lock illustration. Minimal data symbols. Trust-focused design.",
  },
  {
    id: 12, week: 12, date: "August 12, 2026",
    quarter: "Q3 2026", phase: "Authority", phaseGoal: "Increase assessment completions",
    hook: "We didn't invent the resilience framework. We built the tool the research was missing.",
    body: `The six dimensions in the Resilium assessment aren't proprietary.

They're grounded in decades of peer-reviewed research across:

• Positive psychology (Seligman, Luthans, and the work on psychological capital)
• Emergency preparedness science (FEMA's community resilience frameworks)
• Behavioral economics (how financial buffers affect decision quality under stress)
• Social support research (the documented health and recovery outcomes tied to relationship quality)

What was missing wasn't the knowledge. It was a tool that translated it into something a person could act on in under five minutes.

Most resilience research exists in academic journals or is buried in government emergency preparedness documents.

Resilium exists to make it accessible — and practical.

If you're curious about the research foundations behind your assessment results, the Pro report includes the methodology. The goal was always transparency: you should know why the questions are the questions.`,
    graphicDirection: "Research paper and framework collage. Clean academic aesthetic, warm accents.",
  },
  {
    id: 13, week: 13, date: "August 19, 2026",
    quarter: "Q3 2026", phase: "Authority", phaseGoal: "Increase assessment completions",
    hook: "The households that navigate disruption best share one underrated trait: they knew their gaps before the crisis arrived.",
    body: `Crisis reveals gaps. It doesn't create them.

The financial vulnerability that surfaces during a job loss was already there. The strained relationship that breaks under stress was already fraying. The emergency supply cabinet that turns out to be empty — that decision (or non-decision) was made months earlier.

What separates households that recover quickly from those that don't is rarely dramatic.

It's usually the presence of:

• Prior awareness of specific vulnerabilities
• Small, deliberate improvements made before pressure arrived
• A clearer picture of what they had to work with

This is why we built the assessment before we built anything else. Not because knowing is sufficient — but because not knowing is the precondition for being caught off guard.

The most useful time to identify a gap is before it matters.

Not after.`,
    graphicDirection: "Before/after contrast visual. Calm preparation vs reactive scramble. Dark, elegant.",
  },
  {
    id: 14, week: 14, date: "August 26, 2026",
    quarter: "Q3 2026", phase: "Authority", phaseGoal: "Increase assessment completions",
    hook: "There's a measurable gap between feeling prepared and being prepared. Most people are on the wrong side of it.",
    body: `Subjective resilience and objective resilience are different things.

Subjective resilience is how prepared you feel. Objective resilience is how prepared you actually are.

In our assessment data, the two don't always align.

People who feel financially secure often have less runway than they think when it's modeled out. People who feel socially supported sometimes discover that their network is wide but shallow. People who consider themselves psychologically robust haven't stress-tested that belief against recent evidence.

This isn't a reason for alarm. It's a reason for precision.

The value of an assessment isn't to tell you you're doing badly. It's to replace a general feeling ("I think I'm okay") with specific, actionable clarity ("I'm strong here, exposed there, and here's what to work on").

That shift — from feeling to knowing — is what tends to drive real, targeted improvement.

Feeling prepared is not the same as being prepared.

But it's where most people stop.`,
    graphicDirection: "Subjective vs objective gap visualization. Clean chart, measured typography.",
  },
  {
    id: 15, week: 15, date: "September 02, 2026",
    quarter: "Q3 2026", phase: "Authority", phaseGoal: "Increase assessment completions",
    hook: "What a resilience score of 62 actually tells you — and what it doesn't.",
    body: `A score of 62 out of 100 on the Resilium assessment isn't a verdict.

It's a starting point — and a map.

What it tells you: across six dimensions, you're above the midpoint overall, but the aggregate masks a range. Most people with a score of 62 are strong in one or two areas and significantly weaker in others.

What it doesn't tell you: how much the gaps matter, which ones to address first, or how quickly things can improve.

That's what the detailed report is for.

A score breakdown might reveal, for example:

• Financial: 78 (strong runway, good buffers)
• Psychological: 71 (generally stable, good recovery)
• Social: 54 (some isolation, limited crisis contacts)
• Practical: 41 (minimal emergency preparation)

In that case, the priority isn't abstract self-improvement. It's two specific dimensions with specific, addressable gaps.

The number opens the conversation. The dimension breakdown tells you where to focus.`,
    graphicDirection: "Score breakdown graphic. Dimension bars with amber highlights on the low ones.",
  },
  {
    id: 16, week: 16, date: "September 09, 2026",
    quarter: "Q3 2026", phase: "Authority", phaseGoal: "Increase assessment completions",
    hook: "The financial resilience question most people answer wrong — not because they're uninformed, but because the mental math is counterintuitive.",
    body: `When we ask people to estimate their financial runway — how many months they could sustain their current lifestyle without income — the answer is usually optimistic.

The mental math people do: savings ÷ monthly expenses.

The mental math that actually matters: liquid savings (not retirement accounts, not equity, not investments that can't be accessed quickly) ÷ realistic monthly essentials.

The gap between those two numbers is often substantial.

Additionally, most people don't factor in:

• How quickly discretionary spending drops when income stops
• Which expenses are fixed vs immediately reducible
• What their realistic income floor looks like from alternative sources

Financial resilience in the assessment isn't about judging how much you've saved. It's about helping you understand what your actual buffer is — so you can make informed decisions about whether it's enough and what "enough" looks like for your specific situation.

Counterintuitive insight: a lower income with a longer runway is often more resilient than a higher income with no buffer.`,
    graphicDirection: "Runway calculation visual. Liquid vs illiquid assets. Clean financial aesthetic.",
  },
  {
    id: 17, week: 17, date: "September 16, 2026",
    quarter: "Q3 2026", phase: "Authority", phaseGoal: "Increase assessment completions",
    hook: "Resilience looks different at 30 than it does at 50. A useful framework needs to account for that.",
    body: `A 28-year-old with no emergency savings but three marketable skills and a highly transferable career has a very different resilience profile from a 52-year-old with six months of runway, an established network, but declining physical capacity and limited career flexibility.

Neither profile is better. They reflect different life stages with different vulnerabilities and different levers.

This matters for assessment design.

At Resilium, we don't benchmark people against a single "ideal" score. We help people understand their profile in context — where their current life stage creates natural strength, and where it creates specific exposure.

For younger adults: career adaptability and skill development often matter most.

For mid-career adults: financial resilience and physical health become increasingly important.

For those approaching or in later life stages: social resilience and practical preparedness tend to be the highest-leverage areas.

The goal is always the same: targeted clarity, not generic advice.

Your resilience profile is yours. It should be assessed as such.`,
    graphicDirection: "Life stage arc with resilience dimension priorities. Thoughtful, measured design.",
  },
  {
    id: 18, week: 18, date: "September 23, 2026",
    quarter: "Q3 2026", phase: "Authority", phaseGoal: "Increase assessment completions",
    hook: "The most common thing people do differently after completing the Resilium assessment — it's not what most expect.",
    body: `We expected people to come out of the assessment focused on financial prep. On emergency kits. On tangible, practical to-do lists.

And some do.

But the most consistent behavioral shift we hear about is simpler:

People have a conversation they'd been avoiding.

With a partner about finances. With a parent about what support looks like if something goes wrong. With themselves about whether they've been honest about their psychological state.

The assessment doesn't force those conversations. But it creates the vocabulary and the permission for them.

Resilience, for most people, is not a solo project. And the exercise of mapping it — across six dimensions, honestly — tends to surface the conversations that were already necessary but hadn't started.

That's not a designed outcome. It's a recurring one.

If you've been putting off a particular conversation because you're not sure how to start it — sometimes a shared score is the place to begin.`,
    graphicDirection: "Two figures in conversation, calm setting. Abstract and warm. Brand palette.",
  },
  {
    id: 19, week: 19, date: "September 30, 2026",
    quarter: "Q3 2026", phase: "Authority", phaseGoal: "Increase assessment completions",
    hook: "I built Resilium because I was looking for a tool that didn't exist — and I couldn't stop thinking about why.",
    body: `There's no shortage of content about resilience.

Books. Frameworks. Motivational posts about bouncing back.

But when I went looking for something that would tell me concretely — across the different dimensions of my life — where I was actually vulnerable, I couldn't find it.

What existed was either too abstract (mindset-focused personality assessments) or too narrow (financial-only calculators, emergency prep checklists with no broader context).

The question I wanted answered was simpler: across everything that matters for getting through a hard period — finances, adaptability, psychological state, relationships, health, practical preparation — where do I actually stand?

That question drove the research. And the research drove the product.

Resilium is the tool I was looking for. Built on the frameworks I found in academic literature and emergency preparedness science, translated into something a person can complete in five minutes and act on immediately.

The goal has always been clarity. Not alarm, not judgment — just an honest, specific picture.

That felt worth building.`,
    graphicDirection: "Founder-style portrait visual with centered quote treatment. Personal, grounded.",
  },

  // ─── Q4 2026 — Conversion ─────────────────────────────────────────────────────
  {
    id: 20, week: 20, date: "October 07, 2026",
    quarter: "Q4 2026", phase: "Conversion", phaseGoal: "Paid conversions and account retention",
    hook: "Free. Five minutes. More useful than most things you'll do this week.",
    body: `The Resilium assessment doesn't require an account to take.

No email address. No credit card. No long registration form before you can see your results.

You answer the questions, get your score across six dimensions, and see your profile — immediately.

Here's what five minutes gets you:

• A score across financial, career, psychological, social, physical, and practical resilience
• A clear breakdown of your strongest and most vulnerable dimensions
• An honest picture of where you stand — not a generic wellness quiz, but a structured assessment built on actual resilience research

Most people finish and say the same thing: "I knew I was weak in one area. I didn't realize I was actually stronger in another."

That's the value. Replacing assumption with clarity.

The Pro report goes further — AI-generated analysis, prioritized recommendations, a 30-day action plan.

But the free assessment is a complete starting point in its own right.

If you've been meaning to take it, this is the prompt.`,
    graphicDirection: "Simple 5-minute visual with dimension preview. Clean conversion graphic.",
  },
  {
    id: 21, week: 21, date: "October 14, 2026",
    quarter: "Q4 2026", phase: "Conversion", phaseGoal: "Paid conversions and account retention",
    hook: "The Pro report doesn't just show your score. It tells you exactly what to work on first — and why.",
    body: `The free assessment gives you your profile.

The Pro report tells you what to do with it.

Here's the difference in practice:

The free score might show you that your practical resilience is a 44 and your financial resilience is a 71. That's useful. But it doesn't tell you which specific gaps in your practical score matter most, what the first three actions are, or how long those changes realistically take.

The Pro report does.

It includes:

• An AI-generated analysis of your full profile — your strengths, your exposure points, and how they interact
• A prioritized set of recommendations, ordered by impact and effort
• A 30-day action plan with specific, concrete steps
• Dimension-level breakdowns that explain the reasoning behind each recommendation

The goal isn't a longer report. It's a more useful one — something you could open on a Monday morning and actually work from.

If you've already taken the free assessment and found it useful, the Pro report is the logical next step.`,
    graphicDirection: "Pro report preview mockup. Clean, premium aesthetic. Amber accent details.",
  },
  {
    id: 22, week: 22, date: "October 21, 2026",
    quarter: "Q4 2026", phase: "Conversion", phaseGoal: "Paid conversions and account retention",
    hook: "Thirty days of intentional resilience building. Here's what that actually looks like in practice.",
    body: `The 30-day challenge in Resilium Pro is not a motivational program.

It's a structured sequence of small, targeted actions — drawn from your specific assessment results and calibrated to your lowest-scoring dimensions.

What it looks like week by week:

Week 1: Understanding your profile and identifying your top priority area.
Week 2: Taking the first concrete action in that area (specific to your results).
Week 3: Building a second habit or completing a second task in an adjacent dimension.
Week 4: Reviewing, reassessing where you started, and deciding what comes next.

The actions are specific. If your practical resilience is your lowest dimension, the challenge doesn't give you generic advice — it tells you to check your 72-hour kit, locate your important documents, and identify your two emergency contacts. Checkboxes, not concepts.

Pro members who complete the 30-day challenge consistently show score improvements of 8–15 points across the dimensions they focused on.

That's not a dramatic transformation. It's a meaningful, measurable shift built from realistic daily investment.`,
    graphicDirection: "30-day challenge calendar graphic. Week-by-week progression in brand palette.",
  },
  {
    id: 23, week: 23, date: "October 28, 2026",
    quarter: "Q4 2026", phase: "Conversion", phaseGoal: "Paid conversions and account retention",
    hook: "Your resilience profile from six months ago is probably already outdated.",
    body: `Resilience is not a fixed score. It changes as life changes.

A job transition affects your career and financial dimensions. A relationship change shifts your social resilience. A period of sustained stress without recovery shows up in your psychological score. Moving cities rewrites your practical and social profiles entirely.

Most people who take the Resilium assessment once find it genuinely useful.

Most people who take it twice find it more useful — because the comparison reveals exactly what changed, what improved, and what new gaps opened up in the meantime.

Pro members can retake the assessment any time and track their scores over time.

The goal isn't to watch a number go up. It's to keep the picture current — so that when you're making decisions about where to put your energy, you're working from an accurate map of where you actually are, not where you were six months ago.

Life changes faster than most people update their self-assessments.

That gap is worth closing.`,
    graphicDirection: "Before/after score comparison visual. Dimension shifts over time. Clean timeline.",
  },
  {
    id: 24, week: 24, date: "November 04, 2026",
    quarter: "Q4 2026", phase: "Conversion", phaseGoal: "Paid conversions and account retention",
    hook: "The most revealing conversation about household resilience often starts with two people comparing scores.",
    body: `Resilium has a household assessment mode — and it's one of the features people consistently find most useful.

Here's how it typically plays out:

Two partners take the assessment separately. They compare results. And immediately, the conversation stops being abstract.

"I scored 38 on practical resilience. I didn't realize we had no emergency supplies."

"You scored 71 on social resilience. I scored 52. That's not a gap I expected."

Household resilience is a combined profile — the strengths in one person's score can partially offset gaps in the other's, and vice versa. But only if you can see the combined picture.

More importantly: resilience planning — financial decisions, emergency preparation, social support systems — requires shared awareness. It's very difficult to improve things together if only one person knows where the gaps are.

The household mode surfaces those gaps, side by side, in a way that's productive rather than accusatory.

It's not a test. It's a starting point for a conversation that most households need to have.`,
    graphicDirection: "Two score profiles side-by-side. Household overlap visualization. Warm, calm.",
  },
  {
    id: 25, week: 25, date: "November 11, 2026",
    quarter: "Q4 2026", phase: "Conversion", phaseGoal: "Paid conversions and account retention",
    hook: "A score of 58 is not a bad result. It's an honest one — and that's more useful.",
    body: `Most people who take the Resilium assessment for the first time are braced for judgment.

They're not looking for flattery. But they're also worried the score will confirm something uncomfortable they've been avoiding.

Here's what we've learned from thousands of assessments: the score people dread seeing is almost always more actionable than the one they hope for.

A 58 — or a 47, or a 61 — is not a verdict. It's a specific picture of where you are right now, across six dimensions, with the gaps clearly labeled.

And a labeled gap is infinitely easier to address than a vague unease.

The people who make the most meaningful improvements after the assessment aren't the ones who scored 85 and are fine-tuning. They're the ones who scored in the 50s, saw exactly where they were exposed, and worked systematically on the two or three dimensions that mattered most.

Lower scores often mean more room for meaningful change — and more clarity about where to start.

The honesty is the value. Not the number.`,
    graphicDirection: "Score framing graphic: starting point, not verdict. Calm, encouraging typography.",
  },
  {
    id: 26, week: 26, date: "November 18, 2026",
    quarter: "Q4 2026", phase: "Conversion", phaseGoal: "Paid conversions and account retention",
    hook: "The people who improve the most after taking the Resilium assessment aren't the ones who scored highest at the start.",
    body: `There's a pattern in the data that we find consistently worth sharing.

Users who begin with scores above 80 tend to make small, incremental improvements. They're already strong across most dimensions — the remaining gains are real but narrow.

Users who begin in the 50–70 range — and complete the Pro 30-day challenge — show the most significant score changes. Not because they worked harder, but because there was more specific, addressable territory to cover.

This matters for one practical reason:

If you've been putting off taking the assessment because you suspect your score will be low, that suspicion is actually the best argument for starting now.

The value of the assessment scales with the gap between where you are and where you want to be.

And the people who act on that gap — methodically, specifically, over 30 days — tend to look back at their starting score with something closer to gratitude than embarrassment.

It's the honest picture that makes change possible.`,
    graphicDirection: "Improvement trajectory chart. Low start, high progress arc. Brand palette.",
  },
  {
    id: 27, week: 27, date: "November 25, 2026",
    quarter: "Q4 2026", phase: "Conversion", phaseGoal: "Paid conversions and account retention",
    hook: "Year-end is the most underused window for honest self-assessment. Most people miss it entirely.",
    body: `November and December are unusual months.

The year is still visible — recent enough to evaluate clearly, far enough along to see the patterns. And the new year creates a natural horizon that makes planning feel relevant.

Most people use this window for year-in-review professionally: performance reviews, goal-setting, planning meetings.

Almost no one uses it to assess their personal resilience — their financial position, their support systems, their psychological state, their practical preparedness.

That's the gap.

The question worth asking before December ends isn't "what did I achieve this year?"

It's: "if a significant disruption arrived in January, how would I actually be positioned to navigate it?"

The Resilium assessment takes less than five minutes to complete. The Pro report gives you the specific picture in a format you can act on before the new year starts.

The best time to do this kind of audit is before you need it.

Year-end is a good time.`,
    graphicDirection: "Year-end reflection visual. Calendar fading into new year. Calm, purposeful.",
  },
  {
    id: 28, week: 28, date: "December 02, 2026",
    quarter: "Q4 2026", phase: "Conversion", phaseGoal: "Paid conversions and account retention",
    hook: "What we learn when someone takes the Resilium assessment for the second time.",
    body: `A first assessment gives you a picture.

A second assessment — taken six to twelve months later — gives you something more valuable: evidence of whether you actually changed anything.

When users retake the assessment, we see a few consistent patterns:

The dimensions they worked on actively improve — often significantly. The dimensions they didn't touch stay roughly the same or drift slightly based on life changes. And occasionally, a new gap appears in an area that seemed strong before — because circumstances shifted.

That third pattern is particularly important.

Life changes faster than most people update their self-assessments. A new job, a move, a family change, a financial shift — any of these can meaningfully alter your resilience profile in ways that aren't immediately obvious until you look directly at them.

Pro members can retake and track their scores over time. The comparison view makes the changes — and the work required — concrete and visible.

The most useful question isn't "where do I stand?"

It's "where do I stand now, compared to where I stood before — and what does the difference tell me?"`,
    graphicDirection: "Score tracking over time. Two-point comparison visual. Clean, measured.",
  },
  {
    id: 29, week: 29, date: "December 09, 2026",
    quarter: "Q4 2026", phase: "Conversion", phaseGoal: "Paid conversions and account retention",
    hook: "Resilience is built in the quiet moments — not just the crises.",
    body: `Crisis gets the attention. Crisis is where resilience becomes visible.

But resilience isn't actually built in a crisis. It's built in the months and years before one arrives — in the small, consistent decisions that most people don't connect to preparedness:

• Maintaining a savings buffer even when nothing is wrong
• Keeping relationships alive during periods when you don't "need" them
• Practicing recovery — sleep, movement, genuine rest — as a non-negotiable
• Keeping important documents updated and accessible before you urgently need them

None of these are dramatic. None of them feel like crisis preparation.

But each one is a quiet act of building the foundations that make disruption navigable when it arrives.

The 30-day challenge in Resilium Pro is designed around exactly this principle: not dramatic transformation, but consistent small actions that compound into a meaningfully stronger profile.

Resilience isn't built by people who wait for a reason to prepare.

It's built by people who treat quiet periods as the right time to do it.`,
    graphicDirection: "Compounding habits visual. Small steps building a solid foundation. Warm amber.",
  },
  {
    id: 30, week: 30, date: "December 16, 2026",
    quarter: "Q4 2026", phase: "Conversion", phaseGoal: "Paid conversions and account retention",
    hook: "The holiday season is a stress test. Most people don't treat it as one — until it's over.",
    body: `December is, for many people, one of the most demanding months of the year.

Financial pressure from spending, gifting, and travel. Social demands that stretch energy and time. Disrupted routines that affect sleep, exercise, and psychological recovery. Family dynamics that can be a source of deep support — or significant stress.

It's also, almost universally, treated as a period to get through rather than a period to navigate intentionally.

A few things worth considering as the holidays approach:

Financial: Do you have a ceiling for December spending that you can genuinely absorb — without eroding the buffer that January might need?

Social: Are you going into the season knowing whose presence will genuinely restore you vs whose will deplete you — and have you protected time accordingly?

Psychological: What's your actual recovery plan for the days when the calendar finally clears?

These aren't holiday-specific questions. They're resilience questions.

The assessment is still free. Five minutes. And the results are useful year-round — including now.`,
    graphicDirection: "December/winter aesthetic in brand palette. Calm, not festive-commercial.",
  },
  {
    id: 31, week: 31, date: "December 23, 2026",
    quarter: "Q4 2026", phase: "Conversion", phaseGoal: "Paid conversions and account retention",
    hook: "2026 has been a year of navigating uncertainty. Here's what we've learned building a resilience platform through it.",
    body: `Building Resilium in 2026 has meant thinking constantly about a question that the year itself kept raising:

What does it actually take to navigate uncertainty well?

Not theoretically. Practically.

Here's what the data and the stories have taught us:

The people who navigated the year's disruptions best — economic uncertainty, personal transitions, unexpected challenges — shared a few consistent traits.

They knew their specific vulnerabilities before the disruption arrived. They weren't surprised by which area of their life became the pressure point.

They had at least one relationship they could rely on for concrete support, not just sympathy.

And they'd made at least some small, practical preparations that bought them time when time mattered most.

None of that required a perfect life or a perfect score. It required self-knowledge and a few specific preparations.

That's what Resilium exists to support — not in a crisis, but before one.

If you haven't taken the assessment yet, end-of-year is a good time to start.`,
    graphicDirection: "Year-end reflection. Honest, grounded. Resilium brand with subtle warmth.",
  },
  {
    id: 32, week: 32, date: "December 30, 2026",
    quarter: "Q4 2026", phase: "Conversion", phaseGoal: "Paid conversions and account retention",
    hook: "2027 begins with a question worth answering honestly: where do you actually stand?",
    body: `Most people start the new year with intentions.

Fewer start it with a clear picture of where they are.

The gap between intentions and outcomes — the thing that makes New Year's resolutions so reliably temporary — is often exactly that: the absence of an honest baseline.

You can't meaningfully improve your financial resilience without knowing what your actual runway is. You can't improve your social resilience without knowing who you'd actually call in a crisis. You can't address practical gaps you haven't mapped.

The Resilium assessment is a five-minute baseline. Not a resolution — a starting point.

It tells you, across six dimensions, where you're genuinely strong and where you're specifically exposed.

What you do with that information is entirely up to you.

But going into 2027 knowing your actual resilience profile — rather than assuming — is a more honest and more useful beginning than most people give themselves.

The assessment is free. It takes five minutes.

Here's to a year of building from clarity.`,
    graphicDirection: "New year forward-looking graphic. Horizon, purposeful typography. Brand palette.",
  },
];

export const QUARTER_COLOR: Record<LIQuarter, string> = {
  "Q2 2026": "bg-sky-500/20 text-sky-300 border-sky-500/30",
  "Q3 2026": "bg-violet-500/20 text-violet-300 border-violet-500/30",
  "Q4 2026": "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

export const PHASE_COLOR: Record<LIPhase, string> = {
  Awareness:  "bg-sky-500/20 text-sky-300 border-sky-500/30",
  Authority:  "bg-violet-500/20 text-violet-300 border-violet-500/30",
  Conversion: "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

// Founder thought-leadership posts (standalone — not in the weekly calendar)
export const FOUNDER_POSTS = [
  {
    id: "fl-1",
    title: "Why I Built Resilium",
    body: `The world has no shortage of information about resilience.

What it lacks are practical tools people can actually use.

After years of watching people navigate economic shocks, burnout, uncertainty, and disruption, one thing became clear:
Most people don't know where they're actually vulnerable.

They may feel confident emotionally but have no financial runway.
Or they may be financially stable while quietly operating at psychological exhaustion.

Resilience is not one thing.
It's the interaction between mindset, resources, adaptability, and support systems.

That's why we built Resilium around both psychology and logistics.

Not to scare people.
Not to judge them.
But to give them clarity.

Because clarity changes decisions.

And better decisions compound over time.`,
    cta: "Take the assessment at resilium-platform.com",
  },
  {
    id: "fl-2",
    title: "Preparedness Without Paranoia",
    body: `Preparedness has a branding problem.

People hear the word and imagine fear, panic, or worst-case scenarios.

But real resilience planning is much quieter than that.

It's having enough savings to absorb a disruption.
It's having transferable skills.
It's having people you can call when life becomes unstable.
It's knowing how you respond under pressure.

Preparedness isn't about expecting catastrophe.
It's about reducing avoidable fragility.

The goal is not to live in fear.
The goal is to create enough stability that uncertainty becomes manageable.`,
    cta: "Explore your resilience profile at resilium-platform.com",
  },
  {
    id: "fl-3",
    title: "Privacy Is Part of Resilience",
    body: `One of the first decisions we made at Resilium was simple:

People should not have to surrender their identity to understand themselves.

That's why you can take the assessment anonymously.
No forced account creation.
No advertising profile.
No selling user data.

We believe privacy is not a feature.
It's part of resilience itself.

Because people make more honest decisions when they trust the environment they're operating in.`,
    cta: "Learn more at resilium-platform.com",
  },
];
