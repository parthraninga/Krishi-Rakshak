"""
Ingest comprehensive soil health data from soil_health_nested.json
Replaces the old soil_baseline collection with village-level granular data.

Run: python scripts/ingest_soil_health_comprehensive.py
"""
import json
import os
from pathlib import Path
from datetime import datetime
from typing import Dict, Any
from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables
env_path = Path(__file__).parent.parent / "backend" / ".env"
load_dotenv(env_path)

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("MONGODB_DB", "farmer_advisory")

def connect_db():
    """Connect to MongoDB."""
    client = MongoClient(MONGODB_URI)
    db = client[DB_NAME]
    return client, db

def safe_float(value, default=0.0):
    """Safely convert to float, handling empty strings and None."""
    if value is None or value == '' or value == 'null':
        return default
    try:
        return float(value)
    except (ValueError, TypeError):
        return default

def transform_village_data(state: str, district: str, district_code: str, village_data: Dict[str, Any]) -> Dict[str, Any]:
    """Transform village-level data to our schema."""
    nutrients = village_data['nutrients']
    
    return {
        "state": state,
        "district": district,
        "district_code": district_code,
        "village": village_data['village'],
        "latitude": village_data['latitude'],
        "longitude": village_data['longitude'],
        "nutrients": {
            "N": safe_float(nutrients.get('N')),
            "P": safe_float(nutrients.get('P')),
            "K": safe_float(nutrients.get('K')),
            "B": safe_float(nutrients.get('B')),
            "Fe": safe_float(nutrients.get('Fe')),
            "Zn": safe_float(nutrients.get('Zn')),
            "Cu": safe_float(nutrients.get('Cu')),
            "S": safe_float(nutrients.get('S')),
            "OC": safe_float(nutrients.get('OC')),  # Organic Carbon
            "pH": safe_float(nutrients.get('pH')),
            "Mn": safe_float(nutrients.get('Mn')),
            "EC": safe_float(nutrients.get('EC'))  # Electrical Conductivity
        },
        "source": "SHC Portal 2024-25",
        "sampling_year": 2024,
        "last_updated": datetime.utcnow().isoformat()
    }

def ingest_soil_health_data():
    """Ingest soil health data from nested JSON file."""
    data_file = Path(__file__).parent / "data" / "soil_health_nested.json"
    
    print(f"Loading soil health data from {data_file}...")
    with open(data_file, 'r', encoding='utf-8') as f:
        districts_data = json.load(f)
    
    print(f"Loaded {len(districts_data)} districts")
    
    # Connect to MongoDB
    client, db = connect_db()
    collection = db["soil_health"]
    
    # Drop old collection (we're replacing it completely)
    print("Dropping old soil_health collection...")
    collection.drop()
    
    # Create indexes for efficient querying
    print("Creating indexes...")
    collection.create_index([("state", 1), ("district", 1)])
    collection.create_index([("district_code", 1)])
    collection.create_index([("latitude", 1), ("longitude", 1)])
    
    # Transform and insert all village samples
    all_samples = []
    total_villages = 0
    
    for district_obj in districts_data:
        state = district_obj['state']
        district = district_obj['district']
        district_code = district_obj['district_code']
        
        for village_data in district_obj['items']:
            sample = transform_village_data(state, district, district_code, village_data)
            all_samples.append(sample)
            total_villages += 1
    
    if all_samples:
        print(f"Inserting {len(all_samples)} village samples...")
        result = collection.insert_many(all_samples)
        print(f"✅ Inserted {len(result.inserted_ids)} village samples")
    
    # Print statistics
    print(f"\n{'='*60}")
    print(f"Statistics:")
    print(f"  Total districts: {len(districts_data)}")
    print(f"  Total village samples: {total_villages}")
    print(f"  States covered: {collection.distinct('state') and len(collection.distinct('state'))}")
    print(f"{'='*60}")
    
    # Also create district-level aggregates for backward compatibility
    print("\nCreating district-level aggregates for advisory engine...")
    aggregate_collection = db["soil_baseline"]
    aggregate_collection.drop()
    
    # Aggregate by district
    pipeline = [
        {
            "$group": {
                "_id": {"state": "$state", "district": "$district"},
                "district_code": {"$first": "$district_code"},
                "avg_N": {"$avg": "$nutrients.N"},
                "avg_P": {"$avg": "$nutrients.P"},
                "avg_K": {"$avg": "$nutrients.K"},
                "avg_pH": {"$avg": "$nutrients.pH"},
                "avg_OC": {"$avg": "$nutrients.OC"},
                "avg_EC": {"$avg": "$nutrients.EC"},
                "avg_Zn": {"$avg": "$nutrients.Zn"},
                "avg_Fe": {"$avg": "$nutrients.Fe"},
                "avg_Mn": {"$avg": "$nutrients.Mn"},
                "avg_Cu": {"$avg": "$nutrients.Cu"},
                "avg_B": {"$avg": "$nutrients.B"},
                "avg_S": {"$avg": "$nutrients.S"},
                "sample_count": {"$sum": 1}
            }
        }
    ]
    
    aggregates = list(collection.aggregate(pipeline))
    
    # Transform aggregates to baseline schema
    baseline_docs = []
    for agg in aggregates:
        doc = {
            "state": agg["_id"]["state"],
            "district": agg["_id"]["district"],
            "district_code": agg.get("district_code"),
            "parameters": {
                "N": {"avg": round(agg["avg_N"], 2), "unit": "kg/ha"},
                "P": {"avg": round(agg["avg_P"], 2), "unit": "kg/ha"},
                "K": {"avg": round(agg["avg_K"], 2), "unit": "kg/ha"},
                "pH": {"avg": round(agg["avg_pH"], 2)},
                "OC": {"avg": round(agg["avg_OC"], 2), "unit": "%"},
                "EC": {"avg": round(agg["avg_EC"], 2), "unit": "dS/m"},
                "Zn": {"avg": round(agg["avg_Zn"], 2), "unit": "ppm"},
                "Fe": {"avg": round(agg["avg_Fe"], 2), "unit": "ppm"},
                "Mn": {"avg": round(agg["avg_Mn"], 2), "unit": "ppm"},
                "Cu": {"avg": round(agg["avg_Cu"], 2), "unit": "ppm"},
                "B": {"avg": round(agg["avg_B"], 2), "unit": "ppm"},
                "S": {"avg": round(agg["avg_S"], 2), "unit": "ppm"}
            },
            "sample_count": agg["sample_count"],
            "source": "Aggregated from SHC Portal 2024-25",
            "sampling_year": 2024,
            "last_updated": datetime.utcnow().isoformat()
        }
        baseline_docs.append(doc)
    
    if baseline_docs:
        aggregate_collection.insert_many(baseline_docs)
        print(f"✅ Created {len(baseline_docs)} district-level baseline records")
        aggregate_collection.create_index([("state", 1), ("district", 1)])
    
    print("\n✅ Soil health data ingestion complete!")
    client.close()

if __name__ == "__main__":
    ingest_soil_health_data()
