import React, { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ResilientIcon } from "@/components/resilient-icon";
import { SiteFooter } from "@/components/site-footer";
import { cn } from "@/lib/utils";
import { useAuth } from "@workspace/replit-auth-web";
import {
  Loader2, ArrowRight, ArrowLeft, Zap, Activity, AlertTriangle,
  Shield, TrendingDown, TrendingUp, Minus, ExternalLink, Lock,
  Briefcase, HeartPulse, Home, Globe, CheckCircle2, Clock,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

/* ─────────────────── Types ─────────────────── */
type ScenarioKey = "job_loss" | "health_crisis" | "natural_disaster" | "relocation";

interface ScenarioResult {
  scenario: ScenarioKey;
  scenarioLabel: string;
  overallImpact: "severe" | "high" | "moderate" | "low";
  scenarioSummary: string;
  originalScores: Record<string, number>;
  scoreDelta: Record<string, number>;
  projectedScores: Record<string, number>;
  criticalWeaknesses: string[];
  protectiveFactors: string[];
  immediateActions: { title: string; description: string; urgency: "immediate" | "within_24h" | "within_week" }[];
  recoveryTimeline: string;
  preEmptiveActions: string[];
}

/* ─────────────────── Scenario config ─────────────────── */
const SCENARIOS = [
  {
    key: "job_loss" as ScenarioKey,
    label: "Sudden Job Loss",
    icon: Briefcase,
    description: "Primary income source vanishes. How long can you hold out, and what's your path back?",
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    params: [
      {
        key: "unemploymentMonths",
        label: "Expected unemployment duration",
        type: "select" as const,
        options: [
          { label: "1 month", value: 1 },
          { label: "3 months", value: 3 },
          { label: "6 months", value: 6 },
          { label: "12 months", value: 12 },
          { label: "18+ months", value: 18 },
        ],
        defaultValue: 3,
      },
    ],
  },
  {
    key: "health_crisis" as ScenarioKey,
    label: "Major Health Crisis",
    icon: HeartPulse,
    description: "A sudden illness or injury forces you off work. Can your finances and support network hold?",
    color: "text-red-600",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    params: [
      {
        key: "medicalSeverity",
        label: "Medical severity",
        type: "select" as const,
        options: [
          { label: "Mild (days off)", value: "mild" },
          { label: "Moderate (weeks off)", value: "moderate" },
          { label: "Severe (months off / long-term)", value: "severe" },
        ],
        defaultValue: "moderate",
      },
    ],
  },
  {
    key: "natural_disaster" as ScenarioKey,
    label: "Natural Disaster",
    icon: Home,
    description: "A major event hits your area. Evacuation, property damage, infrastructure collapse — how ready are you?",
    color: "text-orange-600",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    params: [
      {
        key: "disasterType",
        label: "Disaster type",
        type: "select" as const,
        options: [
          { label: "Flood", value: "flood" },
          { label: "Earthquake", value: "earthquake" },
          { label: "Wildfire", value: "wildfire" },
          { label: "Hurricane / Major Storm", value: "hurricane" },
        ],
        defaultValue: "flood",
      },
    ],
  },
  {
    key: "relocation" as ScenarioKey,
    label: "Emergency Relocation",
    icon: Globe,
    description: "You must leave — fast. Whether domestic or international, how portable is your life really?",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    params: [
      {
        key: "relocationType",
        label: "Relocation type",
        type: "select" as const,
        options: [
          { label: "Domestic (same country)", value: "domestic" },
          { label: "International", value: "international" },
        ],
        defaultValue: "domestic",
      },
      {
        key: "destinationRisk",
        label: "Destination risk level",
        type: "select" as const,
        options: [
          { label: "Low risk (safe destination)", value: "low" },
          { label: "Medium risk", value: "medium" },
          { label: "High risk (conflict, instability)", value: "high" },
        ],
        defaultValue: "medium",
      },
    ],
  },
];

const DIMENSION_LABELS: Record<string, string> = {
  overall: "Overall",
  financial: "Financial",
  health: "Health",
  skills: "Skills",
  mobility: "Mobility",
  psychological: "Psychological",
  resources: "Resources",
};

const URGENCY_CONFIG = {
  immediate: { label: "Immediate", className: "bg-destructive/10 text-destructive" },
  within_24h: { label: "Within 24h", className: "bg-amber-500/10 text-amber-700" },
  within_week: { label: "Within a week", className: "bg-blue-500/10 text-blue-700" },
};

const IMPACT_CONFIG = {
  severe: { label: "Severe Impact", className: "bg-destructive/10 text-destructive border-destructive/20" },
  high: { label: "High Impact", className: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
  moderate: { label: "Moderate Impact", className: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
  low: { label: "Low Impact", className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" },
};

function getScoreColor(score: number) {
  if (score >= 70) return "text-emerald-500";
  if (score >= 40) return "text-amber-500";
  return "text-destructive";
}

function DeltaIndicator({ delta }: { delta: number }) {
  if (Math.abs(delta) < 1) return <Minus className="w-4 h-4 text-muted-foreground" />;
  if (delta > 0) return <TrendingUp className="w-4 h-4 text-emerald-500" />;
  return <TrendingDown className="w-4 h-4 text-destructive" />;
}

/* ─────────────────── Main Page ─────────────────── */
export default function ScenariosPage() {
  const [, params] = useRoute("/scenarios/:reportId");
  const reportId = params?.reportId ?? "";
  const { isAuthenticated } = useAuth();

  const [subStatus, setSubStatus] = useState<{ isPro: boolean } | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioKey | null>(null);
  const [paramValues, setParamValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check Pro status
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(`${BASE}/api/subscription/status`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => setSubStatus(d))
      .catch(() => setSubStatus({ isPro: false }));
  }, [isAuthenticated]);

  // Init default param values when scenario changes
  useEffect(() => {
    if (!selectedScenario) return;
    const config = SCENARIOS.find(s => s.key === selectedScenario);
    if (!config) return;
    const defaults: Record<string, any> = {};
    config.params.forEach(p => { defaults[p.key] = p.defaultValue; });
    setParamValues(defaults);
    setResult(null);
    setError(null);
  }, [selectedScenario]);

  const handleRunAnalysis = async () => {
    if (!selectedScenario || !reportId) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${BASE}/api/resilience/scenarios/${reportId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ scenario: selectedScenario, parameters: paramValues }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "PRO_REQUIRED") {
          setError("pro_required");
        } else {
          setError(data.message ?? "Analysis failed. Please try again.");
        }
        return;
      }
      setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const activeScenarioConfig = selectedScenario ? SCENARIOS.find(s => s.key === selectedScenario) : null;

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="w-full bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="font-display font-bold text-xl text-primary flex items-center gap-2 cursor-pointer">
              <ResilientIcon className="w-5 h-5" /> Resilium
            </div>
          </Link>
          <Link href={reportId ? `/results/${reportId}` : "/"}>
            <Button variant="ghost" size="sm" className="rounded-full gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Back to Report
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-10 space-y-8">

        {/* Page header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4">
            <Activity className="w-3.5 h-3.5" /> Pro Feature — Scenario Stress-Test
          </div>
          <h1 className="font-display font-bold text-4xl mb-3">Stress Test Your Resilience</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Pick a crisis scenario, tune the parameters, and let AI re-score your profile against it.
            See where you're exposed — and exactly what to do before it happens.
          </p>
        </div>

        {/* Auth / Pro gate */}
        {!isAuthenticated && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-8 flex flex-col items-center text-center gap-4">
              <Lock className="w-10 h-10 text-primary" />
              <div>
                <h3 className="font-display font-bold text-xl mb-1">Sign in required</h3>
                <p className="text-muted-foreground">Scenario stress-tests require a Pro account. Sign in to check your subscription.</p>
              </div>
              <Link href="/pricing">
                <Button className="rounded-full gap-2">View Pro Plans <ExternalLink className="w-4 h-4" /></Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {isAuthenticated && subStatus && !subStatus.isPro && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-8 flex flex-col items-center text-center gap-4">
              <Lock className="w-10 h-10 text-primary" />
              <div>
                <h3 className="font-display font-bold text-xl mb-1">Pro feature</h3>
                <p className="text-muted-foreground max-w-md">
                  Scenario stress-tests are exclusive to Pro subscribers. Upgrade to run unlimited scenario analyses and
                  track how your resilience evolves against different crisis types.
                </p>
              </div>
              <Link href="/pricing">
                <Button className="rounded-full gap-2">Upgrade to Pro <ArrowRight className="w-4 h-4" /></Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {(isAuthenticated && (subStatus === null || subStatus.isPro)) && (
          <>
            {/* Scenario picker */}
            <section>
              <h2 className="font-display font-bold text-xl mb-4">1. Choose a scenario</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SCENARIOS.map(sc => {
                  const Icon = sc.icon;
                  const isSelected = selectedScenario === sc.key;
                  return (
                    <button
                      key={sc.key}
                      onClick={() => setSelectedScenario(sc.key)}
                      className={cn(
                        "text-left p-5 rounded-2xl border-2 transition-all flex gap-4 items-start",
                        isSelected
                          ? `${sc.borderColor} ${sc.bgColor}`
                          : "border-border/60 hover:border-primary/30 hover:bg-muted/10"
                      )}
                    >
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5", isSelected ? sc.bgColor : "bg-muted")}>
                        <Icon className={cn("w-5 h-5", isSelected ? sc.color : "text-muted-foreground")} />
                      </div>
                      <div>
                        <p className={cn("font-bold text-base mb-1", isSelected ? sc.color : "text-foreground")}>
                          {sc.label}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{sc.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Parameters */}
            {activeScenarioConfig && (
              <section>
                <h2 className="font-display font-bold text-xl mb-4">2. Tune the parameters</h2>
                <Card className="border-none shadow-md">
                  <CardContent className="p-6 space-y-5">
                    {activeScenarioConfig.params.map(param => (
                      <div key={param.key} className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">{param.label}</label>
                        {param.type === "select" && (
                          <div className="flex flex-wrap gap-2">
                            {param.options.map(opt => (
                              <button
                                key={String(opt.value)}
                                onClick={() => setParamValues(prev => ({ ...prev, [param.key]: opt.value }))}
                                className={cn(
                                  "px-4 py-2 rounded-full text-sm font-medium border transition-all",
                                  paramValues[param.key] === opt.value
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                                )}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="pt-2">
                      <Button
                        onClick={handleRunAnalysis}
                        disabled={loading}
                        size="lg"
                        className="rounded-full gap-2"
                      >
                        {loading ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</>
                        ) : (
                          <><Zap className="w-4 h-4" /> Run Stress Test</>
                        )}
                      </Button>
                      {loading && (
                        <p className="text-xs text-muted-foreground mt-3">AI is re-scoring your profile against this scenario. Usually takes 10–20 seconds.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Error */}
            {error && error !== "pro_required" && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{error}</p>
              </div>
            )}

            {/* Results */}
            {result && (
              <section className="space-y-6">
                <h2 className="font-display font-bold text-xl">3. Your scenario analysis</h2>

                {/* Impact banner */}
                <div className={cn(
                  "flex items-center gap-4 p-5 rounded-2xl border",
                  IMPACT_CONFIG[result.overallImpact].className
                )}>
                  <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-base">{result.scenarioLabel} — {IMPACT_CONFIG[result.overallImpact].label}</p>
                    <p className="text-sm opacity-90 mt-0.5 leading-relaxed">{result.scenarioSummary}</p>
                  </div>
                </div>

                {/* Score delta table */}
                <Card className="border-none shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-display text-lg flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-destructive" /> Score Impact
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">How each dimension changes under this scenario.</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.keys(result.originalScores).map(dim => {
                      const original = result.originalScores[dim];
                      const projected = result.projectedScores[dim];
                      const delta = result.scoreDelta[dim] ?? 0;
                      return (
                        <div key={dim} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-foreground w-28">{DIMENSION_LABELS[dim] ?? dim}</span>
                            <div className="flex items-center gap-3 text-xs">
                              <span className={cn("font-bold", getScoreColor(original))}>{original}</span>
                              <DeltaIndicator delta={delta} />
                              <span className={cn("font-bold", getScoreColor(projected))}>{projected}</span>
                              <span className={cn(
                                "font-bold px-1.5 rounded",
                                delta < -10 ? "text-destructive" : delta < 0 ? "text-amber-600" : delta > 0 ? "text-emerald-600" : "text-muted-foreground"
                              )}>
                                {delta > 0 ? `+${delta}` : delta}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 items-center">
                            <Progress value={original} className="h-1.5 flex-1 opacity-40" />
                            <Progress value={projected} className="h-1.5 flex-1" />
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex gap-4 pt-1 text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-1.5"><div className="w-4 h-1.5 rounded bg-muted-foreground/40" /> Current score</div>
                      <div className="flex items-center gap-1.5"><div className="w-4 h-1.5 rounded bg-primary/60" /> Projected under scenario</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Weaknesses + strengths */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Card className="border-none shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="font-display text-base flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive" /> Critical Exposures
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2.5">
                      {result.criticalWeaknesses.map((w, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <div className="w-5 h-5 rounded-full bg-destructive/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold text-destructive">{i + 1}</span>
                          </div>
                          <p className="text-sm text-foreground leading-snug">{w}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="font-display text-base flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-600" /> Protective Factors
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2.5">
                      {result.protectiveFactors.map((f, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-foreground leading-snug">{f}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Immediate actions */}
                <Card className="border-none shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-display text-lg flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" /> If This Happens — Immediate Actions
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">What to do in the first hours and days of this scenario.</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.immediateActions.map((action, i) => {
                      const urgencyConf = URGENCY_CONFIG[action.urgency] ?? URGENCY_CONFIG.within_week;
                      return (
                        <div key={i} className="flex gap-4 p-4 rounded-2xl border border-border/60">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-primary">{i + 1}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={cn("text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full", urgencyConf.className)}>
                                {urgencyConf.label}
                              </span>
                            </div>
                            <p className="font-bold text-sm text-foreground">{action.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{action.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Pre-emptive actions + recovery timeline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Card className="border-none shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="font-display text-base flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" /> Do These NOW — Before It Happens
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2.5">
                      {result.preEmptiveActions.map((a, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-foreground leading-snug">{a}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="font-display text-base flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" /> Recovery Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-display font-bold text-foreground mb-2">{result.recoveryTimeline}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Estimated time to return to your current resilience baseline, assuming immediate action is taken after the scenario begins.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Run another */}
                <div className="flex gap-3 flex-wrap">
                  <Button
                    variant="outline"
                    className="rounded-full gap-2"
                    onClick={() => { setResult(null); setSelectedScenario(null); }}
                  >
                    <ArrowLeft className="w-4 h-4" /> Test Another Scenario
                  </Button>
                  <Link href={`/results/${reportId}`}>
                    <Button className="rounded-full gap-2">
                      Back to Full Report <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </section>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
