# Section 05 — Processing Log

| Timestamp | Action | Result |
|-----------|--------|--------|
| 2026-05-21 | Data spec created | Awaiting IPEDS Finance download |
| 2026-05-21 | Architecture + methodology locked; UI deferred pending validation | See `source_validation_checklist.md` |
| 2026-05-21 | Phase 0 partial: HD2022 downloaded; **29/29** UNITIDs matched; 24 private / 5 public | `institution_control_v1.csv` |
| 2026-05-21 | IPEDS Finance direct URLs (`F2022F1A`, `F2022F2`) return **404** | Manual download: `MANUAL_IPEDS_FINANCE_DOWNLOAD.md` |
| 2026-05-21 | `build_section_05_financial_model.py` added; awaits Finance zips | Run `--inspect` then full build |
| 2026-05-21 | User placed `F2122_F1A.zip` (1.4MB) + `F2122_F2.zip` (1.1MB) | `raw/ipeds_finance/` |
| 2026-05-21 | VARNAME locked: F1B25 (public), F2E131 (private) | 29/29 institutions with opex |
| 2026-05-21 | Hero opex **$17.94B** · anchors **$15.75B** · others **$2.19B** | `institution_financial_scale_v1.csv`, flows + nodes |

_Add rows as validation and build scripts run._
