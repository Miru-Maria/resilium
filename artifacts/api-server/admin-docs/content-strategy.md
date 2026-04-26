# Content Strategy — Resilium
**Version 1.2 — April 2026**
Maintained by: Cristiana Paun (Solo Founder)

---

## Strategic Intent

Content is the primary acquisition engine for Resilium. Paid acquisition is expensive and hard to attribute at an early stage; creator partnerships require relationships and budgets we'll build over time. Content — blog, SEO, and social — compounds. A post written today sends traffic in 18 months. The goal is to publish consistently enough to build a compounding search moat before any funded competitor decides to enter.

The north star: **every piece of content exists to either (a) send a reader to the free assessment or (b) demonstrate that Resilium is the most credible voice in the personal resilience space**.

---

## Blog Platform — Built & Live

The Resilium blog is fully operational at **`resilium-platform.com/blog`** as of April 2026.

### What's built
- **Public blog** at `/blog` — filterable by content pillar, featured post slot, reading time shown per post
- **Individual post pages** at `/blog/:slug` — full markdown rendering, JSON-LD Article schema for SEO, related posts, inline assessment CTA
- **Admin CMS** at `/admin/blog` — full create/edit/delete interface, no code required

### Scheduling & Draft System
The blog uses a **date-based auto-publish system**:

| Status | Publish Date | Visible to public? |
|---|---|---|
| Draft | Any | No — saved but not published |
| Published | Today or past | Yes — live immediately |
| Scheduled | Future date | No — goes live automatically on that date |

**How to schedule a post:** In the admin blog editor, set Status to "Published" and set the Publish Date to any future date. The post will appear publicly the moment that date arrives — no manual action needed. Scheduled posts show an amber "Scheduled" badge in the admin list so you always know what's queued.

**How drafts work:** Set Status to "Draft" at any time. Drafts are saved to the database and visible in the admin, but never shown on the public blog regardless of publish date. Use drafts for posts in progress, posts pending review, or content you want to hold back.

### Seeded Content
10 posts across all 5 pillars were seeded at launch to give the blog an immediate foundation. These are live and indexed.

---

## Content Pillars

### Pillar 1 — The Assessment Ecosystem
*What is resilience? How is it measured? Why does your score matter?*

These posts exist to capture high-intent search traffic from people already asking the right questions. They convert best because the reader arrives already curious about their own score.

**Examples:**
- "What is personal resilience and why does it matter in 2026?"
- "How to measure your resilience: the 6 dimensions that predict how well you'll handle adversity"
- "What's a good resilience score? Understanding where you stand"
- "The difference between resilience and toughness (and why it matters for your planning)"
- "Financial resilience vs. emotional resilience: why you need both"

**Target keywords:** `personal resilience`, `resilience score`, `resilience assessment`, `resilience test`, `personal resilience plan`, `how to measure resilience`

---

### Pillar 2 — Dimension Deep-Dives
*Deep content on each of the 6 dimensions: Financial, Skills, Health, Mobility, Psychological, Resources*

These posts establish topical authority and attract readers at different entry points. Someone worried about their financial situation finds Pillar 2 and discovers Resilium's breadth.

**Examples:**
- "Financial resilience: how many months of runway do you actually need?"
- "The skills that protect your income when everything changes"
- "Health resilience: what your medical situation means for your emergency planning"
- "Geographic resilience: why where you live is a preparedness variable, not a given"
- "Psychological resilience: the 10 questions that reveal how you handle adversity"
- "Resources and community: the underrated dimension of personal preparedness"

**Target keywords:** `financial resilience`, `financial emergency fund`, `psychological resilience`, `building resilience`, `geographic mobility`

---

### Pillar 3 — Scenario Planning
*What-if content that dramatizes the value of resilience planning*

These posts are the most shareable and emotionally resonant. They take real scenarios and walk through what someone with a low vs. high resilience score would experience.

**Examples:**
- "What happens to your finances if you lose your job tomorrow? A scored analysis"
- "Job loss emergency plan: a step-by-step financial resilience playbook"
- "How to prepare financially for a health crisis"
- "Relocation resilience: what to consider before moving abroad"
- "What the last 3 recessions taught us about personal resilience planning"
- "If a major storm hit your city tonight, how prepared are you? Be honest"

**Target keywords:** `job loss financial plan`, `emergency financial plan`, `how to prepare for job loss`, `financial crisis plan`, `emergency preparedness plan`

---

### Pillar 4 — Data & Research
*Original data from the Resilium assessment pool — the content no competitor can replicate*

