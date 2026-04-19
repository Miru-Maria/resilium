import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useSearch, Link } from "wouter";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";
import {
  Loader2, AlertTriangle, FileText,
  Star, Activity, MessageSquare, Smartphone, Shield, LayoutDashboard, FlaskConical, ExternalLink, Eye,
  Search, ChevronLeft, ChevronRight, X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { adminAuthHeaders, AdminLayout } from "./layout";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const COLORS = ["#6366f1", "#22d3ee", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6", "#f97316", "#14b8a6"];

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

const VALID_TABS = ["overview", "demographics", "scores", "goals", "risks", "reports", "feedback"];

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
      const res = await fetch(`${BASE}/api/admin/reports?${params}`, { headers: adminAuthHeaders() });
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
  const formatScore = (n: number) => Math.round(n);

  return (
    <AdminLayout activeSection="dashboard">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Overview of all resilience assessments and user feedback.</p>
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
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="45%"
                          outerRadius={95}
                          labelLine={false}
                          label={renderPieLabel}
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
                            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Age</th>
                            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Goal</th>
                            <th className="text-left py-2 px-3 text-muted-foreground font-medium">View</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportsData.reports.map(r => (
                            <tr key={r.reportId} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                              <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">{formatDate(r.createdAt)}</td>
                              <td className="py-2.5 px-3 font-medium max-w-[140px] truncate">{r.location || "—"}</td>
                              <td className="py-2.5 px-3">
                                <span className={`font-semibold ${r.overallScore >= 70 ? "text-emerald-500" : r.overallScore >= 40 ? "text-amber-500" : "text-destructive"}`}>
                                  {Math.round(r.overallScore)}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-muted-foreground">{r.ageBracket || "—"}</td>
                              <td className="py-2.5 px-3 max-w-[120px] truncate text-muted-foreground text-xs">{r.primaryGoal?.replace(/_/g, " ") || "—"}</td>
                              <td className="py-2.5 px-3">
                                <Link href={`/results/${r.reportId}?from=admin`} className="text-primary hover:underline text-xs font-medium">
                                  View →
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {reportsData.totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t border-border mt-3">
                        <span className="text-xs text-muted-foreground">
                          Page {reportsData.page} of {reportsData.totalPages} · {reportsData.total} reports
                        </span>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={reportsPage <= 1} onClick={() => setReportsPage(p => p - 1)}>
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          {Array.from({ length: Math.min(5, reportsData.totalPages) }, (_, i) => {
                            const start = Math.max(1, Math.min(reportsData.page - 2, reportsData.totalPages - 4));
                            const pg = start + i;
                            return (
                              <Button key={pg} variant={pg === reportsData.page ? "default" : "ghost"} size="sm" className="h-7 w-7 p-0 text-xs" onClick={() => setReportsPage(pg)}>
                                {pg}
                              </Button>
                            );
                          })}
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={reportsPage >= reportsData.totalPages} onClick={() => setReportsPage(p => p + 1)}>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard title="Total Feedback" value={data.feedback.totalFeedback} icon={MessageSquare} />
              <StatCard title="Average Rating" value={data.feedback.totalFeedback > 0 ? `${data.feedback.avgRating} / 5` : "—"} icon={Star} description={data.feedback.totalFeedback > 0 ? `Based on ${data.feedback.totalFeedback} ratings` : "No ratings yet"} />
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
        </Tabs>
      </div>
    </AdminLayout>
  );
}
