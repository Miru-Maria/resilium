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
  graphicDirection: string;
}

// Shared body — identical for all 32 posts
export const LI_BODY = `Resilience is often misunderstood.

People assume it means toughness, optimism, or simply "handling stress well." But decades of research point to something much more practical: resilience is measurable, improvable, and deeply connected to the systems surrounding us.

At Resilium, we built our assessment around two realities:

• Psychological resilience — how you function under pressure
• Practical resilience — the financial, social, health, and logistical foundations that determine how well you absorb disruption

Because confidence without preparation is fragile.
And preparation without adaptability breaks under pressure.

The goal isn't fear.
The goal is clarity.

When people understand where they're strong — and where they're vulnerable — they make better decisions, recover faster, and navigate uncertainty with more confidence.

That's why the assessment exists:
To turn resilience from an abstract idea into something practical and actionable.`;

export const LI_CTA = "Take the assessment at resilium-platform.com (link in bio).";

export const LI_POSTS: LIPost[] = [
  // ─── Q2 2026 — Awareness ───────────────────────────────────────────────────
  {
    id: 1, week: 1, date: "May 27, 2026",
    quarter: "Q2 2026", phase: "Awareness", phaseGoal: "Brand recognition and profile follows",
    hook: "Most people think resilience is personality. Research says otherwise.",
    graphicDirection: "Minimalist infographic with resilience score bands in brand colors.",
  },
  {
    id: 2, week: 2, date: "June 03, 2026",
    quarter: "Q2 2026", phase: "Awareness", phaseGoal: "Brand recognition and profile follows",
    hook: "The pandemic revealed how preparation changes outcomes.",
    graphicDirection: "Split-screen visual: prepared household vs reactive household.",
  },
  {
    id: 3, week: 3, date: "June 10, 2026",
    quarter: "Q2 2026", phase: "Awareness", phaseGoal: "Brand recognition and profile follows",
    hook: "Savings don't just buy comfort. They buy decision-making time.",
    graphicDirection: "Simple savings runway chart with calm typography.",
  },
  {
    id: 4, week: 4, date: "June 17, 2026",
    quarter: "Q2 2026", phase: "Awareness", phaseGoal: "Brand recognition and profile follows",
    hook: "Pressure doesn't build character if it breaks capacity.",
    graphicDirection: "Dark navy background with subtle pressure wave illustration.",
  },
  {
    id: 5, week: 5, date: "June 24, 2026",
    quarter: "Q2 2026", phase: "Awareness", phaseGoal: "Brand recognition and profile follows",
    hook: "The people who adapt fastest often recover fastest.",
    graphicDirection: "Pathway graphic showing course correction and adaptability.",
  },
  {
    id: 6, week: 6, date: "July 01, 2026",
    quarter: "Q2 2026", phase: "Awareness", phaseGoal: "Brand recognition and profile follows",
    hook: "Transferable skills are modern insurance policies.",
    graphicDirection: "Stacked skill icons with amber highlights.",
  },

  // ─── Q3 2026 — Authority ───────────────────────────────────────────────────
  {
    id: 7, week: 7, date: "July 08, 2026",
    quarter: "Q3 2026", phase: "Authority", phaseGoal: "Increase assessment completions",
    hook: "Calm is a strategic advantage during uncertainty.",
    graphicDirection: "Portrait-style illustration with centered calming typography.",
  },
  {
    id: 8, week: 8, date: "July 15, 2026",
    quarter: "Q3 2026", phase: "Authority", phaseGoal: "Increase assessment completions",
    hook: "Resilience is rarely built alone.",
    graphicDirection: "Network-style illustration showing human support systems.",
  },
  {
    id: 9, week: 9, date: "July 22, 2026",
    quarter: "Q3 2026", phase: "Authority", phaseGoal: "Increase assessment completions",
    hook: "Location flexibility matters more than people realize.",
    graphicDirection: "Map/location-inspired mobility graphic.",
  },
  {
    id: 10, week: 10, date: "July 29, 2026",
    quarter: "Q3 2026", phase: "Authority", phaseGoal: "Increase assessment completions",
    hook: "Preparedness is not paranoia. It's reducing avoidable fragility.",
    graphicDirection: "Elegant checklist-style preparedness visual.",
  },
  {
    id: 11, week: 11, date: "August 05, 2026",
    quarter: "Q3 2026", phase: "Authority", phaseGoal: "Increase assessment completions",
    hook: "You shouldn't have to trade privacy for self-awareness.",
    graphicDirection: "Privacy lock illustration with minimal data symbols.",
  },
  {
    id: 12, week: 12, date: "August 12, 2026",
    quarter: "Q3 2026", phase: "Authority", phaseGoal: "Increase assessment completions",
    hook: "Resilium was built on peer-reviewed resilience research.",
    graphicDirection: "Research paper / framework collage with clean design.",
  },
  {
    id: 13, week: 13, date: "August 19, 2026",
    quarter: "Q3 2026", phase: "Authority", phaseGoal: "Increase assessment completions",
    hook: "Most people think resilience is personality. Research says otherwise.",
    graphicDirection: "Minimalist infographic with resilience score bands in brand colors.",
  },
  {
    id: 14, week: 14, date: "August 26, 2026",
    quarter: "Q3 2026", phase: "Authority", phaseGoal: "Increase assessment completions",
    hook: "The pandemic revealed how preparation changes outcomes.",
    graphicDirection: "Split-screen visual: prepared household vs reactive household.",
  },
  {
    id: 15, week: 15, date: "September 02, 2026",
    quarter: "Q3 2026", phase: "Authority", phaseGoal: "Increase assessment completions",
    hook: "Savings don't just buy comfort. They buy decision-making time.",
    graphicDirection: "Simple savings runway chart with calm typography.",
  },
  {
    id: 16, week: 16, date: "September 09, 2026",
    quarter: "Q3 2026", phase: "Authority", phaseGoal: "Increase assessment completions",
    hook: "Pressure doesn't build character if it breaks capacity.",
    graphicDirection: "Dark navy background with subtle pressure wave illustration.",
  },
  {
    id: 17, week: 17, date: "September 16, 2026",
    quarter: "Q3 2026", phase: "Authority", phaseGoal: "Increase assessment completions",
    hook: "The people who adapt fastest often recover fastest.",
    graphicDirection: "Pathway graphic showing course correction and adaptability.",
  },
  {
    id: 18, week: 18, date: "September 23, 2026",
    quarter: "Q3 2026", phase: "Authority", phaseGoal: "Increase assessment completions",
    hook: "Transferable skills are modern insurance policies.",
    graphicDirection: "Stacked skill icons with amber highlights.",
  },
  {
    id: 19, week: 19, date: "September 30, 2026",
    quarter: "Q3 2026", phase: "Authority", phaseGoal: "Increase assessment completions",
    hook: "Calm is a strategic advantage during uncertainty.",
    graphicDirection: "Portrait-style illustration with centered calming typography.",
  },

  // ─── Q4 2026 — Conversion ──────────────────────────────────────────────────
  {
    id: 20, week: 20, date: "October 07, 2026",
    quarter: "Q4 2026", phase: "Conversion", phaseGoal: "Paid conversions and account retention",
    hook: "Resilience is rarely built alone.",
    graphicDirection: "Network-style illustration showing human support systems.",
  },
  {
    id: 21, week: 21, date: "October 14, 2026",
    quarter: "Q4 2026", phase: "Conversion", phaseGoal: "Paid conversions and account retention",
    hook: "Location flexibility matters more than people realize.",
    graphicDirection: "Map/location-inspired mobility graphic.",
  },
  {
    id: 22, week: 22, date: "October 21, 2026",
    quarter: "Q4 2026", phase: "Conversion", phaseGoal: "Paid conversions and account retention",
    hook: "Preparedness is not paranoia. It's reducing avoidable fragility.",
    graphicDirection: "Elegant checklist-style preparedness visual.",
  },
  {
    id: 23, week: 23, date: "October 28, 2026",
    quarter: "Q4 2026", phase: "Conversion", phaseGoal: "Paid conversions and account retention",
    hook: "You shouldn't have to trade privacy for self-awareness.",
    graphicDirection: "Privacy lock illustration with minimal data symbols.",
  },
  {
    id: 24, week: 24, date: "November 04, 2026",
    quarter: "Q4 2026", phase: "Conversion", phaseGoal: "Paid conversions and account retention",
    hook: "Resilium was built on peer-reviewed resilience research.",
    graphicDirection: "Research paper / framework collage with clean design.",
  },
  {
    id: 25, week: 25, date: "November 11, 2026",
    quarter: "Q4 2026", phase: "Conversion", phaseGoal: "Paid conversions and account retention",
    hook: "Most people think resilience is personality. Research says otherwise.",
    graphicDirection: "Minimalist infographic with resilience score bands in brand colors.",
  },
  {
    id: 26, week: 26, date: "November 18, 2026",
    quarter: "Q4 2026", phase: "Conversion", phaseGoal: "Paid conversions and account retention",
    hook: "The pandemic revealed how preparation changes outcomes.",
    graphicDirection: "Split-screen visual: prepared household vs reactive household.",
  },
  {
    id: 27, week: 27, date: "November 25, 2026",
    quarter: "Q4 2026", phase: "Conversion", phaseGoal: "Paid conversions and account retention",
    hook: "Savings don't just buy comfort. They buy decision-making time.",
    graphicDirection: "Simple savings runway chart with calm typography.",
  },
  {
    id: 28, week: 28, date: "December 02, 2026",
    quarter: "Q4 2026", phase: "Conversion", phaseGoal: "Paid conversions and account retention",
    hook: "Pressure doesn't build character if it breaks capacity.",
    graphicDirection: "Dark navy background with subtle pressure wave illustration.",
  },
  {
    id: 29, week: 29, date: "December 09, 2026",
    quarter: "Q4 2026", phase: "Conversion", phaseGoal: "Paid conversions and account retention",
    hook: "The people who adapt fastest often recover fastest.",
    graphicDirection: "Pathway graphic showing course correction and adaptability.",
  },
  {
    id: 30, week: 30, date: "December 16, 2026",
    quarter: "Q4 2026", phase: "Conversion", phaseGoal: "Paid conversions and account retention",
    hook: "Transferable skills are modern insurance policies.",
    graphicDirection: "Stacked skill icons with amber highlights.",
  },
  {
    id: 31, week: 31, date: "December 23, 2026",
    quarter: "Q4 2026", phase: "Conversion", phaseGoal: "Paid conversions and account retention",
    hook: "Calm is a strategic advantage during uncertainty.",
    graphicDirection: "Portrait-style illustration with centered calming typography.",
  },
  {
    id: 32, week: 32, date: "December 30, 2026",
    quarter: "Q4 2026", phase: "Conversion", phaseGoal: "Paid conversions and account retention",
    hook: "Resilience is rarely built alone.",
    graphicDirection: "Network-style illustration showing human support systems.",
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
