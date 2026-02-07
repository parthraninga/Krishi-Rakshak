"""
Web scraper for packaging images from e-commerce and manufacturer websites.
Collects REAL product packaging images for ML training (not synthetic data!).
Sources: Amazon.in, Flipkart, manufacturer websites (IFFCO, Coromandel, Syngenta, Bayer).
"""
import os
import sys
import time
import json
import hashlib
from pathlib import Path
from datetime import datetime
from urllib.parse import urljoin, quote

try:
    import requests
except ImportError:
    print("ERROR: requests required. Install: pip install requests", file=sys.stderr)
    sys.exit(1)

ML_DATA_DIR = Path(__file__).resolve().parent.parent / "ml" / "data"
RAW_DIR = ML_DATA_DIR / "raw" / "packaging_images"

# Product list from products_seed.json
PRODUCTS_TO_SCRAPE = [
    {"name": "IFFCO Urea 50kg", "category": "fertilizer", "keywords": ["IFFCO Urea bag", "urea fertilizer packaging"]},
    {"name": "IFFCO DAP 50kg", "category": "fertilizer", "keywords": ["IFFCO DAP bag", "DAP fertilizer"]},
    {"name": "Coromandel MOP", "category": "fertilizer", "keywords": ["Coromandel Muriate Potash", "MOP fertilizer bag"]},
    {"name": "Syngenta Chlorpyriphos", "category": "pesticide", "keywords": ["Syngenta Chlorpyriphos bottle", "chlorpyriphos packaging"]},
    {"name": "Bayer Imidacloprid", "category": "pesticide", "keywords": ["Bayer Imidacloprid", "imidacloprid bottle"]},
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "image/*, text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.google.com/"
}

