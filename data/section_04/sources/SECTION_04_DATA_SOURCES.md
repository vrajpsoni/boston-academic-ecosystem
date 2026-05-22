# Section 04 — Data Sources & Attribution

> **Master citation index (all website sections + URLs):** [`../../DATA_REFERENCES.md`](../../DATA_REFERENCES.md) — see [Complete sources appendix](../../DATA_REFERENCES.md#complete-sources-appendix-all-links) and [DS-07](../../DATA_REFERENCES.md#ds-07-section-04b-business--social-ecosystem-constellation).

**Access date (v1):** 2026-05-20  
**Scope:** Greater Boston neighborhood-level indicators for three modular heatmap layers + Section 04B constellation.

**Section 04A audit (Student-Centered Neighborhoods / Layer A):** see [`SECTION_04A_DATA_AUDIT.md`](SECTION_04A_DATA_AUDIT.md).

---

## Source registry

| ID | Name | URL | Used in layer |
|----|------|-----|----------------|
| SRC-BOS-NBHD-GEOJSON | BPDA / Analyze Boston Neighborhood Boundaries | [data.boston.gov dataset](https://data.boston.gov/dataset/bpda-neighborhood-boundaries) · [GeoJSON download](https://data.boston.gov/dataset/bf1a7b50-4c72-4637-b0fa-11d632e3aff1/resource/e5849875-a6f6-4c9c-9d8a-5048b0fbd03e/download/boston_neighborhood_boundaries.geojson) | Geography spine |
| SRC-BOS-POP-2025 | 2025 Boston Population Estimates (Neighborhood Level) | [data.boston.gov](https://data.boston.gov/dataset/2025-boston-population-estimates-neighborhood-level) · [CSV](https://data.boston.gov/dataset/d2ece0af-e0ad-42e4-b280-bd0aa1561ed0/resource/b0543358-d03f-4682-bf0c-658ea4573d6f/download/boston_population_estimates_2025_neighborhood_level.csv) | Layer A + C (ACS rollups) |
| SRC-OSM-OVERPASS | OpenStreetMap via Overpass API | https://www.openstreetmap.org/ · https://overpass-api.de/ | Layer B |
| SRC-ACS-2022-5YR | U.S. Census ACS 5-Year Estimates | https://www.census.gov/programs-surveys/acs · https://api.census.gov/data/2022/acs/acs5 | Optional tract rent (`build_section_04_census_acs.py`) |
| SRC-CENSUS-PLACE-REF | Census Bureau place geography (reference) | https://www.census.gov/geographies/reference-files.html | Adjacent city centroids in geography spine |
| SRC-ZILLOW-ZORI | Zillow Observed Rent Index (documented, not downloaded v1) | https://www.zillow.com/research/data/ | Future Layer A supplement |
| SRC-BOS-IRHI | Boston Income-Restricted Housing Inventory | https://data.boston.gov/dataset/income-restricted-housing-inventory | Future Layer A supplement |

---

## Layer A — Housing / student pressure

**File:** `processed/layer_a_housing_pressure_v1.csv`

| Metric | Definition | Source field / notes |
|--------|------------|----------------------|
| `total_population` | ACS B01001 total | `population_b01001_001e` |
| `population_age_20_24` | Ages 20–24 count | male + female 20–24 fields |
| `population_age_20_24_share` | 20–24 / total population | Derived; **proxy** for student-age concentration, not enrollment |
| `avg_household_size` | Average household size | `housing_avehhsize` |
| `income_restricted_housing_units_2024` | Affordable/IRH inventory count | `housing_housingmaster_2024` |
| `poverty_population_count` | Population below poverty | `income_b17001_002e` |

**Gaps (v1):** Median gross rent (ACS B25064) not in Boston 2025 file — use `build_section_04_census_acs.py` at tract level, then crosswalk to neighborhoods.

---

## Layer B — Business / social density

**File:** `processed/layer_b_business_density_v1.csv`

| Metric | OSM tags | Method |
|--------|----------|--------|
| `osm_cafe_count` | `amenity=cafe`, `amenity=coffee_shop` | Overpass `out count` in neighborhood bbox |
| `osm_restaurant_count` | `amenity=restaurant`, `amenity=fast_food` | Same |
| `osm_bookstore_count` | `shop=books` | Same |
| `osm_coworking_count` | `amenity=coworking_space`, `office=coworking` | Same |

**Limitations:** Bbox counts approximate polygon counts; Cambridge/Somerville POIs require separate municipal pulls (v2). Yelp/Google not used (licensing).

**Build:** `python3 data/scripts/build_section_04_business_osm.py` (~3–5 min, rate limits).

### Section 04B — Corridor OSM (Cambridge / adjacent)

**File:** `processed/layer_b_corridor_osm_v1.csv` · website copy: `website/data/section_04b_corridor_osm.csv`

| Metric | Method |
|--------|--------|
| Same four POI categories + `osm_social_poi_total` | Overpass nodes assigned to curated academic-corridor bounding boxes (Harvard Square, Kendall/MIT, Cambridge Central, Porter Square) |

**Build:** `python3 data/scripts/build_section_04_corridor_osm.py`

### Section 04B — Ecosystem activity signals (curated)

**Files:** `raw/activity/ecosystem_activity_highlights.csv` · `processed/layer_b_ecosystem_activity_v1.csv` · `website/data/section_04b_ecosystem_activity.csv`

| Field | Description |
|-------|-------------|
| `signal_innovation` | Startup / innovation programming intensity (low → high) |
| `signal_student_events` | University & student-life event density |
| `signal_meetups` | Networking / community meetup signal |
| `signal_cultural` | Cultural & festival activity |
| `highlight_1`, `highlight_2` | Curated examples with named public sources (calendars, BIDs, civic listings) |
| `activity_index` | Derived 0–1 pulse score for subtle visual emphasis |

**Not used:** Live Meetup/Eventbrite API feeds (reproducibility / GitHub Pages stability).

**Build:** `python3 data/scripts/build_section_04b_activity_from_sources.py` (see [`SECTION_04B_ACTIVITY_METHODOLOGY.md`](SECTION_04B_ACTIVITY_METHODOLOGY.md))

---

## Layer C — Innovation / workforce

**File:** `processed/layer_c_innovation_workforce_v1.csv`

| Metric | Source field | Notes |
|--------|--------------|-------|
| `education_bachelors_count` | `education_b15003_022e` | Bachelor's degree holders |
| `education_bachelors_share` | Derived | Share of population 25+ with education universe |
| `education_grad_prof_count` | `education_b15003_gradprofdegree` | Graduate/professional |
| `commute_public_transit_count` | `labor_b08301_019e` | Transit commuters |
| `commute_public_transit_share` | Derived | Share of workers commuting |
| `commute_bike_other_count` | `labor_b08301_taxi_motorcycle_bicycle_other` | Non-car commute proxy |
| `employment_management_professional_count` | `labor_c24010_063e` | Knowledge-work proxy |
| `employment_management_professional_share` | Derived | |

**Gaps:** Startup density has no standard public neighborhood time series — document Mass. innovation reports separately before adding.

---

## Raw files (v1)

| Path | Description |
|------|-------------|
| `raw/geography/boston_neighborhood_boundaries.geojson` | 26 Boston neighborhoods |
| `raw/housing/boston_population_estimates_2025_neighborhood.csv` | ACS + housing + labor bundle |
| `raw/business/osm_neighborhood_counts_log.json` | Overpass run log (after script) |

---

## Suggested citations

- *City of Boston, Analyze Boston, BPDA Neighborhood Boundaries (GeoJSON), accessed 2026-05-20.*
- *City of Boston, 2025 Boston Population Estimates (Neighborhood Level), accessed 2026-05-20.*
- *OpenStreetMap contributors, data via Overpass API, ODbL.*
- *U.S. Census Bureau, American Community Survey 5-Year Estimates (when tract file used).*
