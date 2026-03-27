import React, { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useSubmitAssessment } from "@workspace/api-client-react";
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Brain, Zap, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { SiteFooter } from "@/components/site-footer";
import { useAuth } from "@workspace/replit-auth-web";

const FREE_LIMIT = 2;
const ANON_COUNT_KEY = "resilium_free_count";

import type { 
  AssessmentInput,
  AssessmentInputIncomeStability,
  AssessmentInputHealthStatus,
  AssessmentInputMobilityLevel,
  AssessmentInputHousingType,
  AssessmentInputRiskConcernsItem,
  AssessmentInputSkillsItem,
  MentalResilienceAnswers
} from "@workspace/api-client-react/src/generated/api.schemas";

// Step 1 is the new mental resilience deep-assessment
// Steps 2-11 are the original 10 steps shifted by +1
const TOTAL_STEPS = 11;

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
    dimension: "Learning Agility",
    question: "I actively seek out new skills or knowledge when I notice a gap in my preparedness.",
    lowLabel: "Rarely",
    highLabel: "Very often",
  },
  {
    key: "changeManagement1",
    dimension: "Change Management",
    question: "I proactively prepare for major life changes rather than reacting after the fact.",
    lowLabel: "Strongly disagree",
    highLabel: "Strongly agree",
  },
  {
    key: "changeManagement2",
    dimension: "Change Management",
    question: "I feel confident navigating large-scale uncertainty (economic, political, social).",
    lowLabel: "Not at all",
    highLabel: "Very confident",
  },
  {
    key: "emotionalRegulation1",
    dimension: "Emotional Regulation",
    question: "I manage anxiety and fear productively without being paralyzed by them.",
    lowLabel: "Rarely",
    highLabel: "Almost always",
  },
  {
    key: "emotionalRegulation2",
    dimension: "Emotional Regulation",
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

const PROGRESS_STEPS = [
  "Reviewing your financial position…",
  "Analysing your health and mobility profile…",
  "Mapping your practical skills…",
  "Assessing your psychological resilience…",
  "Identifying your top vulnerabilities…",
  "Running risk scenario simulations…",
  "Building your personalised action plan…",
  "Compiling your recommended resources…",
  "Finalising your resilience report…",
];

export default function AssessmentPage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [mrStep, setMrStep] = useState(0); // sub-step within step 1
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [submitError, setSubmitError] = useState<{ code: string; message: string } | null>(null);
  const [currency, setCurrency] = useState<"USD" | "EUR" | "RON">("USD");
  const [gateChecked, setGateChecked] = useState(false);
  const [gated, setGated] = useState(false);
  const [freeUsed, setFreeUsed] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);

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

  useEffect(() => {
    if (!isSubmitting) return;
    setProgressStep(0);
    const interval = setInterval(() => {
      setProgressStep(prev => (prev < PROGRESS_STEPS.length - 1 ? prev + 1 : prev));
    }, 2200);
    return () => clearInterval(interval);
  }, [isSubmitting]);

  const [formData, setFormData] = useState<AssessmentInput>({
    location: "",
    incomeStability: "fixed",
    savingsMonths: 3,
    hasDependents: false,
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
    if (step === 1) {
      // Mental resilience step has 10 sub-steps
      if (mrStep < MR_QUESTIONS.length - 1) {
        setMrStep(s => s + 1);
        return;
      }
    }
    if (step < TOTAL_STEPS) {
      setStep(s => s + 1);
      if (step === 1) setMrStep(0); // reset sub-step when leaving MR section
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (step === 1 && mrStep > 0) {
      setMrStep(s => s - 1);
      return;
    }
    if (step > 1) setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const report = await mutateAsync({ data: { ...formData, currency } as any });
      if (!isAuthenticated) {
        const prev = parseInt(localStorage.getItem(ANON_COUNT_KEY) ?? "0", 10);
        localStorage.setItem(ANON_COUNT_KEY, String(prev + 1));
      }
      setTimeout(() => {
        setLocation(`/results/${report.reportId}`);
      }, 1500);
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

  // Validation per step
  const isStepValid = () => {
    switch(step) {
      case 1: return true; // all MR questions have a default value
      case 2: return formData.location.trim().length > 1;
      case 6: return formData.skills.length > 0;
      case 11: return formData.riskConcerns.length > 0;
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
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(i => i !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  // Calculate total progress including MR sub-steps
  const totalSubSteps = MR_QUESTIONS.length + (TOTAL_STEPS - 1);
  const currentSubStep = step === 1 ? mrStep : MR_QUESTIONS.length + (step - 2);
  const progressPercent = ((currentSubStep + 1) / totalSubSteps) * 100;

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
          <h2 className="text-2xl font-display font-bold mb-3">You've used your 2 free assessments</h2>
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
        <Loader2 className="w-16 h-16 text-primary animate-spin mb-8" />
        <h2 className="text-3xl font-display font-bold mb-4">Building Your Resilience Plan</h2>
        <div className="max-w-xs w-full space-y-4">
          <div className="space-y-2">
            {PROGRESS_STEPS.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "text-sm transition-all duration-500",
                  i === progressStep
                    ? "text-foreground font-medium"
                    : i < progressStep
                    ? "text-emerald-500 font-medium"
                    : "text-muted-foreground/30"
                )}
              >
                {i < progressStep ? "✓ " : i === progressStep ? "› " : ""}{msg}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Plan limit error screen
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

  const currentMrQuestion = MR_QUESTIONS[mrStep];
  const currentMrAnswer = formData.mentalResilienceAnswers?.[currentMrQuestion?.key ?? "stressTolerance1"] ?? 3;
  const stepKey = step === 1 ? `mr-${mrStep}` : `step-${step}`;

  const stepLabel = step === 1
    ? `Mental Resilience ${mrStep + 1}/${MR_QUESTIONS.length}`
    : `Step ${step - 1} of ${TOTAL_STEPS - 1}`;

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
      </div>

      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-6 pb-24">
        <div className="w-full relative h-[450px]">
          <AnimatePresence mode="wait" custom={1}>
            <motion.div
              key={stepKey}
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-0 flex flex-col justify-center"
            >

              {/* STEP 1: MENTAL RESILIENCE DEEP ASSESSMENT */}
              {step === 1 && currentMrQuestion && (
                <div className="space-y-8 -mt-8">
                  {mrStep === 0 && (
                    <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl mb-10">
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
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          onClick={() => updateMrAnswer(currentMrQuestion.key, val)}
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

                  {/* Mini progress dots for sub-steps */}
                  <div className="flex justify-center gap-1.5 pt-2">
                    {MR_QUESTIONS.map((_, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "w-1.5 h-1.5 rounded-full transition-all",
                          idx < mrStep ? "bg-primary" : idx === mrStep ? "bg-primary w-4" : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: LOCATION + CURRENCY */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-display font-bold">Where are you based?</h2>
                  <p className="text-muted-foreground text-lg">Your geographic location affects climate, political, and economic risk factors.</p>
                  <Input 
                    autoFocus
                    placeholder="e.g. California, USA" 
                    className="h-16 text-xl px-6 rounded-2xl bg-card border-2 border-border focus-visible:border-primary shadow-sm"
                    value={formData.location}
                    onChange={(e) => updateField('location', e.target.value)}
                  />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Preferred currency for financial advice</p>
                    <div className="flex gap-3">
                      {(["USD", "EUR", "RON"] as const).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCurrency(c)}
                          className={cn(
                            "flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all duration-200",
                            currency === c
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-card text-muted-foreground hover:border-primary/40"
                          )}
                        >
                          {c === "USD" ? "$ USD" : c === "EUR" ? "€ EUR" : "lei RON"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: INCOME */}
              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-display font-bold">How stable is your income?</h2>
                  <div className="grid gap-4">
                    {[
                      { id: 'fixed', title: 'Fixed & Secure', desc: 'Salaried employee, guaranteed pension' },
                      { id: 'freelance', title: 'Variable / Freelance', desc: 'Income fluctuates month to month' },
                      { id: 'unstable', title: 'Unstable / Irregular', desc: 'Currently unemployed or highly volatile' }
                    ].map((opt) => (
                      <Card 
                        key={opt.id}
                        className={cn(
                          "p-6 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md",
                          formData.incomeStability === opt.id ? "step-card-active" : "bg-card border-border hover:border-primary/30"
                        )}
                        onClick={() => updateField('incomeStability', opt.id as AssessmentInputIncomeStability)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-lg">{opt.title}</h3>
                            <p className="text-muted-foreground">{opt.desc}</p>
                          </div>
                          {formData.incomeStability === opt.id && <CheckCircle2 className="text-primary w-6 h-6" />}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: SAVINGS */}
              {step === 4 && (
                <div className="space-y-8">
                  <h2 className="text-3xl md:text-4xl font-display font-bold">What is your financial runway?</h2>
                  <p className="text-muted-foreground text-lg">If you lost your income today, how many months could you survive on savings without going into debt?</p>
                  
                  <div className="pt-8 pb-4">
                    <Slider 
                      value={[formData.savingsMonths]} 
                      max={24} 
                      step={1} 
                      onValueChange={(v) => updateField('savingsMonths', v[0])}
                      className="py-4"
                    />
                  </div>
                  
                  <div className="flex justify-center items-end gap-2 text-primary">
                    <span className="text-6xl font-bold font-display tracking-tighter">{formData.savingsMonths}</span>
                    <span className="text-xl font-medium mb-2">{formData.savingsMonths === 24 ? "months +" : "months"}</span>
                  </div>
                </div>
              )}

              {/* STEP 5: DEPENDENTS */}
              {step === 5 && (
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-display font-bold">Do you have dependents?</h2>
                  <p className="text-muted-foreground text-lg">Children, elderly parents, or anyone financially/physically reliant on you.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <Card 
                      className={cn(
                        "p-8 cursor-pointer flex flex-col items-center justify-center gap-4 transition-all duration-200",
                        formData.hasDependents === true ? "step-card-active" : "hover:border-primary/30"
                      )}
                      onClick={() => updateField('hasDependents', true)}
                    >
                      <span className="text-2xl font-bold">Yes</span>
                    </Card>
                    <Card 
                      className={cn(
                        "p-8 cursor-pointer flex flex-col items-center justify-center gap-4 transition-all duration-200",
                        formData.hasDependents === false ? "step-card-active" : "hover:border-primary/30"
                      )}
                      onClick={() => updateField('hasDependents', false)}
                    >
                      <span className="text-2xl font-bold">No</span>
                    </Card>
                  </div>
                </div>
              )}

              {/* STEP 6: SKILLS */}
              {step === 6 && (
                <div className="space-y-6 h-full overflow-y-auto pr-2">
                  <h2 className="text-3xl md:text-4xl font-display font-bold">What practical skills do you possess?</h2>
                  <p className="text-muted-foreground">Select all that apply.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'digital', label: 'Digital/Tech' },
                      { id: 'physical', label: 'Trade/Manual' },
                      { id: 'survival', label: 'Outdoors/Survival' },
                      { id: 'medical', label: 'First Aid/Medical' },
                      { id: 'financial', label: 'Trading/Finance' },
                      { id: 'language', label: 'Multiple Languages' },
                      { id: 'none', label: 'None of these' },
                    ].map((opt) => (
                      <div 
                        key={opt.id}
                        onClick={() => toggleArrayItem('skills', opt.id)}
                        className={cn(
                          "px-4 py-4 rounded-xl border-2 cursor-pointer font-medium transition-all text-center",
                          formData.skills.includes(opt.id as AssessmentInputSkillsItem) 
                            ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                            : "border-border hover:border-primary/30 text-foreground bg-card"
                        )}
                      >
                        {opt.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 7: HEALTH & MOBILITY */}
              {step === 7 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-display font-bold mb-4">Overall Health Status</h2>
                    <div className="flex gap-2">
                      {['excellent', 'good', 'fair', 'poor'].map(opt => (
                        <Button 
                          key={opt}
                          variant={formData.healthStatus === opt ? "default" : "outline"}
                          className="flex-1 capitalize rounded-xl h-12"
                          onClick={() => updateField('healthStatus', opt as AssessmentInputHealthStatus)}
                        >
                          {opt}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold mb-4">Mobility Level</h2>
                    <p className="text-sm text-muted-foreground mb-4">How easily could you relocate internationally or travel long distances?</p>
                    <div className="flex gap-2">
                      {['high', 'medium', 'low'].map(opt => (
                        <Button 
                          key={opt}
                          variant={formData.mobilityLevel === opt ? "default" : "outline"}
                          className="flex-1 capitalize rounded-xl h-12"
                          onClick={() => updateField('mobilityLevel', opt as AssessmentInputMobilityLevel)}
                        >
                          {opt}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 8: HOUSING */}
              {step === 8 && (
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-display font-bold">Current housing situation?</h2>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'own', label: 'Own a home (mortgage or outright)' },
                      { id: 'rent', label: 'Renting long-term' },
                      { id: 'family', label: 'Living with family/friends' },
                      { id: 'nomadic', label: 'Nomadic / frequent traveler' },
                      { id: 'other', label: 'Other temporary arrangement' },
                    ].map((opt) => (
                      <Card 
                        key={opt.id}
                        className={cn(
                          "p-5 cursor-pointer font-medium transition-all duration-200",
                          formData.housingType === opt.id ? "step-card-active" : "hover:border-primary/30"
                        )}
                        onClick={() => updateField('housingType', opt.id as AssessmentInputHousingType)}
                      >
                        {opt.label}
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 9: EMERGENCY SUPPLIES */}
              {step === 9 && (
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-display font-bold">Emergency Preparedness</h2>
                  <p className="text-muted-foreground text-lg">Do you have immediate access to at least 14 days of emergency food, water, and essential medicines?</p>
                  <div className="grid grid-cols-2 gap-4">
                    <Card 
                      className={cn(
                        "p-8 cursor-pointer flex flex-col items-center justify-center gap-4 transition-all duration-200",
                        formData.hasEmergencySupplies === true ? "step-card-active" : "hover:border-primary/30"
                      )}
                      onClick={() => updateField('hasEmergencySupplies', true)}
                    >
                      <span className="text-2xl font-bold">Yes</span>
                    </Card>
                    <Card 
                      className={cn(
                        "p-8 cursor-pointer flex flex-col items-center justify-center gap-4 transition-all duration-200",
                        formData.hasEmergencySupplies === false ? "step-card-active" : "hover:border-primary/30"
                      )}
                      onClick={() => updateField('hasEmergencySupplies', false)}
                    >
                      <span className="text-2xl font-bold">No</span>
                    </Card>
                  </div>
                </div>
              )}

              {/* STEP 10: PSYCHOLOGICAL (self-rating, kept for context/comparison) */}
              {step === 10 && (
                <div className="space-y-8 text-center">
                  <h2 className="text-3xl md:text-4xl font-display font-bold text-left">Self-Rated Resilience</h2>
                  <p className="text-muted-foreground text-lg text-left">On a scale of 1-10, how well do you handle severe stress, ambiguity, and rapid change? (For comparison with your detailed profile.)</p>
                  
                  <div className="pt-12 pb-8 px-4">
                    <Slider 
                      value={[formData.psychologicalResilience]} 
                      max={10} 
                      min={1}
                      step={1} 
                      onValueChange={(v) => updateField('psychologicalResilience', v[0])}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground font-medium mt-4">
                      <span>1 - Easily overwhelmed</span>
                      <span>10 - Unshakeable</span>
                    </div>
                  </div>
                  
                  <div className="text-7xl font-display font-bold text-primary">
                    {formData.psychologicalResilience}
                  </div>
                </div>
              )}

              {/* STEP 11: RISKS */}
              {step === 11 && (
                <div className="space-y-6 h-full overflow-y-auto pr-2">
                  <h2 className="text-3xl md:text-4xl font-display font-bold">Primary Risk Concerns</h2>
                  <p className="text-muted-foreground">Select the risks you feel least prepared for (choose at least one).</p>
                  <div className="grid grid-cols-2 gap-3">
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
                    ].map((opt) => (
                      <div 
                        key={opt.id}
                        onClick={() => toggleArrayItem('riskConcerns', opt.id)}
                        className={cn(
                          "px-3 py-3 rounded-xl border-2 cursor-pointer font-medium text-sm transition-all text-center flex items-center justify-center min-h-[60px]",
                          formData.riskConcerns.includes(opt.id as AssessmentInputRiskConcernsItem) 
                            ? "border-destructive bg-destructive/10 text-destructive shadow-sm" 
                            : "border-border hover:border-primary/30 text-foreground bg-card"
                        )}
                      >
                        {opt.label}
                      </div>
                    ))}
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
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          
          <Button 
            size="lg" 
            className="px-8 rounded-full shadow-lg shadow-primary/20"
            onClick={handleNext}
            disabled={!isStepValid()}
          >
            {step === TOTAL_STEPS ? 'Generate Report' : 'Next'}
            {step === TOTAL_STEPS ? <CheckCircle2 className="w-4 h-4 ml-2" /> : <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
