#!/usr/bin/env python3
"""
Section 05 — IPEDS Finance → institution scale + Sankey flow CSVs.

Requires manual Finance zips (see data/section_05/sources/MANUAL_IPEDS_FINANCE_DOWNLOAD.md).
HD2022 is downloaded automatically for public/private form routing.

Outputs:
  data/section_05/processed/institution_control_v1.csv
  data/section_05/processed/institution_financial_scale_v1.csv
  data/section_05/processed/academic_economy_nodes_v1.csv
  data/section_05/processed/academic_economy_flows_v1.csv
"""

from __future__ import annotations

import argparse
import csv
import io
import re
import urllib.request
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
S05 = ROOT / "section_05"
RAW_FIN = S05 / "raw" / "ipeds_finance"
RAW_HD = S05 / "raw" / "ipeds_hd"
PROC = S05 / "processed"
ECOSYSTEM = ROOT / "section_03" / "raw" / "ecosystem_institutions_ipeds.csv"

ANCHOR_UNITIDS = {
    166027: "Harvard University",
    166683: "MIT",
    164988: "Boston University",
    167358: "Northeastern University",
    164924: "Boston College",
    168148: "Tufts University",
    167987: "University of Massachusetts Boston",
}

# NCES CONTROL: 1=public, 2=private nonprofit, 3=private for-profit
PUBLIC_CONTROL = {"1"}

# Validated against F2122 extracts (2021–22 collection year)
# Private FASB (F2): Part E line 13 = F2E131 (total expenses)
# Public GASB (F1A): F1B25 (total expenses)
OPEX_BY_FORM = {
    "f2": ["F2E131", "F2B13", "F2E13"],
    "f1a": ["F1B25", "F1E131", "F1B27", "F1B01"],
}

FUNCTIONAL_BY_FORM = {
    "f2": {
        "instruction": ["F2E132"],
        "research": ["F2E133"],
        "student_services": ["F2E136"],
        "auxiliary": ["F2E135"],
    },
    "f1a": {
        "instruction": ["F1B02", "F1E132"],
        "research": ["F1B03", "F1E133"],
        "student_services": ["F1B06", "F1E136"],
        "auxiliary": ["F1B08", "F1E135"],
    },
}

# User-placed zips (2021–22 collection year); legacy names also accepted
MANUAL_ZIP_PAIRS = [
    (RAW_FIN / "F2122_F1A.zip", RAW_FIN / "F_public_gasb.zip"),
    (RAW_FIN / "F2122_F2.zip", RAW_FIN / "F_private_fasb.zip"),
]


def resolve_finance_zips() -> list[Path]:
    found: list[Path] = []
    for primary, alias in MANUAL_ZIP_PAIRS:
        if primary.exists():
            found.append(primary)
        elif alias.exists():
            found.append(alias)
    return found


def load_ecosystem_unitids() -> dict[int, str]:
    out: dict[int, str] = {}
    with ECOSYSTEM.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            out[int(row["unitid"])] = row["institution_name"].strip()
    return out


def download_hd(year: int = 2022) -> Path:
    RAW_HD.mkdir(parents=True, exist_ok=True)
    path = RAW_HD / f"HD{year}.zip"
    if path.exists() and path.stat().st_size > 10_000:
        return path
    url = f"https://nces.ed.gov/ipeds/datacenter/data/HD{year}.zip"
    print(f"Downloading {url}")
    urllib.request.urlretrieve(url, path)
    return path


def open_main_csv(zip_path: Path) -> tuple[csv.DictReader, zipfile.ZipFile]:
    zf = zipfile.ZipFile(zip_path)
    name = next(
        n
        for n in zf.namelist()
        if n.lower().endswith(".csv") and "_rv" not in n.lower()
    )
    handle = io.TextIOWrapper(zf.open(name), encoding="utf-8", errors="replace")
    return csv.DictReader(handle), zf


def load_control_map(year: int = 2022) -> dict[int, str]:
    path = download_hd(year)
    reader, zf = open_main_csv(path)
    controls: dict[int, str] = {}
    for row in reader:
        uid = row.get("UNITID", "").strip()
        if not uid.isdigit():
            continue
        controls[int(uid)] = row.get("CONTROL", "").strip()
    zf.close()
    return controls


def pick_column(columns: list[str], candidates: list[str]) -> str | None:
    upper = {c.upper(): c for c in columns}
    for cand in candidates:
        if cand.upper() in upper:
            return upper[cand.upper()]
    return None


def form_key_from_zip(zip_path: Path) -> str:
    name = zip_path.name.lower()
    if "_f1a" in name or name.endswith("f1a.zip"):
        return "f1a"
    if "_f2" in name or name.endswith("f2.zip"):
        return "f2"
    return "unknown"


def parse_money(val: str | None) -> int | None:
    if val is None:
        return None
    s = str(val).strip()
    if not s or s in (".", "-", "A", "R", "Z"):
        return None
    s = re.sub(r"[^0-9\-]", "", s)
    if not s or s == "-":
        return None
    try:
        return int(s)
    except ValueError:
        return None


