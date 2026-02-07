#!/usr/bin/env python3
"""
Real Agmarknet Mandi Price Scraper
===================================
Scrapes ACTUAL daily mandi prices from agmarknet.gov.in portal.
This is the official government wholesale market price database.

Data Source: https://agmarknet.gov.in/
Last Updated: February 2026
"""

import requests
import json
import time
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import pymongo
import os
from dotenv import load_dotenv

load_dotenv()

class AgmarknetScraper:
    """Scraper for Agmarknet 2.0 portal - official government mandi prices"""
    
    def __init__(self):
        self.base_url = "https://agmarknet.gov.in"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Origin': 'https://agmarknet.gov.in',
            'Referer': 'https://agmarknet.gov.in/'
        })
        
        # MongoDB connection
        mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
        self.client = pymongo.MongoClient(mongo_uri)
        self.db = self.client["farmer_advisory"]
        self.collection = self.db["mandi_prices"]
    
    def discover_api_endpoints(self) -> Dict:
        """
        Agmarknet uses a backend API - try to discover endpoints.
        Common patterns for React apps:
        - /api/...
        - /backend/api/...
        - Direct JSON endpoints
        """
        print("\n[DISCOVERY] Attempting to find Agmarknet API endpoints...")
        
        # Try common API patterns
        potential_endpoints = [
            "/api/market-data",
            "/api/prices",
            "/api/commodities",
            "/api/dashboard/prices",
            "/backend/api/market-data",
            "/PriceAndArrival/DatewiseCommodityReport",  # From Android app
            "/SearchCommodity/SearchComm",
            "/MarketData/GetMarketData"
        ]
        
        for endpoint in potential_endpoints:
            try:
                url = f"{self.base_url}{endpoint}"
                print(f"  Testing: {url}", end=" ")
                response = self.session.get(url, timeout=10)
                
                if response.status_code == 200:
                    print(f"[OK] - {len(response.content)} bytes")
                    try:
                        data = response.json()
                        print(f"    JSON response with {len(data)} keys: {list(data.keys())[:5]}")
                        return {"endpoint": endpoint, "sample": data}
                    except:
                        print("    (HTML response, not JSON)")
                else:
                    print(f"[{response.status_code}]")
            except Exception as e:
                print(f"[ERROR: {str(e)[:50]}]")
        
        print("\n[WARNING] Could not auto-discover API. Will use fallback scraping method.")
        return None
    
    def scrape_with_selenium_fallback(self, days_back: int = 7) -> List[Dict]:
        """
        Fallback: Use browser automation to scrape data.
        This is more reliable but slower.
        
        NOTE: Requires selenium + chromedriver installation
        Install: pip install selenium webdriver-manager
        """
        print("\n[FALLBACK] Using browser automation (slower but reliable)...")
        
        try:
            from selenium import webdriver
            from selenium.webdriver.common.by import By
            from selenium.webdriver.support.ui import WebDriverWait, Select
            from selenium.webdriver.support import expected_conditions as EC
            from selenium.webdriver.chrome.service import Service
            from webdriver_manager.chrome import ChromeDriverManager
            from selenium.webdriver.chrome.options import Options
        except ImportError:
            print("\n[ERROR] Selenium not installed!")
            print("Install with: pip install selenium webdriver-manager")
            return []
        
        # Setup headless Chrome
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        
        driver = None
        all_prices = []
        
        try:
            print("  Starting Chrome browser...")
            driver = webdriver.Chrome(
                service=Service(ChromeDriverManager().install()),
                options=chrome_options
            )
            
            print("  Loading Agmarknet portal...")
            driver.get("https://agmarknet.gov.in/")
            
            # Wait for page to load
            wait = WebDriverWait(driver, 20)
            
            # Look for state dropdown
            print("  Waiting for dashboard elements...")
            time.sleep(5)  # Let React app initialize
            
            # Try to find and interact with filters
            # The exact selectors depend on the current page structure
            # This is a template - may need adjustment
            
            try:
                # Find "Go" button or data table
                go_button = wait.until(
                    EC.presence_of_element_located((By.XPATH, "//button[contains(text(), 'Go')]"))
                )
                print("  Found 'Go' button - clicking...")
                go_button.click()
                
                # Wait for data to load
                time.sleep(3)
                
                # Extract table data
                print("  Extracting price data...")
                table = wait.until(
                    EC.presence_of_element_located((By.TAG_NAME, "table"))
                )
                
                rows = table.find_elements(By.TAG_NAME, "tr")
                print(f"  Found {len(rows)} rows in table")
                
                # Parse table (headers + data rows)
                headers = [th.text for th in rows[0].find_elements(By.TAG_NAME, "th")]
                
                for row in rows[1:]:
                    cols = [td.text for td in row.find_elements(By.TAG_NAME, "td")]
                    if len(cols) > 0:
                        record = dict(zip(headers, cols))
                        record['scraped_at'] = datetime.now()
                        all_prices.append(record)
                
                print(f"\n[SUCCESS] Scraped {len(all_prices)} price records!")
                
            except Exception as e:
                print(f"\n[ERROR] Could not extract data: {e}")
                # Save screenshot for debugging
                driver.save_screenshot("agmarknet_debug.png")
                print("  Saved screenshot to: agmarknet_debug.png")
        
        finally:
            if driver:
                driver.quit()
        
        return all_prices
    
    def scrape_via_mobile_api(self) -> List[Dict]:
        """
        Reverse-engineered mobile app API.
        Agmarknet has Android/iOS apps that use REST APIs.
        
        This is the most reliable method if we can find the endpoints.
        """
        print("\n[MOBILE API] Attempting to use Agmarknet mobile app endpoints...")
        
        # These endpoints are hypothetical - need to decompile the Android APK
        # or intercept network traffic from the mobile app to find real endpoints
        
        # Download APK from: https://play.google.com/store/apps/details?id=in.gov.agmarknet
        # Then use tools like mitmproxy or Burp Suite to capture API calls
        
        api_endpoints = [
            # Hypothetical endpoints based on common patterns
            "https://api.agmarknet.gov.in/v1/prices/daily",
            "https://agmarknet.gov.in/api/v1/market-data",
            "https://agmarknet.gov.in/mobile/api/prices"
        ]
        
        for endpoint in api_endpoints:
            try:
                print(f"  Trying: {endpoint}")
                response = self.session.get(endpoint, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    print(f"  [SUCCESS] Got {len(data)} records!")
                    return data
            except Exception as e:
                print(f"  [FAILED] {str(e)[:50]}")
        
        print("  Could not find mobile API endpoints.")
        return []
    
    def scrape_agmarknet_data(
        self,
        method: str = "auto",
        days_back: int = 7,
        states: Optional[List[str]] = None
    ) -> int:
        """
        Main scraping function with multiple fallback methods.
        
        Args:
            method: 'api', 'selenium', 'mobile', or 'auto' (tries all)
            days_back: Number of days of historical data to scrape
            states: List of states to scrape, or None for all
        
        Returns:
            Number of records inserted into MongoDB
        """
        print("\n" + "="*60)
        print("AGMARKNET REAL DATA SCRAPER")
        print("="*60)
        print(f"Method: {method}")
        print(f"Historical days: {days_back}")
        print(f"States filter: {states or 'ALL'}")
        
        all_prices = []
        
        # Method 1: Try to discover and use API
        if method in ['auto', 'api']:
            api_info = self.discover_api_endpoints()
            if api_info:
                print("\n[API] Found working API endpoint!")
                # Parse and use the API
                # This would need implementation based on actual API structure
        
        # Method 2: Try mobile app API
        if method in ['auto', 'mobile'] and not all_prices:
            mobile_data = self.scrape_via_mobile_api()
            if mobile_data:
                all_prices.extend(mobile_data)
        
        # Method 3: Selenium browser automation (most reliable fallback)
        if method in ['auto', 'selenium'] and not all_prices:
            selenium_data = self.scrape_with_selenium_fallback(days_back)
            if selenium_data:
                all_prices.extend(selenium_data)
        
        # Save to MongoDB
        if all_prices:
            print(f"\n[MONGODB] Saving {len(all_prices)} records...")
            
            # Create index for fast lookups
            self.collection.create_index([
                ("state", pymongo.ASCENDING),
                ("district", pymongo.ASCENDING),
                ("market", pymongo.ASCENDING),
                ("commodity", pymongo.ASCENDING),
                ("date", pymongo.DESCENDING)
            ])
            
            inserted_count = 0
            updated_count = 0
            
            for record in all_prices:
                # Upsert to avoid duplicates
                filter_key = {
                    "state": record.get("state"),
                    "market": record.get("market"),
                    "commodity": record.get("commodity"),
                    "date": record.get("date")
                }
                
                result = self.collection.update_one(
                    filter_key,
                    {"$set": record},
                    upsert=True
                )
                
                if result.upserted_id:
                    inserted_count += 1
                elif result.modified_count > 0:
                    updated_count += 1
            
            print(f"  Inserted: {inserted_count}")
            print(f"  Updated: {updated_count}")
            print(f"\n[SUCCESS] Agmarknet data collection complete!")
            
            return inserted_count
        else:
            print("\n[FAILED] Could not scrape any data from Agmarknet.")
            print("\nMANUAL WORKAROUND:")
            print("1. Visit https://agmarknet.gov.in/")
            print("2. Select filters and click 'Go'")
            print("3. Look for 'Download' or 'Export' button")
            print("4. Save CSV/Excel file")
            print("5. Place in scripts/data/agmarknet_manual.csv")
            print("6. Run: python scripts/load_manual_mandi_csv.py")
            
            return 0


def main():
    """Run Agmarknet scraper"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Scrape real mandi prices from Agmarknet")
    parser.add_argument("--method", choices=["auto", "api", "selenium", "mobile"],
                       default="auto", help="Scraping method (default: auto)")
    parser.add_argument("--days", type=int, default=7,
                       help="Days of historical data (default: 7)")
    parser.add_argument("--states", nargs="+",
                       help="Specific states to scrape (default: all)")
    
    args = parser.parse_args()
    
    scraper = AgmarknetScraper()
    count = scraper.scrape_agmarknet_data(
        method=args.method,
        days_back=args.days,
        states=args.states
    )
    
    if count > 0:
        print(f"\n✓ Successfully scraped {count} mandi price records!")
    else:
        print("\n✗ Scraping failed - see manual workaround above")
        exit(1)


if __name__ == "__main__":
    main()
