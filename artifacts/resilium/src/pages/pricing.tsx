import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, Zap, ShieldCheck, BarChart2, RefreshCw, Lock, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { ResilientIcon } from "@/components/resilient-icon";
import { useAuth } from "@workspace/replit-auth-web";

const PADDLE_CLIENT_TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN as string | undefined;
const PADDLE_PRICE_ID = import.meta.env.VITE_PADDLE_PRICE_ID as string | undefined;

declare global {
  interface Window {
    Paddle?: any;
  }
}

function usePaddle() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!PADDLE_CLIENT_TOKEN) return;
    if (window.Paddle) {
      setReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;
    script.onload = () => {
      window.Paddle?.Initialize({ token: PADDLE_CLIENT_TOKEN });
      setReady(true);
    };
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  return ready;
}

const FREE_FEATURES = [
  "2 full assessments",
  "Personalised resilience score",
  "Personalised action plan",
  "PDF export",
  "GDPR-compliant data handling",
];

const PRO_FEATURES = [
  "Unlimited assessments",
  "Full progress tracking & charts",
  "Scenario simulations",
  "Mental resilience deep-dive",
  "Plan comparison & AI analysis",
  "Priority support",
];

export default function PricingPage() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, login } = useAuth();
  const paddleReady = usePaddle();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = () => {
    if (!isAuthenticated) {
      login();
      return;
    }
    if (!PADDLE_PRICE_ID || !window.Paddle) {
      alert("Payment system is not configured yet. Please check back soon.");
      return;
    }
    setLoading(true);
    window.Paddle.Checkout.open({
      items: [{ priceId: PADDLE_PRICE_ID, quantity: 1 }],
      customData: { userId: (user as any)?.id ?? "" },
      successUrl: `${window.location.origin}${import.meta.env.BASE_URL}pricing?success=1`,
    });
    setLoading(false);
  };

  const isSuccess = new URLSearchParams(window.location.search).get("success") === "1";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full px-6 py-5 flex items-center justify-between border-b border-border/40">
        <Link href="/">
          <span className="flex items-center gap-2 cursor-pointer">
            <ResilientIcon className="w-7 h-7" />
            <span className="font-display font-bold text-xl text-primary">Resilium</span>
          </span>
        </Link>
        {isAuthenticated ? (
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="rounded-full">My Profile</Button>
          </Link>
        ) : (
          <Button variant="ghost" size="sm" className="rounded-full" onClick={login}>Sign In</Button>
        )}
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-16">
        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24"
          >
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-3">You're all set!</h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Your Pro subscription is now active. Start as many assessments as you like.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/assess">
                <Button className="rounded-full gap-2">
                  Start an Assessment <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" className="rounded-full">View My Profile</Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-14"
            >
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 rounded-full px-4 py-1.5 mb-6">
                <Sparkles className="w-3.5 h-3.5" /> Simple Pricing
              </span>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Know exactly where you stand
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Start with two full assessments at no cost. Upgrade for unlimited access and full progress tracking.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {/* Free tier */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-border bg-card p-8 flex flex-col"
              >
                <div className="mb-6">
                  <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">Starter</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-display font-bold">$0</span>
                    <span className="text-muted-foreground mb-1">/forever</span>
                  </div>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {FREE_FEATURES.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/assess">
                  <Button variant="outline" className="w-full rounded-full">
                    Start a free assessment
                  </Button>
                </Link>
              </motion.div>

              {/* Pro tier */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border-2 border-primary/50 bg-primary/5 p-8 flex flex-col relative overflow-hidden"
              >
                <div className="absolute top-4 right-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/15 rounded-full px-2.5 py-1">
                    Most Popular
                  </span>
                </div>
                <div className="mb-6">
                  <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Pro</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-display font-bold text-primary">$9</span>
                    <span className="text-muted-foreground mb-1">/month</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Cancel anytime</p>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {PRO_FEATURES.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="font-medium">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full rounded-full gap-2 shadow-lg shadow-primary/20"
                  onClick={handleUpgrade}
                  disabled={loading}
                >
                  <Zap className="w-4 h-4" />
                  {!isAuthenticated ? "Sign in to upgrade" : "Upgrade to Pro"}
                </Button>
                {!isAuthenticated && (
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    You'll be asked to create a free account first
                  </p>
                )}
              </motion.div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto">
              {[
                { icon: ShieldCheck, label: "GDPR Compliant" },
                { icon: Lock, label: "Secure Payments" },
                { icon: RefreshCw, label: "Cancel Anytime" },
                { icon: BarChart2, label: "Real-time Analytics" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/30 text-center">
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
