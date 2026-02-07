"""
Seed MongoDB with products, advisory_rules. Idempotent.
Run after ingest scripts (mandi, fertilizer, SHC, pesticides) if you want a single entry point.
Collections: products, advisory_rules (and optionally ensure indexes only for others).
Data: scripts/data/products_seed.json, scripts/data/advisory_rules.json (see roadmap/data-schemas.md).
"""
import json
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from scripts.db_helper import get_db, ensure_indexes

SCRIPT_DIR = Path(__file__).resolve().parent
DATA_DIR = SCRIPT_DIR / "data"
PRODUCTS_JSON = DATA_DIR / "products_seed.json"
ADVISORY_JSON = DATA_DIR / "advisory_rules.json"

def main():
    db = get_db()
    ensure_indexes(db)
    now = datetime.utcnow()

    # Products (for QR/verification)
    if PRODUCTS_JSON.exists():
        raw = json.loads(PRODUCTS_JSON.read_text(encoding="utf-8"))
        items = raw if isinstance(raw, list) else raw.get("products", [])
        coll = db.products
        for p in items:
            if not isinstance(p, dict):
                continue
            gtin = (p.get("gtin") or p.get("barcode") or "").strip()
            if not gtin:
                continue
            doc = {
                "gtin": gtin,
                "product_name": (p.get("product_name") or p.get("name") or "").strip(),
                "category": (p.get("category") or "fertilizer").strip(),
                "manufacturer": (p.get("manufacturer") or "").strip() or None,
                "batch_regex": p.get("batch_regex"),
                "expiry_format": p.get("expiry_format"),
                "sku": p.get("sku"),
                "updated_at": now,
            }
            coll.update_one({"gtin": gtin}, {"$set": doc}, upsert=True)
        print(f"Products: upserted {len(items)} from {PRODUCTS_JSON.name}")
    else:
        print(f"Optional: add {PRODUCTS_JSON} for product registry seed.")

    # Advisory rules (crop × stage → inputs)
    if ADVISORY_JSON.exists():
        raw = json.loads(ADVISORY_JSON.read_text(encoding="utf-8"))
        items = raw if isinstance(raw, list) else raw.get("rules", raw.get("data", []))
        coll = db.advisory_rules
        for r in items:
            if not isinstance(r, dict):
                continue
            crop = (r.get("crop") or "").strip()
            stage = (r.get("stage") or "").strip()
            if not crop or not stage:
                continue
            doc = {
                "crop": crop,
                "stage": stage,
                "inputs": r.get("inputs") or r.get("recommendations") or [],
                "updated_at": now,
            }
            coll.update_one(
                {"crop": crop, "stage": stage},
                {"$set": doc},
                upsert=True
            )
        print(f"Advisory rules: upserted {len(items)} from {ADVISORY_JSON.name}")
    else:
        print(f"Optional: add {ADVISORY_JSON} for advisory engine.")

    print("Seed done.")

if __name__ == "__main__":
    main()
