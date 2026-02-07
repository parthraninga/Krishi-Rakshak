"""
Ingest fertilizer MRP into MongoDB from data.gov.in only.
Uses datagovindia package; requires DATAGOVINDIA_API_KEY and one-time sync_datagovindia_metadata.py.
No seed/JSON fallback – data only from data.gov.in API.
Schema: product_name, mrp, nutrient_npk (optional), source, last_updated (see roadmap/data-schemas.md).
"""
import os
import sys
import json
from datetime import datetime
from pathlib import Path

import requests

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from scripts.db_helper import get_db, ensure_indexes

def _num(v):
    if v is None or v == "":
        return None
    try:
        return float(str(v).replace(",", "").strip())
    except ValueError:
        return None


def _get_resource_count(api_key: str, resource_id: str) -> int:
    """Get total record count for a resource (raw API; datagovindia strips 'count')."""
    url = f"https://api.data.gov.in/resource/{resource_id}?api-key={api_key}&format=json&offset=0&limit=0"
    try:
        r = requests.get(url, timeout=30)
        r.raise_for_status()
        data = r.json()
        return int(data.get("count") or data.get("total") or 0)
    except Exception:
        return 0


def main():
    db = get_db()
    ensure_indexes(db)
    coll = db.fertilizer_mrp

    records = []
    source = "none"

    # Optional: try datagovindia for fertilizer / MRP resource (pick one with most records)
    api_key = os.getenv("DATAGOVINDIA_API_KEY")
    if api_key:
        try:
            from datagovindia import DataGovIndia
            dg = DataGovIndia(api_key=api_key)
            df = dg.search("fertilizer MRP", search_fields=["title", "description"])
            if df is None or (hasattr(df, "empty") and df.empty):
                df = dg.search("fertilizer retail price", search_fields=["title", "description"])
            if df is not None and (not hasattr(df, "empty") or not df.empty):
                best_id = None
                best_total = 0
                for idx, row in df.head(15).iterrows():
                    rid = row.get("resource_id") or row.get("index_name")
                    if not rid:
                        continue
                    rid = str(rid)
                    total = _get_resource_count(api_key, rid)
                    if total > best_total:
                        best_total = total
                        best_id = rid
                rid = best_id or (df.iloc[0].get("resource_id") or df.iloc[0].get("index_name"))
                if rid:
                    rid = str(rid)
                    total_to_fetch = best_total if (best_id and rid == best_id) else _get_resource_count(api_key, rid)
                    data = dg.get_data(rid, limit=total_to_fetch if total_to_fetch else 5000)
                    if data is not None and (not hasattr(data, "empty") or not data.empty):
                        if isinstance(data, list):
                            records = data
                        elif isinstance(data, dict) and "records" in data:
                            records = data["records"]
                        elif hasattr(data, "to_dict"):
                            records = data.to_dict("records")
                        if records:
                            source = "data.gov.in API"
        except Exception as e:
            print(f"datagovindia fertilizer: {e}", file=sys.stderr)

    # Fallback to JSON file if API fails
    if not records:
        print("data.gov.in API unavailable, using fallback JSON...")
        fallback_path = Path(__file__).resolve().parent / "data" / "fertilizer_mrp_fallback.json"
        if fallback_path.exists():
            raw = json.loads(fallback_path.read_text(encoding="utf-8"))
            records = raw if isinstance(raw, list) else raw.get("records", raw.get("data", []))
            source = "JSON fallback"
        else:
            print(
                "No fertilizer MRP data available. Set DATAGOVINDIA_API_KEY or ensure scripts/data/fertilizer_mrp_fallback.json exists.",
                file=sys.stderr,
            )
            sys.exit(1)

    now = datetime.utcnow()
    inserted, updated = 0, 0
    for r in records:
        if isinstance(r, dict):
            name = (r.get("product_name") or r.get("Fertilizer") or r.get("fertilizer_name") or "").strip()
            mrp = _num(r.get("mrp") or r.get("Maximum Retail Price (MRP)") or r.get("MRP"))
            if not name:
                continue
            doc = {
                "product_name": name,
                "mrp": mrp,
                "nutrient_npk": (r.get("nutrient_npk") or r.get("NPK") or "").strip() or None,
                "source": r.get("source", "data.gov.in"),
                "last_updated": now,
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

    print(f"Fertilizer MRP: source={source}, inserted={inserted}, updated={updated}")

if __name__ == "__main__":
    main()
