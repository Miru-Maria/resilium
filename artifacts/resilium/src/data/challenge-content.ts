export type DimKey = "financial" | "health" | "skills" | "mobility" | "psychological" | "resources";

export interface ChallengeAction {
  day: number;
  dimension: DimKey;
  title: string;
  description: string;
  estimatedMinutes: number;
}

const ACTIONS_BY_DIM: Record<DimKey, Omit<ChallengeAction, "day" | "dimension">[]> = {
  financial: [
    {
      title: "Set up or review your emergency fund",
      description: "Open your emergency savings account (or create one if it doesn't exist). Confirm the balance and set a target of 3–6 months of essential expenses.",
      estimatedMinutes: 15,
    },
    {
      title: "Audit and verify beneficiaries",
      description: "Log into each insurance policy and retirement account. Confirm beneficiary designations are current — this overrides your will and is often forgotten.",
      estimatedMinutes: 20,
    },
    {
      title: "Identify your 3 cuttable expenses",
      description: "Review last month's bank statement. Find 3 expenses you could eliminate immediately if your income dropped 30%. No judgment — just identify them.",
      estimatedMinutes: 20,
    },
    {
      title: "Research one backup income stream",
      description: "Identify one income source you could activate within 30 days if needed: freelance skill, gig platform, asset to rent, or service to offer locally.",
      estimatedMinutes: 25,
    },
    {
      title: "Schedule a monthly financial review",
      description: "Block 30 minutes on your calendar for a recurring monthly financial check-in. Add a prompt: emergency fund balance, spending vs. plan, and insurance status.",
      estimatedMinutes: 10,
    },
  ],
  health: [
    {
      title: "Book a deferred appointment",
      description: "Schedule one medical, dental, or vision appointment you've been putting off. Preventive care is dramatically cheaper than reactive care.",
      estimatedMinutes: 15,
    },
    {
      title: "Build a 30-day medication supply",
      description: "Check your medications and supplements. Request a 90-day refill from your pharmacy or doctor for any critical prescriptions. Aim for at least 30 days on hand.",
      estimatedMinutes: 20,
    },
    {
      title: "Establish a daily movement routine",
      description: "Commit to 20 minutes of movement each day for the rest of this challenge. Log Day 1 today — a walk, stretch, or bike ride counts. Movement is a resilience input.",
      estimatedMinutes: 20,
    },
    {
      title: "Map your nearest emergency care locations",
      description: "Look up the nearest emergency room, urgent care clinic, and your primary care provider. Save them in your phone's contacts under 'Emergency Health'.",
      estimatedMinutes: 15,
    },
    {
      title: "Create a health information card",
      description: "Write a small card with your blood type, conditions, allergies, current medications, and emergency contact. Keep one in your wallet and take a photo for your phone.",
      estimatedMinutes: 20,
    },
  ],
  skills: [
    {
      title: "Identify your most marketable skill",
      description: "Name the single skill that would be most valuable to an employer or client if you needed income tomorrow. Then list 3 concrete ways you could deepen it this month.",
      estimatedMinutes: 20,
    },
    {
      title: "Complete one focused learning module",
      description: "Spend 30 minutes on a free course, tutorial, or in-depth article in a skill gap area you've identified. Document what you learned in one sentence.",
      estimatedMinutes: 30,
    },
    {
      title: "Reconnect with a professional contact",
      description: "Reach out to one person in your professional network you haven't spoken to in 6+ months. A brief, genuine check-in — not a request — is enough.",
      estimatedMinutes: 15,
    },
    {
      title: "Write your crisis resume",
      description: "Draft a one-page 'crisis resume' — what you could offer a new employer or client starting this week. Focus on transferable skills and immediate value, not titles.",
      estimatedMinutes: 30,
    },
    {
      title: "Identify one tradeable skill",
      description: "Identify one skill you could offer to a neighbor, local business, or community member in a resource-constrained scenario. Skills are currency when money is scarce.",
      estimatedMinutes: 15,
    },
  ],
  mobility: [
    {
      title: "Verify all key identity documents",
      description: "Check that your passport, driver's license, and any other ID documents are current and you know exactly where they are. Note any expiry dates coming up.",
      estimatedMinutes: 15,
    },
    {
      title: "Map two alternate routes from home",
      description: "Pick three critical destinations (hospital, family member, workplace). For each, identify one alternate route that doesn't use your normal roads.",
      estimatedMinutes: 20,
    },
    {
      title: "Pack or update your 72-hour bag",
      description: "Gather or check: 3 days of water, non-perishable food, critical medications, phone charger, cash, photocopies of key documents, and a change of clothes.",
      estimatedMinutes: 30,
    },
    {
      title: "Establish a household communication plan",
      description: "Confirm with everyone in your household: where to meet if phones don't work, who the out-of-area contact is, and what to do if you can't reach each other.",
      estimatedMinutes: 20,
    },
    {
      title: "Research one backup location",
      description: "Identify one city or area you could realistically relocate to for 30–90 days if needed. Research short-term housing options and rough cost. Make it concrete.",
      estimatedMinutes: 25,
    },
  ],
  psychological: [
    {
      title: "Write about your biggest stressor",
      description: "Set a timer for 10 minutes and write freely about your biggest current stressor. Then identify one specific action you could take on it this week.",
      estimatedMinutes: 15,
    },
    {
      title: "Reach out to someone in your support network",
      description: "Identify 3 people who form your psychological support network. Text or call at least one today — not to ask for help, just to connect genuinely.",
      estimatedMinutes: 15,
    },
    {
      title: "Practice a grounding technique",
      description: "Try box breathing (4 counts in, hold 4, out 6) or the 5-4-3-2-1 sensory exercise. Do it now, then set a phone reminder to repeat it tomorrow morning.",
      estimatedMinutes: 10,
    },
    {
      title: "Build your calm toolkit",
      description: "Write a list of 5 specific things that reliably reduce your stress — not generic advice, but what actually works for you. Keep it somewhere visible.",
      estimatedMinutes: 15,
    },
    {
      title: "Reflect on a past crisis you survived",
      description: "Think of a genuinely difficult period you navigated. What did you do that worked? What strengths did you use that you might underestimate now? Write it down.",
      estimatedMinutes: 20,
    },
  ],
  resources: [
    {
      title: "Audit your food storage",
      description: "Open your pantry and assess honestly: how many days of non-perishable food do you have? Aim for 2 weeks. Note what's missing and add it to your next shopping list.",
      estimatedMinutes: 20,
    },
    {
      title: "Check your first aid kit",
      description: "Locate your first aid kit. Check for expired items — bandages, medications, antiseptics. Replace what's missing or outdated. Add it to the next shopping run.",
      estimatedMinutes: 20,
    },
    {
      title: "Secure digital copies of key documents",
      description: "Photograph or scan your most important documents: IDs, insurance cards, medical records, property documents. Store them in a secure, encrypted cloud location.",
      estimatedMinutes: 25,
    },
    {
      title: "Connect with a community resource",
      description: "Identify one community resource group near you — mutual aid network, food bank, community center, or neighborhood association. Save their contact and consider joining.",
      estimatedMinutes: 20,
    },
    {
      title: "Review your home safety setup",
      description: "Check smoke detectors (replace batteries), confirm carbon monoxide detector is working, and walk your emergency exit routes. Note anything that needs fixing.",
      estimatedMinutes: 20,
    },
  ],
};

export function buildChallenge(dimensionOrder: DimKey[]): ChallengeAction[] {
  const actions: ChallengeAction[] = [];
  let day = 1;
  for (const dim of dimensionOrder) {
    for (const action of ACTIONS_BY_DIM[dim]) {
      actions.push({ day: day++, dimension: dim, ...action });
    }
  }
  return actions;
}

export function getPersonalizedOrder(scores: Partial<Record<DimKey, number>>): DimKey[] {
  const ALL_DIMS: DimKey[] = ["financial", "health", "skills", "mobility", "psychological", "resources"];
  return [...ALL_DIMS].sort((a, b) => (scores[a] ?? 50) - (scores[b] ?? 50));
}
