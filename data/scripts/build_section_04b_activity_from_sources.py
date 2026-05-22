#!/usr/bin/env python3
"""
Build Section 04B ecosystem activity signals from reproducible public sources.

Sources (v1):
  - MIT Events iCal (engage.mit.edu) — parsed & matched to corridors by text
  - OpenStreetMap business layer (layer_b + corridor bbox CSV) — POI density
  - Curated Meetup group registry (documented slugs; no live API key)

Outputs:
  - data/section_04/raw/activity/feeds/*.ics (cached)
  - data/section_04/processed/activity_evidence_v1.json
  - data/section_04/processed/layer_b_ecosystem_activity_v1.csv
  - website/data/section_04b_ecosystem_activity.csv

Run: python3 data/scripts/build_section_04b_activity_from_sources.py
"""

from __future__ import annotations

import csv
import json
import re
import urllib.request
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REGISTRY = ROOT / "data/section_04/raw/activity/corridor_registry.json"
FEED_DIR = ROOT / "data/section_04/raw/activity/feeds"
OSM_BOSTON = ROOT / "data/section_04/processed/layer_b_business_density_v1.csv"
OSM_CORRIDOR = ROOT / "data/section_04/processed/layer_b_corridor_osm_v1.csv"
SUPPLEMENTS = ROOT / "data/section_04/raw/business/ecosystem_poi_supplements_v1.json"
OUT_EVIDENCE = ROOT / "data/section_04/processed/activity_evidence_v1.json"
OUT_CSV_PROCESSED = ROOT / "data/section_04/processed/layer_b_ecosystem_activity_v1.csv"
OUT_CSV_WEB = ROOT / "website/data/section_04b_ecosystem_activity.csv"

USER_AGENT = "CS617-GreaterBoston-Story/1.0 (academic research; contact local-dev)"
ACCESS_DATE = datetime.now(timezone.utc).strftime("%Y-%m-%d")

INNOVATION_KW = re.compile(
    r"\b(startup|innovation|entrepreneur|hackathon|demo\s*day|venture|ai\b|tech|"
    r"founder|pitch|biotech|solve|robotics|engineering)\b",
    re.I,
)
STUDENT_KW = re.compile(
    r"\b(student|graduate|undergrad|campus|university|college|orientation|"
    r"career\s*fair|club|association)\b",
    re.I,
)
CULTURAL_KW = re.compile(
    r"\b(arts|music|concert|festival|culture|theater|dance|film|museum|"
    r"performance|gallery|community)\b",
    re.I,
)
MEETUP_KW = re.compile(
    r"\b(networking|meetup|mixer|social|community|founder|professional)\b",
    re.I,
)

LEVEL_ORDER = ["low", "moderate", "active", "strong", "high"]
LEVEL_SCORE = {"low": 0.25, "moderate": 0.45, "active": 0.6, "strong": 0.75, "high": 0.9}


def fetch_url(url: str, dest: Path) -> str | None:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            body = resp.read().decode("utf-8", errors="replace")
        dest.write_text(body, encoding="utf-8")
        return body
    except Exception as exc:  # noqa: BLE001
        print(f"  WARN fetch {url}: {exc}", flush=True)
        return None


def parse_ics_events(text: str) -> list[dict]:
    """Minimal ICS VEVENT parser (no external deps)."""
    events: list[dict] = []
    blocks = re.split(r"(?=BEGIN:VEVENT)", text)
    for block in blocks:
        if "BEGIN:VEVENT" not in block:
            continue
        fields: dict[str, str] = {}
        for line in block.splitlines():
            if line.startswith(" ") and fields:
                key = list(fields.keys())[-1]
                fields[key] += line[1:]
                continue
            if ":" not in line:
                continue
            key, _, val = line.partition(":")
            fields[key.split(";")[0]] = val.strip()
        summary = fields.get("SUMMARY", "")
        location = fields.get("LOCATION", "")
        categories = fields.get("CATEGORIES", "")
        desc = fields.get("DESCRIPTION", "")[:500]
        blob = f"{summary} {location} {categories} {desc}".lower()
        events.append(
            {
                "summary": summary.replace("\\n", " ").strip()[:120],
                "location": location[:120],
                "categories": categories,
                "text": blob,
                "innovation": bool(INNOVATION_KW.search(blob)),
                "student": bool(STUDENT_KW.search(blob)),
                "cultural": bool(CULTURAL_KW.search(blob)),
                "meetup": bool(MEETUP_KW.search(blob)),
            }
        )
    return events


