import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  LogIn,
  User,
  Shield,
  Brain,
  MapPin,
  TrendingUp,
  CheckCircle2,
  Lock,
  ChevronRight,
  Zap,
  AlertTriangle,
  Backpack,
  Globe,
  DollarSign,
} from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { useAuth } from "@workspace/replit-auth-web";
import { ResilientIcon } from "@/components/resilient-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function AnimatedBackground() {
  return (
    <>
      <style>{`
        @keyframes blob-drift-1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33%       { transform: translate(60px, -40px) scale(1.06); }
          66%       { transform: translate(-30px, 50px) scale(0.95); }
        }
        @keyframes blob-drift-2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          40%       { transform: translate(-70px, 50px) scale(1.08); }
          70%       { transform: translate(40px, -30px) scale(0.96); }
        }
        @keyframes blob-drift-3 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50%       { transform: translate(50px, 40px) scale(1.04); }
        }
        @keyframes blob-drift-4 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          30%       { transform: translate(-40px, -50px) scale(1.1); }
          60%       { transform: translate(60px, 20px) scale(0.93); }
        }
        @keyframes blob-drift-5 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          45%       { transform: translate(30px, -60px) scale(1.07); }
        }
        .blob { position: absolute; border-radius: 50%; filter: blur(80px); }
        .blob-1 { animation: blob-drift-1 18s ease-in-out infinite; }
        .blob-2 { animation: blob-drift-2 22s ease-in-out infinite; }
        .blob-3 { animation: blob-drift-3 15s ease-in-out infinite; }
        .blob-4 { animation: blob-drift-4 26s ease-in-out infinite; }
        .blob-5 { animation: blob-drift-5 20s ease-in-out infinite; }
      `}</style>

      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle, rgba(224,128,64,0.12) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      {/* Gradient orbs */}
      <div className="blob blob-1" style={{
        width: 700, height: 700,
        top: "-15%", left: "-10%",
        background: "radial-gradient(circle at 40% 40%, rgba(224,128,64,0.18) 0%, rgba(200,110,40,0.08) 50%, transparent 70%)",
      }} />
      <div className="blob blob-2" style={{
        width: 600, height: 600,
        top: "-5%", right: "-8%",
        background: "radial-gradient(circle at 60% 40%, rgba(30,50,120,0.35) 0%, rgba(15,25,80,0.15) 55%, transparent 75%)",
      }} />
      <div className="blob blob-3" style={{
        width: 500, height: 500,
        bottom: "10%", left: "20%",
        background: "radial-gradient(circle at 50% 50%, rgba(180,100,30,0.12) 0%, transparent 65%)",
      }} />
      <div className="blob blob-4" style={{
        width: 380, height: 380,
        top: "35%", right: "15%",
        background: "radial-gradient(circle at 50% 50%, rgba(224,128,64,0.10) 0%, transparent 65%)",
      }} />
      <div className="blob blob-5" style={{
        width: 300, height: 300,
        bottom: "5%", right: "5%",
        background: "radial-gradient(circle at 50% 50%, rgba(50,80,160,0.20) 0%, transparent 65%)",
      }} />

      {/* Fade-to-background at bottom so content sections look clean */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "linear-gradient(to bottom, transparent 0%, transparent 50%, var(--background) 100%)",
      }} />
    </>
  );
}

