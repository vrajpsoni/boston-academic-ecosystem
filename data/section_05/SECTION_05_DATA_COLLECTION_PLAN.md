# Section 05 — The Academic Economy · Data Collection Plan

**Status:** Data specification (pre-implementation)  
**Architecture:** `website/SECTION_05_ACADEMIC_ECONOMY_ARCHITECTURE.md` (locked)  
**Principle:** Source-backed numbers first; Sankey links second; motion layer last.

---

## 1. Story ↔ data mapping (5 acts)

| Act | User feeling | Primary datasets | Hero visualization |
|-----|--------------|------------------|-------------------|
| **I — Scale** | “This is enormous.” | `institution_financial_scale_v1.csv` | Animated **total operating expenses** (7 anchors + all others) |
| **II — Circulation** | “Money moves through a system.” | `academic_economy_flows_v1.csv` | D3 **Sankey** (sources → institutions → sinks) |
| **III — Anchors** | “A few institutions dominate.” | Same scale file + expense breakdown | **Depth lanes** (7 + others) |
| **IV — Students** | “Students are economic actors.” | `student_segment_contribution_v1.csv` + SFA | Sankey sub-flow + **waterfall** (aid) |
| **V — Spillover** | “Impact extends beyond campus.” | `research_scale_v1.csv` + Section 04C proxies | Analytical **cards** + thin links |

**Phase 1 MVP (data):** Acts I–III only.  
**Phase 2:** Acts IV–V.

---

## 2. Institution scope

### Seven anchors (individual nodes / lanes)

| UNITID | Institution | Section 02 anchor |
|--------|-------------|-------------------|
| 166027 | Harvard University | Yes |
| 166683 | Massachusetts Institute of Technology | Yes |
| 164988 | Boston University | Yes |
| 167358 | Northeastern University | Yes |
| 164924 | Boston College | Yes |
| 168148 | Tufts University | Section 03 override |
| 167987 | University of Massachusetts Boston | Yes |

### “All other map institutions” (single aggregate node)

Sum of remaining **22** UNITIDs in `data/section_03/raw/ecosystem_institutions_ipeds.csv` (29 total − 7 anchors).

Do **not** render 29 Sankey institution columns in v1.

---

## 3. Hero metric specification (Act I)

### Definition

**Greater Boston academic operating expenses (ecosystem total)**  

\[
\text{HeroTotal} = \sum_{i \in \text{map scope}} \text{Total operating expenses}_i
\]

for a single fiscal/survey year **FY** (target: **FY2022** or latest IPEDS Finance release available at build time).

### IPEDS field selection (validation required in Phase 0)

1. Download **HD{year}** for `sector` / `control` (public vs private nonprofit).
2. Download finance file by control:
   - Public: **F1A** (`F{year}F1A.zip`)
   - Private nonprofit: **F2** (`F{year}F2.zip`)
3. Map to **total operating expenses** using the IPEDS Data Dictionary for that survey year (variable name differs by form; e.g. total expenses / total operating expenses line — **record exact VARNAME in `SECTION_05_METHODOLOGY.md` after first successful extract**).
4. Store raw VARNAME, value, `unitid`, `fiscal_year`, `source_id` per row.

### Display rules

| Rule | Requirement |
|------|-------------|
| Label | “Operating expenses” — not “economic impact” or “GDP” |
| Subtitle | “Fiscal year {FY} · NCES IPEDS Finance · {N} institutions” |
| Missing school | Exclude from sum; note in `processing_log.md` — do not impute |
| Rounding | Display $X.XB at hero; full integer in data table |
| Comparison | Optional sparkline: anchor total expenses 2018–2022 (Phase 2) |

---

## 4. Sankey flow model (Act II)

### Node types

| `node_type` | Examples |
|-------------|----------|
| `source` | Tuition & fees (gross); State appropriations (public); Gifts & grants; Federal aid pass-through |
| `institution` | 7 anchors + `inst-all-others` |
| `sink` | Instruction & academic support; Research; Student services; Auxiliary enterprises; Local payroll & purchases (aggregated); Financial aid (grants to students) |

### Link rules (v1 — conservative)

Only publish links where **numerator is directly observed** or **explicitly derived** in methodology:

| Link (example) | v1 status | Source |
|----------------|-----------|--------|
| Institution → Total opex (reconciliation) | **Required** | IPEDS Finance (must sum to Act I hero for that institution) |
| Gross tuition & fees → Institution | **Phase 2** | IPEDS F2 / CDS Section B |
| Financial aid → Students (outflow) | **Phase 2** | IPEDS SFA |
| Federal R&D → Research sink | **Phase 2** | IPEDS RD / NSF HERD |
| “Local spending” sink | **Phase 2+** | Modeled — label `is_estimated=true` |

**MVP Sankey (Phase 1):** Simplified circulation:

```
[All sources bucket] → each institution → [Expense function buckets from IPEDS]
```

Even a **3-layer** Sankey (Revenues → Institutions → Expense categories) is acceptable for MVP if tuition-level splits are not validated yet — but Act I hero must remain **opex-only** truth.

### Processed schema: `academic_economy_flows_v1.csv`

