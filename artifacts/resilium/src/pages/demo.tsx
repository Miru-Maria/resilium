import React, { useState } from "react";
import { Link } from "wouter";
import { CircularProgress } from "@/components/circular-progress";
import { RadarChartView } from "@/components/radar-chart-view";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { SiteFooter } from "@/components/site-footer";
import { PageSEO } from "@/components/page-seo";
import { cn } from "@/lib/utils";
import {
  AlertTriangle, Check, CheckCircle, Activity, Brain, TrendingUp, Award,
  ExternalLink, ArrowRight, Eye, Zap, Lock, Sparkles, ChevronDown, ChevronUp, Target,
  DollarSign, Wrench, Navigation, Package, Users, Share2, Download,
  Twitter, Facebook, Copy, X, Info,
} from "lucide-react";

/* ──────────────────────────────────────────
   Static sample data — fictional profile
────────────────────────────────────────── */
const SAMPLE_SCORE = {
  overall: 61,
  financial: 48,
  health: 72,
  skills: 67,
  mobility: 55,
  psychological: 58,
  resources: 66,
};

const SAMPLE_MENTAL = {
  stressTolerance: 62,
  adaptability: 71,
  learningAgility: 78,
  changeManagement: 55,
  emotionalRegulation: 53,
  socialSupport: 64,
  composite: 64,
  pathway: "growth" as const,
};

const SAMPLE_VULNERABILITIES = [
  "Financial runway of under 2 months puts you at critical risk in any income disruption event.",
  "No documented emergency plan means decision-making during a crisis will rely on improvisation.",
  "High prescription medication dependency without a 3-month supply buffer.",
  "Rented housing in a high-seismic-risk zone with no renter's insurance in place.",
];

const SAMPLE_GOAL = {
  id: "job_security",
  emoji: "💼",
  label: "Job & income security",
  vision: "Six months of savings, a freelance client lined up, and a clear plan if my employer downsizes.",
};

const SAMPLE_CHECKLIST: Record<string, { id: string; title: string; description: string; priority: string; pathway: string }[]> = {
  financial: [
    { id: "f1", title: "Build a 3-month emergency fund", description: "Open a high-yield savings account and automate monthly transfers until you reach 3 months of living expenses.", priority: "critical", pathway: "foundation" },
    { id: "f2", title: "Review and cut non-essential subscriptions", description: "Identify recurring charges over $10/month and cancel or renegotiate any unused services.", priority: "high", pathway: "foundation" },
    { id: "f3", title: "Establish a secondary income stream", description: "Freelance your primary skills 5–10 hours per week to create income diversification.", priority: "medium", pathway: "growth" },
  ],
  health: [
    { id: "h1", title: "Secure a 90-day prescription buffer", description: "Ask your doctor to prescribe a 90-day supply and fill it immediately. Store the extra supply safely.", priority: "critical", pathway: "foundation" },
    { id: "h2", title: "Schedule annual physical + dental checkup", description: "Preventive care is significantly cheaper than reactive treatment. Book both now.", priority: "medium", pathway: "foundation" },
  ],
  resources: [
    { id: "r1", title: "Assemble a 72-hour go-bag", description: "Pack water (1L/person/day), food bars, first-aid kit, documents, cash, phone charger, and medications.", priority: "high", pathway: "foundation" },
    { id: "r2", title: "Store 2 weeks of shelf-stable food", description: "Build a rotating stock of rice, lentils, canned proteins, and cooking oil.", priority: "medium", pathway: "foundation" },
    { id: "r3", title: "Backup your critical digital documents", description: "Passport, insurance policies, birth certificate — encrypted cloud + USB drive stored off-site.", priority: "high", pathway: "foundation" },
  ],
  mobility: [
    { id: "m1", title: "Get renter's insurance", description: "Budget ~$15–20/month and get coverage for belongings, liability, and temporary relocation.", priority: "critical", pathway: "foundation" },
    { id: "m2", title: "Map two evacuation routes from your home", description: "Walk both routes. Identify where fuel, water, and shelter are available along each path.", priority: "medium", pathway: "foundation" },
  ],
  skills: [
    { id: "s1", title: "Earn one high-value transferable certification", description: "Cloud, cybersecurity, project management, or a trade skill — something that stays valuable in a downturn.", priority: "medium", pathway: "growth" },
    { id: "s2", title: "Learn basic first aid and CPR", description: "A one-day Red Cross course costs under $100 and may save a life. Valid for 2 years.", priority: "medium", pathway: "foundation" },
  ],
  psychological: [
    { id: "p1", title: "Build a weekly decompression habit", description: "30 minutes of any physical activity, 3× per week, consistently reduces crisis-response cortisol.", priority: "medium", pathway: "growth" },
    { id: "p2", title: "Write a simple 'chaos protocol'", description: "A one-page document: who to call, where to go, what account numbers matter. Done once, invaluable in crisis.", priority: "high", pathway: "foundation" },
  ],
  socialCapital: [
    { id: "sc1", title: "Have one resilience conversation with a trusted contact", description: "Share your plan with one person you trust and ask them to do the same. Mutual awareness multiplies real-world support.", priority: "medium", pathway: "growth" },
    { id: "sc2", title: "Join or explore one local community group", description: "Neighborhood associations, mutual aid networks, or faith communities — one trusted group is a genuine safety net.", priority: "low", pathway: "growth" },
  ],
};

