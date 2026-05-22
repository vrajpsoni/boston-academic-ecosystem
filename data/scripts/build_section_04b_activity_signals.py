#!/usr/bin/env python3
"""Shim — delegates to reproducible source pipeline."""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PIPELINE = ROOT / "data/scripts/build_section_04b_activity_from_sources.py"

if __name__ == "__main__":
    raise SystemExit(subprocess.call([sys.executable, str(PIPELINE)]))
