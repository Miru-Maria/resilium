import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Loader2, Play, CheckCircle2, XCircle, Clock, ChevronRight,
  AlertCircle, RefreshCw, Trash2, Ban
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout, getAdminToken } from "./layout";

interface PersonaMeta {
  key: string;
  name: string;
  description: string;
}

interface RunSummary {
  runId: string;
  startedAt: string;
  completedAt: string | null;
  personaCount: number;
  status: string;
}

interface PersonaProgress {
  personaKey: string;
  personaName: string;
  status: "pending" | "running" | "completed" | "failed";
  aiQualityRating?: number;
  error?: string;
}

function getToken() { return localStorage.getItem("admin_token"); }
function authH() { const t = getToken(); return t ? { Authorization: `Bearer ${t}` } : {}; }

async function fetchPersonas(): Promise<{ personas: PersonaMeta[] }> {
  const res = await fetch("/api/admin/ux-test/personas", { headers: authH() });
  if (!res.ok) throw new Error(`Failed to fetch personas (${res.status})`);
  return res.json();
}

async function fetchRuns(): Promise<{ runs: RunSummary[] }> {
  const res = await fetch("/api/admin/ux-test/runs", { headers: authH() });
  if (!res.ok) throw new Error(`Failed to fetch runs (${res.status})`);
  return res.json();
}

async function deleteRun(runId: string): Promise<void> {
  const res = await fetch(`/api/admin/ux-test/runs/${runId}`, {
    method: "DELETE",
    headers: authH(),
  });
  if (!res.ok) throw new Error("Failed to delete run");
}

async function cancelRun(runId: string): Promise<void> {
  const res = await fetch(`/api/admin/ux-test/runs/${runId}/cancel`, {
    method: "POST",
    headers: authH(),
  });
  if (!res.ok) throw new Error("Failed to cancel run");
}

function getRatingColor(rating: number) {
  if (rating >= 4) return "text-emerald-500";
  if (rating >= 3) return "text-amber-500";
  return "text-destructive";
}

function getRatingLabel(rating: number) {
  if (rating >= 5) return "Excellent";
  if (rating >= 4) return "Good";
  if (rating >= 3) return "Adequate";
  if (rating >= 2) return "Poor";
  return "Very Poor";
}

