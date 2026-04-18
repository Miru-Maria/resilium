import React from "react";
import { AdminLayout, adminAuthHeaders } from "./layout";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid,
} from "recharts";
import {
  Users, TrendingUp, Award, Activity, Loader2, AlertTriangle, Target, Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

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

async function fetchUserAnalytics(): Promise<UserAnalytics> {
  const res = await fetch(`${BASE}/api/admin/analytics/users`, { headers: adminAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch user analytics");
  return res.json();
}

function StatCard({ title, value, sub, icon: Icon, color }: {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
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

const DIM_COLORS: Record<string, string> = {
  Financial: "#10b981",
  Health: "#ef4444",
  Skills: "#3b82f6",
  Mobility: "#8b5cf6",
  Psychological: "#f59e0b",
  Resources: "#14b8a6",
};

export default function AdminAnalyticsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminUserAnalytics"],
    queryFn: fetchUserAnalytics,
    staleTime: 2 * 60 * 1000,
  });

  const fmtMonth = (key: string) => {
    const [y, m] = key.split("-");
    return new Date(Number(y), Number(m) - 1).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  };

  return (
    <AdminLayout activeSection="analytics">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">User Analytics</h1>
            <p className="text-sm text-muted-foreground">Signups, engagement, and conversion — last 12 months</p>
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 text-destructive py-8">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm">Failed to load analytics.</span>
          </div>
        )}

        {data && (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard
                title="Total Users"
                value={data.totals.totalUsers}
                sub="registered accounts"
                icon={Users}
                color="text-blue-500"
              />
              <StatCard
                title="Active (30d)"
                value={data.totals.activeUsers30d}
                sub="reports, check-ins, or messages"
                icon={Zap}
                color="text-orange-500"
              />
              <StatCard
                title="With Assessment"
                value={data.totals.usersWithAtLeastOnePlan}
                sub={`${data.totals.totalUsers > 0 ? Math.round((data.totals.usersWithAtLeastOnePlan / data.totals.totalUsers) * 100) : 0}% of users`}
                icon={Target}
                color="text-amber-500"
              />
              <StatCard
                title="Pro Subscribers"
                value={data.totals.totalPro}
                sub="active or scheduled"
                icon={Award}
                color="text-emerald-500"
              />
              <StatCard
                title="Conversion Rate"
                value={`${data.totals.conversionRate}%`}
                sub="users → Pro"
                icon={TrendingUp}
                color="text-violet-500"
              />
            </div>

            {/* Active users trend */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-500" /> Daily Active Users — Last 30 Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={data.activeUsersByDay.map((d) => ({
                    ...d,
                    label: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      interval={Math.floor(data.activeUsersByDay.length / 6)}
                    />
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
                    <LineChart data={data.signupsByMonth.map((d) => ({ ...d, month: fmtMonth(d.month) }))}>
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
                    <LineChart data={data.assessmentsByMonth.map((d) => ({ ...d, month: fmtMonth(d.month) }))}>
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
                    <BarChart data={data.dimensionAverages} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, fontSize: 12 }}
                        formatter={(v: number) => [`${v}/100`, "Avg Score"]}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {data.dimensionAverages.map((entry) => (
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
                    <BarChart data={data.planBuckets}>
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
                    { label: "Registered", value: data.totals.totalUsers, color: "bg-blue-500", pct: 100 },
                    { label: "Completed ≥1 Assessment", value: data.totals.usersWithAtLeastOnePlan, color: "bg-amber-500", pct: data.totals.totalUsers > 0 ? Math.round((data.totals.usersWithAtLeastOnePlan / data.totals.totalUsers) * 100) : 0 },
                    { label: "Converted to Pro", value: data.totals.totalPro, color: "bg-emerald-500", pct: data.totals.totalUsers > 0 ? Math.round((data.totals.totalPro / data.totals.totalUsers) * 100) : 0 },
                  ].map((step) => (
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
      </div>
    </AdminLayout>
  );
}
