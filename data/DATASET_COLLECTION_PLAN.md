# Greater Boston Academic Ecosystem Map — Dataset Collection Plan (v1)

**Status:** Preliminary dataset seeded; coordinates require OSM/IPEDS validation before map build.  
**Story focus:** Boston as a **student and academic ecosystem** — not corporate biotech or private industry offices.  
**Target size:** 80–150 pins | **Current seed file:** `greater_boston_academic_ecosystem_v1.csv` (**87 rows**, v1 seed coordinates)

---

## 1. Preliminary institution list (by category)

See **`greater_boston_academic_ecosystem_v1.csv`** for the full seed list with cities and coordinates.

### Universities (4-year & major graduate institutions)

| Name | City | Story note |
|------|------|------------|
| Harvard University (Cambridge campus) | Cambridge | Anchor of Kendall/Harvard Sq. ecosystem |
| Massachusetts Institute of Technology | Cambridge | Kendall innovation corridor |
| Boston University | Boston | Charles River / Fenway footprint |
| Northeastern University | Boston | Co-op city, Mission Hill adjacency |
| Boston College | Brookline | Chestnut Hill / Brookline border |
| Tufts University | Medford/Somerville | Adjacent “nearby” hub (not distant MA) |
| UMass Boston | Boston | Dorchester waterfront public flagship |
| Suffolk University | Boston | Downtown / Beacon Hill student presence |
| Emerson College | Boston | Theatre/media downtown |
| Berklee College of Music | Boston | Back Bay creative cluster |
| Wentworth Institute of Technology | Boston | Fenway tech corridor |
| Simmons University | Boston | Longwood-adjacent women's U |
| MCPHS University | Boston | Longwood health sciences |
| Lesley University | Cambridge | Porter Square education cluster |
| Emerson / Suffolk — already listed | | |
| Massachusetts College of Art and Design | Boston | Fenway arts |
| New England Conservatory | Boston | Huntington Ave arts |
| Fisher College | Boston | Back Bay |
| Emmanuel College | Boston | Fenway |
| Hult International Business School | Cambridge | Graduate business |
| Eastern Nazarene College | Quincy | South Shore faith-based U |
| Harvard Medical School | Boston | Longwood anchor |
| Harvard T.H. Chan School of Public Health | Boston | Longwood |
| Harvard Business School | Boston | Allston/Brighton |
| Harvard John A. Paulson School of Engineering (SEAS) | Boston | Allston |
| BU School of Medicine | Boston | South End / Medical Campus |
| Tufts University School of Medicine | Boston | Chinatown / Tufts med |

### Colleges (community & specialty)

| Name | City |
|------|------|
| Bunker Hill Community College | Boston (Charlestown) |
| Roxbury Community College | Boston |
| Benjamin Franklin Institute of Technology | Boston |
| Quincy College | Quincy |
| Cambridge College | Cambridge |
| Laboure College of Healthcare | Boston (Longwood area) |

### Student housing / dorm zones (area pins, not every dorm)

| Zone label | City | Story note |
|------------|------|------------|
| Allston–Brighton student housing (BU west campus) | Boston | Iconic “student village” |
| Kenmore / Fenway student housing corridor | Boston | BU, MCPHS, Simmons, Berklee |
| Mission Hill student neighborhood | Boston | NE, MCPHS, Longwood access |
| Longwood student housing & med-student zone | Boston | HMS, MCPHS, Simmons |
| Northeastern West Village / campus housing | Boston | Dense NE footprint |
| Back Bay / Bay Village student rentals | Boston | Suffolk, Berklee, Emerson overflow |
| Cambridgeport / MIT-adjacent housing | Cambridge | MIT grad undergrad spillover |
| Harvard Square / Harvard housing area | Cambridge | Central Square to Yard |
| Porter / Lesley student housing area | Cambridge | Lesley corridor |
| Coolidge Corner / BC student area | Brookline | Boston College spillover |
| Davis Square / Tufts-adjacent housing | Somerville | Tufts community edge |
| Quincy Center student / commuter zone | Quincy | Quincy College, ENC |
| South End BU Medical campus housing | Boston | Med students |
| Chinatown / Tufts Medical student area | Boston | Tufts Med |

### Research institutes

