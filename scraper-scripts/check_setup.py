"""
Environment setup checker - validates entire development environment.
Checks: Python version, dependencies, MongoDB, .env config, and data readiness.
Run this before starting development to catch issues early.
"""
import sys
import os
from pathlib import Path

def check_python_version():
    """Check Python version >= 3.8"""
    version = sys.version_info
    required = (3, 8)
    ok = version >= required
    status = "[OK]" if ok else "[FAIL]"
    print(f"{status} Python {version.major}.{version.minor}.{version.micro} (required: >= 3.8)")
    return ok

def check_dependencies():
    """Check if required packages are installed"""
    required = {
        "pymongo": "PyMongo",
        "dotenv": "python-dotenv",
        "fastapi": "FastAPI",
        "pydantic": "Pydantic",
        "requests": "requests",
    }
    
    optional = {
        "datagovindia": "datagovindia (for live data)",
        "tensorflow": "TensorFlow (for ML)",
        "pandas": "pandas (for data processing)",
    }
    
    print("\nRequired Dependencies:")
    all_ok = True
    for module, name in required.items():
        try:
            __import__(module)
            print(f"  [OK] {name}")
        except ImportError:
            print(f"  [FAIL] {name} - Run: pip install {module}")
            all_ok = False
    
    print("\nOptional Dependencies:")
    for module, name in optional.items():
        try:
            __import__(module)
            print(f"  [OK] {name}")
        except ImportError:
            print(f"  [WARN] {name} - Not installed (optional)")
    
    return all_ok

def check_mongodb():
    """Check MongoDB connection"""
    try:
        from pymongo import MongoClient
        from dotenv import load_dotenv
        
        # Load .env
        env_path = Path(__file__).resolve().parent.parent / ".env"
        load_dotenv(env_path)
        
        uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        
        db_name = os.getenv("MONGODB_DB_NAME", "farmer_advisory")
        db = client[db_name]
        collections = db.list_collection_names()
        
        print(f"\n[OK] MongoDB connected: {uri}")
        print(f"  Database: {db_name}")
        print(f"  Collections: {len(collections)} ({', '.join(collections[:5])}{'...' if len(collections) > 5 else ''})")
        
        return True
    except ImportError:
        print("\n[FAIL] MongoDB check skipped (pymongo not installed)")
        return False
    except Exception as e:
        print(f"\n[FAIL] MongoDB connection failed: {e}")
        print("  Fix: Ensure MongoDB is running or set MONGODB_URI in .env")
        return False

def check_env_file():
    """Check .env file exists and has required variables"""
    env_path = Path(__file__).resolve().parent.parent / ".env"
    
    if not env_path.exists():
        print("\n[FAIL] .env file not found")
        print(f"  Create: {env_path}")
        print("  Required variables: MONGODB_URI")
        print("  Optional: DATAGOVINDIA_API_KEY")
        return False
    
    print(f"\n[OK] .env file found: {env_path}")
    
    from dotenv import dotenv_values
    config = dotenv_values(env_path)
    
    # Check required
    mongodb_uri = config.get("MONGODB_URI")
    if mongodb_uri:
        print(f"  [OK] MONGODB_URI: {mongodb_uri[:30]}...")
    else:
        print("  [WARN] MONGODB_URI not set (will use default: mongodb://localhost:27017)")
    
    # Check optional
    api_key = config.get("DATAGOVINDIA_API_KEY")
    if api_key:
        print(f"  [OK] DATAGOVINDIA_API_KEY: {api_key[:10]}... (set)")
    else:
        print("  [WARN] DATAGOVINDIA_API_KEY not set (will use fallback data)")
    
    return True

def check_data_files():
    """Check if fallback data files exist"""
    data_dir = Path(__file__).resolve().parent / "data"
    
    required_files = [
        "advisory_rules.json",
        "fertilizer_mrp_fallback.json",
        "mandi_sample.csv",
        "pesticides_registry_fallback.json",
        "products_seed.json",
        "shc_baseline.json",
    ]
    
    print("\nData Files (Fallback):")
    all_ok = True
    for filename in required_files:
        path = data_dir / filename
        if path.exists():
            size = path.stat().st_size / 1024
            print(f"  ✓ {filename} ({size:.1f}KB)")
        else:
            print(f"  ✗ {filename} - Missing!")
            all_ok = False
    
    return all_ok

def check_directory_structure():
    """Check if key directories exist"""
    base = Path(__file__).resolve().parent.parent
    
    dirs = [
        "scripts",
        "scripts/data",
        "roadmap",
        "Intial-docs",
    ]
    
    optional_dirs = [
        "backend",
        "mobile",
        "ml",
        "ml/data",
    ]
    
    print("\nProject Structure:")
    all_ok = True
    for d in dirs:
        path = base / d
        if path.exists():
            print(f"  ✓ {d}/")
        else:
            print(f"  ✗ {d}/ - Missing!")
            all_ok = False
    
    print("\nOptional Directories:")
    for d in optional_dirs:
        path = base / d
        if path.exists():
            print(f"  ✓ {d}/")
        else:
            print(f"  ⚠ {d}/ - Not created yet")
    
    return all_ok

def main():
    print("=" * 60)
    print("Farmer Advisory System - Environment Check")
    print("=" * 60)
    
    checks = {
        "Python Version": check_python_version(),
        "Dependencies": check_dependencies(),
        "Environment File": check_env_file(),
        "Data Files": check_data_files(),
        "Directory Structure": check_directory_structure(),
        "MongoDB": check_mongodb(),
    }
    
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    
    for name, ok in checks.items():
        status = "✓" if ok else "✗"
        print(f"{status} {name}")
    
    all_ok = all(checks.values())
    
    print("\n" + "=" * 60)
    if all_ok:
        print("[SUCCESS] ENVIRONMENT READY!")
        print("\nNext steps:")
        print("  1. Collect data: python scripts/collect_all_data.py")
        print("  2. Validate: python scripts/validate_data.py")
        print("  3. Start backend: cd backend && uvicorn main:app --reload")
        print("  4. Start mobile: cd mobile && npx expo start")
    else:
        print("[WARNING] SETUP INCOMPLETE - Fix issues above")
        print("\nQuick fixes:")
        print("  Dependencies: pip install -r scripts/requirements.txt")
        print("  Environment: Copy .env.example to .env and configure")
        print("  MongoDB: Start local MongoDB or use Atlas")
        print("  Data: Run python scripts/collect_all_data.py")
    
    print("=" * 60)
    
    sys.exit(0 if all_ok else 1)

if __name__ == "__main__":
    main()
