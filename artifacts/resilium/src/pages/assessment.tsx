import React, { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useSubmitAssessment } from "@workspace/api-client-react";
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Brain, Zap, Lock, MapPin, User, DollarSign, Wallet, Users, Wrench, Activity, Navigation, Home, ShieldCheck, TriangleAlert, Share2, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { SiteFooter } from "@/components/site-footer";
import { useUser, useAuth } from "@clerk/react";

const FREE_LIMIT = 3;
const ANON_COUNT_KEY = "resilium_free_count";
const SESSION_KEY = "resilium_session_id";
const DRAFT_KEY_BASE = "resilium_assessment_draft_v2";

import type { 
  AssessmentInput,
  AssessmentInputAgeBracket,
  AssessmentInputIncomeStability,
  AssessmentInputHealthStatus,
  AssessmentInputMobilityLevel,
  AssessmentInputHousingType,
  AssessmentInputRiskConcernsItem,
  AssessmentInputSkillsItem,
  AssessmentInputEmergencySupplyTier,
  AssessmentInputChronicCondition,
  AssessmentInputCommunityInvolvement,
  AssessmentInputRelocationReadiness,
  MentalResilienceAnswers
} from "@workspace/api-client-react";

// Steps:
// 1 = Location + Currency
// 2 = Age Bracket
// 3 = Income Stability
// 4 = Mental Resilience (10 sub-steps)
// 5 = Financial Runway (savings)
// 6 = Dependents
// 7  = Skills
// 8  = Health (health status + chronic condition)
// 9  = Mobility & Relocation (physical capability + relocation readiness)
// 10 = Housing
// 11 = Emergency Supplies (tiered)
// 12 = Risk Profile
// 13 = Social Capital
const TOTAL_STEPS = 14;
const MR_STEP = 4;

const STEP_ICONS: Record<number | string, React.ReactNode> = {
  1: <MapPin className="w-3.5 h-3.5" />,
  2: <User className="w-3.5 h-3.5" />,
  3: <DollarSign className="w-3.5 h-3.5" />,
  mr: <Brain className="w-3.5 h-3.5" />,
  5: <Wallet className="w-3.5 h-3.5" />,
  6: <Users className="w-3.5 h-3.5" />,
  7: <Wrench className="w-3.5 h-3.5" />,
  8: <Activity className="w-3.5 h-3.5" />,
  9: <Navigation className="w-3.5 h-3.5" />,
  10: <Home className="w-3.5 h-3.5" />,
  11: <ShieldCheck className="w-3.5 h-3.5" />,
  12: <TriangleAlert className="w-3.5 h-3.5" />,
  13: <Share2 className="w-3.5 h-3.5" />,
  14: <Target className="w-3.5 h-3.5" />,
};

type Language = "en" | "ro";

