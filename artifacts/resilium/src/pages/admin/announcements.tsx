import React, { useState } from "react";
import { AdminLayout, adminAuthHeaders } from "./layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Megaphone, Plus, Trash2, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Announcement {
  id: number;
  message: string;
  type: string;
  isActive: boolean;
  createdAt: string;
}

async function fetchAnnouncements(): Promise<{ announcements: Announcement[] }> {
  const res = await fetch(`${BASE}/api/admin/announcements`, { headers: adminAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

const TYPE_LABELS: Record<string, { label: string; classes: string }> = {
  info: { label: "Info", classes: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  warning: { label: "Warning", classes: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  success: { label: "Success", classes: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
};

export default function AdminAnnouncementsPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminAnnouncements"],
    queryFn: fetchAnnouncements,
    staleTime: 30 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/admin/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...adminAuthHeaders() },
        body: JSON.stringify({ message, type }),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      setMessage("");
      qc.invalidateQueries({ queryKey: ["adminAnnouncements"] });
      qc.invalidateQueries({ queryKey: ["announcements"] });
      toast({ title: "Announcement created" });
    },
    onError: () => toast({ title: "Failed to create announcement", variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await fetch(`${BASE}/api/admin/announcements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...adminAuthHeaders() },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminAnnouncements"] });
      qc.invalidateQueries({ queryKey: ["announcements"] });
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/admin/announcements/${id}`, {
        method: "DELETE",
        headers: adminAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminAnnouncements"] });
      qc.invalidateQueries({ queryKey: ["announcements"] });
      toast({ title: "Announcement deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  return (
    <AdminLayout activeSection="announcements">
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Site Announcements</h1>
            <p className="text-sm text-muted-foreground">Active banners appear at the top of every page for all visitors.</p>
          </div>
        </div>

        {/* Create form */}
        <div className="rounded-xl border border-border bg-card p-5 mb-6 space-y-4">
          <h2 className="font-semibold text-sm">New Announcement</h2>
          <textarea
            className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            rows={2}
            placeholder="Announcement message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="success">Success</option>
            </select>
            <Button
              size="sm"
              disabled={!message.trim() || createMutation.isPending}
              onClick={() => createMutation.mutate()}
              className="rounded-full gap-2"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Post
            </Button>
          </div>
        </div>

        {/* List */}
        {isLoading && <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>}
        {error && <div className="flex items-center gap-2 text-destructive text-sm py-6"><AlertTriangle className="w-4 h-4" /> Failed to load announcements.</div>}
        {data && (
          <div className="space-y-3">
            {data.announcements.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-10">No announcements yet.</p>
            )}
            {data.announcements.map((a) => {
              const typeStyle = TYPE_LABELS[a.type] ?? TYPE_LABELS.info;
              return (
                <div key={a.id} className={`rounded-xl border p-4 flex items-start gap-3 ${a.isActive ? "bg-card border-border" : "bg-muted/20 border-border/40 opacity-60"}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full border font-medium ${typeStyle.classes}`}>
                        {typeStyle.label}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${a.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-muted/50 text-muted-foreground border-border"}`}>
                        {a.isActive ? "Live" : "Hidden"}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{a.message}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => toggleMutation.mutate({ id: a.id, isActive: !a.isActive })}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      title={a.isActive ? "Hide" : "Activate"}
                    >
                      {a.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(a.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
