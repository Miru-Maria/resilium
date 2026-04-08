import { useEffect, useRef } from "react";
import { jsPDF } from "jspdf";

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */
const TODAY = "April 2026";

const POSITIONING = {
  for: "Anxiety-prepared American adults (28–44)",
  who: "worry about job loss, medical disruption, or natural disasters but feel overwhelmed by where to start",
  product: "Resilium",
  category: "personal resilience planning platform",
  keyBenefit:
    "turns a 15-minute assessment into an ongoing, goal-driven action plan across 7 life dimensions",
  primaryAlternative:
    "one-dimensional psychological tests (score only) or reactive emergency apps (alerts only)",
  keyDifferentiator:
    "addresses all 7 dimensions of readiness — financial, health, skills, mobility, resources, psychological, and social — and stays with you as a living document you actually work",
};

const AUDIENCE_STATS = [
  { stat: "87%", label: "of adults feel anxious about money — up significantly in recent years", source: "Northwestern Mutual 2024" },
  { stat: "43%", label: "would be \"very worried\" they couldn't cover expenses if they lost income tomorrow", source: "Federal Reserve SHED 2024" },
  { stat: "27%", label: "of Americans have 6 months of emergency savings — the amount 63% say they'd need to feel secure", source: "Federal Reserve SHED 2024" },
  { stat: "$400", label: "unexpected expense would force 37% of adults to borrow money or sell something", source: "Federal Reserve SHED 2024" },
];

const COMPETITORS = [
  {
    name: "ReadyScore",
    url: "readyscore.com",
    stage: "Bootstrapped",
    pricing: "Free",
    focus: "Emergency preparedness (11 areas)",
    strengths: ["Multi-area coverage", "Clear fear-based hook", "Free, zero friction"],
    weaknesses: ["Prepper/survivalist framing excludes mainstream", "No action plan — score only", "No engagement loop or Pro tier", "Static web page, no mobile app"],
    type: "Direct (closest format match)",
  },
  {
    name: "Coached.com",
    url: "coached.com",
    stage: "Early stage",
    pricing: "Free",
    focus: "Psychological resilience (4 domains)",
    strengths: ["Beautiful UX", "Research-backed (22-item scale)", "Mainstream, non-threatening framing"],
    weaknesses: ["Psychology only — ignores financial, physical, material dimensions", "No action plan after assessment", "No Pro tier or monetization path"],
    type: "Indirect (assessment only)",
  },
  {
    name: "IDR Labs",
    url: "idrlabs.com",
    stage: "Established (traffic-rich)",
    pricing: "Free",
    focus: "Psychological resilience (RSA-based)",
    strengths: ["High organic traffic (psychology test aggregator)", "Academically credible", "Percentile ranking"],
    weaknesses: ["Score only — zero personalization", "No action planning", "No product or engagement — one-and-done test"],
    type: "Indirect (assessment only)",
  },
  {
    name: "BetterUp",
    url: "betterup.com",
    stage: "Growth ($4.6B valuation)",
    pricing: "~$300+/seat/mo via employer",
    focus: "Enterprise coaching + resilience (Whole Person Model)",
    strengths: ["Longitudinal proof (+125% resilience in 3–4 months)", "Human coaches assigned from assessment", "Multi-dimensional (psychological + professional)"],
    weaknesses: ["B2B only — inaccessible to individuals outside sponsoring employer", "Price is prohibitive for solo-funded consumers", "No consumer-facing self-service path"],
    type: "Indirect (B2B only)",
  },
  {
    name: "PR6 / Hello Driven",
    url: "home.hellodriven.com",
    stage: "Bootstrapped (Australia)",
    pricing: "Org licensing (opaque)",
    focus: "Psychometric resilience — 6 domains (vision, composure, reasoning, tenacity, collaboration, health)",
    strengths: ["Most scientifically rigorous (α = 0.84)", "Three instrument tiers (16 → 84 items)", "Holistic psychological view"],
    weaknesses: ["B2B / HR only — no consumer path", "No financial or material resilience dimensions", "No action plan — pure measurement instrument"],
    type: "Indirect (B2B only)",
  },
  {
    name: "FEMA / Red Cross Apps",
    url: "ready.gov / redcross.org",
    stage: "Government / Nonprofit",
    pricing: "Free",
    focus: "Emergency alerts, offline first aid, family communication plans",
    strengths: ["Trusted brand authority", "Offline functionality", "I'm Safe check-ins"],
    weaknesses: ["Reactive — activates only during crisis", "No scoring or planning", "No personalization, no engagement loop", "No monetization — not a business model comparison"],
    type: "Indirect (reactive only)",
  },
];

const FEATURES = [
  { name: "Multi-dimensional score (5+ dimensions)", weight: 5, values: ["✓", "✓", "✗", "✗", "Partial", "✗", "✗"] },
  { name: "Goal personalization", weight: 5, values: ["✓", "✗", "✗", "✗", "Partial", "✗", "✗"] },
  { name: "Interactive action plan / checklists", weight: 5, values: ["✓", "✗", "✗", "✗", "✗", "✗", "✗"] },
  { name: "Progress tracking over time", weight: 4, values: ["✓", "✗", "✗", "✗", "✓", "Partial", "✗"] },
  { name: "AI-powered recommendations", weight: 4, values: ["Pro", "✗", "✗", "✗", "✓", "✗", "✗"] },
  { name: "Coaching access", weight: 3, values: ["Pro", "✗", "✗", "✗", "✓", "✗", "✗"] },
  { name: "Mobile app", weight: 3, values: ["✓", "✗", "✗", "✗", "✓", "✗", "✓"] },
  { name: "Free tier (no card required)", weight: 4, values: ["✓", "✓", "✓", "✓", "✗", "✗", "✓"] },
  { name: "No personal data required", weight: 4, values: ["✓", "✓", "✓", "✓", "✗", "✗", "✓"] },
  { name: "Consumer-facing (not B2B)", weight: 5, values: ["✓", "✓", "✓", "✓", "✗", "✗", "✓"] },
  { name: "Mainstream framing (not prepper)", weight: 4, values: ["✓", "✗", "✓", "✓", "✓", "✓", "✓"] },
];

