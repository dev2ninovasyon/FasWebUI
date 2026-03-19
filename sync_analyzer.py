#!/usr/bin/env python3
"""
Menu-Document Synchronization Analyzer
Analyzes matching between Menuiconlist.json and DenetimDosyaBelgeleri.json
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Tuple, Set

class SyncAnalyzer:
    def __init__(self, menu_file: str, docs_file: str):
        self.menu_file = menu_file
        self.docs_file = docs_file
        self.menu_items = []
        self.documents = []
        self.doc_names_lower = {}
        self.doc_urls = {}
        
    def load_files(self):
        """Load both JSON files"""
        print("📂 Loading files...")
        
        # Load menu
        with open(self.menu_file, 'r', encoding='utf-8') as f:
            menu_json = json.load(f)
            self.menu_items = menu_json.get('menu', [])
        print(f"✅ Menu loaded: {len(self.menu_items)} top-level items")
        
        # Load documents
        with open(self.docs_file, 'r', encoding='utf-8') as f:
            self.documents = json.load(f)
        print(f"✅ Documents loaded: {len(self.documents)} records")
    
    def build_document_index(self):
        """Create lookup dictionaries for documents"""
        for doc in self.documents:
            doc_name = doc.get('BelgeAdi', '')
            form_code = doc.get('FormKodu', '')
            form_url = doc.get('FormUrl', '')
            doc_id = doc.get('Id')
            
            # Index by name (lowercase for fuzzy matching)
            if doc_name:
                self.doc_names_lower[doc_name.lower()] = {
                    'id': doc_id,
                    'name': doc_name,
                    'code': form_code,
                    'url': form_url,
                    'original': doc
                }
            
            # Index by URL
            if form_url:
                self.doc_urls[form_url] = {
                    'id': doc_id,
                    'name': doc_name,
                    'code': form_code,
                    'url': form_url
                }
    
    def flatten_menu(self) -> List[Dict]:
        """Flatten nested menu structure"""
        flattened = []
        
        def traverse(items: List, path: str = ""):
            for item in items:
                name = item.get('name', '')
                icon = item.get('icon', '')
                full_path = f"{path}/{name}" if path else name
                
                flattened.append({
                    'name': name,
                    'icon': icon,
                    'path': full_path,
                    'has_children': 'children' in item and len(item['children']) > 0
                })
                
                # Recurse
                if 'children' in item:
                    traverse(item['children'], full_path)
        
        traverse(self.menu_items)
        return flattened
    
    def find_document_match(self, menu_name: str) -> Tuple[bool, Dict]:
        """Try to find a matching document for menu item"""
        menu_lower = menu_name.lower()
        
        # Exact match attempt (case-insensitive)
        if menu_lower in self.doc_names_lower:
            return True, self.doc_names_lower[menu_lower]
        
        # Fuzzy match attempts
        for doc_name_lower, doc_info in self.doc_names_lower.items():
            # Check if menu name is contained in document name
            if menu_lower in doc_name_lower or doc_name_lower in menu_lower:
                if len(menu_name) > 4:  # Avoid matching short names
                    return True, doc_info
        
        return False, {}
    
    def analyze(self) -> Dict:
        """Perform synchronization analysis"""
        print("\n🔍 Starting synchronization analysis...\n")
        
        flattened_menu = self.flatten_menu()
        
        matched = []
        unmatched_menu = []
        unmatched_docs = set()
        
        # Track which documents were matched
        matched_doc_ids = set()
        
        print(f"📋 Analyzing {len(flattened_menu)} menu items...")
        
        # Analyze menu items
        for menu_item in flattened_menu:
            found, doc_info = self.find_document_match(menu_item['name'])
            
            if found:
                matched.append({
                    'menu_name': menu_item['name'],
                    'menu_path': menu_item['path'],
                    'doc_id': doc_info['id'],
                    'doc_name': doc_info['name'],
                    'form_code': doc_info['code'],
                    'form_url': doc_info['url']
                })
                matched_doc_ids.add(doc_info['id'])
            else:
                unmatched_menu.append({
                    'menu_name': menu_item['name'],
                    'menu_path': menu_item['path'],
                    'status': 'MISSING_IN_DOCUMENTS',
                    'action': 'ADD_TO_DOCUMENTS'
                })
        
        # Find documents not in menu
        for doc in self.documents:
            if doc['Id'] not in matched_doc_ids:
                unmatched_docs.add(doc['Id'])
        
        print(f"✅ Matched: {len(matched)} items")
        print(f"❌ Unmatched Menu: {len(unmatched_menu)} items")
        print(f"❌ Unmatched Documents: {len(unmatched_docs)} items")
        
        return {
            'matched': matched,
            'unmatched_menu': unmatched_menu,
            'unmatched_doc_ids': list(unmatched_docs),
            'summary': {
                'total_menu_items': len(flattened_menu),
                'total_documents': len(self.documents),
                'matched_count': len(matched),
                'menu_gaps': len(unmatched_menu),
                'document_gaps': len(unmatched_docs),
                'match_percentage': round((len(matched) / len(flattened_menu) * 100), 1)
            }
        }
    
    def save_results(self, results: Dict, output_dir: str = "."):
        """Save analysis results to JSON files"""
        os.makedirs(output_dir, exist_ok=True)
        
        # Full report
        with open(f'{output_dir}/SYNC_ANALYSIS_FULL.json', 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        # Matched items only
        with open(f'{output_dir}/MATCHED_ITEMS.json', 'w', encoding='utf-8') as f:
            json.dump(results['matched'], f, indent=2, ensure_ascii=False)
        
        # Unmatched menu items (need to add to documents)
        with open(f'{output_dir}/MENU_ITEMS_NOT_IN_DOCUMENTS.json', 'w', encoding='utf-8') as f:
            json.dump(results['unmatched_menu'], f, indent=2, ensure_ascii=False)
        
        # Unmatched documents (need to add to menu)
        unmatched_docs_data = [doc for doc in self.documents if doc['Id'] in results['unmatched_doc_ids']]
        with open(f'{output_dir}/DOCUMENTS_NOT_IN_MENU.json', 'w', encoding='utf-8') as f:
            json.dump(unmatched_docs_data, f, indent=2, ensure_ascii=False)
        
        # Summary
        summary = {
            'analysis_timestamp': __import__('datetime').datetime.now().isoformat(),
            'summary': results['summary'],
            'files_analyzed': {
                'menu': self.menu_file,
                'documents': self.docs_file
            }
        }
        with open(f'{output_dir}/SYNC_SUMMARY.json', 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)
        
        print(f"\n📁 Results saved to {output_dir}/")
        print(f"   - SYNC_ANALYSIS_FULL.json")
        print(f"   - MATCHED_ITEMS.json")
        print(f"   - MENU_ITEMS_NOT_IN_DOCUMENTS.json")
        print(f"   - DOCUMENTS_NOT_IN_MENU.json")
        print(f"   - SYNC_SUMMARY.json")

def main():
    # File paths
    menu_file = r'c:\Users\lenov\source\repos\dev2ninovasyon\FasWebUI\Menuiconlist.json'
    docs_file = r'c:\Users\lenov\source\repos\dev2ninovasyon\FasWebAPI\Data\JsonFiles\DenetimDosyaBelgeleri.json'
    output_dir = r'c:\Users\lenov\source\repos\dev2ninovasyon\FasWebUI\sync_analysis'
    
    # Run analysis
    analyzer = SyncAnalyzer(menu_file, docs_file)
    analyzer.load_files()
    analyzer.build_document_index()
    results = analyzer.analyze()
    analyzer.save_results(results, output_dir)
    
    # Print summary
    summary = results['summary']
    print(f"\n📊 SYNCHRONIZATION SUMMARY")
    print(f"{'='*50}")
    print(f"Total Menu Items: {summary['total_menu_items']}")
    print(f"Total Documents: {summary['total_documents']}")
    print(f"Matched: {summary['matched_count']} ({summary['match_percentage']}%)")
    print(f"Menu Gaps: {summary['menu_gaps']}")
    print(f"Document Gaps: {summary['document_gaps']}")
    print(f"{'='*50}\n")

if __name__ == '__main__':
    main()
