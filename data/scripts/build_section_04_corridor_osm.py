#!/usr/bin/env python3
"""
Corridor-level OSM business counts for Section 04B (Cambridge / adjacent municipalities).

Fetches each POI category once for a Greater Cambridge bbox, assigns nodes to corridor
bounding boxes, writes long-format CSV keyed by hub_id.

Run: python3 data/scripts/build_section_04_corridor_osm.py
"""

from __future__ import annotations

import csv
import json
import shutil
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = ROOT / "data/section_04/raw/business/corridors"
OUT_PROCESSED = ROOT / "data/section_04/processed/layer_b_corridor_osm_v1.csv"
OUT_WEBSITE = ROOT / "website/data/section_04b_corridor_osm.csv"

OVERPASS_URLS = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass-api.de/api/interpreter",
]
USER_AGENT = "CS617-GreaterBoston-Story/1.0 (educational; local-dev)"
SOURCE_ID = "SRC-OSM-OVERPASS"
SOURCE_URL = "https://www.openstreetmap.org/"
ACCESS_DATE = "2026-05-21"
SLEEP_SEC = 4.0

# hub_id -> (name, south, west, north, east)
CORRIDORS: dict[str, tuple[str, float, float, float, float]] = {
    "hub-harvard-square": ("Harvard Square", 42.363, -71.132, 42.392, -71.108),
    "hub-kendall-mit": ("Kendall / MIT", 42.355, -71.095, 42.365, -71.082),
    "hub-cambridge-central": ("Cambridge Central", 42.358, -71.112, 42.368, -71.098),
    "hub-porter-square": ("Porter Square", 42.384, -71.122, 42.392, -71.112),
}

CATEGORIES = {
    "osm_cafe_count": ['node["amenity"=cafe]', 'node["amenity"=coffee_shop]'],
    "osm_restaurant_count": ['node["amenity"=restaurant]', 'node["amenity"=fast_food]'],
    "osm_bookstore_count": [
        'node["shop"=books]',
        'node["amenity"=library]["access"!="private"]',
    ],
    "osm_coworking_count": [
        'node["amenity"=coworking_space]',
        'node["office"=coworking]',
        'node["office"=shared]',
        'way["amenity"=coworking_space]',
        'way["office"=coworking]',
    ],
}


def union_bbox() -> tuple[float, float, float, float]:
    south = min(c[1] for c in CORRIDORS.values())
    west = min(c[2] for c in CORRIDORS.values())
    north = max(c[3] for c in CORRIDORS.values())
    east = max(c[4] for c in CORRIDORS.values())
    return south, west, north, east


def overpass_nodes(
    south: float, west: float, north: float, east: float, selectors: list[str]
) -> list[tuple[float, float]]:
    bbox = f"({south},{west},{north},{east})"
    parts = "".join(f"{sel}{bbox};" for sel in selectors)
    query = f"[out:json][timeout:90];({parts});out center;"
    data = urllib.parse.urlencode({"data": query}).encode("utf-8")
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": USER_AGENT,
    }
    last_err: Exception | None = None
    for base_url in OVERPASS_URLS:
        req = urllib.request.Request(base_url, data=data, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                body = resp.read().decode("utf-8")
            if body.lstrip().startswith("<"):
                raise RuntimeError("Overpass returned HTML")
            payload = json.loads(body)
            points: list[tuple[float, float]] = []
            for el in payload.get("elements") or []:
                lat, lon = el.get("lat"), el.get("lon")
                if lat is None or lon is None:
                    center = el.get("center") or {}
                    lat, lon = center.get("lat"), center.get("lon")
                if lat is not None and lon is not None:
                    points.append((float(lon), float(lat)))
            return points
        except Exception as exc:  # noqa: BLE001
            last_err = exc
            print(f"  {base_url} failed: {exc}", flush=True)
    raise last_err or RuntimeError("Overpass failed")


def in_corridor(lon: float, lat: float, south: float, west: float, north: float, east: float) -> bool:
    return south <= lat <= north and west <= lon <= east


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    south, west, north, east = union_bbox()
    print(f"Cambridge union bbox: S={south} W={west} N={north} E={east}", flush=True)

    counts: dict[str, dict[str, int]] = {
        hub_id: {k: 0 for k in CATEGORIES} for hub_id in CORRIDORS
    }

    for metric_key, selectors in CATEGORIES.items():
        time.sleep(SLEEP_SEC)
        print(f"Fetching {metric_key}...", flush=True)
        points = overpass_nodes(south, west, north, east, selectors)
        print(f"  {len(points)} nodes in union bbox", flush=True)
        (RAW_DIR / f"{metric_key}_nodes.json").write_text(
            json.dumps({"metric": metric_key, "node_count": len(points)}),
            encoding="utf-8",
        )
        for hub_id, spec in CORRIDORS.items():
            _name, cs, cw, cn, ce = spec
            n = sum(
                1
                for lon, lat in points
                if in_corridor(lon, lat, cs, cw, cn, ce)
            )
            counts[hub_id][metric_key] = n
            print(f"    {hub_id}: {n}", flush=True)

    rows: list[dict] = []
    for hub_id, spec in CORRIDORS.items():
        name = spec[0]
        metrics = counts[hub_id]
        social = metrics["osm_cafe_count"] + metrics["osm_restaurant_count"]
        for metric_key, val in metrics.items():
            rows.append(
                {
                    "hub_id": hub_id,
                    "hub_name": name,
                    "layer": "corridor_osm",
                    "metric_key": metric_key,
                    "metric_value": val,
                    "unit": "poi_count",
                    "year": "2026",
                    "source_id": SOURCE_ID,
                    "source_url": SOURCE_URL,
                    "access_date": ACCESS_DATE,
                    "notes": "OSM nodes in curated academic corridor bbox (Overpass API)",
                }
            )
        rows.append(
            {
                "hub_id": hub_id,
                "hub_name": name,
                "layer": "corridor_osm",
                "metric_key": "osm_social_poi_total",
                "metric_value": social,
                "unit": "poi_count",
                "year": "2026",
                "source_id": SOURCE_ID,
                "source_url": SOURCE_URL,
                "access_date": ACCESS_DATE,
                "notes": "Sum of cafe + restaurant counts in corridor bbox",
            }
        )

    fieldnames = [
        "hub_id",
        "hub_name",
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
    for path in (OUT_PROCESSED, OUT_WEBSITE):
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=fieldnames)
            w.writeheader()
            w.writerows(rows)
        print(f"Wrote {path} ({len(rows)} rows)", flush=True)


if __name__ == "__main__":
    main()