export default function LandingPage() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <AnimatedBackground />
      </div>

      {/* Header */}
      <header className="w-full py-6 px-6 lg:px-12 z-10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ResilientIcon className="w-7 h-7" />
          <span className="font-display font-bold text-xl tracking-tight text-primary">Resilium</span>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors hidden sm:block">
            About
          </Link>
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors hidden sm:block">
            Privacy Policy
          </Link>

          {!isLoading && isAuthenticated && (
            <Link href="/profile">
              <Button variant="ghost" className="rounded-full px-4 font-medium text-sm">
                My Plans
              </Button>
            </Link>
          )}

          {isLoading ? (
            <div className="w-24 h-9 rounded-full bg-muted animate-pulse" />
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-full px-4 border-primary/20 hover:bg-primary/5 font-medium flex items-center gap-2">
                  {user?.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt={user.firstName || "User"}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  <span className="max-w-[100px] truncate">{user?.firstName || "Account"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">My Plans</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer">Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="outline"
              className="rounded-full px-6 border-primary/20 hover:bg-primary/5 font-medium flex items-center gap-2"
              onClick={login}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
          )}
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center z-10">
        <div className="flex flex-col items-center text-center px-6 pt-12 pb-20 max-w-4xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/30 text-primary mb-8 border border-secondary/50 backdrop-blur-sm">
              <Brain className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-wider">AI-Powered Risk Assessment</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-foreground leading-[1.1] mb-6">
              You're one disruption away from{" "}
              <span className="text-rose-400 italic">chaos</span>.<br />
              Check your{" "}
              <span className="text-primary whitespace-nowrap font-extrabold">readiness.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Resilium analyzes your financial stability, skills, health, and location to build a personalized action plan for life's unpredictable moments.
            </p>

            <Link href="/assess">
              <Button size="lg" className="rounded-full h-16 px-10 text-lg font-semibold shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300">
                Get My Resilience Plan
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-2"><Lock className="w-4 h-4 text-primary" /> No email required</span>
            <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Your data is never sold</span>
            <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Results in under 15 minutes</span>
          </motion.div>
        </div>

        {/* How it works */}
        <section className="w-full bg-card/40 border-y border-border/60 py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary text-center mb-3">The Process</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-14">How it works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  icon: <Brain className="w-7 h-7 text-primary" />,
                  title: "Answer the assessment",
                  desc: "10–15 minutes of honest questions covering your finances, location, health, practical skills, housing situation, and psychological resilience under pressure.",
                },
                {
                  step: "02",
                  icon: <Zap className="w-7 h-7 text-primary" />,
                  title: "AI builds your profile",
                  desc: "Your answers are scored across six risk dimensions and fed to an AI that reasons about your specific vulnerabilities — not generic advice lifted from a checklist.",
                },
                {
                  step: "03",
                  icon: <CheckCircle2 className="w-7 h-7 text-primary" />,
                  title: "Get your action plan",
                  desc: "A full resilience report lands immediately: your score, your gaps, and a prioritized action plan broken into 30-day, 6-month, and long-term phases.",
                },
              ].map(({ step, icon, title, desc }) => (
                <div key={step} className="relative flex flex-col gap-4 p-6 rounded-2xl bg-background border border-border/60">
                  <span className="text-xs font-bold text-primary/40 tracking-widest">{step}</span>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">{icon}</div>
                  <h3 className="font-display font-bold text-lg">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who it's for */}
        <section className="w-full py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary text-center mb-3">Who Uses Resilium</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-4">Built for people who prepare, not people who panic</h2>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-14">
              Resilium is used by people who take personal security seriously — wherever they are in the world.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  icon: <Backpack className="w-6 h-6 text-primary" />,
                  title: "Preppers & Self-Reliance Community",
                  desc: "You already stockpile, plan, and take preparedness seriously. Resilium gives you an honest, scored picture of where your gaps still are — and what to fix first.",
                },
                {
                  icon: <DollarSign className="w-6 h-6 text-primary" />,
                  title: "The Financially Anxious",
                  desc: "Job insecurity, inflation, and economic volatility are real. Find out exactly how many months of runway you have — and what would happen if you lost your income tomorrow.",
                },
                {
                  icon: <Globe className="w-6 h-6 text-primary" />,
                  title: "Expats & Digital Nomads",
                  desc: "Living internationally means location risk is real. Assess how your country of residence, mobility, and support network hold up when things go sideways.",
                },
                {
                  icon: <AlertTriangle className="w-6 h-6 text-primary" />,
                  title: "The Quietly Cautious",
                  desc: "You don't call yourself a prepper. But the news has you thinking. Resilium gives you a structured, honest starting point — no judgment, no extreme ideology.",
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex gap-4 p-6 rounded-2xl border border-border/60 bg-card/40 hover:border-primary/30 transition-colors">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">{icon}</div>
                  <div>
                    <h3 className="font-display font-semibold mb-2">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What you'll get */}
        <section className="w-full bg-card/40 border-y border-border/60 py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary text-center mb-3">Your Report</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-14">What you'll walk away with</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  icon: <TrendingUp className="w-5 h-5 text-primary" />,
                  title: "Your Resilience Score",
                  desc: "A 0–100 composite score across six dimensions: Financial, Health, Skills, Mobility, Psychological, and Resources.",
                },
                {
                  icon: <CheckCircle2 className="w-5 h-5 text-primary" />,
                  title: "Prioritized Action Plan",
                  desc: "30-day, 6-month, and long-term tasks — ordered by criticality for your specific situation, not a generic checklist.",
                },
                {
                  icon: <Brain className="w-5 h-5 text-primary" />,
                  title: "Mental Resilience Profile",
                  desc: "A deep psychological assessment identifying your Growth or Compensation pathway and what it means for your planning.",
                },
                {
                  icon: <AlertTriangle className="w-5 h-5 text-primary" />,
                  title: "Scenario Stress Tests",
                  desc: "AI-generated simulations of your top risks — job loss, supply chain failure, natural disaster — with your personal impact and recovery timeline.",
                },
                {
                  icon: <MapPin className="w-5 h-5 text-primary" />,
                  title: "Location Risk Analysis",
                  desc: "How your geography affects your vulnerability — climate exposure, political stability, infrastructure resilience.",
                },
                {
                  icon: <Shield className="w-5 h-5 text-primary" />,
                  title: "Daily Resilience Habits",
                  desc: "Recurring actions tailored to your profile that, compounded over time, move you from vulnerable to prepared.",
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="p-5 rounded-2xl border border-border/60 bg-background hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">{icon}</div>
                    <h3 className="font-semibold text-sm">{title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Privacy promise */}
        <section className="w-full py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">Private by design</h2>
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto">
              No name. No email. No tracking pixels. Your assessment data is stored securely and automatically deleted after 12 months. We don't sell your data — ever. Read our{" "}
              <Link href="/privacy" className="text-primary underline underline-offset-4 hover:text-primary/80">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="w-full bg-primary/5 border-t border-primary/10 py-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Ready to find out where you stand?</h2>
            <p className="text-muted-foreground mb-8">Free. No account required. Takes 10–15 minutes.</p>
            <Link href="/assess">
              <Button size="lg" className="rounded-full h-14 px-10 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300">
                Start the Assessment
                <ChevronRight className="ml-1 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