| Name | City |
|------|------|
| Broad Institute of MIT and Harvard | Cambridge |
| Whitehead Institute for Biomedical Research | Cambridge |
| Koch Institute for Integrative Cancer Research (MIT) | Cambridge |
| McGovern Institute for Brain Research (MIT) | Cambridge |
| Wyss Institute for Biologically Inspired Engineering | Boston |
| Ragon Institute of MGH, MIT and Harvard | Cambridge |
| Dana-Farber Cancer Institute (research) | Boston |
| Joslin Diabetes Center | Boston |
| Schepens Eye Research Institute (part of Mass Eye and Ear) | Boston |
| Boston University NEIDL (National Emerging Infectious Diseases Laboratories) | Boston |
| MIT Computer Science and Artificial Intelligence Laboratory (CSAIL) | Cambridge |
| Harvard Stem Cell Institute (admin / Longwood affiliated) | Boston |

### Medical / research centers (hospitals & major clinical campuses)

| Name | City |
|------|------|
| Massachusetts General Hospital | Boston |
| Brigham and Women's Hospital | Boston |
| Beth Israel Deaconess Medical Center | Boston |
| Boston Medical Center | Boston |
| Boston Children's Hospital | Boston |
| Dana-Farber Cancer Institute | Boston |
| VA Boston Healthcare System (Jamaica Plain campus) | Boston |
| Spaulding Rehabilitation Hospital | Boston (Charlestown) |
| Mount Auburn Hospital (teaching/research) | Cambridge |
| Cambridge Health Alliance | Cambridge |
| Steward Carney Hospital (Tufts teaching) | Boston |

---

## 2. Geographic focus

**In scope cities:** Boston, Cambridge, Somerville, Brookline, Quincy  

**Nearby student-centered areas (included):**  
Allston, Brighton, Fenway, Kenmore, Longwood, Mission Hill, South End, Charlestown (BHCC), Dorchester (UMass Boston), Chestnut Hill, Coolidge Corner, Davis Square, Porter Square, Kendall Square, Harvard Square, Cambridgeport, Wollaston (Quincy), Medford border (Tufts only)

**Out of scope:** Worcester, Lowell, Amherst, Springfield, western MA, Rhode Island, NH border schools except as noted.

**Map viewport vs pins:** Display wider Massachusetts in Leaflet; **pins only** in Greater Boston bbox (~42.23–42.40°N, ~-71.20–-70.95°W).

---

## 3. Best sources (names, lat/lon, categories)

