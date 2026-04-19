export type DimKey = "financial" | "health" | "skills" | "mobility" | "psychological" | "resources";

export interface Tip {
  text: string;
  action: string;
}

export const DIM_LABELS: Record<DimKey, string> = {
  financial: "Financial",
  health: "Health",
  skills: "Skills",
  mobility: "Mobility",
  psychological: "Psychological",
  resources: "Resources",
};

const TIPS_BANK: Record<DimKey, Tip[]> = {
  financial: [
    { text: "Your emergency fund is the single most protective financial asset you have.", action: "Check your balance — is it 3–6 months of essential expenses?" },
    { text: "Recurring subscriptions are the easiest money leaks to find.", action: "Open your bank statement and cancel one unused subscription." },
    { text: "Diversified income is one of the strongest financial resilience signals.", action: "List your income sources. If one vanished, what's left?" },
    { text: "Automating savings removes willpower from the equation entirely.", action: "Set up a small automatic transfer to a dedicated emergency fund." },
    { text: "If your primary income disappeared tomorrow, how long could you cover the basics?", action: "Calculate your true monthly essential spend vs. liquid savings." },
    { text: "Beneficiary designations override your will — they're often overlooked.", action: "Log into one account and verify the beneficiary is current." },
    { text: "Fee waivers are almost always available if you simply ask.", action: "Call your bank today and ask about fee reductions." },
  ],
  health: [
    { text: "Preventative appointments are dramatically cheaper than reactive ones.", action: "Identify one medical appointment you've been deferring and book it." },
    { text: "Running out of medication during a crisis is a preventable risk.", action: "Check your supply — do you have 30 days of critical medication on hand?" },
    { text: "Physical movement is a direct input to resilience, not just health.", action: "Take a 20-minute walk today. No equipment required." },
    { text: "Sleep is not optional — it's a resilience input. Fatigue degrades every decision.", action: "Assess your sleep honestly. Averaging 7–8 hours? Identify one change." },
    { text: "Box breathing resets your nervous system in under 3 minutes.", action: "Try it now: 4 counts in, hold 4, out 6. Repeat 4 times." },
    { text: "Health insurance gaps are invisible until they're not.", action: "Review your coverage: deductible, out-of-pocket max, covered conditions." },
    { text: "Knowing your nearest emergency resources before you need them reduces panic.", action: "Confirm the address of your nearest ER and urgent care clinic." },
  ],
  skills: [
    { text: "Your most marketable skills are your most portable resilience assets.", action: "Name your top 3 skills. Are they current or quietly stale?" },
    { text: "Your network is your early warning system and safety net combined.", action: "Reach out to one professional contact you haven't spoken to in 3 months." },
    { text: "Teaching what you know is the fastest way to solidify mastery.", action: "Explain something you're good at to someone else today." },
    { text: "A 'crisis resume' is what you'd offer if you needed income starting this week.", action: "Write 5 things you could do for money if your job disappeared." },
    { text: "Learning doesn't require a course — 20 minutes of focused content counts.", action: "Watch one tutorial or read one article in a skill gap area." },
    { text: "Adaptability is built through deliberate variety.", action: "Do one routine task a completely different way today." },
    { text: "LinkedIn profiles degrade quietly while you're busy working.", action: "Update one section of your profile — headline, skills, or recent role." },
  ],
  mobility: [
    { text: "Expired or inaccessible documents are a silent resilience risk.", action: "Check that your passport and ID documents are valid and accessible." },
    { text: "A 72-hour bag doesn't need to be perfect to be useful.", action: "Gather: water, snacks, medications, charger, cash, and key documents." },
    { text: "Communication breakdown during a crisis amplifies every other problem.", action: "Confirm everyone at home knows where to meet if phones are unavailable." },
    { text: "Your vehicle's readiness is part of your mobility plan.", action: "Check fuel, tire pressure, and a basic emergency kit in your car." },
    { text: "Disruptions rarely give you time to plan a route — plan it in advance.", action: "Map one alternate route from home to a critical destination." },
    { text: "Knowing what relocation would cost removes fear from the decision.", action: "Research the monthly cost of staying in a hotel in one backup city." },
    { text: "The nearest shelter, hospital, and utility shutoff are worth knowing early.", action: "Look up your nearest emergency shelter and note the address." },
  ],
  psychological: [
    { text: "Named, specific stressors are far easier to act on than vague dread.", action: "Write your biggest stressor right now. Then write one concrete step." },
    { text: "Connection is one of the strongest predictors of resilience under pressure.", action: "Text or call one person you trust today — not to vent, just to connect." },
    { text: "Control is not binary. Even in hard situations, there are small levers.", action: "Identify one area where you have genuine agency right now. Start there." },
    { text: "Gratitude practice changes the signal-to-noise ratio of your thinking.", action: "Write three things that went reasonably well this week — however small." },
    { text: "Self-compassion fuels productivity; self-criticism drains it.", action: "Ask: what would I tell a close friend in my exact situation right now?" },
    { text: "Understanding your stress response is the first step to managing it.", action: "Notice your pattern: do you freeze, flee, or fight under pressure?" },
    { text: "Screen-free time is the psychological equivalent of a detox.", action: "Spend 10 intentional minutes without any device today." },
  ],
  resources: [
    { text: "Two weeks of food storage meaningfully changes your resilience profile.", action: "Open your pantry: how many days of food do you actually have?" },
    { text: "Water is the first resource to become scarce in most emergencies.", action: "Check your water storage — 1 gallon per person per day for 3+ days." },
    { text: "Documents stored only at home are a single point of failure.", action: "Scan key documents (IDs, insurance, medical) and store them in the cloud." },
    { text: "A working flashlight and first aid kit are table stakes — not optional.", action: "Check both. Replace expired items or batteries over a year old." },
    { text: "Cash provides a backup when digital payments fail during outages.", action: "Ensure you have a small reserve of physical cash accessible at home." },
    { text: "Community networks are often the fastest-responding resources in a local crisis.", action: "Identify one mutual aid group or community center near you. Save the contact." },
    { text: "Insurance limits erode in real value over time while costs rise.", action: "Pull up one policy and verify the coverage limits are still adequate." },
  ],
};

export function getDailyTip(dim: DimKey, date: Date = new Date()): Tip {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const tips = TIPS_BANK[dim];
  return tips[dayOfYear % tips.length];
}

export function getLowestDim(scores: Partial<Record<DimKey, number | null>>): DimKey {
  const dims: DimKey[] = ["financial", "health", "skills", "mobility", "psychological", "resources"];
  let lowest: DimKey = "psychological";
  let lowestScore = Infinity;
  for (const dim of dims) {
    const val = scores[dim];
    if (val != null && val < lowestScore) {
      lowestScore = val;
      lowest = dim;
    }
  }
  return lowest;
}
