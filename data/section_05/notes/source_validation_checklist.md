# Section 05 — Source Validation Checklist

**Gate:** Do not implement D3 Sankey until all Phase 0 items checked.

## Downloads

- [x] `HD2022.zip` extracted; **29/29** ecosystem UNITIDs found (24 private nonprofit, 5 public)
- [x] `F2122_F1A.zip` + `F2122_F2.zip` in `raw/ipeds_finance/`
- [x] File sizes logged in `processing_log.md`

## VARNAME & values

- [x] Public total expenses: **`F1B25`** (F1A)
- [x] Private total expenses: **`F2E131`** (F2)
- [x] Functional: F1B02–08 / F2E132–136 (residual → `opex_other` in flows)
- [x] Harvard / UMass order-of-magnitude spot-check

## Aggregations

- [x] Seven anchor opex values extracted
- [x] “All others” = $2,194,567,396
- [x] Hero total = **$17,940,441,187** (29 schools)
- [x] Sankey outflows reconcile per institution (residual bucket where needed)

## Documentation

- [x] `SECTION_05_METHODOLOGY.md` VARNAME table filled
- [x] `DATA_REFERENCES.md` DS-08 updated with access date
- [x] Processed CSVs in `section_05/processed/`

## Sign-off

| Role | Date | Notes |
|------|------|-------|
| Data validation | 2026-05-21 | F2122 Finance build complete |
| Ready for build script | 2026-05-21 | `build_section_05_financial_model.py` |
| Ready for D3 implementation | 2026-05-21 | Acts I–III MVP on site; IV–V editorial |
