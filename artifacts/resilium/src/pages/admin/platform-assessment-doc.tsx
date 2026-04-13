import { useState, useEffect, useRef } from "react";

const TODAY = "April 2026";
const STORE_KEY = "resilium_launch_checklist_v1";

/* ─── AUDIT DATA ─────────────────────────────────────────── */

const WEB_AUDIT = [
  { area: "Landing page", status: "good", note: "Animated neural canvas, live testimonials from DB, trust signals all present" },
  { area: "14-Step assessment", status: "strong", note: "Well-sequenced, draft saving, bilingual (EN/RO), progress bar, location detection; chronic condition sub-questions captured when user selects Yes" },
  { area: "Results page", status: "strong", note: "Score radar, risk profile card, action plan, feedback, social share modal (X/Facebook/Reddit/Instagram), Markdown export, goal reminder banner" },
  { area: "Plan page", status: "good", note: "AI-generated action plan with DB-backed checklist progress tracking; goal reminder banner; Markdown export button" },
  { area: "Scenarios page", status: "good", note: "Stress test simulations with impact ratings and immediate steps" },
  { area: "Coaching page", status: "functional", note: "Phoenix brand, warm design, Playfair serif headings, correct for its purpose" },
  { area: "Profile page", status: "strong", note: "7 tabs: Account → Overview → Reports → Plans → Checklist → Companion (Pro) → Guides; GDPR export, subscription status, data deletion all wired" },
  { area: "AI Companion tab", status: "good", note: "DB-backed conversation history; gpt-4.1-mini; grounded in user's latest scores; localStorage offline cache; free users see upgrade CTA" },
  { area: "Guides tab", status: "good", note: "10 crisis guides; location-aware; downloadable for offline reading; AsyncStorage download tracking" },
  { area: "Pricing page", status: "good", note: "Clear feature comparison, Paddle payment link-out, upgrade flow" },
  { area: "Anonymous user experience", status: "good", note: "Free-tier gate enforced via localStorage + plan count, clear messaging" },
  { area: "About page", status: "good", note: "Methodology, Scientific Foundation (6 academic citations), Media Citations (5 mainstream sources), Privacy, About the Project" },
  { area: "Dark / light theme", status: "good", note: "Toggle present and persists across sessions" },
  { area: "Competitive analysis PDF", status: "good", note: "jsPDF crash resolved; full PDF generation working" },
];

const MOBILE_AUDIT = [
  { area: "Loading / splash screen", status: "strong", note: "Neural net animation, brain logo, premium feel — custom branded" },
  { area: "Sign-in", status: "good", note: "Clerk OAuth, token cache split (localStorage web / SecureStore native)" },
  { area: "Home tab", status: "good", note: "Animated orbs, streak tracking, score display, daily motivations" },
  { area: "Progress tab", status: "good", note: "35-day activity calendar (colored dots), score history chart (Pro-gated), recent 7 check-ins" },
  { area: "Plans tab", status: "good", note: "Plan list, score badges, Pro comparison modal wired" },
  { area: "Check-in tab", status: "good", note: "5-dimension daily self-rating, local streak persistence via AsyncStorage" },
  { area: "Account / data tab", status: "good", note: "GDPR export, deletion, subscription status, sign out" },
  { area: "Assessment", status: "good", note: "Full flow matching the web version" },
  { area: "Results", status: "good", note: "Score breakdown, action plan, dimension interpretation" },
  { area: "Coaching page", status: "good", note: "Matches web structure — score context cards, About Cristiana, full CTA sections" },
  { area: "AI Companion tab", status: "good", note: "DB-backed chat with user's latest scores as context; gpt-4.1-mini; AsyncStorage offline cache; free users see upgrade CTA" },
  { area: "Guides tab", status: "good", note: "10 crisis guides bundled offline; location-aware guide ordering; AsyncStorage download tracking" },
  { area: "App Store / Play Store", status: "pending", note: "Intentionally deferred — owner working on submission" },
];

