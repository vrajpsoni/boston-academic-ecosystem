# Manual IPEDS Finance Download (required for Phase 0)

**Why manual:** As of 2026-05-21, direct URLs such as `https://nces.ed.gov/ipeds/datacenter/data/F2022F1A.zip` and `F2022F2.zip` return **404**. Enrollment (`EF2023A`) and directory (`HD2022`) still download; **Finance must come from the IPEDS Complete Data Files UI**.

---

## Step-by-step (NCES Data Center)

1. Open [IPEDS Data Center](https://nces.ed.gov/ipeds/datacenter/).
2. Choose **Use final release data** → Continue.
3. Open **Complete Data Files**.
4. Select collection year **2022–23** (or latest year where Finance is marked final; align all institutions to the **same** finance year).
5. Survey: **Finance**.
6. Download **both** institution-type files below (CSV inside each zip).

| Package (2022 archive labels) | Institutions | Save as (either name works) |
|-------------------------------|--------------|------------------------------|
| Degree-granting **public** institutions using **GASB** | UMass Boston, Bunker Hill CC, Roxbury CC, Quincy College, MassArt, etc. | `F2122_F1A.zip` or `F_public_gasb.zip` |
| Degree-granting **private not-for-profit** (FASB) | Harvard, MIT, BU, NEU, BC, Tufts, and remaining privates | `F2122_F2.zip` or `F_private_fasb.zip` |

**Validated in repo (2026-05-21):** `F2122_F1A.zip` + `F2122_F2.zip` → IPEDS 2021–22 Finance collection year.

7. Do **not** rename the inner CSV; the build script discovers it.

---

## After download

```bash
# Inspect columns and candidate expense fields
python3 data/scripts/build_section_05_financial_model.py --inspect

# Build processed CSVs (after VARNAME confirmed in methodology table)
python3 data/scripts/build_section_05_financial_model.py
```

---

## Validation

- All **29** UNITIDs from `ecosystem_institutions_ipeds.csv` appear in F1A and/or F2 extract.
- Hero total = sum(7 anchors) + all others.
- Spot-check Harvard and UMass Boston against published annual reports (order of magnitude).

See `notes/source_validation_checklist.md`.
