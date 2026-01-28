#!/usr/bin/env python3
import os
import re
from pathlib import Path

def find_grid_patterns(root_dir, max_results=30):
    """
    Grid container > Grid size={12} > Button desenlerini bul
    """
    results = []
    counter = 0
    
    # Tüm TSX ve TS dosyalarını bul
    for ext in ['*.tsx', '*.ts']:
        for file_path in Path(root_dir).rglob(ext):
            if counter >= max_results:
                break
            
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    lines = content.split('\n')
                
                # Grid container bulma
                for i, line in enumerate(lines):
                    if '<Grid' in line and 'container' in line:
                        container_start_line = i + 1  # 1-indexed
                        
                        # Container içinde 200 satır ara
                        for j in range(i + 1, min(i + 200, len(lines))):
                            # Grid size={12} arayış
                            if re.search(r'<Grid\s+[^>]*size=\{12\}', lines[j]):
                                grid_start = j
                                grid_line = j + 1
                                
                                # Bu Grid içinde Button arayış (10 satır içinde)
                                for k in range(j, min(j + 10, len(lines))):
                                    if '<Button' in lines[k]:
                                        button_line = k + 1
                                        
                                        if counter < max_results:
                                            # Relatif path oluştur
                                            rel_path = os.path.relpath(file_path, root_dir)
                                            rel_path = rel_path.replace('\\', '/')
                                            
                                            results.append({
                                                'file': rel_path,
                                                'start': container_start_line,
                                                'end': button_line,
                                                'grid_line': grid_line,
                                                'button_line': button_line
                                            })
                                            counter += 1
                                        break
                                break
                            
                            # Container kapanışını kontrol et
                            if j > i + 5 and re.match(r'\s*</Grid>\s*$', lines[j]):
                                break
            
            except Exception as e:
                continue
    
    return results

if __name__ == '__main__':
    root = 'src'
    patterns = find_grid_patterns(root, max_results=30)
    
    for item in patterns:
        print(f"{item['file']} - Lines {item['start']}-{item['end']}")
    
    print(f"\nToplam bulundu: {len(patterns)} desen")