def read_finance_zip(zip_path: Path, unitids: set[int]) -> list[dict]:
    if not zip_path.exists():
        return []
    reader, zf = open_main_csv(zip_path)
    cols = reader.fieldnames or []
    form = form_key_from_zip(zip_path)
    opex_col = pick_column(cols, OPEX_BY_FORM.get(form, []))
    if not opex_col:
        zf.close()
        raise SystemExit(
            f"No opex column in {zip_path.name} (form={form}). Run --inspect."
        )
    func_map = FUNCTIONAL_BY_FORM.get(form, {})
    rows = []
    for row in reader:
        uid = row.get("UNITID", "").strip()
        if not uid.isdigit() or int(uid) not in unitids:
            continue
        opex = parse_money(row.get(opex_col))
        if opex is None:
            continue
        func = {}
        for key, cands in func_map.items():
            col = pick_column(cols, cands)
            func[key] = parse_money(row.get(col)) if col else None
        rows.append(
            {
                "unitid": int(uid),
                "total_operating_expenses_usd": opex,
                "opex_varname": opex_col,
                "source_zip": zip_path.name,
                **{f"expense_{k}_usd": func[k] for k in func},
            }
        )
    zf.close()
    return rows


def inspect_zips() -> None:
    zips = resolve_finance_zips()
    if not zips:
        print("No Finance zips found. Expected F2122_F1A.zip and F2122_F2.zip in:")
        print(f"  {RAW_FIN}")
        return
    for zp in zips:
        print(f"\n=== {zp.name} (form={form_key_from_zip(zp)}) ===")
        reader, zf = open_main_csv(zp)
        cols = reader.fieldnames or []
        form = form_key_from_zip(zp)
        opex = pick_column(cols, OPEX_BY_FORM.get(form, []))
        print(f"  Opex column: {opex}")
        for label, cands in FUNCTIONAL_BY_FORM.get(form, {}).items():
            print(f"  {label}: {pick_column(cols, cands)}")
        zf.close()


def write_control_csv(controls: dict[int, str], names: dict[int, str]) -> None:
    PROC.mkdir(parents=True, exist_ok=True)
    path = PROC / "institution_control_v1.csv"
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(
            "unitid,institution_name,control,control_label,finance_form,access_date,source_id,source_url".split(
                ","
            )
        )
        for uid, name in sorted(names.items()):
            ctrl = controls.get(uid, "")
            label = {
                "1": "public",
                "2": "private_nonprofit",
                "3": "private_forprofit",
            }.get(ctrl, "unknown")
            form = "F1A_GASB" if ctrl in PUBLIC_CONTROL else "F2_FASB"
            w.writerow(
                [
                    uid,
                    name,
                    ctrl,
                    label,
                    form,
                    "2026-05-21",
                    "SRC-IPEDS-HD",
                    "https://nces.ed.gov/ipeds/datacenter/data/HD2022.zip",
                ]
            )
    print(f"Wrote {path}")


