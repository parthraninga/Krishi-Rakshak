#!/usr/bin/env python3
"""
Debug page 2 specifically
"""
import pdfplumber

pdf_path = "scripts/data/pesticides_pdfs/pesticides_registered_30.10.2025.pdf"

with pdfplumber.open(pdf_path) as pdf:
    page = pdf.pages[1]  # Page 2
    tables = page.extract_tables()
    table = tables[0]
    
    print("PAGE 2 - First Row Analysis:")
    print("="*80)
    
    sample_row = table[0]
    print(f"Row content: {sample_row}")
    print(f"Total elements: {len(sample_row)}")
    
    # Count actual non-None/non-empty columns
    actual_cols = len([c for c in sample_row if c is not None])
    print(f"Non-None columns: {actual_cols}")
    
    col0 = str(sample_row[0]).strip() if sample_row[0] else ""
    col1 = str(sample_row[1]).strip() if len(sample_row) > 1 and sample_row[1] else ""
    
    print(f"\nColumn 0: '{col0}'")
    print(f"  Is digit? {col0.isdigit()}")
    
    print(f"\nColumn 1: '{col1}'")
    print(f"  Is digit? {col1.isdigit()}")
    print(f"  Length: {len(col1)}")
    print(f"  Length > 5? {len(col1) > 5}")
    
    # Check detection logic
    if actual_cols <= 3:
        print(f"\n✓ actual_cols ({actual_cols}) <= 3")
        
        if col0.isdigit():
            print(f"✓ col0.isdigit() = True")
        else:
            print(f"✗ col0.isdigit() = False")
        
        if col1 and not col1.isdigit() and len(col1) > 5:
            print(f"✓ col1 valid: not empty, not digit, length > 5")
        else:
            print(f"✗ col1 check failed")
    else:
        print(f"\n✗ actual_cols ({actual_cols}) > 3 - REJECTED")
