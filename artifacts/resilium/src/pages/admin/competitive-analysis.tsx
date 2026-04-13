import { AdminLayout } from "./layout";
import CompetitiveAnalysisPage from "@/pages/competitive-analysis";

export default function AdminCompetitiveAnalysisPage() {
  return (
    <AdminLayout activeSection="competitive-analysis">
      <div className="overflow-auto h-screen">
        <CompetitiveAnalysisPage />
      </div>
    </AdminLayout>
  );
}
