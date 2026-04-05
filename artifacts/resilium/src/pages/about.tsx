import React from "react";
import { Link } from "wouter";
import { SiteFooter } from "@/components/site-footer";
import { ResilientIcon } from "@/components/resilient-icon";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Shield,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Heart,
  Lock,
  Users,
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
      <header className="w-full py-6 px-6 lg:px-12 border-b border-border/60 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <ResilientIcon className="w-7 h-7" />
          <span className="font-display font-bold text-xl tracking-tight text-primary">Resilium</span>
        </Link>
        <Link href="/consent">
          <Button size="sm" className="rounded-full px-5 gap-2">
            Build My Plan <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </header>

      {/* Page header */}
      <section className="border-b border-border/60 bg-card/20">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-6">
              <Brain className="w-3.5 h-3.5" /> About Resilium
            </div>
          </motion.div>
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-5"
          >
            How it works, why it's private,{" "}
            <span className="text-primary">and who built it.</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
          >
            Everything the landing page doesn't go into depth on — the scoring methodology, how we handle your data, and what this project actually is.
          </motion.p>
        </div>
      </section>

      {/* METHODOLOGY */}
      <section className="border-b border-border/60">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">The Methodology</p>
            <h2 className="text-3xl font-display font-bold">Two pillars. Seven dimensions.</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Strong logistics with fragile psychology leads to rigidity, not resilience. Strong psychology with precarious logistics leads to courage without capacity. Both matter — and both are scored.
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
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Measured through a 10-question deep-dive scored 1–5. Each dimension maps to how you respond under sustained stress — not how you think you'd respond.
              </p>
              <ul className="space-y-2.5">
                {[
                  ["Stress Tolerance", "Functioning under sustained pressure without breakdown"],
                  ["Adaptability", "Willingness to change course when circumstances demand it"],
                  ["Learning Agility", "Speed and openness to acquiring new skills under pressure"],
                  ["Emotional Regulation", "Managing fear, grief, and uncertainty without paralysis"],
                  ["Social Connection", "Quality and reliability of your personal support network"],
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
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Six practical dimensions drawn from your assessment answers. Each is scored 0–100 and weighted by its real-world impact on your ability to absorb a disruption.
              </p>
              <ul className="space-y-2.5">
                {[
                  ["Financial", "Income stability, savings runway, debt exposure (25% weight)"],
                  ["Skills", "Practical and transferable capabilities that retain value (20%)"],
                  ["Health", "Physical condition, medical dependency, access to care (15%)"],
                  ["Mobility", "Housing security, location, and ability to relocate (15%)"],
                  ["Psychological", "Your MR score mapped into the logistical score (15%)"],
                  ["Resources", "Emergency supplies, food security, practical preparations (10%)"],
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

          {/* Score bands */}
          <div className="mt-8 p-5 rounded-2xl border border-border/60 bg-card/30">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">Score Bands</p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { range: "0–39", label: "Critically Vulnerable", color: "text-red-400", desc: "Significant gaps across multiple dimensions. Immediate action needed on the highest-priority items." },
                { range: "40–69", label: "Moderately Prepared", color: "text-amber-400", desc: "Foundation exists but meaningful gaps remain. Focused effort on your weakest dimensions will move the needle fast." },
                { range: "70–100", label: "Highly Resilient", color: "text-green-400", desc: "Strong across most dimensions. Focus shifts to maintaining preparedness and closing remaining gaps." },
              ].map(({ range, label, color, desc }) => (
                <div key={range} className="p-4 rounded-xl border border-border/40 bg-background">
                  <p className={`text-2xl font-display font-bold ${color} mb-0.5`}>{range}</p>
                  <p className={`text-sm font-semibold mb-2 ${color}`}>{label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRIVACY */}
      <section className="border-b border-border/60 bg-card/20">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Privacy by Design</p>
              <h2 className="text-3xl font-display font-bold mb-5">
                Built for people who don't want to be tracked.
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Privacy wasn't bolted on at the end. It's a core design constraint. You don't need to give us your name, email, or any identifying information to complete an assessment and receive your full plan.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you choose to create an account, it's to save and track your plans over time — not to build a profile on you. We don't sell data, run ads, or share anything with third parties.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                All data is GDPR-compliant. You can export everything we hold about you, or request permanent deletion, at any time from your account settings.
              </p>
              <Link href="/privacy" className="text-sm text-primary font-medium hover:underline underline-offset-4 flex items-center gap-1">
                Read the full Privacy Policy <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Lock, text: "No name or email required to take the assessment" },
                { icon: Shield, text: "Your data is never sold, shared, or used for ads" },
                { icon: Users, text: "GDPR-compliant — full rights to access and erasure" },
                { icon: CheckCircle2, text: "Anonymous assessment data auto-deleted after 12 months" },
                { icon: TrendingUp, text: "Account sign-in is only for saving and tracking your plans" },
                { icon: Brain, text: "AI analysis runs on your answers — not a persistent profile of you" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="p-4 rounded-2xl border border-border/60 bg-background flex flex-col gap-3">
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
      <section className="border-b border-border/60">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <Heart className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-3xl font-display font-bold mb-5">About the Project</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Resilium is independently operated — not a startup, not VC-backed, not a data broker wearing a wellness brand as a mask. It exists because the problem is real, the tools to address it are scattered and generic, and privacy-respecting alternatives are in short supply.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            The mission is straightforward: help ordinary people make honest assessments of their vulnerability and take meaningful steps before a crisis forces their hand. The product is a living plan you work through — not a report you read once and forget.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Questions, feedback, or partnership inquiries can be sent directly to the inbox below. Responses are personal, not automated.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/consent">
              <Button size="lg" className="rounded-full px-8 gap-2 h-12">
                Build My Resilience Plan <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href={`mailto:${CONTACT_EMAIL}`}>
              <Button variant="outline" size="lg" className="rounded-full px-8 h-12 border-primary/20">
                Contact
              </Button>
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
