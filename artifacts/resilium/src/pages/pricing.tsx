import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, Zap, ShieldCheck, BarChart2, RefreshCw, Lock, ArrowRight, Sparkles, XCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { ResilientIcon } from "@/components/resilient-icon";
import { useAuth } from "@workspace/replit-auth-web";

const PADDLE_CLIENT_TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN as string | undefined;
const PADDLE_PRICE_ID_MONTHLY = import.meta.env.VITE_PADDLE_PRICE_ID as string | undefined;
const PADDLE_PRICE_ID_ANNUAL = import.meta.env.VITE_PADDLE_PRICE_ID_ANNUAL as string | undefined;

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
  "2 lifetime assessments",
  "Full resilience score — all 6 dimensions",
  "AI-generated action plan",
  "Mental resilience profile",
  "PDF export",
  "GDPR-compliant data handling",
];

const FREE_LIMITS = [
  "No score history or trend tracking",
  "No plan comparison between assessments",
  "No scenario stress-testing",
  "Reports archived after 12 months",
];

const PRO_FEATURES = [
  "Everything in Starter",
  "Unlimited assessments",
  "Score history & trend charts",
  "AI plan comparison — what changed and why",
  "Scenario stress-tests: job loss, relocation, disaster",
  "Reports stored indefinitely",
  "Priority support",
];

const FAQ_ITEMS = [
  {
    q: "Can I cancel my subscription at any time?",
    a: "Yes. Cancel any time from your account settings or by contacting us. You keep Pro access until the end of your current billing period — no charges after that.",
  },
  {
    q: "What happens to my data if I cancel?",
    a: "Your reports and data are retained for 12 months after cancellation, giving you time to export or review them. You can also request full deletion at any time via the GDPR tools in your profile.",
  },
  {
    q: "What happens to free (Starter) plans?",
    a: "Starter accounts are never deleted automatically. Your 2 assessments and reports remain accessible. Reports are archived after 12 months, but you can download PDFs before then.",
  },
  {
    q: "Is my assessment data private?",
    a: "Yes. Your data is never sold to third parties. It is used only to generate your report and improve the platform's accuracy using anonymised aggregated statistics. Full details are in our Privacy Policy.",
  },
  {
    q: "How is payment handled?",
    a: "Payments are processed securely by Paddle, our authorised merchant of record. Your card details are never stored by Resilium — Paddle handles all billing and payment compliance.",
  },
  {
    q: "Can I get a refund?",
    a: "Yes — we offer a 14-day full refund on your initial subscription purchase. See our Refund Policy for full details.",
  },
  {
    q: "What are the scenario stress-tests in Pro?",
    a: "Pro users can run \"what if\" scenarios — for example, \"What if I lost my job next week?\" or \"What if I had to relocate urgently?\" The AI recalculates your resilience score under those conditions and shows your gap areas and recommended responses, without requiring a new full assessment.",
  },
  {
    q: "How is Resilium different from generic advice online?",
    a: "Generic resilience advice is one-size-fits-all. Resilium scores your specific situation across six dimensions — your financial runway, your skills, your location risk, your health, your housing, and your psychological resilience — and generates recommendations specific to your profile, not a generic checklist.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 font-medium text-sm hover:bg-muted/30 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <span>{q}</span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border/60 pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

type BillingPeriod = "monthly" | "annual";

export default function PricingPage() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, login } = useAuth();
  const paddleReady = usePaddle();
  const [loading, setLoading] = useState(false);
  const [billing, setBilling] = useState<BillingPeriod>("monthly");

  const isAnnual = billing === "annual";
  const priceId = isAnnual ? PADDLE_PRICE_ID_ANNUAL : PADDLE_PRICE_ID_MONTHLY;

  const handleUpgrade = () => {
    if (!isAuthenticated) {
      login();
      return;
    }
    if (!priceId || !window.Paddle) {
      alert("Payment system is not configured yet. Please check back soon.");
      return;
    }
    setLoading(true);
    window.Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customData: { userId: (user as any)?.id ?? "" },
      successUrl: `${window.location.origin}${import.meta.env.BASE_URL}pricing?success=1`,
    });
    setLoading(false);
  };

  const isSuccess = new URLSearchParams(window.location.search).get("success") === "1";

  return (
    <div className="min-h-screen flex flex-col">
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
              className="text-center mb-10"
            >
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 rounded-full px-4 py-1.5 mb-6">
                <Sparkles className="w-3.5 h-3.5" /> Simple Pricing
              </span>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Know exactly where you stand
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
                Start with two full assessments at no cost. Upgrade for unlimited access and full progress tracking.
              </p>

              {/* Billing toggle */}
              <div className="inline-flex items-center gap-1 bg-muted/40 border border-border rounded-full p-1">
                <button
                  onClick={() => setBilling("monthly")}
                  className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
                    !isAnnual
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBilling("annual")}
                  className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    isAnnual
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Annual
                  <span className="text-[10px] font-bold uppercase tracking-wide text-green-500 bg-green-500/10 rounded-full px-2 py-0.5">
                    Save 27%
                  </span>
                </button>
              </div>
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
                <ul className="space-y-3 flex-1 mb-4">
                  {FREE_FEATURES.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <ul className="space-y-2 mb-8 border-t border-border/60 pt-4">
                  {FREE_LIMITS.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <XCircle className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
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
                key={billing}
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
                  {isAnnual ? (
                    <>
                      <div className="flex items-end gap-1">
                        <span className="text-4xl font-display font-bold text-primary">$79</span>
                        <span className="text-muted-foreground mb-1">/year</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        ~$6.58/mo · <span className="text-green-500 font-medium">$29 cheaper than monthly</span>
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-end gap-1">
                        <span className="text-4xl font-display font-bold text-primary">$9</span>
                        <span className="text-muted-foreground mb-1">/month</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Cancel anytime</p>
                    </>
                  )}
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
                  {!isAuthenticated
                    ? "Sign in to upgrade"
                    : isAnnual
                    ? "Get Pro — Annual"
                    : "Get Pro — Monthly"}
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
                { icon: BarChart2, label: "Progress Tracking" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/30 text-center">
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>

            {/* FAQ */}
            <div className="mt-20 max-w-2xl mx-auto">
              <h2 className="text-2xl font-display font-bold text-center mb-8">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {FAQ_ITEMS.map(({ q, a }) => (
                  <FaqItem key={q} q={q} a={a} />
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