export default function UxTestingPage() {
  const adminToken = getAdminToken();
  const queryClient = useQueryClient();
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [isRunning, setIsRunning] = useState(false);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [personaProgress, setPersonaProgress] = useState<Map<string, PersonaProgress>>(new Map());
  const [runComplete, setRunComplete] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const {
    data: personasData,
    isLoading: personasLoading,
    error: personasError,
    refetch: refetchPersonas,
  } = useQuery({
    queryKey: ["ux-personas"],
    queryFn: fetchPersonas,
    enabled: !!adminToken,
    retry: 1,
  });

  const {
    data: runsData,
    isLoading: runsLoading,
    error: runsError,
    refetch: refetchRuns,
  } = useQuery({
    queryKey: ["ux-runs"],
    queryFn: fetchRuns,
    enabled: !!adminToken,
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRun,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ux-runs"] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelRun,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ux-runs"] });
    },
  });

  const personas = personasData?.personas ?? [];
  const runs = runsData?.runs ?? [];

  useEffect(() => {
    if (personas.length > 0 && selectedKeys.size === 0) {
      setSelectedKeys(new Set(personas.map((p) => p.key)));
    }
  }, [personas, selectedKeys.size]);

  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  function togglePersona(key: string) {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleAll() {
    if (selectedKeys.size === personas.length) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(personas.map((p) => p.key)));
    }
  }

  async function startRun() {
    if (selectedKeys.size === 0) return;
    setIsRunning(true);
    setRunComplete(false);
    setRunError(null);

    const initialProgress = new Map<string, PersonaProgress>();
    for (const key of selectedKeys) {
      const persona = personas.find((p) => p.key === key);
      if (persona) {
        initialProgress.set(key, { personaKey: key, personaName: persona.name, status: "pending" });
      }
    }
    setPersonaProgress(initialProgress);

    try {
      const res = await fetch("/api/admin/ux-test/run", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authH() },
        body: JSON.stringify({ personaKeys: Array.from(selectedKeys) }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }
      const { runId } = await res.json() as { runId: string };
      setActiveRunId(runId);

      const token = getToken();
      const streamUrl = `/api/admin/ux-test/runs/${runId}/stream${token ? `?token=${encodeURIComponent(token)}` : ""}`;
      const es = new EventSource(streamUrl);
      eventSourceRef.current = es;

      es.onmessage = (e: MessageEvent) => {
        const data = JSON.parse(e.data as string) as {
          type: string;
          personaKey?: string;
          personaName?: string;
          aiQualityRating?: number;
          error?: string;
          runId?: string;
        };

        if (data.type === "persona_started" && data.personaKey) {
          setPersonaProgress((prev) => {
            const next = new Map(prev);
            const existing = next.get(data.personaKey!) ?? { personaKey: data.personaKey!, personaName: data.personaName ?? "", status: "pending" as const };
            next.set(data.personaKey!, { ...existing, status: "running" });
            return next;
          });
        } else if (data.type === "persona_completed" && data.personaKey) {
          setPersonaProgress((prev) => {
            const next = new Map(prev);
            const existing = next.get(data.personaKey!) ?? { personaKey: data.personaKey!, personaName: data.personaName ?? "", status: "pending" as const };
            next.set(data.personaKey!, { ...existing, status: "completed", aiQualityRating: data.aiQualityRating });
            return next;
          });
        } else if (data.type === "persona_failed" && data.personaKey) {
          setPersonaProgress((prev) => {
            const next = new Map(prev);
            const existing = next.get(data.personaKey!) ?? { personaKey: data.personaKey!, personaName: data.personaName ?? "", status: "pending" as const };
            next.set(data.personaKey!, { ...existing, status: "failed", error: data.error });
            return next;
          });
        } else if (data.type === "run_completed") {
          es.close();
          setIsRunning(false);
          setRunComplete(true);
          refetchRuns();
        } else if (data.type === "run_failed") {
          es.close();
          setIsRunning(false);
          setRunComplete(true);
          setRunError(data.error ?? "The test run encountered an error.");
          refetchRuns();
        }
      };

      es.onerror = () => {
        es.close();
        setIsRunning(false);
        setRunError("Lost connection to the test stream. The run may still be processing.");
        refetchRuns();
      };
    } catch (err) {
      setIsRunning(false);
      setRunError(err instanceof Error ? err.message : "Failed to start the test run.");
    }
  }

  const allSelected = selectedKeys.size === personas.length && personas.length > 0;
  const noneSelected = selectedKeys.size === 0;

  return (
    <AdminLayout activeSection="ux-testing">
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold">AI UX Tester</h1>
          <p className="text-muted-foreground text-sm mt-1">Autonomous AI persona simulation — evaluates report quality across diverse user profiles</p>
        </div>

        {!isRunning && !runComplete && (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Select Personas</h2>
                  <p className="text-sm text-muted-foreground">Choose which user personas to simulate in this test run</p>
                </div>
                {personas.length > 0 && (
                  <Button variant="outline" size="sm" onClick={toggleAll}>
                    {allSelected ? "Deselect All" : "Select All"}
                  </Button>
                )}
              </div>

              {personasLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading personas...</span>
                </div>
              ) : personasError ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Could not load personas</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {personasError instanceof Error ? personasError.message : "An error occurred"}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => refetchPersonas()} className="gap-2">
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {personas.map((persona) => (
                    <Card
                      key={persona.key}
                      className={`cursor-pointer transition-all border ${selectedKeys.has(persona.key) ? "border-primary/50 bg-primary/5" : "border-border/60 bg-card"}`}
                      onClick={() => togglePersona(persona.key)}
                    >
                      <CardContent className="p-4 flex gap-3 items-start">
                        <Checkbox
                          checked={selectedKeys.has(persona.key)}
                          onCheckedChange={() => togglePersona(persona.key)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground">{persona.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{persona.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {runError && (
              <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-destructive">Run failed</p>
                  <p className="text-xs text-destructive/80 mt-0.5">{runError}</p>
                </div>
                <Button variant="ghost" size="sm" className="shrink-0 h-7 px-2 text-xs" onClick={() => setRunError(null)}>Dismiss</Button>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                {selectedKeys.size} of {personas.length} personas selected
              </p>
              <Button
                onClick={startRun}
                disabled={noneSelected || personasLoading || !!personasError}
                className="gap-2"
              >
                <Play className="w-4 h-4" />
                Run UX Test
              </Button>
            </div>
          </>
        )}

        {(isRunning || (runComplete && activeRunId)) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {isRunning ? "Test in Progress" : runError ? "Test Failed" : "Test Complete"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isRunning
                    ? "Simulating personas and evaluating reports — this may take several minutes..."
                    : runError
                    ? runError
                    : "All personas evaluated successfully"}
                </p>
              </div>
              {isRunning && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
              {runComplete && !runError && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {runComplete && runError && <XCircle className="w-5 h-5 text-destructive" />}
            </div>

            <div className="space-y-2">
              {Array.from(personaProgress.values()).map((pp) => (
                <div key={pp.personaKey} className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card">
                  <div className="flex items-center gap-3">
                    {pp.status === "pending" && <Clock className="w-4 h-4 text-muted-foreground" />}
                    {pp.status === "running" && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                    {pp.status === "completed" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    {pp.status === "failed" && <XCircle className="w-4 h-4 text-destructive" />}
                    <div>
                      <p className="text-sm font-medium text-foreground">{pp.personaName}</p>
                      {pp.status === "failed" && pp.error && (
                        <p className="text-xs text-destructive mt-0.5">{pp.error}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {pp.status === "completed" && pp.aiQualityRating != null && (
                      <Badge variant="outline" className={`text-xs ${getRatingColor(pp.aiQualityRating)}`}>
                        {pp.aiQualityRating}/5 — {getRatingLabel(pp.aiQualityRating)}
                      </Badge>
                    )}
                    {pp.status === "pending" && <Badge variant="secondary" className="text-xs">Queued</Badge>}
                    {pp.status === "running" && <Badge variant="secondary" className="text-xs">Running</Badge>}
                    {pp.status === "failed" && <Badge variant="destructive" className="text-xs">Failed</Badge>}
                  </div>
                </div>
              ))}
            </div>

            {runComplete && (
              <div className="flex gap-3 pt-2">
                {activeRunId && !runError && (
                  <Link href={`/admin/ux-test/report/${activeRunId}`}>
                    <Button className="gap-2">
                      View Report <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setRunComplete(false);
                    setActiveRunId(null);
                    setPersonaProgress(new Map());
                    setRunError(null);
                  }}
                >
                  Run Another Test
                </Button>
              </div>
            )}
          </div>
        )}

        <Separator />

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Previous Test Runs</h2>
          {runsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-4 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading runs...</span>
            </div>
          ) : runsError ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <AlertCircle className="w-6 h-6 text-destructive" />
              <p className="text-sm text-muted-foreground">
                {runsError instanceof Error ? runsError.message : "Failed to load previous runs"}
              </p>
              <Button variant="outline" size="sm" onClick={() => refetchRuns()} className="gap-2">
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </Button>
            </div>
          ) : runs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No test runs yet — run your first UX test above</p>
          ) : (
            <div className="space-y-2">
              {runs.map((run) => (
                <div
                  key={run.runId}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/60 bg-card"
                >
                  <Link href={`/admin/ux-test/report/${run.runId}`} className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      {run.status === "completed" && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                      {run.status === "running" && <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />}
                      {run.status === "failed" && <XCircle className="w-4 h-4 text-destructive shrink-0" />}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {new Date(run.startedAt).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {run.personaCount} persona{run.personaCount !== 1 ? "s" : ""}
                          {run.completedAt && ` · ${Math.round((new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) / 60000)} min`}
                        </p>
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <Badge
                      variant={run.status === "completed" ? "outline" : run.status === "failed" ? "destructive" : "secondary"}
                      className="text-xs capitalize"
                    >
                      {run.status}
                    </Badge>
                    {run.status === "running" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" title="Cancel run">
                            <Ban className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel test run?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will mark the run as failed. Any in-progress persona simulations will be stopped.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep Running</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => cancelMutation.mutate(run.runId)}
                            >
                              Cancel Run
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" title="Delete run">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this test run?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove the run and all its results. This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => deleteMutation.mutate(run.runId)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Link href={`/admin/ux-test/report/${run.runId}`}>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
