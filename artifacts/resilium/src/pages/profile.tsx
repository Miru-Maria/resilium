import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@workspace/replit-auth-web";
import { ResilientIcon } from "@/components/resilient-icon";
import {
  Trash2,
  Eye,
  AlertTriangle,
  Loader2,
  CalendarDays,
  User,
  LogIn,
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

export default function ProfilePage() {
  const { user, isLoading: authLoading, isAuthenticated, login, logout } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
        <div className="mb-10">
          <h1 className="text-3xl font-display font-bold text-foreground mb-1">My Plans</h1>
          <p className="text-muted-foreground">
            {plans.length} of {PLAN_LIMIT} plans used
          </p>
        </div>

        {/* Plan limit warning */}
        {atLimit && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">
              You've reached the maximum of {PLAN_LIMIT} saved plans. Delete an existing plan before creating a new one.
            </p>
          </div>
        )}

        {/* CTA to create new plan */}
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

              return (
                <Card key={plan.reportId} className="border border-border shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-6">
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
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <CalendarDays className="w-3.5 h-3.5" />
                          <span>
                            {date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
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
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Delete confirmation dialog */}
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
    </div>
  );
}