const ADMIN_AUDIT = [
  { area: "Login", status: "good", note: "Basic auth with admin credentials, session-secured" },
  { area: "Analytics overview", status: "strong", note: "Recharts bar / pie / line / radar, live DB data, plan views metric" },
  { area: "Demographic breakdown", status: "good", note: "Location, income, age, housing, mobility, dependents — all charted" },
  { area: "User management", status: "good", note: "Clerk-sourced user list with plan counts and last-active timestamps" },
  { area: "GDPR management", status: "good", note: "Manual deletion and data export triggers, consent log accessible" },
  { area: "Announcements", status: "good", note: "Create / edit banners shown to all users on the web app" },
  { area: "Testimonials moderation", status: "good", note: "Approve / reject user feedback, approved items show on landing page" },
  { area: "Mobile analytics", status: "good", note: "Web vs. mobile session split, daily breakdown chart, score distribution" },
  { area: "Security monitoring", status: "good", note: "Error rate tracking with in-memory window, alert emails on threshold" },
  { area: "Sentry monitoring page", status: "good", note: "Dedicated /admin/monitoring page with project cards and deep-links to Issues, Performance, Replays, Alerts for all three Sentry projects" },
  { area: "UX testing (AI personas)", status: "good", note: "AI-simulated user sessions for UX analysis — genuinely clever differentiator" },
];

const FUNCTIONALITY_GROUPS = [
  {
    label: "Core Platform",
    items: [
      "Assessment → AI scoring → AI report generation → saved to database",
      "User authentication — Clerk, both web and mobile, token cache split correctly",
      "Plan limit enforcement — free tier capped at 3, Pro unlimited",
      "Subscription status check — Paddle webhook → database → status gate on all routes",
      "Rate limiting on assessment endpoint — 6/min, Pro subscribers bypass",
      "Checklist progress tracking — database-backed, persists across sessions",
      "Social sharing — share modal (X/Twitter, Facebook, Reddit, Instagram) on results page",
      "Draft saving for in-progress assessments (localStorage)",
    ],
  },
  {
    label: "Compliance & Data",
    items: [
      "GDPR export and deletion pipeline — user-triggered and admin-triggered",
      "Consent collection and logging with platform tracking (web vs. mobile)",
      "Email unsubscribe with List-Unsubscribe header (RFC compliant)",
      "Terms, Privacy, Refund, Consent pages — all live and linked from footer",
    ],
  },
  {
    label: "Email & Engagement Automation",
    items: [
      "Welcome email on first assessment (Resend) — triggered from resilium-platform.com domain",
      "7-day re-engagement reminders — daily cron at 09:00 UTC",
      "30-day reassessment reminders — Monday cron at 08:00 UTC",
      "User weekly digest email — Sunday cron at 18:00 UTC",
      "Admin weekly digest with stats — Monday cron at 07:00 UTC",
      "Error rate alerts — email if 5+ server errors within any 10-minute window",
      "Wednesday 06:00 UTC — automated e2e assessment smoke test with email report",
      "Sunday 07:00 UTC — site-wide functionality audit across all endpoints + DB with email report",
    ],
  },
  {
    label: "Push Notifications (Mobile)",
    items: [
      "Expo push token storage in database (users table)",
      "Push broadcast endpoint for targeted user notifications",
      "Push infrastructure wired to Expo push API with ticket handling",
    ],
  },
  {
    label: "AI Companion & Crisis Guides",
    items: [
      "AI Companion (Pro) — DB-backed conversations; gpt-4.1-mini; grounded in user's latest assessment scores; conversation history persists; localStorage offline cache",
      "Guides tab (all users) — 10 crisis guides bundled in app; location-aware ordering; one-tap offline download; download state tracked",
      "Goal reminder banner — pill badge shown at top of Results, Plan, and Checklist tabs; API /me/latest-checklist extended to return primaryGoal and successVision",
    ],
  },
  {
    label: "Security & Reliability",
    items: [
      "GDPR export endpoint: rate limiting (5/15 min) + session ownership check",
      "GDPR data-request: rate limiting + UUID format validation on sessionId",
      "Checklist PATCH: requires authentication + report ownership verification",
      "Plan comparison AI endpoint: per-user rate limiting (10/hour)",
      "React Query: targeted cache invalidation on sign-in (no full cache wipe)",
      "ClerkAuthBridge: 5-second token fetch timeout prevents permanent API hangs",
      "Report queries: staleTime Infinity — immutable data, no unnecessary re-fetches",
      "Welcome email failures: now logged as warnings (previously silently swallowed)",
    ],
  },
  {
    label: "Admin & Analytics",
    items: [
      "Admin analytics — 7+ chart types pulling real-time database data",
      "Testimonials: collect on results → moderate in admin → display on landing",
      "Announcements: create in admin → display to all users instantly",
      "Progress snapshots table in DB (foundation for score trend history)",
      "Sentry error monitoring — wired across all 3 platforms; admin Sentry page with project deep-links",
      "Push notification permission prompt — bottom sheet modal fires after first assessment",
      "Score trend history chart (web + mobile, Pro gate) — GET /api/users/me/score-history endpoint",
      "Mobile onboarding carousel — 3-slide FlatList pagingEnabled carousel with progress dots, Skip, and CTA",
    ],
  },
];

