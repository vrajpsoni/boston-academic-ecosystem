# Section 05 — The Academic Economy (Flagship Financial Storytelling)

**Status:** **Architecture locked** · Data spec in progress · No UI implementation yet  
**Project:** Boston: A Hub of Academic Excellence (CS617)  
**Goal:** Premium editorial financial storytelling — Bloomberg / FT / WSJ interactive quality, not a dashboard

**Related docs (build order):**

| Order | Document |
|-------|----------|
| 1 | This file — locked experience & viz system |
| 2 | `../data/section_05/SECTION_05_DATA_COLLECTION_PLAN.md` — datasets, schemas, acts |
| 3 | `../data/section_05/sources/SECTION_05_DATA_SOURCES.md` — URLs & validation |
| 4 | `../data/section_05/sources/SECTION_05_METHODOLOGY.md` — formulas & honesty rules |
| 5 | Implementation — D3 motion layer last |

**Design principle (locked):** *Economic storytelling experience, not a finance dashboard.*

### Pre-implementation gate (do not skip)

Section 05 quality depends on **data, hierarchy, pacing, motion, typography, and restraint** — not early UI scaffolding.

| Gate | Artifact | UI work |
|------|----------|---------|
| 1 | Architecture locked | ✅ Done |
| 2 | Data spec + methodology | ✅ Done |
| 3 | `source_validation_checklist.md` complete | **Next** |
| 4 | `build_section_05_financial_model.py` + processed CSVs | After gate 3 |
| 5 | DS-08 access dates in `DATA_REFERENCES.md` | With gate 4 |
| 6 | D3 Sankey, scroll acts, dark theme | **Acts I–III MVP** (2026-05-21) · IV–V editorial |

Gate 3 complete. See `website/SECTION_05_IMPLEMENTATION.md` for module map. Atmospheric sections tolerated more ambiguity; **billions-of-dollars claims do not.**

---

## Locked decisions (2026-05-21)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Flagship viz system | **Circulation Engine** — Sankey + scroll acts | Communicates systemic flow; avoids chart cliché |
| Hero metric (Act I) | **Total institutional operating expenses** (IPEDS Finance) | Official, defensible, dramatic; not vague “total impact” |
| Section title | **The Academic Economy** (`#academic-economy`) | Clear climax after city-impact block |
| 04C rename | **Innovation Workforce** | Removes overlap with financial flagship |
| Institution granularity | **7 anchors + “All other map institutions”** | Preserves hierarchy in Sankey and lanes |
| Rendering library | **D3 v7** (sankey + custom motion) | Cinematic pacing > rapid chart generation |
| Narrative structure | **5 acts:** Scale → Circulation → Anchors → Students → Spillover | Editorial expansion; no data dump |
| Build sequence | Architecture → data spec → source validation → motion/UI | Rigor before pixels |

---

## 0. Naming & placement in the site

### Section 04C (renamed)

**“Innovation Workforce”** (`#section-04c-innovation`) remains the **neighborhood workforce matrix** (ACS education + commute proxies). It is analytical, geographic, and **not** financial.

| Section | Title | Role |
|---------|-------|------|
| 04C | **Innovation Workforce** | Neighborhood comparison matrix |
| 05 | **The Academic Economy** | Flagship financial circulation story |

### Narrative position

```
01 Map          → WHERE the ecosystem lives
02 Enrollment   → HOW it grew over time
03 Scale hero   → HOW MANY students (235k+)
04 City impact  → HOW it shapes neighborhoods, business, workforce
05 Academic $   → WHY it matters as an ECONOMIC ENGINE (climax)
```

Section 05 should feel like the **financial climax** of the scroll story: everything before it builds geographic and human scale; this section converts scale into **economic gravity**.

---

## 1. Experience goal (what the user must feel)

| Feel | Avoid |
|------|--------|
| Scale (“billions move through this city because of schools”) | “Here is a chart” |
| Institutional power (anchors vs long tail) | Spreadsheet density |
| Movement (money circulating, not static totals) | Pie charts / default bar grids |
| Interconnectedness (students ↔ housing ↔ institutions ↔ research) | Jargon-heavy terminal clutter |
| Premium seriousness (FT/Bloomberg credibility) | Ugly enterprise BI / fake stock UI |

**One-sentence design test:**  
*If someone screenshots one frame, it should read as “major economic system,” not “class project dashboard.”*

