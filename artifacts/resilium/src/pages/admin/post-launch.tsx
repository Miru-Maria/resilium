import { useState } from "react";
import { AdminLayout } from "./layout";
import {
  Rocket, CheckSquare, Square, ChevronDown, ChevronRight,
  CheckCircle2, Activity, Users, MessageSquare, Mail,
  TrendingUp, BookOpen, BarChart2, Clock, Calendar,
  AlertTriangle, Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Shared components ─────────────────────────────────────────────────── */

const CATEGORY_KEY = "resilium_postlaunch_collapsed_v1";

function CollapsibleCategory({
  icon: Icon,
  id,
  label,
  badge,
  children,
}: {
  icon?: React.ElementType;
  id: string;
  label: string;
  badge?: string;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(CATEGORY_KEY) ?? "{}");
      return !!stored[id];
    } catch { return false; }
  });

  const toggle = () => {
    setCollapsed(prev => {
      const next = !prev;
      try {
        const stored = JSON.parse(localStorage.getItem(CATEGORY_KEY) ?? "{}");
        stored[id] = next;
        localStorage.setItem(CATEGORY_KEY, JSON.stringify(stored));
      } catch {}
      return next;
    });
  };

  return (
    <div>
      <button
        onClick={toggle}
        className="flex items-center gap-2 mt-8 mb-3 w-full text-left group"
      >
        {Icon && <Icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
        <span className="text-xs font-bold uppercase tracking-widest text-primary">{label}</span>
        {badge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 whitespace-nowrap">
            {badge}
          </span>
        )}
        <div className="flex-1 h-px bg-primary/20" />
        {collapsed
          ? <ChevronRight className="w-3.5 h-3.5 text-primary/50 flex-shrink-0" />
          : <ChevronDown  className="w-3.5 h-3.5 text-primary/50 flex-shrink-0" />
        }
      </button>
      {!collapsed && <ul className="space-y-3">{children}</ul>}
    </div>
  );
}

function ChecklistItem({ text, detail }: { text: string; detail?: string }) {
  const storageKey = `admin_postlaunch::${text}`;
  const [checked, setChecked] = useState(() => {
    try { return localStorage.getItem(storageKey) === "1"; } catch { return false; }
  });
  const toggle = () => {
    const next = !checked;
    setChecked(next);
    try { localStorage.setItem(storageKey, next ? "1" : "0"); } catch {}
  };
  return (
    <li className="flex items-start gap-3 cursor-pointer group" onClick={toggle}>
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

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-4">
      <AlertTriangle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-blue-800 leading-relaxed">{children}</p>
    </div>
  );
}

/* ── Quick-links bar ───────────────────────────────────────────────────── */

const LINKS = [
  { label: "Clerk Users", href: "https://dashboard.clerk.com", icon: Users },
  { label: "Sentry", href: "https://sentry.io/organizations/", icon: Activity },
  { label: "Stripe", href: "https://dashboard.stripe.com", icon: TrendingUp },
  { label: "Umami", href: "https://cloud.umami.is", icon: BarChart2 },
  { label: "Product Hunt", href: "https://www.producthunt.com/posts/resilium", icon: Rocket },
  { label: "Resend", href: "https://resend.com/emails", icon: Mail },
];

