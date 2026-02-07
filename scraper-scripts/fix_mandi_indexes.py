"""
Drop old unique index and create new one based on query_date
"""
from db_helper import get_db

db = get_db()
collection = db.mandi_prices

print("Current indexes:")
for idx in collection.list_indexes():
    print(f"  - {idx['name']}: {idx.get('key')}")

print("\nDropping old unique index: commodity_1_date_1_state_1...")
try:
    collection.drop_index("commodity_1_date_1_state_1")
    print("  ✓ Dropped")
except Exception as e:
    print(f"  Error (may not exist): {e}")

print("\nDropping index: commodity_1_district_1_date_1...")
try:
    collection.drop_index("commodity_1_district_1_date_1")  
    print("  ✓ Dropped")
except Exception as e:
    print(f"  Note: {e}")

print("\nCreating new index based on query_date...")
collection.create_index([
    ("commodity", 1),
    ("query_date", 1),
    ("state", 1)
], unique=True, name="commodity_querydate_state")
print("  ✓ Created: commodity_querydate_state")

print("\nFinal indexes:")
for idx in collection.list_indexes():
    print(f"  - {idx['name']}: {idx.get('key')}")

print("\nReady to scrape!")