// ─── TRANSLATIONS ──────────────────────────────────────────────────────────────
const T = {
  en: {
    // header
    stepLabel: (step: number, total: number, _mrStep: number, _mrTotal: number) =>
      `Step ${step} of ${total}`,
    lastFree: "Last free assessment",
    assessmentN: (n: number, limit: number) => `Assessment ${n} of ${limit}`,
    // progress labels
    progress: {
      1: "Location", 2: "Age Bracket", 3: "Income", 4: "Mental Resilience",
      5: "Financial Runway", 6: "Dependents", 7: "Skills", 8: "Health",
      9: "Mobility & Relocation", 10: "Housing", 11: "Emergency Supplies",
      12: "Risk Profile", 13: "Social Capital", 14: "Your Goal",
    } as Record<number, string>,
    // nav
    back: "Back",
    next: "Next",
    continue: "Continue",
    generateReport: "Generate Report",
    // step 1
    s1Title: "Where are you based?",
    s1Sub: "Your geographic location affects climate, political, and economic risk factors.",
    s1Placeholder: "e.g. California, USA",
    s1LocationDenied: "Location access was denied — please type your city or region above.",
    s1LocationHint: "Or click the pin icon to detect your location automatically.",
    s1Currency: "Preferred currency for financial advice",
    s1CustomCurrency: "Enter currency code (e.g. CHF, SEK)",
    // step 2
    s2Title: "What's your age bracket?",
    s2Sub: "Age shapes your financial time-horizon and baseline health vulnerability — it affects how we weight your scores.",
    ageBrackets: [
      { id: "18-24", label: "18–24", desc: "Early career" },
      { id: "25-34", label: "25–34", desc: "Building phase" },
      { id: "35-44", label: "35–44", desc: "Established" },
      { id: "45-54", label: "45–54", desc: "Peak earning" },
      { id: "55-64", label: "55–64", desc: "Pre-retirement" },
      { id: "65+", label: "65+", desc: "Retirement age" },
    ],
    // step 3
    s3Title: "How stable is your income?",
    incomeOptions: [
      { id: "fixed", title: "Fixed & Secure", desc: "Salaried employee, guaranteed pension" },
      { id: "freelance", title: "Variable / Freelance", desc: "Income fluctuates month to month" },
      { id: "unstable", title: "Unstable / Irregular", desc: "Currently unemployed or highly volatile" },
      { id: "student", title: "Student / No income", desc: "Full-time student or not currently earning" },
    ],
    preferNotToSay: "Prefer not to say",
    preferNotDesc: "Your answers remain private — this won't block your results",
    // step 4 (MR)
    mrTitle: "Mental Resilience Assessment",
    mrSub: "10 questions · ~2 minutes · shapes your entire plan",
    // step 5
    s5Title: "How long could you cover your expenses without income?",
    s5Sub: "If you lost your income today, how many months could you sustain yourself and your household without going into debt? This is one of the strongest predictors of crisis resilience.",
    months: (n: number) => n === 36 ? "months +" : "months",
    preferNotSavings: "Skip the slider — we'll use a neutral mid-range value",
    preferNotSavingsSelected: "✓ Prefer not to say",
    savingsNeutral: "Your financial runway won't be used in scoring — we'll use a neutral estimate.",
    // step 6
    s6Title: "How many dependents do you have?",
    s6Sub: "Children, elderly parents, or anyone financially or physically reliant on you.",
    dependentOptions: [
      { value: 0, label: "None", desc: "No dependents" },
      { value: 1, label: "One", desc: "One dependent" },
      { value: 2, label: "Two or three", desc: "2–3 dependents" },
      { value: 3, label: "Four or more", desc: "4+ dependents" },
    ],
    // step 7
    s7Title: "What practical skills do you possess?",
    s7Sub: "Select all that apply.",
    skills: [
      { id: "digital", label: "Digital/Tech", desc: "Software, IT, programming, online tools" },
      { id: "physical", label: "Trade/Manual", desc: "Carpentry, plumbing, electrical, mechanics" },
      { id: "survival", label: "Outdoors/Survival", desc: "Wilderness skills, hunting, navigation" },
      { id: "medical", label: "First Aid/Medical", desc: "CPR, first aid, nursing or medical training" },
      { id: "financial", label: "Trading/Finance", desc: "Investing, accounting, financial planning" },
      { id: "language", label: "Multiple Languages", desc: "Fluent or conversational in 2+ languages" },
      { id: "caregiving", label: "Caregiving", desc: "Child, elder, or disability care" },
      { id: "agriculture", label: "Agriculture/Homesteading", desc: "Growing food, animal husbandry, gardening" },
      { id: "community", label: "Community Organizing", desc: "Coordination, volunteering, leadership" },
      { id: "teaching", label: "Education/Teaching", desc: "Teaching, tutoring, training others" },
      { id: "none", label: "None that apply", desc: "" },
    ],
    // step 8
    s8Title: "Health",
    s8HealthTitle: "Overall Health Status",
    healthOptions: [
      { id: "excellent", label: "Excellent" },
      { id: "good", label: "Good" },
      { id: "fair", label: "Fair" },
      { id: "poor", label: "Poor" },
    ],
    s8PhysicalTitle: "Physical Capability",
    s8PhysicalSub: "How physically capable are you of handling demanding situations?",
    mobilityOptions: [
      { id: "high", label: "High" },
      { id: "medium", label: "Medium" },
      { id: "low", label: "Low" },
    ],
    s8RelocationTitle: "Relocation Readiness",
    s8RelocationSub: "How quickly could you pack up and relocate if you had to?",
    relocationOptions: [
      { id: "immediate", label: "Immediately", desc: "Could leave within days" },
      { id: "within_month", label: "Within a month", desc: "Need a few weeks" },
      { id: "within_3months", label: "Within 3 months", desc: "Need time to sort things" },
      { id: "difficult", label: "Very difficult", desc: "Tied down for the foreseeable future" },
    ],
    s8ChronicTitle: "Chronic Condition or Disability",
    s8ChronicSub: "Do you have a chronic condition or disability that affects your daily functioning? (Optional)",
    chronicOptions: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" },
      { id: "prefer_not_to_say", label: "Prefer not to say" },
    ],
    // step 9 (Mobility & Relocation)
    s9Title: "Mobility & Relocation",
    s9Sub: "Your physical capability and flexibility to relocate are key factors in crisis response.",
    // step 10 (Housing)
    housingStepTitle: "Current housing situation?",
    housingStepSub: "Your housing situation affects both financial stability and your ability to shelter-in-place.",
    housingOptions: [
      { id: "own", label: "Own a home (mortgage or outright)" },
      { id: "rent", label: "Renting long-term" },
      { id: "family", label: "Living with family or friends" },
      { id: "temporary", label: "Temporary/Subsidised housing" },
      { id: "transitional", label: "Transitional housing or shelter" },
      { id: "nomadic", label: "Nomadic / frequent traveler" },
      { id: "other", label: "Other arrangement" },
    ],
    // step 10
    s10Title: "Emergency Preparedness",
    s10Sub: "How much emergency food, water, and essential medicines do you have readily available?",
    emergencyOptions: [
      { id: "none", label: "None", desc: "Not prepared yet" },
      { id: "under_3days", label: "Under 3 days", desc: "Very basic supplies only" },
      { id: "3_14days", label: "3–14 days", desc: "A couple of weeks covered" },
      { id: "2weeks_1month", label: "2 weeks – 1 month", desc: "Well stocked for most crises" },
      { id: "over_1month", label: "1 month +", desc: "Extended preparedness" },
    ],
    // step 11
    s11Title: "Primary Risk Concerns",
    s11Sub: "Select the risks you feel least prepared for (choose at least one).",
    riskOptions: [
      { id: "job_loss", label: "Job Loss / Automation" },
      { id: "inflation", label: "Hyperinflation" },
      { id: "financial_crisis", label: "Market Crash" },
      { id: "natural_disaster", label: "Natural Disasters" },
      { id: "supply_chain", label: "Supply Chain Failure" },
      { id: "political_instability", label: "Political Unrest" },
      { id: "cyber_attack", label: "Cyber Attack" },
      { id: "grid_failure", label: "Power Grid Failure" },
      { id: "war_conflict", label: "War / Conflict" },
      { id: "pandemic", label: "Global Pandemic" },
      { id: "illness", label: "Personal Illness" },
    ],
    traumaNote: "We understand this may be personal. Your answers shape a plan that takes this seriously.",
    // step 12
    s12Title: "Community & Social Network",
    s12Sub: "Strong networks are often the most reliable resource in a crisis. Help me understand yours.",
    s12ContactsTitle: "Trusted contacts you could call on in a major crisis",
    s12ContactsSub: "People locally or abroad who would genuinely help you — family, friends, colleagues, or community.",
    contactOptions: [
      { value: 0, label: "None", desc: "I have no one I could reliably call on" },
      { value: 1, label: "1–2 people", desc: "A handful of trusted people" },
      { value: 2, label: "3–5 people", desc: "A solid support circle" },
      { value: 3, label: "6 or more", desc: "A broad, reliable network" },
    ],
    s12InvolvementTitle: "Community or group involvement",
    s12InvolvementSub: "Religious groups, community support networks, volunteer organizations, professional associations, etc.",
    involvementOptions: [
      { id: "none", label: "Not involved", desc: "No active group membership" },
      { id: "occasional", label: "Occasionally", desc: "Loose ties with 1–2 groups" },
      { id: "active", label: "Actively involved", desc: "Regular participation in community groups" },
    ],
    s12MutualAidTitle: "Access to community support",
    s12MutualAidSub: "Could you access food, shelter, tools, or practical help from your community or network if needed?",
    mutualAidYes: "Yes, I could access support",
    mutualAidNo: "Not really / unsure",
    // step 13 (social — kept s12 keys for backward compat, shown on step 13)
    // step 14: resilience goal
    s14Title: "What's your resilience goal?",
    s14Sub: "This shapes how your plan is framed — the AI uses it to tailor every recommendation to what actually matters to you.",
    s14GoalLabel: "What's driving you to build resilience right now?",
    goalOptions: [
      { id: "job_security", emoji: "💼", label: "Job & income security", desc: "Worried about layoffs, career disruption, or income instability" },
      { id: "financial_independence", emoji: "🏦", label: "Financial independence", desc: "Building a cushion that lets me make choices without panic" },
      { id: "disaster_preparedness", emoji: "🌪️", label: "Disaster & emergency prep", desc: "Natural disasters, power outages, supply chain failures" },
      { id: "health_continuity", emoji: "❤️‍🩹", label: "Health continuity", desc: "Concerned about illness, injury, or a health crisis for me or my family" },
      { id: "geopolitical_risk", emoji: "🌍", label: "Geopolitical & conflict risk", desc: "Political instability, civil unrest, or potential conflict" },
      { id: "life_transition", emoji: "🔄", label: "Life transition", desc: "Divorce, relocation, career change, or other major shift" },
      { id: "general_resilience", emoji: "🛡️", label: "General preparedness", desc: "I want to be ready for whatever comes — no specific threat in mind" },
    ] as { id: string; emoji: string; label: string; desc: string }[],
    s14VisionLabel: "What does success look like for you in 6 months?",
    s14VisionPlaceholder: "e.g. 'Six months of savings saved, a clear plan if I lose my job, and less daily anxiety about money.'",
    s14VisionSub: "Optional — but the more specific you are, the more targeted your plan becomes.",
    // loading / errors
    analysing: "Analyzing your profile and building your plan…",
    analysingDesc: "Your responses are being analyzed — this usually takes 1–2 minutes. Please keep this tab open.",
    planLimitTitle: "Plan Limit Reached",
    planLimitBack: "Go Back",
    manageMyPlans: "Manage My Plans",
    errorTitle: "Analysis Taking Longer Than Expected",
    errorDesc: "The AI is still working on your report. Check My Plans — it should appear there shortly.",
    errorAuthHint: "Check My Plans — your report might already be there.",
    errorAnonHint: "If you were signed in, your report would be saved to your profile automatically.",
    checkMyPlans: "Check My Plans",
    tryAgain: "Try Again",
    gatedTitle: (limit: number) => `You've used your ${limit} free assessments`,
    gatedDesc: "Upgrade to Resilium Pro for unlimited assessments, full progress tracking, and plan comparison tools.",
    viewPricing: "View Pricing",
    backToHome: "Back to Home",
  },
  ro: {
    stepLabel: (step: number, total: number, _mrStep: number, _mrTotal: number) =>
      `Pasul ${step} din ${total}`,
    lastFree: "Ultima evaluare gratuită",
    assessmentN: (n: number, limit: number) => `Evaluarea ${n} din ${limit}`,
    progress: {
      1: "Locație", 2: "Vârstă", 3: "Venituri", 4: "Reziliență Mentală",
      5: "Resurse Financiare", 6: "Dependenți", 7: "Abilități", 8: "Sănătate",
      9: "Mobilitate & Relocare", 10: "Locuință", 11: "Urgențe",
      12: "Profilul de Risc", 13: "Capital Social", 14: "Obiectivul Tău",
    } as Record<number, string>,
    back: "Înapoi",
    next: "Următor",
    continue: "Continuă",
    generateReport: "Generează Raportul",
    s1Title: "Unde locuiești?",
    s1Sub: "Locația ta influențează factorii de risc climatici, politici și economici.",
    s1Placeholder: "ex. Cluj-Napoca, România",
    s1LocationDenied: "Accesul la locație a fost refuzat — te rugăm să tastezi orașul sau regiunea ta mai sus.",
    s1LocationHint: "Sau apasă iconița pin pentru a detecta locația automat.",
    s1Currency: "Moneda preferată pentru sfaturi financiare",
    s1CustomCurrency: "Introdu codul monedei (ex. RON, CHF)",
    s2Title: "Ce interval de vârstă ai?",
    s2Sub: "Vârsta influențează orizontul financiar și vulnerabilitatea de bază la sănătate — afectează modul în care ponderăm scorurile.",
    ageBrackets: [
      { id: "18-24", label: "18–24", desc: "Carieră timpurie" },
      { id: "25-34", label: "25–34", desc: "Fază de construire" },
      { id: "35-44", label: "35–44", desc: "Stabilizat" },
      { id: "45-54", label: "45–54", desc: "Câștiguri de vârf" },
      { id: "55-64", label: "55–64", desc: "Pre-pensionare" },
      { id: "65+", label: "65+", desc: "Vârsta pensionării" },
    ],
    s3Title: "Cât de stabilă este venitul tău?",
    incomeOptions: [
      { id: "fixed", title: "Fix & Sigur", desc: "Angajat cu salariu, pensie garantată" },
      { id: "freelance", title: "Variabil / Freelancer", desc: "Venitul fluctuează de la lună la lună" },
      { id: "unstable", title: "Instabil / Neregulat", desc: "Șomer sau venituri foarte volatile" },
      { id: "student", title: "Student / Fără venituri", desc: "Student cu normă întreagă sau fără câștiguri" },
    ],
    preferNotToSay: "Prefer să nu spun",
    preferNotDesc: "Răspunsurile tale sunt private — nu îți va bloca rezultatele",
    mrTitle: "Evaluarea Rezilienței Mentale",
    mrSub: "10 întrebări · ~2 minute · modelează întregul tău plan",
    s5Title: "Cât timp ți-ai putea acoperi cheltuielile fără venituri?",
    s5Sub: "Dacă ți-ai pierde venitul azi, câte luni ți-ai putea susține gospodăria fără a te îndatora? Acesta este unul dintre cei mai puternici predictori ai rezilienței în criză.",
    months: (n: number) => n === 36 ? "luni +" : "luni",
    preferNotSavings: "Sari peste selector — vom folosi o valoare neutră",
    preferNotSavingsSelected: "✓ Prefer să nu spun",
    savingsNeutral: "Rezerva ta financiară nu va fi folosită în scorare — vom folosi o estimare neutră.",
    s6Title: "Câți dependenți ai?",
    s6Sub: "Copii, părinți în vârstă sau orice persoană dependentă financiar sau fizic de tine.",
    dependentOptions: [
      { value: 0, label: "Niciunul", desc: "Fără dependenți" },
      { value: 1, label: "Unul", desc: "Un dependent" },
      { value: 2, label: "Doi sau trei", desc: "2–3 dependenți" },
      { value: 3, label: "Patru sau mai mulți", desc: "4+ dependenți" },
    ],
    s7Title: "Ce abilități practice deții?",
    s7Sub: "Selectează tot ce ți se aplică.",
    skills: [
      { id: "digital", label: "Digital/Tech", desc: "Software, IT, programare, instrumente online" },
      { id: "physical", label: "Meserie/Manual", desc: "Tâmplărie, instalații, electric, mecanică" },
      { id: "survival", label: "Drumeție/Supraviețuire", desc: "Abilități în natură, vânătoare, navigare" },
      { id: "medical", label: "Prim Ajutor/Medical", desc: "CPR, prim ajutor, asistență medicală" },
      { id: "financial", label: "Trading/Finanțe", desc: "Investiții, contabilitate, planificare financiară" },
      { id: "language", label: "Limbi Străine Multiple", desc: "Fluent sau conversațional în 2+ limbi" },
      { id: "caregiving", label: "Îngrijire", desc: "Îngrijirea copiilor, persoanelor în vârstă sau cu dizabilități" },
      { id: "agriculture", label: "Agricultură/Gospodărie", desc: "Cultivarea alimentelor, creșterea animalelor, grădinărit" },
      { id: "community", label: "Organizare Comunitară", desc: "Coordonare, voluntariat, leadership" },
      { id: "teaching", label: "Educație/Predare", desc: "Predare, meditații, instruirea altora" },
      { id: "none", label: "Niciuna care se aplică", desc: "" },
    ],
    s8Title: "Sănătate",
    s8HealthTitle: "Starea Generală de Sănătate",
    healthOptions: [
      { id: "excellent", label: "Excelentă" },
      { id: "good", label: "Bună" },
      { id: "fair", label: "Acceptabilă" },
      { id: "poor", label: "Slabă" },
    ],
    s8PhysicalTitle: "Capacitate Fizică",
    s8PhysicalSub: "Cât de capabil/ă ești să gestionezi situații solicitante fizic?",
    mobilityOptions: [
      { id: "high", label: "Ridicată" },
      { id: "medium", label: "Medie" },
      { id: "low", label: "Scăzută" },
    ],
    s8RelocationTitle: "Disponibilitate de Relocare",
    s8RelocationSub: "Cât de repede te-ai putea muta dacă ar fi necesar?",
    relocationOptions: [
      { id: "immediate", label: "Imediat", desc: "M-aș putea muta în câteva zile" },
      { id: "within_month", label: "Într-o lună", desc: "Am nevoie de câteva săptămâni" },
      { id: "within_3months", label: "În 3 luni", desc: "Am nevoie de timp să aranjez lucrurile" },
      { id: "difficult", label: "Foarte dificil", desc: "Legat/ă pe termen previzibil" },
    ],
    s8ChronicTitle: "Condiție Cronică sau Dizabilitate",
    s8ChronicSub: "Ai o condiție cronică sau o dizabilitate care îți afectează funcționarea zilnică? (Opțional)",
    chronicOptions: [
      { id: "yes", label: "Da" },
      { id: "no", label: "Nu" },
      { id: "prefer_not_to_say", label: "Prefer să nu spun" },
    ],
    s9Title: "Mobilitate & Relocare",
    s9Sub: "Capacitatea ta fizică și flexibilitatea de a te reloca sunt factori cheie în răspunsul la criză.",
    // step 10 (Housing)
    housingStepTitle: "Situația locativă actuală?",
    housingStepSub: "Situația locativă îți afectează atât stabilitatea financiară, cât și capacitatea de a te adăposti.",
    housingOptions: [
      { id: "own", label: "Proprietar (credit sau integral)" },
      { id: "rent", label: "Chirie pe termen lung" },
      { id: "family", label: "Locuiesc cu familia sau prietenii" },
      { id: "temporary", label: "Locuință temporară/subvenționată" },
      { id: "transitional", label: "Adăpost sau locuință de tranziție" },
      { id: "nomadic", label: "Nomad / călător frecvent" },
      { id: "other", label: "Altă situație" },
    ],
    s10Title: "Pregătire pentru Urgențe",
    s10Sub: "Câtă hrană de urgență, apă și medicamente esențiale ai disponibile imediat?",
    emergencyOptions: [
      { id: "none", label: "Nimic", desc: "Încă nepregătit/ă" },
      { id: "under_3days", label: "Sub 3 zile", desc: "Provizii foarte de bază" },
      { id: "3_14days", label: "3–14 zile", desc: "Câteva săptămâni acoperite" },
      { id: "2weeks_1month", label: "2 săptămâni – 1 lună", desc: "Bine aprovizionat/ă" },
      { id: "over_1month", label: "Peste 1 lună", desc: "Pregătire extinsă" },
    ],
    s11Title: "Riscuri Principale",
    s11Sub: "Selectează riscurile pentru care te simți cel mai puțin pregătit/ă (alege cel puțin unul).",
    riskOptions: [
      { id: "job_loss", label: "Pierderea Locului de Muncă" },
      { id: "inflation", label: "Hiperinflație" },
      { id: "financial_crisis", label: "Criză Financiară" },
      { id: "natural_disaster", label: "Dezastre Naturale" },
      { id: "supply_chain", label: "Lipsă Produse" },
      { id: "political_instability", label: "Instabilitate Politică" },
      { id: "cyber_attack", label: "Atac Cibernetic" },
      { id: "grid_failure", label: "Căderea Rețelei Electrice" },
      { id: "war_conflict", label: "Război / Conflict" },
      { id: "pandemic", label: "Pandemie Globală" },
      { id: "illness", label: "Boală Personală" },
    ],
    traumaNote: "Înțelegem că aceasta poate fi o temă personală. Răspunsurile tale modelează un plan care ia aceasta în serios.",
    s12Title: "Comunitate & Rețea Socială",
    s12Sub: "Rețelele puternice sunt adesea cea mai fiabilă resursă în criză. Ajută-mă să le înțeleg pe ale tale.",
    s12ContactsTitle: "Persoane de încredere pe care le-ai putea apela într-o criză majoră",
    s12ContactsSub: "Persoane din localitate sau din străinătate care te-ar ajuta cu adevărat — familie, prieteni, colegi sau comunitate.",
    contactOptions: [
      { value: 0, label: "Niciuna", desc: "Nu am pe nimeni la care să apelez cu încredere" },
      { value: 1, label: "1–2 persoane", desc: "Câteva persoane de încredere" },
      { value: 2, label: "3–5 persoane", desc: "Un cerc solid de suport" },
      { value: 3, label: "6 sau mai multe", desc: "O rețea largă și de încredere" },
    ],
    s12InvolvementTitle: "Implicare în comunitate sau grupuri",
    s12InvolvementSub: "Grupuri religioase, rețele de sprijin comunitar, organizații de voluntariat, asociații profesionale etc.",
    involvementOptions: [
      { id: "none", label: "Nicio implicare", desc: "Fără apartenența activă la grupuri" },
      { id: "occasional", label: "Ocazional", desc: "Legături slabe cu 1–2 grupuri" },
      { id: "active", label: "Activ implicat/ă", desc: "Participare regulată în grupuri comunitare" },
    ],
    s12MutualAidTitle: "Acces la sprijin comunitar",
    s12MutualAidSub: "Ai putea accesa hrană, adăpost, unelte sau ajutor practic din comunitatea sau rețeaua ta dacă ai nevoie?",
    mutualAidYes: "Da, pot accesa sprijin",
    mutualAidNo: "Nu prea / nesigur/ă",
    s14Title: "Care este obiectivul tău de reziliență?",
    s14Sub: "Aceasta modelează modul în care este formulat planul tău — AI-ul folosește acest răspuns pentru a personaliza fiecare recomandare.",
    s14GoalLabel: "Ce te motivează să construiești reziliență în acest moment?",
    goalOptions: [
      { id: "job_security", emoji: "💼", label: "Securitate la locul de muncă", desc: "Îngrijorat/ă de concedieri sau instabilitate financiară" },
      { id: "financial_independence", emoji: "🏦", label: "Independență financiară", desc: "Construirea unui tampon care să îmi permită alegeri fără panică" },
      { id: "disaster_preparedness", emoji: "🌪️", label: "Pregătire pentru dezastre", desc: "Dezastre naturale, pene de curent sau crize de aprovizionare" },
      { id: "health_continuity", emoji: "❤️‍🩹", label: "Continuitate în sănătate", desc: "Îngrijorat/ă de boli sau crize de sănătate" },
      { id: "geopolitical_risk", emoji: "🌍", label: "Risc geopolitic și conflict", desc: "Instabilitate politică sau tulburări civile" },
      { id: "life_transition", emoji: "🔄", label: "Tranziție de viață", desc: "Divorț, relocare, schimbare de carieră sau altă schimbare majoră" },
      { id: "general_resilience", emoji: "🛡️", label: "Pregătire generală", desc: "Vreau să fiu pregătit/ă pentru orice apare" },
    ] as { id: string; emoji: string; label: string; desc: string }[],
    s14VisionLabel: "Cum arată succesul pentru tine în 6 luni?",
    s14VisionPlaceholder: "ex. 'Șase luni de economii, un plan clar dacă îmi pierd locul de muncă și mai puțin stres zilnic.'",
    s14VisionSub: "Opțional — cu cât ești mai specific/ă, cu atât planul tău devine mai bine orientat.",
    analysing: "Analizăm profilul tău și construim planul…",
    analysingDesc: "Răspunsurile tale sunt analizate — de obicei durează 1–2 minute. Te rugăm să menții această filă deschisă.",
    planLimitTitle: "Limita Planului Atinsă",
    planLimitBack: "Înapoi",
    manageMyPlans: "Gestionați Planurile Mele",
    errorTitle: "Analiza Durează Mai Mult Decât De Obicei",
    errorDesc: "AI-ul lucrează în continuare la raportul tău. Verifică Planurile Mele — ar trebui să apară în curând.",
    errorAuthHint: "Verifică Planurile Mele — raportul tău ar putea fi deja acolo.",
    errorAnonHint: "Dacă erai autentificat/ă, raportul ar fi salvat automat în profilul tău.",
    checkMyPlans: "Verifică Planurile Mele",
    tryAgain: "Încearcă din nou",
    gatedTitle: (limit: number) => `Ai folosit cele ${limit} evaluări gratuite`,
    gatedDesc: "Actualizează la Resilium Pro pentru evaluări nelimitate, urmărire completă a progresului și instrumente de comparare a planurilor.",
    viewPricing: "Vezi Prețurile",
    backToHome: "Înapoi Acasă",
  },
} as const;

