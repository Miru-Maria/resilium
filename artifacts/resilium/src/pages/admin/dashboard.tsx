import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useLocation, useSearch, Link } from "wouter";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";
import {
  Loader2, AlertTriangle, FileText,
  Star, Activity, MessageSquare, Smartphone, ExternalLink, Eye,
  Search, ChevronLeft, ChevronRight, X,
  Users, TrendingUp, Zap, Award, Target, BarChart2,
  Download, ClipboardPaste, Maximize2, Minimize2, Settings2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { adminAuthHeaders, AdminLayout } from "./layout";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const COLORS = ["#6366f1", "#22d3ee", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6", "#f97316", "#14b8a6"];

const UMAMI_SHARE_URL = import.meta.env.VITE_UMAMI_SHARE_URL as string | undefined;
const UMAMI_WEBSITE_ID = "c5f820b3-31df-42c7-9c67-2d669117f9b6";

interface AnalyticsData {
  overview: {
    totalReports: number;
    avgOverall: number;
    reportsPerDay: { date: string; count: number }[];
    planViewsThisWeek?: number;
  };
  demographics: {
    location: { name: string; count: number }[];
    incomeStability: { name: string; count: number }[];
    healthStatus: { name: string; count: number }[];
    housingType: { name: string; count: number }[];
    mobilityLevel: { name: string; count: number }[];
    dependentCount: { name: string; count: number }[];
    relocationReadiness: { name: string; count: number }[];
    ageBracket: { name: string; count: number }[];
  };
  scoreAnalytics: {
    avgScores: { category: string; avg: number }[];
    scoreHistogram: { range: string; count: number }[];
  };
  riskConcerns: { concern: string; count: number }[];
  primaryGoalDistribution: { goal: string; count: number }[];
  recentReports: {
    reportId: string;
    createdAt: string;
    location: string;
    overallScore: number;
    incomeStability: string;
  }[];
  feedback: {
    totalFeedback: number;
    avgRating: number;
    ratingDistribution: { star: number; count: number }[];
    recentComments: { reportId: string; rating: number; comment: string | null; createdAt: string }[];
  };
}

interface UserAnalytics {
  totals: {
    totalUsers: number;
    totalPro: number;
    usersWithAtLeastOnePlan: number;
    activeUsers30d: number;
    conversionRate: number;
  };
  signupsByMonth: { month: string; count: number }[];
  assessmentsByMonth: { month: string; count: number }[];
  dimensionAverages: { name: string; value: number }[];
  planBuckets: { label: string; count: number }[];
  activeUsersByDay: { date: string; count: number }[];
}

const DIM_COLORS: Record<string, string> = {
  Financial: "#10b981",
  Health: "#ef4444",
  Skills: "#3b82f6",
  Mobility: "#8b5cf6",
  Psychological: "#f59e0b",
  Resources: "#14b8a6",
};

async function fetchUserAnalytics(): Promise<UserAnalytics> {
  const res = await fetch(`${BASE}/api/admin/analytics/users`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch user analytics");
  return res.json();
}

function StatCard({ title, value, icon: Icon, description }: { title: string; value: string | number; icon: React.ElementType; description?: string }) {
  return (
    <Card className="border-none shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div className="text-2xl font-bold font-display">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}

function UserStatCard({ title, value, sub, icon: Icon, color }: {
  title: string; value: string | number; sub?: string; icon: React.ElementType; color: string;
}) {
  return (
    <Card className="border-none shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">{title}</p>
            <p className={`text-3xl font-display font-bold ${color}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.replace("text-", "bg-").replace("500", "100")}`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  );
}

interface PlatformSplit {
  totalMobile: number;
  totalWeb: number;
  totalAll: number;
}

const RADIAN = Math.PI / 180;
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  if (percent < 0.04) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ─── Umami Traffic Section ──────────────────────────────────────────────────────
function UmamiSection() {
  const [expanded, setExpanded] = useState(false);

  if (!UMAMI_SHARE_URL) {
    return (
      <Card className="border-none shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" /> Traffic Analytics — Umami
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl bg-muted/40 border border-dashed border-muted-foreground/20 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Settings2 className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-semibold">One-time setup required</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your Umami tracking is already live (website ID <code className="bg-muted px-1 py-0.5 rounded text-[11px]">{UMAMI_WEBSITE_ID}</code>).
                  To embed the dashboard here, generate a public share URL from your Umami account and add it as an environment variable.
                </p>
              </div>
            </div>
            <div className="bg-background rounded-lg border p-4 space-y-3 text-xs">
              <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Setup steps</p>
              <ol className="space-y-2 text-sm text-foreground/80 list-none">
                {[
                  <>Log into <a href="https://cloud.umami.is" target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2 inline-flex items-center gap-1">cloud.umami.is <ExternalLink className="w-3 h-3" /></a> and open your Resilium website.</>,
                  <>Go to <strong>Settings</strong> → <strong>Share URL</strong> and toggle it on.</>,
                  <>Copy the generated share URL (looks like <code className="bg-muted px-1 py-0.5 rounded">https://cloud.umami.is/share/…/resilium-platform.com</code>).</>,
                  <>In Replit, add a new secret: <code className="bg-muted px-1 py-0.5 rounded">VITE_UMAMI_SHARE_URL</code> with that URL as the value.</>,
                  <>Restart the web workflow — the dashboard will appear here automatically.</>,
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-display flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" /> Traffic Analytics — Umami
          </CardTitle>
          <div className="flex items-center gap-2">
            <a
              href={UMAMI_SHARE_URL} target="_blank" rel="noreferrer"
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
            >
              Open full view <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={() => setExpanded(e => !e)}
              className="text-muted-foreground hover:text-primary transition-colors p-1 rounded"
              title={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 pb-1">
        <div className="px-4 pb-2">
          <p className="text-[11px] text-muted-foreground bg-muted/40 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
            <Download className="w-3 h-3 flex-shrink-0 opacity-50" />
            The Download button inside the embed is blocked by browser security — use the paste tool below to export table data as CSV.
          </p>
        </div>
        <iframe
          src={UMAMI_SHARE_URL}
          className="w-full rounded-b-xl border-0 transition-all duration-300"
          style={{ height: expanded ? "900px" : "520px" }}
          title="Umami Analytics Dashboard"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </CardContent>
    </Card>
  );
}

function UmamiExportSection() {
  const [raw, setRaw] = useState("");
  type Row = { page: string; visitors: string; visits: string; views: string };
  const parsed: Row[] = useMemo(() => {
    if (!raw.trim()) return [];
    const lines = raw.trim().split("\n").filter(Boolean);
    const rows: Row[] = [];
    for (const line of lines) {
      const cols = line.split(/\t|  +/).map(c => c.trim()).filter(Boolean);
      if (cols.length < 2) continue;
      if (/^(exit\s*page|page|url)/i.test(cols[0])) continue;
      const [page, ...rest] = cols;
      const nums = rest.filter(c => /^\d+$/.test(c));
      rows.push({ page: page ?? "", visitors: nums[0] ?? "", visits: nums[1] ?? "", views: nums[2] ?? "" });
    }
    return rows;
  }, [raw]);

  function downloadCSV() {
    if (!parsed.length) return;
    const header = "Page,Visitors,Visits,Views";
    const lines = parsed.map(r =>
      [r.page, r.visitors, r.visits, r.views].map(v => `"${v.replace(/"/g, '""')}"`).join(",")
    );
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `umami-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-display flex items-center gap-2">
            <Download className="w-4 h-4 text-primary" /> Export Table as CSV
          </CardTitle>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Select and copy any table from the embed above (click into the table, then Ctrl+A / Cmd+A and Ctrl+C), then paste below to download as CSV.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <textarea
            className="w-full h-36 px-3 py-2.5 text-xs rounded-xl border bg-muted/30 font-mono resize-y focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            placeholder={"Paste table data from the embed above…\n\nExample:\n/           35    56    172\n/profile     9    22    144"}
            value={raw}
            onChange={e => setRaw(e.target.value)}
          />
          {!raw && (
            <div className="absolute top-3 right-3 pointer-events-none">
              <ClipboardPaste className="w-4 h-4 text-muted-foreground/40" />
            </div>
          )}
        </div>
        {parsed.length > 0 && (
          <>
            <div className="rounded-xl border overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/40 border-b">
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Page</th>
                    <th className="px-3 py-2 text-right font-semibold text-muted-foreground">Visitors</th>
                    <th className="px-3 py-2 text-right font-semibold text-muted-foreground">Visits</th>
                    <th className="px-3 py-2 text-right font-semibold text-muted-foreground">Views</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {parsed.map((r, i) => (
                    <tr key={i} className="hover:bg-muted/20">
                      <td className="px-3 py-1.5 font-mono text-primary">{r.page}</td>
                      <td className="px-3 py-1.5 text-right">{r.visitors}</td>
                      <td className="px-3 py-1.5 text-right">{r.visits}</td>
                      <td className="px-3 py-1.5 text-right">{r.views}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: "#E08040", color: "#0D1225" }}
            >
              <Download className="w-4 h-4" />
              Download {parsed.length} rows as CSV
            </button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Valid tabs ─────────────────────────────────────────────────────────────────
const VALID_TABS = ["overview", "demographics", "scores", "goals", "risks", "reports", "feedback", "traffic", "users"];

export default function AdminDashboard() {
  const [location, setLocation] = useLocation();
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const tabFromUrl = searchParams.get("tab") ?? "overview";
  const activeTab = VALID_TABS.includes(tabFromUrl) ? tabFromUrl : "overview";

  const setTab = useCallback((tab: string) => {
    const params = new URLSearchParams(search);
    params.set("tab", tab);
    setLocation(`${location.split("?")[0]}?${params.toString()}`, { replace: true });
  }, [location, search, setLocation]);

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [platformSplit, setPlatformSplit] = useState<PlatformSplit | null>(null);
  const [coachingClicks, setCoachingClicks] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  interface ReportsPageData {
    reports: { reportId: string; createdAt: string; location: string; overallScore: number; incomeStability: string; ageBracket: string | null; primaryGoal: string | null }[];
    total: number; page: number; limit: number; totalPages: number;
  }
  const [reportsData, setReportsData] = useState<ReportsPageData | null>(null);
  const [reportsPage, setReportsPage] = useState(1);
  const [reportsSearch, setReportsSearch] = useState("");
  const [reportsLoading, setReportsLoading] = useState(false);
  const reportsDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [analyticsRes, mobileRes, coachingRes] = await Promise.all([
          fetch(`${BASE}/api/admin/analytics`, { credentials: "include" }),
          fetch(`${BASE}/api/admin/analytics/mobile`, { credentials: "include" }),
          fetch(`${BASE}/api/admin/coaching-stats`, { credentials: "include" }),
        ]);
        if (analyticsRes.status === 401) {
          setLocation("/admin/login");
          return;
        }
        if (!analyticsRes.ok) throw new Error("Failed to load analytics");
        setData(await analyticsRes.json());
        if (mobileRes.ok) {
          const md = await mobileRes.json();
          setPlatformSplit({ totalMobile: md.totalMobile, totalWeb: md.totalWeb, totalAll: md.totalAll });
        }
        if (coachingRes.ok) {
          const cd = await coachingRes.json();
          setCoachingClicks(cd.coachingClicksTotal ?? 0);
        }
      } catch (e: any) {
        setError(e.message ?? "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [setLocation]);

  const fetchReports = useCallback(async (page: number, search: string) => {
    setReportsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "25" });
      if (search) params.set("search", search);
      const res = await fetch(`${BASE}/api/admin/reports?${params}`, { credentials: "include" });
      if (res.ok) setReportsData(await res.json());
    } finally {
      setReportsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab !== "reports") return;
    if (reportsDebounce.current) clearTimeout(reportsDebounce.current);
    reportsDebounce.current = setTimeout(() => fetchReports(reportsPage, reportsSearch), 300);
    return () => { if (reportsDebounce.current) clearTimeout(reportsDebounce.current); };
  }, [activeTab, reportsPage, reportsSearch, fetchReports]);

  // User analytics query (lazy — only when tab is active)
  const { data: userData, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ["adminUserAnalytics"],
    queryFn: fetchUserAnalytics,
    staleTime: 2 * 60 * 1000,
    enabled: activeTab === "users",
  });

  if (!loading && (error || !data)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="w-12 h-12 text-destructive" />
        <p className="text-muted-foreground">{error ?? "No data available"}</p>
        <Button variant="outline" onClick={() => setLocation("/admin/login")}>Back to Login</Button>
      </div>
    );
  }

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const fmtMonth = (key: string) => {
    const [y, m] = key.split("-");
    return new Date(Number(y), Number(m) - 1).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  };

  return (
    <AdminLayout activeSection="dashboard">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Overview of all resilience assessments, user analytics, traffic, and feedback.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setTab}>
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
            <TabsTrigger value="scores">Score Analytics</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="risks">Risk Concerns</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="traffic">Traffic</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {!data ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
            <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Reports" value={data.overview.totalReports} icon={FileText} description="All time submissions" />
              <StatCard title="Avg Overall Score" value={`${data.overview.avgOverall}/100`} icon={Activity} description="Across all users" />
              <StatCard title="Plan Opens (7d)" value={data.overview.planViewsThisWeek ?? 0} icon={Eye} description="Action plan page views" />
              <StatCard title="Feedback Received" value={data.feedback.totalFeedback} icon={MessageSquare} description={data.feedback.totalFeedback > 0 ? `Avg rating: ${data.feedback.avgRating}/5` : "No feedback yet"} />
              <StatCard title="Coaching Clicks" value={coachingClicks ?? "—"} icon={ExternalLink} description="Since last server restart" />
            </div>

            {platformSplit && (
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-display flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-primary" /> Platform Breakdown
                  </CardTitle>
                  <CardDescription className="text-xs">Mobile app vs web across all assessments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold font-display text-primary">{platformSplit.totalMobile}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Mobile</p>
                    </div>
                    <div className="text-center border-x border-border">
                      <p className="text-2xl font-bold font-display">{platformSplit.totalWeb}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Web</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold font-display text-muted-foreground">
                        {platformSplit.totalAll > 0 ? `${Math.round((platformSplit.totalMobile / platformSplit.totalAll) * 100)}%` : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">Mobile Share</p>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: platformSplit.totalAll > 0 ? `${(platformSplit.totalMobile / platformSplit.totalAll) * 100}%` : "0%" }}
                    />
                  </div>
                  <a href="/admin/mobile" className="text-xs text-primary hover:underline mt-3 block">View full mobile analytics →</a>
                </CardContent>
              </Card>
            )}

            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-base font-display">Reports per Day (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={data.overview.reportsPerDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip labelFormatter={d => String(d)} />
                    <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={false} name="Reports" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            </>
            )}
          </TabsContent>

          <TabsContent value="demographics" className="space-y-6">
            {!data ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
            <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[
                { label: "Age Bracket", key: "ageBracket" as const },
                { label: "Income Stability", key: "incomeStability" as const },
                { label: "Health Status", key: "healthStatus" as const },
                { label: "Housing Type", key: "housingType" as const },
                { label: "Mobility Level", key: "mobilityLevel" as const },
                { label: "Dependents", key: "dependentCount" as const },
                { label: "Relocation Readiness", key: "relocationReadiness" as const },
              ].map(({ label, key }) => (
                <Card key={key} className="border-none shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={data.demographics[key]} layout="vertical">
                        <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                        <Tooltip />
                        <Bar dataKey="count" radius={4} name="Count">
                          {data.demographics[key].map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ))}
              <Card className="border-none shadow-md lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Location Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.demographics.location.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">No data yet</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={data.demographics.location}
                          dataKey="count" nameKey="name"
                          cx="50%" cy="45%" outerRadius={95}
                          labelLine={false} label={renderPieLabel}
                        >
                          {data.demographics.location.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => [v, "Reports"]} />
                        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
            </>
            )}
          </TabsContent>

          <TabsContent value="scores" className="space-y-6">
            {!data ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
            <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-base font-display">Average Score by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={data.scoreAnalytics.avgScores}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
                      <Radar name="Avg Score" dataKey="avg" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                      <Tooltip formatter={(v: number) => Math.round(v)} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-base font-display">Overall Score Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.scoreAnalytics.scoreHistogram}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#22d3ee" radius={4} name="Reports" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base font-display">Category Score Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.scoreAnalytics.avgScores}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => Math.round(v)} />
                      <Bar dataKey="avg" radius={4} name="Avg Score">
                        {data.scoreAnalytics.avgScores.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            </>
            )}
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            {!data ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
            <>
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-base font-display">Primary Goal Distribution</CardTitle>
                <CardDescription>What users most want to achieve — selected during assessment</CardDescription>
              </CardHeader>
              <CardContent>
                {!data.primaryGoalDistribution || data.primaryGoalDistribution.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">No goal data yet — users with older reports may not have selected a primary goal</p>
                ) : (
                  <ResponsiveContainer width="100%" height={Math.max(260, data.primaryGoalDistribution.length * 44)}>
                    <BarChart data={data.primaryGoalDistribution} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="goal" tick={{ fontSize: 11 }} width={170} />
                      <Tooltip />
                      <Bar dataKey="count" radius={4} name="Users">
                        {data.primaryGoalDistribution.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            </>
            )}
          </TabsContent>

          <TabsContent value="risks">
            {!data ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
            <>
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-base font-display">Most Frequently Cited Risk Concerns</CardTitle>
                <CardDescription>Ranked by frequency across all users</CardDescription>
              </CardHeader>
              <CardContent>
                {data.riskConcerns.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">No risk concern data yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={Math.max(300, data.riskConcerns.length * 36)}>
                    <BarChart data={data.riskConcerns} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="concern" tick={{ fontSize: 11 }} width={140} />
                      <Tooltip />
                      <Bar dataKey="count" radius={4} name="Count">
                        {data.riskConcerns.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            </>
            )}
          </TabsContent>

          <TabsContent value="reports">
            <Card className="border-none shadow-md">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                  <div>
                    <CardTitle className="text-base font-display">All Submissions</CardTitle>
                    <CardDescription className="mt-0.5">
                      {reportsData ? `${reportsData.total} total report${reportsData.total !== 1 ? "s" : ""}` : "Loading…"}
                    </CardDescription>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search location or report ID…"
                      value={reportsSearch}
                      onChange={e => { setReportsSearch(e.target.value); setReportsPage(1); }}
                      className="pl-9 pr-8 h-8 text-sm"
                    />
                    {reportsSearch && (
                      <button onClick={() => { setReportsSearch(""); setReportsPage(1); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {reportsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : !reportsData || reportsData.reports.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    {reportsSearch ? "No reports match your search" : "No reports yet"}
                  </p>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Date</th>
                            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Location</th>
                            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Score</th>
                            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Income</th>
                            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Report ID</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportsData.reports.map((r) => (
                            <tr key={r.reportId} className="border-b border-border/40 hover:bg-muted/30">
                              <td className="py-2 px-3 text-muted-foreground">{formatDate(r.createdAt)}</td>
                              <td className="py-2 px-3">{r.location}</td>
                              <td className="py-2 px-3 font-semibold">{r.overallScore}/100</td>
                              <td className="py-2 px-3 text-muted-foreground capitalize">{r.incomeStability?.replace(/_/g, " ")}</td>
                              <td className="py-2 px-3 font-mono text-xs text-muted-foreground">{r.reportId.slice(0, 8)}…</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {reportsData.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                        <span className="text-xs text-muted-foreground">
                          Page {reportsData.page} of {reportsData.totalPages}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline" size="sm"
                            disabled={reportsData.page <= 1}
                            onClick={() => setReportsPage(p => p - 1)}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline" size="sm"
                            disabled={reportsData.page >= reportsData.totalPages}
                            onClick={() => setReportsPage(p => p + 1)}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            {!data ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
            <>
            <div className="grid grid-cols-2 gap-4">
              <StatCard title="Total Feedback" value={data.feedback.totalFeedback} icon={MessageSquare} />
              <StatCard title="Avg Rating" value={`${data.feedback.avgRating}/5`} icon={Star} />
            </div>
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-base font-display">Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={data.feedback.ratingDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="star" tickFormatter={s => `${s}★`} tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip labelFormatter={s => `${s} Star${s !== 1 ? "s" : ""}`} />
                    <Bar dataKey="count" fill="#f59e0b" radius={4} name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            {data.feedback.recentComments.length > 0 ? (
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-base font-display">Recent Comments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.feedback.recentComments.map((c, i) => (
                    <div key={i} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <StarRating rating={c.rating} />
                        <span className="text-xs text-muted-foreground">{formatDate(c.createdAt)}</span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{c.comment}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-none shadow-md">
                <CardContent className="py-12 text-center">
                  <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No written comments yet</p>
                </CardContent>
              </Card>
            )}
            </>
            )}
          </TabsContent>

          {/* ── TRAFFIC TAB ── */}
          <TabsContent value="traffic" className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-bold">Traffic Analytics</h2>
                <p className="text-sm text-muted-foreground">Powered by Umami — cookieless, GDPR-friendly</p>
              </div>
            </div>
            <UmamiSection />
            <UmamiExportSection />
          </TabsContent>

          {/* ── USERS TAB ── */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h2 className="text-base font-bold">User Analytics</h2>
                <p className="text-sm text-muted-foreground">Signups, engagement, and conversion — last 12 months</p>
              </div>
            </div>

            {userLoading && (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {userError && (
              <div className="flex items-center gap-3 text-destructive py-8">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm">Failed to load user analytics.</span>
              </div>
            )}

            {userData && (
              <>
                {/* KPI cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <UserStatCard title="Total Users" value={userData.totals.totalUsers} sub="registered accounts" icon={Users} color="text-blue-500" />
                  <UserStatCard title="Active (30d)" value={userData.totals.activeUsers30d} sub="reports, check-ins, or messages" icon={Zap} color="text-orange-500" />
                  <UserStatCard
                    title="With Assessment"
                    value={userData.totals.usersWithAtLeastOnePlan}
                    sub={`${userData.totals.totalUsers > 0 ? Math.round((userData.totals.usersWithAtLeastOnePlan / userData.totals.totalUsers) * 100) : 0}% of users`}
                    icon={Target}
                    color="text-amber-500"
                  />
                  <UserStatCard title="Pro Subscribers" value={userData.totals.totalPro} sub="active or scheduled" icon={Award} color="text-emerald-500" />
                  <UserStatCard title="Conversion Rate" value={`${userData.totals.conversionRate}%`} sub="users → Pro" icon={TrendingUp} color="text-violet-500" />
                </div>

                {/* Daily active users */}
                <Card className="border-none shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-display flex items-center gap-2">
                      <Zap className="w-4 h-4 text-orange-500" /> Daily Active Users — Last 30 Days
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={userData.activeUsersByDay.map(d => ({
                        ...d,
                        label: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                        <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} interval={Math.floor(userData.activeUsersByDay.length / 6)} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={24} allowDecimals={false} />
                        <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [v, "Active Users"]} />
                        <Line type="monotone" dataKey="count" name="Active Users" stroke="#f97316" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-muted-foreground mt-2 text-center">Users with at least one report, check-in, or companion message that day</p>
                  </CardContent>
                </Card>

                {/* Growth charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="border-none shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-display flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" /> User Signups — Last 12 Months
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={userData.signupsByMonth.map(d => ({ ...d, month: fmtMonth(d.month) }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                          <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={24} allowDecimals={false} />
                          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                          <Line type="monotone" dataKey="count" name="Signups" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-display flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" /> Assessments — Last 12 Months
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={userData.assessmentsByMonth.map(d => ({ ...d, month: fmtMonth(d.month) }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                          <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={24} allowDecimals={false} />
                          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                          <Line type="monotone" dataKey="count" name="Assessments" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Dimension averages + Plan distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="border-none shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-display flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" /> Average Dimension Scores
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={userData.dimensionAverages} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
                          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
                          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`${v}/100`, "Avg Score"]} />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {userData.dimensionAverages.map(entry => (
                              <Cell key={entry.name} fill={DIM_COLORS[entry.name] ?? "#6366f1"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      <p className="text-xs text-muted-foreground mt-2 text-center">Lowest = most challenging area across all users</p>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-display flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" /> User Engagement — Plan Count Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={userData.planBuckets}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                          <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={24} allowDecimals={false} />
                          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [v, "Users"]} />
                          <Bar dataKey="count" name="Users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                      <p className="text-xs text-muted-foreground mt-2 text-center">How many assessments registered users have completed</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Conversion funnel */}
                <Card className="border-none shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-display flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" /> Free → Pro Conversion Funnel
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { label: "Registered", value: userData.totals.totalUsers, color: "bg-blue-500", pct: 100 },
                        { label: "Completed ≥1 Assessment", value: userData.totals.usersWithAtLeastOnePlan, color: "bg-amber-500", pct: userData.totals.totalUsers > 0 ? Math.round((userData.totals.usersWithAtLeastOnePlan / userData.totals.totalUsers) * 100) : 0 },
                        { label: "Converted to Pro", value: userData.totals.totalPro, color: "bg-emerald-500", pct: userData.totals.totalUsers > 0 ? Math.round((userData.totals.totalPro / userData.totals.totalUsers) * 100) : 0 },
                      ].map(step => (
                        <div key={step.label} className="flex items-center gap-4">
                          <div className="w-40 text-right text-xs font-medium text-muted-foreground flex-shrink-0">{step.label}</div>
                          <div className="flex-1 bg-muted/30 rounded-full h-6 relative overflow-hidden">
                            <div
                              className={`h-full ${step.color} rounded-full transition-all flex items-center justify-end pr-3`}
                              style={{ width: `${Math.max(step.pct, 2)}%` }}
                            >
                              <span className="text-xs font-bold text-white whitespace-nowrap">{step.value}</span>
                            </div>
                          </div>
                          <div className="w-12 text-xs font-semibold text-muted-foreground flex-shrink-0">{step.pct}%</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
