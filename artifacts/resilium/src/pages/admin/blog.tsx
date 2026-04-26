import React, { useState } from "react";
import { AdminLayout, adminAuthHeaders } from "./layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2, Newspaper, Plus, Trash2, Eye, EyeOff, AlertTriangle,
  Pencil, X, ChevronDown, ExternalLink, Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const PILLARS = [
  { value: "assessment", label: "Resilience Assessment" },
  { value: "dimensions", label: "Dimension Deep-Dive" },
  { value: "scenarios", label: "Scenario Planning" },
  { value: "data", label: "Data & Research" },
  { value: "how-to", label: "How-To Guide" },
];

const PILLAR_COLORS: Record<string, string> = {
  assessment: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  dimensions: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  scenarios: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  data: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "how-to": "bg-teal-500/10 text-teal-400 border-teal-500/20",
};

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  description: string;
  pillar: string;
  pillarLabel: string;
  targetKeyword: string;
  readingTimeMin: number;
  body: string[];
  ogImage: string | null;
  status: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

const EMPTY_FORM = {
  slug: "",
  title: "",
  description: "",
  pillar: "assessment",
  pillarLabel: "Resilience Assessment",
  targetKeyword: "",
  readingTimeMin: 5,
  body: "## Introduction\n\nWrite your post here.\n\n## Section 2\n\nMore content.",
  ogImage: "",
  status: "published",
  publishedAt: new Date().toISOString().slice(0, 10),
};

