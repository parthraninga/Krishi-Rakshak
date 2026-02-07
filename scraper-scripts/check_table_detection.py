#!/usr/bin/env python3
"""
Check table detection - are we missing tables?
"""
import pdfplumber

pdf_path = "scripts/data/pesticides_pdfs/pesticides_registered_30.10.2025.pdf"

print("Checking table detection across all 27 pages:")
print("="*80)

with pdfplumber.open(pdf_path) as pdf:
    total_tables = 0
    total_rows = 0
    
    for page_num, page in enumerate(pdf.pages):
        tables = page.extract_tables()
        
        page_rows = sum(len(table) for table in tables)
        total_tables += len(tables)
        total_rows += page_rows
        
        # Show summary for each page
        print(f"Page {page_num+1:2d}: {len(tables)} tables, {page_rows:3d} rows")
        
    print("="*80)
    print(f"TOTAL: {total_tables} tables, {total_rows} rows")
    print(f"\nExpected ~1000+ formulations if all rows were extracted")
    print(f"Currently extracting {total_rows} rows from PDFplumber")
