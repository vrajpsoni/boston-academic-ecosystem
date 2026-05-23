# Boston: A Hub of Academic Excellence

**CS617 Data Visualization · Spring 2026**  
**Author:** Vraj Soni

An editorial data storytelling website exploring how Greater Boston’s universities, students, and institutions shape the city—spatially, over time, at street level, and through audited operating scale.

**Live demo: https://vrajpsoni.github.io/boston-academic-ecosystem/**

![Landing hero](website/assets/mit-scholar-cap.png)

---

## Thesis

Greater Boston is not a city that merely *contains* colleges. It is a city **structured around** academic life: campuses, enrollment growth, neighborhood concentration, corridor businesses, and billions in institutional operating expenses (IPEDS Finance—not modeled “economic impact” multipliers).

The site moves from **where** academic life appears (map) → **how headcounts grew** (lines) → **aggregate scale** (hero count) → **urban consequences** (neighborhoods, business constellation, academic economy) → a **cinematic closing** with source transparency.

---

## Narrative structure

| # | Section | Visualization / experience |
|---|---------|----------------------------|
| 0 | Landing hero | Full-viewport editorial opener |
| 1 | Greater Boston Academic Ecosystem | Interactive Leaflet point map (~87 pins) |
| 2 | Enrollment Trends | Plotly multi-line chart (6 universities, 2004–2023) |
| 3 | Ecosystem Scale | Animated total enrollment + metric cards |
| 4 | How Academic Boston Shapes the City | Three substories |
| 4a | Student-Centered Neighborhoods | Locked choropleth (age 20–24 proxy) |
| 4b | Business & Social Growth | SVG constellation + **Deep View** |
| 4c | The Academic Economy | Cinematic auto-play lane build-up + progress ring |
| — | Cinematic outro | Closing narrative + source links + credits |

**Full reviewer guide:** [`docs/PROJECT_FINAL_WALKTHROUGH.md`](docs/PROJECT_FINAL_WALKTHROUGH.md)

---

## Key interactions

- **Global:** Soft scroll reveals (fade + lift); ghost navbar after leaving hero  
- **Map:** Pan/zoom, category legend, marker tooltips, reset view  
- **Enrollment:** Metric tabs (Total / Domestic / International / Out-of-state), hover emphasis, legend toggle  
- **Scale:** Count-up hero on scroll into view  
- **Neighborhoods:** Hover tooltips; zoom locked for editorial stability  
- **Constellation:** Hub hover detail; **Enter Deep View** fullscreen (Escape to exit)  
- **Academic Economy:** Time-synced institution build (~8.7s); hover lanes for category detail after completion  
- **Nav → Sources:** Smooth scroll to outro reference area  

---

## Technologies

