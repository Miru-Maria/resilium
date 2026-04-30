import React, { useState } from "react";
import { Link } from "wouter";
import { SiteFooter } from "@/components/site-footer";
import { PageSEO } from "@/components/page-seo";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, ChevronRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");
const SITE = "https://resilium-platform.com";

type BlogPillar = "assessment" | "dimensions" | "scenarios" | "data" | "how-to";

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  description: string;
  pillar: BlogPillar;
  pillarLabel: string;
  targetKeyword: string;
  readingTimeMin: number;
  body: string[];
  ogImage: string | null;
  status: string;
  publishedAt: string;
}

const PILLARS: Array<{ value: BlogPillar | "all"; label: string }> = [
  { value: "all", label: "All Posts" },
  { value: "assessment", label: "Assessment" },
  { value: "dimensions", label: "Dimensions" },
  { value: "scenarios", label: "Scenarios" },
  { value: "how-to", label: "How-To" },
  { value: "data", label: "Data & Research" },
];

const PILLAR_COLORS: Record<BlogPillar, string> = {
  assessment: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  dimensions: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  scenarios: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  data: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "how-to": "bg-teal-500/10 text-teal-400 border-teal-500/20",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: "easeOut" as const },
  }),
};

async function fetchPosts(): Promise<{ posts: BlogPost[] }> {
  const res = await fetch(`${BASE_URL}/api/blog-posts`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export default function BlogPage() {
  const [activeFilter, setActiveFilter] = useState<BlogPillar | "all">("all");

  const { data, isLoading, error } = useQuery({
    queryKey: ["blogPosts"],
    queryFn: fetchPosts,
    staleTime: 5 * 60 * 1000,
  });

  const posts = data?.posts ?? [];
  const filtered = activeFilter === "all" ? posts : posts.filter((p) => p.pillar === activeFilter);
  const featured = posts[0] ?? null;

  return (
    <>
      <PageSEO
        title="Resilience Blog — Insights, Guides & Research"
        description="Expert content on personal resilience, financial preparedness, psychological resilience, and emergency planning. Practical guides and scenario analysis to help you score and improve your resilience."
        canonical={`${SITE}/blog`}
      />

      <div className="min-h-screen flex flex-col">
        <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="mb-10 text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              Resilience Blog
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight text-foreground mb-3">
              Build your resilience,
              <br className="hidden sm:block" /> one insight at a time
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Research-backed guides on financial resilience, emergency
              preparedness, psychological resilience, and scenario planning.
            </p>
          </motion.div>

          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="text-center py-16 text-muted-foreground">
              <p>Could not load posts. Please try again later.</p>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {featured && (
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={1}
                  className="mb-10"
                >
                  <Link href={`/blog/${featured.slug}`}>
                    <div className="group relative rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-8 hover:border-primary/40 hover:bg-card/60 transition-all duration-300 cursor-pointer">
                      <div className="flex flex-col md:flex-row md:items-start gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${PILLAR_COLORS[featured.pillar] ?? ""}`}
                            >
                              {featured.pillarLabel}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {featured.readingTimeMin} min read
                            </span>
                          </div>
                          <h2 className="text-2xl font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                            {featured.title}
                          </h2>
                          <p className="text-muted-foreground leading-relaxed mb-4">
                            {featured.description}
                          </p>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-muted-foreground">
                              {formatDate(featured.publishedAt)}
                            </span>
                            <span className="flex items-center gap-1 text-sm text-primary font-medium group-hover:gap-2 transition-all">
                              Read article <ArrowRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={2}
                className="flex flex-wrap gap-2 mb-8"
              >
                {PILLARS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setActiveFilter(p.value)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      activeFilter === p.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((post, i) => (
                  <motion.div
                    key={post.slug}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    custom={i + 3}
                  >
                    <Link href={`/blog/${post.slug}`}>
                      <div className="group h-full rounded-xl border border-border/60 bg-card/30 backdrop-blur-sm p-5 hover:border-primary/30 hover:bg-card/50 transition-all duration-300 cursor-pointer flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${PILLAR_COLORS[post.pillar] ?? ""}`}
                          >
                            {post.pillarLabel}
                          </span>
                          <span className="text-muted-foreground text-xs ml-auto">
                            {post.readingTimeMin} min
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors leading-snug flex-1">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
                          {post.description}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(post.publishedAt)}
                          </span>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {filtered.length === 0 && posts.length > 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  No posts in this category yet. Check back soon.
                </div>
              )}

              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={10}
                className="mt-16 rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-sm p-8 text-center"
              >
                <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                  Know your resilience score
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Reading about resilience is a start. Measuring yours takes 8
                  minutes and gives you a scored breakdown across all six
                  dimensions.
                </p>
                <Link href="/assess">
                  <Button size="lg" className="rounded-full gap-2">
                    Take the free assessment <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </motion.div>
            </>
          )}
        </main>

        <SiteFooter />
      </div>
    </>
  );
}
