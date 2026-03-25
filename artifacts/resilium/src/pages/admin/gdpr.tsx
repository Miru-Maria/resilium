import React, { useEffect, useState, useCallback } from "react";
import { AdminLayout, adminAuthHeaders } from "./layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Download, CheckCircle, Clock } from "lucide-react";

interface GdprRequest {
  id: number;
  sessionId: string;
  type: string;
  status: string;
  requestedAt: string;
}

export default function AdminGdprPage() {
  const [requests, setRequests] = useState<GdprRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fulfilling, setFulfilling] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [downloading, setDownloading] = useState<number | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/gdpr/requests", { headers: adminAuthHeaders() });
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setRequests(data.requests);
    } catch {
      setError("Failed to load GDPR requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  async function handleFulfill(id: number) {
    setFulfilling(id);
    try {
      const res = await fetch(`/api/admin/gdpr/requests/${id}/fulfill`, {
        method: "POST",
        headers: adminAuthHeaders(),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to fulfill");
      }
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "fulfilled" } : r)),
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFulfilling(null);
      setConfirmId(null);
    }
  }

  async function handleDownload(id: number) {
    setDownloading(id);
    try {
      const res = await fetch(`/api/admin/gdpr/requests/${id}/export`, {
        headers: adminAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to download");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gdpr-export-${id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to download export data");
    } finally {
      setDownloading(null);
    }
  }

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const fulfilledCount = requests.filter((r) => r.status === "fulfilled").length;

  return (
    <AdminLayout activeSection="gdpr">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">GDPR Compliance</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review and act on data deletion and export requests
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium">Pending Requests</span>
              </div>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs font-medium">Fulfilled Requests</span>
              </div>
              <p className="text-2xl font-bold">{fulfilledCount}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Data Requests</CardTitle>
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
            {!loading && !error && requests.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-8">
                No data requests yet.
              </p>
            )}
            {!loading && requests.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-4 font-medium">Type</th>
                      <th className="pb-2 pr-4 font-medium">Session ID</th>
                      <th className="pb-2 pr-4 font-medium">Date Received</th>
                      <th className="pb-2 pr-4 font-medium">Status</th>
                      <th className="pb-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {requests.map((r) => (
                      <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 pr-4 capitalize font-medium">{r.type}</td>
                        <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                          {r.sessionId.slice(0, 16)}…
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {new Date(r.requestedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 pr-4">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            {r.type === "deletion" && r.status === "pending" && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setConfirmId(r.id)}
                                disabled={fulfilling === r.id}
                              >
                                {fulfilling === r.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  "Mark Fulfilled"
                                )}
                              </Button>
                            )}
                            {r.type === "export" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownload(r.id)}
                                disabled={downloading === r.id}
                              >
                                {downloading === r.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                ) : (
                                  <Download className="w-3 h-3 mr-1" />
                                )}
                                Download
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={confirmId !== null} onOpenChange={(o) => !o && setConfirmId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion Request</DialogTitle>
              <DialogDescription>
                This will permanently delete all resilience reports and the consent record for this
                session. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => confirmId !== null && handleFulfill(confirmId)}
                disabled={fulfilling !== null}
              >
                {fulfilling !== null ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Delete & Fulfill
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "fulfilled") {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
        Fulfilled
      </Badge>
    );
  }
  if (status === "completed") {
    return (
      <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
        Completed
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">
      Pending
    </Badge>
  );
}
