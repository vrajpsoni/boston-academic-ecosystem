# Section 05 — Data Sources & Attribution

> **Master index:** [`../../DATA_REFERENCES.md`](../../DATA_REFERENCES.md) (DS-08)  
> **Collection plan:** [`../SECTION_05_DATA_COLLECTION_PLAN.md`](../SECTION_05_DATA_COLLECTION_PLAN.md)  
> **Formulas:** [`SECTION_05_METHODOLOGY.md`](SECTION_05_METHODOLOGY.md)

**Access date (target):** 2026-05-21 (validation pass)  
**Fiscal/survey year (target):** FY2022 IPEDS Finance (adjust when newer F{year} published)

---

## Source registry

| ID | Provider | URL | Used in act |
|----|----------|-----|-------------|
| SRC-IPEDS-HD | NCES IPEDS Institutional Directory | https://nces.ed.gov/ipeds/datacenter/data/HD2022.zip | Control/sector → pick F1A vs F2 |
| SRC-IPEDS-F1A | NCES IPEDS Finance (public) | https://nces.ed.gov/ipeds/datacenter/data/F2022F1A.zip | UMass Boston (public) |
| SRC-IPEDS-F2 | NCES IPEDS Finance (private nonprofit) | https://nces.ed.gov/ipeds/datacenter/data/F2022F2.zip | Harvard, MIT, BU, NEU, BC, Tufts + most privates |
| SRC-IPEDS-F1A-DICT | IPEDS Data Dictionary | https://nces.ed.gov/ipeds/datacenter/DataFiles.aspx | VARNAME validation |
| SRC-IPEDS-SFA | NCES Student Financial Aid | https://nces.ed.gov/ipeds/datacenter/data/SFA2223.zip (example) | Act IV (Phase 2) |
| SRC-IPEDS-RD | NCES Academic R&D | https://nces.ed.gov/ipeds/datacenter/data/RD2022.zip | Act V (Phase 2) |
| SRC-NSF-HERD | NSF Higher Education R&D Survey | https://ncses.nsf.gov/surveys/higher-education-research-development/ | Act V cross-check |
| SRC-IPEDS-EF-2023 | Fall Enrollment (existing) | https://nces.ed.gov/ipeds/datacenter/data/EF2023A.zip | Student segments (headcount) |
| SRC-NAFSA-MA | NAFSA international student economic value | https://www.nafsa.org/policy-and-advocacy/policy-resources/nafsa-international-student-economic-value-tool | Act IV narrative only (Phase 2) |
| SRC-CDS-TUITION | Common Data Set (per institution) | BU, Harvard, etc. OIR sites | Phase 2 tuition flows |
| SRC-SEC03-AGG | Section 03 institution list | `data/section_03/raw/ecosystem_institutions_ipeds.csv` | 29-school scope + “all others” |

---

## Seven anchors — finance source priority

| UNITID | Institution | Expected form | Annual report QA (optional) |
|--------|-------------|---------------|----------------------------|
| 166027 | Harvard University | F2 | https://finance.harvard.edu/ |
| 166683 | MIT | F2 | https://vpf.mit.edu/ |
| 164988 | Boston University | F2 | https://www.bu.edu/finance/ |
| 167358 | Northeastern University | F2 | https://finance.northeastern.edu/ |
| 164924 | Boston College | F2 | https://www.bc.edu/offices/controller.html |
| 168148 | Tufts University | F2 | https://finance.tufts.edu/ |
| 167987 | UMass Boston | F1A | https://www.umb.edu/business-finance |

---

## Downloads (Phase 0)

**Automated (works):**

```bash
curl -fsSL -o data/section_05/raw/ipeds_hd/HD2022.zip \
  https://nces.ed.gov/ipeds/datacenter/data/HD2022.zip

python3 data/scripts/build_section_05_financial_model.py
# → writes institution_control_v1.csv when Finance zips absent
```

**Manual (required):** Legacy Finance URLs (`F2022F1A.zip`, `F2022F2.zip`) return **404** as of 2026-05-21. Use the IPEDS **Complete Data Files** UI — see **[`MANUAL_IPEDS_FINANCE_DOWNLOAD.md`](MANUAL_IPEDS_FINANCE_DOWNLOAD.md)**.

Save zips as:

- `data/section_05/raw/ipeds_finance/F_public_gasb.zip`
- `data/section_05/raw/ipeds_finance/F_private_fasb.zip`

Then:

```bash
python3 data/scripts/build_section_05_financial_model.py --inspect
python3 data/scripts/build_section_05_financial_model.py
```

---

## What we will not use as primary sources

| Source | Reason |
|--------|--------|
| Wikipedia / rankings sites | Not auditable |
| Generic “$X billion impact” press releases | No consistent methodology |
| Yelp / Google | Not financial |
| Live stock or treasury APIs | Wrong metaphor; breaks static hosting |
| Fabricated multipliers | Academic integrity |

---

## Suggested citations (report)

- *U.S. Department of Education, National Center for Education Statistics, Integrated Postsecondary Education Data System (IPEDS), Finance component, fiscal year 20XX.*
- *U.S. Department of Education, NCES, IPEDS Fall Enrollment (EF), for student segment headcounts.*
- *NSF NCSES, Higher Education Research and Development (HERD) Survey* (if Act V included).

---

## Changelog

| Date | Change |
|------|--------|
| 2026-05-21 | Initial source registry for Section 05 validation phase |
