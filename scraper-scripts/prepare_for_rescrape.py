from db_helper import get_db

db = get_db()

print("Dropping problematic index...")
try:
    db.mandi_prices.drop_index('commodity_1_date_1_state_1_market_1')
    print("  ✓ Dropped")
except Exception as e:
    print(f"  Note: {e}")

print("\nClearing collection...")
result = db.mandi_prices.delete_many({})
print(f"  Deleted: {result.deleted_count}")

count = db.mandi_prices.count_documents({})
print(f"\nCollection now has: {count} records")
print("Ready to re-scrape!")
