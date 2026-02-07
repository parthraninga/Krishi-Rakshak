"""
Shared MongoDB connection for scripts. Uses MONGODB_URI from env.
Database name: farmer_advisory (or MONGODB_DB_NAME).
"""
import os
from pymongo import MongoClient, ASCENDING
from pymongo.database import Database

def get_uri() -> str:
    uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    return uri

def get_db() -> Database:
    client = MongoClient(get_uri())
    db_name = os.getenv("MONGODB_DB_NAME", "farmer_advisory")
    return client[db_name]

def ensure_indexes(db: Database) -> None:
    """Create indexes as per roadmap/data-schemas.md."""
    # products
    db.products.create_index("gtin", unique=True)
    db.products.create_index("sku")
    db.products.create_index("updated_at")
    # advisory_rules
    db.advisory_rules.create_index([("crop", ASCENDING), ("stage", ASCENDING)])
    # mandi_prices
    db.mandi_prices.create_index([("commodity", ASCENDING), ("district", ASCENDING), ("date", ASCENDING)])
    db.mandi_prices.create_index("date")
    # fertilizer_mrp
    db.fertilizer_mrp.create_index("product_name")
    # pesticides_registry
    db.pesticides_registry.create_index("product_name")
    db.pesticides_registry.create_index("reg_no")
    # soil_baseline
    db.soil_baseline.create_index("district", unique=True)
    # reports
    db.reports.create_index("district")
    db.reports.create_index("created_at")
    # alerts
    db.alerts.create_index([("session_id", ASCENDING), ("created_at", ASCENDING)])
