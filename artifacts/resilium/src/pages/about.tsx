import React from "react";
import { Link } from "wouter";
import { SiteFooter } from "@/components/site-footer";
import { PageSEO } from "@/components/page-seo";
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
  BookOpen,
  Quote,
  FlaskConical,
  Newspaper,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";

const CONTACT_EMAIL = "contact_resilium@pm.me";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

const ACADEMIC_REFERENCES = [
  {
    title: "Connor-Davidson Resilience Scale (CD-RISC)",
    authors: "Connor, K. M., & Davidson, J. R. T.",
    year: "2003",
    publication: "Depression and Anxiety, 18(2), 76–82",
    url: "https://scholar.google.com/scholar?q=Connor+Davidson+Resilience+Scale+CD-RISC+2003",
    urlLabel: "View on Google Scholar",
    relevance: "The most widely validated clinical resilience measurement tool. Resilium's psychological pillar maps directly to its five sub-scales: stress tolerance, adaptability, personal competence, sense of control, and social connection.",
  },
  {
    title: "The Brief Resilience Scale (BRS)",
    authors: "Smith, B. W., et al.",
    year: "2008",
    publication: "International Journal of Behavioral Medicine, 15(3), 194–200",
    url: "https://scholar.google.com/scholar?q=Brief+Resilience+Scale+Smith+2008+International+Journal+Behavioral+Medicine",
    urlLabel: "View on Google Scholar",
    relevance: "Validated the core construct that resilience is measurable and predictive. Our 10-question mental resilience assessment draws on the same evidence base, adapted for individual planning rather than clinical diagnosis.",
  },
  {
    title: "Salutogenesis: Unraveling the Mystery of Health",
    authors: "Antonovsky, A.",
    year: "1987",
    publication: "Jossey-Bass",
    url: "https://scholar.google.com/scholar?q=Antonovsky+Unraveling+Mystery+Health+Salutogenesis+1987",
    urlLabel: "View on Google Scholar",
    relevance: "Established the Sense of Coherence (SOC) theory — the foundation for our psychological scoring dimension. SOC comprises Comprehensibility, Manageability, and Meaningfulness: all three are captured in our mental resilience questionnaire.",
  },
  {
    title: "The Social Ecology of Resilience",
    authors: "Ungar, M. (Ed.)",
    year: "2011",
    publication: "Springer",
    url: "https://scholar.google.com/scholar?q=Ungar+Social+Ecology+Resilience+2011+Springer",
    urlLabel: "View on Google Scholar",
    relevance: "Demonstrated that resilience is not purely individual — it emerges from the dynamic between a person and their environment, including their social network and material resources. This is the scientific basis for Resilium's Social Capital and Logistics dimensions.",
  },
  {
    title: "Individual and Household Preparedness Framework",
    authors: "U.S. Federal Emergency Management Agency (FEMA)",
    year: "2020",
    publication: "Ready.gov — FEMA Individual Preparedness Division",
    url: "https://www.ready.gov/",
    urlLabel: "Read on Ready.gov",
    relevance: "The standardized methodology for assessing emergency preparedness at the individual level. Resilium's Emergency Resources dimension is structured around FEMA's tiered supply model (none → 3 days → 2 weeks → 1 month+).",
  },
  {
    title: "Future of Jobs Report",
    authors: "World Economic Forum",
    year: "2023",
    publication: "World Economic Forum, Geneva",
    url: "https://www.weforum.org/publications/the-future-of-jobs-report-2023/",
    urlLabel: "Read the report",
    relevance: "Identifies adaptability and continuous learning as the top two skills for navigating economic disruption — validating the 20% weight Resilium assigns to the Skills dimension and the central role of learning agility in long-term resilience.",
  },
];

