import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect, useCallback } from "react";
import { ThemeContext, type Theme } from "@/hooks/use-theme";

import LandingPage from "@/pages/landing";
import AssessmentPage from "@/pages/assessment";
import ResultsPage from "@/pages/results";
import PrivacyPage from "@/pages/privacy";
import ProfilePage from "@/pages/profile";
import NotFound from "@/pages/not-found";
import AdminLoginPage from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import UxTestingPage from "@/pages/admin/ux-testing";
import UxTestReportPage from "@/pages/admin/ux-test-report";
import AdminMobilePage from "@/pages/admin/mobile";
import AdminGdprPage from "@/pages/admin/gdpr";
import AdminConsentLogPage from "@/pages/admin/consent-log";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem("resilium-theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch {}
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/assess" component={AssessmentPage} />
      <Route path="/results/:reportId" component={ResultsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin" component={AdminLoginPage} />
      <Route path="/admin/ux-test" component={UxTestingPage} />
      <Route path="/admin/ux-test/report/:runId" component={UxTestReportPage} />
      <Route path="/admin/mobile" component={AdminMobilePage} />
      <Route path="/admin/gdpr" component={AdminGdprPage} />
      <Route path="/admin/consent-log" component={AdminConsentLogPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem("resilium-theme", theme);
    } catch {}
  }, [theme]);

  const toggle = useCallback(() => setThemeState((t) => (t === "light" ? "dark" : "light")), []);
  const setTheme = useCallback((t: Theme) => setThemeState(t), []);

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeContext.Provider>
  );
}

export default App;
