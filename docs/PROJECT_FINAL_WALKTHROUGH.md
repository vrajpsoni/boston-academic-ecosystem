# Boston: A Hub of Academic Excellence — Final Website Walkthrough

**Course:** CS617 (Data Visualization) · Spring 2026  
**Document purpose:** Standalone guide for reviewers who cannot open the local site. Describes the **current** single-page site as implemented in `website/`.  
**Local preview:** `cd website && python3 -m http.server 8080` → [http://localhost:8080](http://localhost:8080)  
**Deploy target:** GitHub Pages (publish the `website/` folder as site root)

> **Note:** Some older planning docs (e.g. `website/SECTION_05_IMPLEMENTATION.md`) describe a 5-act Sankey scroll layout. The **live** Academic Economy experience uses **cinematic auto-play lanes** (`scroll-cinema.js`), not that older structure.

---

## Screenshot placeholders (for reviewers)

Add captures when sharing externally. Suggested filenames:

| # | Filename (suggested) | What to capture |
|---|----------------------|-----------------|
| 1 | `screenshots/01-landing-hero.png` | Full landing hero with title, doodles, “Explore the ecosystem” link |
| 2 | `screenshots/02-ecosystem-map.png` | Section 01 map with legend and pin clusters |
| 3 | `screenshots/03-enrollment-chart.png` | Section 02 Plotly lines + metric toggle (Total selected) |
| 4 | `screenshots/04-ecosystem-scale.png` | Section 03 hero count + metric cards |
| 5 | `screenshots/05-section04-intro.png` | Section 04 parent intro “How Academic Boston Shapes the City” |
| 6 | `screenshots/06-neighborhood-choropleth.png` | Section 04A neighborhood map + legend |
| 7 | `screenshots/07-constellation.png` | Section 04B corridor constellation (overview) |
| 8 | `screenshots/08-deep-view.png` | Section 04B Deep View fullscreen with hub detail panel |
| 9 | `screenshots/09-academic-economy-mid.png` | Section 05 mid build-up (lanes + hero $ counter) |
| 10 | `screenshots/10-academic-economy-complete.png` | Section 05 complete state + progress ring + lockup |
| 11 | `screenshots/11-outro-footer.png` | Section 04 closing outro + site footer |

Example embed syntax for your report:

```markdown
![Landing hero](screenshots/01-landing-hero.png)
```

---

## 1. Overall project title and thesis

### Title
**Boston: A Hub of Academic Excellence**

### One-line thesis
Greater Boston is not a city that merely *contains* universities—it is a city **structured around** students, campuses, research, neighborhood concentration, street-level academic business, and institutional operating scale.

### Core narrative argument
1. **Spatial:** Academic infrastructure is everywhere in the metro (map).  
2. **Temporal:** Major universities’ enrollments have grown unevenly over two decades (lines).  
3. **Scale:** Dozens of institutions combine into a student population larger than many U.S. cities (hero count).  
4. **Urban impact:** That scale reshapes neighborhoods, corridors, and local economies (Section 04 trilogy).  
5. **Financial:** Colleges and universities move **billions in audited operating expenses** through the region—not modeled “GDP impact,” but real institutional scale (Academic Economy).

### What the project explicitly does **not** claim
- No fabricated multipliers (“$X economic impact on Massachusetts”).  
- No live event feeds or real-time finance dashboards.  
- Map pin coordinates in v1 are still partly **curated seed** data pending full OSM/IPEDS validation (see limitations).

---

## 2. Full narrative flow (first section → last)

The site is one **vertical scroll story** with a sticky top navigation bar. Flow:

```
Landing Hero
    ↓  (scroll + soft reveals)
Section 01 — Ecosystem Map          “Where is academic Boston?”
    ↓
Section 02 — Enrollment Trends      “How fast did headcounts grow?”
    ↓
Section 03 — Ecosystem Scale        “What do they add up to today?”
    ↓
Section 04 — City Impact (parent)   “How does that scale hit the city?”
    ├── 04A — Student-Centered Neighborhoods (choropleth)
    ├── 04B — Business & Social Growth (constellation + Deep View)
    └── 04C — The Academic Economy (cinematic financial build-up)
    ↓
Section 04 Outro                    “Closing synthesis”
    ↓
Site Footer                         Credits + methodology pointer
```

**Emotional arc:** Wonder (density on map) → Historical momentum (lines) → Awe at scale (count-up) → Grounded urban consequences (maps + constellation) → Institutional gravity (dark economy climax) → Reflective closure (outro).

---

## 3. Every section in order

| Order | DOM `id` / anchor | Nav label | Section file / module |
|------|-------------------|-----------|------------------------|
| 0 | `#landing-hero` | Home | `css/landing-hero.css` |
| 1 | `#ecosystem-map` | Ecosystem map | `js/sections/section-01-ecosystem-map.js` |
| 2 | `#enrollment-trends` | Enrollment | `js/sections/section-02-enrollment.js` |
| 3 | `#ecosystem-scale` | Ecosystem scale | `js/sections/section-03-ecosystem-scale.js` |
| 4 | `#academic-boston` | City impact | `js/section-04/init.js` (orchestrator) |
| 4a | `#section-04a-neighborhoods` | (within City impact) | `js/section-04/04a/init.js` |
| 4b | `#section-04b-business` | (within City impact) | `js/section-04/04b/init.js` |
| 4c | `#academic-economy` | Academic economy | `js/sections/section-05-academic-economy.js` |
| — | (footer, no nav item) | — | `css/global.css` |

---

## 4–6. Per-section content, visualization type, and interactions

### Landing Hero (`#landing-hero`)

**What it shows**
- Full-viewport opener with decorative student doodles (cap, pencil, book, star, glasses).  
- Title: *Boston: A Hub of Academic Excellence*.  
- Subtitle on how universities and research shape Greater Boston.  
- CTA link: “Explore the ecosystem ↓” → `#ecosystem-map`.

**Visualization type**
- Static editorial hero (background image layer via CSS; asset `website/assets/mit-scholar-cap.png` per README).

**Interactions**
- Click CTA or nav “Home” → smooth scroll to map (nav uses header-offset scrolling).

**Scroll animations**
- None on the hero itself (visible immediately).

**Data**
- None.

**Sources**
- Visual/branding only.

---

### Section 01 — Greater Boston Academic Ecosystem Map (`#ecosystem-map`)

**What it shows**
- Kicker, H2, lede framing the region as a **network** of academic places.  
- Interactive Leaflet map of ~**87 pins** (universities, colleges, student housing zones, research institutes, medical/academic centers).  
- Insight prose + three highlight bullets (Longwood, Fenway/Kenmore, Cambridge).  
- Footer link to enrollment section.

**Visualization type**
- **Point map** (Leaflet circle markers) on **OpenStreetMap** raster tiles.  
- Category-colored markers with size/opacity variants by type.

**Interactions**
- Pan and zoom map.  
- **Hover** markers → tooltip (institution name + category label).  
- **Legend** (custom Leaflet control) explains categories.  
- **Reset view** control returns to default Greater Boston framing.

**Scroll animations**
- Header stagger: kicker → title → lede (`story-reveal` delays).  
- Map block: larger fade-up (`story-reveal--block`).  
- Insights + footer: staggered reveals.  
- Reveals **replay** when scrolling back into view (except elements marked `persist`—not used here).

**Data**
- `website/data/greater_boston_academic_ecosystem.csv`  
- Canonical: `data/greater_boston_academic_ecosystem_v1.csv`

**Sources / references**
- **DS-01** in `data/DATA_REFERENCES.md` (curated v1 seed; IPEDS/OSM validation planned).  
- **DS-03** OpenStreetMap tiles.  
- Design: `website/SECTION_01_ECOSYSTEM_MAP_DESIGN.md`

**Key JS/CSS**
- `js/map/data-loader.js`, `leaflet-map.js`, `markers.js`, `legend-control.js`, `reset-view-control.js`  
- `css/section-01-map.css`

---

### Section 02 — Enrollment Trends (`#enrollment-trends`)

**What it shows**
- Decorative enrollment-themed doodles in header.  
- Context copy naming **six universities**: Harvard, MIT, BU, Northeastern, UMass Boston, Boston College.  
- Multi-series **line chart** 2004–2023.  
- Insights on uneven growth (Northeastern, BU, Harvard/MIT roles).  
- Footer link to ecosystem scale.

**Visualization type**
- **Plotly** multi-line time series (responsive).

**Interactions**
- **Metric tabs:** Total · Domestic · International · Out-of-state (updates all traces with short Plotly transition).  
- **Hover** lines → unified hover, thicker highlighted series, dimmed others.  
- **Click legend** → toggle series visibility.  
- Attribution line updates with active metric.

**Scroll animations**
- Standard `story-reveal` stagger on header, chart block, insights, footer.

**Data**
- `website/data/greater_boston_enrollment.csv` (120 rows: 6 schools × 20 years)  
- Built by `data/scripts/build_enrollment_dataset.py` from IPEDS EF Part A/C zips in `data/raw/ipeds_ef/`

**Sources / references**
- **DS-02** — NCES IPEDS Fall Enrollment (EF), 2004–2023.  
- Detail: `data/ENROLLMENT_DATA_SOURCES.md`

**Key JS/CSS**
- `js/charts/enrollment-chart.js`, `js/sections/section-02-enrollment.js`  
- `css/section-02-enrollment.css`

**Caveats**
- International/domestic missing some early years.  
- Out-of-state is **first-time FT degree-seeking undergrad** (Part C), not total enrollment—do not sum with Total.

---

### Section 03 — Ecosystem Scale (`#ecosystem-scale`)

**What it shows**
- Immersive light section with particle/glow atmosphere.  
- Hero integer: **total students across 29 institutions** (dynamically loaded).  
- Meta line: latest reporting years + institution count.  
- Grid of **supporting metric cards** (international, domestic, out-of-state context).  
- Narrative on what the map pins represent in human scale.  
- Footer link into Section 04.

**Visualization type**
- **Typographic data hero** + **metric card grid** (not a chart).  
- Optional ambient particles (`#ecosystem-scale-particles`).

**Interactions**
- None required beyond reading; numbers appear when section enters view.

**Scroll animations**
- **Count-up animation** on hero value when section crosses ~22% viewport intersection (ease-out cubic ~2.2s first play; faster replay from ~88% if re-entering).  
- Metric cards injected with `story-reveal` and observed when rendered.  
- Standard header/block reveals.

**Data**
- `website/data/greater_boston_ecosystem_enrollment.csv`  
- Published total in config narrative: **235,824** students (29 schools; mixed 2023–2025 reporting per school).  
- Build: `data/scripts/build_section_03_ecosystem_totals.py`

**Sources / references**
- **DS-06** — IPEDS EF + seven anchor overrides from official fact books/CDS (Harvard, MIT, BU, Northeastern, Tufts, BC, UMass Boston).  
- `data/section_03/sources/SECTION_03_DATA_SOURCES.md`

**Key JS/CSS**
- `js/sections/section-03-ecosystem-scale.js`  
- `css/section-03-ecosystem-scale.css`

---

### Section 04 — How Academic Boston Shapes the City (`#academic-boston`)

**What it shows**
- Parent intro: kicker “City impact,” H2, lede explaining **three connected substories** ending in the academic economy.  
- Contains 04A, 04B, and 04C as sequential articles inside one `story-flow__content` shell.  
- Closing **outro** footer inside this section (not a separate nav item).  
- Gradient background transitioning from cool editorial light to darker economy block.

**Visualization type**
- **Editorial container** only (no standalone viz at parent level).

**Interactions**
- Nav “City impact” scrolls to parent intro (header offset).

**Scroll animations**
- Intro uses **`story-reveal--persist`**: once revealed, copy stays visible while scrolling through long subsections (reduces flicker).

**Data**
- None at parent level.

**Key CSS**
- `css/section-04-shared.css`, `css/sections.css`

---

#### Section 04A — Student-Centered Neighborhoods (`#section-04a-neighborhoods`)

**What it shows**
- H3 + lede on neighborhood-level **student-centered concentration**.  
- **Choropleth** of Boston neighborhoods + adjacent cities (Cambridge, Somerville, etc.).  
- Legend: estimated ecosystem concentration index (blue sequential ramp).  
- Attribution: BPDA boundaries, Boston 2025 population estimates, OSM basemap.

**Visualization type**
- **Leaflet choropleth** (GeoJSON polygons), **single locked metric** (no layer picker in live UI).

**Interactions**
- Pan map (zoom **locked** after fit—min/max zoom clamped to initial level for editorial stability).  
- **Hover** neighborhoods → compact tooltip: name, estimated 20–24 population, share of mapped ecosystem total, concentration index.  
- Legend shows breaks computed from data.

**Scroll animations**
- Subsection header/viz use **persist** reveals.  
- Map lazy-inits when block approaches viewport (`Section04LazyInit`).

**Data**
- `website/data/student_ecosystem_boundaries.geojson` (boundaries)  
- `website/data/layer_a_housing_pressure.csv` — metric `population_age_20_24_share` + count `population_age_20_24`  
- Ecosystem totals context: `website/data/greater_boston_ecosystem_enrollment.csv`

**Sources / references**
- **DS-05** Layer A — Analyze Boston / BPDA geography; 2025 neighborhood population CSV.  
- `data/section_04/sources/SECTION_04_DATA_SOURCES.md`  
- `data/section_04/notes/neighborhood_geography.md`  
- Design: `website/SECTION_04_NEIGHBORHOOD_HEATMAP_DESIGN.md`

**Key JS/CSS**
- `js/section-04/shared/choropleth.js`, `geojson-loader.js`, `layer-data-loader.js`, `ecosystem-context.js`  
- `js/section-04/04a/config.js`, `tooltips.js`, `init.js`  
- `css/section-04a-neighborhoods.css`

**Caveats**
- Concentration is **age 20–24 proxy**, not enrollment counts.  
- Median rent / Zillow layers documented but not in live Layer A v1.

---

#### Section 04B — Business & Social Growth (`#section-04b-business`)

**What it shows**
- H3 + lede on cafes, restaurants, bookstores, coworking along academic corridors.  
- **Immersive SVG constellation**: corridor **hubs** (22), **satellite** nodes, **region** labels, **hub-to-hub** links.  
- Footer legend for POI categories.  
- Focus panel with corridor detail on hub hover.

**Visualization type**
- **Custom force-layout-style constellation** (hand-tuned hub positions in config, not a force simulation at runtime).  
- SVG layers: regions, links, clusters, labels, ambient grain.

**Interactions**
- **Hover corridor hub** → highlight links/nodes; **detail pane** shows:  
  - Tier label (anchor / major / regional)  
  - OSM POI counts (cafes, restaurants, bookstores, coworking)  
  - **Activity signals** (Innovation, Student events, Meetups, Cultural) as Low→High quartiles  
  - Short editorial story line per corridor  
- **Enter Deep View** button → fullscreen immersive mode:  
  - Scene reparented to `document.body`, scroll position saved  
  - Network zoomed to “deep” transform  
  - **Exit Deep View** or **Escape** restores scroll position  
  - Body class `eco-constellation-deep-open` hides main header for immersion  
- Lazy-init when subsection visible.

**Scroll animations**
- Persist reveals on header/viz wrapper.  
- Viz block gets `is-revealed` when constellation finishes loading.

**Data**
- `website/data/layer_b_business_density.csv` (neighborhood OSM counts)  
- `website/data/section_04b_corridor_osm.csv` (corridor bbox OSM totals)  
- `website/data/section_04b_ecosystem_activity.csv` (activity quartiles + highlight bullets)  
- `website/data/greater_boston_academic_ecosystem.csv` (institution anchors)  
- Housing/innovation layers loaded for hub model enrichment: `layer_a_housing_pressure.csv`, `layer_c_innovation_workforce.csv`  
- Hub registry: `data/section_04/raw/activity/corridor_registry.json`

**Sources / references**
- **DS-07** — OpenStreetMap via Overpass; MIT public iCal (keyword-matched, not live).  
- `data/section_04/sources/SECTION_04B_ACTIVITY_METHODOLOGY.md`  
- Activity is **relative quartiles**, not raw event counts on screen.

**Key JS/CSS**
- `js/section-04/04b/constellation.js`, `config.js`, `init.js`  
- `css/section-04b-business.css` (Deep View fullscreen rules)

---

#### Section 04C — The Academic Economy (`#academic-economy`)

**What it shows**
- Light-mode intro head (kicker “Economic engine,” H3, lede on IPEDS operating expenses).  
- Full-bleed **dark cinematic stage** (`econ-cinema`):  
  - Ambient canvas particles  
  - Hero **$0 → ~$17.94B** operating total (lerped counter)  
  - **Eight horizontal lanes** (7 named anchors + “All Other Institutions”) with **stacked category bars**  
  - Right **detail pane** (desktop) after sequence completes  
  - **Lockup** copy: “29 institutions · ~$18B annual operating scale · One interconnected academic ecosystem.”  
  - Top-right **progress ring** (category-colored continuous radial cue)  
  - IPEDS attribution footnote below cinema

**Visualization type**
- **Cinematic horizontal bar build-up** (CSS-driven lane fills, not Plotly/D3 in live build).  
- **Conic-gradient progress ring** (composition mask, not a segmented spinner).  
- Detail pane: mini **100% stacked category bars** for hovered institution.

**Interactions (after auto-play completes)**
- **Hover/focus lane** → highlights lane, dims others, fills detail pane with institution name, OPEX, category breakdown.  
- **Honesty notes** for UMass Boston and “All Other” when category mapping is partial (most dollars in “Other”).  
- Mobile: detail pane hidden; lane hover still highlights names/amounts.

**Auto-play behavior (time-based, not scroll-scrubbed)**
- Triggers when sticky stage is ~**28%** visible; pauses if user scrolls away (&lt;6% visible).  
- **Build order:** Harvard → MIT → BU → Northeastern → Tufts → BC → UMass Boston → All Other Institutions.  
- **Phase timing (~8.7s total):** intro 460ms → 8 × 900ms institution beats → 600ms “others” pulse → 280ms lockup hold.  
- Hero dollar amount **lerps** toward cumulative target during playback.  
- Replay: if user returns after partial view, resumes or quick-replays from ~82% progress.  
- `prefers-reduced-motion`: jumps to completed state immediately.

**Progress ring (special feature)**
- Continuous ring with **five category hues** (instruction blue, research green, student services purple, auxiliary gold, other slate).  
- Fills **clockwise** in sync with normalized playback progress (same easing per fifth of timeline).  
- Faint full-ring ghost behind fill; SVG track + center hub; soft glow when visible/resolved.  
- **Not** a loading spinner—purely a pacing cue for the ecosystem assembly.

**Scroll animations**
- Economy **header** uses persist reveals.  
- Economy **cinema** itself uses internal cinema timing, not scroll-scrub.  
- Small **track spacer** below sticky stage gives scroll room before outro.  
- Attribution line uses standard `story-reveal`.

**Data (live)**
- **Primary:** `website/data/section_05_institution_scale.csv`  
  - 29 rows + `AGG_OTHERS` aggregate  
  - Fields: `total_operating_expenses_usd`, functional lines (`expense_instruction_usd`, `expense_research_usd`, `expense_student_services_usd`, `expense_auxiliary_usd`), IPEDS varnames `F1B25`/`F2E131`  
- **Hero total:** $17,940,441,187 (FY2022 IPEDS Finance, 29 institutions)  
- **Not loaded by live UI (present for future/archived acts):**  
  - `website/data/section_05_economy_flows.csv`  
  - `website/data/section_05_economy_nodes.csv`  
- Build script: `data/scripts/build_section_05_financial_model.py`

**Sources / references**
- **DS-08** — NCES IPEDS Finance F2122 (`F2122_F1A.zip`, `F2122_F2.zip`, `HD2022.zip`).  
- `data/section_05/sources/SECTION_05_METHODOLOGY.md`  
- `data/section_05/sources/SECTION_05_DATA_SOURCES.md`  
- Architecture notes: `website/SECTION_05_ACADEMIC_ECONOMY_ARCHITECTURE.md` (conceptual; live = scroll-cinema)

**Key JS/CSS**
- `js/section-05/scroll-cinema.js` (engine)  
- `js/section-05/config.js`, `data-loader.js`, `format.js`, `ambient.js`, `init.js`  
- `js/sections/section-05-academic-economy.js` (lazy init)  
- `css/section-05-academic-economy.css`  
- Legacy (not in `index.html`): `hero.js`, `sankey.js`, `lanes.js`, `scroll-acts.js`

**Caveats**
- **Single fiscal year** (2021–22 collection)—no multi-year finance timeline.  
- Functional categories do not always sum to total OPEX; residual mapped to **Other**.  
- UMass Boston: student services can be **$0** in source F1A—correct per IPEDS, not a bug.  
- Does **not** display GDP-style “regional impact.”

---

### Section 04 Outro (inside `#academic-boston`)

**What it shows**
- Lead: “Boston’s academic ecosystem is a network, a city footprint, and an economy.”  
- Closing paragraph tying map → enrollment → neighborhoods → business → operating scale.

**Visualization type**
- Prose only.

**Interactions**
- None.

**Scroll animations**
- Staggered `story-reveal` on lead + body (**tail zone**—easier intersection thresholds).  
- Refreshes after economy playback completes (`econ-playback-complete` event).

---

### Site Footer

**What it shows**
- CS617 credit line + dynamic year.  
- Data sources one-liner + pointer to `data/DATA_REFERENCES.md`.

**Scroll animations**
- Tail-zone staggered reveals.

---

## 7. Global scroll-reveal system (all sections)

Implemented in `js/story/scroll-reveal.js` + `css/story-reveal.css`.

| Behavior | Detail |
|----------|--------|
| Motion | Opacity 0 → 1, translateY **10px** (blocks **14px**), ~0.68–0.82s ease |
| Stagger | `data-story-reveal-group` auto-applies `--delay-1/2/3` on children |
| Trigger | IntersectionObserver ~**12%** visible; hides below ~**4%** (replays on re-entry) |
| Persist | `story-reveal--persist` / `data-story-reveal="persist"` — stays visible once shown (Section 04) |
| Tail zone | `.section-04-outro` + `.site-footer` — gentler **7%** enter threshold |
| Reduced motion | All reveals shown immediately, no animation |

Initialized from `js/main.js` on `DOMContentLoaded`.

---

## 8. Navigation bar (current)

- **Left:** Brand link — “Boston: A Hub of Academic Excellence” → `#landing-hero`.  
- **Right:** Home · Ecosystem map · Enrollment · Ecosystem scale · City impact · Academic economy.  
- Sticky header with light blur; **slim** padding (~3.25rem height via CSS variable, updated on resize in JS).  
- Section links scroll so section tops sit **just below** the header (`initSectionNavScroll` in `main.js`).

---

## 9. Technology stack (runtime)

| Layer | Choice |
|-------|--------|
| Markup | Single `website/index.html` |
| Style | Plain CSS modules per section |
| Maps | Leaflet 1.9.4 + OSM tiles |
| Charts | Plotly 2.35.2 (Section 02 only) |
| CSV | PapaParse 5.4.1 |
| Section 05 | Vanilla JS cinema engine (no D3 in live page) |
| Fonts | Google Fonts — Inter |

No bundler required; suitable for static GitHub Pages hosting.

---

## 10. Major file paths (quick reference)

### Entry & global
- `website/index.html` — full story DOM  
- `website/js/main.js` — init order, nav scroll, footer year  
- `website/js/config.js` — paths, section IDs  
- `website/js/story/scroll-reveal.js` — global reveals  
- `website/css/global.css`, `sections.css`, `story-reveal.css`

### Data published for browser
- `website/data/greater_boston_academic_ecosystem.csv`  
- `website/data/greater_boston_enrollment.csv`  
- `website/data/greater_boston_ecosystem_enrollment.csv`  
- `website/data/student_ecosystem_boundaries.geojson`  
- `website/data/layer_a_housing_pressure.csv`  
- `website/data/layer_b_business_density.csv`  
- `website/data/section_04b_corridor_osm.csv`  
- `website/data/section_04b_ecosystem_activity.csv`  
- `website/data/section_05_institution_scale.csv`  
- (optional/unused live) `section_05_economy_flows.csv`, `section_05_economy_nodes.csv`

### Canonical / build (repo root `data/`)
- `data/DATA_REFERENCES.md` — **master citations**  
- `data/DATASET_COLLECTION_PLAN.md`  
- `data/ENROLLMENT_DATA_SOURCES.md`  
- `data/scripts/build_enrollment_dataset.py`  
- `data/scripts/build_section_03_ecosystem_totals.py`  
- `data/scripts/build_section_05_financial_model.py`  
- `data/section_04/`, `data/section_05/` — processed CSVs, methodology, audits

### Documentation map
| Doc | Role |
|-----|------|
| `data/DATA_REFERENCES.md` | Citations, URLs, dataset IDs DS-01–DS-08 |
| `website/ARCHITECTURE.md` | Folder structure, GH Pages model |
| `website/README.md` | Local server instructions |
| `PROJECT_MEMORY.md` | Product intent & section history |
| `PROJECT_CONTEXT.md` | Original course goals & style reference |
| `website/SECTION_04_ARCHITECTURE.md` | Section 04 technical design |
| `website/SECTION_05_ACADEMIC_ECONOMY_ARCHITECTURE.md` | Economy storytelling spec |
| `data/section_04/sources/SECTION_04A_DATA_AUDIT.md` | 04A data QA |
| `data/section_04/sources/SECTION_04B_ACTIVITY_METHODOLOGY.md` | Activity signal derivation |
| `data/section_05/sources/SECTION_05_METHODOLOGY.md` | Finance claims & limitations |

### Proposal artifacts (evolution)
- `proposal/final_project_proposal_social_vs_traditional_news.md` — **earlier topic** (news sources survey viz)  
- `proposal/CS617_Proposal.pdf`, `proposal/VS_CS617_Proposal.pdf` — course proposal PDFs (Boston topic)

---

## 11. How design evolved from the original proposal

| Stage | Direction |
|-------|-----------|
| **Initial proposal draft** | “Social Media vs Traditional News” — cross-country survey charts (Reuters/Pew). See `proposal/final_project_proposal_social_vs_traditional_news.md`. |
| **Pivot (project memory)** | Adopted **Boston academic excellence** narrative aligned with TA feedback: real datasets, storytelling, map + charts, reference site style (MA unemployment scrolly feel **without** heavy cinematic overreach). |
| **Section order stabilized** | Map → enrollment lines → aggregate scale → city impact trilogy → financial climax. |
| **Section 03 swap** | Neighborhood heatmaps were **planned as Section 03**; moved to **Section 04A** when scale hero became Section 03 (`PROJECT_MEMORY.md`). |
| **Section 04B** | Evolved from simple business map to **constellation + Deep View** immersive corridor experience. |
| **Section 04C / 05** | Planned 5-act scroll with Sankey (`SECTION_05_IMPLEMENTATION.md`); **shipped** as single sticky **scroll-cinema** with lane build-up + continuous progress ring for clearer pacing and data honesty. |
| **Innovation layer (04C matrix)** | Layer C data and `section-04c-innovation.css` exist in repo; **no separate innovation matrix section** in current `index.html` (only economy article id `section-04c-heading`). |
| **Global polish** | `story-reveal` system site-wide; navbar brand-left / links-right; post-economy reveal continuity for outro/footer. |

---

## 12. Current known limitations and caveats

### Data & methodology
- **Map pins (Section 01):** Curated seed coordinates; full IPEDS/OSM validation incomplete (`geocode_quality=seed`).  
- **Enrollment (02):** Six universities only—not all 29 ecosystem schools. Early-year gaps on international/domestic.  
- **Ecosystem scale (03):** Mixed reporting years per institution; out-of-state metric is not additive to headline total.  
- **Neighborhoods (04A):** Age 20–24 **proxy** for student concentration, not enrollment.geography.  
- **Constellation (04B):** Activity signals are **quartile labels** from MIT iCal keywords + OSM heuristics—not live feeds. Harvard/Eventbrite/Meetup feeds documented but not pulled in v1.  
- **Academic Economy (05):** One fiscal year; categories incomplete for some public institutions; **no** Sankey/flow diagram in live UI despite CSVs existing.

### UX / technical
- Requires **local static server** (or hosted GH Pages) for `fetch()` CSV/GeoJSON.  
- Section 04B Deep View reparents DOM—works best on desktop; mobile constellation still usable but less spacious.  
- Academic Economy detail pane **hidden on narrow screens** (&lt;900px).  
- `DATA_REFERENCES.md` DS-08 header still says “planned” in places—**live** institution scale is implemented; Acts IV–V prose acts from older plan are **not** on the page.

### Accessibility
- Maps and constellation rely on pointer hover; keyboard focus supported on post-play economy lanes.  
- `prefers-reduced-motion` respected for counters and reveals; economy jumps to final frame.

---

## 13. Final storytelling message

> **Greater Boston is a student city in structure, not only in reputation.**  
> The map shows academic infrastructure everywhere. Enrollment histories show decades of growth. Aggregated headcount shows a population the size of a major city. Neighborhood concentration and corridor businesses show how that presence reshapes daily urban life. Institutional operating expenses show billions in **audited** educational spending—real scale, not hype multipliers.  
>  
> The closing beat is intentional: students and universities are **woven into** Greater Boston—not beside it. The project asks viewers to see the region as one **interconnected academic ecosystem**: spatial, human, street-level, and financial layers of the same story.

---

## Appendix A — Institution build order (Academic Economy)

| Order | Institution | UNITID |
|------|-------------|--------|
| 1 | Harvard University | 166027 |
| 2 | MIT | 166683 |
| 3 | Boston University | 164988 |
| 4 | Northeastern University | 167358 |
| 5 | Tufts University | 168148 |
| 6 | Boston College | 164924 |
| 7 | UMass Boston | 167987 |
| 8 | All Other Institutions (22 schools) | AGG_OTHERS |

---

## Appendix B — Category palette (bars + progress ring)

| Category | Color role |
|----------|------------|
| Instruction | Blue |
| Research | Green |
| Student services | Purple |
| Auxiliary | Gold |
| Other (incl. unmapped IPEDS lines) | Slate |

---

*Document generated to reflect the repository state as of the final implementation pass. For citation-ready URLs and rebuild commands, always prefer `data/DATA_REFERENCES.md` as the source of truth.*
