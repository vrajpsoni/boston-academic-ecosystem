# Section 02 — Enrollment Data Sources

> **Citations / master index:** See [`DATA_REFERENCES.md`](DATA_REFERENCES.md) (DS-02). This file is the technical supplement (IPEDS fields, rebuild steps).

**Dataset file:** `greater_boston_enrollment_v1.csv`  
**Builder script:** `scripts/build_enrollment_dataset.py` (re-run to refresh from NCES)  
**Status:** v1 — IPEDS Fall Enrollment (EF), 2004–2023 (annual)

---

## Purpose

Storytelling-ready time series for **growth of Greater Boston’s student population** at six anchor universities, for Plotly charts in Section 02.

**Institutions (IPEDS unit IDs):**

| University | UNITID |
|------------|--------|
| Harvard University | 166027 |
| MIT | 166683 |
| Boston University | 164988 |
| Northeastern University | 167358 |
| UMass Boston | 167987 |
| Boston College | 164924 |

**Planned later:** `Other Greater Boston Institutions` aggregate (remaining IPEDS schools in scope cities) — not in v1.

---

## Primary source: NCES IPEDS — Fall Enrollment (EF)

All totals and international counts are drawn from official IPEDS **Fall Enrollment** survey files published by the U.S. Department of Education, National Center for Education Statistics (NCES).

| File | Content used |
|------|----------------|
| `EF{year}A.zip` → `ef{year}a.csv` | Total fall headcount; nonresident alien (international) |
| `EF{year}C.zip` → `ef{year}c.csv` | Residence / migration (out-of-state aggregate) |

**Download base URL:**  
https://nces.ed.gov/ipeds/datacenter/data/EF{year}A.zip  
https://nces.ed.gov/ipeds/datacenter/data/EF{year}C.zip  

Raw copies (optional, for reproducibility): `data/raw/ipeds_ef/`

### Variable definitions (IPEDS)

| CSV column | IPEDS field / logic | Notes |
|------------|-------------------|--------|
| **Year** | Survey collection year in filename (`EF2022` → **2022**) | Corresponds to **fall** enrollment that academic cycle (e.g., Fall 2022). |
| **Total** | `EFTOTLT` when available; else `EFRACE24` on grand-total row | Row filter: `EFALEVEL = 1`, `LINE = 29`, `LSTUDY = 4` (all students, reported grand total). |
| **International** | `EFNRALT` (nonresident alien, total) | Same row as Total. Blank if not reported in older files. |
| **Domestic** | `Total − International` | Computed when International is present. |
| **OutOfState** | `EFRES02` on `EFCSTATE = 58`, `LINE = 999` | **Part C — first-time, full-time degree/certificate-seeking undergraduates** by state of residence; out-of-state aggregate. Not full institutional headcount. |

**Important:** Total and International describe **fall enrollment headcount (all levels)**. OutOfState is a **narrower IPEDS subgroup** — use for “where students come from” stories, not as a component that sums to Total.

---

## Year coverage

| Period | Coverage |
|--------|----------|
| **2000–2003** | Not in standard IPEDS EF machine-readable extracts used here. |
| **2004–2008** | Total from `EFRACE24` (pre-`EFTOTLT` layout); International from `EFNRALT` when present (2008+); 2004–2007 International often blank. |
| **2009–2023** | Total and International from `EFTOTLT` / `EFNRALT` (annual). |
| **2024** | Not yet published as `EF2024A` at build time. |

120 rows = 6 universities × 20 years (2004–2023).

---

## Secondary / validation sources (not scraped)

Use these to **spot-check** figures or fill narrative context; v1 numbers come from IPEDS only.

| Source | Use |
|--------|-----|
| [IPEDS Data Center](https://nces.ed.gov/ipeds/datacenter/) | Institution profiles, Trend Generator |
| [College Navigator](https://nces.ed.gov/collegenavigator/) | Published enrollment snapshots |
| Institutional Fact Books / OIR (e.g., Harvard OIRA) | Campus-reported totals; CDS enrollment tables |
| Common Data Set (CDS) — Section B | Enrollment by residency (manual lookup if needed) |

**Not used:** Wikipedia, unofficial ranking sites, blogs.

---

## Known gaps and limitations (v1)

- **Missing cells are intentional** — blank = not reported or not applicable in that survey year.
- **International** missing for some early years (pre-`EFNRALT` reporting on grand-total row).
- **OutOfState** missing in some years when Part C aggregate line is absent; never imputed.
- **UMass Boston** and public institutions may show lower out-of-state counts (expected).
- **Northeastern** totals jump mid-series (e.g., graduate/online growth) — consistent with IPEDS, not a processing error.
- **Domestic** is derived, not a separate IPEDS total field.

---

## Rebuilding the dataset

```bash
cd data
python3 scripts/build_enrollment_dataset.py
```

Output: `greater_boston_enrollment_v1.csv`

For website deploy (when Section 02 is built), copy to:

`website/data/greater_boston_enrollment.csv`

---

## Attribution (for site footer)

U.S. Department of Education, National Center for Education Statistics, Integrated Postsecondary Education Data System (IPEDS), Fall Enrollment component, various years.
