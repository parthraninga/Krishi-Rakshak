"""
Agmarknet Historical Price Scraper - State/Market/Commodity Level
Uses the actual agmarknet.gov.in portal to fetch historical daily prices
"""

import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import time
import json
from db_helper import get_db

class AgmarknetHistoricalScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        self.base_url = "https://agmarknet.gov.in"
        
        # Major states to scrape
        self.states = [
            'Andhra Pradesh', 'Bihar', 'Gujarat', 'Haryana', 'Karnataka',
            'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu',
            'Telangana', 'Uttar Pradesh', 'West Bengal'
        ]
        
        # Key commodities to track
        self.commodities = [
            'Wheat', 'Rice', 'Paddy(Dhan)(Common)', 'Maize', 'Bajra(Pearl Millet/Cumbu)',
            'Jowar(Sorghum)', 'Barley(Jau)', 'Ragi(Finger Millet)',
            'Arhar(Tur/Red Gram)(Whole)', 'Moong(Green Gram)', 'Urad', 'Masoor(Lentil)',
            'Gram(Whole)', 'Soyabean', 'Groundnut', 'Mustard', 'Sunflower',
            'Cotton', 'Onion', 'Potato', 'Tomato'
        ]
        
    def fetch_datewise_prices(self, date: str, state: str = None, commodity: str = None) -> List[Dict]:
        """
        Fetch prices for a specific date using the data.gov.in API
        This has historical data going back years!
        """
        
        # data.gov.in has a dataset with historical mandi prices
        url = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
        
        params = {
            "api-key": "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b",
            "format": "json",
            "limit": 5000,  # Fetch more records per request
            "offset": 0
        }
        
        # Add filters if provided
        if state:
            params["filters[state]"] = state
        if commodity:
            params["filters[commodity]"] = commodity
        
        # data.gov.in uses "arrival_date" field in DD/MM/YYYY format
        date_obj = datetime.strptime(date, '%Y-%m-%d')
        date_formatted = date_obj.strftime('%d/%m/%Y')
        params["filters[arrival_date]"] = date_formatted
        
        try:
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            records = data.get("records", [])
            
            # Normalize field names to match our MongoDB schema
            normalized_records = []
            for rec in records:
                normalized = {
                    "commodity": rec.get("commodity", "").strip(),
                    "state": rec.get("state", "").strip(),
                    "district": rec.get("district", "").strip(),
                    "market": rec.get("market", "").strip(),
                    "variety": rec.get("variety", "").strip() if rec.get("variety") else None,
                    "modal_price": self._safe_float(rec.get("modal_price")),
                    "min_price": self._safe_float(rec.get("min_price")),
                    "max_price": self._safe_float(rec.get("max_price")),
                    "arrival_tonnes": self._safe_float(rec.get("arrivals_in_qtl")),  # Convert qtl to tonnes if needed
                    "date": date_obj,
                    "scraped_at": datetime.now(),
                    "api_source": "data.gov.in_mandi_prices",
                    "query_date": date
                }
                
                # Remove None values
                normalized = {k: v for k, v in normalized.items() if v is not None and v != ""}
                if normalized.get("commodity"):  # Only add if commodity exists
                    normalized_records.append(normalized)
            
            return normalized_records
            
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429:
                print(f"  [RATE LIMIT] Waiting 60 seconds...")
                time.sleep(60)
                return []
            else:
                print(f"  [ERROR] HTTP {e.response.status_code}")
                return []
        except Exception as e:
            print(f"  [ERROR] {str(e)[:100]}")
            return []
    
    def _safe_float(self, value) -> Optional[float]:
        """Convert string to float safely"""
        if value is None or value == "":
            return None
        try:
            # Remove commas and whitespace
            cleaned = str(value).replace(",", "").strip()
            if cleaned:
                return float(cleaned)
        except:
            pass
        return None
    
    def scrape_historical(self, days: int = 365, delay: float = 1.0):
        """
        Scrape historical data for the past N days
        """
        print("=" * 70)
        print("AGMARKNET HISTORICAL MANDI PRICE SCRAPER")
        print("Using data.gov.in API with historical records")
        print("=" * 70)
        print(f"Period: Last {days} days")
        print(f"States: {len(self.states)} major states")
        print(f"Commodities: {len(self.commodities)} key crops")
        print()
        
        # Generate date range
        end_date = datetime.now()
        dates = [(end_date - timedelta(days=i)).strftime('%Y-%m-%d') for i in range(days)]
        
        print(f"Date range: {dates[-1]} to {dates[0]}")
        print(f"Total dates to scrape: {len(dates)}")
        print()
        
        # MongoDB setup
        db = get_db()
        collection = db.mandi_prices
        
        # Create indexes
        print("[MONGODB] Creating indexes...")
        collection.create_index([("commodity", 1), ("date", 1), ("state", 1), ("market", 1)], unique=True)
        collection.create_index([("date", -1)])
        collection.create_index([("commodity", 1)])
        print()
        
        total_fetched = 0
        total_inserted = 0
        total_updated = 0
        api_calls = 0
        
        for idx, date in enumerate(dates, 1):
            print(f"[{idx}/{len(dates)}] {date}...", end=" ", flush=True)
            
            # Fetch data for this date (all states and commodities)
            records = self.fetch_datewise_prices(date)
            api_calls += 1
            
            if records:
                total_fetched += len(records)
                print(f"[OK] {len(records)} records", end=" ")
                
                # Insert into MongoDB with deduplication
                inserted = 0
                updated = 0
                for rec in records:
                    filter_key = {
                        "commodity": rec.get("commodity"),
                        "date": rec.get("date"),
                        "state": rec.get("state"),
                        "market": rec.get("market")
                    }
                    
                    result = collection.update_one(
                        filter_key,
                        {"$set": rec},
                        upsert=True
                    )
                    
                    if result.upserted_id:
                        inserted += 1
                    elif result.modified_count > 0:
                        updated += 1
                
                total_inserted += inserted
                total_updated += updated
                print(f"(+{inserted} new, ~{updated} updated)")
            else:
                print(f"[SKIP] No data")
            
            # Progress updates every 30 days
            if idx % 30 == 0:
                total_docs = collection.count_documents({})
                print(f"\n  Progress: {total_fetched:,} records fetched, {total_docs:,} total in DB")
                print(f"  API calls made: {api_calls}\n")
            
            # Rate limiting
            if delay > 0:
                time.sleep(delay)
        
        # Final stats
        final_count = collection.count_documents({})
        
        print()
        print("=" * 70)
        print("SCRAPING COMPLETE")
        print("=" * 70)
        print(f"Total records fetched: {total_fetched:,}")
        print(f"Inserted (new): {total_inserted:,}")
        print(f"Updated (existing): {total_updated:,}")
        print(f"Total API calls made: {api_calls}")
        print(f"\nMongoDB collection 'mandi_prices' now has: {final_count:,} total documents")
        print("=" * 70)

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Scrape historical mandi prices from data.gov.in")
    parser.add_argument("--days", type=int, default=365, help="Number of days to scrape (default: 365)")
    parser.add_argument("--delay", type=float, default=1.0, help="Delay between requests in seconds (default: 1.0)")
    
    args = parser.parse_args()
    
    scraper = AgmarknetHistoricalScraper()
    scraper.scrape_historical(days=args.days, delay=args.delay)
