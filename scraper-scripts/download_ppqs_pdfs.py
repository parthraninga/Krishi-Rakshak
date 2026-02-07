#!/usr/bin/env python3
"""
PPQS Pesticide Registry - Direct PDF Downloader
================================================
Downloads official pesticide registration PDFs from PPQS.

Based on research: https://ppqs.gov.in/en/divisions/cib-rc/registered-products
Last Updated: February 2026
"""

import requests
import pymongo
import os
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()


# EXACT PDF URLs from PPQS website (verified February 2026)
PPQS_PDFS = [
    {
        "title": "LIST OF PESTICIDES FORMULATIONS REGISTERED FOR USE IN THE COUNTRY UNDER THE INSECTICIDES ACT, 1968 AS ON 30.10.2025",
        "url": "https://ppqs.gov.in/sites/default/files/list_pf_pesticide_formulations_registered_as_on_30.10.2025.pdf",
        "size": "1.05 MB",
        "filename": "pesticides_registered_30.10.2025.pdf"
    },
    {
        "title": "List of Insecticides / Pesticides Registered under section 9(3) of the Insecticides Act, 1968 for use in the Country as on 30.10.2025",
        "url": "https://ppqs.gov.in/sites/default/files/updated_list_of_pesticides_as_on_30.10.2025.pdf",
        "size": "288.38 KB",
        "filename": "pesticides_section_9_3_30.10.2025.pdf"
    },
    {
        "title": "LIST OF PESTICIDES WHICH ARE BANNED, REFUSED REGISTRATION AND RESTRICTED IN USE AS ON 31.03.2024",
        "url": "https://ppqs.gov.in/sites/default/files/list_of_pesticides_which_are_banned_refused_registration_and_restricted_in_use_0.pdf",
        "size": "70.67 KB",
        "filename": "pesticides_banned_restricted_31.03.2024.pdf"
    },
    {
        "title": "Source of Import and list of Indigenous Manufactures of Insecticides as on 01.06.2023",
        "url": "https://ppqs.gov.in/sites/default/files/source_of_import_list_updated_as_on_01.06.2023.pdf",
        "size": "1.22 MB",
        "filename": "pesticides_manufacturers_01.06.2023.pdf"
    },
    {
        "title": "Formulations registered under the Insecticides Act for use in Household/Public Health and Rodent Control as on 01.06.2023",
        "url": "https://ppqs.gov.in/sites/default/files/7._formulation_approved_for_public_health_household_and_rodenticide.pdf",
        "size": "97.7 KB",
        "filename": "pesticides_household_public_health_01.06.2023.pdf"
    },
    {
        "title": "List of approved Pesticides for control of Desert Locust",
        "url": "https://ppqs.gov.in/sites/default/files/approved_pesticides_for_desert_locust_control.pdf",
        "size": "185.99 KB",
        "filename": "pesticides_locust_control.pdf"
    }
]


def download_ppqs_pdfs(data_dir: str = None) -> list:
    """Download all PPQS pesticide PDFs"""
    
    if not data_dir:
        data_dir = Path(__file__).parent / "data" / "pesticides_pdfs"
    else:
        data_dir = Path(data_dir)
    
    data_dir.mkdir(parents=True, exist_ok=True)
    
    print("\n" + "="*60)
    print("PPQS PESTICIDE REGISTRY - PDF DOWNLOADER")
    print("="*60)
    print(f"Downloading {len(PPQS_PDFS)} official PDF files...")
    print(f"Save location: {data_dir}\n")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    downloaded_files = []
    
    for i, pdf_info in enumerate(PPQS_PDFS, 1):
        print(f"[{i}/{len(PPQS_PDFS)}] {pdf_info['title'][:60]}...")
        print(f"  Size: {pdf_info['size']}")
        print(f"  URL: {pdf_info['url']}")
        
        try:
            response = requests.get(pdf_info['url'], headers=headers, stream=True, timeout=60)
            response.raise_for_status()
            
            filepath = data_dir / pdf_info['filename']
            
            with open(filepath, 'wb') as f:
                total_size = 0
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
                    total_size += len(chunk)
            
            actual_size_mb = total_size / (1024 * 1024)
            print(f"  [OK] Downloaded: {filepath.name} ({actual_size_mb:.2f} MB)")
            
            downloaded_files.append({
                'filepath': filepath,
                'title': pdf_info['title'],
                'url': pdf_info['url'],
                'size_bytes': total_size
            })
            
        except Exception as e:
            print(f"  [ERROR] Failed to download: {e}")
            continue
        
        print()
    
    print(f"\n[SUCCESS] Downloaded {len(downloaded_files)}/{len(PPQS_PDFS)} PDF files")
    print(f"Total size: {sum(f['size_bytes'] for f in downloaded_files) / (1024*1024):.2f} MB")
    
    return downloaded_files


def save_metadata_to_mongodb(downloaded_files: list):
    """Save PDF metadata to MongoDB (not the actual content)"""
    
    mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
    client = pymongo.MongoClient(mongo_uri)
    db = client["farmer_advisory"]
    collection = db["pesticides_registry"]
    
    print(f"\n[MONGODB] Saving metadata for {len(downloaded_files)} PDFs...")
    
    records = []
    for file_info in downloaded_files:
        record = {
            'source': 'PPQS - Plant Protection, Quarantine & Storage',
            'source_url': file_info['url'],
            'document_title': file_info['title'],
            'file_path': str(file_info['filepath']),
            'file_size_bytes': file_info['size_bytes'],
            'file_size_mb': round(file_info['size_bytes'] / (1024*1024), 2),
            'downloaded_at': datetime.now(),
            'status': 'PDF downloaded - parsing required',
            'data_type': 'regulatory_document'
        }
        records.append(record)
    
    # Clear old metadata
    collection.delete_many({'source': 'PPQS - Plant Protection, Quarantine & Storage'})
    
    # Insert new metadata
    if records:
        result = collection.insert_many(records)
        print(f"  Inserted {len(result.inserted_ids)} metadata records")
    
    print("\n[INFO] PDF files downloaded successfully!")
    print("To extract pesticide data from PDFs, you need to:")
    print("  1. Install: pip install pdfplumber")
    print("  2. Run: python scripts/parse_ppqs_pdfs.py")
    print("     (This will parse tables from PDFs into structured data)")
    
    client.close()


def main():
    """Download PPQS pesticide PDFs"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Download PPQS pesticide registry PDFs")
    parser.add_argument("--output-dir", type=str, help="Custom output directory")
    parser.add_argument("--skip-mongodb", action="store_true", help="Don't save metadata to MongoDB")
    
    args = parser.parse_args()
    
    downloaded_files = download_ppqs_pdfs(data_dir=args.output_dir)
    
    if not args.skip_mongodb and downloaded_files:
        save_metadata_to_mongodb(downloaded_files)
    
    if len(downloaded_files) > 0:
        print(f"\n[OK] Successfully downloaded {len(downloaded_files)} PDF files!")
        return 0
    else:
        print("\n[FAIL] No PDFs were downloaded")
        return 1


if __name__ == "__main__":
    exit(main())