const SAMPLE_ACTION_PLAN = {
  shortTerm: [
    { priority: "critical", category: "Financial", title: "Open and seed an emergency savings account", description: "Transfer at least $500 this week as your first step toward a 3-month buffer. Automate a fixed monthly transfer." },
    { priority: "critical", category: "Health", title: "Call your doctor about a 90-day prescription", description: "Many insurers will authorize a 90-day supply for maintenance medications. Do this before your next refill." },
    { priority: "high", category: "Resources", title: "Purchase a basic 72-hour emergency kit", description: "Amazon, Costco, or REI all carry pre-assembled kits under $75. Supplement with personal medications." },
    { priority: "high", category: "Mobility", title: "Get a renter's insurance quote today", description: "Takes 10 minutes online. Compare Lemonade, State Farm, and Allstate. Coverage from $12/month." },
  ],
  midTerm: [
    { priority: "high", category: "Financial", title: "Reduce monthly expenses by 15%", description: "Audit all subscriptions and recurring charges. Cancel or downgrade anything not used weekly. Redirect savings." },
    { priority: "high", category: "Skills", title: "Enroll in a high-value certification program", description: "Prioritize certifications in your field that remain valuable during downturns. Cloud and cyber are most resilient." },
    { priority: "medium", category: "Resources", title: "Build a 2-week food reserve", description: "Rotate through it regularly to keep freshness. Target a mix of caloric density and nutritional value." },
    { priority: "medium", category: "Psychological", title: "Establish a physical exercise routine", description: "Even 3× weekly at 30 minutes significantly improves stress response and decision-making under pressure." },
  ],
  longTerm: [
    { priority: "high", category: "Financial", title: "Diversify income to at least 2 sources", description: "A side practice of your primary skill, rental income, dividend investing — any second revenue stream reduces catastrophic risk." },
    { priority: "medium", category: "Mobility", title: "Research alternative housing in a lower-risk zone", description: "Not necessarily move — but know where you'd go. Have the conversation. Understand the cost delta." },
    { priority: "medium", category: "Skills", title: "Develop one practical physical skill", description: "Gardening, basic carpentry, electrical — anything that reduces dependence on supply chains under disruption." },
    { priority: "low", category: "Psychological", title: "Deepen your social network deliberately", description: "Shared preparedness conversations with neighbors, friends, or family create real community support infrastructure." },
  ],
};

const SAMPLE_SCENARIOS = [
  {
    scenario: "Sudden Job Loss",
    impact: "severe",
    description: "With under 2 months of financial runway, a sudden income disruption would become critical within weeks. Your skills profile (67/100) and transferable certifications position you to find work within 2–4 months — but the gap is dangerous without emergency savings.",
    immediateSteps: [
      "File for unemployment benefits within 24 hours",
      "Cut discretionary spending to absolute essentials immediately",
      "Activate your professional network — informal referrals fill 85% of mid-level roles",
      "Identify 3 freelance income streams you can activate within a week",
    ],
  },
  {
    scenario: "3-Month Medical Leave",
    impact: "high",
    description: "Your health score (72) suggests you're physically capable, but a forced 3-month medical leave would compound financial stress rapidly. Without disability insurance, you'd exhaust your runway before returning to work. Your social support (64) should help with practical logistics.",
    immediateSteps: [
      "Confirm whether your employer provides short-term disability coverage",
      "Review your health insurance policy for hospitalization caps",
      "Identify a trusted person who can manage financial obligations on your behalf",
      "Ensure your medication supply is adequate for a worst-case scenario",
    ],
  },
  {
    scenario: "Major Natural Disaster",
    impact: "high",
    description: "Your resources score (66) gives you a partial buffer. A go-bag and short-term supply are manageable, but your current level of preparation wouldn't sustain a multi-week displacement well. Your mobility score (55) reflects that your housing situation adds risk in a disaster scenario.",
    immediateSteps: [
      "Activate your go-bag and primary evacuation route",
      "Contact your insurer within 24 hours to initiate a renter's insurance claim",
      "Reach your designated emergency contact before infrastructure is disrupted",
      "Identify a temporary shelter location in advance — don't improvise during the event",
    ],
  },
];