def match_corridor(event: dict, corridor: dict) -> bool:
    blob = event["text"]
    for kw in corridor.get("keywords", []):
        if kw.lower() in blob:
            return True
    return False


def load_osm_by_geo(path: Path) -> dict[str, dict[str, float]]:
    out: dict[str, dict[str, float]] = defaultdict(dict)
    if not path.exists():
        return out
    with path.open(encoding="utf-8") as f:
        for row in csv.DictReader(f):
            gid = row["geo_id"]
            key = row["metric_key"]
            out[gid][key] = float(row["metric_value"])
    for metrics in out.values():
        if "osm_social_poi_total" not in metrics:
            c = metrics.get("osm_cafe_count", 0) + metrics.get("osm_restaurant_count", 0)
            metrics["osm_social_poi_total"] = c
    return out


def load_supplement_floors() -> tuple[dict[str, dict[str, int]], dict[str, dict[str, int]]]:
    hub_floors: dict[str, dict[str, int]] = defaultdict(dict)
    geo_floors: dict[str, dict[str, int]] = defaultdict(dict)
    if not SUPPLEMENTS.exists():
        return hub_floors, geo_floors
    data = json.loads(SUPPLEMENTS.read_text(encoding="utf-8"))
    for item in data.get("hub_supplements", []):
        hid = item["hub_id"]
        for key, spec in item.get("metrics", {}).items():
            hub_floors[hid][key] = int(spec["floor"])
    for item in data.get("geo_supplements", []):
        gid = item["geo_id"]
        for key, spec in item.get("metrics", {}).items():
            geo_floors[gid][key] = int(spec["floor"])
    return hub_floors, geo_floors


def apply_metric_floors(metrics: dict[str, float], floors: dict[str, int]) -> None:
    for key, floor in floors.items():
        metrics[key] = float(max(metrics.get(key, 0), floor))
    if "osm_cafe_count" in metrics or "osm_restaurant_count" in metrics:
        metrics["osm_social_poi_total"] = metrics.get("osm_cafe_count", 0) + metrics.get(
            "osm_restaurant_count", 0
        )


def meetup_boost_for_hub(hub_id: str, meetup_groups: list[dict]) -> int:
    return sum(1 for g in meetup_groups if hub_id in g.get("corridor_ids", []))


def load_osm_by_hub(path: Path) -> dict[str, dict[str, float]]:
    out: dict[str, dict[str, float]] = defaultdict(dict)
    if not path.exists():
        return out
    with path.open(encoding="utf-8") as f:
        for row in csv.DictReader(f):
            hid = row["hub_id"]
            key = row["metric_key"]
            out[hid][key] = float(row["metric_value"])
    return out


def score_to_level(value: float, breaks: list[float]) -> str:
    for i, b in enumerate(breaks[1:]):
        if value < b:
            return LEVEL_ORDER[i]
    return LEVEL_ORDER[-1]


