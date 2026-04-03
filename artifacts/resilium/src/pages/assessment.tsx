import React, { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useSubmitAssessment } from "@workspace/api-client-react";
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Brain, Zap, Lock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { SiteFooter } from "@/components/site-footer";
import { useAuth } from "@workspace/replit-auth-web";

const FREE_LIMIT = 3;
const ANON_COUNT_KEY = "resilium_free_count";
const SESSION_KEY = "resilium_session_id";

import type { 
  AssessmentInput,
  AssessmentInputAgeBracket,
  AssessmentInputIncomeStability,
  AssessmentInputHealthStatus,
  AssessmentInputMobilityLevel,
  AssessmentInputHousingType,
  AssessmentInputRiskConcernsItem,
  AssessmentInputSkillsItem,
  MentalResilienceAnswers
} from "@workspace/api-client-react/src/generated/api.schemas";

// Steps:
// 1 = Location + Currency
// 2 = Age Bracket
// 3 = Income Stability
// 4 = Mental Resilience (10 sub-steps) ← after 3 factual steps
// 5 = Financial Runway (savings)
// 6 = Dependents
// 7 = Skills
// 8 = Health & Mobility
// 9 = Housing
// 10 = Emergency Supplies
// 11 = Risk Profile (submit triggered at end)
const TOTAL_STEPS = 11;
const MR_STEP = 4;

type MentalResilienceQuestion = {
  key: keyof MentalResilienceAnswers;
  dimension: string;
  question: string;
  lowLabel: string;
  highLabel: string;
};

const MR_QUESTIONS: MentalResilienceQuestion[] = [
  {
    key: "stressTolerance1",
    dimension: "Stress Tolerance",
    question: "When facing an unexpected crisis, I remain calm and think clearly under pressure.",
    lowLabel: "Rarely",
    highLabel: "Almost always",
  },
  {
    key: "stressTolerance2",
    dimension: "Stress Tolerance",
    question: "I recover quickly after a stressful event and return to normal functioning.",
    lowLabel: "Rarely",
    highLabel: "Almost always",
  },
  {
    key: "adaptability1",
    dimension: "Adaptability",
    question: "I adjust my plans smoothly when circumstances change unexpectedly.",
    lowLabel: "Rarely",
    highLabel: "Almost always",
  },
  {
    key: "adaptability2",
    dimension: "Adaptability",
    question: "I find it easy to embrace new routines or environments.",
    lowLabel: "Strongly disagree",
    highLabel: "Strongly agree",
  },
  {
    key: "learningAgility1",
    dimension: "Learning New Things",
    question: "I actively seek out new skills or knowledge when I notice a gap in my preparedness.",
    lowLabel: "Rarely",
    highLabel: "Very often",
  },
  {
    key: "changeManagement1",
    dimension: "Handling Change",
    question: "I plan ahead for major life changes rather than reacting after the fact.",
    lowLabel: "Strongly disagree",
    highLabel: "Strongly agree",
  },
  {
    key: "changeManagement2",
    dimension: "Handling Change",
    question: "I feel confident dealing with big uncertain situations like economic shifts or political instability.",
    lowLabel: "Not at all",
    highLabel: "Very confident",
  },
  {
    key: "emotionalRegulation1",
    dimension: "Managing Your Emotions",
    question: "I manage anxiety and fear productively without being stopped in my tracks by them.",
    lowLabel: "Rarely",
    highLabel: "Almost always",
  },
  {
    key: "emotionalRegulation2",
    dimension: "Managing Your Emotions",
    question: "I can maintain a positive outlook during extended periods of difficulty.",
    lowLabel: "Strongly disagree",
    highLabel: "Strongly agree",
  },
  {
    key: "socialSupport1",
    dimension: "Social Support",
    question: "I have a reliable support network I can call on during a major crisis.",
    lowLabel: "Not at all",
    highLabel: "Absolutely",
  },
];

const DEFAULT_MR_ANSWERS: MentalResilienceAnswers = {
  stressTolerance1: 3,
  stressTolerance2: 3,
  adaptability1: 3,
  adaptability2: 3,
  learningAgility1: 3,
  changeManagement1: 3,
  changeManagement2: 3,
  emotionalRegulation1: 3,
  emotionalRegulation2: 3,
  socialSupport1: 3,
};

