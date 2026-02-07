#!/usr/bin/env python
"""Analyze mandi_prices data issues"""
from pymongo import MongoClient
import json

db = MongoClient('mongodb://localhost:27017/')['farmer_advisory']
collection = db.mandi_prices

print("="*70)
print("MANDI PRICES DATA ANALYSIS")
print("="*70)

total = collection.count_documents({})
print(f"\nTotal records: {total}")

# Check unique commodities
commodities = collection.distinct('commodity')
print(f"\nUnique commodities ({len(commodities)}):")
for c in sorted([x for x in commodities if x is not None]) + [x for x in commodities if x is None]:
    count = collection.count_documents({'commodity': c})
    print(f"  - {c if c else 'NULL'}: {count} records")

# Check unique districts
districts = collection.distinct('district')
print(f"\nUnique districts ({len(districts)}):")
for d in sorted(districts)[:20]:  # Show first 20
    print(f"  - {d}")
if len(districts) > 20:
    print(f"  ... and {len(districts) - 20} more")

# Check MSP prices
msp_null_count = collection.count_documents({'msp_price': None})
msp_not_null_count = collection.count_documents({'msp_price': {'$ne': None}})
print(f"\nMSP Price Status:")
print(f"  - NULL: {msp_null_count}")
print(f"  - NOT NULL: {msp_not_null_count}")

# Sample records
print(f"\nSample records (first 5):")
print("-"*70)
for i, record in enumerate(collection.find().limit(5), 1):
    print(f"\nRecord {i}:")
    print(f"  Commodity: {record.get('commodity')}")
    print(f"  District: {record.get('district')}")
    print(f"  Date: {record.get('date')}")
    print(f"  Modal Price: {record.get('modal_price')}")
    print(f"  Min Price: {record.get('min_price')}")
    print(f"  Max Price: {record.get('max_price')}")
    print(f"  MSP Price: {record.get('msp_price')}")
    
    # Show all fields to debug
    print(f"  All fields: {list(record.keys())}")

print("\n" + "="*70)
