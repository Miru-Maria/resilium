export type DimKey = "financial" | "health" | "skills" | "mobility" | "psychological" | "resources";

export interface Tip {
  text: string;
  action: string;
}

export const TIPS_BANK: Record<DimKey, Tip[]> = {
  financial: [
    {
      text: "Your emergency fund is the single most protective financial asset you have.",
      action: "Check your balance today — is it 3–6 months of essential expenses?",
    },
    {
      text: "Recurring subscriptions are the easiest money leaks to find.",
      action: "Open your bank statement and cancel one subscription you haven't used this month.",
    },
    {
      text: "Beneficiary designations override your will — they're often overlooked.",
      action: "Log into one insurance or retirement account and verify the beneficiary is current.",
    },
    {
      text: "If your primary income disappeared tomorrow, how long could you cover the basics?",
      action: "Calculate your true monthly essential spend and compare it to your liquid savings.",
    },
    {
      text: "Automating savings removes willpower from the equation entirely.",
      action: "Set up a $25–$50 automatic transfer to a dedicated emergency fund — even small counts.",
    },
    {
      text: "Fee waivers are almost always available if you simply ask.",
      action: "Call your bank or credit card provider today and ask about fee reductions.",
    },
    {
      text: "Diversified income is one of the strongest financial resilience signals.",
      action: "List your income sources. If one vanished, what's left? Identify one gap to address.",
    },
  ],
  health: [
    {
      text: "Preventative appointments are dramatically cheaper than reactive ones.",
      action: "Identify one medical or dental appointment you've been deferring and book it today.",
    },
    {
      text: "Running out of medication during a crisis or disruption is a preventable risk.",
      action: "Check your supply — do you have at least 30 days of any critical medication on hand?",
    },
    {
      text: "Physical movement is a direct input to resilience, not just health.",
      action: "Take a 20-minute walk today. No equipment, no gym required.",
    },
    {
      text: "Knowing your nearest emergency resources before you need them reduces panic.",
      action: "Confirm the address of your nearest emergency room and urgent care clinic.",
    },
    {
      text: "Health insurance gaps are invisible until they're not.",
      action: "Review your current coverage: deductible, out-of-pocket max, and covered conditions.",
    },
    {
      text: "Sleep is not optional — it's a resilience input. Fatigue degrades every decision.",
      action: "Assess your sleep this week honestly. Are you averaging 7–8 hours? Identify one change.",
    },
    {
      text: "Box breathing is a proven technique to reset your nervous system in under 3 minutes.",
      action: "Try it now: 4 counts in, hold 4, out 6. Repeat 4 times.",
    },
  ],
  skills: [
    {
      text: "Your most marketable skills are your most portable resilience assets.",
      action: "Name the top 3 skills you'd put on a resume today. Are they current or quietly stale?",
    },
    {
      text: "Learning doesn't require a course — 20 minutes of focused content counts.",
      action: "Watch one tutorial, read one article, or listen to one episode in a skill gap area.",
    },
    {
      text: "Your network is your early warning system and safety net combined.",
      action: "Reach out to one professional contact you haven't spoken to in over three months.",
    },
    {
      text: "Teaching what you know is the fastest way to solidify mastery.",
      action: "Explain something you're genuinely good at to someone else today — out loud.",
    },
    {
      text: "Adaptability is a skill, not a trait. It's built through deliberate variety.",
      action: "Do one routine task a completely different way today and notice what you learn.",
    },
    {
      text: "A 'crisis resume' is what you'd offer if you needed income starting this week.",
      action: "Write down 5 things you could do for money immediately if your job disappeared.",
    },
    {
      text: "LinkedIn profiles degrade quietly while you're busy working.",
      action: "Update one section of your profile today — headline, skills list, or recent role.",
    },
  ],
  mobility: [
    {
      text: "Expired or inaccessible documents are a silent resilience risk.",
      action: "Check that your passport and key ID documents are valid and you know where they are.",
    },
    {
      text: "Disruptions rarely give you time to plan a route — plan it in advance.",
      action: "Map one alternate route from your home to a critical destination (hospital, family).",
    },
    {
      text: "A 72-hour bag doesn't need to be perfect to be useful.",
      action: "Gather or check: water, snacks, medications, phone charger, cash, and key documents.",
    },
    {
      text: "Communication breakdown during a crisis amplifies every other problem.",
      action: "Confirm that everyone in your household knows where to meet if phones are unavailable.",
    },
    {
      text: "Knowing what relocation would cost removes fear from the decision.",
      action: "Research what it would cost to stay in a hotel or sublet in one backup city for a month.",
    },
    {
      text: "Your vehicle's readiness is part of your mobility plan.",
      action: "Check fuel level, tire pressure, and whether you have a basic emergency kit in the car.",
    },
    {
      text: "The nearest shelter, hospital, and utility shutoff are worth knowing before you need them.",
      action: "Look up the nearest emergency shelter in your area and note the address.",
    },
  ],
  psychological: [
    {
      text: "Named, specific stressors are far easier to act on than vague dread.",
      action: "Write down your biggest stressor right now. Then write one concrete step you could take.",
    },
    {
      text: "Connection is one of the strongest predictors of resilience under pressure.",
      action: "Text or call one person you trust today — not to vent, just to connect.",
    },
    {
      text: "Self-compassion and self-criticism are not opposites of productivity — one fuels it, one drains it.",
      action: "Ask yourself: what would I tell a close friend who was in my exact situation right now?",
    },
    {
      text: "Control is not binary. Even in hard situations, there are usually small levers.",
      action: "Identify one area of your current situation where you have genuine agency. Start there.",
    },
    {
      text: "Gratitude practice changes the signal-to-noise ratio of your thinking over time.",
      action: "Write three things that went reasonably well this week — however small they seem.",
    },
    {
      text: "Understanding your own stress response is the first step to managing it intentionally.",
      action: "Notice your pattern: do you freeze, flee, or fight under pressure? No judgment — just observe.",
    },
    {
      text: "Screen-free time is the psychological equivalent of a detox.",
      action: "Spend 10 intentional minutes without any device today. Notice what surfaces.",
    },
  ],
  resources: [
    {
      text: "Two weeks of food storage is a threshold that meaningfully changes your resilience profile.",
      action: "Open your pantry and estimate honestly: how many days of food do you have right now?",
    },
    {
      text: "Water is the first resource to become scarce in most emergencies.",
      action: "Check your water storage — FEMA recommends 1 gallon per person per day for 3+ days.",
    },
    {
      text: "Documents stored only at home are a single point of failure.",
      action: "Scan or photograph key documents (IDs, insurance, medical) and store them securely in the cloud.",
    },
    {
      text: "Community networks are often the fastest-responding resources in a local crisis.",
      action: "Identify one mutual aid group, food bank, or community center near you. Save the contact.",
    },
    {
      text: "Insurance limits erode in real value over time while costs rise.",
      action: "Pull up one insurance policy (home, renters, or life) and verify the coverage limits are still adequate.",
    },
    {
      text: "A working flashlight and a first aid kit are table stakes — not optional.",
      action: "Check that you have both. Replace expired items or batteries that have been sitting for over a year.",
    },
    {
      text: "Cash provides a backup when digital payments fail — which they do during outages.",
      action: "Ensure you have at least a small reserve of physical cash accessible at home.",
    },
  ],
};

export const DIM_LABELS: Record<DimKey, string> = {
  financial: "Financial",
  health: "Health",
  skills: "Skills",
  mobility: "Mobility",
  psychological: "Psychological",
  resources: "Resources",
};

export function getDailyTip(dim: DimKey, date: Date = new Date()): Tip {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const tips = TIPS_BANK[dim];
  return tips[dayOfYear % tips.length];
}