| Layer | Stack |
|-------|--------|
| Markup / style | HTML5, CSS3 (section modules) |
| Logic | Vanilla JavaScript (ES5-style IIFEs) |
| Maps | [Leaflet](https://leafletjs/) 1.9 + OpenStreetMap tiles |
| Charts | [Plotly](https://plotly.com/javascript/) 2.35 (Section 02) |
| Data | CSV + GeoJSON via [PapaParse](https://www.papaparse.com/) |
| Fonts | Inter (Google Fonts) |
| Hosting | Static — GitHub Pages–ready (`website/` as publish root) |

No bundler required for production.

---

## Datasets (live site)

Published copies for the browser live in **`website/data/`**. Canonical sources and rebuild scripts live in **`data/`**.

| Section | Primary file(s) | Source |
|---------|-----------------|--------|
| 01 Map | `greater_boston_academic_ecosystem.csv` | Curated ecosystem pins (OSM/IPEDS validation planned) |
| 02 Enrollment | `greater_boston_enrollment.csv` | NCES IPEDS Fall Enrollment 2004–2023 |
| 03 Scale | `greater_boston_ecosystem_enrollment.csv` | IPEDS + official fact books (29 schools) |
| 04a Neighborhoods | `student_ecosystem_boundaries.geojson`, `layer_a_housing_pressure.csv` | Analyze Boston / BPDA; Boston 2025 population |
| 04b Constellation | `section_04b_*.csv`, `layer_b_*.csv`, `layer_c_innovation_workforce.csv` | OSM Overpass; MIT iCal activity signals |
| 05 Economy | `section_05_institution_scale.csv` | NCES IPEDS Finance F2122 (`F1B25` / `F2E131`) |

**Master citations:** [`data/DATA_REFERENCES.md`](data/DATA_REFERENCES.md)

---

## Repository structure

```
├── website/              # Deploy this folder to GitHub Pages
│   ├── index.html
│   ├── css/              # Global + per-section styles
│   ├── js/               # Story engine, maps, charts, cinema
│   ├── data/             # Runtime CSV / GeoJSON
│   └── assets/           # Images (hero)
├── data/                 # Canonical data, raw inputs, build scripts
│   ├── DATA_REFERENCES.md
│   ├── scripts/          # Rebuild pipelines (Python)
│   ├── section_03/ … section_05/
│   └── raw/              # IPEDS zips, etc. (gitignored when large)
├── docs/                 # Walkthrough, architecture, project memory
├── assets/               # Pointer to website/assets + archive note
├── _archive/             # Preserved experiments & coursework (not live)
├── README.md
├── LICENSE
└── .gitignore
```

---

## Run locally

A static server is required so `fetch()` can load data files.

```bash
cd website
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080).

After editing canonical CSVs in `data/`, copy published versions into `website/data/` (see section notes in `data/DATASET_COLLECTION_PLAN.md`).

---

## Deployment

### GitHub Pages (recommended)

1. Push this repository to GitHub.  
2. **Settings → Pages → Build and deployment**  
   - Source: **GitHub Actions** (workflow included), or  
   - Source: **Deploy from branch** → set custom folder to `/website` if your Pages plan supports it.  
3. The included workflow [`.github/workflows/github-pages.yml`](.github/workflows/github-pages.yml) publishes the `website/` directory on push to `main`.

Site URL will be `https://<user>.github.io/<repo>/` (or custom domain).

### Manual

Upload the contents of `website/` to any static host (S3, Netlify, etc.). Do not upload the whole monorepo unless the host root is `website/`.

---

## Sources & reference architecture

| Need | Location |
|------|----------|
| Citations & URLs | `data/DATA_REFERENCES.md` |
| Enrollment rebuild | `data/ENROLLMENT_DATA_SOURCES.md` |
| Section 04B activity | `data/section_04/sources/SECTION_04B_ACTIVITY_METHODOLOGY.md` |
| Section 05 finance | `data/section_05/sources/SECTION_05_METHODOLOGY.md` |
| Outro link placeholders | `website/js/config.js` → `SiteConfig.sources` |
| Reviewer walkthrough | `docs/PROJECT_FINAL_WALKTHROUGH.md` |

**Navbar / outro links:** Set `href` values in `SiteConfig.sources` when the public repo and methodology URLs are final (empty `href` = placeholder, no navigation).

```javascript
// website/js/config.js (excerpt)
sources: {
  outro: {
    explore: { label: "Explore sources", href: "", external: true },
    methodology: { label: "View methodology", href: "", external: true },
    repository: { label: "Project repository", href: "", external: true },
  },
  registry: { /* DATA_REFERENCES, audits, appendices — wire when ready */ },
}
```

---

## Reproducibility (data builds)

Examples (from repo root, Python 3):

```bash
python3 data/scripts/build_enrollment_dataset.py
python3 data/scripts/build_section_03_ecosystem_totals.py
python3 data/scripts/build_section_05_financial_model.py
# Section 04: see data/section_04/notes/processing_log.md
```

Copy or symlink processed outputs into `website/data/` per `data/DATASET_COLLECTION_PLAN.md`.

---

## Screenshots (placeholders)

Add captures under `docs/screenshots/` for submissions:

| File | Content |
|------|---------|
| `01-landing-hero.png` | Landing |
| `02-ecosystem-map.png` | Section 01 map |
| `03-enrollment-chart.png` | Section 02 |
| `04-ecosystem-scale.png` | Section 03 |
| `05-neighborhoods.png` | Section 04a |
| `06-constellation.png` | Section 04b |
| `07-academic-economy.png` | Section 05 |
| `08-outro.png` | Cinematic outro |

---

## Security / publication checklist

- No API keys or `.env` files committed (see `.gitignore`)  
- Large IPEDS zips under `data/raw/` are gitignored—rebuild locally  
- Archived venv and coursework live under `_archive/`  
- Review `data/raw/` before push if you remove gitignore rules  

---

## Credits

**Boston: A Hub of Academic Excellence**  
CS617 Data Visualization · By Vraj Soni

Data: U.S. NCES IPEDS, City of Boston (Analyze Boston), OpenStreetMap contributors, and sources listed in `data/DATA_REFERENCES.md`.

Course: CS617 Data Visualization, Spring 2026.
