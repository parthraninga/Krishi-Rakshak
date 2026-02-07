#!/usr/bin/env python3
"""
Diagnose PDF table structure to fix parser
"""
import pdfplumber

pdf_path = "scripts/data/pesticides_pdfs/pesticides_registered_30.10.2025.pdf"

print("="*80)
print(f"ANALYZING: {pdf_path}")
print("="*80)

with pdfplumber.open(pdf_path) as pdf:
    print(f"\nTotal pages: {len(pdf.pages)}\n")
    
    # Analyze first 3 pages to understand structure
    for page_num in range(min(3, len(pdf.pages))):
        page = pdf.pages[page_num]
        print(f"\n{'='*80}")
        print(f"PAGE {page_num + 1}")
        print(f"{'='*80}")
        
        # Extract tables
        tables = page.extract_tables()
        print(f"Tables found: {len(tables)}")
        
        if tables:
            for table_idx, table in enumerate(tables):
                print(f"\n--- Table {table_idx + 1} ---")
                print(f"Rows: {len(table)}, Columns: {len(table[0]) if table else 0}")
                
                # Show first 5 rows
                for row_idx, row in enumerate(table[:5]):
                    print(f"\nRow {row_idx + 1}: {len(row)} cells")
                    for col_idx, cell in enumerate(row):
                        cell_text = str(cell).strip() if cell else ''
                        print(f"  Col {col_idx}: {cell_text[:60]}")
        
        # Also try text extraction
        text = page.extract_text()
        if text:
            lines = text.split('\n')[:10]
            print(f"\n--- Raw Text (first 10 lines) ---")
            for i, line in enumerate(lines, 1):
                print(f"{i}: {line[:80]}")
