#!/usr/bin/env python3
"""
Layer B — business/social density from OpenStreetMap (Overpass API).

Fetches each POI category once for Boston city bbox, then assigns nodes to
neighborhood polygons (4 API calls instead of 100+). Saves raw JSON + CSV.

Run locally with network: python3 data/scripts/build_section_04_business_osm.py
"""

from __future__ import annotations

import csv
import json
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GEOJSON = ROOT / "data/section_04/raw/geography/boston_neighborhood_boundaries.geojson"
GEO_CSV = ROOT / "data/section_04/processed/greater_boston_geography_v1.csv"
RAW_DIR = ROOT / "data/section_04/raw/business"
OUT = ROOT / "data/section_04/processed/layer_b_business_density_v1.csv"

OVERPASS_URLS = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass-api.de/api/interpreter",
]
USER_AGENT = "CS617-GreaterBoston-Story/1.0 (educational; contact: local-dev)"
SOURCE_ID = "SRC-OSM-OVERPASS"
SOURCE_URL = "https://www.openstreetmap.org/"
ACCESS_DATE = "2026-05-20"
SLEEP_SEC = 3.0
MAX_RETRIES = 3

CATEGORIES = {
    "cafe": ['node["amenity"="cafe"]', 'node["amenity"="coffee_shop"]'],
    "restaurant": ['node["amenity"="restaurant"]', 'node["amenity"="fast_food"]'],
    "bookstore": ['node["shop"="books"]'],
    "coworking": ['node["amenity"="coworking_space"]', 'node["office"="coworking"]'],
}


def polygon_rings(geometry: dict) -> list[list[tuple[float, float]]]:
    """Return exterior rings as (lon, lat) tuples."""
    gtype = geometry.get("type")
    raw = geometry.get("coordinates") or []
    rings: list[list[tuple[float, float]]] = []
    if gtype == "Polygon" and raw:
        rings.append([(c[0], c[1]) for c in raw[0]])
    elif gtype == "MultiPolygon" and raw:
        for poly in raw:
            if poly:
                rings.append([(c[0], c[1]) for c in poly[0]])
    return rings


def point_in_ring(lon: float, lat: float, ring: list[tuple[float, float]]) -> bool:
    """Ray-casting point-in-polygon."""
    inside = False
    n = len(ring)
    if n < 3:
        return False
    j = n - 1
    for i in range(n):
        xi, yi = ring[i]
        xj, yj = ring[j]
        if ((yi > lat) != (yj > lat)) and (
            lon < (xj - xi) * (lat - yi) / (yj - yi + 1e-15) + xi
        ):
            inside = not inside
        j = i
    return inside


def bbox_from_rings(rings: list[list[tuple[float, float]]]) -> tuple[float, float, float, float]:
    lats: list[float] = []
    lons: list[float] = []
    for ring in rings:
        for lon, lat in ring:
            lons.append(lon)
            lats.append(lat)
    return min(lats), min(lons), max(lats), max(lons)


def overpass_nodes(
    south: float, west: float, north: float, east: float, selectors: list[str]
) -> list[tuple[float, float]]:
    """Fetch node lat/lon inside bbox for given selectors."""
    bbox = f"({south},{west},{north},{east})"
    parts = "".join(f"{sel}{bbox};" for sel in selectors)
    query = f"[out:json][timeout:120];({parts});out body;"
    data = urllib.parse.urlencode({"data": query}).encode("utf-8")
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": USER_AGENT,
        "Accept": "application/json",
    }
    last_err: Exception | None = None
    for attempt in range(MAX_RETRIES):
        for base_url in OVERPASS_URLS:
            req = urllib.request.Request(base_url, data=data, headers=headers, method="POST")
            try:
                with urllib.request.urlopen(req, timeout=180) as resp:
                    body = resp.read().decode("utf-8")
                if body.lstrip().startswith("<"):
                    raise RuntimeError("Overpass returned HTML (server busy)")
                payload = json.loads(body)
                points: list[tuple[float, float]] = []
                for el in payload.get("elements") or []:
                    if el.get("type") != "node":
                        continue
                    lat = el.get("lat")
                    lon = el.get("lon")
                    if lat is not None and lon is not None:
                        points.append((float(lon), float(lat)))
                return points
            except Exception as exc:  # noqa: BLE001
                last_err = exc
        wait = SLEEP_SEC * (attempt + 2)
        print(f"  retry {attempt + 1}/{MAX_RETRIES} after {wait:.0f}s ({last_err})", flush=True)
        time.sleep(wait)
    raise last_err or RuntimeError("Overpass request failed")


