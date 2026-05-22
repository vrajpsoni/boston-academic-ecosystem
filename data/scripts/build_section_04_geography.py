#!/usr/bin/env python3
"""Build shared geography spine from Boston neighborhood GeoJSON + adjacent places."""

from __future__ import annotations

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW_GEO = ROOT / "data/section_04/raw/geography/boston_neighborhood_boundaries.geojson"
OUT = ROOT / "data/section_04/processed/greater_boston_geography_v1.csv"

# Census-designated places in scope (names only; coords are municipal centroids for map anchoring)
# Source: U.S. Census Bureau — Place geography (reference centroids, not rankings)
ADJACENT_PLACES = [
    ("place_ma_11000", "Cambridge", "Cambridge", 42.3736, -71.1097),
    ("place_ma_62535", "Somerville", "Somerville", 42.3876, -71.0995),
    ("place_ma_07740", "Brookline", "Brookline", 42.3318, -71.1212),
    ("place_ma_39835", "Medford", "Medford", 42.4184, -71.1062),
    ("place_ma_55745", "Quincy", "Quincy", 42.2529, -70.9928),
    ("place_ma_13205", "Chelsea", "Chelsea", 42.3918, -71.0328),
    ("place_ma_56395", "Revere", "Revere", 42.4081, -71.0115),
    ("place_ma_21890", "Everett", "Everett", 42.4084, -71.0537),
    ("place_ma_38990", "Malden", "Malden", 42.4251, -71.0662),
]


def ring_centroid(coords: list) -> tuple[float, float]:
    """Average vertex centroid for a polygon ring (lon, lat in GeoJSON)."""
    if not coords:
        return 0.0, 0.0
    xs = [c[0] for c in coords]
    ys = [c[1] for c in coords]
    return sum(ys) / len(ys), sum(xs) / len(xs)


def polygon_centroid(geometry: dict) -> tuple[float, float]:
    gtype = geometry.get("type")
    coords = geometry.get("coordinates") or []
    if gtype == "Polygon" and coords:
        return ring_centroid(coords[0])
    if gtype == "MultiPolygon" and coords:
        return ring_centroid(coords[0][0])
    return 42.36, -71.06


def main() -> None:
    if not RAW_GEO.exists():
        raise SystemExit(f"Missing raw file: {RAW_GEO}")

    features = json.loads(RAW_GEO.read_text(encoding="utf-8")).get("features", [])
    rows: list[dict] = []

    for feat in features:
        props = feat.get("properties") or {}
        name = (props.get("name") or "").strip()
        nbhd_id = str(props.get("neighborhood_id") or props.get("OBJECTID") or "")
        lat, lon = polygon_centroid(feat.get("geometry") or {})
        geo_id = f"bos_nbhd_{nbhd_id.zfill(2)}"
        rows.append(
            {
                "geo_id": geo_id,
                "geo_name": name,
                "geo_type": "boston_neighborhood",
                "city": "Boston",
                "state": "MA",
                "lat": round(lat, 6),
                "lon": round(lon, 6),
                "source_id": "SRC-BOS-NBHD-GEOJSON",
                "boundary_source": "Analyze Boston BPDA Neighborhood Boundaries",
            }
        )

    for geo_id, name, city, lat, lon in ADJACENT_PLACES:
        rows.append(
            {
                "geo_id": geo_id,
                "geo_name": name,
                "geo_type": "census_place",
                "city": city,
                "state": "MA",
                "lat": lat,
                "lon": lon,
                "source_id": "SRC-CENSUS-PLACE-REF",
                "boundary_source": "Census place centroid (pending place boundary join)",
            }
        )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = [
        "geo_id",
        "geo_name",
        "geo_type",
        "city",
        "state",
        "lat",
        "lon",
        "source_id",
        "boundary_source",
    ]
    with OUT.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows)

    print(f"Wrote {len(rows)} geography rows -> {OUT}")


if __name__ == "__main__":
    main()
