import React, { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Star, MessageSquare, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function getAdminToken() {
  return localStorage.getItem("admin_token") ?? "";
}

interface Testimonial {
  id: number;
  reportId: string;
  rating: number;
  comment: string | null;
  isPublished: boolean;
  createdAt: string;
}

export default function AdminTestimonialsPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/admin/testimonials`, {
        headers: { Authorization: `Bearer ${getAdminToken()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<{ testimonials: Testimonial[] }>;
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ id, isPublished }: { id: number; isPublished: boolean }) => {
      const res = await fetch(`${BASE}/api/admin/testimonials/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify({ isPublished }),
      });
      if (!res.ok) throw new Error("Failed to update");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
      toast({ title: "Updated", description: "Testimonial status updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update testimonial.", variant: "destructive" });
    },
  });

  const testimonials = data?.testimonials ?? [];

  const filtered = testimonials.filter(t => {
    if (filter === "pending") return !t.isPublished;
    if (filter === "approved") return t.isPublished;
    return true;
  });

  const pendingCount = testimonials.filter(t => !t.isPublished).length;
  const approvedCount = testimonials.filter(t => t.isPublished).length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Button>
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold">Testimonials</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review and approve user feedback to display publicly on the landing page.
            Only approved testimonials with 4+ star ratings appear on the site.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {[
            { key: "pending", label: `Pending (${pendingCount})` },
            { key: "approved", label: `Approved (${approvedCount})` },
            { key: "all", label: `All (${testimonials.length})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                filter === key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="text-center py-20 text-destructive">Failed to load testimonials. Are you signed in as admin?</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p>No testimonials in this category yet.</p>
            <p className="text-xs mt-1">Testimonials are created when users leave comments in the feedback widget on their results page.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(t => (
              <div
                key={t.id}
                className={`rounded-xl border p-5 flex gap-4 items-start transition-all ${
                  t.isPublished ? "border-green-500/30 bg-green-500/5" : "border-border bg-card"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${s <= t.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(t.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    {t.isPublished ? (
                      <Badge variant="outline" className="text-green-600 border-green-500/40 bg-green-500/5 text-[10px]">Published</Badge>
                    ) : t.rating < 4 ? (
                      <Badge variant="outline" className="text-muted-foreground text-[10px]">Low rating — won't show</Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 border-amber-500/40 bg-amber-500/5 text-[10px]">Pending Review</Badge>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed">{t.comment}</p>
                  <p className="text-[10px] text-muted-foreground mt-2 font-mono">Report: {t.reportId}</p>
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  {!t.isPublished ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-green-600 border-green-500/40 hover:bg-green-500/10"
                      disabled={mutation.isPending || t.rating < 4}
                      onClick={() => mutation.mutate({ id: t.id, isPublished: true })}
                      title={t.rating < 4 ? "Only 4+ star reviews can be published" : "Approve for public display"}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                      disabled={mutation.isPending}
                      onClick={() => mutation.mutate({ id: t.id, isPublished: false })}
                    >
                      <XCircle className="w-3.5 h-3.5" /> Unpublish
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