| Column | Type | Description |
|--------|------|-------------|
| `link_id` | string | Stable id |
| `act` | int | 1–5 story act |
| `source_node_id` | string | Sankey source |
| `target_node_id` | string | Sankey target |
| `value_usd` | int | Dollars (integer) |
| `metric_id` | string | e.g. `opex_instruction` |
| `fiscal_year` | int | FY |
| `is_estimated` | bool | `true` if modeled |
| `source_id` | string | Registry id |
| `source_url` | string | Citation |
| `access_date` | date | ISO |
| `notes` | string | Transparency |

### Processed schema: `academic_economy_nodes_v1.csv`

| Column | Description |
|--------|-------------|
| `node_id` | e.g. `inst-harvard`, `sink-payroll` |
| `node_label` | Display name |
| `node_type` | source \| institution \| sink |
| `act` | Primary act |
| `sort_order` | Layout hint for D3 |

---

## 5. Institutional depth lanes (Act III)

**File:** `institution_financial_scale_v1.csv`

| Column | Description |
|--------|-------------|
| `unitid` | IPEDS id or `AGG_OTHERS` |
| `institution_name` | Display |
| `tier` | `anchor` \| `aggregate` |
| `total_operating_expenses_usd` | Hero component |
| `expense_instruction_usd` | IPEDS functional category |
| `expense_research_usd` | |
| `expense_student_services_usd` | |
| `expense_auxiliary_usd` | |
| `expense_other_usd` | Residual / other |
| `total_enrollment` | From Section 03 (context only) |
| `expenses_per_student_usd` | Derived; label derived |
| `fiscal_year` | | |
| `source_id`, `source_url`, `access_date` | | |

Functional categories must match IPEDS finance form lines documented in methodology.

---

## 6. Student segments (Act IV — Phase 2)

**File:** `student_segment_contribution_v1.csv`

| Segment | Data | Notes |
|---------|------|-------|
| Domestic | EF2023 domestic headcount × **optional** living spend estimate | Living spend = estimated |
| Out-of-state | EF Part C context + headcount | Do not double-count with total |
| International | EF nonresident + NAFSA MA impact **cite only** | NAFSA for narrative card, not added to opex hero |

**Aid waterfall:** `financial_aid_flows_v1.csv` from IPEDS **SFA** (grants, loans, work-study) — Phase 2.

---

## 7. Research spillover (Act V — Phase 2)

**File:** `research_scale_v1.csv`

| Metric | Source |
|--------|--------|
| Total R&D expenditures | IPEDS **RD** or NSF **HERD** |
| Federal R&D | RD survey |
| Per-anchor R&D (7 only) | Same |

**Bridge to Section 04C:** Link card copy to `layer_c_innovation_workforce_v1.csv` neighborhood metrics (workforce proxy, not dollars).

---

## 8. Raw & processed file tree

```
data/section_05/
  SECTION_05_DATA_COLLECTION_PLAN.md    ← this file
  sources/
    SECTION_05_DATA_SOURCES.md
    SECTION_05_METHODOLOGY.md
  raw/
    ipeds_finance/          # F1A, F2 zips by year
    ipeds_hd/               # control / sector
    ipeds_sfa/              # Phase 2
    ipeds_rd/               # Phase 2
    institutional/          # optional CDS tuition extracts
  processed/
    institution_financial_scale_v1.csv
    academic_economy_nodes_v1.csv
    academic_economy_flows_v1.csv
    student_segment_contribution_v1.csv   # Phase 2
    research_scale_v1.csv                  # Phase 2
  notes/
    processing_log.md
    source_validation_checklist.md

data/scripts/
  build_section_05_financial_model.py     # to implement after validation

website/data/
  section_05_institution_scale.csv        # published copies
  section_05_economy_nodes.csv
  section_05_economy_flows.csv
```

---

## 9. Source validation checklist (before any D3 code)

Complete `notes/source_validation_checklist.md`:

- [ ] HD2022 downloaded; all 29 UNITIDs present
- [ ] Finance file per control downloaded (F1A/F2)
- [ ] VARNAME for total operating expenses documented with screenshot or dictionary link
- [ ] Sum of 7 anchors + others equals hero total (±$0)
- [ ] Harvard, MIT totals spot-checked against published annual report order-of-magnitude
- [ ] Fiscal year consistent across all institutions
- [ ] DS-08 added to `DATA_REFERENCES.md`
- [ ] No link in `academic_economy_flows_v1.csv` with `is_estimated=false` unless sourced

---

## 10. QA rules (non-negotiable)

1. **Never** merge operating expenses with student living spend in Act I hero.
2. **Never** present NAFSA multipliers as institution-level Sankey widths.
3. Every derived field has formula in `SECTION_05_METHODOLOGY.md`.
4. Website footer lists IPEDS Finance + FY + access date.
5. Sankey includes **accessible data table** toggle (same numbers as viz).

---

## 11. Implementation order (locked)

```
Architecture locked (done)
    → Data spec (this document)
    → Source validation + build script
    → Processed CSVs + DATA_REFERENCES DS-08
    → HTML shell + dark theme (static)
    → D3 Sankey + scroll controller
    → Motion polish + reduced-motion fallbacks
```

---

## Changelog

| Date | Change |
|------|--------|
| 2026-05-21 | Initial data collection plan aligned with locked architecture |
