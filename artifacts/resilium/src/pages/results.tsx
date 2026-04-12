import React, { useState, useCallback, useEffect, useRef } from "react";
import * as Sentry from "@sentry/react";
import { NoIndexPage } from "@/components/page-seo";
import { useRoute } from "wouter";
import { useGetReport, useGetChecklists, useUpdateChecklistItem, useGetSnapshots } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { CircularProgress } from "@/components/circular-progress";
import { RadarChartView } from "@/components/radar-chart-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Loader2, Download, Share2, AlertTriangle, Check, CheckCircle, RefreshCcw, Activity, User, LogIn, Brain, TrendingUp, Award, Star, ExternalLink, Heart, BookOpen, ShieldCheck, Zap, Package, Globe, MapPin, Lock, Mail, Sparkles, ChevronDown, ChevronUp, DollarSign, Wrench, Navigation, Home, Users, Target } from "lucide-react";
import { ResilientIcon } from "@/components/resilient-icon";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { SiteFooter } from "@/components/site-footer";
import { useUser, useAuth, useClerk } from "@clerk/react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

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

const PADDLE_CLIENT_TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN as string | undefined;
const PADDLE_DONATION_PRICE_ID = import.meta.env.VITE_PADDLE_DONATION_PRICE_ID as string | undefined;

declare global {
  interface Window { Paddle?: any; }
}

class ResultsErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string | null; componentStack: string | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, componentStack: null };
  }
  static getDerivedStateFromError(error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { hasError: true, error: msg };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ componentStack: info.componentStack ?? null });
    Sentry.captureException(error, {
      extra: {
        componentStack: info.componentStack,
        errorBoundary: "ResultsErrorBoundary",
      },
    });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <AlertTriangle className="w-16 h-16 text-destructive mb-6" />
          <h2 className="text-2xl font-display font-bold mb-2">Something Went Wrong</h2>
          <p className="text-muted-foreground max-w-md mb-4">
            There was a problem displaying your report. Please try refreshing the page.
          </p>
          {this.state.error && (
            <p className="text-xs text-muted-foreground/50 font-mono max-w-md break-all mb-4">{this.state.error}</p>
          )}
          {this.state.componentStack && (
            <details className="max-w-lg w-full text-left mb-6">
              <summary className="text-xs text-muted-foreground/50 cursor-pointer">Component stack (for debugging)</summary>
              <pre className="text-[9px] text-muted-foreground/40 font-mono whitespace-pre-wrap break-all mt-2 max-h-40 overflow-auto">{this.state.componentStack}</pre>
            </details>
          )}
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-semibold text-sm"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function FeedbackWidget({ reportId }: { reportId: string }) {
  const storageKey = `feedback_submitted_${reportId}`;
  const alreadySubmitted = typeof window !== "undefined" && localStorage.getItem(storageKey) === "true";

  const [submitted, setSubmitted] = useState(alreadySubmitted);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, rating, comment: comment.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? "Failed to submit feedback.");
        return;
      }
      localStorage.setItem(storageKey, "true");
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-none shadow-lg shadow-black/5 bg-emerald-500/5">
        <CardContent className="p-8 flex flex-col items-center text-center gap-3">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
          <h3 className="font-display font-bold text-lg">Thank you for your feedback!</h3>
          <p className="text-muted-foreground text-sm">Your rating helps us improve Resilium.</p>
        </CardContent>
      </Card>
    );
  }

  const displayRating = hovered || rating;

  return (
    <Card className="border-none shadow-lg shadow-black/5">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-xl">How was your experience?</CardTitle>
        <CardDescription>Rate your resilience report and share any thoughts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              className="p-1 transition-transform hover:scale-110 focus:outline-none"
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(star)}
              aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
            >
              <Star className={`w-8 h-8 transition-colors ${star <= displayRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
            </button>
          ))}
          {displayRating > 0 && (
            <span className="ml-3 text-sm text-muted-foreground">
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][displayRating]}
            </span>
          )}
        </div>
        <textarea
          className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50"
          rows={3}
          placeholder="Share any thoughts or suggestions (optional)..."
          value={comment}
          onChange={e => setComment(e.target.value)}
          maxLength={2000}
          disabled={loading}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button onClick={handleSubmit} disabled={rating === 0 || loading} className="rounded-full">
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {loading ? "Submitting..." : "Submit Feedback"}
        </Button>
      </CardContent>
    </Card>
  );
}
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ResilienceScore, MentalResilienceProfile, ChecklistItem } from "@workspace/api-client-react/src/generated/api.schemas";

/** Safely converts any AI-returned value to a string before rendering as a React child. */
function toStr(val: unknown): string {
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (val === null || val === undefined) return "";
  if (typeof val === "object") {
    const o = val as Record<string, unknown>;
    const probe = o["text"] ?? o["value"] ?? o["summary"] ?? o["description"] ?? o["content"] ?? o["label"] ?? o["name"];
    if (probe !== undefined) return toStr(probe);
    try { return JSON.stringify(val); } catch { return "[object]"; }
  }
  return String(val);
}

const AREA_LABELS: Record<string, string> = {
  financial: "Financial",
  health: "Health",
  skills: "Skills",
  mobility: "Mobility",
  psychological: "Psychological",
  resources: "Resources",
  socialCapital: "Social Capital",
};

const AREA_ICONS: Record<string, React.ReactNode> = {
  financial: <DollarSign className="w-4 h-4 text-amber-500" />,
  health: <Activity className="w-4 h-4 text-emerald-500" />,
  skills: <Wrench className="w-4 h-4 text-blue-400" />,
  mobility: <Navigation className="w-4 h-4 text-violet-400" />,
  psychological: <Brain className="w-4 h-4 text-rose-400" />,
  resources: <Package className="w-4 h-4 text-orange-400" />,
  socialCapital: <Users className="w-4 h-4 text-teal-500" />,
};

const PRIORITY_CONFIG = {
  critical: { label: "Critical", className: "bg-destructive/10 text-destructive" },
  high: { label: "High", className: "bg-amber-500/10 text-amber-700" },
  medium: { label: "Medium", className: "bg-blue-500/10 text-blue-700" },
  low: { label: "Low", className: "bg-primary/10 text-primary" },
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

function ResultsPageInner() {
  const [, params] = useRoute("/results/:reportId");
  const rawReportId = params?.reportId || "";
  // If the old code navigated to /results/undefined, treat as missing
  const reportId = rawReportId === "undefined" ? "" : rawReportId;
  const { toast } = useToast();
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const { openSignIn, signOut } = useClerk();
  const isAuthenticated = !!isSignedIn;
  const login = () => openSignIn({});
  const logout = () => signOut({ redirectUrl: "/" });
  const queryClient = useQueryClient();

  // ── Job recovery polling ──────────────────────────────────────────────────
  // If we land here with an invalid/missing reportId (e.g. old JS bundle got a
  // 202 and navigated to /results/undefined), check sessionStorage for a
  // pending job and redirect when it completes.
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);
  const [pendingJobError, setPendingJobError] = useState<string | null>(null);

  // Queries — declared before the effects that depend on them
  const { data: report, isLoading, error } = useGetReport(reportId, {
    query: {
      enabled: !!reportId,
      staleTime: Infinity,
      retry: (failureCount, error: any) => {
        const status = error?.response?.status ?? error?.status;
        if (status === 404) return false;
        return failureCount < 2;
      },
    }
  });

  const { data: checklistData, refetch: refetchChecklist } = useGetChecklists(reportId, {
    query: { enabled: !!reportId }
  });

  const { data: snapshotsData } = useGetSnapshots(reportId, {
    query: { enabled: !!reportId }
  });

  useEffect(() => {
    // Enter recovery mode when the URL has no valid reportId
    const jobId = sessionStorage.getItem("resilium_pending_job_v1");
    if (!jobId) return;
    if (reportId && rawReportId !== "undefined") return;
    setPendingJobId(jobId);
  }, [reportId, rawReportId]);

  useEffect(() => {
    // Also enter recovery mode when there's a fetch error and we have a pending job
    // (handles timing edge case: valid UUID in URL but report not in DB yet)
    if (!error) return;
    const jobId = sessionStorage.getItem("resilium_pending_job_v1");
    if (!jobId) return;
    setPendingJobId(jobId);
  }, [error]);

  // Polling effect for recovery
  useEffect(() => {
    if (!pendingJobId) return;
    let cancelled = false;

    const poll = async () => {
      while (!cancelled) {
        await new Promise(r => setTimeout(r, 3000));
        if (cancelled) break;
        try {
          const res = await fetch(`${BASE}/api/resilience/jobs/${pendingJobId}`, { credentials: "include" });
          if (!res.ok) continue;
          const job = await res.json();
          if (job.status === "complete" && job.reportId) {
            sessionStorage.removeItem("resilium_pending_job_v1");
            window.location.replace(`${import.meta.env.BASE_URL}results/${job.reportId}`);
            return;
          }
          if (job.status === "failed") {
            sessionStorage.removeItem("resilium_pending_job_v1");
            setPendingJobError(job.error ?? "Report generation failed. Please try again.");
            return;
          }
        } catch { /* keep polling */ }
      }
    };

    poll();
    return () => { cancelled = true; };
  }, [pendingJobId]);

  const { mutateAsync: updateItem } = useUpdateChecklistItem();

  const handleChecklistToggle = useCallback(async (area: string, itemId: string, currentlyCompleted: boolean) => {
    try {
      await updateItem({ reportId, area, itemId, data: { completed: !currentlyCompleted } });
      await refetchChecklist();
    } catch (err) {
      toast({ title: "Failed to update", description: "Could not save your progress.", variant: "destructive" });
    }
  }, [reportId, updateItem, refetchChecklist, toast]);

  useEffect(() => {
    if (!PADDLE_CLIENT_TOKEN || window.Paddle) return;
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;
    script.onload = () => window.Paddle?.Initialize({ token: PADDLE_CLIENT_TOKEN });
    document.head.appendChild(script);
  }, []);

  // Time-delayed save prompt for anonymous users
  useEffect(() => {
    if (isAuthenticated) return;
    const timer = setTimeout(() => {
      toast({
        title: "Save your resilience report",
        description: "Sign up free to keep this report, track your score over time, and build a persistent action plan.",
      });
    }, 35000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, toast]);

  const [percentileData, setPercentileData] = useState<{ percentile: number | null; total: number } | null>(null);
  useEffect(() => {
    if (!report?.score?.overall) return;
    fetch(`${BASE}/api/resilience/percentile?score=${encodeURIComponent(report.score.overall)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setPercentileData(d))
      .catch(() => {});
  }, [report?.score?.overall]);

  const [isPro, setIsPro] = useState(false);
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(`${BASE}/api/users/me/subscription`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setIsPro(!!d.isActive))
      .catch(() => {});
  }, [isAuthenticated]);

  const [expandedSteps, setExpandedSteps] = useState<Record<string, string[]>>({});
  const [loadingSteps, setLoadingSteps] = useState<Record<string, boolean>>({});
  const [showExpandPanel, setShowExpandPanel] = useState<Record<string, boolean>>({});

  const fetchGuidedSteps = useCallback(async (
    reportId: string,
    area: string,
    item: { id: string; title: string; description: string }
  ) => {
    const key = `${area}::${item.id}`;
    if (expandedSteps[key] || loadingSteps[key]) {
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
  }, [expandedSteps, loadingSteps]);

  // Checklist section ref + visibility (for floating pill)
  // MUST be declared before early returns to satisfy Rules of Hooks
  const checklistRef = useRef<HTMLElement>(null);
  const [checklistVisible, setChecklistVisible] = useState(false);
  useEffect(() => {
    const el = checklistRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setChecklistVisible(entry.isIntersecting), { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [report]);
  const scrollToChecklist = () => checklistRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  // Declared here (before all early returns) to satisfy React's Rules of Hooks
  const [showShareModal, setShowShareModal] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium">Retrieving your resilience profile...</p>
      </div>
    );
  }

  if (error || !report) {
    // Recovery mode: a pending job was found — the AI is still generating the report.
    if (pendingJobId && !pendingJobError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <Loader2 className="w-14 h-14 text-primary animate-spin mb-6" />
          <h2 className="text-2xl font-display font-bold mb-2">Your Report Is Being Generated</h2>
          <p className="text-muted-foreground max-w-sm mb-2">
            The AI is still analyzing your responses. This page will automatically redirect you when it's ready.
          </p>
          <p className="text-xs text-muted-foreground/50">Usually 1–2 minutes from when you submitted.</p>
        </div>
      );
    }
    if (pendingJobError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <AlertTriangle className="w-16 h-16 text-destructive mb-6" />
          <h2 className="text-2xl font-display font-bold mb-2">Generation Failed</h2>
          <p className="text-muted-foreground max-w-md mb-8">{pendingJobError}</p>
          <Link href="/assess">
            <Button size="lg" className="rounded-full">Try Again</Button>
          </Link>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-destructive mb-6" />
        <h2 className="text-2xl font-display font-bold mb-2">Report Not Found</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          We couldn't locate your resilience report. It may have expired or the ID is incorrect.
        </p>
        <Link href="/assess">
          <Button size="lg" className="rounded-full">Take Assessment</Button>
        </Link>
      </div>
    );
  }

  const getScoreColorClass = (score: number) => {
    if (score >= 70) return "text-emerald-500";
    if (score >= 40) return "text-amber-500";
    return "text-destructive";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Strong";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    if (score >= 20) return "Low";
    return "Critical";
  };

  const handleEmailReport = () => {
    const subject = encodeURIComponent("My Resilium Resilience Report");
    const body = encodeURIComponent(
      `Here is a link to my Resilium resilience report:\n\n${window.location.href}\n\nOverall score: ${Math.round(report.score.overall)}/100`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleMarkdownExport = () => {
    const score = report.score;
    const vulns = (report.topVulnerabilities ?? []) as string[];
    const md = [
      `# Resilium Resilience Report`,
      ``,
      `**Overall Score:** ${Math.round(score.overall)}/100 — ${getScoreLabel(score.overall)}`,
      ``,
      `## Dimension Scores`,
      `| Dimension | Score |`,
      `|-----------|-------|`,
      `| Financial | ${Math.round(score.financial)} |`,
      `| Health | ${Math.round(score.health)} |`,
      `| Skills | ${Math.round(score.skills)} |`,
      `| Mobility | ${Math.round(score.mobility)} |`,
      `| Psychological | ${Math.round(score.psychological)} |`,
      `| Resources | ${Math.round(score.resources)} |`,
      ``,
      `## Risk Profile`,
      ``,
      toStr(report.riskProfileSummary),
      ``,
      `## Critical Vulnerabilities`,
      ``,
      ...vulns.map((v, i) => `${i + 1}. ${v}`),
      ``,
      ...(mrProfile ? [
        `## Mental Resilience Profile`,
        ``,
        `**Composite Score:** ${mrProfile.composite}/100`,
        `**Pathway:** ${mrProfile.pathway === "growth" ? "Growth" : "Compensation"}`,
        ``,
        `| Dimension | Score |`,
        `|-----------|-------|`,
        ...mrDimensions.map(d => `| ${d.label} | ${d.value} |`),
        ``,
      ] : []),
      `---`,
      `*Generated by Resilium — resilium-platform.com*`,
    ].join("\n");

    const blob = new Blob([md], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `resilium-report-${reportId.slice(0, 8)}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast({ title: "Markdown exported", description: "You can import it into Notion, Evernote, or any markdown editor." });
  };

  const handleDonate = () => {
    if (!PADDLE_DONATION_PRICE_ID || !window.Paddle) return;
    window.Paddle.Checkout.open({
      items: [{ priceId: PADDLE_DONATION_PRICE_ID, quantity: 1 }],
    });
  };

  const hasDonation = !!(PADDLE_CLIENT_TOKEN && PADDLE_DONATION_PRICE_ID);

  // Checklist progress lookup
  const progressMap: Record<string, boolean> = {};
  (checklistData?.progress ?? []).forEach(p => {
    progressMap[`${p.area}::${p.itemId}`] = p.completed;
  });

  // Household context
  const isHouseholdResults = report.householdMode === "household";
  const hcResults = report.input?.householdComposition;

  // Sort areas by score ascending (worst first)
  const scoreByArea: Record<string, number> = {
    financial: report.score.financial,
    health: report.score.health,
    skills: report.score.skills,
    mobility: report.score.mobility,
    psychological: report.score.psychological,
    resources: report.score.resources,
  };

  const checklistsByArea = (report.checklistsByArea ?? {}) as Record<string, ChecklistItem[]>;
  const sortedAreas = Object.keys(checklistsByArea).sort((a, b) => (scoreByArea[a] ?? 50) - (scoreByArea[b] ?? 50));

  // Compute per-area completion
  const areaCompletion = (area: string, items: ChecklistItem[]) => {
    const done = items.filter(item => progressMap[`${area}::${item.id}`]).length;
    return { done, total: items.length, percent: items.length > 0 ? Math.round((done / items.length) * 100) : 0 };
  };

  // Overall checklist completion
  const allItems = Object.entries(checklistsByArea).flatMap(([area, items]) => items.map(i => ({ area, id: i.id })));
  const totalDone = allItems.filter(i => progressMap[`${i.area}::${i.id}`]).length;
  const totalItems = allItems.length;
  const overallPercent = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;
  const milestone = getMilestone(overallPercent);

  // Progress snapshots
  const snapshots = snapshotsData?.snapshots ?? [];
  const previousSnapshot = snapshots.length >= 2 ? snapshots[snapshots.length - 2] : null;
  const previousScore = previousSnapshot?.score;

  // Mental resilience profile
  const mrProfile = (report as any).mentalResilienceProfile as MentalResilienceProfile | undefined;

  const mrDimensions = mrProfile ? [
    { label: "Stress Tolerance", value: mrProfile.stressTolerance, insight: "absorbing acute pressure without shutting down" },
    { label: "Adaptability", value: mrProfile.adaptability, insight: "pivoting when circumstances change fast" },
    { label: "Learning Agility", value: mrProfile.learningAgility, insight: "picking up new skills quickly under pressure" },
    { label: "Change Management", value: mrProfile.changeManagement, insight: "staying functional while routines break down" },
    { label: "Emotional Regulation", value: mrProfile.emotionalRegulation, insight: "keeping decisions clear when emotions are running high" },
    { label: "Social Support", value: mrProfile.socialSupport, insight: "drawing on your network when you need it most" },
  ] : [];

  // Derive the strongest and weakest MR dimensions for narrative framing
  const mrStrength = mrDimensions.length > 0 ? mrDimensions.reduce((a, b) => a.value > b.value ? a : b) : null;
  const mrGap = mrDimensions.length > 0 ? mrDimensions.reduce((a, b) => a.value < b.value ? a : b) : null;

  const totalRemaining = totalItems - totalDone;

  return (
    <div className="min-h-screen pb-24">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          html, body { background: white !important; color: #111 !important; font-size: 11pt !important; }
          header.global-nav, .print\\:hidden { display: none !important; }
          .sticky { position: static !important; }
          .bg-card, .bg-background, .bg-muted, .bg-muted\\/30, .bg-muted\\/20 { background: white !important; }
          .border, .border-border, .border-border\\/60, .border-border\\/40 { border-color: #ddd !important; }
          .shadow-lg, .shadow-xl, .shadow-sm, .shadow-md { box-shadow: none !important; }
          .text-muted-foreground { color: #555 !important; }
          .text-primary { color: #b45309 !important; }
          main { padding-top: 0 !important; }
          section { page-break-inside: avoid; margin-bottom: 1.5rem !important; }
          h1, h2, h3 { page-break-after: avoid; }
          .bg-gradient-to-b, .bg-gradient-to-br { background: white !important; }
          @page { margin: 1.5cm; size: A4 portrait; }
        }
      `}} />
      {/* Header */}
      <header className="w-full bg-card border-b border-border sticky top-14 z-50 print:hidden">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {new URLSearchParams(window.location.search).get("from") === "admin" ? (
              <Link href="/admin/dashboard?tab=reports">
                <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground gap-1.5">
                  ← Admin
                </Button>
              </Link>
            ) : (
              <Link href="/profile?tab=overview">
                <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  Overview
                </Button>
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleEmailReport} className="rounded-full">
            <Mail className="w-4 h-4 mr-2" /> Email
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowShareModal(true)} className="rounded-full">
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Button>
          <Button variant="outline" size="sm" onClick={handleMarkdownExport} className="rounded-full">
            <Download className="w-4 h-4 mr-2" /> Markdown
          </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-10 space-y-10">

        {/* SAVE PROMPT for anonymous users */}
        {!isAuthenticated && (
          <div className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-amber-500/5 border border-amber-500/30">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">This report disappears when you close the tab</p>
              <p className="text-xs text-muted-foreground mt-0.5">Sign in free to save your plan, track checklist progress over time, and pick up exactly where you left off.</p>
            </div>
            <Button size="sm" className="rounded-full flex-shrink-0 bg-amber-600 hover:bg-amber-700 text-white border-0" onClick={login}>
              <LogIn className="w-4 h-4 mr-2" /> Save My Plan
            </Button>
          </div>
        )}

        {/* GOAL REMINDER */}
        {(() => {
          const primaryGoal = (report as any).primaryGoal as string | undefined;
          const successVision = (report as any).successVision as string | undefined;
          const goalLabel = primaryGoal ? (GOAL_LABELS[primaryGoal] ?? primaryGoal) : null;
          const goalIcon = primaryGoal ? (GOAL_ICONS[primaryGoal] ?? "⚡") : null;
          if (!goalLabel) return null;
          return (
            <div className="flex items-center gap-3 flex-wrap">
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
          );
        })()}

        {/* HERO SCORES SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 border-none shadow-xl shadow-black/5 bg-gradient-to-b from-card to-muted/20 flex flex-col items-center justify-center p-8 text-center">
            <h2 className="font-display font-bold text-xl mb-8 text-foreground">{report.householdMode === "household" ? "Household Resilience Score" : "Overall Readiness"}</h2>
            <CircularProgress 
              value={report.score.overall} 
              size={220} 
              strokeWidth={16} 
              colorClass={getScoreColorClass(report.score.overall)} 
            />
            <p className={cn("mt-8 text-sm font-bold uppercase tracking-widest", getScoreColorClass(report.score.overall))}>
              {getScoreLabel(report.score.overall)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {report.score.overall >= 80 ? "Highly Resilient" : report.score.overall >= 60 ? "Well Prepared" : report.score.overall >= 40 ? "Moderately Prepared" : report.score.overall >= 20 ? "Developing Resilience" : "Critically Vulnerable"}
            </p>

            {/* Percentile benchmark */}
            {percentileData && percentileData.percentile !== null && (
              <div className="mt-6 w-full px-2">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">vs. other users</span>
                  <span className="font-semibold text-foreground">Top {100 - percentileData.percentile}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-700"
                    style={{ width: `${percentileData.percentile}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                  You scored higher than {percentileData.percentile}% of {percentileData.total.toLocaleString()} users
                </p>
              </div>
            )}
          </Card>
          
          <Card className="lg:col-span-2 border-none shadow-xl shadow-black/5 p-6">
            <div className="h-[380px]">
              <RadarChartView score={report.score} previousScore={previousScore} />
            </div>
            {previousScore && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Dashed line shows your previous assessment score
              </p>
            )}
          </Card>
        </section>

        {/* RISK PROFILE */}
        <section className="bg-card rounded-3xl p-6 md:p-8 shadow-lg shadow-black/5 border border-border">
          <h3 className="font-display font-bold text-2xl mb-4">Risk Profile</h3>
          <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
            {toStr(report.riskProfileSummary)}
          </p>
        </section>

        {/* PLAN CTA — takes users from Report → Plan */}
        <section className="bg-gradient-to-br from-primary/10 via-card to-muted/10 rounded-3xl border border-primary/30 p-6 md:p-8 shadow-xl shadow-primary/10 print:hidden">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Your Action Plan is Ready</span>
              </div>
              <h2 className="font-display font-bold text-2xl md:text-3xl mb-2">
                Turn Your Scores Into a Plan
              </h2>
              <p className="text-foreground/80 text-sm leading-relaxed max-w-xl">
                Your plan breaks down every dimension into concrete actions — organized by urgency, with AI-guided sub-steps, curated resources, scenario stress tests, and progress tracking. That's where the real work happens.
              </p>
              {totalItems > 0 && (
                <div className="mt-4 flex items-center gap-3">
                  <Progress value={overallPercent} className="h-2 flex-1 max-w-[200px]" />
                  <span className="text-xs font-bold text-muted-foreground">{totalDone}/{totalItems} actions done</span>
                  {milestone && <span className="text-xs text-muted-foreground">{milestone.icon} {milestone.label}</span>}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3 flex-shrink-0">
              <Link href={`/plan/${reportId}`}>
                <Button size="lg" className="rounded-full gap-2 shadow-lg shadow-primary/25 w-full md:w-auto text-base px-8">
                  <TrendingUp className="w-5 h-5" /> Open My Action Plan
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground text-center">
                Checklists · AI Sub-Steps · Resources · Stress Tests
              </p>
            </div>
          </div>
        </section>

        {/* MENTAL RESILIENCE PROFILE */}
        {mrProfile && (
          <section className="bg-card rounded-3xl p-6 md:p-8 shadow-lg shadow-black/5 border border-border">
            <div className="flex items-center gap-3 mb-6">
              <Brain className="w-6 h-6 text-primary" />
              <h2 className="font-display font-bold text-2xl">Mental Resilience Profile</h2>
              <span className={cn(
                "ml-auto text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full",
                mrProfile.pathway === "growth" ? "bg-emerald-500/10 text-emerald-700" : "bg-amber-500/10 text-amber-700"
              )}>
                {mrProfile.pathway === "growth" ? "Growth Pathway" : "Compensation Pathway"}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {mrDimensions.map((dim) => (
                <div key={dim.label} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-semibold text-foreground">{dim.label}</span>
                      <span className={cn("ml-2 text-xs font-medium", getScoreColorClass(dim.value))}>
                        {getScoreLabel(dim.value)}
                      </span>
                    </div>
                    <span className={cn("text-sm font-bold", getScoreColorClass(dim.value))}>{dim.value}/100</span>
                  </div>
                  <Progress value={dim.value} className="h-2" />
                </div>
              ))}
            </div>
            {mrStrength && mrGap && mrStrength.label !== mrGap.label && (
              <div className="bg-muted/30 rounded-2xl p-5 mb-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                  <p className="text-sm leading-relaxed text-foreground">
                    <span className="font-semibold">You're built for {mrStrength.label.toLowerCase()}.</span>{" "}
                    <span className="text-muted-foreground">When it comes to {toStr((mrStrength as any).insight ?? "handling pressure")}, you're already ahead of most people — this is a real asset in a crisis.</span>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                  <p className="text-sm leading-relaxed text-foreground">
                    <span className="font-semibold">The gap to build: {mrGap.label.toLowerCase()}.</span>{" "}
                    <span className="text-muted-foreground">In a sustained disruption, {toStr((mrGap as any).insight ?? "this area")} becomes the pressure point — not a weakness, but the next thing to strengthen.</span>
                  </p>
                </div>
              </div>
            )}
            <div className="bg-muted/30 rounded-2xl p-4 flex items-center gap-4">
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-display font-bold text-primary">{mrProfile.composite}</span>
              </div>
              <div>
                <p className="font-bold text-sm">Composite Mental Resilience Score</p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {mrProfile.pathway === "growth"
                    ? "Use this as a springboard — your mental resilience supports ambitious action. Push into the growth-oriented items in your plan."
                    : "Build one habit at a time. Your plan is ordered to create early wins that compound into real resilience over weeks, not years."}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* COACHING CARD — contextual for low psychological / mental resilience score */}
        {(report.score.psychological < 40 || (mrProfile && mrProfile.composite < 40)) && (
          <section className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-6 md:p-8 print:hidden">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full">
                Phoenix Insight Coaching
              </span>
            </div>
            <h3 className="font-display font-bold text-xl text-foreground mb-2">
              A score this low often reflects patterns data can't fix.
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-5 max-w-2xl">
              Psychological resilience is the foundation everything else rests on. A low score here usually reflects accumulated stress, unprocessed disruption, or simply not having had the space to build those muscles yet — not a character flaw.
              <br /><br />
              Cristiana Paun at <strong className="text-foreground">Phoenix Insight Coaching</strong> specializes in 1:1 sessions built directly around your Resilium profile. The first call is free, with no commitment.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/coaching">
                <Button className="rounded-full gap-2 bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20">
                  <Heart className="w-4 h-4" /> Explore Coaching
                </Button>
              </Link>
            </div>
          </section>
        )}

        {/* TOP VULNERABILITIES */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-destructive" />
            <h2 className="font-display font-bold text-2xl">Critical Vulnerabilities</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(report.topVulnerabilities ?? []).map((vuln, idx) => (
              <div key={idx} className="bg-destructive/10 border border-destructive/20 text-destructive-foreground px-5 py-4 rounded-2xl flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-destructive">{idx + 1}</span>
                </div>
                <p className="text-sm font-medium text-foreground leading-snug">{toStr(vuln)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ACTION CHECKLISTS — reference summary on report page */}
        {sortedAreas.length > 0 && false && (
          <section ref={checklistRef} className="bg-card rounded-3xl p-6 md:p-8 shadow-lg shadow-black/5 border border-border scroll-mt-24">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                <h2 className="font-display font-bold text-2xl">Action Checklists</h2>
              </div>
              {totalRemaining > 0 && (
                <span className="text-sm font-bold text-muted-foreground">{totalRemaining} remaining</span>
              )}
              {totalRemaining === 0 && totalItems > 0 && (
                <span className="text-sm font-bold text-emerald-600">✓ All done</span>
              )}
            </div>
            <div className="flex items-center gap-3 mb-5 p-4 rounded-2xl bg-primary/5 border border-primary/20">
              <TrendingUp className="w-4 h-4 text-primary flex-shrink-0" />
              <p className="text-sm text-muted-foreground flex-1">
                These tasks are fully integrated into your <span className="font-semibold text-foreground">Strategic Action Plan</span> — organized by timeframe with AI sub-steps and curated resources for each.
              </p>
              <Link href={`/plan/${reportId}`}>
                <Button size="sm" className="rounded-full gap-1.5 flex-shrink-0">
                  Open Plan <TrendingUp className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              Reference view below. Check items off as you complete them — progress is shared with your action plan.
            </p>

            {/* Overall progress */}
            {totalItems > 0 && (
              <div className="mb-8 p-4 rounded-2xl bg-muted/30 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">Overall Progress</span>
                  <span className="text-sm font-bold text-primary">{totalDone}/{totalItems} completed</span>
                </div>
                <Progress value={overallPercent} className="h-3 mb-3" />
                {milestone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{milestone.icon}</span>
                    <span className="font-medium">{overallPercent}% — {milestone.label}</span>
                  </div>
                )}
              </div>
            )}

            <Tabs defaultValue={sortedAreas[0]} className="w-full">
              <div className="sticky top-28 z-30 -mx-6 md:-mx-8 px-6 md:px-8 pb-2 pt-1 bg-card/95 backdrop-blur-sm border-b border-border/40 mb-4">
              <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-2xl">
                {sortedAreas.map(area => {
                  const items = checklistsByArea[area] ?? [];
                  const comp = areaCompletion(area, items);
                  return (
                    <TabsTrigger key={area} value={area} className="rounded-xl text-xs sm:text-sm data-[state=active]:shadow-sm flex items-center gap-1.5">
                      {AREA_ICONS[area]}
                      {AREA_LABELS[area] ?? area}
                      {comp.total > 0 && (
                        <span className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                          comp.done === comp.total ? "bg-emerald-500/20 text-emerald-700" : "bg-muted text-muted-foreground"
                        )}>
                          {comp.done}/{comp.total}
                        </span>
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              </div>

              {sortedAreas.map(area => {
                const items = checklistsByArea[area] ?? [];
                const comp = areaCompletion(area, items);
                return (
                  <TabsContent key={area} value={area} className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
                    {/* Household vulnerability flags for this dimension */}
                    {isHouseholdResults && (
                      <div className="flex flex-wrap gap-2 mb-1">
                        {area === "mobility" && hcResults?.hasMobilityLimitation && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600">Mobility limitation in household</span>
                        )}
                        {area === "financial" && hcResults?.hasMultipleIncomes && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">Multiple income sources</span>
                        )}
                        {area === "health" && hcResults?.hasMinors && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600">Minors in household</span>
                        )}
                      </div>
                    )}
                    {/* Area progress bar */}
                    <div className="flex items-center gap-3 mb-4">
                      <Progress value={comp.percent} className="h-2 flex-1" />
                      <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">{comp.done}/{comp.total}</span>
                    </div>

                    {items.map((item) => {
                      const key = `${area}::${item.id}`;
                      const completed = progressMap[key] ?? false;
                      const priorityConfig = PRIORITY_CONFIG[item.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.medium;
                      const isExpanded = showExpandPanel[key] ?? false;
                      const isLoadingExpand = loadingSteps[key] ?? false;
                      const subSteps = expandedSteps[key];
                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "rounded-2xl border transition-all overflow-hidden",
                            completed
                              ? "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-900/30"
                              : "border-border/60 hover:border-primary/30 hover:bg-muted/10"
                          )}
                        >
                          <div
                            className="flex items-start gap-4 p-5 cursor-pointer"
                            onClick={() => handleChecklistToggle(area, item.id, completed)}
                          >
                            <div className={cn(
                              "w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all",
                              completed ? "border-emerald-500 bg-emerald-500" : "border-muted-foreground/40"
                            )}>
                              {completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className={cn("text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full", priorityConfig.className)}>
                                  {priorityConfig.label}
                                </span>
                                <span className={cn(
                                  "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full",
                                  item.pathway === "growth" ? "bg-emerald-500/10 text-emerald-700" : "bg-amber-500/10 text-amber-700"
                                )}>
                                  {item.pathway === "growth" ? "Growth" : "Foundation"}
                                </span>
                              </div>
                              <h4 className={cn("font-bold text-base", completed && "line-through text-muted-foreground")}>
                                {toStr(item.title)}
                              </h4>
                              <p className="text-muted-foreground text-sm mt-0.5">{toStr(item.description)}</p>
                            </div>
                          </div>

                          {/* Expand button */}
                          <div className="px-5 pb-4 pt-0 flex items-center justify-between">
                            {isPro ? (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); fetchGuidedSteps(reportId, area, item); }}
                                className={cn(
                                  "flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 border transition-all",
                                  isExpanded
                                    ? "border-primary/40 bg-primary/5 text-primary"
                                    : "border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
                                )}
                              >
                                {isLoadingExpand ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Sparkles className="w-3.5 h-3.5" />
                                )}
                                {isLoadingExpand ? "Getting your steps…" : isExpanded ? "Hide steps" : "Break it down"}
                                {!isLoadingExpand && (isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                              </button>
                            ) : (
                              <Link href="/pricing">
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); }}
                                  title="Upgrade to Pro to unlock guided sub-steps"
                                  className="flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 border border-border text-muted-foreground hover:border-primary/30 hover:text-primary transition-all"
                                >
                                  <Lock className="w-3 h-3" />
                                  <span>Break it down — unlock with Pro</span>
                                </button>
                              </Link>
                            )}
                          </div>

                          {/* Guided sub-steps panel */}
                          {isExpanded && (
                            <div className="px-5 pb-5 border-t border-border/50 pt-4">
                              {isLoadingExpand ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                  <span>Generating personalized steps for your profile…</span>
                                </div>
                              ) : subSteps && subSteps.length > 0 ? (
                                <ol className="space-y-2.5">
                                  {subSteps.map((step, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm">
                                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                                        {i + 1}
                                      </span>
                                      <span className="text-foreground leading-snug">{step}</span>
                                    </li>
                                  ))}
                                </ol>
                              ) : subSteps && subSteps.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Could not generate steps — please try again.</p>
                              ) : null}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </TabsContent>
                );
              })}
            </Tabs>
          </section>
        )}

        {/* SCENARIO PAYWALL TEASER — shown to free users */}
        {!isPro && false && (
          <section className="rounded-3xl border border-primary/20 bg-card overflow-hidden print:hidden shadow-lg shadow-black/5">
            {/* Header */}
            <div className="px-6 md:px-8 pt-6 md:pt-8 pb-5 border-b border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Pro Feature</span>
              </div>
              <h3 className="font-display font-bold text-xl md:text-2xl mb-1">
                What happens to your resilience when life goes sideways?
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
                Scenario analysis stress-tests your current plan against real disruptions — showing you exactly where you'd break, how fast, and what to fix before it happens.
              </p>
            </div>

            {/* Mock scenario tabs */}
            <div className="relative">
              {/* Tab bar */}
              <div className="flex gap-1 px-6 md:px-8 pt-5 pb-0">
                {["Job Loss", "Market Downturn", "Health Crisis"].map((label, i) => (
                  <div key={label} className={cn(
                    "px-4 py-2 rounded-t-xl text-xs font-bold border border-b-0 cursor-default select-none",
                    i === 0
                      ? "bg-card border-border text-foreground"
                      : "bg-muted/40 border-transparent text-muted-foreground"
                  )}>{label}</div>
                ))}
              </div>

              {/* Scenario preview content — partially blurred */}
              <div className="relative mx-6 md:mx-8 mb-6 border border-border rounded-b-2xl rounded-tr-2xl overflow-hidden">
                {/* Fake scenario output */}
                <div className="p-5 space-y-4 select-none pointer-events-none" style={{ filter: "blur(3.5px)" }}>
                  {/* Narrative headline */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-destructive">Critical Impact Detected</div>
                    <p className="font-semibold text-sm leading-snug">
                      Losing your primary income today would exhaust your financial runway in approximately 38 days at current burn rate — well below the 90-day safety threshold.
                    </p>
                  </div>

                  {/* Score deltas */}
                  <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                    {[
                      { label: "Financial", delta: -28 },
                      { label: "Skills", delta: -4 },
                      { label: "Mobility", delta: -11 },
                      { label: "Resources", delta: -19 },
                      { label: "Health", delta: -3 },
                      { label: "Psych", delta: -8 },
                      { label: "Social", delta: -6 },
                    ].map(({ label, delta }) => (
                      <div key={label} className="bg-muted/40 rounded-xl p-2 text-center">
                        <p className="text-[9px] text-muted-foreground mb-0.5">{label}</p>
                        <p className="text-sm font-bold text-destructive">{delta}</p>
                      </div>
                    ))}
                  </div>

                  {/* Immediate actions */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Top 3 Actions to Reduce Impact</p>
                    {["Build a 3-month emergency fund before this scenario becomes real", "Activate your professional network now — 80% of roles are filled before posting", "Identify 2 income streams you could launch within 30 days"].map((action) => (
                      <div key={action} className="flex items-start gap-2 bg-muted/30 rounded-xl px-3 py-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <p className="text-xs text-foreground">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lock overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/60 backdrop-blur-[1px]">
                  <div className="text-center px-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <p className="font-display font-bold text-base mb-1">Unlock Scenario Analysis</p>
                    <p className="text-muted-foreground text-xs mb-4 max-w-xs">
                      Test your plan against job loss, market crashes, health crises, and more — with specific actions to close each gap.
                    </p>
                    <Link href="/pricing">
                      <Button size="sm" className="rounded-full gap-2 shadow-md shadow-primary/20">
                        <Zap className="w-3.5 h-3.5" /> Upgrade to Pro — $9/mo
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* PROGRESS SECTION */}
        {(snapshots.length >= 2 || totalItems > 0) && (
          <section className="bg-card rounded-3xl p-6 md:p-8 shadow-lg shadow-black/5 border border-border">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-6 h-6 text-amber-500" />
              <h2 className="font-display font-bold text-2xl">Your Progress</h2>
            </div>

            {/* Score delta */}
            {snapshots.length >= 2 && previousScore && (
              <div className="mb-8">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">Score Changes Since Last Assessment</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                  {(["overall", "financial", "health", "skills", "mobility", "psychological", "resources"] as const).map(area => {
                    const current = report.score[area];
                    const prev = previousScore[area];
                    const delta = current - prev;
                    return (
                      <div key={area} className="bg-muted/30 rounded-2xl p-3 text-center">
                        <p className="text-xs text-muted-foreground capitalize mb-1">{area}</p>
                        <p className="text-xl font-bold font-display">{current}</p>
                        <p className={cn("text-xs font-bold", delta > 0 ? "text-emerald-600" : delta < 0 ? "text-destructive" : "text-muted-foreground")}>
                          {delta > 0 ? `+${delta}` : delta === 0 ? "—" : delta}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Checklist completion summary */}
            {totalItems > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">Checklist Completion by Area</h3>
                <div className="space-y-3">
                  {Object.entries(checklistsByArea).map(([area, items]) => {
                    const comp = areaCompletion(area, items);
                    return (
                      <div key={area} className="flex items-center gap-2">
                        <span className="w-36 flex-shrink-0 flex items-center gap-1.5">
                          {AREA_ICONS[area]}
                          <span className="text-xs font-medium leading-tight">{AREA_LABELS[area] ?? area}</span>
                        </span>
                        <Progress value={comp.percent} className="h-2 flex-1" />
                        <span className="text-xs font-bold text-muted-foreground w-10 text-right">{comp.done}/{comp.total}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Milestone markers */}
            {totalItems > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">Milestones</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {MILESTONE_MARKERS.map(m => {
                    const achieved = overallPercent >= m.percent;
                    return (
                      <div key={m.percent} className={cn(
                        "rounded-2xl p-4 text-center border transition-all",
                        achieved ? "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-900/30" : "border-border bg-muted/20"
                      )}>
                        <div className="text-2xl mb-1">{m.icon}</div>
                        <p className="text-xs font-bold">{m.percent}%</p>
                        <p className="text-xs text-muted-foreground">{m.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        {/* RETAKE ASSESSMENT */}
        <section className="flex justify-center print:hidden">
          <Link href="/assess">
            <Button variant="outline" className="rounded-full h-11 px-8 gap-2 text-muted-foreground hover:text-foreground">
              <RefreshCcw className="w-4 h-4" /> Retake Assessment
            </Button>
          </Link>
        </section>

        {/* FEEDBACK */}
        <section className="pb-4 print:hidden">
          <FeedbackWidget reportId={reportId} />
        </section>

        {/* SUPPORT BANNER */}
        <section className="print:hidden">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
            <Heart className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-display font-bold text-xl mb-2">Support Resilium</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-5">
              If this report was helpful, consider a small contribution to keep Resilium running and improving.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {hasDonation ? (
                <Button className="rounded-full gap-2" onClick={handleDonate}>
                  <Heart className="w-4 h-4" /> Support Resilium — $5
                </Button>
              ) : (
                <Button className="rounded-full gap-2" onClick={() => setShowShareModal(true)}>
                  <Share2 className="w-4 h-4" /> Share Your Score
                </Button>
              )}
              <Button variant="outline" className="rounded-full gap-2" onClick={() => setShowShareModal(true)}>
                <Share2 className="w-4 h-4" /> Share
              </Button>
            </div>
          </div>
        </section>

      </main>

      <SiteFooter />

      {/* SOCIAL SHARE MODAL */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="bg-card border border-border rounded-3xl shadow-2xl max-w-sm w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Share2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg">Share Your Score</h2>
                <p className="text-muted-foreground text-sm">Post to your social network</p>
              </div>
            </div>
            {(() => {
              const shareUrl = encodeURIComponent(window.location.href);
              const shareText = encodeURIComponent(`My Resilium resilience score is ${Math.round(report.score.overall)}/100. Find out your readiness score:`);
              return (
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`https://x.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-muted/30 hover:bg-muted/60 py-3 px-4 text-sm font-semibold transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.732-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    X (Twitter)
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-muted/30 hover:bg-muted/60 py-3 px-4 text-sm font-semibold transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    Facebook
                  </a>
                  <a
                    href={`https://reddit.com/submit?url=${shareUrl}&title=${shareText}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-muted/30 hover:bg-muted/60 py-3 px-4 text-sm font-semibold transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
                    Reddit
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`My Resilium score: ${Math.round(report.score.overall)}/100 — ${window.location.href}`);
                      toast({ title: "Copied!", description: "Paste this into Instagram or anywhere else." });
                      setShowShareModal(false);
                    }}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-muted/30 hover:bg-muted/60 py-3 px-4 text-sm font-semibold transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
                    Instagram (Copy)
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* FLOATING PLAN PILL — persistent shortcut to the action plan */}
      {totalItems > 0 && totalRemaining > 0 && (
        <div className="fixed bottom-6 right-6 z-40 print:hidden animate-in slide-in-from-bottom-4 duration-300">
          <Link href={`/plan/${reportId}`}>
            <div className="flex items-center gap-3 bg-card border border-primary/30 shadow-2xl shadow-primary/20 rounded-2xl px-4 py-3 hover:bg-primary/5 transition-all cursor-pointer">
              <div className="relative w-10 h-10 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/40" />
                  <circle
                    cx="18" cy="18" r="14" fill="none"
                    stroke="currentColor" strokeWidth="3"
                    strokeDasharray={`${(overallPercent / 100) * 87.96} 87.96`}
                    strokeLinecap="round"
                    className="text-primary transition-all duration-500"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-primary">
                  {overallPercent}%
                </span>
              </div>
              <div className="text-left pr-1">
                <p className="text-xs font-bold text-foreground leading-tight">{totalRemaining} action{totalRemaining !== 1 ? "s" : ""} remaining</p>
                <p className="text-[10px] text-primary font-medium">Open Plan →</p>
              </div>
            </div>
          </Link>
        </div>
      )}

    </div>
  );
}

export default function ResultsPage() {
  return (
    <ResultsErrorBoundary>
      <NoIndexPage />
      <ResultsPageInner />
    </ResultsErrorBoundary>
  );
}
