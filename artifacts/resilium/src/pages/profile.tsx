import React, { useState, useCallback, useEffect, useRef } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser, useAuth, useClerk } from "@clerk/react";
import { ResilientIcon } from "@/components/resilient-icon";
import { RadarChartView } from "@/components/radar-chart-view";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";

import {
  Trash2,
  Eye,
  AlertTriangle,
  Loader2,
  CalendarDays,
  User,
  LogIn,
  GitCompare,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  ChevronRight,
  MapPin,
  LineChart as LineChartIcon,
  Activity,
  Shield,
  Heart,
  DollarSign,
  Brain,
  Home,
  Leaf,
  Target,
  Bell,
  Download,
  ChevronDown,
  ChevronUp,
  BarChart2,
  Clock,
  Flame,
  Award,
  Smartphone,
  FileText,
  Bot,
  BookOpen,
  Send,
  WifiOff,
  MessageSquare,
  Lock,
  BookMarked,
} from "lucide-react";
import { guides, getEssentialGuides, getGuidesByLocation, getGuidesByDimension, type Guide } from "@/data/guides";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const PLAN_LIMIT = 3;

interface PlanSummary {
  reportId: string;
  createdAt: string;
  scoreOverall: number;
  scoreFinancial: number;
  scoreHealth: number;
  scoreSkills: number;
  scoreMobility: number;
  scorePsychological: number;
  scoreResources: number;
  location: string;
  currency: string;
  primaryGoal?: string | null;
  totalItems?: number;
  completedItems?: number;
}

interface ScoreMap {
  overall: number;
  financial: number;
  health: number;
  skills: number;
  mobility: number;
  psychological: number;
  resources: number;
}

interface CompareResult {
  reportA: { reportId: string; createdAt: string; score: ScoreMap; location: string };
  reportB: { reportId: string; createdAt: string; score: ScoreMap; location: string };
  deltas: Record<string, number>;
  conclusions: {
    headline: string;
    whatImproved: string[];
    whatDeclined: string[] | null;
    keyInsight: string;
    nextSteps: string[];
  };
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  pathway: string;
}

interface ChecklistsByArea {
  [area: string]: ChecklistItem[];
}

interface ProgressItem {
  area: string;
  itemId: string;
  completed: boolean;
  completedAt: string | null;
}

const DIM_KEYS = ["financial", "health", "skills", "mobility", "psychological", "resources"] as const;
type DimKey = typeof DIM_KEYS[number];

const DIM_LABELS: Record<DimKey, string> = {
  financial: "Financial",
  health: "Health",
  skills: "Skills",
  mobility: "Mobility",
  psychological: "Psychological",
  resources: "Resources",
};

const AREA_LABELS: Record<string, string> = {
  financial: "Financial",
  health: "Health",
  skills: "Skills & Knowledge",
  mobility: "Mobility & Housing",
  psychological: "Mental Resilience",
  resources: "Emergency Resources",
};

const AREA_ICONS: Record<string, React.ReactNode> = {
  financial: <DollarSign className="w-4 h-4" />,
  health: <Heart className="w-4 h-4" />,
  skills: <Brain className="w-4 h-4" />,
  mobility: <Home className="w-4 h-4" />,
  psychological: <Leaf className="w-4 h-4" />,
  resources: <Shield className="w-4 h-4" />,
};

const PRIORITY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  critical: { bg: "bg-red-500/20",    text: "text-red-600",    label: "Critical" },
  high:     { bg: "bg-amber-500/15",  text: "text-amber-700",  label: "High" },
  medium:   { bg: "bg-sky-500/15",    text: "text-sky-700",    label: "Medium" },
  low:      { bg: "bg-gray-100",      text: "text-gray-500",   label: "Low" },
};

