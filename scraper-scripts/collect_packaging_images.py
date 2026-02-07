"""
Setup and collect packaging images for ML training.
Creates directory structure and provides instructions for collecting genuine/counterfeit images.
For hackathon: Uses web scraping, manual collection, and synthetic augmentation.
"""
import os
import sys
from pathlib import Path
from datetime import datetime
import json

def create_directory_structure():
    """Create ML data directory structure."""
    base_dir = Path(__file__).resolve().parent.parent / "ml" / "data"
    
    dirs = [
        base_dir / "raw" / "packaging_images" / "genuine",
        base_dir / "raw" / "packaging_images" / "counterfeit",
        base_dir / "processed" / "packaging_train" / "train" / "genuine",
        base_dir / "processed" / "packaging_train" / "train" / "counterfeit",
        base_dir / "processed" / "packaging_train" / "val" / "genuine",
        base_dir / "processed" / "packaging_train" / "val" / "counterfeit",
    ]
    
    for d in dirs:
        d.mkdir(parents=True, exist_ok=True)
    
    return base_dir

def create_readme(base_dir):
    """Create README with data collection instructions."""
    readme_content = """# Packaging Images Dataset

## Directory Structure

```
ml/data/
├── raw/
│   └── packaging_images/
│       ├── genuine/          # Real product packaging (50+ images)
│       └── counterfeit/      # Fake or synthetic counterfeit (20+ images)
└── processed/
    └── packaging_train/
        ├── train/
        │   ├── genuine/
        │   └── counterfeit/
        └── val/
            ├── genuine/
            └── counterfeit/
```

## Data Collection Strategy (Hackathon)

### Option 1: Web Scraping (Fastest)
- **Target sites:** e-commerce (Amazon.in, Flipkart, BigBasket), manufacturer websites
- **Products:** Urea, DAP, MOP, Chlorpyriphos, Imidacloprid (from products_seed.json)
- **Script:** `ml/src/data/scrape_packaging_images.py` (to be created)
- **Tip:** Search "<product_name> packaging" or "<brand> fertilizer bag"

### Option 2: Kaggle/Open Datasets
- Search Kaggle for "fertilizer packaging" or "pesticide labels"
- PlantVillage may have some packaging images
- Download and organize into genuine/

### Option 3: Manufacturer Websites
- **IFFCO:** https://www.iffco.in/ (Urea, DAP)
- **Coromandel:** https://www.coromandel.biz/ (MOP, NPK)
- **Syngenta:** https://www.syngenta.co.in/ (Pesticides)
- **Bayer:** https://www.bayer.in/en/ag/crop-science (Pesticides)
- Download product images from product pages

### Option 4: Generate Synthetic Counterfeits
Run: `python ml/src/data/augment_counterfeit.py`

This creates fake versions from genuine images:
- Gaussian blur (degraded quality)
- Color shift (wrong ink/print)
- Logo removal/distortion
- Text corruption
- Noise addition

## Metadata File

Create `ml/data/raw/packaging_images/manifest.json`:

```json
{
  "images": [
    {
      "filename": "iffco_urea_front_01.jpg",
      "label": "genuine",
      "product": "Urea",
      "manufacturer": "IFFCO",
      "gtin": "8901234567890",
      "view": "front",
      "source": "iffco.in"
    }
  ]
}
```

## Target Dataset Size (Minimum Viable)

- **Genuine:** 50 images (10 per product type × 5 products)
- **Counterfeit:** 30 images (20 synthetic + 10 real if available)
- **Total:** 80 images minimum for hackathon demo

For production: 500+ genuine, 200+ counterfeit

## Image Requirements

- **Format:** JPG or PNG
- **Size:** 640×640 to 2048×2048 (will be resized to 224×224 for training)
- **Views:** Front, back, close-up of batch/hologram (if available)
- **Lighting:** Varied (indoor, outdoor, flash, natural)
- **Quality:** Clear enough to read text

## Data Preparation

After collecting raw images, run:

```bash
# 1. Augment counterfeit from genuine
python ml/src/data/augment_counterfeit.py

# 2. Split train/val (80/20)
python ml/src/data/prepare_packaging_dataset.py

# 3. Verify
python ml/src/data/verify_dataset.py
```

## Quick Start (No Internet)

If you can't collect real images immediately:

1. Create 10 placeholder JPG files in `genuine/` (any images)
2. Run augmentation script (creates 20 synthetic in `counterfeit/`)
3. Proceed with training (accuracy will be lower but pipeline works)

## Sources Checklist

- [ ] IFFCO website (fertilizers)
- [ ] Coromandel website
- [ ] Syngenta/Bayer (pesticides)
- [ ] Amazon.in product listings
- [ ] Flipkart BigBasket
- [ ] Kaggle datasets
- [ ] Google Images (with usage rights filter)
- [ ] Field photos (if cooperative/farmers can contribute)

## Notes

- **Copyright:** For hackathon/educational use only
- **Privacy:** Avoid images with personal information
- **Quality over quantity:** 30 good images > 100 blurry ones
- **Diversity:** Different lighting, angles, backgrounds
"""
    
    readme_path = base_dir / "README_DATA_COLLECTION.md"
    readme_path.write_text(readme_content, encoding="utf-8")
    return readme_path