/* ──────────────────────────────────────────
   Helpers
────────────────────────────────────────── */
const AREA_LABELS: Record<string, string> = {
  financial: "Financial", health: "Health", skills: "Skills",
  mobility: "Mobility", psychological: "Psychological", resources: "Resources",
  socialCapital: "Social Capital",
};

const AREA_ICONS: Record<string, React.ReactNode> = {
  financial: <DollarSign className="w-4 h-4 text-amber-500" />,
  health: <Activity className="w-4 h-4 text-emerald-500" />,
  skills: <Wrench className="w-4 h-4 text-blue-400" />,
  mobility: <Navigation className="w-4 h-4 text-violet-400" />,
  psychological: <Brain className="w-4 h-4 text-rose-400" />,
  resources: <Package className="w-4 h-4 text-orange-400" />,
  socialCapital: <Users className="w-4 h-4 text-teal-500" />,
};

const DIMENSION_DESCRIPTIONS: Record<string, string> = {
  financial: "Emergency funds, income stability, debt exposure, and financial runway under disruption.",
  health: "Medical access, medication supply, physical readiness, and healthcare independence.",
  skills: "Marketable abilities, adaptability, practical know-how, and income diversification potential.",
  mobility: "Travel documents, evacuation plans, geographic flexibility, and relocation readiness.",
  psychological: "Stress tolerance, adaptability, mindset, emotional regulation, and social support.",
  resources: "Food, water, supplies, housing security, and access to community mutual aid.",
  socialCapital: "Network depth, trusted relationships, community ties, and access to informal help.",
};

const PRIORITY_CONFIG = {
  critical: { label: "Critical", className: "bg-red-500/20 text-red-400" },
  high: { label: "High", className: "bg-amber-500/20 text-amber-400" },
  medium: { label: "Medium", className: "bg-sky-500/20 text-sky-400" },
  low: { label: "Low", className: "bg-primary/15 text-primary" },
};

function getScoreColor(score: number) {
  if (score >= 70) return "text-emerald-500";
  if (score >= 40) return "text-amber-500";
  return "text-destructive";
}

function getScoreLabel(score: number) {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  if (score >= 20) return "Low";
  return "Critical";
}

/* ──────────────────────────────────────────
   Demo Banner
────────────────────────────────────────── */
function DemoBanner() {
  return (
    <div className="w-full bg-primary/10 border-b border-primary/20 px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 print:hidden">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Eye className="w-4 h-4 text-primary flex-shrink-0" />
        <p className="text-sm font-medium text-foreground">
          <span className="font-bold text-primary">Sample Plan</span>
          {" "}— Fictional demo profile (Alex M., 34). Your real plan reflects your situation.
        </p>
      </div>
      <Link href="/assess" className="flex-shrink-0 self-start sm:self-auto">
        <Button size="sm" className="rounded-full gap-1.5">
          Build My Plan <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </Link>
    </div>
  );
}

/* ──────────────────────────────────────────
   Pro Teaser (for scenario & score history sections)
────────────────────────────────────────── */
function ProTeaser({ title, description }: { title: string; description: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-6 flex flex-col items-center text-center gap-4">
      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Lock className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h4 className="font-display font-bold text-lg mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">{description}</p>
      </div>
      <Link href="/pricing">
        <Button size="sm" className="rounded-full gap-1.5">
          Unlock with Pro <ExternalLink className="w-3.5 h-3.5" />
        </Button>
      </Link>
    </div>
  );
}

