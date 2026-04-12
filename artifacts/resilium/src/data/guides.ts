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
    locationTags: ["global", "urban", "rural"],
    essential: true,
    readingTime: "8 min",
    sections: [
      {
        heading: "Immediate Actions (First 48 Hours)",
        content: "1. Audit your liquid cash — know exactly how many days you can operate without new income.\n2. Freeze all non-essential subscriptions and recurring charges immediately.\n3. Contact your landlord, mortgage provider, and utility companies before you miss a payment — most have hardship programs if you reach them proactively.\n4. Do not touch retirement accounts if at all possible — early withdrawal penalties and tax consequences compound the crisis.\n5. Notify your household. Shared clarity reduces panic and enables collective tightening."
      },
      {
        heading: "Extending Your Financial Runway",
        content: "Calculate your true 'burn rate': essential monthly outgoings only (rent/mortgage, utilities, food, medication, transport to income sources).\n\nTactics to extend runway:\n• Negotiate rent deferral or reduction — landlords often prefer this to vacancy\n• Sell non-essential assets: second vehicles, electronics, hobby equipment\n• Apply for unemployment benefits on day one — delays are long and backdating is rare\n• Food banks and community pantries are for exactly this situation — use them without shame\n• Reduce food costs through bulk staples (rice, lentils, oats, canned protein)"
      },
      {
        heading: "Income Recovery Strategy",
        content: "Tier your job search:\n• Tier 1 (income now): Any legal income — gig work, temp agencies, freelance, tutoring, manual labor. Pride is expensive in a crisis.\n• Tier 2 (income within 30–90 days): Direct applications in your field, networking with former colleagues and managers.\n• Tier 3 (income within 6–12 months): Skill-building, qualification additions, industry pivots.\n\nNetwork before you need it. A direct referral is 5x more likely to result in a hire than a cold application."
      },
      {
        heading: "Debt and Creditor Management",
        content: "Priority order for payments when cash is tight:\n1. Housing (eviction/foreclosure takes months to recover from)\n2. Utilities (keep heat, water, electricity)\n3. Food and medication\n4. Secured debt (car, if needed for income)\n5. Unsecured debt (credit cards, personal loans) — last priority\n\nCredit card companies would rather restructure than write off. Call them. Request hardship plans, reduced minimum payments, or interest freezes. Get everything in writing."
      },
      {
        heading: "Psychological Survival",
        content: "Financial crisis is one of the highest predictors of mental health deterioration. Treat this as seriously as the financial problem:\n• Maintain one non-negotiable daily routine (morning walk, meal at a set time)\n• Set a 'worry window' — one defined period per day for financial stress; outside it, you are not allowed to spiral\n• Tell at least one trusted person your situation — isolation amplifies every fear\n• If shame is stopping you from seeking help, name it explicitly. Shame is the enemy of recovery."
      }
    ]
  },
  {
    id: "power-outage",
    title: "Power Grid Outage",
    situation: "Infrastructure Failure",
    summary: "Managing short-term (hours–days) and extended (weeks+) power outages safely, with practical workarounds for critical systems.",
    locationTags: ["global", "urban", "rural", "cold-climate"],
    essential: true,
    readingTime: "7 min",
    sections: [
      {
        heading: "First Hour Checklist",
        content: "• Check whether the outage is local (your building/street) or regional — use your phone data or neighbors\n• Unplug sensitive electronics (computers, TVs, appliances) to protect against surge when power returns\n• Keep the refrigerator and freezer closed — a full freezer holds safe temperature for ~48 hours, refrigerator ~4 hours\n• Locate your flashlights, candles, and backup batteries now, before darkness\n• If you use powered medical equipment (CPAP, oxygen, dialysis), activate your emergency protocol immediately"
      },
      {
        heading: "Heat and Cold Management",
        content: "In cold climates without heat:\n• Close off unused rooms to concentrate warmth\n• Layer clothing with wool or synthetic layers (not cotton — it kills when wet)\n• Sleeping bags rated for the temperature are a genuine emergency asset\n• Never use gas stoves, charcoal grills, or generators indoors — carbon monoxide is odorless and kills silently\n• Know your nearest warming shelter (usually community centers, libraries, or schools)\n\nIn hot climates without cooling:\n• Identify your coolest room and stay there during peak heat\n• Wet towels on the neck and wrists reduce core temperature\n• Hydration is critical — drink before you feel thirsty\n• Know your nearest cooling center"
      },
      {
        heading: "Food and Water Safety",
        content: "Safe food consumption during outage:\n• Refrigerated food is safe for up to 4 hours if the door stays closed\n• Frozen food with ice crystals remaining is still safe to cook\n• When in doubt, throw it out — food poisoning during a crisis multiplies the problem\n\nWater:\n• Fill bathtubs and every clean container immediately if you anticipate extended outage\n• Most municipal water systems work during power outages, but pump failures can occur\n• Store at least 3 liters per person per day minimum; 5–6 liters is safer\n• Boiling is the safest purification method; water purification tablets are a reliable backup"
      },
      {
        heading: "Communication and Information",
        content: "• Keep phones in airplane mode except for scheduled check-ins to preserve battery\n• Battery-powered or hand-crank weather radios are underrated — they work when everything else fails\n• Designate a check-in schedule with household members and key contacts\n• External battery packs (power banks) with 20,000+ mAh capacity can charge a phone 4–6 times\n• Solar chargers work well in direct sunlight — even 10W can meaningfully top up a phone in an afternoon"
      },
      {
        heading: "Extended Outage (More Than 3 Days)",
        content: "At this point, the situation has shifted from inconvenient to serious:\n• Engage with community — neighbors helping neighbors is the primary resilience mechanism in extended outages\n• Find out the cause and expected restoration timeline from official sources\n• If you have a vehicle, it can charge devices, provide warmth, and provide a communication hub — but only run it in a well-ventilated outdoor space, never in a garage\n• Consider temporary relocation to family or friends with power if the outage is extended and conditions are dangerous\n• Pharmacies and hospitals have generator backup — locate the nearest functional ones"
      }
    ]
  },
  {
    id: "flooding",
    title: "Flood Emergency",
    situation: "Natural Disaster",
    summary: "Before, during, and after flood events — covering evacuation decisions, safe actions, and recovery.",
    locationTags: ["flood-plain", "coastal", "urban", "rural"],
    essential: false,
    readingTime: "6 min",
    sections: [
      {
        heading: "Before a Flood: Preparation",
        content: "• Know your flood zone — check your local government's flood risk maps\n• Identify two evacuation routes from your home and neighborhood\n• Store important documents (passport, insurance, medical records) in waterproof cases or upload digital copies\n• Keep a go-bag ready with 72 hours of supplies: water, food, medication, documents, cash, phone charger, first aid\n• If you have time before a forecast flood: move valuables to upper floors, move vehicles to higher ground, turn off electricity at the breaker if flooding is imminent"
      },
      {
        heading: "During a Flood: Safe Actions",
        content: "NEVER:\n• Walk through moving water — 15cm of moving water can knock an adult down; 30cm can carry a vehicle\n• Drive through flooded roads — most flood deaths occur in vehicles\n• Touch electrical equipment in wet conditions\n\nDO:\n• Move to higher ground immediately if instructed or if water is rising\n• If trapped in a building, move to the highest floor — do not enter the attic without an axe or tool to break out if water rises to the roof\n• If swept away in floodwater: face downstream, feet-first, protect your head"
      },
      {
        heading: "After a Flood: Safe Return",
        content: "• Do not return until authorities declare it safe\n• Assume all floodwater is contaminated — it contains sewage, chemicals, and hazardous materials\n• Wear rubber boots and waterproof gloves for any cleanup\n• Document all damage with photos before cleaning — for insurance claims\n• Check structural safety before entering — look for cracks in the foundation, warped floors, and damage to load-bearing walls\n• Do not use gas, electricity, or water until inspected by qualified professionals"
      },
      {
        heading: "Insurance and Recovery",
        content: "• Contact your insurer immediately — there are often deadlines for flood claims\n• Standard home insurance does NOT cover flooding in most countries — check your specific policy\n• Keep receipts for all emergency expenses — accommodation, replacement items — these may be claimable\n• Government disaster assistance programs exist in most countries; register as soon as they open\n• Recovery takes longer than expected; build your mental timeline accordingly"
      }
    ]
  },
  {
    id: "earthquake",
    title: "Earthquake Response",
    situation: "Natural Disaster",
    summary: "What to do in the seconds, hours, and weeks following an earthquake — including aftershock management and structural safety.",
    locationTags: ["earthquake-zone", "urban", "rural"],
    essential: false,
    readingTime: "6 min",
    sections: [
      {
        heading: "During an Earthquake: Drop, Cover, Hold On",
        content: "The 'Drop, Cover, Hold On' protocol saves lives:\n1. DROP to hands and knees immediately\n2. Take COVER under a sturdy desk or table, or against an interior wall away from windows\n3. HOLD ON until shaking stops\n\nNever:\n• Run outside during shaking — most injuries occur from falling debris when people try to flee\n• Stand in a doorway — this is an outdated myth; doorframes offer no special protection\n• Use elevators after an earthquake"
      },
      {
        heading: "Immediately After: First 30 Minutes",
        content: "• Check yourself and those nearby for injuries before moving\n• Expect aftershocks — many will be strong. Be prepared to Drop, Cover, Hold On again\n• Check for gas leaks: smell, listen for hissing. If suspected, open windows, leave, do not use any switches or flame, call gas company from outside\n• Check for fire and electrical hazards\n• If you are in a damaged building, evacuate carefully — watch for debris on stairs\n• Do not use elevators"
      },
      {
        heading: "Structural Assessment",
        content: "Signs a building is unsafe to occupy:\n• Visible cracks in walls, especially diagonal cracks in corners\n• Doors or windows that no longer open/close properly (frame distortion)\n• Leaning or shifted structure\n• Foundation cracks\n• Chimney damage\n\nIf in doubt, do not re-enter. Sleep outside or in your vehicle before returning to an uninspected structure. Official building inspection programs follow major earthquakes in most jurisdictions."
      },
      {
        heading: "72-Hour Survival Without Infrastructure",
        content: "Earthquakes frequently disable water, gas, and electricity for days. Your 72-hour kit should include:\n• 3–5 liters of water per person per day\n• Non-perishable food for 3 days minimum\n• First aid kit with manual — injuries are common\n• Dust masks — structural damage creates hazardous airborne particles\n• Work gloves and sturdy closed-toe shoes (broken glass is universal)\n• Wrench or pliers to shut off gas and water valves\n• Local paper maps — GPS infrastructure can fail"
      }
    ]
  },
  {
    id: "civil-unrest",
    title: "Civil Unrest & Social Instability",
    situation: "Security",
    summary: "How to protect yourself and your household during periods of civil unrest, protest escalation, or breakdown of public order.",
    locationTags: ["urban", "global"],
    essential: false,
    readingTime: "7 min",
    sections: [
      {
        heading: "Situational Awareness First",
        content: "Civil unrest rarely appears without warning. Early signals to monitor:\n• Unusual police presence or movement\n• Protest activity reports via local news and social media\n• Changes in business operating hours or visible boarding-up of premises\n• Community group messages from neighbors\n\nDevelop the habit of checking local situation before leaving home in uncertain times. Set up news alerts for your city/district."
      },
      {
        heading: "Shelter-in-Place Decision",
        content: "In most civil unrest situations, staying home is the safest option unless your location is directly affected. Factors that support staying:\n• Unrest is several streets away and your route to safety would cross it\n• You have adequate supplies at home (food, water, medication for 5–7 days)\n• Your building is structurally secure and not a symbolic or commercial target\n\nFactors that support leaving:\n• Unrest is directly outside your building\n• Your building is a commercial or government property likely to be targeted\n• You have a pre-arranged safer destination with a clear route around the unrest"
      },
      {
        heading: "If You Are Caught Outside",
        content: "• Move calmly and decisively away from the crowd — do not run, which draws attention\n• Move perpendicular to crowd movement, then away — not against the flow\n• Avoid uniforms, political insignia, or anything that signals affiliation in either direction\n• Know your nearest safe haven: a hotel lobby, large church, hospital, or police station\n• If caught in a crush: protect your chest with crossed arms to maintain breathing space, don't fight the crowd's direction — move with it until you find an edge"
      },
      {
        heading: "Home Security During Unrest",
        content: "• Close and lock all windows and doors\n• Stay away from windows during active disorder nearby\n• Keep lights on inside to signal occupancy (empty-looking properties are easier targets)\n• Charge all devices and top up any vehicle fuel tanks\n• Have cash — ATMs and card systems may fail\n• Keep a list of emergency contacts that doesn't depend on your phone working"
      },
      {
        heading: "Information Management",
        content: "Misinformation spreads faster than the unrest itself. Protocol:\n• Use 2–3 trusted local sources only (local official channels, established local newspaper)\n• Do not share unverified information with your household — it creates unnecessary fear\n• Assign one household member to be the designated 'information checker'\n• Turn off push notifications for news if the volume is creating panic"
      }
    ]
  },
  {
    id: "medical-emergency",
    title: "Medical Emergency at Home",
    situation: "Health",
    summary: "Immediate response protocols for the most common life-threatening medical emergencies, for when professional help is delayed or unavailable.",
    locationTags: ["global", "urban", "rural"],
    essential: true,
    readingTime: "8 min",
    sections: [
      {
        heading: "The Golden Rule: Call Emergency Services First",
        content: "Before any other action, call emergency services if available. Even in a crisis, give them your location immediately — they can talk you through treatment while dispatching help.\n\nIf communications are down, send the most able-bodied person to find help while you begin first aid."
      },
      {
        heading: "Unresponsive Person: Check and CPR",
        content: "Check if the person is responsive: shout their name, tap their shoulder firmly.\n\nIf unresponsive and not breathing normally:\n1. Call emergency services immediately\n2. Begin CPR: 30 chest compressions at the center of the chest (hard and fast — 2 compressions per second) followed by 2 rescue breaths\n3. Continue until emergency services arrive or an AED is available\n4. Defibrillators (AEDs) are in most public buildings — they provide spoken instructions automatically\n\nHands-only CPR (compressions only, no rescue breaths) is effective if you're untrained."
      },
      {
        heading: "Severe Bleeding Control",
        content: "Priority: stop the bleeding.\n1. Apply firm, direct pressure with the cleanest cloth available — do not remove it once applied; add more on top\n2. Elevate the wound above the level of the heart if possible\n3. For limb bleeding that cannot be controlled: a tourniquet applied 5–8cm above the wound. Mark the time applied on the person's skin.\n4. Maintain pressure until professional help arrives\n\nTourniquets: when properly applied for limb-threatening bleeding, the risk of tissue damage is much lower than the risk of death from blood loss."
      },
      {
        heading: "Choking",
        content: "Mild choking (can cough, can speak): encourage coughing, do not interfere.\n\nSevere choking (cannot cough effectively, cannot speak, turning blue):\n1. 5 firm back blows between the shoulder blades with the heel of your hand\n2. If unsuccessful: 5 abdominal thrusts (Heimlich maneuver) — hands clasped below the ribcage, firm upward-inward thrust\n3. Alternate 5 back blows and 5 abdominal thrusts\n4. If the person becomes unconscious: begin CPR\n\nFor infants (under 1 year): 5 back blows + 5 chest thrusts (not abdominal). Do not perform abdominal thrusts on infants."
      },
      {
        heading: "Building Your Home Medical Kit",
        content: "Minimum home emergency kit:\n• Sterile bandages (various sizes), gauze, and medical tape\n• Tourniquet (commercial or improvised from a belt)\n• Disposable gloves (multiple pairs)\n• Antiseptic wipes or solution\n• Thermometer\n• Pain relief (paracetamol/acetaminophen and ibuprofen)\n• Antihistamines\n• Any household-specific medications (extra supply of prescriptions)\n• CPR face shield or pocket mask\n• Emergency contact list including poison control number\n\nConsider taking a basic first aid course — it's 4–8 hours that can save a life."
      }
    ]
  },
  {
    id: "supply-chain",
    title: "Supply Chain Disruption",
    situation: "Economic Disruption",
    summary: "How to protect your household against shortages of food, medicine, fuel, and essential goods during supply disruptions.",
    locationTags: ["global", "urban", "rural"],
    essential: false,
    readingTime: "5 min",
    sections: [
      {
        heading: "Building a Resilient Pantry",
        content: "The goal is not hoarding — it is building a structured, rotating household inventory that means disruptions affect you minimally.\n\nCore staples with 1–3 year shelf life:\n• White rice, dried pasta, oats\n• Dried lentils, beans, and chickpeas\n• Canned fish (tuna, sardines, salmon) and canned meat\n• Canned vegetables and fruit\n• Cooking oil, salt, sugar, vinegar\n• Honey (indefinite shelf life if sealed)\n• Long-life milk or powdered milk\n\nRotate stock using FIFO (first in, first out) — consume oldest items first, replace regularly."
      },
      {
        heading: "Medication and Medical Supplies",
        content: "The most dangerous supply chain disruption is medication shortages. Priority actions:\n• Discuss a 90-day supply prescription with your doctor (many insurers allow this; some require it for maintenance medications)\n• Know the generic name of every prescription medication — generic alternatives may be available when branded versions aren't\n• Maintain a small buffer stock (30 days) of over-the-counter medications you regularly use\n• Know which conditions are life-threatening without medication and have a specific emergency plan for those"
      },
      {
        heading: "Fuel and Energy",
        content: "• Keep vehicle fuel above half-tank during uncertain periods — a full tank is 3–5 days of range for most vehicles\n• Store a small amount of fuel for generators or emergency use (use appropriate containers; rotate every 6–12 months)\n• Know your nearest fuel stations and their typical inventory refresh schedules\n• Manual tools (can opener, hand tools, etc.) provide function when powered equivalents fail"
      },
      {
        heading: "Water and Sanitation",
        content: "Municipal water is often disrupted during supply chain crises (chemical shortages affect treatment plants). Preparedness:\n• 5 liters per person per day is the comfortable minimum; store more if you have space\n• Water purification tablets (iodine or chlorine) are cheap and essential\n• A quality gravity water filter (e.g., Berkey-style) is the highest-impact single preparedness purchase for most households\n• Maintain sanitation supplies: soap, hand sanitizer, toilet paper, feminine hygiene products"
      }
    ]
  },
  {
    id: "shelter-in-place",
    title: "Shelter-in-Place",
    situation: "General Emergency",
    summary: "The universal response protocol for staying safely inside your home during external threats — from chemical releases to extreme weather.",
    locationTags: ["global", "urban", "rural"],
    essential: true,
    readingTime: "5 min",
    sections: [
      {
        heading: "When Shelter-in-Place Is the Right Call",
        content: "Shelter-in-place is ordered or recommended when the threat outside is more dangerous than staying put:\n• Chemical or industrial accident in your area\n• Extreme weather (blizzard, severe heat, severe wind)\n• Active security threat in the area\n• Pandemic containment protocols\n• Radiological incident\n\nKey principle: if authorities say shelter-in-place, do it. Evacuating into a contaminated area is far more dangerous than remaining sheltered."
      },
      {
        heading: "Sealing Your Space for Chemical or Radiological Threats",
        content: "For air contamination scenarios:\n1. Close all windows and doors\n2. Turn off heating, ventilation, and air conditioning (HVAC) systems — they pull in outside air\n3. Seal gaps around doors and windows with wet towels or tape\n4. Move to an interior room with minimal windows\n5. Monitor official channels for all-clear instructions\n\nMost residential buildings provide meaningful protection for 2–4 hours against outdoor airborne contamination. The sealed space itself becomes less safe over time as CO2 builds up — this is why receiving the 'all-clear' signal matters."
      },
      {
        heading: "72-Hour Self-Sufficiency",
        content: "A shelter-in-place can last from hours to several days. Be ready for 72 hours without leaving:\n• Water: 5 liters per person per day minimum\n• Food: non-perishable items requiring no cooking or minimal cooking\n• Medications: ensure you have at least a 5-day supply at all times\n• Entertainment and comfort for children: routine and calm reduce psychological stress dramatically\n• Charged devices and a battery backup\n• A hand-crank or battery radio for official updates when internet may be unavailable"
      },
      {
        heading: "Managing Mental State During Extended Shelter",
        content: "Confinement is psychologically challenging, especially with children or anxious household members.\n\nStructure helps:\n• Maintain normal meal times\n• Create a simple schedule (including outdoor-simulating activities)\n• Designate a specific time for news/information — not constant monitoring\n• Physical movement within the space is essential — set a goal of 30 minutes of movement daily\n• Separate 'planning and worry' time from normal household time deliberately"
      }
    ]
  },
  {
    id: "communications-blackout",
    title: "Communications Blackout",
    situation: "Infrastructure Failure",
    summary: "Operating effectively when internet, mobile networks, and phone lines are unavailable — maintaining safety, coordination, and information.",
    locationTags: ["global", "urban", "rural"],
    essential: false,
    readingTime: "5 min",
    sections: [
      {
        heading: "Pre-Established Meeting Points",
        content: "Before a crisis, every household should have:\n• A primary meeting point near home (e.g., a specific neighbor's building, a named landmark)\n• A secondary meeting point further away (e.g., a local library, community center, or relative's home)\n• A designated out-of-area contact — often easier to reach a distant relative during a local crisis than local contacts (networks are geographically stressed)\n\nAll household members, including children, should memorize: the out-of-area contact's phone number, both meeting points, and the home address."
      },
      {
        heading: "Information Without the Internet",
        content: "• AM/FM battery or hand-crank radio: the most reliable one-way information source in any major emergency\n• Neighborhood watch and community groups communicate through physical networks\n• Local government offices and emergency services post information in public locations\n• Paper maps of your area are invaluable when GPS fails\n• Libraries often remain open and maintain bulletin boards during local emergencies"
      },
      {
        heading: "Communication Prioritization",
        content: "When communication is limited, prioritize:\n1. Safety check with immediate household members\n2. Notify out-of-area contact of your status and location\n3. Check on elderly or vulnerable neighbors\n4. Gather community situation information\n\nTexts use less bandwidth than calls and are more likely to get through during network congestion. Short, factual messages with your location and status are most useful."
      },
      {
        heading: "Backup Communication Devices",
        content: "In order of reliability and practicality:\n1. Battery-powered or hand-crank AM/FM/weather radio (receive only, but essential)\n2. Satellite communicator (Garmin inReach, SPOT) — expensive but works when nothing else does\n3. Amateur (Ham) radio — requires a license but local clubs often coordinate emergency communications\n4. Walkie-talkies (FRS/GMRS) — useful within 1–3km for household/neighborhood coordination\n\nFor most households, a good radio and a pre-agreed meeting plan is sufficient and affordable."
      }
    ]
  },
  {
    id: "pandemic-health-emergency",
    title: "Pandemic & Health Emergency",
    situation: "Health",
    summary: "Household-level preparation and response protocols for infectious disease outbreaks and public health emergencies.",
    locationTags: ["global", "urban", "rural"],
    essential: false,
    readingTime: "6 min",
    sections: [
      {
        heading: "Early Phase: Information and Monitoring",
        content: "During the early phase of a health emergency, accurate information is your most valuable resource:\n• Follow official public health authority guidance — it is updated as evidence develops\n• Identify your household's specific risk profile: age, chronic conditions, immune status\n• Monitor official sources only — misinformation spreads faster than pathogens\n• Do not hoard medical supplies that healthcare workers need (masks, specific medications)\n\nBuild your information routine early: one check per day from official sources, not constant monitoring."
      },
      {
        heading: "Household Infection Control",
        content: "Core practices for reducing transmission in your home:\n• Handwashing: 20 seconds with soap, especially before eating and after outside contact\n• Designate one household member as the primary outside-contact person when reducing exposure is important\n• If one household member is ill: separate sleeping space, separate bathroom if possible, designated eating times, excellent ventilation\n• Surfaces: high-touch points (door handles, light switches, taps) cleaned daily with appropriate disinfectant\n• Symptomatic household members: rest, hydration, temperature monitoring, and professional guidance before leaving home"
      },
      {
        heading: "Extended Home Preparation",
        content: "For potential extended stay at home:\n• Medications: 90-day supply of all essential prescriptions if possible\n• Food: 2–4 week supply of pantry staples (see Supply Chain guide)\n• Mental health: plan for extended close quarters — scheduled alone time, regular outdoor fresh air within guidelines, deliberate communication routines\n• Work and schooling continuity: understand your employer's and school's plans; have contingency plans for childcare\n• Financial buffer: even one month of expenses in accessible savings dramatically reduces crisis-within-crisis risk"
      },
      {
        heading: "When a Household Member Becomes Seriously Ill",
        content: "Know in advance when to seek emergency care:\n• Difficulty breathing or shortness of breath at rest\n• Persistent chest pain or pressure\n• Confusion or inability to wake/stay awake\n• Bluish lips or face\n• High fever that does not respond to medication over 48 hours in adults (lower threshold for children and elderly)\n\nCall ahead to emergency services or hospital before arriving — they may direct you to specific facilities or provide preparation instructions."
      }
    ]
  }
];

