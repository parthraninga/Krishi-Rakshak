#!/usr/bin/env python3
"""
Manual CSV Loader for MongoDB
==============================
Loads manually downloaded CSV files into MongoDB collections.

Use this for:
- Agmarknet mandi prices (manual download from agmarknet.gov.in)
- Fertilizer MRP (manual download from data.gov.in)
- Any other CSV data sources

Usage:
    python load_manual_csv.py --file data/agmarknet_manual.csv --collection mandi_prices
    python load_manual_csv.py --file data/fertilizer_mrp.csv --collection fertilizer_mrp --clear
"""

import csv
import pymongo
import os
import argparse
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()


def load_csv_to_mongodb(
    csv_path: str,
    collection_name: str,
    clear_collection: bool = False,
    skip_duplicates: bool = True
):
    """
    Load CSV file into MongoDB collection.
    
    Args:
        csv_path: Path to CSV file
        collection_name: MongoDB collection name
        clear_collection: If True, delete all existing documents first
        skip_duplicates: If True, skip rows that already exist
    
    Returns:
        Tuple of (inserted_count, updated_count, skipped_count)
    """
    
    csv_path = Path(csv_path)
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV file not found: {csv_path}")
    
    # Connect to MongoDB
    mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
    client = pymongo.MongoClient(mongo_uri)
    db = client["farmer_advisory"]
    collection = db[collection_name]
    
    print(f"\n{'='*60}")
    print(f"MANUAL CSV LOADER")
    print(f"{'='*60}")
    print(f"CSV file: {csv_path}")
    print(f"Collection: {collection_name}")
    print(f"Clear first: {clear_collection}")
    print(f"Skip duplicates: {skip_duplicates}\n")
    
    # Clear collection if requested
    if clear_collection:
        deleted_count = collection.delete_many({}).deleted_count
        print(f"[CLEAR] Deleted {deleted_count} existing documents\n")
    
    # Read CSV
    print(f"[READ] Loading CSV file...")
    records = []
    
    with open(csv_path, 'r', encoding='utf-8-sig', errors='replace') as f:
        # Auto-detect dialect
        sample = f.read(1024)
        f.seek(0)
        
        try:
            dialect = csv.Sniffer().sniff(sample)
        except:
            dialect = csv.excel
        
        reader = csv.DictReader(f, dialect=dialect)
        
        print(f"  Columns found: {list(reader.fieldnames)}\n")
        
        for row_num, row in enumerate(reader, 1):
            # Clean field names and values
            record = {}
            for key, value in row.items():
                if not key:
                    continue
                
                # Normalize key (lowercase, remove special chars)
                clean_key = key.strip().lower().replace(' ', '_')
                clean_key = ''.join(c if c.isalnum() or c == '_' else '_' for c in clean_key)
                clean_key = clean_key.strip('_')
                
                # Clean value
                clean_value = value.strip() if value else None
                
                record[clean_key] = clean_value
            
            # Add metadata
            record['source_file'] = csv_path.name
            record['imported_at'] = datetime.now()
            
            if record:
                records.append(record)
        
        print(f"[PARSE] Parsed {len(records)} rows from CSV\n")
    
    # Insert to MongoDB
    print(f"[INSERT] Saving to MongoDB...")
    
    inserted_count = 0
    updated_count = 0
    skipped_count = 0
    
    for i, record in enumerate(records, 1):
        if i % 100 == 0:
            print(f"  Progress: {i}/{len(records)} rows...")
        
        if skip_duplicates:
            # Create a filter based on all fields except metadata
            filter_key = {k: v for k, v in record.items() 
                         if k not in ['imported_at', 'source_file', '_id']}
            
            # Check if exists
            existing = collection.find_one(filter_key, {'_id': 1})
            if existing:
                skipped_count += 1
                continue
        
        try:
            result = collection.insert_one(record)
            if result.inserted_id:
                inserted_count += 1
        except pymongo.errors.DuplicateKeyError:
            skipped_count += 1
        except Exception as e:
            print(f"\n[WARN] Failed to insert row {i}: {e}")
            continue
    
    # Results
    print(f"\n{'='*60}")
    print(f"RESULTS")
    print(f"{'='*60}")
    print(f"Total rows in CSV: {len(records)}")
    print(f"Inserted: {inserted_count}")
    print(f"Updated: {updated_count}")
    print(f"Skipped (duplicates): {skipped_count}")
    print(f"\nMongoDB collection '{collection_name}' now has {collection.count_documents({})} total documents")
    
    # Show sample
    print(f"\n[SAMPLE] First document in collection:")
    sample_doc = collection.find_one()
    if sample_doc:
        for key, value in list(sample_doc.items())[:10]:
            print(f"  {key}: {value}")
        if len(sample_doc) > 10:
            print(f"  ... ({len(sample_doc) - 10} more fields)")
    
    client.close()
    
    return inserted_count, updated_count, skipped_count


def main():
    parser = argparse.ArgumentParser(
        description="Load CSV file into MongoDB collection",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Load Agmarknet mandi prices
  python load_manual_csv.py --file data/agmarknet_manual.csv --collection mandi_prices
  
  # Load fertilizer MRP (clear existing first)
  python load_manual_csv.py --file data/fertilizer_mrp.csv --collection fertilizer_mrp --clear
  
  # Load with duplicate checking disabled
  python load_manual_csv.py --file data.csv --collection my_data --no-skip-duplicates
        """
    )
    
    parser.add_argument("--file", required=True, help="Path to CSV file")
    parser.add_argument("--collection", required=True, help="MongoDB collection name")
    parser.add_argument("--clear", action="store_true", help="Clear collection before loading")
    parser.add_argument("--no-skip-duplicates", action="store_true", help="Insert all rows (including duplicates)")
    
    args = parser.parse_args()
    
    try:
        inserted, updated, skipped = load_csv_to_mongodb(
            csv_path=args.file,
            collection_name=args.collection,
            clear_collection=args.clear,
            skip_duplicates=not args.no_skip_duplicates
        )
        
        if inserted > 0:
            print(f"\n[OK] Successfully loaded {inserted} records!")
            return 0
        elif skipped > 0:
            print(f"\n[OK] All {skipped} records were already in database (no duplicates)")
            return 0
        else:
            print(f"\n[WARN] No records were inserted")
            return 1
            
    except Exception as e:
        print(f"\n[ERROR] Failed to load CSV: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit(main())
