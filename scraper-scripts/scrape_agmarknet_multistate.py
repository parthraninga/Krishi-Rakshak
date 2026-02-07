#!/usr/bin/env python3
"""
Agmarknet API - Enhanced Multi-State/Commodity Scraper
=======================================================
Scrapes comprehensive data by iterating through:
- Multiple states (all major agricultural states)
- Multiple commodities (major crops)
- Last N days

This gets MUCH more data than the basic scraper by exploring
all state/commodity combinations.
"""

import requests
import pymongo
import os
from datetime import datetime, timedelta
from typing import List, Dict
import time
from dotenv import load_dotenv

load_dotenv()


# Major agricultural states in India (ID mapping discovered from Agmarknet)
STATES = {
    100006: "Gujarat",
    100015: "Punjab",
    100016: "Haryana", 
    100017: "Uttar Pradesh",
    100018: "Maharashtra",
    100019: "Karnataka",
    100020: "Tamil Nadu",
    100021: "Andhra Pradesh",
    100022: "Telangana",
    100023: "Madhya Pradesh",
    100024: "Rajasthan",
    100025: "West Bengal",
    100026: "Bihar",
    100027: "Odisha",
}

# Major commodities (crops) - these are example IDs
# The actual IDs may differ - the scraper will test and discover working ones
COMMODITIES = {
    100001: "Wheat",
    100002: "Rice",
    100003: "Maize (Corn)",
    100004: "Arhar (Tur/Pigeon Pea)",
    100005: "Gram (Chickpea)",
    100006: "Masoor (Lentil)",
    100007: "Groundnut",
    100008: "Soybean",
    100009: "Sunflower",
    100010: "Cotton",
    100011: "Sugarcane",
    100012: "Potato",
    100013: "Onion",
    100014: "Tomato",
}