const CURRENCIES = [
  { code: "USD", symbol: "$", label: "$ USD" },
  { code: "EUR", symbol: "€", label: "€ EUR" },
  { code: "GBP", symbol: "£", label: "£ GBP" },
  { code: "AUD", symbol: "A$", label: "A$ AUD" },
  { code: "CAD", symbol: "C$", label: "C$ CAD" },
  { code: "JPY", symbol: "¥", label: "¥ JPY" },
  { code: "INR", symbol: "₹", label: "₹ INR" },
  { code: "BRL", symbol: "R$", label: "R$ BRL" },
  { code: "OTHER", symbol: "", label: "Other" },
] as const;

type CurrencyCode = typeof CURRENCIES[number]["code"];

export default function AssessmentPage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [mrStep, setMrStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<{ code: string; message: string } | null>(null);
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [customCurrency, setCustomCurrency] = useState("");
  const [gateChecked, setGateChecked] = useState(false);
  const [gated, setGated] = useState(false);
  const [freeUsed, setFreeUsed] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [savingsPreferNotToSay, setSavingsPreferNotToSay] = useState(false);
  const [incomePreferNotToSay, setIncomePreferNotToSay] = useState(false);

  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    const checkGate = async () => {
      if (isAuthenticated && user) {
        try {
          const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
          const [subRes, countRes] = await Promise.all([
            fetch(`${BASE}/api/users/me/subscription`, { credentials: "include" }),
            fetch(`${BASE}/api/users/me/report-count`, { credentials: "include" }),
          ]);
          const sub = await subRes.json();
          const { count } = await countRes.json();
          setFreeUsed(count);
          setIsSubscribed(!!sub.isActive);
          if (!sub.isActive && count >= FREE_LIMIT) {
            setGated(true);
          }
        } catch {
          // On error, allow through (fail open)
        }
      } else {
        const anonCount = parseInt(localStorage.getItem(ANON_COUNT_KEY) ?? "0", 10);
        setFreeUsed(anonCount);
        if (anonCount >= FREE_LIMIT) {
          setGated(true);
        }
      }
      setGateChecked(true);
    };

    checkGate();
  }, [isAuthenticated, user, authLoading]);

  const [formData, setFormData] = useState<AssessmentInput>({
    location: "",
    ageBracket: undefined,
    incomeStability: "fixed",
    savingsMonths: 3,
    dependentCount: 0,
    relocationReadiness: undefined,
    skills: [],
    healthStatus: "good",
    mobilityLevel: "medium",
    housingType: "rent",
    hasEmergencySupplies: false,
    psychologicalResilience: 7,
    riskConcerns: [],
    mentalResilienceAnswers: { ...DEFAULT_MR_ANSWERS },
  });

  const { mutateAsync } = useSubmitAssessment();

  const handleNext = () => {
    if (step === MR_STEP) {
      if (mrStep < MR_QUESTIONS.length - 1) {
        setMrStep(s => s + 1);
        return;
      }
      setStep(s => s + 1);
      return;
    }
    if (step === TOTAL_STEPS) {
      handleSubmit();
      return;
    }
    setStep(s => s + 1);
  };

  const handlePrev = () => {
    if (step === MR_STEP && mrStep > 0) {
      setMrStep(s => s - 1);
      return;
    }
    if (step > 1) setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const sessionId = localStorage.getItem(SESSION_KEY) ?? undefined;
      const finalCurrency = currency === "OTHER" ? (customCurrency || "USD") : currency;
      const finalSavingsMonths = savingsPreferNotToSay ? 3 : formData.savingsMonths;
      const report = await mutateAsync({ data: { ...formData, savingsMonths: finalSavingsMonths, currency: finalCurrency, sessionId } as any });
      if (!isAuthenticated) {
        const prev = parseInt(localStorage.getItem(ANON_COUNT_KEY) ?? "0", 10);
        localStorage.setItem(ANON_COUNT_KEY, String(prev + 1));
      }
      localStorage.setItem("resilium_last_report_id", report.reportId);
      setLocation(`/results/${report.reportId}`);
    } catch (error: any) {
      console.error("Assessment submission failed", error);
      const body = error?.response?.data || error?.data;
      if (body?.error === "PLAN_LIMIT_EXCEEDED") {
        setSubmitError({ code: "PLAN_LIMIT_EXCEEDED", message: body.message });
      } else {
        setSubmitError({ code: "UNKNOWN", message: "Something went wrong. Please try again." });
      }
      setIsSubmitting(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "";
          const country = data.address?.country || "";
          const locationStr = city && country ? `${city}, ${country}` : country || city;
          if (locationStr) updateField("location", locationStr);
        } catch {
          // silently fail
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationLoading(false);
        setLocationDenied(true);
      },
      { timeout: 10000 }
    );
  };

  const isStepValid = () => {
    switch(step) {
      case 1: return formData.location.trim().length > 1;
      case 2: return !!formData.ageBracket;
      case 3: return true; // income stability always has a value (or prefer not to say)
      case MR_STEP: return true; // MR questions all have default values
      case 7: return formData.skills.length > 0;
      case TOTAL_STEPS: return formData.riskConcerns.length > 0;
      default: return true;
    }
  };

  const updateField = <K extends keyof AssessmentInput>(field: K, value: AssessmentInput[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateMrAnswer = (key: keyof MentalResilienceAnswers, value: number) => {
    setFormData(prev => ({
      ...prev,
      mentalResilienceAnswers: {
        ...(prev.mentalResilienceAnswers ?? DEFAULT_MR_ANSWERS),
        [key]: value,
      },
    }));
  };

  const toggleArrayItem = <K extends 'skills' | 'riskConcerns'>(field: K, value: any) => {
    setFormData(prev => {
      const current = prev[field] as any[];
      if (field === 'skills') {
        if (value === 'none') {
          return { ...prev, [field]: current.includes('none') ? [] : ['none'] };
        }
        if (current.includes(value)) {
          return { ...prev, [field]: current.filter(i => i !== value) };
        } else {
          return { ...prev, [field]: [...current.filter(i => i !== 'none'), value] };
        }
      }
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(i => i !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const totalSubSteps = (TOTAL_STEPS - 1) + MR_QUESTIONS.length;
  const currentSubStep = step < MR_STEP
    ? step - 1
    : step === MR_STEP
      ? (MR_STEP - 1) + mrStep
      : (MR_STEP - 1) + MR_QUESTIONS.length + (step - MR_STEP - 1);
  const progressPercent = ((currentSubStep + 1) / totalSubSteps) * 100;

  const stepLabel = step === MR_STEP
    ? `Mental Resilience ${mrStep + 1}/${MR_QUESTIONS.length}`
    : `Step ${step} of ${TOTAL_STEPS}`;

  const currentMrQuestion = MR_QUESTIONS[mrStep];
  const currentMrAnswer = formData.mentalResilienceAnswers?.[currentMrQuestion?.key ?? "stressTolerance1"] ?? 3;
  const stepKey = step === MR_STEP ? `mr-${mrStep}` : `step-${step}`;

  if (!gateChecked || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (gated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-3">You've used your {FREE_LIMIT} free assessments</h2>
          <p className="text-muted-foreground mb-8">
            Upgrade to Resilium Pro for unlimited assessments, full progress tracking, and plan comparison tools.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/pricing">
              <Button className="w-full rounded-full gap-2 h-12 shadow-lg shadow-primary/20">
                <Zap className="w-4 h-4" /> View Pricing
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full rounded-full h-12">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <Brain className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h2 className="text-3xl font-display font-bold mb-3">Analysing your profile and building your plan…</h2>
        <p className="text-muted-foreground text-base max-w-sm">
          This usually takes 60–90 seconds — please keep this tab open.
        </p>
      </div>
    );
  }

  if (submitError?.code === "PLAN_LIMIT_EXCEEDED") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-amber-500 mb-6" />
        <h2 className="text-2xl font-display font-bold mb-2">Plan Limit Reached</h2>
        <p className="text-muted-foreground max-w-md mb-8">{submitError.message}</p>
        <div className="flex gap-3">
          <Link href="/profile">
            <Button className="rounded-full">Manage My Plans</Button>
          </Link>
          <Button variant="outline" className="rounded-full" onClick={() => setSubmitError(null)}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (submitError?.code === "UNKNOWN") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-destructive mb-6" />
        <h2 className="text-2xl font-display font-bold mb-2">Analysis Timed Out</h2>
        <p className="text-muted-foreground max-w-md mb-2">
          AI analysis can take up to 90 seconds. Your report may have been created in the background.
        </p>
        {isAuthenticated ? (
          <p className="text-muted-foreground max-w-md mb-8">
            Check <strong>My Plans</strong> — your report might already be there.
          </p>
        ) : (
          <p className="text-muted-foreground max-w-md mb-8">
            If you were signed in, your report would be saved to your profile automatically.
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          {isAuthenticated && (
            <Link href="/profile">
              <Button className="rounded-full">Check My Plans</Button>
            </Link>
          )}
          <Button variant="outline" className="rounded-full" onClick={() => setSubmitError(null)}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full p-6 lg:p-8 flex items-center justify-between z-10">
        <div className="font-display font-bold text-xl tracking-tight text-primary">Resilium</div>
        <div className="flex items-center gap-3">
          {!isSubscribed && freeUsed === FREE_LIMIT - 1 && (
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20">
              Last free assessment
            </span>
          )}
          {!isSubscribed && freeUsed === 0 && (
            <span className="text-xs font-medium text-muted-foreground">
              Assessment 1 of {FREE_LIMIT}
            </span>
          )}
          <div className="text-sm font-medium text-muted-foreground">{stepLabel}</div>
        </div>
      </header>

      <div className="w-full max-w-md mx-auto px-6 mb-8">
        <Progress value={progressPercent} className="h-2" />
        <div className="flex items-center justify-between mt-2 px-0.5">
          <span className="text-xs font-semibold text-primary/70">
            {step === 1 ? "Location" :
             step === 2 ? "Age Bracket" :
             step === 3 ? "Income" :
             step === MR_STEP ? "Mental Resilience" :
             step === 5 ? "Financial Runway" :
             step === 6 ? "Dependents" :
             step === 7 ? "Skills" :
             step === 8 ? "Health & Mobility" :
             step === 9 ? "Housing" :
             step === 10 ? "Emergency Supplies" :
             "Risk Profile"}
          </span>
          <span className="text-xs text-muted-foreground">{Math.round(progressPercent)}%</span>
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center w-full max-w-2xl mx-auto px-6 pb-24">
        <div className="w-full relative">
          <AnimatePresence mode="wait" custom={1}>
            <motion.div
              key={stepKey}
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full flex flex-col justify-center"
            >

              {/* STEP 1: LOCATION + CURRENCY */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-display font-bold">Where are you based?</h2>
                  <p className="text-muted-foreground text-lg">Your geographic location affects climate, political, and economic risk factors.</p>
                  <div className="relative">
                    <Input 
                      autoFocus
                      placeholder="e.g. California, USA" 
                      className="h-16 text-xl px-6 rounded-2xl bg-card border-2 border-border focus-visible:border-primary shadow-sm pr-14"
                      value={formData.location}
                      onChange={(e) => updateField('location', e.target.value)}
                      aria-label="Your location"
                    />
                    <button
                      type="button"
                      onClick={handleUseMyLocation}
                      disabled={locationLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors text-primary disabled:opacity-50"
                      aria-label="Use my current location"
                      title="Use my location"
                    >
                      {locationLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
                    </button>
                  </div>
                  {locationDenied
                    ? <p className="text-xs text-amber-600 -mt-2">Location access was denied — please type your city or region above.</p>
                    : <p className="text-xs text-muted-foreground -mt-2">Or click the pin icon to detect your location automatically.</p>
                  }
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Preferred currency for financial advice</p>
                    <div className="grid grid-cols-3 gap-2">
                      {CURRENCIES.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => setCurrency(c.code)}
                          role="radio"
                          aria-checked={currency === c.code}
                          aria-label={`Select ${c.label} as currency`}
                          tabIndex={0}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setCurrency(c.code); } }}
                          className={cn(
                            "py-2.5 px-2 rounded-xl border-2 font-semibold text-sm transition-all duration-200",
                            currency === c.code
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-card text-muted-foreground hover:border-primary/40"
                          )}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                    {currency === "OTHER" && (
                      <Input
                        placeholder="Enter currency code (e.g. CHF, SEK)"
                        className="mt-2 h-11 rounded-xl"
                        value={customCurrency}
                        onChange={(e) => setCustomCurrency(e.target.value.toUpperCase())}
                        aria-label="Custom currency code"
                        maxLength={5}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: AGE BRACKET */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-display font-bold">What's your age bracket?</h2>
                  <p className="text-muted-foreground text-lg">Age shapes your financial time-horizon and baseline health vulnerability — it affects how we weight your scores.</p>
                  <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Age bracket">
                    {([
                      { id: "18-24", label: "18–24", desc: "Early career" },
                      { id: "25-34", label: "25–34", desc: "Building phase" },
                      { id: "35-44", label: "35–44", desc: "Established" },
                      { id: "45-54", label: "45–54", desc: "Peak earning" },
                      { id: "55-64", label: "55–64", desc: "Pre-retirement" },
                      { id: "65+",   label: "65+",   desc: "Retirement age" },
                    ] as { id: AssessmentInputAgeBracket; label: string; desc: string }[]).map((opt) => (
                      <Card
                        key={opt.id}
                        role="radio"
                        aria-checked={formData.ageBracket === opt.id}
                        tabIndex={0}
                        className={cn(
                          "p-5 cursor-pointer flex flex-col items-center justify-center gap-1 transition-all duration-200 text-center",
                          formData.ageBracket === opt.id ? "step-card-active" : "hover:border-primary/30"
                        )}
                        onClick={() => updateField("ageBracket", opt.id)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); updateField("ageBracket", opt.id); } }}
                      >
                        <span className="text-xl font-bold">{opt.label}</span>
                        <span className="text-xs text-muted-foreground">{opt.desc}</span>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: INCOME STABILITY */}
              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-display font-bold">How stable is your income?</h2>
                  <div className="grid gap-4" role="radiogroup" aria-label="Income stability">
                    {[
                      { id: 'fixed', title: 'Fixed & Secure', desc: 'Salaried employee, guaranteed pension' },
                      { id: 'freelance', title: 'Variable / Freelance', desc: 'Income fluctuates month to month' },
                      { id: 'unstable', title: 'Unstable / Irregular', desc: 'Currently unemployed or highly volatile' },
                      { id: 'student', title: 'Student / No income', desc: 'Full-time student or not currently earning' },
                    ].map((opt) => (
                      <Card 
                        key={opt.id}
                        role="radio"
                        aria-checked={formData.incomeStability === opt.id && !incomePreferNotToSay}
                        tabIndex={0}
                        className={cn(
                          "p-6 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md",
                          formData.incomeStability === opt.id && !incomePreferNotToSay ? "step-card-active" : "bg-card border-border hover:border-primary/30"
                        )}
                        onClick={() => { updateField('incomeStability', opt.id as AssessmentInputIncomeStability); setIncomePreferNotToSay(false); }}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); updateField('incomeStability', opt.id as AssessmentInputIncomeStability); setIncomePreferNotToSay(false); } }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-lg">{opt.title}</h3>
                            <p className="text-muted-foreground">{opt.desc}</p>
                          </div>
                          {formData.incomeStability === opt.id && !incomePreferNotToSay && <CheckCircle2 className="text-primary w-6 h-6" />}
                        </div>
                      </Card>
                    ))}
                    <button
                      role="radio"
                      aria-checked={incomePreferNotToSay}
                      tabIndex={0}
                      onClick={() => { setIncomePreferNotToSay(true); updateField('incomeStability', 'freelance' as AssessmentInputIncomeStability); }}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setIncomePreferNotToSay(true); updateField('incomeStability', 'freelance' as AssessmentInputIncomeStability); } }}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
                        incomePreferNotToSay
                          ? "border-primary/40 bg-primary/5 text-primary"
                          : "border-dashed border-border text-muted-foreground hover:border-primary/30"
                      )}
                    >
                      <span className="font-medium">Prefer not to say</span>
                      <span className="text-xs block mt-0.5 opacity-70">Your answers remain private — this won't block your results</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: MENTAL RESILIENCE */}
              {step === MR_STEP && currentMrQuestion && (
                <div className="space-y-8">
                  {mrStep === 0 && (
                    <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                      <Brain className="w-8 h-8 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-primary">Mental Resilience Assessment</p>
                        <p className="text-xs text-muted-foreground">10 questions · ~2 minutes · shapes your entire plan</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">{currentMrQuestion.dimension}</span>
                    <h2 className="text-2xl md:text-3xl font-display font-bold leading-tight">{currentMrQuestion.question}</h2>
                  </div>

                  <div className="space-y-6 pt-2">
                    <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label={`Rate: ${currentMrQuestion.question}`}>
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          role="radio"
                          aria-checked={currentMrAnswer === val}
                          aria-label={`${val} - ${val === 1 ? currentMrQuestion.lowLabel : val === 5 ? currentMrQuestion.highLabel : val}`}
                          tabIndex={0}
                          onClick={() => updateMrAnswer(currentMrQuestion.key, val)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); updateMrAnswer(currentMrQuestion.key, val); } }}
                          className={cn(
                            "aspect-square rounded-2xl border-2 text-lg font-bold transition-all duration-200 flex flex-col items-center justify-center gap-1",
                            currentMrAnswer === val
                              ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105"
                              : "border-border bg-card hover:border-primary/40 text-foreground"
                          )}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground font-medium px-1">
                      <span>{currentMrQuestion.lowLabel}</span>
                      <span>{currentMrQuestion.highLabel}</span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-1.5 pt-2" aria-label="Question progress">
                    {MR_QUESTIONS.map((_, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "h-1.5 rounded-full transition-all",
                          idx < mrStep ? "bg-primary w-4" : idx === mrStep ? "bg-primary w-6" : "bg-muted w-1.5"
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 5: SAVINGS / FINANCIAL RUNWAY */}
              {step === 5 && (
                <div className="space-y-8">
                  <h2 className="text-3xl md:text-4xl font-display font-bold">What is your financial runway?</h2>
                  <p className="text-muted-foreground text-lg">If you lost your income today, how many months could you survive on savings without going into debt?</p>
                  
                  {!savingsPreferNotToSay ? (
                    <>
                      <div className="pt-8 pb-4">
                        <Slider 
                          value={[formData.savingsMonths]} 
                          max={24} 
                          step={1} 
                          onValueChange={(v) => updateField('savingsMonths', v[0])}
                          className="py-4"
                          aria-label="Months of savings runway"
                        />
                      </div>
                      
                      <div className="flex justify-center items-end gap-2 text-primary">
                        <span className="text-6xl font-bold font-display tracking-tighter">{formData.savingsMonths}</span>
                        <span className="text-xl font-medium mb-2">{formData.savingsMonths === 24 ? "months +" : "months"}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center py-12">
                      <p className="text-muted-foreground text-center">Your financial runway won't be used in scoring — we'll use a neutral estimate.</p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setSavingsPreferNotToSay(v => !v)}
                    aria-pressed={savingsPreferNotToSay}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
                      savingsPreferNotToSay
                        ? "border-primary/40 bg-primary/5 text-primary"
                        : "border-dashed border-border text-muted-foreground hover:border-primary/30"
                    )}
                  >
                    <span className="font-medium">{savingsPreferNotToSay ? "✓ Prefer not to say" : "Prefer not to say"}</span>
                    <span className="text-xs block mt-0.5 opacity-70">Skip the slider — we'll use a neutral mid-range value</span>
                  </button>
                </div>
              )}

              {/* STEP 6: DEPENDENTS */}
              {step === 6 && (
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-display font-bold">How many dependents do you have?</h2>
                  <p className="text-muted-foreground text-lg">Children, elderly parents, or anyone financially or physically reliant on you.</p>
                  <div className="grid grid-cols-2 gap-4" role="radiogroup" aria-label="Number of dependents">
                    {[
                      { value: 0, label: 'None', desc: 'No dependents' },
                      { value: 1, label: 'One', desc: 'One dependent' },
                      { value: 2, label: 'Two or three', desc: '2–3 dependents' },
                      { value: 3, label: 'Four or more', desc: '4+ dependents' },
                    ].map((opt) => (
                      <Card
                        key={opt.value}
                        role="radio"
                        aria-checked={formData.dependentCount === opt.value}
                        tabIndex={0}
                        className={cn(
                          "p-6 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all duration-200",
                          formData.dependentCount === opt.value ? "step-card-active" : "hover:border-primary/30"
                        )}
                        onClick={() => updateField('dependentCount', opt.value as any)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); updateField('dependentCount', opt.value as any); } }}
                      >
                        <span className="text-xl font-bold">{opt.label}</span>
                        <span className="text-xs text-muted-foreground">{opt.desc}</span>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 7: SKILLS */}
              {step === 7 && (
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-display font-bold">What practical skills do you possess?</h2>
                  <p className="text-muted-foreground">Select all that apply.</p>
                  <div className="grid grid-cols-1 gap-3" role="group" aria-label="Practical skills">
                    {[
                      { id: 'digital', label: 'Digital/Tech', desc: 'Software, IT, programming, online tools' },
                      { id: 'physical', label: 'Trade/Manual', desc: 'Carpentry, plumbing, electrical, mechanics' },
                      { id: 'survival', label: 'Outdoors/Survival', desc: 'Wilderness skills, hunting, navigation' },
                      { id: 'medical', label: 'First Aid/Medical', desc: 'CPR, first aid, nursing or medical training' },
                      { id: 'financial', label: 'Trading/Finance', desc: 'Investing, accounting, financial planning' },
                      { id: 'language', label: 'Multiple Languages', desc: 'Fluent or conversational in 2+ languages' },
                      { id: 'caregiving', label: 'Caregiving', desc: 'Child, elder, or disability care' },
                      { id: 'agriculture', label: 'Agriculture/Homesteading', desc: 'Growing food, animal husbandry, gardening' },
                      { id: 'community', label: 'Community Organizing', desc: 'Coordination, volunteering, leadership' },
                      { id: 'teaching', label: 'Education/Teaching', desc: 'Teaching, tutoring, training others' },
                      { id: 'none', label: 'None of these', desc: '' },
                    ].map((opt) => (
                      <div 
                        key={opt.id}
                        role="checkbox"
                        aria-checked={formData.skills.includes(opt.id as AssessmentInputSkillsItem)}
                        tabIndex={0}
                        onClick={() => toggleArrayItem('skills', opt.id)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleArrayItem('skills', opt.id); } }}
                        className={cn(
                          "px-4 py-3 rounded-xl border-2 cursor-pointer font-medium transition-all",
                          formData.skills.includes(opt.id as AssessmentInputSkillsItem)
                            ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                            : "border-border hover:border-primary/30 text-foreground bg-card"
                        )}
                      >
                        <div className="font-semibold">{opt.label}</div>
                        {opt.desc && <div className={cn("text-xs mt-0.5", formData.skills.includes(opt.id as AssessmentInputSkillsItem) ? "text-primary-foreground/70" : "text-muted-foreground")}>{opt.desc}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 8: HEALTH & MOBILITY */}
              {step === 8 && (
                <div className="space-y-8">
                  <h2 className="text-3xl md:text-4xl font-display font-bold">Health & Mobility</h2>
                  <div>
                    <h3 className="text-xl font-display font-bold mb-3">Overall Health Status</h3>
                    <div className="flex gap-2" role="radiogroup" aria-label="Health status">
                      {(['excellent', 'good', 'fair', 'poor'] as AssessmentInputHealthStatus[]).map(opt => (
                        <Button 
                          key={opt}
                          role="radio"
                          aria-checked={formData.healthStatus === opt}
                          variant={formData.healthStatus === opt ? "default" : "outline"}
                          className="flex-1 capitalize rounded-xl h-11 text-sm"
                          onClick={() => updateField('healthStatus', opt)}
                        >
                          {opt}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold mb-1">Physical Capability</h3>
                    <p className="text-sm text-muted-foreground mb-3">How physically capable are you of handling demanding situations?</p>
                    <div className="flex gap-2" role="radiogroup" aria-label="Physical capability">
                      {([
                        { id: 'high', label: 'High' },
                        { id: 'medium', label: 'Medium' },
                        { id: 'low', label: 'Low' },
                      ] as { id: AssessmentInputMobilityLevel; label: string }[]).map(opt => (
                        <Button 
                          key={opt.id}
                          role="radio"
                          aria-checked={formData.mobilityLevel === opt.id}
                          variant={formData.mobilityLevel === opt.id ? "default" : "outline"}
                          className="flex-1 rounded-xl h-11 text-sm"
                          onClick={() => updateField('mobilityLevel', opt.id)}
                        >
                          {opt.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold mb-1">Relocation Readiness</h3>
                    <p className="text-sm text-muted-foreground mb-3">How quickly could you pack up and relocate if you had to?</p>
                    <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Relocation readiness">
                      {[
                        { id: 'immediate', label: 'Immediately', desc: 'Could leave within days' },
                        { id: 'within_month', label: 'Within a month', desc: 'Need a few weeks' },
                        { id: 'within_3months', label: 'Within 3 months', desc: 'Need time to sort things' },
                        { id: 'difficult', label: 'Very difficult', desc: 'Tied down for the foreseeable future' },
                      ].map(opt => (
                        <Card
                          key={opt.id}
                          role="radio"
                          aria-checked={formData.relocationReadiness === opt.id}
                          tabIndex={0}
                          className={cn(
                            "p-3 cursor-pointer transition-all duration-200",
                            formData.relocationReadiness === opt.id ? "step-card-active" : "hover:border-primary/30"
                          )}
                          onClick={() => updateField('relocationReadiness', opt.id as any)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); updateField('relocationReadiness', opt.id as any); } }}
                        >
                          <div className="font-semibold text-sm">{opt.label}</div>
                          <div className="text-xs text-muted-foreground">{opt.desc}</div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 9: HOUSING */}
              {step === 9 && (
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-display font-bold">Current housing situation?</h2>
                  <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-label="Housing situation">
                    {[
                      { id: 'own', label: 'Own a home (mortgage or outright)' },
                      { id: 'rent', label: 'Renting long-term' },
                      { id: 'family', label: 'Living with family/friends' },
                      { id: 'temporary', label: 'Temporary/Subsidised housing' },
                      { id: 'transitional', label: 'Transitional housing or shelter' },
                      { id: 'nomadic', label: 'Nomadic / frequent traveler' },
                      { id: 'other', label: 'Other arrangement' },
                    ].map((opt) => (
                      <Card 
                        key={opt.id}
                        role="radio"
                        aria-checked={formData.housingType === opt.id}
                        tabIndex={0}
                        className={cn(
                          "p-5 cursor-pointer font-medium transition-all duration-200",
                          formData.housingType === opt.id ? "step-card-active" : "hover:border-primary/30"
                        )}
                        onClick={() => updateField('housingType', opt.id as AssessmentInputHousingType)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); updateField('housingType', opt.id as AssessmentInputHousingType); } }}
                      >
                        {opt.label}
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 10: EMERGENCY SUPPLIES */}
              {step === 10 && (
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-display font-bold">Emergency Preparedness</h2>
                  <p className="text-muted-foreground text-lg">Do you have immediate access to at least 14 days of emergency food, water, and essential medicines?</p>
                  <div className="grid grid-cols-2 gap-4" role="radiogroup" aria-label="Emergency supplies">
                    {[
                      { value: true, label: 'Yes' },
                      { value: false, label: 'No' },
                    ].map((opt) => (
                      <Card 
                        key={String(opt.value)}
                        role="radio"
                        aria-checked={formData.hasEmergencySupplies === opt.value}
                        tabIndex={0}
                        className={cn(
                          "p-8 cursor-pointer flex flex-col items-center justify-center gap-4 transition-all duration-200",
                          formData.hasEmergencySupplies === opt.value ? "step-card-active" : "hover:border-primary/30"
                        )}
                        onClick={() => updateField('hasEmergencySupplies', opt.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); updateField('hasEmergencySupplies', opt.value); } }}
                      >
                        <span className="text-2xl font-bold">{opt.label}</span>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 11: RISK PROFILE */}
              {step === TOTAL_STEPS && (
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-display font-bold">Primary Risk Concerns</h2>
                  <p className="text-muted-foreground">Select the risks you feel least prepared for (choose at least one).</p>
                  <div className="grid grid-cols-2 gap-3" role="group" aria-label="Risk concerns">
                    {[
                      { id: 'job_loss', label: 'Job Loss / Automation' },
                      { id: 'inflation', label: 'Hyperinflation' },
                      { id: 'financial_crisis', label: 'Market Crash' },
                      { id: 'natural_disaster', label: 'Natural Disasters' },
                      { id: 'supply_chain', label: 'Supply Chain Failure' },
                      { id: 'political_instability', label: 'Political Unrest' },
                      { id: 'cyber_attack', label: 'Cyber Grid Outage' },
                      { id: 'war_conflict', label: 'War / Conflict' },
                      { id: 'pandemic', label: 'Global Pandemic' },
                      { id: 'illness', label: 'Personal Illness' },
                    ].map((opt) => {
                      const isSelected = formData.riskConcerns.includes(opt.id as AssessmentInputRiskConcernsItem);
                      const isTraumaAdjacent = opt.id === 'war_conflict' || opt.id === 'illness';
                      return (
                        <div key={opt.id} className="flex flex-col gap-1">
                          <div 
                            role="checkbox"
                            aria-checked={isSelected}
                            tabIndex={0}
                            onClick={() => toggleArrayItem('riskConcerns', opt.id)}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleArrayItem('riskConcerns', opt.id); } }}
                            className={cn(
                              "px-3 py-3 rounded-xl border-2 cursor-pointer font-medium text-sm transition-all text-center flex items-center justify-center min-h-[60px]",
                              isSelected
                                ? "border-destructive bg-destructive/10 text-destructive shadow-sm" 
                                : "border-border hover:border-primary/30 text-foreground bg-card"
                            )}
                          >
                            {opt.label}
                          </div>
                          {isSelected && isTraumaAdjacent && (
                            <p className="text-xs text-muted-foreground px-1 leading-relaxed">
                              We understand this may be personal. Your answers shape a plan that takes this seriously.
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* BOTTOM NAVIGATION */}
        <div className="w-full flex items-center justify-between mt-12 pt-6 border-t border-border">
          <Button 
            variant="ghost" 
            size="lg" 
            onClick={handlePrev}
            disabled={step === 1 && mrStep === 0}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          
          <Button 
            size="lg" 
            className="px-8 rounded-full shadow-lg shadow-primary/20"
            onClick={handleNext}
            disabled={!isStepValid()}
            aria-label={step === TOTAL_STEPS ? "Generate Report" : step === MR_STEP && mrStep === MR_QUESTIONS.length - 1 ? "Continue to next section" : "Continue to next step"}
          >
            {step === TOTAL_STEPS ? 'Generate Report' : step === MR_STEP && mrStep === MR_QUESTIONS.length - 1 ? 'Continue' : 'Next'}
            {step === TOTAL_STEPS ? <CheckCircle2 className="w-4 h-4 ml-2" /> : <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
