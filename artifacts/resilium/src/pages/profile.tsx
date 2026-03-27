import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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

function CompareModal({
  open,
  onClose,
  reportIdA,
  reportIdB,
}: {
  open: boolean;
  onClose: () => void;
  reportIdA: string;
  reportIdB: string;
}) {
  const { data, isLoading, error } = useQuery<CompareResult>({
    queryKey: ["compare", reportIdA, reportIdB],
    queryFn: () => comparePlans(reportIdA, reportIdB),
    enabled: open && !!reportIdA && !!reportIdB,
    staleTime: 5 * 60 * 1000,
  });

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

  const daysBetween = data
    ? Math.round(
        (new Date(data.reportB.createdAt).getTime() - new Date(data.reportA.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border sticky top-0 bg-background z-10">
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-primary" />
            Report Comparison
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

            {/* Header: dates + time gap */}
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

            {/* Overall score comparison */}
            <Card className="border border-border rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="grid grid-cols-2 divide-x divide-border">
                  {[
                    { label: "Earlier", report: data.reportA },
                    { label: "Later", report: data.reportB },
                  ].map(({ label, report }) => (
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
                {/* Overall delta banner */}
                <div className={`flex items-center justify-center gap-2 py-2 text-sm font-semibold border-t border-border ${
                  data.deltas.overall > 0.5
                    ? "bg-emerald-500/10 text-emerald-600"
                    : data.deltas.overall < -0.5
                    ? "bg-destructive/10 text-destructive"
                    : "bg-muted/50 text-muted-foreground"
                }`}>
                  <DeltaBadge delta={data.deltas.overall} />
                  <span>
                    {data.deltas.overall > 0.5
                      ? "overall improvement"
                      : data.deltas.overall < -0.5
                      ? "overall decline"
                      : "no significant change"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Radar overlay chart */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Dimension Overlay</h3>
              <div className="h-64 w-full">
                <RadarChartView
                  score={data.reportB.score}
                  previousScore={data.reportA.score}
                />
              </div>
              <div className="flex items-center justify-center gap-6 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-4 h-0.5 bg-[#2A3B32]" /> Later
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-4 h-0.5 bg-[#9CA3AF] border-dashed border border-[#9CA3AF]" /> Earlier
                </span>
              </div>
            </div>

            {/* Per-dimension deltas */}
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

            {/* AI Conclusions */}
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">AI Analysis</h3>

              {/* Headline */}
              <div className="rounded-2xl bg-primary/5 border border-primary/20 px-5 py-4">
                <p className="font-display font-semibold text-foreground text-lg leading-snug">
                  {data.conclusions.headline}
                </p>
              </div>

              {/* Key insight */}
              <div className="flex gap-3">
                <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground/80 leading-relaxed">{data.conclusions.keyInsight}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* What improved */}
                {data.conclusions.whatImproved?.length > 0 && (
                  <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-3">What Improved</h4>
                    <ul className="space-y-2">
                      {data.conclusions.whatImproved.map((item, i) => (
                        <li key={i} className="flex gap-2 text-sm text-foreground/80">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* What declined */}
                {data.conclusions.whatDeclined && data.conclusions.whatDeclined.length > 0 && (
                  <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-destructive mb-3">Needs Attention</h4>
                    <ul className="space-y-2">
                      {data.conclusions.whatDeclined.map((item, i) => (
                        <li key={i} className="flex gap-2 text-sm text-foreground/80">
                          <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Next steps */}
              {data.conclusions.nextSteps?.length > 0 && (
                <div className="rounded-xl border border-border p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Recommended Next Steps</h4>
                  <ol className="space-y-2">
                    {data.conclusions.nextSteps.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm text-foreground/80">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
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

export default function ProfilePage() {
  const { user, isLoading: authLoading, isAuthenticated, login, logout } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const { data, isLoading: plansLoading, error } = useQuery({
    queryKey: ["myPlans"],
    queryFn: fetchMyPlans,
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: deletePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myPlans"] });
      toast({ title: "Plan deleted", description: "Your plan has been removed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete plan.", variant: "destructive" });
    },
  });

  const plans = data?.plans ?? [];
  const atLimit = plans.length >= PLAN_LIMIT;

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return prev; // cap at 2
      return [...prev, id];
    });
  }

  function exitCompareMode() {
    setCompareMode(false);
    setSelectedIds([]);
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <ResilientIcon className="w-16 h-16 text-primary mb-6 opacity-60" />
        <h2 className="text-2xl font-display font-bold mb-2">Sign in to view your plans</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          Create an account to save your resilience plans and track your progress over time.
        </p>
        <Button size="lg" className="rounded-full" onClick={login}>
          <LogIn className="w-4 h-4 mr-2" /> Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
                  <img
                    src={user.profileImageUrl}
                    alt={user.firstName || "User"}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <span className="max-w-[100px] truncate text-sm">{user?.firstName || "Account"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="font-medium text-muted-foreground text-xs truncate">
                {user?.email}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer">Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-10 pb-24">
        {/* Page header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-1">My Plans</h1>
            <p className="text-muted-foreground">
              {plans.length} of {PLAN_LIMIT} plans used
            </p>
          </div>

          {/* Compare mode toggle */}
          {plans.length >= 2 && !compareMode && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full gap-2 flex-shrink-0"
              onClick={() => { setCompareMode(true); setSelectedIds([]); }}
            >
              <GitCompare className="w-4 h-4" /> Compare Plans
            </Button>
          )}
          {compareMode && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full gap-2 flex-shrink-0 text-muted-foreground"
              onClick={exitCompareMode}
            >
              <X className="w-4 h-4" /> Cancel
            </Button>
          )}
        </div>

        {/* Compare mode instructions / CTA */}
        {compareMode && (
          <div className="mb-6 flex items-center justify-between gap-4 px-4 py-3 rounded-2xl bg-primary/5 border border-primary/20">
            <p className="text-sm text-foreground/80">
              {selectedIds.length === 0 && "Select two plans to compare."}
              {selectedIds.length === 1 && "Select one more plan."}
              {selectedIds.length === 2 && "Ready to compare — tap the button to generate the AI analysis."}
            </p>
            {selectedIds.length === 2 && (
              <Button
                size="sm"
                className="rounded-full gap-2 flex-shrink-0"
                onClick={() => setCompareOpen(true)}
              >
                <GitCompare className="w-4 h-4" /> Compare
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        )}

        {/* Score Progress Chart */}
        {!compareMode && plans.length >= 2 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <LineChartIcon className="w-5 h-5 text-primary" />
              <h2 className="font-display font-bold text-xl">Score Progress</h2>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart
                  data={[...plans]
                    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                    .map((p) => ({
                      date: new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                      score: Math.round(p.scoreOverall),
                    }))}
                  margin={{ top: 5, right: 16, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 12 }}
                    labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 700 }}
                    itemStyle={{ color: "#E08040" }}
                    formatter={(v: number) => [`${v}/100`, "Score"]}
                  />
                  <ReferenceLine y={50} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#E08040"
                    strokeWidth={2.5}
                    dot={{ fill: "#E08040", r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#E08040", strokeWidth: 2, stroke: "hsl(var(--background))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Freemium upgrade nudge (appears at 5+ plans) */}
        {!compareMode && plans.length >= 5 && !atLimit && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/20">
            <TrendingUp className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">You're building real resilience.</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                You have {plans.length} plans saved. Upgrade to Pro for unlimited plans, priority AI analysis, and scheduled re-assessment reminders.
              </p>
            </div>
            {import.meta.env.VITE_STRIPE_PRO_URL && (
              <a href={import.meta.env.VITE_STRIPE_PRO_URL} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="rounded-full flex-shrink-0">Upgrade</Button>
              </a>
            )}
          </div>
        )}

        {/* Plan limit warning */}
        {atLimit && !compareMode && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">
              You've reached the maximum of {PLAN_LIMIT} saved plans. Delete an existing plan before creating a new one.
            </p>
          </div>
        )}

        {/* CTA to create new plan */}
        {!compareMode && (
          <div className="mb-8 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {plans.length === 0 ? "No plans yet. Take your first assessment!" : `${PLAN_LIMIT - plans.length} slot${PLAN_LIMIT - plans.length === 1 ? "" : "s"} remaining`}
            </span>
            {!atLimit && (
              <Link href="/assess">
                <Button className="rounded-full">New Assessment</Button>
              </Link>
            )}
          </div>
        )}

        {/* Plans list */}
        {plansLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-4" />
            <p className="text-muted-foreground">Failed to load plans. Please try again.</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-3xl">
            <ResilientIcon className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No saved plans yet</p>
            <p className="text-sm text-muted-foreground mt-1">Complete an assessment to see your resilience plan here.</p>
            <Link href="/assess">
              <Button className="mt-6 rounded-full">Take Assessment</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => {
              const { label, variant } = getScoreLabel(plan.scoreOverall);
              const scoreColor = getScoreColorClass(plan.scoreOverall);
              const date = new Date(plan.createdAt);
              const isSelected = selectedIds.includes(plan.reportId);
              const isDisabled = compareMode && selectedIds.length >= 2 && !isSelected;

              return (
                <Card
                  key={plan.reportId}
                  className={`border shadow-sm transition-all rounded-2xl overflow-hidden ${
                    compareMode
                      ? isSelected
                        ? "border-primary shadow-primary/10 shadow-md"
                        : isDisabled
                        ? "opacity-40 border-border"
                        : "border-border cursor-pointer hover:border-primary/50"
                      : "border-border hover:shadow-md"
                  }`}
                  onClick={compareMode && !isDisabled ? () => toggleSelect(plan.reportId) : undefined}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-6">
                      {/* Compare checkbox */}
                      {compareMode && (
                        <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            disabled={isDisabled}
                            onCheckedChange={() => { if (!isDisabled) toggleSelect(plan.reportId); }}
                            className="w-5 h-5"
                          />
                        </div>
                      )}

                      {/* Score */}
                      <div className="flex-shrink-0 flex flex-col items-center sm:w-24">
                        <span className={`text-3xl font-display font-bold ${scoreColor}`}>
                          {Math.round(plan.scoreOverall)}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">/ 100</span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={variant} className="rounded-full text-xs">
                            {label}
                          </Badge>
                          {plan.currency && plan.currency !== "USD" && (
                            <Badge variant="outline" className="rounded-full text-xs border-border/60 text-muted-foreground">
                              {plan.currency}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          {plan.location && (
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {plan.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <CalendarDays className="w-3 h-3" />
                            {date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                          </span>
                        </div>
                        {/* Mini dimension bars */}
                        <div className="grid grid-cols-6 gap-1 pt-1">
                          {[
                            { key: "scoreFinancial", label: "Fin" },
                            { key: "scoreHealth", label: "Hlt" },
                            { key: "scoreSkills", label: "Skl" },
                            { key: "scoreMobility", label: "Mob" },
                            { key: "scorePsychological", label: "Psy" },
                            { key: "scoreResources", label: "Res" },
                          ].map(({ key, label: dimLabel }) => {
                            const val = (plan as any)[key] ?? 0;
                            const color = val >= 70 ? "bg-emerald-500" : val >= 40 ? "bg-amber-500" : "bg-destructive";
                            return (
                              <div key={key} className="flex flex-col items-center gap-0.5" title={`${dimLabel}: ${Math.round(val)}`}>
                                <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
                                  <div className={`h-full rounded-full ${color}`} style={{ width: `${val}%` }} />
                                </div>
                                <span className="text-[9px] text-muted-foreground/70">{dimLabel}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Actions — hidden in compare mode */}
                      {!compareMode && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Link href={`/results/${plan.reportId}`}>
                            <Button variant="outline" size="sm" className="rounded-full">
                              <Eye className="w-4 h-4 mr-1.5" /> View
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeletingId(plan.reportId)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => { if (!open) setDeletingId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The plan and all its data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingId) {
                  deleteMutation.mutate(deletingId);
                  setDeletingId(null);
                }
              }}
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
