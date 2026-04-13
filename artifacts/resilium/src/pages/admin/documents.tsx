import React, { useEffect, useState } from "react";
import { AdminLayout } from "./layout";
import { adminAuthHeaders } from "./layout";
import { Loader2, FileText, LayoutTemplate, BarChart2, RefreshCw, AlertCircle, Radar, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import CompetitiveAnalysisPage from "@/pages/competitive-analysis";
import MarketingStrategyDoc from "./marketing-strategy-doc";
import CompetitorMonitoringDoc from "./competitor-monitoring-doc";
import { MarketingPageContent } from "./marketing";

const API = import.meta.env.BASE_URL.replace(/\/$/, "");

type Tab = "marketing-strategy" | "platform-assessment" | "competitive-analysis" | "gtm-plan" | "competitor-monitoring";

function useAdminDoc(name: string) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/admin/docs/${name}`, {
        headers: adminAuthHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      setContent(text);
    } catch (e: any) {
      setError(e.message ?? "Failed to load document");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [name]);
  return { content, loading, error, reload: load };
}

function PlatformAssessmentPanel() {
  const { content, loading, error, reload } = useAdminDoc("platform-assessment");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-3 border-b bg-muted/30">
        <span className="text-xs text-muted-foreground font-medium">
          {loading ? "Loading…" : error ? "Error" : `${content ? Math.round(content.length / 1024) : 0} KB`}
        </span>
        <button
          type="button"
          onClick={reload}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          Refresh
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <AlertCircle className="w-8 h-8 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
            <button type="button" onClick={reload} className="text-sm text-primary underline underline-offset-2">
              Try again
            </button>
          </div>
        )}
        {!loading && !error && content && (
          <iframe
            title="Platform Assessment"
            srcDoc={content}
            sandbox="allow-scripts allow-same-origin"
            className="w-full border-0"
            style={{ height: "calc(100vh - 160px)", minHeight: 600 }}
          />
        )}
      </div>
    </div>
  );
}

export default function AdminDocumentsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("marketing-strategy");

  const tabs: Array<{ key: Tab; label: string; icon: React.ElementType }> = [
    { key: "marketing-strategy",    label: "Marketing Strategy",    icon: FileText },
    { key: "platform-assessment",   label: "Platform Assessment",   icon: LayoutTemplate },
    { key: "competitive-analysis",  label: "Competitive Analysis",  icon: BarChart2 },
    { key: "gtm-plan",              label: "GTM Plan",              icon: Rocket },
    { key: "competitor-monitoring", label: "Competitor Monitoring", icon: Radar },
  ];

  return (
    <AdminLayout activeSection="documents">
      <div className="flex flex-col h-screen overflow-hidden">
        <div className="px-8 pt-8 pb-0 flex-shrink-0">
          <h1 className="text-2xl font-bold font-display tracking-tight text-gray-900 mb-1">
            Documents
          </h1>
          <p className="text-sm text-muted-foreground mb-5">
            Private strategy and assessment documents — accessible to admins only.
          </p>

          <div className="flex gap-2 border-b overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
                    activeTab === tab.key
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-slate-300",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {activeTab === "marketing-strategy" && <MarketingStrategyDoc />}
          {activeTab === "platform-assessment" && <PlatformAssessmentPanel />}
          {activeTab === "competitive-analysis" && <CompetitiveAnalysisPage />}
          {activeTab === "gtm-plan" && <MarketingPageContent />}
          {activeTab === "competitor-monitoring" && <CompetitorMonitoringDoc />}
        </div>
      </div>
    </AdminLayout>
  );
}
