import React from "react";
import { Link } from "wouter";
import { SiteFooter } from "@/components/site-footer";
import { ResilientIcon } from "@/components/resilient-icon";
import { Backpack, DollarSign, Globe, AlertTriangle } from "lucide-react";

const CONTACT_EMAIL = "contact_resilium@pm.me";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full py-6 px-6 lg:px-12 border-b border-border/60">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <ResilientIcon className="w-7 h-7" />
          <span className="font-display font-bold text-xl tracking-tight text-primary">Resilium</span>
        </Link>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12 space-y-10">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight mb-3">About Resilium</h1>
          <p className="text-muted-foreground leading-relaxed">
            Building personal resilience before disruption arrives — not after.
          </p>
        </div>

        <Section title="What is Resilium">
          <p>
            Most people don't think about personal resilience until something goes wrong — a job loss, a health crisis, a natural disaster, a geopolitical shock. By then, the window to prepare has already closed.
          </p>
          <p>
            Resilium exists to change that. It is a free, privacy-first assessment platform that helps you understand exactly where you stand across the dimensions that matter most when life becomes unpredictable: your finances, your skills, your health, your location, and your psychological capacity to adapt.
          </p>
          <p>
            The result is a fully personalized resilience plan — concrete, actionable, and honest about your gaps — delivered immediately. No account is required to complete an assessment and receive your plan. Create an account if you want to save your results, track your progress over time, or compare plans.
          </p>
        </Section>

        <Section title="Who Uses Resilium">
          <p>Resilium is built for English-speaking people around the world who take personal preparedness seriously — or want to start. Our primary communities include:</p>
          <div className="grid sm:grid-cols-2 gap-4 not-prose mt-2">
            {[
              {
                icon: <Backpack className="w-5 h-5 text-primary" />,
                title: "Preppers & Self-Reliance Community",
                desc: "You already stockpile, plan, and take preparedness seriously. Resilium gives you a structured, scored picture of where your gaps still are.",
              },
              {
                icon: <DollarSign className="w-5 h-5 text-primary" />,
                title: "The Financially Anxious",
                desc: "Inflation, job insecurity, and economic volatility are real. Know exactly how many months of runway you have and what to prioritize.",
              },
              {
                icon: <Globe className="w-5 h-5 text-primary" />,
                title: "Expats & Digital Nomads",
                desc: "Living abroad means location risk is real. Assess how your host country, mobility, and support network hold up under pressure.",
              },
              {
                icon: <AlertTriangle className="w-5 h-5 text-primary" />,
                title: "The Quietly Cautious",
                desc: "You don't call yourself a prepper. But the news has you thinking. Resilium gives you a structured, honest starting point — no judgment.",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex gap-3 p-4 rounded-xl border border-border/60 bg-card/40">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">{icon}</div>
                <div>
                  <p className="font-semibold text-sm text-foreground mb-1">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2">
            Resilium is accessible worldwide with currency support for USD, EUR, and RON — with more regions being added.
          </p>
        </Section>

        <Section title="How It Works">
          <p>Resilium follows a three-step process designed to be fast, rigorous, and useful:</p>
          <ol className="list-decimal pl-6 space-y-3">
            <li>
              <strong>Complete the assessment.</strong> A structured set of questions covers your logistical situation (finances, housing, location, health, skills, dependents) and your psychological resilience profile. The assessment takes around 10–15 minutes to complete honestly.
            </li>
            <li>
              <strong>AI analysis.</strong> Your responses are processed by an AI model trained to identify patterns, surface vulnerabilities, and recognize genuine strengths — across both the mental and practical dimensions of resilience.
            </li>
            <li>
              <strong>Receive your personalized resilience plan.</strong> You get a detailed, human-readable report that reflects your specific situation. Not generic tips — a prioritized action plan built around who you are and where you actually are right now.
            </li>
          </ol>
        </Section>

        <Section title="The Assessment Methodology">
          <p>
            Resilium's assessment is built around two interconnected pillars that together determine how well a person can weather disruption.
          </p>
          <p>
            <strong>Mental Resilience dimensions</strong> capture the psychological traits that allow people to stay functional and adaptive under pressure:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Stress Tolerance</strong> — capacity to function under sustained pressure without breakdown</li>
            <li><strong>Adaptability</strong> — willingness and ability to change course when circumstances demand it</li>
            <li><strong>Learning Agility</strong> — speed and openness to acquiring new skills when existing ones become insufficient</li>
            <li><strong>Emotional Regulation</strong> — ability to manage fear, grief, and uncertainty without being paralyzed by them</li>
            <li><strong>Social Connection</strong> — quality and reliability of personal support networks</li>
          </ul>
          <p>
            <strong>Logistics dimensions</strong> capture the concrete, material factors that either cushion disruption or amplify it:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Location</strong> — geographic risk exposure (climate, conflict, infrastructure fragility)</li>
            <li><strong>Finances</strong> — income stability, savings runway, debt exposure</li>
            <li><strong>Health</strong> — physical mobility, medical dependency, access to care</li>
            <li><strong>Housing</strong> — security of tenure and suitability of living situation</li>
            <li><strong>Skills</strong> — practical and transferable capabilities that retain value across scenarios</li>
            <li><strong>Dependents</strong> — responsibilities that increase complexity and resource demands</li>
          </ul>
          <p>
            The interplay between these two pillars is what Resilium's model is designed to map. Strong logistics with fragile psychology leads to rigidity, not resilience. Strong psychology with precarious logistics leads to courage without capacity. Both matter.
          </p>
        </Section>

        <Section title="AI-Powered Analysis">
          <p>
            Generic resilience advice is everywhere. "Build an emergency fund." "Diversify your skills." "Stay connected to your community." These recommendations are true — and useless in isolation, because they ignore the specific constraints and strengths of your situation.
          </p>
          <p>
            Resilium uses AI to generate plans that are genuinely personalized. The model reads your full profile — not just individual answers — and reasons about what matters most for <em>your</em> combination of circumstances. The output is written to be read by a human, not a checklist-ticking machine.
          </p>
          <p>
            Every plan identifies which pathway applies to your situation: a <strong>Growth pathway</strong> (for those who have a stable foundation and should build on it) or a <strong>Compensation pathway</strong> (for those who have critical gaps that need to be addressed before anything else). Both are constructive — one accelerates momentum, the other creates it where it's missing.
          </p>
        </Section>

        <Section title="Privacy by Design">
          <p>
            Resilium was built from day one with privacy as a core constraint, not an afterthought.
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>No name or email address is collected as part of the assessment.</li>
            <li>Your data is never sold, rented, or shared with third parties for commercial purposes.</li>
            <li>Assessment data is automatically deleted after 12 months.</li>
            <li>The platform is fully GDPR-compliant and you retain all rights to your data.</li>
          </ul>
          <p>
            You can read the full details in the{" "}
            <Link href="/privacy" className="text-primary underline underline-offset-4 hover:text-primary/80">
              Privacy Policy
            </Link>
            .
          </p>
        </Section>

        <Section title="About the Project">
          <p>
            Resilium is independently operated — not a startup, not a VC-backed company, not a data broker wearing a wellness brand as a mask. The platform exists because the problem is real, the tools to address it are scattered and generic, and privacy-respecting alternatives to the surveillance-funded wellness industry are in short supply.
          </p>
          <p>
            The project is mission-driven: to help ordinary people make honest assessments of their vulnerability and take meaningful steps before a crisis forces their hand.
          </p>
          <p>
            Questions, feedback, or concerns? Reach out at:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-4 hover:text-primary/80">
              {CONTACT_EMAIL}
            </a>
          </p>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-display font-bold">{title}</h2>
      <div className="space-y-3 text-foreground/80 leading-relaxed [&_strong]:text-foreground [&_strong]:font-semibold">
        {children}
      </div>
    </section>
  );
}