// Rephrased MR questions for collectivist framing
type MentalResilienceQuestion = {
  key: keyof MentalResilienceAnswers;
  dimension: string;
  question: string;
  lowLabel: string;
  highLabel: string;
};

const MR_QUESTIONS: MentalResilienceQuestion[] = [
  {
    key: "stressTolerance1",
    dimension: "Stress Tolerance",
    question: "When facing an unexpected crisis, I remain calm and think clearly — whether on my own or alongside others around me.",
    lowLabel: "Rarely",
    highLabel: "Almost always",
  },
  {
    key: "stressTolerance2",
    dimension: "Stress Tolerance",
    question: "I recover quickly after a stressful event and return to normal functioning — drawing on my own resilience or the support of those close to me.",
    lowLabel: "Rarely",
    highLabel: "Almost always",
  },
  {
    key: "adaptability1",
    dimension: "Adaptability",
    question: "I adjust my plans smoothly when circumstances change unexpectedly.",
    lowLabel: "Rarely",
    highLabel: "Almost always",
  },
  {
    key: "adaptability2",
    dimension: "Adaptability",
    question: "I find it easy to embrace new routines or environments.",
    lowLabel: "Strongly disagree",
    highLabel: "Strongly agree",
  },
  {
    key: "learningAgility1",
    dimension: "Learning New Things",
    question: "I actively seek out new skills or knowledge when I notice a gap in my preparedness.",
    lowLabel: "Rarely",
    highLabel: "Very often",
  },
  {
    key: "changeManagement1",
    dimension: "Handling Change",
    question: "I plan ahead for major life changes — either independently or by thinking through plans with people I trust.",
    lowLabel: "Strongly disagree",
    highLabel: "Strongly agree",
  },
  {
    key: "changeManagement2",
    dimension: "Handling Change",
    question: "I feel confident dealing with big uncertain situations like economic shifts or political instability.",
    lowLabel: "Not at all",
    highLabel: "Very confident",
  },
  {
    key: "emotionalRegulation1",
    dimension: "Managing Your Emotions",
    question: "I manage anxiety and fear productively without being stopped in my tracks — whether by grounding myself or reaching out for support from those around me.",
    lowLabel: "Rarely",
    highLabel: "Almost always",
  },
  {
    key: "emotionalRegulation2",
    dimension: "Managing Your Emotions",
    question: "I can maintain a positive outlook during extended periods of difficulty.",
    lowLabel: "Strongly disagree",
    highLabel: "Strongly agree",
  },
  {
    key: "socialSupport1",
    dimension: "Social Support",
    question: "I have a reliable support network — family, friends, or community — I can call on during a major crisis.",
    lowLabel: "Not at all",
    highLabel: "Absolutely",
  },
];

