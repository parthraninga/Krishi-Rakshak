"""
Parse CIB&RC pesticide PDFs to extract registered formulations
Extracts: product name, registration number, active ingredient, formulation, manufacturer
"""

import os
import re
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional
import pdfplumber
from db_helper import get_db

class PesticidePDFParser:
    def __init__(self, pdf_dir: str = "scripts/data/pesticides_pdfs"):
        self.pdf_dir = Path(pdf_dir)
        self.db = get_db()
        self.collection = self.db.pesticides_registry
        
    def parse_registered_pesticides_pdf(self, pdf_path: Path) -> List[Dict]:
        """
        Parse the main registered pesticides PDF
        Expected format: tables with columns like:
        - S.No | Registration No | Product Name | Active Ingredient | Formulation | Manufacturer
        """
        print(f"\nParsing: {pdf_path.name}")
        print("=" * 70)
        
        pesticides = []
        
        try:
            with pdfplumber.open(pdf_path) as pdf:
                print(f"Total pages: {len(pdf.pages)}")
                
                for page_num, page in enumerate(pdf.pages, 1):
                    if page_num % 10 == 0:
                        print(f"  Processing page {page_num}/{len(pdf.pages)}...")
                    
                    # Extract tables
                    tables = page.extract_tables()
                    
                    if tables:
                        for table in tables:
                            pesticides.extend(self._parse_table(table, page_num))
                    
                    # Also try text extraction for non-table formats
                    text = page.extract_text()
                    if text:
                        pesticides.extend(self._parse_text_format(text, page_num))
        
        except Exception as e:
            print(f"  Error parsing {pdf_path.name}: {e}")
        
        print(f"  Extracted {len(pesticides)} entries from {pdf_path.name}")
        return pesticides
    
    def _parse_table(self, table: List[List], page_num: int) -> List[Dict]:
        """Parse table format - handles both simple and complex formats"""
        entries = []
        
        if not table or len(table) < 2:
            return entries
        
        # Find the real header row (skip title rows)
        # A title row typically has only 1 non-empty cell or generic text
        header_row_idx = None
        for i, row in enumerate(table[:5]):  # Check first 5 rows
            if not row:
                continue
            
            non_empty = [cell for cell in row if cell and str(cell).strip()]
            
            # Skip if only 1 cell
            if len(non_empty) < 2:
                continue
            
            # Check if this looks like a header row
            row_text = ' '.join([str(cell).lower() for cell in row if cell])
            header_keywords = ['s. no', 's.no', 'serial', 'formulation', 'registered', 
                             'product', 'name', 'active', 'ingredient', 'manufacturer']
            
            if any(keyword in row_text for keyword in header_keywords):
                header_row_idx = i
                break
        
        # If no header found, this is a continuation table (starts with data rows)
        # Use first row as representative for column detection
        if header_row_idx is None:
            header_row_idx = 0
            header = table[0]
            use_header_for_detection = False  # Don't try to detect columns from data row
        else:
            header = table[header_row_idx]
            use_header_for_detection = True
        
        if not header:
            return entries
        
        # For continuation tables without headers, detect format by row structure
        if not use_header_for_detection:
            # For each row, dynamically find serial number and formulation columns
            # This handles varying column positions across rows
            is_simple_format = True
            reg_col = None  # Will be detected per-row
            name_col = None  # Will be detected per-row
            ai_col = None
            form_col = None
            mfg_col = None
            data_start_idx = 0  # Include row 0 as data
        else:
            # Normal header-based column detection
            reg_col = self._find_column_index(header, ['s. no', 's.no', 'serial', 'reg', 'registration', 'reg.no', 'cir'])
            name_col = self._find_column_index(header, ['formulation', 'product', 'name', 'pesticide', 'trade'])
            ai_col = self._find_column_index(header, ['active', 'a.i', 'ingredient', 'technical'])
            form_col = self._find_column_index(header, ['type', 'form.'])
            mfg_col = self._find_column_index(header, ['manufacturer', 'company', 'firm'])
            
            # Detect if this is a simple 2-column format (S.No | Formulation)
            is_simple_format = (len(header) <= 3 and 
                               reg_col is not None and 
                               name_col is not None and
                               ai_col is None)
            
            data_start_idx = header_row_idx + 1  # Skip header row
        
        # Parse data rows
        for row in table[data_start_idx:]:
            if not row or len(row) < 1:
                continue
            
            # For simple format, parse combined formulation string
            if is_simple_format:
                # For continuation tables without fixed columns, detect per-row
                if not use_header_for_detection:
                    # Find serial and formulation columns dynamically for this row
                    row_reg_col = None
                    row_name_col = None
                    
                    for col_idx, cell in enumerate(row):
                        if cell is None:
                            continue
                        
                        cell_str = str(cell).strip()
                        
                        # First column with just digits is serial number
                        if row_reg_col is None and cell_str.isdigit():
                            row_reg_col = col_idx
                        # First column with substantial text (not number) is formulation
                        elif row_name_col is None and cell_str and not cell_str.isdigit() and len(cell_str) > 5:
                            row_name_col = col_idx
                            break
                    
                    # Use detected columns for this row
                    if row_name_col is None:
                        continue  # No formulation found in this row
                    
                    formulation_str = str(row[row_name_col]).strip()
                else:
                    # Use pre-detected columns from header
                    if name_col is None or name_col >= len(row):
                        continue
                    
                    formulation_str = str(row[name_col]).strip() if row[name_col] else ""
                
                # Skip header-like rows and category markers
                skip_patterns = ['FORMULATION', 'INSECTICIDE', 'FUNGICIDE', 'HERBICIDE', 
                                'RODENTICIDE', 'PESTICIDE', 'REGISTERED', 'S. NO']
                if any(pattern in formulation_str.upper() for pattern in skip_patterns):
                    continue
                
                # Skip if it's just a number or empty
                if not formulation_str or formulation_str.isdigit():
                    continue
                
                # Parse the formulation string
                parsed = self._parse_formulation_string(formulation_str)
                
                if not parsed.get('active_ingredient'):
                    continue
                
                entry = {
                    "product_name": parsed.get('product_name'),
                    "active_ingredient": parsed.get('active_ingredient'),
                    "formulation_type": parsed.get('formulation_type'),
                    "concentration": parsed.get('concentration'),
                    "registered": True,
                    "source": "CIB&RC PPQS",
                    "source_page": page_num,
                    "extracted_at": datetime.now()
                }
                
                # Add serial number if detected
                if use_header_for_detection and reg_col is not None and reg_col < len(row):
                    serial = str(row[reg_col]).strip() if row[reg_col] else ""
                    # Only add if it looks like a registration pattern
                    if serial and ('CIR' in serial.upper() or '/' in serial):
                        entry['registration_number'] = serial
            
            # For complex format, extract from multiple columns
            else:
                reg_no = self._safe_get(row, reg_col, "").strip()
                product_name = self._safe_get(row, name_col, "").strip()
                active_ingredient = self._safe_get(row, ai_col, "").strip()
                formulation = self._safe_get(row, form_col, "").strip()
                manufacturer = self._safe_get(row, mfg_col, "").strip()
                
                # Validate - must have at least product name or active ingredient
                if not product_name and not active_ingredient:
                    continue
                
                # Clean registration number (extract pattern like CIR-123/2020)
                if reg_no:
                    reg_match = re.search(r'(CIR-?\d+/?\d*)', reg_no, re.IGNORECASE)
                    if reg_match:
                        reg_no = reg_match.group(1)
                
                entry = {
                    "registration_number": reg_no if reg_no else None,
                    "product_name": product_name if product_name else None,
                    "active_ingredient": active_ingredient if active_ingredient else None,
                    "formulation_type": formulation if formulation else None,
                    "manufacturer": manufacturer if manufacturer else None,
                    "registered": True,
                    "source": "CIB&RC PPQS",
                    "source_page": page_num,
                    "extracted_at": datetime.now()
                }
            
            # Remove None values
            entry = {k: v for k, v in entry.items() if v is not None}
            
            # Must have more than just metadata
            if len(entry) > 3:
                entries.append(entry)
        
        return entries
    
    def _parse_text_format(self, text: str, page_num: int) -> List[Dict]:
        """Parse text-based format (fallback)"""
        entries = []
        
        # Look for patterns like:
        # CIR-123/2020 - Product Name (Active Ingredient) - Manufacturer
        # Registration No: CIR-123 Product: XYZ AI: ABC
        
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line or len(line) < 10:
                continue
            
            # Pattern 1: CIR-XXX/YYYY
            reg_match = re.search(r'(CIR-?\d+/?\d+)', line, re.IGNORECASE)
            
            if reg_match:
                reg_no = reg_match.group(1)
                
                # Try to extract product name (usually after reg no)
                remainder = line[reg_match.end():].strip()
                
                # Look for active ingredient in parentheses
                ai_match = re.search(r'\(([^)]+)\)', remainder)
                active_ingredient = ai_match.group(1) if ai_match else None
                
                # Product name is usually before the parentheses
                product_name = remainder.split('(')[0].strip() if remainder else None
                
                # Clean up product name (remove common prefixes/suffixes)
                if product_name:
                    product_name = re.sub(r'^[:\-\s]+', '', product_name)
                    product_name = re.sub(r'[:\-\s]+$', '', product_name)
                
                if product_name or active_ingredient:
                    entry = {
                        "registration_number": reg_no,
                        "product_name": product_name,
                        "active_ingredient": active_ingredient,
                        "registered": True,
                        "source": "CIB&RC PPQS",
                        "source_page": page_num,
                        "extracted_at": datetime.now()
                    }
                    
                    entry = {k: v for k, v in entry.items() if v is not None}
                    if len(entry) > 3:
                        entries.append(entry)
        
        return entries
    
    def _find_column_index(self, header: List, keywords: List[str]) -> Optional[int]:
        """Find column index by keyword match"""
        if not header:
            return None
        
        for i, cell in enumerate(header):
            if not cell:
                continue
            
            cell_lower = str(cell).lower()
            for keyword in keywords:
                if keyword.lower() in cell_lower:
                    return i
        
        return None    
    def _parse_formulation_string(self, formulation_str: str) -> Dict[str, str]:
        """
        Parse combined formulation string into components
        Example: "Abamectin 1.9% EC" -> 
            product_name: "Abamectin 1.9% EC" (full formulation)
            active_ingredient: "Abamectin", 
            concentration: "1.9%", 
            formulation_type: "EC"
        """
        result = {}
        
        if not formulation_str or not formulation_str.strip():
            return result
        
        # Store the FULL formulation string as product name
        # This preserves uniqueness: "Abamectin 1.9% EC" vs "Abamectin 5% EC"
        result['product_name'] = formulation_str.strip()
        
        # Make a copy for parsing
        parse_str = formulation_str
        
        # Common formulation type codes (at end of string)
        formulation_codes = [
            'EC', 'SC', 'WP', 'WG', 'SG', 'DF', 'SP', 'GR', 'CG', 'FS', 'SL',
            'EW', 'ME', 'CS', 'OD', 'SE', 'UL', 'DS', 'DP', 'CB', 'BB', 'RB',
            'Aqueous', 'Emulsion', 'Granules', 'Powder', 'Dust', 'Bait', 
            'Gel', 'Liquid', 'Smoke Generator', 'Chalk'
        ]
        
        # Try to extract formulation type from end
        formulation_type = None
        for code in formulation_codes:
            pattern = r'\b' + re.escape(code) + r'\s*$'
            if re.search(pattern, parse_str, re.IGNORECASE):
                formulation_type = code
                parse_str = re.sub(pattern, '', parse_str, flags=re.IGNORECASE).strip()
                break
        
        if formulation_type:
            result['formulation_type'] = formulation_type
        
        # Extract concentration (e.g., "1.9%", "75%", "0.005 %w/w")
        concentration_match = re.search(r'(\d+\.?\d*\s*%[^%]*)', parse_str)
        if concentration_match:
            concentration = concentration_match.group(1).strip()
            result['concentration'] = concentration
            
            # Remove concentration from parsing string
            parse_str = parse_str[:concentration_match.start()].strip()
        
        # What's left is the active ingredient
        active_ingredient = parse_str.strip()
        if active_ingredient and active_ingredient not in ['', 'N/A']:
            result['active_ingredient'] = active_ingredient
        
        return result    
    def _safe_get(self, row: List, index: Optional[int], default: str = "") -> str:
        """Safely get value from row"""
        if index is None or index >= len(row):
            return default
        
        value = row[index]
        return str(value) if value is not None else default
    
    def parse_all_pdfs(self) -> List[Dict]:
        """Parse all PDFs in directory"""
        print("\n" + "=" * 70)
        print("PESTICIDE PDF PARSER - CIB&RC REGISTERED FORMULATIONS")
        print("=" * 70)
        
        all_pesticides = []
        
        # Priority order - main registered list first
        pdf_files = [
            "pesticides_registered_30.10.2025.pdf",
            "pesticides_section_9_3_30.10.2025.pdf",
            "pesticides_manufacturers_01.06.2023.pdf",
            "pesticides_household_public_health_01.06.2023.pdf",
            "pesticides_locust_control.pdf",
            "pesticides_banned_restricted_31.03.2024.pdf"
        ]
        
        for pdf_file in pdf_files:
            pdf_path = self.pdf_dir / pdf_file
            
            if not pdf_path.exists():
                print(f"\n[SKIP] {pdf_file} not found")
                continue
            
            # Parse based on filename
            if "banned" in pdf_file or "restricted" in pdf_file:
                # Mark these as banned/restricted
                pesticides = self.parse_registered_pesticides_pdf(pdf_path)
                for p in pesticides:
                    p["registered"] = False
                    p["status"] = "banned/restricted"
                all_pesticides.extend(pesticides)
            else:
                pesticides = self.parse_registered_pesticides_pdf(pdf_path)
                all_pesticides.extend(pesticides)
        
        print(f"\n" + "=" * 70)
        print(f"TOTAL EXTRACTED: {len(all_pesticides)} pesticide entries")
        print("=" * 70)
        
        return all_pesticides
    
    def deduplicate(self, pesticides: List[Dict]) -> List[Dict]:
        """Remove duplicates based on registration number or product name + AI"""
        print("\n[DEDUPLICATION] Removing duplicates...")
        
        seen = set()
        unique = []
        
        for p in pesticides:
            # Create unique key
            reg_no = p.get("registration_number", "").upper()
            product = p.get("product_name", "").upper()
            ai = p.get("active_ingredient", "").upper()
            
            if reg_no:
                key = f"REG:{reg_no}"
            elif product and ai:
                key = f"PROD:{product}:{ai}"
            elif product:
                key = f"PROD:{product}"
            else:
                continue  # Skip if no identifiable info
            
            if key not in seen:
                seen.add(key)
                unique.append(p)
        
        print(f"  Before: {len(pesticides)} | After: {len(unique)} (removed {len(pesticides) - len(unique)} duplicates)")
        
        return unique
    
    def save_to_mongodb(self, pesticides: List[Dict]):
        """Save to MongoDB"""
        print("\n[MONGODB] Saving to pesticides_registry collection...")
        
        # Create indexes
        self.collection.create_index("registration_number")
        self.collection.create_index("product_name")
        self.collection.create_index("active_ingredient")
        self.collection.create_index([("product_name", 1), ("active_ingredient", 1)])
        
        inserted = 0
        updated = 0
        
        for p in pesticides:
            # Upsert by registration number if available, else by product + AI
            if p.get("registration_number"):
                filter_key = {"registration_number": p["registration_number"]}
            elif p.get("product_name") and p.get("active_ingredient"):
                filter_key = {
                    "product_name": p["product_name"],
                    "active_ingredient": p["active_ingredient"]
                }
            elif p.get("product_name"):
                filter_key = {"product_name": p["product_name"]}
            else:
                continue
            
            result = self.collection.update_one(
                filter_key,
                {"$set": p},
                upsert=True
            )
            
            if result.upserted_id:
                inserted += 1
            elif result.modified_count > 0:
                updated += 1
        
        total = self.collection.count_documents({})
        
        print(f"  Inserted: {inserted}")
        print(f"  Updated: {updated}")
        print(f"  Total in DB: {total}")
        
        return total
    
    def export_to_json(self, pesticides: List[Dict], output_file: str = "scripts/data/pesticides_parsed.json"):
        """Export to JSON file"""
        print(f"\n[EXPORT] Saving to {output_file}...")
        
        output_path = Path(output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(pesticides, f, indent=2, default=str, ensure_ascii=False)
        
        print(f"  Saved {len(pesticides)} entries to {output_file}")
    
    def print_sample(self, pesticides: List[Dict], count: int = 10):
        """Print sample entries"""
        print(f"\n[SAMPLE] First {count} entries:")
        print("-" * 70)
        
        for i, p in enumerate(pesticides[:count], 1):
            print(f"\n{i}. {p.get('product_name', 'N/A')}")
            if p.get('registration_number'):
                print(f"   Reg No: {p['registration_number']}")
            if p.get('active_ingredient'):
                print(f"   Active Ingredient: {p['active_ingredient']}")
            if p.get('formulation_type'):
                print(f"   Formulation: {p['formulation_type']}")
            if p.get('manufacturer'):
                print(f"   Manufacturer: {p['manufacturer']}")
            print(f"   Status: {'Registered' if p.get('registered', True) else 'Banned/Restricted'}")

def main():
    parser = PesticidePDFParser()
    
    # Parse all PDFs
    pesticides = parser.parse_all_pdfs()
    
    if not pesticides:
        print("\n[ERROR] No pesticides extracted! Check PDF format.")
        return
    
    # Deduplicate
    pesticides = parser.deduplicate(pesticides)
    
    # Print sample
    parser.print_sample(pesticides, count=10)
    
    # Save to MongoDB
    total = parser.save_to_mongodb(pesticides)
    
    # Export to JSON
    parser.export_to_json(pesticides)
    
    print("\n" + "=" * 70)
    print("✅ PARSING COMPLETE!")
    print(f"   {total} pesticide formulations in database")
    print("=" * 70)

if __name__ == "__main__":
    main()
