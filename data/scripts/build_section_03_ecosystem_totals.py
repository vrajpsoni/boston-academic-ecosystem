#!/usr/bin/env python3
"""
Section 03 — aggregate latest official enrollment across map-scope institutions.

Priority per institution:
  1. ecosystem_enrollment_overrides.csv (CDS, fact books, OIRA — when newer than IPEDS zip)
  2. NCES IPEDS Fall Enrollment (EF) — highest available year in raw/ipeds_ef (currently through 2023)

Outputs:
  - data/section_03/processed/ecosystem_institution_enrollment_v1.csv
  - data/section_03/processed/greater_boston_ecosystem_enrollment_v1.csv
  - website/data/greater_boston_ecosystem_enrollment.csv
"""

from __future__ import annotations

import csv
import sys
import urllib.request
import zipfile
from io import TextIOWrapper
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INST_MAP = ROOT / "section_03/raw/ecosystem_institutions_ipeds.csv"
OVERRIDES = ROOT / "section_03/raw/ecosystem_enrollment_overrides.csv"
RAW_DIR = ROOT / "raw/ipeds_ef"
OUT_INST = ROOT / "section_03/processed/ecosystem_institution_enrollment_v1.csv"
OUT_AGG = ROOT / "section_03/processed/greater_boston_ecosystem_enrollment_v1.csv"
WEBSITE_AGG = ROOT.parent / "website/data/greater_boston_ecosystem_enrollment.csv"

IPEDS_YEARS = list(range(2023, 2003, -1))


def parse_int(value: str | None) -> int | None:
    if value is None:
        return None
    value = value.strip()
    if value in ("", ".", "R", "A", "Z", "N", "-2"):
        return None
    try:
        return int(float(value))
    except ValueError:
        return None


def get_res02(row: dict) -> int | None:
    for key in ("EFRES02", "EFRES02 "):
        if key in row:
            return parse_int(row[key])
    return None


def load_institutions() -> dict[int, str]:
    out: dict[int, str] = {}
    with INST_MAP.open(encoding="utf-8") as f:
        for row in csv.DictReader(f):
            unitid = parse_int(row.get("unitid"))
            name = (row.get("institution_name") or "").strip()
            if unitid and name:
                out[unitid] = name
    if not out:
        raise SystemExit(f"No institutions in {INST_MAP}")
    return out


def load_overrides() -> dict[int, dict]:
    if not OVERRIDES.exists():
        return {}
    out: dict[int, dict] = {}
    with OVERRIDES.open(encoding="utf-8") as f:
        for row in csv.DictReader(f):
            unitid = parse_int(row.get("unitid"))
            total = parse_int(row.get("total"))
            if not unitid or total is None:
                continue
            intl = parse_int(row.get("international"))
            domestic = parse_int(row.get("domestic"))
            if domestic is None and intl is not None:
                domestic = total - intl
            out[unitid] = {
                "total": total,
                "international": intl,
                "domestic": domestic,
                "year": parse_int(row.get("data_year")),
                "period_label": (row.get("period_label") or "").strip(),
                "source": (row.get("source_name") or "").strip(),
                "source_url": (row.get("source_url") or "").strip(),
                "source_type": "institutional_official",
            }
    return out


def download_zip(year: int, part: str) -> Path | None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    path = RAW_DIR / f"EF{year}{part}.zip"
    if path.exists() and path.stat().st_size > 10_000:
        return path
    url = f"https://nces.ed.gov/ipeds/datacenter/data/EF{year}{part}.zip"
    try:
        print(f"Downloading {url}")
        urllib.request.urlretrieve(url, path)
        return path
    except Exception as exc:
        print(f"Skip EF{year}{part}: {exc}", file=sys.stderr)
        return None


def open_ef_csv(zip_path: Path) -> tuple[csv.DictReader, zipfile.ZipFile]:
    zf = zipfile.ZipFile(zip_path)
    csv_name = next(
        n
        for n in zf.namelist()
        if n.lower().endswith(".csv") and "_rv" not in n.lower()
    )
    handle = TextIOWrapper(zf.open(csv_name), encoding="utf-8", errors="replace")
    return csv.DictReader(handle), zf


