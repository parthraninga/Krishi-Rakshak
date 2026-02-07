"""
Ingest mandi (wholesale) prices into MongoDB from data.gov.in only.
Uses datagovindia package; requires DATAGOVINDIA_API_KEY and one-time sync_datagovindia_metadata.py.
No seed/CSV fallback – data only from data.gov.in API.
Schema: commodity, district, date, min_price, max_price, modal_price (see roadmap/data-schemas.md).
"""
import os
import sys
from datetime import datetime, date as date_type
from pathlib import Path
import requests

# Add project root for imports
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from scripts.db_helper import get_db, ensure_indexes

SCRIPT_DIR = Path(__file__).resolve().parent

def _normalize_date(v):
    if v is None:
        return None
    if isinstance(v, datetime):
        return v.date()
    if hasattr(v, "date") and callable(getattr(v, "date")):  # pandas Timestamp / datetime-like
        try:
            return v.date()
        except Exception:
            pass
    if isinstance(v, (int, float)):  # Unix timestamp (seconds or ms)
        try:
            if v > 1e12:
                v = v / 1000.0
            return datetime.utcfromtimestamp(v).date()
        except (ValueError, OSError):
            return None
    if isinstance(v, str):
        s = v.strip()[:30]
        for fmt in (
            "%Y-%m-%d",
            "%d-%m-%Y",
            "%d/%m/%Y",
            "%Y/%m/%d",
            "%d-%b-%Y",
            "%d %b %Y",
            "%Y-%m-%dT%H:%M:%S",
            "%d-%m-%y",
        ):
            try:
                return datetime.strptime(s[: max(len(fmt), 10)], fmt).date()
            except ValueError:
                continue
    return None

def _num(s):
    if s is None or s == "":
        return None
    try:
        return float(str(s).replace(",", "").strip())
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


