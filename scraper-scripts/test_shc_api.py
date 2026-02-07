#!/usr/bin/env python
"""
Quick test script to discover optimal SHC data access methods
"""
import requests
import json

BASE_URL = "https://soilhealth.dac.gov.in/jW8X3zM5Y7pQvLr4K2Tn6HqPbD0tZmN9R6JfO1wCiG8xV5eTk2CdMoF9YsQr0Z7LmN1YxU4pTb2K5LvHqX7F3aCmGzR4Pw0D8UtYnJ9oZ2SvNlQ7Tz1PjR5LcX0Qf8HkV9OrG4V7YxU3pJk6TnMm5CdX8B9tRi1Lw2Qn7F4ZzJk8WvP1GrZ6Sx0JoH5C3oV7fNi2/shc/wms/wms"

HEADERS = {
    "Referer": "https://soilhealth.dac.gov.in/slusi-visualisation/",
    "Origin": "https://soilhealth.dac.gov.in",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

print("="*70)
print("SHC API DISCOVERY TEST")
print("="*70)

# Test 1: GetCapabilities
print("\n[TEST 1] WMS GetCapabilities")
print("-"*70)
try:
    params = {
        "service": "WMS",
        "request": "GetCapabilities",
        "version": "1.1.1"
    }
    r = requests.get(BASE_URL, params=params, headers=HEADERS, timeout=15)
    print(f"Status: {r.status_code}")
    print(f"Content type: {r.headers.get('Content-Type')}")
    print(f"Length: {len(r.text)}")
    if "xml" in r.headers.get('Content-Type', '').lower():
        # Look for important bits in XML
        if "CQL_FILTER" in r.text:
            print("✅ CQL_FILTER support detected!")
        if "GetFeature" in r.text:
            print("✅ GetFeature detected!")
        print("\nFirst 1000 chars:")
        print(r.text[:1000])
except Exception as e:
    print(f"❌ Error: {e}")

# Test 2: CQL_FILTER with state
print("\n\n[TEST 2] CQL_FILTER for state='GUJARAT'")
print("-"*70)
try:
    params = {
        "service": "WMS",
        "version": "1.1.1",
        "request": "GetFeatureInfo",
        "layers": "24_438_shc_2024-25",
        "query_layers": "24_438_shc_2024-25",
        "srs": "EPSG:4326",
        "bbox": "72,23,73,24",  # Gujarat region
        "width": 101,
        "height": 101,
        "x": 50,
        "y": 50,
        "feature_count": 1000,  # Try higher count
        "info_format": "application/json",
        "CQL_FILTER": "state='GUJARAT'"
    }
    r = requests.get(BASE_URL, params=params, headers=HEADERS, timeout=20)
    print(f"Status: {r.status_code}")
    print(f"Length: {len(r.text)}")
    
    data = r.json()
    features = data.get("features", [])
    print(f"Features found: {len(features)}")
    
    if features:
        print("\n✅ CQL_FILTER WORKS!")
        print(f"Sample feature:")
        print(json.dumps(features[0], indent=2)[:500])
    else:
        print("⚠️  No features with CQL_FILTER")
        print("Response:", r.text[:500])
except Exception as e:
    print(f"❌ Error: {e}")

# Test 3: Try WFS instead of WMS
print("\n\n[TEST 3] Try WFS GetFeature (instead of WMS)")
print("-"*70)
WFS_URL = BASE_URL.replace("/wms/wms", "/wfs/wfs")
try:
    params = {
        "service": "WFS",
        "version": "2.0.0",
        "request": "GetFeature",
        "typeName": "24_438_shc_2024-25",
        "outputFormat": "application/json",
        "count": 100,
        "CQL_FILTER": "state='GUJARAT'"
    }
    r = requests.get(WFS_URL, params=params, headers=HEADERS, timeout=20)
    print(f"URL: {WFS_URL}")
    print(f"Status: {r.status_code}")
    print(f"Length: {len(r.text)}")
    
    if r.status_code == 200:
        data = r.json()
        features = data.get("features", [])
        print(f"✅ WFS works! Features: {len(features)}")
        if features:
            print("Sample:")
            print(json.dumps(features[0], indent=2)[:500])
    else:
        print("Response:", r.text[:500])
except Exception as e:
    print(f"❌ Error: {e}")

# Test 4: Check for REST API endpoints
print("\n\n[TEST 4] Look for REST API endpoints")
print("-"*70)
possible_apis = [
    "https://soilhealth.dac.gov.in/api/villages",
    "https://soilhealth.dac.gov.in/api/soil-data",
    "https://soilhealth.dac.gov.in/api/shc/data",
    "https://soilhealth.dac.gov.in/api/scheme-progress",
]

for url in possible_apis:
    try:
        r = requests.get(url, headers=HEADERS, timeout=10)
        if r.status_code == 200:
            print(f"✅ {url} - Status: {r.status_code}")
            print(f"   Length: {len(r.text)}")
            print(f"   Preview: {r.text[:200]}")
        else:
            print(f"⚠️  {url} - Status: {r.status_code}")
    except Exception as e:
        print(f"❌ {url} - Error: {type(e).__name__}")

print("\n" + "="*70)
print("DISCOVERY COMPLETE")
print("="*70)
