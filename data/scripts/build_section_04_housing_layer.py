#!/usr/bin/env python3
"""Extract Layer A (housing / student pressure) from Boston neighborhood ACS bundle."""

from __future__ import annotations

import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "data/section_04/raw/housing/boston_population_estimates_2025_neighborhood.csv"
GEO = ROOT / "data/section_04/processed/greater_boston_geography_v1.csv"
OUT = ROOT / "data/section_04/processed/layer_a_housing_pressure_v1.csv"

SOURCE_ID = "SRC-BOS-POP-2025"
SOURCE_URL = (
    "https://data.boston.gov/dataset/2025-boston-population-estimates-neighborhood-level"
)
ACCESS_DATE = "2026-05-20"
YEAR = 2025


def load_geo_name_to_id() -> dict[str, str]:
    mapping: dict[str, str] = {}
    with GEO.open(encoding="utf-8") as f:
        for row in csv.DictReader(f):
            if row.get("geo_type") == "boston_neighborhood":
                mapping[row["geo_name"].strip().lower()] = row["geo_id"]
    return mapping


def fnum(val: str) -> float | None:
    if val is None or val == "":
        return None
    try:
        return float(val)
    except ValueError:
        return None


def emit_metric(rows: list, geo_id: str, geo_name: str, key: str, value, unit: str, notes: str = "") -> None:
    if value is None:
        return
    rows.append(
        {
            "geo_id": geo_id,
            "geo_name": geo_name,
            "layer": "housing_pressure",
            "metric_key": key,
            "metric_value": value,
            "unit": unit,
            "year": YEAR,
            "source_id": SOURCE_ID,
            "source_url": SOURCE_URL,
            "access_date": ACCESS_DATE,
            "notes": notes,
        }
    )


def main() -> None:
    if not RAW.exists():
        raise SystemExit(f"Download raw file first: {RAW}")
    if not GEO.exists():
        raise SystemExit("Run build_section_04_geography.py first")

    name_to_id = load_geo_name_to_id()
    out_rows: list[dict] = []

    with RAW.open(encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = (row.get("name") or "").strip()
            geo_id = name_to_id.get(name.lower())
            if not geo_id:
                continue

            total_pop = fnum(row.get("population_b01001_001e"))
            male_20_24 = fnum(row.get("population_b01001_male20_to_24years"))
            female_20_24 = fnum(row.get("population_b01001_female20_to_24years"))
            avg_hh = fnum(row.get("housing_avehhsize"))
            poverty_total = fnum(row.get("income_b17001_002e"))
            poverty_count = fnum(row.get("income_b17001_below_pov_18to24"))  # partial proxy
            irh_units = fnum(row.get("housing_housingmaster_2024"))

            young_adults = None
            if male_20_24 is not None and female_20_24 is not None:
                young_adults = male_20_24 + female_20_24
            young_share = None
            if young_adults is not None and total_pop and total_pop > 0:
                young_share = round(young_adults / total_pop, 4)

            emit_metric(out_rows, geo_id, name, "total_population", total_pop, "persons")
            emit_metric(out_rows, geo_id, name, "population_age_20_24", young_adults, "persons")
            emit_metric(
                out_rows,
                geo_id,
                name,
                "population_age_20_24_share",
                young_share,
                "proportion",
                "Proxy for student-age concentration; not enrollment counts",
            )
            emit_metric(out_rows, geo_id, name, "avg_household_size", avg_hh, "persons")
            emit_metric(
                out_rows,
                geo_id,
                name,
                "income_restricted_housing_units_2024",
                irh_units,
                "units",
                "Boston housing master inventory field",
            )
            emit_metric(
                out_rows,
                geo_id,
                name,
                "poverty_population_count",
                poverty_total,
                "persons",
                "ACS B17001 total below poverty (neighborhood rollup)",
            )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    fields = [
        "geo_id",
        "geo_name",
        "layer",
        "metric_key",
        "metric_value",
        "unit",
        "year",
        "source_id",
        "source_url",
        "access_date",
        "notes",
    ]
    with OUT.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(out_rows)

    print(f"Wrote {len(out_rows)} housing metrics -> {OUT}")


if __name__ == "__main__":
    main()
