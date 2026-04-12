import React, { useState } from "react";
import { AdminLayout } from "./layout";
import {
  Rocket, MessageSquare, BarChart2, ChevronDown, ChevronRight,
  CheckSquare, Square, Calendar, Target, FileText,
  Newspaper, Globe, Search, BookOpen, TrendingUp, Megaphone, Map,
  Smartphone, ShieldCheck, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

type SectionKey = "launch-readiness" | "product-hunt" | "reddit" | "research-report";

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
  const [checked, setChecked] = useState(false);
  return (
    <li
      className="flex items-start gap-3 cursor-pointer group"
      onClick={() => setChecked(c => !c)}
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

function LaunchReadinessSection() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="px-6 pb-8 space-y-1">

      <InfoBox>
        <strong>Paddle approval is the single gate between you and a confident launch.</strong> Everything below that isn't marked as pending is something you can complete right now. The mobile tasks are separated — none of them are required to go live on web.
      </InfoBox>

      {/* Paddle status callout */}
      <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-2">
        <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Waiting: Paddle domain approval</p>
          <p className="text-xs text-amber-700 mt-0.5">Once <span className="font-mono">resilium-platform.com</span> is approved, complete items 1–2 below and you're live.</p>
        </div>
      </div>

      <SubHeading><ShieldCheck className="w-4 h-4" /> Web Launch Requirements</SubHeading>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Payments &amp; Core Flow</p>
          <ul className="space-y-3">
            <ChecklistItem
              text="Paddle domain approval received"
              detail="Check your Paddle dashboard inbox. Once approved, production checkout will activate on resilium-platform.com."
            />
            <ChecklistItem
              text="Test the full payment flow with a real card"
              detail="Free → Pro upgrade, both monthly and annual. Confirm Pro features unlock immediately after payment."
            />
            <ChecklistItem
              text="Test the complete new-user journey end to end"
              detail="Land on homepage → take assessment → view results → upgrade to Pro → confirm all Pro features work. Do this as a fresh incognito user."
            />
            <ChecklistItem
              text="Admin login tested in production"
              detail="Sign in to the admin panel at /admin using your separate username/password (not Clerk)."
            />
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Legal &amp; Discoverability</p>
          <ul className="space-y-3">
            <ChecklistItem
              text="Privacy Policy page live"
              detail="Required by EU GDPR (Romania-based). Must be linked in the site footer. Cover: data collected, storage, Clerk auth, Paddle billing, Resend email."
            />
            <ChecklistItem
              text="Terms of Service page live"
              detail="Protects you and sets user expectations. Link from footer and sign-up flow."
            />
            <ChecklistItem
              text="Cookie / GDPR consent notice implemented"
              detail="A simple banner on first visit is sufficient. Required for EU users by default."
            />
            <ChecklistItem
              text="OpenGraph preview verified"
              detail="Paste resilium-platform.com into https://opengraph.xyz — confirm the social card shows the correct image, title, and description."
            />
            <ChecklistItem
              text="Transactional emails tested"
              detail="Trigger at least one welcome email and one report delivery via Resend. Confirm they land in inbox (not spam)."
            />
          </ul>
        </div>
      </div>

      {/* Collapsible mobile section */}
      <div className="border border-slate-200 rounded-xl overflow-hidden mt-6">
        <button
          type="button"
          onClick={() => setMobileOpen(o => !o)}
          className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
        >
          <Smartphone className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <div className="flex-1">
            <span className="text-sm font-semibold text-gray-700">Mobile App Tasks</span>
            <span className="ml-2 text-xs text-gray-400 font-normal">— not required for web launch</span>
          </div>
          {mobileOpen
            ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
            : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />}
        </button>
        {mobileOpen && (
          <div className="px-4 py-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Immediate (Any Time)</p>
              <ul className="space-y-3">
                <ChecklistItem
                  text="Enable Facebook OAuth in Clerk"
                  detail="Clerk Dashboard → Configure → Social Connections → Facebook → Enable. Required before Facebook sign-in works in the mobile app."
                />
                <ChecklistItem
                  text="Test mobile web app on your Android device"
                  detail="Scan the QR code from the Account tab. Run through the full flow in Chrome on Android. This is the fastest quality check you can do."
                />
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">When You Have Real User Demand</p>
              <ul className="space-y-3">
                <ChecklistItem
                  text="Create a Google Play developer account ($25 one-time)"
                  detail="Submit the Android app. Your own Android device means you can test the native experience yourself — a real advantage."
                />
                <ChecklistItem
                  text="Set up Google Play Billing for Pro subscriptions"
                  detail="Required for in-app purchases on Android. Google takes 15–30% commission."
                />
                <ChecklistItem
                  text="Create an Apple Developer account ($99/year)"
                  detail="Required for App Store and TestFlight. Only pursue this when iOS demand is clear."
                />
                <ChecklistItem
                  text="Set up RevenueCat for iOS in-app purchases"
                  detail="Handles Apple's IAP receipts. Needed before Pro subscriptions work natively on iOS."
                />
              </ul>
            </div>
          </div>
        )}
      </div>
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
        {`Resilium gives you a scored, structured resilience report across 6 life dimensions — finances, health, skills, mobility, psychology, and emergency resources — with a prioritized action plan tailored to your specific answers. No email required.`}
      </CopyBlock>

      <CopyBlock label="Long-Form Product Description">
        {`Most people don't realize how exposed they are until a job loss, health crisis, or geopolitical shock forces their hand. By then, the window to prepare is already closed.

Resilium is a privacy-first platform that gives you an honest, scored picture of where you actually stand — across the financial, physical, psychological, and logistical dimensions that determine how well you weather disruption.

A single composite score you can improve over time, built from a structured assessment that takes 10–15 minutes to complete.

→ 6 resilience dimensions, each scored 0–100
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

The output isn't generic tips — it's a prioritized action plan based on your specific answers. No email required.

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
            <p className="font-semibold text-gray-900 mb-1">Channel 2: Typeform</p>
            <p className="text-gray-600 text-xs">A standalone Typeform survey distributed via Reddit, Substack, and email. Target: 500+ additional responses from broader public.</p>
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
          ["Launch Typeform survey", "Week 2", "Founder", "Embed link on Resilium post-assessment screen; share in Reddit communities"],
          ["In-product survey activation", "Week 2", "Dev", "Add opt-in prompt on results page for existing users"],
          ["Data collection period", "Weeks 2–6", "—", "Target: 1,000 responses minimum. Chase if below 500 by Week 4."],
          ["Data cleaning & analysis", "Weeks 7–8", "Founder + tool", "Export Typeform + in-product data. Clean, cross-tab, compute summary stats."],
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

export default function AdminMarketingPage() {
  const [openSection, setOpenSection] = useState<SectionKey | null>("launch-readiness");

  const toggle = (key: SectionKey) => setOpenSection(prev => prev === key ? null : key);

  return (
    <AdminLayout activeSection="marketing">
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Go-to-Market Launch Plan</h1>
              <p className="text-sm text-muted-foreground">Product Hunt · Reddit Organic · State of Personal Resilience 2026 Report</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4 max-w-2xl leading-relaxed">
            This document contains production-ready copy, templates, checklists, and timelines for three launch channels. Click any section to expand it. Use the "Copy" buttons to pull text directly into your tools.
          </p>
        </div>

        <div className="space-y-4">
          {/* Launch Readiness */}
          <div className="bg-white/90 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <SectionHeader
              icon={ShieldCheck}
              label="Step 0 — Before You Launch"
              title="Pre-Launch Readiness Checklist"
              isOpen={openSection === "launch-readiness"}
              onToggle={() => toggle("launch-readiness")}
            />
            {openSection === "launch-readiness" && (
              <div className="border-t border-slate-200">
                <LaunchReadinessSection />
              </div>
            )}
          </div>

          {/* Product Hunt */}
          <div className="bg-white/90 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <SectionHeader
              icon={Rocket}
              label="Channel 1 — Product Hunt"
              title="Product Hunt Launch Plan"
              isOpen={openSection === "product-hunt"}
              onToggle={() => toggle("product-hunt")}
            />
            {openSection === "product-hunt" && (
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
              isOpen={openSection === "reddit"}
              onToggle={() => toggle("reddit")}
            />
            {openSection === "reddit" && (
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
              isOpen={openSection === "research-report"}
              onToggle={() => toggle("research-report")}
            />
            {openSection === "research-report" && (
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
    </AdminLayout>
  );
}
