"""
Master data collection script - orchestrates all data ingestion.
Run this to populate entire MongoDB database for the hackathon.
Usage: python scripts/collect_all_data.py [--skip-validation]
"""
import sys
import subprocess
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

SCRIPT_DIR = Path(__file__).resolve().parent

def run_script(script_name, description):
    """Run a Python script and report status."""
    print(f"\n{'=' * 60}")
    print(f"Running: {description}")
    print(f"Script: {script_name}")
    print(f"{'=' * 60}")
    
    script_path = SCRIPT_DIR / script_name
    if not script_path.exists():
        print(f"✗ Script not found: {script_path}")
        return False
    
    try:
        result = subprocess.run(
            [sys.executable, str(script_path)],
            cwd=SCRIPT_DIR.parent,
            capture_output=True,
            text=True,
            timeout=180  # 3 minutes max per script
        )
        
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr, file=sys.stderr)
        
        if result.returncode == 0:
            print(f"✓ {description} completed successfully")
            return True
        else:
            print(f"✗ {description} failed with exit code {result.returncode}")
            return False
    except subprocess.TimeoutExpired:
        print(f"✗ {description} timed out after 3 minutes")
        return False
    except Exception as e:
        print(f"✗ {description} failed: {e}")
        return False

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Collect all data for farmer advisory system")
    parser.add_argument("--skip-validation", action="store_true", 
                        help="Skip final validation step")
    args = parser.parse_args()
    
    print("=" * 60)
    print("Farmer Advisory System - Data Collection")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # Check environment
    import os
    mongodb_uri = os.getenv("MONGODB_URI")
    api_key = os.getenv("DATAGOVINDIA_API_KEY")
    
    print("\nEnvironment Check:")
    print(f"  MONGODB_URI: {'✓ Set' if mongodb_uri else '✗ Not set (will use localhost)'}")
    print(f"  DATAGOVINDIA_API_KEY: {'✓ Set' if api_key else '⚠ Not set (will use fallback data)'}")
    
    if not api_key:
        print("\n⚠ To get live data from data.gov.in:")
        print("  1. Visit https://www.data.gov.in/")
        print("  2. Register/Login and generate API key")
        print("  3. Set in .env: DATAGOVINDIA_API_KEY=your_key_here")
        print("  4. Run: python scripts/sync_datagovindia_metadata.py (one-time)")
        print("\n  Using fallback data files for now...\n")
    
    # Execution order (Phase 1 of implementation roadmap)
    scripts = [
        ("ingest_mandi_prices.py", "Ingest mandi/wholesale prices"),
        ("ingest_fertilizer_mrp.py", "Ingest fertilizer MRP"),
        ("ingest_shc_baseline.py", "Ingest soil health baseline"),
        ("ingest_pesticides_registry.py", "Ingest registered pesticides"),
        ("seed_mongodb.py", "Seed products and advisory rules"),
    ]
    
    results = []
    for script, desc in scripts:
        success = run_script(script, desc)
        results.append((desc, success))
    
    # Summary
    print("\n" + "=" * 60)
    print("Data Collection Summary")
    print("=" * 60)
    for desc, success in results:
        status = "✓" if success else "✗"
        print(f"{status} {desc}")
    
    all_success = all(success for _, success in results)
    
    if not args.skip_validation:
        print("\n" + "=" * 60)
        print("Running validation...")
        print("=" * 60)
        validation_ok = run_script("validate_data.py", "Validate all data")
        
        if validation_ok and all_success:
            print("\n✓✓✓ ALL DATA COLLECTED AND VALIDATED ✓✓✓")
        else:
            print("\n⚠ Some issues found. See logs above.")
    else:
        if all_success:
            print("\n✓ All ingestion scripts completed")
            print("Run: python scripts/validate_data.py to verify")
    
    print("\nNext steps:")
    print("  1. For ML images: python scripts/collect_packaging_images.py")
    print("  2. For backend: cd backend && python -m src.main (when ready)")
    print("  3. For validation: python scripts/validate_data.py")
    print("=" * 60)
    
    sys.exit(0 if all_success else 1)

if __name__ == "__main__":
    main()
