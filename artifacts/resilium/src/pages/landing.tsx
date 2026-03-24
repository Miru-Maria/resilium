import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ShieldCheck, TrendingUp, Activity, ArrowRight } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background Hero Image with Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={`${import.meta.env.BASE_URL}images/hero-abstract.png`}
          alt="Abstract calming gradients"
          className="w-full h-full object-cover opacity-60 mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background"></div>
      </div>

      <header className="w-full py-6 px-6 lg:px-12 z-10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-primary">Resilium</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors hidden sm:block">
            Privacy Policy
          </Link>
          <Link href="/assess">
            <Button variant="outline" className="rounded-full px-6 border-primary/20 hover:bg-primary/5 font-medium">
              Log In
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center z-10 max-w-4xl mx-auto pt-12 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/30 text-primary mb-8 border border-secondary/50 backdrop-blur-sm">
            <Activity className="w-4 h-4" />
            <span className="text-sm font-semibold uppercase tracking-wider">AI-Powered Risk Assessment</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-foreground leading-[1.1] mb-6">
            You're one disruption away from <span className="text-muted-foreground/50 italic">chaos</span>. <br />
            Check your <span className="text-primary relative whitespace-nowrap">
              readiness.
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-secondary" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
              </svg>
            </span>
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

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-3xl border-t border-border/60 pt-12"
        >
          <div className="flex flex-col items-center">
            <span className="text-4xl font-display font-bold text-primary mb-2">360°</span>
            <span className="text-sm text-muted-foreground">Holistic Risk Profiling</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-display font-bold text-primary mb-2">1M+</span>
            <span className="text-sm text-muted-foreground">Scenarios Simulated</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-display font-bold text-primary mb-2">100%</span>
            <span className="text-sm text-muted-foreground">Personalized Action Plans</span>
          </div>
        </motion.div>
      </main>

      <SiteFooter />
    </div>
  );
}