const MR_QUESTIONS_RO: MentalResilienceQuestion[] = [
  {
    key: "stressTolerance1",
    dimension: "Toleranță la Stres",
    question: "Când mă confrunt cu o criză neașteptată, rămân calm/ă și gândesc clar — singur/ă sau alături de cei din jur.",
    lowLabel: "Rar",
    highLabel: "Aproape întotdeauna",
  },
  {
    key: "stressTolerance2",
    dimension: "Toleranță la Stres",
    question: "Revin rapid după un eveniment stresant la funcționarea normală — bazându-mă pe propriile resurse sau pe sprijinul celor apropiați.",
    lowLabel: "Rar",
    highLabel: "Aproape întotdeauna",
  },
  {
    key: "adaptability1",
    dimension: "Adaptabilitate",
    question: "Îmi ajustez planurile fără probleme când circumstanțele se schimbă neașteptat.",
    lowLabel: "Rar",
    highLabel: "Aproape întotdeauna",
  },
  {
    key: "adaptability2",
    dimension: "Adaptabilitate",
    question: "Îmi vine ușor să adopt rutine sau medii noi.",
    lowLabel: "Dezacord total",
    highLabel: "Acord total",
  },
  {
    key: "learningAgility1",
    dimension: "Învățare Continuă",
    question: "Caut activ abilități sau cunoștințe noi când observ o lipsă în pregătirea mea.",
    lowLabel: "Rar",
    highLabel: "Foarte des",
  },
  {
    key: "changeManagement1",
    dimension: "Gestionarea Schimbărilor",
    question: "Planific în avans schimbările majore din viață — independent sau gândindu-mă împreună cu persoane de încredere.",
    lowLabel: "Dezacord total",
    highLabel: "Acord total",
  },
  {
    key: "changeManagement2",
    dimension: "Gestionarea Schimbărilor",
    question: "Mă simt încrezător/oare să fac față situațiilor incerte majore precum crizele economice sau instabilitatea politică.",
    lowLabel: "Deloc",
    highLabel: "Foarte încrezător/oare",
  },
  {
    key: "emotionalRegulation1",
    dimension: "Gestionarea Emoțiilor",
    question: "Gestionez anxietatea și frica productiv, fără să mă blochez — fie prin propriile resurse, fie căutând sprijin la cei din jur.",
    lowLabel: "Rar",
    highLabel: "Aproape întotdeauna",
  },
  {
    key: "emotionalRegulation2",
    dimension: "Gestionarea Emoțiilor",
    question: "Pot menține o perspectivă pozitivă în perioadele prelungite de dificultate.",
    lowLabel: "Dezacord total",
    highLabel: "Acord total",
  },
  {
    key: "socialSupport1",
    dimension: "Suport Social",
    question: "Am o rețea de sprijin de încredere — familie, prieteni sau comunitate — pe care o pot apela în caz de criză majoră.",
    lowLabel: "Deloc",
    highLabel: "Absolut",
  },
];

const DEFAULT_MR_ANSWERS: MentalResilienceAnswers = {
  stressTolerance1: 3,
  stressTolerance2: 3,
  adaptability1: 3,
  adaptability2: 3,
  learningAgility1: 3,
  changeManagement1: 3,
  changeManagement2: 3,
  emotionalRegulation1: 3,
  emotionalRegulation2: 3,
  socialSupport1: 3,
};

const CURRENCIES = [
  { code: "USD", symbol: "$", label: "$ USD" },
  { code: "EUR", symbol: "€", label: "€ EUR" },
  { code: "GBP", symbol: "£", label: "£ GBP" },
  { code: "AUD", symbol: "A$", label: "A$ AUD" },
  { code: "CAD", symbol: "C$", label: "C$ CAD" },
  { code: "JPY", symbol: "¥", label: "¥ JPY" },
  { code: "INR", symbol: "₹", label: "₹ INR" },
  { code: "BRL", symbol: "R$", label: "R$ BRL" },
  { code: "OTHER", symbol: "", label: "Other" },
] as const;

type CurrencyCode = typeof CURRENCIES[number]["code"];

type ChronicSeverity = "mild" | "moderate" | "severe";

type ExtendedFormData = AssessmentInput & {
  emergencySupplyTier?: AssessmentInputEmergencySupplyTier;
  chronicCondition?: AssessmentInputChronicCondition;
  chronicConditionName?: string;
  chronicSeverity?: ChronicSeverity;
  chronicRequiresMedication?: boolean;
  trustedLocalContacts?: number;
  communityInvolvement?: AssessmentInputCommunityInvolvement;
  mutualAidAccess?: boolean;
  primaryGoal?: string;
  successVision?: string;
};

