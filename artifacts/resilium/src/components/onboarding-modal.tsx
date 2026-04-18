import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  X, Shield, Brain, TrendingUp,
  DollarSign, Heart, Wrench, Navigation, Package,
  ChevronRight, ChevronLeft,
} from "lucide-react";

const STORAGE_KEY = "resilium_welcomed_v2";

const DIMENSIONS = [
  {
    icon: DollarSign,
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    key: "Financial",
    desc: "Emergency funds, income stability, debt exposure.",
  },
  {
    icon: Heart,
    color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    key: "Health",
    desc: "Medical access, medication supply, physical readiness.",
  },
  {
    icon: Wrench,
    color: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    key: "Skills",
    desc: "Marketable abilities, adaptability, practical know-how.",
  },
  {
    icon: Navigation,
    color: "text-violet-400 bg-violet-400/10 border-violet-400/20",
    key: "Mobility",
    desc: "Documents, evacuation plans, geographic flexibility.",
  },
  {
    icon: Brain,
    color: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    key: "Psychological",
    desc: "Stress tolerance, mindset, social support networks.",
  },
  {
    icon: Package,
    color: "text-teal-400 bg-teal-400/10 border-teal-400/20",
    key: "Resources",
    desc: "Food, water, supplies, community connections.",
  },
];

export function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const timer = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(13,18,37,0.85)", backdropFilter: "blur(6px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl p-8 shadow-2xl"
        style={{ background: "#131929", border: "1px solid rgba(224,128,64,0.25)" }}
      >
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 p-1 rounded-lg transition-colors hover:bg-white/5"
          style={{ color: "#8A7A6A" }}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-7">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? 20 : 8,
                height: 8,
                background: i === step ? "#E08040" : "rgba(224,128,64,0.22)",
              }}
            />
          ))}
        </div>

        {/* ── Step 0: Welcome ──────────────────────────────────── */}
        {step === 0 && (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(224,128,64,0.15)" }}
              >
                <Shield className="w-5 h-5" style={{ color: "#E08040" }} />
              </div>
              <div>
                <p
                  className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: "#E08040", letterSpacing: "0.16em" }}
                >
                  Welcome to Resilium
                </p>
                <h2 className="text-xl font-black leading-tight" style={{ color: "#EAD9BE" }}>
                  Know how ready you really are.
                </h2>
              </div>
            </div>

            <p className="text-sm leading-relaxed mb-7" style={{ color: "#b8a99a" }}>
              Resilience isn't just about emergency kits. It's a measurable state across six dimensions of your life — and you can score it today.
            </p>

            <div className="space-y-3 mb-7">
              {[
                { icon: Brain, text: "A 5-minute assessment across 6 resilience dimensions." },
                { icon: Shield, text: "An AI-generated score out of 100 with your key vulnerabilities." },
                { icon: TrendingUp, text: "A personalized action plan you actually work through over time." },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "rgba(224,128,64,0.12)" }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: "#E08040" }} />
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "#b8a99a" }}>
                    {text}
                  </p>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              className="w-full rounded-full font-bold"
              style={{ background: "#E08040", color: "#0D1225" }}
              onClick={() => setStep(1)}
            >
              See How It Works <ChevronRight className="ml-1 w-4 h-4 inline-block" />
            </Button>
            <button
              onClick={dismiss}
              className="w-full text-sm text-center mt-3 transition-colors"
              style={{ color: "#8A7A6A" }}
            >
              Skip — take me straight to the assessment
            </button>
          </>
        )}

        {/* ── Step 1: 6 Dimensions ─────────────────────────────── */}
        {step === 1 && (
          <>
            <div className="mb-5">
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-1"
                style={{ color: "#E08040", letterSpacing: "0.16em" }}
              >
                What We Measure
              </p>
              <h2 className="text-xl font-black" style={{ color: "#EAD9BE" }}>
                The 6 Dimensions
              </h2>
              <p className="text-sm mt-1" style={{ color: "#8A7A6A" }}>
                Your score is calculated across these areas, weighted to your situation.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-6">
              {DIMENSIONS.map(({ icon: Icon, color, key, desc }) => (
                <div
                  key={key}
                  className="rounded-xl p-3 border"
                  style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(224,128,64,0.12)" }}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 border ${color}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs font-bold mb-1" style={{ color: "#EAD9BE" }}>
                    {key}
                  </p>
                  <p className="text-xs leading-snug" style={{ color: "#8A7A6A" }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                size="icon"
                variant="outline"
                className="rounded-full flex-shrink-0"
                style={{ borderColor: "rgba(224,128,64,0.3)", color: "#8A7A6A", background: "transparent" }}
                onClick={() => setStep(0)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                className="flex-1 rounded-full font-bold"
                style={{ background: "#E08040", color: "#0D1225" }}
                onClick={() => setStep(2)}
              >
                Continue <ChevronRight className="ml-1 w-4 h-4 inline-block" />
              </Button>
            </div>
            <button
              onClick={dismiss}
              className="w-full text-sm text-center mt-3 transition-colors"
              style={{ color: "#8A7A6A" }}
            >
              Skip
            </button>
          </>
        )}

        {/* ── Step 2: CTA ──────────────────────────────────────── */}
        {step === 2 && (
          <>
            <div className="text-center mb-7">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: "rgba(224,128,64,0.15)" }}
              >
                <Shield className="w-8 h-8" style={{ color: "#E08040" }} />
              </div>
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-2"
                style={{ color: "#E08040", letterSpacing: "0.16em" }}
              >
                Ready to begin
              </p>
              <h2 className="text-xl font-black mb-3" style={{ color: "#EAD9BE" }}>
                Your personalized plan awaits.
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "#b8a99a" }}>
                5 minutes. Get your score, your gaps, and a clear action plan tailored to your location and life stage.
              </p>
            </div>

            <div className="flex gap-3 mb-3">
              <Button
                size="icon"
                variant="outline"
                className="rounded-full flex-shrink-0"
                style={{ borderColor: "rgba(224,128,64,0.3)", color: "#8A7A6A", background: "transparent" }}
                onClick={() => setStep(1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Link href="/assess" onClick={dismiss} className="flex-1">
                <Button
                  size="lg"
                  className="w-full rounded-full font-bold"
                  style={{ background: "#E08040", color: "#0D1225" }}
                >
                  Start Free Assessment
                </Button>
              </Link>
            </div>
            <button
              onClick={dismiss}
              className="w-full text-sm text-center transition-colors"
              style={{ color: "#8A7A6A" }}
            >
              Maybe later
            </button>
          </>
        )}
      </div>
    </div>
  );
}
