import React, { useEffect, useRef, useState } from "react";
import { computeBadgeCount, allDimsAssessedFromPlan } from "@/lib/badge-criteria";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSubscriptionStatus } from "@/hooks/use-subscription-status";
import { Link } from "wouter";
import { OnboardingModal } from "@/components/onboarding-modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { motion } from "framer-motion";
import {
  ArrowRight,
  LogIn,
  User,
  Users,
  Shield,
  Brain,
  MapPin,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  Zap,
  AlertTriangle,
  Backpack,
  Globe,
  DollarSign,
  Star,
  Quote,
  MessageCircle,
  BookOpen,
  Clock,
  Trophy,
  Award,
  Flame,
} from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { PageSEO } from "@/components/page-seo";
import { useUser, useAuth, useClerk } from "@clerk/react";
import { DailyTipCard } from "@/components/daily-tip-card";
import type { DimKey } from "@/data/tips-bank";
import { buildChallenge } from "@/data/challenge-content";

import { ResilientIcon } from "@/components/resilient-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { Download } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Testimonial {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
}

function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`${BASE}/api/feedback/testimonials`)
      .then(r => r.ok ? r.json() : { testimonials: [] })
      .then(d => {
        setTestimonials(d.testimonials ?? []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  if (!loaded) return null;

  const avgRating = testimonials.length > 0
    ? (testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length).toFixed(1)
    : "4.8";

  return (
    <section className="w-full py-20 px-6 bg-card/40 border-y border-border/60">
      <div className="max-w-5xl mx-auto">
        {/* Trust bar — always visible */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-14">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <span className="text-sm font-bold text-foreground">{avgRating}/5</span>
            <span className="text-xs text-muted-foreground">average rating</span>
          </div>
          <div className="w-px h-5 bg-border hidden md:block" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-primary" />
            <span>Your data is never sold or shared</span>
          </div>
          <div className="w-px h-5 bg-border hidden md:block" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>GDPR compliant · No credit card required</span>
          </div>
        </div>

        {testimonials.length > 0 && (
          <>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary text-center mb-3">From Our Users</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-10">What people are saying</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {testimonials.slice(0, 6).map(t => (
                <div key={t.id} className="p-6 rounded-2xl border border-border/60 bg-background flex flex-col gap-3 hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(s => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${s <= t.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20"}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/80 flex-1">"{t.comment}"</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <Quote className="w-3 h-3 text-primary/50" />
                    </div>
                    <span className="text-xs text-muted-foreground">Verified user</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

interface ChallengeRaw {
  startedAt: string;
  dimensionOrder: string[];
  completedDays: number[];
}

interface ChallengeProgress {
  completedCount: number;
  pct: number;
  currentDay: number;
  todayAction: { day: number; title: string } | null;
  dimensionOrder: string[];
  completedDays: number[];
}

function deriveChallengeProgress(cd: ChallengeRaw): ChallengeProgress {
  const completedDays: number[] = cd.completedDays;
  const completedCount = completedDays.length;
  const pct = Math.round((completedCount / 30) * 100);
  const startDate = new Date(cd.startedAt);
  const currentDay = Math.min(
    Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
    30
  );
  const dimensionOrder: string[] = cd.dimensionOrder ?? [];
  const completedSet = new Set(completedDays);
  const actions = dimensionOrder.length > 0 ? buildChallenge(dimensionOrder as any) : [];
  const nextAction = actions.find((a) => !completedSet.has(a.day)) ?? null;
  return {
    completedCount,
    pct,
    currentDay,
    todayAction: nextAction ? { day: nextAction.day, title: nextAction.title } : null,
    dimensionOrder,
    completedDays,
  };
}

function SignedInBanner() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "hidden" }
    | { kind: "onboard" }
    | {
        kind: "returning";
        score: number;
        daysSince: number;
        lowestDim: DimKey | null;
      }
  >({ kind: "loading" });
  const [markingComplete, setMarkingComplete] = useState(false);

  const { data: challengeRaw } = useQuery<ChallengeRaw | null>({
    queryKey: ["challenge"],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(`${BASE}/api/challenge`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch challenge");
      return res.json();
    },
    enabled: !!isSignedIn && !!isLoaded,
    staleTime: 60 * 1000,
  });

  const { data: plansData, isError: plansError, fetchStatus: plansFetchStatus } = useQuery({
    queryKey: ["user-plans"],
    queryFn: async () => {
      const resp = await fetch(`${BASE}/api/users/me/plans`, { credentials: "include" });
      return resp.ok ? resp.json() : null;
    },
    enabled: !!isSignedIn && !!isLoaded,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const { data: subStatus } = useSubscriptionStatus({ enabled: !!isLoaded && !!isSignedIn });

  const challengeProgress: ChallengeProgress | null =
    challengeRaw?.completedDays ? deriveChallengeProgress(challengeRaw) : null;

  const badgeCount = React.useMemo(() => {
    const plans = plansData?.plans;
    if (!plans?.length) return 0;
    const latest = plans[plans.length - 1];
    const streakRaw = (() => {
      try {
        const v = localStorage.getItem("resilium_streak_v1");
        return v ? (JSON.parse(v)?.count ?? 0) : 0;
      } catch { return 0; }
    })();
    return computeBadgeCount({
      planCount: plans.length,
      allDimsAssessed: allDimsAssessedFromPlan(latest),
      streak: streakRaw,
      completedDaysCount: challengeRaw?.completedDays?.length ?? 0,
      isPro: subStatus?.isPro ?? false,
    });
  }, [plansData, challengeRaw, subStatus]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { setState({ kind: "hidden" }); return; }
    if (plansData === undefined && !plansError && plansFetchStatus === "fetching") return;

    if (!plansData?.plans?.length) {
      const dismissed = localStorage.getItem("resilium_onboarded_v1");
      setState(dismissed ? { kind: "hidden" } : { kind: "onboard" });
      return;
    }

    const plans = plansData.plans;
    const latest = plans[plans.length - 1];
    const daysSince = Math.floor(
      (Date.now() - new Date(latest.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    const dimScores: Record<DimKey, number> = {
      financial: latest.scoreFinancial ?? 100,
      health: latest.scoreHealth ?? 100,
      skills: latest.scoreSkills ?? 100,
      mobility: latest.scoreMobility ?? 100,
      psychological: latest.scorePsychological ?? 100,
      resources: latest.scoreResources ?? 100,
    };
    const lowestDim = (Object.entries(dimScores).sort(([, a], [, b]) => a - b)[0][0] as DimKey);

    setState({
      kind: "returning",
      score: Math.round(latest.scoreOverall),
      daysSince,
      lowestDim,
    });
  }, [isLoaded, isSignedIn, plansData, plansError, plansFetchStatus]);

  const dismissOnboard = () => {
    localStorage.setItem("resilium_onboarded_v1", "1");
    setState({ kind: "hidden" });
  };

  const handleUndoComplete = async (day: number) => {
    try {
      const token = await getToken();
      const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${BASE}/api/challenge/complete/${day}`, {
        method: "DELETE",
        headers: authHeaders,
        credentials: "include",
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["challenge"] });
      }
    } catch {
      // silent — undo failed, state remains as-is
    }
  };

  const handleMarkComplete = async (day: number) => {
    if (markingComplete) return;
    setMarkingComplete(true);
    try {
      const token = await getToken();
      const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${BASE}/api/challenge/complete/${day}`, {
        method: "POST",
        headers: authHeaders,
        credentials: "include",
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["challenge"] });
        toast({
          title: "Day marked complete!",
          description: `Day ${day} has been completed.`,
          action: (
            <ToastAction altText="Undo" onClick={() => handleUndoComplete(day)}>
              Undo
            </ToastAction>
          ),
        });
      }
    } catch {
      // silent — user can try again
    } finally {
      setMarkingComplete(false);
    }
  };

  if (state.kind === "loading" || state.kind === "hidden") return null;

  if (state.kind === "returning") {
    const { score, daysSince, lowestDim } = state;
    const scoreColor = score >= 70 ? "text-emerald-400" : score >= 40 ? "text-amber-400" : "text-destructive";
    const nudge = daysSince >= 30
      ? `It's been ${daysSince} days — your situation may have changed.`
      : daysSince >= 14
      ? `${daysSince} days since your last check-in — keep the momentum going.`
      : `You last checked in ${daysSince} day${daysSince !== 1 ? "s" : ""} ago.`;
    const circumference = 2 * Math.PI * 11;
    return (
      <div className="w-full z-20 px-6 py-3 space-y-2">
        {/* Main welcome banner */}
        <div className="max-w-5xl mx-auto flex items-center gap-4 px-5 py-4 rounded-2xl bg-card border border-border/60 backdrop-blur-sm shadow-sm">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground">
              Welcome back{user?.firstName ? `, ${user.firstName}` : ""}! Your resilience score is{" "}
              <span className={`font-bold ${scoreColor}`}>{score}/100</span>.
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3 inline-block flex-shrink-0" /> {nudge}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href="/profile">
              <Button size="sm" className="rounded-full text-xs font-semibold">
                View Your Plan <ArrowRight className="ml-1 w-3 h-3" />
              </Button>
            </Link>
            <Link href="/consent">
              <Button size="sm" variant="outline" className="rounded-full text-xs font-semibold hidden sm:flex">
                Reassess
              </Button>
            </Link>
          </div>
        </div>

        {/* Compact challenge + badge strip */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* 30-day challenge progress */}
          {challengeProgress ? (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors">
              <div className="relative flex-shrink-0 w-8 h-8 mt-0.5">
                <svg className="w-8 h-8 -rotate-90" viewBox="0 0 30 30">
                  <circle cx="15" cy="15" r="11" stroke="hsl(var(--muted))" strokeWidth="3" fill="none" />
                  <circle
                    cx="15" cy="15" r="11"
                    stroke="hsl(var(--primary))" strokeWidth="3" fill="none"
                    strokeDasharray={`${circumference}`}
                    strokeDashoffset={`${circumference * (1 - challengeProgress.pct / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.4s ease" }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-foreground">
                  {challengeProgress.pct}%
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground leading-tight">30-Day Challenge</p>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Day {challengeProgress.currentDay} · {challengeProgress.completedCount}/30 done
                </p>
                {challengeProgress.todayAction && (
                  <p className="text-[11px] text-foreground/70 leading-tight mt-0.5 truncate">
                    {challengeProgress.todayAction.title}
                  </p>
                )}
                {challengeProgress.todayAction ? (
                  <button
                    className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                    disabled={markingComplete}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleMarkComplete(challengeProgress.todayAction!.day);
                    }}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {markingComplete ? "Saving…" : "Mark Complete"}
                  </button>
                ) : challengeProgress.completedCount === 30 ? (
                  <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                    <CheckCircle2 className="w-3 h-3" /> All done!
                  </span>
                ) : null}
              </div>
              <Link href="/profile" onClick={(e) => e.stopPropagation()}>
                <Flame className="w-3.5 h-3.5 text-orange-400 flex-shrink-0 mt-1 hover:opacity-80 transition-opacity" />
              </Link>
            </div>
          ) : (
            <Link href="/profile">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-primary/70" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground leading-tight">30-Day Challenge</p>
                  <p className="text-[11px] text-muted-foreground leading-tight">Start your daily micro-actions</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto flex-shrink-0" />
              </div>
            </Link>
          )}

          {/* Badge count */}
          <Link href="/profile">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground leading-tight">Achievements</p>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  {badgeCount > 0
                    ? `${badgeCount} badge${badgeCount !== 1 ? "s" : ""} earned`
                    : "Earn your first badge"}
                </p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto flex-shrink-0" />
            </div>
          </Link>
        </div>

        {lowestDim && (
          <div className="max-w-5xl mx-auto">
            <DailyTipCard lowestDim={lowestDim} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full z-20 px-6 py-3">
      <div className="max-w-5xl mx-auto flex items-center gap-4 px-5 py-4 rounded-2xl bg-primary/10 border border-primary/30 backdrop-blur-sm">
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
          <Shield className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground">Welcome to Resilium — your plan is waiting</p>
          <p className="text-xs text-muted-foreground mt-0.5">Your free resilience assessment takes 10–15 minutes. Get your score, your gaps, and a personalized action plan.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href="/consent">
            <Button size="sm" className="rounded-full text-xs font-semibold" onClick={dismissOnboard}>
              Start Assessment <ArrowRight className="ml-1 w-3 h-3" />
            </Button>
          </Link>
          <button onClick={dismissOnboard} className="text-muted-foreground hover:text-foreground transition-colors p-1">
            <span className="text-lg leading-none">×</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function AnimatedBackground() {
  return (
    <>
      <style>{`
        @keyframes blob-drift-1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33%       { transform: translate(60px, -40px) scale(1.06); }
          66%       { transform: translate(-30px, 50px) scale(0.95); }
        }
        @keyframes blob-drift-2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          40%       { transform: translate(-70px, 50px) scale(1.08); }
          70%       { transform: translate(40px, -30px) scale(0.96); }
        }
        @keyframes blob-drift-3 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50%       { transform: translate(50px, 40px) scale(1.04); }
        }
        .blob { position: absolute; border-radius: 50%; filter: blur(90px); }
        .blob-1 { animation: blob-drift-1 20s ease-in-out infinite; }
        .blob-2 { animation: blob-drift-2 25s ease-in-out infinite; }
        .blob-3 { animation: blob-drift-3 17s ease-in-out infinite; }
      `}</style>

      {/* Soft depth orbs behind the neural layer */}
      <div className="blob blob-1" style={{
        width: 700, height: 700,
        top: "-15%", left: "-12%",
        background: "radial-gradient(circle at 40% 40%, rgba(224,128,64,0.14) 0%, rgba(200,110,40,0.06) 50%, transparent 70%)",
      }} />
      <div className="blob blob-2" style={{
        width: 580, height: 580,
        top: "-5%", right: "-10%",
        background: "radial-gradient(circle at 60% 40%, rgba(30,50,130,0.32) 0%, rgba(15,25,80,0.12) 55%, transparent 75%)",
      }} />
      <div className="blob blob-3" style={{
        width: 420, height: 420,
        bottom: "5%", left: "30%",
        background: "radial-gradient(circle at 50% 50%, rgba(160,90,20,0.10) 0%, transparent 65%)",
      }} />

      {/* Fade out downward */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "linear-gradient(to bottom, transparent 55%, rgba(13,18,37,0.85) 80%, rgb(13,18,37) 100%)",
      }} />
    </>
  );
}

function PwaInstallBanner() {
  const { isInstallable, triggerInstall, dismiss } = usePwaInstall();
  if (!isInstallable) return null;
  return (
    <div className="w-full z-20 px-6 pt-3">
      <div className="max-w-5xl mx-auto flex items-center gap-4 px-5 py-3 rounded-2xl bg-card border border-primary/30 backdrop-blur-sm shadow-sm">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Download className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground leading-tight">Install Resilium</p>
          <p className="text-xs text-muted-foreground mt-0.5">Add to your home screen for quick offline access.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button size="sm" className="rounded-full text-xs font-semibold" onClick={triggerInstall}>
            Install
          </Button>
          <button onClick={dismiss} className="text-muted-foreground hover:text-foreground transition-colors p-1" aria-label="Dismiss install prompt">
            <span className="text-lg leading-none">×</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <PageSEO
        title="Resilium — Know Your Readiness. Build Your Resilience."
        description="Get your personal resilience score across 6 dimensions and a GPT-powered 90-day action plan. Free assessment — no account required."
        canonical="https://resilium-platform.com/"
      />
      {/* Animated background — hero section only */}
      <div className="absolute top-0 left-0 right-0 h-screen z-0 pointer-events-none overflow-hidden">
        <AnimatedBackground />
      </div>

      <OnboardingModal />
      {/* PWA install prompt banner */}
      <PwaInstallBanner />
      {/* Smart banner — onboarding for new users, re-engagement for returning users */}
      <SignedInBanner />

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center z-10">
        <div className="flex flex-col items-center text-center px-6 pt-12 pb-20 max-w-4xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/30 text-primary mb-8 border border-secondary/50 backdrop-blur-sm">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-wider">Personal Resilience Platform</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-foreground leading-[1.1] mb-6">
              You're one disruption away from{" "}
              <span className="text-destructive italic">chaos</span>.<br />
              Build your{" "}
              <span className="text-primary whitespace-nowrap font-extrabold">resilience plan.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Resilium assesses your real vulnerability across 6 dimensions — finances, health, skills, mobility, psychology, and resources — then gives you a living action plan you actually work through. Not a one-time report. A companion that grows with you.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
              <Link href="/consent">
                <Button size="lg" className="rounded-full h-16 px-10 text-lg font-semibold shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300">
                  Build My Resilience Plan
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="rounded-full h-16 px-10 text-lg font-semibold border-border/60 hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300">
                  See a Demo
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Track your progress over time</span>
            <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Your data is never sold</span>
            <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Assessment takes 10–15 minutes</span>
          </motion.div>
        </div>

        {/* Social proof / trust — positioned early for credibility */}
        <TestimonialsSection />

        {/* How it works */}
        <section className="w-full bg-card/40 border-y border-border/60 py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary text-center mb-3">The Process</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-14">How it works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  illustration: (
                    <svg viewBox="0 0 160 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                      {/* Six dimension nodes flowing in */}
                      {[
                        { cx: 18, cy: 20, label: "Financial" },
                        { cx: 18, cy: 42, label: "Health" },
                        { cx: 18, cy: 64, label: "Skills" },
                        { cx: 18, cy: 86, label: "Mobility" },
                        { cx: 142, cy: 31, label: "Psych" },
                        { cx: 142, cy: 75, label: "Resources" },
                      ].map(({ cx, cy, label }, i) => (
                        <g key={i}>
                          <line x1={cx + (cx < 80 ? 10 : -10)} y1={cy} x2={80} y2={55} stroke="rgba(224,128,64,0.18)" strokeWidth="1" strokeDasharray="3 3" />
                          <circle cx={cx} cy={cy} r="7" fill="rgba(224,128,64,0.08)" stroke="rgba(224,128,64,0.4)" strokeWidth="1" />
                          <circle cx={cx} cy={cy} r="3" fill="rgba(224,128,64,0.7)" />
                        </g>
                      ))}
                      {/* Center hub — the assessment form */}
                      <circle cx="80" cy="55" r="22" fill="rgba(224,128,64,0.06)" stroke="rgba(224,128,64,0.35)" strokeWidth="1.5" />
                      <circle cx="80" cy="55" r="14" fill="rgba(224,128,64,0.1)" stroke="rgba(224,128,64,0.5)" strokeWidth="1" />
                      {/* Form lines inside hub */}
                      <rect x="70" y="49" width="20" height="2" rx="1" fill="rgba(234,217,190,0.5)" />
                      <rect x="70" y="54" width="14" height="2" rx="1" fill="rgba(234,217,190,0.3)" />
                      <rect x="70" y="59" width="17" height="2" rx="1" fill="rgba(234,217,190,0.2)" />
                    </svg>
                  ),
                  title: "Answer the assessment",
                  desc: "10–15 minutes of honest questions covering your finances, location, health, practical skills, housing situation, and psychological resilience under pressure.",
                },
                {
                  step: "02",
                  illustration: (
                    <svg viewBox="0 0 160 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                      {/* Hexagonal radar chart */}
                      {[0, 1, 2].map((ring) => {
                        const r = 16 + ring * 14;
                        const pts = Array.from({ length: 6 }, (_, i) => {
                          const a = (i * Math.PI) / 3 - Math.PI / 2;
                          return `${80 + r * Math.cos(a)},${55 + r * Math.sin(a)}`;
                        }).join(" ");
                        return <polygon key={ring} points={pts} fill="none" stroke="rgba(234,217,190,0.12)" strokeWidth="1" />;
                      })}
                      {/* Spoke lines */}
                      {Array.from({ length: 6 }, (_, i) => {
                        const a = (i * Math.PI) / 3 - Math.PI / 2;
                        return <line key={i} x1="80" y1="55" x2={80 + 44 * Math.cos(a)} y2={55 + 44 * Math.sin(a)} stroke="rgba(234,217,190,0.1)" strokeWidth="1" />;
                      })}
                      {/* Filled amber shape (score polygon) */}
                      <polygon
                        points={Array.from({ length: 6 }, (_, i) => {
                          const scores = [0.72, 0.58, 0.84, 0.45, 0.67, 0.78];
                          const a = (i * Math.PI) / 3 - Math.PI / 2;
                          const r = 44 * scores[i];
                          return `${80 + r * Math.cos(a)},${55 + r * Math.sin(a)}`;
                        }).join(" ")}
                        fill="rgba(224,128,64,0.18)"
                        stroke="#E08040"
                        strokeWidth="1.8"
                      />
                      {/* Vertex dots */}
                      {Array.from({ length: 6 }, (_, i) => {
                        const scores = [0.72, 0.58, 0.84, 0.45, 0.67, 0.78];
                        const a = (i * Math.PI) / 3 - Math.PI / 2;
                        const r = 44 * scores[i];
                        return <circle key={i} cx={80 + r * Math.cos(a)} cy={55 + r * Math.sin(a)} r="3" fill="#E08040" />;
                      })}
                      {/* Dimension labels */}
                      {[
                        { label: "Financial", a: -Math.PI / 2 },
                        { label: "Health", a: -Math.PI / 6 },
                        { label: "Skills", a: Math.PI / 6 },
                        { label: "Mobility", a: Math.PI / 2 },
                        { label: "Psych", a: (5 * Math.PI) / 6 },
                        { label: "Resources", a: (7 * Math.PI) / 6 },
                      ].map(({ label, a }, i) => (
                        <text key={i} x={80 + 52 * Math.cos(a)} y={55 + 52 * Math.sin(a)} fontSize="7" fill="rgba(155,142,126,0.8)" textAnchor="middle" dominantBaseline="central" fontFamily="sans-serif">{label}</text>
                      ))}
                    </svg>
                  ),
                  title: "AI builds your profile",
                  desc: "Your answers are scored across six risk dimensions and fed to an AI that reasons about your specific vulnerabilities — not generic advice lifted from a checklist.",
                },
                {
                  step: "03",
                  illustration: (
                    <svg viewBox="0 0 160 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                      {/* Document card */}
                      <rect x="28" y="10" width="104" height="90" rx="8" fill="rgba(224,128,64,0.04)" stroke="rgba(224,128,64,0.2)" strokeWidth="1" />
                      {/* Phase labels */}
                      {[
                        { label: "30 Days", y: 26, pct: 78, done: true },
                        { label: "6 Months", y: 52, pct: 42, done: false },
                        { label: "Long-term", y: 78, pct: 15, done: false },
                      ].map(({ label, y, pct, done }) => (
                        <g key={label}>
                          <text x="40" y={y} fontSize="7.5" fill={done ? "#E08040" : "rgba(155,142,126,0.7)"} fontFamily="sans-serif" fontWeight="600">{label}</text>
                          {/* Progress track */}
                          <rect x="40" y={y + 6} width="80" height="5" rx="2.5" fill="rgba(234,217,190,0.08)" />
                          <rect x="40" y={y + 6} width={0.8 * pct} height="5" rx="2.5" fill={done ? "rgba(224,128,64,0.7)" : "rgba(224,128,64,0.3)"} />
                          {/* Checklist items */}
                          {[0, 1].map((j) => (
                            <g key={j}>
                              {done ? (
                                <>
                                  <circle cx={40 + j * 38} cy={y + 18} r="4" fill="rgba(224,128,64,0.2)" stroke="#E08040" strokeWidth="1" />
                                  <polyline points={`${36 + j * 38},${y + 18} ${39 + j * 38},${y + 21} ${44 + j * 38},${y + 15}`} stroke="#E08040" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                                </>
                              ) : (
                                <circle cx={40 + j * 38} cy={y + 18} r="4" fill="none" stroke="rgba(234,217,190,0.2)" strokeWidth="1" />
                              )}
                              <rect x={47 + j * 38} y={y + 15} width={done ? 22 : 28} height="2.5" rx="1.25" fill={done ? "rgba(234,217,190,0.35)" : "rgba(234,217,190,0.12)"} />
                            </g>
                          ))}
                        </g>
                      ))}
                    </svg>
                  ),
                  title: "Work your living action plan",
                  desc: "Your Strategic Action Plan is a real working document — not a PDF you forget. Check off tasks, track your progress across 30-day, 6-month, and long-term phases, and reassess as your situation evolves.",
                },
              ].map(({ step, illustration, title, desc }) => (
                <div key={step} className="relative flex flex-col gap-4 p-6 rounded-2xl bg-background border border-border/60">
                  <span className="text-xs font-bold text-primary/40 tracking-widest">{step}</span>
                  <div className="w-full h-[110px]">{illustration}</div>
                  <h3 className="font-display font-bold text-lg">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who it's for */}
        <section className="w-full py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary text-center mb-3">Who Uses Resilium</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-4">Built for people at every stage of preparedness</h2>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-14">
              Whether you're quietly cautious or already in the middle of a disruption — Resilium meets you where you are.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  icon: <Backpack className="w-6 h-6 text-primary" />,
                  title: "Preppers & Self-Reliance Community",
                  desc: "You already stockpile, plan, and take preparedness seriously. Resilium gives you an honest, scored picture of where your gaps still are — and what to fix first.",
                },
                {
                  icon: <DollarSign className="w-6 h-6 text-primary" />,
                  title: "The Financially Anxious",
                  desc: "Job insecurity, inflation, and economic volatility are real. Find out exactly how many months of runway you have — and what would happen if you lost your income tomorrow.",
                },
                {
                  icon: <Globe className="w-6 h-6 text-primary" />,
                  title: "Expats & Digital Nomads",
                  desc: "Living internationally means location risk is real. Assess how your country of residence, mobility, and support network hold up when things go sideways.",
                },
                {
                  icon: <AlertTriangle className="w-6 h-6 text-primary" />,
                  title: "Navigating a Life Transition",
                  desc: "Retirement, job loss, divorce, or relocating — disruption comes in many forms. Resilium gives you a clear-eyed picture of your current situation and a concrete path forward, at any age.",
                },
                {
                  icon: <Users className="w-6 h-6 text-primary" />,
                  title: "Families & Households",
                  desc: "Resilium can assess your entire household — adults, dependents, and any mobility considerations — and produce a shared Household Resilience Score with a family-wide action plan.",
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex gap-4 p-6 rounded-2xl border border-border/60 bg-card/40 hover:border-primary/30 transition-colors">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">{icon}</div>
                  <div>
                    <h3 className="font-display font-semibold mb-2">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Buildathon community reactions */}
        <section className="w-full py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary text-center mb-3">Community</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-4">Early reactions</h2>
            <p className="text-center text-muted-foreground max-w-xl mx-auto mb-12">
              From Resilium's buildathon debut — real responses from real people, unedited.
            </p>

            {/* Pauline — featured */}
            <div className="mb-5 p-6 rounded-2xl border-2 border-primary/30 bg-primary/5 flex flex-col gap-3">
              <Quote className="w-5 h-5 text-primary/40" />
              <p className="text-base leading-relaxed text-foreground/90">
                "Definitely following this project. As a holistic &amp; executive performance coach, this is definitely something I'd love to get my clients to use!"
              </p>
              <div className="flex items-center gap-3 mt-1">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">P</div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Pauline H.</p>
                  <p className="text-xs text-muted-foreground">Holistic &amp; Executive Performance Coach</p>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {[
                { initial: "J", name: "Joel A.", quote: "Cristiana created something that 100% of us need and can use to our benefit. Well done!" },
                { initial: "R", name: "Rochelle Y.", quote: "Simple, easy to understand and more importantly something that's needed, absolutely love this project!" },
                { initial: "A", name: "Alejandro G.", quote: "Need this ASAP! Great idea." },
                { initial: "S", name: "Soumojit G.", quote: "Love the website!" },
              ].map(({ initial, name, quote }) => (
                <div key={name} className="p-5 rounded-2xl border border-border/60 bg-background flex flex-col gap-3 hover:border-primary/30 transition-colors">
                  <Quote className="w-4 h-4 text-primary/30" />
                  <p className="text-sm leading-relaxed text-foreground/80 flex-1">"{quote}"</p>
                  <div className="flex items-center gap-2.5 mt-1">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{initial}</div>
                    <span className="text-xs font-medium text-muted-foreground">{name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What you'll get */}
        <section className="w-full bg-card/40 border-y border-border/60 py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary text-center mb-3">What You Get</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-14">Everything in one place — forever</h2>

            {/* Strategic Action Plan — featured card */}
            <div className="mb-6 p-6 rounded-2xl border-2 border-primary/40 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-primary" />
              </div>
              <div>
                <div className="inline-block text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-0.5 rounded-full mb-2">Primary Deliverable</div>
                <h3 className="font-display font-bold text-lg mb-1">Strategic Action Plan</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A living document you actually work through — not a PDF you forget. Check off 30-day, 6-month, and long-term tasks, track your completion, and return anytime. Your plan updates as you progress.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  icon: <TrendingUp className="w-5 h-5 text-primary" />,
                  title: "Resilience Score",
                  desc: "A 0–100 composite score across six dimensions: Financial, Health, Skills, Mobility, Psychological, and Resources.",
                },
                {
                  icon: <Brain className="w-5 h-5 text-primary" />,
                  title: "Mental Resilience Profile",
                  desc: "A deep psychological assessment identifying your Growth or Compensation pathway and what it means for your planning.",
                },
                {
                  icon: <AlertTriangle className="w-5 h-5 text-primary" />,
                  title: "Scenario Stress Tests",
                  desc: "AI-generated simulations of your top risks — job loss, supply disruption, natural disaster — with your personal impact and recovery timeline.",
                },
                {
                  icon: <MapPin className="w-5 h-5 text-primary" />,
                  title: "Location Risk Analysis",
                  desc: "How your geography affects your vulnerability — climate exposure, political stability, infrastructure resilience.",
                },
                {
                  icon: <MessageCircle className="w-5 h-5 text-primary" />,
                  title: "AI Companion",
                  badge: "Pro",
                  desc: "Ask anything specific to your situation — your gaps, location, and what to tackle next. Grounded in your assessment, not generic advice.",
                },
                {
                  icon: <BookOpen className="w-5 h-5 text-primary" />,
                  title: "Crisis Guides",
                  desc: "15 practical, location-relevant guides for financial crisis, job loss, power outages, flooding, medical emergencies, digital security, and more — readable offline.",
                },
                {
                  icon: <Users className="w-5 h-5 text-primary" />,
                  title: "Household Assessment Mode",
                  desc: "Assess your entire household — adults, dependents, and mobility needs — and get a shared Household Resilience Score with a family-wide action plan.",
                },
              ].map(({ icon, title, desc, badge }: { icon: React.ReactNode; title: string; desc: string; badge?: string }) => (
                <div key={title} className="p-5 rounded-2xl border border-border/60 bg-background hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">{icon}</div>
                    <h3 className="font-semibold text-sm">{title}</h3>
                    {badge && <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">{badge}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="w-full bg-primary/5 border-t border-primary/10 py-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Ready to find out where you stand?</h2>
            <p className="text-muted-foreground mb-8">Takes 10–15 minutes to complete.</p>
            <Link href="/consent">
              <Button size="lg" className="rounded-full h-14 px-10 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300">
                Start the Assessment
                <ChevronRight className="ml-1 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
