import React, { useState, useCallback, useEffect } from "react";
import { useRoute, Link } from "wouter";
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
  Loader2, AlertTriangle, CheckCircle, ChevronDown, ChevronUp,
  Sparkles, Lock, Heart, ExternalLink, Target, ArrowRight,
  TrendingUp, Clock, Star, Activity, Brain, Shield, BookOpen,
  Globe, Zap, DollarSign, Stethoscope, MapPin, Award, ChevronRight,
} from "lucide-react";
import { ResilientIcon } from "@/components/resilient-icon";
import { SiteFooter } from "@/components/site-footer";
import { useToast } from "@/hooks/use-toast";
import { useUser, useAuth, useClerk } from "@clerk/react";
import { cn } from "@/lib/utils";
import type { ChecklistItem } from "@workspace/api-client-react/src/generated/api.schemas";

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
  financial: "text-emerald-700 bg-emerald-500/10",
  health: "text-blue-700 bg-blue-500/10",
  skills: "text-violet-700 bg-violet-500/10",
  mobility: "text-amber-700 bg-amber-500/10",
  psychological: "text-rose-700 bg-rose-500/10",
  resources: "text-orange-700 bg-orange-500/10",
  socialCapital: "text-teal-700 bg-teal-500/10",
};

const PRIORITY_CONFIG = {
  critical: { label: "Critical", className: "bg-destructive/10 text-destructive border-destructive/20" },
  high: { label: "High", className: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
  medium: { label: "Medium", className: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
  low: { label: "Low", className: "bg-primary/10 text-primary border-primary/20" },
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

const AREA_RESOURCES: Record<string, Array<{ title: string; desc: string; url: string; badge: string }>> = {
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

export default function PlanPage() {
  const [, params] = useRoute("/plan/:reportId");
  const reportId = params?.reportId || "";
  const { toast } = useToast();
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const isAuthenticated = !!isSignedIn;

  const { data: report, isLoading, error } = useGetReport(reportId, {
    query: { enabled: !!reportId, retry: (n, e: any) => (e?.response?.status ?? e?.status) !== 404 && n < 2 },
  });

  const { data: checklistData, refetch: refetchChecklist } = useGetChecklists(reportId, {
    query: { enabled: !!reportId },
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
      bgColor: "bg-destructive/5 border-destructive/20",
      narrativeItems: actionPlan?.shortTerm ?? [],
      items: itemsByHorizon.short,
    },
    {
      key: "mid" as const,
      label: "3–6 Months",
      sublabel: "High-priority habits and infrastructure to build",
      icon: TrendingUp,
      color: "text-amber-600",
      bgColor: "bg-amber-500/5 border-amber-500/20",
      narrativeItems: actionPlan?.midTerm ?? [],
      items: itemsByHorizon.mid,
    },
    {
      key: "long" as const,
      label: "Long-term",
      sublabel: "Sustained resilience — your durable foundation",
      icon: Star,
      color: "text-primary",
      bgColor: "bg-primary/5 border-primary/20",
      narrativeItems: actionPlan?.longTerm ?? [],
      items: itemsByHorizon.long,
    },
  ];

  return (
    <div className="min-h-screen pb-24">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          header, .print\\:hidden { display: none !important; }
          body { background: white !important; color: black !important; }
          .bg-card, .bg-background, .bg-muted { background: white !important; }
          .border { border-color: #ddd !important; }
          .text-muted-foreground { color: #555 !important; }
          .text-primary { color: #c05c18 !important; }
          .sticky { position: static !important; }
          main { padding-top: 0 !important; }
          @page { margin: 1.5cm; size: A4; }
        }
      `}} />
      {/* Header */}
      <header className="w-full bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/">
            <div className="font-display font-bold text-xl text-primary flex items-center gap-2 cursor-pointer">
              <ResilientIcon className="w-5 h-5" /> Resilium
            </div>
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-muted-foreground hover:text-foreground gap-1.5 print:hidden"
              onClick={() => window.print()}
              title="Save as PDF"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Save PDF
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
          <div className="flex flex-wrap items-start gap-4 mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Strategic Action Plan</p>
              <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground">
                {goalLabel ? (
                  <span className="flex items-center gap-2">
                    <span className="text-2xl">{goalIcon}</span>
                    {goalLabel}
                  </span>
                ) : "Your Resilience Plan"}
              </h1>
              {successVision && (
                <p className="text-muted-foreground mt-2 text-sm max-w-xl italic">
                  "{successVision}"
                </p>
              )}
            </div>
            <div className="ml-auto flex items-center gap-2 flex-shrink-0">
              <Link href={`/results/${reportId}`}>
                <Button variant="outline" size="sm" className="rounded-full gap-1.5 text-muted-foreground">
                  Score: {Math.round(report.score.overall)}/100
                </Button>
              </Link>
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
                      achieved ? "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-900/30" : "border-border bg-muted/20 opacity-40"
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
                              doneInHorizon === horizon.items.length ? "bg-emerald-500/20 text-emerald-700" : "bg-muted text-muted-foreground"
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
                          <div key={i} className="bg-card rounded-2xl border border-border/60 p-4 flex items-start gap-3">
                            <div className={cn("w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold",
                              np.priority === "critical" ? "bg-destructive/10 text-destructive" :
                              np.priority === "high" ? "bg-amber-500/10 text-amber-700" :
                              "bg-primary/10 text-primary"
                            )}>
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="font-semibold text-sm">{np.title}</span>
                                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{np.category}</span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">{np.description}</p>
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
                              <div className="flex items-center gap-2 mb-3">
                                <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0", areaColor)}>
                                  <AreaIcon className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{AREA_LABELS[area] ?? area}</span>
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
                                        "rounded-2xl border bg-card transition-all overflow-hidden",
                                        completed ? "border-emerald-200 dark:border-emerald-900/30" : "border-border/60"
                                      )}
                                    >
                                      {/* Main item row */}
                                      <div
                                        className="flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/20 transition-colors"
                                        onClick={() => handleChecklistToggle(area, item.id, completed)}
                                      >
                                        <div className={cn(
                                          "w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all",
                                          completed ? "border-emerald-500 bg-emerald-500" : "border-muted-foreground/40"
                                        )}>
                                          {completed && <CheckCircle className="w-3 h-3 text-white" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                            <span className={cn("text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border", priorityConfig.className)}>
                                              {priorityConfig.label}
                                            </span>
                                            <span className={cn(
                                              "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full",
                                              item.pathway === "growth" ? "bg-emerald-500/10 text-emerald-700" : "bg-amber-500/10 text-amber-700"
                                            )}>
                                              {item.pathway === "growth" ? "Growth" : "Foundation"}
                                            </span>
                                          </div>
                                          <h4 className={cn("font-bold text-sm leading-snug", completed && "line-through text-muted-foreground")}>
                                            {item.title}
                                          </h4>
                                          <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">{item.description}</p>
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
                                                : "border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
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
                                              className="flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 border border-border text-muted-foreground hover:border-primary/30 hover:text-primary transition-all"
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
                                        <div className="px-4 pb-5 border-t border-border/50 pt-4">
                                          {isLoadingExpand ? (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                              <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                              Generating personalized steps for your profile…
                                            </div>
                                          ) : subSteps && subSteps.length > 0 ? (
                                            <div>
                                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Step-by-step guidance</p>
                                              <ol className="space-y-3">
                                                {subSteps.map((step, i) => (
                                                  <li key={i} className="flex items-start gap-3 text-sm">
                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                                                      {i + 1}
                                                    </span>
                                                    <span className="text-foreground leading-snug">{step}</span>
                                                  </li>
                                                ))}
                                              </ol>
                                            </div>
                                          ) : subSteps && subSteps.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">Could not generate steps — please try again.</p>
                                          ) : null}
                                        </div>
                                      )}

                                      {/* Resources */}
                                      {resources.length > 0 && (
                                        <div className="px-4 pb-4 border-t border-border/30 pt-3">
                                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Resources</p>
                                          <div className="flex flex-wrap gap-2">
                                            {resources.map(r => (
                                              <a
                                                key={r.title}
                                                href={r.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title={r.desc}
                                                className="flex items-center gap-1.5 text-xs rounded-full px-3 py-1 border border-border bg-muted/30 text-muted-foreground hover:border-primary/30 hover:text-primary transition-all"
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
        {scenarioSimulations && scenarioSimulations.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-6 h-6 text-primary" />
              <div>
                <h2 className="font-display font-bold text-2xl">Stress Test Scenarios</h2>
                <p className="text-muted-foreground text-sm">How your profile holds up against key disruptions — informing where to prioritize above.</p>
              </div>
            </div>
            <Accordion type="single" collapsible className="space-y-3">
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
            <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">Run a deeper scenario stress test</p>
                <p className="text-xs text-muted-foreground mt-0.5">Choose a specific crisis — job loss, health emergency, natural disaster, or relocating abroad — and see AI-generated delta scores with tailored actions.</p>
              </div>
              {isPro ? (
                <Link href={`/scenarios/${reportId}`}>
                  <Button size="sm" className="rounded-full gap-1.5 shrink-0"><Activity className="w-3.5 h-3.5" /> Run Stress Test</Button>
                </Link>
              ) : (
                <Link href="/pricing">
                  <Button size="sm" variant="outline" className="rounded-full gap-1.5 shrink-0"><Lock className="w-3.5 h-3.5" /> Unlock with Pro</Button>
                </Link>
              )}
            </div>
          </section>
        )}

        {/* COACHING CALLOUT — bottom of page, not in every item */}
        <section className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">Optional — Phoenix Insight Coaching</p>
              <h3 className="font-display font-bold text-lg mb-2">
                Some steps are easier with a real person.
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4 max-w-xl">
                Cristiana Paun at Phoenix Insight Coaching offers 1:1 sessions built directly around your Resilium profile — especially useful for the psychological resilience and health continuity sections where progress is less linear. The first call is free, no commitment.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/coaching">
                  <Button className="rounded-full gap-2 bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20">
                    <Heart className="w-4 h-4" /> Learn About Coaching
                  </Button>
                </Link>
                <a href="https://resilium-platform.com/coaching" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="rounded-full gap-2 border-amber-500/30 text-amber-700 hover:bg-amber-500/5">
                    <ExternalLink className="w-4 h-4" /> Book a Free Call
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

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

      <SiteFooter />
    </div>
  );
}