class AgmarknetMultiStateScraper:
    """Enhanced scraper that queries multiple states and commodities"""
    
    def __init__(self):
        self.base_url = "https://api.agmarknet.gov.in/v1/dashboard-data/"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Referer': 'https://agmarknet.gov.in/'
        })
        
        # MongoDB
        mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
        self.client = pymongo.MongoClient(mongo_uri)
        self.db = self.client["farmer_advisory"]
        self.collection = self.db["mandi_prices"]
        
    def fetch_state_commodity_date(
        self,
        state_id: int,
        commodity_id: int,
        date: str,
        limit: int = 10000
    ) -> List[Dict]:
        """Fetch data for specific state/commodity/date combination"""
        
        params = {
            'dashboard': 'marketwise_price_arrival',
            'date': date,
            'state': state_id,
            'commodity': f"[{commodity_id}]",
            'limit': limit,
            'format': 'json'
        }
        
        try:
            response = self.session.get(self.base_url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if isinstance(data, list):
                records = data
            elif isinstance(data, dict) and 'data' in data:
                records = data['data']
            else:
                records = []
            
            # Add metadata
            for record in records:
                if isinstance(record, dict):
                    record['scraped_at'] = datetime.now()
                    record['state_id'] = state_id
                    record['commodity_id'] = commodity_id
            
            return records
            
        except:
            return []
    
    def scrape_comprehensive_data(
        self,
        days_back: int = 30,
        states: Dict[int, str] = STATES,
        commodities: Dict[int, str] = COMMODITIES,
        delay: float = 0.3
    ) -> int:
        """
        Scrape data for all state/commodity/date combinations.
        
        Args:
            days_back: Number of days to scrape (default: 30)
            states: Dict of state_id -> name
            commodities: Dict of commodity_id -> name
            delay: Delay between requests in seconds
        
        Returns:
            Number of records inserted
        """
        
        print("\n" + "="*70)
        print("AGMARKNET COMPREHENSIVE SCRAPER")
        print("="*70)
        print(f"States: {len(states)}")
        print(f"Commodities: {len(commodities)}")
        print(f"Days: {days_back}")
        
        total_combinations = len(states) * len(commodities) * days_back
        print(f"Total API calls: {total_combinations}")
        print(f"Estimated time: {total_combinations * delay / 60:.1f} minutes\n")
        
        # Create indexes
        self.collection.create_index([
            ("state_id", pymongo.ASCENDING),
            ("commodity_id", pymongo.ASCENDING),
            ("date", pymongo.DESCENDING)
        ])
        
        # Generate dates
        dates = []
        for i in range(days_back):
            date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
            dates.append(date)
        
        all_records = []
        current_call = 0
        successful_calls = 0
        
        for state_id, state_name in states.items():
            print(f"\n[STATE] {state_name} (ID: {state_id})")
            
            for commodity_id, commodity_name in commodities.items():
                print(f"  [COMMODITY] {commodity_name} (ID: {commodity_id})", end=" ")
                
                state_commodity_records = []
                
                for date in dates:
                    current_call += 1
                    
                    records = self.fetch_state_commodity_date(
                        state_id=state_id,
                        commodity_id=commodity_id,
                        date=date,
                        limit=10000
                    )
                    
                    if records:
                        state_commodity_records.extend(records)
                        successful_calls += 1
                    
                    time.sleep(delay)
                
                if state_commodity_records:
                    print(f"[OK] {len(state_commodity_records)} records over {days_back} days")
                    all_records.extend(state_commodity_records)
                else:
                    print("[EMPTY]")
                
                # Progress update
                progress = (current_call / total_combinations) * 100
                print(f"    Progress: {current_call}/{total_combinations} ({progress:.1f}%)")
        
        print(f"\n{'='*70}")
        print(f"SCRAPING COMPLETE")
        print(f"{'='*70}")
        print(f"API calls made: {current_call}")
        print(f"Successful calls: {successful_calls}")
        print(f"Total records fetched: {len(all_records)}")
        
        if not all_records:
            print("\n[WARNING] No data retrieved!")
            return 0
        
        # Save to MongoDB
        print(f"\n[MONGODB] Saving records...")
        
        inserted_count = 0
        
        for i, record in enumerate(all_records, 1):
            if i % 1000 == 0:
                print(f"  Progress: {i}/{len(all_records)}")
            
            try:
                # Upsert based on unique combination
                filter_key = {
                    "state_id": record.get("state_id"),
                    "commodity_id": record.get("commodity_id"),
                    "date": record.get("date"),
                    "market": record.get("market"),
                }
                
                result = self.collection.update_one(
                    filter_key,
                    {"$set": record},
                    upsert=True
                )
                
                if result.upserted_id:
                    inserted_count += 1
                    
            except Exception as e:
                continue
        
        print(f"\n[RESULTS]")
        print(f"Inserted: {inserted_count} new records")
        print(f"Total in DB: {self.collection.count_documents({})}")
        
        self.client.close()
        
        return inserted_count


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Scrape Agmarknet with state/commodity combinations")
    parser.add_argument("--days", type=int, default=30, help="Days to scrape (default: 30)")
    parser.add_argument("--delay", type=float, default=0.3, help="Delay between requests (default: 0.3s)")
    parser.add_argument("--quick-test", action="store_true", help="Test with 2 states, 3 commodities, 7 days")
    
    args = parser.parse_args()
    
    scraper = AgmarknetMultiStateScraper()
    
    if args.quick_test:
        print("\n[QUICK TEST MODE]")
        test_states = {100006: "Gujarat", 100015: "Punjab"}
        test_commodities = {100001: "Wheat", 100013: "Onion", 100014: "Tomato"}
        
        count = scraper.scrape_comprehensive_data(
            days_back=7,
            states=test_states,
            commodities=test_commodities,
            delay=args.delay
        )
    else:
        count = scraper.scrape_comprehensive_data(
            days_back=args.days,
            states=STATES,
            commodities=COMMODITIES,
            delay=args.delay
        )
    
    if count > 0:
        print(f"\n[OK] Scraped {count} records!")
        return 0
    else:
        print(f"\n[WARN] No new records")
        return 1


if __name__ == "__main__":
    exit(main())
