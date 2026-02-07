"""
Validate all MongoDB collections and data files for ML pipeline.
Checks collection counts, schema compliance, and data quality.
Run after all ingestion scripts to ensure data is ready for backend and ML.
"""
import sys
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from scripts.db_helper import get_db

SCRIPT_DIR = Path(__file__).resolve().parent
DATA_DIR = SCRIPT_DIR / "data"

def check_collection(db, name, min_count=0, required_fields=None):
    """Check if collection exists, has minimum count, and sample has required fields."""
    coll = db[name]
    count = coll.count_documents({})
    status = "[OK]" if count >= min_count else "[FAIL]"
    print(f"{status} {name}: {count} documents (min: {min_count})")
    
    if count > 0 and required_fields:
        sample = coll.find_one()
        missing = [f for f in required_fields if f not in sample]
        if missing:
            print(f"  Warning: Sample missing fields: {missing}")
            return False
    return count >= min_count

def check_file(path, description):
    """Check if data file exists."""
    exists = path.exists()
    status = "[OK]" if exists else "[FAIL]"
    size = f"{path.stat().st_size / 1024:.1f}KB" if exists else "missing"
    print(f"{status} {description}: {size}")
    return exists

def main():
    print("=" * 60)
    print("Data Validation Report")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # Check MongoDB connection
    try:
        db = get_db()
        db.command("ping")
        print("[OK] MongoDB connection successful")
    except Exception as e:
        print(f"[FAIL] MongoDB connection failed: {e}")
        print("\nSet MONGODB_URI in .env or environment")
        sys.exit(1)
    
    print("\n--- MongoDB Collections ---")
    all_ok = True
    
    # Core collections with minimum counts for demo
    all_ok &= check_collection(db, "products", min_count=5, 
                                required_fields=["gtin", "product_name", "category"])
    all_ok &= check_collection(db, "advisory_rules", min_count=4, 
                                required_fields=["crop", "stage", "inputs"])
    all_ok &= check_collection(db, "mandi_prices", min_count=5, 
                                required_fields=["commodity", "district", "date"])
    all_ok &= check_collection(db, "fertilizer_mrp", min_count=5, 
                                required_fields=["product_name", "mrp"])
    all_ok &= check_collection(db, "pesticides_registry", min_count=10, 
                                required_fields=["product_name"])
    all_ok &= check_collection(db, "soil_baseline", min_count=5, 
                                required_fields=["district", "N_avg", "P_avg", "K_avg"])
    
    # Optional collections
    check_collection(db, "reports", min_count=0)
    check_collection(db, "alerts", min_count=0)
    
    print("\n--- Data Files (Fallback/Seed) ---")
    all_ok &= check_file(DATA_DIR / "products_seed.json", "Products seed")
    all_ok &= check_file(DATA_DIR / "advisory_rules.json", "Advisory rules")
    all_ok &= check_file(DATA_DIR / "mandi_sample.csv", "Mandi sample CSV")
    all_ok &= check_file(DATA_DIR / "fertilizer_mrp_fallback.json", "Fertilizer MRP fallback")
    all_ok &= check_file(DATA_DIR / "pesticides_registry_fallback.json", "Pesticides registry")
    all_ok &= check_file(DATA_DIR / "shc_baseline.json", "SHC soil baseline")
    
    print("\n--- ML Data ---")
    ml_data_dir = Path(__file__).resolve().parent.parent / "ml" / "data"
    if not ml_data_dir.exists():
        print(f"ℹ ML data directory not yet created: {ml_data_dir}")
        print("  Run scripts/collect_packaging_images.py to set up ML dataset")
    else:
        raw_dir = ml_data_dir / "raw" / "packaging_images"
        if raw_dir.exists():
            genuine_imgs = list((raw_dir / "genuine").glob("*")) if (raw_dir / "genuine").exists() else []
            counterfeit_imgs = list((raw_dir / "counterfeit").glob("*")) if (raw_dir / "counterfeit").exists() else []
            print(f"  Genuine images: {len(genuine_imgs)}")
            print(f"  Counterfeit images: {len(counterfeit_imgs)}")
            if len(genuine_imgs) < 20 or len(counterfeit_imgs) < 10:
                print(f"  ⚠ Warning: Need ~50 genuine + ~20 counterfeit for good training")
                all_ok = False
        else:
            print(f"  ✗ Packaging images directory missing: {raw_dir}")
            all_ok = False
    
    print("\n" + "=" * 60)
    if all_ok:
        print("[SUCCESS] All critical data validated successfully!")
        print("\nNext steps:")
        print("  1. Backend: Start developing FastAPI endpoints")
        print("  2. ML: Train packaging classifier (ml/src/train/train_packaging.py)")
        print("  3. Mobile: Build React Native app with QR scanner")
    else:
        print("[WARNING] Some data issues found. Review warnings above.")
        print("\nTo fix:")
        print("  1. Run: python scripts/collect_all_data.py")
        print("  2. For API data: Set DATAGOVINDIA_API_KEY in .env")
        print("  3. For ML images: Run scripts/collect_packaging_images.py")
        sys.exit(1)
    print("=" * 60)

if __name__ == "__main__":
    main()
