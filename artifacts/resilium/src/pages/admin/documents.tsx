import React from "react";
import { useSearch } from "wouter";
import { AdminLayout } from "./layout";
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

export default function AdminDocumentsPage() {
  const search = useSearch();
  const activeDoc = new URLSearchParams(search).get("doc") ?? "marketing-strategy";

  return (
    <AdminLayout activeSection="documents">
      <div className="h-full">
        {activeDoc === "marketing-strategy"    && <MarketingStrategyDoc />}
        {activeDoc === "platform-assessment"   && <PlatformAssessmentDoc />}
        {activeDoc === "competitive-analysis"  && <CompetitiveAnalysisPage />}
        {activeDoc === "gtm-plan"              && <MarketingPageContent />}
        {activeDoc === "competitor-monitoring" && <CompetitorMonitoringDoc />}
        {activeDoc === "whitepaper"            && <WhitepaperDoc />}
        {activeDoc === "technical-spec"        && <TechnicalSpecDoc />}
        {activeDoc === "pitch-deck"            && <PitchDeckDoc />}
        {activeDoc === "brand-identity"        && <BrandIdentityDoc />}
        {activeDoc === "content-strategy"      && <ContentStrategyDoc />}
      </div>
    </AdminLayout>
  );
}
