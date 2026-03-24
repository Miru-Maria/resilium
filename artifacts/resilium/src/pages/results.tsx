import React, { useRef } from "react";
import { useRoute } from "wouter";
import { useGetReport } from "@workspace/api-client-react";
import { CircularProgress } from "@/components/circular-progress";
import { RadarChartView } from "@/components/radar-chart-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Loader2, Download, Share2, AlertTriangle, ShieldAlert, CheckCircle, RefreshCcw, Activity } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function ResultsPage() {
  const [, params] = useRoute("/results/:reportId");
  const reportId = params?.reportId || "";
  const { toast } = useToast();

  const { data: report, isLoading, error } = useGetReport(reportId, {
    query: {
      enabled: !!reportId,
      retry: 2
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium">Retrieving your resilience profile...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-destructive mb-6" />
        <h2 className="text-2xl font-display font-bold mb-2">Report Not Found</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          We couldn't locate your resilience report. It may have expired or the ID is incorrect.
        </p>
        <Link href="/assess">
          <Button size="lg" className="rounded-full">Take Assessment</Button>
        </Link>
      </div>
    );
  }

  const getScoreColorClass = (score: number) => {
    if (score >= 70) return "text-emerald-500";
    if (score >= 40) return "text-amber-500";
    return "text-destructive";
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`My Resilium Score is ${Math.round(report.score.overall)}/100. Find out your survival readiness at Resilium.`);
    toast({
      title: "Copied to clipboard",
      description: "You can now paste and share your score.",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="w-full bg-card border-b border-border sticky top-0 z-50 print:hidden">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-display font-bold text-xl text-primary flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" /> Resilium
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleShare} className="rounded-full">
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
            <Button variant="default" size="sm" onClick={handlePrint} className="rounded-full">
              <Download className="w-4 h-4 mr-2" /> Save PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-10 space-y-10">
        
        {/* HERO SCORES SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 border-none shadow-xl shadow-black/5 bg-gradient-to-b from-card to-muted/20 flex flex-col items-center justify-center p-8 text-center">
            <h2 className="font-display font-bold text-xl mb-8 text-foreground">Overall Readiness</h2>
            <CircularProgress 
              value={report.score.overall} 
              size={220} 
              strokeWidth={16} 
              colorClass={getScoreColorClass(report.score.overall)} 
            />
            <p className="mt-8 text-sm text-muted-foreground font-medium uppercase tracking-widest">
              {report.score.overall >= 70 ? "Highly Resilient" : report.score.overall >= 40 ? "Moderately Prepared" : "Critically Vulnerable"}
            </p>
          </Card>
          
          <Card className="lg:col-span-2 border-none shadow-xl shadow-black/5 flex flex-col sm:flex-row items-center p-6 gap-6">
            <div className="w-full sm:w-1/2 h-[300px]">
              <RadarChartView score={report.score} />
            </div>
            <div className="w-full sm:w-1/2 space-y-4">
              <h3 className="font-display font-bold text-2xl">Risk Profile</h3>
              <p className="text-muted-foreground leading-relaxed">
                {report.riskProfileSummary}
              </p>
            </div>
          </Card>
        </section>

        {/* TOP VULNERABILITIES */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-destructive" />
            <h2 className="font-display font-bold text-2xl">Critical Vulnerabilities</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {report.topVulnerabilities.map((vuln, idx) => (
              <div key={idx} className="bg-destructive/10 border border-destructive/20 text-destructive-foreground px-5 py-4 rounded-2xl flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-destructive">{idx + 1}</span>
                </div>
                <p className="text-sm font-medium text-foreground leading-snug">{vuln}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ACTION PLAN TABS */}
        <section className="bg-card rounded-3xl p-6 md:p-8 shadow-lg shadow-black/5 border border-border">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
            <h2 className="font-display font-bold text-2xl">Strategic Action Plan</h2>
          </div>
          
          <Tabs defaultValue="shortTerm" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/50 p-1 rounded-full">
              <TabsTrigger value="shortTerm" className="rounded-full data-[state=active]:shadow-sm">0-30 Days</TabsTrigger>
              <TabsTrigger value="midTerm" className="rounded-full data-[state=active]:shadow-sm">3-6 Months</TabsTrigger>
              <TabsTrigger value="longTerm" className="rounded-full data-[state=active]:shadow-sm">Long Term</TabsTrigger>
            </TabsList>
            
            {(['shortTerm', 'midTerm', 'longTerm'] as const).map((period) => (
              <TabsContent key={period} value={period} className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
                {report.actionPlan[period].map((item, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl border border-border/60 hover:border-primary/30 hover:bg-muted/10 transition-colors">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          item.priority === 'critical' ? 'bg-destructive/10 text-destructive' :
                          item.priority === 'high' ? 'bg-amber-500/10 text-amber-700' :
                          'bg-primary/10 text-primary'
                        }`}>
                          {item.priority} priority
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-secondary/30 text-secondary-foreground">
                          {item.category}
                        </span>
                      </div>
                      <h4 className="font-bold text-lg text-foreground">{item.title}</h4>
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* SCENARIO SIMULATIONS */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-6 h-6 text-primary" />
              <h2 className="font-display font-bold text-2xl">Stress Test Scenarios</h2>
            </div>
            <p className="text-muted-foreground mb-6">How your profile holds up against your primary risk concerns.</p>
            
            <Accordion type="single" collapsible className="w-full space-y-3">
              {report.scenarioSimulations.map((scenario, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`} className="bg-card border border-border rounded-2xl overflow-hidden px-2 shadow-sm">
                  <AccordionTrigger className="hover:no-underline px-4 py-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-left w-full pr-4">
                      <span className="font-bold text-lg">{scenario.scenario}</span>
                      <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full w-max ${
                        scenario.impact === 'severe' ? 'bg-destructive/10 text-destructive' :
                        scenario.impact === 'high' ? 'bg-amber-500/10 text-amber-700' :
                        'bg-emerald-500/10 text-emerald-700'
                      }`}>
                        {scenario.impact} Impact
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-5 pt-0">
                    <div className="pt-4 border-t border-border space-y-4">
                      <p className="text-muted-foreground leading-relaxed">{scenario.description}</p>
                      
                      <div className="bg-muted/30 p-4 rounded-xl">
                        <h5 className="font-bold text-sm mb-2 uppercase tracking-wide">Immediate Survival Steps</h5>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-foreground">
                          {scenario.immediateSteps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <span className="text-muted-foreground">Estimated recovery time:</span>
                        <span className="text-foreground">{scenario.timeToRecover}</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* HABITS SIDEBAR */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="font-display font-bold text-2xl mb-2">Daily Habits</h2>
            <Card className="border-none shadow-lg shadow-black/5 bg-primary text-primary-foreground">
              <CardContent className="p-6 space-y-4">
                {report.dailyHabits.map((habit, idx) => (
                  <div key={idx} className="flex gap-3 pb-4 border-b border-primary-foreground/10 last:border-0 last:pb-0">
                    <div className="mt-1">
                      <CheckCircle className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm leading-snug mb-1">{habit.habit}</p>
                      <span className="text-[10px] uppercase tracking-widest text-primary-foreground/60">{habit.frequency}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="pt-8 print:hidden">
              <Link href="/assess">
                <Button variant="outline" className="w-full rounded-full h-12 text-muted-foreground hover:text-foreground">
                  <RefreshCcw className="w-4 h-4 mr-2" /> Retake Assessment
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
