import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";
import {
  ShieldAlert, LogOut, Loader2, AlertTriangle, FileText,
  Star, Activity, MessageSquare, Smartphone, Shield, LayoutDashboard, FlaskConical
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { adminAuthHeaders } from "./layout";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const COLORS = ["#6366f1", "#22d3ee", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6", "#f97316", "#14b8a6"];

interface AnalyticsData {
  overview: {
    totalReports: number;
    avgOverall: number;
    reportsPerDay: { date: string; count: number }[];
  };
  demographics: {
    location: { name: string; count: number }[];
    incomeStability: { name: string; count: number }[];
    healthStatus: { name: string; count: number }[];
    housingType: { name: string; count: number }[];
    mobilityLevel: { name: string; count: number }[];
  };
  scoreAnalytics: {
    avgScores: { category: string; avg: number }[];
    scoreHistogram: { range: string; count: number }[];
  };
  riskConcerns: { concern: string; count: number }[];
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

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [platformSplit, setPlatformSplit] = useState<PlatformSplit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [analyticsRes, mobileRes] = await Promise.all([
          fetch(`${BASE}/api/admin/analytics`, { headers: adminAuthHeaders() }),
          fetch(`${BASE}/api/admin/analytics/mobile`, { headers: adminAuthHeaders() }),
        ]);
        if (analyticsRes.status === 401) {
          localStorage.removeItem("admin_token");
          setLocation("/admin/login");
          return;
        }
        if (!analyticsRes.ok) throw new Error("Failed to load analytics");
        setData(await analyticsRes.json());
        if (mobileRes.ok) {
          const md = await mobileRes.json();
          setPlatformSplit({ totalMobile: md.totalMobile, totalWeb: md.totalWeb, totalAll: md.totalAll });
        }
      } catch (e: any) {
        setError(e.message ?? "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [setLocation]);

  const handleLogout = async () => {
    localStorage.removeItem("admin_token");
    await fetch(`${BASE}/api/admin/logout`, { method: "POST" });
    setLocation("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !data) {
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
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-lg text-primary">Resilium</span>
            <Badge variant="secondary" className="ml-2 text-xs">Admin</Badge>
          </div>
          <nav className="hidden sm:flex items-center gap-1">
            {[
              { href: "/admin/testimonials", label: "Testimonials", icon: Star },
              { href: "/admin/mobile", label: "Mobile", icon: Smartphone },
              { href: "/admin/gdpr", label: "GDPR", icon: Shield },
              { href: "/admin/consent-log", label: "Consent Log", icon: LayoutDashboard },
              { href: "/admin/ux-testing", label: "AI UX Tester", icon: FlaskConical },
            ].map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1.5">
                  <Icon className="w-3.5 h-3.5" />{label}
                </Button>
              </Link>
            ))}
          </nav>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4 mr-2" /> Sign out
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Overview of all resilience assessments and user feedback.</p>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
            <TabsTrigger value="scores">Score Analytics</TabsTrigger>
            <TabsTrigger value="risks">Risk Concerns</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard title="Total Reports" value={data.overview.totalReports} icon={FileText} description="All time submissions" />
              <StatCard title="Avg Overall Score" value={`${data.overview.avgOverall}/100`} icon={Activity} description="Across all users" />
              <StatCard title="Feedback Received" value={data.feedback.totalFeedback} icon={MessageSquare} description={data.feedback.totalFeedback > 0 ? `Avg rating: ${data.feedback.avgRating}/5` : "No feedback yet"} />
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
          </TabsContent>

          <TabsContent value="demographics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[
                { label: "Income Stability", key: "incomeStability" as const },
                { label: "Health Status", key: "healthStatus" as const },
                { label: "Housing Type", key: "housingType" as const },
                { label: "Mobility Level", key: "mobilityLevel" as const },
              ].map(({ label, key }) => (
                <Card key={key} className="border-none shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={data.demographics[key]} layout="vertical">
                        <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
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
          </TabsContent>

          <TabsContent value="scores" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="risks">
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
          </TabsContent>

          <TabsContent value="reports">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-base font-display">Recent Submissions</CardTitle>
                <CardDescription>Latest {data.recentReports.length} resilience reports</CardDescription>
              </CardHeader>
              <CardContent>
                {data.recentReports.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">No reports yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 text-muted-foreground font-medium">Date</th>
                          <th className="text-left py-2 px-3 text-muted-foreground font-medium">Location</th>
                          <th className="text-left py-2 px-3 text-muted-foreground font-medium">Overall Score</th>
                          <th className="text-left py-2 px-3 text-muted-foreground font-medium">Income</th>
                          <th className="text-left py-2 px-3 text-muted-foreground font-medium">View</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.recentReports.map(r => (
                          <tr key={r.reportId} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                            <td className="py-2.5 px-3 text-muted-foreground">{formatDate(r.createdAt)}</td>
                            <td className="py-2.5 px-3 font-medium">{r.location}</td>
                            <td className="py-2.5 px-3">
                              <span className={`font-semibold ${formatScore(r.overallScore) >= 70 ? "text-emerald-500" : formatScore(r.overallScore) >= 40 ? "text-amber-500" : "text-destructive"}`}>
                                {formatScore(r.overallScore)}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <Badge variant="outline" className="text-xs capitalize">{r.incomeStability}</Badge>
                            </td>
                            <td className="py-2.5 px-3">
                              <Link href={`/results/${r.reportId}`} className="text-primary hover:underline text-xs font-medium">
                                View →
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
