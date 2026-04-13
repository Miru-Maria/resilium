import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { X, Shield, Brain, TrendingUp, Zap } from "lucide-react";

const STORAGE_KEY = "resilium_welcomed_v1";

export function OnboardingModal() {
  const [open, setOpen] = useState(false);

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
      style={{ background: "rgba(13,18,37,0.82)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
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

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
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
            <h2
              className="text-xl font-black leading-tight"
              style={{ color: "#EAD9BE" }}
            >
              Know how ready you really are.
            </h2>
          </div>
        </div>

        {/* Bullets */}
        <div className="space-y-4 mb-8">
          {[
            { icon: Brain, text: "Take a 5-minute assessment across 6 resilience dimensions — financial, health, skills, mobility, psychological, and resources." },
            { icon: Zap, text: "Get an AI-generated score out of 100, your top vulnerabilities, and a personalized action plan." },
            { icon: TrendingUp, text: "Track your progress over time and stress-test your readiness against real crisis scenarios." },
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

        {/* CTA */}
        <div className="flex flex-col gap-3">
          <Link href="/assess" onClick={dismiss}>
            <Button
              size="lg"
              className="w-full rounded-full font-bold"
              style={{ background: "#E08040", color: "#0D1225" }}
            >
              Start Your Free Assessment
            </Button>
          </Link>
          <button
            onClick={dismiss}
            className="text-sm text-center transition-colors"
            style={{ color: "#8A7A6A" }}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
