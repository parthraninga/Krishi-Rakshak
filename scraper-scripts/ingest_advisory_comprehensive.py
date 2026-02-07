#!/usr/bin/env python3
"""
Populate comprehensive Advisory Rules for crop management
Based on ICAR, IARI, and State Agricultural Department recommendations
Covers: Crop stages, Soil conditions, Pest/Disease scenarios
"""
import os
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from dotenv import load_dotenv
load_dotenv()

from scripts.db_helper import get_db


def get_advisory_rules():
    """
    Comprehensive agricultural advisory rules
    Sources: ICAR, IARI, State Agricultural Departments
    """
    
    rules = [
        # ==================== WHEAT ADVISORY ====================
        {
            "crop": "Wheat",
            "stage": "Land Preparation",
            "soil_condition": {"pH": {"min": 6.0, "max": 7.5}},
            "inputs": [
                "Deep ploughing (20-25 cm)",
                "Apply FYM 5-6 tonnes/acre",
                "Ensure proper drainage"
            ],
            "timing": "October-November (Rabi season)",
            "region": "North India",
            "source": "ICAR-IARI",
            "priority": "High",
            "last_updated": datetime.now()
        },
        {
            "crop": "Wheat",
            "stage": "Sowing",
            "soil_condition": {"moisture": "optimal"},
            "inputs": [
                "Seed rate: 40-50 kg/acre",
                "Basal dose: DAP 50 kg/acre",
                "Basal dose: MOP 15 kg/acre",
                "Seed treatment with Thiram @ 2g/kg"
            ],
            "timing": "Mid-November (Timely sowing)",
            "region": "North India",
            "source": "ICAR",
            "priority": "Critical",
            "last_updated": datetime.now()
        },
        {
            "crop": "Wheat",
            "stage": "First Irrigation (CRI)",
            "soil_condition": {},
            "inputs": [
                "First irrigation at Crown Root Initiation (21-25 days)",
                "Top dressing: Urea 50 kg/acre",
                "Monitor for termite attack"
            ],
            "timing": "25 days after sowing",
            "region": "All regions",
            "source": "ICAR",
            "priority": "High",
            "last_updated": datetime.now()
        },
        {
            "crop": "Wheat",
            "stage": "Tillering",
            "soil_condition": {},
            "inputs": [
                "Second irrigation (40 days)",
                "Top dressing: Urea 25 kg/acre",
                "Spray for aphids if detected: Imidacloprid @ 0.5 ml/liter"
            ],
            "timing": "35-40 days after sowing",
            "region": "All regions",
            "source": "ICAR",
            "priority": "High",
            "last_updated": datetime.now()
        },
        {
            "crop": "Wheat",
            "stage": "Flowering & Milking",
            "soil_condition": {},
            "inputs": [
                "Irrigation at flowering (60 days)",
                "Irrigation at milking (80 days)",
                "Monitor for rust disease",
                "Spray Propiconazole @ 1 ml/liter if rust appears"
            ],
            "timing": "60-80 days after sowing",
            "region": "All regions",
            "source": "ICAR",
            "priority": "Critical",
            "last_updated": datetime.now()
        },
        
        # ==================== RICE ADVISORY ====================
        {
            "crop": "Rice",
            "stage": "Nursery Preparation",
            "soil_condition": {"pH": {"min": 5.5, "max": 6.5}},
            "inputs": [
                "Nursery bed size: 10m x 1m for 1 acre",
                "Apply urea 500g + SSP 500g per bed",
                "Seed treatment with Carbendazim @ 2g/kg seed"
            ],
            "timing": "June (Kharif)",
            "region": "All India",
            "source": "ICAR-CRRI",
            "priority": "High",
            "last_updated": datetime.now()
        },
        {
            "crop": "Rice",
            "stage": "Transplanting",
            "soil_condition": {"moisture": "standing water 5cm"},
            "inputs": [
                "25-35 days old seedlings",
                "Spacing: 20cm x 15cm (2-3 seedlings/hill)",
                "Basal: DAP 50 kg/acre + MOP 17 kg/acre"
            ],
            "timing": "July (30 days after nursery)",
            "region": "All India",
            "source": "ICAR",
            "priority": "Critical",
            "last_updated": datetime.now()
        },
        {
            "crop": "Rice",
            "stage": "Tillering",
            "soil_condition": {},
            "inputs": [
                "Top dressing: Urea 44 kg/acre (2-3 split doses)",
                "Maintain 2-3 cm water level",
                "Apply Zinc Sulphate 10 kg/acre if deficiency"
            ],
            "timing": "15-45 days after transplanting",
            "region": "All India",
            "source": "ICAR",
            "priority": "High",
            "last_updated": datetime.now()
        },
        {
            "crop": "Rice",
            "stage": "Panicle Initiation",
            "soil_condition": {},
            "inputs": [
                "Maintain 5 cm water level",
                "Monitor for stem borer",
                "If infestation >5%: Cartap Hydrochloride @ 2g/liter"
            ],
            "timing": "50-60 days after transplanting",
            "region": "All India",
            "source": "ICAR",
            "priority": "High",
            "last_updated": datetime.now()
        },
        {
            "crop": "Rice",
            "stage": "Flowering",
            "soil_condition": {},
            "inputs": [
                "Drain field 1 week before harvest",
                "Monitor for blast disease",
                "Spray Tricyclazole @ 0.6g/liter if blast detected"
            ],
            "timing": "80-90 days after transplanting",
            "region": "All India",
            "source": "ICAR",
            "priority": "Critical",
            "last_updated": datetime.now()
        },
        
        # ==================== COTTON ADVISORY ====================
        {
            "crop": "Cotton",
            "stage": "Sowing",
            "soil_condition": {"pH": {"min": 6.0, "max": 7.5}},
            "inputs": [
                "Seed rate: 1 kg/acre (Bt Cotton)",
                "Spacing: 90cm x 60cm",
                "Seed treatment: Imidacloprid @ 5ml/kg",
                "Basal: DAP 50 kg/acre + MOP 25 kg/acre"
            ],
            "timing": "May-June (Kharif)",
            "region": "Central & South India",
            "source": "CICR Nagpur",
            "priority": "Critical",
            "last_updated": datetime.now()
        },
        {
            "crop": "Cotton",
            "stage": "Vegetative Growth",
            "soil_condition": {},
            "inputs": [
                "Top dressing: Urea 50 kg/acre at 45 days",
                "IPM: Set up pheromone traps (8/acre)",
                "Monitor for aphids, jassids, whitefly"
            ],
            "timing": "30-60 days after sowing",
            "region": "All regions",
            "source": "CICR",
            "priority": "High",
            "last_updated": datetime.now()
        },
        {
            "crop": "Cotton",
            "stage": "Flowering & Boll Formation",
            "soil_condition": {},
            "inputs": [
                "Top dressing: Urea 25 kg/acre at 75 days",
                "Monitor for pink bollworm (ETL: 10%)",
                "If bollworm >10%: Emamectin Benzoate @ 0.5g/liter",
                "Foliar spray: NPK 19-19-19 @ 5g/liter"
            ],
            "timing": "60-120 days after sowing",
            "region": "All regions",
            "source": "CICR",
            "priority": "Critical",
            "last_updated": datetime.now()
        },
        
        # ==================== SUGARCANE ADVISORY ====================
        {
            "crop": "Sugarcane",
            "stage": "Planting",
            "soil_condition": {"pH": {"min": 6.5, "max": 7.5}},
            "inputs": [
                "Seed rate: 12,000-14,000 3-bud setts/acre",
                "Sett treatment: Carbendazim @ 2g/liter for 10 min",
                "Basal: FYM 5 tonnes/acre",
                "Basal: DAP 50 kg/acre + MOP 30 kg/acre"
            ],
            "timing": "February-March (Spring)",
            "region": "North India",
            "source": "IISR Lucknow",
            "priority": "High",
            "last_updated": datetime.now()
        },
        {
            "crop": "Sugarcane",
            "stage": "Tillering",
            "soil_condition": {},
            "inputs": [
                "Top dressing: Urea 100 kg/acre (45 days)",
                "Earthing up operation",
                "Light irrigation every 10-12 days"
            ],
            "timing": "45-90 days after planting",
            "region": "All regions",
            "source": "IISR",
            "priority": "High",
            "last_updated": datetime.now()
        },
        {
            "crop": "Sugarcane",
            "stage": "Grand Growth",
            "soil_condition": {},
            "inputs": [
                "Top dressing: Urea 100 kg/acre (90 days)",
                "Monitor for borer infestation",
                "If borer >5%: Chlorantraniliprole @ 0.3ml/liter",
                "Detrashing of lower leaves"
            ],
            "timing": "90-150 days after planting",
            "region": "All regions",
            "source": "IISR",
            "priority": "High",
            "last_updated": datetime.now()
        },
        
        # ==================== TOMATO ADVISORY ====================
        {
            "crop": "Tomato",
            "stage": "Nursery",
            "soil_condition": {"pH": {"min": 6.0, "max": 7.0}},
            "inputs": [
                "Seeds: 80-100g for 1 acre",
                "Nursery bed: 1m x 3m for 1 acre",
                "Seed treatment: Thiram @ 3g/kg",
                "Apply FYM + DAP 50g/bed"
            ],
            "timing": "30 days before transplanting",
            "region": "All India",
            "source": "ICAR-IIHR",
            "priority": "High",
            "last_updated": datetime.now()
        },
        {
            "crop": "Tomato",
            "stage": "Transplanting",
            "soil_condition": {},
            "inputs": [
                "30-35 days old seedlings",
                "Spacing: 60cm x 45cm",
                "Basal: FYM 5 tonnes/acre",
                "Basal: DAP 60 kg/acre + MOP 40 kg/acre",
                "Drenching: Carbendazim @ 1g/liter (wilt prevention)"
            ],
            "timing": "After nursery",
            "region": "All India",
            "source": "IIHR",
            "priority": "Critical",
            "last_updated": datetime.now()
        },
        {
            "crop": "Tomato",
            "stage": "Flowering & Fruiting",
            "soil_condition": {},
            "inputs": [
                "Top dressing: Urea 40 kg/acre at 30 days",
                "Top dressing: Urea 40 kg/acre at 50 days",
                "Monitor for early blight (ETL: 5%)",
                "If blight: Mancozeb @ 2g/liter",
                "For fruit borer: Emamectin @ 0.5g/liter"
            ],
            "timing": "30-60 days after transplanting",
            "region": "All India",
            "source": "IIHR",
            "priority": "High",
            "last_updated": datetime.now()
        },
        
        # ==================== POTATO ADVISORY ====================
        {
            "crop": "Potato",
            "stage": "Planting",
            "soil_condition": {"pH": {"min": 5.5, "max": 6.5}, "temperature": "15-20°C"},
            "inputs": [
                "Seed rate: 1200-1500 kg/acre",
                "Seed treatment: Mancozeb @ 2.5g/kg",
                "Basal: FYM 5 tonnes/acre",
                "Basal: NPK 20-20-0 @ 100 kg/acre"
            ],
            "timing": "October-November (Rabi)",
            "region": "North India",
            "source": "CPRI Shimla",
            "priority": "High",
            "last_updated": datetime.now()
        },
        {
            "crop": "Potato",
            "stage": "Earthing Up",
            "soil_condition": {},
            "inputs": [
                "First earthing: 25-30 days after planting",
                "Top dressing: Urea 30 kg/acre",
                "Light irrigation (avoid water logging)",
                "Monitor for aphids (virus vector)"
            ],
            "timing": "25-30 days after planting",
            "region": "All regions",
            "source": "CPRI",
            "priority": "Critical",
            "last_updated": datetime.now()
        },
        {
            "crop": "Potato",
            "stage": "Tuber Formation",
            "soil_condition": {},
            "inputs": [
                "Second earthing: 45-50 days",
                "Monitor for late blight (critical stage)",
                "Spray Mancozeb @ 2.5g/liter every 10 days",
                "Maintain soil moisture"
            ],
            "timing": "45-60 days after planting",
            "region": "All regions",
            "source": "CPRI",
            "priority": "Critical",
            "last_updated": datetime.now()
        },
        
        # ==================== SOIL MANAGEMENT ADVISORY ====================
        {
            "crop": "General",
            "stage": "Soil Health Management",
            "soil_condition": {"N": {"status": "low"}},
            "inputs": [
                "Apply Urea @ 100 kg/acre as basal",
                "Green manuring with Dhaincha/Sunhemp",
                "Apply FYM 5-6 tonnes/acre"
            ],
            "timing": "Before sowing",
            "region": "All India",
            "source": "Soil Health Card",
            "priority": "High",
            "last_updated": datetime.now()
        },
        {
            "crop": "General",
            "stage": "Soil Health Management",
            "soil_condition": {"P": {"status": "low"}},
            "inputs": [
                "Apply SSP @ 125 kg/acre or DAP @ 60 kg/acre",
                "Organic matter: Compost/FYM improves P availability",
                "Rock phosphate for long-term P buildup"
            ],
            "timing": "Before sowing",
            "region": "All India",
            "source": "Soil Health Card",
            "priority": "High",
            "last_updated": datetime.now()
        },
        {
            "crop": "General",
            "stage": "Soil Health Management",
            "soil_condition": {"K": {"status": "low"}},
            "inputs": [
                "Apply MOP @ 40 kg/acre",
                "Potassium-rich organic manures",
                "Avoid potassium leaching with proper irrigation"
            ],
            "timing": "Before sowing",
            "region": "All India",
            "source": "Soil Health Card",
            "priority": "Medium",
            "last_updated": datetime.now()
        },
        {
            "crop": "General",
            "stage": "Soil Health Management",
            "soil_condition": {"pH": {"min": 0, "max": 5.5}},
            "inputs": [
                "Apply Lime @ 400-800 kg/acre (based on pH)",
                "Use Dolomite for Mg deficiency areas",
                "Retest soil after 6 months"
            ],
            "timing": "Summer/Before monsoon",
            "region": "All India",
            "source": "SHC",
            "priority": "High",
            "last_updated": datetime.now()
        },
        {
            "crop": "General",
            "stage": "Soil Health Management",
            "soil_condition": {"pH": {"min": 8.0, "max": 10.0}},
            "inputs": [
                "Apply Gypsum @ 500 kg/acre",
                "Elemental Sulphur @ 50 kg/acre",
                "Increase organic matter content"
            ],
            "timing": "Summer ploughing",
            "region": "All India",
            "source": "SHC",
            "priority": "High",
            "last_updated": datetime.now()
        },
        
        # ==================== INTEGRATED PEST MANAGEMENT ====================
        {
            "crop": "General",
            "stage": "IPM - Preventive",
            "soil_condition": {},
            "inputs": [
                "Pheromone traps @ 8-10/acre",
                "Yellow sticky traps @ 10-15/acre",
                "Light traps @ 1/acre",
                "Neem oil spray @ 5ml/liter (15-day interval)",
                "Encourage parasitoids: Trichogramma release"
            ],
            "timing": "Throughout crop season",
            "region": "All India",
            "source": "ICAR-IPM",
            "priority": "Medium",
            "last_updated": datetime.now()
        },
        
        # ==================== MICRONUTRIENT MANAGEMENT ====================
        {
            "crop": "General",
            "stage": "Micronutrient Application",
            "soil_condition": {"Zn": {"status": "deficient"}},
            "inputs": [
                "Soil application: Zinc Sulphate @ 10 kg/acre",
                "Foliar spray: Zinc Sulphate @ 5g/liter",
                "Mix with FYM for better distribution"
            ],
            "timing": "Basal application preferred",
            "region": "All India",
            "source": "ICAR",
            "priority": "Medium",
            "last_updated": datetime.now()
        },
        {
            "crop": "General",
            "stage": "Micronutrient Application",
            "soil_condition": {"B": {"status": "deficient"}},
            "inputs": [
                "Soil application: Borax @ 5 kg/acre",
                "Foliar spray: Boric acid @ 1g/liter at flowering",
                "Critical for oilseeds, pulses, vegetables"
            ],
            "timing": "Before flowering",
            "region": "All India",
            "source": "ICAR",
            "priority": "Medium",
            "last_updated": datetime.now()
        },
    ]
    
    return rules