def extract_totals_a(year: int, unitids: set[int]) -> dict[int, dict[str, int | None]]:
    path = download_zip(year, "A")
    if not path:
        return {}

    out: dict[int, dict[str, int | None]] = {}
    reader, zf = open_ef_csv(path)
    cols = reader.fieldnames or []
    use_eftotlt = "EFTOTLT" in cols
    use_efrace24 = "EFRACE24" in cols
    has_nral = "EFNRALT" in cols

    for row in reader:
        unitid = parse_int(row.get("UNITID"))
        if unitid not in unitids:
            continue
        if row.get("EFALEVEL", "").strip() != "1":
            continue
        if row.get("LINE", "").strip() != "29":
            continue
        lstudy = row.get("LSTUDY", "").strip()
        if lstudy not in ("4", "99"):
            continue

        total = parse_int(row.get("EFTOTLT")) if use_eftotlt else None
        if total is None and use_efrace24:
            total = parse_int(row.get("EFRACE24"))
        intl = parse_int(row.get("EFNRALT")) if has_nral else None

        if total is None:
            continue

        prev = out.get(unitid)
        if prev is None or lstudy == "4":
            out[unitid] = {"total": total, "international": intl}

    zf.close()
    return out


def extract_out_of_state_c(year: int, unitids: set[int]) -> dict[int, int | None]:
    path = download_zip(year, "C")
    if not path:
        return {}

    out: dict[int, int | None] = {}
    reader, zf = open_ef_csv(path)
    for row in reader:
        unitid = parse_int(row.get("UNITID"))
        if unitid not in unitids:
            continue
        if row.get("EFCSTATE", "").strip() != "58":
            continue
        if row.get("LINE", "").strip() not in ("999", "99"):
            continue
        val = get_res02(row)
        if val is not None:
            out[unitid] = val

    zf.close()
    return out


def load_ipeds_by_year(unitids: set[int]) -> dict[int, dict[int, dict]]:
    """year -> unitid -> {total, international, out_of_state}."""
    cache: dict[int, dict[int, dict]] = {}
    for year in IPEDS_YEARS:
        totals = extract_totals_a(year, unitids)
        if not totals:
            continue
        oos = extract_out_of_state_c(year, unitids)
        cache[year] = {}
        for uid, t in totals.items():
            cache[year][uid] = {
                "total": t["total"],
                "international": t.get("international"),
                "out_of_state": oos.get(uid),
            }
        print(f"IPEDS EF {year}: {len(totals)} institutions")
    return cache


def pick_ipeds_row(
    unitid: int, ipeds_by_year: dict[int, dict[int, dict]], min_year: int | None
) -> dict | None:
    for year in IPEDS_YEARS:
        if min_year is not None and year < min_year:
            continue
        row = ipeds_by_year.get(year, {}).get(unitid)
        if row and row.get("total") is not None:
            intl = row.get("international")
            total = row["total"]
            domestic = total - intl if intl is not None else None
            return {
                "total": total,
                "international": intl,
                "domestic": domestic,
                "year": year,
                "period_label": f"Fall {year} (IPEDS EF)",
                "source": "NCES IPEDS Fall Enrollment (EF)",
                "source_url": f"https://nces.ed.gov/ipeds/datacenter/data/EF{year}A.zip",
                "source_type": "ipeds_ef",
                "out_of_state": row.get("out_of_state"),
            }
    return None


def sum_metric(values: list[int | None]) -> int | None:
    present = [v for v in values if v is not None]
    if not present:
        return None
    return sum(present)


