#!/usr/bin/env python3
"""
Optional: fetch ACS 5-year (2022) tract indicators for Suffolk/Middlesex/Norfolk counties.
Requires free CENSUS_API_KEY — https://api.census.gov/data/key_signup.html

Outputs raw JSON + processed tract-level rows for future crosswalk to neighborhoods.
Does NOT merge into layer A/B/C until tract↔neighborhood mapping is validated.
"""

from __future__ import annotations

import csv
import json
import os
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = ROOT / "data/section_04/raw/housing"
OUT_TRACT = ROOT / "data/section_04/processed/acs_tract_housing_indicators_v1.csv"

COUNTIES = [
    ("025", "Suffolk"),
    ("017", "Middlesex"),
    ("021", "Norfolk"),
]

VARS = [
    "B25064_001E",  # median gross rent
    "B25003_003E",  # renter occupied
    "B25003_001E",  # occupied units
    "B19013_001E",  # median household income
]


def fetch_tract_data(api_key: str, county: str) -> list[list[str]]:
    params = {
        "get": ",".join(["NAME"] + VARS),
        "for": "tract:*",
        "in": f"state:25 county:{county}",
        "key": api_key,
    }
    url = "https://api.census.gov/data/2022/acs/acs5?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=120) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main() -> None:
    api_key = os.environ.get("CENSUS_API_KEY", "").strip()
    if not api_key:
        raise SystemExit("Set CENSUS_API_KEY (see https://api.census.gov/data/key_signup.html)")

    RAW_DIR.mkdir(parents=True, exist_ok=True)
    rows: list[dict] = []

    for county_fips, county_name in COUNTIES:
        data = fetch_tract_data(api_key, county_fips)
        (RAW_DIR / f"acs2022_tracts_county_{county_fips}.json").write_text(
            json.dumps(data, indent=2), encoding="utf-8"
        )
        header = data[0]
        for rec in data[1:]:
            record = dict(zip(header, rec))
            tract = record.get("tract")
            state = record.get("state")
            geo_id = f"tract_{state}{county_fips}{tract}"
            rent = record.get("B25064_001E")
            renters = record.get("B25003_003E")
            occupied = record.get("B25003_001E")
            income = record.get("B19013_001E")
            renter_share = None
            try:
                if int(occupied) > 0:
                    renter_share = round(int(renters) / int(occupied), 4)
            except (TypeError, ValueError):
                pass

            for key, val, unit in [
                ("median_gross_rent", rent, "usd"),
                ("renter_occupied_units", renters, "units"),
                ("renter_share", renter_share, "proportion"),
                ("median_household_income", income, "usd"),
            ]:
                if val in (None, "", "-", "null"):
                    continue
                rows.append(
                    {
                        "geo_id": geo_id,
                        "geo_name": record.get("NAME", ""),
                        "geo_type": "census_tract",
                        "county": county_name,
                        "metric_key": key,
                        "metric_value": val,
                        "unit": unit,
                        "year": 2022,
                        "source_id": "SRC-ACS-2022-5YR",
                        "source_url": "https://www.census.gov/programs-surveys/acs",
                        "access_date": "2026-05-20",
                    }
                )

    fields = list(rows[0].keys()) if rows else []
    with OUT_TRACT.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)

    print(f"Wrote {len(rows)} tract metric rows -> {OUT_TRACT}")


if __name__ == "__main__":
    main()