function QuickLinks() {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {LINKS.map(({ label, href, icon: Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-primary/10 hover:text-primary text-slate-700 border border-slate-200 transition-colors"
        >
          <Icon className="w-3 h-3" />
          {label}
        </a>
      ))}
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────── */

export default function PostLaunchPage() {
  return (
    <AdminLayout activeSection="post-launch">
      <div className="max-w-3xl mx-auto px-6 py-8">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Rocket className="w-6 h-6 text-primary" />
            Post-Launch Tasks
          </h1>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
            Your daily and weekly checklist after Product Hunt launch. Click any item to mark it done — progress saves automatically in your browser.
          </p>
        </div>

        <QuickLinks />

        {/* ── Launch Day ─────────────────────────────────────────────────── */}
        <CollapsibleCategory icon={Rocket} id="launch-day" label="Launch Day — One-time" badge="Do first">

          <ChecklistItem
            text="Post LinkedIn personal announcement"
            detail="Use the personal post copy block from the GTM plan (Marketing page). Include your UTM link. Pin the post to your profile after publishing."
          />
          <ChecklistItem
            text="Post LinkedIn company page announcement"
            detail="Use the company post copy block from the GTM plan. Tag your personal profile. Share the company post from your personal account."
          />
          <ChecklistItem
            text="Post Facebook personal announcement"
            detail="Use the Facebook copy block from the GTM plan. Tag resilium-platform.com. Engage with every comment in the first two hours."
          />
          <ChecklistItem
            text="Reply to every Product Hunt comment within the first hour"
            detail="Speed of response on PH is visible to other voters. Aim to reply to every comment within 60 minutes of it being posted throughout the launch day."
          />
          <ChecklistItem
            text="Set a reminder to send T+24h founder email to launch day signups"
            detail="Plain text, personal tone. Pull the list from Clerk the next morning. Ask one question: 'What made you sign up?' You can use Resend to send it manually if needed."
          />
          <ChecklistItem
            text="Screenshot your PH ranking and save it"
            detail="Capture your rank at the end of the day for social proof and future marketing copy."
          />
        </CollapsibleCategory>

        {/* ── Daily — First Week ─────────────────────────────────────────── */}
        <CollapsibleCategory icon={Clock} id="daily-week1" label="Daily — First Week">

          <InfoBox>
            Do these every day for the first 7 days. They take 15–20 minutes combined and give you early signal on what's working.
          </InfoBox>

          <ChecklistItem
            text="Check Clerk for new signups"
            detail="Note names and email domains. High-signal users (enterprise email, multiple logins) are worth a personal email. Track daily signup counts in a simple note or spreadsheet."
          />
          <ChecklistItem
            text="Check Sentry for new errors"
            detail="Filter by 'Unresolved' and sort by frequency. Any new error appearing more than 3 times needs same-day attention. Go to /admin/monitoring for the embedded view."
          />
          <ChecklistItem
            text="Check Stripe for new subscriptions or failed payments"
            detail="Look at Events in Stripe dashboard. A failed payment needs a manual follow-up email within 24h if Resend webhook retry hasn't fired."
          />
          <ChecklistItem
            text="Check Umami for funnel drop-off"
            detail="Key path: landing → /consent → /assess → /results → /pricing. If drop-off at /consent is >70%, the gate may be too high. Go to /admin/analytics for the embedded view."
          />
          <ChecklistItem
            text="Reply to all Product Hunt comments and any emails to contact_resilium@pm.me"
            detail="PH comments slow down after day 3 but keep going. Every unanswered comment is a missed conversion opportunity."
          />
        </CollapsibleCategory>

        {/* ── Weekly ──────────────────────────────────────────────────────── */}
        <CollapsibleCategory icon={Calendar} id="weekly" label="Weekly — Ongoing">

          <ChecklistItem
            text="Send a personal T+24h founder note to each new signup from the past week"
            detail="Pull from Clerk, filter users created in the past 7 days who haven't converted to Pro. Send via Resend or plain Gmail. Subject: 'Quick question from the Resilium founder'. Ask what brought them in."
          />
          <ChecklistItem
            text="Review free → Pro conversion rate in Stripe"
            detail="Target: >5% of free users convert within 14 days. If below 3%, review the pricing page and consider a limited-time offer for early signups."
          />
          <ChecklistItem
            text="Comment genuinely on r/preppers and r/personalfinance"
            detail="10–15 substantive comments per week to build karma. No links to Resilium yet — just be helpful. u/BasketMission6685 needs 2–4 weeks of activity before posting in subreddits. Full Reddit strategy is in the Marketing page."
          />
          <ChecklistItem
            text="Publish one new blog post"
            detail="11 posts are already live. Aim for one per week minimum. Target long-tail keywords: 'resilience plan template', 'how to improve your resilience score', 'emergency preparedness for families'. Each post should link internally to /assess and /pricing."
          />
          <ChecklistItem
            text="Check GDPR data requests in admin"
            detail="Go to /admin/gdpr to review any pending deletion or export requests. GDPR requires a response within 30 days — act within 7 to stay well inside the window."
          />
          <ChecklistItem
            text="Review Sentry error trends for the week"
            detail="Look for any errors that grew in frequency during the week. Address anything above 10 occurrences. Go to /admin/monitoring."
          />
        </CollapsibleCategory>

        {/* ── Month 1 ─────────────────────────────────────────────────────── */}
        <CollapsibleCategory icon={TrendingUp} id="month1" label="Month 1 — Milestones">

          <ChecklistItem
            text="Post 'I built this' story in r/preppers and r/SideProject (once karma is ready)"
            detail="Full post copy blocks are saved in the Reddit section of the Marketing page. Don't rush this — post only once you have enough karma to avoid auto-removal. r/selfimprovement, r/Entrepreneur, r/EntrepreneurRideAlong require even more karma."
          />
          <ChecklistItem
            text="Review first-month metrics and write a mini retro"
            detail="Track: total signups, free→Pro conversion rate, churn, PH final rank, top traffic sources from Umami. A short document forces clarity. Use the Admin Documents page to store it."
          />
          <ChecklistItem
            text="Send a 'one month in' newsletter to all users"
            detail="Share what you've learned, what's coming next, and a thank-you. Keep it under 200 words. Plain text performs better than HTML for founder-to-user emails at this stage."
          />
          <ChecklistItem
            text="Reach out to 5 journalists or bloggers in the preparedness / self-improvement space"
            detail="Personalised one-sentence pitch. Lead with the resilience score angle — it's unique. Attach the whitepaper PDF (Admin Documents → White Paper). No press kit needed at this stage."
          />
          <ChecklistItem
            text="Run a user research survey (5–10 questions)"
            detail="Ask: what almost stopped them signing up, what score range they got, what one feature they wish existed. Use Tally (free, GDPR-friendly). Share the survey link via in-app announcement (/admin/announcements)."
          />
        </CollapsibleCategory>

        {/* ── iOS App Store ───────────────────────────────────────────────── */}
        <CollapsibleCategory icon={Smartphone} id="ios" label="iOS App Store — When Ready">

          <InfoBox>
            This is the largest remaining technical block. The full step-by-step checklist (18 items) is on the Marketing page under 'Mobile Launch Checklist'. These are the key gates.
          </InfoBox>

          <ChecklistItem
            text="Apple Developer account active ($99/yr) and banking/tax info complete in App Store Connect"
            detail="Both must be done before you can submit or receive revenue. Banking verification takes 1–3 business days."
          />
          <ChecklistItem
            text="RevenueCat account created and linked to App Store Connect"
            detail="Required for Apple's mandatory in-app purchase flow. Wire RevenueCat SDK into the Expo mobile app and build the iOS paywall screen."
          />
          <ChecklistItem
            text="Sandbox purchase tested on a physical iPhone"
            detail="Create a Sandbox Tester account in App Store Connect. Test purchase, renewal, and Restore Purchases end-to-end on device."
          />
          <ChecklistItem
            text="TestFlight build uploaded and tested"
            detail="Run: eas build --platform ios --profile production. Test the full assessment flow, report generation, and Pro gating on a real iPhone via TestFlight."
          />
          <ChecklistItem
            text="App Store submission sent and approved"
            detail="First review typically takes 1–3 business days. Have your privacy policy URL (resilium-platform.com/privacy), support URL, and age rating ready."
          />
        </CollapsibleCategory>

        {/* ── Completed ───────────────────────────────────────────────────── */}
        <CollapsibleCategory icon={CheckCircle2} id="completed" label="Already Done — For Reference">
          <CompletedItem
            text="Umami analytics live"
            detail="Script in index.html. Website ID: c5f820b3-31df-42c7-9c67-2d669117f9b6. Cookieless, EU region."
          />
          <CompletedItem
            text="GDPR contact email published"
            detail="contact_resilium@pm.me is in Privacy Policy, Terms, Refund Policy, About page, and structured data."
          />
          <CompletedItem
            text="11 blog posts published"
            detail="Strong foundation for long-tail SEO. Continue weekly publishing to compound domain authority."
          />
          <CompletedItem
            text="Sentry error monitoring active"
            detail="Connected to web and API. View at /admin/monitoring."
          />
          <CompletedItem
            text="LinkedIn personal and company pages launched"
            detail="Both pages active ahead of Product Hunt launch."
          />
          <CompletedItem
            text="Product Hunt listing prepared"
            detail="Name: 'Resilium – Score Your Preparedness'. Tags: Productivity · Health & Fitness · Quantified Self. Shoutouts section complete."
          />
          <CompletedItem
            text="OpenGraph preview verified on social platforms"
            detail="Correct image, title, and description confirmed on opengraph.xyz."
          />
          <CompletedItem
            text="Resend domain verified — SPF/DKIM live"
            detail="resilium-platform.com verified in Resend dashboard. Transactional email deliverability confirmed."
          />
        </CollapsibleCategory>

      </div>
    </AdminLayout>
  );
}
