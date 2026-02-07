#!/usr/bin/env python3
"""
Fertilizer MRP Data Scraper
============================
Downloads official fertilizer Maximum Retail Price (MRP) data from data.gov.in.

Data Source: https://www.data.gov.in/resource/fertilizer-wise-details-maximum-retail-price-mrp-subsidy-and-cost-sale-reply-starred

This is official data from Rajya Sabha (Parliament) answers.
Fields: Fertilizer name, MRP, Subsidy, Cost of Sale

Last Updated: February 2026
"""

import requests
import csv
import io
import pymongo
import os
import re
from datetime import datetime
from typing import List, Dict
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()


class FertilizerMRPScraper:
    """Scraper for official fertilizer MRP data from data.gov.in"""
    
    def __init__(self):
        # Direct download URL from data.gov.in
        # This URL structure may change - update if needed
        self.resource_page = "https://www.data.gov.in/resource/fertilizer-wise-details-maximum-retail-price-mrp-subsidy-and-cost-sale-reply-starred"
        
        # MongoDB connection
        mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
        self.client = pymongo.MongoClient(mongo_uri)
        self.db = self.client["farmer_advisory"]
        self.collection = self.db["fertilizer_mrp"]
        
        # Data directory
        self.data_dir = Path(__file__).parent / "data"
        self.data_dir.mkdir(exist_ok=True)
    
    def find_csv_download_link(self) -> str:
        """Find the actual CSV download link from the resource page"""
        print(f"\n[DISCOVERY] Finding CSV download link...")
        print(f"  Loading: {self.resource_page}")
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(self.resource_page, headers=headers, timeout=30)
        response.raise_for_status()
        
        html = response.text
        
        # Look for CSV download link
        # Pattern: <a href="..." download>...(csv|CSV)...</a>
        # Or direct link to .csv file
        
        patterns = [
            r'href="([^"]*\.csv)"',
            r'href="([^"]*download[^"]*)"[^>]*>.*?csv',
            r'href="([^"]*file[^"]*)"[^>]*>.*?Download',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, html, re.IGNORECASE)
            if matches:
                url = matches[0]
                # Make absolute URL
                if not url.startswith('http'):
                    if url.startswith('/'):
                        url = f"https://www.data.gov.in{url}"
                    else:
                        url = f"https://www.data.gov.in/{url}"
                
                print(f"  [FOUND] {url}")
                return url
        
        # Alternative: Look for API endpoint
        api_pattern = r'"api":\s*"([^"]+)"'
        api_matches = re.findall(api_pattern, html)
        if api_matches:
            url = api_matches[0]
            print(f"  [FOUND API] {url}")
            return url
        
        print("  [WARNING] Could not auto-detect download link")
        print("  Will try common URL patterns...")
        
        # Try common patterns (resource ID based)
        resource_id_pattern = r'/resource/([a-f0-9\-]+)'
        resource_match = re.search(resource_id_pattern, self.resource_page)
        if resource_match:
            resource_id = resource_match.group(1)
            potential_urls = [
                f"https://www.data.gov.in/backend/dms/v1/resources/{resource_id}/download",
                f"https://www.data.gov.in/api/datastore/resource.csv?resource_id={resource_id}",
                f"https://www.data.gov.in/backend/dms/v1/download/{resource_id}",
            ]
            
            for url in potential_urls:
                print(f"  Testing: {url}")
                try:
                    test_response = requests.head(url, headers=headers, timeout=10, allow_redirects=True)
                    if test_response.status_code == 200:
                        print(f"    [OK] This URL works!")
                        return url
                except:
                    pass
        
        return None
    
    def download_csv(self, url: str = None) -> Path:
        """Download fertilizer MRP CSV file"""
        print(f"\n[DOWNLOAD] Fetching fertilizer MRP data...")
        
        if not url:
            url = self.find_csv_download_link()
        
        if not url:
            raise Exception("Could not find CSV download URL")
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/csv,application/csv,text/plain,*/*'
        }
        
        print(f"  Downloading from: {url}")
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        # Save to file
        filepath = self.data_dir / "fertilizer_mrp_official.csv"
        
        # Detect encoding (data.gov.in may use UTF-8 or Windows-1252)
        content = response.content
        
        # Try UTF-8 first
        try:
            text = content.decode('utf-8')
        except UnicodeDecodeError:
            # Fallback to Windows-1252
            text = content.decode('windows-1252', errors='replace')
        
        with open(filepath, 'w', encoding='utf-8', newline='') as f:
            f.write(text)
        
        file_size = len(content)
        print(f"    Saved: {filepath} ({file_size} bytes)")
        
        return filepath
    
    def parse_csv(self, csv_path: Path) -> List[Dict]:
        """Parse fertilizer MRP CSV file"""
        print(f"\n[PARSING] {csv_path.name}")
        
        fertilizers = []
        
        with open(csv_path, 'r', encoding='utf-8') as f:
            # Auto-detect CSV dialect
            sample = f.read(1024)
            f.seek(0)
            
            try:
                dialect = csv.Sniffer().sniff(sample)
            except:
                dialect = csv.excel
            
            reader = csv.DictReader(f, dialect=dialect)
            
            print(f"  Columns: {reader.fieldnames}")
            
            for row_num, row in enumerate(reader, 1):
                # Clean and normalize field names
                record = {}
                for key, value in row.items():
                    if not key:
                        continue
                    
                    # Normalize key
                    clean_key = re.sub(r'[^a-zA-Z0-9_]', '_', str(key).lower())
                    clean_key = re.sub(r'_+', '_', clean_key).strip('_')
                    
                    # Clean value
                    clean_value = str(value).strip() if value else None
                    
                    record[clean_key] = clean_value
                
                # Add metadata
                record['source'] = 'data.gov.in - Rajya Sabha'
                record['source_file'] = csv_path.name
                record['scraped_at'] = datetime.now()
                
                # Parse numeric values if present
                for key in ['mrp', 'maximum_retail_price', 'subsidy', 'cost_of_sale']:
                    if key in record and record[key]:
                        try:
                            # Remove currency symbols and commas
                            num_str = re.sub(r'[^\d\.]', '', record[key])
                            record[f"{key}_numeric"] = float(num_str)
                        except:
                            pass
                
                if record:
                    fertilizers.append(record)
            
            print(f"  Parsed {len(fertilizers)} fertilizer records")
        
        return fertilizers
    
    def scrape_fertilizer_mrp_data(self, csv_url: str = None) -> int:
        """
        Main scraping function.
        
        Args:
            csv_url: Optional direct CSV URL (auto-detected if None)
        
        Returns:
            Number of records inserted into MongoDB
        """
        print("\n" + "="*60)
        print("FERTILIZER MRP DATA SCRAPER")
        print("="*60)
        print("Source: data.gov.in (Rajya Sabha official data)")
        
        try:
            # Step 1: Download CSV
            csv_path = self.download_csv(csv_url)
            
            # Step 2: Parse CSV
            fertilizers = self.parse_csv(csv_path)
            
            if not fertilizers:
                print("\n[WARNING] No fertilizer data found in CSV")
                return 0
            
            # Step 3: Save to MongoDB
            print(f"\n[MONGODB] Saving {len(fertilizers)} fertilizer records...")
            
            # Create index
            self.collection.create_index([("fertilizer", pymongo.TEXT)])
            
            # Clear old data (this dataset is small and complete)
            deleted_count = self.collection.delete_many({}).deleted_count
            if deleted_count > 0:
                print(f"  Cleared {deleted_count} old records")
            
            # Insert new data
            if fertilizers:
                result = self.collection.insert_many(fertilizers)
                inserted_count = len(result.inserted_ids)
            else:
                inserted_count = 0
            
            print(f"  Inserted: {inserted_count}")
            print(f"\n[SUCCESS] Fertilizer MRP data collection complete!")
            
            # Show sample data
            print("\n[SAMPLE] First 3 records:")
            for i, fert in enumerate(fertilizers[:3], 1):
                name = fert.get('fertilizer') or fert.get('sl_no', 'Unknown')
                mrp = fert.get('mrp') or fert.get('maximum_retail_price', 'N/A')
                print(f"  {i}. {name}: MRP = {mrp}")
            
            return inserted_count
        
        except requests.HTTPError as e:
            print(f"\n[ERROR] HTTP error: {e}")
            print("\nThe resource may have been moved or requires login.")
            print("Try visiting the page manually:")
            print(f"  {self.resource_page}")
            return 0
        
        except Exception as e:
            print(f"\n[ERROR] Scraping failed: {e}")
            import traceback
            traceback.print_exc()
            return 0


def main():
    """Run fertilizer MRP scraper"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Scrape fertilizer MRP data from data.gov.in")
    parser.add_argument("--url", type=str, help="Direct CSV download URL (optional)")
    
    args = parser.parse_args()
    
    scraper = FertilizerMRPScraper()
    count = scraper.scrape_fertilizer_mrp_data(csv_url=args.url)
    
    if count > 0:
        print(f"\n[OK] Successfully scraped {count} fertilizer MRP records!")
    else:
        print("\n[WARN] No records inserted - check errors above")
        exit(1)


if __name__ == "__main__":
    main()
