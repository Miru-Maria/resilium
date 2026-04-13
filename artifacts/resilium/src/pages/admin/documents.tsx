import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AdminLayout } from "./layout";
import { adminAuthHeaders } from "./layout";
import { Loader2, FileText, LayoutTemplate, BarChart2, Download, RefreshCw, AlertCircle, Radar } from "lucide-react";
import { cn } from "@/lib/utils";
import CompetitiveAnalysisPage from "@/pages/competitive-analysis";

const API = import.meta.env.BASE_URL.replace(/\/$/, "");

type Tab = "marketing-strategy" | "platform-assessment" | "competitive-analysis" | "competitor-monitoring";

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

function MarkdownDoc({ content }: { content: string }) {
  return (
    <div className="prose prose-sm prose-invert max-w-none p-8
      prose-headings:font-display prose-headings:tracking-tight prose-headings:text-white
      prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-1
      prose-h2:text-lg prose-h2:font-semibold prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-2 prose-h2:mt-8
      prose-h3:text-base prose-h3:font-semibold prose-h3:text-slate-200
      prose-p:text-slate-300 prose-li:text-slate-300
      prose-strong:text-white
      prose-table:text-xs prose-th:bg-white/5 prose-th:font-semibold prose-th:text-slate-200
      prose-td:align-top prose-td:text-slate-300
      prose-hr:border-white/10
      prose-code:text-primary prose-code:bg-white/5 prose-code:rounded
      prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10
      prose-a:text-primary
    ">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

function PlatformAssessmentDoc({ content }: { content: string }) {
  return (
    <iframe
      title="Platform Assessment"
      srcDoc={content}
      sandbox="allow-scripts allow-same-origin"
      className="w-full border-0"
      style={{ height: "calc(100vh - 160px)", minHeight: 600 }}
    />
  );
}

function DocPanel({ name, type }: { name: string; type: Tab }) {
  const { content, loading, error, reload } = useAdminDoc(name);

  const handleDownload = () => {
    if (!content) return;
    const ext = type === "platform-assessment" ? "html" : "md";
    const mime = type === "platform-assessment" ? "text/html" : "text/markdown";
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-3 border-b bg-muted/30">
        <span className="text-xs text-muted-foreground font-medium">
          {loading ? "Loading…" : error ? "Error" : `${content ? Math.round(content.length / 1024) : 0} KB`}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reload}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            Refresh
          </button>
          {content && (
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          )}
        </div>
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
            <button
              type="button"
              onClick={reload}
              className="text-sm text-primary underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        )}
        {!loading && !error && content && (
          type === "platform-assessment"
            ? <PlatformAssessmentDoc content={content} />
            : <MarkdownDoc content={content} />
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

          <div className="flex gap-2 border-b">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
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
          {activeTab === "competitive-analysis" ? (
            <CompetitiveAnalysisPage />
          ) : (
            tabs
              .filter((t) => t.key !== "competitive-analysis")
              .map((tab) => (
                <div key={tab.key} className={cn("h-full", activeTab !== tab.key && "hidden")}>
                  <DocPanel
                    name={tab.key}
                    type={tab.key === "platform-assessment" ? "platform-assessment" : "marketing-strategy"}
                  />
                </div>
              ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