def create_manifest_template(base_dir):
    """Create manifest.json template."""
    manifest = {
        "created": datetime.now().isoformat(),
        "description": "Packaging images metadata for ML training",
        "images": [
            {
                "filename": "example_genuine_01.jpg",
                "label": "genuine",
                "product": "Urea",
                "manufacturer": "IFFCO",
                "gtin": "8901234567890",
                "view": "front",
                "source": "web_scraping"
            },
            {
                "filename": "example_counterfeit_01.jpg",
                "label": "counterfeit",
                "product": "Unknown",
                "synthesis_method": "gaussian_blur",
                "source": "augmentation"
            }
        ]
    }
    
    manifest_path = base_dir / "raw" / "packaging_images" / "manifest_template.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return manifest_path

def check_existing_images(base_dir):
    """Check how many images already exist."""
    genuine_dir = base_dir / "raw" / "packaging_images" / "genuine"
    counterfeit_dir = base_dir / "raw" / "packaging_images" / "counterfeit"
    
    genuine_count = len(list(genuine_dir.glob("*.jpg"))) + len(list(genuine_dir.glob("*.png")))
    counterfeit_count = len(list(counterfeit_dir.glob("*.jpg"))) + len(list(counterfeit_dir.glob("*.png")))
    
    return genuine_count, counterfeit_count

def main():
    print("=" * 60)
    print("Packaging Image Collection Setup")
    print("=" * 60)
    
    # Create directory structure
    print("\n1. Creating directory structure...")
    base_dir = create_directory_structure()
    print(f"   ✓ Created: {base_dir}")
    
    # Create documentation
    print("\n2. Creating data collection guide...")
    readme_path = create_readme(base_dir)
    print(f"   ✓ Created: {readme_path}")
    
    # Create manifest template
    print("\n3. Creating manifest template...")
    manifest_path = create_manifest_template(base_dir)
    print(f"   ✓ Created: {manifest_path}")
    
    # Check existing images
    print("\n4. Checking for existing images...")
    genuine_count, counterfeit_count = check_existing_images(base_dir)
    print(f"   Genuine images: {genuine_count}")
    print(f"   Counterfeit images: {counterfeit_count}")
    
    # Recommendations
    print("\n" + "=" * 60)
    print("Next Steps:")
    print("=" * 60)
    
    if genuine_count < 20:
        print("\n📸 COLLECT GENUINE IMAGES (Target: 50+)")
        print("   Method 1 (Fastest): Web scraping from e-commerce")
        print("     - Amazon.in, Flipkart: Search 'IFFCO Urea bag'")
        print("     - Save product images to ml/data/raw/packaging_images/genuine/")
        print("   ")
        print("   Method 2: Manufacturer websites")
        print("     - https://www.iffco.in/")
        print("     - https://www.coromandel.biz/")
        print("     - Save product gallery images")
        print("   ")
        print("   Method 3: Google Images (with usage rights filter)")
        print("     - Search: 'fertilizer bag IFFCO'")
        print("     - Tools → Usage rights → Creative Commons")
    else:
        print(f"   ✓ You have {genuine_count} genuine images")
    
    if counterfeit_count < 10:
        print("\n🎨 GENERATE SYNTHETIC COUNTERFEITS")
        print("   Once you have 10+ genuine images, run:")
        print("     python ml/src/data/augment_counterfeit.py")
        print("   ")
        print("   This will create synthetic counterfeits with:")
        print("     - Blurred/degraded quality")
        print("     - Logo distortions")
        print("     - Color shifts")
    else:
        print(f"   ✓ You have {counterfeit_count} counterfeit images")
    
    total = genuine_count + counterfeit_count
    if total >= 40:
        print(f"\n✓ You have {total} images total - ready for ML training!")
        print("  Next: python ml/src/data/prepare_packaging_dataset.py")
    else:
        print(f"\n⚠ You have {total}/40 minimum images needed")
        print(f"  Collect {40 - total} more images to proceed")
    
    print("\n📖 Read detailed instructions:")
    print(f"   {readme_path}")
    print("=" * 60)

if __name__ == "__main__":
    main()
