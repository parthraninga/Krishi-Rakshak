#!/usr/bin/env python3
"""
Test _parse_table on first few pages to see where entries are lost
"""
import sys
sys.path.append('scripts')

from parse_pesticide_pdfs import PesticidePDFParser
import pdfplumber

pdf_path = "scripts/data/pesticides_pdfs/pesticides_registered_30.10.2025.pdf"

parser = PesticidePDFParser()
total_extracted = 0

with pdfplumber.open(pdf_path) as pdf:
    for page_num, page in enumerate(pdf.pages[:5], 1):  # First 5 pages
        print(f"\n{'='*80}")
        print(f"PAGE {page_num}")
        print(f"{'='*80}")
        
        tables = page.extract_tables()
        print(f"Tables found: {len(tables)}")
        
        for table_idx, table in enumerate(tables):
            print(f"\nTable {table_idx + 1}: {len(table)} rows")
            
            # Call parser's _parse_table method
            entries = parser._parse_table(table, page_num)
            
            print(f"Extracted: {len(entries)} entries")
            total_extracted += len(entries)
            
            if len(entries) > 0:
                print(f"\nFirst 3 entries from this table:")
                for i, entry in enumerate(entries[:3], 1):
                    print(f"  {i}. {entry.get('product_name', 'N/A')}")

print(f"\n{'='*80}")
print(f"TOTAL from first 5 pages: {total_extracted} entries")
print(f"Expected: ~200 entries (45 rows/page × 5 pages)")