async function fetchPosts(): Promise<{ posts: BlogPost[] }> {
  const res = await fetch(`${BASE}/api/admin/blog`, { credentials: "include", headers: adminAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

function bodyToText(body: string[]): string {
  return body.join("\n\n");
}

function textToBody(text: string): string[] {
  return text.split(/\n\n+/).map(s => s.trim()).filter(Boolean);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

interface FormState {
  slug: string;
  title: string;
  description: string;
  pillar: string;
  pillarLabel: string;
  targetKeyword: string;
  readingTimeMin: number;
  body: string;
  ogImage: string;
  status: string;
  publishedAt: string;
}

function PostForm({
  initial,
  onSave,
  onCancel,
  isSaving,
}: {
  initial: FormState;
  onSave: (values: FormState) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<FormState>(initial);

  function set(k: keyof FormState, v: string | number) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function handlePillarChange(val: string) {
    const found = PILLARS.find(p => p.value === val);
    setForm(f => ({ ...f, pillar: val, pillarLabel: found?.label ?? val }));
  }

  const labelClass = "block text-xs font-medium text-muted-foreground mb-1";
  const inputClass = "w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Title *</label>
          <input className={inputClass} value={form.title} onChange={e => set("title", e.target.value)} placeholder="Post title" />
        </div>
        <div>
          <label className={labelClass}>Slug *</label>
          <input className={inputClass} value={form.slug} onChange={e => set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))} placeholder="url-friendly-slug" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Description *</label>
        <textarea className={inputClass} rows={2} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Short excerpt shown in the blog list and as the meta description" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Pillar *</label>
          <select className={inputClass} value={form.pillar} onChange={e => handlePillarChange(e.target.value)}>
            {PILLARS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Target Keyword</label>
          <input className={inputClass} value={form.targetKeyword} onChange={e => set("targetKeyword", e.target.value)} placeholder="personal resilience" />
        </div>
        <div>
          <label className={labelClass}>Reading Time (min)</label>
          <input className={inputClass} type="number" min={1} max={60} value={form.readingTimeMin} onChange={e => set("readingTimeMin", parseInt(e.target.value) || 5)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Status</label>
          <select className={inputClass} value={form.status} onChange={e => set("status", e.target.value)}>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Publish Date</label>
          <input className={inputClass} type="date" value={form.publishedAt} onChange={e => set("publishedAt", e.target.value)} />
        </div>
      </div>

      <div>
        <label className={labelClass}>OG Image URL (optional)</label>
        <input className={inputClass} value={form.ogImage} onChange={e => set("ogImage", e.target.value)} placeholder="https://..." />
      </div>

      <div>
        <label className={labelClass}>
          Body * — separate sections with a blank line. Use <code>## Heading</code> for section headings, <code>**bold**</code>, <code>*italic*</code>.
        </label>
        <textarea
          className={`${inputClass} font-mono text-xs`}
          rows={18}
          value={form.body}
          onChange={e => set("body", e.target.value)}
          placeholder={"## Introduction\n\nYour content here.\n\n## Section 2\n\nMore content with **bold** and *italic* support."}
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button size="sm" disabled={isSaving || !form.title.trim() || !form.slug.trim()} onClick={() => onSave(form)} className="rounded-full gap-2">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save post
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

export default function AdminBlogPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminBlogPosts"],
    queryFn: fetchPosts,
    staleTime: 30 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: async (values: FormState) => {
      const res = await fetch(`${BASE}/api/admin/blog`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...adminAuthHeaders() },
        body: JSON.stringify({
          ...values,
          readingTimeMin: Number(values.readingTimeMin),
          body: textToBody(values.body),
          publishedAt: new Date(values.publishedAt).toISOString(),
          ogImage: values.ogImage || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Failed to create");
      }
      return res.json();
    },
    onSuccess: () => {
      setShowForm(false);
      qc.invalidateQueries({ queryKey: ["adminBlogPosts"] });
      toast({ title: "Post created" });
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: number; values: FormState }) => {
      const res = await fetch(`${BASE}/api/admin/blog/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...adminAuthHeaders() },
        body: JSON.stringify({
          ...values,
          readingTimeMin: Number(values.readingTimeMin),
          body: textToBody(values.body),
          publishedAt: new Date(values.publishedAt).toISOString(),
          ogImage: values.ogImage || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Failed to update");
      }
      return res.json();
    },
    onSuccess: () => {
      setEditingPost(null);
      qc.invalidateQueries({ queryKey: ["adminBlogPosts"] });
      toast({ title: "Post updated" });
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`${BASE}/api/admin/blog/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...adminAuthHeaders() },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminBlogPosts"] }),
    onError: () => toast({ title: "Failed to update status", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/admin/blog/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: adminAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminBlogPosts"] });
      toast({ title: "Post deleted" });
    },
    onError: () => toast({ title: "Failed to delete post", variant: "destructive" }),
  });

  const posts = data?.posts ?? [];
  const published = posts.filter(p => p.status === "published").length;
  const drafts = posts.filter(p => p.status === "draft").length;

  return (
    <AdminLayout activeSection="blog">
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Blog Posts</h1>
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Loading…" : `${published} published · ${drafts} draft`}
              </p>
            </div>
          </div>
          <Button size="sm" className="rounded-full gap-2" onClick={() => { setShowForm(true); setEditingPost(null); }}>
            <Plus className="w-4 h-4" /> New post
          </Button>
        </div>

        {showForm && !editingPost && (
          <div className="rounded-xl border border-border bg-card p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm">New Post</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
            <PostForm
              initial={EMPTY_FORM}
              onSave={(values) => createMutation.mutate(values)}
              onCancel={() => setShowForm(false)}
              isSaving={createMutation.isPending}
            />
          </div>
        )}

        {isLoading && <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>}
        {error && <div className="flex items-center gap-2 text-destructive text-sm py-6"><AlertTriangle className="w-4 h-4" /> Failed to load posts.</div>}

        {!isLoading && !error && (
          <div className="space-y-3">
            {posts.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-10">No posts yet. Create your first post above.</p>
            )}
            {posts.map((post) => {
              const isEditing = editingPost?.id === post.id;
              return (
                <div key={post.id} className={`rounded-xl border p-4 ${post.status === "published" ? "bg-card border-border" : "bg-muted/20 border-border/40"}`}>
                  {isEditing ? (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-sm">Editing post</h2>
                        <button onClick={() => setEditingPost(null)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                      </div>
                      <PostForm
                        initial={{
                          slug: post.slug,
                          title: post.title,
                          description: post.description,
                          pillar: post.pillar,
                          pillarLabel: post.pillarLabel,
                          targetKeyword: post.targetKeyword,
                          readingTimeMin: post.readingTimeMin,
                          body: bodyToText(post.body),
                          ogImage: post.ogImage ?? "",
                          status: post.status,
                          publishedAt: post.publishedAt.slice(0, 10),
                        }}
                        onSave={(values) => updateMutation.mutate({ id: post.id, values })}
                        onCancel={() => setEditingPost(null)}
                        isSaving={updateMutation.isPending}
                      />
                    </>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`inline-block text-xs px-2 py-0.5 rounded-full border font-medium ${PILLAR_COLORS[post.pillar] ?? ""}`}>
                            {post.pillarLabel}
                          </span>
                          {(() => {
                            const isFuture = new Date(post.publishedAt) > new Date();
                            const isScheduled = post.status === "published" && isFuture;
                            const label = post.status === "draft" ? "Draft" : isScheduled ? "Scheduled" : "Published";
                            const cls = post.status === "draft"
                              ? "bg-muted/50 text-muted-foreground border-border"
                              : isScheduled
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
                            return <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cls}`}>{label}</span>;
                          })()}
                          <span className="text-xs text-muted-foreground">{formatDate(post.publishedAt)} · {post.readingTimeMin} min read</span>
                        </div>
                        <p className="text-sm font-semibold text-foreground">{post.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{post.description}</p>
                        <p className="text-xs text-muted-foreground/60 mt-0.5 font-mono">/blog/{post.slug}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Link href={`/blog/${post.slug}`} target="_blank">
                          <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Preview">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => setEditingPost(post)}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleMutation.mutate({ id: post.id, status: post.status === "published" ? "draft" : "published" })}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          title={post.status === "published" ? "Set to draft" : "Publish"}
                        >
                          {post.status === "published" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => { if (confirm("Delete this post?")) deleteMutation.mutate(post.id); }}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
