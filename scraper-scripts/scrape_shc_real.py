"""
Ingest REAL Soil Health Card (SHC) data from soilhealth.dac.gov.in WMS service.
This scrapes actual government portal data using geospatial queries (not dummy data!).
Source: SHC portal WMS (Web Map Service) - https://soilhealth.dac.gov.in/
Schema: district, village, N, P, K, pH, OC (see roadmap/data-schemas.md).
"""
import json
import sys
import time
import math
from pathlib import Path
from datetime import datetime, timezone

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from scripts.db_helper import get_db, ensure_indexes

try:
    import requests
except ImportError:
    print("ERROR: requests library required. Install: pip install requests", file=sys.stderr)
    sys.exit(1)

# -------------------------------------------------------
# CONFIG - Real SHC Portal WMS Endpoint
# -------------------------------------------------------

BASE_URL = "https://soilhealth.dac.gov.in/jW8X3zM5Y7pQvLr4K2Tn6HqPbD0tZmN9R6JfO1wCiG8xV5eTk2CdMoF9YsQr0Z7LmN1YxU4pTb2K5LvHqX7F3aCmGzR4Pw0D8UtYnJ9oZ2SvNlQ7Tz1PjR5LcX0Qf8HkV9OrG4V7YxU3pJk6TnMm5CdX8B9tRi1Lw2Qn7F4ZzJk8WvP1GrZ6Sx0JoH5C3oV7fNi2/shc/wms/wms"

LAYER = "24_438_shc_2024-25"  # Latest SHC 2024-25 layer

HEADERS = {
    "Referer": "https://soilhealth.dac.gov.in/slusi-visualisation/",
    "Origin": "https://soilhealth.dac.gov.in",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json"
}

# India's geographic bounds (approximately)
INDIA_BOUNDS = {
    "lat_min": 8.0,    # Southern tip (near Kanyakumari)
    "lat_max": 35.0,   # Northern tip (Ladakh)
    "lon_min": 68.0,   # Western tip (Gujarat)
    "lon_max": 97.0    # Eastern tip (Arunachal Pradesh)
}

# -------------------------------------------------------
# GEO HELPERS
# -------------------------------------------------------

def km_to_deg_lat(km):
    """Convert km to degrees latitude (constant ~111 km/deg)."""
    return km / 111.0

def km_to_deg_lon(km, lat):
    """Convert km to degrees longitude (varies with latitude)."""
    return km / (111.0 * math.cos(math.radians(lat)))

# -------------------------------------------------------
# WMS QUERY
# -------------------------------------------------------

def query_bbox(bbox, timeout=30):
    """Query SHC WMS for soil data in given bounding box.
    Returns GeoJSON features with soil properties."""
    
    params = {
        "service": "WMS",
        "version": "1.1.1",
        "request": "GetFeatureInfo",
        "layers": LAYER,
        "query_layers": LAYER,
        "srs": "EPSG:4326",  # WGS84 lat/lon
        "bbox": bbox,
        "width": 101,
        "height": 101,
        "x": 50,
        "y": 50,
        "feature_count": 100,  # Max features per query
        "info_format": "application/json",
        "HIDE_GEOMETRY": "true"  # Don't need geometry, just attributes
    }
    
    try:
        r = requests.get(BASE_URL, params=params, headers=HEADERS, timeout=timeout)
        if r.status_code == 200:
            return r.json()
        else:
            print(f"  WMS returned status {r.status_code}", file=sys.stderr)
            return None
    except requests.exceptions.Timeout:
        print("  Timeout on WMS query", file=sys.stderr)
        return None
    except Exception as e:
        print(f"  WMS query failed: {e}", file=sys.stderr)
        return None

# -------------------------------------------------------
# SCAN ENTIRE INDIA
# -------------------------------------------------------

def scan_all_india(step_km=10):
    """Scan entire India on a grid and collect all village data.
    Args:
        step_km: Grid step size in km (smaller = more coverage, slower)
    Returns:
        dict: {(state, district, village): {properties}}
    """
    
    lat_min = INDIA_BOUNDS["lat_min"]
    lat_max = INDIA_BOUNDS["lat_max"]
    lon_min = INDIA_BOUNDS["lon_min"]
    lon_max = INDIA_BOUNDS["lon_max"]
    
    all_data = {}
    query_count = 0
    villages_found = 0
    
    print(f"Scanning India: {lat_min}°N to {lat_max}°N, {lon_min}°E to {lon_max}°E")
    print(f"Grid step: {step_km}km")
    
    lat = lat_min
    while lat < lat_max:
        step_lat = km_to_deg_lat(step_km)
        step_lon = km_to_deg_lon(step_km, lat)
        
        lon = lon_min
        while lon < lon_max:
            bbox = f"{lon},{lat},{lon+step_lon},{lat+step_lat}"
            query_count += 1
            
            if query_count % 100 == 0:
                print(f"  Progress: {query_count} queries, {villages_found} villages (lat={lat:.2f}°)")
            
            data = query_bbox(bbox)
            
            if data and "features" in data:
                for feat in data["features"]:
                    props = feat.get("properties", {})
                    
                    state = (props.get("state") or props.get("State") or props.get("STATE") or "").strip()
                    district = (props.get("district") or props.get("District") or props.get("DISTRICT") or "").strip()
                    village = (props.get("village") or props.get("Village") or props.get("VILLAGE") or "").strip()
                    
                    if not village or not district:
                        continue
                    
                    key = (state, district, village)
                    
                    if key not in all_data:
                        all_data[key] = props
                        villages_found += 1
            
            lon += step_lon
            time.sleep(0.2)  # Polite delay
        
        lat += step_lat
    
    print(f"\nTotal queries: {query_count}")
    print(f"Total unique villages: {villages_found}")
    return all_data