| Need | Primary source | Backup | Why |
|------|----------------|--------|-----|
| **Names (higher ed)** | [NCES IPEDS](https://nces.ed.gov/ipeds/) Institutional Directory | Official university websites | Authoritative; cite `unitid` |
| **Names (colleges)** | IPEDS + [MA DESE profiles](https://profiles.doe.mass.edu/) | — | Community colleges in IPEDS |
| **Names (hospitals/institutes)** | Curated list + [CMS hospital compare](https://data.cms.gov/) / official sites | Wikidata | OSM tags inconsistent for hospitals |
| **Lat/lon (bulk)** | [OpenStreetMap Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API) | — | Coordinates on nodes; filter by bbox |
| **Lat/lon (addresses)** | [US Census Geocoder](https://geocoding.geo.census.gov/geocoder/) | OSM Nominatim | Free; batch-friendly for IPEDS addresses |
| **Lat/lon (flagship QA)** | Manual check on [openstreetmap.org](https://www.openstreetmap.org/) | Wikidata coordinates | 10–15 anchor institutions |
| **Categories** | **Project taxonomy** (below) mapped from OSM tags + manual rules | IPEDS `sector`, `level` | Single legend for storytelling; **drop corporate `office=*` POIs** |
| **Student housing zones** | Curated neighborhood centroids | OSM `building=dormitory` clusters (optional) | Areas tell story better than 200 dorm pins |
| **Exclude K–12** | Do not import CCD/DESE for this layer | — | Per PROJECT_MEMORY |

**Recommended collection pipeline (next step, not website code):**

1. Export Overpass results → `data/raw/osm_education_pois.json`  
2. Filter IPEDS institutions in scope cities → `data/raw/ipeds_greater_boston.csv`  
3. Merge seed file (`v1.csv`) with OSM by name + distance (<200 m)  
4. Geocode unmatched rows via Census  
5. Set `geocode_quality` and `source` columns  
6. QA dedupe → final `greater_boston_academic_ecosystem.csv`

---

## 4. CSV schema — version 1 (simplest)

File: `data/greater_boston_academic_ecosystem_v1.csv`

| Column | Required | Description |
|--------|----------|-------------|
| `id` | yes | Stable slug, e.g. `bu-charles-river` |
| `name` | yes | Display name |
| `category` | yes | One of 5 enums (see §7) |
| `city` | yes | Boston, Cambridge, Somerville, Brookline, Quincy |
| `lat` | yes | WGS84 decimal |
| `lon` | yes | WGS84 decimal |
| `neighborhood` | no | e.g. Fenway, Longwood |
| `notes` | no | Story / QA note |
| `source` | yes | `curated_v1`, `osm`, `ipeds`, `census` |
| `geocode_quality` | yes | `seed`, `osm`, `census`, `manual` |
| `include_on_map` | yes | `true` / `false` |

**Deferred to v2:** `address`, `website`, `parent_org`, `enrollment`, `subcategory`, `scope_city`

---

## 5. Size management (~80–150)

| Category | v1 seed count | Max recommended |
|----------|---------------|-----------------|
| university | 34 | 35 |
| college | 5 | 10 |
| student_housing | 22 | 20 |
| research_institute | 11 | 25 |
| medical_research | 15 | 25 |
| **Total** | **87** | **115** |

Add at most ~25 rows in validation pass (missing **academic** institutes or hospitals only). **Do not** add elementary/middle schools, every dorm building, or corporate locations.

---

## 6. What we deliberately excluded

- Elementary and middle schools  
- High schools (exam schools, charters) — wrong narrative layer  
- Institutions outside Greater Boston core (Babson Wellesley, Harvard Lincoln Lab Lexington, etc.)  
- Individual dorm buildings (use **zone** pins instead)  
- Coffee shops, bookstores, generic `amenity=school` without higher-ed context  
- **Corporate biotech / pharma offices** (e.g. Moderna HQ, Pfizer offices, unrelated private biotech firms)  
- **Generic “innovation district” or startup cluster pins** that are not tied to a university, hospital, or named academic lab  
- Any location not **directly connected** to universities, student life, university-affiliated research, or academic medical centers  

### Research institutes — inclusion rule

**Include only if** the site is clearly university- or hospital-affiliated, for example:

- Broad Institute (MIT + Harvard)  
- Whitehead, Koch, McGovern (MIT)  
- Wyss, Ragon, Harvard Stem Cell (Harvard / MGH / MIT partners)  
- BU NEIDL, MIT CSAIL  
- Hospital-based research (Dana-Farber, Joslin, Schepens / Mass Eye and Ear)  

**Exclude** standalone private companies even if near Kendall Square or Longwood.

---

## 7. Pin category system (map legend)

| `category` | Label | Color (hex) | Marker |
|------------|-------|-------------|--------|
| `university` | University | `#2166AC` | circle, medium |
| `college` | College | `#4393C3` | circle, small |
| `student_housing` | Student housing zone | `#E08214` | circle, large low-opacity or ring |
| `research_institute` | Research institute | `#4DAF4A` | diamond |
| `medical_research` | Medical / research center | `#D6604D` | square |

**Interaction:** tooltip shows `name` + `category` label; optional `neighborhood` in v2.

**Attribution (for site later):** © OpenStreetMap contributors · NCES IPEDS · curated entries documented in `notes`.

---

## Section 02 — Enrollment time series (v1 complete)

**Files:**

| File | Role |
|------|------|
| `greater_boston_enrollment_v1.csv` | Canonical enrollment dataset (Plotly-ready) |
| `ENROLLMENT_DATA_SOURCES.md` | IPEDS variable definitions, gaps, attribution |
| `scripts/build_enrollment_dataset.py` | Rebuild from NCES `EF{year}A/C.zip` |
| `website/data/greater_boston_enrollment.csv` | Published copy for Section 02 charts |

**Schema:** `Year,University,Total,Domestic,International,OutOfState`

**Universities:** Harvard, MIT, Boston University, Northeastern, UMass Boston, Boston College.

**Years:** 2004–2023 annual (IPEDS EF); 2000–2003 not in machine-readable EF extracts; 2024+ when NCES releases `EF2024A`. **120 rows.**

**Source priority:** IPEDS Fall Enrollment (EF) only in v1. CDS / fact books for QA only.

**Later:** `Other Greater Boston Institutions` aggregate from remaining IPEDS unit IDs in map scope cities.

---

## 8. Next actions (data only)

- [ ] Run Overpass query; validate seed coordinates against OSM nodes  
- [ ] Attach IPEDS `unitid` to university/college rows  
- [ ] Peer review: remove duplicates within 150 m  
- [ ] Rename `v1.csv` → `greater_boston_academic_ecosystem.csv` when QA complete  
- [x] Maintain `data/DATA_REFERENCES.md` with download URLs and date accessed (master citation index)  

**Not in this phase:** Leaflet map, HTML, JavaScript, GitHub Pages deploy.
