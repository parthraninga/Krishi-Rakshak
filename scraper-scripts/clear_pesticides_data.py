#!/usr/bin/env python3
"""
Clear pesticides registry data before fresh parse
"""
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("DB_NAME", "agritech_db")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

print("="*80)
print("CLEARING PESTICIDES DATA")
print("="*80)

# Drop all indexes from pesticides_registry
collection = db["pesticides_registry"]
print(f"\nDropping indexes from pesticides_registry...")
try:
    collection.drop_indexes()
    print("  ✓ All indexes dropped")
except Exception as e:
    print(f"  Warning: {e}")

# Delete all documents
print(f"\nDeleting all documents from pesticides_registry...")
result = collection.delete_many({})
print(f"  ✓ Deleted {result.deleted_count} documents")

# Delete JSON file
json_path = "scripts/data/pesticides_parsed.json"
if os.path.exists(json_path):
    print(f"\nDeleting {json_path}...")
    os.remove(json_path)
    print(f"  ✓ File deleted")
else:
    print(f"\n  {json_path} not found (already deleted)")

# Verify cleanup
count = collection.count_documents({})
print(f"\n{'='*80}")
print(f"CLEANUP COMPLETE")
print(f"{'='*80}")
print(f"pesticides_registry: {count} documents")
print(f"Ready for fresh parse!")

client.close()
