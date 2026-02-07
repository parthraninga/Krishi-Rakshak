"""
Ingest Soil Health Card (SHC) baseline per district into MongoDB collection soil_baseline.
Source: scripts/data/shc_baseline.json (SHC portal https://www.soilhealth.dac.gov.in/ has no simple public API).
Schema: district, district_id, N_avg, P_avg, K_avg, pH_avg, N_max, P_max, K_max (see roadmap/data-schemas.md).
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from scripts.db_helper import get_db, ensure_indexes

SCRIPT_DIR = Path(__file__).resolve().parent
DATA_DIR = SCRIPT_DIR / "data"
FALLBACK_JSON = DATA_DIR / "shc_baseline.json"

def main():
    if not FALLBACK_JSON.exists():
        print(f"Add {FALLBACK_JSON} with district-wise N, P, K (and optional pH, *_max).", file=sys.stderr)
        sys.exit(1)

    db = get_db()
    ensure_indexes(db)
    coll = db.soil_baseline

    raw = json.loads(FALLBACK_JSON.read_text(encoding="utf-8"))
    records = raw if isinstance(raw, list) else raw.get("districts", raw.get("data", [raw]))

    inserted, updated = 0, 0
    for r in records:
        if not isinstance(r, dict):
            continue
        district = (r.get("district") or r.get("District") or "").strip()
        if not district:
            continue
        doc = {
            "district": district,
            "district_id": (r.get("district_id") or r.get("id") or "").strip() or None,
            "N_avg": r.get("N_avg") if r.get("N_avg") is not None else r.get("n_avg"),
            "P_avg": r.get("P_avg") if r.get("P_avg") is not None else r.get("p_avg"),
            "K_avg": r.get("K_avg") if r.get("K_avg") is not None else r.get("k_avg"),
            "pH_avg": r.get("pH_avg") or r.get("ph_avg"),
            "N_max": r.get("N_max"), "P_max": r.get("P_max"), "K_max": r.get("K_max"),
        }
        result = coll.update_one(
            {"district": district},
            {"$set": {k: v for k, v in doc.items() if v is not None}},
            upsert=True
        )
        if result.upserted_id:
            inserted += 1
        elif result.modified_count:
            updated += 1

    print(f"SHC baseline: inserted={inserted}, updated={updated}")

if __name__ == "__main__":
    main()