def build() -> None:
    institutions = load_institutions()
    unitids = set(institutions.keys())
    overrides = load_overrides()
    ipeds_by_year = load_ipeds_by_year(unitids)

    if not ipeds_by_year:
        raise SystemExit("No IPEDS EF years available — download EF2023A.zip to data/raw/ipeds_ef/")

    inst_rows: list[dict] = []
    missing: list[str] = []

    for unitid, name in sorted(institutions.items(), key=lambda x: x[1]):
        row = None
        override = overrides.get(unitid)
        if override:
            row = dict(override)
            ipeds_latest = pick_ipeds_row(unitid, ipeds_by_year, None)
            ipeds_same_year = ipeds_by_year.get(override.get("year") or 0, {}).get(unitid)
            if row.get("international") is None and ipeds_same_year:
                row["international"] = ipeds_same_year.get("international")
                if row.get("domestic") is None and row["international"] is not None:
                    row["domestic"] = row["total"] - row["international"]
            # Out-of-state only published in IPEDS EF Part C; use latest IPEDS year when not in CDS
            if row.get("out_of_state") is None and ipeds_latest:
                row["out_of_state"] = ipeds_latest.get("out_of_state")
        else:
            row = pick_ipeds_row(unitid, ipeds_by_year, None)

        if not row:
            missing.append(name)
            continue

        inst_rows.append(
            {
                "DataYear": row["year"],
                "PeriodLabel": row.get("period_label") or "",
                "UNITID": unitid,
                "Institution": name,
                "Total": row["total"],
                "International": row.get("international") if row.get("international") is not None else "",
                "Domestic": row.get("domestic") if row.get("domestic") is not None else "",
                "OutOfState": row.get("out_of_state") if row.get("out_of_state") is not None else "",
                "Source": row.get("source") or "",
                "SourceURL": row.get("source_url") or "",
                "SourceType": row.get("source_type") or "",
            }
        )

    years = [r["DataYear"] for r in inst_rows if r["DataYear"]]
    year_min = min(years) if years else ""
    year_max = max(years) if years else ""
    if year_min == year_max:
        year_range = str(year_min)
    else:
        year_range = f"{year_min}–{year_max}"

    agg_total = sum(r["Total"] for r in inst_rows)
    intl_vals = [parse_int(str(r["International"])) if r["International"] != "" else None for r in inst_rows]
    dom_vals = [parse_int(str(r["Domestic"])) if r["Domestic"] != "" else None for r in inst_rows]
    oos_vals = [parse_int(str(r["OutOfState"])) if r["OutOfState"] != "" else None for r in inst_rows]

    agg_intl = sum_metric(intl_vals) or 0
    # Complement of reported international within ecosystem total (adds to headline total)
    agg_domestic_complement = max(agg_total - agg_intl, 0)
    agg_oos = sum_metric(oos_vals)

    override_count = sum(1 for r in inst_rows if r["SourceType"] == "institutional_official")
    reporting_label = "Latest reported enrollment (mixed official sources)"
    notes = (
        "Each institution uses the most recent official headcount available: institutional fact books/CDS "
        "where published for Fall 2024–2025, otherwise NCES IPEDS Fall Enrollment (EF) through 2023. "
        "Totals are fall/census headcount (undergraduate + graduate). "
        "International is summed where institutions report nonresident enrollment; domestic is the "
        "ecosystem total minus that international sum (complementary pair). "
        "Out-of-state is a separate reported count of students from outside Massachusetts, not a third "
        "slice of the headline total. "
        f"Institutional overrides: {override_count} of {len(inst_rows)}."
    )

    metrics = [
        ("total_students", agg_total, "All enrolled students (undergraduate + graduate)"),
        ("international_students", agg_intl, "International students"),
        ("domestic_students", agg_domestic_complement, "Domestic students"),
        ("out_of_state_students", agg_oos, "Out-of-state students"),
        ("reporting_label", reporting_label, "Data vintage label for the hero section"),
        ("data_year_min", year_min, "Earliest institution reporting year in this sum"),
        ("data_year_max", year_max, "Latest institution reporting year in this sum"),
        ("data_year_range", year_range, "Span of reporting years across institutions"),
    ]

    inst_fields = [
        "DataYear",
        "PeriodLabel",
        "UNITID",
        "Institution",
        "Total",
        "Domestic",
        "International",
        "OutOfState",
        "Source",
        "SourceURL",
        "SourceType",
    ]

    OUT_INST.parent.mkdir(parents=True, exist_ok=True)
    with OUT_INST.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=inst_fields)
        writer.writeheader()
        writer.writerows(inst_rows)

    agg_fields = [
        "Metric",
        "Value",
        "Label",
        "InstitutionCount",
        "DataYearRange",
        "Source",
        "Notes",
    ]

    def write_agg(path: Path) -> None:
        with path.open("w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=agg_fields)
            writer.writeheader()
            for key, value, label in metrics:
                writer.writerow(
                    {
                        "Metric": key,
                        "Value": value if value is not None and not isinstance(value, str) else value,
                        "Label": label,
                        "InstitutionCount": len(inst_rows),
                        "DataYearRange": year_range,
                        "Source": "NCES IPEDS + institutional fact books/CDS",
                        "Notes": notes,
                    }
                )

    write_agg(OUT_AGG)
    write_agg(WEBSITE_AGG)

    print(f"Institutions: {len(inst_rows)} / {len(institutions)} ({override_count} institutional overrides)")
    if missing:
        print("Missing:", ", ".join(missing), file=sys.stderr)
    print(f"Reporting years: {year_range}")
    print(f"Ecosystem total students: {agg_total:,}")
    if agg_intl is not None:
        print(f"International: {agg_intl:,}")
    print(f"Domestic (ecosystem total − international): {agg_domestic_complement:,}")
    if agg_oos is not None:
        print(f"Out-of-state (Part C aggregate): {agg_oos:,}")
    print(f"Wrote {OUT_INST}")
    print(f"Wrote {OUT_AGG}")
    print(f"Wrote {WEBSITE_AGG}")


if __name__ == "__main__":
    build()
