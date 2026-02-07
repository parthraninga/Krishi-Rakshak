#!/usr/bin/env python3
"""
Debug header detection on page 2
"""
import pdfplumber

pdf_path = "scripts/data/pesticides_pdfs/pesticides_registered_30.10.2025.pdf"

with pdfplumber.open(pdf_path) as pdf:
    page = pdf.pages[1]  # Page 2 (index 1)
    tables = page.extract_tables()
    table = tables[0]
    
    print("="*80)
    print("PAGE 2 - TABLE ANALYSIS")
    print("="*80)
    print(f"\nTotal rows in table: {len(table)}\n")
    
    # Simulate header detection logic
    print("Header detection simulation:")
    print("-" * 80)
    
    for i, row in enumerate(table[:5]):  # Check first 5 rows
        if not row:
            print(f"Row {i}: None - SKIP")
            continue
        
        non_empty = [cell for cell in row if cell and str(cell).strip()]
        print(f"\nRow {i}: {len(non_empty)} non-empty cells")
        print(f"  Content: {row}")
        
        if len(non_empty) < 2:
            print(f"  >> REJECT: Less than 2 non-empty cells")
            continue
        
        # Check if this looks like a header row
        row_text = ' '.join([str(cell).lower() for cell in row if cell])
        header_keywords = ['s. no', 's.no', 'serial', 'formulation', 'registered', 
                         'product', 'name', 'active', 'ingredient', 'manufacturer']
        
        matches = [keyword for keyword in header_keywords if keyword in row_text]
        
        if matches:
            print(f"  >> HEADER FOUND! Matches: {matches}")
            print(f"  >> header_row_idx would be set to {i}")
            break
        else:
            print(f"  >> Not header (no keyword matches)")
    
    print("\n" + "="*80)
    print(f"If no header found in first 5 rows, header_row_idx = 0 (default)")
