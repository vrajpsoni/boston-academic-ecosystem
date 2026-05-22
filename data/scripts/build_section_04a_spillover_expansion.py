#!/usr/bin/env python3
"""
Expand Section 04A geography + Layer A metrics into adjacent academically connected cities.

- Boundaries: OpenStreetMap administrative relations (documented Overpass query)
- Demographics: ACS B01001 age 20-24 via Census Reporter API or cached
  data/section_04/raw/housing/adjacent_places_acs_b01001_v1.json

Outputs:
  data/section_04/processed/student_ecosystem_boundaries.geojson
  website/data/student_ecosystem_boundaries.geojson
  Appends place rows to layer_a_housing_pressure_v1.csv + website copy
"""

from __future__ import annotations

import csv
import json
import urllib.parse
import urllib.request
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW_GEO = ROOT / "data/section_04/raw/geography/boston_neighborhood_boundaries.geojson"
OSM_CACHE = ROOT / "data/section_04/raw/geography/adjacent_places_osm_overpass.json"
ACS_CACHE = ROOT / "data/section_04/raw/housing/adjacent_places_acs_b01001_v1.json"
HOUSING_SUPPLEMENTS = ROOT / "data/section_04/raw/housing/layer_a_housing_supplements_v1.json"
GEO_CSV = ROOT / "data/section_04/processed/greater_boston_geography_v1.csv"
LAYER_OUT = ROOT / "data/section_04/processed/layer_a_housing_pressure_v1.csv"
GEOJSON_OUT = ROOT / "data/section_04/processed/student_ecosystem_boundaries.geojson"
WEB_GEO = ROOT / "website/data/student_ecosystem_boundaries.geojson"
WEB_LAYER = ROOT / "website/data/layer_a_housing_pressure.csv"

OVERPASS_URL = "https://overpass.kumi.systems/api/interpreter"
OVERPASS_QUERY = """
[out:json][timeout:120];
area["ISO3166-2"="US-MA"]->.ma;
(
  relation["boundary"="administrative"]["admin_level"="8"]["name"="Cambridge"](area.ma);
  relation["boundary"="administrative"]["admin_level"="8"]["name"="Somerville"](area.ma);
  relation["boundary"="administrative"]["admin_level"="8"]["name"="Chelsea"](area.ma);
  relation["boundary"="administrative"]["admin_level"="8"]["name"="Revere"](area.ma);
  relation["boundary"="administrative"]["admin_level"="8"]["name"="Medford"](area.ma);
);
out geom;
"""

# geo_id (project), OSM relation name
SPILLOVER = [
    ("place_ma_11000", "Cambridge"),
    ("place_ma_62535", "Somerville"),
    ("place_ma_13205", "Chelsea"),
    ("place_ma_56395", "Revere"),
    ("place_ma_39835", "Medford"),
]

NAME_TO_GEO = {name: geo_id for geo_id, name in SPILLOVER}

SOURCE_BOUNDARY = "SRC-OSM-ADMIN-8"
SOURCE_ACS = "SRC-ACS-CR-API"
ACS_URL = "https://api.censusreporter.org/"
ACCESS_DATE = "2026-05-22"
YEAR = 2025


def fetch_overpass() -> dict:
    OSM_CACHE.parent.mkdir(parents=True, exist_ok=True)
    data = urllib.parse.urlencode({"data": OVERPASS_QUERY}).encode()
    req = urllib.request.Request(
        OVERPASS_URL,
        data=data,
        method="POST",
        headers={"User-Agent": "CS617Proposal/1.0 (academic research)"},
    )
    with urllib.request.urlopen(req, timeout=180) as resp:
        payload = json.loads(resp.read().decode("utf-8"))
    OSM_CACHE.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return payload


def _close_enough(a: tuple[float, float], b: tuple[float, float], eps: float = 1e-6) -> bool:
    return abs(a[0] - b[0]) <= eps and abs(a[1] - b[1]) <= eps


def _way_line(member: dict) -> list[tuple[float, float]]:
    return [(p["lon"], p["lat"]) for p in member.get("geometry") or []]


def _ring_from_outer_members(members: list[dict]) -> list[list[tuple[float, float]]]:
    outers = [
        m
        for m in members
        if m.get("role") == "outer" and m.get("type") == "way" and m.get("geometry")
    ]
    if not outers:
        return []

    unused = [_way_line(m) for m in outers if len(_way_line(m)) >= 2]
    rings: list[list[tuple[float, float]]] = []

    while unused:
        ring = unused.pop(0)
        if ring[0] != ring[-1]:
            ring = ring + [ring[0]]
        extended = True
        while extended:
            extended = False
            end = ring[-2]
            start = ring[0]
            i = 0
            while i < len(unused):
                line = unused[i]
                if not line:
                    unused.pop(i)
                    continue
                fwd = line
                rev = list(reversed(line))
                if _close_enough(end, fwd[0]):
                    ring = ring[:-1] + fwd
                    unused.pop(i)
                    extended = True
                    continue
                if _close_enough(end, rev[0]):
                    ring = ring[:-1] + rev
                    unused.pop(i)
                    extended = True
                    continue
                if _close_enough(start, fwd[-1]):
                    ring = fwd + ring[1:]
                    unused.pop(i)
                    extended = True
                    continue
                if _close_enough(start, rev[-1]):
                    ring = rev + ring[1:]
                    unused.pop(i)
                    extended = True
                    continue
                i += 1
            if ring[0] != ring[-1]:
                ring.append(ring[0])
        if len(ring) >= 4:
            rings.append(ring)
    return rings