def build() -> None:
    names = load_ecosystem_unitids()
    unitids = set(names)
    controls = load_control_map()
    write_control_csv(controls, names)

    finance_zips = resolve_finance_zips()
    if len(finance_zips) < 2:
        print("\nFinance zips incomplete (need F1A + F2). Found:")
        for z in finance_zips:
            print(f"  - {z}")
        print("\nPlace F2122_F1A.zip and F2122_F2.zip in:")
        print(f"  {RAW_FIN}")
        print("HD control map written; re-run after both zips are present.")
        return

    finance_rows: dict[int, dict] = {}
    for zp in finance_zips:
        for row in read_finance_zip(zp, unitids):
            finance_rows[row["unitid"]] = row

    missing = unitids - set(finance_rows)
    if missing:
        print(f"WARNING: no finance row for {len(missing)} UNITIDs: {sorted(missing)}")

    # Institution scale
    scale_path = PROC / "institution_financial_scale_v1.csv"
    hero = 0
    anchor_sum = 0
    with scale_path.open("w", newline="", encoding="utf-8") as f:
        fields = [
            "unitid",
            "institution_name",
            "tier",
            "total_operating_expenses_usd",
            "expense_instruction_usd",
            "expense_research_usd",
            "expense_student_services_usd",
            "expense_auxiliary_usd",
            "opex_varname",
            "source_zip",
            "source_id",
            "source_url",
            "access_date",
        ]
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        others = 0
        for uid, name in sorted(names.items()):
            fin = finance_rows.get(uid)
            if not fin:
                continue
            tier = "anchor" if uid in ANCHOR_UNITIDS else "other"
            opex = fin["total_operating_expenses_usd"]
            hero += opex
            if tier == "anchor":
                anchor_sum += opex
            else:
                others += opex
            w.writerow(
                {
                    "unitid": uid,
                    "institution_name": name,
                    "tier": tier,
                    "total_operating_expenses_usd": opex,
                    "expense_instruction_usd": fin.get("expense_instruction_usd", ""),
                    "expense_research_usd": fin.get("expense_research_usd", ""),
                    "expense_student_services_usd": fin.get("expense_student_services_usd", ""),
                    "expense_auxiliary_usd": fin.get("expense_auxiliary_usd", ""),
                    "opex_varname": fin["opex_varname"],
                    "source_zip": fin["source_zip"],
                    "source_id": "SRC-IPEDS-FINANCE",
                    "source_url": "https://nces.ed.gov/ipeds/datacenter/",
                    "access_date": "2026-05-21",
                }
            )
        # Aggregate row for Sankey "all others"
        w.writerow(
            {
                "unitid": "AGG_OTHERS",
                "institution_name": "All other map institutions",
                "tier": "aggregate",
                "total_operating_expenses_usd": others,
                "expense_instruction_usd": "",
                "expense_research_usd": "",
                "expense_student_services_usd": "",
                "expense_auxiliary_usd": "",
                "opex_varname": "sum(other_unitids)",
                "source_zip": "derived",
                "source_id": "SRC-IPEDS-FINANCE",
                "source_url": "https://nces.ed.gov/ipeds/datacenter/",
                "access_date": "2026-05-21",
            }
        )

    print(f"Wrote {scale_path}")
    print(f"Hero total (opex): ${hero:,}")
    print(f"  7 anchors: ${anchor_sum:,}")
    print(f"  All others: ${others:,}")

    # Minimal nodes + flows for MVP Sankey (institution → expense sinks)
    nodes_path = PROC / "academic_economy_nodes_v1.csv"
    flows_path = PROC / "academic_economy_flows_v1.csv"
    node_rows = [
        ("source-ecosystem", "Greater Boston academic ecosystem", "source", 2, 0),
    ]
    display_ids = []
    for uid in ANCHOR_UNITIDS:
        display_ids.append(uid)
    display_ids.append("AGG_OTHERS")
    for i, did in enumerate(display_ids):
        label = (
            ANCHOR_UNITIDS[did]
            if did in ANCHOR_UNITIDS
            else "All other map institutions"
        )
        node_rows.append((f"inst-{did}", label, "institution", 3, i))
    for j, sink in enumerate(
        ["instruction", "research", "student_services", "auxiliary", "other"]
    ):
        node_rows.append((f"sink-{sink}", sink.replace("_", " ").title(), "sink", 3, 10 + j))

    with nodes_path.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow("node_id,node_label,node_type,act,sort_order".split(","))
        w.writerows(node_rows)

    with flows_path.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(
            "link_id,act,source_node_id,target_node_id,value_usd,metric_id,fiscal_year,is_estimated,source_id,source_url,access_date,notes".split(
                ","
            )
        )
        link_i = 0
        for did in display_ids:
            if did == "AGG_OTHERS":
                inst_row = None
                total = others
            else:
                inst_row = finance_rows.get(did)
                total = (
                    inst_row["total_operating_expenses_usd"] if inst_row else 0
                )
            if total <= 0:
                continue
            buckets = [
                (
                    "instruction",
                    inst_row.get("expense_instruction_usd") if inst_row else None,
                ),
                (
                    "research",
                    inst_row.get("expense_research_usd") if inst_row else None,
                ),
                (
                    "student_services",
                    inst_row.get("expense_student_services_usd") if inst_row else None,
                ),
                (
                    "auxiliary",
                    inst_row.get("expense_auxiliary_usd") if inst_row else None,
                ),
            ]
            allocated = 0
            for sink, val in buckets:
                if val and val > 0:
                    link_i += 1
                    allocated += val
                    w.writerow(
                        [
                            f"link-{link_i:04d}",
                            3,
                            f"inst-{did}",
                            f"sink-{sink}",
                            val,
                            f"opex_{sink}",
                            2022,
                            "false",
                            "SRC-IPEDS-FINANCE",
                            "https://nces.ed.gov/ipeds/datacenter/",
                            "2026-05-21",
                            "",
                        ]
                    )
            residual = total - allocated
            if residual > 0:
                link_i += 1
                w.writerow(
                    [
                        f"link-{link_i:04d}",
                        3,
                        f"inst-{did}",
                        "sink-other",
                        residual,
                        "opex_other",
                        2022,
                        "false",
                        "SRC-IPEDS-FINANCE",
                        "https://nces.ed.gov/ipeds/datacenter/",
                        "2026-05-21",
                        "Residual of total opex minus mapped functional lines",
                    ]
                )

    print(f"Wrote {nodes_path} and {flows_path}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--inspect",
        action="store_true",
        help="Print Finance CSV columns from manual zips",
    )
    args = parser.parse_args()
    if args.inspect:
        inspect_zips()
        return
    build()


if __name__ == "__main__":
    main()
