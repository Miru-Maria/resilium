import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect, useRef } from "react";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp, useClerk } from "@clerk/react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NeuralCanvas } from "@/components/neural-canvas";

import LandingPage from "@/pages/landing";
import AssessmentPage from "@/pages/assessment";
import ResultsPage from "@/pages/results";
import PrivacyPage from "@/pages/privacy";
import TermsPage from "@/pages/terms";
import RefundPage from "@/pages/refund";
import AboutPage from "@/pages/about";
import ProfilePage from "@/pages/profile";
import PricingPage from "@/pages/pricing";
import NotFound from "@/pages/not-found";
import AdminLoginPage from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import UxTestingPage from "@/pages/admin/ux-testing";
import UxTestReportPage from "@/pages/admin/ux-test-report";
import AdminMobilePage from "@/pages/admin/mobile";
import AdminGdprPage from "@/pages/admin/gdpr";
import AdminConsentLogPage from "@/pages/admin/consent-log";
import AdminUsersPage from "@/pages/admin/users";
import AdminAnnouncementsPage from "@/pages/admin/announcements";
import AdminTestimonialsPage from "@/pages/admin/testimonials";
import AdminMarketingPage from "@/pages/admin/marketing";
import AdminSecurityPage from "@/pages/admin/security";
import ConsentPage from "@/pages/consent";
import CoachingPage from "@/pages/coaching";
import DemoPage from "@/pages/demo";
import CompetitiveAnalysisPage from "@/pages/competitive-analysis";
import ScenariosPage from "@/pages/scenarios";
import PlanPage from "@/pages/plan";
import { AnnouncementBanner } from "@/components/announcement-banner";

// Clerk publishable key — injected at build time from VITE_CLERK_PUBLISHABLE_KEY / CLERK_PUBLISHABLE_KEY
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const unsub = addListener(({ user }) => {
      const uid = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== uid) {
        qc.clear();
      }
      prevUserIdRef.current = uid;
    });
    return unsub;
  }, [addListener, qc]);
  return null;
}

function SignInPage() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "4rem 1rem", minHeight: "60vh", alignItems: "center" }}>
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "4rem 1rem", minHeight: "60vh", alignItems: "center" }}>
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function GlobalBackground() {
  const [location] = useLocation();
  if (location.startsWith("/admin") || location === "/coaching") return null;
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <NeuralCanvas opacity={0.52} particleCount={75} connectionDist={160} />
    </div>
  );
}

function Router() {
  return (
    <>
      <GlobalBackground />
      <div style={{ position: "relative", zIndex: 1 }}>
      <AnnouncementBanner />
      <ScrollToTop />
      <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/consent" component={ConsentPage} />
      <Route path="/assess" component={AssessmentPage} />
      <Route path="/results/:reportId" component={ResultsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/refund" component={RefundPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin" component={AdminLoginPage} />
      <Route path="/admin/ux-testing" component={UxTestingPage} />
      <Route path="/admin/ux-test/report/:runId" component={UxTestReportPage} />
      <Route path="/admin/mobile" component={AdminMobilePage} />
      <Route path="/admin/gdpr" component={AdminGdprPage} />
      <Route path="/admin/consent-log" component={AdminConsentLogPage} />
      <Route path="/admin/users" component={AdminUsersPage} />
      <Route path="/admin/announcements" component={AdminAnnouncementsPage} />
      <Route path="/admin/testimonials" component={AdminTestimonialsPage} />
      <Route path="/admin/marketing" component={AdminMarketingPage} />
      <Route path="/admin/security" component={AdminSecurityPage} />
      <Route path="/coaching" component={CoachingPage} />
      <Route path="/demo" component={DemoPage} />
      <Route path="/competitive-analysis" component={CompetitiveAnalysisPage} />
      <Route path="/scenarios/:reportId" component={ScenariosPage} />
      <Route path="/plan/:reportId" component={PlanPage} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route component={NotFound} />
      </Switch>
      </div>
    </>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey ?? ""}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
