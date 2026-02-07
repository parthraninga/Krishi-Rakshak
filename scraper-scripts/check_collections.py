from pymongo import MongoClient

db = MongoClient('mongodb://localhost:27017/')['farmer_advisory']
print('Collections:', db.list_collection_names())
print()
for coll in db.list_collection_names():
    count = db[coll].count_documents({})
    print(f'{coll}: {count} documents')
    if coll == 'mandi_prices' and count > 0:
        print("  Sample:")
        for r in db[coll].find().limit(1):
            for k, v in list(r.items())[:10]:
                print(f"    {k}: {v}")
