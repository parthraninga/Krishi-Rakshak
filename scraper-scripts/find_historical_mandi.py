"""
Find historical mandi price data sources
"""
import requests
from datetime import datetime, timedelta

print("=" * 70)
print("SEARCHING FOR HISTORICAL MANDI PRICE DATA")
print("=" * 70)

# Option 1: data.gov.in Daily Price dataset
print("\n1. Testing data.gov.in Daily Agricultural Prices...")
try:
    url = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
    params = {
        "api-key": "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b",
        "format": "json",
        "limit": 10,
        "offset": 0
    }
    resp = requests.get(url, params=params, timeout=15)
    print(f"   Status: {resp.status_code}")
    
    if resp.status_code == 200:
        data = resp.json()
        total = data.get("total", 0)
        records = data.get("records", [])
        print(f"   ✓ Found {total:,} total records!")
        
        if records:
            print(f"   Sample record fields: {list(records[0].keys())}")
            print(f"   Sample data:")
            for key, val in list(records[0].items())[:8]:
                print(f"     {key}: {val}")
            
            # Check date range
            if "arrival_date" in records[0]:
                print(f"\n   Date field: arrival_date")
                print(f"   Sample dates: {[r.get('arrival_date') for r in records[:3]]}")
            elif "date" in records[0]:
                print(f"\n   Date field: date") 
                print(f"   Sample dates: {[r.get('date') for r in records[:3]]}")
except Exception as e:
    print(f"   Error: {e}")

# Option 2: Test Agmarknet with state filter
print("\n2. Testing Agmarknet API with state-specific query...")
try:
    url = "https://api.agmarknet.gov.in/v1/dashboard-data/"
    
    # Try without date to see all available parameters
    params = {
        "dashboard": "marketwise_price_arrival",
        "limit": 50000,
        "format": "json"
    }
    resp = requests.get(url, params=params, timeout=10)
    print(f"   Status: {resp.status_code}")
    
    if resp.status_code == 200:
        data = resp.json()
        records = data.get("data", {}).get("records", [])
        print(f"   Records returned: {len(records)}")
        
        if records:
            # Check if there are different dates in the data
            dates = set()
            for rec in records[:100]:  # Check first 100
                if "reported_date" in rec:
                    dates.add(rec["reported_date"])
            
            print(f"   Unique dates in response: {len(dates)}")
            print(f"   Dates: {list(dates)[:5]}")
            
            if len(dates) > 1:
                print("   ✓ Multiple dates found - API may have historical data!")
            else:
                print(f"   ✗ Only one date ({list(dates)[0]}) - latest snapshot only")
except Exception as e:
    print(f"   Error: {e}")

# Option 3: Check if increasing limit gives more historical data
print("\n3. Testing if higher limit gives historical records...")
try:
    url = "https://api.agmarknet.gov.in/v1/dashboard-data/"
    params = {
        "dashboard": "marketwise_price_arrival",
        "limit": 50000,
        "format": "json"  
    }
    resp = requests.get(url, params=params, timeout=15)
    
    if resp.status_code == 200:
        data = resp.json()
        total_count = data.get("pagination", {}).get("total_count", 0)
        records = data.get("data", {}).get("records", [])
        print(f"   Total count: {total_count}")
        print(f"   Records returned: {len(records)}")
        
        # Check dates
        if records:
            dates = [r.get("reported_date") for r in records if "reported_date" in r]
            unique_dates = set(dates)
            print(f"   Unique dates: {unique_dates}")
except Exception as e:
    print(f"   Error: {e}")

print("\n" + "=" * 70)
print("RECOMMENDATION")
print("=" * 70)
