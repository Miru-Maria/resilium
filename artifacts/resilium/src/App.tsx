import { Switch, Route, Router as WouterRouter, useLocation, Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp, useClerk, useAuth, useUser } from "@clerk/react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NeuralCanvas } from "@/components/neural-canvas";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ResilientIcon } from "@/components/resilient-icon";
import { LogIn, Menu, X } from "lucide-react";

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
import AdminMonitoringPage from "@/pages/admin/monitoring";
import AdminDocumentsPage from "@/pages/admin/documents";
import AdminAnalyticsPage from "@/pages/admin/analytics";
import ConsentPage from "@/pages/consent";
import CoachingPage from "@/pages/coaching";
import DemoPage from "@/pages/demo";

import ScenariosPage from "@/pages/scenarios";
import PlanPage from "@/pages/plan";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { CookieNotice } from "@/components/cookie-notice";
import { NoIndexPage } from "@/components/page-seo";

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
        qc.invalidateQueries({
          predicate: (query) => {
            const key = String(query.queryKey[0] ?? "");
            return key.includes("/api/users") || key.includes("/api/admin");
          },
        });
      }
      prevUserIdRef.current = uid;
    });
    return unsub;
  }, [addListener, qc]);
  return null;
}

function ClerkAuthBridge() {
  const { getToken } = useAuth();
  useEffect(() => {
    setAuthTokenGetter(async () => {
      try {
        const token = await Promise.race([
          getToken(),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
        ]);
        return token;
      } catch {
        return null;
      }
    });
    return () => setAuthTokenGetter(null);
  }, [getToken]);
  return null;
}

// TODO: Remove this appearance override once Facebook app review is approved
const hideFacebookAppearance = {
  elements: {
    socialButtonsBlockButton__facebook: { display: "none" },
  },
};

function SignInPage() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "4rem 1rem", minHeight: "60vh", alignItems: "center" }}>
      <NoIndexPage />
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} appearance={hideFacebookAppearance} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "4rem 1rem", minHeight: "60vh", alignItems: "center" }}>
      <NoIndexPage />
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} appearance={hideFacebookAppearance} />
    </div>
  );
}

function RedirectTo({ to }: { to: string }) {
  const [, setLocation] = useLocation();
  useEffect(() => { setLocation(to, { replace: true }); }, [to, setLocation]);
  return null;
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function GlobalNav() {
  const [location] = useLocation();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { openSignIn, signOut } = useClerk();
  const [authTimedOut, setAuthTimedOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (isLoaded) return;
    const t = setTimeout(() => setAuthTimedOut(true), 500);
    return () => clearTimeout(t);
  }, [isLoaded]);

  useEffect(() => { setMobileOpen(false); }, [location]);

  if (location.startsWith("/admin") || location === "/coaching") return null;

  const showAuth = isLoaded || authTimedOut;
  const logout = () => signOut({ redirectUrl: "/" });
  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "?";

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur-sm border-b border-border/40">
      <div className="h-14 w-full px-6 flex items-center justify-between">
        <Link href="/">
          <span className="flex items-center gap-2 cursor-pointer">
            <ResilientIcon className="w-6 h-6" />
            <span className="font-display font-bold text-lg tracking-tight text-primary">Resilium</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-5">
          <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About</Link>
          <Link href="/demo" className="text-sm text-muted-foreground hover:text-primary transition-colors">Demo</Link>
          <Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">Pricing</Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="md:hidden flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          {!showAuth ? (
            <div className="w-24 h-8 rounded-full bg-muted/50 animate-pulse" />
          ) : isSignedIn && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-full flex items-center gap-2 px-3">
                  {user.imageUrl ? (
                    <img src={user.imageUrl} alt={user.firstName || "User"} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold leading-none shrink-0">
                      {initials}
                    </span>
                  )}
                  <span className="max-w-[100px] truncate text-sm hidden sm:block">
                    {user.firstName || user.fullName || user.username || user.primaryEmailAddress?.emailAddress?.split("@")[0] || "Account"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className="w-48 z-[150]">
                <DropdownMenuItem asChild>
                  <Link href="/profile?tab=account" className="cursor-pointer">Account</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile?tab=reports" className="cursor-pointer">Reports</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile?tab=plans" className="cursor-pointer">Plans</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile?tab=checklist" className="cursor-pointer">Checklist</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" className="rounded-full gap-1.5" onClick={() => openSignIn({})}>
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Button>
          )}
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/98 px-6 py-3 flex flex-col gap-1">
          <Link href="/about" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-primary transition-colors py-2 block">About</Link>
          <Link href="/demo" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-primary transition-colors py-2 block">Demo</Link>
          <Link href="/pricing" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-primary transition-colors py-2 block">Pricing</Link>
        </div>
      )}
    </header>
  );
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

function GlobalNavSpacer() {
  const [location] = useLocation();
  if (location.startsWith("/admin") || location === "/coaching") return null;
  return <div style={{ height: "3.5rem" }} />;
}

function Router() {
  return (
    <>
      <GlobalBackground />
      <GlobalNav />
      <div style={{ position: "relative", zIndex: 1 }}>
      <GlobalNavSpacer />
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
      <Route path="/admin/documents" component={AdminDocumentsPage} />
      <Route path="/admin/security" component={AdminSecurityPage} />
      <Route path="/admin/monitoring" component={AdminMonitoringPage} />
      <Route path="/admin/analytics" component={AdminAnalyticsPage} />
      <Route path="/coaching" component={CoachingPage} />
      <Route path="/demo" component={DemoPage} />
      <Route path="/scenarios/:reportId" component={ScenariosPage} />
      <Route path="/plan/:reportId" component={PlanPage} />
      <Route path="/assessment" component={() => <RedirectTo to="/assess" />} />
      <Route path="/start" component={() => <RedirectTo to="/consent" />} />
      <Route path="/quiz" component={() => <RedirectTo to="/consent" />} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route component={NotFound} />
      </Switch>
      </div>
      <CookieNotice />
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
      <ClerkAuthBridge />
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