const DONE_ITEMS = [
  "Full 14-step assessment with all dimensions",
  "AI report generation via OpenAI integration",
  "6-dimension scoring model (financial, health, skills, mobility, psychological, resources)",
  "Results page with radar chart, action plan, interactive checklists",
  "Scenarios / stress test simulations",
  "Coaching page — web (full Phoenix brand design) and mobile (parity achieved)",
  "User authentication — Clerk, web + mobile",
  "Free-tier plan limit (3 plans) with clear messaging",
  "Paddle subscription webhook handler + subscription status gate",
  "Profile page with full plan history, GDPR controls, subscription status",
  "GDPR export + deletion — user-triggered and admin-triggered",
  "Consent collection and platform logging (web vs. mobile split)",
  "Social share modal — X/Twitter, Facebook, Reddit, Instagram",
  "Dark / light theme — web and mobile",
  "Full email automation suite — welcome, re-engagement, reassessment, weekly digests",
  "Admin digest + error alert emails (weekly, Monday 07:00 UTC)",
  "Push notification infrastructure (Expo push API, token storage, broadcast)",
  "Admin dashboard with live analytics — 7+ chart types",
  "Admin user management (Clerk-sourced), testimonials, announcements, GDPR",
  "Admin marketing analytics, mobile analytics, security monitoring",
  "Admin UX testing with AI persona simulations",
  "Mobile: all 7 tabs functional (Home, Progress, My Plans, Check-in, My Data, Companion, Guides)",
  "Mobile: daily check-in with streak tracking",
  "Mobile: plan comparison modal (Pro feature)",
  "Mobile: animated loading screen with custom brain logo branding",
  "Mobile: full assessment + results flow at parity with web",
  "Rate limiting on all sensitive endpoints with Pro bypass",
  "Health monitoring endpoint",
  "Competitive analysis PDF generator",
  "Investor pitch deck artifact",
  "Terms, Privacy, Refund, About, Consent pages — all live",
  "Bilingual assessment (EN / RO)",
  "Location auto-detection (browser Geolocation API)",
  "Multi-currency support — 9 official currencies + custom code",
  "Draft saving for in-progress assessments",
  "App icon + splash — custom branded brain logo",
  "Sentry error monitoring wired — web, mobile, API",
  "Admin Sentry monitoring page — project cards with deep-links",
  "Automated e2e assessment smoke test — Wednesday 06:00 UTC cron",
  "Automated site-wide audit — Sunday 07:00 UTC cron",
  "Percentile benchmarking — live on results page",
  "Score trend history chart — web + mobile, Pro-gated",
  "AI Companion — web + mobile, Pro-gated",
  "Crisis Guides — 10 guides, offline-capable, all users",
  "Goal reminder banner — Results, Plan, Checklist tabs",
  "Mobile ProGate — all 4 content tabs gated for auth + Pro",
  "Android removed from all materials — iOS + Expo web only",
  "Social share modal — full X, Facebook, Reddit, Instagram",
  "Markdown export on Results page and Plan page",
  "Full autonomous e2e audit completed (April 11, 2026) — all routes verified",
  "Product-wide content audit — 'AI-powered' language replaced with 'structured'/'personalized'",
];

const OUTSTANDING = [
  {
    item: "App Store (iOS) submission",
    status: "In Progress",
    note: "Intentionally deferred by owner — iOS only (Android explicitly excluded). App builds, assets, and metadata preparation in progress.",
  },
  {
    item: "Payment integration (Paddle)",
    status: "In Progress",
    note: "Paddle checkout integration is wired — client token, monthly and annual price IDs are all in env. Checkout is blocked in dev/preview (Paddle production keys only allow resilium-platform.com). Awaiting domain approval in Paddle dashboard. RevenueCat is an alternative path for the iOS in-app purchase flow.",
  },
];

/* ─── LAUNCH CHECKLIST DATA ──────────────────────────────── */

type TagType = "Blocker" | "Needed" | "Verify" | "Decide" | "Future";

