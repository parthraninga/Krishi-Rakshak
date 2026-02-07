#!/usr/bin/env python3
"""
Count actual rows in pesticide PDFs to understand potential count
"""
import pdfplumber

pdfs = [
    ("pesticides_registered_30.10.2025.pdf", "Registered Pesticides"),
    ("pesticides_section_9_3_30.10.2025.pdf", "Section 9(3)"),
    ("pesticides_manufacturers_01.06.2023.pdf", "Manufacturers"),
    ("pesticides_household_public_health_01.06.2023.pdf", "Household/Public Health"),
    ("pesticides_locust_control.pdf", "Locust Control"),
    ("pesticides_banned_restricted_31.03.2024.pdf", "Banned/Restricted"),
]

total_rows = 0

for pdf_file, name in pdfs:
    pdf_path = f"scripts/data/pesticides_pdfs/{pdf_file}"
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            page_count = len(pdf.pages)
            row_count = 0
            
            for page in pdf.pages:
                tables = page.extract_tables()
                for table in tables:
                    row_count += len(table)
            
            print(f"{name:40s} | Pages: {page_count:3d} | Total Table Rows: {row_count:4d}")
            total_rows += row_count
    except Exception as e:
        print(f"{name:40s} | ERROR: {e}")

print("=" * 80)
print(f"{'TOTAL':40s} | {' ' * 11} | {total_rows:4d} rows")
print("\nNote: Rows include headers, category markers, and data rows")
print("Actual formulations are typically 50-70% of total rows")