---

## 2. Core story (single thesis)

> **Boston’s academic ecosystem is not only educational — it is a city-scale economic engine.**

Sub-claims (each gets a scroll “act” with sourced numbers):

1. **Institutional scale** — universities move enormous budgets through the region (operations, payroll, construction).
2. **Student purchasing power** — tuition + living expenditures circulate through housing, retail, and services.
3. **Population segmentation** — domestic, out-of-state, and international students have different economic footprints (tuition + local spend).
4. **Redistribution** — financial aid and scholarships change who bears cost vs who receives subsidy (accessibility story).
5. **Research & innovation spillover** — grants, R&D, and knowledge-economy employment multiply impact beyond campus gates.

**Emotional arc:** awe (headline $) → comprehension (where it flows) → nuance (who contributes what) → credibility (sources footnoted).

---

## 3. Visual language system (“Bloomberg editorial,” not terminal cosplay)

### Palette shift (intentional break from Sections 01–04)

Earlier sections: warm paper (`#f7f6f2`), academic navy (`#1f4e79`), orange accent.

**Section 05:** dark analytical stage — signals “financial seriousness” without mimicking a trading terminal.

| Token | Suggested role |
|-------|----------------|
| `--econ-bg-deep` | `#0a0e14` – `#121820` panel background |
| `--econ-bg-panel` | `#1a2332` cards / lanes |
| `--econ-text-primary` | `#e8edf4` body on dark |
| `--econ-text-muted` | `#8b9cb3` labels |
| `--econ-accent-flow` | `#3d9eff` streams / links (cool, institutional) |
| `--econ-accent-gold` | `#c9a227` headline figures (FT gold, not crypto neon) |
| `--econ-accent-positive` | `#4ade80` sparingly (growth highlights only) |
| `--econ-grid` | `rgba(255,255,255,0.06)` subtle grid |

### Typography

- **Headline figures:** tabular nums, tight tracking, optional condensed sans (e.g. `"IBM Plex Sans"` or `"Source Sans 3"` — still load via Google Fonts once).
- **Labels:** uppercase micro-kickers (`letter-spacing: 0.12em`), Bloomberg-style section tags.
- **Prose:** keep Inter for readability in captions; don’t set body copy in faux-monospace.

### Motion principles

- **Scroll-scrubbed** reveals (tie animation to scroll position, not autoplay loops).
- **Flow along paths** (Sankey/stream particles move at 8–15% opacity).
- **Count-up once** per metric when entering viewport (reuse Section 03 pattern).
- **No** spinning 3D, ticker noise, or flashing red/green “market” gimmicks.

### Layout pattern

**Full-bleed dark band** inside `<main>`, 100vh “chapters” or ~85vh panels, prose in narrow column left or bottom — WSJ-style text beside viz, not below a cramped chart.

---

## 4. Data architecture (rigor-first)

### Principle

Every billion-dollar headline must trace to:

1. **Published institution or government figure**, or  
2. **Transparent modeled estimate** (formula + source inputs in `DATA_REFERENCES.md`).

Label modeled layers explicitly: *“Estimated local spending (methodology)”* — never present guesses as audited financials.

### Tier A — Anchor institutions (6–7 schools)

Already in project: Harvard, MIT, BU, Northeastern, BC, Tufts, UMass Boston (+ Section 03’s 29-school aggregate for “all others”).