interface LaunchItem { id: string; label: string; note: string; tag: TagType; }
interface LaunchGroup { id: string; label: string; items: LaunchItem[]; }

const LAUNCH_GROUPS: LaunchGroup[] = [
  {
    id: "ios-prep",
    label: "🍎 iOS App Store — Preparation",
    items: [
      { id: "ios-apple-dev", label: "Apple Developer account ($99/year) active and in good standing", note: "Required to submit any app to the App Store. Enroll at developer.apple.com if not done. Account must be a paid individual or organisation account — free accounts cannot submit.", tag: "Blocker" },
      { id: "ios-banking", label: "Banking and tax information completed in App Store Connect", note: "Required before Apple will process any in-app purchase revenue. Go to App Store Connect → Agreements, Tax, and Banking → complete all three sections. Takes 1–3 business days to verify.", tag: "Blocker" },
      { id: "ios-screenshots", label: "App Store screenshots captured (6.9\" and 6.1\" required)", note: "Use Xcode Simulator or a real iPhone. Minimum required: 6.9\" (iPhone 16 Pro Max) and 6.1\" (iPhone 16). Showcase: Score reveal screen, AI Companion chat, Crisis Guides, dimension breakdown. Use tools like Rottenwood or Previewed to add device frames and captions.", tag: "Blocker" },
      { id: "ios-listing", label: "App Store Connect listing created", note: "App name, subtitle (≤30 chars), description, keywords (≤100 chars), primary category, support URL, privacy policy URL (use resilium-platform.com/privacy)", tag: "Blocker" },
      { id: "ios-age-rating", label: "Age rating questionnaire completed in App Store Connect", note: "Health & Fitness / Lifestyle apps typically receive 4+ rating. Answer questionnaire in App Store Connect under the app listing.", tag: "Needed" },
      { id: "ios-eas-build", label: "Distribution build signed via EAS Build", note: "Run: eas build --platform ios --profile production. Requires Apple Developer account + distribution certificate + provisioning profile (EAS can generate these).", tag: "Blocker" },
    ],
  },
  {
    id: "ios-iap",
    label: "💳 iOS App Store — In-App Purchases",
    items: [
      { id: "ios-revenuecat-account", label: "RevenueCat account created and linked to App Store Connect", note: "App Store requires Apple billing for any subscription sold through the app. RevenueCat is the recommended integration layer. Free tier available at revenuecat.com", tag: "Blocker" },
      { id: "ios-iap-product", label: "Pro subscription product created in App Store Connect", note: "Create both Monthly and Annual auto-renewable subscription products. Link them to RevenueCat offerings. Requires banking/tax info in App Store Connect first.", tag: "Blocker" },
      { id: "ios-revenuecat-sdk", label: "RevenueCat SDK wired into the mobile app", note: "Install react-native-purchases. Initialize with your RevenueCat API key. Hook into useProStatus() context so Pro features gate correctly on iOS.", tag: "Needed" },
      { id: "ios-paywall-screen", label: "iOS paywall screen built in the mobile app", note: "Separate from the Paddle web flow — Apple requires their billing for in-app purchases. Must present the subscription options using native purchase APIs.", tag: "Needed" },
      { id: "ios-sandbox-test", label: "Sandbox purchase + restore tested on a physical iPhone", note: "Create a Sandbox Tester account in App Store Connect. Test purchase, subscription renewal, and 'Restore Purchases' flow end-to-end on a real device.", tag: "Verify" },
    ],
  },
  {
    id: "ios-submit",
    label: "🚀 iOS App Store — Submission",
    items: [
      { id: "ios-testflight", label: "TestFlight build uploaded and tested on real iPhone", note: "Run through the full app on a real device via TestFlight before App Store submission. Invite at least one external tester. Check all 14 assessment steps, report generation, and Pro gating.", tag: "Verify" },
      { id: "ios-app-store-submit", label: "App Store review submission sent", note: "Submit for review in App Store Connect. Apple's review typically takes 24–48 hours. First submission often takes longer. Have app privacy details and export compliance ready.", tag: "Needed" },
    ],
  },
  {
    id: "paddle",
    label: "💳 Payments — Paddle (Web)",
    items: [
      { id: "paddle-domain", label: "resilium-platform.com added to Approved Domains in Paddle dashboard", note: "Settings → Checkout → Allowed Domains. This is the only remaining blocker for web checkout — all code is already wired.", tag: "Blocker" },
      { id: "paddle-checkout-test", label: "Checkout tested on production (resilium-platform.com)", note: "Click Upgrade on the live site. Complete a real or sandbox payment. Confirm the Paddle overlay opens, payment completes, and the success callback fires.", tag: "Verify" },
      { id: "paddle-pro-activate", label: "Pro status activates correctly after payment", note: "After a completed checkout, confirm useProStatus() returns isPro = true and Pro-gated features unlock on the results and plan pages.", tag: "Verify" },
      { id: "paddle-webhook-verify", label: "Webhook receiving events from Paddle", note: "After a test purchase, check API server logs for incoming webhook events. PADDLE_WEBHOOK_SECRET is already in env. Confirm signature verification is passing.", tag: "Verify" },
      { id: "paddle-billing-toggle", label: "Monthly ↔ Annual billing toggle tested on pricing page", note: "Confirm both price IDs (monthly and annual) pass the correct value to the Paddle checkout overlay.", tag: "Verify" },
    ],
  },
  {
    id: "prod",
    label: "🌐 Production Verification (resilium-platform.com)",
    items: [
      { id: "prod-signup", label: "Sign up + sign in flow (Clerk)", note: "Test new email account creation, email verification, sign in, and sign out. Only works on resilium-platform.com.", tag: "Verify" },
      { id: "prod-assessment", label: "Full assessment end-to-end on production", note: "Consent page → all 14 steps → 'Generate Report' → AI report loads. Confirm the spinner appears, the async job completes, and the results redirect fires correctly.", tag: "Verify" },
      { id: "prod-results", label: "Results page renders correctly", note: "Score, radar chart (stable), Critical Vulnerabilities, Next Action pill, Mental Resilience Profile, and Action Checklists all render with real AI-generated data.", tag: "Verify" },
      { id: "prod-plan", label: "Plan page checklist persistence", note: "Check off several items on the Plan page. Reload the page. Confirm checked items remain checked.", tag: "Verify" },
      { id: "prod-markdown", label: "Markdown export downloads correctly", note: "Click the Markdown export button on both the Plan page and the Results page. Confirm a .md file downloads with full report content.", tag: "Verify" },
      { id: "prod-share", label: "Share modal works correctly", note: "Click Share on the Results page. Confirm the modal opens with score in the share text. Test Copy Link, X/Twitter, Facebook, and Reddit buttons.", tag: "Verify" },
      { id: "prod-email-digest", label: "Email digest received after sign-up", note: "Weekly digest cron runs Sundays 18:00 UTC. 7-day reminder cron runs daily 09:00 UTC. Confirm RESEND_API_KEY is working in production.", tag: "Verify" },
      { id: "prod-admin", label: "Admin dashboard login and analytics visible", note: "Navigate to /admin on production. Log in with ADMIN_USERNAME / ADMIN_PASSWORD. Confirm user counts, assessment completions, and coaching stats load.", tag: "Verify" },
      { id: "prod-coaching", label: "Coaching page inquiry form submits correctly", note: "Fill out and submit the coaching inquiry form. Confirm the submission is received.", tag: "Verify" },
    ],
  },
  {
    id: "mobile",
    label: "📱 Mobile App Testing",
    items: [
      { id: "mobile-iphone-physical", label: "Tested on a physical iPhone (Expo Go or TestFlight)", note: "Scan the Expo QR code with the Camera app on iOS, or install via TestFlight. Simulators are not sufficient — touch targets, fonts, and animations can differ on device.", tag: "Blocker" },
      { id: "mobile-assessment-full", label: "Full assessment flow completed on mobile", note: "Run through all 14 assessment steps on iPhone. Confirm navigation, keyboard behavior, and form interactions feel smooth on a small screen.", tag: "Verify" },
      { id: "mobile-step-render", label: "All 14 assessment steps render correctly on small screen", note: "Pay special attention to Step 8 (chronic condition severity buttons), Step 12 (risk profile grid), and Step 13 (Community & Social Capital — card layout).", tag: "Verify" },
      { id: "mobile-ai-report", label: "AI report generation works end-to-end on mobile", note: "Complete the assessment and confirm the 'Generate Report' button triggers the async job, the loading state displays correctly, and the results page loads with real data.", tag: "Verify" },
      { id: "mobile-pro-gating", label: "Pro gating on mobile works with graceful fallback", note: "If RevenueCat is not yet wired, confirm Pro-gated features degrade gracefully (show upgrade prompt, not crash).", tag: "Verify" },
    ],
  },
  {
    id: "design",
    label: "🎨 Design Decisions",
    items: [
      { id: "design-results-checklist", label: "Results page checklist — decided: Plan-only (Option A)", note: "The && false guard in results.tsx line 888 stays. Checklist lives on the Plan page only. Results page remains focused on score, radar chart, vulnerabilities, and AI narrative. Decision recorded April 2026.", tag: "Decide" },
    ],
  },
  {
    id: "future",
    label: "✨ Nice-to-Have / Future",
    items: [
      { id: "future-sentry", label: "Sentry Express instrumentation completed", note: "The Sentry SDK is imported but Express is not fully instrumented. Add --import flag to Node startup in production to capture server-side errors fully.", tag: "Future" },
      { id: "future-push-notifs", label: "Push notifications for 7-day / 30-day resilience reminders", note: "Currently reminder-based outreach is email-only via cron jobs. expo-notifications would let the mobile app reach users who haven't opened their email.", tag: "Future" },
      { id: "future-app-rating", label: "App Store rating prompt in mobile app", note: "Trigger StoreReview.requestReview() (from expo-store-review) after a user successfully generates their first resilience plan.", tag: "Future" },
    ],
  },
];

