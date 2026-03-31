#!/usr/bin/env node
/**
 * Resilium Pitch Deck — PowerPoint Generator
 * Usage: node scripts/generate-pptx.mjs
 * Output: exports/resilium-pitch-deck.pptx
 */
import PptxGenJS from "pptxgenjs";
import { readFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, "../artifacts/resilium-pitch/public");
const OUT_DIR = path.join(__dirname, "../exports");
mkdirSync(OUT_DIR, { recursive: true });

// ── Brand tokens ──────────────────────────────────────────────────────────────
const BG       = "0D1225";
const CARD     = "131929";
const CARD2    = "1A2240";
const AMBER    = "E08040";
const CREAM    = "EAD9BE";
const MUTED    = "8A7A6A";
const WHITE    = "FFFFFF";

// ── Image helpers ─────────────────────────────────────────────────────────────
function imgData(filename) {
  try {
    const buf = readFileSync(path.join(PUBLIC, filename));
    return "data:image/png;base64," + buf.toString("base64");
  } catch { return null; }
}
const IMG_HERO_TITLE   = imgData("hero-title.png");
const IMG_HERO_PROBLEM = imgData("hero-problem.png");
const IMG_BRAIN        = imgData("brain-logo.png");

// ── Slide dimensions (10" x 5.625" = 16:9) ───────────────────────────────────
const W = 10, H = 5.625;

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";  // 13.33" x 7.5" - standard widescreen
pptx.title  = "Resilium — Personal Resilience Planning";
pptx.subject = "Replit Agent 4 Buildathon";
pptx.author  = "Resilium";

const SW = 13.33, SH = 7.5; // actual slide dimensions in inches for LAYOUT_WIDE

function label(slide, text, x, y, opts = {}) {
  slide.addText(text, {
    x, y, w: opts.w ?? SW - x - 0.5, h: opts.h ?? 0.4,
    fontSize: opts.size ?? 11,
    bold: opts.bold ?? false,
    color: opts.color ?? CREAM,
    fontFace: opts.font ?? "Calibri",
    align: opts.align ?? "left",
    valign: opts.valign ?? "top",
    wrap: opts.wrap !== false,
    ...opts.extra,
  });
}

function eyebrow(slide, text, x, y, w) {
  label(slide, text.toUpperCase(), x, y, {
    size: 9, bold: true, color: AMBER, w: w ?? 6,
    extra: { charSpacing: 3 },
  });
}

function heading(slide, text, x, y, size, w, color) {
  label(slide, text, x, y, { size: size ?? 36, bold: true, color: color ?? CREAM, w: w ?? 9 });
}

function body(slide, text, x, y, w, size, color) {
  label(slide, text, x, y, { size: size ?? 12, color: color ?? MUTED, w: w ?? 6, wrap: true });
}

function card(slide, x, y, w, h) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    fill: { color: CARD2, transparency: 10 },
    line: { color: AMBER, width: 0.5, transparency: 70 },
    rectRadius: 0.12,
  });
}

