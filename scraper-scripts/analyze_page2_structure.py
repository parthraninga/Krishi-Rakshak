#!/usr/bin/env python3
"""
Analyze page 2 structure - why only 2 entries from 44 rows?
"""
import pdfplumber

pdf_path = "scripts/data/pesticides_pdfs/pesticides_registered_30.10.2025.pdf"

with pdfplumber.open(pdf_path) as pdf:
    page = pdf.pages[1]  # Page 2
    tables = page.extract_tables()
    table = tables[0]
    
    print(f"PAGE 2: {len(table)} rows")
    print("="*80)
    print("\nFirst 10 rows structure:")
    print("-"*80)
    
    for i, row in enumerate(table[:10]):
        # Count non-None cells
        non_none = [cell for cell in row if cell is not None]
        
        # Show structure
        print(f"\nRow {i}: {len(non_none)} non-None cells")
        for col_idx, cell in enumerate(row):
            if cell is not None:
                print(f"  Col {col_idx}: '{cell}'")