const COLS = ["Resilium", "ReadyScore", "Coached", "IDR Labs", "BetterUp", "PR6", "FEMA/RC"];

// 2×2 axes: X = Reactive → Proactive, Y = Narrow → Holistic
const POSITIONING_MAP = [
  { name: "FEMA/RC", x: 8, y: 15, color: "#6b7280" },
  { name: "ReadyScore", x: 35, y: 42, color: "#f59e0b" },
  { name: "IDR Labs", x: 72, y: 18, color: "#6b7280" },
  { name: "Coached", x: 78, y: 20, color: "#6b7280" },
  { name: "PR6", x: 80, y: 38, color: "#8b5cf6" },
  { name: "BetterUp", x: 82, y: 58, color: "#3b82f6" },
  { name: "Resilium", x: 90, y: 88, color: "#E08040" },
];

const WHITE_SPACE = [
  {
    gap: "Multi-dimensional + actionable plan — combined",
    detail:
      "Every competitor does one or the other. Assessment tools (Coached, IDR Labs, PR6) give a score and nothing else. Preparedness tools (ReadyScore, FEMA) give checklists without a personalized score. Resilium is the only consumer product that does both — and ties them to a stated goal.",
  },
  {
    gap: "Mainstream anxiety-preparedness framing",
    detail:
      'ReadyScore owns the prepper/survivalist audience (\"barter goods, metals, 15-minute evacuation\"). The much larger mainstream audience — anxious professionals who want financial stability and smart contingency plans — is entirely unaddressed. Resilium\'s language (\"Strategic Action Plan,\" \"financial runway,\" \"living document\") occupies this space by default.',
  },
  {
    gap: "Assessment-to-coaching referral pipeline",
    detail:
      "No competitor builds a direct consumer pathway from a resilience assessment to human coaching. BetterUp does this, but only through employers. Resilium's Pro tier bridges assessment → personalized plan → Phoenix Insight Coaching — a monetizable funnel no one else in this space has built.",
  },
];

const KANO = [
  { category: "Basic (table stakes — must have)", items: "Free tier, some scoring mechanism, psychological dimension" },
  { category: "Performance (more = better)", items: "More assessed dimensions, better AI recommendations, more scenario types, deeper action steps" },
  { category: "Delighter (unexpected, differentiating)", items: "Goal personalization, 'living document' plan, coaching referral, mobile tracking, financial dimension, privacy-first (no personal data)" },
];

const ACTION_PLAN = [
  {
    action: "Own the 'anxiety-prepared mainstream' identity explicitly in all top-of-funnel copy",
    detail:
      "ReadyScore has locked the survivalist segment. Resilium's natural audience is the $60–150k professional who's afraid of job loss — not tornadoes. Adjust SEO targeting toward terms like 'financial preparedness plan,' 'personal resilience score,' 'what happens if I lose my job checklist.' This segment is 3–5× larger than the prepper market.",
    source: "Fed SHED 2024: 43% very worried about losing income; Northwestern Mutual: 87% financially anxious",
  },
  {
    action: "Develop the coaching referral into a measurable conversion funnel",
    detail:
      "The Phoenix Insight Coaching referral is currently passive. No other consumer product in this space offers assessment → plan → coaching in one flow. Add explicit conversion steps: after the user's first plan checklist completion, trigger a contextual coaching CTA tied to their goal (e.g., 'financial runway' goal → income resilience coaching offer). Track referral → booking conversion rate as a primary Pro metric.",
    source: "BetterUp data: +125% resilience from 3–4 months coaching; gap: no consumer product bridges this",
  },
  {
    action: "Prioritize score history and re-assessment as the core Pro retention mechanic",
    detail:
      "BetterUp's most powerful proof point is its longitudinal data. Resilium has the architecture for this (multiple assessments, score history). Shipping this feature and making re-assessment a 90-day ritual creates the 'before and after' story that generates organic social proof — the most cost-effective growth channel for a solo-founded product at this stage.",
    source: "BetterUp ROI: +135% resilience, +146% productivity tracked longitudinally; no competitor offers this for consumers",
  },
];

const SOURCES = [
  { n: 1, text: "ReadyScore homepage — readyscore.com (fetched April 2026)" },
  { n: 2, text: "Coached.com Personal Resilience Scale — coached.com/tools/personal-resilience-scale (fetched April 2026)" },
  { n: 3, text: "IDR Labs Personal Resilience Test — idrlabs.com/personal-resilience/test.php (web search, April 2026)" },
  { n: 4, text: "BetterUp resilience outcomes and pricing — web search via multiple sources, April 2026" },
  { n: 5, text: "Hello Driven PR6 — home.hellodriven.com (web search, April 2026)" },
  { n: 6, text: "Federal Reserve SHED 2024 — emergency savings and income anxiety statistics" },
  { n: 7, text: "Northwestern Mutual 2024 Planning & Progress Study — financial anxiety statistics" },
  { n: 8, text: "FEMA and American Red Cross app features — ready.gov, redcross.org (web search, April 2026)" },
  { n: 9, text: "Funded preparedness/emergency startups (Prepared, Batten, RapidSOS) — web search, April 2026" },
];

