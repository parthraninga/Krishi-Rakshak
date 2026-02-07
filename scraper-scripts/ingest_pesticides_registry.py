"""
Ingest CIB&RC / PPQS registered pesticides into MongoDB collection pesticides_registry.
Source: scripts/data/pesticides_registry_fallback.json (from PPQS https://ppqs.gov.in/en/divisions/cib-rc/registered-products).
Schema: product_name, reg_no, active_ingredient (see roadmap/data-schemas.md).
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
FALLBACK_JSON = DATA_DIR / "pesticides_registry_fallback.json"

def main():
    if not FALLBACK_JSON.exists():
        print(f"Add {FALLBACK_JSON} with product_name, reg_no, active_ingredient.", file=sys.stderr)
        sys.exit(1)

    db = get_db()
    ensure_indexes(db)
    coll = db.pesticides_registry

    raw = json.loads(FALLBACK_JSON.read_text(encoding="utf-8"))
    records = raw if isinstance(raw, list) else raw.get("records", raw.get("data", [raw]))

    inserted, updated = 0, 0
    for r in records:
        if not isinstance(r, dict):
            continue
        name = (r.get("product_name") or r.get("Product Name") or r.get("name") or "").strip()
        if not name:
            continue
        doc = {
            "product_name": name,
            "reg_no": (r.get("reg_no") or r.get("Registration No") or r.get("reg_number") or "").strip() or None,
            "active_ingredient": (r.get("active_ingredient") or r.get("Active Ingredient") or "").strip() or None,
        }
        result = coll.update_one(
            {"product_name": name},
            {"$set": doc},
            upsert=True
        )
        if result.upserted_id:
            inserted += 1
        elif result.modified_count:
            updated += 1

    print(f"Pesticides registry: inserted={inserted}, updated={updated}")

if __name__ == "__main__":
    main()
