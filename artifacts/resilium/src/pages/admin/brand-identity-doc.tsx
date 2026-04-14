const DATE = "April 2026";

export default function BrandIdentityDoc() {
  return (
    <div className="px-8 py-8 max-w-5xl mx-auto space-y-8">

      <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-200">
        <div className="px-8 py-7" style={{ background: "#0D1225" }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#E08040" }}>Brand Identity System</p>
              <h1 className="text-3xl font-bold text-white font-display mb-1">Resilium Brand Guidelines</h1>
              <p className="text-sm" style={{ color: "#8A7A6A" }}>Version 1.0 · {DATE} · Internal use</p>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Foundation */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Brand Foundation</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#E08040" }}>Mission</p>
            <p className="text-sm text-gray-700 leading-relaxed">Make personal resilience measurable, understandable, and improvable — for every individual and family, not just those with access to experts.</p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#E08040" }}>Positioning</p>
            <p className="text-sm text-gray-700 leading-relaxed">The personal resilience platform that gives you clarity — not fear. Structured, scored, and actionable. Built for people who already sense they should be more prepared.</p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#E08040" }}>One-Word Essence</p>
            <p className="text-sm text-gray-700 leading-relaxed"><strong>Inspired.</strong> Every interaction should leave someone moved to act — not paralysed, not overwhelmed, but genuinely motivated to take the next step.</p>
          </div>
        </div>
      </div>

      {/* Brand Personality */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Brand Personality</h2>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#E08040" }}>If Resilium Were a Person</p>
            <p className="text-sm text-gray-700 leading-relaxed max-w-2xl">A health coach who has done the hard work themselves. Warm and approachable — not clinical or distant. Confident in the value of what they offer without being salesy or self-congratulatory. They speak to you like an intelligent adult, meet you where you are, and trust you to make good decisions once you have real information.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { trait: "Grounded", opp: "Not preachy" },
              { trait: "Confident", opp: "Not boastful" },
              { trait: "Warm", opp: "Not coddling" },
              { trait: "Realistic", opp: "Not alarmist" },
              { trait: "Empowering", opp: "Not infantilising" },
              { trait: "Informative", opp: "Not overwhelming" },
              { trait: "Future-forward", opp: "Not fear-driven" },
              { trait: "Community-minded", opp: "Not self-promotional" },
            ].map(({ trait, opp }) => (
              <div key={trait} className="rounded-xl p-4" style={{ background: "#F7F7FA" }}>
                <p className="text-sm font-semibold text-gray-900">{trait}</p>
                <p className="text-xs text-gray-400 mt-0.5">{opp}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#E08040" }}>Reference Brands (Tone Anchors)</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { brand: "Replit", why: "Community-focused, developer-warm, future-forward. Speaks to creators as capable people, never talks down." },
                { brand: "Good Ranchers", why: "Values-driven, authentic, unpretentious. Grounds big ideas in everyday language." },
                { brand: "Nimi", why: "Clean, supportive, human-first. Design and language are in sync — nothing feels like filler." },
              ].map(({ brand, why }) => (
                <div key={brand} className="rounded-xl border border-gray-200 p-4">
                  <p className="text-sm font-bold text-gray-900 mb-1">{brand}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{why}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Voice & Tone */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Voice & Tone</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-3 text-emerald-600">Resilium sounds like</p>
              <ul className="space-y-2">
                {[
                  '"Not fear. Clarity."',
                  '"You already sense something. Let\'s make it concrete."',
                  '"Your resilience score is a starting point, not a verdict."',
                  '"10 minutes. 6 dimensions. A plan that\'s actually yours."',
                  '"Readiness isn\'t a personality trait. It\'s a practice."',
                ].map((line) => (
                  <li key={line} className="text-sm text-gray-700 flex gap-2">
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    <span className="italic">{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-3 text-red-500">Resilium never sounds like</p>
              <ul className="space-y-2">
                {[
                  '"Are you prepared for the next disaster?"',
                  '"Most people don\'t realise how vulnerable they are."',
                  '"You need to act NOW before it\'s too late."',
                  '"Resilium is the #1 platform for resilience planning."',
                  '"In today\'s uncertain world, it\'s more important than ever..."',
                ].map((line) => (
                  <li key={line} className="text-sm text-gray-700 flex gap-2">
                    <span className="text-red-400 mt-0.5">✗</span>
                    <span className="italic line-through text-gray-400">{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#E08040" }}>Writing Rules</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Use 'you' and 'your', not 'users' or 'individuals'. Speak directly to one person.",
                "Short sentences land harder than long ones. If a sentence has more than two clauses, split it.",
                "Lead with insight, not alarm. State the fact, let the person draw their own conclusion.",
                "Use 'readiness' over 'preparedness' — it feels active, not passive.",
                "Say 'your resilience score' not 'the score' — make it personal immediately.",
                "Avoid jargon. 'Financial resilience' is fine. 'Liquidity buffers' is not.",
                "Numbers earn trust. Prefer '10 minutes' over 'quick'. Prefer '6 dimensions' over 'comprehensive'.",
                "End with a question or an invitation — never a command.",
              ].map((rule) => (
                <div key={rule} className="flex gap-2 items-start text-sm text-gray-700">
                  <span className="mt-0.5 flex-shrink-0" style={{ color: "#E08040" }}>→</span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Color System */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Color System</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#E08040" }}>Primary — Deep Navy</p>
              <div className="rounded-xl overflow-hidden border border-gray-100">
                {[
                  { shade: "50", hex: "#F4F5FA", text: "text-gray-900" },
                  { shade: "100", hex: "#E8EAF5", text: "text-gray-900" },
                  { shade: "200", hex: "#C8CEEA", text: "text-gray-900" },
                  { shade: "300", hex: "#9BAAD9", text: "text-gray-900" },
                  { shade: "400", hex: "#6A7EC0", text: "text-white" },
                  { shade: "500", hex: "#4358A7", text: "text-white" },
                  { shade: "600", hex: "#2A3A80", text: "text-white" },
                  { shade: "700", hex: "#1A2560", text: "text-white" },
                  { shade: "800", hex: "#111840", text: "text-white" },
                  { shade: "900", hex: "#0D1225", text: "text-white" },
                ].map(({ shade, hex, text }) => (
                  <div key={shade} className={`flex items-center justify-between px-3 py-2 ${text}`} style={{ background: hex }}>
                    <span className="text-xs font-mono font-semibold">{shade}</span>
                    <span className="text-xs font-mono">{hex}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#E08040" }}>Accent — Amber Orange</p>
              <div className="rounded-xl overflow-hidden border border-gray-100">
                {[
                  { shade: "50", hex: "#FEF7F0", text: "text-gray-900" },
                  { shade: "100", hex: "#FDEBD8", text: "text-gray-900" },
                  { shade: "200", hex: "#FAD3AE", text: "text-gray-900" },
                  { shade: "300", hex: "#F6B87E", text: "text-gray-900" },
                  { shade: "400", hex: "#EF9B58", text: "text-gray-900" },
                  { shade: "500", hex: "#E08040", text: "text-white" },
                  { shade: "600", hex: "#C86828", text: "text-white" },
                  { shade: "700", hex: "#A65020", text: "text-white" },
                  { shade: "800", hex: "#7D3A15", text: "text-white" },
                  { shade: "900", hex: "#54240D", text: "text-white" },
                ].map(({ shade, hex, text }) => (
                  <div key={shade} className={`flex items-center justify-between px-3 py-2 ${text}`} style={{ background: hex }}>
                    <span className="text-xs font-mono font-semibold">{shade}</span>
                    <span className="text-xs font-mono">{hex}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#E08040" }}>Neutral — Warm Slate</p>
              <div className="rounded-xl overflow-hidden border border-gray-100">
                {[
                  { shade: "50", hex: "#F7F7FA", text: "text-gray-900" },
                  { shade: "100", hex: "#EEEEF5", text: "text-gray-900" },
                  { shade: "200", hex: "#DCDDE9", text: "text-gray-900" },
                  { shade: "300", hex: "#C3C4D8", text: "text-gray-900" },
                  { shade: "400", hex: "#9EA0BB", text: "text-gray-900" },
                  { shade: "500", hex: "#7A7C9E", text: "text-white" },
                  { shade: "600", hex: "#5C5E81", text: "text-white" },
                  { shade: "700", hex: "#42446A", text: "text-white" },
                  { shade: "800", hex: "#2C2E50", text: "text-white" },
                  { shade: "900", hex: "#1A1C38", text: "text-white" },
                ].map(({ shade, hex, text }) => (
                  <div key={shade} className={`flex items-center justify-between px-3 py-2 ${text}`} style={{ background: hex }}>
                    <span className="text-xs font-mono font-semibold">{shade}</span>
                    <span className="text-xs font-mono">{hex}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#E08040" }}>CSS Design Tokens</p>
            <pre className="rounded-xl p-4 text-xs font-mono leading-relaxed overflow-x-auto" style={{ background: "#0D1225", color: "#EAD9BE" }}>{`/* Resilium Brand Tokens */
--color-navy:       #0D1225;   /* oklch(12% 0.03 260) */
--color-amber:      #E08040;   /* oklch(65% 0.18 50)  */
--color-cream:      #EAD9BE;   /* oklch(88% 0.04 75)  — light text on dark */
--color-muted:      #8A7A6A;   /* oklch(55% 0.04 65)  — subdued text      */
--color-surface:    #F7F7FA;   /* oklch(97% 0.01 260) — app background    */
--color-card:       #FFFFFF;
--font-display:     'Plus Jakarta Sans', sans-serif;
--font-body:        'Inter', sans-serif;`}</pre>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#E08040" }}>Color Usage Rules</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { rule: "Navy (#0D1225) is the primary background on dark surfaces, hero sections, and the mobile app. Never use pure black.", ok: true },
                { rule: "Amber (#E08040) is for accents, CTAs, highlights, and active states only. Never use it as a background for large areas.", ok: true },
                { rule: "Cream (#EAD9BE) is the primary light text colour on dark (navy) backgrounds. Not white.", ok: true },
                { rule: "Surface (#F7F7FA) is the web app background. Warmer than neutral gray, keeps the brand from feeling too cold.", ok: true },
                { rule: "Never use red, green, or bright blue as brand colours — they carry health/finance/tech connotations we want to avoid.", ok: false },
                { rule: "Never pair amber on white for body text — it fails WCAG AA contrast. Use navy on white or white on navy instead.", ok: false },
              ].map(({ rule, ok }) => (
                <div key={rule} className="flex gap-2 items-start text-sm text-gray-700">
                  <span className={`mt-0.5 flex-shrink-0 ${ok ? "text-emerald-500" : "text-red-400"}`}>{ok ? "✓" : "✗"}</span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Typography</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#E08040" }}>Display — Plus Jakarta Sans</p>
              <p className="text-xs text-gray-400 mb-4">Used for: headings, hero text, stats, wordmark. Weight: 900 (display/hero), 700 (section headings), 600 (card headings).</p>
              <div className="space-y-2">
                <p style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: "2.5rem", fontWeight: 900, lineHeight: 1.0, color: "#0D1225" }}>Not fear. Clarity.</p>
                <p style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.1, color: "#0D1225" }}>Know your readiness.</p>
                <p style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: "1.1rem", fontWeight: 600, lineHeight: 1.2, color: "#0D1225" }}>6 Resilience Dimensions</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#E08040" }}>Body — Inter</p>
              <p className="text-xs text-gray-400 mb-4">Used for: body copy, UI labels, captions, metadata. Weight: 400 (body), 500 (labels/UI), 600 (emphasis).</p>
              <div className="space-y-2">
                <p style={{ fontSize: "1rem", fontWeight: 400, lineHeight: 1.6, color: "#374151" }}>Resilium gives you a structured picture of your readiness across six life dimensions — not a checklist, but a personalised score and action plan.</p>
                <p style={{ fontSize: "0.875rem", fontWeight: 500, lineHeight: 1.5, color: "#6B7280" }}>Financial · Health · Skills · Mobility · Psychological · Resources</p>
                <p style={{ fontSize: "0.75rem", fontWeight: 400, lineHeight: 1.4, color: "#9CA3AF" }}>Updated April 2026 · Free to start</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#E08040" }}>Type Scale</p>
            <div className="rounded-xl overflow-hidden border border-gray-100">
              {[
                { role: "Hero", size: "4–5vw / clamp(2.5rem, 5vw, 4.5rem)", weight: "900", font: "Plus Jakarta Sans" },
                { role: "H1 — Page", size: "2rem / 32px", weight: "800", font: "Plus Jakarta Sans" },
                { role: "H2 — Section", size: "1.5rem / 24px", weight: "700", font: "Plus Jakarta Sans" },
                { role: "H3 — Card", size: "1.125rem / 18px", weight: "600", font: "Plus Jakarta Sans" },
                { role: "Body Large", size: "1rem / 16px", weight: "400", font: "Inter" },
                { role: "Body", size: "0.875rem / 14px", weight: "400", font: "Inter" },
                { role: "Label / UI", size: "0.875rem / 14px", weight: "500", font: "Inter" },
                { role: "Caption / Meta", size: "0.75rem / 12px", weight: "400", font: "Inter" },
                { role: "Eyebrow", size: "0.75rem / 12px", weight: "600, tracking-widest, uppercase", font: "Inter" },
              ].map(({ role, size, weight, font }) => (
                <div key={role} className="flex items-center gap-4 px-4 py-2.5 border-b border-gray-50 last:border-b-0 hover:bg-gray-50">
                  <span className="w-32 text-xs font-semibold text-gray-900 flex-shrink-0">{role}</span>
                  <span className="w-64 text-xs font-mono text-gray-500">{size}</span>
                  <span className="w-32 text-xs text-gray-500">{weight}</span>
                  <span className="text-xs text-gray-400">{font}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Direction */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Visual Direction</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#E08040" }}>Photography Style</p>
              <ul className="space-y-2">
                {[
                  "Calm, purposeful environments — a person reviewing documents at a desk, not panicking.",
                  "Natural light, warm tones. Nothing harsh or clinical.",
                  "Everyday moments of quiet agency: planning, reviewing, thinking ahead.",
                  "People in motion and at rest — not posed stock smiles. Authentic expression.",
                  "Landscapes that communicate strength and clarity: mountain horizons, dawn light, open sky.",
                  "Avoid: disaster imagery, anxious faces, extreme close-ups of hands on phones, blue-tinted corporate stock.",
                ].map((point) => (
                  <li key={point} className="flex gap-2 text-sm text-gray-700">
                    <span className="mt-0.5 flex-shrink-0" style={{ color: "#E08040" }}>→</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#E08040" }}>UI & Illustration Style</p>
              <ul className="space-y-2">
                {[
                  "Data visualisation is central to the brand. Scores, rings, dimension bars should feel premium — never dashboard-generic.",
                  "Rounded corners throughout (rounded-2xl / 16px). Softness signals approachability.",
                  "Subtle shadows and borders over flat design — adds depth without visual weight.",
                  "Dark mode UI (navy) is the premium tier. Light mode (#F7F7FA surface) is the entry experience.",
                  "Motion: subtle, purposeful. Fade-up on scroll. Score rings animate on load. Nothing bouncy or gamified.",
                  "No illustrations of people in the app UI — data and text carry the experience.",
                ].map((point) => (
                  <li key={point} className="flex gap-2 text-sm text-gray-700">
                    <span className="mt-0.5 flex-shrink-0" style={{ color: "#E08040" }}>→</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#E08040" }}>Logo System Usage</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { variant: "Full Logo", desc: "Neon brain + wordmark + tagline. Use in: pitch deck, LinkedIn, press kit, about pages. Never below 200px wide." },
                { variant: "Wordmark only", desc: "RESILIUM in Plus Jakarta Sans 900. Use in: email headers, document headers, banners where the icon would clutter. Works at any size." },
                { variant: "Icon only", desc: "Brain/arch mark. Use in: favicon, app icon, social profile avatar, watermarks. Test at 32px — must be legible." },
              ].map(({ variant, desc }) => (
                <div key={variant} className="rounded-xl border border-gray-200 p-4">
                  <p className="text-sm font-bold text-gray-900 mb-2">{variant}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Reference */}
      <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b" style={{ background: "#0D1225", borderColor: "rgba(255,255,255,0.08)" }}>
          <h2 className="text-base font-bold text-white">Quick Reference Card</h2>
        </div>
        <div className="p-6" style={{ background: "#0D1225" }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Primary", value: "#0D1225", sub: "Deep Navy" },
              { label: "Accent", value: "#E08040", sub: "Amber Orange" },
              { label: "Light Text", value: "#EAD9BE", sub: "Cream" },
              { label: "Surface", value: "#F7F7FA", sub: "Warm White" },
              { label: "Display Font", value: "Plus Jakarta Sans", sub: "900 · 700 · 600" },
              { label: "Body Font", value: "Inter", sub: "500 · 400" },
              { label: "Border Radius", value: "rounded-2xl", sub: "16px standard" },
              { label: "Essence Word", value: "Inspired", sub: "Moved to act" },
            ].map(({ label, value, sub }) => (
              <div key={label} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.06)" }}>
                <p className="text-xs font-semibold mb-1" style={{ color: "#E08040" }}>{label}</p>
                <p className="text-sm font-bold text-white font-mono leading-tight">{value}</p>
                <p className="text-xs mt-0.5" style={{ color: "#8A7A6A" }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
