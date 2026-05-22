# Section 03 — Ecosystem Enrollment Data Sources

> **Master citation index (all links):** [`../../DATA_REFERENCES.md`](../../DATA_REFERENCES.md) — [DS-06](../../DATA_REFERENCES.md#ds-06-section-03-ecosystem-enrollment-aggregate) and [Section 03 appendix](../../DATA_REFERENCES.md#section-03--ecosystem-scale-hero-29-schools-235824-total).

**Primary source:** U.S. Department of Education, NCES — IPEDS **Fall Enrollment (EF)**  
**Collection years (v1 hero):** Mixed **2023–2025** — latest official figure per institution (not a single census semester)  
**Institutions:** 29 higher-ed institutions on the Section 01 ecosystem map (`ecosystem_institutions_ipeds.csv`)

**Institutional overrides (newer than IPEDS EF zip):** Harvard OIRA (Fall 2025), MIT Facts (Oct 2025), BU CDS 2024-25, Northeastern accomplishments datasheet (Fall 2024), Tufts CDS 2024-25, Boston College Fact Book 2024-25, UMass Boston Fast Facts Fall 2024. See `ecosystem_enrollment_overrides.csv`.

**IPEDS note:** `EF2024A.zip` is not yet on the NCES Data Center legacy URL (checked 2026-05-20). Remaining schools use **IPEDS Fall Enrollment 2023**.

| Source ID | Provider | URL | Use |
|-----------|----------|-----|-----|
| SRC-IPEDS-EF-2023 | NCES IPEDS | https://nces.ed.gov/ipeds/datacenter/data/EF2023A.zip · EF2023C.zip | Total, international, out-of-state proxy |
| SRC-IPEDS-HD-2023 | NCES IPEDS Institutional Directory | https://nces.ed.gov/ipeds/datacenter/data/HD2023.zip | `unitid` validation for Simmons, Suffolk, Hult, BAC, Laboure |

**Build script:** `data/scripts/build_section_03_ecosystem_totals.py`  
**Raw EF archives (shared):** `data/raw/ipeds_ef/`

### Attribution (site)

U.S. Department of Education, National Center for Education Statistics, Integrated Postsecondary Education Data System (IPEDS), Fall Enrollment component, 2023.
