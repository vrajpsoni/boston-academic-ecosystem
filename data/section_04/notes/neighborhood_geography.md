# Section 04 — Geography notes

## Boston neighborhoods (v1)

- **Source:** Analyze Boston / BPDA Neighborhood Boundaries GeoJSON (26 features in download; plan documents 23 “official” planning neighborhoods — use downloaded file as authoritative for this project).
- **Not legal boundaries:** Dataset disclaimer states these are planning/visualization boundaries, not legal neighborhood limits.
- **Join key:** `geo_id` = `bos_nbhd_{neighborhood_id}` from source `neighborhood_id` field.

## Adjacent municipalities

Eight **Census places** are included with reference centroids for future ACS place-level pulls:

Cambridge, Somerville, Brookline, Medford, Quincy, Chelsea, Everett, Malden.

`geo_type=census_place` rows are **not** included in Layer A/B/C v1 metrics until place-level or tract crosswalk data is collected.

## Future crosswalk

| Task | Purpose |
|------|---------|
| Tract ↔ Boston neighborhood | Assign ACS B25064 median rent to planning neighborhoods |
| OSM points ↔ polygon | Replace bbox counts with point-in-polygon for Layer B |
| Cambridge/Somerville boundaries | Extend geography spine beyond Boston GIS |

## Greater Boston bbox (reference for OSM)

Approximate south, west, north, east: `42.22, -71.19, 42.42, -70.99` (not stored as official boundary).
