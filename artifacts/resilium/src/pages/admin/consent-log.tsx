import React, { useEffect, useState, useCallback } from "react";
import { AdminLayout, adminAuthHeaders } from "./layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download, ChevronLeft, ChevronRight } from "lucide-react";

interface ConsentRecord {
  id: number;
  sessionId: string;
  platform: string;
  consentVersion: string;
  consentedAt: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function AdminConsentLogPage() {
  const [records, setRecords] = useState<ConsentRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportingCsv, setExportingCsv] = useState(false);

  const fetchRecords = useCallback(
    async (p: number) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/gdpr/consent-log?page=${p}&pageSize=50`, {
          headers: adminAuthHeaders(),
        });
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setRecords(data.records);
        setPagination(data.pagination);
      } catch {
        setError("Failed to load consent log");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchRecords(page);
  }, [page, fetchRecords]);

  async function handleExportCsv() {
    setExportingCsv(true);
    try {
      const res = await fetch("/api/admin/gdpr/consent-log?page=1&pageSize=10000", {
        headers: adminAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      const all: ConsentRecord[] = data.records;

      const header = "id,sessionId,platform,consentVersion,consentedAt\n";
      const rows = all
        .map(
          (r) =>
            `${r.id},"${r.sessionId}","${r.platform}","${r.consentVersion}","${r.consentedAt}"`,
        )
        .join("\n");
      const csv = header + rows;

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "consent-audit-log.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to export CSV");
    } finally {
      setExportingCsv(false);
    }
  }

  return (
    <AdminLayout activeSection="consent">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Consent Audit Log</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Paginated history of all user consent events for compliance records
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={exportingCsv}>
            {exportingCsv ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export CSV
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Consent Records</span>
              {pagination && (
                <span className="text-sm font-normal text-muted-foreground">
                  {pagination.total.toLocaleString()} total
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}
            {error && (
              <div className="rounded-lg bg-destructive/10 text-destructive p-3 text-sm">{error}</div>
            )}
            {!loading && !error && records.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-8">No consent records yet.</p>
            )}
            {!loading && records.length > 0 && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 pr-4 font-medium">Session ID</th>
                        <th className="pb-2 pr-4 font-medium">Platform</th>
                        <th className="pb-2 pr-4 font-medium">Consent Version</th>
                        <th className="pb-2 font-medium">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {records.map((r) => (
                        <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">
                            {r.sessionId.slice(0, 16)}…
                          </td>
                          <td className="py-2.5 pr-4 capitalize">{r.platform}</td>
                          <td className="py-2.5 pr-4">{r.consentVersion}</td>
                          <td className="py-2.5 text-muted-foreground">
                            {new Date(r.consentedAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={page === pagination.totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
