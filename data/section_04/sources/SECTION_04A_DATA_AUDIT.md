# Section 04A — Student-Centered Neighborhoods: Data Audit

**Audit date:** 2026-05-20  
**Visualization mode:** Layer A (`living`) — choropleth of student-centered living concentration  
**Scope:** Boston neighborhood boundaries (26 neighborhoods) plus adjacent academically connected cities (Cambridge, Somerville, Chelsea, Revere, Medford); Greater Boston ecosystem reference from Section 03

---

## Verdict

| Criterion | Status |
|-----------|--------|
| Reputable official/public sources | **Pass** — City of Boston Analyze Boston + ACS rollups |
| Metrics officially sourced | **Pass** — ACS fields documented in Boston 2025 neighborhood file |
| Proxies clearly labeled | **Pass** (v1) — age 20–24 is **not** enrollment; documented in CSV `notes` and UI |
| Reproducible pipeline | **Pass** — `build_section_04_housing_layer.py`, `build_section_04a_spillover_expansion.py` |
| Communicates real scale | **Pass with proxy** — use `population_age_20_24` counts + share of mapped Boston total; link narrative to Section 03 enrollment total |
| Newer official data | **Current for Boston** — 2025 neighborhood population estimates (ACS 5-year bundle) |

**Not available (and not required):** University-by-neighborhood student residency counts. No public municipal dataset provides this at neighborhood granularity. The approved approach uses measurable neighborhood indicators.

---

## Primary metrics (Layer A / 04A)

| Metric | Source | Official? | Role in 04A |
|--------|--------|-----------|----------------|
| `population_age_20_24` | Boston 2025 Population Estimates (`population_b01001` male/female 20–24) | Yes (ACS rollup) | **Estimated student-centered population (proxy)** — hover count |
| `population_age_20_24_share` | Derived | Yes (derived from official counts) | **Choropleth intensity** — neighborhood concentration |
| `total_population` | ACS B01001 | Yes | Context / denominator |
| `poverty_population_count` | ACS B17001 | Yes | Supporting context (optional) |
| `income_restricted_housing_units_2024` | Boston housing master field | Yes (city inventory) | Supporting; some neighborhoods show negative placeholders in source — treat as missing in UI |
| `avg_household_size` | `housing_avehhsize` in source CSV | Yes field, **suspect values** in v1 (e.g. >10 persons) — **do not use in 04A map** until validated |

---

## Ecosystem reference (Section 03)

| Metric | Value | Source |
|--------|-------|--------|
| `total_students` | 235,824 | `greater_boston_ecosystem_enrollment_v1.csv` — NCES IPEDS + institutional fact books/CDS (29 institutions, 2023–2025) |

**How 04A connects:** Hover shows each polygon’s **share of mapped age 20–24 concentration** (Boston neighborhoods + five adjacent cities). The legend cites the Section 03 enrollment total so users relate intensity to ecosystem scale without implying each 20–24 resident is an enrolled student.

---

## Geography

| Asset | Source | Notes |
|-------|--------|-------|
| `student_ecosystem_boundaries.geojson` | BPDA / Analyze Boston + OSM admin level 8 | Boston neighborhoods merged with Cambridge, Somerville, Chelsea, Revere, Medford municipal boundaries |
| `adjacent_places_acs_b01001_v1.json` | Census Reporter (ACS B01001) | Place-level age 20–24 for spillover cities; 2024 1-year (Cambridge, Somerville) or 2024 5-year where 1-year is unavailable |
| `adjacent_places_osm_overpass.json` | OpenStreetMap via Overpass | Cached municipal boundary relations |
| `layer_a_housing_supplements_v1.json` | Boston Planning ACS parent assignment | Bay Village → South End share; Leather District → Downtown share; Harbor Islands non-residential (documented proxies) |

---

## Proxy language (required in UI)

- **“Estimated student-centered population”** = ACS residents ages 20–24 in neighborhood (measurable proxy, not dorm/campus roster).
- **“% of mapped concentration”** = polygon 20–24 count ÷ sum of 20–24 counts across all mapped polygons (Boston + spillover cities).
- **“Young adult concentration”** = editorial tier (High / Moderate / Lower) from `population_age_20_24_share` tertiles on the map.

---

## Gaps & v2 opportunities

1. **Median gross rent** — not in Boston 2025 neighborhood file; optional ACS tract pull (`build_section_04_census_acs.py`) + crosswalk.
2. **Brookline / Everett / Malden** — remain in geography spine for reference; not in 04A spillover map scope.
3. **Layer B OSM** — bbox counts approximate polygon counts; reputable for relative density, not official statistics (use for Business mode only).
4. **Zillow ZORI / Boston IRHI** — documented, not in v1 choropleth.

---

## Suggested citation (04A)

*City of Boston, 2025 Boston Population Estimates (Neighborhood Level), American Community Survey rollups, accessed 2026-05-20. Neighborhood boundaries: BPDA via Analyze Boston. Greater Boston enrollment context: NCES IPEDS and institutional enrollment reports (Section 03).*