def relation_to_feature(element: dict, geo_id: str) -> dict | None:
    rings = _ring_from_outer_members(element.get("members") or [])
    if not rings:
        return None
    name = (element.get("tags") or {}).get("name") or geo_id
    if len(rings) == 1:
        geom = {"type": "Polygon", "coordinates": [rings[0]]}
    else:
        geom = {"type": "MultiPolygon", "coordinates": [[r] for r in rings]}
    return {
        "type": "Feature",
        "properties": {
            "geo_id": geo_id,
            "name": name,
            "geo_type": "census_place",
            "boundary_source": "OpenStreetMap administrative level 8",
        },
        "geometry": geom,
    }


def bos_geo_id(props: dict) -> str:
    raw = props.get("neighborhood_id") or props.get("OBJECTID") or ""
    id_str = str(raw).strip()
    if len(id_str) == 1:
        id_str = "0" + id_str
    elif len(id_str) > 2:
        id_str = id_str[-2:]
    return f"bos_nbhd_{id_str}"


def load_acs_places() -> list[dict]:
    data = json.loads(ACS_CACHE.read_text(encoding="utf-8"))
    return data.get("places") or []


def load_existing_layer_rows() -> list[dict]:
    if not LAYER_OUT.exists():
        raise SystemExit(f"Run build_section_04_housing_layer.py first: {LAYER_OUT}")
    with LAYER_OUT.open(encoding="utf-8") as f:
        return list(csv.DictReader(f))


def place_geo_ids() -> set[str]:
    return {gid for gid, _ in SPILLOVER}


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
            "source_id": SOURCE_ACS,
            "source_url": ACS_URL,
            "access_date": ACCESS_DATE,
            "notes": notes,
        }
    )


def apply_housing_supplements(rows: list[dict]) -> None:
    """Fill Boston polygons omitted from the 2025 neighborhood ACS CSV (documented parent proxies)."""
    if not HOUSING_SUPPLEMENTS.exists():
        return

    payload = json.loads(HOUSING_SUPPLEMENTS.read_text(encoding="utf-8"))
    metrics_by_id: dict[str, dict[str, float]] = {}
    for row in rows:
        gid = (row.get("geo_id") or "").strip()
        key = (row.get("metric_key") or "").strip()
        if not gid or not key:
            continue
        try:
            metrics_by_id.setdefault(gid, {})[key] = float(row["metric_value"])
        except (TypeError, ValueError):
            continue

    supplement_ids = {p["geo_id"] for p in payload.get("proxies", [])}
    rows[:] = [r for r in rows if r.get("geo_id") not in supplement_ids]

    for proxy in payload.get("proxies", []):
        geo_id = proxy["geo_id"]
        geo_name = proxy["geo_name"]
        note = proxy.get("notes") or payload.get("methodology", "")

        if proxy.get("parent_geo_id"):
            parent = metrics_by_id.get(proxy["parent_geo_id"], {})
            ratio = float(proxy.get("acreage_ratio") or 1)
            share = parent.get("population_age_20_24_share")
            parent_young = parent.get("population_age_20_24")
            parent_total = parent.get("total_population")
            if share is None:
                continue
            young = round(parent_young * ratio, 1) if parent_young is not None else None
            total = round(parent_total * ratio, 1) if parent_total is not None else None
        else:
            share = proxy.get("population_age_20_24_share")
            young = proxy.get("population_age_20_24")
            total = proxy.get("total_population")

        source_id = payload.get("source_id", SOURCE_ACS)
        source_url = payload.get("source_url", ACS_URL)
        access = payload.get("access_date", ACCESS_DATE)

        def emit(key: str, value, unit: str, extra: str = "") -> None:
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
                    "source_id": source_id,
                    "source_url": source_url,
                    "access_date": access,
                    "notes": extra or note,
                }
            )

        emit("total_population", total, "persons", note)
        emit("population_age_20_24", young, "persons", note)
        emit(
            "population_age_20_24_share",
            share,
            "proportion",
            "Proxy for student-age concentration; not enrollment counts. " + note,
        )