def download_image(url, save_path, timeout=30):
    """Download image from URL and save to file."""
    try:
        r = requests.get(url, headers=HEADERS, timeout=timeout, stream=True)
        if r.status_code == 200:
            with open(save_path, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
            return True
        else:
            print(f"  Failed to download: {r.status_code}")
            return False
    except Exception as e:
        print(f"  Error downloading {url[:50]}...: {e}")
        return False

def scrape_google_images(query, max_images=10):
    """Scrape images from Google Images search results.
    Note: This is a simplified scraper for educational purposes.
    For production, use Google Custom Search API or similar."""
    
    print(f"  Searching Google Images: {query}")
    
    # Google Images search URL
    search_url = f"https://www.google.com/search?q={quote(query)}&tbm=isch"
    
    try:
        r = requests.get(search_url, headers=HEADERS, timeout=15)
        if r.status_code != 200:
            print(f"  Google search failed: {r.status_code}")
            return []
        
        # Parse image URLs from HTML (basic regex - production should use proper parser)
        import re
        img_pattern = r'"(https://[^"]+\.(jpg|jpeg|png))"'
        matches = re.findall(img_pattern, r.text, re.IGNORECASE)
        
        image_urls = []
        for match in matches[:max_images * 2]:  # Get more than needed (some will fail)
            url = match[0]
            # Filter out icons, thumbnails, tiny images
            if any(skip in url.lower() for skip in ['icon', 'logo', 'thumb', 'favicon']):
                continue
            if len(url) > 500:  # Likely a data URL or encoded - skip
                continue
            image_urls.append(url)
            if len(image_urls) >= max_images:
                break
        
        print(f"  Found {len(image_urls)} potential image URLs")
        return image_urls
    
    except Exception as e:
        print(f"  Google search error: {e}")
        return []

def scrape_amazon_product_images(product_name, max_images=5):
    """Scrape product images from Amazon.in search results."""
    
    print(f"  Searching Amazon.in: {product_name}")
    search_url = f"https://www.amazon.in/s?k={quote(product_name)}"
    
    try:
        r = requests.get(search_url, headers=HEADERS, timeout=15)
        if r.status_code != 200:
            print(f"  Amazon search failed: {r.status_code}")
            return []
        
        # Parse image URLs (basic - production needs proper HTML parsing)
        import re
        # Amazon uses specific image URL patterns
        img_pattern = r'https://m\.media-amazon\.com/images/I/[^"\']+\.(jpg|png)'
        matches = re.findall(img_pattern, r.text, re.IGNORECASE)
        
        # Deduplicate and clean
        image_urls = list(dict.fromkeys(matches[:max_images]))
        print(f"  Found {len(image_urls)} Amazon images")
        return image_urls
    
    except Exception as e:
        print(f"  Amazon search error: {e}")
        return []

def scrape_manufacturer_website(url, max_images=5):
    """Scrape product gallery from manufacturer website."""
    
    print(f"  Scraping manufacturer site: {url[:50]}...")
    
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        if r.status_code != 200:
            return []
        
        # Find image tags and extract URLs
        import re
        # Look for common image patterns
        patterns = [
            r'<img[^>]+src=["\']([^"\']+\.(jpg|jpeg|png))["\']',
            r'url\(["\']([^"\']+\.(jpg|jpeg|png))["\']',
        ]
        
        image_urls = []
        for pattern in patterns:
            matches = re.findall(pattern, r.text, re.IGNORECASE)
            for match in matches:
                img_url = match[0] if isinstance(match, tuple) else match
                # Make absolute URL
                if img_url.startswith('//'):
                    img_url = 'https:' + img_url
                elif img_url.startswith('/'):
                    img_url = urljoin(url, img_url)
                
                # Filter thumbnails
                if any(skip in img_url.lower() for skip in ['thumb', 'icon', 'logo', 'banner']):
                    continue
                
                image_urls.append(img_url)
                if len(image_urls) >= max_images:
                    break
        
        image_urls = list(dict.fromkeys(image_urls))[:max_images]
        print(f"  Found {len(image_urls)} images")
        return image_urls
    
    except Exception as e:
        print(f"  Scraping error: {e}")
        return []

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Scrape real packaging images for ML training")
    parser.add_argument("--products", type=int, default=3, 
                        help="Number of products to scrape (default: 3, max: 5)")
    parser.add_argument("--images-per-product", type=int, default=10, 
                        help="Target images per product (default: 10)")
    parser.add_argument("--source", choices=["google", "amazon", "all"], default="all",
                        help="Image source (default: all)")
    args = parser.parse_args()
    
    # Create directories
    genuine_dir = RAW_DIR / "genuine"
    genuine_dir.mkdir(parents=True, exist_ok=True)
    
    print("=" * 60)
    print("Packaging Image Web Scraper")
    print("=" * 60)
    print(f"Target: {args.products} products, ~{args.images_per_product} images each")
    print(f"Source: {args.source}")
    print()
    
    metadata = {
        "scraped_at": datetime.now().isoformat(),
        "images": []
    }
    
    total_downloaded = 0
    products_to_scrape = PRODUCTS_TO_SCRAPE[:args.products]
    
    for idx, product in enumerate(products_to_scrape, 1):
        print(f"[{idx}/{len(products_to_scrape)}] Scraping: {product['name']}")
        
        all_urls = []
        
        # Google Images
        if args.source in ["google", "all"]:
            for keyword in product["keywords"][:2]:  # Use first 2 keywords
                urls = scrape_google_images(keyword, max_images=args.images_per_product // 2)
                all_urls.extend(urls)
                time.sleep(2)  # Polite delay
        
        # Amazon
        if args.source in ["amazon", "all"]:
            urls = scrape_amazon_product_images(product["name"], max_images=args.images_per_product // 2)
            all_urls.extend(urls)
            time.sleep(2)
        
        # Deduplicate
        all_urls = list(dict.fromkeys(all_urls))[:args.images_per_product]
        
        print(f"  Downloading {len(all_urls)} images...")
        downloaded_count = 0
        
        for url_idx, url in enumerate(all_urls):
            # Generate unique filename
            url_hash = hashlib.md5(url.encode()).hexdigest()[:8]
            ext = url.split('.')[-1].split('?')[0].lower()
            if ext not in ['jpg', 'jpeg', 'png']:
                ext = 'jpg'
            
            filename = f"{product['category']}_{product['name'].replace(' ', '_')}_{url_idx+1}_{url_hash}.{ext}"
            save_path = genuine_dir / filename
            
            if download_image(url, save_path):
                downloaded_count += 1
                total_downloaded += 1
                
                metadata["images"].append({
                    "filename": filename,
                    "product": product["name"],
                    "category": product["category"],
                    "source_url": url,
                    "label": "genuine"
                })
                
                print(f"    [{downloaded_count}/{len(all_urls)}] Saved: {filename}")
            
            time.sleep(0.5)  # Polite delay
        
        print(f"  Downloaded {downloaded_count}/{len(all_urls)} images for {product['name']}")
        print()
    
    # Save metadata
    manifest_path = RAW_DIR / "manifest_scraped.json"
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    
    print("=" * 60)
    print(f"Scraping complete!")
    print(f"  Total images downloaded: {total_downloaded}")
    print(f"  Saved to: {genuine_dir}")
    print(f"  Metadata: {manifest_path}")
    print()
    print("Next steps:")
    print("  1. Review images and delete low-quality ones")
    print("  2. Run: python ml/src/data/augment_counterfeit.py")
    print("  3. Run: python ml/src/data/prepare_packaging_dataset.py")
    print("=" * 60)

if __name__ == "__main__":
    main()
