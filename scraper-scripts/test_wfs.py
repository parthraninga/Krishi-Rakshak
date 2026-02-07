#!/usr/bin/env python
"""Test WFS (Web Feature Service) instead of WMS for actual data retrieval"""
import requests
import json

# Try WFS endpoint (replace /wms/wms with /wfs/ or /ows)
BASE_URLS = [
    "https://soilhealth.dac.gov.in/jW8X3zM5Y7pQvLr4K2Tn6HqPbD0tZmN9R6JfO1wCiG8xV5eTk2CdMoF9YsQr0Z7LmN1YxU4pTb2K5LvHqX7F3aCmGzR4Pw0D8UtYnJ9oZ2SvNlQ7Tz1PjR5LcX0Qf8HkV9OrG4V7YxU3pJk6TnMm5CdX8B9tRi1Lw2Qn7F4ZzJk8WvP1GrZ6Sx0JoH5C3oV7fNi2/shc/wfs/wfs",
    "https://soilhealth.dac.gov.in/jW8X3zM5Y7pQvLr4K2Tn6HqPbD0tZmN9R6JfO1wCiG8xV5eTk2CdMoF9YsQr0Z7LmN1YxU4pTb2K5LvHqX7F3aCmGzR4Pw0D8UtYnJ9oZ2SvNlQ7Tz1PjR5LcX0Qf8HkV9OrG4V7YxU3pJk6TnMm5CdX8B9tRi1Lw2Qn7F4ZzJk8WvP1GrZ6Sx0JoH5C3oV7fNi2/shc/ows",
]

HEADERS = {
    "Referer": "https://soilhealth.dac.gov.in/slusi-visualisation/",
    "User-Agent": "Mozilla/5.0"
}

print("="*70)
print("TESTING WFS (Web Feature Service) FOR RAW DATA")
print("="*70)

for base_url in BASE_URLS:
    print(f"\n[TEST] URL: {base_url}")
    print("-"*70)
    
    # Test WFS GetFeature
    params = {
        "service": "WFS",
        "version": "2.0.0",
        "request": "GetFeature",
        "typeName": "24_438_shc_2024-25",
        "outputFormat": "application/json",
        "count": 100,
        "srsName": "EPSG:4326"
    }
    
    try:
        r = requests.get(base_url, params=params, headers=HEADERS, timeout=30)
        print(f"Status: {r.status_code}")
        print(f"Content-Type: {r.headers.get('Content-Type')}")
        
        if r.status_code == 200:
            try:
                data = r.json()
                features = data.get("features", [])
                print(f"✅ WFS WORKS! Features: {len(features)}")
                
                if features:
                    print("\n🎉 FOUND DATA!")
                    print("Sample feature:")
                    print(json.dumps(features[0], indent=2)[:1500])
                    break  # Success!
                else:
                    print("⚠️  0 features returned")
                    print("Response:", json.dumps(data, indent=2)[:500])
            except json.JSONDecodeError:
                print("Response (not JSON):", r.text[:500])
        else:
            print(f"❌ HTTP {r.status_code}")
            print("Response:", r.text[:300])
            
    except Exception as e:
        print(f"❌ Error: {e}")

# Try alternative: Check if there's a REST API endpoint
print("\n\n" + "="*70)
print("TESTING REST API ENDPOINTS")
print("="*70)

rest_urls = [
    "https://soilhealth.dac.gov.in/api/public/soil-data",
    "https://soilhealth.dac.gov.in/api/shc/village-data",
    "https://soilhealth.dac.gov.in/api/v1/soil-health",
]

for url in rest_urls:
    print(f"\n[TEST] {url}")
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        print(f"  Status: {r.status_code}")
        if r.status_code == 200:
            print(f"  ✅ Endpoint exists! Length: {len(r.text)}")
            print(f"  Preview: {r.text[:300]}")
        elif r.status_code == 401 or r.status_code == 403:
            print(f"  🔒 Auth required")
        else:
            print(f"  ❌ Not accessible")
    except Exception as e:
        print(f"  ❌ {type(e).__name__}")

print("\n" + "="*70)
print(" DIAGNOSIS COMPLETE")
print("="*70)
