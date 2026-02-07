#!/usr/bin/env python3
"""
PPQS Pesticide Registry Scraper
================================
Downloads and parses official registered pesticide list from PPQS (Plant Protection, Quarantine & Storage).

Data Source: https://ppqs.gov.in/en/divisions/cib-rc/registered-products
Downloads PDF files with registered pesticides under Insecticides Act, 1968.

Last Updated: February 2026
"""

import requests
import re
import pymongo
import os
from datetime import datetime
from typing import List, Dict
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()


class PPQSPesticideScraper:
    """Scraper for PPQS registered pesticides from official PDFs"""
    
    def __init__(self):
        self.base_url = "https://ppqs.gov.in"
        self.page_url = "https://ppqs.gov.in/en/divisions/cib-rc/registered-products"
        
        # MongoDB connection
        mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
        self.client = pymongo.MongoClient(mongo_uri)
        self.db = self.client["farmer_advisory"]
        self.collection = self.db["pesticides_registry"]
        
        # Create data directory for PDFs
        self.data_dir = Path(__file__).parent / "data" / "pesticides_pdfs"
        self.data_dir.mkdir(parents=True, exist_ok=True)
    
    def download_pdf(self, pdf_url: str, filename: str) -> Path:
        """Download PDF file from PPQS website"""
        print(f"  Downloading: {filename}")
        
        full_url = pdf_url if pdf_url.startswith("http") else f"{self.base_url}{pdf_url}"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(full_url, headers=headers, stream=True, timeout=30)
        response.raise_for_status()
        
        filepath = self.data_dir / filename
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        file_size_mb = filepath.stat().st_size / (1024 * 1024)
        print(f"    Saved: {filepath} ({file_size_mb:.2f} MB)")
        
        return filepath
    
    def scrape_pdf_links(self) -> List[Dict]:
        """Scrape the PPQS page to find PDF download links"""
        print(f"\n[SCRAPING] {self.page_url}")
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(self.page_url, headers=headers, timeout=30)
        response.raise_for_status()
        
        html = response.text
        
        # Parse PDF links from the page
        # Format: <a href="/sites/default/files/...">Download (1.05 MB) pdf</a>
        
        pdf_pattern = r'<a[^>]*href="([^"]*\.pdf)"[^>]*>.*?Download\s*\(([^\)]+)\)\s*pdf.*?</a>'
        
        # Also look for the table rows with PDF links
        table_pattern = r'<tr>.*?<td>(.*?)</td>.*?<a[^>]*href="([^"]*\.pdf)"[^>]*>.*?Download.*?</a>.*?</tr>'
        
        pdfs = []
        
        # Try table pattern first
        for match in re.finditer(table_pattern, html, re.DOTALL | re.IGNORECASE):
            title = re.sub(r'<[^>]+>', '', match.group(1)).strip()
            url = match.group(2)
            
            # Extract file size if present
            size_match = re.search(r'Download\s*\(([^\)]+)\)', match.group(0))
            size = size_match.group(1) if size_match else "Unknown"
            
            pdfs.append({
                'title': title,
                'url': url,
                'size': size,
                'filename': os.path.basename(url)
            })
        
        # If table pattern didn't work, try simpler pattern
        if not pdfs:
            for match in re.finditer(pdf_pattern, html, re.IGNORECASE):
                url = match.group(1)
                size = match.group(2)
                
                pdfs.append({
                    'title': os.path.basename(url).replace('.pdf', '').replace('_', ' '),
                    'url': url,
                    'size': size,
                    'filename': os.path.basename(url)
                })
        
        print(f"  Found {len(pdfs)} PDF files:")
        for pdf in pdfs:
            print(f"    - {pdf['title']} ({pdf['size']})")
        
        return pdfs
    
    def parse_pesticide_pdf(self, pdf_path: Path) -> List[Dict]:
        """
        Parse pesticide data from PDF file.
        
        NOTE: PDF parsing is complex and may require different libraries
        depending on the PDF structure. This is a template.
        """
        print(f"\n[PARSING] {pdf_path.name}")
        
        try:
            # Try pdfplumber first (best for tables)
            import pdfplumber
            
            pesticides = []
            
            with pdfplumber.open(pdf_path) as pdf:
                print(f"  Pages: {len(pdf.pages)}")
                
                for page_num, page in enumerate(pdf.pages, 1):
                    # Extract tables from page
                    tables = page.extract_tables()
                    
                    if not tables:
                        continue
                    
                    print(f"  Page {page_num}: {len(tables)} table(s)")
                    
                    for table in tables:
                        if not table or len(table) < 2:
                            continue
                        
                        # First row is usually headers
                        headers = table[0]
                        
                        # Parse data rows
                        for row in table[1:]:
                            if len(row) < 2 or not row[0]:
                                continue
                            
                            # Build record (adjust based on actual PDF structure)
                            record = {}
                            for i, header in enumerate(headers):
                                if i < len(row) and header:
                                    # Clean header name
                                    key = re.sub(r'[^a-zA-Z0-9_]', '_', str(header).lower())
                                    key = re.sub(r'_+', '_', key).strip('_')
                                    record[key] = str(row[i]).strip() if row[i] else None
                            
                            if record:
                                record['source_pdf'] = pdf_path.name
                                record['page_number'] = page_num
                                record['scraped_at'] = datetime.now()
                                pesticides.append(record)
            
            print(f"  Extracted {len(pesticides)} pesticide records")
            return pesticides
        
        except ImportError:
            print("\n[WARNING] pdfplumber not installed!")
            print("Install with: pip install pdfplumber")
            print("Falling back to PyPDF2...")
            
            try:
                # Fallback to PyPDF2 (less accurate for tables)
                import PyPDF2
                
                pesticides = []
                
                with open(pdf_path, 'rb') as f:
                    reader = PyPDF2.PdfReader(f)
                    print(f"  Pages: {len(reader.pages)}")
                    
                    all_text = ""
                    for page in reader.pages:
                        all_text += page.extract_text() + "\n"
                    
                    # Try to parse structured data from text
                    # This is PDF-specific and needs customization
                    lines = all_text.split('\n')
                    
                    # Example: Look for lines with pesticide names
                    # Format varies by PDF - this is a template
                    for line in lines:
                        line = line.strip()
                        if not line or len(line) < 10:
                            continue
                        
                        # Simple pattern: pesticide name followed by details
                        # Adjust pattern based on actual PDF structure
                        match = re.match(r'^(\d+)[\s\.]+([A-Za-z0-9\-\s\(\)]+?)\s+([A-Za-z0-9\.\s%]+)$', line)
                        if match:
                            pesticides.append({
                                'serial_no': match.group(1),
                                'pesticide_name': match.group(2).strip(),
                                'details': match.group(3).strip(),
                                'source_pdf': pdf_path.name,
                                'scraped_at': datetime.now()
                            })
                    
                    print(f"  Extracted {len(pesticides)} pesticide records (PyPDF2 fallback)")
                    return pesticides
            
            except ImportError:
                print("\n[ERROR] PyPDF2 not installed either!")
                print("Install with: pip install PyPDF2")
                print("OR Install pdfplumber (recommended): pip install pdfplumber")
                return []
        
        except Exception as e:
            print(f"\n[ERROR] Failed to parse PDF: {e}")
            return []
    
    def scrape_ppqs_data(self, download_pdfs: bool = True, parse_pdfs: bool = True) -> int:
        """
        Main scraping function.
        
        Args:
            download_pdfs: Whether to download PDF files
            parse_pdfs: Whether to parse downloaded PDFs
        
        Returns:
            Number of pesticide records inserted into MongoDB
        """
        print("\n" + "="*60)
        print("PPQS PESTICIDE REGISTRY SCRAPER")
        print("="*60)
        
        # Step 1: Find PDF links on the page
        pdf_links = self.scrape_pdf_links()
        
        if not pdf_links:
            print("\n[ERROR] No PDF links found!")
            return 0
        
        all_pesticides = []
        
        # Step 2: Download PDFs
        if download_pdfs:
            print(f"\n[DOWNLOAD] Downloading {len(pdf_links)} PDF files...")
            
            for pdf_info in pdf_links:
                try:
                    filepath = self.download_pdf(pdf_info['url'], pdf_info['filename'])
                    pdf_info['local_path'] = filepath
                    time.sleep(0.5)  # Polite delay
                except Exception as e:
                    print(f"  [ERROR] Failed to download {pdf_info['filename']}: {e}")
                    continue
        
        # Step 3: Parse PDFs
        if parse_pdfs:
            print(f"\n[PARSING] Parsing PDF files...")
            
            for pdf_info in pdf_links:
                local_path = pdf_info.get('local_path') or self.data_dir / pdf_info['filename']
                
                if not local_path.exists():
                    print(f"  [SKIP] {pdf_info['filename']} not found locally")
                    continue
                
                try:
                    pesticides = self.parse_pesticide_pdf(local_path)
                    all_pesticides.extend(pesticides)
                except Exception as e:
                    print(f"  [ERROR] Failed to parse {pdf_info['filename']}: {e}")
                    continue
        
        # Step 4: Save to MongoDB
        if all_pesticides:
            print(f"\n[MONGODB] Saving {len(all_pesticides)} pesticide records...")
            
            # Create index
            self.collection.create_index([("pesticide_name", pymongo.TEXT)])
            
            inserted_count = 0
            updated_count = 0
            
            for pesticide in all_pesticides:
                # Upsert to avoid duplicates
                filter_key = {
                    "source_pdf": pesticide.get("source_pdf"),
                    "page_number": pesticide.get("page_number"),
                    "serial_no": pesticide.get("serial_no")
                }
                
                result = self.collection.update_one(
                    filter_key,
                    {"$set": pesticide},
                    upsert=True
                )
                
                if result.upserted_id:
                    inserted_count += 1
                elif result.modified_count > 0:
                    updated_count += 1
            
            print(f"  Inserted: {inserted_count}")
            print(f"  Updated: {updated_count}")
            print(f"\n[SUCCESS] PPQS pesticide data collection complete!")
            
            return inserted_count
        else:
            print("\n[WARNING] No pesticide data extracted from PDFs.")
            print("\nNOTE: PDF parsing requires additional libraries:")
            print("  pip install pdfplumber  # Recommended")
            print("  pip install PyPDF2      # Fallback")
            
            return 0


import time  # Added missing import

def main():
    """Run PPQS pesticide scraper"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Scrape PPQS registered pesticides")
    parser.add_argument("--skip-download", action="store_true",
                       help="Skip downloading PDFs (use existing)")
    parser.add_argument("--skip-parse", action="store_true",
                       help="Only download PDFs, don't parse")
    
    args = parser.parse_args()
    
    scraper = PPQSPesticideScraper()
    count = scraper.scrape_ppqs_data(
        download_pdfs=not args.skip_download,
        parse_pdfs=not args.skip_parse
    )
    
    if count > 0:
        print(f"\n[OK] Successfully scraped {count} pesticide records!")
    else:
        print("\n[WARN] No records inserted - check PDF parsing")
        exit(1)


if __name__ == "__main__":
    main()
