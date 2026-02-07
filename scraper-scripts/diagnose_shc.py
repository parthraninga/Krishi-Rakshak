#!/usr/bin/env python
"""Quick diagnostic to check if SHC WMS layer has ANY data"""
import requests
import json

BASE_URL = "https://soilhealth.dac.gov.in/jW8X3zM5Y7pQvLr4K2Tn6HqPbD0tZmN9R6JfO1wCiG8xV5eTk2CdMoF9YsQr0Z7LmN1YxU4pTb2K5LvHqX7F3aCmGzR4Pw0D8UtYnJ9oZ2SvNlQ7Tz1PjR5LcX0Qf8HkV9OrG4V7YxU3pJk6TnMm5CdX8B9tRi1Lw2Qn7F4ZzJk8WvP1GrZ6Sx0JoH5C3oV7fNi2/shc/wms/wms"
HEADERS = {
    "Referer": "https://soilhealth.dac.gov.in/slusi-visualisation/",
    "User-Agent": "Mozilla/5.0"
}

print("Testing SHC WMS layer for data...")
print("-" * 70)

# Test 1: Entire India bounding box
print("\n[1] Testing entire India (bbox: 68,8,97,35)")
params = {
    "service": "WMS",
    "version": "1.1.1",
    "request": "GetFeatureInfo",
    "layers": "24_438_shc_2024-25",
    "query_layers": "24_438_shc_2024-25",
    "srs": "EPSG:4326",
    "bbox": "68,8,97,35",  # Entire India
    "width": 101,
    "height": 101,
    "x": 50,
    "y": 50,
    "feature_count": 10,
    "info_format": "application/json"
}

try:
    r = requests.get(BASE_URL, params=params, headers=HEADERS, timeout=30)
    print(f"Status: {r.status_code}")
    data = r.json()
    features = data.get("features", [])
    print(f"Features found: {len(features)}")
    if features:
        print("\n✅ DATA EXISTS!")
        print("Sample feature:")
        print(json.dumps(features[0], indent=2)[:1000])
    else:
        print("❌ No features - layer might be empty or require different params")
        print("Response:", json.dumps(data, indent=2)[:500])
except Exception as e:
    print(f"Error: {e}")

# Test 2: Try different layer names
print("\n\n[2] Testing different layer variations...")
for layer in ["24_438_shc_2024-25", "shc_2024-25", "24_438", "shc"]:
    print(f"\nTrying layer: {layer}")
    params["layers"] = layer
    params["query_layers"] = layer
    try:
        r = requests.get(BASE_URL, params=params, headers=HEADERS, timeout=20)
        if r.status_code == 200:
            data = r.json()
            features_count = len(data.get("features", []))
            print(f"  Status: {r.status_code}, Features: {features_count}")
            if features_count > 0:
                print(f"  ✅ FOUND DATA IN LAYER: {layer}")
        else:
            print(f"  Status: {r.status_code}")
    except Exception as e:
        print(f"  Error: {type(e).__name__}")

print("\n" + "=" * 70)
