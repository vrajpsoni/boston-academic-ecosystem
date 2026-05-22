# Section 04 — Processing log

| Date | Action | Output |
|------|--------|--------|
| 2026-05-20 | Downloaded BPDA neighborhood GeoJSON | `raw/geography/boston_neighborhood_boundaries.geojson` |
| 2026-05-20 | Downloaded 2025 Boston neighborhood population / ACS bundle CSV | `raw/housing/boston_population_estimates_2025_neighborhood.csv` |
| 2026-05-20 | Built geography spine (26 Boston + 8 places) | `processed/greater_boston_geography_v1.csv` |
| 2026-05-20 | Extracted Layer A metrics (Boston neighborhoods) | `processed/layer_a_housing_pressure_v1.csv` (138 rows) |
| 2026-05-20 | Extracted Layer C metrics (Boston neighborhoods) | `processed/layer_c_innovation_workforce_v1.csv` (184 rows) |
| 2026-05-20 | Layer B OSM (4 city-wide queries + point-in-polygon) | `processed/layer_b_business_density_v1.csv` (104 rows) |
| 2026-05-22 | 04A spillover: OSM boundaries + ACS B01001 for Cambridge, Somerville, Chelsea, Revere, Medford | `processed/student_ecosystem_boundaries.geojson`, `raw/housing/adjacent_places_acs_b01001_v1.json`, Layer A +15 rows |
| Pending | ACS tract rent via Census API | Requires `CENSUS_API_KEY` |
| Pending | Income-Restricted Housing Inventory CSV | Documented in sources |
| Pending | Zillow ZORI neighborhood rent trends | Manual download |
