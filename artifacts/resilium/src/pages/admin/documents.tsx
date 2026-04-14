import React, { useState } from "react";
import { AdminLayout } from "./layout";
import { FileText, LayoutTemplate, BarChart2, Radar, Rocket, BookOpen, Code2, Layers, Palette, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import CompetitiveAnalysisPage from "@/pages/competitive-analysis";
import MarketingStrategyDoc from "./marketing-strategy-doc";
import CompetitorMonitoringDoc from "./competitor-monitoring-doc";
import PlatformAssessmentDoc from "./platform-assessment-doc";
import { MarketingPageContent } from "./marketing";
import WhitepaperDoc from "./whitepaper-doc";
import TechnicalSpecDoc from "./technical-spec-doc";
import PitchDeckDoc from "./pitch-deck-doc";
import BrandIdentityDoc from "./brand-identity-doc";
import ContentStrategyDoc from "./content-strategy-doc";

type Tab =
  | "marketing-strategy"
  | "platform-assessment"
  | "competitive-analysis"
  | "gtm-plan"
  | "competitor-monitoring"
  | "whitepaper"
  | "technical-spec"
  | "pitch-deck"
  | "brand-identity"
  | "content-strategy";

export default function AdminDocumentsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("marketing-strategy");

  const tabs: Array<{ key: Tab; label: string; icon: React.ElementType }> = [
    { key: "marketing-strategy",    label: "Marketing Strategy",    icon: FileText },
    { key: "platform-assessment",   label: "Platform Assessment",   icon: LayoutTemplate },
    { key: "competitive-analysis",  label: "Competitive Analysis",  icon: BarChart2 },
    { key: "gtm-plan",              label: "GTM Plan",              icon: Rocket },
    { key: "competitor-monitoring", label: "Competitor Monitoring", icon: Radar },
    { key: "whitepaper",            label: "White Paper",           icon: BookOpen },
    { key: "technical-spec",        label: "Technical Spec",        icon: Code2 },
    { key: "pitch-deck",            label: "Pitch Deck",            icon: Layers },
    { key: "brand-identity",        label: "Brand Identity",        icon: Palette },
    { key: "content-strategy",      label: "Content Strategy",      icon: Megaphone },
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
          {activeTab === "marketing-strategy"    && <MarketingStrategyDoc />}
          {activeTab === "platform-assessment"   && <PlatformAssessmentDoc />}
          {activeTab === "competitive-analysis"  && <CompetitiveAnalysisPage />}
          {activeTab === "gtm-plan"              && <MarketingPageContent />}
          {activeTab === "competitor-monitoring" && <CompetitorMonitoringDoc />}
          {activeTab === "whitepaper"            && <WhitepaperDoc />}
          {activeTab === "technical-spec"        && <TechnicalSpecDoc />}
          {activeTab === "pitch-deck"            && <PitchDeckDoc />}
          {activeTab === "brand-identity"        && <BrandIdentityDoc />}
          {activeTab === "content-strategy"      && <ContentStrategyDoc />}
        </div>
      </div>
    </AdminLayout>
  );
}
