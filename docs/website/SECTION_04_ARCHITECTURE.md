# Section 04 — Architecture (three independent subsections)

**Parent section:** `#academic-boston` — “How Academic Boston Shapes the City”

Three separate storytelling experiences share visual language but **do not** share a combined mode/tab system.

---

## Structure

| ID | Subsection | Visualization | JS entry | CSS |
|----|------------|---------------|----------|-----|
| `#section-04a-neighborhoods` | Student-Centered Neighborhoods | Locked choropleth map (blue) | `js/section-04/04a/init.js` | `css/section-04a-neighborhoods.css` |
| `#section-04b-business` | Business & Social Growth | Full-screen immersive ecosystem constellation | `js/section-04/04b/init.js`, `constellation.js` | `css/section-04b-business.css` |
| `#section-04c-innovation` | Innovation Workforce | Matrix / grid comparison (analytical) | `js/section-04/04c/init.js` | `css/section-04c-innovation.css` |

**Orchestrator:** `js/section-04/init.js` → `initSection04()`

**Shared utilities:** `js/section-04/shared/` (GeoJSON, CSV loader, locked Leaflet map, legend, lazy init, ecosystem context for 04A)

---

## Data responsibilities

| Subsection | Dataset | Notes |
|------------|---------|-------|
| 04A | `data/layer_a_housing_pressure.csv` | Ecosystem concentration modeling (metric keys evolving; not age-only UI) |
| 04B | `data/layer_b_business_density.csv` | OSM cafe/restaurant/bookstore/coworking |
| 04C | `data/layer_c_innovation_workforce.csv` | Workforce/education metrics — **matrix only, no map** |

---

## Removed (old combined system)

- `js/heatmap/mode-controller.js`
- `js/heatmap/heatmap-config.js` (multi-mode)
- `js/sections/section-04-neighborhood-heatmap.js`
- HTML mode tabs + `neighborhood-story-panels` switching

---

## Implementation status

- **04A:** Wired (choropleth + legend + tooltips)
- **04B:** Architecture wired (separate map canvas + warm choropleth stub)
- **04C:** Architecture wired (matrix shell + data load stub)

Polish, final metrics, and full 04B/04C visuals are follow-up work.
