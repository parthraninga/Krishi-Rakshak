import requests
from datetime import datetime, timedelta

date = (datetime.now() - timedelta(days=10)).strftime('%d/%m/%Y')
url = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070'
params = {
    'api-key': '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b',
    'format': 'json',
    'limit': 10,
    'filters[arrival_date]': date
}

print(f'Testing data.gov.in with date {date}...')
resp = requests.get(url, params=params, timeout=15)
print(f'Status: {resp.status_code}')

if resp.status_code == 200:
    data = resp.json()
    print(f'Records found: {len(data.get("records", []))}')
    print(f'Total in DB: {data.get("total", 0):,}')
    if data.get('records'):
        rec = data['records'][0]
        print(f'\nSample record:')
        print(f'  Commodity: {rec.get("commodity")}')
        print(f'  State: {rec.get("state")}')
        print(f'  Market: {rec.get("market")}')
        print(f'  Date: {rec.get("arrival_date")}')
        print(f'  Modal Price: {rec.get("modal_price")}')
elif resp.status_code == 429:
    print('RATE LIMITED - Need to wait')
else:
    print(f'Error: {resp.text[:200]}')
