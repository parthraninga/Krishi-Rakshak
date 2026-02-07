#!/usr/bin/env python3
"""
Debug PDF parser - see what columns are being detected
"""
import pdfplumber
import re

pdf_path = "scripts/data/pesticides_pdfs/pesticides_registered_30.10.2025.pdf"

def find_column_index(header, keywords):
    """Find column index by keyword match"""
    if not header:
        return None
    
    for i, cell in enumerate(header):
        if not cell:
            continue
        
        cell_lower = str(cell).lower().strip()
        for keyword in keywords:
            if keyword.lower() in cell_lower:
                print(f"  ** MATCH: Column {i} '{cell}' matches keyword '{keyword}'")
                return i
    
    return None

with pdfplumber.open(pdf_path) as pdf:
    page = pdf.pages[0]  # First page
    tables = page.extract_tables()
    
    if tables:
        table = tables[0]
        header = table[0]
        
        print("="*80)
        print(f"HEADER ROW: {len(header)} columns")
        print("="*80)
        for i, cell in enumerate(header):
            print(f"Column {i}: '{cell}'")
        
        print("\n" + "="*80)
        print("COLUMN DETECTION")
        print("="*80)
        
        reg_col = find_column_index(header, ['s. no', 's.no', 'serial', 'reg', 'registration', 'reg.no', 'cir'])
        name_col = find_column_index(header, ['formulation', 'product', 'name', 'pesticide', 'trade'])
        ai_col = find_column_index(header, ['active', 'a.i', 'ingredient', 'technical'])
        
        print(f"\nDetected:")
        print(f"  reg_col = {reg_col}")
        print(f"  name_col = {name_col}")
        print(f"  ai_col = {ai_col}")
        
        is_simple = (len(header) <= 3 and reg_col is not None and name_col is not None and ai_col is None)
        print(f"\nIs simple format? {is_simple}")
        print(f"  len(header) = {len(header)} <= 3? {len(header) <= 3}")
        print(f"  reg_col is not None? {reg_col is not None}")
        print(f"  name_col is not None? {name_col is not None}")
        print(f"  ai_col is None? {ai_col is None}")
        
        print("\n" + "="*80)
        print("FIRST 5 DATA ROWS")
        print("="*80)
        for i, row in enumerate(table[1:6], 1):
            print(f"\nRow {i}: {len(row)} cells")
            for j, cell in enumerate(row):
                print(f"  Col {j}: '{cell}'")
            
            if is_simple and name_col is not None and name_col < len(row):
                formulation_str = str(row[name_col]).strip() if row[name_col] else ""
                print(f"  >> Would extract formulation_str = '{formulation_str}'")
