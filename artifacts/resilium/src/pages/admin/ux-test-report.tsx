import { useParams, Link } from "wouter";
import { getAdminToken } from "./layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowLeft, Download, Printer, Star, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";

interface PersonaResult {
  personaKey: string;
  personaName: string;
  personaDescription: string;
  assessmentData: Record<string, unknown>;
  scores: Record<string, number> | null;
  aiQualityRating: number | null;
  aiQualityNotes: string | null;
  observations: string[] | null;
  status: string;
  error: string | null;
  completedAt: string | null;
}

interface RunReport {
  runId: string;
  startedAt: string;
  completedAt: string | null;
  personaCount: number;
  status: string;
  crossPersonaSummary: string | null;
  results: PersonaResult[];
}

function authH() { const t = localStorage.getItem("admin_token"); return t ? { Authorization: `Bearer ${t}` } : {}; }

async function fetchRunReport(runId: string): Promise<RunReport> {
  const res = await fetch(`/api/admin/ux-test/runs/${runId}`, { headers: authH() });
  if (!res.ok) throw new Error("Failed to fetch run report");
  return res.json();
}

function getRatingColor(rating: number) {
  if (rating >= 4) return "text-emerald-500";
  if (rating >= 3) return "text-amber-500";
  return "text-destructive";
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
      <span className={`ml-1 text-sm font-semibold ${getRatingColor(rating)}`}>{rating}/5</span>
    </div>
  );
}

