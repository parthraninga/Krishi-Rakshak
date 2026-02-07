#!/usr/bin/env python3
"""
Debug why main PDF only yields 76 entries from 1151 rows
"""
import pdfplumber

pdf_path = "scripts/data/pesticides_pdfs/pesticides_registered_30.10.2025.pdf"

print("="*80)
print("ANALYZING MAIN REGISTERED PESTICIDES PDF")
print("="*80)

with pdfplumber.open(pdf_path) as pdf:
    total_rows_in_tables = 0
    total_extracted = 0
    
    # Check pages 2-5 (after intro/header)
    for page_num in range(1, 5):  # Pages 2-5 (index 1-4)
        page = pdf.pages[page_num]
        tables = page.extract_tables()
        
        print(f"\n{'='*80}")
        print(f"PAGE {page_num + 1}")
        print(f"{'='*80}")
        
        if tables:
            for table_idx, table in enumerate(tables):
                print(f"\nTable {table_idx + 1}: {len(table)} rows")
                total_rows_in_tables += len(table)
                
                # Count rows that would be extracted
                extracted_from_this_table = 0
                for row in table:
                    if not row or len(row) < 2:
                        continue
                    
                    # Simulate parser logic
                    formulation_str = str(row[1]).strip() if len(row) > 1 and row[1] else ""
                    
                    # Skip categories
                    skip_patterns = ['FORMULATION', 'INSECTICIDE', 'FUNGICIDE', 'HERBICIDE', 
                                    'RODENTICIDE', 'PESTICIDE', 'REGISTERED', 'S. NO']
                    if any(pattern in formulation_str.upper() for pattern in skip_patterns):
                        print(f"  SKIP (category): {formulation_str[:60]}")
                        continue
                    
                    # Skip empty
                    if not formulation_str or formulation_str.isdigit():
                        print(f"  SKIP (empty/number): '{formulation_str}'")
                        continue
                    
                    # Would be extracted
                    print(f"  [OK] EXTRACT: {formulation_str[:70]}")
                    extracted_from_this_table += 1
                    total_extracted += 1
                
                print(f"\n  >> Extracted {extracted_from_this_table}/{len(table)} rows from this table")
    
    print(f"\n{'='*80}")
    print(f"SUMMARY (Pages 2-5)")
    print(f"{'='*80}")
    print(f"Total table rows: {total_rows_in_tables}")
    print(f"Extracted: {total_extracted}")
    print(f"Skip rate: {100 * (1 - total_extracted/total_rows_in_tables):.1f}%")
