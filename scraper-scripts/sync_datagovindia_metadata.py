"""
One-time sync of data.gov.in resource metadata (required by datagovindia for search/get_data).
Run once: python scripts/sync_datagovindia_metadata.py
Then re-run ingest_mandi_prices.py and ingest_fertilizer_mrp.py to try API again.
"""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

def main():
    api_key = os.getenv("DATAGOVINDIA_API_KEY")
    if not api_key:
        print("Set DATAGOVINDIA_API_KEY in .env and run again.", file=sys.stderr)
        sys.exit(1)
    try:
        from datagovindia import DataGovIndia
        dg = DataGovIndia(api_key=api_key)
        print("Syncing data.gov.in metadata (this may take 1–2 minutes)...")
        dg.sync_metadata()  # or update_metadata() depending on library version
        print("Done. You can now re-run ingest_mandi_prices.py and ingest_fertilizer_mrp.py for API data.")
    except AttributeError:
        try:
            dg.update_metadata()
            print("Done.")
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)
            sys.exit(1)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
