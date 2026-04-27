import React, { useState, useCallback, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { NoIndexPage } from "@/components/page-seo";
import { saveToCache, loadFromCache, reportCacheKey } from "@/lib/offline-cache";
import {
  useGetReport,
  useGetChecklists,
  useUpdateChecklistItem,
  useGetSnapshots,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import {
  Loader2, AlertTriangle, Check, CheckCircle, ChevronDown, ChevronUp,
  Sparkles, Lock, Heart, ExternalLink, Target, ArrowRight,
  TrendingUp, Clock, Star, Activity, Brain, Shield, BookOpen,
  Globe, Zap, DollarSign, Stethoscope, MapPin, Award, ChevronRight,
  UserPlus, Copy,
} from "lucide-react";
import { ResilientIcon } from "@/components/resilient-icon";
import { SiteFooter } from "@/components/site-footer";
import { useToast } from "@/hooks/use-toast";
import { useUser, useAuth, useClerk } from "@clerk/react";
import { cn } from "@/lib/utils";
import type { ChecklistItem } from "@workspace/api-client-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const AREA_LABELS: Record<string, string> = {
  financial: "Financial",
  health: "Health",
  skills: "Skills",
  mobility: "Mobility",
  psychological: "Psychological",
  resources: "Emergency Resources",
  socialCapital: "Social Capital",
};

const AREA_ICONS: Record<string, React.ElementType> = {
  financial: DollarSign,
  health: Stethoscope,
  skills: Zap,
  mobility: MapPin,
  psychological: Brain,
  resources: Shield,
  socialCapital: Globe,
};

const AREA_COLORS: Record<string, string> = {
  financial: "text-emerald-400 bg-emerald-500/15",
  health: "text-sky-400 bg-sky-500/15",
  skills: "text-violet-400 bg-violet-500/15",
  mobility: "text-amber-400 bg-amber-500/15",
  psychological: "text-rose-400 bg-rose-500/15",
  resources: "text-orange-400 bg-orange-500/15",
  socialCapital: "text-teal-400 bg-teal-500/15",
};

const PRIORITY_CONFIG = {
  critical: { label: "Critical", className: "bg-red-500/20 text-red-400 border-red-500/35" },
  high: { label: "High", className: "bg-amber-500/20 text-amber-400 border-amber-500/35" },
  medium: { label: "Medium", className: "bg-sky-500/20 text-sky-400 border-sky-500/35" },
  low: { label: "Low", className: "bg-primary/15 text-primary border-primary/30" },
};

const GOAL_LABELS: Record<string, string> = {
  job_security: "Job & Income Security",
  financial_independence: "Financial Independence",
  disaster_preparedness: "Disaster Preparedness",
  health_continuity: "Health Continuity",
  geopolitical_risk: "Geopolitical Risk",
  life_transition: "Life Transition",
  general_resilience: "General Resilience",
};

const GOAL_ICONS: Record<string, string> = {
  job_security: "💼",
  financial_independence: "💰",
  disaster_preparedness: "🛡️",
  health_continuity: "🏥",
  geopolitical_risk: "🌍",
  life_transition: "🔄",
  general_resilience: "⚡",
};

const MILESTONE_MARKERS = [
  { percent: 25, label: "Momentum Building", icon: "🌱" },
  { percent: 50, label: "Strong Foundation", icon: "🏗️" },
  { percent: 75, label: "Well Prepared", icon: "🛡️" },
  { percent: 100, label: "Fully Resilient", icon: "🎯" },
];

function getMilestone(percent: number) {
  return MILESTONE_MARKERS.slice().reverse().find(m => percent >= m.percent);
}

const COACHING_AREAS = new Set(["psychological", "health"]);

type ResourceEntry = { title: string; desc: string; url: string; badge: string };

const AREA_RESOURCES_US: Record<string, ResourceEntry[]> = {
  financial: [
    { title: "Consumer Financial Protection Bureau", desc: "Free budgeting tools and financial guides from the U.S. government.", url: "https://www.consumerfinance.gov", badge: "Gov · Free" },
    { title: "FEMA Financial Preparedness", desc: "Build financial resilience for emergencies and unexpected events.", url: "https://www.ready.gov/financial-preparedness", badge: "Gov · Free" },
  ],
  health: [
    { title: "HealthCare.gov", desc: "Find health insurance options and enrollment periods in the U.S.", url: "https://www.healthcare.gov", badge: "Gov · Free" },
    { title: "CDC Emergency Preparedness", desc: "Health and medical preparedness resources for individuals and families.", url: "https://www.cdc.gov/emergency", badge: "Gov · Free" },
  ],
  skills: [
    { title: "Coursera (Resilience & Adaptability)", desc: "University-certified courses on resilience, leadership, and crisis skills.", url: "https://www.coursera.org/search?query=resilience", badge: "Courses" },
    { title: "LinkedIn Learning", desc: "Practical skills for career pivots, remote work, and professional resilience.", url: "https://www.linkedin.com/learning", badge: "Skills" },
  ],
  mobility: [
    { title: "State Department Travel Advisories", desc: "Official U.S. government travel safety ratings for every country.", url: "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories.html", badge: "Gov · Free" },
    { title: "Numbeo Quality of Life Index", desc: "Compare cost of living, safety, and quality of life across 500+ cities.", url: "https://www.numbeo.com/quality-of-life/", badge: "Free Tool" },
  ],
  psychological: [
    { title: "Mental Health America", desc: "Self-assessment tools, peer support, and mental health resources.", url: "https://www.mhanational.org", badge: "Non-Profit" },
    { title: "Mindfulness-Based Stress Reduction (MBSR)", desc: "Evidence-based 8-week program to build stress tolerance and presence.", url: "https://www.umassmed.edu/cfm/mindfulness-based-programs/mbsr-courses/", badge: "Program" },
  ],
  resources: [
    { title: "Ready.gov", desc: "Official U.S. guide to emergency kits, family plans, and local preparedness.", url: "https://www.ready.gov", badge: "Gov · Free" },
    { title: "American Red Cross", desc: "Disaster preparedness courses, first aid certification, and local response network.", url: "https://www.redcross.org/take-a-class", badge: "Non-Profit" },
  ],
  socialCapital: [
    { title: "VolunteerMatch", desc: "Find local volunteer and community-building opportunities near you.", url: "https://www.volunteermatch.org", badge: "Community" },
    { title: "Nextdoor", desc: "Connect with your local neighborhood for mutual aid and community resilience.", url: "https://nextdoor.com", badge: "Community" },
  ],
};

const AREA_RESOURCES_RO: Record<string, ResourceEntry[]> = {
  financial: [
    { title: "ANAF — Agenția Națională de Administrare Fiscală", desc: "Obligații fiscale, ghiduri de conformitate și instrumente de planificare financiară.", url: "https://www.anaf.ro", badge: "Gov · Gratuit" },
    { title: "ASF România — Educație Financiară", desc: "Resurse de educație financiară de la Autoritatea de Supraveghere Financiară.", url: "https://www.asfromania.ro/consumatori/educatie-financiara", badge: "Gov · Gratuit" },
    { title: "AFIR — Fonduri Europene pentru Investiții Rurale", desc: "Fonduri europene pentru proiecte agricole, rurale și de reziliență economică prin PNDR.", url: "https://www.afir.ro", badge: "Fonduri EU" },
  ],
  health: [
    { title: "OMS — Urgențe și Sănătate Globală", desc: "Resurse OMS pentru pregătire în urgențe de sănătate, ghiduri de auto-îngrijire și sănătate globală.", url: "https://www.who.int/emergencies/overview", badge: "Intl · Gratuit" },
    { title: "Ministerul Sănătății", desc: "Ghiduri oficiale de sănătate publică, pregătire pentru urgențe medicale și resurse locale de sănătate.", url: "https://www.ms.ro", badge: "Gov · Gratuit" },
    { title: "IFRC — Primul Ajutor", desc: "Cursuri de prim ajutor și pregătire pentru situații de urgență de la Federația Internațională de Cruce Roșie.", url: "https://www.ifrc.org", badge: "Intl · Cursuri" },
  ],
  skills: [
    { title: "Coursera (Reziliență & Adaptabilitate)", desc: "Cursuri certificate de universități de top despre reziliență, leadership și gestionarea crizelor.", url: "https://www.coursera.org/search?query=resilience", badge: "Cursuri" },
    { title: "LinkedIn Learning", desc: "Abilități practice pentru reconversie profesională și reziliență profesională.", url: "https://www.linkedin.com/learning", badge: "Skills" },
    { title: "Gov.ro — Portalul Guvernului României", desc: "Portal oficial al Guvernului României cu resurse, servicii publice și informații administrative.", url: "https://www.gov.ro", badge: "Gov · Gratuit" },
  ],
  mobility: [
    { title: "Europa.eu — Călătorii și Intrare în UE", desc: "Avertizări și informații oficiale ale UE privind condițiile de intrare, vize și călătorii în străinătate.", url: "https://europa.eu/youreurope/citizens/travel/entry-exit/index_en.htm", badge: "EU · Gratuit" },
    { title: "Numbeo — Calitatea Vieții în România", desc: "Compară costul vieții, siguranța și calitatea vieții în orașe din România și din lume.", url: "https://www.numbeo.com/quality-of-life/country_result.jsp?country=Romania", badge: "Instrument Gratuit" },
    { title: "Schengen Info — Vize & Mobilitate", desc: "Ghid complet despre drepturile de mobilitate în spațiul Schengen și UE.", url: "https://www.schengenvisainfo.com", badge: "Ghid" },
  ],
  psychological: [
    { title: "OMS — Sănătate Mintală", desc: "Ghiduri OMS pentru sănătate mintală, resurse de auto-îngrijire și sprijin comunitar.", url: "https://www.who.int/health-topics/mental-health", badge: "Intl · Gratuit" },
    { title: "Mindfulness-Based Stress Reduction (MBSR)", desc: "Program de 8 săptămâni bazat pe dovezi pentru gestionarea stresului și reziliență psihologică.", url: "https://www.umassmed.edu/cfm/mindfulness-based-programs/mbsr-courses/", badge: "Program" },
    { title: "Colegiul Psihologilor din România", desc: "Corpul profesional oficial al psihologilor din România — găsești psihologi acreditați și resurse de sănătate mintală.", url: "https://www.copsi.ro", badge: "Oficial · Resurse" },
  ],
  resources: [
    { title: "IGSU — Inspectoratul General pentru Situații de Urgență", desc: "Ghid oficial de pregătire pentru urgențe, dezastre naturale și situații de criză în România.", url: "https://www.igsu.ro", badge: "Gov · Gratuit" },
    { title: "Crucea Roșie Română", desc: "Cursuri de prim ajutor, pregătire pentru dezastre și rețea de răspuns în situații de urgență.", url: "https://www.crucearosie.ro", badge: "ONG" },
    { title: "MAI — Departamentul pentru Situații de Urgență", desc: "Ministerul Afacerilor Interne: informații despre sistemul de alertare și gestionarea situațiilor de urgență.", url: "https://www.mai.gov.ro", badge: "Gov · Gratuit" },
  ],
  socialCapital: [
    { title: "Voluntariat.ro", desc: "Găsește oportunități de voluntariat și proiecte de construire comunitară din toată România.", url: "https://www.voluntariat.ro", badge: "Comunitate" },
    { title: "Federația Organizațiilor Cetățenești", desc: "Rețea de ONG-uri și organizații civice pentru reziliență comunitară.", url: "https://fonpc.ro", badge: "ONG" },
    { title: "Nextdoor România", desc: "Conectează-te cu vecinii și comunitatea locală pentru ajutor reciproc și reziliență.", url: "https://nextdoor.com", badge: "Comunitate" },
  ],
};

const AREA_RESOURCES_GLOBAL: Record<string, ResourceEntry[]> = {
  financial: [
    { title: "Coursera — Personal Finance", desc: "University-certified courses on budgeting, investing, and building financial resilience.", url: "https://www.coursera.org/search?query=personal+finance", badge: "Courses" },
    { title: "Numbeo — Cost of Living", desc: "Compare cost of living, prices, and quality of life across 500+ cities worldwide.", url: "https://www.numbeo.com/cost-of-living/", badge: "Free Tool" },
  ],
  health: [
    { title: "WHO — Health Emergencies", desc: "World Health Organization health emergency resources, situation reports, and preparedness guides.", url: "https://www.who.int/emergencies/overview", badge: "Intl · Free" },
    { title: "Mental Health First Aid (International)", desc: "Learn to identify and respond to mental health crises in any context.", url: "https://www.mentalhealthfirstaid.org/international/", badge: "Course" },
  ],
  skills: [
    { title: "Coursera (Resilience & Adaptability)", desc: "University-certified courses on resilience, leadership, and crisis skills.", url: "https://www.coursera.org/search?query=resilience", badge: "Courses" },
    { title: "LinkedIn Learning", desc: "Practical skills for career pivots, remote work, and professional resilience.", url: "https://www.linkedin.com/learning", badge: "Skills" },
  ],
  mobility: [
    { title: "Numbeo Quality of Life Index", desc: "Compare cost of living, safety, and quality of life across 500+ cities.", url: "https://www.numbeo.com/quality-of-life/", badge: "Free Tool" },
    { title: "InterNations — Expat Community", desc: "Resources, community, and guides for international relocation and mobility planning.", url: "https://www.internations.org", badge: "Community" },
  ],
  psychological: [
    { title: "Mindfulness-Based Stress Reduction (MBSR)", desc: "Evidence-based 8-week program to build stress tolerance and presence.", url: "https://www.umassmed.edu/cfm/mindfulness-based-programs/mbsr-courses/", badge: "Program" },
    { title: "Headspace", desc: "Guided meditation and mindfulness to build psychological resilience.", url: "https://www.headspace.com", badge: "App" },
  ],
  resources: [
    { title: "UN OCHA — Humanitarian Response", desc: "United Nations Office for the Coordination of Humanitarian Affairs — international crisis coordination and preparedness resources.", url: "https://www.unocha.org", badge: "Intl · Free" },
    { title: "IFRC — Red Cross Network", desc: "International Red Cross and Red Crescent first aid, disaster preparedness, and response.", url: "https://www.ifrc.org", badge: "Non-Profit" },
  ],
  socialCapital: [
    { title: "InterNations Community", desc: "Connect with expats and locals for community resilience and social capital building.", url: "https://www.internations.org", badge: "Community" },
    { title: "Meetup — Local Groups", desc: "Find local community groups for mutual support and skill sharing.", url: "https://www.meetup.com", badge: "Community" },
  ],
};

function getAreaResources(location: string | undefined): Record<string, ResourceEntry[]> {
  if (!location) return AREA_RESOURCES_GLOBAL;
  const loc = location.toLowerCase();
  if (loc.includes("romania") || loc.includes("bucurești") || loc.includes("bucharest") || loc.includes("cluj") || loc.includes("timișoara") || loc.includes("iași") || loc.includes("brașov") || loc.includes("constanța")) {
    return AREA_RESOURCES_RO;
  }
  if (loc.includes("united states") || loc.includes("usa") || loc.includes("u.s.") || loc.includes(", ca") || loc.includes(", ny") || loc.includes(", tx") || loc.includes(", fl") || loc.includes(", wa") || loc.includes(", co") || loc.includes(", il") || loc.includes(", ga") || loc.includes(", az") || loc.includes(", nc") || loc.includes(", oh") || loc.includes(", mi")) {
    return AREA_RESOURCES_US;
  }
  return AREA_RESOURCES_GLOBAL;
}

type CommunityResource = { title: string; desc: string; url: string; badge: string; icon: string };

const COMMUNITY_RESOURCES_US: CommunityResource[] = [
  { title: "211 — Local Help Finder", desc: "Free 24/7 helpline and directory connecting you to food, housing, utilities, and health assistance anywhere in the US. Call, text, or search online.", url: "https://www.211.org", badge: "Free · 24/7", icon: "📞" },
  { title: "Benefits.gov", desc: "Official US government tool to find federal benefit programs you may qualify for — SNAP, Medicaid, WIC, housing, utilities help, and more.", url: "https://www.benefits.gov", badge: "Gov · Free", icon: "🏛️" },
  { title: "Feeding America — Food Bank Finder", desc: "Find your nearest food bank or pantry. Most food banks serve anyone in need — no proof of income required.", url: "https://www.feedingamerica.org/find-your-local-foodbank", badge: "Non-Profit · Free", icon: "🥫" },
  { title: "HRSA Health Center Finder", desc: "Find federally funded health centers near you offering free or sliding-scale medical, dental, and mental health care.", url: "https://findahealthcenter.hrsa.gov", badge: "Gov · Low-Cost", icon: "🏥" },
  { title: "NAMI — Mental Health Support", desc: "Free mental health information, peer support, and crisis referrals. Call or text 988, or reach NAMI directly at 1-800-950-6264.", url: "https://www.nami.org/help", badge: "Free · Confidential", icon: "🧠" },
];

const COMMUNITY_RESOURCES_RO: CommunityResource[] = [
  { title: "ANOFM — Șomaj și Venituri Minime", desc: "Indemnizații de șomaj, venit minim garantat și programe de recalificare profesională — Agenția Națională pentru Ocuparea Forței de Muncă.", url: "https://www.anofm.ro", badge: "Gov · Gratuit", icon: "📋" },
  { title: "Crucea Roșie Română — Ajutor de Urgență", desc: "Ajutor alimentar, sprijin în crize și servicii sociale pentru familii vulnerabile și persoane în dificultate din toată România.", url: "https://www.crucearosie.ro", badge: "ONG · Gratuit", icon: "🏥" },
  { title: "eJobs România — Oportunități de Angajare", desc: "Cele mai multe locuri de muncă din România — caută joburi, trimite CV-ul și reconstruiește-ți veniturile cât mai repede.", url: "https://www.ejobs.ro", badge: "Gratuit", icon: "💼" },
  { title: "DepreHUB — Sprijin Psihologic 24/7", desc: "Linie gratuită de suport emoțional disponibilă non-stop: anxietate, depresie, criză. Psihologi și voluntari instruiți, complet confidențial.", url: "https://deprehub.ro/obtine-suport/helpline/", badge: "Gratuit · 24/7", icon: "🧠" },
  { title: "Fondul Social European — Programe pentru România", desc: "Programe UE de formare profesională, reconversie și sprijin pentru angajare finanțate prin Fondul Social European.", url: "https://ec.europa.eu/social/main.jsp?catId=1094&langId=ro", badge: "UE · Gratuit", icon: "🌍" },
];

const COMMUNITY_RESOURCES_GLOBAL: CommunityResource[] = [
  { title: "UNHCR — Support for Displaced People", desc: "UN Refugee Agency assistance, legal protection, and connection to local support services for refugees and displaced people worldwide.", url: "https://www.unhcr.org", badge: "Intl · Free", icon: "🌍" },
  { title: "Red Cross / Red Crescent — Local Chapter", desc: "Emergency relief, food, and community support. Find your nearest local chapter through the ICRC's global directory.", url: "https://www.icrc.org/en/where-we-work", badge: "Non-Profit · Free", icon: "🏥" },
  { title: "Idealist — Local NGOs & Community Aid", desc: "Directory of local nonprofits and community organizations providing direct assistance — search by city or country.", url: "https://www.idealist.org", badge: "Directory · Free", icon: "🤝" },
  { title: "WHO Mental Health Resources", desc: "Free mental health guidance, self-care tools, and referral resources from the World Health Organization.", url: "https://www.who.int/health-topics/mental-health", badge: "Intl · Free", icon: "🧠" },
];

function getCommunityResources(location: string | undefined): CommunityResource[] {
  if (!location) return COMMUNITY_RESOURCES_GLOBAL;
  const loc = location.toLowerCase();
  if (loc.includes("romania") || loc.includes("bucurești") || loc.includes("bucharest") || loc.includes("cluj") || loc.includes("timișoara") || loc.includes("iași") || loc.includes("brașov") || loc.includes("constanța")) {
    return COMMUNITY_RESOURCES_RO;
  }
  if (loc.includes("united states") || loc.includes("usa") || loc.includes("u.s.") || loc.includes(", ca") || loc.includes(", ny") || loc.includes(", tx") || loc.includes(", fl") || loc.includes(", wa") || loc.includes(", co") || loc.includes(", il") || loc.includes(", ga") || loc.includes(", az") || loc.includes(", nc") || loc.includes(", oh") || loc.includes(", mi")) {
    return COMMUNITY_RESOURCES_US;
  }
  return COMMUNITY_RESOURCES_GLOBAL;
}

const ONBOARDING_STEPS = [
  {
    icon: "🎯",
    title: "Welcome to Your Action Plan",
    desc: "This is your personal resilience roadmap — everything here is tailored to your assessment results, your goal, and your location.",
  },
  {
    icon: "⏱️",
    title: "Three Timeframes, Clear Priorities",
    desc: "Actions are organized into 0–30 days (urgent), 3–6 months (high-priority), and long-term. Start with the first horizon and work down.",
  },
  {
    icon: "✅",
    title: "Check Off Actions As You Go",
    desc: "Click any action to mark it complete. Your progress is saved to your account and shown on your Report scorecard.",
  },
  {
    icon: "✨",
    title: "AI-Guided Sub-Steps (Pro)",
    desc: "For each action, click \"Break it down\" to get AI-generated step-by-step guidance tailored to your specific situation.",
  },
  {
    icon: "📚",
    title: "Local Resources Included",
    desc: "Every section includes curated resources matched to your location — local government sources, organizations, and tools relevant to where you are.",
  },
];

function OnboardingModal({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const current = ONBOARDING_STEPS[step];
  const isLast = step === ONBOARDING_STEPS.length - 1;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-3xl shadow-2xl shadow-black/30 max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1.5">
            {ONBOARDING_STEPS.map((_, i) => (
              <div key={i} className={cn("h-1.5 rounded-full transition-all", i === step ? "w-6 bg-primary" : "w-1.5 bg-muted")} />
            ))}
          </div>
          <button onClick={onDone} className="text-muted-foreground hover:text-foreground text-xl leading-none">&times;</button>
        </div>
        <div className="text-5xl mb-5 text-center">{current?.icon}</div>
        <h2 className="font-display font-bold text-xl text-center mb-2">{current?.title}</h2>
        <p className="text-muted-foreground text-sm leading-relaxed text-center mb-8">{current?.desc}</p>
        <div className="flex gap-3">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted/30 transition-colors">
              Back
            </button>
          )}
          <button
            onClick={() => isLast ? onDone() : setStep(s => s + 1)}
            className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            {isLast ? "Let's Start →" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

type LocalSuggestion = { title: string; desc: string; type: string };
const LOCAL_TYPE_ICONS: Record<string, string> = {
  gov: "🏛️", ngo: "🤝", helpline: "📞", community: "🏘️",
};

function LocalAISuggestions({ location, isAuthenticated, getToken }: {
  location: string;
  isAuthenticated: boolean;
  getToken: () => Promise<string | null>;
}) {
  const [suggestions, setSuggestions] = useState<LocalSuggestion[]>([]);
  const [city, setCity] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const city0 = location.split(",")[0]?.trim() ?? location;
  const cacheKey = `resilium_local_res_${location}`;

  useEffect(() => {
    if (!isAuthenticated || !location) return;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.suggestions?.length) { setSuggestions(parsed.suggestions); setCity(parsed.city ?? city0); return; }
      } catch {}
    }
    setLoading(true);
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${BASE}/api/companion/local-resources`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) return;
        const json = await res.json();
        if (json.suggestions?.length) {
          setSuggestions(json.suggestions);
          setCity(json.city ?? city0);
          sessionStorage.setItem(cacheKey, JSON.stringify(json));
        }
      } catch { /* silently skip */ } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, location]);

  if (loading) {
    return (
      <div className="mt-5 pt-5 border-t border-sky-500/20 flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="w-3 h-3 animate-spin text-sky-400" />
        Finding local suggestions for {city0}…
      </div>
    );
  }
  if (!suggestions.length) return null;
  return (
    <div className="mt-5 pt-5 border-t border-sky-500/20">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
        <p className="text-xs font-bold uppercase tracking-widest text-sky-400">Local suggestions for {city}</p>
      </div>
      <div className="space-y-2">
        {suggestions.map((s, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-sky-500/5 border border-sky-500/15">
            <span className="text-base flex-shrink-0 mt-0.5">{LOCAL_TYPE_ICONS[s.type] ?? "📍"}</span>
            <div>
              <p className="text-sm font-semibold text-foreground">{s.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
        AI-suggested — verify each resource before contacting. Ask your AI Companion for more detail.
      </p>
    </div>
  );
}

export default function PlanPage() {
  const [, params] = useRoute("/plan/:reportId");
  const reportId = params?.reportId || "";
  const { toast } = useToast();
  const { isSignedIn, getToken } = useAuth();
  const { openSignIn } = useClerk();
  const isAuthenticated = !!isSignedIn;

  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    const key = "resilium_plan_onboarded_v1";
    if (!localStorage.getItem(key)) {
      const t = setTimeout(() => setShowOnboarding(true), 800);
      return () => clearTimeout(t);
    }
    return undefined;
  }, []);
  const dismissOnboarding = () => {
    localStorage.setItem("resilium_plan_onboarded_v1", "1");
    setShowOnboarding(false);
  };

  const { data: fetchedReport, isLoading, error } = useGetReport(reportId, {
    query: { enabled: !!reportId, retry: (n: number, e: any) => (e?.response?.status ?? e?.status) !== 404 && n < 2 } as any,
  });

  const { data: checklistData, refetch: refetchChecklist } = useGetChecklists(reportId, {
    query: { enabled: !!reportId } as any,
  });

  const { mutateAsync: updateItem } = useUpdateChecklistItem();

  const [isPro, setIsPro] = useState(false);
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(`${BASE}/api/users/me/subscription`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setIsPro(!!d.isActive))
      .catch(() => {});
  }, [isAuthenticated]);

  const FREE_BREAKDOWN_KEY = "resilium_breakdown_free_v1";
  const FREE_BREAKDOWN_TOTAL = 3;
  const [freeBreakdownsLeft, setFreeBreakdownsLeft] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(FREE_BREAKDOWN_KEY);
      if (stored === null) return FREE_BREAKDOWN_TOTAL;
      return Math.max(0, parseInt(stored, 10));
    } catch {
      return FREE_BREAKDOWN_TOTAL;
    }
  });

  // ── Offline caching ───────────────────────────────────────────────────────────
  const [offlinePlan, setOfflinePlan] = useState<any>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    if (fetchedReport && isPro && reportId) {
      saveToCache(reportCacheKey(reportId), fetchedReport);
    }
  }, [fetchedReport, isPro, reportId]);

  useEffect(() => {
    if ((error || (!isLoading && !fetchedReport)) && reportId && !offlinePlan) {
      const cached = loadFromCache<any>(reportCacheKey(reportId));
      if (cached) {
        setOfflinePlan(cached.data);
        setIsOfflineMode(true);
      }
    }
  }, [error, isLoading, fetchedReport, reportId, offlinePlan]);

  const report = fetchedReport ?? offlinePlan;

  // ── Habit progressive disclosure ─────────────────────────────────────────────
  const [habitsExpanded, setHabitsExpanded] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  // ── Streak tracking ──────────────────────────────────────────────────────────
  const [streak, setStreak] = useState(0);
  useEffect(() => {
    if (!reportId) return;
    const today = new Date().toISOString().split("T")[0];
    const raw = localStorage.getItem("resilium_streak_v1");
    const data: { lastDate: string; count: number } = raw ? JSON.parse(raw) : { lastDate: "", count: 0 };
    if (data.lastDate === today) {
      setStreak(data.count);
    } else {
      const yesterday = new Date(Date.now() - 86_400_000).toISOString().split("T")[0];
      const newCount = data.lastDate === yesterday ? data.count + 1 : 1;
      localStorage.setItem("resilium_streak_v1", JSON.stringify({ lastDate: today, count: newCount }));
      setStreak(newCount);
    }
  }, [reportId]);

  // Track plan page open (fire-and-forget)
  useEffect(() => {
    if (!reportId) return;
    fetch(`${BASE}/api/resilience/reports/${reportId}/view`, { method: "POST", credentials: "include" }).catch(() => {});
  }, [reportId]);

  // Time-delayed save prompt for anonymous users
  useEffect(() => {
    if (isAuthenticated) return;
    const timer = setTimeout(() => {
      toast({
        title: "Don't lose your plan",
        description: "Sign up free to save your action plan and track your progress over time.",
      });
    }, 35000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, toast]);

  const handleChecklistToggle = useCallback(async (area: string, itemId: string, currentlyCompleted: boolean) => {
    if (!isAuthenticated) { openSignIn({}); return; }
    try {
      await updateItem({ reportId, area, itemId, data: { completed: !currentlyCompleted } });
      await refetchChecklist();
    } catch {
      toast({ title: "Failed to update", description: "Could not save your progress.", variant: "destructive" });
    }
  }, [reportId, updateItem, refetchChecklist, toast, isAuthenticated, openSignIn]);

  const [expandedSteps, setExpandedSteps] = useState<Record<string, string[]>>({});
  const [loadingSteps, setLoadingSteps] = useState<Record<string, boolean>>({});
  const [showExpandPanel, setShowExpandPanel] = useState<Record<string, boolean>>({});

  const fetchGuidedSteps = useCallback(async (area: string, item: ChecklistItem) => {
    const key = `${area}::${item.id}`;
    if (expandedSteps[key] !== undefined || loadingSteps[key]) {
      setShowExpandPanel(prev => ({ ...prev, [key]: !prev[key] }));
      return;
    }
    setLoadingSteps(prev => ({ ...prev, [key]: true }));
    setShowExpandPanel(prev => ({ ...prev, [key]: true }));
    try {
      const res = await fetch(
        `${BASE}/api/resilience/reports/${reportId}/checklist/${encodeURIComponent(area)}/items/${item.id}/expand`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemTitle: item.title, itemDescription: item.description }),
        }
      );
      if (!res.ok) throw new Error("Failed");
      const data = await res.json() as { steps: string[] };
      setExpandedSteps(prev => ({ ...prev, [key]: data.steps }));
      if (!isPro) {
        const next = Math.max(0, freeBreakdownsLeft - 1);
        setFreeBreakdownsLeft(next);
        try { localStorage.setItem(FREE_BREAKDOWN_KEY, String(next)); } catch {}
      }
    } catch {
      setExpandedSteps(prev => ({ ...prev, [key]: [] }));
    } finally {
      setLoadingSteps(prev => ({ ...prev, [key]: false }));
    }
  }, [reportId, expandedSteps, loadingSteps, isPro, freeBreakdownsLeft, FREE_BREAKDOWN_KEY]);

  const overallScore = Math.round((report as any)?.score?.overall ?? 0);
  const handleInvite = useCallback(async () => {
    const msg = `I just took the Resilium resilience assessment and scored ${overallScore}/100. It takes about 10 minutes and shows exactly where your gaps are — worth doing. Take yours: https://resilium-platform.com`;
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ title: "Take the Resilium Resilience Assessment", text: msg });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(msg);
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 3000);
    } catch {
      toast({ title: "Could not copy", description: "Please copy the invite link manually." });
    }
  }, [overallScore, toast]);

  const handleMarkdownExport = useCallback(() => {
    if (!report) return;
    const lines: string[] = [];
    lines.push("# Resilium — Your Strategic Action Plan");
    lines.push(`> Generated at resilium-platform.com`);
    lines.push("");
    if ((report as any).primaryGoal) {
      lines.push(`**Goal:** ${GOAL_LABELS[(report as any).primaryGoal as string] ?? (report as any).primaryGoal}`);
      lines.push("");
    }
    const actionPlanData = (report as any).actionPlan as {
      shortTerm?: Array<{ title: string; description: string; priority: string; category: string }>;
      midTerm?: Array<{ title: string; description: string; priority: string; category: string }>;
      longTerm?: Array<{ title: string; description: string; priority: string; category: string }>;
    } | undefined;
    const horizonSections: Array<{ label: string; items: Array<{ title: string; description: string; priority: string; category: string }> | undefined }> = [
      { label: "## 0–30 Days: Immediate Actions", items: actionPlanData?.shortTerm },
      { label: "## 3–6 Months: High-Priority Habits", items: actionPlanData?.midTerm },
      { label: "## Long-term: Durable Foundation", items: actionPlanData?.longTerm },
    ];
    horizonSections.forEach(({ label, items }) => {
      if (!items?.length) return;
      lines.push(label);
      lines.push("");
      items.forEach((item, i) => {
        lines.push(`### ${i + 1}. ${item.title}`);
        lines.push(`**Category:** ${item.category} | **Priority:** ${item.priority}`);
        lines.push("");
        lines.push(item.description);
        lines.push("");
      });
    });
    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resilium-action-plan.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Plan exported", description: "Your action plan has been saved as a Markdown file." });
  }, [report, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium">Loading your action plan...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-destructive mb-6" />
        <h2 className="text-2xl font-display font-bold mb-2">Plan Not Found</h2>
        <p className="text-muted-foreground max-w-md mb-8">We couldn't locate this action plan. The report may have expired.</p>
        <Link href="/assess"><Button size="lg" className="rounded-full">Take Assessment</Button></Link>
      </div>
    );
  }

  const primaryGoal = (report as any).primaryGoal as string | undefined;
  const successVision = (report as any).successVision as string | undefined;
  const goalLabel = primaryGoal ? (GOAL_LABELS[primaryGoal] ?? primaryGoal) : null;
  const goalIcon = primaryGoal ? (GOAL_ICONS[primaryGoal] ?? "⚡") : "⚡";
  const reportLocation = (report as any)?.input?.location as string | undefined;
  const AREA_RESOURCES = getAreaResources(reportLocation);
  const communityResources = getCommunityResources(reportLocation);
  const showCommunitySupport = true;

  const isHouseholdPlan = report.householdMode === "household";
  const hc = report.input.householdComposition;

  const progressMap: Record<string, boolean> = {};
  (checklistData?.progress ?? []).forEach(p => { progressMap[`${p.area}::${p.itemId}`] = p.completed; });

  const checklistsByArea = (report.checklistsByArea ?? {}) as Record<string, ChecklistItem[]>;
  const allItems = Object.entries(checklistsByArea).flatMap(([area, items]) => items.map(i => ({ area, item: i })));
  const totalItems = allItems.length;
  const totalDone = allItems.filter(({ area, item }) => progressMap[`${area}::${item.id}`]).length;
  const overallPercent = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;
  const totalRemaining = totalItems - totalDone;
  const milestone = getMilestone(overallPercent);

  const PRIORITY_TO_HORIZON: Record<string, "short" | "mid" | "long"> = {
    critical: "short",
    high: "mid",
    medium: "long",
    low: "long",
  };

  const itemsByHorizon: Record<"short" | "mid" | "long", Array<{ area: string; item: ChecklistItem }>> = {
    short: [],
    mid: [],
    long: [],
  };
  allItems.forEach(({ area, item }) => {
    const horizon = PRIORITY_TO_HORIZON[item.priority] ?? "long";
    itemsByHorizon[horizon].push({ area, item });
  });

  const actionPlan = (report as any).actionPlan as {
    shortTerm?: Array<{ title: string; description: string; priority: string; category: string }>;
    midTerm?: Array<{ title: string; description: string; priority: string; category: string }>;
    longTerm?: Array<{ title: string; description: string; priority: string; category: string }>;
  } | undefined;

  const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  const top3Items = allItems
    .filter(({ area, item }) => !progressMap[`${area}::${item.id}`])
    .sort((a, b) => (PRIORITY_ORDER[a.item.priority] ?? 3) - (PRIORITY_ORDER[b.item.priority] ?? 3))
    .slice(0, 3);

  const reportScore = (report as any).score as Record<string, number> | undefined;
  const getAreaScore = (areaKey: string): number => {
    if (!reportScore) return 50;
    const a = areaKey.toLowerCase();
    if (a.includes("financial")) return reportScore.financial ?? 100;
    if (a.includes("health")) return reportScore.health ?? 100;
    if (a.includes("skill")) return reportScore.skills ?? 100;
    if (a.includes("mobil")) return reportScore.mobility ?? 100;
    if (a.includes("psych") || a.includes("mental")) return reportScore.psychological ?? 100;
    if (a.includes("resource") || a.includes("emergency") || a.includes("social") || a.includes("community")) return reportScore.resources ?? 100;
    return 50;
  };
  const areasByWeakest = Object.keys(checklistsByArea).sort((a, b) => getAreaScore(a) - getAreaScore(b));
  let oneThingNow: { area: string; item: ChecklistItem } | null = null;
  for (const area of areasByWeakest) {
    const uncompleted = (checklistsByArea[area] ?? [])
      .filter(item => !progressMap[`${area}::${item.id}`])
      .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3));
    if (uncompleted.length > 0) {
      oneThingNow = { area, item: uncompleted[0] };
      break;
    }
  }

  const dailyHabits = (report as any).dailyHabits as Array<{ habit: string; frequency: string; category: string }> | undefined;

  const FREQ_CONFIG: Record<string, { label: string; className: string }> = {
    daily: { label: "Daily", className: "bg-primary/10 text-primary border-primary/20" },
    weekly: { label: "Weekly", className: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
    monthly: { label: "Monthly", className: "bg-sky-500/10 text-sky-700 border-sky-500/20" },
  };

  const scenarioSimulations = (report as any).scenarioSimulations as Array<{
    scenario: string;
    impact: string;
    description: string;
    immediateSteps?: string[];
    timeToRecover?: string;
  }> | undefined;

  const horizons = [
    {
      key: "short" as const,
      label: "0–30 Days",
      sublabel: "Immediate actions — critical gaps to close now",
      icon: Clock,
      color: "text-destructive",
      bgColor: "bg-destructive/10 border-destructive/30",
      narrativeItems: actionPlan?.shortTerm ?? [],
      items: itemsByHorizon.short,
    },
    {
      key: "mid" as const,
      label: "3–6 Months",
      sublabel: "High-priority habits and infrastructure to build",
      icon: TrendingUp,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10 border-amber-500/30",
      narrativeItems: actionPlan?.midTerm ?? [],
      items: itemsByHorizon.mid,
    },
    {
      key: "long" as const,
      label: "Long-term",
      sublabel: "Sustained resilience — your durable foundation",
      icon: Star,
      color: "text-primary",
      bgColor: "bg-primary/10 border-primary/30",
      narrativeItems: actionPlan?.longTerm ?? [],
      items: itemsByHorizon.long,
    },
  ];

  return (
    <div className="min-h-screen pb-24">
      <NoIndexPage />
      {showOnboarding && <OnboardingModal onDone={dismissOnboarding} />}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          html, body { background: white !important; color: #111 !important; font-size: 11pt !important; }
          header, .print\\:hidden { display: none !important; }
          .sticky { position: static !important; }
          .bg-card, .bg-background, .bg-muted, .bg-muted\\/30, .bg-muted\\/20 { background: white !important; }
          .border, .border-border, .border-border\\/60 { border-color: #ddd !important; }
          .shadow-lg, .shadow-xl, .shadow-sm, .shadow-md { box-shadow: none !important; }
          .text-muted-foreground { color: #555 !important; }
          .text-primary { color: #b45309 !important; }
          main { padding-top: 0 !important; }
          section { page-break-inside: avoid; margin-bottom: 1.5rem !important; }
          h1, h2, h3 { page-break-after: avoid; }
          .bg-gradient-to-b, .bg-gradient-to-br { background: white !important; }
          .rounded-3xl, .rounded-2xl, .rounded-xl { border-radius: 8px !important; }
          button, [role="button"] { display: none !important; }
          a { color: #b45309 !important; text-decoration: underline; }
          @page { margin: 1.5cm; size: A4 portrait; }
        }
      `}} />
      {/* Header */}
      <header className="w-full bg-card border-b border-border sticky top-14 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/profile?tab=overview">
              <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground gap-1.5 print:hidden">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                Overview
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-muted-foreground hover:text-foreground gap-1.5 print:hidden"
              onClick={() => { localStorage.removeItem("resilium_plan_onboarded_v1"); setShowOnboarding(true); }}
              title="Show plan guide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4M12 8h.01"/></svg>
              Help
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-muted-foreground hover:text-foreground gap-1.5 print:hidden"
              onClick={handleMarkdownExport}
              title="Export as Markdown"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Markdown
            </Button>
            <Link href={`/results/${reportId}`}>
              <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground gap-1.5 print:hidden">
                View Report
              </Button>
            </Link>
            <span className="w-px h-4 bg-border/60 mx-1 flex-shrink-0" aria-hidden="true" />
            <Link href="/profile?tab=plans">
              <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground gap-1.5 print:hidden">
                My Plans
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-10 space-y-10">

        {/* OFFLINE BANNER */}
        {isOfflineMode && (
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-sky-500/5 border border-sky-500/30">
            <div className="w-7 h-7 rounded-lg bg-sky-500/15 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sky-700 dark:text-sky-400">Viewing offline cache</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Can't reach the server — showing your last saved plan from your device. Checklist changes will sync when you reconnect.
              </p>
            </div>
            <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 rounded-full px-2 py-1">Pro Offline</span>
          </div>
        )}

        {/* SAVE PROMPT — anonymous users */}
        {!isAuthenticated && (
          <div className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-amber-500/5 border border-amber-500/30">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">Your plan disappears when you close this tab</p>
              <p className="text-xs text-muted-foreground mt-0.5">Create a free account to save your progress, pick up where you left off, and track improvements over time.</p>
            </div>
            <Button size="sm" className="rounded-full flex-shrink-0 bg-amber-600 hover:bg-amber-700 text-white border-0" onClick={() => openSignIn({})}>
              Save My Plan Free
            </Button>
          </div>
        )}

        {/* GOAL + PROGRESS HERO */}
        <section>
          <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
            {goalLabel && (
              <div className="flex items-center gap-3 flex-wrap w-full">
                <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2">
                  <span className="text-lg">{goalIcon}</span>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary mr-2">Resilience Goal</span>
                    <span className="text-sm font-semibold text-foreground">{goalLabel}</span>
                  </div>
                </div>
                {successVision && (
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <Target className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground italic">"{successVision}"</p>
                  </div>
                )}
              </div>
            )}
            <div className="flex items-start justify-between w-full gap-4">
              <div>
                <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground">
                  {isHouseholdPlan ? "Household Action Plan" : "Your Strategic Action Plan"}
                </h1>
                {isHouseholdPlan && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {hc?.adults != null && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">{hc.adults} adult{hc.adults !== 1 ? "s" : ""}</span>
                    )}
                    {hc?.hasMinors && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-500">Minors in household</span>
                    )}
                    {hc?.hasMobilityLimitation && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500">Mobility flag</span>
                    )}
                    {hc?.hasMultipleIncomes && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">Multiple incomes</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                <Link href={`/results/${reportId}`}>
                  <Button variant="outline" size="sm" className="rounded-full gap-1.5 text-muted-foreground">
                    Score: {report.score?.overall != null ? Math.round(report.score.overall) : "--"}/100
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Progress milestones */}
          {totalItems > 0 && (
            <div className="bg-card rounded-3xl border border-border p-6 shadow-lg shadow-black/5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-base">Progress</p>
                    {streak >= 2 && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                        🔥 {streak}-day streak
                      </span>
                    )}
                  </div>
                  {milestone && (
                    <p className="text-xs text-muted-foreground mt-0.5">{milestone.icon} {milestone.label}</p>
                  )}
                </div>
                <span className="font-bold text-xl text-primary">{overallPercent}%</span>
              </div>
              <Progress value={overallPercent} className="h-3 mb-5" />
              <div className="grid grid-cols-4 gap-2">
                {MILESTONE_MARKERS.map(m => {
                  const achieved = overallPercent >= m.percent;
                  return (
                    <div key={m.percent} className={cn(
                      "rounded-2xl p-3 text-center border transition-all",
                      achieved ? "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-900/30" : "border-border bg-muted/20"
                    )}>
                      <div className="text-xl mb-1">{m.icon}</div>
                      <p className="text-[10px] font-bold">{m.percent}%</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">{m.label}</p>
                    </div>
                  );
                })}
              </div>
              {totalRemaining > 0 && (
                <p className="text-xs text-muted-foreground mt-4">{totalDone} of {totalItems} actions completed · {totalRemaining} remaining</p>
              )}
              {totalRemaining === 0 && totalItems > 0 && (
                <p className="text-xs font-bold text-emerald-600 mt-4">✓ All actions completed — consider retaking the assessment to track your improvement.</p>
              )}
            </div>
          )}
        </section>


        {/* ONE THING RIGHT NOW + TOP 3 THIS WEEK — side by side */}
        {(oneThingNow && totalDone < totalItems) || top3Items.length > 0 ? (
          <div className={cn(
            "grid gap-4",
            oneThingNow && totalDone < totalItems && top3Items.length > 0
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1"
          )}>
            {/* ONE THING RIGHT NOW */}
            {oneThingNow && totalDone < totalItems && (
              <div className="bg-card rounded-3xl border border-primary/30 p-6 shadow-lg shadow-black/5 relative overflow-hidden flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                <div className="relative flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-primary">One thing right now</p>
                  </div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{oneThingNow.area}</p>
                  <h3 className="font-display font-bold text-lg text-foreground mb-2 leading-snug">{oneThingNow.item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{oneThingNow.item.description}</p>
                  <button
                    type="button"
                    onClick={() => handleChecklistToggle(oneThingNow!.area, oneThingNow!.item.id, false)}
                    className="flex items-center gap-2 text-sm font-semibold rounded-full px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors w-fit"
                  >
                    <Check className="w-4 h-4" />
                    Mark as done
                  </button>
                </div>
              </div>
            )}

            {/* TOP 3 THIS WEEK */}
            {top3Items.length > 0 && (
              <div className="bg-zinc-50 rounded-3xl border border-slate-200 p-6 shadow-lg shadow-black/5 flex flex-col">
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-xl bg-primary/15 flex items-center justify-center">
                      <Target className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-primary">Start here</p>
                  </div>
                  <h2 className="font-display font-bold text-xl mb-4 text-gray-900">Your top {top3Items.length} this week</h2>
                  <div className="space-y-2.5 flex-1">
                    {top3Items.map(({ area, item }) => {
                      const key = `${area}::${item.id}`;
                      const completed = progressMap[key] ?? false;
                      const top3PriorityConfig: Record<string, { label: string; className: string }> = {
                        critical: { label: "Critical", className: "bg-red-100 text-red-700 border-red-300" },
                        high: { label: "High", className: "bg-amber-100 text-amber-700 border-amber-300" },
                        medium: { label: "Medium", className: "bg-sky-100 text-sky-700 border-sky-300" },
                        low: { label: "Low", className: "bg-orange-50 text-orange-700 border-orange-200" },
                      };
                      const priorityConfig = top3PriorityConfig[item.priority] ?? top3PriorityConfig.medium;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleChecklistToggle(area, item.id, completed)}
                          className={cn(
                            "flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all select-none",
                            completed
                              ? "border-emerald-300 bg-emerald-50 opacity-70"
                              : "border-slate-200 bg-white hover:border-primary/40 hover:bg-orange-50/40"
                          )}
                        >
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all",
                            completed ? "border-emerald-500 bg-emerald-500" : "border-gray-300"
                          )}>
                            {completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn("font-semibold text-sm leading-snug mb-1.5", completed ? "line-through text-emerald-600/60 decoration-emerald-600/40" : "text-gray-900")}>
                              {item.title}
                            </p>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={cn("text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border", priorityConfig.className)}>
                                {priorityConfig.label}
                              </span>
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border bg-gray-100 text-gray-500 border-gray-200">
                                {AREA_LABELS[area] ?? area}
                              </span>
                            </div>
                          </div>
                          {completed && (
                            <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                              Done
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
                    Tap any item to mark it done. Your progress syncs across devices.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* DAILY HABITS */}
        {dailyHabits && dailyHabits.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display font-bold text-2xl">Daily Habits</h2>
                <p className="text-muted-foreground text-sm">
                  AI-recommended habits based on your results. Build them one at a time — consistency beats quantity.
                </p>
              </div>
            </div>
            <div className="bg-card rounded-3xl border border-border shadow-lg shadow-black/5 overflow-hidden">
              <div className="divide-y divide-border/60">
                {(habitsExpanded ? dailyHabits : dailyHabits.slice(0, 2)).map((habit, i) => {
                  const freqConfig = FREQ_CONFIG[habit.frequency] ?? FREQ_CONFIG["daily"];
                  const isFirst2 = i < 2;
                  return (
                    <div
                      key={i}
                      className={cn("flex items-start gap-4 px-5 py-4 transition-colors", isFirst2 && "bg-primary/5")}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-sm",
                        isFirst2 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-snug text-foreground">{habit.habit}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border", freqConfig.className)}>
                            {freqConfig.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{habit.category}</span>
                        </div>
                      </div>
                      {isFirst2 && (
                        <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5 mt-0.5">
                          This week
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              {dailyHabits.length > 2 && (
                <div className="px-5 py-3.5 border-t border-border bg-muted/20">
                  <button
                    type="button"
                    onClick={() => setHabitsExpanded(e => !e)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    {habitsExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Show fewer habits
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        See all {dailyHabits.length} habits
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* THREE HORIZON SECTIONS */}
        <section className="space-y-4">
          <Accordion type="multiple" defaultValue={[]} className="space-y-4">
            {horizons.map(horizon => {
              const doneInHorizon = horizon.items.filter(({ area, item }) => progressMap[`${area}::${item.id}`]).length;
              const Icon = horizon.icon;
              return (
                <AccordionItem
                  key={horizon.key}
                  value={horizon.key}
                  className={cn("rounded-3xl border overflow-hidden shadow-lg shadow-black/5", horizon.bgColor)}
                >
                  <AccordionTrigger className="hover:no-underline px-6 md:px-8 py-6">
                    <div className="flex items-center gap-4 text-left w-full pr-4">
                      <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 bg-card shadow-sm")}>
                        <Icon className={cn("w-5 h-5", horizon.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display font-bold text-xl">{horizon.label}</span>
                          {horizon.items.length > 0 && (
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                              doneInHorizon === horizon.items.length ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-muted-foreground"
                            )}>
                              {doneInHorizon}/{horizon.items.length} done
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{horizon.sublabel}</p>
                        {horizon.items.length > 0 && (
                          <p className="text-xs text-muted-foreground/60 mt-1">
                            {horizon.items.length} action{horizon.items.length !== 1 ? "s" : ""} · {doneInHorizon} completed — tap to expand
                          </p>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 md:px-8 pb-8 pt-0">

                    {/* Narrative context from AI action plan */}
                    {horizon.narrativeItems.length > 0 && (
                      <div className="mb-6 space-y-3">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Strategic Focus</p>
                        {horizon.narrativeItems.slice(0, 3).map((np, i) => (
                          <div key={i} className="bg-white/90 rounded-2xl border border-slate-200 p-4 flex items-start gap-3 shadow-sm">
                            <div className={cn("w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold",
                              np.priority === "critical" ? "bg-red-500/20 text-red-600" :
                              np.priority === "high" ? "bg-amber-500/20 text-amber-600" :
                              "bg-primary/15 text-primary"
                            )}>
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="font-semibold text-sm text-gray-900">{np.title}</span>
                                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{np.category}</span>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">{np.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action items */}
                    {horizon.items.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500/50" />
                        <p className="text-sm">No actions in this timeframe yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Group by area */}
                        {Object.entries(
                          horizon.items.reduce((acc, { area, item }) => {
                            if (!acc[area]) acc[area] = [];
                            acc[area]!.push(item);
                            return acc;
                          }, {} as Record<string, ChecklistItem[]>)
                        ).map(([area, items]) => {
                          const AreaIcon = AREA_ICONS[area] ?? Shield;
                          const areaColor = AREA_COLORS[area] ?? "text-primary bg-primary/10";
                          const resources = AREA_RESOURCES[area] ?? [];
                          return (
                            <div key={area}>
                              <div className="flex items-center gap-2 mb-3 flex-wrap">
                                <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0", areaColor)}>
                                  <AreaIcon className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{AREA_LABELS[area] ?? area}</span>
                                {isHouseholdPlan && area === "mobility" && hc?.hasMobilityLimitation && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600">Mobility limitation in household</span>
                                )}
                                {isHouseholdPlan && area === "financial" && hc?.hasMultipleIncomes && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">Multiple income sources</span>
                                )}
                                {isHouseholdPlan && area === "health" && hc?.hasMinors && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600">Minors in household</span>
                                )}
                              </div>
                              <div className="space-y-3 pl-1">
                                {items.map(item => {
                                  const key = `${area}::${item.id}`;
                                  const completed = progressMap[key] ?? false;
                                  const isExpanded = showExpandPanel[key] ?? false;
                                  const isLoadingExpand = loadingSteps[key] ?? false;
                                  const subSteps = expandedSteps[key];
                                  const priorityConfig = PRIORITY_CONFIG[item.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.medium;
                                  const isCoachingArea = COACHING_AREAS.has(area);

                                  return (
                                    <div
                                      key={item.id}
                                      className={cn(
                                        "rounded-2xl border transition-all overflow-hidden shadow-sm",
                                        completed
                                          ? "border-emerald-300/80 bg-emerald-50/70 dark:bg-emerald-900/10 dark:border-emerald-800/40"
                                          : "border-slate-200 bg-white/90"
                                      )}
                                    >
                                      {/* Main item row */}
                                      <div
                                        className="flex items-start gap-3 p-4 cursor-pointer transition-colors"
                                        onClick={() => handleChecklistToggle(area, item.id, completed)}
                                      >
                                        <div className={cn(
                                          "w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all",
                                          completed ? "border-emerald-500 bg-emerald-500" : "border-muted-foreground/60"
                                        )}>
                                          {completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                            {completed ? (
                                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-emerald-500/15 text-emerald-700 border-emerald-500/25">
                                                ✓ Done
                                              </span>
                                            ) : (
                                              <span className={cn("text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border", priorityConfig.className)}>
                                                {priorityConfig.label}
                                              </span>
                                            )}
                                            <span className={cn(
                                              "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full",
                                              item.pathway === "growth" ? "bg-emerald-500/15 text-emerald-700" : "bg-amber-500/15 text-amber-700"
                                            )}>
                                              {item.pathway === "growth" ? "Growth" : "Foundation"}
                                            </span>
                                          </div>
                                          <h4 className={cn("font-bold text-sm leading-snug", completed ? "line-through text-emerald-600/60 decoration-emerald-600/40" : "text-foreground")}>
                                            {item.title}
                                          </h4>
                                          <p className={cn("text-xs mt-0.5 leading-relaxed", completed ? "text-muted-foreground/60" : "text-muted-foreground")}>{item.description}</p>
                                        </div>
                                      </div>

                                      {/* Action row: AI steps + coaching */}
                                      <div className={cn("px-4 pb-3 flex items-center flex-wrap gap-2", completed && "opacity-40 pointer-events-none")}>
                                        {/* Break it down */}
                                        {isPro || freeBreakdownsLeft > 0 ? (
                                          <button
                                            type="button"
                                            onClick={() => fetchGuidedSteps(area, item)}
                                            className={cn(
                                              "flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 border transition-all",
                                              isExpanded
                                                ? "border-primary/40 bg-primary/5 text-primary"
                                                : "border-gray-300 text-gray-500 hover:border-primary/40 hover:text-primary"
                                            )}
                                          >
                                            {isLoadingExpand ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                            {isLoadingExpand ? "Generating steps…" : isExpanded ? "Hide steps" : "Break it down"}
                                            {!isLoadingExpand && (isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                            {!isPro && !isLoadingExpand && !isExpanded && (
                                              <span className="ml-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                                                {freeBreakdownsLeft} free
                                              </span>
                                            )}
                                          </button>
                                        ) : (
                                          <Link href="/pricing">
                                            <button
                                              type="button"
                                              className="flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 border border-gray-300 text-gray-500 hover:border-primary/40 hover:text-primary transition-all"
                                            >
                                              <Lock className="w-3 h-3" />
                                              Break it down — unlock Pro
                                            </button>
                                          </Link>
                                        )}

                                        {/* Coaching CTA — Pro only, mental/health areas only */}
                                        {isCoachingArea && isPro && (
                                          <a
                                            href="https://resilium-platform.com/coaching"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 border border-rose-300/40 text-rose-600 hover:bg-rose-500/5 transition-all"
                                          >
                                            <Heart className="w-3 h-3" />
                                            Talk to a coach
                                          </a>
                                        )}
                                        {isCoachingArea && !isPro && (
                                          <Link href="/pricing">
                                            <button
                                              type="button"
                                              className="flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 border border-rose-300/20 text-rose-400/60 hover:border-rose-400/40 hover:text-rose-500 transition-all"
                                            >
                                              <Heart className="w-3 h-3" />
                                              Coaching — unlock Pro
                                            </button>
                                          </Link>
                                        )}
                                      </div>

                                      {/* AI sub-steps panel */}
                                      {isExpanded && (
                                        <div className="px-4 pb-5 border-t border-gray-200 pt-4">
                                          {isLoadingExpand ? (
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                              <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                              Generating personalized steps for your profile…
                                            </div>
                                          ) : subSteps && subSteps.length > 0 ? (
                                            <div>
                                              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Step-by-step guidance</p>
                                              <ol className="space-y-3">
                                                {subSteps.map((step, i) => (
                                                  <li key={i} className="flex items-start gap-3 text-sm">
                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                                                      {i + 1}
                                                    </span>
                                                    <span className="text-gray-800 leading-snug">{step}</span>
                                                  </li>
                                                ))}
                                              </ol>
                                            </div>
                                          ) : subSteps && subSteps.length === 0 ? (
                                            <p className="text-sm text-gray-500">Could not generate steps — please try again.</p>
                                          ) : null}
                                        </div>
                                      )}

                                      {/* Resources */}
                                      {resources.length > 0 && (
                                        <div className="px-4 pb-4 border-t border-gray-200 pt-3">
                                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Resources</p>
                                          <div className="flex flex-wrap gap-2">
                                            {resources.map(r => (
                                              <a
                                                key={r.title}
                                                href={r.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title={r.desc}
                                                className="flex items-center gap-1.5 text-xs rounded-full px-3 py-1 border border-slate-300 bg-slate-100 text-slate-700 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all"
                                              >
                                                <BookOpen className="w-3 h-3 flex-shrink-0" />
                                                {r.title}
                                                <span className="text-[9px] opacity-60">{r.badge}</span>
                                              </a>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </section>

        {/* STRESS TEST SCENARIOS */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6 text-primary" />
            <div>
              <h2 className="font-display font-bold text-2xl">Scenario Stress-Tests</h2>
              <p className="text-muted-foreground text-sm">See how your resilience holds up when a real disruption hits.</p>
            </div>
          </div>

          {scenarioSimulations && scenarioSimulations.length > 0 && (
            <Accordion type="single" collapsible className="space-y-3 mb-4">
              {scenarioSimulations.map((scenario, idx) => (
                <AccordionItem
                  key={idx}
                  value={`scenario-${idx}`}
                  className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
                >
                  <AccordionTrigger className="hover:no-underline px-5 py-4">
                    <div className="flex items-center gap-3 text-left w-full pr-4">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex-shrink-0",
                        scenario.impact === "severe" ? "bg-destructive/10 text-destructive" :
                        scenario.impact === "high" ? "bg-amber-500/10 text-amber-700" :
                        "bg-emerald-500/10 text-emerald-700"
                      )}>
                        {scenario.impact}
                      </span>
                      <span className="font-bold text-base">{scenario.scenario}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-5 pt-0">
                    <div className="pt-4 border-t border-border space-y-4">
                      <p className="text-muted-foreground text-sm leading-relaxed">{scenario.description}</p>
                      {scenario.immediateSteps && scenario.immediateSteps.length > 0 && (
                        <div className="bg-muted/30 rounded-xl p-4">
                          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Immediate survival steps</p>
                          <ul className="space-y-1.5">
                            {scenario.immediateSteps.map((step, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <ChevronRight className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {scenario.timeToRecover && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">Estimated recovery: </span>{scenario.timeToRecover}
                        </p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}

          {isPro ? (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">Run a scenario stress test</p>
                <p className="text-xs text-muted-foreground mt-0.5">Choose a crisis — job loss, health emergency, natural disaster, or relocation — and get AI-generated delta scores, gap areas, and tailored immediate actions.</p>
              </div>
              <Link href={`/scenarios/${reportId}`}>
                <Button size="sm" className="rounded-full gap-1.5 shrink-0">
                  <Activity className="w-3.5 h-3.5" /> Run Stress Test
                </Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pro feature</p>
                </div>
                <p className="font-bold text-base mb-1">What happens to your plan if a crisis hits?</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Pick a scenario, and Resilium calculates how your score changes, which gaps become critical, and what your first 72 hours should look like — before the crisis happens.
                </p>
              </div>
              <div className="border-t border-border divide-y divide-border/60 select-none">
                {[
                  { icon: "💼", label: "Job Loss", sub: "You lose your primary income source unexpectedly", badge: "High impact" },
                  { icon: "🏥", label: "Health Emergency", sub: "A sudden illness or injury disrupts your life for months", badge: "Severe" },
                  { icon: "🌍", label: "Forced Relocation", sub: "You need to move country or city within weeks", badge: "High impact" },
                  { icon: "⛈️", label: "Natural Disaster", sub: "A local disaster disrupts infrastructure and supply chains", badge: "Variable" },
                ].map(({ icon, label, sub, badge }) => (
                  <div key={label} className="flex items-center gap-4 px-5 py-3.5 blur-[2px] pointer-events-none opacity-60">
                    <span className="text-2xl flex-shrink-0">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{label}</p>
                      <p className="text-xs text-muted-foreground truncate">{sub}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-amber-600 bg-amber-500/10 rounded-full px-2 py-0.5 flex-shrink-0">{badge}</span>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <p className="text-sm text-muted-foreground flex-1">Unlock scenario stress-tests and unlimited reassessments with Pro.</p>
                <Link href="/pricing">
                  <Button size="sm" className="rounded-full gap-1.5 shrink-0 shadow-md shadow-primary/20">
                    <Zap className="w-3.5 h-3.5" /> Unlock with Pro
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </section>


        {/* COMMUNITY SUPPORT RESOURCES */}
        {showCommunitySupport && communityResources.length > 0 && (
          <section>
            <div className="rounded-3xl border border-sky-500/20 bg-sky-500/5 p-6 shadow-lg shadow-black/5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-xl bg-sky-500/15 flex items-center justify-center">
                  <Heart className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-sky-400">Support available now</p>
              </div>
              <h2 className="font-display font-bold text-xl mb-1 text-foreground">Community support resources</h2>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                Based on your situation, these programs may help right now — before tackling the longer-term plan. All are free or low-cost.
              </p>
              <div className="space-y-2.5">
                {communityResources.map((r, i) => (
                  <a
                    key={i}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => { e.stopPropagation(); window.open(r.url, "_blank", "noopener,noreferrer"); e.preventDefault(); }}
                    className="flex items-start gap-3 p-4 rounded-2xl border border-border/50 bg-card/60 hover:border-sky-400/30 hover:bg-sky-500/8 transition-all no-underline group cursor-pointer"
                  >
                    <span className="text-xl flex-shrink-0 mt-0.5">{r.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-semibold text-sm text-foreground group-hover:text-sky-400 transition-colors">{r.title}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/25">{r.badge}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{r.desc}</p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-1 opacity-0 group-hover:opacity-60 transition-opacity" />
                  </a>
                ))}
              </div>
              {reportLocation && (
                <LocalAISuggestions
                  location={reportLocation}
                  isAuthenticated={isAuthenticated}
                  getToken={getToken}
                />
              )}
            </div>
          </section>
        )}

        {/* BACK TO REPORT */}
        <section className="pb-4 text-center">
          <Link href={`/results/${reportId}`}>
            <Button variant="ghost" className="rounded-full text-muted-foreground gap-2">
              ← Back to full assessment report
            </Button>
          </Link>
        </section>

      </main>

      {/* Floating progress pill */}
      {totalRemaining > 0 && (
        <div className="fixed bottom-6 right-6 z-40 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 bg-card border border-border shadow-2xl shadow-black/30 rounded-2xl px-4 py-3">
            <div className="relative w-10 h-10 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/40" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3"
                  strokeDasharray={`${(overallPercent / 100) * 87.96} 87.96`}
                  strokeLinecap="round" className="text-primary transition-all duration-500" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-primary">
                {overallPercent}%
              </span>
            </div>
            <div className="text-left pr-1">
              <p className="text-xs font-bold text-foreground leading-tight">{totalRemaining} action{totalRemaining !== 1 ? "s" : ""} left</p>
              <p className="text-[10px] text-muted-foreground">Scroll to continue →</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 pb-6 print:hidden">
        <p className="text-xs text-muted-foreground border border-border/40 rounded-2xl px-5 py-3 bg-muted/20 leading-relaxed">
          <span className="font-semibold text-foreground">Resource disclaimer:</span> All linked resources are provided for informational purposes only. Resilium has no affiliation with or financial interest in any of these sites unless explicitly stated. Use at your own discretion.
        </p>
      </div>

      <SiteFooter />
    </div>
  );
}
