#!/usr/bin/env python3
"""Extract Layer C (innovation / workforce) from Boston neighborhood ACS bundle."""

from __future__ import annotations

import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "data/section_04/raw/housing/boston_population_estimates_2025_neighborhood.csv"
GEO = ROOT / "data/section_04/processed/greater_boston_geography_v1.csv"
OUT = ROOT / "data/section_04/processed/layer_c_innovation_workforce_v1.csv"

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


def emit(rows: list, geo_id: str, geo_name: str, key: str, value, unit: str, notes: str = "") -> None:
    if value is None:
        return
    rows.append(
        {
            "geo_id": geo_id,
            "geo_name": geo_name,
            "layer": "innovation_workforce",
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
    if not RAW.exists() or not GEO.exists():
        raise SystemExit("Run geography build and download Boston population CSV first")

    name_to_id = load_geo_name_to_id()
    out_rows: list[dict] = []

    with RAW.open(encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            name = (row.get("name") or "").strip()
            geo_id = name_to_id.get(name.lower())
            if not geo_id:
                continue

            bachelors = fnum(row.get("education_b15003_022e"))
            edu_total = fnum(row.get("education_b15003_001e"))
            grad_prof = fnum(row.get("education_b15003_gradprofdegree"))
            transit_commute = fnum(row.get("labor_b08301_019e"))
            bike_commute = fnum(row.get("labor_b08301_taxi_motorcycle_bicycle_other"))
            commute_total = fnum(row.get("labor_b08301_001e"))
            prof_employed = fnum(row.get("labor_c24010_063e"))  # management/professional proxy
            labor_total = fnum(row.get("labor_c24010_001e"))

            bachelors_share = None
            if bachelors is not None and edu_total and edu_total > 0:
                bachelors_share = round(bachelors / edu_total, 4)

            transit_share = None
            if transit_commute is not None and commute_total and commute_total > 0:
                transit_share = round(transit_commute / commute_total, 4)

            prof_share = None
            if prof_employed is not None and labor_total and labor_total > 0:
                prof_share = round(prof_employed / labor_total, 4)

            emit(out_rows, geo_id, name, "education_bachelors_count", bachelors, "persons")
            emit(
                out_rows,
                geo_id,
                name,
                "education_bachelors_share",
                bachelors_share,
                "proportion",
            )
            emit(out_rows, geo_id, name, "education_grad_prof_count", grad_prof, "persons")
            emit(
                out_rows,
                geo_id,
                name,
                "commute_public_transit_count",
                transit_commute,
                "workers",
            )
            emit(
                out_rows,
                geo_id,
                name,
                "commute_public_transit_share",
                transit_share,
                "proportion",
            )
            emit(
                out_rows,
                geo_id,
                name,
                "commute_bike_other_count",
                bike_commute,
                "workers",
            )
            emit(
                out_rows,
                geo_id,
                name,
                "employment_management_professional_count",
                prof_employed,
                "workers",
            )
            emit(
                out_rows,
                geo_id,
                name,
                "employment_management_professional_share",
                prof_share,
                "proportion",
                "ACS occupation category proxy for knowledge-work density",
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

    print(f"Wrote {len(out_rows)} innovation/workforce metrics -> {OUT}")


if __name__ == "__main__":
    main()
