import React, { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useSubmitAssessment } from "@workspace/api-client-react";
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Types derived from OpenAPI schema
import type { 
  AssessmentInput,
  AssessmentInputIncomeStability,
  AssessmentInputHealthStatus,
  AssessmentInputMobilityLevel,
  AssessmentInputHousingType,
  AssessmentInputRiskConcernsItem,
  AssessmentInputSkillsItem
} from "@workspace/api-client-react/src/generated/api.schemas";

const TOTAL_STEPS = 10;

export default function AssessmentPage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  });

  const { mutateAsync } = useSubmitAssessment();

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(s => s + 1);
    else handleSubmit();
  };

  const handlePrev = () => {
    if (step > 1) setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const report = await mutateAsync({ data: formData });
      // Short artificial delay for dramatic effect
      setTimeout(() => {
        setLocation(`/results/${report.reportId}`);
      }, 1500);
    } catch (error) {
      console.error("Assessment submission failed", error);
      setIsSubmitting(false);
    }
  };

  // Validation per step
  const isStepValid = () => {
    switch(step) {
      case 1: return formData.location.trim().length > 1;
      case 5: return formData.skills.length > 0;
      case 10: return formData.riskConcerns.length > 0;
      default: return true;
    }
  };

  const updateField = <K extends keyof AssessmentInput>(field: K, value: AssessmentInput[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  // If submitting, show full-screen loading
  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-16 h-16 text-primary animate-spin mb-8" />
        <h2 className="text-3xl font-display font-bold mb-4">Building Your Resilience Plan</h2>
        <p className="text-muted-foreground max-w-md animate-pulse">
          Our AI is analyzing your vulnerabilities, simulating thousands of risk scenarios, and generating a personalized roadmap.
        </p>
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
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full p-6 lg:p-8 flex items-center justify-between z-10">
        <div className="font-display font-bold text-xl tracking-tight text-primary">Resilium</div>
        <div className="text-sm font-medium text-muted-foreground">Step {step} of {TOTAL_STEPS}</div>
      </header>

      <div className="w-full max-w-md mx-auto px-6 mb-8">
        <Progress value={(step / TOTAL_STEPS) * 100} className="h-2" />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-6 pb-24">
        <div className="w-full relative h-[450px]">
          <AnimatePresence mode="wait" custom={1}>
            <motion.div
              key={step}
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-0 flex flex-col justify-center"
            >
              
              {/* STEP 1: LOCATION */}
              {step === 1 && (
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
                </div>
              )}

              {/* STEP 2: INCOME */}
              {step === 2 && (
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

              {/* STEP 3: SAVINGS */}
              {step === 3 && (
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

              {/* STEP 4: DEPENDENTS */}
              {step === 4 && (
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

              {/* STEP 5: SKILLS */}
              {step === 5 && (
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

              {/* STEP 6: HEALTH & MOBILITY */}
              {step === 6 && (
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

              {/* STEP 7: HOUSING */}
              {step === 7 && (
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

              {/* STEP 8: EMERGENCY SUPPLIES */}
              {step === 8 && (
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

              {/* STEP 9: PSYCHOLOGICAL */}
              {step === 9 && (
                <div className="space-y-8 text-center">
                  <h2 className="text-3xl md:text-4xl font-display font-bold text-left">Psychological Resilience</h2>
                  <p className="text-muted-foreground text-lg text-left">On a scale of 1-10, how well do you handle severe stress, ambiguity, and rapid change?</p>
                  
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

              {/* STEP 10: RISKS */}
              {step === 10 && (
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
            disabled={step === 1}
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
            {step === TOTAL_STEPS ? 'Generate Report' : 'Next Step'}
            {step === TOTAL_STEPS ? <CheckCircle2 className="w-4 h-4 ml-2" /> : <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </main>
    </div>
  );
}