function generateMarkdown(report: RunReport): string {
  const dateStr = new Date(report.startedAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const durationMin = report.completedAt
    ? Math.round((new Date(report.completedAt).getTime() - new Date(report.startedAt).getTime()) / 60000)
    : null;

  const avgRating =
    report.results
      .filter((r) => r.aiQualityRating != null)
      .reduce((sum, r) => sum + (r.aiQualityRating ?? 0), 0) /
    (report.results.filter((r) => r.aiQualityRating != null).length || 1);

  let md = `# Resilium UX Test Report\n\n`;
  md += `**Run ID:** ${report.runId}\n`;
  md += `**Date:** ${dateStr}\n`;
  md += `**Status:** ${report.status}\n`;
  md += `**Personas Tested:** ${report.personaCount}\n`;
  if (durationMin != null) md += `**Duration:** ${durationMin} minutes\n`;
  md += `**Average AI Quality Rating:** ${avgRating.toFixed(1)}/5\n\n`;
  md += `---\n\n`;

  md += `## Per-Persona Results\n\n`;
  for (const r of report.results) {
    md += `### ${r.personaName}\n\n`;
    md += `> ${r.personaDescription}\n\n`;

    if (r.status === "failed") {
      md += `**Status:** Failed — ${r.error ?? "Unknown error"}\n\n`;
      continue;
    }

    if (r.scores) {
      md += `**Resilience Scores:**\n\n`;
      md += `| Dimension | Score |\n|-----------|-------|\n`;
      md += `| Overall | ${r.scores.overall ?? "—"} |\n`;
      md += `| Financial | ${r.scores.financial ?? "—"} |\n`;
      md += `| Health | ${r.scores.health ?? "—"} |\n`;
      md += `| Skills | ${r.scores.skills ?? "—"} |\n`;
      md += `| Mobility | ${r.scores.mobility ?? "—"} |\n`;
      md += `| Psychological | ${r.scores.psychological ?? "—"} |\n`;
      md += `| Resources | ${r.scores.resources ?? "—"} |\n\n`;
    }

    if (r.aiQualityRating != null) {
      md += `**AI Report Quality Rating:** ${r.aiQualityRating}/5\n\n`;
      if (r.aiQualityNotes) md += `**Evaluation:** ${r.aiQualityNotes}\n\n`;
    }

    if (r.observations && r.observations.length > 0) {
      md += `**Key Observations:**\n\n`;
      for (const obs of r.observations) {
        md += `- ${obs}\n`;
      }
      md += "\n";
    }

    md += `---\n\n`;
  }

  if (report.crossPersonaSummary) {
    md += `## Cross-Persona Analysis\n\n`;
    md += report.crossPersonaSummary + "\n\n";
  }

  return md;
}

export default function UxTestReportPage() {
  const { runId } = useParams<{ runId: string }>();
  const adminToken = getAdminToken();

  const { data: report, isLoading, error } = useQuery({
    queryKey: ["ux-run-report", runId],
    queryFn: () => fetchRunReport(runId),
    enabled: !!adminToken && !!runId,
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.status === "running" ? 5000 : false;
    },
  });

  function downloadMarkdown() {
    if (!report) return;
    const md = generateMarkdown(report);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ux-test-report-${runId.slice(0, 8)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-sm w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-3" />
            <p className="text-muted-foreground">Failed to load report</p>
            <Link href="/admin/ux-testing">
              <Button variant="outline" className="mt-4">Back to UX Testing</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedResults = report.results.filter((r) => r.status === "completed");
  const avgRating = completedResults.length > 0
    ? completedResults.reduce((sum, r) => sum + (r.aiQualityRating ?? 0), 0) / completedResults.length
    : null;

  const durationMin = report.completedAt
    ? Math.round((new Date(report.completedAt).getTime() - new Date(report.startedAt).getTime()) / 60000)
    : null;

  return (
    <div className="min-h-screen bg-background print:bg-white">
      <div className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-10 print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/ux-testing">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-foreground">UX Test Report</h1>
              <p className="text-xs text-muted-foreground">
                {new Date(report.startedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                {durationMin != null && ` · ${durationMin} min`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={downloadMarkdown} className="gap-2">
              <Download className="w-4 h-4" />
              Export Markdown
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
              <Printer className="w-4 h-4" />
              Print / PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 print:py-4 print:px-8">
        <div className="print:block">
          <h1 className="text-2xl font-bold text-foreground hidden print:block mb-2">Resilium UX Test Report</h1>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="print:border print:shadow-none">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Status</p>
                <div className="mt-1">
                  <Badge variant={report.status === "completed" ? "outline" : report.status === "failed" ? "destructive" : "secondary"} className="capitalize">
                    {report.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <Card className="print:border print:shadow-none">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Personas</p>
                <p className="text-2xl font-bold text-foreground mt-1">{report.personaCount}</p>
              </CardContent>
            </Card>
            <Card className="print:border print:shadow-none">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Avg. Quality Rating</p>
                <p className={`text-2xl font-bold mt-1 ${avgRating != null ? getRatingColor(avgRating) : "text-muted-foreground"}`}>
                  {avgRating != null ? `${avgRating.toFixed(1)}/5` : "—"}
                </p>
              </CardContent>
            </Card>
            <Card className="print:border print:shadow-none">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {durationMin != null ? `${durationMin}m` : "—"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {report.status === "running" && (
          <div className="flex items-center gap-3 text-muted-foreground bg-muted/40 rounded-lg px-4 py-3">
            <Loader2 className="w-4 h-4 animate-spin" />
            <p className="text-sm">Test is still running. This page will refresh automatically.</p>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Per-Persona Results</h2>
          {report.results.map((result) => (
            <Card key={result.personaKey} className="print:border print:shadow-none print:break-inside-avoid">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                      {result.status === "completed" && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                      {result.status === "failed" && <XCircle className="w-4 h-4 text-destructive shrink-0" />}
                      {result.status === "pending" || result.status === "running" ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : null}
                      {result.personaName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{result.personaDescription}</p>
                  </div>
                  {result.aiQualityRating != null && (
                    <div className="shrink-0">
                      <StarRating rating={result.aiQualityRating} />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.status === "failed" && (
                  <div className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                    Error: {result.error ?? "Unknown error"}
                  </div>
                )}

                {result.scores && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Resilience Scores</p>
                    <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                      {(["overall", "financial", "health", "skills", "mobility", "psychological", "resources"] as const).map((dim) => (
                        <div key={dim} className="text-center">
                          <div className={`text-lg font-bold ${(result.scores?.[dim] ?? 0) >= 70 ? "text-emerald-500" : (result.scores?.[dim] ?? 0) >= 40 ? "text-amber-500" : "text-destructive"}`}>
                            {result.scores?.[dim] ?? "—"}
                          </div>
                          <p className="text-xs text-muted-foreground capitalize">{dim}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.aiQualityNotes && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">AI Evaluation</p>
                    <p className="text-sm text-foreground/90 leading-relaxed">{result.aiQualityNotes}</p>
                  </div>
                )}

                {result.observations && result.observations.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Key Observations</p>
                    <ul className="space-y-1">
                      {result.observations.map((obs, i) => (
                        <li key={i} className="text-sm text-foreground/80 flex gap-2">
                          <span className="text-muted-foreground shrink-0">·</span>
                          <span>{obs}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {report.crossPersonaSummary && (
          <>
            <Separator />
            <div className="space-y-4 print:break-inside-avoid">
              <h2 className="text-lg font-semibold text-foreground">Cross-Persona Analysis</h2>
              <Card className="print:border print:shadow-none">
                <CardContent className="pt-6">
                  <div className="prose prose-sm prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-li:text-foreground/90 prose-a:text-primary prose-hr:border-border/40">
                    <ReactMarkdown>{report.crossPersonaSummary}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { background: white !important; color: black !important; }
          .prose, .prose p, .prose li, .prose h1, .prose h2, .prose h3, .prose h4, .prose strong { color: black !important; }
          .prose h2 { font-size: 1rem; font-weight: 600; margin-top: 1rem; }
          .prose ul { margin-left: 1rem; }
          .prose li { margin-bottom: 0.25rem; }
        }
      `}</style>
    </div>
  );
}