async function fetchMyPlans(): Promise<{ plans: PlanSummary[] }> {
  const res = await fetch("/api/users/me/plans", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch plans");
  return res.json();
}

async function deletePlan(reportId: string): Promise<void> {
  const res = await fetch(`/api/users/me/plans/${reportId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete plan");
}

async function comparePlans(reportIdA: string, reportIdB: string): Promise<CompareResult> {
  const res = await fetch("/api/users/me/plans/compare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ reportIdA, reportIdB }),
  });
  if (!res.ok) throw new Error("Failed to compare plans");
  return res.json();
}

function getScoreLabel(score: number) {
  if (score >= 70) return { label: "Highly Resilient", variant: "default" as const };
  if (score >= 40) return { label: "Moderately Prepared", variant: "secondary" as const };
  return { label: "Critically Vulnerable", variant: "destructive" as const };
}

function getScoreColorClass(score: number) {
  if (score >= 70) return "text-emerald-500";
  if (score >= 40) return "text-amber-500";
  return "text-destructive";
}

function DeltaBadge({ delta }: { delta: number }) {
  const abs = Math.abs(delta);
  if (abs < 0.5) return (
    <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
      <Minus className="w-3 h-3" /> {delta.toFixed(0)}
    </span>
  );
  if (delta > 0) return (
    <span className="inline-flex items-center gap-0.5 text-xs text-emerald-500 font-semibold">
      <TrendingUp className="w-3 h-3" /> +{delta.toFixed(0)}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-0.5 text-xs text-destructive font-semibold">
      <TrendingDown className="w-3 h-3" /> {delta.toFixed(0)}
    </span>
  );
}

const SCORE_DIMS: { key: keyof ScoreMap; label: string }[] = [
  { key: "financial", label: "Financial" },
  { key: "health", label: "Health" },
  { key: "skills", label: "Skills" },
  { key: "mobility", label: "Mobility" },
  { key: "psychological", label: "Psychological" },
  { key: "resources", label: "Resources" },
];

// ─── Compare Modal ──────────────────────────────────────────────────────────
function CompareModal({
  open, onClose, reportIdA, reportIdB,
}: { open: boolean; onClose: () => void; reportIdA: string; reportIdB: string }) {
  const { data, isLoading, error } = useQuery<CompareResult>({
    queryKey: ["compare", reportIdA, reportIdB],
    queryFn: () => comparePlans(reportIdA, reportIdB),
    enabled: open && !!reportIdA && !!reportIdB,
    staleTime: 5 * 60 * 1000,
  });

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

  const daysBetween = data
    ? Math.round((new Date(data.reportB.createdAt).getTime() - new Date(data.reportA.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border sticky top-0 bg-background z-10">
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-primary" /> Report Comparison
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Generating AI analysis…</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <AlertTriangle className="w-8 h-8 text-destructive" />
            <p className="text-sm text-muted-foreground">Failed to generate comparison. Please try again.</p>
          </div>
        )}

        {data && (
          <div className="px-6 pb-8 space-y-8 pt-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3 text-sm">
                <span className="font-semibold text-foreground">{fmtDate(data.reportA.createdAt)}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold text-foreground">{fmtDate(data.reportB.createdAt)}</span>
              </div>
              {daysBetween !== null && (
                <Badge variant="secondary" className="rounded-full text-xs">
                  {daysBetween === 0 ? "Same day" : `${daysBetween} day${daysBetween === 1 ? "" : "s"} apart`}
                </Badge>
              )}
            </div>

            <Card className="border border-border rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="grid grid-cols-2 divide-x divide-border">
                  {[{ label: "Earlier", report: data.reportA }, { label: "Later", report: data.reportB }].map(({ label, report }) => (
                    <div key={report.reportId} className="flex flex-col items-center py-6 px-4 gap-1">
                      <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{label}</span>
                      <span className={`text-4xl font-display font-bold ${getScoreColorClass(report.score.overall)}`}>
                        {Math.round(report.score.overall)}
                      </span>
                      <span className="text-xs text-muted-foreground">/ 100</span>
                      <Badge variant={getScoreLabel(report.score.overall).variant} className="rounded-full text-xs mt-1">
                        {getScoreLabel(report.score.overall).label}
                      </Badge>
                      <Link href={`/results/${report.reportId}`}>
                        <Button variant="ghost" size="sm" className="mt-2 rounded-full text-xs gap-1">
                          <Eye className="w-3 h-3" /> View Report
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
                <div className={`flex items-center justify-center gap-2 py-2 text-sm font-semibold border-t border-border ${
                  data.deltas.overall > 0.5 ? "bg-emerald-500/10 text-emerald-600"
                    : data.deltas.overall < -0.5 ? "bg-destructive/10 text-destructive"
                    : "bg-muted/50 text-muted-foreground"
                }`}>
                  <DeltaBadge delta={data.deltas.overall} />
                  <span>{data.deltas.overall > 0.5 ? "overall improvement" : data.deltas.overall < -0.5 ? "overall decline" : "no significant change"}</span>
                </div>
              </CardContent>
            </Card>

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Dimension Overlay</h3>
              <div className="h-64 w-full">
                <RadarChartView score={data.reportB.score} previousScore={data.reportA.score} />
              </div>
              <div className="flex items-center justify-center gap-6 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-0.5 bg-[#2A3B32]" /> Later</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-0.5 bg-[#9CA3AF] border-dashed border border-[#9CA3AF]" /> Earlier</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Score Breakdown</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SCORE_DIMS.map(({ key, label }) => {
                  const scoreA = data.reportA.score[key];
                  const scoreB = data.reportB.score[key];
                  const delta = data.deltas[key];
                  return (
                    <div key={key} className="rounded-xl border border-border p-3 flex flex-col gap-1.5">
                      <span className="text-xs text-muted-foreground font-medium">{label}</span>
                      <div className="flex items-end gap-2">
                        <span className="text-lg font-display font-bold text-foreground">{Math.round(scoreB)}</span>
                        <span className="text-xs text-muted-foreground mb-0.5">from {Math.round(scoreA)}</span>
                      </div>
                      <DeltaBadge delta={delta} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">AI Analysis</h3>
              <div className="rounded-2xl bg-primary/5 border border-primary/20 px-5 py-4">
                <p className="font-display font-semibold text-foreground text-lg leading-snug">{data.conclusions.headline}</p>
              </div>
              <div className="flex gap-3">
                <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground/80 leading-relaxed">{data.conclusions.keyInsight}</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {data.conclusions.whatImproved?.length > 0 && (
                  <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-3">What Improved</h4>
                    <ul className="space-y-2">
                      {data.conclusions.whatImproved.map((item, i) => (
                        <li key={i} className="flex gap-2 text-sm text-foreground/80">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {data.conclusions.whatDeclined && data.conclusions.whatDeclined.length > 0 && (
                  <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-destructive mb-3">Needs Attention</h4>
                    <ul className="space-y-2">
                      {data.conclusions.whatDeclined.map((item, i) => (
                        <li key={i} className="flex gap-2 text-sm text-foreground/80">
                          <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {data.conclusions.nextSteps?.length > 0 && (
                <div className="rounded-xl border border-border p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Recommended Next Steps</h4>
                  <ol className="space-y-2">
                    {data.conclusions.nextSteps.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm text-foreground/80">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

// ─── Overview Tab ────────────────────────────────────────────────────────────
function OverviewTab({ plans }: { plans: PlanSummary[] }) {
  const { data: checklistFocusData } = useQuery({
    queryKey: ["latestChecklist"],
    queryFn: async () => {
      const res = await fetch("/api/users/me/latest-checklist", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: plans.length > 0,
    staleTime: 60_000,
  });

  const { data: focusProgress } = useQuery<ProgressItem[]>({
    queryKey: ["checklistProgress", checklistFocusData?.reportId],
    queryFn: async () => {
      const res = await fetch(`/api/resilience/reports/${checklistFocusData?.reportId}/checklists`, { credentials: "include" });
      if (!res.ok) return [];
      const json = await res.json();
      return json.progress ?? [];
    },
    enabled: !!checklistFocusData?.reportId,
    staleTime: 60_000,
  });

  if (plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <BarChart2 className="w-8 h-8 text-primary/60" />
        </div>
        <div>
          <h3 className="text-lg font-display font-semibold mb-1">No data yet</h3>
          <p className="text-muted-foreground text-sm max-w-xs">Complete your first resilience assessment to see your overview here.</p>
        </div>
        <Link href="/assess">
          <Button className="rounded-full gap-2 mt-2">Get Started <ChevronRight className="w-4 h-4" /></Button>
        </Link>
      </div>
    );
  }

  const latest = plans[plans.length - 1];
  const first = plans[0];
  const hasMultiple = plans.length >= 2;
  const trendDelta = hasMultiple ? Math.round((latest.scoreOverall - first.scoreOverall) * 10) / 10 : null;

  const daysSinceLast = Math.floor((Date.now() - new Date(latest.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  const firstDate = new Date(first.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" });

  // Derive most-improved and consistently-lowest dims (needs 2+ plans)
  let mostImprovedDim: DimKey | null = null;
  let consistentlyLowestDim: DimKey | null = null;

  if (hasMultiple) {
    const getDimScore = (plan: PlanSummary, dim: DimKey) => {
      const map: Record<DimKey, number> = {
        financial: plan.scoreFinancial,
        health: plan.scoreHealth,
        skills: plan.scoreSkills,
        mobility: plan.scoreMobility,
        psychological: plan.scorePsychological,
        resources: plan.scoreResources,
      };
      return map[dim];
    };

    let maxDelta = -Infinity;
    let minAvg = Infinity;

    for (const dim of DIM_KEYS) {
      const delta = getDimScore(latest, dim) - getDimScore(first, dim);
      if (delta > maxDelta) { maxDelta = delta; mostImprovedDim = dim; }

      const avg = plans.reduce((sum, p) => sum + getDimScore(p, dim), 0) / plans.length;
      if (avg < minAvg) { minAvg = avg; consistentlyLowestDim = dim; }
    }
  }

  const chartData = [...plans]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((p) => ({
      date: new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: Math.round(p.scoreOverall),
    }));

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Latest score */}
        <Card className="border-none shadow-md sm:col-span-1">
          <CardContent className="p-6 flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">Current Score</span>
            <div className="flex items-end gap-2">
              <span className={`text-5xl font-display font-bold ${getScoreColorClass(latest.scoreOverall)}`}>
                {Math.round(latest.scoreOverall)}
              </span>
              <span className="text-muted-foreground mb-1 text-sm">/ 100</span>
            </div>
            <Badge variant={getScoreLabel(latest.scoreOverall).variant} className="rounded-full w-fit text-xs">
              {getScoreLabel(latest.scoreOverall).label}
            </Badge>
            {trendDelta !== null && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs text-muted-foreground">vs. first assessment:</span>
                <DeltaBadge delta={trendDelta} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="border-none shadow-md sm:col-span-2">
          <CardContent className="p-6 grid grid-cols-2 gap-4 h-full">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                <Flame className="w-4 h-4 text-primary" />
                <span className="text-xs uppercase tracking-wider font-semibold">Assessments</span>
              </div>
              <span className="text-3xl font-display font-bold text-foreground">{plans.length}</span>
              <span className="text-xs text-muted-foreground">since {firstDate}</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-xs uppercase tracking-wider font-semibold">Last Check-in</span>
              </div>
              <span className="text-3xl font-display font-bold text-foreground">{daysSinceLast}</span>
              <span className="text-xs text-muted-foreground">day{daysSinceLast !== 1 ? "s" : ""} ago</span>
            </div>
            {mostImprovedDim && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs uppercase tracking-wider font-semibold">Most Improved</span>
                </div>
                <span className="text-sm font-semibold text-emerald-500">{DIM_LABELS[mostImprovedDim]}</span>
                <span className="text-xs text-muted-foreground">since first report</span>
              </div>
            )}
            {consistentlyLowestDim && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                  <Target className="w-4 h-4 text-amber-500" />
                  <span className="text-xs uppercase tracking-wider font-semibold">Focus Area</span>
                </div>
                <span className="text-sm font-semibold text-amber-500">{DIM_LABELS[consistentlyLowestDim]}</span>
                <span className="text-xs text-muted-foreground">consistently lowest</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress line chart */}
      {hasMultiple && (
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <LineChartIcon className="w-4 h-4 text-primary" /> Score Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 12 }}
                  labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 700 }}
                  itemStyle={{ color: "hsl(var(--primary))" }}
                />
                <ReferenceLine y={70} stroke="rgba(16,185,129,0.25)" strokeDasharray="4 4" />
                <ReferenceLine y={40} stroke="rgba(245,158,11,0.25)" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-6 mt-1 text-xs text-muted-foreground justify-end">
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-px bg-emerald-500/40 border-t border-dashed border-emerald-500/40" /> Highly Resilient (70+)</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-px bg-amber-500/40 border-t border-dashed border-amber-500/40" /> Moderately Prepared (40+)</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* This Week's Focus */}
      {(() => {
        if (!checklistFocusData?.checklistsByArea || !checklistFocusData?.reportId) return null;
        const progressMap: Record<string, boolean> = {};
        for (const item of focusProgress ?? []) {
          progressMap[`${item.area}:${item.itemId}`] = item.completed;
        }
        const focusItems: Array<{ area: string; item: ChecklistItem }> = [];
        for (const area of ["financial", "health", "skills", "mobility", "psychological", "resources"]) {
          for (const item of checklistFocusData.checklistsByArea[area] ?? []) {
            if (!progressMap[`${area}:${item.id}`]) {
              focusItems.push({ area, item });
            }
          }
        }
        focusItems.sort((a, b) => (PRIORITY_ORDER[a.item.priority] ?? 3) - (PRIORITY_ORDER[b.item.priority] ?? 3));
        const topItems = focusItems.slice(0, 3);
        if (topItems.length === 0) return null;
        const priorityColors: Record<string, string> = {
          critical: "text-destructive border-destructive/30 bg-destructive/5",
          high: "text-amber-700 border-amber-300 bg-amber-50",
          medium: "text-blue-700 border-blue-200 bg-blue-50",
          low: "text-muted-foreground border-border bg-muted/30",
        };
        return (
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" /> This Week's Focus
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 pb-4">
              {topItems.map(({ area, item }) => (
                <div key={item.id} className="flex items-start gap-3 py-2 border-b border-border/20 last:border-0">
                  <div className="w-4 h-4 rounded-full border-2 border-primary/30 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-snug">{item.title}</p>
                    <span className="text-xs text-muted-foreground capitalize">{DIM_LABELS[area as DimKey] ?? area}</span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize flex-shrink-0 ${priorityColors[item.priority] ?? priorityColors.low}`}>
                    {item.priority}
                  </span>
                </div>
              ))}
              <div className="pt-2">
                <Link href="/profile?tab=checklist">
                  <button type="button" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                    See all checklist items <ChevronRight className="w-3 h-3" />
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* CTA if only 1 plan */}
      {!hasMultiple && (
        <div className="rounded-2xl bg-primary/5 border border-primary/15 px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Track your progress over time</p>
            <p className="text-xs text-muted-foreground mt-0.5">Take a second assessment to unlock trend analysis and score comparison.</p>
          </div>
          <Link href="/assessment">
            <Button size="sm" className="rounded-full gap-1.5 flex-shrink-0">
              Reassess <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Checklist Tab ───────────────────────────────────────────────────────────
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

function ChecklistTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const { data: checklistData, isLoading: checklistLoading } = useQuery<{
    reportId: string | null;
    checklistsByArea: ChecklistsByArea | null;
    location: string | null;
    createdAt: string | null;
    primaryGoal: string | null;
    successVision: string | null;
  }>({
    queryKey: ["latestChecklist"],
    queryFn: async () => {
      const res = await fetch("/api/users/me/latest-checklist", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch checklist");
      return res.json();
    },
  });

  const reportId = checklistData?.reportId ?? null;

  const { data: progressData, isLoading: progressLoading } = useQuery<ProgressItem[]>({
    queryKey: ["checklistProgress", reportId],
    queryFn: async () => {
      const res = await fetch(`/api/resilience/reports/${reportId}/checklists`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch progress");
      const json = await res.json();
      return json.progress ?? [];
    },
    enabled: !!reportId,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ area, itemId, completed }: { area: string; itemId: string; completed: boolean }) => {
      const res = await fetch(`/api/resilience/reports/${reportId}/checklists/${area}/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ completed }),
      });
      if (!res.ok) throw new Error("Failed to update");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklistProgress", reportId] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save progress.", variant: "destructive" });
    },
  });

  const isLoading = checklistLoading || (!!reportId && progressLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!checklistData?.checklistsByArea || !reportId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-primary/60" />
        </div>
        <div>
          <h3 className="text-lg font-display font-semibold mb-1">No checklist yet</h3>
          <p className="text-muted-foreground text-sm max-w-xs">Complete an assessment to get a personalized action checklist.</p>
        </div>
        <Link href="/assessment">
          <Button className="rounded-full gap-2 mt-2">Start Assessment <ChevronRight className="w-4 h-4" /></Button>
        </Link>
      </div>
    );
  }

  const checklistsByArea = checklistData.checklistsByArea;
  const progressMap: Record<string, boolean> = {};
  for (const item of progressData ?? []) {
    progressMap[`${item.area}:${item.itemId}`] = item.completed;
  }

  const AREA_ORDER = ["financial", "health", "skills", "mobility", "psychological", "resources"];
  const sortedAreas = AREA_ORDER.filter((a) => checklistsByArea[a]?.length > 0);

  const totalItems = sortedAreas.reduce((s, a) => s + (checklistsByArea[a]?.length ?? 0), 0);
  const completedItems = sortedAreas.reduce((s, a) => {
    return s + (checklistsByArea[a] ?? []).filter((item) => progressMap[`${a}:${item.id}`]).length;
  }, 0);
  const overallPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const primaryGoal = checklistData?.primaryGoal ?? null;
  const successVision = checklistData?.successVision ?? null;
  const goalLabel = primaryGoal ? (GOAL_LABELS[primaryGoal] ?? primaryGoal) : null;
  const goalIcon = primaryGoal ? (GOAL_ICONS[primaryGoal] ?? "⚡") : null;

  return (
    <div className="space-y-5">
      {/* GOAL REMINDER */}
      {goalLabel && (
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
      )}

      {/* Overall progress bar */}
      <Card className="border-none shadow-md">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Overall Progress</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {completedItems} of {totalItems} items complete
                {checklistData.location && ` · Latest plan: ${checklistData.location}`}
              </p>
            </div>
            <span className={`text-2xl font-display font-bold ${overallPct >= 70 ? "text-emerald-500" : overallPct >= 40 ? "text-amber-500" : "text-destructive"}`}>
              {overallPct}%
            </span>
          </div>
          <Progress value={overallPct} className="h-2.5" />
        </CardContent>
      </Card>

      {/* Area sections */}
      {sortedAreas.map((area) => {
        const items = checklistsByArea[area] ?? [];
        const done = items.filter((item) => progressMap[`${area}:${item.id}`]).length;
        const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0;
        const isCollapsed = collapsed[area] ?? false;

        return (
          <Card key={area} className="border-none shadow-md overflow-hidden">
            <button
              className="w-full text-left"
              onClick={() => setCollapsed((prev) => ({ ...prev, [area]: !isCollapsed }))}
            >
              <CardHeader className="pb-3 pt-4 px-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      {AREA_ICONS[area] ?? <Shield className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{AREA_LABELS[area] ?? area}</p>
                      <p className="text-xs text-muted-foreground">{done}/{items.length} done</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 w-24">
                      <Progress value={pct} className="h-1.5 flex-1" />
                      <span className="text-xs font-semibold text-muted-foreground w-8 text-right">{pct}%</span>
                    </div>
                    {isCollapsed ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>
              </CardHeader>
            </button>

            {!isCollapsed && (
              <CardContent className="px-5 pb-4 pt-0 space-y-2.5">
                <div className="h-px bg-border mb-3" />
                {items.map((item) => {
                  const key = `${area}:${item.id}`;
                  const isChecked = progressMap[key] ?? false;
                  const ps = PRIORITY_STYLES[item.priority] ?? PRIORITY_STYLES.low;

                  return (
                    <div
                      key={item.id}
                      className={`flex gap-3 p-4 rounded-xl border transition-colors shadow-sm ${isChecked ? "bg-emerald-50/40 border-emerald-300 opacity-80" : "bg-white/90 border-slate-200"}`}
                    >
                      <Checkbox
                        id={key}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          toggleMutation.mutate({ area, itemId: item.id, completed: !!checked });
                        }}
                        className="mt-0.5 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 flex-wrap">
                          <label
                            htmlFor={key}
                            className={`text-sm font-medium cursor-pointer leading-snug ${isChecked ? "line-through text-gray-400" : "text-gray-900"}`}
                          >
                            {item.title}
                          </label>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase flex-shrink-0 ${ps.bg} ${ps.text}`}>
                            {ps.label}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ─── Account Tab ─────────────────────────────────────────────────────────────
const REMINDER_OPTIONS = [
  { label: "30 days", value: 30 },
  { label: "60 days", value: 60 },
  { label: "90 days", value: 90 },
];

function AccountTab({ user, plans, onAllPlansDeleted }: {
  user: { id: string; firstName?: string | null; lastName?: string | null; email?: string | null; profileImageUrl?: string | null; username?: string | null };
  plans: PlanSummary[];
  onAllPlansDeleted: () => void;
}) {
  const { toast } = useToast();
  const { openUserProfile } = useClerk();
  const { user: clerkUser } = useUser();

  const { data: subStatus } = useQuery({
    queryKey: ["subscription-status"],
    queryFn: async () => {
      const r = await fetch("/api/subscription/status", { credentials: "include" });
      if (!r.ok) return null;
      return r.json() as Promise<{ isPro: boolean; status: string; planName?: string; currentPeriodEnd?: string | null; cancelScheduled?: boolean }>;
    },
    staleTime: 60_000,
  });
  const [, navigate] = useLocation();
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const reminderKey = "resilium_reminder_days";
  const [reminderDays, setReminderDays] = useState<number | null>(() => {
    const v = localStorage.getItem(reminderKey);
    return v ? parseInt(v, 10) : null;
  });

  const setReminder = (days: number | null) => {
    if (days === null) localStorage.removeItem(reminderKey);
    else localStorage.setItem(reminderKey, String(days));
    setReminderDays(days);
    toast({ title: "Preference saved", description: days ? `You'll be reminded to reassess every ${days} days.` : "Reminders turned off." });
  };

  // Compute due date if reminder is set
  const latestPlan = plans.length > 0 ? plans[plans.length - 1] : null;
  let dueInDays: number | null = null;
  if (reminderDays && latestPlan) {
    const lastDate = new Date(latestPlan.createdAt).getTime();
    const dueDate = lastDate + reminderDays * 24 * 60 * 60 * 1000;
    dueInDays = Math.round((dueDate - Date.now()) / (1000 * 60 * 60 * 24));
  }

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/users/me/export", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resilium-data-export.json";
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Export downloaded", description: "Your data has been downloaded as JSON." });
    } catch {
      toast({ title: "Export failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAllPlans = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/users/me/plans", { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "All plans deleted", description: "Your resilience history has been cleared." });
      setDeleteAllOpen(false);
      onAllPlansDeleted();
    } catch {
      toast({ title: "Error", description: "Failed to delete plans.", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/users/me", { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Account deleted", description: "All your Resilium data has been removed." });
      navigate("/");
    } catch {
      toast({ title: "Error", description: "Failed to delete account.", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Profile card */}
      <Card className="border-none shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> User Details
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          {clerkUser?.imageUrl ? (
            <img src={clerkUser.imageUrl} alt="avatar" className="w-14 h-14 rounded-full object-cover ring-2 ring-border" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xl font-bold text-primary leading-none">
                {[clerkUser?.firstName?.[0], clerkUser?.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "?"}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-base leading-tight">
              {[clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || clerkUser?.username || clerkUser?.primaryEmailAddress?.emailAddress?.split("@")[0] || "—"}
            </p>
            {clerkUser?.username && (
              <p className="text-xs text-primary/80 mt-0.5">@{clerkUser.username}</p>
            )}
            {clerkUser?.primaryEmailAddress?.emailAddress && (
              <p className="text-sm text-muted-foreground mt-0.5 truncate">{clerkUser.primaryEmailAddress.emailAddress}</p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full shrink-0"
            onClick={() => openUserProfile()}
          >
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      {/* Subscription status card */}
      <Card className="border-none shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" /> Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!subStatus ? (
            <div className="h-10 bg-muted/40 rounded-xl animate-pulse" />
          ) : subStatus.isPro ? (
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">
                    {subStatus.planName ?? "Pro"} Plan
                    {subStatus.cancelScheduled && <span className="ml-2 text-xs text-amber-600 font-medium">(cancels at period end)</span>}
                  </p>
                  {subStatus.currentPeriodEnd && (
                    <p className="text-xs text-muted-foreground">
                      {subStatus.cancelScheduled ? "Access until" : "Renews"}{" "}
                      {new Date(subStatus.currentPeriodEnd).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  )}
                </div>
              </div>
              <Badge className="bg-primary/15 text-primary border-primary/20 rounded-full text-xs font-bold">Pro</Badge>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">Starter Plan</p>
                  <p className="text-xs text-muted-foreground">Upgrade for score history, scenario stress-tests, and more</p>
                </div>
              </div>
              <Link href="/pricing">
                <Button size="sm" className="rounded-full flex-shrink-0">Upgrade</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile app */}
      <Card className="border border-primary/20 shadow-md bg-primary/[0.03]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-primary" /> Mobile App
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Take your resilience plan anywhere — on your phone or tablet.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {/* QR code */}
            <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
              <div className="rounded-xl border border-border/60 bg-white p-2 shadow-sm">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=108x108&data=https%3A%2F%2Fresilium-platform.com%2Fresilium-mobile%2F&margin=2&color=1e293b"
                  alt="QR code for Resilium mobile app"
                  width={108}
                  height={108}
                  className="rounded"
                />
              </div>
              <p className="text-[10px] text-muted-foreground text-center">Scan to open on phone</p>
            </div>

            {/* Actions */}
            <div className="flex-1 space-y-3 pt-1">
              <p className="text-sm text-foreground/80 leading-relaxed">
                Review your Resilience Profile, track your progress, and access your action plans on the go. Scan the QR code with your phone camera to open instantly.
              </p>

              {/* App Store — coming soon */}
              <div className="flex items-center gap-3 pt-1">
                <div className="relative">
                  <img
                    src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                    alt="Download on the App Store"
                    className="h-9 opacity-40 select-none pointer-events-none"
                    draggable={false}
                  />
                  <span className="absolute -top-1.5 -right-1 bg-slate-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    Soon
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-snug">
                  iOS App Store listing<br />coming soon
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reminder preference */}
      <Card className="border-none shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" /> Reassessment Reminder
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Choose how often you want to be reminded to reassess your resilience.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {REMINDER_OPTIONS.map(({ label, value }) => (
              <Button
                key={value}
                variant={reminderDays === value ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setReminder(reminderDays === value ? null : value)}
              >
                {label}
              </Button>
            ))}
            {reminderDays && (
              <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground" onClick={() => setReminder(null)}>
                <X className="w-3.5 h-3.5 mr-1" /> Off
              </Button>
            )}
          </div>
          {reminderDays && dueInDays !== null && (
            <div className={`flex items-center gap-2 text-sm rounded-xl px-4 py-3 ${dueInDays <= 0 ? "bg-destructive/10 text-destructive" : "bg-primary/5 text-foreground/80"}`}>
              <Bell className="w-4 h-4 flex-shrink-0" />
              {dueInDays <= 0
                ? `Your reassessment is overdue by ${Math.abs(dueInDays)} day${Math.abs(dueInDays) !== 1 ? "s" : ""}.`
                : `Next reassessment due in ${dueInDays} day${dueInDays !== 1 ? "s" : ""}.`}
            </div>
          )}
          {!reminderDays && (
            <p className="text-xs text-muted-foreground">No reminder set. Select an interval above.</p>
          )}
        </CardContent>
      </Card>

      {/* Data export */}
      <Card className="border-none shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Download className="w-4 h-4 text-primary" /> Export My Data
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Download all your Resilium data as a JSON file. Includes all assessment reports and scores.
          </p>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={handleExport} disabled={exporting || plans.length === 0}>
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {plans.length === 0 ? "No data to export" : "Download JSON"}
          </Button>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border border-destructive/30 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display text-destructive flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-destructive/5 border border-destructive/20">
            <div>
              <p className="text-sm font-medium text-foreground">Delete all plans</p>
              <p className="text-xs text-muted-foreground mt-0.5">Permanently remove all your resilience reports and history.</p>
            </div>
            <Button variant="destructive" size="sm" className="rounded-full flex-shrink-0" onClick={() => setDeleteAllOpen(true)} disabled={plans.length === 0}>
              Delete All
            </Button>
          </div>
          <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-destructive/5 border border-destructive/20">
            <div>
              <p className="text-sm font-medium text-foreground">Delete account</p>
              <p className="text-xs text-muted-foreground mt-0.5">Remove all your Resilium data. Your sign-in account is unaffected.</p>
            </div>
            <Button variant="destructive" size="sm" className="rounded-full flex-shrink-0" onClick={() => setDeleteAccountOpen(true)}>
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete all plans confirm */}
      <AlertDialog open={deleteAllOpen} onOpenChange={setDeleteAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all plans?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove all {plans.length} of your resilience reports and your progress history. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAllPlans} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Delete All Plans
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete account confirm */}
      <AlertDialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              All your Resilium data — including {plans.length} report{plans.length !== 1 ? "s" : ""}, scores, and checklist progress — will be permanently deleted. Your sign-in account remains active.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Yes, Delete Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Score History Chart ─────────────────────────────────────────────────────
type ScoreSnapshot = {
  date: string;
  overall: number | null;
  financial?: number | null;
  health?: number | null;
  skills?: number | null;
  mobility?: number | null;
  psychological?: number | null;
  resources?: number | null;
};

const DIM_COLORS: Record<string, string> = {
  overall:       "hsl(var(--primary))",
  financial:     "#60A5FA",
  health:        "#34D399",
  skills:        "#A78BFA",
  mobility:      "#FBBF24",
  psychological: "#F472B6",
  resources:     "#38BDF8",
};

function ScoreHistorySection() {
  const { data, isLoading } = useQuery<{ snapshots: ScoreSnapshot[]; isPro: boolean }>({
    queryKey: ["scoreHistory"],
    queryFn: () => fetch("/api/users/me/score-history", { credentials: "include" }).then(r => r.json()),
    staleTime: 60_000,
  });

  if (isLoading) return (
    <div className="flex items-center justify-center py-10">
      <Loader2 className="w-5 h-5 text-primary animate-spin" />
    </div>
  );

  const snapshots = data?.snapshots ?? [];
  const isPro = data?.isPro ?? false;

  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const chartData = snapshots.map(s => ({ ...s, date: fmtDate(s.date) }));

  if (snapshots.length === 0) {
    return (
      <div className="rounded-2xl border bg-card/60 px-6 py-8 text-center text-sm text-muted-foreground space-y-2">
        <Activity className="w-8 h-8 mx-auto text-muted-foreground/40" />
        <p className="font-medium text-foreground/70">No score history yet</p>
        <p className="text-xs max-w-xs mx-auto">Complete your first assessment to start tracking your resilience score over time.</p>
      </div>
    );
  }

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> Score History
          </CardTitle>
          {isPro && (
            <span className="text-xs font-bold bg-primary/15 text-primary border border-primary/30 rounded-full px-2 py-0.5">PRO</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="relative">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={28} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 12 }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 700 }}
            />
            <ReferenceLine y={70} stroke="rgba(16,185,129,0.2)" strokeDasharray="4 4" />
            <ReferenceLine y={40} stroke="rgba(245,158,11,0.2)" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="overall" name="Overall" stroke={DIM_COLORS.overall} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            {isPro && (
              <>
                <Line type="monotone" dataKey="financial" name="Financial" stroke={DIM_COLORS.financial} strokeWidth={1.5} dot={false} opacity={0.8} />
                <Line type="monotone" dataKey="health" name="Health" stroke={DIM_COLORS.health} strokeWidth={1.5} dot={false} opacity={0.8} />
                <Line type="monotone" dataKey="skills" name="Skills" stroke={DIM_COLORS.skills} strokeWidth={1.5} dot={false} opacity={0.8} />
                <Line type="monotone" dataKey="mobility" name="Mobility" stroke={DIM_COLORS.mobility} strokeWidth={1.5} dot={false} opacity={0.8} />
                <Line type="monotone" dataKey="psychological" name="Psychological" stroke={DIM_COLORS.psychological} strokeWidth={1.5} dot={false} opacity={0.8} />
                <Line type="monotone" dataKey="resources" name="Resources" stroke={DIM_COLORS.resources} strokeWidth={1.5} dot={false} opacity={0.8} />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  formatter={(value: string) => <span style={{ color: "hsl(var(--muted-foreground))" }}>{value}</span>}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>

        {!isPro && (
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card to-transparent flex flex-col items-center justify-end pb-4 gap-2">
            <p className="text-xs text-muted-foreground font-medium">Dimension breakdown available on Pro</p>
            <Link href="/pricing">
              <Button size="sm" variant="outline" className="rounded-full gap-1.5 text-xs h-7 border-primary/40 text-primary hover:bg-primary/10">
                <Bell className="w-3 h-3" /> Unlock Dimension Lines
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Reports Tab ─────────────────────────────────────────────────────────────
function ReportsTab({ plans }: { plans: PlanSummary[] }) {
  if (plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <FileText className="w-8 h-8 text-primary/60" />
        </div>
        <div>
          <h3 className="text-lg font-display font-semibold mb-1">No reports yet</h3>
          <p className="text-muted-foreground text-sm max-w-xs">Complete your first resilience assessment to see your full report here.</p>
        </div>
        <Link href="/assessment">
          <Button className="rounded-full gap-2 mt-2">Start Assessment <ChevronRight className="w-4 h-4" /></Button>
        </Link>
      </div>
    );
  }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{plans.length} assessment report{plans.length !== 1 ? "s" : ""}</p>
      {[...plans].reverse().map((plan) => {
        const { label, variant } = getScoreLabel(plan.scoreOverall);
        return (
          <Card key={plan.reportId} className="border shadow-md">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarDays className="w-3.5 h-3.5" />
                      <span>{fmtDate(plan.createdAt)}</span>
                      {plan.location && (
                        <>
                          <span className="text-border">·</span>
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[160px]">{plan.location}</span>
                        </>
                      )}
                    </div>
                    <Badge variant={variant} className="rounded-full text-xs">{label}</Badge>
                  </div>

                  <div className="flex items-end gap-2 mb-4">
                    <span className={`text-4xl font-display font-bold ${getScoreColorClass(plan.scoreOverall)}`}>
                      {Math.round(plan.scoreOverall)}
                    </span>
                    <span className="text-muted-foreground mb-1">/ 100</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { key: "scoreFinancial", label: "Financial" },
                      { key: "scoreHealth", label: "Health" },
                      { key: "scoreSkills", label: "Skills" },
                      { key: "scoreMobility", label: "Mobility" },
                      { key: "scorePsychological", label: "Psych." },
                      { key: "scoreResources", label: "Resources" },
                    ].map(({ key, label }) => {
                      const val = plan[key as keyof PlanSummary] as number;
                      return (
                        <div key={key} className="text-center bg-muted/40 rounded-lg py-2 px-1">
                          <div className={`text-lg font-display font-bold ${getScoreColorClass(val)}`}>{Math.round(val)}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/results/${plan.reportId}`}>
                      <Button size="sm" className="rounded-full gap-1.5">
                        <FileText className="w-3.5 h-3.5" /> View Report
                      </Button>
                    </Link>
                    <Link href={`/plan/${plan.reportId}`}>
                      <Button variant="outline" size="sm" className="rounded-full gap-1.5">
                        <Target className="w-3.5 h-3.5" /> Action Plan
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Plans Tab ───────────────────────────────────────────────────────────────
function PlansTab({ plans, onDelete }: { plans: PlanSummary[]; onDelete: (id: string) => void }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (reportId: string) => fetch(`/api/users/me/plans/${reportId}`, { method: "DELETE", credentials: "include" }).then(r => { if (!r.ok) throw new Error(); }),
    onSuccess: (_d, reportId) => {
      queryClient.invalidateQueries({ queryKey: ["myPlans"] });
      queryClient.invalidateQueries({ queryKey: ["latestChecklist"] });
      toast({ title: "Plan deleted" });
      onDelete(reportId);
    },
    onError: () => toast({ title: "Error", description: "Failed to delete plan.", variant: "destructive" }),
  });

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  }

  function exitCompareMode() {
    setCompareMode(false);
    setSelectedIds([]);
  }

  const atLimit = plans.length >= PLAN_LIMIT;

  if (plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Activity className="w-8 h-8 text-primary/60" />
        </div>
        <div>
          <h3 className="text-lg font-display font-semibold mb-1">No plans yet</h3>
          <p className="text-muted-foreground text-sm max-w-xs">Take your first resilience assessment to create a plan.</p>
        </div>
        <Link href="/assessment">
          <Button className="rounded-full gap-2 mt-2">Start Assessment <ChevronRight className="w-4 h-4" /></Button>
        </Link>
      </div>
    );
  }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="space-y-4">
      {/* Score History Chart */}
      <ScoreHistorySection />

      {/* Header bar */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{plans.length} of {PLAN_LIMIT} plans used</p>
        <div className="flex items-center gap-2">
          {plans.length >= 2 && !compareMode && (
            <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={() => { setCompareMode(true); setSelectedIds([]); }}>
              <GitCompare className="w-4 h-4" /> Compare
            </Button>
          )}
          {compareMode && (
            <Button variant="ghost" size="sm" className="rounded-full gap-2 text-muted-foreground" onClick={exitCompareMode}>
              <X className="w-4 h-4" /> Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Upgrade nudge */}
      {atLimit && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-foreground/80">You've reached the {PLAN_LIMIT}-plan limit. Delete old plans or upgrade for unlimited access.</p>
          </div>
          <Link href="/pricing">
            <Button size="sm" className="rounded-full flex-shrink-0 gap-1.5">
              Upgrade
            </Button>
          </Link>
        </div>
      )}

      {/* Compare mode instructions */}
      {compareMode && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-2xl bg-primary/5 border border-primary/20">
          <p className="text-sm text-foreground/80">
            {selectedIds.length === 0 && "Select two plans to compare."}
            {selectedIds.length === 1 && "Select one more plan."}
            {selectedIds.length === 2 && "Ready — tap Compare to generate the AI analysis."}
          </p>
          {selectedIds.length === 2 && (
            <Button size="sm" className="rounded-full gap-2 flex-shrink-0" onClick={() => setCompareOpen(true)}>
              <GitCompare className="w-4 h-4" /> Compare <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      )}

      {/* Plan cards */}
      <div className="space-y-4">
        {[...plans].reverse().map((plan) => {
          const { label, variant } = getScoreLabel(plan.scoreOverall);
          const isSelected = selectedIds.includes(plan.reportId);

          return (
            <Card
              key={plan.reportId}
              className={`border shadow-md transition-all ${compareMode && isSelected ? "border-primary ring-1 ring-primary" : "border-border"}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  {compareMode && (
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(plan.reportId)}
                      className="mt-1 flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    {/* Top row */}
                    <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="w-3.5 h-3.5" />
                        <span>{fmtDate(plan.createdAt)}</span>
                        {plan.location && (
                          <>
                            <span className="text-border">·</span>
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[160px]">{plan.location}</span>
                          </>
                        )}
                      </div>
                      <Badge variant={variant} className="rounded-full text-xs">{label}</Badge>
                    </div>

                    {/* Score */}
                    <div className="flex items-end gap-2 mb-4">
                      <span className={`text-4xl font-display font-bold ${getScoreColorClass(plan.scoreOverall)}`}>
                        {Math.round(plan.scoreOverall)}
                      </span>
                      <span className="text-muted-foreground mb-1">/ 100</span>
                    </div>

                    {/* Sub-scores */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { key: "scoreFinancial", label: "Financial" },
                        { key: "scoreHealth", label: "Health" },
                        { key: "scoreSkills", label: "Skills" },
                        { key: "scoreMobility", label: "Mobility" },
                        { key: "scorePsychological", label: "Psych." },
                        { key: "scoreResources", label: "Resources" },
                      ].map(({ key, label }) => {
                        const val = plan[key as keyof PlanSummary] as number;
                        return (
                          <div key={key} className="text-center bg-muted/40 rounded-lg py-2 px-1">
                            <div className={`text-lg font-display font-bold ${getScoreColorClass(val)}`}>{Math.round(val)}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Plan completion progress */}
                    {(plan.totalItems ?? 0) > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-muted-foreground">
                            Plan progress: {plan.completedItems ?? 0} of {plan.totalItems} done
                          </span>
                          <span className="text-xs font-semibold text-primary">
                            {Math.round(((plan.completedItems ?? 0) / (plan.totalItems ?? 1)) * 100)}%
                          </span>
                        </div>
                        <Progress
                          value={Math.round(((plan.completedItems ?? 0) / (plan.totalItems ?? 1)) * 100)}
                          className="h-1.5"
                        />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/plan/${plan.reportId}`}>
                        <Button size="sm" className="rounded-full gap-1.5">
                          <Target className="w-3.5 h-3.5" /> Action Plan
                        </Button>
                      </Link>
                      <Link href={`/results/${plan.reportId}`}>
                        <Button variant="outline" size="sm" className="rounded-full gap-1.5">
                          <Eye className="w-3.5 h-3.5" /> Report
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full gap-1.5 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeletingId(plan.reportId)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Delete confirm */}
      <AlertDialog open={!!deletingId} onOpenChange={(o) => { if (!o) setDeletingId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this plan?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove the plan. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (deletingId) { deleteMutation.mutate(deletingId); setDeletingId(null); } }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Compare modal */}
      {compareOpen && selectedIds.length === 2 && (
        <CompareModal
          open={compareOpen}
          onClose={() => { setCompareOpen(false); exitCompareMode(); }}
          reportIdA={selectedIds[0]}
          reportIdB={selectedIds[1]}
        />
      )}
    </div>
  );
}

// ─── AI Companion Tab ─────────────────────────────────────────────────────────
const COMPANION_CACHE_KEY = "resilium_companion_messages_v1";

type CompanionMessage = { role: "user" | "assistant"; content: string; createdAt: string };

const DIM_COMPANION_QUESTIONS: Record<string, string[]> = {
  financial: [
    "How do I build a financial runway that covers a 6-month income gap?",
    "What's the right order of priorities if my income dropped tomorrow?",
  ],
  health: [
    "What health resilience gaps should I tackle first given my profile?",
    "How do I prepare for a medical emergency when professional help is delayed?",
  ],
  skills: [
    "Which practical skills should I build first based on my current gaps?",
    "How do I future-proof my career against economic disruption?",
  ],
  mobility: [
    "How ready am I actually to evacuate if I had to leave in 2 hours?",
    "What's the most important thing missing from my mobility and go-bag plan?",
  ],
  psychological: [
    "How do I build mental resilience for the specific challenges I'm facing?",
    "What daily habits actually improve stress tolerance over time?",
  ],
  resources: [
    "What critical supplies am I still missing based on my situation?",
    "How do I prioritize my emergency preparedness spending this month?",
  ],
};

function CompanionProGate({ latestPlan }: { latestPlan?: PlanSummary }) {
  const [, navigate] = useLocation();

  const lowestDim: DimKey | undefined = latestPlan ? (() => {
    const scores: Record<DimKey, number> = {
      financial: latestPlan.scoreFinancial,
      health: latestPlan.scoreHealth,
      skills: latestPlan.scoreSkills,
      mobility: latestPlan.scoreMobility,
      psychological: latestPlan.scorePsychological,
      resources: latestPlan.scoreResources,
    };
    return DIM_KEYS.reduce((min, dim) => scores[dim] < scores[min] ? dim : min, DIM_KEYS[0]);
  })() : undefined;

  const lowestScore = lowestDim && latestPlan
    ? Math.round([latestPlan.scoreFinancial, latestPlan.scoreHealth, latestPlan.scoreSkills, latestPlan.scoreMobility, latestPlan.scorePsychological, latestPlan.scoreResources][DIM_KEYS.indexOf(lowestDim)])
    : null;

  const sampleQuestions = lowestDim ? DIM_COMPANION_QUESTIONS[lowestDim] ?? DIM_COMPANION_QUESTIONS.financial : DIM_COMPANION_QUESTIONS.financial;

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto py-10 px-2">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Bot className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-display font-bold mb-1">Talk to a Companion that knows your results</h3>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
            Your AI Companion has read your assessment. It gives guidance specific to your gaps — not generic advice.
          </p>
        </div>
      </div>

      {lowestDim && lowestScore !== null && (
        <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Your lowest area — {DIM_LABELS[lowestDim]} ({lowestScore}/100)
            </span>
          </div>
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Questions you could ask right now:</p>
          <div className="space-y-2">
            {sampleQuestions.map((q, i) => (
              <div key={i} className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-background border border-border/40 select-none">
                <MessageSquare className="w-3.5 h-3.5 text-primary/40 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground/70 italic leading-snug blur-[1.5px] select-none">{q}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        <Button onClick={() => navigate("/pricing")} className="rounded-full px-8 gap-2">
          <Lock className="w-4 h-4" /> Unlock with Pro
        </Button>
        <p className="text-xs text-muted-foreground">Unlimited conversations · Personalized to your scores · Cancel anytime</p>
      </div>
    </div>
  );
}

function CompanionChat() {
  const [messages, setMessages] = useState<CompanionMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/companion/history", { credentials: "include" });
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        const msgs: CompanionMessage[] = data.messages || [];
        setMessages(msgs);
        localStorage.setItem(COMPANION_CACHE_KEY, JSON.stringify(msgs));
      } catch {
        setIsOffline(true);
        const cached = localStorage.getItem(COMPANION_CACHE_KEY);
        if (cached) setMessages(JSON.parse(cached));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, sending]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;
    if (isOffline) {
      toast({ title: "You're offline", description: "A connection is needed to chat.", variant: "destructive" });
      return;
    }
    setInput("");
    setSending(true);
    const userMsg: CompanionMessage = { role: "user", content: text, createdAt: new Date().toISOString() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    try {
      const res = await fetch("/api/companion/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) throw new Error("send failed");
      const data = await res.json();
      const final = [...updated, data.message as CompanionMessage];
      setMessages(final);
      localStorage.setItem(COMPANION_CACHE_KEY, JSON.stringify(final));
    } catch {
      toast({ title: "Couldn't send", description: "Please check your connection and try again.", variant: "destructive" });
      setMessages(messages);
    } finally {
      setSending(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );

  const suggestedPrompts = [
    "What should I focus on improving first?",
    "How can I build a stronger financial safety net?",
    "What would happen to my resilience if I lost my job?",
    "What practical skills should I learn this year?",
  ];

  return (
    <div className="flex flex-col h-[600px] rounded-2xl border border-border/60 overflow-hidden bg-card">
      {isOffline && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-700 text-sm">
          <WifiOff className="w-3.5 h-3.5 flex-shrink-0" />
          Offline — showing cached messages. New messages require a connection.
        </div>
      )}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 && !sending && (
          <div className="flex flex-col items-center text-center py-8 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Bot className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg mb-1">Your AI Companion</h3>
              <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
                I know your assessment results and will give you personalized guidance on planning, resources, and staying motivated through any crisis.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {suggestedPrompts.map(p => (
                <button
                  key={p}
                  className="text-left text-sm px-4 py-3 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground"
                  onClick={() => setInput(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-muted text-foreground rounded-bl-sm"
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-muted-foreground">
              <span className="inline-flex gap-1">
                <span className="animate-bounce" style={{ animationDelay: "0ms" }}>•</span>
                <span className="animate-bounce" style={{ animationDelay: "150ms" }}>•</span>
                <span className="animate-bounce" style={{ animationDelay: "300ms" }}>•</span>
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-border/60 p-4 flex gap-3 items-end">
        <textarea
          className="flex-1 resize-none rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[44px] max-h-32"
          placeholder="Ask your AI Companion…"
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={1}
          maxLength={2000}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
        />
        <Button
          size="icon"
          className="rounded-xl h-11 w-11 flex-shrink-0"
          onClick={sendMessage}
          disabled={!input.trim() || sending}
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}

function CompanionTab({ latestPlan }: { latestPlan?: PlanSummary }) {
  const { data: subStatus, isLoading } = useQuery({
    queryKey: ["subscription-status"],
    queryFn: async () => {
      const r = await fetch("/api/subscription/status", { credentials: "include" });
      if (!r.ok) return null;
      return r.json() as Promise<{ isPro: boolean }>;
    },
    staleTime: 60_000,
  });

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );

  if (!subStatus?.isPro) return <CompanionProGate latestPlan={latestPlan} />;

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-start px-5 py-4 rounded-2xl border border-border/40 bg-muted/20">
        <Bot className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground mb-0.5">Personalized to your assessment</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your AI Companion has access to your resilience scores and assessment answers. It gives guidance specific to your gaps, location, and situation — not generic advice. Ask about planning, resources, specific scenarios, or motivation.
          </p>
        </div>
      </div>
      <CompanionChat />
    </div>
  );
}

// ─── Guides Tab ───────────────────────────────────────────────────────────────
const GUIDES_OFFLINE_KEY = "resilium_guides_downloaded_v1";

function downloadGuide(guide: Guide) {
  const lines: string[] = [
    `RESILIUM CRISIS GUIDE`,
    `═══════════════════════════════════════`,
    `${guide.title}`,
    `${guide.situation} · ${guide.readingTime} read`,
    ``,
    guide.summary,
    ``,
    `═══════════════════════════════════════`,
    ``,
  ];
  guide.sections.forEach(s => {
    lines.push(`── ${s.heading} ──`);
    lines.push(s.content);
    lines.push(``);
  });
  lines.push(`───────────────────────────────────────`);
  lines.push(`Downloaded from Resilium · resilium-platform.com`);
  lines.push(`Available offline at any time.`);
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `resilium-guide-${guide.id}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function GuideCard({ guide }: { guide: Guide }) {
  const [open, setOpen] = useState(false);
  const [openSection, setOpenSection] = useState<number | null>(null);
  const [downloaded, setDownloaded] = useState(() => {
    const saved = localStorage.getItem(GUIDES_OFFLINE_KEY);
    return saved ? JSON.parse(saved).includes(guide.id) : false;
  });

  const handleDownload = () => {
    downloadGuide(guide);
    const saved = localStorage.getItem(GUIDES_OFFLINE_KEY);
    const list: string[] = saved ? JSON.parse(saved) : [];
    if (!list.includes(guide.id)) {
      const updated = [...list, guide.id];
      localStorage.setItem(GUIDES_OFFLINE_KEY, JSON.stringify(updated));
      setDownloaded(true);
    }
  };

  const situationColors: Record<string, string> = {
    "Economic Disruption": "text-amber-700 bg-amber-50 border-amber-200",
    "Natural Disaster": "text-red-700 bg-red-50 border-red-200",
    "Infrastructure Failure": "text-indigo-700 bg-indigo-50 border-indigo-200",
    "Security": "text-purple-700 bg-purple-50 border-purple-200",
    "Health": "text-emerald-700 bg-emerald-50 border-emerald-200",
    "General Emergency": "text-primary bg-primary/10 border-primary/20",
  };
  const situationClass = situationColors[guide.situation] || "text-primary bg-primary/10 border-primary/20";

  return (
    <div className="rounded-2xl border border-border/60 overflow-hidden bg-card">
      <button
        type="button"
        className="w-full flex items-start gap-4 p-5 text-left hover:bg-muted/30 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${situationClass}`}>
              {guide.situation}
            </span>
            {guide.essential && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full border text-primary bg-primary/10 border-primary/20">
                Essential
              </span>
            )}
            <span className="text-xs text-muted-foreground">{guide.readingTime}</span>
          </div>
          <p className="font-semibold text-foreground">{guide.title}</p>
          {!open && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{guide.summary}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            title="Download for offline use"
            onClick={e => { e.stopPropagation(); handleDownload(); }}
            className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
          >
            <Download className={`w-4 h-4 ${downloaded ? "text-primary" : "text-muted-foreground"}`} />
          </button>
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-border/40 px-5 pb-5 pt-4 space-y-1">
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">{guide.summary}</p>
          {guide.sections.map((section, idx) => (
            <div key={idx} className="border-t border-border/30 pt-3">
              <button
                type="button"
                className="w-full flex items-center justify-between text-left py-1 hover:text-primary transition-colors"
                onClick={() => setOpenSection(openSection === idx ? null : idx)}
              >
                <span className="text-sm font-semibold text-foreground">{section.heading}</span>
                {openSection === idx
                  ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                }
              </button>
              {openSection === idx && (
                <p className="text-sm text-muted-foreground leading-relaxed mt-2 whitespace-pre-line">{section.content}</p>
              )}
            </div>
          ))}
          <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-emerald-600">
              <Download className="w-3.5 h-3.5" />
              Download as text file for offline use
            </div>
            <button
              type="button"
              onClick={handleDownload}
              className="text-xs font-medium text-primary hover:underline"
            >
              {downloaded ? "Download again" : "Download guide"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function GuidesTab({ location, lowestDim }: { location?: string; lowestDim?: DimKey }) {
  type GuideFilter = "for-you" | "all" | "essential";
  const [filter, setFilter] = useState<GuideFilter>(lowestDim ? "for-you" : "all");

  const filteredGuides =
    filter === "for-you" && lowestDim ? getGuidesByDimension(lowestDim) :
    filter === "essential" ? getEssentialGuides() :
    location ? getGuidesByLocation(location) : guides;

  const filterOptions: Array<{ id: GuideFilter; label: string; show: boolean }> = [
    { id: "for-you", label: `Recommended for ${lowestDim ? DIM_LABELS[lowestDim] : "You"}`, show: !!lowestDim },
    { id: "all", label: location ? "Relevant to You" : "All Guides", show: true },
    { id: "essential", label: "Essential Only", show: true },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-start px-5 py-4 rounded-2xl border border-border/40 bg-muted/20">
        <BookOpen className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground mb-0.5">Practical crisis guides — always available</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {lowestDim
              ? `Guides personalized to your profile — your ${DIM_LABELS[lowestDim].toLowerCase()} score is your lowest area. Expand any guide to read it in full, or download it for offline use.`
              : "Location-relevant guides for the situations most likely to affect you. Expand any guide to read it in full. Download it as a text file to save it for offline reading when you don't have internet access."}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {filterOptions.filter(f => f.show).map(f => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              filter === f.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border/60 hover:border-primary/40"
            }`}
          >
            {f.id === "for-you" && <Target className="w-3 h-3 inline-block mr-1.5 -mt-0.5 text-amber-500" />}
            {f.label}
          </button>
        ))}
        <span className="text-xs text-muted-foreground ml-auto">{filteredGuides.length} guide{filteredGuides.length !== 1 ? "s" : ""}</span>
      </div>

      {filter === "for-you" && lowestDim && filteredGuides.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No specific guides for this dimension yet — showing all guides.
        </div>
      )}

      <div className="space-y-3">
        {filteredGuides.map(guide => (
          <GuideCard key={guide.id} guide={guide} />
        ))}
      </div>
    </div>
  );
}

// ─── Tab Error Boundary ───────────────────────────────────────────────────────
interface TabErrorBoundaryState { hasError: boolean; error: Error | null }

class TabErrorBoundary extends React.Component<
  { children: React.ReactNode; tabName: string },
  TabErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; tabName: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error): TabErrorBoundaryState {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error) {
    console.error(`[ProfilePage] Error in tab "${this.props.tabName}":`, error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <p className="text-sm text-muted-foreground">Something went wrong loading this section.</p>
          <Button variant="outline" size="sm" onClick={() => { this.setState({ hasError: false, error: null }); }}>
            Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const { openSignIn, signOut } = useClerk();
  const [authTimedOut, setAuthTimedOut] = useState(false);
  useEffect(() => {
    if (isLoaded) return;
    const t = setTimeout(() => setAuthTimedOut(true), 3000);
    return () => clearTimeout(t);
  }, [isLoaded]);
  const authLoading = !isLoaded && !authTimedOut;
  const isAuthenticated = !!isSignedIn;
  const login = () => openSignIn({});
  const logout = () => signOut({ redirectUrl: "/" });
  const [, navigate] = useLocation();
  const search = useSearch();
  const urlTab = new URLSearchParams(search).get("tab");
  const validTabs = ["account", "overview", "reports", "plans", "checklist", "companion", "guides"];
  const defaultTab = urlTab && validTabs.includes(urlTab) ? urlTab : "account";
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading: plansLoading } = useQuery({
    queryKey: ["myPlans"],
    queryFn: fetchMyPlans,
    enabled: isAuthenticated,
  });

  const plans = data?.plans ?? [];
  const latestPlan = plans.length > 0 ? plans[plans.length - 1] : undefined;
  const lowestDim: DimKey | undefined = latestPlan ? (() => {
    const scores: Record<DimKey, number> = {
      financial: latestPlan.scoreFinancial,
      health: latestPlan.scoreHealth,
      skills: latestPlan.scoreSkills,
      mobility: latestPlan.scoreMobility,
      psychological: latestPlan.scorePsychological,
      resources: latestPlan.scoreResources,
    };
    return DIM_KEYS.reduce((min, dim) => scores[dim] < scores[min] ? dim : min, DIM_KEYS[0]);
  })() : undefined;

  const handleAllPlansDeleted = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["myPlans"] });
    queryClient.invalidateQueries({ queryKey: ["latestChecklist"] });
  }, [queryClient]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <ResilientIcon className="w-16 h-16 text-primary mb-6 opacity-60" />
        <h2 className="text-2xl font-display font-bold mb-2">Sign in to view your profile</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          Create an account to save your resilience plans, track your progress, and manage your data.
        </p>
        <Button size="lg" className="rounded-full" onClick={login}>
          <LogIn className="w-4 h-4 mr-2" /> Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <main className="max-w-5xl mx-auto px-6 pt-8 pb-24">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground mt-1">Track your resilience journey and manage your account.</p>
        </div>

        <Tabs value={defaultTab} onValueChange={(val) => navigate(`/profile?tab=${val}`)} className="space-y-6">
            <TabsList className="rounded-xl h-10 p-1 flex-wrap gap-1 w-full sm:w-auto">
              <TabsTrigger value="account" className="rounded-lg gap-1.5 text-sm">
                <User className="w-3.5 h-3.5" /> Account
              </TabsTrigger>
              <TabsTrigger value="overview" className="rounded-lg gap-1.5 text-sm">
                <BarChart2 className="w-3.5 h-3.5" /> Overview
              </TabsTrigger>
              <TabsTrigger value="reports" className="rounded-lg gap-1.5 text-sm">
                <FileText className="w-3.5 h-3.5" /> Reports
              </TabsTrigger>
              <TabsTrigger value="plans" className="rounded-lg gap-1.5 text-sm">
                <Activity className="w-3.5 h-3.5" /> Plans
              </TabsTrigger>
              <TabsTrigger value="checklist" className="rounded-lg gap-1.5 text-sm">
                <CheckCircle2 className="w-3.5 h-3.5" /> Checklist
              </TabsTrigger>
              <TabsTrigger value="companion" className="rounded-lg gap-1.5 text-sm">
                <Bot className="w-3.5 h-3.5" /> Companion
              </TabsTrigger>
              <TabsTrigger value="guides" className="rounded-lg gap-1.5 text-sm">
                <BookOpen className="w-3.5 h-3.5" /> Guides
              </TabsTrigger>
            </TabsList>

            <TabsContent value="account">
              <TabErrorBoundary tabName="account">
                {plansLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                ) : user && (
                  <AccountTab
                    user={user as any}
                    plans={plans}
                    onAllPlansDeleted={handleAllPlansDeleted}
                  />
                )}
              </TabErrorBoundary>
            </TabsContent>

            <TabsContent value="overview">
              <TabErrorBoundary tabName="overview">
                {plansLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                ) : (
                  <OverviewTab plans={plans} />
                )}
              </TabErrorBoundary>
            </TabsContent>

            <TabsContent value="reports">
              <TabErrorBoundary tabName="reports">
                {plansLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                ) : (
                  <ReportsTab plans={plans} />
                )}
              </TabErrorBoundary>
            </TabsContent>

            <TabsContent value="plans">
              <TabErrorBoundary tabName="plans">
                {plansLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="flex gap-3 items-start px-5 py-4 mb-4 rounded-2xl border border-border/40 bg-muted/20">
                      <BarChart2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-foreground mb-0.5">What is a Plan?</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Each Plan is a full snapshot of one assessment — your resilience score, risk profile, vulnerabilities, and strategic recommendations. Every time you retake the assessment, a new Plan is created so you can see how your preparedness evolves over time. Your most recent Plan also drives your active Checklist.
                        </p>
                      </div>
                    </div>
                    <PlansTab plans={plans} onDelete={() => queryClient.invalidateQueries({ queryKey: ["myPlans"] })} />
                  </>
                )}
              </TabErrorBoundary>
            </TabsContent>

            <TabsContent value="checklist">
              <TabErrorBoundary tabName="checklist">
                <div className="flex gap-3 items-start px-5 py-4 mb-4 rounded-2xl border border-border/40 bg-muted/20">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-0.5">Plans vs. Checklists — why both?</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Your <span className="font-medium text-foreground">Plan</span> is the strategy — it tells you where you stand and why certain areas need attention. Your <span className="font-medium text-foreground">Checklist</span> is the execution layer — the specific, prioritized actions derived from that Plan that you work through over time. You need both: a plan without action stays insight, and action without strategy risks working on the wrong things first.
                    </p>
                  </div>
                </div>
                <ChecklistTab />
              </TabErrorBoundary>
            </TabsContent>

            <TabsContent value="companion">
              <TabErrorBoundary tabName="companion">
                <CompanionTab latestPlan={latestPlan} />
              </TabErrorBoundary>
            </TabsContent>

            <TabsContent value="guides">
              <TabErrorBoundary tabName="guides">
                <GuidesTab location={latestPlan?.location} lowestDim={lowestDim} />
              </TabErrorBoundary>
            </TabsContent>
          </Tabs>
      </main>
      <SiteFooter />
    </div>
  );
}
