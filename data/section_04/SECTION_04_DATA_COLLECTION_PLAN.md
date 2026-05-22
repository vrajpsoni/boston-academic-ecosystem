# Section 04 — Neighborhood Data Collection Plan

**Status:** v1 data layers complete for Boston neighborhoods (Layers A, B, C + geography spine). Optional supplements pending (ACS tract rent, Zillow, IRHI). No visualizations yet.  
**Story goal:** How Boston’s student ecosystem extends beyond campuses into neighborhoods — housing pressure, business/social density, innovation/workforce growth.  
**Access date (v1 build):** 2026-05-20

---

## Design principles

1. **Source-backed only** — no invented rankings or manual “top neighborhoods” lists.
2. **Collect broad signals first** — neighborhood inclusion for storytelling is decided later from data, not assumptions.
3. **Modular layers** — three separate heatmap-ready datasets (not one merged mega-table).
4. **Shared geography spine** — every layer uses the same `geo_id` keys for joins and future Leaflet overlays.

---

## Geographic scope

**In scope:** Greater Boston academic/student-influenced area — Boston neighborhoods (official BPDA boundaries), plus adjacent cities/towns: Cambridge, Somerville, Brookline, Medford, Quincy, and nearby Boston neighborhoods (Allston, Brighton, Fenway, Mission Hill, Jamaica Plain, Roxbury, Dorchester, Longwood, Seaport, etc. via Boston GIS).

**Out of scope:** Worcester, Lowell, Springfield, Cape Cod, and other MA regions unrelated to the metro academic ecosystem.

**Primary geography units (v1):**

| `geo_type` | Source | Use |
|------------|--------|-----|
| `boston_neighborhood` | Analyze Boston / BPDA boundaries GeoJSON | Housing, business, innovation layers for Boston proper |
| `census_place` | U.S. Census Bureau ACS (place level) | Adjacent cities when tract crosswalk pending |
| `census_tract` | ACS 5-year + TIGER (future) | Fine-grain heatmaps after tract↔neighborhood join |

---

## Folder structure

```
data/section_04/
├── SECTION_04_DATA_COLLECTION_PLAN.md   (this file)
├── sources/
│   └── SECTION_04_DATA_SOURCES.md       (citations, URLs, access dates)
├── notes/
│   ├── neighborhood_geography.md
│   └── processing_log.md
├── raw/
│   ├── geography/                       # boundaries, official lists
│   ├── housing/                         # rent, ACS, Boston open data
│   ├── business/                        # OSM exports, API responses
│   └── innovation/                      # workforce, startups, economic
└── processed/
    ├── greater_boston_geography_v1.csv
    ├── layer_a_housing_pressure_v1.csv
    ├── layer_b_business_density_v1.csv
    └── layer_c_innovation_workforce_v1.csv
```

---

## Layer A — Housing / rent / student pressure

**Heatmap story:** Student-heavy living patterns and rental/housing pressure near academic ecosystems.

| Metric (examples) | Source | Status v1 |
|-------------------|--------|-----------|
| Population & age 20–24 share | Boston 2025 neighborhood estimates (ACS-derived) | ✅ Extracted for Boston |
| Avg household size | Same file (`housing_avehhsize`) | ✅ |
| Income distribution / poverty | ACS fields in same file | ✅ |
| Income-restricted / affordable units | Boston IRHI (pending download) | 📋 Documented |
| Median gross rent | ACS B25064 (tract/place) | 📋 Requires `CENSUS_API_KEY` |
| Zillow rent index | Zillow Research ZORI | 📋 Manual download documented |

**Output:** `processed/layer_a_housing_pressure_v1.csv`  
**Grain:** One row per `geo_id` × `metric_key` × `year` (long/tidy for heatmap weighting).

---

## Layer B — Business / social ecosystem

**Heatmap story:** Cafes, restaurants, bookstores, coworking — social activity around student areas.

| Category | OSM tags | Source |
|----------|----------|--------|
| Cafes | `amenity=cafe`, `amenity=coffee_shop` | OpenStreetMap / Overpass |
| Restaurants | `amenity=restaurant`, `amenity=fast_food` | OSM |
| Bookstores | `shop=books` | OSM |
| Coworking | `amenity=coworking_space`, `office=coworking` | OSM |

**Method:** Point-in-polygon count against Boston neighborhood boundaries; municipal bbox aggregates for Cambridge/Somerville/Brookline (v1).

**Output:** `processed/layer_b_business_density_v1.csv`  
**Script:** `data/scripts/build_section_04_business_osm.py` (run locally; Overpass may rate-limit).

---

## Layer C — Innovation / workforce growth

**Heatmap story:** Economic activity, commuting, education attainment, innovation corridors.

| Metric | Source | Status v1 |
|--------|--------|-----------|
| Bachelor’s+ share | ACS `education_b15003_*` in Boston estimates | ✅ Boston |
| Commute by transit / bicycle | ACS `labor_b08301_*` | ✅ Boston |
| Industry / occupation mix | ACS `labor_c240*` | ✅ Boston |
| Startup density | No single public neighborhood API | 📋 Document MassCEC, Crunchbase gaps |
| Median earnings | ACS B20017 (place/tract) | 📋 Census API |

**Output:** `processed/layer_c_innovation_workforce_v1.csv`

---

## Build commands

```bash
cd /path/to/Proposal
python3 data/scripts/build_section_04_geography.py
python3 data/scripts/build_section_04_housing_layer.py
python3 data/scripts/build_section_04_innovation_layer.py

# Optional — requires network + patience (Overpass rate limits)
python3 data/scripts/build_section_04_business_osm.py

# Optional — Census ACS tract/place rent & income (free API key)
export CENSUS_API_KEY=your_key_here
python3 data/scripts/build_section_04_census_acs.py
```

---

## QA checklist (before Section 04 maps)

- [ ] Every processed row has `source_id`, `source_url`, `access_date`
- [ ] `geo_id` exists in `greater_boston_geography_v1.csv`
- [ ] No manual “scores” or composite indices without documented formula
- [ ] Raw files preserved under `raw/`
- [ ] Missing metrics documented in `sources/SECTION_04_DATA_SOURCES.md`

---

## What we are NOT doing yet

- Leaflet heatmap layers
- Plotly choropleths
- Website Section 04 HTML/CSS
- Combining layers into one visualization file
