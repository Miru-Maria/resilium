import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Loader2, Play, CheckCircle2, XCircle, Clock, ChevronRight, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout, adminAuthHeaders, getAdminToken } from "./layout";

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
  if (!res.ok) throw new Error("Failed to fetch personas");
  return res.json();
}

async function fetchRuns(): Promise<{ runs: RunSummary[] }> {
  const res = await fetch("/api/admin/ux-test/runs", { headers: authH() });
  if (!res.ok) throw new Error("Failed to fetch runs");
  return res.json();
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
  const [, navigate] = useLocation();
  const adminToken = getAdminToken();
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [isRunning, setIsRunning] = useState(false);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [personaProgress, setPersonaProgress] = useState<Map<string, PersonaProgress>>(new Map());
  const [runComplete, setRunComplete] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const { data: personasData, isLoading: personasLoading } = useQuery({
    queryKey: ["ux-personas"],
    queryFn: fetchPersonas,
    enabled: !!adminToken,
  });

  const { data: runsData, isLoading: runsLoading, refetch: refetchRuns } = useQuery({
    queryKey: ["ux-runs"],
    queryFn: fetchRuns,
    enabled: !!adminToken,
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

      if (!res.ok) throw new Error("Failed to start run");
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
        } else if (data.type === "run_completed" || data.type === "run_failed") {
          es.close();
          setIsRunning(false);
          setRunComplete(true);
          refetchRuns();
        }
      };

      es.onerror = () => {
        es.close();
        setIsRunning(false);
      };
    } catch {
      setIsRunning(false);
    }
  }

  const allSelected = selectedKeys.size === personas.length;
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
                <Button variant="outline" size="sm" onClick={toggleAll}>
                  {allSelected ? "Deselect All" : "Select All"}
                </Button>
              </div>

              {personasLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading personas...</span>
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

            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                {selectedKeys.size} of {personas.length} personas selected
              </p>
              <Button onClick={startRun} disabled={noneSelected || personasLoading} className="gap-2">
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
                  {isRunning ? "Test in Progress" : "Test Complete"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isRunning ? "Simulating personas and evaluating reports..." : "All personas evaluated"}
                </p>
              </div>
              {isRunning && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
              {runComplete && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
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

            {runComplete && activeRunId && (
              <div className="flex gap-3 pt-2">
                <Link href={`/admin/ux-test/report/${activeRunId}`}>
                  <Button className="gap-2">
                    View Report <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="outline" onClick={() => { setRunComplete(false); setActiveRunId(null); setPersonaProgress(new Map()); }}>
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
          ) : runs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No test runs yet — run your first UX test above</p>
          ) : (
            <div className="space-y-2">
              {runs.map((run) => (
                <Link key={run.runId} href={`/admin/ux-test/report/${run.runId}`}>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border/60 bg-card hover:bg-accent/40 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      {run.status === "completed" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      {run.status === "running" && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                      {run.status === "failed" && <XCircle className="w-4 h-4 text-destructive" />}
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {new Date(run.startedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {run.personaCount} persona{run.personaCount !== 1 ? "s" : ""}
                          {run.completedAt && ` · ${Math.round((new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) / 60000)} min`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={run.status === "completed" ? "outline" : run.status === "failed" ? "destructive" : "secondary"} className="text-xs capitalize">
                        {run.status}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
