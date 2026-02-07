#!/usr/bin/env python3
"""
Check what's in the small collections
"""
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017/"))
db = client[os.getenv("DB_NAME", "agritech_db")]

print("="*80)
print("CURRENT DATA IN SMALL COLLECTIONS")
print("="*80)

print("\n📊 fertilizer_mrp (10 documents):")
print("-"*80)
for doc in db.fertilizer_mrp.find().limit(10):
    print(f"  • {doc.get('product_name', 'N/A'):40s} MRP: ₹{doc.get('mrp', 'N/A')}")

print("\n📋 advisory_rules (6 documents):")
print("-"*80)
for doc in db.advisory_rules.find():
    inputs = ', '.join(doc.get('inputs', [])) if doc.get('inputs') else 'N/A'
    print(f"  • {doc.get('crop', 'N/A'):15s} - {doc.get('stage', 'N/A'):20s} → {inputs[:40]}")

print("\n🌱 soil_baseline (10 documents):")
print("-"*80)
for doc in db.soil_baseline.find().limit(10):
    print(f"  • {doc.get('district', 'N/A'):20s} N:{doc.get('N_avg', 'N/A'):>6} P:{doc.get('P_avg', 'N/A'):>6} K:{doc.get('K_avg', 'N/A'):>6}")

print("\n📦 products (10 documents):")
print("-"*80)
for doc in db.products.find().limit(10):
    print(f"  • {doc.get('product_name', 'N/A'):40s} [{doc.get('category', 'N/A')}]")

print("\n" + "="*80)
print("ASSESSMENT:")
print("="*80)
print("❌ fertilizer_mrp: Only 10 (should be 30-50+ major fertilizers)")
print("❌ advisory_rules: Only 6 (should be 100+ for various crop-soil-pest scenarios)")
print("❌ soil_baseline: Only 10 (India has 700+ districts)")
print("❌ products: Only 10 seed SKUs (should be 100-1000+ for real catalog)")

client.close()