# -------------------------------------------------------
# NORMALIZE TO SCHEMA
# -------------------------------------------------------

def normalize_village_data(village_props):
    """Convert WMS village properties to schema for MongoDB."""
    
    def safe_float(val):
        if val is None or val == "":
            return None
        try:
            return float(val)
        except (ValueError, TypeError):
            return None
    
    return {
        "state": (village_props.get("state") or village_props.get("State") or village_props.get("STATE") or "").strip(),
        "district": (village_props.get("district") or village_props.get("District") or village_props.get("DISTRICT") or "").strip(),
        "village": (village_props.get("village") or village_props.get("Village") or village_props.get("VILLAGE") or "").strip(),
        "N": safe_float(village_props.get("n") or village_props.get("N") or village_props.get("nitro")),
        "P": safe_float(village_props.get("p") or village_props.get("P") or village_props.get("phos")),
        "K": safe_float(village_props.get("k") or village_props.get("K") or village_props.get("pot")),
        "pH": safe_float(village_props.get("ph") or village_props.get("pH") or village_props.get("PH")),
        "OC": safe_float(village_props.get("oc") or village_props.get("OC") or village_props.get("organic_carbon")),
        "source": "SHC_WMS_2024-25",
        "scraped_at": datetime.now(timezone.utc),
    }

# -------------------------------------------------------
# MAIN
# -------------------------------------------------------

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Scrape real SHC data for ALL of India")
    parser.add_argument("--step-km", type=int, default=10, 
                        help="Grid step size in km (default: 10, smaller=more data)")
    parser.add_argument("--save-raw", action="store_true", 
                        help="Save raw village data to JSON file")
    parser.add_argument("--villages-only", action="store_true",
                        help="Store individual village data (not just district aggregates)")
    args = parser.parse_args()
    
    db = get_db()
    ensure_indexes(db)
    
    print("=" * 60)
    print("SHC COMPLETE INDIA DATA SCRAPER")
    print("=" * 60)
    print("This will scrape ALL states, districts, and villages in India.")
    print("WARNING: This may take HOURS and generate 100,000+ requests!")
    print("=" * 60)
    
    confirm = input("Continue? (yes/no): ")
    if confirm.lower() != "yes":
        print("Aborted.")
        return
    
    print("\nStarting scan...\n")
    start_time = time.time()
    
    all_villages = scan_all_india(step_km=args.step_km)
    
    elapsed = time.time() - start_time
    print(f"\nScan completed in {elapsed/60:.1f} minutes")
    print(f"Total unique villages: {len(all_villages)}")
    
    # Save raw data
    if args.save_raw:
        raw_path = Path(__file__).resolve().parent / "data" / "shc_india_complete.json"
        raw_path.parent.mkdir(exist_ok=True)
        with open(raw_path, "w", encoding="utf-8") as f:
            serializable = {f"{k[0]}|{k[1]}|{k[2]}": v for k, v in all_villages.items()}
            json.dump(serializable, f, indent=2, default=str)
        print(f"Raw data saved to: {raw_path}")
    
    # Store in MongoDB
    if args.villages_only:
        # Store individual village records
        coll = db.soil_villages
        inserted = 0
        for (state, district, village), props in all_villages.items():
            doc = normalize_village_data(props)
            coll.update_one(
                {"state": state, "district": district, "village": village},
                {"$set": doc},
                upsert=True
            )
            inserted += 1
        print(f"Inserted {inserted} village records to soil_villages collection")
    else:
        # Aggregate to district level
        district_data = {}
        for (state, district, _), props in all_villages.items():
            normalized = normalize_village_data(props)
            
            key = (state, district)
            if key not in district_data:
                district_data[key] = {
                    "state": state,
                    "district": district,
                    "villages": [],
                    "N_values": [], "P_values": [], "K_values": [],
                    "pH_values": [], "OC_values": [],
                }
            
            district_data[key]["villages"].append(normalized["village"])
            if normalized["N"]: district_data[key]["N_values"].append(normalized["N"])
            if normalized["P"]: district_data[key]["P_values"].append(normalized["P"])
            if normalized["K"]: district_data[key]["K_values"].append(normalized["K"])
            if normalized["pH"]: district_data[key]["pH_values"].append(normalized["pH"])
            if normalized["OC"]: district_data[key]["OC_values"].append(normalized["OC"])
        
        coll = db.soil_baseline
        inserted, updated = 0, 0
        
        for (state, district), data in district_data.items():
            def avg(vals): return sum(vals) / len(vals) if vals else None
            def max_safe(vals): return max(vals) if vals else None
            
            doc = {
                "state": state,
                "district": district,
                "district_id": f"{state.lower().replace(' ', '_')}_{district.lower().replace(' ', '_')}",
                "village_count": len(data["villages"]),
                "N_avg": avg(data["N_values"]),
                "P_avg": avg(data["P_values"]),
                "K_avg": avg(data["K_values"]),
                "pH_avg": avg(data["pH_values"]),
                "OC_avg": avg(data["OC_values"]),
                "N_max": max_safe(data["N_values"]),
                "P_max": max_safe(data["P_values"]),
                "K_max": max_safe(data["K_values"]),
                "source": "SHC_WMS_2024-25",
                "last_updated": datetime.now(timezone.utc),
            }
            
            result = coll.update_one(
                {"state": state, "district": district},
                {"$set": {k: v for k, v in doc.items() if v is not None}},
                upsert=True
            )
            
            if result.upserted_id:
                inserted += 1
            elif result.modified_count:
                updated += 1
        
        print(f"MongoDB: inserted={inserted}, updated={updated} districts")
    
    print("=" * 60)
    print("COMPLETE INDIA DATA COLLECTION FINISHED!")
    print("=" * 60)

if __name__ == "__main__":
    main()
