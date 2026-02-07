#!/usr/bin/env python3
"""
Agmarknet API Scraper - REAL API ENDPOINT
==========================================
Scrapes actual mandi price data from Agmarknet's official API.

API Endpoint: https://api.agmarknet.gov.in/v1/dashboard-data/
Discovered: February 2026

This scraper:
- Fetches data from last 1 year (365 days)
- Uses maximum limit per request
- Covers multiple states, commodities, markets
- Handles pagination and rate limiting
- Saves to MongoDB with deduplication
"""

import requests
import pymongo
import os
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import time
from dotenv import load_dotenv
import json

load_dotenv()


class AgmarknetAPIScraper:
    """Scraper for Agmarknet official API"""
    
    def __init__(self):
        self.base_url = "https://api.agmarknet.gov.in/v1/dashboard-data/"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Origin': 'https://agmarknet.gov.in',
            'Referer': 'https://agmarknet.gov.in/'
        })
        
        # MongoDB connection
        mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
        self.client = pymongo.MongoClient(mongo_uri)
        self.db = self.client["farmer_advisory"]
        self.collection = self.db["mandi_prices"]
        
        # API parameters discovered
        self.max_limit = 10000  # Will test to find actual max
        
    def test_max_limit(self) -> int:
        """Test different limit values to find maximum supported"""
        print("\n[TEST] Finding maximum API limit supported...")
        
        test_limits = [50, 100, 500, 1000, 5000, 10000, 50000]
        max_working_limit = 30  # Default from user's URL
        
        for limit in test_limits:
            params = {
                'dashboard': 'marketwise_price_arrival',
                'date': datetime.now().strftime('%Y-%m-%d'),
                'limit': limit,
                'format': 'json'
            }
            
            try:
                print(f"  Testing limit={limit}...", end=" ")
                response = self.session.get(self.base_url, params=params, timeout=30)
                
                if response.status_code == 200:
                    data = response.json()
                    if data and len(data) > 0:
                        print(f"[OK] Got {len(data)} records")
                        max_working_limit = limit
                    else:
                        print(f"[EMPTY] No data returned")
                        break
                else:
                    print(f"[FAIL] Status {response.status_code}")
                    break
                    
            except Exception as e:
                print(f"[ERROR] {str(e)[:50]}")
                break
            
            time.sleep(0.5)  # Polite delay
        
        print(f"\n  Maximum working limit: {max_working_limit}")
        return max_working_limit
    
    def get_date_range(self, days_back: int = 365) -> List[str]:
        """Generate list of dates for the last N days"""
        end_date = datetime.now()
        date_list = []
        
        for i in range(days_back):
            date = end_date - timedelta(days=i)
            date_list.append(date.strftime('%Y-%m-%d'))
        
        return date_list
    
    def normalize_record(self, record: Dict) -> Dict:
        """
        Normalize Agmarknet API fields to MongoDB schema.
        
        API Fields → MongoDB Schema:
          cmdt_name → commodity
          cmdt_grp_name → commodity_group
          msp_price → msp_price
          as_on_price → modal_price
          reported_date → date
        """
        def safe_float(val):
            if val is None or val == "":
                return None
            try:
                return float(val)
            except (ValueError, TypeError):
                return None
        
        def safe_date(val):
            if not val:
                return None
            try:
                # Try parsing DD-MM-YYYY format
                return datetime.strptime(val, '%d-%m-%Y')
            except:
                try:
                    # Try YYYY-MM-DD format
                    return datetime.strptime(val, '%Y-%m-%d')
                except:
                    return None
        
        normalized = {
            # Commodity info
            'commodity': (record.get('cmdt_name') or record.get('commodity') or '').strip(),
            'commodity_group': (record.get('cmdt_grp_name') or record.get('commodity_group') or '').strip(),
            
            # Prices
            'msp_price': safe_float(record.get('msp_price')),
            'modal_price': safe_float(record.get('as_on_price') or record.get('modal_price')),
            'min_price': safe_float(record.get('min_price')),
            'max_price': safe_float(record.get('max_price')),
            
            # Location
            'state': (record.get('state') or record.get('state_name') or '').strip(),
            'district': (record.get('district') or record.get('district_name') or '').strip(),
            'market': (record.get('market') or record.get('market_name') or '').strip(),
            
            # Date
            'date': safe_date(record.get('reported_date') or record.get('date')),
            'query_date': record.get('query_date'),
            
            # Arrivals (quantity)
            'arrival_tonnes': safe_float(record.get('as_on_arrival')),
            
            # Price history
            'one_day_ago_price': safe_float(record.get('one_day_ago_price')),
            'two_day_ago_price': safe_float(record.get('two_day_ago_price')),
            
            # Trend (up/down/stable)
            'trend': record.get('trend'),
            
            # Metadata
            'scraped_at': record.get('scraped_at', datetime.now()),
            'api_source': record.get('api_source', 'agmarknet_official_api'),
        }
        
        # Remove None/empty values except where needed
        return {k: v for k, v in normalized.items() if v is not None and v != ''}
    
    def fetch_data_for_date(
        self,
        date: str,
        state: Optional[int] = None,
        district: Optional[int] = None,
        commodity: Optional[int] = None,
        limit: int = 1000
    ) -> List[Dict]:
        """
        Fetch mandi data for a specific date.
        
        Args:
            date: Date in YYYY-MM-DD format
            state: State ID (optional, None = all states)
            district: District ID (optional)
            commodity: Commodity ID (optional)
            limit: Maximum records to fetch
        
        Returns:
            List of price records
        """
        
        params = {
            'dashboard': 'marketwise_price_arrival',
            'date': date,
            'limit': limit,
            'format': 'json'
        }
        
        # Add optional filters
        if state:
            params['state'] = state
        if district:
            params['district'] = f"[{district}]"
        if commodity:
            params['commodity'] = f"[{commodity}]"
        
        try:
            response = self.session.get(self.base_url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            # DEBUG: Print full response for first call
            if date == datetime.now().strftime('%Y-%m-%d'):
                print(f"\n  [DEBUG] Full API Response:")
                print(json.dumps(data, indent=2)[:2000])
                print("...")
            
            # Handle Agmarknet API structure:
            # {"status": "success", "data": {...}, "pagination": {...}}
            if isinstance(data, dict) and data.get('status') == 'success':
                api_data = data.get('data', {})
                
                # Check if data has 'rows' or 'records' array
                if 'rows' in api_data:
                    records = api_data['rows']
                elif 'records' in api_data:
                    records = api_data['records']
                elif isinstance(api_data, list):
                    records = api_data
                else:
                    # Data might be in different format - return whole data object
                    records = [api_data] if api_data else []
            elif isinstance(data, dict):
                # Response format: {"data": [...]}
                if 'data' in data:
                    records = data['data'] if isinstance(data['data'], list) else [data['data']]
                elif 'results' in data:
                    records = data['results']
                else:
                    records = [data]
            elif isinstance(data, list):
                records = data
            else:
                records = []
            
            # Ensure all records are dicts, add metadata, and normalize fields
            clean_records = []
            for record in records:
                if isinstance(record, dict):
                    record['scraped_at'] = datetime.now()
                    record['api_source'] = 'agmarknet_official_api'
                    record['query_date'] = date
                    # Add pagination info if available
                    if 'pagination' in data:
                        record['total_count'] = data['pagination'].get('total_count')
                    
                    # NORMALIZE FIELDS: Map Agmarknet API fields to MongoDB schema
                    normalized = self.normalize_record(record)
                    clean_records.append(normalized)
            
            return clean_records
            
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404:
                # No data for this date
                return []
            else:
                print(f"  [HTTP ERROR] {e.response.status_code}: {str(e)[:100]}")
                return []
        except requests.exceptions.Timeout:
            print(f"  [TIMEOUT] Request timed out for date {date}")
            return []
        except Exception as e:
            print(f"  [ERROR] {str(e)[:100]}")
            return []
    
    def scrape_historical_data(
        self,
        days_back: int = 365,
        limit_per_request: int = 1000,
        delay_between_requests: float = 0.5,
        states: Optional[List[int]] = None,
        commodities: Optional[List[int]] = None
    ) -> int:
        """
        Scrape data for the last N days.
        
        Args:
            days_back: Number of days to go back (default: 365 = 1 year)
            limit_per_request: Records per API call (default: 1000)
            delay_between_requests: Seconds to wait between requests (default: 0.5)
            states: List of state IDs to filter (None = all)
            commodities: List of commodity IDs to filter (None = all)
        
        Returns:
            Total number of records inserted
        """
        
        print("\n" + "="*70)
        print("AGMARKNET API SCRAPER - REAL GOVERNMENT DATA")
        print("="*70)
        print(f"API Endpoint: {self.base_url}")
        print(f"Historical period: Last {days_back} days")
        print(f"Limit per request: {limit_per_request}")
        print(f"States filter: {states or 'ALL'}")
        print(f"Commodities filter: {commodities or 'ALL'}")
        
        # Generate date range
        date_list = self.get_date_range(days_back)
        print(f"\nDate range: {date_list[-1]} to {date_list[0]}")
        print(f"Total dates to scrape: {len(date_list)}\n")
        
        # Create index for fast lookups
        print("[MONGODB] Creating indexes...")
        self.collection.create_index([
            ("date", pymongo.DESCENDING),
            ("state", pymongo.ASCENDING),
            ("market", pymongo.ASCENDING),
            ("commodity", pymongo.ASCENDING)
        ])
        self.collection.create_index([("query_date", pymongo.DESCENDING)])
        
        all_records = []
        total_api_calls = 0
        
        # If no filters, fetch all data
        if not states and not commodities:
            print("[SCRAPING] Fetching ALL states and commodities...")
            
            for i, date in enumerate(date_list, 1):
                print(f"[{i}/{len(date_list)}] {date}...", end=" ")
                
                records = self.fetch_data_for_date(
                    date=date,
                    limit=limit_per_request
                )
                
                total_api_calls += 1
                
                if records:
                    print(f"[OK] {len(records)} records")
                    all_records.extend(records)
                else:
                    print("[EMPTY]")
                
                # Polite delay
                time.sleep(delay_between_requests)
                
                # Progress checkpoint every 30 days
                if i % 30 == 0:
                    print(f"\n  Progress: {len(all_records)} total records so far...")
                    print(f"  API calls made: {total_api_calls}\n")
        
        else:
            # Fetch with filters (state/commodity combinations)
            print("[SCRAPING] Fetching with state/commodity filters...")
            
            state_list = states or [None]
            commodity_list = commodities or [None]
            
            total_combinations = len(date_list) * len(state_list) * len(commodity_list)
            current = 0
            
            for date in date_list:
                for state in state_list:
                    for commodity in commodity_list:
                        current += 1
                        
                        if current % 10 == 0:
                            print(f"Progress: {current}/{total_combinations} requests...")
                        
                        records = self.fetch_data_for_date(
                            date=date,
                            state=state,
                            commodity=commodity,
                            limit=limit_per_request
                        )
                        
                        total_api_calls += 1
                        
                        if records:
                            all_records.extend(records)
                        
                        time.sleep(delay_between_requests)
        
        # Save to MongoDB
        print(f"\n{'='*70}")
        print(f"SAVING TO MONGODB")
        print(f"{'='*70}")
        print(f"Total records fetched: {len(all_records)}")
        print(f"Total API calls made: {total_api_calls}")
        
        if not all_records:
            print("\n[WARNING] No data was fetched from API!")
            print("Possible reasons:")
            print("  1. API requires authentication (API key)")
            print("  2. IP address blocked (rate limiting)")
            print("  3. API endpoint changed")
            print("  4. No data available for date range")
            return 0
        
        print(f"\n[MONGODB] Inserting records with deduplication...")
        
        inserted_count = 0
        updated_count = 0
        skipped_count = 0
        
        for i, record in enumerate(all_records, 1):
            if i % 1000 == 0:
                print(f"  Progress: {i}/{len(all_records)} records...")
            
            # Skip if record is not a dict
            if not isinstance(record, dict):
                print(f"\n  [WARN] Skipping non-dict record: {type(record)}")
                skipped_count += 1
                continue
            
            # Create unique filter based on QUERY_DATE + commodity + location
            # Use commodity + query_date (not actual date) to save historical snapshots
            filter_key = {
                "commodity": record.get("commodity"),
                "query_date": record.get("query_date"),  # Changed from "date" to "query_date"
                "state": record.get("state")
            }
            
            # If we have district/market, use them too for better uniqueness
            if record.get("district"):
                filter_key["district"] = record.get("district")
            if record.get("market"):
                filter_key["market"] = record.get("market")
            
            # Remove None values
            filter_key = {k: v for k, v in filter_key.items() if v is not None}
            
            if not filter_key:
                # If we can't create a unique key, just insert
                try:
                    result = self.collection.insert_one(record)
                    if result.inserted_id:
                        inserted_count += 1
                except:
                    skipped_count += 1
                continue
            
            # Upsert to avoid duplicates
            try:
                result = self.collection.update_one(
                    filter_key,
                    {"$set": record},
                    upsert=True
                )
                
                if result.upserted_id:
                    inserted_count += 1
                elif result.modified_count > 0:
                    updated_count += 1
                else:
                    skipped_count += 1
            except Exception as e:
                print(f"\n  [ERROR] Failed to insert record: {str(e)[:100]}")
                skipped_count += 1
        
        print(f"\n{'='*70}")
        print(f"RESULTS")
        print(f"{'='*70}")
        print(f"Total records fetched: {len(all_records)}")
        print(f"Inserted (new): {inserted_count}")
        print(f"Updated (existing): {updated_count}")
        print(f"Skipped (duplicates): {skipped_count}")
        print(f"\nMongoDB collection 'mandi_prices' now has: {self.collection.count_documents({})} total documents")
        
        # Show sample data
        if inserted_count > 0:
            print(f"\n[SAMPLE] First mandi price record:")
            sample = self.collection.find_one()
            if sample:
                for key, value in list(sample.items())[:12]:
                    print(f"  {key}: {value}")
        
        self.client.close()
        
        return inserted_count


def main():
    """Run Agmarknet API scraper"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Scrape Agmarknet mandi prices from official API",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Scrape last 7 days (quick test)
  python scrape_agmarknet_api.py --days 7
  
  # Scrape full year with maximum data
  python scrape_agmarknet_api.py --days 365 --limit 5000
  
  # Scrape specific states (Gujarat, Punjab)
  python scrape_agmarknet_api.py --days 30 --states 100006 100015
  
  # Find maximum API limit
  python scrape_agmarknet_api.py --test-limit
        """
    )
    
    parser.add_argument("--days", type=int, default=365,
                       help="Number of days to scrape (default: 365)")
    parser.add_argument("--limit", type=int, default=1000,
                       help="Records per API request (default: 1000)")
    parser.add_argument("--delay", type=float, default=0.5,
                       help="Seconds between requests (default: 0.5)")
    parser.add_argument("--states", nargs="+", type=int,
                       help="State IDs to filter (optional)")
    parser.add_argument("--commodities", nargs="+", type=int,
                       help="Commodity IDs to filter (optional)")
    parser.add_argument("--test-limit", action="store_true",
                       help="Test to find maximum API limit")
    
    args = parser.parse_args()
    
    scraper = AgmarknetAPIScraper()
    
    # Test max limit if requested
    if args.test_limit:
        max_limit = scraper.test_max_limit()
        print(f"\n[RESULT] Maximum API limit: {max_limit}")
        print(f"Use this value with --limit flag for maximum data per request")
        return 0
    
    # Scrape data
    count = scraper.scrape_historical_data(
        days_back=args.days,
        limit_per_request=args.limit,
        delay_between_requests=args.delay,
        states=args.states,
        commodities=args.commodities
    )
    
    if count > 0:
        print(f"\n[OK] Successfully scraped {count} new mandi price records!")
        return 0
    else:
        print(f"\n[WARN] No new records inserted (may be duplicates or API issue)")
        return 1


if __name__ == "__main__":
    exit(main())
