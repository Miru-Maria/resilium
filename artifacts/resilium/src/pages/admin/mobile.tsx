import React, { useEffect, useState } from "react";
import { AdminLayout, adminAuthHeaders } from "./layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { Loader2, Smartphone, Globe, TrendingUp, MapPin } from "lucide-react";

interface MobileAnalytics {
  totalMobile: number;
  totalWeb: number;
  totalAll: number;
  dailyBreakdown: { date: string; count: number }[];
  scoreDistribution: { range: string; count: number }[];
  topLocations: { location: string; count: number }[];
}

export default function AdminMobilePage() {
  const [data, setData] = useState<MobileAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics/mobile", { headers: adminAuthHeaders() })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then(setData)
      .catch(() => setError("Failed to load mobile analytics"))
      .finally(() => setLoading(false));
  }, []);

  const volumeComparisonData = data
    ? [
        { name: "Mobile", value: data.totalMobile, fill: "hsl(var(--primary))" },
        { name: "Web / Other", value: data.totalWeb, fill: "hsl(var(--muted-foreground))" },
      ]
    : [];

  return (
    <AdminLayout activeSection="mobile">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Mobile Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Mobile app usage and engagement data</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-destructive/10 text-destructive p-4 text-sm">{error}</div>
        )}

        {data && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={Smartphone}
                label="Mobile Assessments"
                value={data.totalMobile.toLocaleString()}
              />
              <StatCard
                icon={Globe}
                label="Web Assessments"
                value={data.totalWeb.toLocaleString()}
              />
              <StatCard
                icon={TrendingUp}
                label="Total Assessments"
                value={data.totalAll.toLocaleString()}
              />
              <StatCard
                icon={Smartphone}
                label="Mobile Share"
                value={
                  data.totalAll > 0
                    ? `${Math.round((data.totalMobile / data.totalAll) * 100)}%`
                    : "0%"
                }
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Mobile Submissions (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={data.dailyBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => v.slice(5)}
                        interval="preserveStartEnd"
                      />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={30} />
                      <Tooltip
                        labelFormatter={(v) => `Date: ${v}`}
                        formatter={(v: number) => [v, "Submissions"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Mobile vs. Web Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={volumeComparisonData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={70} />
                      <Tooltip formatter={(v: number) => [v, "Assessments"]} />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Score Distribution (Mobile Users)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.scoreDistribution}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={30} />
                      <Tooltip formatter={(v: number) => [v, "Users"]} />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Top Locations (Mobile)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.topLocations.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No data yet</p>
                  ) : (
                    <div className="space-y-2">
                      {data.topLocations.map((loc, i) => (
                        <div key={loc.location} className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-0.5">
                              <span className="font-medium truncate">{loc.location}</span>
                              <span className="text-muted-foreground">{loc.count}</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{
                                  width: `${Math.round(
                                    (loc.count / data.topLocations[0].count) * 100,
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <Icon className="w-4 h-4" />
          <span className="text-xs font-medium">{label}</span>
        </div>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
