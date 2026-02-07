"""Analyze soil_health_nested.json structure."""
import json
from pathlib import Path

data_file = Path(__file__).parent / "data" / "soil_health_nested.json"
with open(data_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total districts: {len(data)}")
total_samples = sum(len(d['items']) for d in data)
print(f"Total village samples: {total_samples}")

print(f"\nSample district structure:")
sample = data[0]
print(f"State: {sample['state']}")
print(f"District: {sample['district']}")
print(f"District code: {sample['district_code']}")
print(f"Village samples: {len(sample['items'])}")
print(f"\nFirst village sample:")
first_village = sample['items'][0]
print(f"  Village: {first_village['village']}")
print(f"  Lat/Lng: {first_village['latitude']}, {first_village['longitude']}")
print(f"  Nutrients: {list(first_village['nutrients'].keys())}")

# Check states coverage
states = set(d['state'] for d in data)
print(f"\nStates covered: {len(states)}")
for state in sorted(states):
    districts = [d['district'] for d in data if d['state'] == state]
    print(f"  {state}: {len(districts)} districts")