function amberLine(slide, x, y, w, vertical = false) {
  if (vertical) {
    slide.addShape(pptx.ShapeType.line, { x, y, w: 0, h: w, line: { color: AMBER, width: 0.5, transparency: 60 } });
  } else {
    slide.addShape(pptx.ShapeType.line, { x, y, w, h: 0, line: { color: AMBER, width: 1.0, transparency: 40 }, });
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 1 — Title
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.background = { color: BG };

  if (IMG_HERO_TITLE) {
    s.addImage({ data: IMG_HERO_TITLE, x: 0, y: 0, w: SW, h: SH, transparency: 55 });
  }

  // Dark gradient overlay (left side)
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: SW * 0.65, h: SH,
    fill: { type: "solid", color: BG, transparency: 8 },
    line: { color: BG, width: 0 },
  });

  // Top-left label: buildathon
  eyebrow(s, "Replit Agent 4 Buildathon", 1.0, 0.5, 8);

  // Amber accent bar
  s.addShape(pptx.ShapeType.rect, { x: 1.0, y: 1.2, w: 0.05, h: 0.4, fill: { color: AMBER }, line: { color: AMBER, width: 0 } });

  // Category
  eyebrow(s, "Personal Resilience Planning", 1.2, 1.2, 8);

  // Main title
  s.addText("Resilium", {
    x: 1.0, y: 1.9, w: 8, h: 2.0,
    fontSize: 80, bold: true, color: CREAM,
    fontFace: "Calibri", align: "left", valign: "top",
  });

  // Tagline
  s.addText("Know how ready you really are.", {
    x: 1.0, y: 4.1, w: 7, h: 0.6,
    fontSize: 20, bold: false, color: CREAM,
    fontFace: "Calibri", align: "left",
    transparency: 20,
  });

  // Bottom bar
  s.addText("Web  •  Mobile  •  API  •  AI", {
    x: 1.0, y: 6.8, w: 6, h: 0.35,
    fontSize: 11, color: MUTED, fontFace: "Calibri",
  });
  s.addText("resilium-ai.replit.app", {
    x: 9.5, y: 6.8, w: 3.3, h: 0.35,
    fontSize: 11, bold: true, color: AMBER, fontFace: "Calibri", align: "right",
  });

  // Right accent line
  s.addShape(pptx.ShapeType.line, {
    x: SW - 0.02, y: 0.5, w: 0, h: SH - 1.0,
    line: { color: AMBER, width: 1.5, transparency: 40 },
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 2 — The Problem
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.background = { color: BG };

  if (IMG_HERO_PROBLEM) {
    s.addImage({ data: IMG_HERO_PROBLEM, x: 0, y: 0, w: SW, h: SH, transparency: 68 });
  }

  eyebrow(s, "The Problem", 1.0, 0.7, 5);

  s.addText("Disruption doesn't announce itself.", {
    x: 1.0, y: 1.15, w: 10, h: 1.5,
    fontSize: 44, bold: true, color: CREAM, fontFace: "Calibri",
  });

  // Big stat
  s.addText("56%", {
    x: 1.0, y: 2.9, w: 3.5, h: 1.8,
    fontSize: 80, bold: true, color: AMBER, fontFace: "Calibri",
  });

  body(s, "of Americans have less than 3 months of emergency savings", 1.0, 4.85, 3.5, 12, CREAM);

  // Divider
  amberLine(s, 4.9, 3.1, 0, true); // vertical line, h=2.6
  s.addShape(pptx.ShapeType.line, { x: 4.9, y: 3.1, w: 0, h: 2.5, line: { color: AMBER, width: 0.5, transparency: 60 } });

  // Right column
  s.addText("No map for uncertainty", {
    x: 5.3, y: 3.05, w: 7.5, h: 0.5,
    fontSize: 22, bold: true, color: CREAM, fontFace: "Calibri",
  });
  body(s, "Job loss, health crises, relocation, natural disaster — people face these without a clear picture of their own readiness.", 5.3, 3.65, 7.5, 12);

  s.addText("Gut feel is not a plan", {
    x: 5.3, y: 4.65, w: 7.5, h: 0.5,
    fontSize: 22, bold: true, color: CREAM, fontFace: "Calibri",
  });
  body(s, "Most people feel either falsely confident or quietly anxious — neither state helps them act.", 5.3, 5.25, 7.5, 12);

  // Source note
  s.addText("Source: Bankrate Emergency Savings Report 2024", {
    x: 1.0, y: 7.1, w: 8, h: 0.3,
    fontSize: 9, color: MUTED, fontFace: "Calibri",
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 3 — The Solution
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.background = { color: BG };

  eyebrow(s, "The Solution", 1.0, 0.55, 5);
  heading(s, "A personal resilience score — and the plan to improve it.", 1.0, 0.95, 32, 11);

  const cols = [
    { num: "01", title: "10-Step Assessment", body: "Financial runway, skills, health, mobility, housing, mental resilience — six weighted dimensions, answered in under 5 minutes." },
    { num: "02", title: "AI-Generated Report", body: "GPT-5.2 produces a 0–100 resilience score, top vulnerabilities, 5 scenario stress-tests, and a personalized action plan." },
    { num: "03", title: "Track Progress", body: "Daily habits, checklists, progress snapshots over time. Pro users unlock crisis scenario simulations and coaching referrals." },
  ];

  const CW = 3.9, CX = [0.8, 4.88, 8.97], CY = 2.1, CH = 4.6;

  cols.forEach((c, i) => {
    card(s, CX[i], CY, CW, CH);
    s.addText(c.num, {
      x: CX[i] + 0.25, y: CY + 0.3, w: 1.5, h: 0.7,
      fontSize: 28, bold: true, color: AMBER, fontFace: "Calibri",
    });
    s.addText(c.title, {
      x: CX[i] + 0.25, y: CY + 1.1, w: CW - 0.5, h: 0.6,
      fontSize: 17, bold: true, color: CREAM, fontFace: "Calibri",
    });
    body(s, c.body, CX[i] + 0.25, CY + 1.85, CW - 0.5, 12);
  });

  body(s, "Grounded. Strategic. Empowering — not alarmist.", 0.8, 7.0, 10, 11, MUTED);
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 4 — Who It's For
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.background = { color: BG };

  // Left panel background
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: SW * 0.42, h: SH,
    fill: { color: CARD2, transparency: 20 },
    line: { color: CARD2, width: 0 },
  });

  eyebrow(s, "Who It's For", 1.0, 0.7, 4);
  s.addText("The quietly\nprepared.", {
    x: 1.0, y: 1.15, w: 4.0, h: 2.2,
    fontSize: 40, bold: true, color: CREAM, fontFace: "Calibri",
    valign: "top",
  });
  body(s, "Not doomsday preppers. Not fearmongers. People who look at an uncertain world and want a clear-eyed plan — not anxiety.", 1.0, 3.6, 3.6, 13);

  // Amber line
  s.addShape(pptx.ShapeType.line, { x: 1.0, y: 5.0, w: 1.3, h: 0, line: { color: AMBER, width: 2.0, transparency: 20 } });

  const audiences = [
    { title: "The Financially Anxious", body: "Stable income, uncertain future — want to know if their safety net is real." },
    { title: "Expats & Digital Nomads", body: "Living across borders, managing multi-currency exposure and relocation risk." },
    { title: "Preparedness Planners", body: "Already thinking ahead — want an objective score, not guesswork." },
    { title: "The Cautiously Aware", body: "Don't call themselves preppers — but they're quietly paying attention." },
  ];

  const RY = [0.55, 2.15, 3.75, 5.35];
  const RH = 1.4;
  audiences.forEach((a, i) => {
    const rx = 5.8, ry = RY[i], rw = 7.0;
    s.addShape(pptx.ShapeType.roundRect, {
      x: rx, y: ry, w: rw, h: RH,
      fill: { color: CARD2, transparency: 15 },
      line: { color: AMBER, width: 2.5, transparency: 0 },
      rectRadius: 0.08,
    });
    // Simulate left border by drawing a thin rect
    s.addShape(pptx.ShapeType.rect, {
      x: rx, y: ry, w: 0.07, h: RH,
      fill: { color: AMBER }, line: { color: AMBER, width: 0 },
    });
    s.addText(a.title, {
      x: rx + 0.2, y: ry + 0.15, w: rw - 0.3, h: 0.45,
      fontSize: 15, bold: true, color: CREAM, fontFace: "Calibri",
    });
    body(s, a.body, rx + 0.2, ry + 0.65, rw - 0.3, 11);
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 5 — Built on Replit
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.background = { color: BG };

  // Top amber line
  amberLine(s, 0, 0.02, SW);

  eyebrow(s, "Built on Replit", 1.0, 0.55, 5);
  heading(s, "Four artifacts. One cohesive platform.", 1.0, 0.95, 32, 11);

  const quadrants = [
    { tag: "Web App",       title: "React + Vite",          body: "Full assessment flow, dashboard, admin panel, GDPR tools, scenario simulations, coaching page" },
    { tag: "Mobile App",    title: "Expo + React Native",   body: "Full assessment on Android (Google Play), push notifications, GDPR data management, score sharing" },
    { tag: "API Server",    title: "Express + PostgreSQL",  body: "Replit Auth (OIDC), Drizzle ORM, Paddle webhooks, Resend emails, rate limiting, cron digest" },
    { tag: "AI Integration",title: "GPT-5.2 via Replit",   body: "AI Integrations proxy — zero API key management. Structured JSON output for reports and scenario analysis." },
  ];

  const GX = [0.7, 7.1], GY = [2.05, 4.85], GW = 5.95, GH = 2.55;
  quadrants.forEach((q, i) => {
    const x = GX[i % 2], y = GY[Math.floor(i / 2)];
    card(s, x, y, GW, GH);
    eyebrow(s, q.tag, x + 0.3, y + 0.25, 4);
    s.addText(q.title, {
      x: x + 0.3, y: y + 0.7, w: GW - 0.5, h: 0.55,
      fontSize: 18, bold: true, color: CREAM, fontFace: "Calibri",
    });
    body(s, q.body, x + 0.3, y + 1.35, GW - 0.5, 12);
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 6 — Monetization
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.background = { color: BG };

  eyebrow(s, "Monetization", 1.0, 0.55, 4);
  heading(s, "Revenue built in\nfrom day one.", 1.0, 0.95, 38, 5.0);
  body(s, "Three compounding revenue streams designed to grow with the user — not extract from them.", 1.0, 3.6, 4.5, 13);

  s.addShape(pptx.ShapeType.line, { x: 1.0, y: 5.0, w: 1.3, h: 0, line: { color: AMBER, width: 2.0, transparency: 20 } });

  const streams = [
    { title: "Freemium Model",    badge: "2 free assessments",   body: "Unlimited for Pro — scenario simulations, full history, coaching referral access." },
    { title: "Pro Subscriptions", badge: "via Paddle",           body: "Paddle integration with live webhook processing, subscription lifecycle management, and Pro badge on profile." },
    { title: "Coaching Referral", badge: "Phoenix Insight",      body: "AI surfaces coaching when psychological scores are low — passive referral funnel to a real coaching service." },
  ];

  const SRY = [0.55, 2.6, 4.65], SRH = 1.75, SRX = 5.8, SRW = 7.0;
  streams.forEach((st, i) => {
    card(s, SRX, SRY[i], SRW, SRH);
    s.addText(st.title, {
      x: SRX + 0.25, y: SRY[i] + 0.25, w: 4.0, h: 0.45,
      fontSize: 16, bold: true, color: CREAM, fontFace: "Calibri",
    });
    // Badge
    s.addShape(pptx.ShapeType.roundRect, {
      x: SRX + 4.5, y: SRY[i] + 0.2, w: 2.25, h: 0.5,
      fill: { color: AMBER, transparency: 85 }, line: { color: AMBER, width: 0.5, transparency: 50 },
      rectRadius: 0.25,
    });
    s.addText(st.badge, {
      x: SRX + 4.5, y: SRY[i] + 0.2, w: 2.25, h: 0.5,
      fontSize: 10, bold: true, color: AMBER, fontFace: "Calibri", align: "center", valign: "middle",
    });
    body(s, st.body, SRX + 0.25, SRY[i] + 0.85, SRW - 0.5, 12);
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 7 — Traction
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.background = { color: BG };

  if (IMG_HERO_PROBLEM) {
    s.addImage({ data: IMG_HERO_PROBLEM, x: 0, y: 0, w: SW, h: SH, transparency: 68 });
  }

  // Bottom amber line
  s.addShape(pptx.ShapeType.line, { x: 0, y: SH - 0.02, w: SW, h: 0, line: { color: AMBER, width: 1.5, transparency: 40 } });

  eyebrow(s, "Where We Are", SW / 2 - 3, 0.6, 6);
  s.addText("The foundation is live.", {
    x: 0.5, y: 1.05, w: SW - 1, h: 1.3,
    fontSize: 48, bold: true, color: CREAM, fontFace: "Calibri", align: "center",
  });

  const stats = [
    { num: "4",  label: "Replit artifacts",    sub: "deployed" },
    { num: "6",  label: "Resilience dimensions", sub: "scored" },
    { num: "3",  label: "Revenue streams",      sub: "active" },
    { num: "1",  label: "Coaching partnership", sub: "live" },
  ];

  const STAT_Y = 2.6, STAT_H = 1.1, STAT_W = 2.8;
  const STAT_XS = [0.9, 3.9, 6.9, 9.9];

  stats.forEach((st, i) => {
    s.addText(st.num, {
      x: STAT_XS[i], y: STAT_Y, w: 1.1, h: 1.0,
      fontSize: 56, bold: true, color: AMBER, fontFace: "Calibri", align: "right",
    });
    s.addShape(pptx.ShapeType.line, {
      x: STAT_XS[i] + 1.2, y: STAT_Y + 0.1, w: 0, h: 0.8,
      line: { color: AMBER, width: 0.5, transparency: 60 },
    });
    s.addText(st.label, {
      x: STAT_XS[i] + 1.4, y: STAT_Y + 0.05, w: 1.4, h: 0.55,
      fontSize: 13, bold: false, color: CREAM, fontFace: "Calibri",
    });
    s.addText(st.sub, {
      x: STAT_XS[i] + 1.4, y: STAT_Y + 0.6, w: 1.4, h: 0.4,
      fontSize: 11, color: MUTED, fontFace: "Calibri",
    });
  });

  // What's Next
  eyebrow(s, "What's Next", SW / 2 - 3, 4.15, 6);
  s.addText("Expanding the scenario library  •  Anonymized community benchmarks  •  Google Play Store launch  •  Deeper coaching integration", {
    x: 1.2, y: 4.55, w: SW - 2.5, h: 0.7,
    fontSize: 12, color: MUTED, fontFace: "Calibri", align: "center",
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 8 — Final Brand Slide
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.background = { color: BG };

  // Top + bottom amber lines
  amberLine(s, 0, 0.02, SW);
  amberLine(s, 0, SH - 0.02, SW);

  // Brain logo centred
  if (IMG_BRAIN) {
    s.addImage({
      data: IMG_BRAIN,
      x: SW / 2 - 2.0,
      y: 0.3,
      w: 4.0,
      h: 4.0,
    });
  }

  // Brand name
  s.addText("Resilium", {
    x: 0, y: 4.45, w: SW, h: 1.1,
    fontSize: 56, bold: true, color: AMBER, fontFace: "Calibri", align: "center",
  });

  // Tagline
  s.addText("Know your readiness.  Build your resilience.", {
    x: 0, y: 5.55, w: SW, h: 0.55,
    fontSize: 16, color: "C4B09A", fontFace: "Calibri", align: "center",
  });

  // URL
  s.addText("resilium-ai.replit.app", {
    x: 0, y: 6.2, w: SW, h: 0.45,
    fontSize: 14, bold: true, color: AMBER, fontFace: "Calibri", align: "center",
  });

  // Footer
  s.addText("Built with Replit Agent 4  •  March 2026", {
    x: 0, y: 7.05, w: SW, h: 0.35,
    fontSize: 10, color: MUTED, fontFace: "Calibri", align: "center",
  });
}

// ── Write file ─────────────────────────────────────────────────────────────
const outPath = path.join(OUT_DIR, "resilium-pitch-deck.pptx");
await pptx.writeFile({ fileName: outPath });
console.log(`\n✅  Saved: ${outPath}\n`);
