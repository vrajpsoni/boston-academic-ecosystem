# Website (publish root)

This folder is the **GitHub Pages / static hosting root**. All paths in `index.html` are relative to here.

## Quick start

```bash
cd website
python3 -m http.server 8080
# http://localhost:8080
```

## Project documentation

See the repository root:

- [`../README.md`](../README.md) — overview, deployment, structure  
- [`../docs/PROJECT_FINAL_WALKTHROUGH.md`](../docs/PROJECT_FINAL_WALKTHROUGH.md) — full section-by-section guide  
- [`../data/DATA_REFERENCES.md`](../data/DATA_REFERENCES.md) — citations  

## Data sync

Canonical datasets are built in `../data/`. Copy published CSVs/GeoJSON into `website/data/` after rebuilds.

```bash
# Example — ecosystem map pins
cp ../data/greater_boston_academic_ecosystem_v1.csv data/greater_boston_academic_ecosystem.csv
```

## Source link configuration

Outro and future reference URLs: `js/config.js` → `SiteConfig.sources`.