| Metric family | Primary sources | IPEDS / other |
|---------------|-----------------|---------------|
| Enrollment headcount | EF2023 + CDS overrides | ✅ in repo |
| Tuition & charges | CDS Section G / B | Manual PDF + [IPEDS IC](https://nces.ed.gov/ipeds/datacenter/InstitutionalCharacteristics/) |
| Operating expenses / revenues | IPEDS **Finance (F1A/F2)** | Download `F2022F1A.zip` etc. |
| Financial aid volume | IPEDS **Student Financial Aid (SFA)** | `SFA2022` |
| R&D expenditures | NSF **HERD** / IPEDS **Academic R&D (RD)** | HERD survey |

### Tier B — Ecosystem aggregates

| Metric | Sources |
|--------|---------|
| International student economic impact | [NAFSA](https://www.nafsa.org/policy-and-advocacy/policy-resources/nafsa-international-student-economic-value-tool) state/MA reports; institution fact sheets |
| Regional multipliers | Boston Planning Department, MassBenchmarks, BEA regional accounts (cite report, don’t invent multiplier) |
| Student living spend | BLS Consumer Expenditure; College Board living cost benchmarks — **modeled** with clear bounds |
| Research funding (NIH/NSF) | [NIH RePORTER](https://reporter.nih.gov/), NSF awards — institution-level where feasible |

### Tier C — Neighborhood circulation (links to Section 04)

Reuse **Layer A** (housing pressure), **Layer B** (OSM business density) as **context panels** — not dollar flows unless Boston open data provides spend proxies.

### Proposed canonical datasets (new)

```
data/section_05/
  sources/SECTION_05_DATA_SOURCES.md
  sources/SECTION_05_METHODOLOGY.md          # formulas, assumptions, uncertainty
  raw/ipeds_finance/                         # F1A zips
  raw/ipeds_sfa/
  raw/institutional_cds_tuition.csv            # manual extraction table
  raw/nafsa_ma_impact.csv                      # if using NAFSA tool export
  processed/academic_economy_flows_v1.csv       # nodes + values for Sankey
  processed/institution_financial_scale_v1.csv
  processed/student_segment_contribution_v1.csv
  scripts/build_section_05_financial_model.py
website/data/section_05_*.csv               # published copies
```

### Defensible “headline number” candidates

Pick **one** hero metric for Act 1 (don’t stack five competing billions):

| Hero metric | Defensibility | Drama |
|-------------|---------------|-------|
| **Total institutional operating expenses** (29 schools, FY2022–23) | High (IPEDS F1A) | High |
| **Estimated annual student spending in region** (tuition paid locally + living) | Medium (modeled) | Very high emotionally |
| **Combined R&D expenditures** | High (HERD/RD) | Medium-high |
| **International student economic contribution (MA)** | High (NAFSA) | High for intl story |

**Recommendation for Act 1 hero:**  
**“Greater Boston academic institutions — operating scale”** (sum of IPEDS-reported expenses for map-scope schools) with sub-line: *“Before student living expenditures and research spillovers.”*  
Then Acts 2–5 **add layers** so the user feels the economy **expanding**, not one misleading mega-number.

---

## 5. Visualization concepts (brainstorm)

### Concept A — **“The Circulation Engine” (Sankey / alluvial)**

**What:** One flagship Sankey: sources (tuition, aid, operating budgets, grants) → institutions → sinks (payroll, housing, local business, research).

**Strengths:** Literally shows *flow*; matches “economic system” metaphor; FT/Bloomberg use Sankeys for macro stories.

**Risks:** Busy if >15 nodes; hard on mobile; needs careful node ordering.

**Verdict:** ⭐⭐⭐⭐⭐ Best single metaphor for flagship.

---

### Concept B — **“Institutional Depth Lanes” (hierarchy without bar charts)**

**What:** Horizontal **lanes** per institution (width = operating expense or enrollment-weighted spend). Sub-layers inside lane: instruction, research, auxiliaries (from IPEDS functional categories). Scroll highlights one lane at a time.

**Strengths:** Bloomberg “security depth” feel; readable; strong anchor vs long-tail story.

**Risks:** Can feel like a bar chart if designed lazily — must use **lane composition**, not uniform bars.

**Verdict:** ⭐⭐⭐⭐ Excellent Act 3 companion to Sankey.

---

### Concept C — **“Economic Orbit” (radial circulation)**

**What:** Center = “Greater Boston”; rings = Students, Institutions, Housing, Business, Research; animated particles orbit along arcs when scrolling.

**Strengths:** Cinematic, unique, ties to 04B constellation language.

**Risks:** Weaker analytical precision; harder to cite exact values; can look decorative.

**Verdict:** ⭐⭐⭐ Strong **intro animation**, weak as sole data viz.

---

### Concept D — **“Analytical Card Stack” (premium KPI chapters)**

**What:** WSJ-style stacked cards — one metric per viewport with sparkline history (IPEDS 10-year expense trend).

**Strengths:** Highest rigor clarity; easiest to source-footnote; accessible.

**Risks:** Less “wow”; feels like well-designed dashboard if overused.

**Verdict:** ⭐⭐⭐⭐ Essential for **Acts 1 & 4–5**, not sufficient alone for flagship.

---

### Concept E — **“Money Bridge” (waterfall / walk chart)**

**What:** Waterfall from “Total academic economic footprint” down through components (tuition → living → institutional ops → research).

**Strengths:** Familiar finance grammar; good for scholarships/aid story (negative steps).

**Risks:** Static; less “alive”; easy to mis-sum categories.

**Verdict:** ⭐⭐⭐⭐ Best for **financial aid redistribution** act specifically.

---

### Concept F — **“Network Clearinghouse” (node-link economy graph)**

**What:** Force-directed or fixed-layout graph: institutions, neighborhoods, industry sectors as nodes.

**Strengths:** Shows interconnectedness; echoes 04B.

**Risks:** Hairball; financial values on edges are often modeled; accessibility pain.

**Verdict:** ⭐⭐ Background texture only — not hero.

---

### Concept G — **“Market Tape” metaphor**

**What:** Scrolling ticker of institution names + expense deltas; fake terminal chrome.

**Strengths:** Instant “finance” recognition.

**Risks:** cliché, gimmicky, conflicts with “not ugly finance software” brief.

**Verdict:** ⭐ Avoid as primary; optional 2-line kicker only.

---

### Concept H — **“Geographic Flow Map” (cartographic Sankey)**

**What:** Map base + curved flows from campuses to neighborhoods (student spend).

**Strengths:** Connects to Section 04 geography.

**Risks:** Double map fatigue; flow widths hard to verify.

**Verdict:** ⭐⭐⭐ Optional epilogue panel, not core.

---

## 6. Evaluation matrix

| Criterion (weight) | A Sankey | B Lanes | C Orbit | D Cards | E Waterfall |
|--------------------|----------|---------|---------|---------|-------------|
| Emotional scale (20%) | 9 | 8 | 9 | 7 | 7 |
| Analytical credibility (25%) | 8 | 9 | 5 | 10 | 9 |
| “Not a chart” feel (20%) | 9 | 7 | 9 | 5 | 6 |
| Fits existing data (15%) | 7 | 9 | 6 | 9 | 8 |
| Mobile / a11y (10%) | 6 | 8 | 7 | 9 | 8 |
| Build feasibility static site (10%) | 7 | 8 | 6 | 9 | 9 |
| **Weighted total** | **8.15** | **8.30** | **7.05** | **7.95** | **7.65** |

---

## 7. Recommended flagship system: **“The Circulation Engine” (hybrid)**

Do **not** pick one chart type. Build a **scroll-driven 5-act financial story** with one dominant visualization grammar (flow) and supporting structures.

### Act structure

| Act | Scroll beat | Visualization | Data |
|-----|-------------|---------------|------|
| **I — Scale** | Full-viewport headline | Animated count-up + gold figure | Sum institutional operating expenses (IPEDS F1A); footnote FY year |
| **II — Circulation** | Hero Sankey (60–70% viewport) | Concept A | `academic_economy_flows_v1.csv` nodes/links |
| **III — Anchors** | Institutional depth lanes | Concept B | Per-unit expenses + enrollment |
| **IV — Students** | Segment flow + waterfall | Sankey sub-branch + Concept E for aid | IPEDS residency + SFA + NAFSA intl |
| **V — Innovation spillover** | Research + workforce bridge | Concept D cards + thin flows to 04C metrics | HERD/RD + Layer C proxies |

**Intro/outro:** 3–5 second **orbit particles** (Concept C) only as ambient background behind Act I — not data-bearing.

### Why this wins

1. **Sankey** delivers the “massive interconnected economy” feeling better than any bar chart.  
2. **Lanes** answer “who are the heavyweights?” with finance-native hierarchy.  
3. **Cards + waterfall** satisfy higher academic rigor for aid and research claims.  
4. Reuses **scroll-reveal** and **count-up** patterns already in the codebase.  
5. Clear upgrade path: v1 = 7 anchors + “all others”; v2 = full 29 institutions.

---

## 8. Interaction & scroll architecture

### Technical pattern (align with existing site)

```
section#academic-economy (dark theme)
  └── div.econ-story (position: relative)
        ├── act panels (min-height: 85vh–100vh)
        ├── sticky sankey container (Acts II–III)
        │     └── scroll progress → highlight path / node
        └── annotation column (prose + source chips)
```

- **IntersectionObserver** for act transitions (extend `scroll-reveal.js` or dedicated `section-05-scroll.js`).
- **Sankey:** D3 v7 or Apache ECharts Sankey — static CSV, no live APIs on GitHub Pages.
- **Scrub:** `scrollYProgress` maps to `stroke-dashoffset` on flow paths (CSS + SVG) for “money moving.”
- **Hover:** institution lane → show CDS/IPEDS tooltip (name, FY, source link) — not click-heavy dashboards.
- **Reduced motion:** respect `prefers-reduced-motion` → static Sankey + instant numbers.

### Accessibility

- Sankey: parallel **table** `sr-only` or expandable “View data table.”
- All colors WCAG AA on dark bg.
- Keyboard focus on lane list alternative to hover-only Sankey.

---

## 9. HTML / JS module plan (implementation phase)

```
website/
  index.html                          # new <section id="academic-economy">
  css/section-05-academic-economy.css
  js/sections/section-05-academic-economy.js   # orchestrator
  js/section-05/
    config.js                         # acts, colors, data paths
    data-loader.js
    hero-counter.js                   # reuse patterns from section-03
    sankey.js
    institution-lanes.js
    student-waterfall.js
    scroll-controller.js
  data/
    section_05_economy_flows.csv
    section_05_institution_scale.csv
    section_05_student_segments.csv
```

**Dependencies:** D3 (sankey layout) *or* ECharts — one library only; Plotly Sankey possible but heavier.

**Nav:** Add “Academic economy” to `site-nav` after “City impact.”

---

## 10. Story copy direction (editorial, not jargon)

**Act I headline (example structure):**  
`$XX.XB` — *Operating scale of Greater Boston’s academic institutions*  
*Fiscal year 20XX · IPEDS Finance · N institutions*

**Act II kicker:**  
`Circulation` — *How institutional and student dollars move through the regional economy*

**Act IV kicker:**  
`Contribution` — *Domestic, out-of-state, and international students carry different economic weight*

**Act V kicker:**  
`Spillover` — *Research funding and knowledge work extend impact beyond campus*

Avoid: “GDP contribution,” “economic output multiplier 2.5x” unless citing a specific Boston/MA study.

---

## 11. What NOT to build

| Anti-pattern | Why |
|--------------|-----|
| Default Plotly bar chart grid | Reads as homework, not flagship |
| Pie chart of “where money goes” | Cliché, poor for comparing institutions |
| Live stock-style API | Breaks GitHub Pages; wrong metaphor |
| Fabricated “$50B impact” without methodology | Fails academic rigor |
| Replacing Section 04C matrix with this | 04C is neighborhood workforce; different question |
| Full Bloomberg terminal UI clone | Cluttered, inaccessible, off-brand |

---

## 12. Phased delivery plan

### Phase 0 — Data (before pixels)

1. Document sources in `data/section_05/sources/SECTION_05_DATA_SOURCES.md`.
2. Download IPEDS Finance + SFA for anchor + aggregate institutions.
3. Build `build_section_05_financial_model.py` with explicit formula sheet.
4. Add **DS-08** to `DATA_REFERENCES.md`.

### Phase 1 — MVP flagship (recommended for deadline)

- Acts I + II + III only (hero + Sankey + lanes).
- 7 anchors + “All other map institutions.”
- Dark theme + scroll reveals.

### Phase 2 — Full story

- Acts IV–V (student segments, aid waterfall, research cards).
- Link-out chips to Section 02/03/04 data.

### Phase 3 — Polish

- Sankey scroll-scrub particles.
- Print/PDF-friendly data table appendix.

---

## 13. ~~Open decisions~~ → Resolved

All items locked — see **Locked decisions** table above.  
Future optional v2: expand Sankey to 29 nodes; add NAFSA state headline as Act IV sidebar.

---

## 14. Summary (locked direction)

**Build Section 05 as “The Academic Economy”** — a dark, scroll-choreographed **Circulation Engine** centered on a **Sankey flow system**, supported by **institutional depth lanes** and **card/waterfall acts** for student and research stories.

That combination maximizes:

- financial impressiveness  
- editorial storytelling  
- source-backed rigor  
- continuity with your existing scroll narrative site  

while explicitly avoiding generic charts and fake terminal aesthetics.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-05-21 | Initial architecture & visualization brainstorm |
| 2026-05-21 | **Locked:** Circulation Engine, IPEDS opex hero, 7+others, D3, 5-act flow, 04C → Innovation Workforce |
