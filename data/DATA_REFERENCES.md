# Data References — CS617 Final Project

**Project:** Boston: A Hub of Academic Excellence  
**Purpose:** Central citation index for all datasets and external sources used in the storytelling website and final report.  
**Maintainer note:** Update this file whenever a new dataset is added, rebuilt, or swapped.

---

## How this file relates to other docs

| Document | Role |
|----------|------|
| **`DATA_REFERENCES.md` (this file)** | Master list for report citations — source name, URL, coverage, access date, gaps; **[complete link appendix](#complete-sources-appendix-all-links)** |
| **`ENROLLMENT_DATA_SOURCES.md`** | Section 02 drill-down — IPEDS field definitions, rebuild steps, enrollment-specific limitations |
| **`DATASET_COLLECTION_PLAN.md`** | Collection workflow, map scope rules, schema design, QA checklists |
| **`section_04/sources/SECTION_04_DATA_SOURCES.md`** | Section 04 layer field definitions |
| **`section_04/sources/SECTION_04B_ACTIVITY_METHODOLOGY.md`** | Section 04B MIT iCal + signal derivation |
| **`section_03/sources/SECTION_03_DATA_SOURCES.md`** | Section 03 IPEDS + override summary |
| **`section_05/SECTION_05_DATA_COLLECTION_PLAN.md`** | Section 05 acts, schemas, validation gate |
| **`section_05/sources/SECTION_05_DATA_SOURCES.md`** | Section 05 IPEDS Finance URLs |
| **`website/SECTION_05_ACADEMIC_ECONOMY_ARCHITECTURE.md`** | Locked viz + 5-act experience (no data) |

Section-specific technical docs stay in place; this file is the **single place to look for citations and URLs**.

---

## Quick index

| ID | Dataset / source | Section | Status |
|----|------------------|---------|--------|
| [DS-01](#ds-01-greater-boston-academic-ecosystem-map) | Greater Boston Academic Ecosystem (pins) | 01 — Map | v1 seeded |
| [DS-02](#ds-02-enrollment-time-series) | Enrollment time series | 02 — Charts | v1 complete · **chart live** |
| [DS-03](#ds-03-openstreetmap-basemap) | OpenStreetMap basemap tiles | 01 — Map | In use |
| [DS-04](#ds-04-planned--validation-sources-not-yet-in-csvs) | Planned validation sources | 01+ | Planned |
| [DS-05](#ds-05-section-04-neighborhood-layers) | Section 04 neighborhood layers (A/B/C) | 04A/C — Heatmaps | v1 complete |
| [DS-06](#ds-06-section-03-ecosystem-enrollment-aggregate) | Ecosystem enrollment aggregate | 03 — Scale hero | v1 complete |
| [DS-07](#ds-07-section-04b-business--social-ecosystem-constellation) | Section 04B corridor OSM + activity signals | 04B — Constellation | v1 complete |
| [DS-08](#ds-08-section-05-the-academic-economy) | Section 05 financial storytelling (IPEDS Finance) | 05 — Academic Economy | **planned** · validation phase |

**Full link list (report appendix):** [Complete sources appendix](#complete-sources-appendix-all-links)

---

## DS-01: Greater Boston Academic Ecosystem (map pins)

| Field | Value |
|-------|--------|
| **Source name** | Curated project dataset (seed v1) with planned NCES IPEDS + OpenStreetMap validation |
| **Website URL** | [NCES IPEDS](https://nces.ed.gov/ipeds/) · [OpenStreetMap](https://www.openstreetmap.org/) · [Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API) |
| **Dataset / report name** | `greater_boston_academic_ecosystem_v1.csv` (canonical); `website/data/greater_boston_academic_ecosystem.csv` (published) |
| **Used for** | Section 01 interactive Leaflet map — universities, colleges, student housing zones, research institutes, medical/academic centers in Greater Boston |
| **Years covered** | Point-in-time locations (not a time series); narrative is contemporary ecosystem |
| **Entities included** | **87 pins** across Boston, Cambridge, Somerville, Brookline, Quincy — see `DATASET_COLLECTION_PLAN.md` for full category breakdown. Excludes K–12, corporate biotech offices, generic innovation POIs |
| **Access date** | **2026-05-20** (v1 seed); coordinate validation against OSM/IPEDS **pending** |
| **Missing / partial data** | All rows currently `source=curated_v1`, `geocode_quality=seed` — not yet merged with OSM or IPEDS directory. IPEDS `unitid` not attached to rows. No enrollment fields in v1 schema |

**Suggested citation (map data layer):**  
*Greater Boston academic ecosystem locations, curated for CS617 (2026), with institution names informed by NCES IPEDS and geographic context from OpenStreetMap; coordinates pending OSM validation.*

**Related files:** `data/DATASET_COLLECTION_PLAN.md` (§1–7 scope and exclusions)

---

## DS-02: Enrollment time series

| Field | Value |
|-------|--------|
| **Source name** | U.S. Department of Education, NCES — **Integrated Postsecondary Education Data System (IPEDS)** |
| **Website URL** | https://nces.ed.gov/ipeds/ · Data files: https://nces.ed.gov/ipeds/datacenter/data/EF{year}A.zip and `EF{year}C.zip` |
| **Dataset / report name** | IPEDS **Fall Enrollment (EF)** survey — Part A (`ef{year}a.csv`) and Part C residence (`ef{year}c.csv`); project file `greater_boston_enrollment_v1.csv` |
| **Used for** | Section 02 storytelling charts (Plotly) — growth of student population, international vs domestic, out-of-state context |
| **Years covered** | **2004–2023** (annual). **2000–2003** not available in EF machine-readable files used. **2024+** when NCES releases `EF2024A` |
| **Entities included** | **6 universities:** Harvard University (166027), MIT (166683), Boston University (164988), Northeastern University (167358), UMass Boston (167987), Boston College (164924). **120 rows** (6 × 20 years). *Planned:* “Other Greater Boston Institutions” aggregate |
| **Access date** | **2026-05-20** (built via `data/scripts/build_enrollment_dataset.py`; raw zips in `data/raw/ipeds_ef/`) |
| **Missing / partial data** | See below |

**Column-level gaps (v1):**

| Column | Gap |
|--------|-----|
| **International** | Blank for many **2004–2007** rows (`EFNRALT` not on grand-total row in older EF layouts) |
| **Domestic** | Blank when International is blank (derived field only) |
| **OutOfState** | Blank in some years; measures **first-time FT degree-seeking undergraduates** (EF Part C), not total enrollment — do not sum with Total |
| **Total (2004–2008)** | From `EFRACE24` grand-total row where `EFTOTLT` unavailable |

**Suggested citation:**  
*U.S. Department of Education, National Center for Education Statistics, Integrated Postsecondary Education Data System (IPEDS), Fall Enrollment component, 2004–2023.*

**Related files:** `data/ENROLLMENT_DATA_SOURCES.md` (variable definitions, rebuild commands)

---

## DS-03: OpenStreetMap basemap

| Field | Value |
|-------|--------|
| **Source name** | OpenStreetMap contributors |
| **Website URL** | https://www.openstreetmap.org/ · Tiles via https://tile.openstreetmap.org/ |
| **Dataset / report name** | Standard OSM raster tile layer (Leaflet) |
| **Used for** | Section 01 map background geography |
| **Years covered** | Live tiles (current OSM data at render time) |
| **Entities included** | Greater Boston viewport only (display); not a downloaded extract |
| **Access date** | **2026-05-20** (website implementation) |
| **Missing / partial data** | None for basemap purpose; pin accuracy is separate (DS-01) |

**Suggested citation:**  
*© OpenStreetMap contributors*

---

## DS-05: Section 04 neighborhood layers

| Field | Value |
|-------|--------|
| **Source name** | BPDA / Analyze Boston (geography + ACS bundle); OpenStreetMap Overpass (Layer B) |
| **Website URL** | [Boston neighborhood boundaries](https://data.boston.gov/dataset/bpda-neighborhood-boundaries) · [2025 neighborhood population CSV](https://data.boston.gov/dataset/2025-boston-population-estimates-neighborhood-level) · [OpenStreetMap](https://www.openstreetmap.org/) |
| **Dataset / report name** | `data/section_04/processed/greater_boston_geography_v1.csv`, `layer_a_housing_pressure_v1.csv`, `layer_b_business_density_v1.csv`, `layer_c_innovation_workforce_v1.csv` |
| **Used for** | Section 04 — neighborhood heatmaps (housing pressure, business/social density, innovation/workforce proxies) |
| **Years covered** | **2025** ACS rollups (Boston neighborhoods); OSM POI snapshot **2026-05-20** |
| **Entities included** | **26** Boston neighborhoods (`boston_neighborhood`) + **8** adjacent places in geography spine; Layer B = **104** metric rows (4 OSM categories × 26 neighborhoods) |
| **Access date** | **2026-05-20** (geography + A/C); Layer B rebuilt **2026-05-21** |
| **Missing / partial data** | Median rent (ACS tract) pending `CENSUS_API_KEY`; Zillow ZORI and IRHI not downloaded; Cambridge/Somerville OSM not in Layer B v1; student density is **age 20–24 proxy**, not enrollment |

**Related files:** `data/section_04/SECTION_04_DATA_COLLECTION_PLAN.md`, `data/section_04/sources/SECTION_04_DATA_SOURCES.md`, `data/section_04/notes/processing_log.md`

**Build commands:**

```bash
python3 data/scripts/build_section_04_geography.py
python3 data/scripts/build_section_04_housing_layer.py
python3 data/scripts/build_section_04_innovation_layer.py
python3 data/scripts/build_section_04_business_osm.py   # requires network
```

---

## DS-06: Section 03 ecosystem enrollment aggregate

| Field | Value |
|-------|--------|
| **Source name** | U.S. Department of Education, NCES — IPEDS **Fall Enrollment (EF)** |
| **Website URL** | https://nces.ed.gov/ipeds/datacenter/data/EF2023A.zip · EF2023C.zip |
| **Dataset / report name** | `data/section_03/processed/greater_boston_ecosystem_enrollment_v1.csv`; `website/data/greater_boston_ecosystem_enrollment.csv` |
| **Used for** | Section 03 immersive hero — combined currently enrolled students across map-scope institutions |
| **Years covered** | **Mixed 2023–2025** — latest official headcount per institution (7 CDS/fact-book overrides + IPEDS EF 2023 for remainder) |
| **Entities included** | **29** institutions; **235,824** total students (v1 sum, May 2026 refresh) |
| **Access date** | **2026-05-20** |
| **Missing / partial data** | Out-of-state is IPEDS Part C FT first-time undergrad aggregate, not full headcount |

**Institutional overrides (manual download / official reports, not scraped):**

| Institution | Source | URL | Access |
|-------------|--------|-----|--------|
| Harvard University | OIRA Fact Book — enrollment | https://oira.harvard.edu/factbook/fact-book-enrollment/ | 2026-05-20 |
| MIT | MIT Facts — enrollment | https://web.mit.edu/facts/enrollment.html | 2026-05-20 |
| Boston University | CDS 2024–25 (Section I) | https://www.bu.edu/asir/files/2026/04/CDS_2024_25-updated-sect-I.pdf | 2026-05-20 |
| Northeastern University | Institutional accomplishments datasheet | https://accomplishments.northeastern.edu/wp-content/uploads/2025/03/IAC_24_DATASHEET_03.14.25.pdf | 2026-05-20 |
| Tufts University | CDS 2024–25 | https://provost.tufts.edu/institutionalresearch/wp-content/uploads/sites/5/CDS_2024-2025-1.pdf | 2026-05-20 |
| Boston College | Fact Book 2024–25 | https://www.bc.edu/content/dam/bc1/offices/irp/ir/factbook/factbook_pdfs/FINAL%20FactBook%202024-25.pdf | 2026-05-20 |
| UMass Boston | Fast Facts Fall 2024 | https://www.umb.edu/media/umassboston/editor-uploads/institutional-research-assessment-planning/Fast-Facts-Fall-2024.pdf | 2026-05-20 |

**Related files:** `data/section_03/SECTION_03_DATA_COLLECTION_PLAN.md`, `data/section_03/sources/SECTION_03_DATA_SOURCES.md`, `data/section_03/raw/ecosystem_enrollment_overrides.csv`

**Build:**

```bash
python3 data/scripts/build_section_03_ecosystem_totals.py
```

---

## DS-07: Section 04B — Business & social ecosystem constellation

| Field | Value |
|-------|--------|
| **Source name** | OpenStreetMap (Overpass API); MIT CampusGroups iCal; curated corridor registry |
| **Website URL** | [OpenStreetMap](https://www.openstreetmap.org/) · [Overpass API](https://overpass-api.de/api/interpreter) · [Overpass (kumi)](https://overpass.kumi.systems/api/interpreter) · [MIT Events iCal](https://engage.mit.edu/ical/mit/ical_mit.ics) |
| **Dataset / report name** | `layer_b_business_density_v1.csv` (Boston neighborhoods); `layer_b_corridor_osm_v1.csv`; `layer_b_ecosystem_activity_v1.csv` / `website/data/section_04b_ecosystem_activity.csv`; `activity_evidence_v1.json` |
| **Used for** | Section 04B immersive constellation — hub POI counts, satellite density, hover activity signals (innovation / student events / meetups / cultural) |
| **Years covered** | OSM snapshot **2026-05-21**; MIT iCal cache at rebuild time; activity levels are **relative quartiles** across 22 corridors |
| **Entities included** | **22** corridor hubs (Cambridge + Boston); **4** OSM POI categories per hub/neighborhood; activity signals derived per corridor |
| **Access date** | **2026-05-21** (OSM + activity pipeline) |
| **Missing / partial data** | Meetup / Eventbrite / Harvard iCal **not fetched** in v1; MIT events matched by **keywords**, not geocoding; signal labels (Low→High) are editorial quartiles, not raw counts on the UI |

**Collection method by layer:**

| Layer | Method | Notes |
|-------|--------|-------|
| Boston neighborhood OSM counts | **API fetch** (Overpass) | `build_section_04_business_osm.py` — also feeds 04A-style Layer B |
| Cambridge corridor OSM | **API fetch** (Overpass bbox) | `build_section_04_corridor_osm.py` — curated bboxes in `corridor_registry.json` |
| Activity signals | **Downloaded** MIT iCal + OSM-derived scores | `build_section_04b_activity_from_sources.py` |
| Hub positions / corridor list | **Curated** | `website/js/section-04/04b/config.js`, `corridor_registry.json` |

**Documented but not used in v1:**

| Source | URL | Reason |
|--------|-----|--------|
| Harvard Events iCal | https://events.harvard.edu/ (iCal endpoints) | 403 without campus network |
| Eventbrite API | https://www.eventbrite.com/platform/api/ | API token required |
| Meetup API / public ICS | https://www.meetup.com/ | OAuth / blocked; group slugs documented only |
| Meetup groups (reference) | https://www.meetup.com/Boston-New-Technology/ · https://www.meetup.com/Boston-Startup-Cofounders/ · https://www.meetup.com/Boston-Product-Management/ | Registry in `corridor_registry.json`; no pull in v1 |

**Build commands:**

```bash
python3 data/scripts/build_section_04_business_osm.py
python3 data/scripts/build_section_04_corridor_osm.py
python3 data/scripts/build_section_04b_activity_from_sources.py
```

**Suggested citation:**  
*OpenStreetMap contributors, data via Overpass API, ODbL, accessed 2026-05-21; MIT Events public iCal feed (engage.mit.edu), keyword-matched to academic corridors for relative activity indicators.*

**Related files:** `data/section_04/sources/SECTION_04_DATA_SOURCES.md`, `data/section_04/sources/SECTION_04B_ACTIVITY_METHODOLOGY.md`, `data/section_04/raw/activity/corridor_registry.json`, `data/section_04/raw/activity/feeds/`

---

## DS-08: Section 05 — The Academic Economy

| Field | Value |
|-------|--------|
| **Source name** | U.S. Department of Education, NCES — IPEDS **Finance** (F1A public / F2 private); IPEDS HD (control); optional SFA, RD, NSF HERD (Acts IV–V) |
| **Website URL** | https://nces.ed.gov/ipeds/datacenter/data/F2022F1A.zip · F2022F2.zip · HD2022.zip · [IPEDS home](https://nces.ed.gov/ipeds/) |
| **Dataset / report name** | `institution_financial_scale_v1.csv`, `academic_economy_flows_v1.csv`, `academic_economy_nodes_v1.csv` (processed); published under `website/data/section_05_*.csv` |
| **Used for** | Section 05 flagship — hero **operating expenses**, Sankey circulation, institutional depth lanes, student/research acts (phased) |
| **Years covered** | IPEDS Finance **2021–22** collection (`F2122` files); hero **$17.94B** operating expenses (29 map-scope institutions) |
| **Entities included** | **7 anchor** UNITIDs + **“All other map institutions”** aggregate (22 schools); scope = 29 in `ecosystem_institutions_ipeds.csv` |
| **Access date** | **2026-05-21** (F2122 Finance: `F2122_F1A.zip`, `F2122_F2.zip`; VARNAME `F1B25` / `F2E131`) |
| **Missing / partial data** | Acts IV–V (tuition flows, NAFSA, living spend estimates) Phase 2; public-school functional lines may not sum to `F1B25` (residual in Sankey); no fabricated “total economic impact” headline |

**Hero metric (locked):** Sum of IPEDS **total operating expenses** — not GDP-style impact estimates.

**Related files:** `data/section_05/SECTION_05_DATA_COLLECTION_PLAN.md`, `data/section_05/sources/SECTION_05_METHODOLOGY.md`, `website/SECTION_05_ACADEMIC_ECONOMY_ARCHITECTURE.md`

**Build (after validation):**

```bash
python3 data/scripts/build_section_05_financial_model.py   # to be implemented
```

**Suggested citation:**  
*U.S. Department of Education, National Center for Education Statistics, Integrated Postsecondary Education Data System (IPEDS), Finance component, fiscal year 20XX, for Greater Boston map-scope institutions.*

---

## DS-04: Planned / validation sources (not yet in CSVs)

These are **approved sources** from the collection plan; not yet primary inputs to published CSVs.

| Source name | URL | Intended use | Notes |
|-------------|-----|--------------|-------|
| NCES IPEDS Institutional Directory | https://nces.ed.gov/ipeds/datacenter/InstitutionalCharacteristics/ | DS-01 name/`unitid` validation | Planned merge with map pins |
| MA DESE school profiles | https://profiles.doe.mass.edu/ | Community college names | Higher-ed only; no K–12 import |
| U.S. Census Geocoder | https://geocoding.geo.census.gov/geocoder/ | Address → lat/lon for unmatched pins | Batch QA |
| CMS Hospital Compare | https://data.cms.gov/ | Medical center names | Backup for hospital pins |
| Common Data Set (CDS) | Per-institution OIR / admissions sites | Enrollment QA vs IPEDS | Manual spot-check only; see DS-02 |
| Institutional fact books | e.g. https://oira.harvard.edu/ | Narrative / QA | Overrides in DS-06 for seven anchors |
| IPEDS College Navigator | https://nces.ed.gov/collegenavigator/ | DS-02 validation | Spot-check only |
| Zillow ZORI | https://www.zillow.com/research/data/ | Layer A rent supplement | Not downloaded v1 |
| Boston IRHI | https://data.boston.gov/dataset/income-restricted-housing-inventory | Layer A affordable units | Field in 2025 CSV; full IRHI pull future |
| Census API key signup | https://api.census.gov/data/key_signup.html | ACS tract rent script | Optional `build_section_04_census_acs.py` |

---

## Complete sources appendix (all links)

Use this section for the **final report bibliography** or website “Data sources” page.  
**Legend:** **Downloaded** = zip/CSV saved in repo · **API fetch** = script called a public API at build time · **Curated** = hand-maintained in project files · **Live** = fetched in the browser at view time · **Documented** = listed for future use, not in published numbers

### Section 01 — Academic ecosystem map

| Source | URL | Method |
|--------|-----|--------|
| Map pin dataset | `data/greater_boston_academic_ecosystem_v1.csv` → `website/data/greater_boston_academic_ecosystem.csv` | **Curated** (seed v1) |
| NCES IPEDS (validation planned) | https://nces.ed.gov/ipeds/ | Planned |
| OpenStreetMap | https://www.openstreetmap.org/ | Reference |
| Overpass API | https://wiki.openstreetmap.org/wiki/Overpass_API · https://overpass-api.de/api/interpreter | Planned validation |
| OSM map tiles | https://tile.openstreetmap.org/ | **Live** |

### Section 02 — Enrollment time series (6 universities, 2004–2023)

| Source | URL | Method |
|--------|-----|--------|
| NCES IPEDS home | https://nces.ed.gov/ipeds/ | **Downloaded** |
| IPEDS Data Center | https://nces.ed.gov/ipeds/datacenter/ | **Downloaded** |
| Fall Enrollment Part A (per year) | https://nces.ed.gov/ipeds/datacenter/data/EF{year}A.zip (`year` = 2004…2023) | **Downloaded** → `data/raw/ipeds_ef/` |
| Fall Enrollment Part C (per year) | https://nces.ed.gov/ipeds/datacenter/data/EF{year}C.zip | **Downloaded** |
| Processed output | `data/greater_boston_enrollment_v1.csv` → `website/data/greater_boston_enrollment.csv` | Built |
| Builder | `data/scripts/build_enrollment_dataset.py` | — |
| IPEDS validation (optional) | https://nces.ed.gov/collegenavigator/ | Manual spot-check |

### Section 03 — Ecosystem scale hero (29 schools, 235,824 total)

| Source | URL | Method |
|--------|-----|--------|
| IPEDS EF2023 Part A | https://nces.ed.gov/ipeds/datacenter/data/EF2023A.zip | **Downloaded** |
| IPEDS EF2023 Part C | https://nces.ed.gov/ipeds/datacenter/data/EF2023C.zip | **Downloaded** |
| IPEDS HD2023 (unitid check) | https://nces.ed.gov/ipeds/datacenter/data/HD2023.zip | **Downloaded** |
| Harvard OIRA enrollment | https://oira.harvard.edu/factbook/fact-book-enrollment/ | **Manual** official |
| MIT Facts enrollment | https://web.mit.edu/facts/enrollment.html | **Manual** official |
| Boston University CDS 2024–25 | https://www.bu.edu/asir/files/2026/04/CDS_2024_25-updated-sect-I.pdf | **Manual** official |
| Northeastern accomplishments datasheet | https://accomplishments.northeastern.edu/wp-content/uploads/2025/03/IAC_24_DATASHEET_03.14.25.pdf | **Manual** official |
| Tufts CDS 2024–25 | https://provost.tufts.edu/institutionalresearch/wp-content/uploads/sites/5/CDS_2024-2025-1.pdf | **Manual** official |
| Boston College Fact Book 2024–25 | https://www.bc.edu/content/dam/bc1/offices/irp/ir/factbook/factbook_pdfs/FINAL%20FactBook%202024-25.pdf | **Manual** official |
| UMass Boston Fast Facts Fall 2024 | https://www.umb.edu/media/umassboston/editor-uploads/institutional-research-assessment-planning/Fast-Facts-Fall-2024.pdf | **Manual** official |
| Processed output | `data/section_03/processed/greater_boston_ecosystem_enrollment_v1.csv` → `website/data/greater_boston_ecosystem_enrollment.csv` | Built |
| Builder | `data/scripts/build_section_03_ecosystem_totals.py` | — |

### Section 04A / 04C — Neighborhood heatmaps (Layers A, B, C)

| Source | URL | Method |
|--------|-----|--------|
| BPDA neighborhood boundaries (dataset) | https://data.boston.gov/dataset/bpda-neighborhood-boundaries | **Downloaded** |
| BPDA neighborhood boundaries (GeoJSON) | https://data.boston.gov/dataset/bf1a7b50-4c72-4637-b0fa-11d632e3aff1/resource/e5849875-a6f6-4c9c-9d8a-5048b0fbd03e/download/boston_neighborhood_boundaries.geojson | **Downloaded** |
| 2025 Boston population estimates (dataset) | https://data.boston.gov/dataset/2025-boston-population-estimates-neighborhood-level | **Downloaded** |
| 2025 Boston population estimates (CSV) | https://data.boston.gov/dataset/d2ece0af-e0ad-42e4-b280-bd0aa1561ed0/resource/b0543358-d03f-4682-bf0c-658ea4573d6f/download/boston_population_estimates_2025_neighborhood_level.csv | **Downloaded** |
| OpenStreetMap | https://www.openstreetmap.org/ | **API fetch** (Layer B) |
| Overpass API | https://overpass-api.de/api/interpreter · https://overpass.kumi.systems/api/interpreter | **API fetch** |
| U.S. Census ACS program | https://www.census.gov/programs-surveys/acs | Reference |
| ACS 5-year API (optional rent) | https://api.census.gov/data/2022/acs/acs5 | **API fetch** (optional; needs key) |
| Census API key signup | https://api.census.gov/data/key_signup.html | — |
| Census place geography (reference) | https://www.census.gov/geographies/reference-files.html | Reference |
| Zillow ZORI (future) | https://www.zillow.com/research/data/ | **Documented** |
| Boston income-restricted housing (future) | https://data.boston.gov/dataset/income-restricted-housing-inventory | **Documented** |
| Processed files | `data/section_04/processed/greater_boston_geography_v1.csv`, `layer_a_housing_pressure_v1.csv`, `layer_b_business_density_v1.csv`, `layer_c_innovation_workforce_v1.csv` | Built |
| Builders | `build_section_04_geography.py`, `build_section_04_housing_layer.py`, `build_section_04_innovation_layer.py`, `build_section_04_business_osm.py` | — |

### Section 04B — Business & social ecosystem constellation

| Source | URL | Method |
|--------|-----|--------|
| OpenStreetMap | https://www.openstreetmap.org/ | **API fetch** |
| Overpass API | https://overpass-api.de/api/interpreter · https://overpass.kumi.systems/api/interpreter | **API fetch** |
| MIT Events iCal | https://engage.mit.edu/ical/mit/ical_mit.ics | **Downloaded** (cached in `raw/activity/feeds/`) |
| Corridor registry (bboxes, keywords) | `data/section_04/raw/activity/corridor_registry.json` | **Curated** |
| Hub layout / tiers | `website/js/section-04/04b/config.js` | **Curated** |
| Meetup: Boston New Technology | https://www.meetup.com/Boston-New-Technology/ | **Documented** |
| Meetup: Boston Startup Cofounders | https://www.meetup.com/Boston-Startup-Cofounders/ | **Documented** |
| Meetup: Boston Product Management | https://www.meetup.com/Boston-Product-Management/ | **Documented** |
| Harvard Events iCal | https://events.harvard.edu/ | **Blocked** (403 in v1) |
| Eventbrite Platform API | https://www.eventbrite.com/platform/api/ | **Not used** (token) |
| Processed files | `layer_b_corridor_osm_v1.csv`, `layer_b_ecosystem_activity_v1.csv`, `activity_evidence_v1.json` | Built |
| Website copies | `website/data/section_04b_corridor_osm.csv`, `website/data/section_04b_ecosystem_activity.csv` | Published |
| Builders | `build_section_04_corridor_osm.py`, `build_section_04b_activity_from_sources.py` | — |

### Section 05 — The Academic Economy (planned · validation gate)

| Source | URL | Method |
|--------|-----|--------|
| IPEDS Finance F1A (public) | https://nces.ed.gov/ipeds/datacenter/data/F2022F1A.zip | **Downloaded** (pending) |
| IPEDS Finance F2 (private) | https://nces.ed.gov/ipeds/datacenter/data/F2022F2.zip | **Downloaded** (pending) |
| IPEDS HD2022 | https://nces.ed.gov/ipeds/datacenter/data/HD2022.zip | **Downloaded** (pending) |
| Hero metric | Total operating expenses (29 schools; display 7 + others) | IPEDS — see DS-08 |
| D3 Sankey / lanes | `website/data/section_05_*.csv` | Built after validation |
| Spec | `data/section_05/SECTION_05_DATA_COLLECTION_PLAN.md` | — |

### Cross-cutting / validation (planned)

| Source | URL | Method |
|--------|-----|--------|
| IPEDS Institutional Directory | https://nces.ed.gov/ipeds/datacenter/InstitutionalCharacteristics/ | Planned |
| MA DESE profiles | https://profiles.doe.mass.edu/ | Planned |
| U.S. Census Geocoder | https://geocoding.geo.census.gov/geocoder/ | Planned |
| CMS Hospital Compare | https://data.cms.gov/ | Planned |

### Not data sources (website only)

| Asset | Notes |
|-------|--------|
| `website/assets/mit-scholar-cap.png` | Project / course visual — landing hero |
| `references/*.pdf` | Design references only — not loaded as data |

---

## Project reference materials (not datasets)

PDFs in `references/` inform design and methodology; they are **not** loaded into the website as data.

| File | Role |
|------|------|
| `references/reference_boston_crime_project.pdf` | Storytelling site reference |
| `references/reference_latino_migration_project.pdf` | Scroll-narrative reference |
| `references/reference_women_business_project.pdf` | Visualization style reference |
| `references/cs617_lecture_reference.pdf` | Course requirements |

---

## Website assets (non-tabular)

| Asset | Source | Used for |
|-------|--------|----------|
| `website/assets/mit-scholar-cap.png` | Project / course visual | Landing hero |

---

## Maintenance checklist

When adding a new dataset:

1. Add a row to **Quick index** and a new `DS-##` section using the table template below.
2. Add or update a section-specific doc (e.g. `ENROLLMENT_DATA_SOURCES.md`) if field-level detail is needed.
3. Note **access date** (ISO `YYYY-MM-DD`) for the version you downloaded or built.
4. Record **missing / partial** fields explicitly — do not impute without documenting.
5. Copy published CSV to `website/data/` when the section goes live.
6. Add suggested citation language for the final report.

### Template for new entries

```markdown
## DS-XX: [Short title]

| Field | Value |
|-------|--------|
| **Source name** | |
| **Website URL** | |
| **Dataset / report name** | |
| **Used for** | |
| **Years covered** | |
| **Entities included** | |
| **Access date** | |
| **Missing / partial data** | |

**Suggested citation:**  
*…*
```

---

## Changelog

| Date | Change |
|------|--------|
| 2026-05-20 | Created `DATA_REFERENCES.md`; indexed DS-01 (map seed), DS-02 (IPEDS enrollment v1), DS-03 (OSM tiles), DS-04 (planned sources) |
| 2026-05-20 | Section 02 enrollment documented; see also existing `ENROLLMENT_DATA_SOURCES.md` |
| 2026-05-21 | Section 02 Plotly timeline implemented on site (`#enrollment-trends`, metric toggles) |
| 2026-05-21 | Section 04 v1 datasets: geography + Layer A/C + Layer B OSM (104 rows) |
| 2026-05-20 | Section 03 v1 refresh: mixed 2023–2025 official sources (235,824 ecosystem total) |
| 2026-05-21 | DS-07 Section 04B (OSM corridors + MIT iCal activity); **Complete sources appendix** with all URLs and collection methods |
| 2026-05-21 | DS-08 Section 05 planned; architecture locked; data spec + validation checklist; 04C renamed Innovation Workforce on site |