def main() -> None:
    registry = json.loads(REGISTRY.read_text(encoding="utf-8"))
    corridors = registry["corridors"]
    FEED_DIR.mkdir(parents=True, exist_ok=True)

    all_events: list[dict] = []
    feed_log: list[dict] = []

    for feed in registry.get("feeds", []):
        url = feed["url"]
        fname = feed["source_id"].lower().replace("src-", "") + ".ics"
        dest = FEED_DIR / fname
        print(f"Fetching {feed['name']}...", flush=True)
        body = fetch_url(url, dest)
        if not body:
            feed_log.append({**feed, "status": "failed", "event_count": 0})
            continue
        events = parse_ics_events(body)
        print(f"  parsed {len(events)} events", flush=True)
        feed_log.append({**feed, "status": "ok", "event_count": len(events), "cache": str(dest)})
        for ev in events:
            ev["source_id"] = feed["source_id"]
        all_events.extend(events)

    osm_geo = load_osm_by_geo(OSM_BOSTON)
    osm_hub = load_osm_by_hub(OSM_CORRIDOR)
    hub_floors, geo_floors = load_supplement_floors()
    meetup_groups = registry.get("meetup_groups", [])
    spillover = registry.get("regional_spillover", {})

    evidence: dict[str, dict] = {}
    for corridor in corridors:
        hid = corridor["id"]
        matched = [ev for ev in all_events if match_corridor(ev, corridor)]
        metrics_osm: dict[str, float] = {}
        for gid in corridor.get("geo_ids", []):
            for key, val in osm_geo.get(gid, {}).items():
                metrics_osm[key] = metrics_osm.get(key, 0) + val
        if hid in osm_hub:
            for key, val in osm_hub[hid].items():
                metrics_osm[key] = val
        for gid in corridor.get("geo_ids", []):
            apply_metric_floors(metrics_osm, geo_floors.get(gid, {}))
        apply_metric_floors(metrics_osm, hub_floors.get(hid, {}))

        spillover_events = 0
        for region in spillover.values():
            if hid not in region.get("corridor_ids", []):
                continue
            weight = float(region.get("event_weight", 0.1))
            for ev in all_events:
                if any(kw in ev["text"] for kw in region.get("keywords", [])):
                    spillover_events += weight

        social = metrics_osm.get("osm_social_poi_total", 0)
        coworking = metrics_osm.get("osm_coworking_count", 0)
        uni_total = len(matched) + int(spillover_events)
        innov = sum(1 for e in matched if e["innovation"])
        student = sum(1 for e in matched if e["student"])
        cultural = sum(1 for e in matched if e["cultural"])
        meetup = sum(1 for e in matched if e["meetup"]) + meetup_boost_for_hub(hid, meetup_groups)
        if metrics_osm.get("osm_bookstore_count", 0) >= 2 and cultural < 2:
            cultural += 1

        evidence[hid] = {
            "hub_id": hid,
            "hub_name": corridor["name"],
            "mit_events_matched": uni_total,
            "innovation_events": innov,
            "student_events": student,
            "cultural_events": cultural,
            "meetup_like_events": meetup,
            "meetup_registry_groups": meetup_boost_for_hub(hid, meetup_groups),
            "osm_social_poi_total": social,
            "osm_coworking_count": coworking,
            "osm_bookstore_count": metrics_osm.get("osm_bookstore_count", 0),
            "top_events": [e["summary"] for e in matched[:5] if e.get("summary")],
        }

    # Composite scores (0–1) across corridors
    social_max = max((e["osm_social_poi_total"] for e in evidence.values()), default=1) or 1
    uni_max = max((e["mit_events_matched"] for e in evidence.values()), default=1) or 1

    rows: list[dict] = []
    innov_scores, student_scores, meet_scores, cult_scores = [], [], [], []

    for hid, ev in evidence.items():
        innov_s = min(1.0, (ev["innovation_events"] / max(uni_max * 0.15, 1)) * 0.6 + (ev["osm_coworking_count"] / 5) * 0.4)
        student_s = min(1.0, ev["mit_events_matched"] / uni_max * 0.7 + (ev["student_events"] / max(uni_max * 0.2, 1)) * 0.3)
        meet_s = min(
            1.0,
            ev["meetup_like_events"] / max(uni_max * 0.1, 1) * 0.4
            + (ev.get("meetup_registry_groups", 0) / 4) * 0.25
            + innov_s * 0.35,
        )
        cult_s = min(1.0, ev["cultural_events"] / max(uni_max * 0.15, 1) * 0.5 + (ev["osm_social_poi_total"] / social_max) * 0.5)
        innov_scores.append((hid, innov_s))
        student_scores.append((hid, student_s))
        meet_scores.append((hid, meet_s))
        cult_scores.append((hid, cult_s))

    def breaks(scores: list[tuple[str, float]]) -> list[float]:
        vals = sorted(s for _, s in scores)
        if len(vals) < 4:
            return [0, 0.25, 0.5, 0.75, 1.01]
        n = len(vals)
        return [
            0,
            vals[max(0, n // 4 - 1)],
            vals[max(0, n // 2 - 1)],
            vals[max(0, (3 * n) // 4 - 1)],
            1.01,
        ]

    b_innov = breaks(innov_scores)
    b_student = breaks(student_scores)
    b_meet = breaks(meet_scores)
    b_cult = breaks(cult_scores)

    score_map = {
        hid: dict(
            innovation=next(s for h, s in innov_scores if h == hid),
            student=next(s for h, s in student_scores if h == hid),
            meet=next(s for h, s in meet_scores if h == hid),
            cult=next(s for h, s in cult_scores if h == hid),
        )
        for hid in evidence
    }

    for hid, ev in evidence.items():
        sc = score_map[hid]
        sig_innov = score_to_level(sc["innovation"], b_innov)
        sig_student = score_to_level(sc["student"], b_student)
        sig_meet = score_to_level(sc["meet"], b_meet)
        sig_cult = score_to_level(sc["cult"], b_cult)
        activity_index = sum(LEVEL_SCORE[s] for s in (sig_innov, sig_student, sig_meet, sig_cult)) / 4

        tops = [t for t in ev["top_events"] if t][:2]
        social_n = int(ev["osm_social_poi_total"])
        if tops:
            h1 = tops[0]
            h2 = tops[1] if len(tops) > 1 else str(social_n) + " mapped cafes & restaurants (OSM)"
            src1 = "MIT Events iCal (engage.mit.edu)"
            src2 = "MIT Events iCal" if len(tops) > 1 else "OpenStreetMap Overpass API"
        else:
            h1 = str(social_n) + " mapped cafes & restaurants in corridor"
            cw = int(ev["osm_coworking_count"])
            h2 = (
                str(cw) + " coworking & shared offices (OSM + public directories)"
                if cw
                else str(int(ev.get("osm_bookstore_count", 0))) + " bookstores & library POIs (OSM)"
            )
            src1 = "OpenStreetMap Overpass API"
            src2 = (
                "Innovation/coworking directory supplements"
                if cw
                else "OpenStreetMap + cultural venue references"
            )
        if ev.get("meetup_registry_groups", 0) >= 2 and tops:
            h2 = str(ev["meetup_registry_groups"]) + " curated Greater Boston meetup communities linked"
            src2 = "Meetup group registry (documented slugs)"

        rows.append(
            {
                "hub_id": hid,
                "hub_name": ev["hub_name"],
                "signal_innovation": sig_innov,
                "signal_student_events": sig_student,
                "signal_meetups": sig_meet,
                "signal_cultural": sig_cult,
                "highlight_1": h1,
                "highlight_1_source": src1,
                "highlight_2": h2,
                "highlight_2_source": src2,
                "mit_events_matched": ev["mit_events_matched"],
                "osm_social_poi_total": int(ev["osm_social_poi_total"]),
                "activity_index": f"{activity_index:.3f}",
                "notes": (
                    f"Signals: MIT iCal ({ev['mit_events_matched']} matches), OSM POIs "
                    f"(social={int(ev['osm_social_poi_total'])}, coworking={int(ev['osm_coworking_count'])}), "
                    f"meetup registry ({ev.get('meetup_registry_groups', 0)} groups). "
                    "Enriched with documented public directory floors. Quartile mapping across 22 corridors."
                ),
                "source_id": "SRC-MIT-ENGAGE-ICAL+SRC-OSM-OVERPASS+SRC-ENRICHMENT",
                "access_date": ACCESS_DATE,
            }
        )

    OUT_EVIDENCE.write_text(
        json.dumps(
            {"access_date": ACCESS_DATE, "feeds": feed_log, "corridors": evidence},
            indent=2,
        ),
        encoding="utf-8",
    )
    print(f"Wrote {OUT_EVIDENCE}", flush=True)

    fieldnames = list(rows[0].keys())
    for path in (OUT_CSV_PROCESSED, OUT_CSV_WEB):
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=fieldnames)
            w.writeheader()
            w.writerows(rows)
        print(f"Wrote {path} ({len(rows)} rows)", flush=True)

    # Sync legacy raw highlights for audit trail
    legacy = ROOT / "data/section_04/raw/activity/ecosystem_activity_highlights.csv"
    legacy_cols = [
        "hub_id",
        "hub_name",
        "signal_innovation",
        "signal_student_events",
        "signal_meetups",
        "signal_cultural",
        "highlight_1",
        "highlight_1_source",
        "highlight_2",
        "highlight_2_source",
        "notes",
        "source_id",
        "access_date",
    ]
    with legacy.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=legacy_cols, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)


if __name__ == "__main__":
    main()
