import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
import DemoPage from "@/pages/demo";
import ScenariosPage from "@/pages/scenarios";
import { AnnouncementBanner } from "@/components/announcement-banner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function GlobalBackground() {
  const [location] = useLocation();
  if (location.startsWith("/admin")) return null;
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
      <Route path="/demo" component={DemoPage} />
      <Route path="/scenarios/:reportId" component={ScenariosPage} />
      <Route component={NotFound} />
      </Switch>
      </div>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
