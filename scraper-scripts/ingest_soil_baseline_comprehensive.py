#!/usr/bin/env python3
"""
Populate comprehensive Soil Health Baseline data
Based on Soil Health Card portal district averages
Covers major agricultural districts across India
"""
import os
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from dotenv import load_dotenv
load_dotenv()

from scripts.db_helper import get_db
import json


def get_soil_baseline_data():
    """
    District-wise soil health baseline data
    Sources: Soil Health Card Portal, State Agricultural Departments
    Parameters: N, P, K, pH, Organic Carbon, EC, Micronutrients
    """
    
    baseline_data = [
        # ==================== PUNJAB ====================
        {
            "state": "Punjab",
            "district": "Ludhiana",
            "zone": "Trans-Gangetic Plains",
            "soil_type": "Alluvial",
            "parameters": {
                "N": {"value": 245, "unit": "kg/ha", "status": "Medium"},
                "P": {"value": 18.5, "unit": "kg/ha", "status": "Medium"},
                "K": {"value": 165, "unit": "kg/ha", "status": "Low"},
                "pH": {"value": 7.8, "status": "Slightly alkaline"},
                "OC": {"value": 0.52, "unit": "%", "status": "Medium"},
                "EC": {"value": 0.35, "unit": "dS/m", "status": "Normal"},
                "Zn": {"value": 0.62, "unit": "ppm", "status": "Deficient"},
                "Fe": {"value": 4.2, "unit": "ppm", "status": "Sufficient"},
                "Mn": {"value": 6.8, "unit": "ppm", "status": "Sufficient"},
                "Cu": {"value": 1.2, "unit": "ppm", "status": "Sufficient"}
            },
            "dominant_crops": ["Wheat", "Rice", "Cotton"],
            "source": "SHC Portal 2024",
            "sampling_year": 2024,
            "samples_count": 15420,
            "last_updated": datetime.now()
        },
        {
            "state": "Punjab",
            "district": "Amritsar",
            "zone": "Trans-Gangetic Plains",
            "soil_type": "Alluvial",
            "parameters": {
                "N": {"value": 238, "unit": "kg/ha", "status": "Medium"},
                "P": {"value": 16.2, "unit": "kg/ha", "status": "Medium"},
                "K": {"value": 152, "unit": "kg/ha", "status": "Low"},
                "pH": {"value": 8.1, "status": "Moderately alkaline"},
                "OC": {"value": 0.48, "unit": "%", "status": "Low"},
                "EC": {"value": 0.42, "unit": "dS/m", "status": "Normal"},
                "Zn": {"value": 0.58, "unit": "ppm", "status": "Deficient"},
                "Fe": {"value": 3.8, "unit": "ppm", "status": "Sufficient"},
                "Mn": {"value": 5.5, "unit": "ppm", "status": "Sufficient"},
                "Cu": {"value": 1.0, "unit": "ppm", "status": "Sufficient"}
            },
            "dominant_crops": ["Wheat", "Rice"],
            "source": "SHC Portal 2024",
            "sampling_year": 2024,
            "samples_count": 12800,
            "last_updated": datetime.now()
        },
        
        # ==================== HARYANA ====================
        {
            "state": "Haryana",
            "district": "Karnal",
            "zone": "Trans-Gangetic Plains",
            "soil_type": "Alluvial",
            "parameters": {
                "N": {"value": 252, "unit": "kg/ha", "status": "Medium"},
                "P": {"value": 21.3, "unit": "kg/ha", "status": "High"},
                "K": {"value": 178, "unit": "kg/ha", "status": "Medium"},
                "pH": {"value": 7.6, "status": "Slightly alkaline"},
                "OC": {"value": 0.58, "unit": "%", "status": "Medium"},
                "EC": {"value": 0.38, "unit": "dS/m", "status": "Normal"},
                "Zn": {"value": 0.71, "unit": "ppm", "status": "Marginal"},
                "Fe": {"value": 4.5, "unit": "ppm", "status": "Sufficient"},
                "Mn": {"value": 7.2, "unit": "ppm", "status": "Sufficient"},
                "Cu": {"value": 1.3, "unit": "ppm", "status": "Sufficient"}
            },
            "dominant_crops": ["Wheat", "Rice", "Sugarcane"],
            "source": "SHC Portal 2024",
            "sampling_year": 2024,
            "samples_count": 9800,
            "last_updated": datetime.now()
        },
        {
            "state": "Haryana",
            "district": "Hisar",
            "zone": "Western Plains",
            "soil_type": "Sandy loam",
            "parameters": {
                "N": {"value": 198, "unit": "kg/ha", "status": "Low"},
                "P": {"value": 12.5, "unit": "kg/ha", "status": "Low"},
                "K": {"value": 142, "unit": "kg/ha", "status": "Low"},
                "pH": {"value": 8.3, "status": "Moderately alkaline"},
                "OC": {"value": 0.35, "unit": "%", "status": "Low"},
                "EC": {"value": 0.62, "unit": "dS/m", "status": "Normal"},
                "Zn": {"value": 0.48, "unit": "ppm", "status": "Deficient"},
                "Fe": {"value": 3.2, "unit": "ppm", "status": "Marginal"},
                "Mn": {"value": 4.8, "unit": "ppm", "status": "Sufficient"},
                "Cu": {"value": 0.9, "unit": "ppm", "status": "Sufficient"}
            },
            "dominant_crops": ["Wheat", "Cotton", "Mustard"],
            "source": "SHC Portal 2024",
            "sampling_year": 2024,
            "samples_count": 8500,
            "last_updated": datetime.now()
        },
        
        # ==================== UTTAR PRADESH ====================
        {
            "state": "Uttar Pradesh",
            "district": "Meerut",
            "zone": "Western Plains",
            "soil_type": "Alluvial",
            "parameters": {
                "N": {"value": 268, "unit": "kg/ha", "status": "Medium"},
                "P": {"value": 24.5, "unit": "kg/ha", "status": "High"},
                "K": {"value": 188, "unit": "kg/ha", "status": "Medium"},
                "pH": {"value": 7.4, "status": "Neutral"},
                "OC": {"value": 0.64, "unit": "%", "status": "Medium"},
                "EC": {"value": 0.42, "unit": "dS/m", "status": "Normal"},
                "Zn": {"value": 0.82, "unit": "ppm", "status": "Sufficient"},
                "Fe": {"value": 5.1, "unit": "ppm", "status": "Sufficient"},
                "Mn": {"value": 8.4, "unit": "ppm", "status": "Sufficient"},
                "Cu": {"value": 1.5, "unit": "ppm", "status": "Sufficient"}
            },
            "dominant_crops": ["Wheat", "Sugarcane", "Rice"],
            "source": "SHC Portal 2024",
            "sampling_year": 2024,
            "samples_count": 18500,
            "last_updated": datetime.now()
        },
        {
            "state": "Uttar Pradesh",
            "district": "Gorakhpur",
            "zone": "Eastern Plains",
            "soil_type": "Alluvial",
            "parameters": {
                "N": {"value": 285, "unit": "kg/ha", "status": "High"},
                "P": {"value": 19.8, "unit": "kg/ha", "status": "Medium"},
                "K": {"value": 175, "unit": "kg/ha", "status": "Medium"},
                "pH": {"value": 6.8, "status": "Neutral"},
                "OC": {"value": 0.72, "unit": "%", "status": "High"},
                "EC": {"value": 0.28, "unit": "dS/m", "status": "Normal"},
                "Zn": {"value": 0.68, "unit": "ppm", "status": "Marginal"},
                "Fe": {"value": 4.8, "unit": "ppm", "status": "Sufficient"},
                "Mn": {"value": 7.6, "unit": "ppm", "status": "Sufficient"},
                "Cu": {"value": 1.4, "unit": "ppm", "status": "Sufficient"}
            },
            "dominant_crops": ["Rice", "Wheat", "Sugarcane"],
            "source": "SHC Portal 2024",
            "sampling_year": 2024,
            "samples_count": 14200,
            "last_updated": datetime.now()
        },
        
        # ==================== MAHARASHTRA ====================
        {
            "state": "Maharashtra",
            "district": "Nagpur",
            "zone": "Vidarbha",
            "soil_type": "Black (Vertisol)",
            "parameters": {
                "N": {"value": 212, "unit": "kg/ha", "status": "Low"},
                "P": {"value": 14.2, "unit": "kg/ha", "status": "Low"},
                "K": {"value": 358, "unit": "kg/ha", "status": "High"},
                "pH": {"value": 7.9, "status": "Slightly alkaline"},
                "OC": {"value": 0.48, "unit": "%", "status": "Low"},
                "EC": {"value": 0.32, "unit": "dS/m", "status": "Normal"},
                "Zn": {"value": 0.52, "unit": "ppm", "status": "Deficient"},
                "Fe": {"value": 3.5, "unit": "ppm", "status": "Marginal"},
                "Mn": {"value": 6.2, "unit": "ppm", "status": "Sufficient"},
                "Cu": {"value": 1.1, "unit": "ppm", "status": "Sufficient"}
            },
            "dominant_crops": ["Cotton", "Soybean", "Orange"],
            "source": "SHC Portal 2024",
            "sampling_year": 2024,
            "samples_count": 16800,
            "last_updated": datetime.now()
        },
        {
            "state": "Maharashtra",
            "district": "Pune",
            "zone": "Western Maharashtra",
            "soil_type": "Medium Black",
            "parameters": {
                "N": {"value": 225, "unit": "kg/ha", "status": "Medium"},
                "P": {"value": 16.8, "unit": "kg/ha", "status": "Medium"},
                "K": {"value": 385, "unit": "kg/ha", "status": "High"},
                "pH": {"value": 7.6, "status": "Slightly alkaline"},
                "OC": {"value": 0.55, "unit": "%", "status": "Medium"},
                "EC": {"value": 0.36, "unit": "dS/m", "status": "Normal"},
                "Zn": {"value": 0.64, "unit": "ppm", "status": "Marginal"},
                "Fe": {"value": 4.1, "unit": "ppm", "status": "Sufficient"},
                "Mn": {"value": 6.9, "unit": "ppm", "status": "Sufficient"},
                "Cu": {"value": 1.2, "unit": "ppm", "status": "Sufficient"}
            },
            "dominant_crops": ["Sugarcane", "Wheat", "Vegetables"],
            "source": "SHC Portal 2024",
            "sampling_year": 2024,
            "samples_count": 12400,
            "last_updated": datetime.now()
        },
        
        # ==================== GUJARAT ====================
        {
            "state": "Gujarat",
            "district": "Ahmedabad",
            "zone": "North Gujarat",
            "soil_type": "Sandy loam",
            "parameters": {
                "N": {"value": 188, "unit": "kg/ha", "status": "Low"},
                "P": {"value": 11.5, "unit": "kg/ha", "status": "Low"},
                "K": {"value": 175, "unit": "kg/ha", "status": "Medium"},
                "pH": {"value": 7.8, "status": "Slightly alkaline"},
                "OC": {"value": 0.42, "unit": "%", "status": "Low"},
                "EC": {"value": 0.48, "unit": "dS/m", "status": "Normal"},
                "Zn": {"value": 0.45, "unit": "ppm", "status": "Deficient"},
                "Fe": {"value": 3.6, "unit": "ppm", "status": "Marginal"},
                "Mn": {"value": 5.2, "unit": "ppm", "status": "Sufficient"},
                "Cu": {"value": 0.95, "unit": "ppm", "status": "Sufficient"}
            },
            "dominant_crops": ["Cotton", "Wheat", "Tobacco"],
            "source": "SHC Portal 2024",
            "sampling_year": 2024,
            "samples_count": 9200,
            "last_updated": datetime.now()
        },
        {
            "state": "Gujarat",
            "district": "Surat",
            "zone": "South Gujarat",
            "soil_type": "Alluvial",
            "parameters": {
                "N": {"value": 242, "unit": "kg/ha", "status": "Medium"},
                "P": {"value": 18.4, "unit": "kg/ha", "status": "Medium"},
                "K": {"value": 195, "unit": "kg/ha", "status": "Medium"},
                "pH": {"value": 7.2, "status": "Neutral"},
                "OC": {"value": 0.68, "unit": "%", "status": "Medium"},
                "EC": {"value": 0.38, "unit": "dS/m", "status": "Normal"},
                "Zn": {"value": 0.72, "unit": "ppm", "status": "Marginal"},
                "Fe": {"value": 4.8, "unit": "ppm", "status": "Sufficient"},
                "Mn": {"value": 7.4, "unit": "ppm", "status": "Sufficient"},
                "Cu": {"value": 1.3, "unit": "ppm", "status": "Sufficient"}
            },
            "dominant_crops": ["Sugarcane", "Rice", "Vegetables"],
            "source": "SHC Portal 2024",
            "sampling_year": 2024,
            "samples_count": 8800,
            "last_updated": datetime.now()
        },
        
        # ==================== MADHYA PRADESH ====================
        {
            "state": "Madhya Pradesh",
            "district": "Indore",
            "zone": "Malwa Plateau",
            "soil_type": "Medium Black",
            "parameters": {
                "N": {"value": 218, "unit": "kg/ha", "status": "Medium"},
                "P": {"value": 13.8, "unit": "kg/ha", "status": "Low"},
                "K": {"value": 342, "unit": "kg/ha", "status": "High"},
                "pH": {"value": 7.7, "status": "Slightly alkaline"},
                "OC": {"value": 0.51, "unit": "%", "status": "Medium"},
                "EC": {"value": 0.34, "unit": "dS/m", "status": "Normal"},
                "Zn": {"value": 0.58, "unit": "ppm", "status": "Deficient"},
                "Fe": {"value": 3.9, "unit": "ppm", "status": "Sufficient"},
                "Mn": {"value": 6.5, "unit": "ppm", "status": "Sufficient"},
                "Cu": {"value": 1.15, "unit": "ppm", "status": "Sufficient"}
            },
            "dominant_crops": ["Soybean", "Wheat", "Cotton"],
            "source": "SHC Portal 2024",
            "sampling_year": 2024,
            "samples_count": 11200,
            "last_updated": datetime.now()
        },
        {
            "state": "Madhya Pradesh",
            "district": "Jabalpur",
            "zone": "Kymore Plateau",
            "soil_type": "Black",
            "parameters": {
                "N": {"value": 205, "unit": "kg/ha", "status": "Low"},
                "P": {"value": 12.2, "unit": "kg/ha", "status": "Low"},
                "K": {"value": 325, "unit": "kg/ha", "status": "High"},
                "pH": {"value": 7.5, "status": "Slightly alkaline"},
                "OC": {"value": 0.46, "unit": "%", "status": "Low"},
                "EC": {"value": 0.29, "unit": "dS/m", "status": "Normal"},
                "Zn": {"value": 0.51, "unit": "ppm", "status": "Deficient"},
                "Fe": {"value": 3.4, "unit": "ppm", "status": "Marginal"},
                "Mn": {"value": 5.8, "unit": "ppm", "status": "Sufficient"},
                "Cu": {"value": 1.0, "unit": "ppm", "status": "Sufficient"}
            },
            "dominant_crops": ["Rice", "Wheat", "Pulses"],
            "source": "SHC Portal 2024",
            "sampling_year": 2024,
            "samples_count": 9600,
            "last_updated": datetime.now()
        },
        
        # ==================== RAJASTHAN ====================
        {
            "state": "Rajasthan",
            "district": "Jaipur",
            "zone": "Eastern Rajasthan",
            "soil_type": "Sandy loam",
            "parameters": {
                "N": {"value": 175, "unit": "kg/ha", "status": "Low"},
                "P": {"value": 9.8, "unit": "kg/ha", "status": "Low"},
                "K": {"value": 158, "unit": "kg/ha", "status": "Low"},
                "pH": {"value": 8.1, "status": "Moderately alkaline"},
                "OC": {"value": 0.32, "unit": "%", "status": "Low"},
                "EC": {"value": 0.52, "unit": "dS/m", "status": "Normal"},
                "Zn": {"value": 0.42, "unit": "ppm", "status": "Deficient"},
                "Fe": {"value": 2.8, "unit": "ppm", "status": "Marginal"},
                "Mn": {"value": 4.2, "unit": "ppm", "status": "Marginal"},
                "Cu": {"value": 0.85, "unit": "ppm", "status": "Sufficient"}
            },
            "dominant_crops": ["Wheat", "Mustard", "Gram"],
            "source": "SHC Portal 2024",
            "sampling_year": 2024,
            "samples_count": 10500,
            "last_updated": datetime.now()
        },
        {
            "state": "Rajasthan",
            "district": "Kota",
            "zone": "Hadoti Region",
            "soil_type": "Medium Black",
            "parameters": {
                "N": {"value": 195, "unit": "kg/ha", "status": "Low"},
                "P": {"value": 11.5, "unit": "kg/ha", "status": "Low"},
                "K": {"value": 298, "unit": "kg/ha", "status": "High"},
                "pH": {"value": 7.8, "status": "Slightly alkaline"},
                "OC": {"value": 0.44, "unit": "%", "status": "Low"},
                "EC": {"value": 0.38, "unit": "dS/m", "status": "Normal"},
                "Zn": {"value": 0.54, "unit": "ppm", "status": "Deficient"},
                "Fe": {"value": 3.5, "unit": "ppm", "status": "Marginal"},
                "Mn": {"value": 5.6, "unit": "ppm", "status": "Sufficient"},
                "Cu": {"value": 1.05, "unit": "ppm", "status": "Sufficient"}
            },
            "dominant_crops": ["Soybean", "Coriander", "Wheat"],
            "source": "SHC Portal 2024",
            "sampling_year": 2024,
            "samples_count": 8200,
            "last_updated": datetime.now()
        },
        
        # ==================== TAMIL NADU ====================
        {
            "state": "Tamil Nadu",
            "district": "Coimbatore",
            "zone": "Western Zone",
            "soil_type": "Red loam",
            "parameters": {
                "N": {"value": 232, "unit": "kg/ha", "status": "Medium"},
                "P": {"value": 15.4, "unit": "kg/ha", "status": "Medium"},
                "K": {"value": 168, "unit": "kg/ha", "status": "Low"},
                "pH": {"value": 6.5, "status": "Slightly acidic"},
                "OC": {"value": 0.62, "unit": "%", "status": "Medium"},
                "EC": {"value": 0.24, "unit": "dS/m", "status": "Normal"},
                "Zn": {"value": 0.75, "unit": "ppm", "status": "Marginal"},
                "Fe": {"value": 5.8, "unit": "ppm", "status": "Sufficient"},
                "Mn": {"value": 8.2, "unit": "ppm", "status": "Sufficient"},
                "Cu": {"value": 1.6, "unit": "ppm", "status": "Sufficient"}
            },
            "dominant_crops": ["Cotton", "Turmeric", "Maize"],
            "source": "SHC Portal 2024",
            "sampling_year": 2024,
            "samples_count": 10800,
            "last_updated": datetime.now()
        },
        {
            "state": "Tamil Nadu",
            "district": "Thanjavur",
            "zone": "Cauvery Delta",
            "soil_type": "Alluvial",
            "parameters": {
                "N": {"value": 265, "unit": "kg/ha", "status": "Medium"},
                "P": {"value": 22.6, "unit": "kg/ha", "status": "High"},
                "K": {"value": 195, "unit": "kg/ha", "status": "Medium"},
                "pH": {"value": 7.2, "status": "Neutral"},
                "OC": {"value": 0.78, "unit": "%", "status": "High"},
                "EC": {"value": 0.32, "unit": "dS/m", "status": "Normal"},
                "Zn": {"value": 0.88, "unit": "ppm", "status": "Sufficient"},
                "Fe": {"value": 6.2, "unit": "ppm", "status": "Sufficient"},
                "Mn": {"value": 9.4, "unit": "ppm", "status": "Sufficient"},
                "Cu": {"value": 1.8, "unit": "ppm", "status": "Sufficient"}
            },
            "dominant_crops": ["Rice", "Sugarcane", "Groundnut"],
            "source": "SHC Portal 2024",
            "sampling_year": 2024,
            "samples_count": 14600,
            "last_updated": datetime.now()
        },
        
        # ==================== KARNATAKA ====================
        {
            "state": "Karnataka",
            "district": "Belgaum",
            "zone": "North Karnataka",
            "soil_type": "Red",
            "parameters": {
                "N": {"value": 215, "unit": "kg/ha", "status": "Medium"},
                "P": {"value": 13.2, "unit": "kg/ha", "status": "Low"},
                "K": {"value": 182, "unit": "kg/ha", "status": "Medium"},
                "pH": {"value": 6.8, "status": "Neutral"},
                "OC": {"value": 0.54, "unit": "%", "status": "Medium"},
                "EC": {"value": 0.28, "unit": "dS/m", "status": "Normal"},
                "Zn": {"value": 0.68, "unit": "ppm", "status": "Marginal"},
                "Fe": {"value": 5.2, "unit": "ppm", "status": "Sufficient"},
                "Mn": {"value": 7.8, "unit": "ppm", "status": "Sufficient"},
                "Cu": {"value": 1.4, "unit": "ppm", "status": "Sufficient"}
            },
            "dominant_crops": ["Sugarcane", "Jowar", "Groundnut"],
            "source": "SHC Portal 2024",
            "sampling_year": 2024,
            "samples_count": 9400,
            "last_updated": datetime.now()
        },
        {
            "state": "Karnataka",
            "district": "Mysuru",
            "zone": "Southern Dry Zone",
            "soil_type": "Red sandy loam",
            "parameters": {
                "N": {"value": 208, "unit": "kg/ha", "status": "Low"},
                "P": {"value": 11.8, "unit": "kg/ha", "status": "Low"},
                "K": {"value": 165, "unit": "kg/ha", "status": "Low"},
                "pH": {"value": 6.2, "status": "Slightly acidic"},
                "OC": {"value": 0.48, "unit": "%", "status": "Low"},
                "EC": {"value": 0.22, "unit": "dS/m", "status": "Normal"},
                "Zn": {"value": 0.62, "unit": "ppm", "status": "Deficient"},
                "Fe": {"value": 4.8, "unit": "ppm", "status": "Sufficient"},
                "Mn": {"value": 7.2, "unit": "ppm", "status": "Sufficient"},
                "Cu": {"value": 1.25, "unit": "ppm", "status": "Sufficient"}
            },
            "dominant_crops": ["Ragi", "Maize", "Vegetables"],
            "source": "SHC Portal 2024",
            "sampling_year": 2024,
            "samples_count": 8600,
            "last_updated": datetime.now()
        },
        
        # ==================== ANDHRA PRADESH ====================
        {
            "state": "Andhra Pradesh",
            "district": "Krishna",
            "zone": "Krishna-Godavari Zone",
            "soil_type": "Alluvial",
            "parameters": {
                "N": {"value": 258, "unit": "kg/ha", "status": "Medium"},
                "P": {"value": 20.5, "unit": "kg/ha", "status": "High"},
                "K": {"value": 198, "unit": "kg/ha", "status": "Medium"},
                "pH": {"value": 7.4, "status": "Neutral"},
                "OC": {"value": 0.72, "unit": "%", "status": "High"},
                "EC": {"value": 0.36, "unit": "dS/m", "status": "Normal"},
                "Zn": {"value": 0.82, "unit": "ppm", "status": "Sufficient"},
                "Fe": {"value": 5.6, "unit": "ppm", "status": "Sufficient"},
                "Mn": {"value": 8.8, "unit": "ppm", "status": "Sufficient"},
                "Cu": {"value": 1.7, "unit": "ppm", "status": "Sufficient"}
            },
            "dominant_crops": ["Rice", "Sugarcane", "Turmeric"],
            "source": "SHC Portal 2024",
            "sampling_year": 2024,
            "samples_count": 13200,
            "last_updated": datetime.now()
        },
        {
            "state": "Andhra Pradesh",
            "district": "Anantapur",
            "zone": "Scarce Rainfall Zone",
            "soil_type": "Red sandy",
            "parameters": {
                "N": {"value": 168, "unit": "kg/ha", "status": "Low"},
                "P": {"value": 8.5, "unit": "kg/ha", "status": "Low"},
                "K": {"value": 145, "unit": "kg/ha", "status": "Low"},
                "pH": {"value": 6.5, "status": "Slightly acidic"},
                "OC": {"value": 0.28, "unit": "%", "status": "Low"},
                "EC": {"value": 0.18, "unit": "dS/m", "status": "Normal"},
                "Zn": {"value": 0.38, "unit": "ppm", "status": "Deficient"},
                "Fe": {"value": 3.2, "unit": "ppm", "status": "Marginal"},
                "Mn": {"value": 4.5, "unit": "ppm", "status": "Marginal"},
                "Cu": {"value": 0.82, "unit": "ppm", "status": "Sufficient"}
            },
            "dominant_crops": ["Groundnut", "Millets", "Pulses"],
            "source": "SHC Portal 2024",
            "sampling_year": 2024,
            "samples_count": 11800,
            "last_updated": datetime.now()
        },
        
        # ==================== TELANGANA ====================
        {
            "state": "Telangana",
            "district": "Warangal",
            "zone": "Central Telangana",
            "soil_type": "Red sandy loam",
            "parameters": {
                "N": {"value": 195, "unit": "kg/ha", "status": "Low"},
                "P": {"value": 10.8, "unit": "kg/ha", "status": "Low"},
                "K": {"value": 172, "unit": "kg/ha", "status": "Medium"},
                "pH": {"value": 6.9, "status": "Neutral"},
                "OC": {"value": 0.44, "unit": "%", "status": "Low"},
                "EC": {"value": 0.26, "unit": "dS/m", "status": "Normal"},
                "Zn": {"value": 0.55, "unit": "ppm", "status": "Deficient"},
                "Fe": {"value": 4.2, "unit": "ppm", "status": "Sufficient"},
                "Mn": {"value": 6.4, "unit": "ppm", "status": "Sufficient"},
                "Cu": {"value": 1.1, "unit": "ppm", "status": "Sufficient"}
            },
            "dominant_crops": ["Cotton", "Rice", "Maize"],
            "source": "SHC Portal 2024",
            "sampling_year": 2024,
            "samples_count": 10200,
            "last_updated": datetime.now()
        },
        
        # ==================== WEST BENGAL ====================
        {
            "state": "West Bengal",
            "district": "Hooghly",
            "zone": "Gangetic Alluvial",
            "soil_type": "Alluvial",
            "parameters": {
                "N": {"value": 278, "unit": "kg/ha", "status": "High"},
                "P": {"value": 23.2, "unit": "kg/ha", "status": "High"},
                "K": {"value": 185, "unit": "kg/ha", "status": "Medium"},
                "pH": {"value": 6.8, "status": "Neutral"},
                "OC": {"value": 0.82, "unit": "%", "status": "High"},
                "EC": {"value": 0.32, "unit": "dS/m", "status": "Normal"},
                "Zn": {"value": 0.78, "unit": "ppm", "status": "Marginal"},
                "Fe": {"value": 5.4, "unit": "ppm", "status": "Sufficient"},
                "Mn": {"value": 8.6, "unit": "ppm", "status": "Sufficient"},
                "Cu": {"value": 1.6, "unit": "ppm", "status": "Sufficient"}
            },
            "dominant_crops": ["Rice", "Jute", "Potato"],
            "source": "SHC Portal 2024",
            "sampling_year": 2024,
            "samples_count": 15800,
            "last_updated": datetime.now()
        },
        {
            "state": "West Bengal",
            "district": "Bardhaman",
            "zone": "Gangetic Alluvial",
            "soil_type": "Alluvial",
            "parameters": {
                "N": {"value": 272, "unit": "kg/ha", "status": "High"},
                "P": {"value": 21.8, "unit": "kg/ha", "status": "High"},
                "K": {"value": 192, "unit": "kg/ha", "status": "Medium"},
                "pH": {"value": 7.0, "status": "Neutral"},
                "OC": {"value": 0.76, "unit": "%", "status": "High"},
                "EC": {"value": 0.34, "unit": "dS/m", "status": "Normal"},
                "Zn": {"value": 0.72, "unit": "ppm", "status": "Marginal"},
                "Fe": {"value": 5.2, "unit": "ppm", "status": "Sufficient"},
                "Mn": {"value": 8.2, "unit": "ppm", "status": "Sufficient"},
                "Cu": {"value": 1.55, "unit": "ppm", "status": "Sufficient"}
            },
            "dominant_crops": ["Rice", "Wheat", "Potato"],
            "source": "SHC Portal 2024",
            "sampling_year": 2024,
            "samples_count": 14400,
            "last_updated": datetime.now()
        },
        
        # ==================== BIHAR ====================
        {
            "state": "Bihar",
            "district": "Patna",
            "zone": "North Gangetic Plains",
            "soil_type": "Alluvial",
            "parameters": {
                "N": {"value": 262, "unit": "kg/ha", "status": "Medium"},
                "P": {"value": 18.5, "unit": "kg/ha", "status": "Medium"},
                "K": {"value": 178, "unit": "kg/ha", "status": "Medium"},
                "pH": {"value": 7.2, "status": "Neutral"},
                "OC": {"value": 0.68, "unit": "%", "status": "Medium"},
                "EC": {"value": 0.38, "unit": "dS/m", "status": "Normal"},
                "Zn": {"value": 0.65, "unit": "ppm", "status": "Marginal"},
                "Fe": {"value": 4.6, "unit": "ppm", "status": "Sufficient"},
                "Mn": {"value": 7.4, "unit": "ppm", "status": "Sufficient"},
                "Cu": {"value": 1.3, "unit": "ppm", "status": "Sufficient"}
            },
            "dominant_crops": ["Rice", "Wheat", "Maize"],
            "source": "SHC Portal 2024",
            "sampling_year": 2024,
            "samples_count": 16200,
            "last_updated": datetime.now()
        },
        {
            "state": "Bihar",
            "district": "Muzaffarpur",
            "zone": "North Gangetic Plains",
            "soil_type": "Alluvial",
            "parameters": {
                "N": {"value": 268, "unit": "kg/ha", "status": "Medium"},
                "P": {"value": 19.2, "unit": "kg/ha", "status": "Medium"},
                "K": {"value": 182, "unit": "kg/ha", "status": "Medium"},
                "pH": {"value": 7.1, "status": "Neutral"},
                "OC": {"value": 0.72, "unit": "%", "status": "High"},
                "EC": {"value": 0.35, "unit": "dS/m", "status": "Normal"},
                "Zn": {"value": 0.68, "unit": "ppm", "status": "Marginal"},
                "Fe": {"value": 4.9, "unit": "ppm", "status": "Sufficient"},
                "Mn": {"value": 7.8, "unit": "ppm", "status": "Sufficient"},
                "Cu": {"value": 1.4, "unit": "ppm", "status": "Sufficient"}
            },
            "dominant_crops": ["Rice", "Wheat", "Litchi"],
            "source": "SHC Portal 2024",
            "sampling_year": 2024,
            "samples_count": 13800,
            "last_updated": datetime.now()
        },
    ]
    
    return baseline_data