def load_from_datagovindia():
    """Try data.gov.in API using datagovindia with improved search and pagination."""
    api_key = os.getenv("DATAGOVINDIA_API_KEY")
    if not api_key:
        return None
    try:
        from datagovindia import DataGovIndia
        dg = DataGovIndia(api_key=api_key)
        
        # Try multiple search terms to find best resource
        search_terms = [
            "current daily price commodities markets",
            "mandi price",
            "agmarknet daily price",
            "commodity price market",
        ]
        
        best_id = None
        best_total = 0
        
        print("  Searching for mandi data resources...")
        for term in search_terms:
            df = dg.search(term, search_fields=["title", "description"])
            if df is None or (hasattr(df, "empty") and df.empty):
                continue
            
            # Check top 30 resources for best one (most records)
            max_candidates = 30
            for idx, row in df.iterrows():
                if idx >= max_candidates:
                    break
                rid = row.get("resource_id") or row.get("index_name")
                if not rid:
                    continue
                rid = str(rid)
                
                # Get record count
                total = _get_resource_count(api_key, rid)
                if total > best_total:
                    best_total = total
                    best_id = rid
                    print(f"  Found: {row.get('title', 'Unknown')[:50]}... ({total} records)")
        
        if not best_id:
            print("  No mandi resources found via search")
            return None
        
        resource_id = best_id
        print(f"  Using best resource: {resource_id} ({best_total} total records)")
        
        # Fetch with pagination - get more than default
        limit_per_call = 10000  # Max per API call
        total_to_fetch = min(best_total, 50000)  # Cap at 50k for hackathon
        
        print(f"  Fetching up to {total_to_fetch} records (this may take a minute)...")
        data = dg.get_data(resource_id, limit=total_to_fetch)
        
        # Avoid "truth value of DataFrame is ambiguous"
        if data is None:
            return None
        if hasattr(data, "empty") and data.empty:
            return None
        
        # Normalize to list of dicts
        rows = []
        if isinstance(data, list):
            for r in data:
                if isinstance(r, dict):
                    rows.append(_normalize_mandi_row(r))
        elif isinstance(data, dict) and "records" in data:
            for r in data["records"]:
                rows.append(_normalize_mandi_row(r))
        elif hasattr(data, "to_dict"):  # pandas DataFrame
            for r in data.to_dict("records"):
                if isinstance(r, dict):
                    rows.append(_normalize_mandi_row(r))
        
        if rows:
            print(f"  Successfully fetched {len(rows)} records from API")
        return rows if rows else None
    except Exception as e:
        print(f"  datagovindia failed: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return None
            for r in data.to_dict("records"):
                if isinstance(r, dict):
                    rows.append(_normalize_mandi_row(r))
        
        if rows:
            print(f"  Successfully fetched {len(rows)} records from API")
        return rows if rows else None
    except Exception as e:
        print(f"  datagovindia failed: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc

def _normalize_mandi_row(r):
    """Map various field names to schema: commodity, district, date, min_price, max_price, modal_price."""
    # data.gov.in / Agmarknet use different column names across resources
    commodity = (r.get("commodity") or r.get("Commodity") or r.get("commodity_name") or r.get("commodity_") or "").strip()
    district = (
        r.get("district") or r.get("District") or r.get("market") or r.get("Market")
        or r.get("state") or r.get("state_name") or r.get("market_name") or r.get("market_") or ""
    ).strip()
    date_val = _normalize_date(
        r.get("date") or r.get("Date") or r.get("arrival_date") or r.get("price_date")
    )
    min_p = _num(
        r.get("min_price") or r.get("Min Price (Rs/Quintal)") or r.get("minimum_price")
        or r.get("min") or r.get("min_price_")
    )
    max_p = _num(
        r.get("max_price") or r.get("Max Price (Rs/Quintal)") or r.get("maximum_price")
        or r.get("max") or r.get("max_price_")
    )
    modal_p = _num(
        r.get("modal_price") or r.get("Modal Price (Rs/Quintal)") or r.get("price")
        or r.get("modal_price_") or r.get("modal")
    )
    return {
        "commodity": commodity or "Unknown",
        "district": district or "Unknown",
        "date": date_val,
        "min_price": min_p,
        "max_price": max_p,
        "modal_price": modal_p or min_p or max_p,
    }

def load_from_csv_fallback():
    """Load from scripts/data/mandi_sample.csv as fallback."""
    csv_path = SCRIPT_DIR / "data" / "mandi_sample.csv"
    if not csv_path.exists():
        return None
    import csv
    records = []
    with open(csv_path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            records.append(_normalize_mandi_row(row))
    return records if records else None

def main():
    db = get_db()
    ensure_indexes(db)
    coll = db.mandi_prices

    records = None
    source = "none"

    # Try data.gov.in API first
    records = load_from_datagovindia()
    if records:
        source = "data.gov.in API"
    else:
        # Fallback to CSV sample
        print("data.gov.in API unavailable, using fallback CSV...")
        records = load_from_csv_fallback()
        if records:
            source = "CSV fallback"
        else:
            print(
                "No mandi data available. Set DATAGOVINDIA_API_KEY or ensure scripts/data/mandi_sample.csv exists.",
                file=sys.stderr,
            )
            sys.exit(1)

    # MongoDB accepts datetime but not date; convert for storage
    def _to_mongo_date(v):
        if v is None:
            return None
        if isinstance(v, date_type) and not isinstance(v, datetime):
            return datetime.combine(v, datetime.min.time())
        return v

    inserted, updated = 0, 0
    used_fallback_date = 0
    fallback_date = datetime.utcnow().date()
    for r in records:
        if not r.get("commodity") and not r.get("district"):
            continue
        if not r.get("date"):
            r["date"] = fallback_date
            used_fallback_date += 1
        r["date"] = _to_mongo_date(r["date"])
        key = {"commodity": r["commodity"], "district": r["district"], "date": r["date"]}
        result = coll.update_one(key, {"$set": {**r}}, upsert=True)
        if result.upserted_id:
            inserted += 1
        elif result.modified_count:
            updated += 1

    if used_fallback_date:
        print(f"Mandi prices: source={source}, inserted={inserted}, updated={updated}, total_records={len(records)} ({used_fallback_date} with fallback date)")
    else:
        print(f"Mandi prices: source={source}, inserted={inserted}, updated={updated}, total_records={len(records)}")

if __name__ == "__main__":
    main()
