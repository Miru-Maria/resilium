import React, { useState, useCallback, useEffect } from "react";
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
import { Loader2, Download, Share2, AlertTriangle, CheckCircle, RefreshCcw, Activity, User, LogIn, Brain, TrendingUp, Award, Star, ExternalLink, Heart, BookOpen, ShieldCheck, Zap, Package, Globe, MapPin, Lock, Mail } from "lucide-react";
import { ResilientIcon } from "@/components/resilient-icon";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { SiteFooter } from "@/components/site-footer";
import { useAuth } from "@workspace/replit-auth-web";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const PADDLE_CLIENT_TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN as string | undefined;
const PADDLE_DONATION_PRICE_ID = import.meta.env.VITE_PADDLE_DONATION_PRICE_ID as string | undefined;

declare global {
  interface Window { Paddle?: any; }
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

const AREA_LABELS: Record<string, string> = {
  financial: "Financial",
  health: "Health",
  skills: "Skills",
  mobility: "Mobility",
  psychological: "Psychological",
  resources: "Resources",
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

export default function ResultsPage() {
  const [, params] = useRoute("/results/:reportId");
  const reportId = params?.reportId || "";
  const { toast } = useToast();
  const { user, isAuthenticated, login, logout } = useAuth();
  const queryClient = useQueryClient();

  const { data: report, isLoading, error } = useGetReport(reportId, {
    query: {
      enabled: !!reportId,
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium">Retrieving your resilience profile...</p>
      </div>
    );
  }

  if (error || !report) {
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

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `My Resilium Score is ${Math.round(report.score.overall)}/100. Find out your survival readiness.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "My Resilium Score", text: shareText, url: shareUrl });
        return;
      } catch {}
    }
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    toast({ title: "Copied to clipboard", description: "You can now paste and share your score." });
  };

  const handlePrint = () => window.print();

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

  // Percentile benchmarking
  const [percentileData, setPercentileData] = useState<{ percentile: number | null; total: number } | null>(null);
  useEffect(() => {
    if (!report?.score?.overall) return;
    fetch(`${BASE}/api/resilience/percentile?score=${encodeURIComponent(report.score.overall)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setPercentileData(d))
      .catch(() => {});
  }, [report?.score?.overall]);

  const mrDimensions = mrProfile ? [
    { label: "Stress Tolerance", value: mrProfile.stressTolerance },
    { label: "Adaptability", value: mrProfile.adaptability },
    { label: "Learning Agility", value: mrProfile.learningAgility },
    { label: "Change Management", value: mrProfile.changeManagement },
    { label: "Emotional Regulation", value: mrProfile.emotionalRegulation },
    { label: "Social Support", value: mrProfile.socialSupport },
  ] : [];

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="w-full bg-card border-b border-border sticky top-0 z-50 print:hidden">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="font-display font-bold text-xl text-primary flex items-center gap-2 cursor-pointer">
              <ResilientIcon className="w-5 h-5" /> Resilium
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleEmailReport} className="rounded-full">
              <Mail className="w-4 h-4 mr-2" /> Email
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare} className="rounded-full">
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
            <Button variant="default" size="sm" onClick={handlePrint} className="rounded-full">
              <Download className="w-4 h-4 mr-2" /> Save PDF
            </Button>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full flex items-center gap-2">
                    {user?.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt={user.firstName || "User"}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    <span className="max-w-[80px] truncate text-sm">{user?.firstName || "Account"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">My Plans</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" className="rounded-full" onClick={login}>
                <LogIn className="w-4 h-4 mr-1" /> Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-10 space-y-10">

        {/* SAVE PROMPT for anonymous users */}
        {!isAuthenticated && (
          <div className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-primary/5 border border-primary/20">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">Your report is temporary</p>
              <p className="text-xs text-muted-foreground mt-0.5">Sign in to save this plan, track your progress over time, and compare against future assessments.</p>
            </div>
            <Button size="sm" className="rounded-full flex-shrink-0" onClick={login}>
              <LogIn className="w-4 h-4 mr-2" /> Save My Plan
            </Button>
          </div>
        )}

        {/* HERO SCORES SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 border-none shadow-xl shadow-black/5 bg-gradient-to-b from-card to-muted/20 flex flex-col items-center justify-center p-8 text-center">
            <h2 className="font-display font-bold text-xl mb-8 text-foreground">Overall Readiness</h2>
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
          
          <Card className="lg:col-span-2 border-none shadow-xl shadow-black/5 flex flex-col sm:flex-row items-center p-6 gap-6">
            <div className="w-full sm:w-1/2 h-[300px]">
              <RadarChartView score={report.score} previousScore={previousScore} />
            </div>
            <div className="w-full sm:w-1/2 space-y-4">
              <h3 className="font-display font-bold text-2xl">Risk Profile</h3>
              <p className="text-muted-foreground leading-relaxed">
                {report.riskProfileSummary}
              </p>
              {previousScore && (
                <div className="text-xs text-muted-foreground border-t pt-3 mt-3">
                  Dashed line shows your previous assessment score
                </div>
              )}
            </div>
          </Card>
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
            <div className="bg-muted/30 rounded-2xl p-4 flex items-center gap-4">
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-display font-bold text-primary">{mrProfile.composite}</span>
              </div>
              <div>
                <p className="font-bold text-sm">Composite Mental Resilience Score</p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {mrProfile.pathway === "growth"
                    ? "Your strong mental resilience enables an ambitious, challenge-oriented action plan. Embrace growth-oriented goals."
                    : "Your plan is scaffolded to build confidence step-by-step. Start small, build momentum, and your resilience will grow."}
                </p>
              </div>
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
            {report.topVulnerabilities.map((vuln, idx) => (
              <div key={idx} className="bg-destructive/10 border border-destructive/20 text-destructive-foreground px-5 py-4 rounded-2xl flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-destructive">{idx + 1}</span>
                </div>
                <p className="text-sm font-medium text-foreground leading-snug">{vuln}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ACTION CHECKLISTS */}
        {sortedAreas.length > 0 && (
          <section className="bg-card rounded-3xl p-6 md:p-8 shadow-lg shadow-black/5 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
              <h2 className="font-display font-bold text-2xl">Action Checklists</h2>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              Areas sorted from most critical to least. Check items off as you complete them — your progress is saved.
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
              <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-2xl mb-6">
                {sortedAreas.map(area => {
                  const items = checklistsByArea[area] ?? [];
                  const comp = areaCompletion(area, items);
                  return (
                    <TabsTrigger key={area} value={area} className="rounded-xl text-xs sm:text-sm data-[state=active]:shadow-sm flex items-center gap-1.5">
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

              {sortedAreas.map(area => {
                const items = checklistsByArea[area] ?? [];
                const comp = areaCompletion(area, items);
                return (
                  <TabsContent key={area} value={area} className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
                    {/* Area progress bar */}
                    <div className="flex items-center gap-3 mb-4">
                      <Progress value={comp.percent} className="h-2 flex-1" />
                      <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">{comp.done}/{comp.total}</span>
                    </div>

                    {items.map((item) => {
                      const key = `${area}::${item.id}`;
                      const completed = progressMap[key] ?? false;
                      const priorityConfig = PRIORITY_CONFIG[item.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.medium;
                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer",
                            completed
                              ? "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-900/30"
                              : "border-border/60 hover:border-primary/30 hover:bg-muted/10"
                          )}
                          onClick={() => handleChecklistToggle(area, item.id, completed)}
                        >
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all",
                            completed ? "border-emerald-500 bg-emerald-500" : "border-muted-foreground/40"
                          )}>
                            {completed && <CheckCircle className="w-3 h-3 text-white" />}
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
                              {item.title}
                            </h4>
                            <p className="text-muted-foreground text-sm mt-0.5">{item.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </TabsContent>
                );
              })}
            </Tabs>
          </section>
        )}

        {/* ACTION PLAN TABS */}
        <section className="bg-card rounded-3xl p-6 md:p-8 shadow-lg shadow-black/5 border border-border">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            <h2 className="font-display font-bold text-2xl">Strategic Action Plan</h2>
          </div>
          
          <Tabs defaultValue="shortTerm" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/50 p-1 rounded-full">
              <TabsTrigger value="shortTerm" className="rounded-full data-[state=active]:shadow-sm">0-30 Days</TabsTrigger>
              <TabsTrigger value="midTerm" className="rounded-full data-[state=active]:shadow-sm">3-6 Months</TabsTrigger>
              <TabsTrigger value="longTerm" className="rounded-full data-[state=active]:shadow-sm">Long Term</TabsTrigger>
            </TabsList>
            
            {(['shortTerm', 'midTerm', 'longTerm'] as const).map((period) => (
              <TabsContent key={period} value={period} className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
                {report.actionPlan[period].map((item, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl border border-border/60 hover:border-primary/30 hover:bg-muted/10 transition-colors">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          item.priority === 'critical' ? 'bg-destructive/10 text-destructive' :
                          item.priority === 'high' ? 'bg-amber-500/10 text-amber-700' :
                          'bg-primary/10 text-primary'
                        }`}>
                          {item.priority} priority
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-secondary/30 text-secondary-foreground">
                          {item.category}
                        </span>
                      </div>
                      <h4 className="font-bold text-lg text-foreground">{item.title}</h4>
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </section>

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
                      <div key={area} className="flex items-center gap-4">
                        <span className="text-sm font-medium w-24 flex-shrink-0">{AREA_LABELS[area] ?? area}</span>
                        <Progress value={comp.percent} className="h-2 flex-1" />
                        <span className="text-xs font-bold text-muted-foreground w-12 text-right">{comp.done}/{comp.total}</span>
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
                        achieved ? "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-900/30" : "border-border bg-muted/20 opacity-50"
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

        {/* SCENARIO SIMULATIONS */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-6 h-6 text-primary" />
              <h2 className="font-display font-bold text-2xl">Stress Test Scenarios</h2>
            </div>
            <p className="text-muted-foreground mb-6">How your profile holds up against your primary risk concerns.</p>
            
            <Accordion type="single" collapsible className="w-full space-y-3">
              {report.scenarioSimulations.map((scenario, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`} className="bg-card border border-border rounded-2xl overflow-hidden px-2 shadow-sm">
                  <AccordionTrigger className="hover:no-underline px-4 py-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-left w-full pr-4">
                      <span className="font-bold text-lg">{scenario.scenario}</span>
                      <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full w-max ${
                        scenario.impact === 'severe' ? 'bg-destructive/10 text-destructive' :
                        scenario.impact === 'high' ? 'bg-amber-500/10 text-amber-700' :
                        'bg-emerald-500/10 text-emerald-700'
                      }`}>
                        {scenario.impact} Impact
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-5 pt-0">
                    <div className="pt-4 border-t border-border space-y-4">
                      <p className="text-muted-foreground leading-relaxed">{scenario.description}</p>
                      
                      <div className="bg-muted/30 p-4 rounded-xl">
                        <h5 className="font-bold text-sm mb-2 uppercase tracking-wide">Immediate Survival Steps</h5>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-foreground">
                          {scenario.immediateSteps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <span className="text-muted-foreground">Estimated recovery time:</span>
                        <span className="text-foreground">{scenario.timeToRecover}</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* RUN DEEPER STRESS TEST CTA */}
            <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 print:hidden">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="font-bold text-sm text-primary uppercase tracking-wide">Pro Feature</span>
                </div>
                <p className="font-bold text-base">Run a deeper stress test</p>
                <p className="text-sm text-muted-foreground">Choose a specific crisis scenario — job loss, health emergency, natural disaster, or relocating abroad — and see AI-powered delta scores with tailored action steps.</p>
              </div>
              <Link href={`/scenarios/${reportId}`}>
                <Button className="rounded-full h-11 px-6 shrink-0 gap-2">
                  <Activity className="w-4 h-4" />
                  Run Stress Test
                </Button>
              </Link>
            </div>
          </div>

          {/* HABITS SIDEBAR */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="font-display font-bold text-2xl mb-2">Daily Habits</h2>
            <Card className="border-none shadow-lg shadow-black/5 bg-primary text-primary-foreground">
              <CardContent className="p-6 space-y-4">
                {report.dailyHabits.map((habit, idx) => (
                  <div key={idx} className="flex gap-3 pb-4 border-b border-primary-foreground/10 last:border-0 last:pb-0">
                    <div className="mt-1">
                      <CheckCircle className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm leading-snug mb-1">{habit.habit}</p>
                      <span className="text-[10px] uppercase tracking-widest text-primary-foreground/60">{habit.frequency}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="pt-8 print:hidden">
              <Link href="/assess">
                <Button variant="outline" className="w-full rounded-full h-12 text-muted-foreground hover:text-foreground">
                  <RefreshCcw className="w-4 h-4 mr-2" /> Retake Assessment
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* RESOURCE RECOMMENDATIONS */}
        <section className="print:hidden">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <h2 className="font-display font-bold text-2xl">Recommended Resources</h2>
          </div>
          {(report as any)?.recommendedResources?.length > 0 ? (
            <>
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-4 h-4 text-primary" />
                <p className="text-muted-foreground text-sm">
                  Personalized for <span className="font-medium text-foreground">{report?.input?.location}</span> based on your scores, risk concerns, and checklist gaps — ordered by urgency.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {((report as any).recommendedResources as Array<{title:string;category:string;description:string;url:string;badge:string;priority:string}>).map((r) => {
                  const priorityConfig: Record<string, string> = {
                    critical: "bg-destructive/10 text-destructive border-destructive/20",
                    high: "bg-amber-500/10 text-amber-700 border-amber-500/20",
                    medium: "bg-primary/10 text-primary border-primary/20",
                    low: "bg-muted text-muted-foreground border-border",
                  };
                  const iconMap: Record<string, React.ElementType> = {
                    "Emergency Prep": ShieldCheck,
                    "Financial": TrendingUp,
                    "Health": Brain,
                    "Skills": Zap,
                    "Psychological": Brain,
                    "Community": Globe,
                    "Legal": Lock,
                    "Supplies": Package,
                  };
                  const Icon = iconMap[r.category] ?? BookOpen;
                  return (
                    <a
                      key={r.title}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full border ${priorityConfig[r.priority] ?? priorityConfig.low}`}>
                            {r.priority}
                          </span>
                          <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                            {r.badge}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-1">{r.category}</p>
                        <h3 className="font-bold text-sm mb-1.5 group-hover:text-primary transition-colors">{r.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{r.description}</p>
                      </div>
                      <div className="mt-3 flex items-center gap-1 text-xs text-primary font-medium">
                        Visit <ExternalLink className="w-3 h-3 ml-1" />
                      </div>
                    </a>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <p className="text-muted-foreground mb-6">Tools and resources to accelerate your resilience journey.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {[
                  { icon: ShieldCheck, title: "Ready.gov", category: "Emergency Prep", description: "Official U.S. government guide to disaster preparedness, emergency kits, and family plans.", url: "https://ready.gov", badge: "Free" },
                  { icon: Package, title: "FEMA Emergency Kit Guide", category: "Supplies", description: "Build a 72-hour emergency supply kit with this comprehensive checklist from FEMA.", url: "https://www.fema.gov/emergency-managers/individuals-communities/prepare-financially", badge: "Free" },
                  { icon: Brain, title: "Mental Health First Aid", category: "Psychological", description: "8-hour public education course that teaches how to identify and respond to mental health crises.", url: "https://www.mentalhealthfirstaid.org", badge: "Course" },
                  { icon: Globe, title: "American Red Cross", category: "Community", description: "Disaster preparedness courses, first aid training, and local response network.", url: "https://www.redcross.org/take-a-class", badge: "Free" },
                  { icon: Zap, title: "iReady Plan (US)", category: "Financial", description: "FEMA's guide to financial preparedness and building an emergency savings buffer.", url: "https://www.fema.gov/emergency-managers/individuals-communities/prepare-financially", badge: "Guide" },
                  { icon: TrendingUp, title: "Coursera Resilience", category: "Skills", description: "University-led courses on resilience psychology, stress management, and adaptive skills.", url: "https://www.coursera.org/search?query=resilience", badge: "Courses" },
                ].map((r) => {
                  const Icon = r.icon;
                  return (
                    <a key={r.title} href={r.url} target="_blank" rel="noopener noreferrer" className="group flex flex-col bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"><Icon className="w-5 h-5 text-primary" /></div>
                        <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">{r.badge}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-1">{r.category}</p>
                        <h3 className="font-bold text-sm mb-1.5 group-hover:text-primary transition-colors">{r.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{r.description}</p>
                      </div>
                      <div className="mt-3 flex items-center gap-1 text-xs text-primary font-medium">Visit <ExternalLink className="w-3 h-3 ml-1" /></div>
                    </a>
                  );
                })}
              </div>
            </>
          )}
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
                <Button className="rounded-full gap-2" onClick={handleShare}>
                  <Share2 className="w-4 h-4" /> Share Your Score
                </Button>
              )}
              <Button variant="outline" className="rounded-full gap-2" onClick={handleShare}>
                <Share2 className="w-4 h-4" /> Share
              </Button>
            </div>
          </div>
        </section>

        {/* FEEDBACK */}
        <section className="pb-4 print:hidden">
          <FeedbackWidget reportId={reportId} />
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}