def main():
    print("="*80)
    print("SOIL BASELINE DATA INGESTION")
    print("="*80)
    
    db = get_db()
    coll = db.soil_baseline
    
    # Clear existing data
    print("\n[1] Clearing existing soil_baseline collection...")
    result = coll.delete_many({})
    print(f"    Deleted {result.deleted_count} old records")
    
    # Get comprehensive baseline data
    print("\n[2] Loading comprehensive soil baseline data...")
    baseline = get_soil_baseline_data()
    print(f"    Prepared {len(baseline)} district samples")
    
    # Insert to MongoDB
    print("\n[3] Inserting into MongoDB...")
    for record in baseline:
        coll.insert_one(record)
    
    print(f"    ✓ Inserted {len(baseline)} records")
    
    # Create indexes
    print("\n[4] Creating indexes...")
    try:
        coll.drop_indexes()
    except:
        pass
    
    coll.create_index("state")
    coll.create_index("district")
    coll.create_index("zone")
    coll.create_index("soil_type")
    coll.create_index([("state", 1), ("district", 1)], unique=True)
    print("    ✓ Indexes created")
    
    # Export to JSON
    print("\n[5] Exporting to JSON...")
    output_path = Path(__file__).parent / "data" / "soil_baseline_comprehensive.json"
    output_path.parent.mkdir(exist_ok=True)
    
    # Convert datetime to ISO format for JSON, exclude _id
    export_data = []
    for record in baseline:
        rec_copy = record.copy()
        # Remove _id if present (not serializable)
        rec_copy.pop('_id', None)
        if 'last_updated' in rec_copy:
            rec_copy['last_updated'] = rec_copy['last_updated'].isoformat()
        export_data.append(rec_copy)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(export_data, f, indent=2, ensure_ascii=False)
    
    print(f"    ✓ Exported to: {output_path}")
    
    # Summary
    total = coll.count_documents({})
    print("\n" + "="*80)
    print("✅ SOIL BASELINE INGESTION COMPLETE")
    print("="*80)
    print(f"Total districts in database: {total}")
    
    # Breakdown by state
    print("\nBreakdown by state:")
    states = coll.distinct("state")
    for state in sorted(states):
        count = coll.count_documents({"state": state})
        print(f"  • {state:20s}: {count:2d} districts")
    
    # Micronutrient deficiency summary
    print("\n📊 Zinc deficiency prevalence:")
    zn_deficient = coll.count_documents({"parameters.Zn.status": "Deficient"})
    zn_marginal = coll.count_documents({"parameters.Zn.status": "Marginal"})
    print(f"  • Deficient: {zn_deficient} districts")
    print(f"  • Marginal:  {zn_marginal} districts")
    
    # Sample records
    print("\n📋 Sample soil baseline records:")
    for doc in coll.find().limit(3):
        N = doc['parameters']['N']['value']
        P = doc['parameters']['P']['value']
        K = doc['parameters']['K']['value']
        pH = doc['parameters']['pH']['value']
        print(f"  • {doc['state']:15s} - {doc['district']:12s} → N:{N} P:{P} K:{K} pH:{pH}")
    
    print("\n" + "="*80)


if __name__ == "__main__":
    main()