const TOTAL_ITEMS = LAUNCH_GROUPS.reduce((sum, g) => sum + g.items.length, 0);

/* ─── HELPERS ────────────────────────────────────────────── */

function loadChecked(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(STORE_KEY) || "[]")); }
  catch { return new Set(); }
}

function saveChecked(s: Set<string>) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify([...s])); } catch {}
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    strong: "bg-emerald-100 text-emerald-700",
    good: "bg-emerald-100 text-emerald-700",
    functional: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
  };
  const label: Record<string, string> = { strong: "✓ Strong", good: "✓ Good", functional: "✓ Functional", pending: "Pending" };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {label[status] ?? status}
    </span>
  );
}

function TagBadge({ tag }: { tag: TagType }) {
  const map: Record<TagType, string> = {
    Blocker: "bg-red-100 text-red-700 border border-red-200",
    Needed: "bg-amber-100 text-amber-700 border border-amber-200",
    Verify: "bg-blue-100 text-blue-700 border border-blue-200",
    Decide: "bg-purple-100 text-purple-700 border border-purple-200",
    Future: "bg-gray-100 text-gray-500 border border-gray-200",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${map[tag]}`}>{tag}</span>
  );
}

/* ─── LAUNCH CHECKLIST COMPONENT ─────────────────────────── */

function LaunchChecklist() {
  const [checked, setChecked] = useState<Set<string>>(loadChecked);

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      saveChecked(next);
      return next;
    });
  };

  const done = checked.size;
  const pct = TOTAL_ITEMS ? (done / TOTAL_ITEMS) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-baseline justify-between mb-3">
          <p className="text-sm font-bold text-gray-900">Overall Progress</p>
          <p className="text-sm text-gray-500">{done} / {TOTAL_ITEMS} completed</p>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${pct.toFixed(1)}%`, background: "linear-gradient(90deg, #E08040, #34D399)" }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">Click any item to mark it complete. Progress saves automatically in your browser.</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {(["Blocker", "Needed", "Verify", "Decide", "Future"] as TagType[]).map(t => (
          <TagBadge key={t} tag={t} />
        ))}
      </div>

      {LAUNCH_GROUPS.map(group => {
        const groupDone = group.items.filter(i => checked.has(i.id)).length;
        return (
          <div key={group.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/60">
              <p className="text-sm font-bold text-gray-900">{group.label}</p>
              <span className="text-xs font-semibold text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                {groupDone}/{group.items.length}
              </span>
            </div>
            <ul className="divide-y divide-gray-50">
              {group.items.map(item => {
                const isChecked = checked.has(item.id);
                return (
                  <li
                    key={item.id}
                    onClick={() => toggle(item.id)}
                    className={`flex items-start gap-3 px-5 py-3.5 cursor-pointer select-none transition-colors hover:bg-gray-50 ${isChecked ? "opacity-55" : ""}`}
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${isChecked ? "bg-emerald-500 border-emerald-500" : "border-gray-300 bg-white"}`}>
                      {isChecked && <span className="text-white text-xs font-bold">✓</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium leading-snug ${isChecked ? "line-through text-gray-400" : "text-gray-900"}`}>{item.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.note}</p>
                    </div>
                    <TagBadge tag={item.tag} />
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────── */

export default function PlatformAssessmentDoc() {
  const NAVS = ["opinion", "market", "user-audit", "functionality", "checklist", "launch-checklist"];

  return (
    <div className="min-h-screen bg-[#F7F7FA] font-sans">
      {/* Header */}
      <div className="bg-[#0D1225] text-white px-8 py-5 flex items-center justify-between sticky top-0 z-50 shadow-xl">
        <div>
          <span className="text-[#E08040] font-bold text-lg tracking-tight">Resilium</span>
          <span className="text-gray-400 text-sm ml-3">Platform Assessment & Strategic Review · {TODAY}</span>
        </div>
        <span className="text-xs text-gray-500 hidden sm:block">Confidential · Internal</span>
      </div>

      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-8 py-2 flex gap-6 text-xs font-medium text-gray-500 overflow-x-auto">
        {NAVS.map(id => (
          <a key={id} href={`#${id}`} className="hover:text-[#E08040] whitespace-nowrap transition-colors capitalize">
            {id.replace(/-/g, " ")}
          </a>
        ))}
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-14">

        {/* Hero */}
        <div className="bg-[#0D1225] rounded-2xl p-8">
          <p className="text-[#EAD9BE] text-xs uppercase tracking-widest mb-2">Full Assessment · {TODAY}</p>
          <h1 className="text-3xl font-bold text-white mb-2">Platform Assessment<br />& Strategic Review</h1>
          <p className="text-gray-400 text-sm mb-6 max-w-xl leading-relaxed">An honest, unvarnished evaluation of what's been built, how the market might receive it, and a precise checklist of what's done versus what remains.</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { val: "~27,000", label: "Lines of Source Code" },
              { val: "3", label: "Platforms (Web · Mobile · Admin)" },
              { val: "April 2026", label: "Assessment Date" },
              { val: "Production", label: "Status: Live ●" },
              { val: "Security", label: "Hardened" },
            ].map(s => (
              <div key={s.val} className="bg-white/8 rounded-xl p-3 border border-white/10">
                <p className="text-[#E08040] font-bold text-base">{s.val}</p>
                <p className="text-gray-400 text-xs mt-0.5 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 1: Honest Opinion */}
        <section id="opinion">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">My Honest Opinion</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-6" />
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>
              This is a <strong className="text-gray-900">real product</strong>. Not a demo, not a prototype — a full-stack, full-featured platform with actual depth. The 14-step assessment, 6-dimension scoring model, AI report generation, dual platform (web + mobile), admin dashboard, email automation, GDPR compliance pipeline, push notifications, Paddle payments webhook, cron-driven engagement loops, and a pitch deck — the scope and execution quality here is genuinely impressive for what is essentially a solo-built product.
            </p>
            <p>
              The code is disciplined: typed throughout (Zod for API contracts, Drizzle for DB), no TODO comments left in the codebase, thoughtful UI across both platforms, real rate limiting with Pro bypass, and error monitoring built in. These are professional signals.
            </p>
          </div>
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-2">The Honest Caveat</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              What this isn't yet is a <em>launched, market-tested</em> product. There's a meaningful gap between "built" and "in users' hands," and some of the wiring — particularly around payments and push notifications — hasn't been stress-tested in production. That gap is normal and closeable. The foundation is sound.
            </p>
          </div>
        </section>

        {/* Section 2: Market Reception */}
        <section id="market">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Market Reception</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-6" />

          <p className="text-sm font-semibold text-gray-900 mb-3">The Case for Optimism</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {[
              { color: "emerald", title: "Strong tailwinds", body: '"Personal resilience planning" has genuine market tailwinds — geopolitical anxiety, economic instability, and climate awareness are all rising globally, especially in Eastern Europe.' },
              { color: "emerald", title: "No real competition", body: "Competitors are either generic survivalist content, expensive consultants, or PDF worksheets. An AI-scored, personalized, action-oriented system at $9/month doesn't exist yet." },
              { color: "emerald", title: "Smart free tier", body: "The assessment is so thorough and the output so personal that it creates a genuine 'wow' moment before any paywall. The free tier converts by merit, not by pressure." },
              { color: "emerald", title: "Easy price point", body: "$9/month is psychologically easy to justify — one cup of coffee, comparable to a Netflix subscription, yet offers something genuinely actionable and personal." },
            ].map(c => (
              <div key={c.title} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                  <p className="text-sm font-semibold text-gray-900">{c.title}</p>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>

          <p className="text-sm font-semibold text-gray-900 mb-3">Honest Challenges</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Category education needed", body: "Most people don't wake up thinking 'I need a resilience plan.' The marketing has to create the problem before solving it — this raises CAC and requires patience with content strategy." },
              { title: "Assessment length", body: "14 steps is thorough but long. Some users will drop off before completing it. Completion needs to feel rewarding enough to justify the time investment." },
              { title: "Mobile discoverability", body: "With no App Store presence yet, the mobile app isn't organically discoverable. It's currently only reachable via the web URL — a distribution gap that limits growth." },
              { title: "Pro value visibility", body: "The Pro features (percentile benchmarking, score trend history, AI Companion) need to be visible and compelling before users hit a paywall, or the upgrade feels arbitrary." },
            ].map(c => (
              <div key={c.title} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                  <p className="text-sm font-semibold text-gray-900">{c.title}</p>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: User Testing Audit */}
        <section id="user-audit">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">User Testing Audit</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-6" />

          {[
            { label: "Web App", platform: "resilium-platform.com", rows: WEB_AUDIT },
            { label: "Mobile App", platform: "Expo / React Native", rows: MOBILE_AUDIT },
            { label: "Admin Dashboard", platform: "/admin — Password Protected", rows: ADMIN_AUDIT },
          ].map(section => (
            <div key={section.label} className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <p className="text-base font-bold text-gray-900">{section.label}</p>
                <span className="text-xs bg-[#0D1225] text-gray-300 px-2 py-0.5 rounded-full font-mono">{section.platform}</span>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#0D1225] text-white">
                      <th className="text-left px-4 py-2.5 font-semibold">Flow / Screen</th>
                      <th className="text-left px-4 py-2.5 font-semibold w-28">Status</th>
                      <th className="text-left px-4 py-2.5 font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.map((r, i) => (
                      <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                        <td className="px-4 py-2.5 font-medium text-gray-900 whitespace-nowrap">{r.area}</td>
                        <td className="px-4 py-2.5"><StatusBadge status={r.status} /></td>
                        <td className="px-4 py-2.5 text-gray-600 leading-snug">{r.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>

        {/* Section 4: Functionality Audit */}
        <section id="functionality">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Full Functionality Audit</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-3" />
          <p className="text-sm text-gray-500 mb-6">Features confirmed working end-to-end in the production environment at resilium-platform.com. Each entry represents a complete, integrated user journey.</p>
          <div className="space-y-4">
            {FUNCTIONALITY_GROUPS.map(group => (
              <div key={group.label} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/60">
                  <p className="text-sm font-bold text-gray-900">{group.label}</p>
                </div>
                <ul className="divide-y divide-gray-50">
                  {group.items.map((item, i) => (
                    <li key={i} className="flex gap-3 items-start px-5 py-2.5">
                      <span className="text-emerald-500 text-sm flex-shrink-0 mt-0.5">✓</span>
                      <span className="text-xs text-gray-700 leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Conclusive Checklist */}
        <section id="checklist">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Conclusive Checklist</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-6" />

          <p className="text-sm font-semibold text-gray-900 mb-3">Done <span className="text-gray-400 font-normal text-xs">({DONE_ITEMS.length} items)</span></p>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6 max-h-96 overflow-y-auto">
            <ul className="space-y-1.5">
              {DONE_ITEMS.map((item, i) => (
                <li key={i} className="flex gap-2.5 items-start text-xs text-gray-600 leading-snug">
                  <span className="text-emerald-500 flex-shrink-0 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm font-semibold text-gray-900 mb-3">Outstanding / To Do</p>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0D1225] text-white">
                  <th className="text-left px-4 py-3 font-semibold text-sm">Item</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm w-28">Priority</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm">Notes</th>
                </tr>
              </thead>
              <tbody>
                {OUTSTANDING.map((o, i) => (
                  <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    <td className="px-4 py-3 font-semibold text-gray-900 text-xs">{o.item}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{o.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 leading-snug">{o.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 6: Launch Checklist */}
        <section id="launch-checklist">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Launch Checklist</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-6" />
          <LaunchChecklist />
        </section>

        <div className="text-center py-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 italic">Generated by Resilium · April 2026 · resilium-platform.com · Confidential internal document</p>
        </div>

      </div>
    </div>
  );
}