/* ─────────────────────────────────────────────────────────────
   PDF GENERATOR
───────────────────────────────────────────────────────────── */
function generatePDF() {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const PW = 612, PH = 792, M = 36;
  const CW = PW - M * 2;
  const BRAND = [224, 128, 64] as [number, number, number];
  const DARK = [13, 18, 37] as [number, number, number];
  const LIGHT = [234, 217, 190] as [number, number, number];
  const GRAY = [120, 120, 130] as [number, number, number];
  const RED = [220, 60, 60] as [number, number, number];
  const GREEN = [34, 140, 80] as [number, number, number];

  let page = 1;
  const totalPages = 8;

  function header() {
    doc.setFillColor(...DARK);
    doc.rect(0, 0, PW, 24, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(224, 128, 64);
    doc.text("RESILIUM — COMPETITIVE ANALYSIS", M, 16);
    doc.setTextColor(200, 200, 200);
    doc.text(TODAY, PW - M, 16, { align: "right" });
  }

  function footer(title: string) {
    doc.setFillColor(245, 245, 248);
    doc.rect(0, PH - 22, PW, 22, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY);
    doc.text(title, M, PH - 8);
    doc.text(`${page} / ${totalPages}`, PW - M, PH - 8, { align: "right" });
    doc.text("Confidential — Solo Founder Internal", PW / 2, PH - 8, { align: "center" });
    page++;
  }

  function addPage(title = "") {
    doc.addPage();
    header();
    footer(title);
  }

  function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    doc.setFontSize(fontSize);
    return doc.splitTextToSize(text, maxWidth);
  }

  // ── PAGE 1: EXECUTIVE SUMMARY ──────────────────────────────
  header();
  // Cover block
  doc.setFillColor(...DARK);
  doc.rect(M, 30, CW, 100, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(224, 128, 64);
  doc.text("Resilium", M + 16, 62);
  doc.setFontSize(11);
  doc.setTextColor(234, 217, 190);
  doc.text("Competitive Analysis — Personal Resilience Planning Market", M + 16, 80);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 165);
  doc.text(`${TODAY}  ·  Solo Founder Internal  ·  6 Competitors Analyzed`, M + 16, 100);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 130);
  doc.text("Target segment: Anxiety-prepared American adults, 28–44  ·  Format: Consumer web + mobile", M + 16, 118);

  // Positioning statement box
  let y = 150;
  doc.setFillColor(255, 248, 240);
  doc.setDrawColor(...BRAND);
  doc.roundedRect(M, y, CW, 100, 4, 4, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...BRAND);
  doc.text("APRIL DUNFORD POSITIONING STATEMENT", M + 12, y + 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...DARK);
  const posText = `For ${POSITIONING.for} who ${POSITIONING.who}, ${POSITIONING.product} is the ${POSITIONING.category} that ${POSITIONING.keyBenefit}. Unlike ${POSITIONING.primaryAlternative}, Resilium ${POSITIONING.keyDifferentiator}.`;
  const posLines = wrapText(posText, CW - 24, 9.5);
  doc.text(posLines, M + 12, y + 32);

  // Top 3 recommendations
  y = 265;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text("Top 3 Strategic Recommendations", M, y);
  y += 16;

  const recs = [
    "Own the 'anxiety-prepared mainstream' — explicitly distance from prepper framing in all SEO and top-of-funnel copy.",
    "Build the coaching referral into a measurable funnel — no competitor bridges assessment → plan → coaching for consumers.",
    "Ship score history and re-assessment as the core Pro retention mechanic — this generates social proof and locks in users.",
  ];

  recs.forEach((rec, i) => {
    doc.setFillColor(...BRAND);
    doc.circle(M + 7, y + 4, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(String(i + 1), M + 7, y + 7, { align: "center" });
    const lines = wrapText(rec, CW - 24, 9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...DARK);
    doc.text(lines, M + 20, y + 7);
    y += Math.max(lines.length * 11, 22) + 8;
  });

  // Market validation stats
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text("Market Validation", M, y);
  y += 14;

  const colW = CW / 4;
  AUDIENCE_STATS.forEach((s, i) => {
    const x = M + i * colW;
    doc.setFillColor(248, 248, 252);
    doc.rect(x, y, colW - 6, 70, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...BRAND);
    doc.text(s.stat, x + (colW - 6) / 2, y + 24, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...DARK);
    const lines = wrapText(s.label, colW - 16, 7);
    doc.text(lines, x + (colW - 6) / 2, y + 36, { align: "center" });
    doc.setTextColor(...GRAY);
    doc.text(s.source, x + (colW - 6) / 2, y + 62, { align: "center" });
  });

  footer("Executive Summary");

  // ── PAGE 2: COMPETITIVE LANDSCAPE ─────────────────────────
  addPage("Competitive Landscape");
  y = 44;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...DARK);
  doc.text("Competitive Landscape", M, y);
  y += 6;
  doc.setFillColor(...BRAND);
  doc.rect(M, y, 40, 2, "F");
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);
  doc.text("Six competitors analyzed across four categories: direct (same format), indirect assessment tools, B2B platforms, and government/nonprofit apps.", M, y, { maxWidth: CW });
  y += 20;

  // Table header
  const cols2 = [110, 80, 80, 130, 140];
  const headers2 = ["Company", "Stage", "Pricing", "Strength", "Weakness"];
  doc.setFillColor(...DARK);
  doc.rect(M, y, CW, 18, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  let xOff = M;
  headers2.forEach((h, i) => {
    doc.text(h, xOff + 4, y + 12);
    xOff += cols2[i];
  });
  y += 18;

  COMPETITORS.forEach((c, ci) => {
    const bg = ci % 2 === 0 ? [252, 252, 255] : [246, 246, 250];
    const rowH = 48;
    doc.setFillColor(bg[0], bg[1], bg[2]);
    doc.rect(M, y, CW, rowH, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...DARK);
    xOff = M;
    doc.text(c.name, xOff + 4, y + 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    const typeLines = wrapText(c.type, cols2[0] - 8, 6.5);
    doc.text(typeLines, xOff + 4, y + 22);
    xOff += cols2[0];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...DARK);
    doc.text(c.stage, xOff + 4, y + 14, { maxWidth: cols2[1] - 8 });
    xOff += cols2[1];

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(ci === 3 ? RED[0] : GREEN[0], ci === 3 ? RED[1] : GREEN[1], ci === 3 ? RED[2] : GREEN[2]);
    doc.text(c.pricing, xOff + 4, y + 14);
    xOff += cols2[2];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...DARK);
    const sLines = wrapText(c.strengths[0], cols2[3] - 8, 7);
    doc.text(sLines, xOff + 4, y + 12);
    xOff += cols2[3];

    doc.setTextColor(180, 60, 60);
    const wLines = wrapText(c.weaknesses[0], cols2[4] - 8, 7);
    doc.text(wLines, xOff + 4, y + 12);

    y += rowH;
  });

  // Per-competitor deep dive (strengths + weaknesses)
  y += 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text("Competitor Deep Dives — Strengths & Weaknesses", M, y);
  y += 14;

  COMPETITORS.forEach((c) => {
    if (y > PH - 120) { doc.addPage(); header(); footer("Competitive Landscape (cont.)"); y = 44; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text(`${c.name}  (${c.url})`, M, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY);
    doc.text(`${c.stage} · ${c.pricing} · ${c.focus}`, M, y + 11);
    y += 22;

    const half = (CW / 2) - 6;
    const startY = y;
    // Strengths
    doc.setFillColor(240, 255, 245);
    doc.setDrawColor(34, 140, 80);
    doc.roundedRect(M, y, half, c.strengths.length * 14 + 12, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...GREEN);
    doc.text("STRENGTHS", M + 6, y + 10);
    c.strengths.forEach((s, si) => {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...DARK);
      doc.text(`+ ${s}`, M + 6, y + 20 + si * 14, { maxWidth: half - 12 });
    });
    // Weaknesses
    const wx = M + half + 12;
    doc.setFillColor(255, 243, 243);
    doc.setDrawColor(...RED);
    doc.roundedRect(wx, startY, half, c.weaknesses.length * 14 + 12, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...RED);
    doc.text("WEAKNESSES", wx + 6, startY + 10);
    c.weaknesses.forEach((w, wi) => {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...DARK);
      doc.text(`− ${w}`, wx + 6, startY + 20 + wi * 14, { maxWidth: half - 12 });
    });
    y = startY + Math.max(c.strengths.length, c.weaknesses.length) * 14 + 20;
  });

  // ── PAGE 4: FEATURE MATRIX ─────────────────────────────────
  doc.addPage();
  header();
  footer("Feature Matrix");
  y = 44;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...DARK);
  doc.text("Feature Matrix", M, y);
  y += 6;
  doc.setFillColor(...BRAND);
  doc.rect(M, y, 40, 2, "F");
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);
  doc.text("Weight (1–5) reflects buyer decision priority based on market research. Green = Resilium wins; Red = gap; Amber = partial.", M, y, { maxWidth: CW });
  y += 18;

  const capW = 190;
  const wgtW = 28;
  const cellW = (CW - capW - wgtW) / COLS.length;

  // Col headers
  doc.setFillColor(...DARK);
  doc.rect(M, y, CW, 18, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  doc.text("Capability", M + 4, y + 12);
  doc.text("Wgt", M + capW + 4, y + 12);
  COLS.forEach((col, ci) => {
    const cx = M + capW + wgtW + ci * cellW;
    doc.setTextColor(...(ci === 0 ? [224, 128, 64] as [number, number, number] : [255, 255, 255] as [number, number, number]));
    doc.text(col, cx + cellW / 2, y + 12, { align: "center" });
  });
  y += 18;

  FEATURES.forEach((f, fi) => {
    const rowH = 22;
    const bg = fi % 2 === 0 ? [252, 252, 255] as [number, number, number] : [246, 246, 250] as [number, number, number];
    doc.setFillColor(...bg);
    doc.rect(M, y, CW, rowH, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...DARK);
    doc.text(f.name, M + 4, y + 14, { maxWidth: capW - 8 });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY);
    doc.text(String(f.weight), M + capW + wgtW / 2, y + 14, { align: "center" });

    f.values.forEach((v, vi) => {
      const cx = M + capW + wgtW + vi * cellW;
      let color: [number, number, number] = DARK;
      if (v === "✓") color = GREEN;
      else if (v === "✗") color = RED;
      else if (v === "Pro") color = BRAND;
      else if (v === "Partial") color = [200, 140, 0];
      doc.setFont("helvetica", "bold");
      doc.setFontSize(vi === 0 ? 8 : 8);
      doc.setTextColor(...color);
      doc.text(v, cx + cellW / 2, y + 14, { align: "center" });
    });
    y += rowH;
  });

  // ── PAGE 5: POSITIONING MAP ────────────────────────────────
  doc.addPage();
  header();
  footer("Positioning Map");
  y = 44;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...DARK);
  doc.text("Positioning Map", M, y);
  y += 6;
  doc.setFillColor(...BRAND);
  doc.rect(M, y, 40, 2, "F");
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);
  doc.text("Axes reflect the two dimensions buyers care about most: How proactive is the solution? How holistically does it cover my life?", M, y, { maxWidth: CW });
  y += 24;

  // Draw 2×2
  const mapW = CW - 60;
  const mapH = 320;
  const mx = M + 30;
  const my = y;

  // Background quadrants
  doc.setFillColor(250, 250, 255);
  doc.rect(mx, my, mapW / 2, mapH / 2, "F");
  doc.setFillColor(240, 248, 255);
  doc.rect(mx + mapW / 2, my, mapW / 2, mapH / 2, "F");
  doc.setFillColor(245, 255, 245);
  doc.rect(mx, my + mapH / 2, mapW / 2, mapH / 2, "F");
  doc.setFillColor(255, 255, 240);
  doc.rect(mx + mapW / 2, my + mapH / 2, mapW / 2, mapH / 2, "F");

  // Axes
  doc.setDrawColor(180, 180, 190);
  doc.setLineWidth(0.5);
  doc.line(mx, my, mx + mapW, my); // top
  doc.line(mx, my + mapH, mx + mapW, my + mapH); // bottom
  doc.line(mx, my, mx, my + mapH); // left
  doc.line(mx + mapW, my, mx + mapW, my + mapH); // right
  doc.setDrawColor(200, 200, 210);
  doc.line(mx + mapW / 2, my, mx + mapW / 2, my + mapH); // center vertical
  doc.line(mx, my + mapH / 2, mx + mapW, my + mapH / 2); // center horizontal

  // Axis labels
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);
  doc.text("← Reactive (alerts only)", mx, my - 6);
  doc.text("Proactive (planning) →", mx + mapW, my - 6, { align: "right" });
  // Y axis labels (rotated manually)
  doc.text("Holistic (5+ dimensions)", mx - 6, my + 8, { angle: 90, align: "right" });
  doc.text("Narrow (1–2 dimensions)", mx - 6, my + mapH, { angle: 90, align: "right" });

  // Quadrant labels
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(180, 180, 200);
  doc.text("Reactive\n& Narrow", mx + mapW / 4, my + 14, { align: "center" });
  doc.text("Proactive\n& Narrow", mx + mapW * 0.75, my + 14, { align: "center" });
  doc.text("Reactive\n& Holistic", mx + mapW / 4, my + mapH / 2 + 14, { align: "center" });
  doc.text("Proactive\n& Holistic\n(WHITE SPACE)", mx + mapW * 0.75, my + mapH / 2 + 14, { align: "center" });

  // Plot competitors
  POSITIONING_MAP.forEach((pt) => {
    const px = mx + (pt.x / 100) * mapW;
    const py = my + mapH - (pt.y / 100) * mapH;
    const r = pt.name === "Resilium" ? 7 : 5;
    const col = pt.color;
    const rgb = col === "#E08040" ? [224, 128, 64] as [number, number, number]
      : col === "#f59e0b" ? [245, 158, 11] as [number, number, number]
      : col === "#8b5cf6" ? [139, 92, 246] as [number, number, number]
      : col === "#3b82f6" ? [59, 130, 246] as [number, number, number]
      : [107, 114, 128] as [number, number, number];
    doc.setFillColor(...rgb);
    doc.circle(px, py, r, "F");
    doc.setFont("helvetica", pt.name === "Resilium" ? "bold" : "normal");
    doc.setFontSize(pt.name === "Resilium" ? 8.5 : 7);
    doc.setTextColor(...rgb);
    const labelX = pt.name === "FEMA/RC" ? px + 8 : pt.name === "Resilium" ? px - 8 : px + 8;
    const labelY = pt.name === "Resilium" ? py - 10 : pt.name === "IDR Labs" ? py - 8 : py + (r + 8);
    doc.text(pt.name, labelX, labelY, pt.name === "Resilium" ? { align: "right" } : {});
  });

  // White space annotation
  y = my + mapH + 20;
  doc.setFillColor(255, 248, 240);
  doc.setDrawColor(...BRAND);
  doc.roundedRect(M, y, CW, 40, 3, 3, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND);
  doc.text("WHITE SPACE", M + 10, y + 13);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DARK);
  doc.text("The top-right quadrant (Proactive + Holistic) is entirely uncontested in the consumer market. BetterUp occupies an adjacent position but is B2B-only and employer-sponsored — inaccessible to individual consumers.", M + 10, y + 26, { maxWidth: CW - 20 });

  // ── PAGE 6: WHITE SPACE & KANO ─────────────────────────────
  doc.addPage();
  header();
  footer("White Space & Kano Analysis");
  y = 44;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...DARK);
  doc.text("White Space & Opportunities", M, y);
  y += 6;
  doc.setFillColor(...BRAND);
  doc.rect(M, y, 40, 2, "F");
  y += 20;

  WHITE_SPACE.forEach((ws, i) => {
    if (y > PH - 100) { doc.addPage(); header(); footer("White Space (cont.)"); y = 44; }
    doc.setFillColor(255, 248, 240);
    doc.setDrawColor(...BRAND);
    const wsLines = wrapText(ws.detail, CW - 80, 8.5);
    const wsH = wsLines.length * 12 + 40;
    doc.roundedRect(M, y, CW, wsH, 3, 3, "FD");
    doc.setFillColor(...BRAND);
    doc.circle(M + 18, y + 18, 9, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(String(i + 1), M + 18, y + 22, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...DARK);
    doc.text(ws.gap, M + 36, y + 18, { maxWidth: CW - 50 });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(60, 60, 80);
    doc.text(wsLines, M + 36, y + 32);
    y += wsH + 12;
  });

  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...DARK);
  doc.text("Kano Analysis — Where the Bar Is Moving", M, y);
  y += 14;

  KANO.forEach((k, ki) => {
    const bg = ki === 0 ? [245, 245, 250] as [number, number, number] : ki === 1 ? [240, 248, 255] as [number, number, number] : [255, 248, 240] as [number, number, number];
    const accent = ki === 0 ? GRAY : ki === 1 ? [59, 130, 246] as [number, number, number] : BRAND;
    const kLines = wrapText(k.items, CW - 120, 8.5);
    const kH = kLines.length * 11 + 28;
    doc.setFillColor(...bg);
    doc.rect(M, y, CW, kH, "F");
    doc.setFillColor(...accent);
    doc.rect(M, y, 6, kH, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...accent);
    doc.text(k.category.split("(")[0].trim(), M + 14, y + 14);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY);
    const catNote = k.category.match(/\(([^)]+)\)/)?.[1] ?? "";
    if (catNote) doc.text(`(${catNote})`, M + 14, y + 24);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...DARK);
    doc.text(kLines, M + 14, y + (catNote ? 36 : 26));
    y += kH + 8;
  });

  // ── PAGE 7: ACTION PLAN ────────────────────────────────────
  doc.addPage();
  header();
  footer("Action Plan");
  y = 44;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...DARK);
  doc.text("Strategic Action Plan", M, y);
  y += 6;
  doc.setFillColor(...BRAND);
  doc.rect(M, y, 40, 2, "F");
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);
  doc.text("Three specific, source-cited recommendations — not 'monitor the threat.' Each maps to a concrete near-term action.", M, y, { maxWidth: CW });
  y += 20;

  ACTION_PLAN.forEach((a, ai) => {
    const detLines = wrapText(a.detail, CW - 48, 8.5);
    const srcLines = wrapText(`Source: ${a.source}`, CW - 48, 7.5);
    const boxH = detLines.length * 11 + srcLines.length * 10 + 60;
    if (y + boxH > PH - 60) { doc.addPage(); header(); footer("Action Plan (cont.)"); y = 44; }
    doc.setFillColor(252, 252, 255);
    doc.setDrawColor(200, 200, 210);
    doc.roundedRect(M, y, CW, boxH, 4, 4, "FD");
    doc.setFillColor(...BRAND);
    doc.roundedRect(M, y, 32, boxH, 4, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(String(ai + 1), M + 16, y + boxH / 2 + 5, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...DARK);
    const titleLines = wrapText(a.action, CW - 52, 10);
    doc.text(titleLines, M + 42, y + 16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(60, 60, 80);
    doc.text(detLines, M + 42, y + 16 + titleLines.length * 13 + 6);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY);
    doc.text(srcLines, M + 42, y + boxH - srcLines.length * 10 - 8);
    y += boxH + 14;
  });

  // ── PAGE 8: SOURCES ────────────────────────────────────────
  doc.addPage();
  header();
  footer("Sources");
  y = 44;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...DARK);
  doc.text("Sources", M, y);
  y += 6;
  doc.setFillColor(...BRAND);
  doc.rect(M, y, 40, 2, "F");
  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);
  doc.text("All claims in this report are traceable to one or more of the following sources.", M, y, { maxWidth: CW });
  y += 20;

  SOURCES.forEach((s) => {
    doc.setFillColor(248, 248, 252);
    doc.rect(M, y, CW, 22, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...BRAND);
    doc.text(`[${s.n}]`, M + 8, y + 14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...DARK);
    doc.text(s.text, M + 30, y + 14, { maxWidth: CW - 36 });
    y += 26;
  });

  y += 20;
  doc.setFillColor(245, 245, 248);
  doc.rect(M, y, CW, 50, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text("Research Methodology Note", M + 10, y + 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(
    "Competitor profiles were built from: (1) direct homepage fetches, (2) product pages, (3) web searches aggregating third-party reviews and news coverage, and (4) publicly available pricing data. ReadyScore profile is based on direct homepage fetch. Coached.com profile is based on direct tool page fetch. SimilarWeb traffic estimates were not used due to likely sub-50k visit threshold unreliability. No paid research tools (Klue, Crayon, PitchBook) were available. All pricing is approximate unless explicitly stated by the competitor.",
    M + 10, y + 26, { maxWidth: CW - 20 });

  doc.save(`Resilium-Competitive-Analysis-${TODAY.replace(" ", "-")}.pdf`);
}

/* ─────────────────────────────────────────────────────────────
   REACT WEB PREVIEW
───────────────────────────────────────────────────────────── */
function FeatureDot({ value }: { value: string }) {
  if (value === "✓") return <span className="text-emerald-600 font-bold text-base">✓</span>;
  if (value === "✗") return <span className="text-red-500 font-bold text-base">✗</span>;
  if (value === "Pro") return <span className="text-[#E08040] font-bold text-xs px-1.5 py-0.5 bg-orange-50 rounded-full">Pro</span>;
  if (value === "Partial") return <span className="text-amber-600 font-bold text-xs">~</span>;
  return <span className="text-gray-400 text-sm">{value}</span>;
}

export default function CompetitiveAnalysisPage() {
  const mapRef = useRef<SVGSVGElement>(null);

  // auto-scroll on hash
  useEffect(() => {
    if (window.location.hash) {
      const el = document.getElementById(window.location.hash.slice(1));
      el?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F7FA] font-sans">
      {/* ── HEADER ── */}
      <div className="bg-[#0D1225] text-white px-8 py-5 flex items-center justify-between sticky top-0 z-50 shadow-xl">
        <div>
          <span className="text-[#E08040] font-bold text-lg tracking-tight">Resilium</span>
          <span className="text-gray-400 text-sm ml-3">Competitive Analysis · {TODAY}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 hidden sm:block">Confidential · Solo Founder</span>
          <button
            onClick={generatePDF}
            className="bg-[#E08040] hover:bg-[#c86e2e] text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
          >
            Download PDF
          </button>
        </div>
      </div>

      {/* ── NAV ── */}
      <nav className="bg-white border-b border-gray-200 px-8 py-2 flex gap-6 text-xs font-medium text-gray-500 overflow-x-auto">
        {["executive-summary", "landscape", "feature-matrix", "positioning-map", "white-space", "action-plan", "sources"].map(id => (
          <a key={id} href={`#${id}`} className="hover:text-[#E08040] whitespace-nowrap transition-colors capitalize">{id.replace(/-/g, " ")}</a>
        ))}
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-14">

        {/* ── PAGE 1: EXECUTIVE SUMMARY ── */}
        <section id="executive-summary">
          <div className="bg-[#0D1225] rounded-2xl p-8 mb-8">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <p className="text-[#EAD9BE] text-xs uppercase tracking-widest mb-2">Personal Resilience Planning Market</p>
                <h1 className="text-3xl font-bold text-white mb-1">Competitive Analysis</h1>
                <p className="text-gray-400 text-sm">6 competitors analyzed · {TODAY} · Target: US consumers, 28–44</p>
              </div>
            </div>
          </div>

          {/* Dunford positioning */}
          <div className="bg-orange-50 border border-[#E08040]/30 rounded-2xl p-6 mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-[#E08040] mb-3">April Dunford Positioning Statement</p>
            <p className="text-gray-800 text-base leading-relaxed">
              For <strong>{POSITIONING.for}</strong> who {POSITIONING.who},{" "}
              <strong>Resilium</strong> is the {POSITIONING.category} that {POSITIONING.keyBenefit}.
              Unlike {POSITIONING.primaryAlternative}, Resilium {POSITIONING.keyDifferentiator}.
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {AUDIENCE_STATS.map((s) => (
              <div key={s.stat} className="bg-white rounded-xl p-4 border border-gray-200 text-center shadow-sm">
                <p className="text-3xl font-bold text-[#E08040]">{s.stat}</p>
                <p className="text-xs text-gray-700 mt-1 leading-snug">{s.label}</p>
                <p className="text-[10px] text-gray-400 mt-2">{s.source}</p>
              </div>
            ))}
          </div>

          {/* Top 3 recommendations */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Top 3 Strategic Recommendations</h2>
            <div className="space-y-4">
              {ACTION_PLAN.map((a, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-7 h-7 rounded-full bg-[#E08040] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">{i + 1}</span>
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed">{a.action}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PAGE 2: COMPETITIVE LANDSCAPE ── */}
        <section id="landscape">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Competitive Landscape</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-6" />
          <p className="text-sm text-gray-500 mb-6">6 competitors across four categories: direct (same format), indirect assessment tools, B2B platforms, and government/nonprofit apps.</p>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm mb-10">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="bg-[#0D1225] text-white">
                  <th className="text-left px-4 py-3 font-semibold">Company</th>
                  <th className="text-left px-4 py-3 font-semibold">Type</th>
                  <th className="text-left px-4 py-3 font-semibold">Stage</th>
                  <th className="text-left px-4 py-3 font-semibold">Pricing</th>
                  <th className="text-left px-4 py-3 font-semibold">Top Strength</th>
                  <th className="text-left px-4 py-3 font-semibold">Top Weakness</th>
                </tr>
              </thead>
              <tbody>
                {COMPETITORS.map((c, i) => (
                  <tr key={c.name} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3">
                      <p className="font-bold text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.url}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.type.startsWith("Direct") ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}`}>{c.type.split(" ")[0]}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-xs">{c.stage}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold text-xs ${c.pricing === "Free" ? "text-emerald-600" : c.pricing.startsWith("~") ? "text-red-500" : "text-gray-700"}`}>{c.pricing}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700">{c.strengths[0]}</td>
                    <td className="px-4 py-3 text-xs text-red-600">{c.weaknesses[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Deep dive cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {COMPETITORS.map((c) => (
              <div key={c.name} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold text-gray-900">{c.name}</h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.type.startsWith("Direct") ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}`}>{c.type.split(" ")[0]}</span>
                </div>
                <p className="text-xs text-gray-400 mb-3">{c.url} · {c.stage} · {c.pricing}</p>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed">{c.focus}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-bold text-emerald-600 mb-1">Strengths</p>
                    <ul className="space-y-1">
                      {c.strengths.map(s => <li key={s} className="text-xs text-gray-700 leading-snug">+ {s}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-red-500 mb-1">Weaknesses</p>
                    <ul className="space-y-1">
                      {c.weaknesses.map(w => <li key={w} className="text-xs text-gray-700 leading-snug">− {w}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PAGE 3: FEATURE MATRIX ── */}
        <section id="feature-matrix">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Feature Matrix</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-4" />
          <p className="text-sm text-gray-500 mb-6">Weight (1–5) = buyer decision priority. Green = Resilium wins. Red = gap. Amber = partial match.</p>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full text-xs min-w-[700px]">
              <thead>
                <tr className="bg-[#0D1225] text-white">
                  <th className="text-left px-4 py-3 font-semibold w-56">Capability</th>
                  <th className="text-center px-2 py-3 font-semibold w-10 text-gray-400">Wgt</th>
                  {COLS.map((c, i) => (
                    <th key={c} className={`text-center px-2 py-3 font-semibold ${i === 0 ? "text-[#E08040]" : ""}`}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((f, fi) => (
                  <tr key={f.name} className={fi % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-2.5 text-gray-800 font-medium leading-snug">{f.name}</td>
                    <td className="text-center px-2 py-2.5 text-gray-400 font-semibold">{f.weight}</td>
                    {f.values.map((v, vi) => (
                      <td key={vi} className={`text-center px-2 py-2.5 ${vi === 0 ? "bg-orange-50/40" : ""}`}>
                        <FeatureDot value={v} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── PAGE 4: POSITIONING MAP ── */}
        <section id="positioning-map">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Positioning Map</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-4" />
          <p className="text-sm text-gray-500 mb-6">Axes reflect the two dimensions buyers care about most: How proactive is the solution? How comprehensively does it address my life?</p>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <svg ref={mapRef} viewBox="0 0 500 400" className="w-full max-w-2xl mx-auto block">
              {/* Quadrant backgrounds */}
              <rect x="50" y="20" width="200" height="170" fill="#f3f4f6" />
              <rect x="250" y="20" width="200" height="170" fill="#eff6ff" />
              <rect x="50" y="190" width="200" height="170" fill="#f0fdf4" />
              <rect x="250" y="190" width="200" height="170" fill="#fffbeb" />
              {/* Grid */}
              <line x1="50" y1="20" x2="450" y2="20" stroke="#d1d5db" strokeWidth="1" />
              <line x1="50" y1="360" x2="450" y2="360" stroke="#d1d5db" strokeWidth="1" />
              <line x1="50" y1="20" x2="50" y2="360" stroke="#d1d5db" strokeWidth="1" />
              <line x1="450" y1="20" x2="450" y2="360" stroke="#d1d5db" strokeWidth="1" />
              <line x1="250" y1="20" x2="250" y2="360" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
              <line x1="50" y1="190" x2="450" y2="190" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
              {/* Axis labels */}
              <text x="50" y="14" fontSize="9" fill="#9ca3af">← Reactive (alerts only)</text>
              <text x="450" y="14" fontSize="9" fill="#9ca3af" textAnchor="end">Proactive (planning) →</text>
              <text x="44" y="28" fontSize="8" fill="#9ca3af" textAnchor="end" transform="rotate(-90, 44, 190)">Holistic (5+ dimensions)</text>
              <text x="44" y="360" fontSize="8" fill="#9ca3af" textAnchor="middle" transform="rotate(-90, 44, 300)">Narrow</text>
              {/* Quadrant labels */}
              <text x="150" y="42" fontSize="8" fill="#d1d5db" textAnchor="middle">Reactive + Narrow</text>
              <text x="350" y="42" fontSize="8" fill="#d1d5db" textAnchor="middle">Proactive + Narrow</text>
              <text x="150" y="212" fontSize="8" fill="#d1d5db" textAnchor="middle">Reactive + Holistic</text>
              <text x="350" y="212" fontSize="8" fill="#6b7280" textAnchor="middle" fontWeight="bold">Proactive + Holistic</text>
              <text x="350" y="224" fontSize="7" fill="#E08040" textAnchor="middle" fontWeight="bold">← WHITE SPACE</text>
              {/* Competitor dots */}
              {POSITIONING_MAP.map((pt) => {
                const px = 50 + (pt.x / 100) * 400;
                const py = 360 - (pt.y / 100) * 340;
                const r = pt.name === "Resilium" ? 10 : 6;
                const isResilem = pt.name === "Resilium";
                return (
                  <g key={pt.name}>
                    <circle cx={px} cy={py} r={r} fill={pt.color} />
                    <text
                      x={isResilem ? px - 14 : px + 10}
                      y={isResilem ? py - 14 : py + 4}
                      fontSize={isResilem ? 9 : 8}
                      fill={pt.color}
                      fontWeight={isResilem ? "bold" : "normal"}
                      textAnchor={isResilem ? "end" : "start"}
                    >
                      {pt.name}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-gray-700">
              <strong className="text-[#E08040]">White space:</strong> The top-right quadrant (Proactive + Holistic) is entirely uncontested in the consumer market. BetterUp is adjacent but B2B-only.
            </div>
          </div>
        </section>

        {/* ── PAGE 5: WHITE SPACE & KANO ── */}
        <section id="white-space">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">White Space & Opportunities</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-6" />
          <div className="space-y-5 mb-10">
            {WHITE_SPACE.map((ws, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex gap-5">
                <div className="w-9 h-9 rounded-full bg-[#E08040] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">{i + 1}</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">{ws.gap}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{ws.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-4">Kano Analysis — Where the Bar Is Moving</h3>
          <div className="space-y-3">
            {KANO.map((k, ki) => (
              <div key={ki} className={`rounded-xl border p-4 flex gap-4 items-start ${ki === 0 ? "bg-gray-50 border-gray-200" : ki === 1 ? "bg-blue-50 border-blue-100" : "bg-orange-50 border-orange-200"}`}>
                <div className={`w-2 self-stretch rounded-full flex-shrink-0 ${ki === 0 ? "bg-gray-300" : ki === 1 ? "bg-blue-400" : "bg-[#E08040]"}`} />
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${ki === 0 ? "text-gray-500" : ki === 1 ? "text-blue-600" : "text-[#E08040]"}`}>{k.category}</p>
                  <p className="text-sm text-gray-700">{k.items}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PAGE 6: ACTION PLAN ── */}
        <section id="action-plan">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Strategic Action Plan</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-4" />
          <p className="text-sm text-gray-500 mb-6">Three specific, source-cited actions — not "monitor the threat." Each is executable in the next 90 days.</p>
          <div className="space-y-6">
            {ACTION_PLAN.map((a, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex">
                <div className="bg-[#E08040] w-14 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-2xl font-bold">{i + 1}</span>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 mb-2 text-base">{a.action}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">{a.detail}</p>
                  <p className="text-xs text-gray-400 italic">Source: {a.source}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PAGE 7: SOURCES ── */}
        <section id="sources">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Sources</h2>
          <div className="w-10 h-1 bg-[#E08040] rounded mb-6" />
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {SOURCES.map((s, i) => (
              <div key={s.n} className={`px-5 py-3 flex gap-4 items-start text-sm ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                <span className="text-[#E08040] font-bold flex-shrink-0">[{s.n}]</span>
                <span className="text-gray-700">{s.text}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-500 leading-relaxed">
            <strong className="text-gray-700">Methodology note:</strong> Competitor profiles were built from direct homepage fetches, product pages, and web searches aggregating third-party reviews and news coverage. ReadyScore and Coached.com were directly fetched. SimilarWeb traffic estimates were not used (sub-50k threshold). No paid research tools were available. Pricing is approximate unless stated by the competitor.
          </div>
        </section>

      </div>

      {/* ── FOOTER ── */}
      <div className="bg-[#0D1225] text-gray-500 text-xs text-center py-5 mt-16">
        Resilium · Competitive Analysis · {TODAY} · Confidential — Solo Founder Internal
      </div>
    </div>
  );
}
