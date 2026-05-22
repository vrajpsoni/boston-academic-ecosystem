# Section 05 — Methodology & Transparency

**Audience:** Course instructors, reviewers, and future-you implementing D3.  
**Rule:** If a number appears on screen, it must be traceable to a row in `processed/*.csv` and a `source_id` in this document.

---

## 1. What this section claims (and does not)

### Claims (v1)

- Greater Boston **map-scope** colleges and universities report **large official operating budgets** (IPEDS Finance).
- Those budgets partition into **functional expense categories** reported to NCES.
- The **seven anchor** institutions account for most of that scale; the remainder is summarized as **“All other map institutions.”**
- Student and research stories (Acts IV–V) use **separate metrics** with explicit labels — they do not inflate the Act I hero.

### Does not claim

- Total **regional GDP** attributable to universities.
- **Multiplier-based** “economic impact” (1.5×, 2.5×) unless citing a specific MA/Boston study in prose only.
- That every dollar of operating expense is spent **within** Boston city limits (regional institutions serve wider labor markets).
- Precise **geographic** routing of student spending (Phase 2+ models only).

---

## 2. Hero metric (Act I)

**Name:** `ecosystem_operating_expenses_total_usd`  

**Definition:** Sum of IPEDS-reported **total operating expenses** (exact VARNAME TBD in validation log) for all 29 UNITIDs in ecosystem scope, for fiscal year FY.

**Aggregation:**

```
hero_total = Σ opex(unitid)  for unitid in ecosystem_29
display_anchors = 7 rows
display_others = hero_total - Σ opex(unitid) for 7 anchors
```

**Integrity check:** `display_others` + sum(7 anchors) must equal `hero_total`.

---

## 3. IPEDS Finance extraction (to complete in validation)

### Step 1 — Control lookup

From `HD{year}`: field `CONTROL` (or equivalent) → map UNITID to:

- Public → read `f1a{year}.csv` (or year-specific filename inside zip)
- Private nonprofit → read `f2{year}.csv`

### Step 2 — Total operating expenses (validated F2122)

| Item | Value |
|------|-------|
| Collection year | **2021–22** (`F2122_F1A.zip`, `F2122_F2.zip`) |
| Public GASB (F1A) | **`F1B25`** — total expenses |
| Private FASB (F2) | **`F2E131`** — total expenses (Part E, line 13) |
| Dictionary | [IPEDS Finance survey materials](https://nces.ed.gov/ipeds/use-the-data/annual-survey-forms-packages-archived/2022/finance) |

Spot-check: Harvard `F2E131` ≈ $5.43B; UMass Boston `F1B25` ≈ $290M (order-of-magnitude reasonable).

### Step 3 — Functional expense breakdown (Act III lanes)

Extract category dollars that sum to ≤ total opex (categories may not exhaust total; document residual bucket `expense_other_usd`).

Typical categories (names vary by form):

- Instruction
- Research
- Public service / academic support
- Student services
- Institutional support
- Auxiliary enterprises
- Operation & maintenance of plant

---

## 4. Sankey link methodology

### Phase 1 (MVP — reconciliation Sankey)

Purpose: **Circulation storytelling** without overstating precision.

| Layer | Nodes | Value |
|-------|-------|-------|
| Left | `source-total-revenues` (optional) or direct institution feed | IPEDS total revenues if same survey year validated |
| Center | 7 anchors + `inst-all-others` | `total_operating_expenses_usd` |
| Right | Expense function sinks | IPEDS functional categories |

**Constraint:** For each institution node, sum(outgoing links to sinks) = institution opex (± rounding).

### Phase 2 (expanded flows)

Add tuition, aid, grants only when each link has:

- `source_id`
- `is_estimated` flag
- Formula line in this file

**Tuition (example formula — Phase 2):**

```
gross_tuition_fees = IPEDS F2 line OR CDS B1 × headcount context
```

**Student living spend (estimated):**

```
living_spend_estimate = headcount × regional living_cost_benchmark
```

Always `is_estimated=true`; never add to Act I hero.

---

## 5. Student segments (Act IV — Phase 2)

| Field | Source | Derived? |
|-------|--------|----------|
| `domestic_headcount` | EF2023 | No |
| `international_headcount` | EF2023 `EFNRALT` | No |
| `out_of_state_proxy` | EF Part C (same caveats as Section 02) | Partial |
| `living_spend_estimate_usd` | BLS / College Board benchmark × headcount | **Yes** |

**NAFSA:** Use Massachusetts or Boston MSA figure in **prose card** with NAFSA citation — do not splice into Sankey as institution outflow unless using NAFSA’s published components with documentation.

---

## 6. Research spillover (Act V — Phase 2)

| Field | Source |
|-------|--------|
| `rd_expenditures_total` | IPEDS RD or NSF HERD |
| `rd_federal` | RD survey federal component |

**Connection to 04C:** Workforce shares from ACS are **contextual proxies**, not dollar flows. Label: “Workforce concentration (ACS proxy)” on cards.

---

## 7. Uncertainty & limitations (display on site)

Short footer copy (example):

- Figures are **IPEDS Finance (FY20XX)** for institutions in the Greater Boston academic ecosystem map scope.
- **Operating expenses** are not the same as economic impact multipliers or student spending.
- **Seven** institutions are shown separately; remaining schools are **aggregated**.
- Phase 2 metrics marked “Estimated” in the data table.

---

## 8. VARNAME validation log (F2122)

| UNITID | Name | VARNAME | Value (USD) | QA |
|--------|------|---------|-------------|-----|
| 166027 | Harvard | F2E131 | 5,430,133,000 | Anchor |
| 166683 | MIT | F2E131 | 3,993,328,000 | Anchor |
| 164988 | Boston University | F2E131 | 2,317,075,000 | Anchor |
| 167358 | Northeastern | F2E131 | (see CSV) | Anchor |
| 164924 | Boston College | F2E131 | (see CSV) | Anchor |
| 168148 | Tufts | F2E131 | (see CSV) | Anchor |
| 167987 | UMass Boston | F1B25 | 290,019,000 | Anchor · public |

**Ecosystem hero (29 schools):** $17,940,441,187 · **7 anchors:** $15,745,873,791 · **All others:** $2,194,567,396

---

## Changelog

| Date | Change |
|------|--------|
| 2026-05-21 | Initial methodology; VARNAME table pending validation pass |
