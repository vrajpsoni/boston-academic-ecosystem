#!/usr/bin/env python3
"""
Apply documented POI supplements + expanded OSM corridor fetch for Section 04B.

Reads ecosystem_poi_supplements_v1.json and raises metrics with max(osm, floor).
Optionally refreshes Cambridge corridor counts via Overpass (expanded tags).

Outputs:
  - data/section_04/processed/layer_b_corridor_osm_v1.csv
  - website/data/section_04b_corridor_osm.csv
  - data/section_04/processed/layer_b_business_density_v1.csv
  - website/data/layer_b_business_density.csv

Then run: python3 data/scripts/build_section_04b_activity_from_sources.py

Usage:
  python3 data/scripts/enrich_section_04b_ecosystem_data.py
  python3 data/scripts/enrich_section_04b_ecosystem_data.py --fetch-osm
"""

from __future__ import annotations

import argparse
import csv
import json
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SUPPLEMENTS = ROOT / "data/section_04/raw/business/ecosystem_poi_supplements_v1.json"
CORRIDOR_PROCESSED = ROOT / "data/section_04/processed/layer_b_corridor_osm_v1.csv"
CORRIDOR_WEB = ROOT / "website/data/section_04b_corridor_osm.csv"
BOSTON_PROCESSED = ROOT / "data/section_04/processed/layer_b_business_density_v1.csv"
BOSTON_WEB = ROOT / "website/data/layer_b_business_density.csv"
BUILD_CORRIDOR = ROOT / "data/scripts/build_section_04_corridor_osm.py"
BUILD_ACTIVITY = ROOT / "data/scripts/build_section_04b_activity_from_sources.py"

METRIC_KEYS = (
    "osm_cafe_count",
    "osm_restaurant_count",
    "osm_bookstore_count",
    "osm_coworking_count",
)


def load_supplements() -> tuple[dict[str, dict[str, int]], dict[str, dict[str, int]]]:
    data = json.loads(SUPPLEMENTS.read_text(encoding="utf-8"))
    hub_floors: dict[str, dict[str, int]] = defaultdict(dict)
    geo_floors: dict[str, dict[str, int]] = defaultdict(dict)
    for item in data.get("hub_supplements", []):
        hid = item["hub_id"]
        for key, spec in item.get("metrics", {}).items():
            hub_floors[hid][key] = int(spec["floor"])
    for item in data.get("geo_supplements", []):
        gid = item["geo_id"]
        for key, spec in item.get("metrics", {}).items():
            geo_floors[gid][key] = int(spec["floor"])
    return hub_floors, geo_floors


def apply_floors_to_index(
    index: dict[str, dict[str, float]],
    floors: dict[str, dict[str, int]],
) -> int:
    changes = 0
    for entity_id, floor_metrics in floors.items():
        bucket = index.setdefault(entity_id, {})
        for key, floor in floor_metrics.items():
            cur = float(bucket.get(key, 0))
            if cur < floor:
                bucket[key] = float(floor)
                changes += 1
    return changes


def load_long_csv(path: Path) -> tuple[list[dict], list[str]]:
    with path.open(encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fieldnames = list(reader.fieldnames or [])
        rows = list(reader)
    return rows, fieldnames


def index_from_long_rows(rows: list[dict], id_key: str) -> dict[str, dict[str, float]]:
    out: dict[str, dict[str, float]] = defaultdict(dict)
    for row in rows:
        eid = row[id_key]
        key = row["metric_key"]
        out[eid][key] = float(row["metric_value"])
    return out


def write_long_csv(
    path: Path,
    fieldnames: list[str],
    id_key: str,
    name_key: str,
    layer: str,
    index: dict[str, dict[str, float]],
    names: dict[str, str],
    notes_default: str,
    source_id: str = "SRC-OSM-OVERPASS+SRC-ENRICHMENT",
) -> None:
    rows: list[dict] = []
    for eid in sorted(index.keys()):
        metrics = index[eid]
        name = names.get(eid, eid)
        for metric_key in METRIC_KEYS:
            if metric_key not in metrics:
                continue
            rows.append(
                {
                    id_key: eid,
                    name_key: name,
                    "layer": layer,
                    "metric_key": metric_key,
                    "metric_value": int(metrics[metric_key]),
                    "unit": "poi_count",
                    "year": "2026",
                    "source_id": source_id,
                    "source_url": "https://www.openstreetmap.org/",
                    "access_date": "2026-05-22",
                    "notes": notes_default,
                }
            )
        cafe = int(metrics.get("osm_cafe_count", 0))
        rest = int(metrics.get("osm_restaurant_count", 0))
        rows.append(
            {
                id_key: eid,
                name_key: name,
                "layer": layer,
                "metric_key": "osm_social_poi_total",
                "metric_value": cafe + rest,
                "unit": "poi_count",
                "year": "2026",
                "source_id": source_id,
                "source_url": "https://www.openstreetmap.org/",
                "access_date": "2026-05-22",
                "notes": "Sum of cafe + restaurant counts (enriched where documented)",
            }
        )
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows)
    print(f"Wrote {path} ({len(rows)} rows)", flush=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--fetch-osm",
        action="store_true",
        help="Re-run expanded Overpass corridor fetch before applying supplements",
    )
    parser.add_argument("--skip-activity", action="store_true")
    args = parser.parse_args()

    if args.fetch_osm:
        print("Fetching expanded corridor OSM...", flush=True)
        subprocess.run([sys.executable, str(BUILD_CORRIDOR)], check=True)

    hub_floors, geo_floors = load_supplements()

    # --- Corridor CSV ---
    c_rows, c_fields = load_long_csv(CORRIDOR_PROCESSED)
    c_index = index_from_long_rows(c_rows, "hub_id")
    c_names = {r["hub_id"]: r["hub_name"] for r in c_rows}
    n = apply_floors_to_index(c_index, hub_floors)
    print(f"Corridor hub metric raises: {n}", flush=True)
    for path in (CORRIDOR_PROCESSED, CORRIDOR_WEB):
        write_long_csv(
            path,
            c_fields,
            "hub_id",
            "hub_name",
            "corridor_osm",
            c_index,
            c_names,
            "OSM Overpass + documented public directory floors (ecosystem_poi_supplements_v1.json)",
        )

    # --- Boston neighborhood CSV ---
    b_rows, b_fields = load_long_csv(BOSTON_PROCESSED)
    b_index = index_from_long_rows(b_rows, "geo_id")
    b_names = {r["geo_id"]: r["geo_name"] for r in b_rows}
    n2 = apply_floors_to_index(b_index, geo_floors)
    print(f"Boston geo metric raises: {n2}", flush=True)
    for path in (BOSTON_PROCESSED, BOSTON_WEB):
        write_long_csv(
            path,
            b_fields,
            "geo_id",
            "geo_name",
            "business_density",
            b_index,
            b_names,
            "OSM nodes in neighborhood polygon + documented directory floors",
        )

    if not args.skip_activity:
        print("Rebuilding activity signals...", flush=True)
        subprocess.run([sys.executable, str(BUILD_ACTIVITY)], check=True)

    print("Section 04B data enrichment complete.", flush=True)


if __name__ == "__main__":
    main()
