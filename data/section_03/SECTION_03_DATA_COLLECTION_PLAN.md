# Section 03 — Ecosystem-Scale Enrollment (Data Collection Plan)

**Status:** v1 aggregate — mixed latest official sources (2023–2025 per institution).  
**Story goal:** One immersive realization of how many students the Greater Boston academic ecosystem supports together — the emotional consequence of Sections 01–02.  
**Access date (v1 refresh):** 2026-05-20

---

## Design principles

1. **Official enrollment only** — NCES IPEDS EF; no blogs or unofficial counts.
2. **One count per institution** — map pins may repeat campuses; IPEDS `unitid` deduplicates.
3. **Current active students** — fall headcount (undergraduate + graduate), not historical totals.
4. **Ecosystem aggregate** — no university-by-university comparison charts in this section.

---

## Main metrics (v1)

| Metric | IPEDS basis |
|--------|-------------|
| Total students | `EFTOTLT` / `EFRACE24` grand total, all levels |
| International | `EFNRALT` (nonresident alien) |
| Domestic | Total − International (where international reported) |
| Out-of-state | EF Part C `EFRES02` aggregate when available (FT first-time degree-seeking undergrad — **not** full headcount) |

**Priority:** Institutional fact book / CDS / OIRA → NCES IPEDS EF (2023 machine-readable zip).

---

## Folder structure

```
data/section_03/
├── SECTION_03_DATA_COLLECTION_PLAN.md
├── sources/
│   └── SECTION_03_DATA_SOURCES.md
├── raw/
│   ├── ecosystem_institutions_ipeds.csv   # UNITID ↔ map-scope schools
│   └── ecosystem_enrollment_overrides.csv # newer official totals (CDS / fact books)
└── processed/
    ├── ecosystem_institution_enrollment_v1.csv
    └── greater_boston_ecosystem_enrollment_v1.csv
```

---

## Build

```bash
python3 data/scripts/build_section_03_ecosystem_totals.py
```

Copies aggregate metrics to `website/data/greater_boston_ecosystem_enrollment.csv`.

---

## QA checklist

- [x] 29 map-scope institutions with verified `unitid` (HD2023 cross-check)
- [x] No double-counting of Harvard / MIT / BU multi-campus pins
- [ ] Re-run when NCES publishes `EF2024A`
- [x] Website Section 03 hero uses aggregate CSV only

---

## Out of scope (v1)

- Majors, departments, class year, demographics
- Per-university comparison visuals
- Neighborhood / heatmap layers (moved to **Section 04** — `data/section_04/`)