This is the long-term moat. As assessments accumulate, Resilium holds a unique dataset about how people's resilience profiles vary by location, age, income, and life stage. This content is impossible to plagiarize and gets cited, linked, and shared.

**Examples:**
- "The average resilience score in the US: what we learned from [N] assessments"
- "Which US states score highest on financial resilience? The 2026 data"
- "Resilience by age: how preparedness gaps change from 25 to 55"
- "Freelancers vs. employees: the resilience score gap"
- "Where expats score differently on the resilience assessment (and why)"

**Launch note:** Hold this pillar until 1,000+ assessments have been completed. Thinner data produces less interesting findings and less trustworthy benchmarks.

---

### Pillar 5 — How-To Guides
*Practical, action-oriented content that ranks for "how to prepare for X" queries*

Lower in the conversion funnel but high in volume and trust-building. These posts show Resilium as a practical, useful resource — not just a score-and-forget tool.

**Examples:**
- "How to build a 3-month emergency fund (when you're already stretched)"
- "The 10 documents you must have ready in a crisis (printable checklist)"
- "How to build a go-bag: a non-paranoid guide for regular people"
- "Emergency preparedness for expats: what living abroad changes about your risk profile"
- "Building financial resilience in your 30s: the essential framework"

**Target keywords:** `emergency preparedness checklist`, `financial emergency plan template`, `how to build emergency fund`, `expat emergency preparedness`

---

## Content Calendar — Q2–Q3 2026

### Frequency Targets by Phase

| Phase | Blog | Social (X/Twitter) | Reddit | Email Newsletter |
|---|---|---|---|---|
| **Phase 1 — Solo founder (now → Month 3)** | **1 post/week** (founder-written, Fridays) | 3–5 posts/week | 1 genuine post/week | Weekly (Sunday) |
| **Phase 2 — With contracted writer (Month 3+)** | **3 posts/week** (2 contracted + 1 founder) | 5–7 posts/week | 1–2 posts/week | Weekly (Sunday) |

**Phase 1 reality check:** 1 post/week published consistently beats 3 posts/week published in bursts and abandoned. Consistency compounds; volume comes later. The scheduling system lets you write ahead and queue posts to drip out automatically — write 4 posts in a productive weekend, schedule them weekly, and the blog stays active without daily pressure.

---

### Month 1 (May 2026) — Foundation
*Goal: establish the category; publish the pillar pages that will anchor ongoing topic clusters*

| Week | Pillar | Title | Target Keyword |
|---|---|---|---|
| W1 | P1 | What is personal resilience — and why measuring it changes everything | `personal resilience` |
| W2 | P2 | Financial resilience explained: the one number your advisor never tells you | `financial resilience` |
| W3 | P3 | Job loss emergency plan: what to do in the first 7 days | `job loss financial plan` |
| W4 | P1 | The 6 dimensions of personal resilience (and how to score them) | `resilience dimensions` |

### Month 2 (June 2026) — Depth + Community
*Goal: build topical depth in the most-searched areas; begin community seeding*

| Week | Pillar | Title | Target Keyword |
|---|---|---|---|
| W5 | P2 | Psychological resilience: the 10 questions that reveal how you'll handle adversity | `psychological resilience` |
| W6 | P5 | The 10 documents you need to have ready before a crisis | `emergency document checklist` |
| W7 | P3 | What happens to your finances if you lose your job tomorrow? | `job loss scenario` |
| W8 | P2 | Geographic resilience: why where you live is a risk variable, not a given | `geographic resilience` |

### Month 3 (July 2026) — Conversion Optimization
*Goal: produce high-intent comparison and "best tool" content to capture users in decision mode*