export function getGuidesByLocation(location: string): Guide[] {
  if (!location) return guides;
  const loc = location.toLowerCase();

  const isCoastal = /coast|sea|ocean|beach|bay|port|harbor|harbour/.test(loc);
  const isEarthquakeZone = /california|japan|turkey|greece|chile|peru|indonesia|philippines|new zealand|nepal|iran|italy|mexico city/.test(loc);
  const isColdClimate = /canada|scandinavia|norway|sweden|finland|alaska|siberia|russia|iceland|greenland|minnesota|wisconsin|michigan|north dakota/.test(loc);
  const isFloodProne = /bangladesh|netherlands|miami|houston|new orleans|jakarta|mumbai|flood/.test(loc);
  const isUrban = /city|urban|metro|london|new york|paris|berlin|tokyo|sydney|toronto|delhi|beijing|shanghai|madrid|rome|amsterdam/.test(loc);

  return guides.filter(guide => {
    const tags = guide.locationTags;
    if (tags.includes("global")) return true;
    if (isCoastal && tags.includes("coastal")) return true;
    if (isEarthquakeZone && tags.includes("earthquake-zone")) return true;
    if (isColdClimate && tags.includes("cold-climate")) return true;
    if (isFloodProne && tags.includes("flood-plain")) return true;
    if (isUrban && tags.includes("urban")) return true;
    if (tags.includes("urban") || tags.includes("rural")) return true;
    return false;
  });
}

export function getEssentialGuides(): Guide[] {
  return guides.filter(g => g.essential);
}
