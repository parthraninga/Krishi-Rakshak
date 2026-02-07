# Scripts – Data Ingestion & Seed

**Automated data collection for the Farmer Advisory & Fraud Prevention System.** These scripts populate MongoDB from data.gov.in API (when available) or use fallback files for offline/hackathon scenarios.

## Quick Start (Recommended)

**Collect all data in one command:**
```bash
python scripts/collect_all_data.py
```

This runs all ingestion scripts in the correct order and validates the results.

**For ML packaging images:**
```bash
python scripts/collect_packaging_images.py
```

**Validate everything:**
```bash
python scripts/validate_data.py
```

## Environment Setup

Create a `.env` file in project root (copy from `.env.example`):

```
MONGODB_URI=mongodb://localhost:27017
DATAGOVINDIA_API_KEY=your_key_from_data_gov_in
```

### Environment Variables

- **MONGODB_URI** (recommended) – MongoDB connection string
  - Local: `mongodb://localhost:27017`
  - Atlas: `mongodb+srv://user:pass@cluster.mongodb.net/`
  - Default if not set: `mongodb://localhost:27017`

- **DATAGOVINDIA_API_KEY** (optional but recommended for live data)
  - Get from: https://www.data.gov.in/ (Register → My Account → Generate API Key)
  - See: [DATA_GOV_IN_SETUP.md](../DATA_GOV_IN_SETUP.md) for detailed setup
  - **Without API key:** Scripts use fallback CSV/JSON files (works for hackathon)

- **MONGODB_DB_NAME** (optional) – Database name (default: `farmer_advisory`)

### Windows PowerShell
```powershell
$env:MONGODB_URI="mongodb://localhost:27017"
$env:DATAGOVINDIA_API_KEY="your_key"
```

### Linux/Mac
```bash
export MONGODB_URI=mongodb://localhost:27017
export DATAGOVINDIA_API_KEY=your_key
```

## Install Dependencies

```bash
pip install -r scripts/requirements.txt
```

Or manually:
```bash
pip install pymongo python-dotenv requests datagovindia
```

## Data Sources & Fallback Strategy

Each script implements **automatic fallback**:

| Script | Primary Source | Fallback File | Description |
|--------|---------------|---------------|-------------|
| `ingest_mandi_prices.py` | data.gov.in API | `data/mandi_sample.csv` | Wholesale market prices |
| `ingest_fertilizer_mrp.py` | data.gov.in API | `data/fertilizer_mrp_fallback.json` | Official MRP for fertilizers |
| `ingest_shc_baseline.py` | - | `data/shc_baseline.json` | Soil health baseline (SHC portal) |
| `ingest_pesticides_registry.py` | - | `data/pesticides_registry_fallback.json` | CIB&RC registered pesticides |
| `seed_mongodb.py` | - | `data/products_seed.json`, `data/advisory_rules.json` | Product registry & rules |

**Fallback behavior:**
1. Try data.gov.in API (if `DATAGOVINDIA_API_KEY` set)
2. Use local file if API unavailable
3. Exit with error if neither works

## First-Time: data.gov.in API (Optional)

If you have an API key and want **live data**:

```bash
# One-time metadata sync (5-10 minutes)
python scripts/sync_datagovindia_metadata.py
```

This downloads the data.gov.in catalog locally for faster searching. **Only needed once.**

**No API key?** No problem! Scripts work with fallback files.

## Script Reference

### Master Scripts (Use These)

**`collect_all_data.py`** – Run all ingestion in correct order
```bash
python scripts/collect_all_data.py           # Full collection + validation
python scripts/collect_all_data.py --skip-validation  # Skip final check
```

**`validate_data.py`** – Verify all collections populated
```bash
python scripts/validate_data.py
```

**`collect_packaging_images.py`** – Setup ML image directories
```bash
python scripts/collect_packaging_images.py
```

### Individual Ingestion Scripts

Run these manually if you need to update specific collections:

1. **Mandi Prices**
   ```bash
   python scripts/ingest_mandi_prices.py
   ```
   - Tries: data.gov.in → `mandi_sample.csv`
   - Populates: `mandi_prices` collection

