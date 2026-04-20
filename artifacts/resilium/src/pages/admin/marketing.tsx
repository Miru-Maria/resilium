import React, { useState } from "react";
import { AdminLayout } from "./layout";
import {
  Rocket, MessageSquare, BarChart2, ChevronDown, ChevronRight,
  CheckSquare, Square, Calendar, Target, FileText,
  Newspaper, Globe, Search, BookOpen, TrendingUp, Megaphone, Map,
  Smartphone, ShieldCheck, Clock, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

type SectionKey = "master-checklist" | "mobile-launch" | "product-hunt" | "reddit" | "research-report";

/* ─── MOBILE LAUNCH CHECKLIST ─────────────────────────────── */

const MOBILE_STORE_KEY = "resilium_launch_checklist_v2";

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
      { id: "ios-paywall-screen", label: "iOS paywall screen built in the mobile app", note: "Separate from the Stripe web flow — Apple requires their own billing for in-app purchases. Must present the subscription options using native purchase APIs via RevenueCat.", tag: "Needed" },
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
];

const MOBILE_TOTAL = LAUNCH_GROUPS.reduce((sum, g) => sum + g.items.length, 0);

function loadMobileChecked(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(MOBILE_STORE_KEY) || "[]")); }
  catch { return new Set(); }
}
function saveMobileChecked(s: Set<string>) {
  try { localStorage.setItem(MOBILE_STORE_KEY, JSON.stringify([...s])); } catch {}
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

function MobileLaunchChecklistSection() {
  const [checked, setChecked] = useState<Set<string>>(loadMobileChecked);

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      saveMobileChecked(next);
      return next;
    });
  };

  const done = checked.size;
  const pct = MOBILE_TOTAL ? (done / MOBILE_TOTAL) * 100 : 0;

  return (
    <div className="px-6 py-6 space-y-6">
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
        <div className="flex items-baseline justify-between mb-3">
          <p className="text-sm font-bold text-gray-900">Overall Progress</p>
          <p className="text-sm text-gray-500">{done} / {MOBILE_TOTAL} completed</p>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${pct.toFixed(1)}%`, background: "linear-gradient(90deg, #E08040, #34D399)" }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">Click any item to mark it complete. Progress saves automatically in your browser.</p>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {(["Blocker", "Needed", "Verify", "Decide", "Future"] as TagType[]).map(t => (
          <TagBadge key={t} tag={t} />
        ))}
        <span className="text-gray-400 text-xs ml-1 self-center">— tag legend</span>
      </div>

      {LAUNCH_GROUPS.map(group => {
        const groupDone = group.items.filter(i => checked.has(i.id)).length;
        return (
          <div key={group.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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

function SectionHeader({
  icon: Icon,
  label,
  title,
  isOpen,
  onToggle,
}: {
  icon: React.ElementType;
  label: string;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center gap-4 p-6 text-left hover:bg-slate-50 transition-colors rounded-t-2xl"
    >
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-0.5">{label}</p>
        <h2 className="text-lg font-bold font-display text-gray-900">{title}</h2>
      </div>
      {isOpen ? (
        <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
      ) : (
        <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
      )}
    </button>
  );
}

function ChecklistItem({ text, detail }: { text: string; detail?: string }) {
  const storageKey = `admin_mkt::${text}`;
  const [checked, setChecked] = useState(() => {
    try { return localStorage.getItem(storageKey) === "1"; } catch { return false; }
  });
  const toggle = () => {
    const next = !checked;
    setChecked(next);
    try { localStorage.setItem(storageKey, next ? "1" : "0"); } catch {}
  };
  return (
    <li
      className="flex items-start gap-3 cursor-pointer group"
      onClick={toggle}
    >
      {checked ? (
        <CheckSquare className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
      ) : (
        <Square className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5 group-hover:text-slate-600 transition-colors" />
      )}
      <div>
        <span className={cn("text-sm", checked ? "line-through text-gray-400" : "text-gray-900")}>{text}</span>
        {detail && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{detail}</p>}
      </div>
    </li>
  );
}

function CompletedItem({ text, detail }: { text: string; detail?: string }) {
  return (
    <li className="flex items-start gap-3 opacity-60">
      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
      <div>
        <span className="text-sm line-through text-gray-500">{text}</span>
        {detail && <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{detail}</p>}
      </div>
    </li>
  );
}

function CategoryHeading({ icon: Icon, children }: { icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mt-8 mb-3 first:mt-0">
      {Icon && <Icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
      <span className="text-xs font-bold uppercase tracking-widest text-primary">{children}</span>
      <div className="flex-1 h-px bg-primary/20" />
    </div>
  );
}

function MasterChecklistSection() {
  return (
    <div className="px-6 pb-8">
      <p className="text-sm text-gray-500 leading-relaxed mb-4">
        Every action item across all channels in one flat list. Check items off as you complete them — progress saves automatically. Open the sections below for detailed copy templates, Reddit strategy, and research report guidance.
      </p>

      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
        <Clock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Stripe is configured but real payments are blocked</p>
          <p className="text-xs text-amber-700 mt-0.5">Requires SRL CUI from Registrul Comerțului. Once approved: submit business details + Romanian IBAN in Stripe Dashboard → swap to live keys → payments go live. Stripe Tax / VAT configuration follows after CUI.</p>
        </div>
      </div>

      {/* ── Business & Payments ──────────────────────────────────────────── */}
      <CategoryHeading icon={Target}> Business &amp; Payments</CategoryHeading>
      <ul className="space-y-3">
        <ChecklistItem
          text="Register SRL with Registrul Comerțului"
          detail="This is the prerequisite for everything below. Obtain your CUI (tax ID) — required for Stripe business verification, VAT configuration, and legal invoicing."
        />
        <ChecklistItem
          text="Complete Stripe business verification"
          detail="In Stripe Dashboard: add business details, representative identity, and Romanian IBAN for payouts. Requires SRL CUI."
        />
        <ChecklistItem
          text="Swap Stripe keys to live mode once verification is approved"
          detail="Replace STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, and STRIPE_WEBHOOK_SECRET in Replit Secrets with live values. Then run the seed script to create products in the live account."
        />
        <ChecklistItem
          text="Configure Stripe Tax for VAT collection"
          detail="Enable in Stripe Dashboard → Tax. Select Romania as origin, add EU VAT rules. Required before charging EU customers as a business."
        />
        <ChecklistItem
          text="Enable the post-assessment email drip sequence"
          detail="Set DRIP_EMAILS_ENABLED=true in Replit Secrets. Sends 5 targeted emails (Days 0, 2, 5, 9, 14) to free users after each assessment to drive Pro upgrades. Activate once the payment system is live."
        />
        <ChecklistItem
          text="Test full payment flow with a real card"
          detail="Test both monthly ($9) and annual ($79) plans. Confirm Pro features unlock immediately after payment, and that the customer portal lets users manage/cancel."
        />
        <ChecklistItem
          text="Test the complete new-user journey end to end"
          detail="Incognito browser: land on homepage → take assessment → view results → upgrade to Pro → confirm all Pro features work. Do this as a fresh incognito user."
        />
        <ChecklistItem
          text="Verify first Pro renewal webhook fired correctly"
          detail="Check Stripe Dashboard → Developers → Webhooks after the first subscription renewal cycle. Confirm invoice.payment_succeeded was received and the renewal email was sent."
        />
      </ul>

      {/* ── Technical & Monitoring ───────────────────────────────────────── */}
      <CategoryHeading icon={Globe}> Technical &amp; Monitoring</CategoryHeading>
      <ul className="space-y-3">
        <ChecklistItem
          text="Set up web analytics (Plausible recommended — GDPR-friendly)"
          detail="Add Plausible script to index.html. No cookie consent required — it's cookieless by design. Gives you visitor → assessment → upgrade funnel visibility."
        />
        <CompletedItem
          text="OpenGraph preview verified"
          detail="resilium-platform.com confirmed rendering correctly on opengraph.xyz — correct image, title, and description. April 2026."
        />
        <CompletedItem
          text="sitemap.xml submitted to Google Search Console"
          detail="Sitemap submitted and indexed. Site property active in Google Search Console."
        />
        <ChecklistItem
          text="Run monthly dependency security audit"
          detail="Schedule for first Monday of each month. Checks for newly disclosed vulnerabilities in Clerk, Drizzle, Vite, and other packages."
        />
        <ChecklistItem
          text="Monitor assessment completion rate (target: >50% of starts)"
          detail="Check the admin analytics dashboard. If drop-off is high, check which step loses users and simplify that step."
        />
        <ChecklistItem
          text="Monitor free → Pro conversion rate (target: >5% at 90 days)"
          detail="Track via Stripe Dashboard MRR growth vs. Clerk user count. Email drip sequence should materially improve this."
        />
        <ChecklistItem
          text="Review Sentry weekly for new error patterns"
          detail="Even one week of real users will surface edge cases. Filter by 'new issues' since launch date."
        />
        <ChecklistItem
          text="Check Clerk Dashboard for first real signups"
          detail="Look for any bot/spam sign-up patterns. Review the 'Users' tab in Clerk production dashboard."
        />
      </ul>

      {/* ── Legal & Compliance ───────────────────────────────────────────── */}
      <CategoryHeading icon={ShieldCheck}> Legal &amp; Compliance</CategoryHeading>
      <ul className="space-y-3">
        <CompletedItem
          text="Privacy Policy page live"
          detail="Live at /privacy since March 24, 2026."
        />
        <CompletedItem
          text="Terms of Service page live"
          detail="Live at /terms since April 7, 2026."
        />
        <CompletedItem
          text="Cookie / GDPR consent notice implemented"
          detail="Cookie bar on first visit. Dismissal persisted in localStorage. April 2026."
        />
        <CompletedItem
          text="GDPR data collection consent flow with audit log"
          detail="Full consent page at /consent. Consent entries logged to database per GDPR Art. 6(1)(a)."
        />
        <CompletedItem
          text="Resend domain SPF/DKIM records verified"
          detail="resilium-platform.com confirmed as DNS verified and Domain verified in Resend dashboard (Apr 7, 2026). Email deliverability is secure."
        />
        <ChecklistItem
          text="Publish GDPR contact email address"
          detail="Add a GDPR/data subject requests email address to the Privacy Policy and contact page. Required for Art. 17 deletion and Art. 15 access requests."
        />
      </ul>

      {/* ── Product Hunt Launch ───────────────────────────────────────────── */}
      <CategoryHeading icon={Rocket}> Product Hunt Launch</CategoryHeading>
      <ul className="space-y-3">
        <ChecklistItem
          text="Confirm your Product Hunt hunter"
          detail="Ask someone with PH followers and a history of successful hunts to post for you. A hunter with 500+ followers measurably improves Day 1 performance."
        />
        <ChecklistItem
          text="Prepare Product Hunt gallery — 7 images + thumbnail at 1270×760 px"
          detail="Full copy and caption guidance is in the Product Hunt section below. Export from Figma or Canva at exactly 1270×760 px for best display."
        />
        <ChecklistItem
          text="Finalise Product Hunt headline, tagline, and description copy"
          detail="Ready-to-paste copy is in the Product Hunt section below. Read and personalise before publishing."
        />
        <ChecklistItem
          text="Draft first maker comment (post within 2 minutes of going live)"
          detail="Template is in the Product Hunt section below. Copy it, personalise the opening line, and paste it immediately after launch."
        />
        <ChecklistItem
          text="Notify personal network 24 hours before launch"
          detail="Email and WhatsApp contacts asking them to visit the PH page and upvote at the exact launch time. Pre-launch votes don't count."
        />
        <ChecklistItem
          text="Schedule community posts for PH launch day"
          detail="r/preppers, r/personalfinance, r/selfimprovement. Post the launch link with a personal note — not just the URL."
        />
        <ChecklistItem
          text="Prepare Twitter/X launch thread"
          detail="7-tweet thread covering: what Resilium does, the problem it solves, one compelling data point, how it works (3 steps), and the PH link."
        />
        <ChecklistItem
          text="Go live on Product Hunt at 12:01 AM Pacific Time (Tuesday–Thursday)"
          detail="Tuesday–Thursday launches perform best. 12:01 AM PT gives you a full 24-hour window."
        />
        <ChecklistItem
          text="Post first maker comment immediately after launch"
          detail="Paste the pre-written comment from the Product Hunt section below. The first comment anchors the conversation."
        />
        <ChecklistItem
          text="Respond to every PH comment within 30 minutes throughout launch day"
          detail="Engagement velocity is a PH ranking signal. Stay on the page all day. Thank every upvoter who comments."
        />
        <ChecklistItem
          text="Write 24-hour retrospective post (Medium or Substack)"
          detail="Generates backlinks, SEO, and personal brand. Publish ~T+24h with honest numbers: upvotes, signups, conversions, lessons."
        />
      </ul>

      {/* ── Reddit & Content ──────────────────────────────────────────────── */}
      <CategoryHeading icon={MessageSquare}> Reddit &amp; Content</CategoryHeading>
      <ul className="space-y-3">
        <ChecklistItem
          text="Week 1 — 5–8 substantive comments/day in r/preppers, r/personalfinance, r/anxiety"
          detail="No links, no product mentions. Genuine, helpful answers only. You're building karma and credibility. Post timing: 8–10 AM or 6–9 PM ET."
        />
        <ChecklistItem
          text="Week 2 — Post original value discussions in r/selfimprovement, r/financialindependence, r/Frugal"
          detail="Share methodology, frameworks, or data. Zero product mentions. Templates are in the Reddit section below."
        />
        <ChecklistItem
          text="Week 3 — Soft introduction: mention Resilium organically in relevant threads"
          detail="Only when directly relevant. One link per thread maximum. Never in reply to your own posts."
        />
        <ChecklistItem
          text="Week 4 — Post 'I built this' in r/preppers and r/selfimprovement"
          detail="Full post templates are in the Reddit section below. Authentic story of why you built it. Lead with the problem, not the product."
        />
        <ChecklistItem
          text="Write first 3 SEO articles — target: 'personal resilience plan', 'emergency preparedness checklist', 'resilience score assessment'"
          detail="2,000–3,000 words each. Original research angle wherever possible. Internal link to /assess and /pricing from each article."
        />
        <ChecklistItem
          text="Email a personal T+24h founder note to everyone who signed up on launch day"
          detail="Plain text. One sentence on what you're building and why. Ask one question: 'What made you sign up?' Builds early community."
        />
      </ul>

      {/* ── Research Report ───────────────────────────────────────────────── */}
      <CategoryHeading icon={BarChart2}> Research Report</CategoryHeading>
      <ul className="space-y-3">
        <ChecklistItem
          text="Distribute Google Forms survey to Resilium users and target Reddit communities"
          detail="Target: 500+ valid responses as minimum for publishable research. Full distribution plan is in the Research section below."
        />
        <ChecklistItem
          text="Reach 1,000+ survey responses for credible demographic breakdowns"
          detail="Above 1,000 responses you can reliably break down by age, income, country, and household structure — making the research genuinely citable."
        />
        <ChecklistItem
          text="Write the 'State of Personal Resilience 2026' report (7 sections)"
          detail="Full structure and section descriptions are in the Research section below. Aim for 4,000–6,000 words with charts. Publish as a dedicated landing page."
        />
        <ChecklistItem
          text="Pitch the report to 5 journalists in personal finance, preparedness, and wellness"
          detail="Target beats: personal finance editors at major outlets, preparedness/prepping writers, mental health and wellness journalists. Use data as the hook."
        />
      </ul>

      {/* ── Pre-Launch Production Verification ───────────────────────────── */}
      <CategoryHeading icon={CheckCircle2}> Pre-Launch Production Verification</CategoryHeading>
      <ul className="space-y-3">
        <ChecklistItem
          text="Sign up + sign in flow works end-to-end on production (Clerk)"
          detail="Test new email account creation, email verification, sign in, and sign out on resilium-platform.com. Clerk authentication only works on the production domain."
        />
        <ChecklistItem
          text="Full 14-step assessment completes correctly on production"
          detail="Consent page → all 14 steps → 'Generate Report' → AI report loads. Confirm the spinner appears, the async job completes, and the results redirect fires correctly."
        />
        <ChecklistItem
          text="Results page renders with real AI-generated data"
          detail="Score, radar chart, Critical Vulnerabilities, Next Action pill, Mental Resilience Profile, and Action Checklists all render with real data — not placeholder content."
        />
        <ChecklistItem
          text="Plan page checklist items persist after page reload"
          detail="Check off several items on the Plan page. Reload the page. Confirm checked items remain checked — verifying DB-backed persistence is working."
        />
        <ChecklistItem
          text="Markdown export downloads correctly from Results and Plan pages"
          detail="Click the Markdown export button on both the Plan page and the Results page. Confirm a .md file downloads with full report content."
        />
        <ChecklistItem
          text="Share modal opens and all share buttons work"
          detail="Click Share on the Results page. Confirm the modal opens with score in the share text. Test Copy Link, X/Twitter, Facebook, and Reddit buttons."
        />
        <ChecklistItem
          text="Coaching page inquiry form submits correctly"
          detail="Fill out and submit the coaching inquiry form. Confirm the submission is received."
        />
        <ChecklistItem
          text="Admin dashboard accessible and analytics data loads"
          detail="Navigate to /admin on production. Confirm user counts, assessment completions, and coaching stats load from the live database."
        />
        <ChecklistItem
          text="Email delivery confirmed working in production"
          detail="Trigger a welcome or digest email and confirm it arrives. Check Resend dashboard for delivery confirmation. Verify SPF/DKIM records are confirmed in Resend."
        />
      </ul>

      {/* ── Future / Nice-to-Have ─────────────────────────────────────────── */}
      <CategoryHeading icon={Clock}> Future / Nice-to-Have</CategoryHeading>
      <ul className="space-y-3">
        <ChecklistItem
          text="Complete Sentry Express server-side instrumentation"
          detail="The Sentry SDK is imported but Express is not fully instrumented. Add the --import flag to the Node startup command in production to capture all server-side errors."
        />
        <ChecklistItem
          text="Push notifications for 7-day / 30-day resilience reminders"
          detail="Currently reminder outreach is email-only via cron jobs. expo-notifications would allow the mobile app to reach users who don't open emails."
        />
        <ChecklistItem
          text="App Store rating prompt after first resilience plan generated"
          detail="Trigger StoreReview.requestReview() (from expo-store-review) after a user successfully generates their first plan. Best time to ask for a review."
        />
      </ul>

      {/* ── Mobile — post-launch ─────────────────────────────────────────── */}
      <CategoryHeading icon={Smartphone}> Mobile — Post-Launch (When Web Has Traction)</CategoryHeading>
      <ul className="space-y-3">
        <ChecklistItem
          text="Enable Facebook OAuth in Clerk"
          detail="Clerk Dashboard → Configure → Social Connections → Facebook. Required for Facebook sign-in in the mobile app."
        />
        <ChecklistItem
          text="iOS App Store submission — see Mobile Launch Checklist section on this page"
          detail="Full iOS submission checklist (Apple Developer account, screenshots, App Store Connect listing, EAS build, RevenueCat IAP, TestFlight) is in the Mobile Launch Checklist section below."
        />
      </ul>
    </div>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-bold uppercase tracking-widest text-primary mt-6 mb-3 flex items-center gap-2">
      {children}
    </h3>
  );
}

function CopyBlock({ label, children }: { label: string; children: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="text-xs text-primary hover:underline focus:outline-none"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-slate-100 rounded-xl p-4 border border-slate-200 font-sans leading-relaxed">
        {children}
      </pre>
    </div>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-primary/8 border border-primary/20 rounded-xl p-4 text-sm text-gray-700 leading-relaxed mb-4">
      {children}
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 mb-4">
      <table className="w-full text-sm">
        <thead className="bg-slate-100">
          <tr>
            {headers.map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rows.map((row, ri) => (
            <tr key={ri} className="hover:bg-slate-50 transition-colors">
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-3 text-gray-800 align-top">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductHuntSection() {
  return (
    <div className="px-6 pb-8 space-y-1">

      <InfoBox>
        All copy below is ready to paste directly into Product Hunt. Lead with the "honest, scored picture" angle — specific, structured, and gap-focused. Avoid vague superlatives; the product sells itself by being concrete where everything else is generic.
      </InfoBox>

      <SubHeading><Megaphone className="w-4 h-4" /> Core Copy</SubHeading>

      <CopyBlock label="Headline (max 60 chars)">
        Resilium — Your Personal Resilience Profile
      </CopyBlock>

      <CopyBlock label="Tagline (max 60 chars)">
        Know exactly where you stand before disruption finds you.
      </CopyBlock>

      <CopyBlock label="Short Description (≤ 260 chars)">
        {`Resilium gives you a scored, structured resilience report across 6 life dimensions — finances, health, skills, mobility, psychology, and emergency resources — with a prioritized action plan tailored to your specific answers. Assess individually or as a full household. No email required.`}
      </CopyBlock>

      <CopyBlock label="Long-Form Product Description">
        {`Most people don't realize how exposed they are until a job loss, health crisis, or geopolitical shock forces their hand. By then, the window to prepare is already closed.

Resilium is a privacy-first platform that gives you an honest, scored picture of where you actually stand — across the financial, physical, psychological, and logistical dimensions that determine how well you weather disruption.

A single composite score you can improve over time, built from a structured assessment that takes 10–15 minutes to complete.

→ 6 resilience dimensions, each scored 0–100
→ Household Assessment mode — assess your full family's readiness together (adults, dependents, mobility needs)
→ Personalized action plan with prioritized next steps based on your specific answers
→ Mental resilience profile across 6 psychological dimensions
→ Scenario planning: see how your profile shifts under job loss, health emergency, relocation
→ Progress tracking: retake, compare, improve
→ AI Companion grounded in your scores — ask anything about your specific gaps (Pro)
→ 15 crisis guides, location-aware, downloadable for offline use (free for all users)
→ No name or email required for your full report. Privacy-first by design.

This is not a quiz with generic tips. It's a structured, scored assessment that reflects your specific circumstances and tells you exactly what to work on next.`}
      </CopyBlock>

      <SubHeading><MessageSquare className="w-4 h-4" /> Maker's First Comment</SubHeading>
      <CopyBlock label="First Comment (post immediately at launch)">
        {`Hey Product Hunt! 👋 I'm the person behind Resilium.

I built this because I found myself anxious about "big picture" disruption risks — inflation, geopolitical instability, potential job loss — but couldn't find a tool that gave me an honest picture of where I actually stood. Everything I found was either generic advice, prepper-adjacent content, or surveys with no real output.

So I built a structured, scored resilience assessment across 6 life dimensions — because vague reassurance doesn't help, but knowing exactly which gaps to close does.

A few things I'd love to hear from you:
1. Which of the 6 dimensions surprises you most about your own situation?
2. What scenario would you most want to stress-test? (job loss, health crisis, relocation, etc.)
3. What's missing that would make this genuinely useful for your life?

The assessment is free and anonymous — no email required. Takes about 12 minutes. Would love your honest feedback. 🙏`}
      </CopyBlock>

      <SubHeading><Target className="w-4 h-4" /> Gallery Image Captions</SubHeading>
      <Table
        headers={["#", "Image Concept", "Caption"]}
        rows={[
          ["1", "Overall score screen — circular progress dial", "Your Resilium Score: one number that tells you how ready you actually are."],
          ["2", "Radar chart — 6-dimension breakdown", "Six dimensions. One honest picture. See exactly where you're strong and where you're exposed."],
          ["3", "Action checklist for lowest-scoring area", "Not generic tips — a prioritized action plan built around your specific gaps."],
          ["4", "Scenario modelling UI", "\"What if I lost my job tomorrow?\" Model disruption scenarios and see how your resilience profile shifts."],
          ["5", "Mental Resilience Profile cards", "Psychological readiness matters as much as logistics. Both are measured and both are actionable."],
          ["6", "AI Companion chat (Pro)", "Ask anything specific to your situation — gaps, location, next steps. Not generic advice."],
          ["7", "Crisis Guides accordion (all users)", "15 practical, location-relevant guides — readable in-app or downloaded for offline use."],
          ["8", "Household Assessment results screen", "Not just for individuals. Assess your full household and get a shared Resilience Score — adults, dependents, mobility needs accounted for."],
        ]}
      />

      <SubHeading><Calendar className="w-4 h-4" /> Launch Day Checklist</SubHeading>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Before Launch (T−7 to T−1 days)</p>
          <ul className="space-y-3">
            <ChecklistItem text="Confirm your hunter — ask someone with Product Hunt followers and history" />
            <ChecklistItem text="Prepare the full gallery: 7 images, thumbnail, logo (all 1270×760 px)" />
            <ChecklistItem text="Finalise all copy: headline, tagline, short + long description" />
            <ChecklistItem text="Draft the first comment in advance — post it within 2 minutes of launch" />
            <ChecklistItem text="Notify your personal network (email/WhatsApp) to vote at launch time" />
            <ChecklistItem text="Schedule community posts in r/preppers, r/personalfinance, r/selfimprovement for day-of" />
            <ChecklistItem text="Prepare a short Twitter/X thread summarising the product story" />
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Launch Day (12:01 AM PT)</p>
          <ul className="space-y-3">
            <ChecklistItem text="Go live at 12:01 AM Pacific Time (reset hour)" detail="Earlier is better — more hours to accumulate votes." />
            <ChecklistItem text="Post the first comment immediately after launch" />
            <ChecklistItem text="Share the launch link in every relevant Slack/Discord community you're in" />
            <ChecklistItem text="Post Twitter/X thread tagging Product Hunt" />
            <ChecklistItem text="Respond to every comment within 30 minutes throughout launch day" />
            <ChecklistItem text="Monitor upvote velocity — if slow, re-engage community channels at T+4 h and T+8 h" />
            <ChecklistItem text="Cross-post to LinkedIn with the 'know your resilience gaps before disruption hits' frame" />
          </ul>
        </div>
      </div>

      <SubHeading><TrendingUp className="w-4 h-4" /> 48-Hour Post-Launch Follow-Up Plan</SubHeading>
      <Table
        headers={["Timing", "Action", "Goal"]}
        rows={[
          ["T+2 h", "Reply to all PH comments with depth — no copy-paste responses", "Boost comment thread, signal authenticity"],
          ["T+6 h", "Post to r/preppers and r/personalfinance (not promotional — share finding)", "Drive organic signups"],
          ["T+12 h", "Post a 'behind the scenes' thread on Twitter/X — why you built it", "Warm audience expansion"],
          ["T+24 h", "Email everyone who took the assessment that day with a personal note from the founder", "Conversion and loyalty"],
          ["T+30 h", "Compile top 5 community questions into a brief FAQ post on PH discussion", "Keep discussion alive"],
          ["T+36 h", "DM any PH makers who upvoted and ask for honest feedback", "Network building"],
          ["T+48 h", "Write a public '24-hour retrospective' post on Medium or Substack", "Backlinks, SEO, credibility"],
        ]}
      />
    </div>
  );
}

