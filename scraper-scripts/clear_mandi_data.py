#!/usr/bin/env python
"""Clear mandi_prices collection and re-scrape with fixed parser"""
from pymongo import MongoClient

db = MongoClient('mongodb://localhost:27017/')['farmer_advisory']
collection = db.mandi_prices

print("="*70)
print("CLEARING BAD MANDI DATA")
print("="*70)

# Get current count
before_count = collection.count_documents({})
print(f"\nBefore: {before_count} records")

# Delete all records
result = collection.delete_many({})
print(f"Deleted: {result.deleted_count} records")

# Verify empty
after_count = collection.count_documents({})
print(f"After: {after_count} records")

print("\n✅ Database cleared! Ready for re-scraping with fixed parser.")
print("\nRun this to re-scrape:")
print("  python scripts/scrape_agmarknet_api.py --days 7")
print("\n" + "="*70)
