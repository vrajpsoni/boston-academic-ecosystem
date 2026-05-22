# Section 05 — Implementation Architecture (D3)

**Status:** MVP Acts I–III live · Acts IV–V editorial shells  
**Data:** `website/data/section_05_*.csv` (from validated IPEDS F2122 build)

## Module map

| File | Responsibility |
|------|----------------|
| `js/section-05/config.js` | Anchor UNITIDs, colors, act IDs, data paths |
| `js/section-05/data-loader.js` | Papa.parse → `scale`, `flows` |
| `js/section-05/format.js` | `$B` / `$M` formatting, tabular nums |
| `js/section-05/hero.js` | Act I count-up hero |
| `js/section-05/sankey.js` | Act II D3 sankey (source → 8 institutions) |
| `js/section-05/lanes.js` | Act III depth lanes + hover detail |
| `js/section-05/scroll-acts.js` | IntersectionObserver act progression |
| `js/section-05/init.js` | Lazy init on `#academic-economy` |
| `js/sections/section-05-academic-economy.js` | Export `initAcademicEconomySection` |
| `css/section-05-academic-economy.css` | Dark editorial tokens, act layout, typography |

## 5-act scroll choreography

| Act | DOM | Viz | Motion |
|-----|-----|-----|--------|
| I Scale | `#econ-act-1` | Hero `$17.94B` | Count-up once on enter |
| II Circulation | `#econ-act-2` | Sankey ecosystem → institutions | Fade paths on enter; no loop |
| III Anchors | `#econ-act-3` | Horizontal lanes + breakdown | Hover highlights Sankey node |
| IV Students | `#econ-act-4` | Prose + link to §02/§03 | Reveal only (Phase 2 data) |
| V Spillover | `#econ-act-5` | Prose + link to §04C | Reveal only (Phase 2 data) |

## Sankey design (intentionally restrained)

- **One diagram**, three columns: source (1) → institutions (8) → *no third column in MVP*  
- Third column (functional sinks) deferred to **lanes** in Act III to avoid 40+ ribbons  
- Node order: anchors sorted by `total_operating_expenses_usd` descending  
- Harvard / MIT receive distinct accent strokes; others share cool blue  

## Libraries

- D3 v7 + d3-sankey 0.12 (CDN, GitHub Pages safe)  
- PapaParse (existing)  

## Rebuild data

```bash
python3 data/scripts/build_section_05_financial_model.py
cp data/section_05/processed/*_v1.csv website/data/section_05_*.csv  # rename per config
```