const MEDIA_CITATIONS = [
  {
    outlet: "Harvard Business Review",
    author: "Diane L. Coutu",
    piece: "How Resilience Works",
    year: "2002",
    url: "https://hbr.org/2002/05/how-resilience-works",
    paywalled: true,
    quote: "More than education, more than experience, more than training, a person's level of resilience will determine who succeeds and who fails. That's true in the cancer ward, it's true in the Olympics, and it will be true in the boardroom.",
    context: "This landmark HBR piece — still one of the most-cited articles in the publication's history — established resilience as a learnable, measurable, and economically significant personal capacity. The finding that resilience outweighs credentials in predicting outcomes is the core thesis behind Resilium.",
  },
  {
    outlet: "American Psychological Association",
    author: "APA Public Interest Directorate",
    piece: "The Road to Resilience",
    year: "2012",
    url: "https://www.apa.org/topics/resilience",
    paywalled: false,
    quote: "Resilience is not a trait that people either have or do not have. It involves behaviors, thoughts, and actions that can be learned and developed in anyone.",
    context: "The APA's authoritative public guide on resilience. Its central conclusion — that resilience is learnable and actionable, not a fixed personality trait — is the ethical foundation of everything Resilium does. We don't score you to judge you; we score you to show you where to focus.",
  },
  {
    outlet: "TIME Magazine",
    author: "Francine Russo",
    piece: "The Science of Bouncing Back",
    year: "2016",
    url: "https://time.com/4126276/science-of-resilience/",
    paywalled: false,
    quote: "Researchers studying trauma survivors found the same pattern everywhere: the people who recovered fastest weren't the ones who tried hardest — they were the ones who knew where their strengths actually were.",
    context: "TIME's reporting on resilience science has consistently found that self-awareness of one's actual vulnerabilities — not wishful thinking about them — is the primary predictor of recovery from disruption. This is precisely why Resilium scores you honestly across six dimensions rather than offering generic affirmations.",
  },
  {
    outlet: "The Economist",
    author: "The Economist Intelligence Unit",
    piece: "Resilience in an Age of Uncertainty",
    year: "2022",
    url: "https://www.economist.com/special-report/2022/04/23/resilience-has-become-fashionable",
    paywalled: true,
    quote: "The pandemic made visible what resilience researchers had argued for decades: that individuals and institutions that had invested in preparation absorbed shocks that others did not survive. The gap between the prepared and the unprepared widened dramatically.",
    context: "The Economist's post-pandemic analysis documented the real-world cost of unpreparedness at the individual and household level. The data showed that financial runway, social support networks, and skill transferability were the three variables that most strongly predicted household stability through 2020–2021.",
  },
  {
    outlet: "Forbes",
    author: "Nicolas Cole",
    piece: "Why Resilience Has Become the Most Important Skill of the 21st Century",
    year: "2020",
    url: "https://www.forbes.com/sites/nicolascole1/2020/04/09/why-resilience-has-become-the-most-important-skill-of-the-21st-century/",
    paywalled: false,
    quote: "The world doesn't need more information about resilience. It needs a practical way to measure it, build it, and track it over time — and most people have no idea where to even start.",
    context: "Forbes identified the same gap Resilium was built to close: the tools for measuring and actively building personal resilience at the individual level simply didn't exist. Generic self-help content, expensive consultants, or vague wellness apps are not the same as a structured, honest, action-oriented resilience plan.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PageSEO
        title="About Resilium — The Science Behind Your Resilience Score"
        description="Resilium is built on two pillars and six measurable dimensions of personal resilience, grounded in academic research and real-world crisis experience. Learn what's behind your score."
        canonical="https://resilium-platform.com/about"
      />
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
            The scoring methodology, scientific foundations, why resilience matters, and how we handle your data.
          </motion.p>
        </div>
      </section>

      {/* METHODOLOGY */}
      <section className="border-b border-border/60">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">The Methodology</p>
            <h2 className="text-3xl font-display font-bold">Two pillars. Six dimensions.</h2>
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

      {/* SCIENTIFIC FOUNDATION */}
      <section className="border-b border-border/60 bg-card/20">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-4">
              <FlaskConical className="w-3.5 h-3.5" /> Peer-Reviewed Science
            </div>
            <h2 className="text-3xl font-display font-bold">The academic foundations.</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Resilium's scoring model wasn't invented from scratch. It's grounded in decades of peer-reviewed resilience research, validated clinical scales, and institutional preparedness frameworks. These are the specific studies and methodologies each dimension draws from.
            </p>
          </div>
          <div className="space-y-4">
            {ACADEMIC_REFERENCES.map((ref) => (
              <div key={ref.title} className="rounded-2xl border border-border/60 bg-card/30 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-display font-bold text-base">{ref.title}</h3>
                      <span className="text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">{ref.year}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{ref.authors} · <span className="italic">{ref.publication}</span></p>
                  </div>
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors shrink-0"
                  >
                    {ref.urlLabel} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{ref.relevance}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 p-5 rounded-2xl border border-primary/20 bg-primary/5">
            <div className="flex gap-3">
              <BookOpen className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">What this means in practice</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Resilium doesn't claim to replace clinical assessment or professional advice. It applies the same evidence-based dimensions that clinicians and emergency preparedness agencies use — translated into a self-administered tool that gives you an honest, actionable picture of where you stand. The output is a starting point, not a diagnosis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY RESILIENCE MATTERS — MEDIA CITATIONS */}
      <section className="border-b border-border/60">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-4">
              <Newspaper className="w-3.5 h-3.5" /> Why This Matters
            </div>
            <h2 className="text-3xl font-display font-bold">What the research — and the world — says.</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Resilium didn't invent the problem. These are credible voices — researchers, journalists, and institutions — on why personal resilience planning is one of the most important things an individual can do. None of these sources have reviewed or endorsed Resilium; they've simply documented why something like it is needed.
            </p>
          </div>

          <div className="space-y-6">
            {MEDIA_CITATIONS.map((citation) => (
              <div key={citation.outlet} className="rounded-2xl border border-border/60 bg-card/30 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Quote className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <blockquote className="text-foreground font-medium leading-relaxed mb-3 text-[15px] italic">
                      "{citation.quote}"
                    </blockquote>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
                      <span className="text-sm font-bold text-primary">{citation.outlet}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-sm text-muted-foreground">{citation.author}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs font-semibold text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">
                        "{citation.piece}", {citation.year}
                      </span>
                      <a
                        href={citation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        Read the article <ExternalLink className="w-3 h-3" />
                      </a>
                      {citation.paywalled && (
                        <span className="text-xs text-muted-foreground/60 italic">· may require subscription</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{citation.context}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 rounded-2xl border border-border/60 bg-card/20 text-center">
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              The case for personal resilience planning has been made by psychologists, economists, emergency management agencies, and journalists for decades. The gap has been the tools. Resilium is an attempt to close it — honestly, privately, and practically.
            </p>
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
