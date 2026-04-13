import React, { useState, useCallback, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { NoIndexPage } from "@/components/page-seo";
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
    { title: "FEMA Financial Preparedness", desc: "Build financial resilience for emergencies and unexpected events.", url: "https://www.fema.gov/emergency-managers/individuals-communities/prepare-financially", badge: "Gov · Free" },
  ],
  health: [
    { title: "HealthCare.gov", desc: "Find health insurance options and enrollment periods in the U.S.", url: "https://www.healthcare.gov", badge: "Gov · Free" },
    { title: "CDC Emergency Preparedness", desc: "Health and medical preparedness resources for individuals and families.", url: "https://www.cdc.gov/niosh/topics/emres/", badge: "Gov · Free" },
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
    { title: "Rețeaua Rurală Națională — Granturi", desc: "Fonduri europene pentru proiecte de reziliență comunitară și economică.", url: "https://www.rndr.ro", badge: "Fonduri EU" },
  ],
  health: [
    { title: "Casa Națională de Asigurări de Sănătate (CNAS)", desc: "Drepturi, asigurări și servicii medicale în sistemul național de sănătate.", url: "https://www.cnas.ro", badge: "Gov · Gratuit" },
    { title: "DSP — Direcțiile de Sănătate Publică", desc: "Pregătire pentru urgențe de sănătate publică și ghiduri locale de sănătate.", url: "https://www.dsp.ro", badge: "Gov · Gratuit" },
    { title: "Federația Română de Prim Ajutor", desc: "Cursuri de prim ajutor și pregătire pentru situații de urgență.", url: "https://www.frpa.ro", badge: "ONG · Cursuri" },
  ],
  skills: [
    { title: "Coursera (Reziliență & Adaptabilitate)", desc: "Cursuri certificate de universități de top despre reziliență, leadership și gestionarea crizelor.", url: "https://www.coursera.org/search?query=resilience", badge: "Cursuri" },
    { title: "LinkedIn Learning", desc: "Abilități practice pentru reconversie profesională și reziliență profesională.", url: "https://www.linkedin.com/learning", badge: "Skills" },
    { title: "e-România — Servicii Digitale", desc: "Portal guvernamental pentru servicii publice digitale și automatizare.", url: "https://www.e-guvernare.ro", badge: "Gov · Gratuit" },
  ],
  mobility: [
    { title: "MAE — Sfaturi de Călătorie", desc: "Avertizări și sfaturi oficiale ale Ministerului Afacerilor Externe pentru călătorii în străinătate.", url: "https://www.mae.ro/travel-conditions", badge: "Gov · Gratuit" },
    { title: "Numbeo — Calitatea Vieții în România", desc: "Compară costul vieții, siguranța și calitatea vieții în orașe din România și din lume.", url: "https://www.numbeo.com/quality-of-life/country_result.jsp?country=Romania", badge: "Instrument Gratuit" },
    { title: "Schengen Info — Vize & Mobilitate", desc: "Ghid complet despre drepturile de mobilitate în spațiul Schengen și UE.", url: "https://www.schengenvisainfo.com", badge: "Ghid" },
  ],
  psychological: [
    { title: "Asociația pentru Sănătate Mintală România", desc: "Sprijin pentru sănătate mintală, resurse de auto-evaluare și suport comunitar.", url: "https://www.asocialromana.ro", badge: "ONG" },
    { title: "Mindfulness-Based Stress Reduction (MBSR)", desc: "Program de 8 săptămâni bazat pe dovezi pentru gestionarea stresului și reziliență psihologică.", url: "https://www.umassmed.edu/cfm/mindfulness-based-programs/mbsr-courses/", badge: "Program" },
    { title: "Pagina de Psihologie", desc: "Resurse de psihologie, articole și ghiduri de sănătate mintală în limba română.", url: "https://www.paginadepsihologie.ro", badge: "Resurse" },
  ],
  resources: [
    { title: "IGSU — Inspectoratul General pentru Situații de Urgență", desc: "Ghid oficial de pregătire pentru urgențe, dezastre naturale și situații de criză în România.", url: "https://www.igsu.ro/informatii-publice/pregatirea-populatiei", badge: "Gov · Gratuit" },
    { title: "Crucea Roșie Română", desc: "Cursuri de prim ajutor, pregătire pentru dezastre și rețea de răspuns în situații de urgență.", url: "https://www.crucearosie.ro", badge: "ONG" },
    { title: "Ro-Alert — Sistemul de Avertizare", desc: "Sistemul național de alertare în caz de dezastre și situații de urgență.", url: "https://www.sts.ro/ro/ro-alert", badge: "Gov · Gratuit" },
  ],
  socialCapital: [
    { title: "VoluntariatRomania.ro", desc: "Găsește oportunități de voluntariat și proiecte de construire comunitară din toată România.", url: "https://www.voluntariatsibiu.ro", badge: "Comunitate" },
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
    { title: "WHO — Emergency Preparedness", desc: "World Health Organization health emergency preparedness resources.", url: "https://www.who.int/health-topics/emergency-preparedness", badge: "Intl · Free" },
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
    { title: "UN OCHA — Emergency Preparedness", desc: "United Nations emergency preparedness guidelines and international crisis resources.", url: "https://www.unocha.org/themes/emergency-response", badge: "Intl · Free" },
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

export default function PlanPage() {
  const [, params] = useRoute("/plan/:reportId");
  const reportId = params?.reportId || "";
  const { toast } = useToast();
  const { isSignedIn } = useAuth();
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

  const { data: report, isLoading, error } = useGetReport(reportId, {
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
    } catch {
      setExpandedSteps(prev => ({ ...prev, [key]: [] }));
    } finally {
      setLoadingSteps(prev => ({ ...prev, [key]: false }));
    }
  }, [reportId, expandedSteps, loadingSteps]);

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

  if (error || !report) {
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
            <Link href="/profile">
              <Button variant="outline" size="sm" className="rounded-full gap-1.5 print:hidden">
                My Plans
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-10 space-y-10">

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

        {/* THREE HORIZON SECTIONS */}
        <section className="space-y-4">
          <Accordion type="multiple" defaultValue={["short"]} className="space-y-4">
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
                                        "rounded-2xl border bg-white/90 transition-all overflow-hidden shadow-sm",
                                        completed ? "border-emerald-300 bg-emerald-50/40" : "border-slate-200"
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
                                            <span className={cn("text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border", priorityConfig.className)}>
                                              {priorityConfig.label}
                                            </span>
                                            <span className={cn(
                                              "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full",
                                              item.pathway === "growth" ? "bg-emerald-500/15 text-emerald-700" : "bg-amber-500/15 text-amber-700"
                                            )}>
                                              {item.pathway === "growth" ? "Growth" : "Foundation"}
                                            </span>
                                          </div>
                                          <h4 className={cn("font-bold text-sm leading-snug text-gray-900", completed && "line-through text-gray-400")}>
                                            {item.title}
                                          </h4>
                                          <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{item.description}</p>
                                        </div>
                                      </div>

                                      {/* Action row: AI steps + coaching */}
                                      <div className="px-4 pb-3 flex items-center flex-wrap gap-2">
                                        {/* Break it down */}
                                        {isPro ? (
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

        {/* COACHING CALLOUT — score-aware, only surfaces when relevant */}
        {(() => {
          const psychScore = Math.round((report as any).score?.psychological ?? 100);
          const healthScore = Math.round((report as any).score?.health ?? 100);
          const lowestScore = Math.min(psychScore, healthScore);
          if (lowestScore >= 70) return null;
          const isPsych = psychScore <= healthScore;
          const dimensionName = isPsych ? "Psychological Resilience" : "Health Continuity";
          const contextLine = isPsych
            ? `Your Psychological Resilience scored ${psychScore}/100. Progress here is less linear than logistics — habits of mind, stress tolerance, and adaptive thinking develop differently than stockpiling supplies or building savings. Most people find a thinking partner makes the difference.`
            : `Your Health Continuity scored ${healthScore}/100. Planning around health risks is personal and often requires guidance that a checklist can't fully replace — especially when chronic conditions, dependents, or healthcare access are in the picture.`;
          const scoreColor = lowestScore < 40 ? "text-destructive" : lowestScore < 55 ? "text-amber-600" : "text-foreground";
          return (
            <section className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">Optional — Phoenix Insight Coaching</p>
                  <h3 className="font-display font-bold text-lg mb-2">
                    Your {dimensionName} is where a real person helps most.
                  </h3>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className={cn("text-3xl font-bold font-display", scoreColor)}>{lowestScore}</span>
                    <span className="text-sm text-muted-foreground">/100 — {dimensionName}</span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4 max-w-xl">
                    {contextLine} Cristiana Paun at Phoenix Insight Coaching works directly from your Resilium profile. The first call is free, no commitment.
                  </p>
                  <Link href="/coaching">
                    <Button className="rounded-full gap-2 bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20">
                      <Heart className="w-4 h-4" /> Learn About Coaching
                    </Button>
                  </Link>
                </div>
              </div>
            </section>
          );
        })()}

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