def load_name_to_geo_id() -> dict[str, str]:
    out: dict[str, str] = {}
    with GEO_CSV.open(encoding="utf-8") as f:
        for row in csv.DictReader(f):
            if row.get("geo_type") == "boston_neighborhood":
                out[row["geo_name"].strip().lower()] = row["geo_id"]
    return out


def main() -> None:
    if not GEOJSON.exists():
        raise SystemExit(f"Missing {GEOJSON}")
    if not GEO_CSV.exists():
        raise SystemExit("Run build_section_04_geography.py first")

    RAW_DIR.mkdir(parents=True, exist_ok=True)
    name_to_id = load_name_to_geo_id()
    features = json.loads(GEOJSON.read_text(encoding="utf-8")).get("features", [])

    neighborhoods: list[dict] = []
    all_rings: list[list[tuple[float, float]]] = []

    for feat in features:
        props = feat.get("properties") or {}
        name = (props.get("name") or "").strip()
        geo_id = name_to_id.get(name.lower())
        if not geo_id:
            continue
        rings = polygon_rings(feat.get("geometry") or {})
        if not rings:
            continue
        neighborhoods.append({"geo_id": geo_id, "geo_name": name, "rings": rings})
        all_rings.extend(rings)

    if not neighborhoods:
        raise SystemExit("No Boston neighborhoods matched geography spine")

    south, west, north, east = bbox_from_rings(all_rings)
    print(
        f"Boston bbox: S={south:.4f} W={west:.4f} N={north:.4f} E={east:.4f} "
        f"({len(neighborhoods)} neighborhoods)",
        flush=True,
    )

    out_rows: list[dict] = []
    raw_log: list[dict] = []

    for cat_key, selectors in CATEGORIES.items():
        time.sleep(SLEEP_SEC)
        print(f"Fetching OSM nodes: {cat_key}...", flush=True)
        try:
            points = overpass_nodes(south, west, north, east, selectors)
        except Exception as exc:  # noqa: BLE001
            print(f"ERROR {cat_key}: {exc}", flush=True)
            for nbhd in neighborhoods:
                raw_log.append(
                    {
                        "geo_id": nbhd["geo_id"],
                        "geo_name": nbhd["geo_name"],
                        "category": cat_key,
                        "count": None,
                        "method": "point_in_polygon",
                    }
                )
            continue

        print(f"  {len(points)} nodes in city bbox", flush=True)
        (RAW_DIR / f"osm_nodes_{cat_key}.json").write_text(
            json.dumps({"category": cat_key, "node_count": len(points)}),
            encoding="utf-8",
        )

        for nbhd in neighborhoods:
            count = 0
            for lon, lat in points:
                for ring in nbhd["rings"]:
                    if point_in_ring(lon, lat, ring):
                        count += 1
                        break
            raw_log.append(
                {
                    "geo_id": nbhd["geo_id"],
                    "geo_name": nbhd["geo_name"],
                    "category": cat_key,
                    "count": count,
                    "method": "point_in_polygon",
                }
            )
            out_rows.append(
                {
                    "geo_id": nbhd["geo_id"],
                    "geo_name": nbhd["geo_name"],
                    "layer": "business_density",
                    "metric_key": f"osm_{cat_key}_count",
                    "metric_value": count,
                    "unit": "poi_count",
                    "year": ACCESS_DATE[:4],
                    "source_id": SOURCE_ID,
                    "source_url": SOURCE_URL,
                    "access_date": ACCESS_DATE,
                    "notes": "OSM nodes assigned to BPDA neighborhood polygon",
                }
            )
            print(f"  {nbhd['geo_name']}: {cat_key} = {count}", flush=True)

    (RAW_DIR / "osm_neighborhood_counts_log.json").write_text(
        json.dumps(raw_log, indent=2), encoding="utf-8"
    )

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
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(out_rows)

    print(f"Wrote {len(out_rows)} business metrics -> {OUT}", flush=True)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(130)
