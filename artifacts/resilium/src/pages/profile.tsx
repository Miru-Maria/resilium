import React, { useState, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@workspace/replit-auth-web";
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
} from "lucide-react";
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

const PLAN_LIMIT = 10;

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
  critical: { bg: "bg-destructive/15", text: "text-destructive", label: "Critical" },
  high:     { bg: "bg-amber-500/15",   text: "text-amber-600",   label: "High" },
  medium:   { bg: "bg-blue-500/15",    text: "text-blue-600",    label: "Medium" },
  low:      { bg: "bg-muted/60",       text: "text-muted-foreground", label: "Low" },
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

// ─── Overview Tab ────────────────────────────────────────────────────────────
function OverviewTab({ plans }: { plans: PlanSummary[] }) {
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
        <Link href="/assessment">
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
function ChecklistTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const { data: checklistData, isLoading: checklistLoading } = useQuery<{
    reportId: string | null;
    checklistsByArea: ChecklistsByArea | null;
    location: string | null;
    createdAt: string | null;
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

  return (
    <div className="space-y-5">
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
                      className={`flex gap-3 p-3 rounded-xl border transition-colors ${isChecked ? "bg-muted/30 border-border/50 opacity-70" : "bg-card border-border"}`}
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
                            className={`text-sm font-medium cursor-pointer leading-snug ${isChecked ? "line-through text-muted-foreground" : "text-foreground"}`}
                          >
                            {item.title}
                          </label>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase flex-shrink-0 ${ps.bg} ${ps.text}`}>
                            {ps.label}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
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
  user: { id: string; firstName?: string | null; lastName?: string | null; email?: string | null; profileImageUrl?: string | null };
  plans: PlanSummary[];
  onAllPlansDeleted: () => void;
}) {
  const { toast } = useToast();

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
            <User className="w-4 h-4 text-primary" /> Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          {user.profileImageUrl ? (
            <img src={user.profileImageUrl} alt="avatar" className="w-14 h-14 rounded-full object-cover ring-2 ring-border" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-base leading-tight">
              {[user.firstName, user.lastName].filter(Boolean).join(" ") || "Resilium User"}
            </p>
            {user.email && <p className="text-sm text-muted-foreground mt-0.5 truncate">{user.email}</p>}
            <p className="text-xs text-muted-foreground/60 mt-1">Managed by Replit Auth · read-only</p>
          </div>
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
              <p className="text-xs text-muted-foreground mt-0.5">Remove all your Resilium data. Your Replit account is unaffected.</p>
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
              All your Resilium data — including {plans.length} report{plans.length !== 1 ? "s" : ""}, scores, and checklist progress — will be permanently deleted. Your Replit account remains active.
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

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link href={`/results/${plan.reportId}`}>
                        <Button variant="outline" size="sm" className="rounded-full gap-1.5">
                          <Eye className="w-3.5 h-3.5" /> View Report
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

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, isLoading: authLoading, isAuthenticated, login, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading: plansLoading } = useQuery({
    queryKey: ["myPlans"],
    queryFn: fetchMyPlans,
    enabled: isAuthenticated,
  });

  const plans = data?.plans ?? [];

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
      <header className="w-full bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="font-display font-bold text-xl text-primary flex items-center gap-2 cursor-pointer">
              <ResilientIcon className="w-5 h-5" /> Resilium
            </div>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full flex items-center gap-2">
                {user?.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt={user.firstName || "User"} className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <span className="max-w-[100px] truncate text-sm">{user?.firstName || "Account"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="font-medium text-muted-foreground text-xs truncate">{user?.email}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer">Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-8 pb-24">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground mt-1">Track your resilience journey and manage your account.</p>
        </div>

        {plansLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="rounded-xl h-10 p-1 w-full sm:w-auto">
              <TabsTrigger value="overview" className="rounded-lg gap-1.5 text-sm">
                <BarChart2 className="w-3.5 h-3.5" /> Overview
              </TabsTrigger>
              <TabsTrigger value="plans" className="rounded-lg gap-1.5 text-sm">
                <Activity className="w-3.5 h-3.5" /> Plans {plans.length > 0 && <span className="ml-0.5 text-xs opacity-60">({plans.length})</span>}
              </TabsTrigger>
              <TabsTrigger value="checklist" className="rounded-lg gap-1.5 text-sm">
                <CheckCircle2 className="w-3.5 h-3.5" /> Checklist
              </TabsTrigger>
              <TabsTrigger value="account" className="rounded-lg gap-1.5 text-sm">
                <User className="w-3.5 h-3.5" /> Account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <OverviewTab plans={plans} />
            </TabsContent>

            <TabsContent value="plans">
              <PlansTab plans={plans} onDelete={() => queryClient.invalidateQueries({ queryKey: ["myPlans"] })} />
            </TabsContent>

            <TabsContent value="checklist">
              <ChecklistTab />
            </TabsContent>

            <TabsContent value="account">
              {user && (
                <AccountTab
                  user={user as any}
                  plans={plans}
                  onAllPlansDeleted={handleAllPlansDeleted}
                />
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