/* ──────────────────────────────────────────
   Main Page
────────────────────────────────────────── */
function ShareModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const url = "https://resilium-platform.com/demo";
  const text = "I explored Resilium's demo plan — a structured personal resilience assessment across finances, health, skills & more. Really eye-opening. Check it out:";
  const copy = () => {
    navigator.clipboard.writeText(`${text} ${url}`).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-card rounded-3xl shadow-2xl border border-border w-full max-w-sm p-6 space-y-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-xl">Share this demo</h3>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">Show others what a Resilium plan looks like.</p>
        <div className="space-y-3">
          <a href={`https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-border hover:bg-muted/40 transition-colors text-sm font-medium">
            <Twitter className="w-4 h-4" /> Share on X / Twitter
          </a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-border hover:bg-muted/40 transition-colors text-sm font-medium">
            <Facebook className="w-4 h-4" /> Share on Facebook
          </a>
          <a href={`https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent("Check out Resilium — a personal resilience planning platform")}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-border hover:bg-muted/40 transition-colors text-sm font-medium">
            <Share2 className="w-4 h-4" /> Share on Reddit
          </a>
          <button type="button" onClick={copy}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-border hover:bg-muted/40 transition-colors text-sm font-medium">
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied to clipboard!" : "Copy link"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DemoPage() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);

  const onlySection = new URLSearchParams(window.location.search).get("only");
  const sectionStyle = (id?: string): React.CSSProperties | undefined =>
    onlySection ? (onlySection !== id ? { display: "none" } : undefined) : undefined;

  const toggleItem = (key: string) =>
    setCheckedItems(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const toggleExpand = (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    setExpandedItem(prev => prev === key ? null : key);
  };

  const sortedAreas = Object.keys(SAMPLE_CHECKLIST).sort((a, b) => {
    const scoreMap: Record<string, number> = SAMPLE_SCORE;
    return (scoreMap[a] ?? 50) - (scoreMap[b] ?? 50);
  });

  const areaCompletion = (area: string) => {
    const items = SAMPLE_CHECKLIST[area] ?? [];
    const done = items.filter(i => checkedItems.has(`${area}::${i.id}`)).length;
    return { done, total: items.length, percent: items.length ? Math.round((done / items.length) * 100) : 0 };
  };

  const allItems = Object.entries(SAMPLE_CHECKLIST).flatMap(([area, items]) => items.map(i => `${area}::${i.id}`));
  const totalDone = allItems.filter(k => checkedItems.has(k)).length;
  const totalItems = allItems.length;
  const overallPercent = totalItems ? Math.round((totalDone / totalItems) * 100) : 0;

  const handleMarkdownExport = () => {
    const lines: string[] = [];
    lines.push(`# Resilience Strategic Action Plan — Sample Demo`);
    lines.push(`> Profile: Alex M., 34 · Goal: ${SAMPLE_GOAL.label}`);
    lines.push(`> Overall Score: ${SAMPLE_SCORE.overall}/100`);
    lines.push(``);
    const horizons: Array<{ key: "shortTerm" | "midTerm" | "longTerm"; label: string }> = [
      { key: "shortTerm", label: "## 0–30 Days" },
      { key: "midTerm", label: "## 3–6 Months" },
      { key: "longTerm", label: "## Long Term (6–18 Months)" },
    ];
    for (const h of horizons) {
      lines.push(h.label);
      for (const item of SAMPLE_ACTION_PLAN[h.key]) {
        lines.push(`### [${item.priority.toUpperCase()}] ${item.category}: ${item.title}`);
        lines.push(item.description);
        lines.push(``);
      }
    }
    lines.push(`---`);
    lines.push(`*Generated by Resilium — resilium-platform.com*`);
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "resilium-demo-plan.md";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const mrDimensions = [
    { label: "Stress Tolerance", value: SAMPLE_MENTAL.stressTolerance },
    { label: "Adaptability", value: SAMPLE_MENTAL.adaptability },
    { label: "Learning Agility", value: SAMPLE_MENTAL.learningAgility },
    { label: "Change Management", value: SAMPLE_MENTAL.changeManagement },
    { label: "Emotional Regulation", value: SAMPLE_MENTAL.emotionalRegulation },
    { label: "Social Support", value: SAMPLE_MENTAL.socialSupport },
  ];

  return (
    <div className="min-h-screen pb-24">
      <PageSEO
        title="Live Demo — See Resilium in Action"
        description="Explore a complete sample resilience profile: see how Resilium scores six dimensions, surfaces key vulnerabilities, and builds a prioritized 90-day action checklist."
        canonical="https://resilium-platform.com/demo"
      />
      {showShare && <ShareModal onClose={() => setShowShare(false)} />}
      {/* Header */}
      <DemoBanner />

      <main className="max-w-6xl mx-auto px-6 pt-10 space-y-10">

        {/* HOW IT WORKS EXPLAINER */}
        <Accordion type="single" collapsible className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <AccordionItem value="how" className="border-none">
            <AccordionTrigger className="px-5 py-4 hover:no-underline [&>svg]:hidden">
              <div className="flex items-center gap-2.5 text-sm font-semibold">
                <Info className="w-4 h-4 text-primary flex-shrink-0" />
                How Resilium works — what are you looking at?
                <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This is a live demo showing a fictional profile ("Alex"). Your real report is generated from a
                  structured 5-minute assessment — no guessing, no AI hallucination. Every score is calculated from
                  your actual answers.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  {[
                    { icon: <Eye className="w-4 h-4 text-primary" />, title: "Assess", body: "Answer 20–25 targeted questions about your finances, health, skills, and preparedness." },
                    { icon: <TrendingUp className="w-4 h-4 text-amber-500" />, title: "Score", body: "Each answer feeds a weighted model. You get a score out of 100 across 6 dimensions." },
                    { icon: <Zap className="w-4 h-4 text-emerald-500" />, title: "Act", body: "A prioritized 90-day checklist surfaces your highest-leverage improvements first." },
                  ].map(s => (
                    <div key={s.title} className="flex flex-col gap-1.5 bg-muted/30 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 font-semibold">{s.icon}{s.title}</div>
                      <p className="text-muted-foreground text-xs leading-relaxed">{s.body}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {Object.entries(DIMENSION_DESCRIPTIONS).map(([key, desc]) => (
                    <div key={key} className="flex gap-2 text-xs rounded-xl border border-border/60 p-2.5">
                      <span className="flex-shrink-0 mt-0.5">{AREA_ICONS[key]}</span>
                      <div>
                        <div className="font-semibold text-foreground mb-0.5">{AREA_LABELS[key]}</div>
                        <div className="text-muted-foreground leading-relaxed">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* GOAL BADGE — shows the new step 14 feature */}
        <div className="flex items-center gap-3 flex-wrap" style={sectionStyle()}>
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2">
            <span className="text-lg">{SAMPLE_GOAL.emoji}</span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary mr-2">Resilience Goal</span>
              <span className="text-sm font-semibold text-foreground">{SAMPLE_GOAL.label}</span>
            </div>
          </div>
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <Target className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground italic">"{SAMPLE_GOAL.vision}"</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-full gap-1.5 flex-shrink-0" onClick={() => setShowShare(true)}>
            <Share2 className="w-3.5 h-3.5" /> Share
          </Button>
        </div>

        {/* HERO SCORES */}
        <section id="scores" style={sectionStyle("scores")} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 border-none shadow-xl shadow-black/5 bg-gradient-to-b from-card to-muted/20 flex flex-col items-center justify-center p-8 text-center">
            <h2 className="font-display font-bold text-xl mb-8 text-foreground">Overall Readiness</h2>
            <CircularProgress value={SAMPLE_SCORE.overall} size={220} strokeWidth={16} colorClass={getScoreColor(SAMPLE_SCORE.overall)} />
            <p className={cn("mt-8 text-sm font-bold uppercase tracking-widest", getScoreColor(SAMPLE_SCORE.overall))}>
              {getScoreLabel(SAMPLE_SCORE.overall)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Moderately Prepared</p>
            {/* Simulated percentile */}
            <div className="mt-6 w-full px-2">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">vs. other users</span>
                <span className="font-semibold text-foreground">Top 34%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary" style={{ width: "66%" }} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                Higher than 66% of 1,247 users (sample)
              </p>
            </div>
          </Card>

          <Card className="lg:col-span-2 border-none shadow-xl shadow-black/5 flex flex-col sm:flex-row items-center p-6 gap-6">
            <div className="w-full sm:w-1/2 h-[300px]">
              <RadarChartView score={SAMPLE_SCORE} />
            </div>
            <div className="w-full sm:w-1/2 space-y-4">
              <h3 className="font-display font-bold text-2xl">Risk Profile</h3>
              <p className="text-muted-foreground leading-relaxed">
                Alex's profile shows a mid-tier resilience baseline with a critical financial vulnerability. Strong health and
                adaptability provide meaningful buffers, but the combination of low savings runway and inadequate emergency supplies
                means any acute disruption — job loss, medical event, or natural disaster — would escalate quickly. The psychological
                profile leans growth-oriented, which makes ambitious action plans achievable if financial stability is addressed first.
              </p>
            </div>
          </Card>
        </section>

        {/* MENTAL RESILIENCE PROFILE */}
        <section id="mental" style={sectionStyle("mental")} className="bg-card rounded-3xl p-6 md:p-8 shadow-lg shadow-black/5 border border-border">
          <div className="flex items-center gap-3 mb-6">
            <Brain className="w-6 h-6 text-primary" />
            <h2 className="font-display font-bold text-2xl">Mental Resilience Profile</h2>
            <span className="ml-auto text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
              Growth Pathway
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {mrDimensions.map(dim => (
              <div key={dim.label} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-semibold text-foreground">{dim.label}</span>
                    <span className={cn("ml-2 text-xs font-medium", getScoreColor(dim.value))}>
                      {getScoreLabel(dim.value)}
                    </span>
                  </div>
                  <span className={cn("text-sm font-bold", getScoreColor(dim.value))}>{dim.value}/100</span>
                </div>
                <Progress value={dim.value} className="h-2" />
              </div>
            ))}
          </div>
          <div className="bg-muted/30 rounded-2xl p-4 flex items-center gap-4">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-display font-bold text-primary">{SAMPLE_MENTAL.composite}</span>
            </div>
            <div>
              <p className="font-bold text-sm">Composite Mental Resilience Score</p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Strong learning agility and adaptability enable an ambitious, challenge-oriented action plan. Alex's growth pathway
                means tackling hard goals directly rather than building incrementally.
              </p>
            </div>
          </div>
        </section>

        {/* CRITICAL VULNERABILITIES */}
        <section style={sectionStyle()}>
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-destructive" />
            <h2 className="font-display font-bold text-2xl">Critical Vulnerabilities</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {SAMPLE_VULNERABILITIES.map((vuln, idx) => (
              <div key={idx} className="bg-destructive/10 border border-destructive/20 px-5 py-4 rounded-2xl flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-destructive">{idx + 1}</span>
                </div>
                <p className="text-sm font-medium text-foreground leading-snug">{vuln}</p>
              </div>
            ))}
          </div>
        </section>

        {/* NEXT ACTION SPOTLIGHT */}
        {!onlySection && (() => {
          const nextItem = Object.entries(SAMPLE_CHECKLIST)
            .flatMap(([area, items]) => items.map(i => ({ area, ...i })))
            .filter(i => !checkedItems.has(`${i.area}::${i.id}`))
            .sort((a, b) => {
              const order = { critical: 0, high: 1, medium: 2, low: 3 };
              return (order[a.priority as keyof typeof order] ?? 9) - (order[b.priority as keyof typeof order] ?? 9);
            })[0];
          if (!nextItem) return null;
          const cfg = PRIORITY_CONFIG[nextItem.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.medium;
          return (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Your Next Action</p>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={cn("text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full", cfg.className)}>{cfg.label}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{AREA_LABELS[nextItem.area] ?? nextItem.area}</span>
                </div>
                <h4 className="font-bold text-base">{nextItem.title}</h4>
                <p className="text-muted-foreground text-sm mt-0.5">{nextItem.description}</p>
              </div>
              <button
                type="button"
                className="flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 border border-emerald-500/40 bg-emerald-500/15 text-emerald-400 flex-shrink-0"
                onClick={() => toggleItem(`${nextItem.area}::${nextItem.id}`)}
              >
                <CheckCircle className="w-3.5 h-3.5" /> Done
              </button>
            </div>
          );
        })()}

        {/* ACTION CHECKLISTS */}
        <section id="checklists" style={sectionStyle("checklists")} className="bg-card rounded-3xl p-6 md:p-8 shadow-lg shadow-black/5 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
            <h2 className="font-display font-bold text-2xl">Action Checklists</h2>
          </div>
          <p className="text-muted-foreground text-sm mb-6">
            Areas sorted from most critical to least. Try checking items off — your progress is saved in your real plan.
          </p>

          {/* Overall progress */}
          <div className="mb-8 p-4 rounded-2xl bg-muted/30 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm">Overall Progress</span>
              <span className="text-sm font-bold text-primary">{totalDone}/{totalItems} completed</span>
            </div>
            <Progress value={overallPercent} className="h-3 mb-2" />
            <p className="text-xs text-muted-foreground">In your real plan, checklist progress is saved permanently.</p>
          </div>

          <Tabs defaultValue={sortedAreas[0]} className="w-full">
            <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-2xl mb-6">
              {sortedAreas.map(area => {
                const comp = areaCompletion(area);
                return (
                  <TabsTrigger key={area} value={area} title={DIMENSION_DESCRIPTIONS[area]} className="rounded-xl text-xs sm:text-sm data-[state=active]:shadow-sm flex items-center gap-1.5">
                    {AREA_ICONS[area]}
                    {AREA_LABELS[area] ?? area}
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                      comp.done === comp.total && comp.total > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-muted-foreground"
                    )}>
                      {comp.done}/{comp.total}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {sortedAreas.map(area => {
              const items = SAMPLE_CHECKLIST[area] ?? [];
              const comp = areaCompletion(area);
              return (
                <TabsContent key={area} value={area} className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
                  <div className="flex items-center gap-3 mb-4">
                    <Progress value={comp.percent} className="h-2 flex-1" />
                    <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">{comp.done}/{comp.total}</span>
                  </div>
                  {items.map(item => {
                    const key = `${area}::${item.id}`;
                    const completed = checkedItems.has(key);
                    const isExpanded = expandedItem === key;
                    const priorityConfig = PRIORITY_CONFIG[item.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.medium;
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "rounded-2xl border transition-all overflow-hidden",
                          completed
                            ? "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-900/30"
                            : "border-border/60 hover:border-primary/30 hover:bg-muted/10"
                        )}
                      >
                        <div
                          className="flex items-start gap-4 p-5 cursor-pointer"
                          onClick={() => toggleItem(key)}
                        >
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all",
                            completed ? "border-emerald-500 bg-emerald-500" : "border-muted-foreground/60"
                          )}>
                            {completed && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className={cn("text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full", priorityConfig.className)}>
                                {priorityConfig.label}
                              </span>
                              <span className={cn(
                                "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full",
                                item.pathway === "growth" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                              )}>
                                {item.pathway === "growth" ? "Growth" : "Foundation"}
                              </span>
                            </div>
                            <h4 className={cn("font-bold text-base", completed && "line-through text-muted-foreground")}>
                              {item.title}
                            </h4>
                            <p className="text-muted-foreground text-sm mt-0.5">{item.description}</p>
                          </div>
                        </div>

                        {/* Break it down — Pro feature demo */}
                        <div className="px-5 pb-4 pt-0">
                          <button
                            type="button"
                            onClick={(e) => toggleExpand(e, key)}
                            className={cn(
                              "flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 border transition-all",
                              isExpanded
                                ? "border-primary/40 bg-primary/5 text-primary"
                                : "border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
                            )}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            {isExpanded ? "Hide breakdown" : "Break it down"}
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </div>

                        {/* Pro teaser inline */}
                        {isExpanded && (
                          <div className="mx-5 mb-5 rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
                            <Lock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-foreground mb-1">AI step-by-step guidance — Pro feature</p>
                              <p className="text-xs text-muted-foreground mb-3">
                                In your real plan, clicking this generates 4–7 personalized sub-steps tailored to your location, goal, and situation — using the full context of your profile.
                              </p>
                              <Link href="/pricing">
                                <Button size="sm" className="rounded-full gap-1.5 h-7 text-xs">
                                  Unlock with Pro <ExternalLink className="w-3 h-3" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </TabsContent>
              );
            })}
          </Tabs>
        </section>

        {/* ACTION PLAN */}
        <section style={sectionStyle()} className="bg-card rounded-3xl p-6 md:p-8 shadow-lg shadow-black/5 border border-border">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            <h2 className="font-display font-bold text-2xl">Strategic Action Plan</h2>
            <Button variant="outline" size="sm" className="ml-auto rounded-full gap-1.5 text-xs" onClick={handleMarkdownExport}>
              <Download className="w-3.5 h-3.5" /> Markdown
            </Button>
          </div>
          <Tabs defaultValue="shortTerm" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/50 p-1 rounded-full">
              <TabsTrigger value="shortTerm" className="rounded-full data-[state=active]:shadow-sm">0–30 Days</TabsTrigger>
              <TabsTrigger value="midTerm" className="rounded-full data-[state=active]:shadow-sm">3–6 Months</TabsTrigger>
              <TabsTrigger value="longTerm" className="rounded-full data-[state=active]:shadow-sm">Long Term</TabsTrigger>
            </TabsList>
            {(["shortTerm", "midTerm", "longTerm"] as const).map(period => (
              <TabsContent key={period} value={period} className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
                {SAMPLE_ACTION_PLAN[period].map((item, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl border border-border/60 hover:border-primary/30 hover:bg-muted/10 transition-colors">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          item.priority === "critical" ? "bg-red-500/20 text-red-400" :
                          item.priority === "high" ? "bg-amber-500/20 text-amber-400" :
                          "bg-primary/15 text-primary"
                        }`}>{item.priority} priority</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-secondary/30 text-secondary-foreground">
                          {item.category}
                        </span>
                      </div>
                      <h4 className="font-bold text-lg text-foreground">{item.title}</h4>
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* SCENARIO SIMULATIONS */}
        <section id="scenarios" style={sectionStyle("scenarios")}>
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-6 h-6 text-primary" />
            <h2 className="font-display font-bold text-2xl">Stress Test Scenarios</h2>
          </div>
          <p className="text-muted-foreground mb-6">How Alex's profile holds up against three primary risk scenarios.</p>
          <Accordion type="single" collapsible className="w-full space-y-3">
            {SAMPLE_SCENARIOS.map((scenario, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="bg-card border border-border rounded-2xl overflow-hidden px-2 shadow-sm">
                <AccordionTrigger className="hover:no-underline px-4 py-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-left w-full pr-4">
                    <span className="font-bold text-lg">{scenario.scenario}</span>
                    <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full w-max ${
                      scenario.impact === "severe" ? "bg-red-500/20 text-red-400" :
                      scenario.impact === "high" ? "bg-amber-500/20 text-amber-400" :
                      "bg-emerald-500/20 text-emerald-400"
                    }`}>{scenario.impact} Impact</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-5 pt-0">
                  <div className="pt-4 border-t border-border space-y-4">
                    <p className="text-muted-foreground leading-relaxed">{scenario.description}</p>
                    <div className="bg-muted/30 p-4 rounded-xl">
                      <h5 className="font-bold text-sm mb-2 uppercase tracking-wide">Immediate Steps</h5>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-foreground">
                        {scenario.immediateSteps.map((step, i) => <li key={i}>{step}</li>)}
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* PRO TEASERS */}
        <section id="pro-features" style={sectionStyle("pro-features")} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProTeaser
            title="Step-by-step Guidance"
            description="Click 'Break it down' on any checklist item and get 4–7 concrete, location-specific sub-steps tailored to your full profile and goal."
          />
          <ProTeaser
            title="Interactive Scenario Stress-Tests"
            description="Adjust parameters — unemployment duration, medical severity, relocation distance — and see how your resilience score shifts in real time."
          />
          <ProTeaser
            title="Score History & Plan Comparison"
            description="Track your resilience over multiple assessments. See exactly which dimensions improved and compare plan versions side-by-side."
          />
          <ProTeaser
            title="AI Companion"
            description="Ask questions specific to your gaps, location, and situation — not generic advice. The Companion has full context from your assessment answers and scores."
          />
          <ProTeaser
            title="Crisis Guides"
            description="10 practical, location-relevant guides covering financial crisis, power outages, flooding, earthquakes, and more — readable offline as a saved file."
          />
        </section>

        {/* PROGRESS MILESTONES */}
        <section style={sectionStyle()} className="bg-card rounded-3xl p-6 md:p-8 shadow-lg shadow-black/5 border border-border">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-6 h-6 text-amber-500" />
            <h2 className="font-display font-bold text-2xl">Progress Milestones</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { percent: 25, label: "Momentum Building", icon: "🌱" },
              { percent: 50, label: "Strong Foundation", icon: "🏗️" },
              { percent: 75, label: "Well Prepared", icon: "🛡️" },
              { percent: 100, label: "Fully Resilient", icon: "🎯" },
            ].map(m => {
              const achieved = overallPercent >= m.percent;
              return (
                <div key={m.percent} className={cn(
                  "rounded-2xl p-4 text-center border transition-all",
                  achieved ? "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10" : "border-border bg-muted/20 opacity-50"
                )}>
                  <div className="text-2xl mb-1">{m.icon}</div>
                  <p className="text-xs font-bold">{m.percent}%</p>
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* FINAL CTA */}
        <section style={sectionStyle()} className="rounded-3xl bg-primary/10 border border-primary/20 p-8 md:p-12 text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <h2 className="font-display font-bold text-3xl">Ready to build your real plan?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Alex's plan is fictional. Yours reflects your actual situation — your finances, your location,
            your health, your skills. It takes 10–15 minutes and requires no personal information.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/assess">
              <Button size="lg" className="rounded-full px-8 gap-2 h-12">
                Build My Resilience Plan <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="rounded-full px-8 h-12 border-primary/20">
                See Pro Features
              </Button>
            </Link>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