def main():
    print("="*80)
    print("ADVISORY RULES DATA INGESTION")
    print("="*80)
    
    db = get_db()
    coll = db.advisory_rules
    
    # Clear existing data
    print("\n[1] Clearing existing advisory_rules collection...")
    result = coll.delete_many({})
    print(f"    Deleted {result.deleted_count} old records")
    
    # Get comprehensive rules
    print("\n[2] Loading comprehensive advisory rules...")
    rules = get_advisory_rules()
    print(f"    Prepared {len(rules)} advisory rules")
    
    # Insert to MongoDB
    print("\n[3] Inserting into MongoDB...")
    for rule in rules:
        coll.insert_one(rule)
    
    print(f"    ✓ Inserted {len(rules)} rules")
    
    # Create indexes
    print("\n[4] Creating indexes...")
    try:
        coll.drop_indexes()
    except:
        pass
    
    coll.create_index("crop")
    coll.create_index("stage")
    coll.create_index("region")
    coll.create_index("priority")
    print("    ✓ Indexes created")
    
    # Summary
    total = coll.count_documents({})
    print("\n" + "="*80)
    print("✅ ADVISORY RULES INGESTION COMPLETE")
    print("="*80)
    print(f"Total rules in database: {total}")
    
    # Breakdown by crop
    print("\nBreakdown by crop:")
    crops = coll.distinct("crop")
    for crop in sorted(crops):
        count = coll.count_documents({"crop": crop})
        print(f"  • {crop:15s}: {count:2d} rules")
    
    # Sample rules
    print("\n📋 Sample advisory rules:")
    for doc in coll.find().limit(5):
        inputs_preview = ', '.join(doc.get('inputs', [])[:2])
        print(f"  • {doc['crop']:10s} - {doc['stage']:25s} → {inputs_preview[:50]}...")
    
    print("\n" + "="*80)


if __name__ == "__main__":
    main()