export default function AssessmentPage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [mrStep, setMrStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<{ code: string; message: string } | null>(null);
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [customCurrency, setCustomCurrency] = useState("");
  const [gateChecked, setGateChecked] = useState(false);
  const [gated, setGated] = useState(false);
  const [freeUsed, setFreeUsed] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [savingsPreferNotToSay, setSavingsPreferNotToSay] = useState(false);
  const [incomePreferNotToSay, setIncomePreferNotToSay] = useState(false);
  const [lang, setLang] = useState<Language>("en");
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const [resumeDraft, setResumeDraft] = useState<any>(null);

  const { user, isLoaded } = useUser();
  const { isSignedIn, getToken } = useAuth();
  // Timeout fallback: if Clerk hasn't loaded within 3 s, treat as anonymous
  const [authTimedOut, setAuthTimedOut] = useState(false);
  useEffect(() => {
    if (isLoaded) return;
    const timer = setTimeout(() => setAuthTimedOut(true), 500);
    return () => clearTimeout(timer);
  }, [isLoaded]);

  // GDPR gate: redirect to /consent if user arrived without going through the consent page
  useEffect(() => {
    const consented = sessionStorage.getItem("resilium_consent_given");
    if (!consented) {
      setLocation("/consent");
    }
  }, []);
  const authLoading = !isLoaded && !authTimedOut;
  const isAuthenticated = !!isSignedIn;
  // Per-user draft key — null until Clerk has resolved identity
  const draftKey = (isLoaded || authTimedOut) ? `${DRAFT_KEY_BASE}_${user?.id ?? "anon"}` : null;
  const t = T[lang];

  useEffect(() => {
    if (authLoading) return;

    const checkGate = async () => {
      if (isAuthenticated && user) {
        try {
          const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
          const [subRes, countRes] = await Promise.all([
            fetch(`${BASE}/api/users/me/subscription`, { credentials: "include" }),
            fetch(`${BASE}/api/users/me/report-count`, { credentials: "include" }),
          ]);
          const sub = await subRes.json();
          const { count } = await countRes.json();
          setFreeUsed(count);
          setIsSubscribed(!!sub.isActive);
          if (!sub.isActive && count >= FREE_LIMIT) {
            setGated(true);
          }
        } catch {
          // On error, allow through (fail open)
        }
      } else {
        const anonCount = parseInt(localStorage.getItem(ANON_COUNT_KEY) ?? "0", 10);
        setFreeUsed(anonCount);
        if (anonCount >= FREE_LIMIT) {
          setGated(true);
        }
      }
      setGateChecked(true);
    };

    checkGate();
  }, [isAuthenticated, user, authLoading]);

  const [formData, setFormData] = useState<ExtendedFormData>({
    location: "",
    ageBracket: undefined,
    incomeStability: "fixed",
    savingsMonths: 3,
    hasDependents: false,
    dependentCount: 0,
    relocationReadiness: "within_month", // sensible default — avoids undefined
    skills: [] as AssessmentInputSkillsItem[],
    healthStatus: "good",
    mobilityLevel: "medium",
    housingType: "rent",
    hasEmergencySupplies: false,
    psychologicalResilience: 7,
    riskConcerns: [] as AssessmentInputRiskConcernsItem[],
    mentalResilienceAnswers: { ...DEFAULT_MR_ANSWERS },
    // extended
    emergencySupplyTier: undefined,
    chronicCondition: undefined,
    chronicConditionName: undefined,
    chronicSeverity: undefined,
    chronicRequiresMedication: undefined,
    trustedLocalContacts: 1,
    communityInvolvement: "occasional",
    mutualAidAccess: undefined,
  });

  useSubmitAssessment(); // keep hook registration; direct fetch used in handleSubmit

  // ── Draft persistence ─────────────────────────────────────────────────────
  // Load saved draft once Clerk identity is resolved
  useEffect(() => {
    if (!draftKey) return; // wait until Clerk resolves the user
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const saved = JSON.parse(raw);
        const savedAt = saved?.savedAt ? new Date(saved.savedAt).getTime() : 0;
        const hasProgress = (saved?.step ?? 1) > 1 || !!(saved?.formData?.location);
        if (hasProgress && Date.now() - savedAt < 7 * 24 * 60 * 60 * 1000) {
          setResumeDraft(saved);
          setShowResumeBanner(true);
        } else {
          localStorage.removeItem(draftKey);
        }
      }
    } catch {}
    setDraftLoaded(true);
  }, [draftKey]);

  // Auto-save every 1.5s whenever form state changes (debounced)
  useEffect(() => {
    if (!draftLoaded || !draftKey) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify({
          formData,
          step,
          mrStep,
          lang,
          currency,
          customCurrency,
          savingsPreferNotToSay,
          incomePreferNotToSay,
          savedAt: new Date().toISOString(),
        }));
      } catch {}
    }, 1500);
    return () => clearTimeout(timer);
  }, [formData, step, mrStep, lang, currency, customCurrency, savingsPreferNotToSay, incomePreferNotToSay, draftLoaded, draftKey]);

  const handleNext = () => {
    if (step === MR_STEP) {
      if (mrStep < MR_QUESTIONS.length - 1) {
        setMrStep(s => s + 1);
        return;
      }
      setStep(s => s + 1);
      return;
    }
    if (step === TOTAL_STEPS) {
      handleSubmit();
      return;
    }
    setStep(s => s + 1);
  };

  const handlePrev = () => {
    if (step === MR_STEP && mrStep > 0) {
      setMrStep(s => s - 1);
      return;
    }
    if (step > 1) setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const sessionId = localStorage.getItem(SESSION_KEY) ?? undefined;
      const finalCurrency = currency === "OTHER" ? (customCurrency || "USD") : currency;
      const finalSavingsMonths = savingsPreferNotToSay ? 3 : formData.savingsMonths;
      const submitPayload: AssessmentInput & { currency?: string } = {
        ...formData,
        savingsMonths: finalSavingsMonths,
        currency: finalCurrency,
        sessionId,
        hasEmergencySupplies: formData.emergencySupplyTier
          ? formData.emergencySupplyTier !== "none" && formData.emergencySupplyTier !== "under_3days"
          : formData.hasEmergencySupplies,
      };

      const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

      // Get Clerk token for the request (null for anonymous users — cookies cover that)
      const token = await getToken().catch(() => null);
      const authHeaders: Record<string, string> = token ? { "Authorization": `Bearer ${token}` } : {};

      // ── Submit (returns 202 + jobId immediately) ──────────────────────────
      const submitRes = await fetch(`${BASE}/api/resilience/assess`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(submitPayload),
      });

      if (!submitRes.ok) {
        const body = await submitRes.json().catch(() => null);
        const errCode = body?.error ?? "UNKNOWN";
        if (errCode === "PLAN_LIMIT_EXCEEDED") {
          setSubmitError({ code: "PLAN_LIMIT_EXCEEDED", message: body.message });
        } else if (errCode === "VALIDATION_ERROR") {
          setSubmitError({ code: "VALIDATION_ERROR", message: "Your answers couldn't be validated. Please try again." });
        } else {
          setSubmitError({ code: "UNKNOWN", message: body?.message ?? "Something went wrong. Please try again." });
        }
        setIsSubmitting(false);
        return;
      }

      const { jobId } = await submitRes.json();

      // Persist the jobId so the results page can recover if old code navigates early
      if (jobId) sessionStorage.setItem("resilium_pending_job_v1", jobId);

      // ── Poll until the report is ready ────────────────────────────────────
      const POLL_INTERVAL_MS = 3000;
      const POLL_TIMEOUT_MS  = 5 * 60 * 1000; // 5 minutes absolute ceiling
      const pollStart = Date.now();

      while (Date.now() - pollStart < POLL_TIMEOUT_MS) {
        await new Promise<void>(r => setTimeout(r, POLL_INTERVAL_MS));

        const pollRes = await fetch(`${BASE}/api/resilience/jobs/${jobId}`, {
          credentials: "include",
          headers: authHeaders,
        });

        if (!pollRes.ok) continue; // transient error — keep polling

        const job = await pollRes.json();

        if (job.status === "complete") {
          sessionStorage.removeItem("resilium_pending_job_v1");
          if (!isAuthenticated) {
            const prev = parseInt(localStorage.getItem(ANON_COUNT_KEY) ?? "0", 10);
            localStorage.setItem(ANON_COUNT_KEY, String(prev + 1));
          }
          localStorage.setItem("resilium_last_report_id", job.reportId);
          if (draftKey) localStorage.removeItem(draftKey);
          setLocation(`/results/${job.reportId}`);
          return;
        }

        if (job.status === "failed") {
          sessionStorage.removeItem("resilium_pending_job_v1");
          throw new Error(job.error ?? "Report generation failed. Please try again.");
        }

        // status === "processing" — loop again
      }

      // Fell through the timeout — report is still being generated in the background
      throw new Error("Analysis is taking longer than expected. Check My Plans — your report may be there.");
    } catch (error: any) {
      console.error("Assessment submission failed", error);
      const isLimitError = error?.message?.includes("PLAN_LIMIT");
      if (!isLimitError) {
        setSubmitError({ code: "UNKNOWN", message: error?.message ?? "Something went wrong. Please try again." });
      }
      setIsSubmitting(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "";
          const country = data.address?.country || "";
          const locationStr = city && country ? `${city}, ${country}` : country || city;
          if (locationStr) updateField("location", locationStr);
        } catch {
          // silently fail
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationLoading(false);
        setLocationDenied(true);
      },
      { timeout: 10000 }
    );
  };

  const isStepValid = () => {
    switch(step) {
      case 1: return formData.location.trim().length > 1;
      case 2: return !!formData.ageBracket;
      case 3: return true;
      case MR_STEP: return true;
      case 7: return formData.skills.length > 0;
      case 11: return !!formData.emergencySupplyTier;
      case 12: return formData.riskConcerns.length > 0;
      case 14: return !!formData.primaryGoal;
      default: return true;
    }
  };

  const updateField = <K extends keyof ExtendedFormData>(field: K, value: ExtendedFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateMrAnswer = (key: keyof MentalResilienceAnswers, value: number) => {
    setFormData(prev => ({
      ...prev,
      mentalResilienceAnswers: {
        ...(prev.mentalResilienceAnswers ?? DEFAULT_MR_ANSWERS),
        [key]: value,
      },
    }));
  };

  const toggleArrayItem = <K extends 'skills' | 'riskConcerns'>(
    field: K,
    value: ExtendedFormData[K] extends (infer Item)[] ? Item : never,
  ) => {
    setFormData(prev => {
      const current = prev[field] as typeof value[];
      if (field === 'skills') {
        if (value === 'none') {
          return { ...prev, [field]: current.includes('none' as typeof value) ? [] : ['none' as typeof value] };
        }
        if (current.includes(value)) {
          return { ...prev, [field]: current.filter(i => i !== value) };
        } else {
          return { ...prev, [field]: [...current.filter(i => i !== ('none' as typeof value)), value] };
        }
      }
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(i => i !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const formatDraftAge = (savedAt: string) => {
    const mins = Math.round((Date.now() - new Date(savedAt).getTime()) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.round(hrs / 24)}d ago`;
  };

  const applyDraft = () => {
    if (!resumeDraft) return;
    if (resumeDraft.formData) setFormData(resumeDraft.formData);
    if (resumeDraft.step) setStep(resumeDraft.step);
    if (resumeDraft.mrStep != null) setMrStep(resumeDraft.mrStep);
    if (resumeDraft.lang) setLang(resumeDraft.lang);
    if (resumeDraft.currency) setCurrency(resumeDraft.currency);
    if (resumeDraft.customCurrency != null) setCustomCurrency(resumeDraft.customCurrency);
    if (resumeDraft.savingsPreferNotToSay != null) setSavingsPreferNotToSay(resumeDraft.savingsPreferNotToSay);
    if (resumeDraft.incomePreferNotToSay != null) setIncomePreferNotToSay(resumeDraft.incomePreferNotToSay);
    setShowResumeBanner(false);
  };

  const dismissDraft = () => {
    if (draftKey) localStorage.removeItem(draftKey);
    setShowResumeBanner(false);
    setResumeDraft(null);
  };

  const totalSubSteps = (TOTAL_STEPS - 1) + MR_QUESTIONS.length;
  const currentSubStep = step < MR_STEP
    ? step - 1
    : step === MR_STEP
      ? (MR_STEP - 1) + mrStep
      : (MR_STEP - 1) + MR_QUESTIONS.length + (step - MR_STEP - 1);
  const progressPercent = ((currentSubStep + 1) / totalSubSteps) * 100;

  const stepLabel = t.stepLabel(step, TOTAL_STEPS, mrStep, MR_QUESTIONS.length);

  const mrQuestions = lang === "ro" ? MR_QUESTIONS_RO : MR_QUESTIONS;
  const currentMrQuestion = mrQuestions[mrStep];
  const currentMrAnswer = formData.mentalResilienceAnswers?.[currentMrQuestion?.key ?? "stressTolerance1"] ?? 3;
  const stepKey = step === MR_STEP ? `mr-${mrStep}` : `step-${step}`;

  if (!gateChecked || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (gated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-3">{t.gatedTitle(FREE_LIMIT)}</h2>
          <p className="text-muted-foreground mb-8">{t.gatedDesc}</p>
          <div className="flex flex-col gap-3">
            <Link href="/pricing">
              <Button className="w-full rounded-full gap-2 h-12 shadow-lg shadow-primary/20">
                <Zap className="w-4 h-4" /> {t.viewPricing}
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full rounded-full h-12">{t.backToHome}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <Brain className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h2 className="text-3xl font-display font-bold mb-3">{t.analysing}</h2>
        <p className="text-muted-foreground text-base max-w-sm">{t.analysingDesc}</p>
      </div>
    );
  }

  if (submitError?.code === "PLAN_LIMIT_EXCEEDED") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-amber-500 mb-6" />
        <h2 className="text-2xl font-display font-bold mb-2">{t.planLimitTitle}</h2>
        <p className="text-muted-foreground max-w-md mb-8">{submitError.message}</p>
        <div className="flex gap-3">
          <Link href="/profile">
            <Button className="rounded-full">{t.manageMyPlans}</Button>
          </Link>
          <Button variant="outline" className="rounded-full" onClick={() => setSubmitError(null)}>
            {t.planLimitBack}
          </Button>
        </div>
      </div>
    );
  }

  if (submitError?.code === "VALIDATION_ERROR" || submitError?.code === "UNKNOWN") {
    const isTimeout = submitError.code === "UNKNOWN";
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-destructive mb-6" />
        <h2 className="text-2xl font-display font-bold mb-2">{t.errorTitle}</h2>
        {isTimeout ? (
          <>
            <p className="text-muted-foreground max-w-md mb-2">{t.errorDesc}</p>
            {isAuthenticated ? (
              <p className="text-muted-foreground max-w-md mb-8">{t.errorAuthHint}</p>
            ) : (
              <p className="text-muted-foreground max-w-md mb-8">{t.errorAnonHint}</p>
            )}
          </>
        ) : (
          <p className="text-muted-foreground max-w-md mb-8">{submitError.message}</p>
        )}
        {submitError.code !== "UNKNOWN" && (
          <p className="text-xs text-muted-foreground/50 mb-4 font-mono">{submitError.code}</p>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          {isAuthenticated && (
            <Link href="/profile">
              <Button className="rounded-full">{t.checkMyPlans}</Button>
            </Link>
          )}
          <Button variant="outline" className="rounded-full" onClick={() => setSubmitError(null)}>
            {t.tryAgain}
          </Button>
        </div>
      </div>
    );
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  const progressLabel = (step === MR_STEP ? t.progress[4] : t.progress[step]) ?? "";
  const progressIcon = STEP_ICONS[step === MR_STEP ? "mr" : step];

  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>

      {/* Resume draft banner */}
      {showResumeBanner && resumeDraft && (
        <div
          role="alert"
          aria-live="polite"
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm"
        >
          <div className="max-w-2xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Resume where you left off?</p>
              <p className="text-xs text-muted-foreground">
                Step {resumeDraft.step ?? 1} of {TOTAL_STEPS} · Saved {formatDraftAge(resumeDraft.savedAt)}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="outline" className="rounded-full h-8 text-xs" onClick={dismissDraft}>
                Start fresh
              </Button>
              <Button size="sm" className="rounded-full h-8 text-xs" onClick={applyDraft}>
                Resume
              </Button>
            </div>
          </div>
        </div>
      )}

      <header className="w-full p-6 lg:p-8 flex items-center justify-end z-10">
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <div className="flex items-center gap-1 rounded-full border border-border bg-card p-0.5 text-xs font-medium">
            <button
              onClick={() => setLang("en")}
              className={cn(
                "px-3 py-1 rounded-full transition-all",
                lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Switch to English"
            >
              EN
            </button>
            <button
              onClick={() => setLang("ro")}
              className={cn(
                "px-3 py-1 rounded-full transition-all",
                lang === "ro" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Comută la Română"
            >
              RO
            </button>
          </div>
          {!isSubscribed && freeUsed === FREE_LIMIT - 1 && (
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20">
              {t.lastFree}
            </span>
          )}
          {!isSubscribed && freeUsed === 0 && (
            <span className="text-xs font-medium text-muted-foreground">
              {t.assessmentN(1, FREE_LIMIT)}
            </span>
          )}
          <div className="text-sm font-medium text-muted-foreground">{stepLabel}</div>
        </div>
      </header>

      <div className="w-full max-w-md mx-auto px-6 mb-8">
        <Progress value={progressPercent} className="h-2" />
        <div className="flex items-center justify-between mt-2 px-0.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-primary/70">
            {progressIcon && <span className="opacity-70">{progressIcon}</span>}
            {progressLabel}
          </span>
          <span className="text-xs text-muted-foreground">{Math.round(progressPercent)}%</span>
        </div>
      </div>

      <main id="main-content" className="flex-1 flex flex-col items-center w-full max-w-2xl mx-auto px-6 pb-24">
        <div className="w-full relative">
          <AnimatePresence mode="wait" custom={1}>
            <motion.div
              key={stepKey}
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full flex flex-col justify-center"
            >

              {/* STEP 1: LOCATION + CURRENCY */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-display font-bold">{t.s1Title}</h2>
                  <p className="text-muted-foreground text-lg">{t.s1Sub}</p>
                  <div className="relative">
                    <Input 
                      autoFocus
                      placeholder={t.s1Placeholder}
                      className="h-16 text-xl px-6 rounded-2xl bg-card border-2 border-border focus-visible:border-primary shadow-sm pr-14"
                      value={formData.location}
                      onChange={(e) => updateField('location', e.target.value)}
                      aria-label="Your location"
                    />
                    <button
                      type="button"
                      onClick={handleUseMyLocation}
                      disabled={locationLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors text-primary disabled:opacity-50"
                      aria-label="Use my current location"
                      title="Use my location"
                    >
                      {locationLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
                    </button>
                  </div>
                  {locationDenied
                    ? <p className="text-xs text-amber-600 -mt-2">{t.s1LocationDenied}</p>
                    : <p className="text-xs text-muted-foreground -mt-2">{t.s1LocationHint}</p>
                  }
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{t.s1Currency}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {CURRENCIES.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => setCurrency(c.code)}
                          role="radio"
                          aria-checked={currency === c.code}
                          aria-label={`Select ${c.label} as currency`}
                          tabIndex={0}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setCurrency(c.code); } }}
                          className={cn(
                            "py-2.5 px-2 rounded-xl border-2 font-semibold text-sm transition-all duration-200",
                            currency === c.code
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-card text-muted-foreground hover:border-primary/40"
                          )}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                    {currency === "OTHER" && (
                      <Input
                        placeholder={t.s1CustomCurrency}
                        className="mt-2 h-11 rounded-xl"
                        value={customCurrency}
                        onChange={(e) => setCustomCurrency(e.target.value.toUpperCase())}
                        aria-label="Custom currency code"
                        maxLength={5}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: AGE BRACKET */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-display font-bold">{t.s2Title}</h2>
                  <p className="text-muted-foreground text-lg">{t.s2Sub}</p>
                  <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Age bracket">
                    {(t.ageBrackets as { id: AssessmentInputAgeBracket; label: string; desc: string }[]).map((opt) => (
                      <Card
                        key={opt.id}
                        role="radio"
                        aria-checked={formData.ageBracket === opt.id}
                        tabIndex={0}
                        className={cn(
                          "p-5 cursor-pointer flex flex-col items-center justify-center gap-1 transition-all duration-200 text-center",
                          formData.ageBracket === opt.id ? "step-card-active" : "hover:border-primary/30"
                        )}
                        onClick={() => updateField("ageBracket", opt.id)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); updateField("ageBracket", opt.id); } }}
                      >
                        <span className="text-xl font-bold">{opt.label}</span>
                        <span className="text-xs text-muted-foreground">{opt.desc}</span>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: INCOME STABILITY */}
              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-display font-bold">{t.s3Title}</h2>
                  <div className="grid gap-4" role="radiogroup" aria-label="Income stability">
                    {(t.incomeOptions as { id: string; title: string; desc: string }[]).map((opt) => (
                      <Card 
                        key={opt.id}
                        role="radio"
                        aria-checked={formData.incomeStability === opt.id && !incomePreferNotToSay}
                        tabIndex={0}
                        className={cn(
                          "p-6 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md",
                          formData.incomeStability === opt.id && !incomePreferNotToSay ? "step-card-active" : "bg-card border-border hover:border-primary/30"
                        )}
                        onClick={() => { updateField('incomeStability', opt.id as AssessmentInputIncomeStability); setIncomePreferNotToSay(false); }}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); updateField('incomeStability', opt.id as AssessmentInputIncomeStability); setIncomePreferNotToSay(false); } }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-lg">{opt.title}</h3>
                            <p className="text-muted-foreground">{opt.desc}</p>
                          </div>
                          {formData.incomeStability === opt.id && !incomePreferNotToSay && <CheckCircle2 className="text-primary w-6 h-6" />}
                        </div>
                      </Card>
                    ))}
                    <button
                      role="radio"
                      aria-checked={incomePreferNotToSay}
                      tabIndex={0}
                      onClick={() => { setIncomePreferNotToSay(true); updateField('incomeStability', 'freelance' as AssessmentInputIncomeStability); }}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setIncomePreferNotToSay(true); updateField('incomeStability', 'freelance' as AssessmentInputIncomeStability); } }}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
                        incomePreferNotToSay
                          ? "border-primary/40 bg-primary/5 text-primary"
                          : "border-dashed border-border text-muted-foreground hover:border-primary/30"
                      )}
                    >
                      <span className="font-medium">{t.preferNotToSay}</span>
                      <span className="text-xs block mt-0.5 opacity-70">{t.preferNotDesc}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: MENTAL RESILIENCE */}
              {step === MR_STEP && currentMrQuestion && (
                <div className="space-y-8">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-primary mb-1 block">{currentMrQuestion.dimension}</span>
                    <span className="text-xs text-muted-foreground mb-2 block">Question {mrStep + 1} of {MR_QUESTIONS.length}</span>
                    <h2 className="text-2xl md:text-3xl font-display font-bold leading-tight">{currentMrQuestion.question}</h2>
                  </div>

                  <div className="space-y-6 pt-2">
                    <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label={`Rate: ${currentMrQuestion.question}`}>
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          role="radio"
                          aria-checked={currentMrAnswer === val}
                          aria-label={`${val} - ${val === 1 ? currentMrQuestion.lowLabel : val === 5 ? currentMrQuestion.highLabel : val}`}
                          tabIndex={0}
                          onClick={() => updateMrAnswer(currentMrQuestion.key, val)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); updateMrAnswer(currentMrQuestion.key, val); } }}
                          className={cn(
                            "aspect-square rounded-2xl border-2 text-lg font-bold transition-all duration-200 flex flex-col items-center justify-center gap-1",
                            currentMrAnswer === val
                              ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105"
                              : "border-border bg-card hover:border-primary/40 text-foreground"
                          )}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground font-medium px-1 relative">
                      <span>{currentMrQuestion.lowLabel}</span>
                      <span className="absolute left-1/2 -translate-x-1/2">Neutral</span>
                      <span>{currentMrQuestion.highLabel}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: SAVINGS / FINANCIAL RUNWAY */}
              {step === 5 && (
                <div className="space-y-8">
                  <h2 className="text-3xl md:text-4xl font-display font-bold">{t.s5Title}</h2>
                  <p className="text-muted-foreground text-lg">{t.s5Sub}</p>
                  
                  {!savingsPreferNotToSay ? (
                    <>
                      <div className="pt-8 pb-4">
                        <Slider 
                          value={[formData.savingsMonths]} 
                          max={36} 
                          step={1} 
                          onValueChange={(v) => updateField('savingsMonths', v[0])}
                          className="py-4"
                          aria-label="Months of savings runway"
                        />
                      </div>
                      
                      <div className="flex justify-center items-end gap-2 text-primary">
                        <span className="text-6xl font-bold font-display tracking-tighter">{formData.savingsMonths}</span>
                        <span className="text-xl font-medium mb-2">{t.months(formData.savingsMonths)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center py-12">
                      <p className="text-muted-foreground text-center">{t.savingsNeutral}</p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setSavingsPreferNotToSay(v => !v)}
                    aria-pressed={savingsPreferNotToSay}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
                      savingsPreferNotToSay
                        ? "border-primary/40 bg-primary/5 text-primary"
                        : "border-dashed border-border text-muted-foreground hover:border-primary/30"
                    )}
                  >
                    <span className="font-medium">{savingsPreferNotToSay ? t.preferNotSavingsSelected : t.preferNotToSay}</span>
                    <span className="text-xs block mt-0.5 opacity-70">{t.preferNotSavings}</span>
                  </button>
                </div>
              )}

              {/* STEP 6: DEPENDENTS */}
              {step === 6 && (
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-display font-bold">{t.s6Title}</h2>
                  <p className="text-muted-foreground text-lg">{t.s6Sub}</p>
                  <div className="grid grid-cols-2 gap-4" role="radiogroup" aria-label="Number of dependents">
                    {(t.dependentOptions as { value: number; label: string; desc: string }[]).map((opt) => (
                      <Card
                        key={opt.value}
                        role="radio"
                        aria-checked={formData.dependentCount === opt.value}
                        tabIndex={0}
                        className={cn(
                          "p-6 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all duration-200",
                          formData.dependentCount === opt.value ? "step-card-active" : "hover:border-primary/30"
                        )}
                        onClick={() => updateField('dependentCount', opt.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); updateField('dependentCount', opt.value); } }}
                      >
                        <span className="text-xl font-bold">{opt.label}</span>
                        <span className="text-xs text-muted-foreground">{opt.desc}</span>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 7: SKILLS */}
              {step === 7 && (
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-display font-bold">{t.s7Title}</h2>
                  <p className="text-muted-foreground">{t.s7Sub}</p>
                  <div className="grid grid-cols-1 gap-3" role="group" aria-label="Practical skills">
                    {(t.skills as { id: string; label: string; desc: string }[]).map((opt) => (
                      <div 
                        key={opt.id}
                        role="checkbox"
                        aria-checked={formData.skills.includes(opt.id as AssessmentInputSkillsItem)}
                        tabIndex={0}
                        onClick={() => toggleArrayItem('skills', opt.id as AssessmentInputSkillsItem)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleArrayItem('skills', opt.id as AssessmentInputSkillsItem); } }}
                        className={cn(
                          "px-4 py-3 rounded-xl border-2 cursor-pointer font-medium transition-all",
                          formData.skills.includes(opt.id as AssessmentInputSkillsItem)
                            ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                            : "border-border hover:border-primary/30 text-foreground bg-card"
                        )}
                      >
                        <div className="font-semibold">{opt.label}</div>
                        {opt.desc && <div className={cn("text-xs mt-0.5", formData.skills.includes(opt.id as AssessmentInputSkillsItem) ? "text-primary-foreground/70" : "text-muted-foreground")}>{opt.desc}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 8: HEALTH */}
              {step === 8 && (
                <div className="space-y-8">
                  <h2 className="text-3xl md:text-4xl font-display font-bold">{t.s8Title}</h2>
                  <div>
                    <h3 className="text-xl font-display font-bold mb-3">{t.s8HealthTitle}</h3>
                    <div className="flex gap-2" role="radiogroup" aria-label="Health status">
                      {(t.healthOptions as { id: AssessmentInputHealthStatus; label: string }[]).map(opt => (
                        <Button 
                          key={opt.id}
                          role="radio"
                          aria-checked={formData.healthStatus === opt.id}
                          variant={formData.healthStatus === opt.id ? "default" : "outline"}
                          className="flex-1 rounded-xl h-11 text-sm"
                          onClick={() => updateField('healthStatus', opt.id)}
                        >
                          {opt.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold mb-1">{t.s8ChronicTitle}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{t.s8ChronicSub}</p>
                    <div className="flex gap-2" role="radiogroup" aria-label="Chronic condition">
                      {(t.chronicOptions as { id: string; label: string }[]).map(opt => (
                        <Button 
                          key={opt.id}
                          role="radio"
                          aria-checked={formData.chronicCondition === opt.id}
                          variant={formData.chronicCondition === opt.id ? "default" : "outline"}
                          className="flex-1 rounded-xl h-11 text-sm"
                          onClick={() => updateField('chronicCondition', opt.id as AssessmentInputChronicCondition)}
                        >
                          {opt.label}
                        </Button>
                      ))}
                    </div>

                    {/* Chronic condition sub-questions — only shown when "Yes" is selected */}
                    {formData.chronicCondition === "yes" && (
                      <div className="mt-5 space-y-5 p-5 rounded-2xl border border-primary/20 bg-primary/5 animate-in slide-in-from-top-2 duration-200">
                        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Tell us a bit more — this helps us tailor your plan</p>

                        {/* Condition name */}
                        <div>
                          <label className="text-sm font-semibold block mb-2">What condition do you have? <span className="text-muted-foreground font-normal">(optional)</span></label>
                          <input
                            type="text"
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                            placeholder="e.g. PCOS, arthritis, Type 2 diabetes, myopia…"
                            value={formData.chronicConditionName ?? ""}
                            onChange={e => updateField('chronicConditionName', e.target.value || undefined)}
                            maxLength={120}
                          />
                        </div>

                        {/* Severity */}
                        <div>
                          <label className="text-sm font-semibold block mb-2">How much does it impact your daily life?</label>
                          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Chronic condition severity">
                            {([
                              { id: "mild", label: "Mild", desc: "Manageable, mostly lifestyle-based" },
                              { id: "moderate", label: "Moderate", desc: "Some daily impact or regular monitoring" },
                              { id: "severe", label: "Significant", desc: "Substantial daily impact or ongoing treatment" },
                            ] as { id: ChronicSeverity; label: string; desc: string }[]).map(opt => (
                              <Button
                                key={opt.id}
                                role="radio"
                                aria-checked={formData.chronicSeverity === opt.id}
                                variant={formData.chronicSeverity === opt.id ? "default" : "outline"}
                                className="h-auto py-3 px-3 rounded-xl flex-col items-start gap-1 text-left whitespace-normal overflow-hidden"
                                onClick={() => updateField('chronicSeverity', opt.id)}
                              >
                                <span className="text-sm font-semibold w-full">{opt.label}</span>
                                <span className="text-xs font-normal opacity-75 leading-snug w-full break-words">{opt.desc}</span>
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Medication / treatment */}
                        <div>
                          <label className="text-sm font-semibold block mb-2">Does it require regular medication or medical treatment?</label>
                          <div className="flex gap-2" role="radiogroup" aria-label="Medication required">
                            {[
                              { id: true, label: "Yes — ongoing medication or treatment" },
                              { id: false, label: "No — lifestyle-managed or resolved" },
                            ].map(opt => (
                              <Button
                                key={String(opt.id)}
                                role="radio"
                                aria-checked={formData.chronicRequiresMedication === opt.id}
                                variant={formData.chronicRequiresMedication === opt.id ? "default" : "outline"}
                                className="flex-1 rounded-xl h-auto py-3 text-sm"
                                onClick={() => updateField('chronicRequiresMedication', opt.id)}
                              >
                                {opt.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 9: MOBILITY & RELOCATION */}
              {step === 9 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-display font-bold">{t.s9Title}</h2>
                    <p className="mt-2 text-muted-foreground text-sm">{t.s9Sub}</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold mb-1">{t.s8PhysicalTitle}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{t.s8PhysicalSub}</p>
                    <div className="flex gap-2" role="radiogroup" aria-label="Physical capability">
                      {(t.mobilityOptions as { id: AssessmentInputMobilityLevel; label: string }[]).map(opt => (
                        <Button 
                          key={opt.id}
                          role="radio"
                          aria-checked={formData.mobilityLevel === opt.id}
                          variant={formData.mobilityLevel === opt.id ? "default" : "outline"}
                          className="flex-1 rounded-xl h-11 text-sm"
                          onClick={() => updateField('mobilityLevel', opt.id)}
                        >
                          {opt.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold mb-1">{t.s8RelocationTitle}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{t.s8RelocationSub}</p>
                    <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Relocation readiness">
                      {(t.relocationOptions as { id: string; label: string; desc: string }[]).map(opt => (
                        <Card
                          key={opt.id}
                          role="radio"
                          aria-checked={formData.relocationReadiness === opt.id}
                          tabIndex={0}
                          className={cn(
                            "p-3 cursor-pointer transition-all duration-200",
                            formData.relocationReadiness === opt.id ? "step-card-active" : "hover:border-primary/30"
                          )}
                          onClick={() => updateField('relocationReadiness', opt.id as AssessmentInputRelocationReadiness)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); updateField('relocationReadiness', opt.id as AssessmentInputRelocationReadiness); } }}
                        >
                          <div className="font-semibold text-sm">{opt.label}</div>
                          <div className="text-xs text-muted-foreground">{opt.desc}</div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 10: HOUSING */}
              {step === 10 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-display font-bold">{t.housingStepTitle}</h2>
                    <p className="mt-2 text-muted-foreground text-sm">{t.housingStepSub}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-label="Housing situation">
                    {(t.housingOptions as { id: string; label: string }[]).map((opt) => (
                      <Card 
                        key={opt.id}
                        role="radio"
                        aria-checked={formData.housingType === opt.id}
                        tabIndex={0}
                        className={cn(
                          "p-5 cursor-pointer font-medium transition-all duration-200",
                          formData.housingType === opt.id ? "step-card-active" : "hover:border-primary/30"
                        )}
                        onClick={() => updateField('housingType', opt.id as AssessmentInputHousingType)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); updateField('housingType', opt.id as AssessmentInputHousingType); } }}
                      >
                        {opt.label}
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 11: EMERGENCY SUPPLIES (TIERED) */}
              {step === 11 && (
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-display font-bold">{t.s10Title}</h2>
                  <p className="text-muted-foreground text-lg">{t.s10Sub}</p>
                  <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-label="Emergency supplies tier">
                    {(t.emergencyOptions as { id: string; label: string; desc: string }[]).map((opt) => (
                      <Card 
                        key={opt.id}
                        role="radio"
                        aria-checked={formData.emergencySupplyTier === opt.id}
                        tabIndex={0}
                        className={cn(
                          "p-5 cursor-pointer transition-all duration-200",
                          formData.emergencySupplyTier === opt.id ? "step-card-active" : "hover:border-primary/30"
                        )}
                        onClick={() => updateField('emergencySupplyTier', opt.id as AssessmentInputEmergencySupplyTier)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); updateField('emergencySupplyTier', opt.id as AssessmentInputEmergencySupplyTier); } }}
                      >
                        <div className="font-semibold">{opt.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{opt.desc}</div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 12: RISK PROFILE */}
              {step === 12 && (
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-display font-bold">{t.s11Title}</h2>
                  <p className="text-muted-foreground">{t.s11Sub}</p>
                  <div className="grid grid-cols-2 gap-3" role="group" aria-label="Risk concerns">
                    {(t.riskOptions as { id: string; label: string }[]).map((opt) => {
                      const isSelected = formData.riskConcerns.includes(opt.id as AssessmentInputRiskConcernsItem);
                      const isTraumaAdjacent = opt.id === 'war_conflict' || opt.id === 'illness';
                      return (
                        <div key={opt.id} className="flex flex-col gap-1">
                          <div 
                            role="checkbox"
                            aria-checked={isSelected}
                            tabIndex={0}
                            onClick={() => toggleArrayItem('riskConcerns', opt.id as AssessmentInputRiskConcernsItem)}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleArrayItem('riskConcerns', opt.id as AssessmentInputRiskConcernsItem); } }}
                            className={cn(
                              "px-3 py-3 rounded-xl border-2 cursor-pointer font-medium text-sm transition-all text-center flex items-center justify-center min-h-[60px]",
                              isSelected
                                ? "border-destructive bg-destructive/10 text-destructive shadow-sm" 
                                : "border-border hover:border-primary/30 text-foreground bg-card"
                            )}
                          >
                            {opt.label}
                          </div>
                          {isSelected && isTraumaAdjacent && (
                            <p className="text-xs text-muted-foreground px-1 leading-relaxed">
                              {t.traumaNote}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 13: SOCIAL CAPITAL */}
              {step === 13 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-display font-bold">{t.s12Title}</h2>
                    <p className="text-muted-foreground text-lg mt-2">{t.s12Sub}</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-display font-bold mb-1">{t.s12ContactsTitle}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{t.s12ContactsSub}</p>
                    <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Trusted contacts">
                      {(t.contactOptions as { value: number; label: string; desc: string }[]).map((opt) => (
                        <Card
                          key={opt.value}
                          role="radio"
                          aria-checked={formData.trustedLocalContacts === opt.value}
                          tabIndex={0}
                          className={cn(
                            "p-4 cursor-pointer flex flex-col gap-1 transition-all duration-200",
                            formData.trustedLocalContacts === opt.value ? "step-card-active" : "hover:border-primary/30"
                          )}
                          onClick={() => updateField('trustedLocalContacts', opt.value)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); updateField('trustedLocalContacts', opt.value); } }}
                        >
                          <span className="font-bold">{opt.label}</span>
                          <span className="text-xs text-muted-foreground">{opt.desc}</span>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-display font-bold mb-1">{t.s12InvolvementTitle}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{t.s12InvolvementSub}</p>
                    <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-label="Community involvement">
                      {(t.involvementOptions as { id: string; label: string; desc: string }[]).map((opt) => (
                        <Card
                          key={opt.id}
                          role="radio"
                          aria-checked={formData.communityInvolvement === opt.id}
                          tabIndex={0}
                          className={cn(
                            "p-4 cursor-pointer transition-all duration-200",
                            formData.communityInvolvement === opt.id ? "step-card-active" : "hover:border-primary/30"
                          )}
                          onClick={() => updateField('communityInvolvement', opt.id as AssessmentInputCommunityInvolvement)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); updateField('communityInvolvement', opt.id as AssessmentInputCommunityInvolvement); } }}
                        >
                          <div className="font-semibold">{opt.label}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{opt.desc}</div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-display font-bold mb-1">{t.s12MutualAidTitle}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{t.s12MutualAidSub}</p>
                    <div className="grid grid-cols-2 gap-4" role="radiogroup" aria-label="Mutual aid access">
                      {[
                        { value: true, label: t.mutualAidYes },
                        { value: false, label: t.mutualAidNo },
                      ].map((opt) => (
                        <Card
                          key={String(opt.value)}
                          role="radio"
                          aria-checked={formData.mutualAidAccess === opt.value}
                          tabIndex={0}
                          className={cn(
                            "p-6 cursor-pointer flex items-center justify-center text-center transition-all duration-200",
                            formData.mutualAidAccess === opt.value ? "step-card-active" : "hover:border-primary/30"
                          )}
                          onClick={() => updateField('mutualAidAccess', opt.value)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); updateField('mutualAidAccess', opt.value); } }}
                        >
                          <span className="font-semibold text-sm">{opt.label}</span>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 14: RESILIENCE GOAL */}
              {step === 14 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-display font-bold">{t.s14Title}</h2>
                    <p className="text-muted-foreground text-lg mt-2">{t.s14Sub}</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-display font-bold mb-1">{t.s14GoalLabel}</h3>
                    <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-label="Resilience goal">
                      {(t.goalOptions as { id: string; emoji: string; label: string; desc: string }[]).map((opt) => (
                        <Card
                          key={opt.id}
                          role="radio"
                          aria-checked={formData.primaryGoal === opt.id}
                          tabIndex={0}
                          className={cn(
                            "p-4 cursor-pointer flex items-start gap-4 transition-all duration-200",
                            formData.primaryGoal === opt.id ? "step-card-active" : "hover:border-primary/30"
                          )}
                          onClick={() => updateField('primaryGoal', opt.id)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); updateField('primaryGoal', opt.id); } }}
                        >
                          <span className="text-2xl mt-0.5 shrink-0">{opt.emoji}</span>
                          <div>
                            <div className="font-semibold">{opt.label}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{opt.desc}</div>
                          </div>
                          {formData.primaryGoal === opt.id && (
                            <CheckCircle2 className="w-5 h-5 text-primary ml-auto shrink-0 mt-0.5" />
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-display font-bold mb-1">{t.s14VisionLabel}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{t.s14VisionSub}</p>
                    <textarea
                      className="w-full min-h-[120px] rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                      placeholder={t.s14VisionPlaceholder}
                      value={formData.successVision ?? ""}
                      maxLength={500}
                      onChange={(e) => updateField('successVision', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-right">{(formData.successVision ?? "").length}/500</p>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* BOTTOM NAVIGATION */}
        <div className="w-full flex items-center justify-between mt-12 pt-6 border-t border-border">
          <Button 
            variant="ghost" 
            size="lg" 
            onClick={handlePrev}
            disabled={step === 1 && mrStep === 0}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> {t.back}
          </Button>
          
          <Button 
            size="lg" 
            className="px-8 rounded-full shadow-lg shadow-primary/20"
            onClick={handleNext}
            disabled={!isStepValid()}
            aria-label={step === TOTAL_STEPS ? t.generateReport : step === MR_STEP && mrStep === MR_QUESTIONS.length - 1 ? t.continue : t.next}
          >
            {step === TOTAL_STEPS ? t.generateReport : step === MR_STEP && mrStep === MR_QUESTIONS.length - 1 ? t.continue : t.next}
            {step === TOTAL_STEPS ? <CheckCircle2 className="w-4 h-4 ml-2" /> : <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
