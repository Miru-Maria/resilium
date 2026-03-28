import React from "react";
import { Link } from "wouter";
import { SiteFooter } from "@/components/site-footer";
import { ResilientIcon } from "@/components/resilient-icon";
import { Button } from "@/components/ui/button";
import {
  Backpack,
  DollarSign,
  Globe,
  AlertTriangle,
  Brain,
  Shield,
  TrendingUp,
  Zap,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Heart,
  MapPin,
  Lightbulb,
  Users,
  Lock,
} from "lucide-react";
import { motion } from "framer-motion";

const CONTACT_EMAIL = "contact_resilium@pm.me";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: "easeOut" },
  }),
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full py-6 px-6 lg:px-12 border-b border-border/60 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <ResilientIcon className="w-7 h-7" />
          <span className="font-display font-bold text-xl tracking-tight text-primary">Resilium</span>
        </Link>
        <Link href="/assess">
          <Button size="sm" className="rounded-full px-5 gap-2">
            Get My Plan <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/60 min-h-[520px] flex flex-col">
        {/* Depth orb — amber glow top-left */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 600, height: 600,
            top: "-20%", left: "-10%",
            borderRadius: "50%",
            background: "radial-gradient(circle at 40% 40%, rgba(224,128,64,0.13) 0%, rgba(200,110,40,0.05) 50%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        {/* Depth orb — indigo top-right */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 500, height: 500,
            top: "-10%", right: "-8%",
            borderRadius: "50%",
            background: "radial-gradient(circle at 60% 40%, rgba(30,50,130,0.28) 0%, rgba(15,25,80,0.10) 55%, transparent 75%)",
            filter: "blur(70px)",
          }}
        />

        {/* Bottom fade into the page */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, transparent 50%, rgba(13,18,37,0.7) 85%, rgb(13,18,37) 100%)",
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center flex-1 flex flex-col justify-center">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-6">
              <Brain className="w-3.5 h-3.5" /> About the Platform
            </div>
          </motion.div>
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-5"
          >
            Personal resilience,{" "}
            <span className="text-primary">built on data</span><br />
            not guesswork.
          </motion.h1>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10"
          >
            Resilium is a privacy-first platform that gives you an honest, clear picture
            of where you stand — across the financial, physical, psychological, and logistical
            dimensions that actually determine how well you weather disruption.
          </motion.p>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link href="/assess">
              <Button size="lg" className="rounded-full px-8 gap-2 h-12">
                Take the Assessment <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/privacy">
              <Button variant="outline" size="lg" className="rounded-full px-8 h-12 border-primary/20">
                Privacy Policy
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* QUICK STATS */}
      <section className="border-b border-border/60 bg-card/30">
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: BarChart3, value: "6", label: "Resilience dimensions scored" },
            { icon: Brain, value: "10", label: "Mental resilience data points" },
            { icon: Zap, value: "~15 min", label: "To your full report" },
            { icon: Lock, value: "0", label: "Pieces of PII required" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-1">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-display font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT IS RESILIUM */}
      <section className="border-b border-border/60">
        <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">The Problem</p>
            <h2 className="text-3xl font-display font-bold mb-5">Most people don't prepare until it's too late.</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A job loss, health crisis, natural disaster, or geopolitical shock arrives without warning. By the time the threat is visible, the window to prepare has already closed.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Generic resilience advice — "build an emergency fund," "diversify your skills" — is true and useless in isolation. It ignores your specific situation.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Resilium uses AI to analyze your full profile and deliver a plan built around exactly who you are and where you actually stand right now.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { icon: TrendingUp, title: "Scored across 6 dimensions", desc: "Financial, skills, health, mobility, psychological resilience, and emergency resources — each scored 0–100 with context." },
              { icon: Lightbulb, title: "AI-personalized, not generic", desc: "Your plan reflects your specific circumstances. Not a checklist. A prioritized roadmap built around your gaps." },
              { icon: Shield, title: "Privacy-first by design", desc: "No name or email required for your assessment. Your data is never sold, shared, or used for ads." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-4 rounded-2xl border border-border/60 bg-card/40">
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mt-0.5">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground mb-1">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO USES RESILIUM */}
      <section className="border-b border-border/60 bg-card/20">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Who It's For</p>
            <h2 className="text-3xl font-display font-bold">Built for people who take preparedness seriously</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Resilium works for a range of mindsets — from dedicated preppers to people who just want to stop feeling blindsided.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: Backpack,
                title: "Preppers & Self-Reliance Community",
                desc: "You already stockpile, plan, and take preparedness seriously. Resilium gives you a structured, scored picture of where your gaps still are — and prioritizes what to work on next.",
              },
              {
                icon: DollarSign,
                title: "The Financially Anxious",
                desc: "Inflation, job insecurity, and economic volatility are real. Know exactly how many months of runway you have and what to prioritize to get from vulnerable to stable.",
              },
              {
                icon: Globe,
                title: "Expats & Digital Nomads",
                desc: "Living abroad means location risk is real. Assess how your host country, mobility, and support network hold up under pressure — including scenarios that affect cross-border stability.",
              },
              {
                icon: AlertTriangle,
                title: "The Quietly Cautious",
                desc: "You don't call yourself a prepper. But the news has you thinking. Resilium gives you a structured, honest starting point — no ideology, no judgment, just useful signal.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-5 rounded-2xl border border-border/60 bg-card/50 hover:border-primary/30 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mt-0.5">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground mb-1.5">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8">
            Currency support for <strong className="text-foreground">USD, EUR, and RON</strong> — accessible worldwide.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-b border-border/60">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">The Process</p>
            <h2 className="text-3xl font-display font-bold">From questions to action plan in three steps</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                icon: Brain,
                title: "Complete the assessment",
                desc: "A structured set of questions covers your logistical situation — finances, housing, location, health, skills, dependents — and a 10-question mental resilience deep-dive. Takes 10–15 minutes to complete honestly.",
              },
              {
                step: "02",
                icon: Zap,
                title: "AI analysis",
                desc: "Your responses are processed by an AI model that identifies patterns, surfaces vulnerabilities, and recognizes genuine strengths across both the mental and practical dimensions of resilience.",
              },
              {
                step: "03",
                icon: TrendingUp,
                title: "Your personalized plan",
                desc: "A detailed, human-readable report that reflects your specific situation. Not generic tips — a prioritized action plan built around who you are and where you actually are right now.",
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="relative p-6 rounded-2xl border border-border/60 bg-card/40">
                <div className="text-4xl font-display font-bold text-primary/15 mb-4 leading-none">{step}</div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-bold text-base mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* METHODOLOGY */}
      <section className="border-b border-border/60 bg-card/20">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">The Methodology</p>
            <h2 className="text-3xl font-display font-bold">Two pillars. Six dimensions.</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Strong logistics with fragile psychology leads to rigidity, not resilience. Strong psychology with precarious logistics leads to courage without capacity. Both matter.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Mental */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold">Mental Resilience</h3>
                  <p className="text-xs text-muted-foreground">Psychological capacity under pressure</p>
                </div>
              </div>
              <ul className="space-y-2.5">
                {[
                  ["Stress Tolerance", "Function under sustained pressure without breakdown"],
                  ["Adaptability", "Willingness to change course when circumstances demand it"],
                  ["Learning Agility", "Speed and openness to acquiring new skills"],
                  ["Emotional Regulation", "Managing fear, grief, and uncertainty without paralysis"],
                  ["Social Connection", "Quality and reliability of personal support networks"],
                ].map(([name, desc]) => (
                  <li key={name} className="flex gap-3">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-semibold text-foreground">{name}</span>
                      <span className="text-xs text-muted-foreground"> — {desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Logistics */}
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-bold">Logistics & Resources</h3>
                  <p className="text-xs text-muted-foreground">Material factors that cushion or amplify disruption</p>
                </div>
              </div>
              <ul className="space-y-2.5">
                {[
                  ["Finances", "Income stability, savings runway, debt exposure"],
                  ["Skills", "Practical and transferable capabilities that retain value"],
                  ["Health", "Physical mobility, medical dependency, access to care"],
                  ["Mobility", "Security of housing tenure and suitability of location"],
                  ["Emergency Resources", "Supplies and preparations for acute disruption"],
                  ["Location", "Geographic risk exposure — climate, conflict, infrastructure"],
                ].map(([name, desc]) => (
                  <li key={name} className="flex gap-3">
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-semibold text-foreground">{name}</span>
                      <span className="text-xs text-muted-foreground"> — {desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PRIVACY */}
      <section className="border-b border-border/60">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Privacy by Design</p>
              <h2 className="text-3xl font-display font-bold mb-5">
                Built for people who don't want to be tracked.
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Resilium was built from day one with privacy as a core constraint, not an afterthought. You don't need to give us your name, email, or any identifying information to complete an assessment and receive your full plan.
              </p>
              <Link href="/privacy" className="text-sm text-primary font-medium hover:underline underline-offset-4 flex items-center gap-1">
                Read the full Privacy Policy <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Lock, text: "No name or email required for your assessment" },
                { icon: Shield, text: "Your data is never sold or shared with third parties" },
                { icon: Users, text: "GDPR-compliant — you retain all rights to your data" },
                { icon: CheckCircle2, text: "Assessment data auto-deleted after 12 months" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="p-4 rounded-2xl border border-border/60 bg-card/40 flex flex-col gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT THE PROJECT */}
      <section className="border-b border-border/60 bg-card/20">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <Heart className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-3xl font-display font-bold mb-5">About the Project</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Resilium is independently operated — not a startup, not VC-backed, not a data broker wearing a wellness brand as a mask. The platform exists because the problem is real, the tools to address it are scattered and generic, and privacy-respecting alternatives are in short supply.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-8">
            The mission is straightforward: help ordinary people make honest assessments of their vulnerability and take meaningful steps before a crisis forces their hand.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/assess">
              <Button size="lg" className="rounded-full px-8 gap-2 h-12">
                Take the Assessment <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href={`mailto:${CONTACT_EMAIL}`}>
              <Button variant="outline" size="lg" className="rounded-full px-8 h-12 border-primary/20">
                Contact Us
              </Button>
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