2. **Fertilizer MRP**
   ```bash
   python scripts/ingest_fertilizer_mrp.py
   ```
   - Tries: data.gov.in → `fertilizer_mrp_fallback.json`
   - Populates: `fertilizer_mrp` collection

3. **Soil Health Baseline**
   ```bash
   python scripts/ingest_shc_baseline.py
   ```
   - Uses: `shc_baseline.json` (10 districts)
   - Populates: `soil_baseline` collection

4. **Pesticides Registry**
   ```bash
   python scripts/ingest_pesticides_registry.py
   ```
   - Uses: `pesticides_registry_fallback.json`
   - Populates: `pesticides_registry` collection

5. **Seed Products & Rules**
   ```bash
   python scripts/seed_mongodb.py
   ```
   - Uses: `products_seed.json`, `advisory_rules.json`
   - Populates: `products`, `advisory_rules` collections

### Utility Scripts

**`db_helper.py`** – MongoDB connection & index creation (used by all scripts)

**`sync_datagovindia_metadata.py`** – One-time data.gov.in catalog sync

## MongoDB Collections Created

After running `collect_all_data.py`, you'll have:

- **products** (10 SKUs) – Product registry for QR verification
- **advisory_rules** (6 rules) – Crop × stage recommendations
- **mandi_prices** (15+ records) – Market prices
- **fertilizer_mrp** (10 products) – Official MRP
- **pesticides_registry** (20 products) – Registered pesticides
- **soil_baseline** (10 districts) – Soil NPK values
- **reports** (empty) – Community fraud reports
- **alerts** (empty) – Fraud detection alerts

## Troubleshooting

### "ModuleNotFoundError: No module named 'pymongo'"
```bash
pip install -r scripts/requirements.txt
```

### "Connection refused" or "MongoDB not running"
- **Local:** Start MongoDB (`mongod` or Docker)
- **Atlas:** Check `MONGODB_URI` connection string
- **Test:** `mongosh "mongodb://localhost:27017"` or use MongoDB Compass

### "No data from data.gov.in"
- **Expected if no API key!** Scripts will use fallback files automatically.
- **With API key:** Run `sync_datagovindia_metadata.py` first (one-time).
- **Still failing:** Check [DATA_GOV_IN_SETUP.md](../DATA_GOV_IN_SETUP.md) troubleshooting section.

### Validation fails
```bash
python scripts/validate_data.py
```
Shows which collections need data. Re-run specific ingestion script.

## Data Files in `scripts/data/`

All fallback files are **ready to use** (no download needed):

- `advisory_rules.json` – 6 rules (paddy, cotton × 3 stages)
- `fertilizer_mrp_fallback.json` – 10 fertilizers with MRP
- `mandi_sample.csv` – 15 sample mandi price records
- `pesticides_registry_fallback.json` – 20 registered pesticides
- `products_seed.json` – 10 product SKUs (GTIN, batch format)
- `shc_baseline.json` – 10 districts with N, P, K values

These are **hackathon-ready** – system works fully offline!

## Database Name

Default: `farmer_advisory`

Override with environment variable:
```bash
export MONGODB_DB_NAME=my_custom_db
```

## Next Steps After Data Collection

1. ✓ Data collected and validated
2. → Setup backend: See `roadmap/0-implementation-roadmap.md` Phase 2
3. → Train ML model: See `roadmap/ml-pipeline.md`
4. → Build mobile app: See `roadmap/folder-structure.md`

## Full Documentation

- **Data sources:** [roadmap/data-collection-guide.md](../roadmap/data-collection-guide.md)
- **Schemas:** [roadmap/data-schemas.md](../roadmap/data-schemas.md)
- **API setup:** [DATA_GOV_IN_SETUP.md](../DATA_GOV_IN_SETUP.md)
- **ML images:** [ml/data/README_DATA_COLLECTION.md](../ml/data/README_DATA_COLLECTION.md) (created by `collect_packaging_images.py`)

---

**For hackathon teams:** Just run `python scripts/collect_all_data.py` and you're good to go!
