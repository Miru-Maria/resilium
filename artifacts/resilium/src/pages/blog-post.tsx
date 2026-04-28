import React from "react";
import { Link, useRoute } from "wouter";
import { SiteFooter } from "@/components/site-footer";
import { PageSEO } from "@/components/page-seo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Clock, Loader2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");
const SITE = "https://resilium-platform.com";

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
}

const PILLAR_COLORS: Record<string, string> = {
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

function ArticleJsonLd({ post }: { post: BlogPost }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    url: `${SITE}/blog/${post.slug}`,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    image: post.ogImage ?? `${SITE}/opengraph.jpg`,
    author: {
      "@type": "Person",
      name: "Cristiana Paun",
      url: SITE,
    },
    publisher: {
      "@type": "Organization",
      name: "Resilium",
      url: SITE,
      logo: {
        "@type": "ImageObject",
        url: `${SITE}/opengraph.jpg`,
      },
    },
    keywords: post.targetKeyword,
    articleSection: post.pillarLabel,
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

function AssessmentCTA({ variant = "inline" }: { variant?: "inline" | "footer" }) {
  if (variant === "footer") {
    return (
      <div className="rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-sm p-8 text-center my-12">
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Ready to find out your score?
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          An 8-minute free assessment gives you a scored breakdown across all six resilience dimensions — with a personalized action plan.
        </p>
        <Link href="/consent">
          <Button size="lg" className="rounded-full gap-2">
            Take the free assessment <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    );
  }
  return (
    <div className="my-8 p-5 rounded-xl border border-primary/25 bg-primary/5 flex flex-col sm:flex-row items-center gap-4">
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground mb-0.5">
          Curious about your own score?
        </p>
        <p className="text-sm text-muted-foreground">
          The free Resilium assessment takes 8 minutes and gives you a full breakdown across all six dimensions.
        </p>
      </div>
      <Link href="/consent">
        <Button size="sm" className="rounded-full gap-1.5 shrink-0">
          Take the assessment <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </Link>
    </div>
  );
}

function renderBody(body: string[]) {
  const elements: React.ReactNode[] = [];

  body.forEach((block, idx) => {
    if (block.startsWith("## ")) {
      elements.push(
        <h2
          key={idx}
          className="text-xl font-display font-bold text-foreground mt-8 mb-3"
        >
          {block.slice(3)}
        </h2>
      );
      return;
    }

    const parts = block.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    const rendered = parts.map((part, pi) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={pi}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={pi}>{part.slice(1, -1)}</em>;
      }
      return part;
    });

    if (/^\d+\. /.test(block)) {
      elements.push(
        <li key={idx} className="ml-5 list-decimal text-muted-foreground leading-relaxed mb-1">
          {rendered}
        </li>
      );
      return;
    }

    elements.push(
      <p key={idx} className="text-muted-foreground leading-relaxed mb-4">
        {rendered}
      </p>
    );
  });

  return elements;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: "easeOut" as const },
  }),
};

async function fetchPost(slug: string): Promise<{ post: BlogPost }> {
  const res = await fetch(`${BASE_URL}/api/blog-posts/${slug}`);
  if (!res.ok) throw new Error("Not found");
  return res.json();
}

export default function BlogPostPage() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug ?? "";

  const { data, isLoading, error } = useQuery({
    queryKey: ["blogPost", slug],
    queryFn: () => fetchPost(slug),
    staleTime: 5 * 60 * 1000,
    enabled: !!slug,
  });

  const post = data?.post ?? null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="w-8 h-8 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Post not found</h1>
        <Link href="/blog">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to blog
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageSEO
        title={post.title}
        description={post.description}
        canonical={`${SITE}/blog/${post.slug}`}
        ogImage={post.ogImage ?? undefined}
      />
      <ArticleJsonLd post={post} />

      <div className="min-h-screen flex flex-col">
        <main className="flex-1 w-full">
          <div className="max-w-3xl mx-auto px-6 py-10">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="mb-8"
            >
              <Link href="/blog">
                <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
                  <ArrowLeft className="w-4 h-4" /> All posts
                </button>
              </Link>

              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${PILLAR_COLORS[post.pillar] ?? ""}`}
                >
                  {post.pillarLabel}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  {post.readingTimeMin} min read
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(post.publishedAt)}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground leading-tight mb-4">
                {post.title}
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed border-l-2 border-primary/40 pl-4">
                {post.description}
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
            >
              {renderBody(post.body)}
            </motion.div>

            <AssessmentCTA variant="footer" />

            <RelatedPosts currentSlug={post.slug} currentPillar={post.pillar} />
          </div>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}

function RelatedPosts({ currentSlug, currentPillar }: { currentSlug: string; currentPillar: string }) {
  const { data } = useQuery({
    queryKey: ["blogPosts"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/blog-posts`);
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ posts: BlogPost[] }>;
    },
    staleTime: 5 * 60 * 1000,
  });

  const allPosts = data?.posts ?? [];
  const samePillar = allPosts.filter(p => p.slug !== currentSlug && p.pillar === currentPillar).slice(0, 2);
  const filler = allPosts.filter(p => p.slug !== currentSlug && p.pillar !== currentPillar).slice(0, 2 - samePillar.length);
  const related = [...samePillar, ...filler];

  if (related.length === 0) return null;

  const PILLAR_COLORS: Record<string, string> = {
    assessment: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    dimensions: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    scenarios: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    data: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    "how-to": "bg-teal-500/10 text-teal-400 border-teal-500/20",
  };

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={2}
      className="mt-4"
    >
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
        Continue reading
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {related.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`}>
            <div className="group rounded-xl border border-border/60 bg-card/30 p-4 hover:border-primary/30 hover:bg-card/50 transition-all cursor-pointer">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border mb-2 ${PILLAR_COLORS[p.pillar] ?? ""}`}
              >
                {p.pillarLabel}
              </span>
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                {p.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