| Week | Pillar | Title | Target Keyword |
|---|---|---|---|
| W9 | P5 | How to build a 3-month emergency fund (even if you're barely saving now) | `how to build emergency fund` |
| W10 | P1 | What's a good resilience score? Here's how to interpret yours | `good resilience score` |
| W11 | P1 | ReadyScore vs. Resilium: which resilience tool is right for you? | `readyscore alternative` |
| W12 | P3 | If your city flooded tonight — how prepared are you, honestly? | `emergency preparedness` |

*Note: When Phase 2 begins, expand each week from 1 post to 3 posts using the full calendar originally planned. The pillar mix and keyword strategy remain the same — only volume increases.*

---

## Content Distribution

### Blog / SEO
- Live at `resilium-platform.com/blog`
- Long-form: 1,200–2,500 words, data-supported, with an inline CTA to take the free assessment
- Every post includes a "Take the free assessment" CTA
- Internal link structure: every post links back to the assessment and to 2–3 related pillar posts
- JSON-LD Article schema implemented on all post pages (helps Google index correctly)

### Admin Workflow — Publishing a Post
1. Go to `/admin/blog` → click **New post**
2. Fill in: title, slug (auto-formats), description, pillar, target keyword, reading time, body (markdown)
3. Set **Status** to "Published" and **Publish Date** to your desired date
4. Click **Save post** — the post goes live on that date automatically
5. To write ahead: create several posts in one session, set their publish dates one week apart, and the blog self-publishes on schedule

### X (Twitter) Strategy
- Lead with data: "Our assessment data shows [surprising finding]" outperforms opinion content
- Score reveal format: "I took the resilience assessment. Here's what I didn't expect" (first-person, authentic)
- Thread format for pillar content: "6 dimensions of resilience, thread 🧵"
- Quote real (anonymized) user report insights as content hooks
- Frequency: 3–5 posts/week in Phase 1; repurpose blog post quotes, not just links

### Reddit Strategy
- Participate genuinely before posting about Resilium
- r/personalfinance: job loss prep, emergency fund deep-dives
- r/preppers: practical dimension posts — be transparent about being the founder
- r/financialindependence: resilience score for FIRE planning angle
- r/digitalnomad: expat + geographic resilience angle
- r/Anxiety / r/ADHD: psychological resilience angle (careful framing — focus on action, not pathology)
- Post style: "I built a tool that scores personal resilience. Here's what we learned from [N] real assessments."

### Email Newsletter (Weekly)
- Audience: free users who haven't converted to Pro + general subscribers
- Format: 1 insight + 1 "this week in preparedness" + 1 CTA
- Subject line formula: data-forward ("68% of users score under 40 on financial resilience — here's why") or curiosity-gap ("The resilience dimension most people ignore — and why it matters most")
- Unsubscribe: one-click, HMAC-signed, GDPR-compliant (implemented)

---

## Content Production Workflow

### Phase 1 — Solo Founder (Current)

**Weekly rhythm (sustainable):**
1. Write 1 long-form post, ideally on Fridays (~2–3 hours)
2. Schedule it for the following Tuesday or Wednesday via the admin blog editor
3. Break the post into 3–5 social posts (Saturday — 30 min)
4. Post to one Reddit community per week with a genuine, non-promotional angle
5. Re-share 1 older post to social (evergreen rotation)

**Batch writing option (recommended):** Write 3–4 posts in one productive session, schedule them 1 week apart in the admin. The blog stays active and consistent without writing every week. This is the main advantage of the scheduling system.

### Phase 2 — With Contracted Writer (Month 3+)
- 2 posts/week contracted, 1 post/week founder-written (founder retains all Pillar 4 data posts)
- Brief template: keyword target + audience persona + 5 key points + CTA + internal links
- Review cycle: founder reviews for accuracy and brand voice before scheduling
- Brand voice rules: "I/me" framing, American English, calm confidence — not alarmist, not corporate

---

## Key Performance Indicators

| Metric | Month 3 Target | Month 6 Target | Month 12 Target |
|---|---|---|---|
| Organic monthly blog visitors | 1,000 | 5,000 | 20,000 |
| Blog → Assessment conversion rate | 8% | 10% | 12% |
| Assessments from organic | 80/mo | 500/mo | 2,400/mo |
| Email subscriber list | 300 | 1,500 | 6,000 |
| Domain Rating (Ahrefs) | 10 | 20 | 35 |
| Posts published (cumulative) | 12 | 36 | 84 |

*Targets revised April 2026 to reflect Phase 1 solo-founder publishing pace (1 post/week) rather than the original 3 posts/week projection. Phase 2 targets will be reassessed when contracted writing begins.*

---

## Content Gaps to Fill (Q3 2026)

- **Video content:** Short-form "score reveal" clips for X and TikTok — no production budget needed, just authentic screen recordings
- **Case study content:** Early users willing to share their resilience journey — powerful social proof that neither ReadyScore nor BetterUp can match (they don't have personal stories)
- **Seasonal content:** Tie content peaks to natural anxiety moments: tax season (financial resilience), hurricane season (emergency prep), back-to-school/September (planning mindset), January (new year preparedness goals)
- **Comparison content:** Once Resilium has enough organic authority, publish direct comparison pages against ReadyScore, FEMA.gov, and popular financial tools

---

*Content strategy v1.2 — updated April 2026 to reflect blog platform launch, scheduling system, draft workflow, and revised Phase 1 frequency targets. See marketing-strategy.md for channel mix and budget allocation.*
