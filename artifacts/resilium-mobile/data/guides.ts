export interface GuideSection {
  heading: string;
  content: string;
}

export interface Guide {
  id: string;
  title: string;
  situation: string;
  summary: string;
  locationTags: string[];
  sections: GuideSection[];
  essential: boolean;
  readingTime: string;
}

export const guides: Guide[] = [
  {
    id: "financial-crisis",
    title: "Financial Crisis & Job Loss",
    situation: "Economic Disruption",
    summary: "How to stabilize your finances, extend your runway, and rebuild income when your financial situation deteriorates rapidly.",
    locationTags: ["global"],
    essential: true,
    readingTime: "8 min",
    sections: [
      { heading: "Immediate Actions (First 48 Hours)", content: "1. Audit your liquid cash — know exactly how many days you can operate without new income.\n2. Freeze all non-essential subscriptions and recurring charges immediately.\n3. Contact your landlord, mortgage provider, and utility companies before you miss a payment — most have hardship programs if you reach them proactively.\n4. Do not touch retirement accounts if at all possible.\n5. Notify your household. Shared clarity reduces panic and enables collective tightening." },
      { heading: "Extending Your Runway", content: "Calculate your true burn rate: essential monthly outgoings only (rent/mortgage, utilities, food, medication, transport).\n\n• Negotiate rent deferral — landlords prefer this to vacancy\n• Sell non-essential assets: second vehicles, electronics, hobby equipment\n• Apply for unemployment benefits on day one\n• Food banks are for exactly this situation — use them without shame\n• Reduce food costs through bulk staples: rice, lentils, oats, canned protein" },
      { heading: "Income Recovery Strategy", content: "Tier your job search:\n• Tier 1 (income now): Any legal income — gig work, temp agencies, freelance, tutoring\n• Tier 2 (income within 30–90 days): Direct applications in your field, networking\n• Tier 3 (income within 6–12 months): Skill-building, qualification additions, industry pivots\n\nA direct referral is 5x more likely to result in a hire than a cold application." },
      { heading: "Debt and Creditor Management", content: "Priority order for payments when cash is tight:\n1. Housing (eviction recovery takes months)\n2. Utilities\n3. Food and medication\n4. Secured debt (car, if needed for income)\n5. Unsecured debt (credit cards, personal loans) — last priority\n\nCall your creditors. Request hardship plans, reduced minimums, or interest freezes. Get everything in writing." },
      { heading: "Psychological Survival", content: "• Maintain one non-negotiable daily routine\n• Set a 'worry window' — one period per day for financial stress\n• Tell at least one trusted person your situation\n• If shame is stopping you from seeking help, name it explicitly. Shame is the enemy of recovery." }
    ]
  },
  {
    id: "power-outage",
    title: "Power Grid Outage",
    situation: "Infrastructure Failure",
    summary: "Managing short-term and extended power outages safely, with practical workarounds for critical systems.",
    locationTags: ["global"],
    essential: true,
    readingTime: "7 min",
    sections: [
      { heading: "First Hour Checklist", content: "• Check whether the outage is local or regional\n• Unplug sensitive electronics to protect against surge\n• Keep refrigerator and freezer closed — freezer holds safe temperature ~48 hours, refrigerator ~4 hours\n• Locate flashlights, candles, and backup batteries now\n• If you use powered medical equipment, activate your emergency protocol immediately" },
      { heading: "Heat and Cold Management", content: "In cold climates without heat:\n• Close off unused rooms to concentrate warmth\n• Layer with wool or synthetic clothing (not cotton)\n• NEVER use gas stoves, charcoal grills, or generators indoors — carbon monoxide is odorless and kills\n• Know your nearest warming shelter\n\nIn hot climates without cooling:\n• Identify your coolest room and stay there during peak heat\n• Wet towels on neck and wrists reduce core temperature\n• Hydrate before you feel thirsty" },
      { heading: "Food and Water Safety", content: "• Refrigerated food: safe up to 4 hours if door stays closed\n• Frozen food with ice crystals: still safe to cook\n• When in doubt, throw it out\n\nWater:\n• Fill every clean container immediately if extended outage is anticipated\n• Store at least 3 liters per person per day; 5–6 liters is safer\n• Boiling is the safest purification; water purification tablets are a solid backup" },
      { heading: "Communication and Power", content: "• Keep phones in airplane mode except for scheduled check-ins\n• Battery or hand-crank weather radios work when everything else fails\n• External battery packs (20,000+ mAh) can charge a phone 4–6 times\n• Solar chargers work well in direct sunlight" },
      { heading: "Extended Outage (3+ Days)", content: "• Engage with community — neighbor networks are the primary resilience mechanism\n• If you have a vehicle: it can charge devices and provide warmth — run only in well-ventilated outdoor space, never in a garage\n• Consider temporary relocation to family with power if conditions are dangerous\n• Pharmacies and hospitals have generator backup — locate the nearest functional ones" }
    ]
  },
  {
    id: "flooding",
    title: "Flood Emergency",
    situation: "Natural Disaster",
    summary: "Before, during, and after flood events — covering evacuation decisions, safe actions, and recovery.",
    locationTags: ["flood-plain", "coastal", "global"],
    essential: false,
    readingTime: "6 min",
    sections: [
      { heading: "Before a Flood: Preparation", content: "• Know your flood zone from local government flood risk maps\n• Identify two evacuation routes from your home\n• Store important documents in waterproof cases or upload digital copies\n• Keep a go-bag ready: water, food, medication, documents, cash, phone charger, first aid\n• Move valuables to upper floors and vehicles to higher ground before a forecast flood" },
      { heading: "During a Flood: Safe Actions", content: "NEVER:\n• Walk through moving water — 15cm can knock you down; 30cm can carry a vehicle\n• Drive through flooded roads — most flood deaths occur in vehicles\n• Touch electrical equipment in wet conditions\n\nDO:\n• Move to higher ground immediately if water is rising\n• If trapped in a building: go to the highest floor — do not enter the attic without a tool to break out\n• If swept away: face downstream, feet-first, protect your head" },
      { heading: "After a Flood", content: "• Do not return until authorities declare it safe\n• Assume all floodwater is contaminated\n• Wear rubber boots and waterproof gloves for cleanup\n• Document all damage with photos before cleaning — for insurance\n• Check structural safety before entering: cracks in foundation, warped floors, damaged walls\n• Do not use gas, electricity, or water until inspected by professionals" },
      { heading: "Insurance and Recovery", content: "• Contact your insurer immediately — there are often claim deadlines\n• Standard home insurance does NOT cover flooding in most countries\n• Keep receipts for all emergency expenses\n• Register for government disaster assistance as soon as programs open\n• Recovery takes longer than expected; plan your timeline accordingly" }
    ]
  },
  {
    id: "earthquake",
    title: "Earthquake Response",
    situation: "Natural Disaster",
    summary: "What to do in the seconds, hours, and weeks following an earthquake.",
    locationTags: ["earthquake-zone", "global"],
    essential: false,
    readingTime: "6 min",
    sections: [
      { heading: "During an Earthquake: Drop, Cover, Hold On", content: "1. DROP to hands and knees immediately\n2. Take COVER under a sturdy desk or table, or against an interior wall away from windows\n3. HOLD ON until shaking stops\n\nNever run outside during shaking — most injuries occur from falling debris when people try to flee. Never use elevators after an earthquake." },
      { heading: "Immediately After: First 30 Minutes", content: "• Check yourself and others for injuries before moving\n• Expect aftershocks — be prepared to Drop, Cover, Hold On again\n• Check for gas leaks: smell, listen for hissing. If suspected: open windows, leave, do not use any switches or flame, call gas company from outside\n• Check for fire and electrical hazards\n• Do not use elevators" },
      { heading: "Structural Assessment", content: "Signs a building is unsafe to occupy:\n• Visible diagonal cracks in wall corners\n• Doors or windows that no longer open/close properly\n• Leaning or shifted structure\n• Foundation cracks\n• Chimney damage\n\nIf in doubt, do not re-enter. Sleep outside or in your vehicle before returning to an uninspected building." },
      { heading: "72-Hour Survival Kit", content: "• 3–5 liters of water per person per day\n• Non-perishable food for 3 days\n• First aid kit\n• Dust masks — structural damage creates hazardous airborne particles\n• Work gloves and sturdy closed-toe shoes\n• Wrench or pliers to shut off gas and water valves\n• Paper maps of your area — GPS can fail" }
    ]
  },
  {
    id: "civil-unrest",
    title: "Civil Unrest & Social Instability",
    situation: "Security",
    summary: "How to protect yourself and your household during periods of civil unrest or breakdown of public order.",
    locationTags: ["urban", "global"],
    essential: false,
    readingTime: "7 min",
    sections: [
      { heading: "Situational Awareness First", content: "Civil unrest rarely appears without warning. Early signals:\n• Unusual police presence or movement\n• Protest activity reports via local news and social media\n• Changes in business operating hours or visible boarding-up of premises\n• Community group messages from neighbors\n\nSet up news alerts for your city/district." },
      { heading: "Shelter-in-Place Decision", content: "Staying home is safest unless your location is directly affected. Stay if:\n• Unrest is several streets away\n• You have adequate supplies for 5–7 days\n• Your building is not a commercial or government target\n\nLeave if:\n• Unrest is directly outside your building\n• You have a pre-arranged safer destination with a clear route around the unrest" },
      { heading: "If Caught Outside", content: "• Move calmly away from the crowd — do not run\n• Move perpendicular to crowd movement, then away\n• Avoid anything that signals political affiliation\n• Know your nearest safe haven: hotel lobby, hospital, large church, police station\n• In a crush: protect your chest with crossed arms to maintain breathing space" },
      { heading: "Home Security and Information", content: "• Close and lock all windows and doors\n• Stay away from windows during active disorder\n• Keep lights on inside to signal occupancy\n• Charge all devices and top up vehicle fuel\n• Have cash — ATMs and card systems may fail\n• Use 2–3 trusted local sources for information only — misinformation spreads faster than the unrest" }
    ]
  },
  {
    id: "medical-emergency",
    title: "Medical Emergency at Home",
    situation: "Health",
    summary: "Immediate response protocols for the most common life-threatening medical emergencies.",
    locationTags: ["global"],
    essential: true,
    readingTime: "8 min",
    sections: [
      { heading: "The Golden Rule: Call Emergency Services First", content: "Before any other action, call emergency services if available. Even in a crisis, give them your location immediately — they can talk you through treatment while dispatching help.\n\nIf communications are down, send the most able-bodied person to find help while you begin first aid." },
      { heading: "Unresponsive Person: CPR", content: "Check responsiveness: shout their name, tap their shoulder firmly.\n\nIf unresponsive and not breathing normally:\n1. Call emergency services immediately\n2. Begin CPR: 30 chest compressions (hard and fast — 2 per second) followed by 2 rescue breaths\n3. Continue until emergency services arrive or an AED is available\n\nAEDs provide spoken instructions automatically. Hands-only CPR (compressions only) is effective if you're untrained." },
      { heading: "Severe Bleeding Control", content: "1. Apply firm, direct pressure with the cleanest cloth available — do not remove once applied; add more on top\n2. Elevate the wound above the level of the heart if possible\n3. For limb bleeding that cannot be controlled: apply a tourniquet 5–8cm above the wound. Mark the time applied on the person's skin.\n4. Maintain pressure until professional help arrives" },
      { heading: "Choking", content: "Mild choking (can cough, can speak): encourage coughing, do not interfere.\n\nSevere choking (cannot cough, cannot speak, turning blue):\n1. 5 firm back blows between shoulder blades\n2. If unsuccessful: 5 abdominal thrusts (Heimlich maneuver)\n3. Alternate 5 back blows and 5 abdominal thrusts\n4. If person becomes unconscious: begin CPR\n\nFor infants under 1 year: 5 back blows + 5 chest thrusts (NOT abdominal thrusts)." },
      { heading: "Your Home Medical Kit", content: "• Sterile bandages (various sizes), gauze, medical tape\n• Tourniquet\n• Disposable gloves\n• Antiseptic wipes or solution\n• Thermometer\n• Pain relief (paracetamol/acetaminophen and ibuprofen)\n• Antihistamines\n• Household-specific medications (30-day extra supply)\n• CPR face shield\n• Emergency contacts including poison control number" }
    ]
  },
  {
    id: "supply-chain",
    title: "Supply Chain Disruption",
    situation: "Economic Disruption",
    summary: "Protecting your household against shortages of food, medicine, fuel, and essential goods.",
    locationTags: ["global"],
    essential: false,
    readingTime: "5 min",
    sections: [
      { heading: "Building a Resilient Pantry", content: "Core staples with 1–3 year shelf life:\n• White rice, dried pasta, oats\n• Dried lentils, beans, chickpeas\n• Canned fish, canned meat\n• Canned vegetables and fruit\n• Cooking oil, salt, sugar, vinegar\n• Honey (indefinite shelf life if sealed)\n• Long-life or powdered milk\n\nRotate using FIFO — consume oldest items first, replace regularly. This is not hoarding; it's a structured inventory." },
      { heading: "Medication and Medical Supplies", content: "• Discuss 90-day supply prescriptions with your doctor — many insurers allow or require this\n• Know the generic name of every prescription — generics may be available when branded versions aren't\n• Maintain a 30-day buffer of over-the-counter medications you regularly use\n• Know which conditions are life-threatening without medication and have a specific emergency plan" },
      { heading: "Fuel and Water", content: "• Keep vehicle fuel above half-tank during uncertain periods\n• Store fuel for generators in appropriate containers; rotate every 6–12 months\n• 5 liters per person per day minimum for water\n• Water purification tablets are cheap and essential\n• A quality gravity water filter is the highest-impact single preparedness purchase for most households" }
    ]
  },
  {
    id: "shelter-in-place",
    title: "Shelter-in-Place",
    situation: "General Emergency",
    summary: "The universal protocol for staying safely inside your home during external threats.",
    locationTags: ["global"],
    essential: true,
    readingTime: "5 min",
    sections: [
      { heading: "When Shelter-in-Place Is the Right Call", content: "Shelter-in-place is the correct response when the threat outside is more dangerous than staying put:\n• Chemical or industrial accident in your area\n• Extreme weather (blizzard, severe heat, severe wind)\n• Active security threat in the area\n• Pandemic containment protocols\n• Radiological incident\n\nKey principle: if authorities say shelter-in-place, do it. Evacuating into a contaminated area is far more dangerous than remaining sheltered." },
      { heading: "Sealing for Chemical or Radiological Threats", content: "1. Close all windows and doors\n2. Turn off heating, ventilation, and AC — they pull in outside air\n3. Seal gaps around doors and windows with wet towels or tape\n4. Move to an interior room with minimal windows\n5. Monitor official channels for all-clear instructions\n\nMost residential buildings provide meaningful protection for 2–4 hours against outdoor airborne contamination." },
      { heading: "72-Hour Self-Sufficiency", content: "Be ready for 72 hours without leaving:\n• Water: 5 liters per person per day\n• Food: non-perishable items requiring minimal cooking\n• Medications: 5-day supply at minimum\n• Entertainment and comfort for children\n• Charged devices and battery backup\n• Hand-crank or battery radio for official updates" },
      { heading: "Managing Mental State During Extended Shelter", content: "• Maintain normal meal times\n• Create a simple daily schedule\n• Designate a specific time for news — not constant monitoring\n• Set a goal of 30 minutes of movement within the space daily\n• Separate 'planning and worry' time from normal household time deliberately" }
    ]
  },
  {
    id: "communications-blackout",
    title: "Communications Blackout",
    situation: "Infrastructure Failure",
    summary: "Operating effectively when internet, mobile networks, and phone lines are unavailable.",
    locationTags: ["global"],
    essential: false,
    readingTime: "5 min",
    sections: [
      { heading: "Pre-Established Meeting Points", content: "Every household should have:\n• A primary meeting point near home (a specific neighbor's building or named landmark)\n• A secondary meeting point further away (library, community center, relative's home)\n• A designated out-of-area contact — often easier to reach a distant relative during a local crisis\n\nAll household members, including children, should memorize: the out-of-area contact's phone number, both meeting points, and the home address." },
      { heading: "Information Without the Internet", content: "• AM/FM battery or hand-crank radio: most reliable one-way information source in any emergency\n• Local government offices and emergency services post information in public locations\n• Paper maps of your area are invaluable when GPS fails\n• Libraries often remain open and maintain bulletin boards during local emergencies" },
      { heading: "Backup Communication Devices", content: "In order of practicality:\n1. Battery-powered or hand-crank AM/FM/weather radio\n2. Satellite communicator (Garmin inReach, SPOT) — works when nothing else does\n3. Amateur (Ham) radio — local clubs often coordinate emergency communications\n4. Walkie-talkies (FRS/GMRS) — useful within 1–3km for neighborhood coordination\n\nFor most households: a good radio and pre-agreed meeting plan is sufficient." }
    ]
  },
  {
    id: "pandemic-health-emergency",
    title: "Pandemic & Health Emergency",
    situation: "Health",
    summary: "Household-level preparation and response protocols for infectious disease outbreaks.",
    locationTags: ["global"],
    essential: false,
    readingTime: "6 min",
    sections: [
      { heading: "Early Phase: Information and Monitoring", content: "• Follow official public health authority guidance — it updates as evidence develops\n• Identify your household's specific risk profile: age, chronic conditions, immune status\n• Monitor official sources only — misinformation spreads faster than pathogens\n• Do not hoard medical supplies that healthcare workers need\n\nBuild your information routine: one check per day from official sources." },
      { heading: "Household Infection Control", content: "• Handwashing: 20 seconds with soap, especially before eating\n• Designate one household member as primary outside-contact person\n• If one member is ill: separate sleeping space, separate bathroom if possible, excellent ventilation\n• High-touch surfaces (door handles, light switches, taps): cleaned daily\n• Symptomatic members: rest, hydration, temperature monitoring, professional guidance before leaving home" },
      { heading: "Extended Home Preparation", content: "• Medications: 90-day supply of all essential prescriptions if possible\n• Food: 2–4 week supply of pantry staples\n• Mental health: schedule alone time, regular fresh air within guidelines, deliberate communication routines\n• Financial buffer: even one month of expenses in accessible savings dramatically reduces crisis-within-crisis risk" },
      { heading: "When to Seek Emergency Care", content: "Know in advance when to call emergency services:\n• Difficulty breathing or shortness of breath at rest\n• Persistent chest pain or pressure\n• Confusion or inability to wake/stay awake\n• Bluish lips or face\n• High fever that does not respond to medication over 48 hours in adults\n\nCall ahead before arriving — they may direct you to specific facilities." }
    ]
  }
];

export function getEssentialGuides(): Guide[] {
  return guides.filter(g => g.essential);
}