def append_place_metrics(rows: list[dict], places: list[dict]) -> None:
    existing_ids = place_geo_ids()
    rows[:] = [r for r in rows if r.get("geo_id") not in existing_ids]

    for place in places:
        geo_id = place["geo_id"]
        name = place["geo_name"]
        total = place["total_population"]
        young = place["population_age_20_24"]
        share = place["population_age_20_24_share"]
        note = place.get("source_note") or "ACS B01001 age 20-24 proxy; not enrollment"
        emit_metric(rows, geo_id, name, "total_population", total, "persons", note)
        emit_metric(rows, geo_id, name, "population_age_20_24", young, "persons", note)
        emit_metric(
            rows,
            geo_id,
            name,
            "population_age_20_24_share",
            share,
            "proportion",
            "Proxy for student-age concentration; not enrollment counts. " + note,
        )


def update_geography_csv() -> None:
    if not GEO_CSV.exists():
        raise SystemExit(f"Missing geography spine: {GEO_CSV}")

    rows = list(csv.DictReader(GEO_CSV.open(encoding="utf-8")))
    spillover_ids = place_geo_ids()
    rows = [
        r
        for r in rows
        if r.get("geo_id") not in spillover_ids
        and not (r.get("geo_name") == "Chelsea" and r.get("geo_id") == "place_ma_16190")
    ]

    spillover_meta = {
        "Cambridge": ("Cambridge", 42.3736, -71.1097, "university-adjacent spillover hub"),
        "Somerville": ("Somerville", 42.3876, -71.0995, "secondary spillover hub"),
        "Chelsea": ("Chelsea", 42.3918, -71.0328, "MBTA-adjacent spillover"),
        "Revere": ("Revere", 42.4081, -71.0115, "Blue Line corridor spillover"),
        "Medford": ("Medford", 42.4184, -71.1062, "Tufts / Route 16 adjacency"),
    }
    for geo_id, name in SPILLOVER:
        city, lat, lon, note = spillover_meta[name]
        rows.append(
            {
                "geo_id": geo_id,
                "geo_name": name,
                "geo_type": "census_place",
                "city": city,
                "state": "MA",
                "lat": lat,
                "lon": lon,
                "source_id": SOURCE_BOUNDARY,
                "boundary_source": f"OSM admin boundary; {note}",
            }
        )

    fieldnames = list(rows[0].keys()) if rows else []
    with GEO_CSV.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows)


def build_merged_geojson(osm_payload: dict) -> dict:
    boston = json.loads(RAW_GEO.read_text(encoding="utf-8"))
    features: list[dict] = []

    for feat in boston.get("features") or []:
        copy = deepcopy(feat)
        props = copy.setdefault("properties", {})
        props["geo_id"] = bos_geo_id(props)
        props.setdefault("geo_type", "boston_neighborhood")
        features.append(copy)

    for element in osm_payload.get("elements") or []:
        if element.get("type") != "relation":
            continue
        name = (element.get("tags") or {}).get("name")
        geo_id = NAME_TO_GEO.get(name)
        if not geo_id:
            continue
        feat = relation_to_feature(element, geo_id)
        if feat:
            features.append(feat)

    if len(features) < len(boston.get("features") or []) + len(SPILLOVER):
        raise SystemExit("Failed to build all spillover place polygons from OSM")

    return {"type": "FeatureCollection", "features": features}


def write_layer_csv(rows: list[dict]) -> None:
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
    for path in (LAYER_OUT, WEB_LAYER):
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=fields)
            w.writeheader()
            w.writerows(rows)


def main() -> None:
    if not RAW_GEO.exists():
        raise SystemExit(f"Missing Boston GeoJSON: {RAW_GEO}")
    if not ACS_CACHE.exists():
        raise SystemExit(f"Missing ACS cache: {ACS_CACHE}")

    if OSM_CACHE.exists():
        osm_payload = json.loads(OSM_CACHE.read_text(encoding="utf-8"))
    else:
        print("Fetching OSM municipal boundaries (Overpass)…")
        osm_payload = fetch_overpass()

    merged = build_merged_geojson(osm_payload)
    GEOJSON_OUT.parent.mkdir(parents=True, exist_ok=True)
    GEOJSON_OUT.write_text(json.dumps(merged), encoding="utf-8")
    WEB_GEO.write_text(json.dumps(merged), encoding="utf-8")

    layer_rows = load_existing_layer_rows()
    apply_housing_supplements(layer_rows)
    append_place_metrics(layer_rows, load_acs_places())
    write_layer_csv(layer_rows)
    update_geography_csv()

    print(
        f"Wrote {len(merged['features'])} features -> {GEOJSON_OUT.name}\n"
        f"Layer rows: {len(layer_rows)} -> {LAYER_OUT.name}\n"
        f"Copied to website/data/"
    )


if __name__ == "__main__":
    main()
