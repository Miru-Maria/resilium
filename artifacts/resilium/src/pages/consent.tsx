import { useState } from "react";
import { useLocation } from "wouter";
import { NoIndexPage } from "@/components/page-seo";
import { Shield, Lock, MapPin, DollarSign, Activity, Wrench, Home, AlertTriangle, Clock, EyeOff, Download, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const CONSENT_VERSION = "1.0";
const SESSION_KEY = "resilium_session_id";

const DATA_POINTS = [
  { Icon: MapPin,       label: "Geographic location (country/region)" },
  { Icon: DollarSign,   label: "Financial situation (income, savings)" },
  { Icon: Activity,     label: "Health & mobility level" },
  { Icon: Wrench,       label: "Skills & capabilities" },
  { Icon: Home,         label: "Housing situation" },
  { Icon: AlertTriangle,label: "Risk concerns & priorities" },
];

const INFO_CARDS = [
  {
    Icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    title: "Data Retention",
    desc: "Your assessment data is retained for 12 months, then automatically deleted.",
  },
  {
    Icon: EyeOff,
    color: "text-primary",
    bg: "bg-primary/10",
    title: "No Selling of Data",
    desc: "Your personal data is never sold or shared with third parties for marketing.",
  },
  {
    Icon: Download,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    title: "Your Rights",
    desc: "You can export or delete your data at any time from the My Data page.",
  },
];

function generateSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function ConsentPage() {
  const [, setLocation] = useLocation();
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      let sessionId = localStorage.getItem(SESSION_KEY);
      if (!sessionId) {
        sessionId = generateSessionId();
        localStorage.setItem(SESSION_KEY, sessionId);
      }

      try {
        await fetch("/api/gdpr/consent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            platform: "web",
            consentVersion: CONSENT_VERSION,
          }),
        });
      } catch {
        // Non-blocking — consent is stored locally even if the API call fails
      }

      sessionStorage.setItem("resilium_consent_given", "1");
      setLocation("/assess");
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NoIndexPage />
      <header className="flex items-center justify-between px-5 py-4 border-b border-border/40">
        <button
          onClick={() => setLocation("/")}
          className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Go back"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5">
          <Shield className="w-3 h-3 text-primary" />
          <span className="text-xs font-semibold text-primary">GDPR Compliant</span>
        </div>
        <div className="w-9" />
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-5 py-8 space-y-6">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Your Privacy Matters</h1>
            <p className="text-muted-foreground leading-relaxed">
              Before analyzing your resilience, your informed consent is needed to collect and process the following personal data.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">What is collected</p>
            {DATA_POINTS.map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm text-foreground">{label}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2.5">
            {INFO_CARDS.map(({ Icon, color, bg, title, desc }) => (
              <div key={title} className="flex items-start gap-3 bg-card border border-border rounded-xl p-4">
                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0 mt-0.5`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-card/60 border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              By accepting, you consent to the processing of your data as described above, in accordance with{" "}
              <strong className="text-foreground/70">GDPR Article 6(1)(a)</strong>. A unique session ID will be
              generated and stored locally in your browser to link your data to any future requests.
            </p>
          </div>

          <p className="text-center text-xs text-muted-foreground/60">
            Consent version {CONSENT_VERSION} · {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="sticky bottom-0 bg-background border-t border-border/60 px-5 py-4 space-y-2.5">
        <Button
          size="lg"
          className="w-full gap-2 text-base font-semibold"
          onClick={handleAccept}
          disabled={isAccepting}
        >
          <CheckCircle2 className="w-5 h-5" />
          {isAccepting ? "Saving…" : "Accept & Continue"}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="lg" className="w-full text-muted-foreground hover:text-foreground">
              Decline
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>No Data Collected</AlertDialogTitle>
              <AlertDialogDescription>
                If you decline, no personalized resilience report can be generated. No data will be stored.
                You can return at any time to accept.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => setLocation("/")}
              >
                Decline & Exit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
