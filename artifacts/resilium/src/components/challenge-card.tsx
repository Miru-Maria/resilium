import React, { useState } from "react";
import { CheckCircle2, Circle, ChevronRight, Flame, Trophy, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buildChallenge, getPersonalizedOrder, type DimKey, type ChallengeAction } from "@/data/challenge-content";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const DIM_COLORS: Record<DimKey, string> = {
  financial:     "bg-emerald-100 text-emerald-700 border-emerald-200",
  health:        "bg-rose-100 text-rose-700 border-rose-200",
  skills:        "bg-blue-100 text-blue-700 border-blue-200",
  mobility:      "bg-violet-100 text-violet-700 border-violet-200",
  psychological: "bg-amber-100 text-amber-700 border-amber-200",
  resources:     "bg-teal-100 text-teal-700 border-teal-200",
};

const DIM_LABELS: Record<DimKey, string> = {
  financial: "Financial", health: "Health", skills: "Skills",
  mobility: "Mobility", psychological: "Psychological", resources: "Resources",
};

interface ChallengeState {
  startedAt: string;
  dimensionOrder: DimKey[];
  completedDays: number[];
}

interface ChallengeCardProps {
  latestScores?: Partial<Record<DimKey, number>> | null;
  isPro: boolean;
}

export function ChallengeCard({ latestScores, isPro }: ChallengeCardProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);

  const { data: state, isLoading } = useQuery<ChallengeState | null>({
    queryKey: ["challenge"],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(`${BASE}/api/challenge`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch challenge");
      return res.json();
    },
    staleTime: 60 * 1000,
  });

  const startMutation = useMutation({
    mutationFn: async () => {
      const order = getPersonalizedOrder(latestScores ?? {});
      const token = await getToken();
      const res = await fetch(`${BASE}/api/challenge/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ dimensionOrder: order }),
      });
      if (!res.ok) throw new Error("Failed to start challenge");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["challenge"] }),
  });

  const uncompleteMutation = useMutation({
    mutationFn: async (day: number) => {
      const token = await getToken();
      const res = await fetch(`${BASE}/api/challenge/complete/${day}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to undo day completion");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["challenge"] }),
  });

  const completeMutation = useMutation({
    mutationFn: async (day: number) => {
      const token = await getToken();
      const res = await fetch(`${BASE}/api/challenge/complete/${day}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to mark day complete");
      return res.json();
    },
    onSuccess: (_data, day) => {
      queryClient.invalidateQueries({ queryKey: ["challenge"] });
      toast({
        title: "Day marked complete!",
        description: `Day ${day} has been completed.`,
        action: (
          <ToastAction altText="Undo" onClick={() => uncompleteMutation.mutate(day)}>
            Undo
          </ToastAction>
        ),
      });
    },
  });

  if (!isPro) {
    return (
      <Card className="border-none shadow-md">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Trophy className="w-5 h-5 text-primary/50" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" /> 30-Day Resilience Challenge
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">A personalized daily micro-action plan across all 6 dimensions.</p>
            </div>
            <a href="/pricing">
              <Button size="sm" variant="outline" className="rounded-full text-xs flex-shrink-0">Unlock Pro</Button>
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="border-none shadow-md">
        <CardContent className="p-5">
          <div className="h-16 animate-pulse bg-muted/30 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  if (!state) {
    const order = getPersonalizedOrder(latestScores ?? {});
    const preview = buildChallenge(order).slice(0, 3);
    return (
      <Card className="border-none shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" /> 30-Day Resilience Challenge
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-5">
          <p className="text-sm text-muted-foreground mb-4">
            A personalized 30-day plan with one daily micro-action across all 6 resilience dimensions, weighted to your lowest-scoring areas.
          </p>
          <div className="space-y-2 mb-4">
            {preview.map((action) => (
              <div key={action.day} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Circle className="w-3.5 h-3.5 flex-shrink-0" />
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${DIM_COLORS[action.dimension]}`}>{DIM_LABELS[action.dimension]}</span>
                <span className="truncate">{action.title}</span>
              </div>
            ))}
            <p className="text-xs text-muted-foreground pl-6">… and 27 more personalized actions</p>
          </div>
          <Button
            size="sm"
            className="rounded-full gap-1.5"
            onClick={() => startMutation.mutate()}
            disabled={startMutation.isPending}
          >
            <Flame className="w-3.5 h-3.5" />
            {startMutation.isPending ? "Starting…" : "Start the Challenge"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const actions = buildChallenge(state.dimensionOrder);
  const completedSet = new Set(state.completedDays);
  const completedCount = completedSet.size;
  const pct = Math.round((completedCount / 30) * 100);

  const todayAction = actions.find((a) => !completedSet.has(a.day)) ?? null;
  const startDate = new Date(state.startedAt);
  const daysSinceStart = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-display flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" /> 30-Day Resilience Challenge
          </span>
          <span className="text-xs font-normal text-muted-foreground">Day {Math.min(daysSinceStart, 30)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4 space-y-4">
        {/* Progress ring + count */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" stroke="hsl(var(--muted))" strokeWidth="6" fill="none" />
              <circle
                cx="32" cy="32" r="26"
                stroke="hsl(var(--primary))" strokeWidth="6" fill="none"
                strokeDasharray={`${2 * Math.PI * 26}`}
                strokeDashoffset={`${2 * Math.PI * 26 * (1 - pct / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">{pct}%</span>
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-foreground">{completedCount}<span className="text-sm font-normal text-muted-foreground"> / 30</span></p>
            <p className="text-xs text-muted-foreground">actions completed</p>
          </div>
        </div>

        {/* Today's action */}
        {completedCount === 30 ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-700">Challenge complete!</p>
              <p className="text-xs text-emerald-600">You've completed all 30 resilience actions.</p>
            </div>
          </div>
        ) : todayAction ? (
          <div className="p-4 rounded-xl border border-border bg-card space-y-2.5">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${DIM_COLORS[todayAction.dimension]}`}>
                {DIM_LABELS[todayAction.dimension]}
              </span>
              <span className="text-xs text-muted-foreground">Day {todayAction.day} · ~{todayAction.estimatedMinutes} min</span>
            </div>
            <p className="text-sm font-semibold text-foreground">{todayAction.title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{todayAction.description}</p>
            <Button
              size="sm"
              className="rounded-full gap-1.5 mt-1"
              onClick={() => completeMutation.mutate(todayAction.day)}
              disabled={completeMutation.isPending}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {completeMutation.isPending ? "Saving…" : "Mark Complete"}
            </Button>
          </div>
        ) : null}

        {/* Show all / collapse */}
        <button
          type="button"
          className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Hide all actions" : "View all 30 actions"}
          <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
        </button>

        {expanded && (
          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {actions.map((action) => (
              <div
                key={action.day}
                className={`flex items-start gap-2.5 text-xs py-1.5 border-b border-border/30 last:border-0 ${completedSet.has(action.day) ? "opacity-50" : ""}`}
              >
                {completedSet.has(action.day)
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  : <Circle className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0 mt-0.5" />}
                <span className={`font-semibold flex-shrink-0 w-8 text-muted-foreground`}>D{action.day}</span>
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full border flex-shrink-0 ${DIM_COLORS[action.dimension]}`}>{DIM_LABELS[action.dimension][0]}</span>
                <span className={completedSet.has(action.day) ? "line-through" : ""}>{action.title}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
