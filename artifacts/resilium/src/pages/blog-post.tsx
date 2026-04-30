import React from "react";
import { Link, useRoute } from "wouter";
import { SiteFooter } from "@/components/site-footer";
import { PageSEO } from "@/components/page-seo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Clock, Loader2, AlertTriangle, Link2, Check, ExternalLink, BookOpen } from "lucide-react";
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
        <Link href="/assess">
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
      <Link href="/assess">
        <Button size="sm" className="rounded-full gap-1.5 shrink-0">
          Take the assessment <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </Link>
    </div>
  );
}

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
  </svg>
);

const RedditIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
);

function ShareBar({ post }: { post: BlogPost }) {
  const [copied, setCopied] = React.useState(false);
  const canonicalUrl = `${SITE}/blog/${post.slug}`;
  const encodedUrl = encodeURIComponent(canonicalUrl);
  const encodedTitle = encodeURIComponent(post.title);
  const encodedDesc = encodeURIComponent(post.description);

  const platforms = [
    {
      label: "LinkedIn",
      icon: <LinkedInIcon />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&summary=${encodedDesc}`,
      color: "hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] hover:border-[#0A66C2]/40",
    },
    {
      label: "Facebook",
      icon: <FacebookIcon />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: "hover:bg-[#1877F2]/10 hover:text-[#1877F2] hover:border-[#1877F2]/40",
    },
    {
      label: "Reddit",
      icon: <RedditIcon />,
      href: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      color: "hover:bg-[#FF4500]/10 hover:text-[#FF4500] hover:border-[#FF4500]/40",
    },
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(canonicalUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="my-10 flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
        Share this post
      </span>
      <div className="flex items-center gap-2 flex-wrap">
        {platforms.map(({ label, icon, href, color }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${label}`}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border/60 text-muted-foreground transition-all ${color}`}
          >
            {icon}
            {label}
          </a>
        ))}
        <button
          onClick={copyLink}
          aria-label="Copy link"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border/60 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary hover:border-primary/40"
        >
          {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}

const DATA_RESEARCH_SOURCES = [
  {
    title: "Connor-Davidson Resilience Scale (CD-RISC)",
    authors: "Connor, K. M., & Davidson, J. R. T.",
    year: "2003",
    publication: "Depression and Anxiety, 18(2), 76–82",
    url: "https://scholar.google.com/scholar?q=Connor+Davidson+Resilience+Scale+CD-RISC+2003",
  },
  {
    title: "The Brief Resilience Scale (BRS)",
    authors: "Smith, B. W., et al.",
    year: "2008",
    publication: "International Journal of Behavioral Medicine, 15(3), 194–200",
    url: "https://scholar.google.com/scholar?q=Brief+Resilience+Scale+Smith+2008+International+Journal+Behavioral+Medicine",
  },
  {
    title: "Salutogenesis: Unraveling the Mystery of Health",
    authors: "Antonovsky, A.",
    year: "1987",
    publication: "Jossey-Bass",
    url: "https://scholar.google.com/scholar?q=Antonovsky+Unraveling+Mystery+Health+Salutogenesis+1987",
  },
  {
    title: "The Social Ecology of Resilience",
    authors: "Ungar, M. (Ed.)",
    year: "2011",
    publication: "Springer",
    url: "https://scholar.google.com/scholar?q=Ungar+Social+Ecology+Resilience+2011+Springer",
  },
  {
    title: "Individual and Household Preparedness Framework",
    authors: "U.S. Federal Emergency Management Agency (FEMA)",
    year: "2020",
    publication: "Ready.gov",
    url: "https://www.ready.gov/",
  },
  {
    title: "Future of Jobs Report",
    authors: "World Economic Forum",
    year: "2023",
    publication: "World Economic Forum, Geneva",
    url: "https://www.weforum.org/publications/the-future-of-jobs-report-2023/",
  },
];

function DataResearchSources() {
  return (
    <div className="my-10 rounded-2xl border border-border/60 bg-card/20 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/60 bg-card/30">
        <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
        <h3 className="text-sm font-semibold text-foreground">Sources & Methodology</h3>
        <span className="text-xs text-muted-foreground ml-auto">
          Resilium's scoring is grounded in peer-reviewed research
        </span>
      </div>
      <ul className="divide-y divide-border/40">
        {DATA_RESEARCH_SOURCES.map((src) => (
          <li key={src.title} className="flex items-start justify-between gap-4 px-5 py-3.5">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground leading-snug">{src.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {src.authors} · <span className="italic">{src.publication}</span> · {src.year}
              </p>
            </div>
            <a
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View source: ${src.title}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/70 transition-colors shrink-0 mt-0.5"
            >
              View <ExternalLink className="w-3 h-3" />
            </a>
          </li>
        ))}
      </ul>
      <div className="px-5 py-3 border-t border-border/40 bg-card/10">
        <p className="text-xs text-muted-foreground">
          Full methodology and context for each source:{" "}
          <Link href="/about" className="text-primary hover:text-primary/80 underline underline-offset-2">
            About Resilium →
          </Link>
        </p>
      </div>
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

            <ShareBar post={post} />

            {post.pillar === "data" && <DataResearchSources />}

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
