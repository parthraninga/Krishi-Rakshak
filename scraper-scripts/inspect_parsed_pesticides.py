#!/usr/bin/env python3
"""
Inspect parsed pesticide data quality
"""
import json

# Load parsed data
with open('scripts/data/pesticides_parsed.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total entries: {len(data)}\n")
print("="*80)
print("First 20 entries:")
print("="*80)

for i, p in enumerate(data[:20], 1):
    print(f"\n{i}. Product: {p.get('product_name', 'N/A')}")
    print(f"   Active Ingredient: {p.get('active_ingredient', 'N/A')}")
    print(f"   Formulation: {p.get('formulation_type', 'N/A')}")
    print(f"   Manufacturer: {p.get('manufacturer', 'N/A')}")
    print(f"   Reg Number: {p.get('registration_number', 'N/A')}")
    print(f"   Status: {p.get('status', 'N/A')}")

# Check how many have actual product names vs row numbers
valid_products = [p for p in data if p.get('product_name') and not p['product_name'].isdigit() and p['product_name'] not in ['S. No.', 'N/A']]
print("\n" + "="*80)
print(f"Valid products (not row numbers): {len(valid_products)}/{len(data)}")
print("="*80)
