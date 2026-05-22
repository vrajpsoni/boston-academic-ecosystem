#!/usr/bin/env python3
"""
One-time builder: Greater Boston enrollment CSV from NCES IPEDS Fall Enrollment (EF).

Downloads EF{year}A.zip and EF{year}C.zip from NCES Data Center (no scraping).
Output: data/greater_boston_enrollment_v1.csv

Schema: Year,University,Total,Domestic,International,OutOfState
"""

from __future__ import annotations

import csv
import os
import urllib.request
import zipfile
from io import TextIOWrapper
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT / "raw" / "ipeds_ef"
OUT_CSV = ROOT / "greater_boston_enrollment_v1.csv"

# NCES IPEDS unit IDs (Institutional Directory)
UNIVERSITIES = {
    166027: "Harvard University",
    166683: "MIT",
    164988: "Boston University",
    167358: "Northeastern University",
    167987: "UMass Boston",
    164924: "Boston College",
}

# IPEDS EF collection years to pull (Fall enrollment for that cycle)
YEARS = list(range(2004, 2024))  # 2004–2023; add 2024 when NCES publishes EF2024A


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


def download_zip(year: int, part: str) -> Path:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    path = RAW_DIR / f"EF{year}{part}.zip"
    if path.exists() and path.stat().st_size > 10_000:
        return path
    url = f"https://nces.ed.gov/ipeds/datacenter/data/EF{year}{part}.zip"
    print(f"Downloading {url}")
    urllib.request.urlretrieve(url, path)
    return path


def open_ef_csv(zip_path: Path) -> tuple[csv.DictReader, zipfile.ZipFile]:
    zf = zipfile.ZipFile(zip_path)
    csv_name = next(
        n
        for n in zf.namelist()
        if n.lower().endswith(".csv") and "_rv" not in n.lower()
    )
    handle = TextIOWrapper(zf.open(csv_name), encoding="utf-8", errors="replace")
    return csv.DictReader(handle), zf


def extract_totals_a(year: int) -> dict[int, dict[str, int | None]]:
    """Returns unitid -> {total, international}."""
    path = download_zip(year, "A")
    out: dict[int, dict[str, int | None]] = {}

    reader, zf = open_ef_csv(path)
    cols = reader.fieldnames or []
    use_eftotlt = "EFTOTLT" in cols
    use_efrace24 = "EFRACE24" in cols
    has_nral = "EFNRALT" in cols

    for row in reader:
        unitid = parse_int(row.get("UNITID"))
        if unitid not in UNIVERSITIES:
            continue
        if row.get("EFALEVEL", "").strip() != "1":
            continue
        if row.get("LINE", "").strip() != "29":
            continue
        lstudy = row.get("LSTUDY", "").strip()
        if lstudy not in ("4", "99"):
            continue

        total = None
        if use_eftotlt:
            total = parse_int(row.get("EFTOTLT"))
        elif use_efrace24:
            total = parse_int(row.get("EFRACE24"))

        intl = parse_int(row.get("EFNRALT")) if has_nral else None

        if total is None:
            continue

        prev = out.get(unitid)
        if prev is None or lstudy == "4":
            out[unitid] = {"total": total, "international": intl}

    zf.close()
    return out


def extract_out_of_state_c(year: int) -> dict[int, int | None]:
    """
    IPEDS EF Part C: first-time FT degree-seeking undergraduates by state of residence.
    EFCSTATE 58 / LINE 999 is the reported out-of-state aggregate when present.
    """
    path = download_zip(year, "C")
    out: dict[int, int | None] = {}

    reader, zf = open_ef_csv(path)
    for row in reader:
        unitid = parse_int(row.get("UNITID"))
        if unitid not in UNIVERSITIES:
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


def build_rows() -> list[dict[str, str | int]]:
    rows: list[dict[str, str | int]] = []

    for year in YEARS:
        totals = extract_totals_a(year)
        oos = extract_out_of_state_c(year)

        for unitid, name in UNIVERSITIES.items():
            t = totals.get(unitid)
            if not t:
                continue

            total = t["total"]
            intl = t.get("international")
            domestic = total - intl if intl is not None else ""

            rows.append(
                {
                    "Year": year,
                    "University": name,
                    "Total": total,
                    "Domestic": domestic if domestic != "" else "",
                    "International": intl if intl is not None else "",
                    "OutOfState": oos.get(unitid, "") or "",
                }
            )

    rows.sort(key=lambda r: (r["University"], r["Year"]))
    return rows


def main() -> None:
    rows = build_rows()
    OUT_CSV.parent.mkdir(parents=True, exist_ok=True)

    fieldnames = ["Year", "University", "Total", "Domestic", "International", "OutOfState"]
    with OUT_CSV.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Wrote {len(rows)} rows to {OUT_CSV}")


if __name__ == "__main__":
    main()