function RedditSection() {
  return (
    <div className="px-6 pb-8 space-y-1">

      <InfoBox>
        Reddit rewards genuine participation. The rule here is: give value first, mention Resilium second (if at all). Never post a link in your first comment in a subreddit.
      </InfoBox>

      <SubHeading><BookOpen className="w-4 h-4" /> Reddit Beginner Guide — Start Here</SubHeading>

      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5 mb-4 text-sm text-gray-700 leading-relaxed">

        <div>
          <p className="font-semibold text-gray-900 mb-2">Step 1 — Create your account</p>
          <ul className="space-y-1.5 text-xs text-gray-600">
            <li>• Go to <strong>reddit.com</strong> → Create Account. Use a username that isn't obviously you or your business — something neutral like <em>resilient_planner</em> or <em>prep_framework</em>. Reddit is pseudonymous by culture.</li>
            <li>• Verify your email. No phone number required.</li>
            <li>• Upload a profile picture (optional but looks less bot-like). Don't use the Resilium logo yet.</li>
            <li>• On mobile: download the official Reddit app (most convenient for daily commenting).</li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-gray-900 mb-2">Step 2 — Understand karma (the currency of Reddit trust)</p>
          <ul className="space-y-1.5 text-xs text-gray-600">
            <li>• Karma is Reddit's reputation score. Every upvote on your comments earns you karma. Most subreddits restrict new accounts with low karma from posting links or making top-level posts.</li>
            <li>• <strong>Week 1 goal:</strong> reach 100+ comment karma before you post a link anywhere. This takes 5–8 genuine comments that get upvoted.</li>
            <li>• You can see your karma on your profile page. Don't obsess over it — focus on writing genuinely helpful comments and it accumulates naturally.</li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-gray-900 mb-2">Step 3 — How to actually comment on Reddit</p>
          <ul className="space-y-1.5 text-xs text-gray-600">
            <li>• Go to a subreddit (e.g. reddit.com/r/preppers). Browse the front page — posts are sorted by Hot, New, Rising, Top.</li>
            <li>• Click a post title to open the thread. Read the original post and a few top comments to understand the conversation.</li>
            <li>• Scroll to find a comment you can genuinely add to, or scroll to the bottom and click <strong>"Add a comment"</strong> to reply to the original post directly.</li>
            <li>• Write your reply. Use plain text — no HTML, just line breaks. Reddit supports markdown (e.g. **bold**, *italic*) but plain text reads best.</li>
            <li>• Click <strong>Save</strong>. That's it. Your comment is live immediately (sometimes with a short delay for new accounts).</li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-gray-900 mb-2">Step 4 — Check subreddit rules before posting anything</p>
          <ul className="space-y-1.5 text-xs text-gray-600">
            <li>• Every subreddit has its own rules. On desktop: look at the right sidebar. On mobile: tap the subreddit name → About → Rules.</li>
            <li>• Key things to look for: "No self-promotion", "No links to personal sites", "No commercial content". Some subs allow it after a certain karma threshold.</li>
            <li>• If you break rules, your post gets removed and you can be banned from that subreddit permanently. Read before posting — it takes 60 seconds.</li>
            <li>• r/preppers and r/selfimprovement allow occasional self-promotion if it's genuinely relevant. r/personalfinance has strict rules — use r/financialindependence as the safer alternative.</li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-gray-900 mb-2">Step 5 — What gets you banned (avoid these)</p>
          <ul className="space-y-1.5 text-xs text-gray-600">
            <li>• Posting your link in your first 1–2 comments in any subreddit.</li>
            <li>• Copy-pasting the same comment across multiple subreddits (Reddit's spam filter catches this).</li>
            <li>• Posting only promotional content — Reddit expects at least 9 non-promotional comments for every 1 promotional one (the 9:1 rule).</li>
            <li>• Upvoting your own comments from a second account. Reddit tracks this.</li>
            <li>• Ignoring direct questions or replies. Respond to everyone who engages in Week 3–4 — this signals authentic participation.</li>
          </ul>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-amber-800 mb-1">The single most important rule</p>
          <p className="text-xs text-amber-700">In Weeks 1 and 2, act as if Resilium doesn't exist. You're just someone who thinks carefully about resilience and preparedness, sharing what you know. The credibility you build in those two weeks is what makes Week 3 and Week 4 work.</p>
        </div>
      </div>

      <SubHeading><Search className="w-4 h-4" /> Target Subreddits — Priority Order</SubHeading>
      <Table
        headers={["Priority", "Subreddit", "Subscribers", "Why It Fits", "Entry Angle"]}
        rows={[
          ["1", "r/preppers", "1.5M+", "Core audience — serious about preparedness, data-literate, anti-hype", "Discuss the '6 dimensions of resilience' framework; offer the tool as a scoring mechanism they can use"],
          ["2", "r/personalfinance", "20M+", "Financially anxious, structured thinkers; respond well to concrete calculations and runway metrics", "Start threads on financial resilience buffer calculation; Resilium as a supplementary tool"],
          ["3", "r/selfimprovement", "2M+", "Action-oriented, open to tools and frameworks for personal growth", "Frame as a 'structured self-assessment' not a prepper tool"],
          ["4", "r/financialindependence", "2M+", "FIRE community — highly data-driven, already thinking about runway and risk", "Resilience runway (months of buffer) directly maps to FI thinking"],
          ["5", "r/lostgeneration", "800K+", "Economically anxious millennials, feel unprepared and burned by the system", "Vulnerability-aware framing — not toxic positivity, honest picture of exposure"],
          ["6", "r/collapse", "400K+", "Skeptical but engaged audience; very wary of spam but highly engaged with analysis", "Data-forward discussion only; never promote — share methodology/findings"],
          ["7", "r/digitalnomad", "600K+", "Expat/remote workers with location risk exposure — a natural use case", "Mobility score and location risk framing; expat-specific scenarios"],
          ["8", "r/anxiety", "700K+", "People motivated to act on uncertainty but overwhelmed — Resilium reduces the anxiety of not knowing", "Frame around structured action reducing anxiety, not fear-mongering"],
          ["9", "r/Frugal", "2M+", "Budget-conscious, pragmatic audience — practical about emergency fund planning", "Financial resilience dimension: months of runway, debt exposure"],
          ["10", "r/worldnews", "30M+", "Large, broad audience — dip in only during relevant global events", "Natural entry during geopolitical shocks — offer the assessment as a rational response"],
        ]}
      />

      <SubHeading><Calendar className="w-4 h-4" /> 4-Week Participation Calendar</SubHeading>
      <Table
        headers={["Week", "Subreddits", "Activity", "Rules"]}
        rows={[
          ["Week 1 — Lurk & Engage", "r/preppers, r/personalfinance, r/anxiety", "Read top posts of the week. Leave 5–8 substantive comments per day adding real value. No links. No promotion.", "Establish account karma and trust. Zero mentions of Resilium."],
          ["Week 2 — Value Posts", "r/selfimprovement, r/financialindependence, r/Frugal", "Post 1 original discussion per subreddit: e.g. 'How I think about my financial resilience runway — the calculation I use'. Share methodology with zero product mention.", "Still no direct links. Build authority as a thoughtful contributor."],
          ["Week 3 — Soft Introduction", "r/preppers, r/lostgeneration, r/digitalnomad", "In relevant threads, mention 'I built a tool for this' in comments when directly asked or when the fit is organic. Link once per thread max, with context.", "Only link when it's genuinely relevant to the thread question. Do not lead with the link."],
          ["Week 4 — Show HN-style post", "r/preppers, r/selfimprovement", "Post the 'I built this' template below. Target weekend mornings for maximum visibility. One post per subreddit, check community rules for self-promotion.", "Follow sub rules exactly. Some subs (r/personalfinance) prohibit self-promotion — use sister subs instead."],
        ]}
      />

      <SubHeading><FileText className="w-4 h-4" /> Post & Comment Templates</SubHeading>

      <CopyBlock label="Template 1 — Value-Add Comment (use in relevant threads about preparedness/anxiety)">
        {`Something I've found useful when thinking about this: breaking preparedness into components and scoring each one separately, rather than trying to answer "am I prepared?" in the abstract.

The six areas I use: financial runway, practical skills, health/mobility, psychological resilience, emergency resources, and location risk. Each one has a rough 0–100 score based on specific factors.

The interesting thing is most people are strong in 1–2 areas and genuinely exposed in 2–3 they haven't thought about. It makes the problem feel solvable instead of overwhelming.

Happy to share the scoring framework if useful — I've been refining it.`}
      </CopyBlock>

      <CopyBlock label="Template 2 — Soft Demo Share (use when someone asks for tools/resources)">
        {`I've been working on something that addresses exactly this. It's a free structured assessment — takes about 12 minutes — and gives you scored results across six resilience dimensions (finances, health, skills, mobility, mental resilience, and emergency resources).

You can assess as an individual or as a full household — adults, dependents, and mobility needs are all factored in. The output isn't generic tips — it's a prioritized action plan based on your specific answers. No email required.

resilium-platform.com

Happy to answer any questions about the methodology — I built it to solve this exact problem for myself first.`}
      </CopyBlock>

      <CopyBlock label="Template 3 — 'I Built This' Show HN-Style Post">
        {`I built a structured resilience assessment — because "build an emergency fund" isn't an answer [Show Reddit]

Background: I found myself anxious about a cluster of overlapping risks — economic uncertainty, geopolitical instability, potential job disruption — but couldn't find a tool that gave me an honest picture of where I stood. Everything I found was either generic advice, ideology-heavy prepper content, or a quiz with no useful output.

So I built Resilium.

It's a structured, scored assessment across six dimensions:
- Financial resilience (runway, income stability, debt exposure)
- Skills (practical, transferable, crisis-relevant)
- Health & mobility
- Psychological resilience (stress tolerance, adaptability, emotional regulation)
- Emergency resources
- Location risk

You can take it as an individual or in Household mode — where the assessment accounts for adults, dependents, and any mobility limitations across your household and produces a shared score.

You get a scored report, a personalized action plan tailored to your answers, and scenario modeling (e.g. "how does my profile change if I lose my job?"). No email required.

What I'd love feedback on:
1. Which dimension surprises you most about your own situation?
2. What scenario would you most want to stress-test?
3. What's missing that would make this genuinely useful for your situation?

[Link to Resilium]

Proof of work: [Screenshot of a scored report or radar chart]`}
      </CopyBlock>

      <SubHeading><Map className="w-4 h-4" /> Natural Entry Points to Watch</SubHeading>
      <Table
        headers={["Trigger", "Subreddit", "Entry Angle"]}
        rows={[
          ["Economic uncertainty news thread", "r/personalfinance, r/lostgeneration", "Offer the financial runway calculation as a concrete response to abstract worry"],
          ["'How prepared are you?' discussion posts", "r/preppers", "Share the dimensional scoring framework as a way to structure the answer"],
          ["Job loss/layoff posts", "r/personalfinance, r/Frugal", "Financial resilience dimension — specifically the 'months of runway' metric"],
          ["Natural disaster news", "r/worldnews, r/preppers", "Emergency resources and mobility score as timely relevant frame"],
          ["'I'm anxious about the future' posts", "r/anxiety, r/selfimprovement", "Structured action reduces anxiety — the assessment as an antidote to helplessness"],
          ["Expat/relocation threads", "r/digitalnomad, r/expats", "Location risk and mobility scoring — specific to their situation"],
        ]}
      />
    </div>
  );
}

function ResearchReportSection() {
  return (
    <div className="px-6 pb-8 space-y-1">

      <InfoBox>
        The "State of Personal Resilience 2026" report is an original research asset that establishes Resilium as an authority source, earns press coverage, and generates backlinks. This section details exactly how to collect the data, structure the report, and get it in front of journalists.
      </InfoBox>

      <SubHeading><BookOpen className="w-4 h-4" /> Survey Methodology</SubHeading>

      <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Collection Method</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 rounded-lg bg-white border border-slate-200">
            <p className="font-semibold text-gray-900 mb-1">Channel 1: In-Product</p>
            <p className="text-gray-600 text-xs">Ask all Resilium users who complete a report to opt into the research survey. Target: 500+ responses from actual assessment-takers.</p>
          </div>
          <div className="p-3 rounded-lg bg-white border border-slate-200">
            <p className="font-semibold text-gray-900 mb-1">Channel 2: Google Forms</p>
            <p className="text-gray-600 text-xs">A standalone Google Forms survey distributed via Reddit, Substack, and email. Free, unlimited responses, data exports directly to Google Sheets. Target: 500+ additional responses from broader public.</p>
          </div>
          <div className="p-3 rounded-lg bg-white border border-slate-200">
            <p className="font-semibold text-gray-900 mb-1">Target N</p>
            <p className="text-gray-600 text-xs">Minimum 500 valid responses. 1,000+ for credible demographic breakdowns. Aim for 60% UK/US split for press relevance.</p>
          </div>
        </div>
      </div>

      <p className="text-sm font-semibold text-gray-900 mb-2">Core Survey Questions</p>
      <Table
        headers={["#", "Question", "Type", "Dimension"]}
        rows={[
          ["1", "How many months could you cover essential living expenses if you lost your primary income today?", "Multiple choice: <1 / 1–3 / 3–6 / 6–12 / 12+", "Financial"],
          ["2", "How would you describe your current income stability?", "Single choice: Very stable / Somewhat stable / Uncertain / Very precarious", "Financial"],
          ["3", "How confident are you that your practical skills (cooking, first aid, DIY, etc.) would help you manage a 30-day disruption?", "1–5 scale", "Skills"],
          ["4", "Do you have at least 72 hours of emergency supplies at home (water, food, medication)?", "Yes / Partial / No", "Resources"],
          ["5", "How would you rate your ability to stay calm and function under sustained stress?", "1–5 scale", "Psychological"],
          ["6", "If you needed to relocate in the next 30 days, how prepared would you be?", "1–5 scale (Not at all → Very prepared)", "Mobility"],
          ["7", "Which of the following risks concern you most right now? (select up to 3)", "Multi-select: job loss / economic recession / health crisis / geopolitical instability / climate event / other", "General"],
          ["8", "Have you taken any deliberate steps to improve your personal resilience in the past 12 months?", "Yes / No / Planning to", "Behavior"],
          ["9", "What has been the biggest barrier to improving your resilience?", "Multi-select: time / money / don't know where to start / don't think it's necessary / overwhelm", "Barrier"],
          ["10", "Age bracket", "18–24 / 25–34 / 35–44 / 45–54 / 55–64 / 65+", "Demographic"],
          ["11", "Country of residence", "Free text + dropdown", "Demographic"],
          ["12", "Employment status", "Single choice: Employed FT / PT / Self-employed / Unemployed / Retired / Student", "Demographic"],
          ["13", "Do you consider yourself a prepper or preparedness-minded person?", "Yes / Somewhat / No", "Demographic"],
          ["14", "How well do you think the average person in your country is prepared for a major disruption?", "1–5 scale (Very poorly → Very well)", "Social perception"],
        ]}
      />

      <SubHeading><FileText className="w-4 h-4" /> Report Structure</SubHeading>
      <Table
        headers={["Section", "Content", "Key Data / Visualisation"]}
        rows={[
          ["Executive Summary", "Top 5 headline findings. The single most shareable stat. Key vulnerability gap.", "Pull-quote graphic for press / social media use"],
          ["Methodology Note", "Sample size, collection method, date range, geographic breakdown, margin of error statement", "Simple infographic"],
          ["Section 1: Financial Resilience", "% with <1 month runway. % with <3 months. Comparison by age, employment, country.", "Bar chart: runway by age group. Map: financial resilience by country."],
          ["Section 2: Skills & Practical Preparedness", "% confident in practical skills. Most common skill gaps. Skills by demographic.", "Ranked list of skill gaps. Dot chart."],
          ["Section 3: Psychological Resilience", "Self-reported stress tolerance, adaptability. % who feel 'not at all prepared psychologically'.", "Gauge chart. Comparison: psychological vs practical score."],
          ["Section 4: Emergency Resources", "% with 72-hour supply. % with no emergency plan. Correlation with financial score.", "Simple % stat. Side-by-side chart."],
          ["Section 5: Mobility & Location Risk", "% able to relocate in 30 days. Urban vs rural split. Homeowners vs renters.", "Grouped bar chart."],
          ["Section 6: Top Concerns", "Ranked risk concerns. Year-over-year sentiment (if data available).", "Ranked horizontal bar chart."],
          ["Section 7: Behavior & Barriers", "% who've taken action. Top 5 barriers. Correlation: barrier vs score.", "Funnel or waterfall chart. Barrier ranking."],
          ["Recommendations", "5 evidence-based recommendations for individuals. 3 for policy/employers.", "Action checklist format"],
          ["Appendix", "Full methodology, question wording, demographic tables, statistical notes", "Tables"],
        ]}
      />

      <SubHeading><Newspaper className="w-4 h-4" /> Press Outreach Template</SubHeading>
      <CopyBlock label="Email Subject Lines (A/B test)">
        {`Option A: "1 in 3 UK adults couldn't survive 30 days of income loss — new data"
Option B: "The resilience gap: original research data from 1,000 adults on personal preparedness"
Option C: "Exclusive: first data on UK/US personal resilience — 'State of Personal Resilience 2026'"`}
      </CopyBlock>

      <CopyBlock label="Press Pitch Email Body">
        {`Hi [Name],

I'm sharing early access to an original research report — "State of Personal Resilience 2026" — produced by Resilium, a personal resilience assessment platform.

The headline finding: [INSERT TOP STAT, e.g. "41% of UK adults have less than one month's financial runway if they lost their primary income today."]

The report is based on [N] responses from adults in the UK and US, collected in [Month] 2026. It covers six dimensions of personal resilience: financial readiness, practical skills, health, psychological capacity, emergency preparedness, and mobility.

Other notable findings:
- [Stat 2 — psychological]
- [Stat 3 — skills gap]
- [Stat 4 — demographic comparison]

I'd be happy to provide:
→ Embargo access to the full report (PDF)
→ High-resolution charts and infographics
→ Data cuts by UK region or US state (if in scope)
→ Comment from [Founder name] for quotes

Would this be relevant for an upcoming piece? I can arrange a brief call or send over the embargo pack immediately.

Best,
[Name]
Resilium | resilium-platform.com`}
      </CopyBlock>

      <SubHeading><Globe className="w-4 h-4" /> Target Publications & Newsletters</SubHeading>
      <Table
        headers={["Publication / Newsletter", "Region", "Why It Fits", "Contact Approach"]}
        rows={[
          ["The Guardian — Money & Lifestyle", "UK", "Mass audience, covers personal finance and cost-of-living themes", "Pitch to Money editor; use public tips@ address"],
          ["BBC News — Family & Wellbeing", "UK", "Largest UK audience, loves 'state of the nation' data stories", "BBC newsroom tips; data-led pitch best"],
          ["Which? Magazine", "UK", "Consumer advocacy angle — preparedness as consumer rights issue", "Editorial contact via which.co.uk"],
          ["The Times — Money", "UK", "Affluent, financially literate readership; interested in planning/risk", "Direct journalist contact on Twitter/X"],
          ["Business Insider UK", "UK/US", "Data-driven, digital-native, high shareability", "Editorial email; journalists active on LinkedIn"],
          ["Axios Future", "US", "Covers societal trends, preparedness, resilience in a forward-looking frame", "Pitch via Axios tips; short, data-led"],
          ["NPR Life Kit", "US", "Practical advice format; resilience and personal finance strong fit", "NPR editorial pitches page"],
          ["Kiplinger", "US", "Personal finance focus; emergency fund / financial resilience natural fit", "Editorial contact at kiplinger.com"],
          ["Survivalist Prepper (newsletter)", "US/Global", "Directly in-audience; huge reach in preparedness community", "Direct outreach via website contact"],
          ["Financial Times — FT Weekend", "UK/Global", "Prestigious; data stories with rigorous methodology have strong chance", "Pitch to FT Weekend editor"],
        ]}
      />

      <SubHeading><Calendar className="w-4 h-4" /> Publication Timeline</SubHeading>
      <Table
        headers={["Milestone", "Target Date", "Owner", "Notes"]}
        rows={[
          ["Finalise survey instrument", "Week 1", "Founder", "Use question set above; test with 5 people before launch"],
          ["Launch Google Forms survey", "Week 2", "Founder", "Embed link on Resilium post-assessment screen; share in Reddit communities"],
          ["In-product survey activation", "Week 2", "Dev", "Add opt-in prompt on results page for existing users"],
          ["Data collection period", "Weeks 2–6", "—", "Target: 1,000 responses minimum. Chase if below 500 by Week 4."],
          ["Data cleaning & analysis", "Weeks 7–8", "Founder + tool", "Export Google Forms + in-product data to Google Sheets. Clean, cross-tab, compute summary stats."],
          ["Report writing", "Weeks 8–9", "Founder", "Follow section structure above. Draft all charts and copy."],
          ["Design & layout", "Week 10", "Designer / Founder", "PDF + web-embeddable HTML version. Key stats as shareable graphics."],
          ["Pre-launch press outreach (embargo)", "Week 10", "Founder", "Send embargo pack to top 5 publications 5 days before publication"],
          ["Public launch — report publication", "Week 11", "Founder", "Publish on Resilium website. Post to all channels simultaneously."],
          ["Press follow-up", "Weeks 11–12", "Founder", "Follow up with all pitches. Answer journalist queries. Share data cuts."],
          ["Community amplification", "Weeks 11–13", "Founder", "Post findings threads on Reddit, LinkedIn, Twitter. Engage comments."],
        ]}
      />
    </div>
  );
}

const OPEN_KEY = "admin_mkt::open_sections";

const DEFAULT_OPEN = new Set<SectionKey>(["master-checklist"]);

export function MarketingPageContent() {
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(() => {
    try {
      const stored = localStorage.getItem(OPEN_KEY);
      if (stored) return new Set<SectionKey>(JSON.parse(stored));
    } catch {}
    return DEFAULT_OPEN;
  });

  const toggle = (key: SectionKey) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      try { localStorage.setItem(OPEN_KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Go-to-Market Launch Plan</h1>
            <p className="text-sm text-muted-foreground">Master Checklist · Product Hunt · Reddit Organic · Research Report</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-4 max-w-2xl leading-relaxed">
          The Master Checklist at the top consolidates every action item from all channels. The sections below contain full copy templates, Reddit strategy, and research report guidance. Check items off in the master list — progress is saved to your browser.
        </p>
      </div>

      <div className="space-y-4">
        {/* Master Checklist — default open */}
        <div className="bg-white/90 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <SectionHeader
            icon={CheckSquare}
            label="Master Checklist"
            title="Everything You Need to Do — in One List"
            isOpen={openSections.has("master-checklist")}
            onToggle={() => toggle("master-checklist")}
          />
          {openSections.has("master-checklist") && (
            <div className="border-t border-slate-200">
              <MasterChecklistSection />
            </div>
          )}
        </div>

        {/* Mobile Launch Checklist */}
        <div className="bg-white/90 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <SectionHeader
            icon={Smartphone}
            label="iOS App Store — When Ready"
            title="Mobile Launch Checklist"
            isOpen={openSections.has("mobile-launch")}
            onToggle={() => toggle("mobile-launch")}
          />
          {openSections.has("mobile-launch") && (
            <div className="border-t border-slate-200">
              <MobileLaunchChecklistSection />
            </div>
          )}
        </div>

        {/* Product Hunt */}
        <div className="bg-white/90 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <SectionHeader
            icon={Rocket}
            label="Channel 1 — Product Hunt"
            title="Product Hunt Launch Plan"
            isOpen={openSections.has("product-hunt")}
            onToggle={() => toggle("product-hunt")}
          />
          {openSections.has("product-hunt") && (
            <div className="border-t border-slate-200">
              <ProductHuntSection />
            </div>
          )}
        </div>

        {/* Reddit */}
        <div className="bg-white/90 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <SectionHeader
            icon={MessageSquare}
            label="Channel 2 — Reddit Organic"
            title="Reddit Organic Strategy"
            isOpen={openSections.has("reddit")}
            onToggle={() => toggle("reddit")}
          />
          {openSections.has("reddit") && (
            <div className="border-t border-slate-200">
              <RedditSection />
            </div>
          )}
        </div>

        {/* Research Report */}
        <div className="bg-white/90 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <SectionHeader
            icon={BarChart2}
            label="Channel 3 — Original Research"
            title='State of Personal Resilience 2026 Report'
            isOpen={openSections.has("research-report")}
            onToggle={() => toggle("research-report")}
          />
          {openSections.has("research-report") && (
            <div className="border-t border-slate-200">
              <ResearchReportSection />
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-8">
        Admin-only document · Resilium Go-to-Market Plan · Generated April 2026
      </p>
    </div>
  );
}

export default function AdminMarketingPage() {
  return (
    <AdminLayout activeSection="marketing">
      <MarketingPageContent />
    </AdminLayout>
  );
}
